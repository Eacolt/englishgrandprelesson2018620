import ProgressBar from './gameui/Progressbar.js'
import {TimelineMax, TweenMax} from 'gsap'
import {SoundTrumpet} from './EasyPIXI.js'
import {checkForJumpRoute, Debugs} from './Utils.js'
import {LoadingAnimation} from "./gameui/GameManager";
import GameMenuBars from "./gameui/GameMenuBar";
import {PIXIAudio} from "./EasyPIXI";


class ChoicePicModule extends PIXI.Container {
  constructor($options) {
    super();
    this.gameConfig = $options.json;
    this.app = $options.app;
    this.ticker = $options.ticker;
    this.resources = PIXI.loader.resources;
    this.vueInstance = $options.vueInstance;
    this.rightAnswersArr = [1, 1, 1];
    this.gameLevel = 0;
    this.btnsArr = [];
    this.bearDefaultAn = null;
    this.btnsContainer = null;
    this.progressBar = null;
    this.gameLessonCompleted = false;

    this.isAnimating = false;

    //最左边坐标;
    this.leftCtnPos = 0;
    this.cardOffsetWidth = 85;//卡片之间的距离;

    //上部分声音;
    this.soundButton = null;
    this.soundSpeakText = null;
    this.gameAudio = null;

    this.gameMenuBar = null;


    this.on('added', this.addedToStage, this)
  }

  playAgain() {

    this.vueInstance.showCongra = false;
    this.gameLevel = -1;
    this.progressBar.progress = 0;
    this.progressBar.hideProgressBall()
    this.goNextComing();
  }

  playContinue() {

    if (this.vueInstance.gameHasBeenCompleted) {
      checkForJumpRoute.call(this, false);

    } else {
      checkForJumpRoute.call(this, true);
    }


  }

  goToHome() {
    const self = this;
    if (self.vueInstance.$route.meta.completed == 0) {
      self.vueInstance.popupType = 'shutback';
      self.vueInstance.showCongra = true;
    } else {
      setTimeout(() => {
        self.vueInstance.$router.push('/')
      }, 1000);
      LoadingAnimation.setMaskShow(true);

      let arr = self.vueInstance.$route.fullPath.split('/');
      let index = self.vueInstance.allPartNames.indexOf(arr[1]);
      self.vueInstance.SET_INDEXPAGEINITIALSLIDE(Number(index));
    }
  }

  rightCheck($index) {
    const self = this;

    if (self.isAnimating) return;
    self.isAnimating = true;

    if (self.gameLevel >= self.gameConfig.levels.length - 1) {
      self.gameLessonCompleted = true;
    }


    function doCheck() {
      if (self.rightAnswersArr[self.gameLevel] == $index) {
        self.btnsArr.forEach((item, index) => {

          if (index != $index) {
            item.closeDoor();
          } else {
            item.setClicked()
          }
        });
        let rightsd = new Audio('static/sound/select_right.mp3');
        rightsd.play();
        doGoToNext();

      } else {
        let wrongsd = new Audio('static/sound/select_wrong.mp3');
        wrongsd.play();

        self.btnsArr.forEach((item, index) => {
          if (index == $index) {
            let _orightX = item.x;
            let tl = new TimelineMax({
              onComplete: function () {
                doAgain()

              }
            });
            tl.add(TweenMax.to(item, 0.08, {x: _orightX - 20}));
            tl.add(TweenMax.to(item, 0.08, {x: _orightX + 15}))
            tl.add(TweenMax.to(item, 0.1, {x: _orightX - 5}))
            tl.add(TweenMax.to(item, 0.1, {x: _orightX}))
          }
        });
      }
    };
    doCheck();

    function doAgain() {
      self.isAnimating = false;

    }


    function doGoToNext() {
      setTimeout(() => {
        self.progressBar.showProgress();
        self.progressBar.progress = self.gameLevel;
        setTimeout(() => {
          if (self.gameLevel >= self.gameConfig.levels.length - 1) {
            //开始设置清算界面逻辑全套;
            self.vueInstance.$route.meta.completed = 1;
            self.vueInstance.setOwnLessonComplete();
            if(self.gameAudio){
              self.gameAudio.stop();
              self.soundButton.stop();
            }

            //开始清算。。
            if (self.vueInstance.gameHasBeenCompleted == false) {
              window.parent.postMessage({
                type: "stepSubmit",
                page: self.vueInstance.lessonCurrentPageIndex

              }, "*");
            };

            setTimeout(()=>{

              let isQingsuan = self.vueInstance.$route.name==self.vueInstance.restArrangementStat[self.vueInstance.restArrangementStat.length-1];//开始清算;
              if(isQingsuan && !self.vueInstance.gameHasBeenCompleted){
                setTimeout(()=>{
                  self.gameMenuBar.bookScene.openEnergyCan(false);
                },self.vueInstance.showPopupDelay)
              }
              setTimeout(()=>{

                if(self.vueInstance.alreadyHasOneCard){
                  self.vueInstance.showCongra = true;
                  let sound = new Audio('static/sound/win_jump.mp3');
                  sound.play();
                  return;
                }
                if(self.vueInstance.gameHasBeenCompleted &&  !self.vueInstance.alreadyHasOneCard){
                  self.gameMenuBar.bookScene.openEnergyCan(true);
                }
                if(!self.vueInstance.gameHasBeenCompleted && isQingsuan==false){
                  self.vueInstance.showCongra = true;
                  let sound = new Audio('static/sound/win_jump.mp3');
                  sound.play();

                };

              },self.vueInstance.showPopupDelay);
              self.vueInstance.updateRestArrangementStat();

            },1);
            //开始设置清算界面逻辑全套---END;
            self.progressBar.hideProgress()
            return;
          }
          self.progressBar.hideProgress(hideProgressHandler.bind(self));
          return;
        }, 1500);
      }, 400);
    }

    function hideProgressHandler() {
      setTimeout(() => {
        TweenMax.to(self.btnsContainer, .5, {x: self.btnsContainer.x - 1900});

        setTimeout(() => {
          self.goNextComing.call(self);
        }, 500)

      }, 100);
    }
  }

  goNextComing() {
    const self = this;

    self.gameLevel++;
    self.vueInstance.$emit('changeGameLevel', self.gameLevel)
    let rightOffset = 1900;
    self.btnsContainer.x = 1920 / 2 + self.btnsArr[0].width / 2;
    self.stopSpeakSound();

    TweenMax.from(self.btnsContainer, 0.5, {
      x: 1100 + rightOffset, onComplete: () => {
        self.isAnimating = false;
        self.soundSpeakText.text = self.gameConfig.levels[self.gameLevel].content;
        self.soundSpeakText.pivot.y = self.soundSpeakText.height / 2;
        self.soundSpeakText.text = self.gameConfig.levels[self.gameLevel].content;
        self.soundSpeakText.y = 290

        self.playSpeakSound();
        self.checksTiGan.call(self);

      },onStart:()=>{
        self.arrangePicCards.call(self);
      }
    });

  }

  //对于题干的判断
  checksTiGan() {
    const self = this;
    if (_.trim(this.gameConfig.levels[self.gameLevel].audioSrc) == "" && _.trim(this.gameConfig.levels[self.gameLevel].content) != "") {
      this.soundButton.alpha = 0;
      this.soundSpeakText.alpha = 1;
      this.soundSpeakText.style.align = 'center'
      this.soundSpeakText.pivot.x = this.soundSpeakText.width / 2;
      this.soundSpeakText.x = 1920 / 2;
      this.soundButton.x = 410;


    } else if (_.trim(this.gameConfig.levels[self.gameLevel].audioSrc) != "" && _.trim(this.gameConfig.levels[self.gameLevel].content) == "") {
      this.soundButton.alpha = 1;
      this.soundSpeakText.alpha = 0;
      this.soundSpeakText.style.align = 'left'
      this.soundSpeakText.pivot.x = 0;
      this.soundSpeakText.x = 620;
      this.soundButton.x = 870;

    } else {
      this.soundButton.alpha = 1;
      this.soundSpeakText.alpha = 1;
      this.soundSpeakText.style.align = 'left';
      this.soundSpeakText.pivot.x = 0;
      this.soundSpeakText.x = 620;
      this.soundButton.x = 410;
    }
  };

  goBackComing() {
    const self = this;
    if (self.isAnimating) return;


    if (self.gameLevel == 0) return;
    self.gameLevel--;
    self.vueInstance.$emit('changeGameLevel', self.gameLevel);
    self.progressBar.progress = self.gameLevel;
    let rightOffset = 1900;
    self.stopSpeakSound();


    TweenMax.to(self.btnsContainer, 0.5, {
      x: self.btnsContainer.x + rightOffset, onStart: () => {
        self.isAnimating = true;
        self.soundSpeakText.text = self.gameConfig.levels[self.gameLevel].content;
        self.soundSpeakText.pivot.y = self.soundSpeakText.height / 2;


          self.soundSpeakText.y = 290


        // self.soundSpeakText.y = 290;

        self.checksTiGan.call(self);
        self.arrangePicCards.call(self);




      }, onComplete: function () {


      }
    });

    setTimeout(() => {
      let rightOffset = 1900;

      // }
      self.btnsContainer.x = 1920 / 2 + self.btnsArr[0].width / 2;

      TweenMax.from(self.btnsContainer, 0.5, {
        x: 1100 - rightOffset, onComplete: () => {
          self.isAnimating = false;
          self.playSpeakSound();
        }
      });

    }, 500)


  }

  arrangePicCards() {
    if (this.btnsArr.length > 0) {
      this.btnsArr.forEach((item) => {
        item.destroy();
      })
      this.btnsArr = [];
    }

    const cardListNum = this.gameConfig.levels[this.gameLevel].cardlist.length;
    for (let k = 0; k < cardListNum; k++) {
      let pic = new PicCard();

      this.btnsContainer.addChild(pic);
      pic.setPicture(this.resources[this.gameConfig.levels[this.gameLevel].cardlist[k]].texture);

      if(cardListNum==2){
        pic.x = k * (pic.width + (this.cardOffsetWidth+100));

      }else if(cardListNum>=3){
        pic.x = k * (pic.width + this.cardOffsetWidth);

      }




      this.btnsArr.push(pic);
      pic.interactive = true;
      pic.on('pointerdown', this.cardClickHander.bind(this, k))
    }
    //self.leftCtnPos = 1920/2+self.btnsArr[0].width/2;
    this.btnsContainer.pivot.x = this.btnsContainer.width / 2;

    this.btnsContainer.x = 1920 / 2 + this.btnsArr[0].width / 2;

    this.btnsContainer.y = 720;


  }

  addedToStage() {
    const self = this;


    var gameBg = new PIXI.Sprite(PIXI.loader.resources['practicebg_jpg'].texture);
    this.addChild(gameBg)

    this.progressBar = new ProgressBar();

    self.btnsContainer = new PIXI.Container();

// return;

    function setRightAnswers() {
      let rightArr = [];
      self.gameConfig.levels.forEach((item) => {
        rightArr.push(item.rightAnswer-1)
      })
      self.rightAnswersArr = rightArr;
    };
    setRightAnswers();




    self.arrangePicCards.call(self);
    self.addChild(self.btnsContainer);


    self.addChild(self.progressBar);
    self.progressBar.setBar({width: 1000 / this.gameConfig.levels.length, points: this.gameConfig.levels.length - 1})

    self.progressBar.y = 1300;
    self.progressBar.x = 1920 / 2;
    self.progressBar.pivot.x = 0
    self.progressBar.pivot.y = 0;


    //播放声音;

    self.soundButton = new SoundTrumpet();
    self.soundButton.resName = 'gamebtnSound_atlas';
    self.soundButton.alienImages = ['gamesound0.png','gamesound1.png','gamesound2.png']
    self.soundButton.interactive = true;
    self.addChild(self.soundButton);
    self.soundButton.x = 410;
    self.soundButton.y = 209;
    self.soundButton.on('pointertap', self.soundButtonTap, self);

    setTimeout(()=>{
      self.playSpeakSound();
    },300)


    self.soundSpeakText = new PIXI.Text('', {
      fontFamily: 'Microsoft YaHei',
      fontSize: 52,
      fill: 0xffffff,
      align: 'left',
      wordWrap:true,
      wordWrapWidth:1000
    });

    self.addChild(self.soundSpeakText);
    self.soundSpeakText.pivot.y = self.soundSpeakText.height / 2;
    self.soundSpeakText.text = self.gameConfig.levels[self.gameLevel].content;
    self.soundSpeakText.x = 620;
    //核心判断垂直逻辑
    if(self.soundSpeakText.height>70){
      self.soundSpeakText.y = 260
    }else{
      self.soundSpeakText.y = 290
    }

    //End {播放声音}

    //TODO:顶部导航逻辑-----
    GameMenuBars.freeze = false;

    self.gameMenuBar = new GameMenuBars();


    self.addChild(self.gameMenuBar);

    ////
    self.gameMenuBar.setBackBtn_tapHandler(()=>{

      self.goBackComing();
    });
    self.gameMenuBar.setHomeBtn_tapHandler(()=>{
      self.goToHome();
    })
    self.gameMenuBar.backBtnShow = false;
    self.gameMenuBar.homeBtnShow = true;
    self.gameMenuBar.bookBtnShow =false;
    self.gameMenuBar.updateGameMenu();
    self.vueInstance.$watch(()=>{
      return self.vueInstance.energyCurrentNum
    },(newval)=>{
      this.gameMenuBar.energy = newval;
      this.gameMenuBar.playStars();
    });

    self.vueInstance.$watch(()=>{
      return self.vueInstance.currentGameLevel
    },(newval)=>{
      if (newval > 0) {
        self.gameMenuBar.backBtnShow = true;
        self.gameMenuBar.homeBtnShow = true;


      } else {
        self.gameMenuBar.backBtnShow = false;
        self.gameMenuBar.homeBtnShow = true;

      }
      self.gameMenuBar.updateGameMenu();

    })

    this.gameMenuBar.energyOnce = self.vueInstance.energyCurrentNum;
    //顶部导航逻辑END

    this.checksTiGan.call(this)

  };

  soundButtonTap() {

    if (this.soundButton.status == 'stoping') {
      this.soundButton.play();
      this.playSpeakSound();
    } else if (this.soundButton.status == 'playing') {
      this.soundButton.stop();
      this.stopSpeakSound();
    }

  }

  playSpeakSound() {
    const self = this;
    if (_.trim(self.gameConfig.levels[self.gameLevel].audioSrc) != "") {
      let soundName =  this.vueInstance.$route.meta.assetsUrl+'_'+self.gameConfig.levels[self.gameLevel].audioSrc.replace(/\./g,'_');


      self.gameAudio = PIXIAudio.audios[soundName];
      self.gameAudio.play();
      self.soundButton.play();
      self.gameAudio.on('complete',()=>{
        self.soundButton.stop();
      });
    }


  }

  stopSpeakSound() {
    if (this.gameAudio) {
      this.gameAudio.stop();
      this.soundButton.stop();

    }

  }

  cardClickHander(k, event) {
    if (this.gameLevel == 0) {
      this.progressBar.showProgressBall()
    }
    this.rightCheck(k)
  }

  destroyed() {
    if (this.gameAudio) {
      this.gameAudio.stop();
    }
    if(this.gameMenuBar){
      this.gameMenuBar.clearGameMenuEvents();
      this.gameMenuBar.destroy();
    }
  }
}



class PicCard extends PIXI.Container {
  constructor() {
    super();
    this.on('added', this.added_handler, this);
    this.bg_sprite = null;
    this.innerPic_sprite = null;
    this.innerContainer = null;

    this.leftDoor = null;
    this.rightDoor = null;
  }

  added_handler() {
    this.leftDoor = new PIXI.Sprite(PIXI.Texture.from('cardchoose_doorL'));
    this.rightDoor = new PIXI.Sprite(PIXI.Texture.from('cardchoose_doorR'));
    this.leftDoor.pivot.x = this.leftDoor.width / 2;
    this.rightDoor.pivot.x = this.rightDoor.width / 2;
    this.leftDoor.pivot.y = this.leftDoor.height / 2;
    this.rightDoor.pivot.y = this.rightDoor.height / 2;


    this.bg_sprite = new PIXI.Sprite(PIXI.Texture.from('cardchoose_normal'));
    this.bg_sprite.pivot.x = this.bg_sprite.width / 2;
    this.bg_sprite.pivot.y = this.bg_sprite.height / 2;
    this.leftDoor.alpha = this.rightDoor.alpha = 0;


    let maskerBox_g = new PIXI.Graphics();
    maskerBox_g.beginFill(0x00ff00);
    maskerBox_g.drawRect(0, 0, this.bg_sprite.width - 40, this.bg_sprite.height - 40);
    maskerBox_g.endFill();
    maskerBox_g.pivot.x = maskerBox_g.width / 2;
    maskerBox_g.pivot.y = maskerBox_g.height / 2;
    this.addChild(maskerBox_g);

    this.innerContainer = new PIXI.Container();


    this.innerPic_sprite = new PIXI.Sprite();

    this.innerContainer.addChild(this.innerPic_sprite);

    this.innerContainer.addChild(this.leftDoor);
    this.innerContainer.addChild(this.rightDoor)
    this.innerContainer.mask = maskerBox_g;


    this.addChild(this.innerContainer)
    this.addChild(this.bg_sprite);

  }

  setPicture($texture) {
    this.innerPic_sprite.texture = $texture;
    this.innerPic_sprite.pivot.x = this.innerPic_sprite.width / 2;
    this.innerPic_sprite.pivot.y = this.innerPic_sprite.height / 2;
  }

  setClicked() {
    this.bg_sprite.texture = PIXI.Texture.from('cardchoose_select');
  }

  setNormal() {
    this.bg_sprite.texture = PIXI.Texture.from('cardchoose_normal');
  }

  closeDoor() {
    TweenMax.to([this.leftDoor, this.rightDoor], 0, {alpha: 1})

    TweenMax.from(this.rightDoor, .6, {x: '+=300'})
    TweenMax.from(this.leftDoor, .6, {x: '-=300'})
  }

  openDoor() {
    TweenMax.to([this.leftDoor, this.rightDoor], 0, {alpha: 0})
  }
}

export default ChoicePicModule;
