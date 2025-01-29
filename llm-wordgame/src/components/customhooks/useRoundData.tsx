import { hint, role, RoundData, word } from "@/app/types/types";
import { useState } from "react";

const initialRoundData: RoundData = {
  round: 0,
  roundState: "waiting",
  roundTimer: parseInt(process.env.NEXT_PUBLIC_ROUND_TIMER || "90", 10),
  userRole: "quizmaster",
  word: undefined,
  wordDescription: "",
  history: [],
  usedHints: [],
  roundScore: 10,
};

export const useRoundData = () => {
  const [roundData, setRoundData] = useState<RoundData>(initialRoundData);

  const updateWordDescription = (newDescription: string) => {
    setRoundData((prevData) => ({ ...prevData, wordDescription: newDescription, roundState: "playing" }));
  };

  const updateHistory = (newHistory: string) => {
    setRoundData((prevData) => ({ ...prevData, history: prevData.history ? [...prevData.history, newHistory] : [newHistory] }));
  };

  const updateUsedHints = (newHint: hint) => {
    setRoundData((prevData) => ({
      ...prevData,
      roundScore: prevData.roundScore - 3 < 0 ? 0 : prevData.roundScore - 3,
      usedHints: [...prevData.usedHints, newHint]
    }));
  }

  const updateRoundScore = (newScore: number) => {
    setRoundData((prevData) => ({ ...prevData, roundScore: newScore }));
    if (newScore === 0) {
      setRoundData((prevData) => ({ ...prevData, roundState: "finished" }));
    }
  };

  const updateRoundTimer = (newTimer: number) => {
    setRoundData((prevData) => ({ ...prevData, roundTimer: newTimer }));
    if (newTimer === 0) {
      setRoundData((prevData) => ({ ...prevData, roundState: "finished", roundScore: 0 }));
    }
  }

  const getHistoryString = () => {
    const usedWords = roundData.history.length > 0 ? "These are words that have been guessed but are wrong: " + roundData.history.join(", ") + "." : "";
    const usedHints = roundData.usedHints.map((hint) => {
      switch (hint) {
        case "startingLetter":
          return "The word starts with the letter: " + roundData.word?.word[0] + ".";
        case "wordLength":
          return "The word has " + roundData.word?.word.length + " letters.";
        case "bannedWord":
          return "One of the banned words is: " + roundData.word?.bannedWords[0] + ".";
      }
    }).join(" ");
    return usedHints + " " + usedWords;
  };

  const endRound = () => {
    setRoundData((prevData) => ({ ...prevData, roundState: "finished" }));
  }

  const initializeNewRound = (newWord: word, newRound: number) => {
    setRoundData(() => ({
      ...initialRoundData,
      round: newRound,
      word: newWord,
      userRole: newRound % 2 === 0 ? "quizmaster" : "guesser",
    }));
  };

  return {
    roundData,
    updateWordDescription,
    updateHistory,
    updateRoundScore,
    updateUsedHints,
    updateRoundTimer,
    getHistoryString,
    endRound,
    initializeNewRound,
  };
};