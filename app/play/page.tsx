'use client';

import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import { IRefPhaserGame } from '@/components/PhaserGame';
const PhaserGame = dynamic(() => import('../../components/PhaserGame'), {
  ssr: false,
});

function Play() {
  //  References to the PhaserGame component (game and scene are exposed)
  const phaserRef = useRef<IRefPhaserGame | null>(null);

  // Event emitted from the PhaserGame component
  const currentScene = (scene: Phaser.Scene) => {
    //TODO: Update this if no action needed here
  };

  return (
    <div className="w-[100vw] relative">
      <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
    </div>
  );
}

export default Play;
