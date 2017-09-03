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
var pasueButton;

var explosions;
var starfield;

var aliens;
var enemyBullet;
var firingTimer = 0;
var stateText;
var livingEnemies = [];

var playState={
  create: function(){
    //  The scrolling starfield background
    starfield = game.add.tileSprite(0, 0, 1800, 1800, 'starfield');
    game.world.setBounds(0, 0, 1800, 1800);

    music=game.add.audio('passenger');
    playerShotSound=game.add.audio('playerShot');
    droneShotSound=game.add.audio('droneShot');
    hitSound=game.add.audio('hit');
    damageSound=game.add.audio('damage');
    gameoverSound=game.add.audio('gameover');
    screamSound=game.add.audio('scream');

    music.play();

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
    heading = game.add.sprite(50, 50, 'healthy');
    game.physics.enable(heading, Phaser.Physics.ARCADE);
    heading.fixedToCamera=true;
    heading.anchor.setTo(0.5, 0.5);
    heading.rotation=player.body.angle;
    heading.alpha = 1;

    //  The baddies!
    aliens = game.add.group();
    aliens.enableBody = true;
    aliens.physicsBodyType = Phaser.Physics.ARCADE;

    createAliens(100);

    //  Text
    stateText = game.add.text(400, 200,' ', { font: '84px Arial', fill: '#fff' });
    stateText.fixedToCamera=true;
    stateText.anchor.setTo(0.5, 0.5);
    stateText.visible = false;

    //  An explosion pool
    explosions = game.add.group();
    explosions.createMultiple(30, 'kaboom');
    explosions.forEach(setupInvader, this);

    //controls
    //////////

    //  And some controls to play the game with
    cursors = game.input.keyboard.createCursorKeys();
    pauseButton = game.input.keyboard.addKey(Phaser.Keyboard.P);

    //pause menu
    pauseButton.onDown.add(pause, this);

    function pause(event){
      if(game.paused===true){
        game.paused=false;
      }else{
        game.paused=true;
      }
    }
  },

  update: function(){
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

    function collisionHandler (bullet, alien) {
      hitSound.play();
      //  When a bullet hits an alien we kill them both
      bullet.kill();
      alien.kill();

      //  And create an explosion :)
      var explosion = explosions.getFirstExists(false);
      explosion.reset(alien.body.x, alien.body.y);
      explosion.play('kaboom', 30, false, true);

      if (aliens.countLiving() == 0){
        enemyBullets.callAll('kill',this);

        //victory
        this.win();
      }
    }

    function enemyHitsPlayer (player,bullet) {
      damageSound.play();
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
        //let them know he's dead
        music.stop();
        gameoverSound.play();
        screamSound.play();
        //prepare for respawn
        heading.loadTexture('dead',0);
        player.kill();
        enemyBullets.callAll('kill');

        //game over
        stateText.text=" GAME OVER \n \n Click to restart";
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
        if((game.camera.x<shooter.body.x && shooter.body.x<(game.camera.x+game.camera.width)) && ((game.camera.height+game.camera.y)>shooter.body.y && shooter.body.y>game.camera.y)){
          droneShotSound.play();
        }

        game.physics.arcade.moveToObject(enemyBullet,player,200);
        firingTimer = game.time.now + 1000;
      }
    }

    function fireBullet () {
        if (game.time.now > bulletTime){
          bullet = bullets.getFirstExists(false);

          if (bullet){
            playerShotSound.play();
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
        if (sprite.x < 0){
            sprite.x = game.width;
        }else if (sprite.x > game.width){
            sprite.x = 0;
        }

        if (sprite.y < 0) {
            sprite.y = game.height;
        }else if(sprite.y > game.height){
            sprite.y = 0;
        }
      }
  },

  win: function(){
    music.stop();
    game.state.start('win');
  }
}

function createAliens(numDrones){
  //create the mothership

  //create the mantises

  //create the scorps

  //create the drones
  for (var y = 0; y < numDrones; y++){
    var alien = aliens.create(game.rnd.integerInRange(10,1600), game.rnd.integerInRange(10,1600), 'invader');
    alien.anchor.setTo(0.5, 0.5);
    alien.animations.add('fly', [ 0, 1, 2, 3 ], 20, true);
    alien.play('fly');
    alien.body.moves = false;

    var blip = radar.create(50, 50, 'blip');
    blip.anchor.setTo(0, 0.5);
    blip.body.angle = game.physics.arcade.angleBetween(player,alien);
    blip.alpha = .5;
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
    //  And brings the aliens back from the dead :)
    aliens.removeAll();
    radar.removeAll();
    createAliens(100);
    //revives the player
    player.reset();
    player.revive();
    health=healthStatus.length-1;
    heading.loadTexture(healthStatus[health],0);
    heading.angle=player.body.rotation;
    //hides the text
    stateText.visible = false;
    music.play();
}
