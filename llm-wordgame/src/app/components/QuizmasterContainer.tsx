import { Spinner } from "@radix-ui/themes";
import { hint, RoundData } from "../types/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { useEffect, useState } from "react";

type QuizmasterContainerProps = {
  roundData: RoundData;
  setDescription: (value: string) => void;
  updateUsedHints: (newHint: hint) => void;
};

export default function QuizmasterContainer({
  roundData,
  setDescription,
  updateUsedHints
}: QuizmasterContainerProps) {
  const [descriptionInput, setDescriptionInput] = useState<string>('');
  const [containsBannedWords, setContainsBannedWords] = useState<boolean>(false);

  useEffect(() => {
    const bannedWords = roundData.word?.bannedWords || [];
    const regex = new RegExp(`\\b(${bannedWords.join('|')})\\b`, 'i');
    setContainsBannedWords(regex.test(descriptionInput));
  }, [descriptionInput, roundData.word?.bannedWords]);

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex flex-row justify-between">
        <div className="flex flex-col gap-4">
          <p className="text-lg font-bold">
            Word
          </p>
          <p className="text-lg">
            {roundData.word ? roundData.word.word : <Spinner />}
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <p className="text-lg font-bold">
            Role
          </p>
          <p className="text-lg">
            {roundData.userRole === "quizmaster" ? "Quizmaster" : "Guesser"}
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <p className="text-lg font-bold text-right">
            Roundscore
          </p>
          <p className={"text-2xl " + (roundData.roundScore > 0 ? "text-green-500" : "text-red-500")}>
            {roundData.roundScore}
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <p className="text-lg font-bold text-right">
            Round Timer
          </p>
          <p className={"text-2xl font-bold " + (roundData.roundTimer > 30 ? "text-green-500" : roundData.roundTimer > 10 ? "text-yellow-500" : "text-red-500")}>
            {roundData.roundTimer}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <p className="text-lg font-bold">
          Description
        </p>
        <p className="text-lg text-red-700">
          The list of banned words is: {roundData.word?.bannedWords.join(", ")}
          <br />
          Your description can be a maximum of 100 characters.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Input
            value={descriptionInput}
            onChange={(e) => setDescriptionInput(e.target.value)}
            placeholder="Type your description here"
            pattern=".{1,100}"
          />
          <Button
            variant="outline_success"
            onClick={() => setDescription(descriptionInput)}
            disabled={descriptionInput.length === 0 || descriptionInput.length > 100 || containsBannedWords || roundData.wordDescription.length > 0 || roundData.roundState === "finished"}
          >
            Set description
          </Button>
        </div>
        {containsBannedWords && (
          <p className="text-lg text-red-700">
            Your description contains banned words. Please remove them.
          </p>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <p className="text-lg font-bold">
          Hints
        </p>
        <div className="grid grid-cols-3 gap-4">
          <Button
            variant={"gradient_alt"}
            onClick={() => updateUsedHints("startingLetter")}
            disabled={roundData.usedHints.includes("startingLetter") || roundData.roundScore <= 3 || roundData.roundState !== "playing"}
          >
            Starting letter - {roundData.usedHints.includes("startingLetter") ?
              roundData.word?.word[0] : "(-3 points)"}
          </Button>
          <Button
            variant={"gradient_alt"}
            onClick={() => updateUsedHints("wordLength")}
            disabled={roundData.usedHints.includes("wordLength") || roundData.roundScore <= 3 || roundData.roundState !== "playing"}
          >
            Word length - {roundData.usedHints.includes("wordLength") ?
              roundData.word?.word.length : "(-3 points)"}
          </Button>
          <Button
            variant={"gradient_alt"}
            onClick={() => updateUsedHints("bannedWord")}
            disabled={roundData.usedHints.includes("bannedWord") || roundData.roundScore <= 3 || roundData.roundState !== "playing"}
          >
            One banned word - {roundData.usedHints.includes("bannedWord") ?
              roundData.word?.bannedWords[0] : "(-3 points)"}
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <p className="text-lg font-bold">
          Attempted Guesses
        </p>
        <div className="grid grid-cols-4 gap-4">
          {roundData.history.length === 0 && <p className="text-lg">No guesses yet</p>}
          {roundData.history.map((entry, index) => (
            <Card key={index} className={"flex flex-col gap-4 " +
              (entry === roundData.word?.word ? "bg-gradient-to-tr from-emerald-100 to-green-500" : "bg-gradient-to-tr from-orange-300 to-red-500")
            }>
              <CardHeader>
                <p className="text-lg font-bold">
                  {entry}
                </p>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
