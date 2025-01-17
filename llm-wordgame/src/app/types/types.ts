export type gamestates = 'form' | 'game' | 'leaderboard';
export type role = 'quizmaster' | 'guesser';
export type word = {
  word: string;
  type: 'simple' | 'abstract';
  bannedWords: string[];
}
export type hint = 'startingLetter' | 'wordLength' | 'bannedWord';
export type GameSession = {
  totalScore: number;
  totalTime: number;
  rounds: RoundData[];
};
export type RoundData = {
  round: number;
  roundState: "waiting" | "playing" | "finished";
  roundTimer: number;
  userRole: role;
  word: word | undefined;
  wordDescription: string;
  history: string[];
  usedHints : hint[];
  roundScore: number;
}
export type ParticipantFormData = {
  avatar: string,
  username: string,
  age?: string,
  gender?: string,
  languageSkill?: string,
  occupation?: string,
  educationLevel?: string,
};
export type SessionData = {
  participant: ParticipantFormData | undefined;
  gameSession: GameSession | undefined;
};
export type SessionDataBackend = {
  avatar: string;
  username: string;
  age: string;
  gender: string;
  language_skill: string;
  occupation: string;
  education_level: string;
  total_score: number;
  total_time: number;
  points_per_round: number;
  average_round_time: number;
  successful_guesser_rounds: number;
  successful_quizmaster_rounds: number;
  rounds_data: RoundData[];
};