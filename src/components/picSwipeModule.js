import GameMenuBar from './gameui/GameMenuBar.js'
import $ from "jquery";
import {TweenMax, Back} from 'gsap'
import {Debugs, TextureCache} from "./Utils";
import GameMenuBars from "./gameui/GameMenuBar";
import {PIXIAudio} from "./EasyPIXI";
import Masker from "./gameui/Masker";
import {LoadingAnimation} from "./gameui/GameManager";

import GamePopupBand from "./gameui/GamePopupBand";


class PixiScene3 extends PIXI.Container {
  constructor($options) {
    super();
    this.gameConfig = $options.json;
    this.app = $options.app;
    this.ticker = $options.ticker;
    this.resources = PIXI.loader.resources;
    this.vueInstance = $options.vueInstance;

    this.gameLevel = 0;
    this.cardList = [];
    this.boySpine = null;
    this.currentAudioPlaying = false;


    this.gameAudio = null;

    this.maskerBg= null;

    this.swiperCtn = $options.swiper;


    this.on('added', this.addedToStage, this)
  }

  clearUp() {
    this.gameConfig = null;
    this.app = null;
    this.ticker = null;
    this.resources = null;
    this.gameLevel = null;
    this.cardList = null;
    this.boySpine = null;

  }

  addedToStage() {
    const self = this;

    var gameBg = new PIXI.Sprite(PIXI.loader.resources['backbg_jpg'].texture);

    this.addChild(gameBg)
    this.maskerBg = new Masker();
    self.gamePopups = new GamePopupBand();
    this.swiperContainer = new PIXI.Container();

    var boyData = self.resources['boyskeleton'].spineData;
    this.boySpine = new PIXI.spine.Spine(boyData);


    this.boySpine.scale.x = this.boySpine.scale.y = 0.55;
    this.boySpine.x = 1920 + this.boySpine.width + 300;
    this.boySpine.y = 1080 / 2 + 150;
    this.boySpine.skeleton.setSkinByName('boy3');
    this.boySpine.skeleton.setSlotsToSetupPose();
    this.boySpine.state.setAnimation(0, 'next', true);
    this.boySpine.alpha = 0;

    this.addChild(this.boySpine);

    //TODO:顶部导航逻辑-----
    GameMenuBars.freeze = false;
    self.gameMenuBar = new GameMenuBars();



    self.addChild(self.gameMenuBar);
    self.gameMenuBar.setBackBtn_tapHandler(() => {

      self.swiperCtn.slidePrev(300)

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


        self.maskerBg.showMakser()
        let arr = self.vueInstance.$route.fullPath.split('/');
        let index = self.vueInstance.allPartNames.indexOf(arr[2]);
        self.vueInstance.SET_INDEXPAGEINITIALSLIDE(Number(index));
      }
    });
    //控制声音;
    self.gameMenuBar.setSoundBtn_tapHandler((evt) => {
      if (evt.currentTarget.status == 'playing') {
        self.stopAudios()
      } else {
        self.playAudios()
      }
    });
    self.gameMenuBar.backBtnShow = false;
    self.gameMenuBar.homeBtnShow = true;
    self.gameMenuBar.bookBtnShow = false;
    self.gameMenuBar.soundBtnShow = true;
    self.gameMenuBar.updateGameMenu();
    self.vueInstance.$watch(()=>{
      return self.vueInstance.energyCurrentNum
    },(newval)=>{
      self.gameMenuBar.energy = newval;
      self.gameMenuBar.playStars();
    });



    self.vueInstance.$watch(() => {
      return self.vueInstance.currentPage;
    }, (newval) => {
      if (newval > 0) {

        self.gameMenuBar.homeBtnShow = true;
        self.gameMenuBar.backBtnShow = true;
      } else {
        self.gameMenuBar.backBtnShow = false;
        self.gameMenuBar.homeBtnShow = true;
      }
      self.gameMenuBar.updateGameMenu();


    });


    this.gameMenuBar.energyOnce = self.vueInstance.energyCurrentNum;

    //顶部导航逻辑END

    this.addChild(this.maskerBg);
    this.maskerBg.hideMakser();






  }

  //音频控制;
  playAudios() {
    const self = this;
    //if (this.currentAudioPlaying) return;
    self.stopAudios()
    let soundName =  this.vueInstance.$route.meta.assetsUrl+'_' + this.gameConfig.pictureList[this.vueInstance.currentPage].audioSrc.replace(/\./g,'_');
    if(this.gameConfig.pictureList[this.vueInstance.currentPage].audioSrc && _.trim(this.gameConfig.pictureList[this.vueInstance.currentPage].audioSrc)!=''){
      this.gameAudio = PIXIAudio.audios[soundName];
      this.gameAudio.play();
      this.gameAudio.position = 0;
      let soundTime =this.gameAudio.duration;
      this.gameAudio.on('complete',()=>{
        if(self.gameMenuBar.soundBtn){
          self.gameMenuBar.soundBtn.stop();
        }
        //self.currentAudioPlaying = false;
      })

      if(this.gameMenuBar.soundBtn){
        this.gameMenuBar.soundBtn.play();
      }
      //this.currentAudioPlaying = true;
      self.gameMenuBar.soundBtnShow = true;
      self.gameMenuBar.updateGameMenu();
    }else{
      self.gameMenuBar.soundBtnShow = false;
      self.gameMenuBar.updateGameMenu();
    }

  }

  stopAudios() {

    if(this.gameAudio){
      this.gameAudio.stop();
      //this.currentAudioPlaying = false;
      this.gameMenuBar.soundBtn.stop();

    }

  }

  hideBoy() {
    const self = this;
    if (this.boySpine) {
      TweenMax.to(this.boySpine, 0.3, {x: 2500, alpha: 0})
    }
  }

  showBoy() {
    const self = this;

    if (this.boySpine) {
      this.boySpine.alpha = 1;
      this.boySpine.x = 1800;

      // TweenMax.to(this.boySpine,0,{x:2800})
      TweenMax.to(this.boySpine, 0.3, {x: 1950})
    }

    let sound = new Audio('static/sound/nextpart.mp3');
    sound.play();
  }
  destroyed() {
    this.stopAudios();
    if(this.gameMenuBar){
      this.gameMenuBar.clearGameMenuEvents();
      this.gameMenuBar.destroy();
    }

  }
}

export default PixiScene3;
