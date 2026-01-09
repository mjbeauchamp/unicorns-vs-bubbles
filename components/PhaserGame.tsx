'use client';

import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
import Phaser from 'phaser';
import StartGame from '@/phaser/main';
import { EventBus } from '@/phaser/EventBus';
import { useGame } from '@/contexts/GameContext';

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
  const game = useRef<Phaser.Game | null>(null!);

  const { currentScore, addPoint, missPoint } = useGame();

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
    EventBus.on('bubble-collided', addPoint);
    EventBus.on('bubble-missed', missPoint);

    return () => {
      EventBus.removeListener('bubble-collided', addPoint);
      EventBus.removeListener('bubble-missed', missPoint);
    };
  }, []);

  return (
    <div className="primary-content-container">
      <h1>
        Score: <span>{currentScore}</span>
      </h1>
      <div id="game-container"></div>
    </div>
  );
});

export default PhaserGame;
