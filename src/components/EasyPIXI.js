
class PIXIAudio{

  static mainLoadStat = false;

  static audios = {};
  static loadedStatus = {};

  static reset(){
    PIXIAudio.mainLoadStat = false;
    PIXIAudio.loadedStatus = {};
    PIXIAudio.audios = {};
  }

  static init($manifest=[],$soundPath='static/sound/',$callback=function(){},$soundClassName='mainload'){
    var audioNum = 0;

    createjs.Sound.alternateExtensions = ["mp3"];	// if the passed extension is not supported, try this extension
    createjs.Sound.on("fileload", loadSound); // call handleLoad when each sound loads
    createjs.Sound.registerSounds($manifest, $soundPath);

    function loadSound(item){
      if(PIXIAudio.loadedStatus[$soundClassName] == 'completed')return;
      if(audioNum>=$manifest.length-1){
        $callback();
        PIXIAudio.loadedStatus[$soundClassName] = 'completed';
      }
      for(let i =0;i<$manifest.length;i++){
        if(PIXIAudio.audios[$manifest[i].id] == undefined){
          let myaudio  = createjs.Sound.createInstance($manifest[i].id);
          PIXIAudio.audios[$manifest[i].id] = myaudio;
        }
      }
      audioNum++;
    }
  }
  //add new audio;
  static addAudio($manifest,$soundPath='static/sound/',$callback=function(){},$soundClassName='subClass'){
    var audioNum = 0;
    createjs.Sound.on("fileload",(e)=>{
      if(PIXIAudio.loadedStatus[$soundClassName] == 'completed')return;
      if(audioNum>=$manifest.length-1){
        $callback();
        PIXIAudio.loadedStatus[$soundClassName] = 'completed';
      }
      for(let i =0;i<$manifest.length;i++){
        if(PIXIAudio.audios[$manifest[i].id] == undefined){
          let myaudio  = createjs.Sound.createInstance($manifest[i].id);
          PIXIAudio.audios[$manifest[i].id] = myaudio;
        }
      }
      audioNum++;
    }); // call handleLoad when each sound loads
    createjs.Sound.registerSounds($manifest, $soundPath);

  }
}

class AnimationSprite extends PIXI.Container {
  constructor() {
    super();
    this.soundTrumpet = null;
    this.status = 'stoping';
    this.resName = '';
    this.alienImages =  [];
    this.on('added', this.addedToStage, this);
  }

  addedToStage() {
    const self = this;
    let textureArray = [];
    for (let i = 0; i < this.alienImages.length; i++) {
      let texture = PIXI.loader.resources[self.resName].textures[self.alienImages[i]];
      textureArray.push(texture);
    }

    ;
    this.soundTrumpet = new PIXI.extras.AnimatedSprite(textureArray);
    this.soundTrumpet.animationSpeed = 0.08;
    this.stop();
    this.addChild(this.soundTrumpet)

  }

  play() {
    if(this.soundTrumpet){

      this.soundTrumpet.play();
      this.status = 'playing';
    }


  }

  stop($num=2) {
    this.status = 'stoping';
    this.soundTrumpet.gotoAndStop($num);
  }
  set speed($num=1){
    this.soundTrumpet.animationSpeed = $num;
  }
};

  class pixiAnimation{
    constructor($atlasName){
      // super();
      this.textureArr = [];
      this.speed = 1;
      this.yoyo = false;
      this.mc= null;

      this.currentFrames = 0;
      this.framesArr = [];
      this.yoyoTweenMax = null;
      let alienImages = PIXI.loader.resources[$atlasName].textures;
      for(let i in alienImages){
        this.textureArr.push(alienImages[i])
      }
    }
    create(){
      this.mc = new PIXI.extras.AnimatedSprite(this.textureArr);
      this.mc.animationSpeed = this.speed;
      return this.mc;
    }
    yoyoTween(){
      if(this.yoyoTweenMax){
        return this.yoyoTweenMax;
        //return this.yoyoTweenMax;
      }
    }

    playYoyo($totalFrames=3,$time=1){
      const self = this;
      // if(this.yoyoTweenMax){
      //   this.yoyoTweenMax.pause();
      //   this.yoyoTweenMax.restart();
      // }else{
      //   this.yoyoTweenMax = TweenMax.to(self,$time,{currentFrames:$totalFrames,yoyo:true,repeat:-1,onUpdate:function(){
      //       //if(self.currentFrames%1===0){
      //       //  if(tempFrames != Math.floor(self.currentFrames)){
      //       self.mc.gotoAndStop(Math.floor(self.currentFrames));
      //       // tempFrames = Math.floor(self.currentFrames);
      //       // console.log(self.currentFrames%1===0,self.currentFrames)
      //     }});
      // }
      this.yoyoTweenMax = TweenMax.to(self,$time,{currentFrames:$totalFrames,yoyo:true,repeat:2,onUpdate:function(){
          //if(self.currentFrames%1===0){
          //  if(tempFrames != Math.floor(self.currentFrames)){
          self.mc.gotoAndStop(Math.floor(self.currentFrames));
          // tempFrames = Math.floor(self.currentFrames);
          // console.log(self.currentFrames%1===0,self.currentFrames)
        }});
    }
}
class TimesTicker{
  constructor($callback=function(){},$times=1000,$repeatTimes=0){
    this.currentTimes = 0;
    this.times = $times;
    this.repeatTimes = $repeatTimes;
    this.timeTicker = null;
    this.timeTickerFun = null;
    this.callBack = $callback;
    this.isStart = true;
  }
  start(){
    const self = this;

    if(this.timeTicker){
      clearTimeout(this.timeTicker);
      this.timeTicker = null;
    }
    if(this.timeTickerFun){
      this.timeTickerFun = null;
    }
    this.isStart = true;
    this.currentTimes = 0;
    this.timeTickerFun = ()=>{
      this.timeTicker = setTimeout(()=>{
        if(self.isStart)return;

        if(self.currentTimes<$repeatTimes && self.currentTimes>-1){
          self.timeTickerFun();
        }

      },self.times);
      //logics;
      self.callBack();
      self.currentTimes+=1;
    }
  }
  pause(){
    this.isStart = false;
  }
  resume(){
    this.isStart = true;
  }
  destroy(){
    if(this.timeTicker){
      clearTimeout(this.timeTicker);
      this.timeTicker = null;
    }
    if(this.timeTickerFun){
      this.timeTickerFun = null;
    }
    this.currentTimes = 0;
    this.isStart = null;
  }

}

class Broswer{
  static IsPC(){
    var userAgentInfo = navigator.userAgent;
    var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
      if (userAgentInfo.indexOf(Agents[v]) > 0) { flag = false; break; }
    }
    return flag;
  }
  static getVersion(){
    var u = navigator.userAgent, app = navigator.appVersion;
    return {
      trident: u.indexOf('Trident') > -1, //IE内核
      presto: u.indexOf('Presto') > -1, //opera内核
      webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
      gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1,//火狐内核
      mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
      ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
      android: u.indexOf('Android') > -1 || u.indexOf('Adr') > -1, //android终端
      iPhone: u.indexOf('iPhone') > -1 , //是否为iPhone或者QQHD浏览器
      iPad: u.indexOf('iPad') > -1, //是否iPad
      webApp: u.indexOf('Safari') == -1, //是否web应该程序，没有头部与底部
      weixin: u.indexOf('MicroMessenger') > -1, //是否微信 （2015-01-22新增）
      qq: u.match(/\sQQ/i) == " qq" //是否QQ
    };
  }
  static getLang(){
    return (navigator.browserLanguage || navigator.language).toLowerCase()
  }
}


export {pixiAnimation,TimesTicker,AnimationSprite,PIXIAudio,Broswer};
