var music;
var cover;
var textColor;
var counter=0;
var title;
var subTitle;

var menuState={
  create:function(){
    music=game.add.audio('blackCoffee');
    music.play();

    cover=game.add.image(80,230,'cover');
    title=game.add.text(80, 80, 'Starslinger :', {font: '50px Arial', fill: '#ffffff'});
    subTitle=game.add.text(80, 160, 'The Space Punk Concerto Begins', {font: '50px Arial', fill: '#ffffff'});

    var startLabel=game.add.text(80, game.world.height-80, 'Click to Launch', {font: '25px Arial', fill: '#ffffff'});

    game.input.onTap.addOnce(this.briefing, this);
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

  briefing: function(){
    title.y=600;
    title.setText("You are recieving a transmission:");
    subTitle.y=660;
    subTitle.setText("Aliens...coming...attack...\nbefore...colony...ARGH!..");
    cover.destroy();
    cover=game.add.image(80,230,'briefing');

    game.input.onTap.addOnce(this.start, this);
  },

  start: function(){
    music.stop();
    game.state.start('play');
  }
}
