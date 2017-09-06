var loadState={
  preload:function(){
    var loadingLabel=game.add.text(80, 150, 'loading...', {font: '30px Courier', fill: '#ffffff'});

    game.load.image('bullet', 'assets/bullets.png');
    game.load.image('ship', 'assets/ship.png');
    game.load.image('enemyBullet', 'assets/enemy-bullet.png');
    game.load.spritesheet('invader', 'assets/invader32x32x4.png', 32, 32);
    game.load.spritesheet('kaboom', 'assets/explode.png', 128, 128);
    game.load.image('starfield', 'assets/starfield.png');
    game.load.image('background', 'assets/level1.png');
    game.load.image('blip','assets/blip.png');

    game.load.image('healthy','assets/heading.png');
    game.load.image('light','assets/heading-light.png');
    game.load.image('heavy','assets/heading-heavy.png');
    game.load.image('dead','assets/heading-dead.png');

    game.load.image('cover','assets/cover.jpg');
    game.load.image('win','assets/win.jpg');
    game.load.image('briefing','assets/briefing.jpg');

    //sound fx
    game.load.audio('playerShot', 'assets/audio/playerShot.wav');
    game.load.audio('droneShot', 'assets/audio/droneShot.wav');
    game.load.audio('hit','assets/audio/hit.wav');
    game.load.audio('damage','assets/audio/damage.wav');
    game.load.audio('gameover','assets/audio/gameover.wav');
    game.load.audio('scream','assets/audio/scream.ogg');

    //soundtrack
    game.load.audio('blackCoffee','assets/audio/blackCoffee.ogg');
  },

  create: function(){
    game.state.start('menu');
  }
}
