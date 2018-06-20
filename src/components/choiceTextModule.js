import ProgressBar from './gameui/Progressbar.js'

import {checkForJumpRoute} from './Utils.js'
import {Debugs} from "./Utils";
import {LoadingAnimation} from './gameui/GameManager.js'
import GameMenuBars from "./gameui/GameMenuBar";
import {SoundTrumpet} from './EasyPIXI.js'
import {PIXIAudio} from "./EasyPIXI";

class ChoiceTextModule extends PIXI.Container {
  constructor($options) {
    super();
    this.gameConfig = $options.json;
    this.app = $options.app;
    this.ticker = $options.ticker;
    this.resources = PIXI.loader.resources;// $options.resources;
    this.vueInstance = $options.vueInstance;

    this.rightAnswersArr = [3, 1, 0];//正确答案数字;

    this.gameLevel = 0;
    this.gameLessonCompleted = false;


    this.bearDefaultAn = null;

    this.picBand = null;
    // this.btnsContainer = null;
    this.progressBar = null;
    this.isAnimating = false;

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
    this.progressBar.progress = 0
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
        self.picBand.questionBars.forEach((item, index) => {

          if (index != $index) {
            item.getChildAt(0).closeDoor();

          } else {
            item.getChildAt(0).highlighter.alpha = 1;
            item.getChildAt(0).openDoor();
            item.getChildAt(0).myText.style.fill = 0x23609f;
          }
        });


        let rightsd = new Audio('static/sound/select_right.mp3');
        rightsd.play();
        doGoToNext();

      } else {
        let wrongsd = new Audio('static/sound/select_wrong.mp3');
        wrongsd.play();

        self.picBand.questionBars.forEach((item, index) => {

          if (index == $index) {
            item.getChildAt(0).wrrongClicked(doAgain);
          }
        });
      }
    };
    doCheck();

    function doAgain() {
      self.isAnimating = false;

    }

    //跳转下一题
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
              self.soundButton.stop();
            }

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
          ;
          self.progressBar.hideProgress(hideProgressHandler.bind(self));
        }, 1500)
      }, 400);
    }


    function hideProgressHandler() {

      setTimeout(() => {
        TweenMax.to(self.picBand, .5, {x: self.picBand.x - 2100});

        setTimeout(() => {
          self.goNextComing.call(self)
        }, 500)
      }, 100)

    }
  }

  goNextComing() {
    const self = this;
    self.gameLevel++;
    self.vueInstance.$emit('changeGameLevel', self.gameLevel)
    let rightOffset = 2100;

    self.picBand.x = 0;
    self.picBand.y = 450;

    self.picBand.questionBars.forEach((item, index) => {
      item.getChildAt(0).openDoor();

    });
    self.stopSpeakSound();

    TweenMax.from(self.picBand, 0.5, {
      x: rightOffset, onComplete: () => {
        self.isAnimating = false;
        self.soundSpeakText.text = self.gameConfig.levels[self.gameLevel].content;

        self.soundSpeakText.pivot.y = self.soundSpeakText.height / 2;
        self.soundSpeakText.text = self.gameConfig.levels[self.gameLevel].content;
        self.soundSpeakText.y = 290;

        self.playSpeakSound();

        self.checksTiGan.call(self);


      }, onStart: () => {
        self.picBand.setPages(self.gameConfig.levels[self.gameLevel].cardlist.length, self.gameConfig.levels[self.gameLevel].cardlist)
      }
    });
    self.picBand.questionBars.forEach((item, index) => {
      item.getChildAt(0).openDoor();
      item.getChildAt(0).highlighter.alpha = 0;


    })
    self.picBand.setPicture(self.resources[this.gameConfig.levels[self.gameLevel].cardpicture].texture);


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
      this.soundSpeakText.x = 620;
      this.soundButton.x = 870;
      this.soundSpeakText.style.align = 'left'
      this.soundSpeakText.pivot.x = 0;

    } else {
      this.soundButton.alpha = 1;
      this.soundSpeakText.alpha = 1;
      this.soundSpeakText.x = 620;
      this.soundButton.x = 410;
      this.soundSpeakText.style.align = 'left'
      this.soundSpeakText.pivot.x = 0;
    }
  };


  goBackComing() {
    const self = this;
    if (self.isAnimating) return;
    if (self.gameLevel == 0) return;
    self.gameLevel--;
    self.vueInstance.$emit('changeGameLevel', self.gameLevel);

    self.progressBar.progress = self.gameLevel;
    let rightOffset = 2100;

    self.stopSpeakSound();

    TweenMax.to(self.picBand, 0.5, {
      x: self.picBand.x + rightOffset, onStart: () => {
        self.isAnimating = true;
        self.soundSpeakText.text = self.gameConfig.levels[self.gameLevel].content;
        self.soundSpeakText.pivot.y = self.soundSpeakText.height / 2;
        self.soundSpeakText.text = self.gameConfig.levels[self.gameLevel].content;
        self.soundSpeakText.y = 290;
        self.checksTiGan.call(self);


        self.picBand.setPages(self.gameConfig.levels[self.gameLevel].cardlist.length, self.gameConfig.levels[self.gameLevel].cardlist)


      }
    });
    setTimeout(() => {
      let rightOffset = 1900;

      self.picBand.x = 0;
      self.picBand.y = 450;

      TweenMax.from(self.picBand, 0.5, {
        x: 150 - rightOffset, onComplete: () => {
          self.isAnimating = false;
          self.playSpeakSound();

        }
      });


      self.picBand.questionBars.forEach((item, index) => {
        item.getChildAt(0).openDoor();
        item.getChildAt(0).highlighter.alpha = 0;
        // item.getChildAt(0).setText(self.gameConfig.levels[self.gameLevel].cardlist[index])


      })
      self.picBand.setPicture(self.resources[this.gameConfig.levels[self.gameLevel].cardpicture].texture);


    }, 500);


  }

  //TODO:ROOT_MAIN主程序
  addedToStage() {
    const self = this;

    var gameBg = new PIXI.Sprite(PIXI.loader.resources['practicebg_jpg'].texture);
    this.addChild(gameBg)
    this.progressBar = new ProgressBar();
    self.picBand = new PicCard();
    function setRightAnswers() {
      let rightArr = [];
      self.gameConfig.levels.forEach((item) => {
        rightArr.push(item.rightAnswer)
      })
      self.rightAnswersArr = rightArr;
    };
    setRightAnswers();


    self.picBand.setBarsClickEvent((index) => {

      if (self.gameLevel == 0) {
        self.progressBar.showProgressBall()
      }

      self.rightCheck(index);
    });

    let picBandMask = new PIXI.Graphics();
    picBandMask.beginFill(0xff0000,.5);
    picBandMask.drawRect(0,450,1920,527);
    picBandMask.endFill();



    this.addChild(self.picBand);
    this.addChild(picBandMask);
    self.picBand.mask = picBandMask;
    self.picBand.setPages(self.gameConfig.levels[self.gameLevel].cardlist.length, self.gameConfig.levels[self.gameLevel].cardlist)
    // self.picBand.questionBars.forEach((item, index) => {
    //   item.getChildAt(0).setText(this.gameConfig.levels[self.gameLevel].cardlist[index])
    // }); //setTextArr()

    self.picBand.setPicture(self.resources[self.gameConfig.levels[self.gameLevel].cardpicture].texture);

    self.picBand.x = 0;

    self.picBand.y = 450;

    self.addChild(self.progressBar);

    self.progressBar.setBar({width: 1000 / this.gameConfig.levels.length, points: this.gameConfig.levels.length - 1})


    self.progressBar.y = 1300;
    self.progressBar.x = 1920 / 2
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
    self.soundButton.on('pointerdown', self.soundButtonTap, self);
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

    //核心判断垂直逻辑
    if(self.soundSpeakText.height>70){
      self.soundSpeakText.y = 260
    }else{
      self.soundSpeakText.y = 290
    }

    // self.soundSpeakText.width = 200;

    self.soundSpeakText.x = 620;
    self.soundSpeakText.y = 290;

    //TODO:顶部导航逻辑-----
    GameMenuBars.freeze = false;
    GameMenuBars.instancement = null;
    self.gameMenuBar = new GameMenuBars();


    self.addChild(self.gameMenuBar)
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
      self.gameMenuBar.energy = newval;
      self.gameMenuBar.playStars();
    });
    this.gameMenuBar.energyOnce = self.vueInstance.energyCurrentNum;

    self.vueInstance.$watch(()=>{
      return self.vueInstance.currentGameLevel
    },(newval)=>{
      if (newval > 0) {
        self.gameMenuBar.homeBtnShow = true;
        self.gameMenuBar.backBtnShow = true;
        self.gameMenuBar.updateGameMenu();

      } else {
        self.gameMenuBar.homeBtnShow = true;
        self.gameMenuBar.backBtnShow = false;
        self.gameMenuBar.updateGameMenu();
      }
    });

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
      let soundName =  'choicetextmodule_'+self.gameConfig.levels[self.gameLevel].audioSrc.match(/sound[0-9]+/g);


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

  destroyed() {
    if (this.gameAudio) {
      this.gameAudio.stop();
    }
    if(pixiScene){
      pixiScene.gameMenuBar.clearGameMenuEvents();
      pixiScene.destroy();
     // pixiScene = null;
    }
  }
};



class TextCard extends PIXI.Container {
  constructor() {
    super();
    this.lowerDoor = null;
    this.upponDoor = null;
    this.myText = null;
    this.strContent = 'aaaS';
    this.highlighter = null;
    this.cardType = 3;
    this.on('added', this.added_handler, this);
  }
  setText(mycontent) {
    if (this.myText) {
      this.myText.text = mycontent;
      // this.strContent = mycontent;
    }
    this.strContent = mycontent;
  }
  //设置类型,2为两个，3为三个;
  setCardType($num = 3) {
    this.cardType = $num;
  }
  added_handler() {
    let question = new PIXI.Sprite(PIXI.Texture.from('textchoose_normal_png'));


     question.scale.y = 1.8;


    this.addChild(question);
    this.myText = this._createText();


    if (this.cardType == 2) {
      this.lowerDoor = new PIXI.Sprite(PIXI.Texture.from('textchoose2_close1_png'));
      this.upponDoor = new PIXI.Sprite(PIXI.Texture.from('textchoose2_close2_png'));
      this.myText.x = 40;
      this.myText.y = 68;
    } else if (this.cardType == 3) {
      this.lowerDoor = new PIXI.Sprite(PIXI.Texture.from('textchoose1_close1_png'));
      this.upponDoor = new PIXI.Sprite(PIXI.Texture.from('textchoose1_close2_png'));
      this.myText.x = 40;
      this.myText.y = 38;
    }
    this.upponDoor.y = 0;
    this.lowerDoor.y = 0;
    this.upponDoor.alpha = 1;
    this.highlighter = new PIXI.Sprite(PIXI.Texture.from('textchoose_select_png'));
    this.highlighter.y = 0;
    this.highlighter.x = -3;
    this.highlighter.scale.y = 1.8;
    this.highlighter.scale.x = 1;
    this.highlighter.alpha = 0;
    //
    this.addChild(this.highlighter);

    this.myText.text = this.strContent;
    this.addChild(this.myText);
    this.addChild(this.lowerDoor);
    this.addChild(this.upponDoor);

  }

  _createText() {
    let text = new PIXI.Text('aaa', {fontFamily: 'Microsoft YaHei', fontSize: 45, fill: 0xffffff, align: 'left'});
    return text;
  }

  closeDoor() {
    if (this.cardType == 3) {
      TweenMax.to(this.lowerDoor, .5, {y: 21});
      TweenMax.to(this.upponDoor, .5, {y: 21})
    } else if (this.cardType == 2) {

      TweenMax.to(this.lowerDoor, .5, {y: 20});
      TweenMax.to(this.upponDoor, .5, {y: 20});
    }
  };
  openDoor() {
    if (this.cardType == 3) {
      this.upponDoor.y = -40;
      this.lowerDoor.y = 105;
      this.upponDoor.x = -15;
      this.lowerDoor.x = -15;
    } else if (this.cardType == 2) {
      this.upponDoor.y = -60;
      this.lowerDoor.y = 100;
      this.upponDoor.x = 0;
      this.lowerDoor.x = 0;
    }
  }
  wrrongClicked($callback) {

    let tl = new TimelineMax({
      repeat: 3,
      yoyo: true,
      onComplete: function () {
        $callback()
      }
    });
    if (this.cardType == 3) {
      tl.add([TweenMax.to(this.lowerDoor, .2, {y: 18}),
        TweenMax.to(this.upponDoor, .2, {y: 19})]);


    } else if (this.cardType == 2) {
      tl.add([TweenMax.to(this.lowerDoor, .2, {y: 20}),
        TweenMax.to(this.upponDoor, .2, {y: 20})]);
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

    this.pages = 2;//几道题；

    this.leftDoor = null;
    this.rightDoor = null;


    this.picBand = null;

    this.questionBars = [];
    this.hightligtBars = [];//高光部分
    this.questionTextInfoArr = ['v', 'd'];//每道题文字信息;str
    this.barsClickEmit = null;
  }

  setBarsClickEvent(_callback) {
    this.barsClickEmit = _callback;
  }

  showCards($length) {

  }
  //TODO:setPages
  setPages($pageNum, $textInfo = ['1', '2', '3']) {
    const self = this;
    this.pages = $pageNum;

    function createQuestionCtn($num = 120) {
      const self = this;
      if (self.questionBars.length > 0) {
        self.questionBars.forEach((item) => {
          item.parent.removeChild(item)
        });
        self.questionBars = [];
      }
      for (let i = 0; i < self.pages; i++) {

        let questionCtn = new PIXI.Container();
        let question = new TextCard();

        question.setCardType($pageNum);
        question.setText($textInfo[i]);
        let mask = new PIXI.Graphics();
        mask.beginFill(0xff0000);
        mask.drawRect(0, -50, 800, $num);
        mask.endFill();
        questionCtn.addChild(question)
        questionCtn.addChild(mask);

        question.mask = mask;
        question.openDoor();

        questionCtn.interactive = true;
        if (this.questionBars && this.innerContainer) {
          this.questionBars.push(questionCtn);
          this.innerContainer.addChild(questionCtn);
        }
        questionCtn.on('pointerdown', self.barsClickEmit.bind(self, i), self)

      }
      ;
    }



    if (self.pages == 2 && self.picBand) {
      createQuestionCtn.call(self, 380);
      this.picBand.texture = PIXI.Texture.from('textchoose2_back_png')
      self.questionBars[0].x = 1133;
      self.questionBars[0].y = 45;
      self.questionBars[1].x = self.questionBars[0].x + 38;
      self.questionBars[1].y = self.questionBars[0].y + 250;
    } else if (self.pages == 3 && self.picBand) {
      createQuestionCtn.call(self, 200);
      this.picBand.texture = PIXI.Texture.from('textchoose1_back_png')
      self.questionBars[0].x = 1130;
      self.questionBars[0].y = 35;
      self.questionBars[1].x = self.questionBars[0].x + 38;
      self.questionBars[1].y = self.questionBars[0].y + 164;
      self.questionBars[2].x = self.questionBars[1].x + 16;
      self.questionBars[2].y = self.questionBars[1].y + 170;
    }
  }

  added_handler() {
    const self = this;
    this.picBand = new PIXI.Sprite();
    this.innerContainer = new PIXI.Container();

    let bigPicMasker = new PIXI.Graphics();
    bigPicMasker.beginFill(0xff0000);
    bigPicMasker.drawRect(0, 0, 800, 480);
    bigPicMasker.endFill();
    bigPicMasker.x = 150;
    bigPicMasker.y = 22;

    this.innerPic_sprite = new PIXI.Sprite();
    this.innerContainer.addChild(this.innerPic_sprite);
    this.innerPic_sprite.x = 120;
    this.innerPic_sprite.mask = bigPicMasker;
    this.innerContainer.addChild(bigPicMasker)

    this.addChild(this.innerContainer)

    this.addChild(this.picBand);

  }

  setTextArr($textInfo = []) {
    this.questionTextInfoArr = $textInfo;
  }

  setPicture($texture) {
    this.innerPic_sprite.texture = $texture;
    this.innerPic_sprite.pivot.x = 0;
    this.innerPic_sprite.pivot.y = 0;


  }


}

export default ChoiceTextModule;
