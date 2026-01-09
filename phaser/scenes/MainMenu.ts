import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';

export class MainMenu extends Scene {
  background: GameObjects.Image | null = null;
  unicorn: any;
  title: GameObjects.Text | null = null;
  logoTween: Phaser.Tweens.Tween | null = null;
  bubbles: any;
  cursors: any;

  constructor() {
    super('MainMenu');
  }

  create() {
    // Unicorn
    this.unicorn = this.physics.add.sprite(
      this.scale.width / 2,
      this.scale.height - 100,
      'unicorn',
    );
    this.unicorn.setCollideWorldBounds(true);

    // Input
    this.cursors = this?.input?.keyboard?.createCursorKeys();

    // Bubble group
    this.bubbles = this.physics.add.group();

    // Collision / overlap
    this.physics.add.overlap(
      this.unicorn,
      this.bubbles,
      this.handleBubblePop,
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
    // this.background = this.add.image(512, 384, 'background');

    // // this.unicorn = this.add.image(595, 681, 'unicorn');
    // this.unicorn = this.physics.add.sprite(
    //   this.scale.width / 2,
    //   this.scale.height - 100,
    //   'unicorn',
    // );

    // this.unicorn.setCollideWorldBounds(true);

    // this.bubbles = this.physics.add.group({
    //   defaultKey: 'bubble',
    // });

    // this.title = this.add
    //   .text(512, 460, 'Main Menu', {
    //     fontFamily: 'Arial Black',
    //     fontSize: 38,
    //     color: '#ffffff',
    //     stroke: '#000000',
    //     strokeThickness: 8,
    //     align: 'center',
    //   })
    //   .setOrigin(0.5)
    //   .setDepth(100);

    // EventBus.emit('current-scene-ready', this);
  }

  update() {
    if (this.unicorn) {
      if (this.cursors.left.isDown) {
        this.unicorn.setVelocityX(-300);
      } else if (this.cursors.right.isDown) {
        this.unicorn.setVelocityX(300);
      } else {
        this.unicorn.setVelocityX(0);
      }

      if (this.cursors.up.isDown) {
        this.unicorn.setVelocityY(-300);
      } else if (this.cursors.down.isDown) {
        this.unicorn.setVelocityY(300);
      } else {
        this.unicorn.setVelocityY(0);
      }
    }
  }

  spawnBubble() {
    const x = Phaser.Math.Between(50, this.scale.width - 50);
    const bubble = this.bubbles.create(x, 0, 'bubble');

    bubble.setVelocityY(150);
    bubble.setCollideWorldBounds(false);
  }

  handleBubblePop(unicorn: any, bubble: any) {
    bubble.destroy();
  }

  changeScene() {
    if (this.logoTween) {
      this.logoTween.stop();
      this.logoTween = null;
    }

    this.scene.start('Game');
  }

  moveLogo(reactCallback: ({ x, y }: { x: number; y: number }) => void) {
    if (this.logoTween) {
      if (this.logoTween.isPlaying()) {
        this.logoTween.pause();
      } else {
        this.logoTween.play();
      }
    } else {
      this.logoTween = this.tweens.add({
        targets: this.unicorn,
        x: { value: 750, duration: 3000, ease: 'Back.easeInOut' },
        y: { value: 80, duration: 1500, ease: 'Sine.easeOut' },
        yoyo: true,
        repeat: -1,
        onUpdate: () => {
          if (reactCallback && this?.unicorn) {
            reactCallback({
              x: Math.floor(this.unicorn.x),
              y: Math.floor(this.unicorn.y),
            });
          } else {
            console.error('Game MainMenu was not initialized correctly');
          }
        },
      });
    }
  }
}
