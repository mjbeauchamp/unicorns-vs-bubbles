'use client';

import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import Phaser from 'phaser';
import StartGame from '@/phaser/main';
import { EventBus } from '@/phaser/EventBus';
import { useGame } from '@/contexts/GameContext';
import { GamePlay } from '@/phaser/scenes/Game';
import { LEVELS } from '@/game/config/levels';

export interface IRefPhaserGame {
  game: Phaser.Game | null;
  scene: Phaser.Scene | null;
}

interface IProps {
  currentActiveScene?: (scene_instance: Phaser.Scene) => void;
}

const PhaserGame = forwardRef<IRefPhaserGame, IProps>(function PhaserGame(
  { currentActiveScene },
  ref,
) {
  const [isPaused, setIsPaused] = useState(false);
  const phaserRef = useRef<Phaser.Game | null>(null!);
  const gamePlaySceneRef = useRef<GamePlay | null>(null);
  const isInitialized = useRef(false);

  const { currentScore, currentLevel, addPoint, missPoint } = useGame();

  useLayoutEffect(() => {
    if (phaserRef.current === null) {
      phaserRef.current = StartGame('game-container');

      if (typeof ref === 'function') {
        ref({ game: phaserRef.current, scene: null });
      } else if (ref) {
        ref.current = { game: phaserRef.current, scene: null };
      }
    }

    return () => {
      if (phaserRef.current) {
        phaserRef.current.destroy(true);
        if (phaserRef.current !== null) {
          phaserRef.current = null;
        }
      }
    };
  }, [ref]);

  useEffect(() => {
    const sceneReady = (scene_instance: Phaser.Scene) => {
      if (scene_instance instanceof GamePlay) {
        gamePlaySceneRef.current = scene_instance;
      }

      if (currentActiveScene && typeof currentActiveScene === 'function') {
        currentActiveScene(scene_instance);
      }

      if (typeof ref === 'function') {
        ref({ game: phaserRef.current, scene: scene_instance });
      } else if (ref) {
        ref.current = { game: phaserRef.current, scene: scene_instance };
      }
    };

    EventBus.on('current-scene-ready', sceneReady);
    return () => {
      EventBus.removeListener('current-scene-ready', sceneReady);
    };
  }, [currentActiveScene, ref]);

  useEffect(() => {
    const pauseGame = () => {
      setIsPaused(true);
    };

    const resumeGame = () => {
      setIsPaused(false);
    };
    EventBus.on('bubble-collided', addPoint);
    EventBus.on('bubble-missed', missPoint);
    EventBus.on('game-paused', pauseGame);
    EventBus.on('game-resumed', resumeGame);

    return () => {
      EventBus.removeListener('bubble-collided', addPoint);
      EventBus.removeListener('bubble-missed', missPoint);
      EventBus.removeListener('game-paused', pauseGame);
      EventBus.removeListener('bubble-missed', resumeGame);
    };
  }, []);

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      return;
    }

    const levelConfig = LEVELS.find((l) => l.level === currentLevel);
    if (levelConfig?.backgroundColor) {
      gamePlaySceneRef.current?.levelUp(levelConfig.backgroundColor);
    }
  }, [currentLevel]);

  const pause = () => {
    // if (!isPaused && phaserRef.current?.scene) {
    //   phaserRef.current.scene.pause('GamePlay');
    //   setIsPaused(true);
    // }
    if (!isPaused && gamePlaySceneRef.current) {
      gamePlaySceneRef.current.scene.pause('GamePlay');
      setIsPaused(true);
    }
  };

  const resume = () => {
    // if (isPaused && phaserRef.current?.scene) {
    //   phaserRef.current.scene.resume('GamePlay');
    //   setIsPaused(false);
    // }
    if (isPaused && gamePlaySceneRef.current) {
      gamePlaySceneRef.current.scene.resume('GamePlay');
      setIsPaused(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="primary-content-container relative min-w-[fit-content]">
        <h1>
          Score: <span>{currentScore}</span>
        </h1>
        <button onClick={pause}>PAUSE</button>
        {isPaused && (
          <div className="w-[100%] h-[100%] absolute top-0 left-0 z-10 bg-[rgba(255,255,255,0.5)] flex justify-center items-center">
            <button onClick={resume}>RESUME GAME</button>
          </div>
        )}
        <div id="game-container"></div>
      </div>
    </div>
  );
});

export default PhaserGame;
