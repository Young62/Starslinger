
var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {

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
}

var player;
var health=2;
var burstLimit=4;
var healthStatus=['heavy','light','healthy'];
var radar;
var heading;

var bullets;
var burst=0;
var bulletTime = 0;

var cursors;
var fireButton;
var explosions;
var starfield;
var score = 0;

var aliens;
var enemyBullet;
var firingTimer = 0;
var stateText;
var livingEnemies = [];

function create() {
    //  The scrolling starfield background
    starfield = game.add.tileSprite(0, 0, 1920, 1920, 'starfield');
    game.world.setBounds(0, 0, 1920, 1920);

    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  Our bullet group
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    // The enemy's bullets
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(30, 'enemyBullet');
    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 1);
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);

    //  The hero!
    player = game.add.sprite(game.world.centerX, game.world.centerY, 'ship');
    player.anchor.setTo(0.5, 0.5);
    game.physics.enable(player, Phaser.Physics.ARCADE);
    game.camera.follow(player);
    player.body.collideWorldBounds=true;

    //radar
    radar=game.add.group();
    radar.enableBody = true;
    radar.physicsBodyType = Phaser.Physics.ARCADE;
    radar.fixedToCamera=true;
    heading = game.add.sprite(100, 500, 'healthy');
    game.physics.enable(heading, Phaser.Physics.ARCADE);
    heading.fixedToCamera=true;
    heading.anchor.setTo(0.5, 0.5);
    heading.alpha = 1;

    //  The baddies!
    aliens = game.add.group();
    aliens.enableBody = true;
    aliens.physicsBodyType = Phaser.Physics.ARCADE;

    createAliens();

    //  The score
    var style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
    scoreText = game.add.text(0, 0, score, style);
    scoreText.fixedToCamera=true;
    //scoreText.cameraOffset.setTo(0,0);

    //  Text
    stateText = game.add.text(400, 200,' ', { font: '84px Arial', fill: '#fff' });
    stateText.fixedToCamera=true;
    stateText.anchor.setTo(0.5, 0.5);
    stateText.visible = false;

    //  An explosion pool
    explosions = game.add.group();
    explosions.createMultiple(30, 'kaboom');
    explosions.forEach(setupInvader, this);

    //  And some controls to play the game with
    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
}

function createAliens () {
    for (var y = 0; y < 5; y++)
    {
        for (var x = 0; x < 5; x++)
        {
            var alien = aliens.create(x * game.rnd.integerInRange(1,200), y * game.rnd.integerInRange(1,400), 'invader');
            alien.anchor.setTo(0.5, 0.5);
            alien.animations.add('fly', [ 0, 1, 2, 3 ], 20, true);
            alien.play('fly');
            alien.body.moves = false;

            var blip = radar.create(100 , 500, 'blip');
            blip.anchor.setTo(0, 0.5);
            blip.body.angle = game.physics.arcade.angleBetween(player,alien);
            blip.alpha = .5;
        }
    }

    //  All this does is basically start the invaders moving. Notice we're moving the Group they belong to, rather than the invaders directly.
    var tween = game.add.tween(aliens).to( { x: 200 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
}

function setupInvader (invader) {
    invader.anchor.x = 0.5;
    invader.anchor.y = 0.5;
    invader.animations.add('kaboom');
}

function restart () {
    //  A new level starts

    //resets health
    health=healthStatus.length-1;
    heading.loadTexture(healthStatus[health],0);
    //  And brings the aliens back from the dead :)
    aliens.removeAll();
    createAliens();

    //revives the player
    player.reset();
    player.revive();
    //hides the text
    stateText.visible = false;
}

function update() {
    starfield.tilePosition.y += 1*player.body.angle;

    if (player.alive){
      if(cursors.down.isDown){
        game.physics.arcade.accelerationFromRotation(player.rotation, -100, player.body.acceleration);
      }else if (cursors.up.isDown){
        game.physics.arcade.accelerationFromRotation(player.rotation, 200, player.body.acceleration);
      }else{
        player.body.acceleration.set(0);
      }

      if (cursors.left.isDown){
        player.body.angularVelocity = -300;
        heading.body.angularVelocity= -300;
      }else if (cursors.right.isDown){
        player.body.angularVelocity = 300;
        heading.body.angularVelocity= 300;
      }else{
        player.body.angularVelocity = 0;
        heading.body.angularVelocity= 0;
      }

      if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)){
        fireBullet();
      }

      player.events.onOutOfBounds.add(function(){console.log('hit');}, this);

		  if (game.time.now > firingTimer){
          enemyFires();
      }

      //  Run collision
      game.physics.arcade.overlap(bullets, aliens, collisionHandler, null, this);
      game.physics.arcade.overlap(enemyBullets, player, enemyHitsPlayer, null, this);

    }

    livingEnemies.length=0;

    aliens.forEachAlive(function(alien){

        // put every living enemy in an array
        livingEnemies.push(alien);
    });

    var i=0;
    radar.forEach(function(blip){
      if(livingEnemies[i]!=undefined){
        blip.rotation=game.physics.arcade.angleBetween(player,livingEnemies[i]);
      }else{
        blip.kill();
      }
      i=i+1;
    });
    i=0;
}

function render() {

    // for (var i = 0; i < aliens.length; i++)
    // {
    //     game.debug.body(aliens.children[i]);
    // }

}

function collisionHandler (bullet, alien) {

    //  When a bullet hits an alien we kill them both
    bullet.kill();
    alien.kill();

    //  Increase the score
    score += 20;
    scoreText.text =score;

    //  And create an explosion :)
    var explosion = explosions.getFirstExists(false);
    explosion.reset(alien.body.x, alien.body.y);
    explosion.play('kaboom', 30, false, true);

    if (aliens.countLiving() == 0){
      score += 1000;
      scoreText.text = score;

      enemyBullets.callAll('kill',this);
      stateText.text = " YOU WON \n Click to Restart";
      stateText.visible = true;

      //the "click to restart" handler
      game.input.onTap.addOnce(restart,this);
    }
}

function enemyHitsPlayer (player,bullet) {

    bullet.kill();
    health=health-1;

    if (health>=0){
      heading.loadTexture(healthStatus[health],0);
    }
    //  And create an explosion :)
    var explosion = explosions.getFirstExists(false);
    explosion.reset(player.body.x, player.body.y);
    explosion.play('kaboom', 30, false, true);
    // When the player dies
    if (health < 0){
        heading.loadTexture('dead',0);
        player.kill();
        enemyBullets.callAll('kill');
        stateText.text=" GAME OVER \n Click to restart";
        stateText.visible = true;
        //the "click to restart" handler
        game.input.onTap.addOnce(restart,this);
    }
}

function enemyFires () {
    //  Grab the first bullet we can from the pool
    enemyBullet = enemyBullets.getFirstExists(false);

    livingEnemies.length=0;

    aliens.forEachAlive(function(alien){

        // put every living enemy in an array
        livingEnemies.push(alien);
    });


    if (enemyBullet && livingEnemies.length > 0){
      var random=game.rnd.integerInRange(0,livingEnemies.length-1);

      // randomly select one of them
      var shooter=livingEnemies[random];
      // And fire the bullet from this enemy
      enemyBullet.reset(shooter.body.x, shooter.body.y);

      game.physics.arcade.moveToObject(enemyBullet,player,200);
      firingTimer = game.time.now + 1000;
    }
}

function fireBullet () {
    if (game.time.now > bulletTime){
        bullet = bullets.getFirstExists(false);

        if (bullet){
            bullet.reset(player.body.x + 16, player.body.y + 16);
            bullet.lifespan = 2000;
            bullet.rotation = player.rotation;
            var x=400+Math.sqrt((player.body.velocity.x*player.body.velocity.x)+(player.body.velocity.y*player.body.velocity.y));
            game.physics.arcade.velocityFromRotation(player.rotation, x, bullet.body.velocity);
            bulletTime = game.time.now + 50;
            if(burst>burstLimit){
              bulletTime = game.time.now + 450;
              burst=0;
            }
            burst=burst+1;
        }
    }
}

function screenWrap (sprite) {

    if (sprite.x < 0)
    {
        sprite.x = game.width;
    }
    else if (sprite.x > game.width)
    {
        sprite.x = 0;
    }

    if (sprite.y < 0)
    {
        sprite.y = game.height;
    }
    else if (sprite.y > game.height)
    {
        sprite.y = 0;
    }

}
