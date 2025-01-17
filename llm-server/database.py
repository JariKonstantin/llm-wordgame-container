from sqlalchemy import create_engine, JSON, Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime
import uuid

DATABASE_URL = "sqlite:///./llm-wordgame-data.db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class GameSession(Base):
    __tablename__ = "game_sessions"

    id = Column(
        String,
        unique=True,
        primary_key=True,
        index=True,
        default=lambda: str(uuid.uuid4()),
    )
    avatar = Column(String)
    username = Column(String)
    age = Column(String)
    gender = Column(String)
    language_skill = Column(String)
    occupation = Column(String)
    education_level = Column(String)
    total_score = Column(Integer)
    total_time = Column(Float)
    points_per_round = Column(Float)
    average_round_time = Column(Float)
    successful_guesser_rounds = Column(Integer)
    successful_quizmaster_rounds = Column(Integer)
    rounds_data = Column(JSON)
    timestamp = Column(
        DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc)
    )


Base.metadata.create_all(bind=engine)
