import GameMenuBars from "./gameui/GameMenuBar";

import FormatDate from "dateformat";

import {Debugs} from "./Utils";

var gameMenuBar = null;

class MovieModulePure extends PIXI.Container {
  constructor($option) {
    super();

    this.vueInstance = $option.vueInstance;
    this.myVideo = null;

    this.headBtnIsDown = false;//娃娃头是否点击
    this.progressPercent = 0;
    this.progresslineHitArea = null;
    this.movieBg = null;//背景；
    this.hideProgressTime = 4;//鼠标不触发点击多久后隐藏进度
    this.timeEndSec = 2;
    this.getInterval_hideprogress = null;//间隔回调，点击隐藏进度,
    this.progressIsHide = false;//初始化当前进度条是隐藏状态,
    this.currentModeStatus = 0; //当前所在都页面位置，0为准备页面，1为正在观看页面；

    this.videoIsEnd = false;


    this.on('added', this.initial, this);
  }

  initial() {
    const self = this;
    //TODO：添加背景；
    this.movieBg = new PIXI.Sprite(PIXI.loader.resources['moviebg'].texture);
    this.addChild(this.movieBg);
    this.movieBg.scale.x = this.movieBg.scale.y = 1;
    this.movieBg.pivot.x = this.movieBg.width / 2;
    this.movieBg.pivot.y = this.movieBg.height / 2;
    this.movieBg.x = 1920 / 2;
    this.movieBg.y = 1080 / 2;
    //TODO:顶部导航逻辑-----
    //GameMenuBars.freeze = false;
    gameMenuBar = new GameMenuBars();
    self.addChild(gameMenuBar);

    ////
    gameMenuBar.setBackBtn_tapHandler(() => {

      self.changeModeHome();
      setTimeout(() => {
        self.myVideo.pause();
      }, 5);
      self.hideProgressBar();
      gameMenuBar.foldDown()

      self.hideMovieBgAnime();
      self.currentModeStatus = 0;

    });
    gameMenuBar.setHomeBtn_tapHandler(() => {
      if (self.vueInstance.$route.meta.completed == 0) {
        self.vueInstance.popupType = 'shutback';
        self.vueInstance.showCongra = true;
      } else {
        // setTimeout(() => {
        //   self.vueInstance.$router.push('/index/')
        // }, 1000);

        let arr = self.vueInstance.$route.fullPath.split('/');
        let index = self.vueInstance.allPartNames.indexOf(arr[2]);
        self.vueInstance.SET_INDEXPAGEINITIALSLIDE(Number(index));

        self.vueInstance.$router.push('/index/')
      }
    })
    gameMenuBar.backBtnShow = false;
    gameMenuBar.homeBtnShow = true;
    gameMenuBar.bookBtnShow = false;
    gameMenuBar.updateGameMenu();

    self.vueInstance.$watch(() => {
      return self.vueInstance.energyCurrentNum
    }, (newval) => {
      gameMenuBar.energy = newval;
      gameMenuBar.playStars();
    });

    self.vueInstance.$watch(() => {
      return self.vueInstance.currentGameLevel
    }, (newval) => {
      if (newval > 0) {
        gameMenuBar.backBtnShow = true;
        gameMenuBar.homeBtnShow = true;


      } else {
        gameMenuBar.backBtnShow = false;
        gameMenuBar.homeBtnShow = true;

      }
      gameMenuBar.updateGameMenu();

    })

    gameMenuBar.energyOnce = self.vueInstance.energyCurrentNum;
    //顶部导航逻辑END


  }

  toClockTime($second) {
    if (Math.floor($second) == 0) {
      return '00:00';
    } else {
      return FormatDate(Math.floor($second) * 1000, "MM:ss")
    }
  }

  //TODO:当前为播放中
  changeModeBack() {
    const self = this;
    gameMenuBar.homeBtnShow = false;
    gameMenuBar.backBtnShow = true;
    gameMenuBar.updateGameMenu();
    self.vueInstance.$refs.videoPlayBtn.style.opacity = 0;
    self.vueInstance.$refs.videoPlayBtn.style.pointerEvents = 'none';

    self.currentModeStatus = 1;

  }

  //TODO:当前会回到首页等待播放中
  changeModeHome() {
    const self = this;
    gameMenuBar.homeBtnShow = true;
    gameMenuBar.backBtnShow = false;
    gameMenuBar.updateGameMenu();
    self.vueInstance.$refs.videoPlayBtn.style.opacity = 1;
    self.vueInstance.$refs.videoPlayBtn.style.pointerEvents = 'auto';


  }

  initProgressBar() {
    const self = this;

    self.progressBarHeight = 120;//Container黑色区域高度
    self.progresslineBgWidth = 1400;//播放进度条长度
    self.progressBarCtn = new PIXI.Container();//设置进度条的Container；
    self.progressHead = new PIXI.Sprite(PIXI.loader.resources['headbtn_png'].texture);//进度条标头
    self.progressPlayBtn = new PIXI.Sprite();
    self.progressBarBg = new PIXI.Graphics();//进度条背景

    self.progresslineHitArea = null;


    self.videoTimeFormat = self.toClockTime(self.myVideo.currentTime) + " / " + self.toClockTime(self.myVideo.duration);
    self.controlTimes = new PIXI.Text(self.videoTimeFormat, {
      fontFamily: 'Arial',
      fontSize: 32,
      fontWeight: 'bold',
      align: 'center',
      fill: ['#ffffff'], // gradient
      stroke: '#4a1850',
      strokeThickness: 1,
    });


    //设置背景黑色区域
    self.progressBarBg.beginFill(0x000000, 0.6);
    self.progressBarBg.drawRect(0, 0, 1920, self.progressBarHeight);
    self.progressBarBg.endFill();
    //设置播放时间的显示信息 ；
    self.controlTimes.pivot.x = self.controlTimes.width;
    self.controlTimes.pivot.y = self.controlTimes.height / 2;
    self.controlTimes.x = 1920 - 60;
    self.controlTimes.y = self.progressBarHeight / 2;
    //设置Container；

    self.progressBarCtn.y = 1080 - 120;
    //设置播放按钮；
    self.progressPlayBtn.interactive = true;
    self.progressPlayBtn.texture = PIXI.loader.resources['pausebtn_png'].texture;
    self.progressPlayBtn.pivot.y = self.progressPlayBtn.height / 2;
    self.progressPlayBtn.y = self.progressBarHeight / 2;
    self.progressPlayBtn.x = 60;


    //设置进度条；
    self.progressbgline = new PIXI.Graphics();
    //进度条边缘颜色
    switch (GameMenuBars.vueInstance.gameThemeType) {
      case 1:
        self.progressbgline.lineStyle(4, 0xc34a8b)
        break;
      case 2:
        self.progressbgline.lineStyle(4, 0xc6730f)
        break;
      case 3:
        self.progressbgline.lineStyle(4, 0x3da44c)
        break;
      case 4:
        self.progressbgline.lineStyle(4, 0x008bfb)
        break;
      case 5:
        self.progressbgline.lineStyle(4, 0x9758ea)
        break;
      default:
        break;
    }

    self.progressbgline.beginFill(0xd1e0ee);
    self.progressbgline.drawRoundedRect(0, 0, self.progresslineBgWidth, 18, 10);
    self.progressbgline.endFill();
    self.progressbgline.pivot.y = 9;
    self.progressbgline.y = 60;
    self.progressbgline.x = 190;
    self.progressbgline.shadowBox = new PIXI.Graphics();
    self.progressbgline.shadowBox.beginFill(0x000000, 0.5);
    self.progressbgline.shadowBox.drawRoundedRect(0, 0, self.progresslineBgWidth, 18, 9);
    self.progressbgline.shadowBox.endFill();
    self.progressbgline.interactive = true;
    let colorMatrix = new PIXI.filters.BlurFilter();
    colorMatrix.blur = 5;
    self.progressbgline.shadowBox.filters = [colorMatrix];
    self.progressbgline.shadowBox.scale.y = 0.5;


    ////
    self.progressMaskBar = new PIXI.Graphics();
    self.progressMaskBar.beginFill(0xd1e0ee);
    self.progressMaskBar.drawRoundedRect(2, 2, self.progresslineBgWidth - 4, 15, 9);
    self.progressMaskBar.endFill();
    self.progressMaskBar.x = self.progressbgline.x;
    self.progressMaskBar.y = self.progressbgline.y - 9.5;

    self.playedProgressBar = new PIXI.Graphics();

    //进度条内部颜色
    switch (GameMenuBars.vueInstance.gameThemeType) {
      case 1:
        self.playedProgressBar.beginFill(0xe97aba);
        break;
      case 2:
        self.playedProgressBar.beginFill(0xffd659);
        break;
      case 3:
        self.playedProgressBar.beginFill(0x57e26a);
        break;
      case 4:
        self.playedProgressBar.beginFill(0x00b2ff);
        break;
      case 5:
        self.playedProgressBar.beginFill(0xc094f9);
        break;
      default:
        break;
    }

    self.playedProgressBar.drawRect(0, -18, self.progresslineBgWidth, 38);
    self.playedProgressBar.endFill();
    self.playedProgressBar.x = self.progressbgline.x;
    self.playedProgressBar.y = self.progressbgline.y;

    self.playedProgressBar.mask = self.progressMaskBar;
    self.playedProgressBar.width = self.progresslineBgWidth * self.progressPercent;


    //设置娃娃头；
    self.progressHead.x = 190;
    self.progressHead.y = 26;
    self.progressHead.interactive = true;
    self.progresslineHitArea = new PIXI.Rectangle(0, -50, self.progresslineBgWidth, 100);
    self.progressbgline.hitArea = self.progresslineHitArea;
    self.progressBarCtn.addChild(self.progressBarBg)
    self.progressBarCtn.addChild(self.controlTimes);
    self.progressBarCtn.addChild(self.progressPlayBtn)

    self.progressBarCtn.addChild(self.progressMaskBar);


    self.progressBarCtn.addChild(self.progressbgline);
    self.progressBarCtn.addChild(self.playedProgressBar);
    self.progressBarCtn.addChild(self.progressHead);

    this.addChild(self.progressBarCtn);
    self.progressBarCtn.alpha = 0;
    self.progressBarCtn.y = 1080 + 150;
    self.interactive = true;
    self.intervalVideo = setInterval(() => {

      if (self.myVideo && self.myVideo.duration > 3) {
        if (Math.floor(self.myVideo.currentTime) >= Math.floor(self.myVideo.duration) - self.timeEndSec) {
          self.videoIsEnd = true;
          self.againStar.call(self);
          clearInterval(self.intervalVideo);
        }
      }
    }, 10);
  }

  initEvents() {
    const self = this;
    this.myVideo.ontimeupdate = this.videTimeupDateHandler.bind(self);
    self.progressPlayBtn.on('pointertap', self.changeVideoStatus, self);
    self.progressHead.on('pointerdown', self.progressHeadPointerDown_Hdr, self);
    //self.on('pointerup', self.progressHeadPointerUp_Hdr, self);
    self.on('pointermove', self.progressHeadPointerMove_Hdr, self);
    self.progressHead.on('pointerupoutside', self.progressHeadPointerUp_Hdr, self);
    self.progressHead.on('pointerup', self.progressHeadPointerUp_Hdr, self);
    self.progressbgline.on('pointerdown', self.progresslineTap_Hdr, self);
    self.on('pointertap', self.checkProgressTimeTask, self);
    self.checkProgressTimeTask.call(self);
  }
  checkProgressTimeTask() {

    const self = this;

    if (self.progressIsHide) {
      self.showProgressBar()
    }
    let totalTime = self.hideProgressTime;

    if ( self.getInterval_hideprogress) {
      clearInterval(self.getInterval_hideprogress);
    }
    self.getInterval_hideprogress = setInterval(() => {


      if (totalTime <= 0) {

        if ( self.getInterval_hideprogress) {
          clearInterval(self.getInterval_hideprogress);
        }

        self.hideProgressBar()

        return;
      }
      ;

      totalTime--;

    }, 1000);
  }


  //清除Events以及一切;
  destroyed() {
    const self = this;
    if (this.progressPlayBtn) {
      this.progressPlayBtn.destroy();

    }
    if (this.progressHead) {
      this.progressHead.destroy();

    }
    if (this.progressbgline) {
      this.progressbgline.destroy();
    }
    if (this.myVideo) {
      this.myVideo.ontimeupdate = null;
    }
    if (this.getInterval_hideprogress) {
      clearInterval(self.getInterval_hideprogress);
      self.getInterval_hideprogress = null;
    }
    if (gameMenuBar) {
      gameMenuBar.destroyed();
      gameMenuBar.destroy();
      gameMenuBar = null;
    }
    this.destroy();
    this.myVideo = null;
    this.vueInstance = null;



  }

  //TODO:更改播放器播放状态；
  changeVideoStatus() {
    const self = this;
    if (self.myVideo.paused) {
      self.myVideo.play();
      self.progressPlayBtn.texture = PIXI.loader.resources['pausebtn_png'].texture;
    } else {
      self.myVideo.pause();

      self.progressPlayBtn.texture = PIXI.loader.resources['playbtn_png'].texture;
    }
  }

  progressHeadPointerDown_Hdr() {
    this.headBtnIsDown = true;
    this.myVideo.pause();


  }

  progressHeadPointerUp_Hdr() {
    if (this.currentModeStatus == 0) return;
    this.headBtnIsDown = false;

    this.myVideo.play();
  }

  //TODO:滑动进度播放娃娃头触发
  progressHeadPointerMove_Hdr(event) {
    if (this.headBtnIsDown) {
      this.checkProgressTimeTask();

      this.myVideo.pause();

      let moved = event.data.getLocalPosition(this.progressbgline).x;

      if (moved >= 10 && moved < this.progresslineBgWidth - 10) {


        this.progressPercent = moved / this.progresslineBgWidth;
        this.progressHead.x = moved - (this.progressHead.width / 2 - 25) + 190;
        this.myVideo.currentTime = this.progressPercent * this.myVideo.duration;
        this.playedProgressBar.width = (this.myVideo.currentTime / this.myVideo.duration + 0.01) * this.progresslineBgWidth;

      }

    }

  }

  //TODO:点击设置当前播放位置
  progresslineTap_Hdr(event) {


    this.myVideo.play();

    let moved = event.data.getLocalPosition(this.progressbgline).x;

    if (moved >= 0 && moved < this.progresslineBgWidth) {


      this.progressPercent = moved / this.progresslineBgWidth;
      this.progressHead.x = moved - this.progressHead.width / 2 + 190;
      this.myVideo.currentTime = this.progressPercent * this.myVideo.duration;

    }


  }

  //TODO:展现背景过度动画；
  showMovieBgAnime($time = .5) {
    TweenMax.to(this.movieBg.scale, $time, {x: 1.5})
    TweenMax.to(this.movieBg.scale, $time, {y: 1.5})
    TweenMax.to(this.movieBg, $time, {alpha: 0})
  }

  hideMovieBgAnime($time = .5) {
    TweenMax.to(this.movieBg.scale, $time, {x: 1})
    TweenMax.to(this.movieBg.scale, $time, {y: 1})
    TweenMax.to(this.movieBg, $time, {alpha: 1})
  }

  hideProgressBar($time = 0.5) {
    const self = this;
    gameMenuBar.foldUp()
    if (self.progressBarCtn) {
      TweenMax.to(self.progressBarCtn, $time, {y: 1080 + 150})
      TweenMax.to(self.progressBarCtn, $time, {
        alpha: 0, onComplete: () => {

            self.progressIsHide = true;


        }
      });
    }

  }

  showProgressBar($time = 0.5) {
    const self = this;
    if (self.currentModeStatus == 0) {

      return;
    }
    gameMenuBar.foldDown()
    if (self.progressBarCtn) {
      TweenMax.to(self.progressBarCtn, $time, {y: 1080 - 120})
      TweenMax.to(self.progressBarCtn, $time, {
        alpha: 1, onComplete: () => {


            self.progressIsHide = false;

        }
      })
    }


  }

  videTimeupDateHandler() {
    const self = this;
    if (self.myVideo.paused) return;

    self.videoTimeFormat = self.toClockTime(self.myVideo.currentTime) + " / " + self.toClockTime(self.myVideo.duration);
    self.controlTimes.text = self.videoTimeFormat;
    self.progressHead.x = (self.myVideo.currentTime / self.myVideo.duration) * (self.progresslineBgWidth - self.progressHead.width + 30) + 190;

    self.playedProgressBar.width = (self.myVideo.currentTime / self.myVideo.duration + 0.01) * self.progresslineBgWidth;


    //显示完成;
    if (Math.floor(this.myVideo.currentTime) >= Math.floor(this.myVideo.duration) - self.timeEndSec) {
      if (!self.videoIsEnd) {
        this.againStar.call(self);
        self.videoIsEnd = true;
        Debugs.log('视频播放完毕》》')
      }

    }
  }

  againStar() {
    const self = this;
    var showPopupDelay = null;
    if (self.vueInstance.$route.meta.completed != 1) {
      showPopupDelay = 1000;
    } else {
      showPopupDelay = 0;
    }

//TODO:开始设置清算界面逻辑全套;
    self.vueInstance.$route.meta.completed = 1;
    self.vueInstance.setOwnLessonComplete();
    if (self.vueInstance.gameHasBeenCompleted == false) {
      window.parent.postMessage({
        type: "stepSubmit",
        page: self.vueInstance.lessonCurrentPageIndex
      }, "*");
    }
    setTimeout(() => {
      let isQingsuan = self.vueInstance.$route.name == self.vueInstance.restArrangementStat[self.vueInstance.restArrangementStat.length - 1];//开始清算;
      setTimeout(() => {
        if (isQingsuan && !self.vueInstance.gameHasBeenCompleted) {
          // Debugs.log('清算页面开启，游戏未完成', 'gameCOmpleted?', self.vueInstance.gameHasBeenCompleted)
          gameMenuBar.bookScene.openEnergyCan(false);

          createjs.Sound.play('win_jump')

        } else if (isQingsuan == false && !self.vueInstance.gameHasBeenCompleted) {
          self.vueInstance.showCongra = true;
          // Debugs.log('游戏没有完成，并且也不是清算页')
          createjs.Sound.play('win_jump')
        } else if (self.vueInstance.gameHasBeenCompleted && self.vueInstance.gameSecondPlayed) {
          self.vueInstance.showCongra = true;
          // Debugs.log('游戏第二周目，继续玩')
          createjs.Sound.play('win_jump')
        } else if (self.vueInstance.gameHasBeenCompleted && !self.vueInstance.gameSecondPlayed) {
          gameMenuBar.bookScene.openEnergyCan(true);
          createjs.Sound.play('win_jump')
          // Debugs.log('游戏完成并且卡片已经获得', 'gameCompleted?', self.vueInstance.gameHasBeenCompleted)
        }
      }, showPopupDelay);
      self.vueInstance.updateRestArrangementStat();
    }, 1);
    //TODO:开始设置清算界面逻辑全套---END;
  }
}

export default MovieModulePure;
