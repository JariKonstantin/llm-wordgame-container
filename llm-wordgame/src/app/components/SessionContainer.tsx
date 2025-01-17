import React, { useEffect } from 'react';
import { GameSession, gamestates, ParticipantFormData, SessionData } from '../types/types';
import ParticipantForm from './ParticipantForm';
import GameContainer from './GameContainer';
import Leaderboard from './LeaderBoard';
import { submitSessionData } from '../llm_communication/llm_connector';


export default function SessionContainer() {
  const [sessionState, setSessionState] = React.useState<gamestates>("form");
  const [sessionData, setSessionData] = React.useState<SessionData>({
    participant: undefined,
    gameSession: undefined,
  });

  useEffect(() => {
    if (sessionData.participant && sessionData.gameSession) {
      submitSessionData(sessionData).then(() => {
        stateChange();
      });
    }
  }, [sessionData]);

  function setParticipantForm(data: ParticipantFormData) {
    setSessionData(() => ({
      participant: data,
      gameSession: undefined,
    }));
  }

  function setGameSessionData(data: GameSession) {
    setSessionData((prevData) => ({
      participant: prevData.participant,
      gameSession: data,
    }));
  }

  function stateChange() {
    switch (sessionState) {
      case "form":
        setSessionState("game");
        break;
      case "game":
        setSessionState("leaderboard");
        break;
      case "leaderboard":
        break;
    }
  }

  return (
    <div className="flex flex-col space-y-4">
      {sessionState === "form" &&
        <ParticipantForm
          stateChange={stateChange}
          setParticipantForm={setParticipantForm}
        />}
      {sessionState === "game" &&
        <GameContainer
          setGameSessionData={setGameSessionData}
          participantData={sessionData.participant}
        />}
      {sessionState === "leaderboard" &&
        <Leaderboard
          currentSession={sessionData}
        />}
    </div>
  );
}