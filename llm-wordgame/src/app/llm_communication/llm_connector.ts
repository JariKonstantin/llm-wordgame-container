import { SessionData, SessionDataBackend } from "../types/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;


export const generateDescription = async (word: string, bannedWords: string[]): Promise<string> => {
  const response = await fetch(`${API_URL}/generate?word=${encodeURI(word)}&banned_words=${encodeURI(bannedWords.join(','))}`);
  if (!response.ok) {
    throw new Error('Failed to fetch generated description');
  }
  const data = await response.json();
  const generated_response = data
  return generated_response;
};

export const guessWord = async (description: string, history: string, word?: string): Promise<string> => {
  const response = await fetch(`${API_URL}/solve?description=${encodeURI(description)}&history=${encodeURI(history)}&word=${encodeURI(word || '')}`);
  if (!response.ok) {
    throw new Error('Failed to fetch guess');
  }
  const data = await response.json();
  const generated_response = data.replace("a ", "").replace("an ", "").replace("the ", "").trim();
  return generated_response;
};

export const submitSessionData = async (
  sessionData: SessionData
) => {
  const points_per_round = sessionData.gameSession ? sessionData.gameSession.totalScore / sessionData.gameSession.rounds.length : 0;
  const average_round_time = sessionData.gameSession ? sessionData.gameSession.totalTime / sessionData.gameSession.rounds.length : 0;
  const successful_guesser_rounds = sessionData.gameSession ? sessionData.gameSession.rounds.filter(round => round.userRole === 'guesser' && round.roundScore > 0).length : 0;
  const successful_quizmaster_rounds = sessionData.gameSession ? sessionData.gameSession.rounds.filter(round => round.userRole === 'quizmaster' && round.roundScore > 0).length : 0;
  const data: SessionDataBackend = {
    avatar: sessionData.participant?.avatar || '',
    username: sessionData.participant?.username || '',
    age: sessionData.participant?.age || '',
    gender: sessionData.participant?.gender || '',
    language_skill: sessionData.participant?.languageSkill || '',
    occupation: sessionData.participant?.occupation || '',
    education_level: sessionData.participant?.educationLevel || '',
    total_score: sessionData.gameSession?.totalScore || 0,
    total_time: sessionData.gameSession?.totalTime || 0,
    points_per_round: points_per_round,
    average_round_time: average_round_time,
    successful_guesser_rounds: successful_guesser_rounds,
    successful_quizmaster_rounds: successful_quizmaster_rounds,
    rounds_data: sessionData.gameSession?.rounds || [],
  };

  const response = await fetch(`${API_URL}/submit-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to submit data');
  }
  return response.json();
}

export const getLeaderBoard = async () => {
  const response = await fetch(`${API_URL}/leaderboard`);
  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard');
  }
  const data = await response.json();
  return data;
}