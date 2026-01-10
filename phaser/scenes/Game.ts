import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';

export class GamePlay extends Scene {
  background: GameObjects.Image | null = null;
  unicorn: Phaser.Physics.Arcade.Sprite | null = null;
  title: GameObjects.Text | null = null;
  logoTween: Phaser.Tweens.Tween | null = null;
  bubbles: Phaser.Physics.Arcade.Group | null = null;
  camera: Phaser.Cameras.Scene2D.Camera | null = null;
  scenePaused = false;
  cursors?: Phaser.Types.Input.Keyboard.CursorKeys | null = null;

  constructor() {
    super('GamePlay');
  }

  create() {
    this.camera = this.cameras.main;

    // Unicorn
    this.unicorn = this.physics.add.sprite(
      this.scale.width / 2,
      this.scale.height - 100,
      'unicorn',
    );
    this.unicorn.setCollideWorldBounds(true);

    // Keyboard Input
    this.cursors = this?.input?.keyboard?.createCursorKeys();

    // Bubble group
    this.bubbles = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      runChildUpdate: true,
    });

    // Collision / overlap
    this.physics.add.overlap(
      this.unicorn,
      this.bubbles,
      (u, b) => {
        const unicorn = u as Phaser.Physics.Arcade.Sprite;
        const bubble = b as Phaser.Physics.Arcade.Sprite;
        this.handleBubblePop(unicorn, bubble);

        // Fire a collision event
        EventBus.emit('bubble-collided');
      },
      undefined,
      this,
    );

    // Spawn bubbles repeatedly
    this.time.addEvent({
      delay: 1000,
      callback: this.spawnBubble,
      callbackScope: this,
      loop: true,
    });

    // Pause the scene when the tab/window loses focus
    this.game.events.on('blur', () => {
      if (!this.scenePaused) {
        this.scenePaused = true;
        this.scene.pause();
        EventBus.emit('game-paused');
      }
    });

    // Resume the scene when the tab/window gains focus
    this.game.events.on('focus', () => {
      if (this.scenePaused) {
        this.scenePaused = false;
        this.scene.resume();
        EventBus.emit('game-resumed');
      }
    });

    EventBus.emit('current-scene-ready', this);
  }

  update() {
    if (this.unicorn && this.cursors) {
      const speed = 300;
      if (this.cursors.left.isDown) {
        this.unicorn.setVelocityX(-speed);
      } else if (this.cursors.right.isDown) {
        this.unicorn.setVelocityX(speed);
      } else {
        this.unicorn.setVelocityX(0);
      }

      if (this.cursors.up.isDown) {
        this.unicorn.setVelocityY(-speed);
      } else if (this.cursors.down.isDown) {
        this.unicorn.setVelocityY(speed);
      } else {
        this.unicorn.setVelocityY(0);
      }
    }

    // Bubble cleanup: destroy any bubbles that have fallen offscreen
    if (this.bubbles) {
      this.bubbles.getChildren().forEach((bubble) => {
        const b = bubble as Phaser.Physics.Arcade.Sprite;
        if (b.y > this.scale.height) {
          const y = b.y;
          const x = b.x;
          // Fire a global event
          EventBus.emit('bubble-missed');
          b.destroy();
          const emitter = this.add.particles(x, y, 'pop', {
            speed: { min: 50, max: 300 },
            scale: { start: 0.9, end: 0 },
            lifespan: 300,
            gravityY: 200,
            quantity: 1,
          });

          this.time.delayedCall(400, () => {
            emitter.destroy();
          });
        }
      });
    }
  }

  spawnBubble() {
    if (this.bubbles) {
      const x = Phaser.Math.Between(50, this.scale.width - 50);
      const bubble = this.bubbles.create(x, 0, 'bubble');

      bubble.setVelocityY(150);
      bubble.setCollideWorldBounds(false);
    }
  }

  handleBubblePop(
    unicorn: Phaser.Physics.Arcade.Sprite | null,
    bubble: Phaser.Physics.Arcade.Sprite,
    isMissedBubble?: boolean,
  ) {
    if (bubble?.body) {
      // Disable the bubble so it doesn't trigger collisions again
      bubble.body.enable = false;

      // Create pop particles
      const emitter = this.add.particles(bubble.x, bubble.y, 'pop', {
        speed: { min: 50, max: 300 },
        scale: { start: 0.9, end: 0 },
        lifespan: 300,
        gravityY: 200,
        quantity: 1,
      });

      // Tween for the pop animation (scale up + fade out)
      this.tweens.add({
        targets: bubble,
        scale: { from: 1, to: 1.5 },
        alpha: { from: 1, to: 0 },
        duration: 200,
        ease: 'Back.easeOut',
        onComplete: () => bubble.destroy(),
      });

      // Destroy the emitter after particles have disappeared
      this.time.delayedCall(400, () => {
        emitter.destroy();
      });
    }
  }

  levelUp(backgroundColor: string) {
    if (this.camera) {
      this.camera.setBackgroundColor(backgroundColor);
    }
  }

  gameOver() {
    this.scene.start('GameOver');
  }
}
