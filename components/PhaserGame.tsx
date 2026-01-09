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
  const [score, setScore] = useState(0);
  const game = useRef<Phaser.Game | null>(null!);

  useLayoutEffect(() => {
    if (game.current === null) {
      game.current = StartGame('game-container');

      if (typeof ref === 'function') {
        ref({ game: game.current, scene: null });
      } else if (ref) {
        ref.current = { game: game.current, scene: null };
      }
    }

    return () => {
      if (game.current) {
        game.current.destroy(true);
        if (game.current !== null) {
          game.current = null;
        }
      }
    };
  }, [ref]);

  useEffect(() => {
    EventBus.on('current-scene-ready', (scene_instance: Phaser.Scene) => {
      if (currentActiveScene && typeof currentActiveScene === 'function') {
        currentActiveScene(scene_instance);
      }

      if (typeof ref === 'function') {
        ref({ game: game.current, scene: scene_instance });
      } else if (ref) {
        ref.current = { game: game.current, scene: scene_instance };
      }
    });
    return () => {
      EventBus.removeListener('current-scene-ready');
    };
  }, [currentActiveScene, ref]);

  useEffect(() => {
    const onBubbleCollided = () => {
      setScore((prev) => prev + 1);
    };
    const onBubbleMissed = () => {
      setScore((prev) => {
        const newValue = prev - 1;
        if (newValue >= 0) {
          return newValue;
        }

        return prev;
      });
    };

    EventBus.on('bubble-collided', onBubbleCollided);
    EventBus.on('bubble-missed', onBubbleMissed);

    return () => {
      EventBus.removeListener('bubble-collided', onBubbleCollided);
      EventBus.removeListener('bubble-missed', onBubbleMissed);
    };
  }, []);

  return (
    <>
      <h1>
        Score: <span>{score}</span>
      </h1>
      <div id="game-container"></div>
    </>
  );
});

export default PhaserGame;
