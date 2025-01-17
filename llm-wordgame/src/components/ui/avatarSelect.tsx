import React, { useEffect, useState } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './carousel';
import { Avatar, AvatarImage } from './avatar';

const avatars = Array.from({ length: 24 }, (_, i) => `/wordgame/ava_${i + 1}.jpg`);

type AvatarSelectorProps = {
  onSelectAvatar: (avatar: string) => void;
};

const AvatarSelector: React.FC<AvatarSelectorProps> = ({ onSelectAvatar }) => {
  const [currentAvatar, setCurrentAvatar] = useState<string>(avatars[0]);

  useEffect(() => {
    onSelectAvatar(avatars[0]);
  }, []);

  return (
    <div className="flex flex-col">
      <h2 className="text-center text-2xl">Avatar</h2>
      <Carousel className="w-full max-w-48 place-self-center">
        <CarouselContent>
          {avatars.map((avatar) => (
            <CarouselItem
              key={avatar}
            >
              <div className={`flex items-center justify-center`}>
                <Avatar className="h-32 w-32">
                  <AvatarImage src={avatar} alt="Avatar" />
                </Avatar>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious
          onClickCapture={() => {
            const currentIndex = avatars.indexOf(currentAvatar);
            const prevIndex = currentIndex === 0 ? currentIndex : currentIndex - 1;
            setCurrentAvatar(avatars[prevIndex]);
          }}
          type="button"
        />
        <CarouselNext
          onClickCapture={() => {
            const currentIndex = avatars.indexOf(currentAvatar);
            const nextIndex = currentIndex === avatars.length - 1 ? currentIndex : currentIndex + 1;
            setCurrentAvatar(avatars[nextIndex]);
            onSelectAvatar(avatars[nextIndex]);
          }}
          type="button" />
      </Carousel>
    </div>
  );
};

export default AvatarSelector;