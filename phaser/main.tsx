import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { GamePlay } from './scenes/Game';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { LevelUp } from './scenes/LevelUp';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: 1024,
  height: 768,
  parent: 'game-container',
  backgroundColor: '#028af8',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false, // set true if you want to see hitboxes
    },
  },
  scene: [Boot, Preloader, GamePlay, GameOver, LevelUp],
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
