import $ from 'jquery'
import {TweenMax} from 'gsap'
import MovieController from './gameui/MovieController.js'
import {LoadingAnimation} from './gameui/GameManager.js'
import {AudioManager, Debugs} from "./Utils";
import GameMenuBars from "./gameui/GameMenuBar";

// const PIXI = require('pixi.js')
// require('pixi-spine')


class MovieModulePure extends PIXI.Container {
  constructor($options) {
    super();
    this.gameConfig = $options.json;
    this.app = $options.app;



    this.vueInstance = $options.vueInstance;



    this.videoSprite = null;
    this.videoDom = null;

    this.videoIsComplete = false;

    this.backBtn = this.homeBtn = null;
    this.topMenuIsShow  = true;
    this.topMenuFirstTimes = 0;

    this.topMenuIsAnimating = false;

    this.gameStat = 0;//0表示返回舞台，1表示观看中

    this.gameMenuBar = null;




    this.goplayBtn = null;
    this.movieBg = null;

    this.grandScene = null;
    this.videoController = null;

    //上部分导航回到过去的页面backbtn
    this.upponMenu = null;
    //todo:是否显示动画;
    this.controllerIsShow = false;
    //todo:当前切换模式,0:小窗,1:全屏;
    this.currentMode = 0;
    //控制器停留时间：5；
    this.controllerStayTime = 5;




    this.on('added', this.addedToStage, this)
  }

  addedToStage() {
    const self = this;
    self.interactive = true;
    this.grandScene = new PIXI.Container();
    /**
     *
     * @上部分导航
     */
    this.upponMenu = new PIXI.Container();

    var upponMenuBg = new PIXI.Graphics();
    upponMenuBg.beginFill(0x000000,0.6);
    upponMenuBg.drawRect(0,0,1920,120);
    upponMenuBg.endFill();
    let shadow = new PIXI.filters.BlurFilter();
    shadow.blurY = 30;
    upponMenuBg.filters = [shadow]
   // var backBtn = new PIXI.Sprite(PIXI.Texture.from("backBtn"));
    this.upponMenu.addChild(upponMenuBg);

    this.upponMenu.y = -145;
    /**
     * @视屏实体
     */


    initVideo.call(self)

    function initVideo(){
      this.videoDom = document.getElementById('myVideo')


      this.videoSprite = new PIXI.Graphics();
      this.videoSprite.beginFill(0xff0000,0);
      this.videoSprite.drawRect(220,90,1920,1080);
      this.videoSprite.endFill();
      this.addChild(this.videoSprite);
      this.videoSprite.interactive = true;
      this.videoSprite.width = 1920 * 0.725;
      this.videoSprite.height = 1080 * 0.725;

      this.videoSprite.pivot.x = -112
      this.videoSprite.pivot.y = -69




      this.movieBg = new PIXI.Sprite(PIXI.Texture.from("moviebg"));
      this.movieBg.pivot.x = this.movieBg.width / 2;
      this.movieBg.pivot.y = this.movieBg.height / 2;
      this.movieBg.x = 1920 / 2;
      this.movieBg.y = 1080 / 2;
      this.grandScene.addChild(this.movieBg)
      this.addChild(this.grandScene)
      this.addChild(this.upponMenu);




      this.goplayBtn = new PIXI.Sprite(PIXI.Texture.from("goplaybtn_png"));
      this.addChild(this.goplayBtn)

      this.goplayBtn.pivot.x = this.goplayBtn.width / 2;
      this.goplayBtn.pivot.y = this.goplayBtn.height / 2;
      this.goplayBtn.x = 1920 / 2;
      this.goplayBtn.y = 1080 / 2;
      this.goplayBtn.interactive = true;
      this.goplayBtn.on('pointerdown', this.goplayBtnHandler, this);



      //TODO:顶部导航逻辑-----
      GameMenuBars.freeze = false;

      self.gameMenuBar = new GameMenuBars();
      self.addChild(self.gameMenuBar)
      self.gameMenuBar.setBackBtn_tapHandler(()=>{
        self.gobackHandler();
      });
      self.gameMenuBar.setHomeBtn_tapHandler(() => {
        if (self.vueInstance.$route.meta.completed == 0) {
          self.vueInstance.popupType = 'shutback';
          self.vueInstance.showCongra = true;
        } else {
          setTimeout(() => {
            self.vueInstance.$router.push('/index/')
          }, 1000);
          LoadingAnimation.setMaskShow(true)

          let arr = self.vueInstance.$route.fullPath.split('/');
          let index = self.vueInstance.allPartNames.indexOf(arr[2]);
          self.vueInstance.SET_INDEXPAGEINITIALSLIDE(Number(index));

        }
      });
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
      this.gameMenuBar.energyOnce = self.vueInstance.energyCurrentNum;

    }


    //顶部导航逻辑END
    this.videoDom.oncanplay = function(){
      Debugs.log('oncanplay')
    }
    this.videoDom.onloadedmetadata = function(){
      Debugs.log('onloadedmetadata')
    }
    this.videoDom.oncanplaythrough = function(){
      Debugs.log('oncanplaythrough')
    }

    this.videoDom.addEventListener('loadedmetadata', this.videoCompleted.bind(this),this);
    this.videoDom.addEventListener('canplaythrough',this.videoCompleted.bind(this),this)


  }
  videoCompleted() {
    const self = this;

    if (self.videoIsComplete == false) {

      self.videoController = new MovieController({
        gameConfig: self.gameConfig,
        video: self.videoDom,
        vueInstance:self.vueInstance,
        gameMenu:self.gameMenuBar
      });


      self.videoSprite.interactive = true;
      self.videoSprite.on('pointerdown',self.videoClickedHandler,self);
      self.videoController.interactive = true;
      self.videoController.on('pointermove',self.videoControllerHandler_pointermove,self);
      self.videoController.on('pointerdown',self.videoControllerHandler_pointerdown,self)

      self.addChild(self.videoController);
      self.videoController.y = (1080 - 120)+125;

    }
    self.videoIsComplete = true;
  }

  videoControllerHandler_pointermove(){
    this.controllerStayTime = 2;
  }
  videoControllerHandler_pointerdown(){
    this.controllerStayTime = 2;
  }

  destroyed(){
    this.gameMenuBar.clearGameMenuEvents();
    this.gameMenuBar.destroy();
    this.gameMenuBar = null;
    this.videoDom.pause();
    this.videoDom.removeEventListener('loadedmetadata', this.videoCompleted.bind(self))
    this.videoController.clearAllDomListener();
    this.videoSprite.removeListener('pointerdown',this.videoClickedHandler,this);
    this.videoController.removeListener('pointermove',this.videoControllerHandler_pointermove,this);
    this.videoController.removeListener('pointerdown',this.videoControllerHandler_pointerdown,this)
    this.controllerStayTime = 0;
  }
  /**
   * @点击视屏区域开启控件
   */
  videoClickedHandler(){

    if(this.currentMode==0){
      return;
    }else{
      this.controllerStayTime = 2;
      this.showMovieControl.call(this)
    }

  }
  /**
   * @返回上一级按钮
   */
  gobackHandler(event){
    if(this.topMenuIsAnimating)return;
    this.topMenuIsAnimating = true;
    this.smallerMovie.call(this);
    this.hideMovieControl.call(this);
    this.gameMenuBar.foldDown()

    this.gameMenuBar.homeBtnShow = true;
    this.gameMenuBar.backBtnShow = false;
    this.gameMenuBar.updateGameMenu();

    if(this.videoDom){
      this.videoDom.pause();
    }
    this.gameStat = 0;
  }

  showAllMovie() {
    const self = this;
    TweenMax.to(this.movieBg.scale, 0.6, {x: 1.5, y: 1.5,onComplete:function(){
      self.topMenuIsAnimating = false;
      }});
    TweenMax.to(this.movieBg, 0.5, {alpha: 0, delay: .3});


    TweenMax.to(this.videoSprite, 0.3, {width: 1921, height: 1081, x: -338, y: -210});


    this.gameMenuBar.homeBtnShow = false;
    this.gameMenuBar.backBtnShow = true;
    this.gameMenuBar.updateGameMenu();


  }

  smallerMovie() {
    const self = this;

    this.currentMode = 0;
    TweenMax.to(this.movieBg.scale, 0.6, {x: 1, y: 1,onComplete:()=>{
        self.goplayBtn.alpha = 1;
        self.goplayBtn.interactive = true;
        self.topMenuIsAnimating = false;
      }});
    TweenMax.to(this.movieBg, 0.3, {alpha: 1});



    this.videoController.playbtn.texture = PIXI.Texture.from('pausebtn_png');
    this.videoController.video.pause();
    this.videoController.isPlaying = false;


    TweenMax.to(this.videoSprite, 0.6, {width: 1921*0.725, height: 1081*0.725, x: 0, y: 0,delay:0.1});



  }
  showMovieControl(){
    const self = this;

    if(self.controllerIsShow)return;
    self.controllerIsShow = true;
    this.currentMode = 1;
    if(self.videoController){
      let settime =null;
      self.controllerStayTime = 1;
      TweenMax.to(self.videoController,0.4,{y:1080-120,onComplete:()=>{

          settime = setInterval(()=>{
            if(self.controllerStayTime<=0){
              clearInterval(settime);
              self.hideMovieControl.call(self);
              settime = null;
              return;
            }
            self.controllerStayTime--;
          },1000)


        }});

      TweenMax.to(self.upponMenu,0.4,{y:0});

        // self.vueInstance.$parent.$parent.$refs.gameMenu.foldDown();
      self.gameMenuBar.foldDown()
     // }
      self.topMenuFirstTimes++;
    }

  }
  hideMovieControl(){
    const self = this;

    if(self.videoController){
      TweenMax.to(self.videoController,0.4,{y:1080-120+125})
      //  self.videoController.y = (1080 - 120)+125;
    }
    if(self.videoController){
      TweenMax.to(self.upponMenu,0.4,{y:-145,onComplete:function(){
          self.controllerIsShow = false;
          self.topMenuFirstTimes = 0;

      }})
      //  self.videoController.y = (1080 - 120)+125;
    }
    if(self.gameStat ==1){
      // self.vueInstance.$parent.$parent.$refs.gameMenu.foldUpll();

      self.gameMenuBar.foldUp()
    }
  }



  goplayBtnHandler(event) {
    if(this.topMenuIsAnimating)return;
    this.topMenuIsAnimating = true;
    event.currentTarget.interactive = false;
    this.showAllMovie();
    this.showMovieControl();
    event.currentTarget.alpha = 0;
    //
    if(this.videoDom){
      this.videoDom.play()
    };

    this.gameStat = 1;
  }
}

export default MovieModulePure;
