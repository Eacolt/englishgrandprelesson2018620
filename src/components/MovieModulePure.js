import GameMenuBars from "./gameui/GameMenuBar";

import FormatDate from "dateformat";
import {PIXIAudio} from "./EasyPIXI";
import {Debugs} from "./Utils";
var gameMenuBar = null;
class MovieModulePure extends PIXI.Container {
  constructor($option) {
    super();

    this.vueInstance = $option.vueInstance;
    this.myVideo = null;
    this._G = {
      headBtnIsDown: false,//娃娃头是否点击
      progressPercent: 0,
      progresslineHitArea: null,
      movieBg: null,//背景；
      hideProgressTime: 4,//鼠标不触发点击多久后隐藏进度
			timeEndSec:2,
      getInterval_hideprogress: null,//间隔回调，点击隐藏进度,
      progressIsHide: false,//初始化当前进度条是隐藏状态,
      currentModeStatus: 0, //当前所在都页面位置，0为准备页面，1为正在观看页面；
      upperMaskFilter: null,//上部但黑条,
      videoIsEnd: false

    };

    this.on('added', this.initial, this);
  }

  initial() {
    const self = this;
    //TODO：添加背景；
    this._G.movieBg = new PIXI.Sprite(PIXI.loader.resources['moviebg'].texture);
    this.addChild(this._G.movieBg);
    this._G.movieBg.scale.x = this._G.movieBg.scale.y = 1;
    this._G.movieBg.pivot.x = this._G.movieBg.width / 2;
    this._G.movieBg.pivot.y = this._G.movieBg.height / 2;
    this._G.movieBg.x = 1920 / 2;
    this._G.movieBg.y = 1080 / 2;
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
      self._G.currentModeStatus = 0;

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

    self._G.currentModeStatus = 1;

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

    self._G.progressBarHeight = 120;//Container黑色区域高度
    self._G.progresslineBgWidth = 1400;//播放进度条长度
    self._G.progressBarCtn = new PIXI.Container();//设置进度条的Container；
    self._G.progressHead = new PIXI.Sprite(PIXI.loader.resources['headbtn_png'].texture);//进度条标头
    self._G.progressPlayBtn = new PIXI.Sprite();
    self._G.progressBarBg = new PIXI.Graphics();//进度条背景

    self._G.progresslineHitArea = null;


    self._G.videoTimeFormat = self.toClockTime(self.myVideo.currentTime) + " / " + self.toClockTime(self.myVideo.duration);
    self._G.controlTimes = new PIXI.Text(self._G.videoTimeFormat, {
      fontFamily: 'Arial',
      fontSize: 32,
      fontWeight: 'bold',
      align: 'center',
      fill: ['#ffffff'], // gradient
      stroke: '#4a1850',
      strokeThickness: 1,
    });


    //设置背景黑色区域
    self._G.progressBarBg.beginFill(0x000000, 0.6);
    self._G.progressBarBg.drawRect(0, 0, 1920, self._G.progressBarHeight);
    self._G.progressBarBg.endFill();
    //设置播放时间的显示信息 ；
    self._G.controlTimes.pivot.x = self._G.controlTimes.width;
    self._G.controlTimes.pivot.y = self._G.controlTimes.height / 2;
    self._G.controlTimes.x = 1920 - 60;
    self._G.controlTimes.y = self._G.progressBarHeight / 2;
    //设置Container；

    self._G.progressBarCtn.y = 1080 - 120;
    //设置播放按钮；
    self._G.progressPlayBtn.interactive = true;
    self._G.progressPlayBtn.texture = PIXI.loader.resources['pausebtn_png'].texture;
    self._G.progressPlayBtn.pivot.y = self._G.progressPlayBtn.height / 2;
    self._G.progressPlayBtn.y = self._G.progressBarHeight / 2;
    self._G.progressPlayBtn.x = 60;


    //设置进度条；
    self._G.progressbgline = new PIXI.Graphics();
    //进度条边缘颜色
    switch (GameMenuBars.vueInstance.gameThemeType) {
      case 1:
        self._G.progressbgline.lineStyle(4, 0xc34a8b)
        break;
      case 2:
        self._G.progressbgline.lineStyle(4, 0xc6730f)
        break;
      case 3:
        self._G.progressbgline.lineStyle(4, 0x3da44c)
        break;
      case 4:
        self._G.progressbgline.lineStyle(4, 0x008bfb)
        break;
      case 5:
        self._G.progressbgline.lineStyle(4, 0x9758ea)
        break;
      default:
        break;
    }

    self._G.progressbgline.beginFill(0xd1e0ee);
    self._G.progressbgline.drawRoundedRect(0, 0, self._G.progresslineBgWidth, 18, 10);
    self._G.progressbgline.endFill();
    self._G.progressbgline.pivot.y = 9;
    self._G.progressbgline.y = 60;
    self._G.progressbgline.x = 190;
    self._G.progressbgline.shadowBox = new PIXI.Graphics();
    self._G.progressbgline.shadowBox.beginFill(0x000000, 0.5);
    self._G.progressbgline.shadowBox.drawRoundedRect(0, 0, self._G.progresslineBgWidth, 18, 9);
    self._G.progressbgline.shadowBox.endFill();
    self._G.progressbgline.interactive = true;
    let colorMatrix = new PIXI.filters.BlurFilter();
    colorMatrix.blur = 5;
    self._G.progressbgline.shadowBox.filters = [colorMatrix];
    self._G.progressbgline.shadowBox.scale.y = 0.5;


    ////

    self._G.progressMaskBar = new PIXI.Graphics();
    self._G.progressMaskBar.beginFill(0xd1e0ee);
    self._G.progressMaskBar.drawRoundedRect(2, 2, self._G.progresslineBgWidth - 4, 15, 9);
    self._G.progressMaskBar.endFill();
    self._G.progressMaskBar.x = self._G.progressbgline.x;
    self._G.progressMaskBar.y = self._G.progressbgline.y - 9.5;

    self._G.playedProgressBar = new PIXI.Graphics();

    //进度条内部颜色
    switch (GameMenuBars.vueInstance.gameThemeType) {
      case 1:
        self._G.playedProgressBar.beginFill(0xe97aba);
        break;
      case 2:
        self._G.playedProgressBar.beginFill(0xffd659);
        break;
      case 3:
        self._G.playedProgressBar.beginFill(0x57e26a);
        break;
      case 4:
        self._G.playedProgressBar.beginFill(0x00b2ff);
        break;
      case 5:
        self._G.playedProgressBar.beginFill(0xc094f9);
        break;
      default:
        break;
    }

    self._G.playedProgressBar.drawRect(0, -18, self._G.progresslineBgWidth, 38);
    self._G.playedProgressBar.endFill();
    self._G.playedProgressBar.x = self._G.progressbgline.x;
    self._G.playedProgressBar.y = self._G.progressbgline.y;

    self._G.playedProgressBar.mask = self._G.progressMaskBar;
    self._G.playedProgressBar.width = self._G.progresslineBgWidth * self._G.progressPercent;


    //设置娃娃头；
    self._G.progressHead.x = 190;
    self._G.progressHead.y = 26;
    self._G.progressHead.interactive = true;


    self._G.progresslineHitArea = new PIXI.Rectangle(0, -50, self._G.progresslineBgWidth, 100);
    self._G.progressbgline.hitArea = self._G.progresslineHitArea;


    self._G.progressBarCtn.addChild(self._G.progressBarBg)


    self._G.progressBarCtn.addChild(self._G.controlTimes);
    self._G.progressBarCtn.addChild(self._G.progressPlayBtn)

    self._G.progressBarCtn.addChild(self._G.progressMaskBar);


    self._G.progressBarCtn.addChild(self._G.progressbgline);
    self._G.progressBarCtn.addChild(self._G.playedProgressBar);
    self._G.progressBarCtn.addChild(self._G.progressHead);


    this.addChild(self._G.progressBarCtn);
    self._G.progressBarCtn.alpha = 0;
    self._G.progressBarCtn.y = 1080 + 150;

    //上部分头部黑色区域；

    // self._G.upperMaskFilter = new PIXI.Graphics();
    // self._G.upperMaskFilter.beginFill(0xff0000);
    // self._G.upperMaskFilter.drawRect(0,0,1920,150);
    // self._G.upperMaskFilter.endFill();
    // let fl = new PIXI.filters.BlurYFilter();
    // fl.blur = 30;
    // fl.quality = 5;
    // self._G.upperMaskFilter.filters = [fl];
    //
    // self.addChild(self._G.upperMaskFilter)


    //EventHandler;

    self.interactive = true;


    // this.hideProgressBar(0)
    // if (Math.floor(this.myVideo.currentTime) >= Math.floor(this.myVideo.duration)-6) {
    //   if(!self._G.videoIsEnd){
    //     this.againStar.call(self);
    //     self._G.videoIsEnd = true;
    //     Debugs.log('视频播放完毕》》')
    //   }
    //
    // }
    self._G.intervalVideo = setInterval(()=> {

      if(self.myVideo && self.myVideo.duration>3){
        if (Math.floor(self.myVideo.currentTime) >= Math.floor(self.myVideo.duration)-self._G.timeEndSec) {
          self._G.videoIsEnd = true;
          self.againStar.call(self);
          clearInterval(self._G.intervalVideo);
        }
      }
    },10);
  }

  initEvents() {
    const self = this;

    this.myVideo.ontimeupdate = this.videTimeupDateHandler.bind(self);
    self._G.progressPlayBtn.on('pointertap', self.changeVideoStatus, self);
    self._G.progressHead.on('pointerdown', self.progressHeadPointerDown_Hdr, self);
    //self.on('pointerup', self.progressHeadPointerUp_Hdr, self);
    self.on('pointermove', self.progressHeadPointerMove_Hdr, self);
    self._G.progressHead.on('pointerupoutside', self.progressHeadPointerUp_Hdr, self);
    self._G.progressHead.on('pointerup', self.progressHeadPointerUp_Hdr, self);
    self._G.progressbgline.on('pointerdown', self.progresslineTap_Hdr, self);
    self.on('pointertap', self.checkProgressTimeTask, self);
    self.checkProgressTimeTask.call(self);


  }

  checkProgressTimeTask() {

    const self = this;
    if (self._G.progressIsHide) {
      self.showProgressBar()
    }
    let totalTime = self._G.hideProgressTime;

    if (self._G && self._G.getInterval_hideprogress) {
      clearInterval(self._G.getInterval_hideprogress);
    }
    self._G.getInterval_hideprogress = setInterval(() => {
      Debugs.log('interval_getIntervalHide')

      if (totalTime <= 0) {

        if (self._G && self._G.getInterval_hideprogress) {
          clearInterval(self._G.getInterval_hideprogress);
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
    if (this._G.progressPlayBtn) {
      this._G.progressPlayBtn.destroy();

    }
    if (this._G.progressHead) {
      this._G.progressHead.destroy();

    }
    if (this._G.progressbgline) {
      this._G.progressbgline.destroy();
    }
    if (this.myVideo) {
      this.myVideo.ontimeupdate = null;
    }
    if (this._G.getInterval_hideprogress) {
      clearInterval(self._G.getInterval_hideprogress);
      self._G.getInterval_hideprogress = null;
    }
    if (gameMenuBar) {
      gameMenuBar.clearGameMenuEvents();
      gameMenuBar.destroy();
      gameMenuBar = null;
    }
    this.destroy();


    this.myVideo = null;
    this.vueInstance = null;
    this._G = null;


  }

  //TODO:更改播放器播放状态；
  changeVideoStatus() {
    const self = this;
    if (self.myVideo.paused) {
      self.myVideo.play();
      self._G.progressPlayBtn.texture = PIXI.loader.resources['pausebtn_png'].texture;
    } else {
      self.myVideo.pause();

      self._G.progressPlayBtn.texture = PIXI.loader.resources['playbtn_png'].texture;
    }
  }

  progressHeadPointerDown_Hdr() {
    this._G.headBtnIsDown = true;
    this.myVideo.pause();


  }

  progressHeadPointerUp_Hdr() {
    if (this._G.currentModeStatus == 0) return;
    this._G.headBtnIsDown = false;

    this.myVideo.play();
  }

  //TODO:滑动进度播放娃娃头触发
  progressHeadPointerMove_Hdr(event) {
    if (this._G.headBtnIsDown) {
      this.checkProgressTimeTask();

      this.myVideo.pause();

      let moved = event.data.getLocalPosition(this._G.progressbgline).x;

      if (moved >= 10 && moved < this._G.progresslineBgWidth - 10) {


        this._G.progressPercent = moved / this._G.progresslineBgWidth;
        this._G.progressHead.x = moved - (this._G.progressHead.width / 2 - 25) + 190;
        this.myVideo.currentTime = this._G.progressPercent * this.myVideo.duration;
        this._G.playedProgressBar.width = (this.myVideo.currentTime / this.myVideo.duration + 0.01) * this._G.progresslineBgWidth;

      }

    }

  }

  //TODO:点击设置当前播放位置
  progresslineTap_Hdr(event) {


    this.myVideo.play();

    let moved = event.data.getLocalPosition(this._G.progressbgline).x;

    if (moved >= 0 && moved < this._G.progresslineBgWidth) {


      this._G.progressPercent = moved / this._G.progresslineBgWidth;
      this._G.progressHead.x = moved - this._G.progressHead.width / 2 + 190;
      this.myVideo.currentTime = this._G.progressPercent * this.myVideo.duration;

    }


  }

  //TODO:展现背景过度动画；
  showMovieBgAnime($time = .5) {
    TweenMax.to(this._G.movieBg.scale, $time, {x: 1.5})
    TweenMax.to(this._G.movieBg.scale, $time, {y: 1.5})
    TweenMax.to(this._G.movieBg, $time, {alpha: 0})
  }

  hideMovieBgAnime($time = .5) {
    TweenMax.to(this._G.movieBg.scale, $time, {x: 1})
    TweenMax.to(this._G.movieBg.scale, $time, {y: 1})
    TweenMax.to(this._G.movieBg, $time, {alpha: 1})
  }

  hideProgressBar($time = 0.5) {
    const self = this;
    gameMenuBar.foldUp()
    if (self._G.progressBarCtn) {
      TweenMax.to(self._G.progressBarCtn, $time, {y: 1080 + 150})
      TweenMax.to(self._G.progressBarCtn, $time, {
        alpha: 0, onComplete: () => {
          self._G.progressIsHide = true;
        }
      });
    }

  }

  showProgressBar($time = 0.5) {
    const self = this;
    if (self._G.currentModeStatus == 0) {

      return;
    }
    gameMenuBar.foldDown()
    if (self._G.progressBarCtn) {
      TweenMax.to(self._G.progressBarCtn, $time, {y: 1080 - 120})
      TweenMax.to(self._G.progressBarCtn, $time, {
        alpha: 1, onComplete: () => {
          self._G.progressIsHide = false;
        }
      })
    }


  }

  videTimeupDateHandler() {
    const self = this;
    if (self.myVideo.paused) return;

    self._G.videoTimeFormat = self.toClockTime(self.myVideo.currentTime) + " / " + self.toClockTime(self.myVideo.duration);
    self._G.controlTimes.text = self._G.videoTimeFormat;
    self._G.progressHead.x = (self.myVideo.currentTime / self.myVideo.duration) * (self._G.progresslineBgWidth - self._G.progressHead.width + 30) + 190;

    self._G.playedProgressBar.width = (self.myVideo.currentTime / self.myVideo.duration + 0.01) * self._G.progresslineBgWidth;


    //显示完成;
    if (Math.floor(this.myVideo.currentTime) >= Math.floor(this.myVideo.duration)-self._G.timeEndSec) {
      if(!self._G.videoIsEnd){
        this.againStar.call(self);
        self._G.videoIsEnd = true;
        Debugs.log('视频播放完毕》》')
      }

    }
  }

  againStar() {
    const self = this;
   // if(self._G.videoIsEnd)return;
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
          Debugs.log('清算页面开启，游戏未完成', 'gameCOmpleted?', self.vueInstance.gameHasBeenCompleted)
          gameMenuBar.bookScene.openEnergyCan(false);

        } else if (isQingsuan == false && !self.vueInstance.gameHasBeenCompleted) {
          self.vueInstance.showCongra = true;
          Debugs.log('游戏没有完成，并且也不是清算页')
          PIXIAudio.audios['win_jump'].play();
        } else if (self.vueInstance.gameHasBeenCompleted && self.vueInstance.gameSecondPlayed) {
          self.vueInstance.showCongra = true;
          Debugs.log('游戏第二周目，继续玩')
          PIXIAudio.audios['win_jump'].play();
        } else if (self.vueInstance.gameHasBeenCompleted && !self.vueInstance.gameSecondPlayed) {
          gameMenuBar.bookScene.openEnergyCan(true);
          PIXIAudio.audios['win_jump'].play();
          Debugs.log('游戏完成并且卡片已经获得', 'gameCompleted?', self.vueInstance.gameHasBeenCompleted)
        }
      }, self.vueInstance.showPopupDelay);
      self.vueInstance.updateRestArrangementStat();
    }, 1);
    //TODO:开始设置清算界面逻辑全套---END;
  }
}

export default MovieModulePure;
