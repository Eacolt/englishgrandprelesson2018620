import {TweenMax} from 'gsap'
import BookScene from './BookScene.js'
import {AnimationSprite,PIXIAudio} from '../EasyPIXI.js'

class GameMenuBars extends PIXI.Container {
  // static instancement = null;
   static vueInstance= null;
  static freeze = false;

  static gameHasOpendBook= false;//游戏已经第二周目，不能再翻开书

  constructor() {
    super();

    this.barCtn = null;
    this.bookScene = null;
    this.vueInstance = null;

    this.offsetToTop = 35;
    this.offsetToLeft = 90;

    this.energyBar = null;
    this.backBtn = null;
    this.energyMask = null;//游戏的能量条遮罩
    this.bookBtn = null;
    this.closeBtn = null
    this.soundBtn = null;
    this.homeBtn = null;
    this.energyNumber = 0;

    this.buttonsOffset = 40;//按钮间距


    //setter
    this._backBtnShow = false;
    this._homeBtnShow = false;
    this._energyBtnShow = false;
    this._bookBtnShow = false;
    this._closeBtnShow = false;
    this._soundBtnShow = false;

    //UI;

    this.rightMenuUI = [];
    this.starsLight = null;


    //事件池塘;
    this.closeBtnHandler = null;
    this.bookBtnHandler = null;
    this.soundBtnHandler = null;
    this.backBtnHandler= null;
    this.homeBtnHandler = null;




    this.on('added', this.initial, this)
  }


  set energy($num) {
    // this.energyMask.width = $num*300;
    TweenMax.to(this.energyMask, 1, {width: $num * 286});
    this.energyNumber = $num;
  }

  get energy() {
    return this.energyNumber;
  }

  set energyOnce($num){
    this.energyMask.width = $num * 286;
    this.energyNumber = $num;
  }

  setGoBackHandler($cb) {
    this.gobackHandler = $cb;
  }

  createSprite($texturename) {
    let sprite = new PIXI.Sprite(PIXI.loader.resources[$texturename].texture);
    return sprite;
  }
  createTextureAtlas($texturename){
    let sprite = new PIXI.Sprite(PIXI.loader.resources['allmenuassets_altas'].textures[$texturename]);
    return sprite;
  }

  initial() {
    const self = this;

    this.bookScene = new BookScene();
    this.bookScene.vueInstance = GameMenuBars.vueInstance;

    this.starsLight = new PIXI.spine.Spine(PIXI.loader.resources['starflash_json'].spineData);
    this.starsLight.state.setAnimation(0,'star',true);

    this.barCtn = new PIXI.Container();
    //todo:能量条;
    function init_energyBar() {
      this.energyBar = new PIXI.Container();
      let keybg = null;
      let keyborder =null;
      let keyLight = null;
      let energy = null;
      keybg = this.createSprite('menubtnKey_png');
      keyborder = this.createSprite('menuBtnKeyline_png');
      keyLight = this.createSprite('menuBtnKeylight_png');
      energy = this.createSprite('menuBtn_Energy');
      keybg.y = 11;
      keybg.x = 11;
      this.energyMask = new PIXI.Graphics();
      this.energyMask.beginFill(0xff0000);
      this.energyMask.drawRoundedRect(0, 39, 1, 40, 0);
      this.energyMask.endFill();
      this.energyBar.addChild(this.energyMask);
      this.energyBar.addChild(keybg);
      this.energyBar.addChild(energy);
      this.energyBar.addChild(keyborder);
      this.energyBar.addChild(keyLight);
      energy.mask = this.energyMask;
      this.barCtn.addChild(this.energyBar)

      this.energyBar.pivot.x = this.energyBar.width;
      this.energyBar.pivot.y = 0;

    }


    //回退按钮;
    function init_backMenu() {

      this.backBtn = this.createSprite('menubtnBack_png')

      this.backBtn.pivot.x = 0;
      this.backBtn.pivot.y = 0;
      this.barCtn.addChild(this.backBtn);

    }



    //书;
    function init_BookMenu(){

      this.bookBtn = this.createSprite('menubtnBook_png')
      this.barCtn.addChild(this.bookBtn);
      this.bookBtn.pivot.x = this.bookBtn.width;
      this.bookBtn.pivot.y = 0;
    }

    //Sound;
    function init_SoundMenu(){
      this.soundBtn =   new AnimationSprite();
      this.soundBtn.resName = 'menubtnSound_atlas';
      this.soundBtn.alienImages = ["sound0.png", "sound1.png", "sound2.png"]


      this.barCtn.addChild(this.soundBtn);
      this.soundBtn.pivot.x = this.soundBtn.width;
      this.soundBtn.pivot.y = 0;


    }

    //close;
    function init_CloseMenu(){

      this.closeBtn = this.createSprite('menubtnClose_png')

      this.barCtn.addChild(this.closeBtn);
      this.closeBtn.pivot.x = this.closeBtn.width;
      this.closeBtn.pivot.y = 0;
    }

    ///

    //Home;
    function init_HomeMenu(){
      this.homeBtn = this.createSprite('menubtnHome_png')

      this.homeBtn.pivot.x = 0;
      this.homeBtn.pivot.y = 0;
      this.barCtn.addChild(this.homeBtn);
    }



    init_backMenu.call(this);
    init_energyBar.call(this);



    init_BookMenu.call(this);
    init_SoundMenu.call(this);
    init_CloseMenu.call(this);
    init_HomeMenu.call(this)




    this.setBackPos.call(this, this.offsetToLeft)
    this.setBookPos.call(this,1920-this.offsetToLeft);
    this.setEnergyBarPos.call(this,Number(1920-this.offsetToLeft-this.bookBtn.width-this.buttonsOffset));
    this.setSoundPos.call(this,1920-this.offsetToLeft);

    this.setClosePos.call(this,1920-this.offsetToLeft);
    this.setHomePos.call(this,this.offsetToLeft)

    this.addChild(this.barCtn);

    this.backBtn.on('pointerdown', this.gobackHandler);

    this.backBtnShow = true;
    this.homeBtnShow = false;
    this.energyBtnShow = true;
    this.bookBtnShow = true;


    this.updateGameMenu();

    //精彩部分;

    this.addChild(this.bookScene);


    this.addChild(this.starsLight);
    this.starsLight.pivot.y = 0;
    this.starsLight.pivot.x = this.starsLight.width;

    this.starsLight.y = 100;
    this.starsLight.x = 1400;
    this.starsLight.alpha = 0;
  }

   setBookPos($num){
    this.bookBtn.x = $num;
    this.bookBtn.y = this.offsetToTop;
  }
  //todo:设置能量条位置;
   setEnergyBarPos($num = 1800) {
    this.energyBar.x = $num;
    this.energyBar.y = this.offsetToTop;

  }
   setBackPos($num) {
    this.backBtn.x = $num;
    this.backBtn.y = this.offsetToTop;
  }
   setHomePos($num=0){
    this.homeBtn.x = $num;
    this.homeBtn.y = this.offsetToTop;
  }
   setClosePos($num=0){
    this.closeBtn.x = $num;
    this.closeBtn.y = this.offsetToTop;
  }
   setSoundPos($num=0){
    this.soundBtn.x = $num;
    this.soundBtn.y = this.offsetToTop;
  }
   setBookPos($num){
    this.bookBtn.x = $num;
    this.bookBtn.y = this.offsetToTop;
  }

  ///
  set backBtnShow($b){
    this._backBtnShow = $b;
    let myIndex = this.rightMenuUI.indexOf('backBtn');
    if($b){
      if(myIndex==-1){
        this.rightMenuUI.push("backBtn");
      }
    }else{
      if(myIndex!=-1){
        this.rightMenuUI.splice(myIndex,1);
      }
    }

  }
  get backBtnShow(){
    return this._backBtnShow;
  }
  set homeBtnShow($b){
    this._homeBtnShow = $b;
    let myIndex = this.rightMenuUI.indexOf('homeBtn');
    if($b){
      if(myIndex==-1){
        this.rightMenuUI.push("homeBtn");
      }
    }else{
      if(myIndex!=-1){
        this.rightMenuUI.splice(myIndex,1);
      }
    }

  }
  get homeBtnShow(){
    return this._homeBtnShow;
  }
//设置能量;
  set energyBtnShow($b){
    this._energyBtnShow = $b;
    let myIndex = this.rightMenuUI.indexOf('engerBtn');
    if($b){
      if(myIndex==-1){
        this.rightMenuUI.push("engerBtn");

      }
    }else{
      if(myIndex!=-1){
        this.rightMenuUI.splice(myIndex,1);
      }
    }
  }
  get energyBtnShow(){
    return this._energyBtnShow;
  }
//设置书本;
  set bookBtnShow($b){
    this._bookBtnShow = $b;
    let myIndex = this.rightMenuUI.indexOf('bookBtn');
    if($b){
      if(myIndex==-1){
        this.rightMenuUI.push("bookBtn");
      }
    }else{
      if(myIndex!=-1){
        this.rightMenuUI.splice(myIndex,1);
      }
    }
  }
  get bookBtnShow(){
    return this._bookBtnShow;
  }
  //设置声音;
  set soundBtnShow($b){
    this._soundBtnShow = $b;
    let myIndex = this.rightMenuUI.indexOf('soundBtn');
    if($b){
      if(myIndex==-1){
        this.rightMenuUI.push("soundBtn");
      }
    }else{
      if(myIndex!=-1){
        this.rightMenuUI.splice(myIndex,1);
      }
    }
  }

  //设置Close;
  set closeBtnShow($b){
    this._closeBtnShow = $b;
    let myIndex = this.rightMenuUI.indexOf('closeBtn');
    if($b){
      if(myIndex==-1){
        this.rightMenuUI.push("closeBtn");
      }
    }else{
      if(myIndex!=-1){
        this.rightMenuUI.splice(myIndex,1);
      }
    }
  }
  get closeBtnShow(){
    return this._closeBtnShow;
  }
  updateGameMenu(){
    if(this.rightMenuUI.indexOf('backBtn')==-1 && this.rightMenuUI.indexOf('homeBtn')!=-1){
        this.backBtn.interactive = false;
        this.homeBtn.interactive = true;
        this.backBtn.alpha = 0;
        this.homeBtn.alpha = 1;
        this.setBackPos.call(this,this.offsetToLeft+40+this.backBtn.width);
        this.setHomePos.call(this,this.offsetToLeft)
    }else if(this.rightMenuUI.indexOf('backBtn')!=-1 && this.rightMenuUI.indexOf('homeBtn')==-1){
        this.backBtn.interactive = true;
        this.homeBtn.interactive = false;
        this.backBtn.alpha = 1;
        this.homeBtn.alpha = 0;
        this.setHomePos.call(this,this.offsetToLeft+40+this.backBtn.width);
        this.setBackPos.call(this,this.offsetToLeft)
    }else if(this.rightMenuUI.indexOf('backBtn')!=-1 && this.rightMenuUI.indexOf('homeBtn')!=-1){
        this.backBtn.interactive = this.homeBtn.interactive = true;
        this.backBtn.alpha = this.homeBtn.alpha = 1;
        this.setBackPos.call(this,this.offsetToLeft+40+this.backBtn.width);
        this.setHomePos.call(this,this.offsetToLeft)

    }else if(this.rightMenuUI.indexOf('backBtn')==-1 && this.rightMenuUI.indexOf('homeBtn')==-1){
      this.backBtn.interactive = this.homeBtn.interactive = false;
      this.backBtn.alpha = this.homeBtn.alpha = 0;
      this.setBackPos.call(this,this.offsetToLeft+40+this.backBtn.width);
      this.setHomePos.call(this,this.offsetToLeft)
    }

    //右边;

    let newarr = this.rightMenuUI.filter((item)=>{
      return item!='backBtn'  && item!='homeBtn'
    });
    if(newarr.length>1){
      this.setEnergyBarPos.call(this,Number(1920-this.offsetToLeft-this.bookBtn.width-this.buttonsOffset));
    }else{
      this.setEnergyBarPos.call(this,Number(1920-this.offsetToLeft));

    }

    if(this.rightMenuUI.indexOf('soundBtn')!=-1){
      this.soundBtn.interactive = true;
      this.bookBtn.interactive = false;
      this.closeBtn.interactive = false;

      this.soundBtn.alpha = 1;
      this.bookBtn.alpha = 0;
      this.closeBtn.alpha = 0;
      this.setSoundPos.call(this,1920-this.offsetToLeft);

    }else if(this.rightMenuUI.indexOf('bookBtn')!=-1) {
      this.soundBtn.interactive = false;
      this.bookBtn.interactive = true;
      this.closeBtn.interactive = false;

      this.soundBtn.alpha = 0;
      this.bookBtn.alpha = 1;
      this.closeBtn.alpha = 0;
      this.setBookPos.call(this, 1920 - this.offsetToLeft);

    }else if(this.rightMenuUI.indexOf('closeBtn')!=-1) {
      this.soundBtn.interactive = false;
      this.bookBtn.interactive = false;
      this.closeBtn.interactive = true;

      this.soundBtn.alpha = 0;
      this.bookBtn.alpha = 0;
      this.closeBtn.alpha = 1;
      this.setClosePos.call(this, 1920 - this.offsetToLeft);
    }else{
      this.soundBtn.interactive = false;
      this.bookBtn.interactive = false;
      this.closeBtn.interactive = false;
      this.soundBtn.alpha = 0;
      this.bookBtn.alpha = 0;
      this.closeBtn.alpha = 0;
    }

  }
  playStars(){

    this.starsLight.state.setAnimation(0,'star',false);
    this.starsLight.state.tracks[0].trackTime = 0;
    this.starsLight.alpha = 1;

    createjs.Sound.play('power_gain')


  }

  foldUp($time=.3){


    TweenMax.to(this.barCtn,$time,{
      y:-300,
      alpha:0
    })

  }
  foldDown($time=.3){
    TweenMax.to(this.barCtn,$time,{
      y:0,
      alpha:1
    })
  }
  //

  destroyed(){
    this.rightMenuUI = [];
    if(this.bookScene){
      this.bookScene.destroyed();
      this.bookScene.destroy();
    }
    if(this.starsLight){
      this.starsLight.destroy();
    }
    if(this.backBtn){
      this.backBtn.destroy();
    }
    if(this.energyBar){
      this.energyBar.destroy();
    }
    if(this.bookBtn){
      this.bookBtn.destroy();
    }
    if(this.homeBtn){
      this.homeBtn.destroy();
    }
    if(this.closeBtn){
      this.closeBtn.destroy();
    }
    if(this.soundBtn){
      this.soundBtn.destroy();
    }
    super.destroy();
    this.destroy();
   // this.bookScene = null;
    this.offsetToTop = null;
    this.offsetToLeft = null;

    this.energyBar = null;
    this.backBtn = null;
    this.energyMask = null;//游戏的能量条遮罩
    this.bookBtn = null;
    this.closeBtn = null
    this.soundBtn = null;
    this.homeBtn = null;
    this.energyNumber = null;
    this.buttonsOffset = null;//按钮间距

    //setter
    this._backBtnShow = null;
    this._homeBtnShow = null;
    this._energyBtnShow = null;
    this._bookBtnShow = null;
    this._closeBtnShow = null;
    this._soundBtnShow = null;

    this.clearGameMenuEvents();


  }
  //TODO:事件分发部分;
  clearGameMenuEvents(){


    if(this.closeBtnHandler){

      this.closeBtnHandler = null;
    }
    if(this.backBtnHandler){

      this.backBtnHandler = null;
    }
    if(this.homeBtnHandler){

      this.homeBtnHandler = null;
    }
    if(this.soundBtnHandler){

      this.soundBtnHandler = null;
    }
    if(this.bookBtnHandler){

      this.bookBtnHandler = null;
    }
  }
  setCloseBtn_tapHandler($handler){

    this.closeBtnHandler = $handler;
    this.closeBtn.on('pointertap',this.closeBtnHandler,this);
  }
  setSoundBtn_tapHandler($handler){
    this.soundBtnHandler = $handler;
    this.soundBtn.on('pointertap',this.soundBtnHandler,this);
  }
  setBookBtn_tapHandler($handler){
    this.bookBtnHandler = $handler;
    this.bookBtn.on('pointertap',this.bookBtnHandler,this);
  }
  setBackBtn_tapHandler($handler){
    this.backBtnHandler = $handler;
    this.backBtn.on('pointertap',this.backBtnHandler,this);
  }
  setHomeBtn_tapHandler($handler){
    this.homeBtnHandler = $handler;
    this.homeBtn.on('pointertap',this.homeBtnHandler,this);
  }

  //精彩视觉部分@@@@@@@@@@@@@@@@@@@@@@@@

}

export default GameMenuBars;
