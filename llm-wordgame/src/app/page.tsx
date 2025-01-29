'use client'

import { useState } from "react";
import SessionContainer from "./components/SessionContainer";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Leaderboard from "./components/LeaderBoard";


export default function Home() {
  const [active, setActive] = useState<boolean>(false);
  const [state, setState] = useState<string>();

  const handleHomeClick = () => {
    setActive(false);
    setState('home');
  };

  const handleLeaderboardClick = () => {
    setState('leaderboard');
    setActive(false);
  }

  return (
    <main className="w-full h-full bg-gradient-to-b from-slate-100 to-teal-600">
      <div className="flex min-h-screen flex-col items-center p-12" >
        <div className="flex flex-col z-10 w-full lg:max-w-7xl font-mono text-sm">
          <div className="grid grid-cols-3 place-items-center mb-10">
            <Button
              className="text-2xl font-bold w-fit text-teal-700"
              variant="link"
              onClick={() => handleHomeClick()}
            >
              Home
            </Button>
            <Image
              priority
              src={"/wordwhiz/logo.png"}
              alt="logo"
              width={250}
              height={250}
            />
            <Button
              className="text-2xl font-bold w-fit text-teal-700"
              variant="link"
              onClick={handleLeaderboardClick}
            >
              Leaderboard
            </Button>
          </div>
          <div className="flex flex-col gap-5 bg-gradient-to-t from-slate-50 to-white p-10 rounded-lg">
            {state === "home" || !state ?
              !active ? (
                <article className="flex flex-col justify-start gap-5">
                  <p className="text-xl">
                    Welcome to WordWhiz!
                    <br />
                    In this game you will take turns on the roles of guesser and quizmaster.
                    <br />
                    <br />
                    Guesser Rules:
                    <br />
                    - You will be given a description of a word.
                    <br />
                    - You must guess the word based on the description.
                    <br />
                    - You can use up to 3 hints to help you guess the word.
                    <br />
                    - Every incorrect guess will reduce your score by 1 point.
                    <br />
                    - Every used hint will reduce your score by 3 points.
                    <br />
                    <br />
                    Quizmaster Rules:
                    <br />
                    - You will be given a word.
                    <br />
                    - You must describe the word without using the word itself or any of the banned words.
                    <br />
                    - After each wrong guess, you decide on the next hint to give.
                    <br />
                    - Every hint you give will reduce your score by 3 points.
                    <br />
                    <br />
                  </p>
                  <Button
                    variant="outline_success"
                    onClick={() => setActive(true)}
                  >
                    Start
                  </Button>
                </article>
              ) : (
                <SessionContainer />
              )
              : (
                <Leaderboard />
              )}
          </div>
        </div>
      </div>
    </main>
  );
}