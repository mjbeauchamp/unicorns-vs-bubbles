'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { LEVELS } from '@/game/config/levels';

type GameContextType = {
  currentLevel: number;
  currentScore: number;
  isGameWon: boolean;
  addPoint: () => void;
  missPoint: () => void;
  resetGame: () => void;
};

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [gameState, setGameState] = useState({
    currentScore: 0,
    currentLevel: 1,
    isGameWon: false,
  });

  const addPoint = useCallback(() => {
    setGameState((prev) => {
      if (prev.isGameWon) {
        return prev;
      }
      const { currentScore, currentLevel } = prev;

      let nextScore = currentScore + 1;
      let nextLevel = currentLevel;

      const levelConfig = LEVELS[currentLevel - 1];

      if (levelConfig && nextScore >= levelConfig.targetScore) {
        nextScore = 0;
        nextLevel = levelConfig.level + 1;
      }

      if (nextLevel > LEVELS.length) {
        return {
          ...prev,
          isGameWon: true,
        };
      }

      return {
        ...prev,
        currentScore: nextScore,
        currentLevel: nextLevel,
      };
    });
  }, []);

  const missPoint = useCallback(() => {
    setGameState((prev) => {
      return {
        ...prev,
        currentScore: Math.max(0, prev.currentScore - 1),
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setGameState({
      isGameWon: false,
      currentScore: 0,
      currentLevel: 1,
    });
  }, []);

  return (
    <GameContext.Provider
      value={{
        currentLevel: gameState.currentLevel,
        currentScore: gameState.currentScore,
        isGameWon: gameState.isGameWon,
        addPoint,
        missPoint,
        resetGame,
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
