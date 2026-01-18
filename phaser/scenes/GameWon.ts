import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { GamePlay } from './GamePlay';

export class GameWon extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera | null = null;
  background: Phaser.GameObjects.Image | null = null;
  gameWonText: Phaser.GameObjects.Text | null = null;
  unicorn: Phaser.Physics.Arcade.Sprite | null = null;
  bubbles: Phaser.Physics.Arcade.Group | null = null;
  bubbleTimer?: Phaser.Time.TimerEvent;
  bounceTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super('GameWon');
  }

  create() {
    const { width, height } = this.scale;
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor('#f5c16c');

    // Bubble group
    this.bubbles = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
    });

    // Spawn bubbles repeatedly
    this.bubbleTimer = this.time.addEvent({
      delay: 200,
      callback: this.spawnBubble,
      callbackScope: this,
      loop: true,
    });

    // Unicorn Animation
    this.unicorn = this.physics.add.sprite(
      100,
      this.scale.height - 50,
      'unicorn-smiling',
    );
    this.unicorn.setDepth(10);

    this.unicorn.setCollideWorldBounds(true);
    this.unicorn.setBounce(0.8); // lots of springiness
    this.unicorn.setGravityY(1200);

    // initial hop
    this.unicorn.setVelocityY(-600);
    this.unicorn.setVelocityX(700);

    this.bounceTimer = this.time.addEvent({
      delay: 8000,
      loop: true,
      callback: () => {
        this.unicorn?.setVelocityX(500);
      },
    });

    // Background overlay
    this.add.rectangle(0, 0, width, height, 0x000000, 0.6).setOrigin(0);

    // Title
    this.add
      .text(width / 2, height / 2 - 80, 'You Win! 🎉', {
        fontSize: '48px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Play Again button
    const playAgain = this.add
      .text(width / 2, height / 2 + 20, 'Play Again', {
        fontSize: '32px',
        color: '#ffffff',
        backgroundColor: '#ff69b4',
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Hover effects (optional but very nice)
    playAgain
      .on('pointerover', () => {
        playAgain.setStyle({ backgroundColor: '#ff85c2' });
      })
      .on('pointerout', () => {
        playAgain.setStyle({ backgroundColor: '#ff69b4' });
      });

    // Click handler
    playAgain.on('pointerdown', () => {
      this.playAgain();
    });

    this.events.once('shutdown', () => {
      this.bubbleTimer?.remove();
      this.bounceTimer?.remove();
    });

    EventBus.emit('current-scene-ready', this);
  }

  update() {
    if (this.unicorn && this.unicorn.body?.blocked.down) {
      // The unicorn is touching the bottom of the world
      this.unicorn.setVelocityY(-600);
    }

    // Bubble cleanup: destroy any bubbles that have fallen offscreen
    if (this.bubbles) {
      this.bubbles.getChildren().forEach((bubble) => {
        const b = bubble as Phaser.Physics.Arcade.Sprite;
        if (b.y > this.scale.height + b.height) {
          b.destroy();
        }
      });
    }
  }

  spawnBubble() {
    if (this.bubbles) {
      const x = Phaser.Math.Between(50, this.scale.width - 50);
      const bubble = this.bubbles.create(x, -100, 'bubble');

      bubble.setDepth(1);
      bubble.setVelocityY(150);
      bubble.setCollideWorldBounds(false);
    }
  }

  playAgain() {
    EventBus.emit('game-restart');

    this.scene.stop('GameWon');
    this.scene.start('GamePlay', { level: 1 });
  }
}
