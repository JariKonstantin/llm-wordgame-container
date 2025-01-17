import { useEffect, useState } from "react";
import { getLeaderBoard } from "../llm_communication/connector";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { SessionData, SessionDataBackend } from "../types/types";
import { timerFromSeconds } from "@/lib/utils";

type LeaderboardProps = {
  currentSession?: SessionData;
};

function Leaderboard({ currentSession }: LeaderboardProps) {
  const [data, setData] = useState<SessionDataBackend[]>([]);

  useEffect(() => {
    getLeaderBoard().then((response) => {
      setData(response);
    });
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Leaderboard</h1>
      <table className="w-full">
        <thead>
          <tr className="text-left">
            <th>Rank</th>
            <th>Avatar</th>
            <th>Username</th>
            <th>Score</th>
            <th>Time</th>
            <th>Points per round</th>
            <th>Average round time</th>
            <th>Won guesser rounds</th>
            <th>Won quizmaster rounds</th>
          </tr>
        </thead>
        <tbody>
          {currentSession && currentSession.participant && currentSession.gameSession && (
            <tr key={-1} className="rounded-full bg-gradient-to-b from-slate-100 to-teal-300">
              <td>You</td>
              <td>
                <Avatar>
                  <AvatarImage src={currentSession.participant.avatar} alt={currentSession.participant.username} />
                </Avatar>
              </td>
              <td>{currentSession.participant.username}</td>
              <td>{currentSession.gameSession.totalScore}</td>
              <td>{timerFromSeconds(currentSession.gameSession.totalTime)}</td>
              <td>{(currentSession.gameSession.totalScore / currentSession.gameSession.rounds.length).toFixed(2)}</td>
              <td>{timerFromSeconds(currentSession.gameSession.totalTime / currentSession.gameSession.rounds.length)}</td>
              <td>{currentSession.gameSession.rounds.filter(round => round.userRole === "guesser" && round.roundScore > 0).length}</td>
              <td>{currentSession.gameSession.rounds.filter(round => round.userRole === "quizmaster" && round.roundScore > 0).length}</td>
            </tr>
          )}
          {data.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>
                <Avatar>
                  <AvatarImage src={item.avatar} alt={item.username} />
                </Avatar>
              </td>
              <td>{item.username}</td>
              <td className="font-bold">{item.total_score}</td>
              <td className="font-bold">{timerFromSeconds(item.total_time)}</td>
              <td>{item.points_per_round.toFixed(2)}</td>
              <td>{timerFromSeconds(item.average_round_time)}</td>
              <td>{item.successful_guesser_rounds}</td>
              <td>{item.successful_quizmaster_rounds}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Leaderboard;