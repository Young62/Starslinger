var winState={
  preload:function(){
    game.load.audio('oneWay','assets/audio/oneWay.ogg');
  },

  create:function(){
    music=game.add.audio('oneWay');
    music.play();


    subTitle=game.add.text(80, 0, 'Starslinger will return soon.', {font: '50px Arial', fill: '#ffffff'});
    title=game.add.text(80, 80, 'Until then, FUCK YOU!!!', {font: '50px Arial', fill: '#ffffff'});
    cover=game.add.image(80,160,'win');
    var startLabel=game.add.text(90, game.world.height-80, 'Click to Play Again', {font: '25px Arial', fill: '#ffffff'});

    game.input.onTap.addOnce(this.restart,this);
  },

  update: function(){
    if(counter<50){
      title.addColor('#ff0066', 0);
      subTitle.addColor('#ccff99', 0);
    }else if(counter<100){
      title.addColor('#66ff66', 0);
      subTitle.addColor('#ffff66', 0);
    }else if(counter<150){
      title.addColor('#cc66ff', 0);
      subTitle.addColor('#66ff66', 0);
    }else{
      counter=0;
    }
    counter=counter+1;
  },

  restart: function(){
    music.stop();
    game.state.start('menu');
  }
}
