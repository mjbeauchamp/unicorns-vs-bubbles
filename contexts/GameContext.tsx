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
  const [gameState, setGameState] = useState({
    currentScore: 0,
    currentLevel: 1,
  });

  const addPoint = () => {
    setGameState((prev) => {
      const { currentScore, currentLevel } = prev;

      const levelConfig = LEVELS.find((l) => l.level === currentLevel);
      let nextScore = currentScore + 1;
      let nextLevel = currentLevel;

      if (levelConfig && nextScore >= levelConfig.targetScore) {
        nextScore = 0;
        nextLevel = levelConfig.level + 1;
      }

      return {
        currentScore: nextScore,
        currentLevel: nextLevel,
      };
    });
  };

  const missPoint = () => {
    setGameState((prev) => {
      return {
        ...prev,
        currentScore: Math.max(0, prev.currentScore - 1),
      };
    });
  };

  return (
    <GameContext.Provider
      value={{
        currentLevel: gameState.currentLevel,
        currentScore: gameState.currentScore,
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
