'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { LEVELS } from '@/game/config/levels';

type GameContextType = {
  currentLevel: number;
  currentScore: number;
  addPoint: () => void;
  missPoint: () => void;
};

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentScore, setCurrentScore] = useState(0);

  const addPoint = () => {
    setCurrentScore((prev) => {
      const next = prev + 1;
      const levelConfig = LEVELS.find((l) => l.level === currentLevel);

      if (levelConfig && next >= levelConfig.targetScore) {
        setCurrentLevel((l) => l + 1);
        return 0; // reset score on level up
      }

      return next;
    });
  };

  const missPoint = () => {
    setCurrentScore((prev) => Math.max(0, prev - 1));
  };

  return (
    <GameContext.Provider
      value={{
        currentLevel,
        currentScore,
        addPoint,
        missPoint,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
