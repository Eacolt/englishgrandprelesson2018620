import GameMenuBar from './gameui/GameMenuBar.js'
import $ from "jquery";
import {TweenMax, Back} from 'gsap'
import {Debugs, TextureCache} from "./Utils";
import GameMenuBars from "./gameui/GameMenuBar";
import {PIXIAudio} from "./EasyPIXI";


//
// var gameMenuBar= null;
var unwatchVue = null;
var unwatchVue2 = null;

class PixiScene3 extends PIXI.Container {
  constructor($options) {
    super();
    this.gameConfig = $options.json;
    this.vueInstance = $options.vueInstance;
    this.boySpine = null;
    this.gameAudio = null;
    this.swiperCtn = $options.swiper;

    this.gameMenuBar = null;
    this.on('added', this.addedToStage, this)
  }


  addedToStage() {

    const self = this;
    // var gameBg = new PIXI.Sprite(PIXI.Texture.from('backbg_jpg'));
    //  this.addChild(gameBg)

    this.swiperContainer = new PIXI.Container();
    var boyData = PIXI.loader.resources['boyskeleton'].spineData;
    this.boySpine = new PIXI.spine.Spine(boyData);


    this.boySpine.scale.x = this.boySpine.scale.y = 0.55;
    this.boySpine.x = 1920 + this.boySpine.width + 300;
    this.boySpine.y = 1080 / 2 + 150;
    this.boySpine.skeleton.setSkinByName('boy3');
    this.boySpine.skeleton.setSlotsToSetupPose();
    this.boySpine.state.setAnimation(0, 'next', true);
    this.boySpine.interactive = true;
    this.boySpine.on('pointerdown',this.boySpineTouchDown,this)


    this.addChild(this.boySpine);

    //TODO:顶部导航逻辑-----
    GameMenuBars.freeze = false;
    this.gameMenuBar = new GameMenuBars();



    self.addChild(this.gameMenuBar);
    this.gameMenuBar.setBackBtn_tapHandler(() => {
      //触发回去的回调函数

      self.swiperCtn.slidePrev(300)

    });
    this.gameMenuBar.setHomeBtn_tapHandler(() => {

      if (self.vueInstance.$route.meta.completed == 0) {

        self.vueInstance.popupType = 'shutback';
        self.vueInstance.showCongra = true;
      } else {

        let arr = self.vueInstance.$route.fullPath.split('/');
        let index = self.vueInstance.allPartNames.indexOf(arr[2]);
        self.vueInstance.SET_INDEXPAGEINITIALSLIDE(Number(index));
        self.vueInstance.$router.push('/index/')
      }
    });
    //控制声音;
     this.gameMenuBar.setSoundBtn_tapHandler((evt) => {
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
    unwatchVue = self.vueInstance.$watch(()=>{
      return self.vueInstance.energyCurrentNum
    },(newval)=>{
      self.gameMenuBar.energy = newval;
      self.gameMenuBar.playStars();
    });



    unwatchVue2 = self.vueInstance.$watch(() => {
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


    self.gameMenuBar.energyOnce = self.vueInstance.energyCurrentNum;

    //顶部导航逻辑END





  }

  //音频控制;
  playAudios() {
    const self = this;

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

      })

      if(self.gameMenuBar.soundBtn){
        self.gameMenuBar.soundBtn.play();
      }

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
      this.gameMenuBar.soundBtn.stop();

    }

  }
  boySpineTouchDown(){

    this.vueInstance.boyBtnAreaClicked();

  }

  hideBoy() {
    const self = this;
    if (this.boySpine) {
      TweenMax.to(this.boySpine, 0.3, {x: 2500})
    }
  }

  showBoy() {
    const self = this;


    if (this.boySpine) {

      // this.boySpine.alpha = 1;
      this.boySpine.x = 1800;
      TweenMax.to(this.boySpine, 0.3, {x: 1950})
    }

  }
  destroyed() {
    super.destroy();
    this.stopAudios();
    if(this.gameMenuBar){
      this.gameMenuBar.clearGameMenuEvents();
      this.gameMenuBar.destroy();
    }
    this.stopAudios();
    if(unwatchVue){
      unwatchVue();
      unwatchVue = null;
    }
    if(unwatchVue2){
      unwatchVue2();
      unwatchVue2 = null;
    }
    if(this.boySpine){
      this.boySpine.destroy();
      this.boySpine = null;
    }
    this.swiperCtn = null;

    this.gameAudio = null;
    this.gameConfig = null;
    this.vueInstance = null;

    this.destroy();
    Debugs.log('picSwipeModule: destroyed')

  }
}

export default PixiScene3;
