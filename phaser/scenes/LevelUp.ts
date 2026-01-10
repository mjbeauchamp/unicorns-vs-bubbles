import { Scene } from 'phaser';

import { EventBus } from '../EventBus';

export class LevelUp extends Scene {
  unicorn: Phaser.Physics.Arcade.Sprite | null = null;
  bubbles: Phaser.Physics.Arcade.Group | null = null;
  camera: Phaser.Cameras.Scene2D.Camera | null = null;

  constructor() {
    super('LevelUp');
  }

  create() {
    const { width, height } = this.scale;
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor('#f5c16c');

    // Create the message
    const text = this.add
      .text(width / 2, height / 2, `You leveled up!`, {
        fontSize: '48px',
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5);

    // Add some padding around the text
    const paddingX = 40;
    const paddingY = 40;

    // Measure the text
    const textBounds = text.getBounds();

    // Create the background rectangle based on text size + padding
    const modalBg = this.add
      .graphics()
      .fillStyle(0x000000, 0.7)
      .fillRoundedRect(
        textBounds.x - paddingX,
        textBounds.y - paddingY,
        textBounds.width + paddingX * 2,
        textBounds.height + paddingY * 2,
        20,
      );

    // Keep text block above everything else
    modalBg.setDepth(11);

    // Make sure text appears on top
    text.setDepth(modalBg.depth + 1);

    // Bubble group
    this.bubbles = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      runChildUpdate: true,
    });

    // Spawn bubbles repeatedly
    this.time.addEvent({
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

    this.time.addEvent({
      delay: 8000,
      loop: true,
      callback: () => {
        this.unicorn?.setVelocityX(500);
      },
    });

    // Resume on click / touch
    this.input.once('pointerdown', () => {
      EventBus.emit('level-up-modal-done');
      this.scene.stop();
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
        if (b.y > this.scale.height + b.y) {
          b.destroy();
        }
      });
    }
  }

  spawnBubble() {
    if (this.bubbles) {
      const x = Phaser.Math.Between(50, this.scale.width - 50);
      const bubble = this.bubbles.create(x, 0, 'bubble');

      bubble.setDepth(1);
      bubble.setVelocityY(150);
      bubble.setCollideWorldBounds(false);
    }
  }
}
