# llm-server/main.py
import re
import logging
import csv
import json
import datetime
import asyncio
from typing import List, Dict, Any
from pydantic import BaseModel
from fastapi import FastAPI, Depends
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from transformers import T5Tokenizer, T5ForConditionalGeneration
from sentence_transformers import SentenceTransformer
from database import SessionLocal, GameSession
from io import StringIO
from helperfunctions import filter_descriptions, sanitize_text, get_description_prompts, get_solve_prompts, pick_best_option


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.log(logging.INFO, "Starting LLM server")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

text2text_model_name = "google/flan-t5-large"
tokenizer_text2text = T5Tokenizer.from_pretrained(text2text_model_name)
text2text_model = T5ForConditionalGeneration.from_pretrained(text2text_model_name)

sentence_similarity_model_name = "sentence-transformers/all-mpnet-base-v2"
sentence_similarity_model = SentenceTransformer(sentence_similarity_model_name)
logger.log(logging.INFO, "Models loaded")


@app.get("/wordgameapi/generate")
async def generate_description(word: str, banned_words: str):
    logger.log(
        logging.INFO,
        f"Received request to generate text, word: {word}, banned words: {banned_words}",
    )
    prompts = get_description_prompts(word)
    generated_descriptions = []
    for prompt in prompts:
        logger.log(logging.INFO, f"Prompt: {prompt}")
        input_ids = tokenizer_text2text(prompt, return_tensors="pt").input_ids
        outputs = await asyncio.to_thread(text2text_model.generate, input_ids)
        generated_text = tokenizer_text2text.decode(outputs[0])
        generated_descriptions.append(sanitize_text(generated_text))
        logger.log(logging.INFO, f"Generated text: {sanitize_text(generated_text)}")

    filtered_descriptions = filter_descriptions(generated_descriptions, word)
    best_description = pick_best_option(filtered_descriptions, word, sentence_similarity_model)

    # Post-process the generated text to replace occurrences of the word
    def replace_word(match):
        matched_word = match.group(0)
        return "______" + matched_word[len(word) :]

    pattern = re.compile(rf"\b{word}\w*\b", re.IGNORECASE)
    output = re.sub(pattern, replace_word, best_description)
    logger.log(logging.INFO, f"Post-processed text: {output}")
    return output


@app.get("/wordgameapi/solve")
async def solve_word(description: str, history: str, word: str):
    logger.log(
        logging.INFO,
        f"Received request to solve word, description: {description}, history: {history}",
    )
    prompts = get_solve_prompts(description, history)
    generated_solutions = []
    for prompt in prompts:
        logger.log(logging.INFO, f"Prompt: {prompt}")
        input_ids = tokenizer_text2text(prompt, return_tensors="pt").input_ids
        outputs = await asyncio.to_thread(text2text_model.generate, input_ids)
        generated_solutions.append(
            sanitize_text(tokenizer_text2text.decode(outputs[0]))
        )
        logger.log(
            logging.INFO,
            f"Generated text: {sanitize_text(tokenizer_text2text.decode(outputs[0]))}",
        )
    if word in generated_solutions:
        best_solution = word
    else:
        best_solution = pick_best_option(generated_solutions, word, sentence_similarity_model)
    return best_solution


# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class RoundData(BaseModel):
    round: int
    roundState: str
    roundTimer: float
    userRole: str
    word: Dict[str, Any]
    wordDescription: str
    history: List[str]
    usedHints: List[str]
    roundScore: int


class GameSessionData(BaseModel):
    avatar: str
    username: str
    age: str
    gender: str
    language_skill: str
    occupation: str
    education_level: str
    total_score: int
    total_time: float
    points_per_round: float
    average_round_time: float
    successful_guesser_rounds: int
    successful_quizmaster_rounds: int
    rounds_data: List[RoundData]


@app.post("/wordgameapi/submit-session")
def submit_session(game_session_data: GameSessionData, db: Session = Depends(get_db)):
    game_session = GameSession(
        avatar=game_session_data.avatar,
        username=game_session_data.username,
        age=game_session_data.age,
        gender=game_session_data.gender,
        language_skill=game_session_data.language_skill,
        occupation=game_session_data.occupation,
        education_level=game_session_data.education_level,
        total_score=game_session_data.total_score,
        total_time=game_session_data.total_time,
        points_per_round=game_session_data.points_per_round,
        average_round_time=game_session_data.average_round_time,
        successful_guesser_rounds=game_session_data.successful_guesser_rounds,
        successful_quizmaster_rounds=game_session_data.successful_quizmaster_rounds,
        rounds_data=json.dumps(
            [round.dict() for round in game_session_data.rounds_data]
        ),
    )
    db.add(game_session)
    db.commit()
    db.refresh(game_session)
    return game_session


@app.get("/wordgameapi/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    leaderboard = (
        db.query(GameSession)
        .order_by(GameSession.total_score.desc(), GameSession.total_time)
        .limit(20)
        .all()
    )
    return leaderboard


@app.get("/wordgameapi/leaderboard/dump")
def dump_leaderboard(db: Session = Depends(get_db)):
    leaderboard = (
        db.query(GameSession)
        .order_by(GameSession.total_score.desc(), GameSession.total_time)
        .all()
    )

    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "avatar",
            "username",
            "age",
            "gender",
            "language_skill",
            "occupation",
            "education_level",
            "total_score",
            "total_time",
            "points_per_round",
            "average_round_time",
            "successful_guesser_rounds",
            "successful_quizmaster_rounds",
            "rounds_data",
        ]
    )
    for session in leaderboard:
        writer.writerow(
            [
                session.avatar,
                session.username,
                session.age,
                session.gender,
                session.language_skill,
                session.occupation,
                session.education_level,
                session.total_score,
                session.total_time,
                session.points_per_round,
                session.average_round_time,
                session.successful_guesser_rounds,
                session.successful_quizmaster_rounds,
                session.rounds_data,
            ]
        )

    output.seek(0)
    timestamp_str = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"leaderboard_dump_{timestamp_str}.csv"

    response = StreamingResponse(output, media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename={filename}"
    return response
