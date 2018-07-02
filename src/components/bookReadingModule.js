import ProgressBar from './gameui/Progressbar.js'
import {pixiAnimation} from './EasyPIXI.js'
import {checkForJumpRoute, Debugs} from './Utils.js'
import {LoadingAnimation} from './gameui/GameManager.js'
import {Back, TweenMax} from "gsap";
import GameMenuBars from "./gameui/GameMenuBar";
import PixiHammer from './gameui/PixiHammer.js'
import {PIXIAudio} from "./EasyPIXI";


class GestureManager {
  constructor() {
    this.hitArea = null;
    this.startDrag = false;
    this.touchesPos = [];
    this.intervalTimer = null;
    this.touchTimes = 0;


    this.touchToLeft = function () {

    }
    this.touchToRight = function () {

    }
  }

  swiperTouch() {
    if (!this.hitArea) return;
    this.hitArea.on('pointerdown', this.touchStartHandler.bind(this));
    this.hitArea.on('pointermove', this.touchMovingHandler.bind(this));
    this.hitArea.on('pointerup', this.touchUpHandler.bind(this))
    this.hitArea.on('pointerupoutside', this.touchUpHandler.bind(this))

  }

  touchUpHandler(event) {
    this.startDrag = false;

    if (this.intervalTimer) {
      clearInterval(this.intervalTimer)
    }


    if (this.touchTimes <= 80 && this.touchesPos.length > 2) {
      if (this.touchesPos[this.touchesPos.length - 1] > this.touchesPos[this.touchesPos.length - 2]) {
        this.touchToRight();
      } else {
        this.touchToLeft();
      }

    }

    this.touchTimes = 0;
    this.touchesPos = [];

  }

  touchMovingHandler(event) {

    if (this.startDrag) {
      if (this.touchesPos.length > 3) {
        this.touchesPos.shift()
      }

      this.touchesPos.push(event.data.global.x)
    }
    ;

  }

  touchStartHandler(event) {
    const self = this;
    this.startDrag = true;
    this.intervalTimer = setInterval(() => {
      self.touchTimes++;
    }, 10)
  }
}

class BookReadingModule extends PIXI.Container {
  constructor($options) {
    super();
    this.gameConfig = $options.json;
    this.resources = PIXI.loader.resources;
    this.vueInstance = $options.vueInstance;
    ///
    this.book = null;
    this.pageturn = null;
    this.pageturn2 = null;

    this.leftBtn = null;
    this.rightBtn = null;
    this.pageMaskUpper = null;
    this.pageMaskDown = null;
    this.pageUpper = null;
    this.pageDown = null;
    this.currentPage = 0;

    this.turnAnimating = false;
    this.boySpine = null;
    this.boyCanClicked = false;
    this.boyIsShownTimes = 0;
    //声音;
    this.gameAudio = null;
    //封面;
    this.coverPageTl = null;
    this.coverPageTl_reserve = null;
    this.isCoverPageTime = true;//当前是封面的时候;
    this.isCoverPageTime_reserve = false;
    this.myAn_pageTurns = null;

    this.gameMenuBar = null;
    this.currentAudioPlaying = false;



    this.on('added', this.addedToStage, this)
  }


  addedToStage() {
    const self = this;
    var gameBg = new PIXI.Sprite(PIXI.loader.resources['backbg_jpg'].texture);
    this.addChild(gameBg)


    setTimeout(()=>{
      self.playAudios();
    },300)


    this.interactive = true;

    this.pageUpper  = new PIXI.Sprite(PIXI.Texture.from(this.gameConfig.levels[0].picture))
    this.pageDown = new PIXI.Sprite(PIXI.Texture.from(this.gameConfig.levels[1].picture))
    var book = new PIXI.Sprite(PIXI.Texture.from('mybooks_png'));


    book.pivot.x = book.width / 2;
    book.pivot.y = book.height / 2;
    book.x = 1920 / 2;
    book.y = 610;


    var bookmask = new PIXI.Sprite(PIXI.Texture.from('mybooks_png'))

    this.book = book;
    bookmask.pivot.x = bookmask.width / 2;
    bookmask.pivot.y = bookmask.height / 2;
    bookmask.x = 1920 / 2;
    bookmask.y = 610;

    var bookMaskGraphic = new PIXI.Graphics();
    bookMaskGraphic.beginFill(0x00ff00);
    bookMaskGraphic.drawRect(10, -75, bookmask.width + 20, bookmask.height + 65);
    bookMaskGraphic.endFill();
    bookMaskGraphic.x = 220;
    bookMaskGraphic.y = 215;
    this.addChild(bookMaskGraphic);
    bookmask.mask = bookMaskGraphic;

    this.leftBtn = new PIXI.Sprite(PIXI.Texture.from('leftbtn_png'));
    this.rightBtn = new PIXI.Sprite(PIXI.Texture.from('rightbtn_png'));
    this.leftBtn.x = 50;
    this.leftBtn.y = 870;
    this.rightBtn.x = 1780;
    this.rightBtn.y = 870;
    this.leftBtn.interactive = this.rightBtn.interactive = true;
    var pageturnArr = ['pageturn1.png', 'pageturn3.png'];
    this.myAn_pageTurns = new pixiAnimation('pageturns_atlas');
    this.pageturn = this.myAn_pageTurns.create();
    this.pageturn.animationSpeed = 0.08;
    this.pageturn.play();

    //创建封面;
    function createCoverPage($fromHead=true) {
      const self = this;
      let coverPageCtn = new PIXI.Container();

      let coverPage = new PIXI.Sprite(PIXI.loader.resources['pagefengmian'].texture);

      var tl = new TimelineMax({
        onComplete: () => {
          //coverPageCtn.alpha = 0;
         // self.isCoverPageTime = false;
        //  self.playAudios()

        }
      });

      let allTime = 1;

      if($fromHead){
        coverPage.x = 0;
        coverPage.y = 0;
        coverPage.pivot.x = 0;
        coverPage.pivot.y = coverPage.height / 2;
        coverPageCtn.addChild(coverPage);
        coverPageCtn.pivot.x = 0;
        coverPageCtn.x = 200-7;
        coverPageCtn.y = 600+4;
        tl.add([TweenMax.to(coverPageCtn.skew, allTime, {y: -3.16,onStart:function(){
            coverPage.texture = PIXI.Texture.from('pagefengmian');
            self.isCoverPageTime = false;
            self.isCoverPageTime_reserve = true;
            self.playAudios()
          }}), TweenMax.to(coverPage, allTime*0.28, {
          width: coverPage.width * 0.5, onComplete: function () {

            TweenMax.to(coverPage, allTime*0.1, {width: coverPage.width * 1});
            coverPage.texture = PIXI.Texture.from('pagebeimian')
          },onStart:function(){
            coverPage.texture = PIXI.Texture.from('pagefengmian')
          }
        })]);
        tl.add(TweenMax.to(coverPageCtn,allTime*0.3,{alpha:0,onComplete:function(){
            coverPage.texture = PIXI.Texture.from('pagebeimian')
            self.isCoverPageTime = false;

          }}),'-=.4');
      }else{
        coverPage.x = 0;
        coverPage.y = 0;
        coverPage.pivot.x = 0;
        coverPage.pivot.y = coverPage.height / 2;
        coverPageCtn.addChild(coverPage);
        coverPageCtn.pivot.x = 0;
        coverPageCtn.x = 200-7;
        coverPageCtn.y = 600+4;
        coverPageCtn.alpha =0;
       // coverPageCtn.alpha = 0;
         tl.add( TweenMax.to(coverPageCtn,allTime*0.4,{alpha:1}));
        tl.add([
          TweenMax.from(coverPageCtn.skew, allTime, {y: -3.16,onStart:function(){
            coverPage.texture = PIXI.Texture.from('pagebeimian');
            self.isCoverPageTime_reserve = false;
              self.isCoverPageTime = true;
              self.playAudios()
          },onComplete:function(){

          }}),
          TweenMax.from(coverPage, allTime*0.28, {
          width: coverPage.width * 0.5, onComplete: function () {
            TweenMax.to(coverPage, allTime*0.1, {width: coverPage.width * 1});
            coverPage.texture = PIXI.Texture.from('pagefengmian');
          },onStart:function(){
            coverPage.texture = PIXI.Texture.from('pagebeimian')
          }
        },
        )
        ],'-=0.469');




      }

      tl.stop();

      this.addChild(coverPageCtn);
      return {
        tl:tl,
        coverPage:coverPageCtn
      };
    }


    var pageturn2 = new PIXI.Sprite(PIXI.loader.resources['pageturn2_png'].texture);

    this.pageturn.pivot.x = this.pageturn.width;
    pageturn2.pivot.x = pageturn2.width;
    this.pageturn.y = 490;

    this.pageturn.x = this.book.width - 24.5;
    pageturn2.x = this.pageturn.x + 20;

    this.pageturn2 = pageturn2;

    pageturn2.y = -62;
    // this.pageturn2.x = 0;

    this.addChild(book)
    this.addChild(bookmask);

    if(this.gameConfig.showCoverpage){
       this.coverPageTl = createCoverPage.call(self,true);
       this.coverPageTl_reserve = createCoverPage.call(self,false);
    }


    //reversement.play();

    // bookmask.addChild(page1);

    this.pageMaskUpper = new PIXI.Graphics();
    this.pageMaskUpper.beginFill(0xff0000);
    this.pageMaskUpper.drawRect(0, 0, book.width, book.height);
    this.pageMaskUpper.endFill();
    this.pageMaskUpper.pivot.x = this.pageMaskUpper.width;
    this.pageMaskUpper.x = 0;

    this.pageMaskDown = this.pageMaskUpper.clone();
    this.pageMaskDown.pivot.x = this.pageMaskDown.width;
    this.pageMaskDown.x = this.book.width - 28 - 80;//初始化下层遮罩位置;
    bookmask.addChild(this.pageMaskDown)
    bookmask.addChild(this.pageMaskUpper)
    //bookmask.addChild(page0);
    this.pageDown.pivot.x = this.pageDown.width / 2;
    this.pageDown.pivot.y = this.pageDown.height / 2;
    this.pageDown.x = 1920 / 2 - 160+12;
    this.pageDown.y = 1080 / 2 - 160+12;

    var page0Ctn = new PIXI.Graphics();
    page0Ctn.beginFill(0xfff7dc, 1);//0xfff7dc
    page0Ctn.drawRect(100, 25, book.width - 160, book.height - 60);
    page0Ctn.endFill();
    var page1Ctn = page0Ctn.clone();
    page0Ctn.addChild(this.pageUpper);
    page1Ctn.addChild(this.pageDown);


    bookmask.addChild(page1Ctn)
    bookmask.addChild(page0Ctn);
    this.pageUpper.pivot.x = this.pageUpper.width / 2;
    this.pageUpper.pivot.y = this.pageUpper.height / 2;
    this.pageUpper.x = 1920 / 2 - 160+12;
    this.pageUpper.y = 1080 / 2 - 160+12;
    //
    page0Ctn.mask = this.pageMaskUpper;
    page1Ctn.mask = this.pageMaskDown;
    bookmask.addChild(this.pageturn)
    bookmask.addChild(pageturn2)

    this.addChild(this.leftBtn);
    this.addChild(this.rightBtn)
    this.leftBtn.alpha = 0;
    self.pageturn.alpha = 1;
    self.pageturn2.alpha = 0;
    this.leftBtn.on('pointerdown', this.turnPrev.bind(this, .5));
    this.rightBtn.on('pointerdown', this.turnNext.bind(this, .5));
    var swiperHammer = new PixiHammer({
      swiperContainer: self,
      swiperArea: {x: 200, width: 1920-200, y: 100, height: 1000}
    });
    swiperHammer.setMoveLeftCallBack(function () {
      self.turnNext.call(self, .5)
    });
    swiperHammer.setMoveRightCallBack(() => {

      self.turnPrev.call(self, .5)
    });


    this.pageDown.texture = PIXI.Texture.from(this.gameConfig.levels[this.currentPage].picture);
    var boyData = self.resources['boyskeleton'].spineData;
    this.boySpine = new PIXI.spine.Spine(boyData);

    this.boySpine.scale.x = this.boySpine.scale.y = 0.55;
    this.boySpine.x = 1920 + this.boySpine.width + 200;
    this.boySpine.y = 1080 / 2 + 150;
    this.boySpine.skeleton.setSkinByName('boy3');
    this.boySpine.skeleton.setSlotsToSetupPose();
    this.boySpine.state.setAnimation(0, 'next', true);
    this.boySpine.alpha = 1;
    this.boySpine.interactive = true;
    this.boySpine.on('pointerdown', () => {
      if (self.boyCanClicked) {
        //开始设置清算界面逻辑全套;
        self.vueInstance.$route.meta.completed = 1;
        self.vueInstance.setOwnLessonComplete();
        if(self.gameAudio){
          self.stopAudios();
        }

        //开始清算。。
        if (self.vueInstance.gameHasBeenCompleted == false) {
          window.parent.postMessage({
            type: "stepSubmit",
            page: self.vueInstance.lessonCurrentPageIndex

          }, "*");
        }
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
            if(self.vueInstance.gameHasBeenCompleted && !self.vueInstance.alreadyHasOneCard){
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

      }
    })
    self.addChild(this.boySpine);


    //TODO:顶部导航逻辑-----
    GameMenuBars.freeze = false;
    GameMenuBars.instancement = null;
    self.gameMenuBar = new GameMenuBars();

    self.addChild(self.gameMenuBar)
    self.gameMenuBar.setBackBtn_tapHandler(()=>{

      self.turnPrev(.5);
    });
    self.gameMenuBar.setHomeBtn_tapHandler(()=>{
      self.gotoHome();
    })

  //播放声音;

    //控制声音;
    self.gameMenuBar.setSoundBtn_tapHandler((evt) => {
      //evt.currentTarget.play()
      if (evt.currentTarget.status == 'playing') {
        self.stopAudios.call(self)
      } else {
        self.playAudios.call(self)
      }
    });

    self.gameMenuBar.backBtnShow = false;
    self.gameMenuBar.homeBtnShow = true;
    self.gameMenuBar.bookBtnShow =false;
    self.gameMenuBar.soundBtnShow =true;
    self.gameMenuBar.updateGameMenu();
    self.vueInstance.$watch(()=>{
      return self.vueInstance.energyCurrentNum
    },(newval)=>{
      self.gameMenuBar.energy = newval;
    });



    if(self.gameConfig.showCoverpage){
      self.vueInstance.$watch(()=>{
        return self.vueInstance.currentGameLevel
      },(newval)=>{


        if (newval >=0) {

          self.gameMenuBar.backBtnShow = true;
          self.gameMenuBar.homeBtnShow = true;
          self.gameMenuBar.updateGameMenu();

        } else {
          self.gameMenuBar.backBtnShow = false;
          self.gameMenuBar.homeBtnShow = true;
          self.gameMenuBar.updateGameMenu();
        }
      });
    }else{
      self.vueInstance.$watch(()=>{
        return self.vueInstance.currentGameLevel
      },(newval)=>{


        if (newval >0) {

          self.gameMenuBar.backBtnShow = true;
          self.gameMenuBar.homeBtnShow = true;
          self.gameMenuBar.updateGameMenu();

        } else {
          self.gameMenuBar.backBtnShow = false;
          self.gameMenuBar.homeBtnShow = true;
          self.gameMenuBar.updateGameMenu();
        }
      });
    }



    this.gameMenuBar.energyOnce = self.vueInstance.energyCurrentNum;

    //顶部导航逻辑END


  };
  destroyed() {
    if (this.gameAudio) {
      this.gameAudio.stop();
      this.gameAudio = null;
      this.boySpine = null;
    }
    if(this.gameMenuBar){
      this.gameMenuBar.clearGameMenuEvents();
      this.gameMenuBar.destroy();
    }
  }
  hideBoy() {
    const self = this;
    if (this.boySpine) {
      TweenMax.to(this.boySpine, 0.8, {
        x: 2500, ease: Back.easeInOut, alpha: 0, onStart: function () {
          self.boyCanClicked = false;
        }
      })
    }
  }

  showBoy() {
    const self = this;

    if (this.boySpine) {
      this.boySpine.alpha = 1;
      this.boySpine.x = 1800

      TweenMax.to(this.boySpine, 0, {x: 2500})
      TweenMax.to(this.boySpine, 0.8, {
        x: 1910, ease: Back.easeInOut, onComplete: function () {
          self.boyCanClicked = true;
        }
      })
    }
    ;
    let sound = new Audio('static/sound/nextpart.mp3');
    sound.play();

  }

  gameTryAgain() {
    this.currentPage = 1;
    this.turnPrev(0);
    this.playAudios();

  }


  //Audios======

  //音频控制;
  playAudios($num=null) {
    const self = this;
    self.stopAudios()

    let myIndex = $num || this.currentPage;
    let soundName;
    if(this.gameConfig.showCoverpage==true  && this.isCoverPageTime && _.trim(this.gameConfig.coverpageAudio)!=''){
      soundName = this.vueInstance.$route.meta.assetsUrl+'_'+this.gameConfig.coverpageAudio.replace(/\./g,'_');
    }else{
      soundName = this.vueInstance.$route.meta.assetsUrl+'_'+this.gameConfig.levels[myIndex].audioSrc.replace(/\./g,'_');
    }
    //console.log(_.trim(this.gameConfig.levels[myIndex].audioSrc),'<=audio');
    if((this.gameConfig.levels[myIndex].audioSrc && _.trim(this.gameConfig.levels[myIndex].audioSrc)!='') ||
      (this.gameConfig.showCoverpage==true &&  this.isCoverPageTime && _.trim(this.gameConfig.coverpageAudio)!='')){
      this.gameAudio = PIXIAudio.audios[soundName];
      this.gameAudio.play();
      this.gameAudio.position = 0;

      let soundTime =this.gameAudio.duration;
      self.gameAudio.on('complete',()=>{
        if(self.gameMenuBar.soundBtn){
          self.gameMenuBar.soundBtn.stop();
        }
        //self.currentAudioPlaying = false;
      })

      if(this.gameMenuBar.soundBtn){
        this.gameMenuBar.soundBtn.play();
      }

     // this.currentAudioPlaying = true;
      this.gameMenuBar.soundBtnShow = true;
      this.gameMenuBar.updateGameMenu();
    }else{
      this.gameMenuBar.soundBtnShow = false;
      this.gameMenuBar.updateGameMenu();
    }


  }

  stopAudios() {

    if(this.gameAudio){
      this.gameAudio.stop();
      //this.currentAudioPlaying = false;
      if(this.gameMenuBar.soundBtn){
        this.gameMenuBar.soundBtn.stop();
      }


    }

  }



  //End Audios====

  //End....
  gotoHome() {
    const self = this;

    if (this.vueInstance.$route.meta.completed == 0) {
      this.vueInstance.popupType = 'shutback';
      this.vueInstance.showCongra = true;
    } else {

      setTimeout(() => {
        self.vueInstance.$router.push('/index/')
      }, 1000);
      LoadingAnimation.setMaskShow(true);

      let arr = self.vueInstance.$route.fullPath.split('/');
      let index = self.vueInstance.allPartNames.indexOf(arr[2]);
      self.vueInstance.SET_INDEXPAGEINITIALSLIDE(Number(index));


    }
  }

  turnNext($time = 5) {
    const self = this;
    if(this.isCoverPageTime && this.gameConfig.showCoverpage){
      this.coverPageTl.tl.restart();
      this.coverPageTl.coverPage.alpha = 1;
      this.coverPageTl_reserve.coverPage.alpha = 0;
      this.leftBtn.alpha = 1;

      if(this.gameConfig.showCoverpage){
        self.gameMenuBar.backBtnShow = true;
        self.gameMenuBar.updateGameMenu();
      }

      return;
    };
    if (this.currentPage >= this.gameConfig.levels.length - 2) {
      self.rightBtn.alpha = 0;

      if (self.boyIsShownTimes == 0) {
        self.showBoy();
        self.vueInstance.currentLessonCompleted = true;
      }
      self.boyIsShownTimes++;

    }

      if (this.currentPage >=0) {
        self.leftBtn.alpha = 1;
      }
    if (this.currentPage >= this.gameConfig.levels.length - 1) {

      return;
    }

    if (this.turnAnimating) return;
    this.turnAnimating = true;
    this.currentPage++;
    self.pageturn.alpha = 0;
    self.pageturn.gotoAndStop(0);

    var initPage2X = this.book.width - 140;
    TweenMax.to(this.pageturn2, 0, {x: initPage2X});
    TweenMax.to(this.pageMaskUpper, 0, {x: this.book.width - 160});
    TweenMax.to(this.pageturn2, $time, {
      x: 380, onStart: function () {
        self.pageturn2.alpha = 1;

      }
    });


    TweenMax.to(this.pageMaskUpper, $time, {
      x: 246, onComplete: function () {
        self.pageturn2.alpha = 0;
        if( self.vueInstance.currentLessonCompleted == true){
          self.pageturn.alpha = 0;
        }else{
          self.pageturn.alpha = 1;
        }


        self.turnAnimating = false;
        self.pageMaskUpper.x = 126;
        self.playAudios();
        self.pageturn.play();
      }
    });

    this.pageUpper.texture = PIXI.Texture.from(this.gameConfig.levels[this.currentPage - 1].picture)
    this.pageDown.texture = PIXI.Texture.from(this.gameConfig.levels[this.currentPage].picture);


    self.vueInstance.$emit('changeGameLevel', self.currentPage);

    self.stopAudios();
  }

  turnPrev($time = 5) {
    const self = this;
    if (this.currentPage <= this.gameConfig.levels.length - 1) {
      self.rightBtn.alpha = 1;
      self.hideBoy();
      self.pageturn.alpha = 1;
    }
    if(this.gameConfig.showCoverpage){
      if (this.currentPage == 0) {
        self.leftBtn.alpha = 0;
        // self.gameMenuBar.backBtnShow = false;
        // self.gameMenuBar.updateGameMenu();
        self.gameMenuBar.backBtnShow = true;
        self.gameMenuBar.updateGameMenu();
      }
    }else{
      if (this.currentPage == 1) {
        self.leftBtn.alpha = 0;
        self.gameMenuBar.backBtnShow = true;
        self.gameMenuBar.updateGameMenu();

      }
    }

    if (this.currentPage <= 0 ) {

      if(this.isCoverPageTime_reserve && this.gameConfig.showCoverpage){
        this.coverPageTl_reserve.tl.restart();
        this.isCoverPageTime = true;
        this.coverPageTl.coverPage.alpha = 0;

        if(this.gameConfig.showCoverpage){
          self.gameMenuBar.backBtnShow = false;
          self.gameMenuBar.updateGameMenu();
        }
      };

      return;
    };
    if (this.turnAnimating) return;
    this.turnAnimating = true;
    this.currentPage--;
    var initPage2X = this.book.width - 140;
    self.pageturn2.alpha = 1;
    self.pageturn.alpha = 0;
    self.pageturn.gotoAndStop(0)

    this.pageMaskUpper.x = 250;
    TweenMax.to(this.pageturn2, 0, {
      x: 360, onStart: function () {
        self.pageturn2.alpha = 1;

      }
    });

    TweenMax.to(this.pageturn2, $time, {
      x: initPage2X, onComplete: function () {
        self.pageturn2.alpha = 0;

        self.pageturn.alpha = 1;
        self.pageturn.play();

      }
    });
    TweenMax.to(self.pageMaskUpper, $time, {
      x: initPage2X - 50, onComplete: function () {
        self.pageMaskUpper.x = initPage2X - 50 + 180;
        self.turnAnimating = false;
        self.playAudios();
      }
    });

    this.pageUpper.texture = PIXI.Texture.from(this.gameConfig.levels[this.currentPage].picture)
    this.pageDown.texture = PIXI.Texture.from(this.gameConfig.levels[this.currentPage + 1].picture);
    self.vueInstance.$emit('changeGameLevel', self.currentPage);
    self.boyIsShownTimes = 0;

    self.stopAudios();
  }
}

export default BookReadingModule;
