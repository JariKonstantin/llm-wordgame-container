import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRoundData } from "@/components/customhooks/useRoundData";
import words from "../static/words";
import { GameSession, hint, ParticipantFormData, word } from "../types/types";
import { guessWord, generateDescription } from "../llm_communication/llm_connector";
import SessionCard from "@/components/ui/sessionCard";
import GuesserContainer from "./GuesserContainer";
import QuizmasterContainer from "./QuizmasterContainer";

type GameContainerProps = {
  setGameSessionData: (data: GameSession) => void;
  participantData?: ParticipantFormData;
};

export default function GameContainer({
  setGameSessionData,
  participantData
}: GameContainerProps) {
  // Custom hook to manage round data
  const {
    roundData,
    updateWordDescription,
    updateHistory,
    updateRoundScore,
    updateUsedHints,
    updateRoundTimer,
    getHistoryString,
    endRound,
    initializeNewRound,
  } = useRoundData();

  // Game session state
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameSession, setGameSession] = useState<GameSession>({ totalScore: 0, totalTime: 0, rounds: [] });
  const [guessInput, setGuessInput] = useState<string>("");
  const [triggerLLMAction, setTriggerLLMAction] = useState<boolean>(false);
  const [feedbackVisible, setFeedbackVisible] = useState<boolean>(false);
  const [feedbackType, setFeedbackType] = useState<'success' | 'failure'>('success');

  const maxRounds = parseInt(process.env.NEXT_PUBLIC_MAX_ROUNDS || "8", 10);
  const roundTimer = parseInt(process.env.NEXT_PUBLIC_ROUND_TIMER || "60", 10);
  const bottomRef = useRef<HTMLDivElement>(null);

  // randomly select 8 words
  const sessionWords: word[] = [];
  for (let i = 0; i < (maxRounds / 2); i++) {
    const immaterialWords = words.filter((word) => word["type"] === "abstract");
    const materialWords = words.filter((word) => word["type"] === "simple");
    sessionWords.push(immaterialWords[Math.floor(Math.random() * immaterialWords.length)]);
    sessionWords.push(materialWords[Math.floor(Math.random() * materialWords.length)]);
  }

  // keep track of the current round timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (roundData.roundState === "playing" || (roundData.roundState === "waiting" && roundData.userRole === "quizmaster")) {
        if (roundData.roundTimer - 1 === 0) {
          setFeedbackType('failure');
          roundData.roundScore = 0;
          endRound();
          setGameSession((prevSession) => ({
            totalScore: prevSession.totalScore,
            totalTime: prevSession.totalTime + roundTimer,
            rounds: [...prevSession.rounds, roundData]
          }));
        }
        updateRoundTimer(roundData.roundTimer - 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [roundData.roundTimer, roundData.roundState]);

  // Initalize game session
  useEffect(() => {
    console.log("Starting new game session");
    if (gameStarted) {
      initializeNewRound(sessionWords[0], 1);
    }
  }, [gameStarted]);

  // Check if LLM has initialized a description
  useEffect(() => {
    // If the user is guesser and the round is waiting and there is no description yet, LLM has to generate a description
    if (roundData.userRole === "guesser" && roundData.roundState === "waiting" && roundData.word && !roundData.wordDescription) {
      generateDescription(roundData.word.word, roundData.word.bannedWords).then((description) => {
        updateWordDescription(description);
      })
    }
  }, [roundData]);

  // trigger LLM action when description has been set or hint has been given
  useEffect(() => {
    if (triggerLLMAction) {
      setTriggerLLMAction(false);
      getLLMGuess();
    }
  }, [triggerLLMAction]);

  // round finished feedback
  useEffect(() => {
    if (roundData.roundState === "finished") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setFeedbackVisible(true);
      setTimeout(() => setFeedbackVisible(false), 1000);
    }
  }, [roundData.roundState]);

  // get llm guess
  const getLLMGuess = async () => {
    await guessWord(roundData.wordDescription, getHistoryString(), roundData.word?.word).then((response) => {
      updateHistory(response);
      if (roundData.word?.word && response.includes(roundData.word.word)) {
        setFeedbackType('success');
        endRound();
        setGameSession((prevSession) => ({
          totalScore: prevSession.totalScore + roundData.roundScore,
          totalTime: prevSession.totalTime + roundTimer - roundData.roundTimer,
          rounds: [...prevSession.rounds, roundData]
        }));
      } else {
        if (roundData.roundScore - 1 <= 0) {
          setFeedbackType('failure');
          roundData.roundScore = 0;
          endRound();
          setGameSession((prevSession) => ({
            totalScore: prevSession.totalScore,
            totalTime: prevSession.totalTime + roundTimer - roundData.roundTimer,
            rounds: [...prevSession.rounds, roundData]
          }));
        }
      }
    });
  };

  // solve action
  const solve = async () => {
    console.log("Trying to solve, wordInput: ", guessInput);
    updateHistory(guessInput);
    if (guessInput.toLocaleLowerCase() === roundData.word?.word) {
      setFeedbackType('success');
      endRound();
      setGameSession((prevSession) => ({
        totalScore: prevSession.totalScore + roundData.roundScore,
        totalTime: prevSession.totalTime + roundTimer - roundData.roundTimer,
        rounds: [...prevSession.rounds, roundData]
      }));
    } else {
      if (roundData.roundScore - 1 <= 0) {
        setFeedbackType('failure');
        roundData.roundScore = 0;
        endRound();
        setGameSession((prevSession) => ({
          totalScore: prevSession.totalScore,
          totalTime: prevSession.totalTime + roundTimer - roundData.roundTimer,
          rounds: [...prevSession.rounds, roundData]
        }));
      } else {
        updateRoundScore(roundData.roundScore - 1);
      }
    }
    setGuessInput("");
  };

  // set description
  const setDescription = (description: string) => {
    updateWordDescription(description);
    setTriggerLLMAction(true);
  };

  const handleHintLLM = (newHint: hint) => {
    updateUsedHints(newHint);
    setTriggerLLMAction(true);
  };

  return (
    <div className="flex flex-col justify-between gap-4">
      <div className="flex justify-center gap-4">
        <SessionCard
          participantData={participantData}
          totalScore={gameSession.totalScore}
          totalTime={gameSession.totalTime}
          round={gameSession.rounds.length + 1}
        />
      </div>
      {!gameStarted ?
        <div className="flex flex-col gap-4">
          <p className="text-lg">
            - The maximum amount of points you can get per round is 10.
            <br />
            - You get the maximum amount of points if the word is guessed correctly without any hints on the first try.
            <br />
            - If you want to use a hint as a guesser, you will lose 3 points and if you guess wrong, you will lose 1 points.
            <br />
            - As a quizmaster, you have to give hints after each guess which will reduce the amount of points by 3, but a wrong guess will not reduce the points.
            <br />
            - There is a round timer of {roundTimer} seconds.
            <br />
            - If your score or the round timer reaches 0, the round will be finished.
            <br />
            - There are 8 rounds in total and the total time will be recorded.
            <br />
            - When you have finished your game session you can compare your score with other players.
          </p>
          <Button
            variant="outline_success"
            onClick={() => setGameStarted(true)}
          >
            Start Game Session
          </Button>
        </div>
        :
        roundData.userRole === "guesser" ?
          <GuesserContainer
            roundData={roundData}
            guessInput={guessInput}
            setGuessInput={setGuessInput}
            solve={solve}
            updateUsedHints={updateUsedHints}
          />
          :
          <QuizmasterContainer
            roundData={roundData}
            setDescription={setDescription}
            updateUsedHints={handleHintLLM}
          />
      }
      {feedbackVisible && (
        <div className={`fixed top-0 left-0 w-full h-full flex items-center justify-center bg-opacity-50 ${feedbackType === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          <div className="bg-white p-8 rounded shadow-lg animate-fade-in-out">
            {feedbackType === 'success' ? (
              <svg className="w-24 h-24 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            ) : (
              <svg className="w-24 h-24 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            )}
          </div>
        </div>
      )}
      {roundData.roundState === "finished" && gameStarted &&
        <Button
          variant="outline_success"
          onClick={() => {
            if (gameSession.rounds.length < maxRounds) {
              console.log("Starting new round");
              initializeNewRound(
                sessionWords[gameSession.rounds.length],
                roundData.round + 1,
              );
            } else {
              console.log("Finishing game session");
              setGameSessionData(gameSession);
            }
          }
          }
        >
          {gameSession.rounds.length < maxRounds ? "Next Round" : "Finish Game Session"}
        </Button>
      }
      <div ref={bottomRef} />
    </div >
  );
}