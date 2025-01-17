import { ParticipantFormData } from "@/app/types/types";
import { Card, CardContent, CardTitle } from "./card"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { timerFromSeconds } from "@/lib/utils";


type SessionCardProps = {
  participantData: ParticipantFormData | undefined;
  totalScore: number;
  totalTime: number;
  round: number;
};


function SessionCard({
  participantData,
  totalScore,
  totalTime,
  round,
}: SessionCardProps) {
  return (
    <Card className="w-fit">
      <CardTitle>
        <div className="flex justify-center place-items-center gap-2 p-2 text-xl">
          <p>Session Stats - </p>
          <Avatar className="h-16 w-16">
            <AvatarImage src={participantData?.avatar} alt="Avatar" />
            <AvatarFallback>{participantData?.username[0]}</AvatarFallback>
          </Avatar>
          <p>{participantData?.username}</p>
        </div>
      </CardTitle>
      <CardContent>
        <div className="flex flex-row justify-center gap-12 text-lg">
          <p>Round: {round}</p>
          <p>Total Score: {totalScore}</p>
          <p>Total Time: {timerFromSeconds(totalTime)}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default SessionCard