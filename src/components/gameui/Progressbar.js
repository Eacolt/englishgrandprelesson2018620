import {Elastic} from 'gsap'
import {TextureCache} from "../Utils";
class ProgressBar extends PIXI.Container{
  constructor(){
    super();
    this.bar = null;
    this.bgBar = null;

    this.barWidth = 1;
    this.points = 3;
    this.progressText = null;
    this.progressBall = null;
    this.barClothLight = null;


    this.currentProgress = 0;

    this.on('added',this.initial,this)
  }
  initial(){

    this.setBar.call(this,{points:3,width:200})
  }

  set progress(x){
    const self = this;
    this.currentProgress = x;

    let movedX =(this.currentProgress/this.points)*(this.barWidth-50)+25;

    TweenMax.to(this.progressBall,1,{x:movedX,delay:0.4});
    TweenMax.to(this.barClothLight,1,{x: movedX+(-1*this.barWidth/2+20),delay:0.4});
   // self.barClothLight.x = movedX+(-1*this.barWidth/2+20);

    this.progressText.text = this.currentProgress+1;

  }
  get progress(){
    return this.currentProgress;
  }
  hideProgressBall(){
    TweenMax.to(this.progressBall.getChildAt(0),0.1,{alpha:0});

  }
  showProgressBall(){
    TweenMax.to(this.progressBall.getChildAt(0),1,{alpha:1,delay:0.4});

  }
  hideProgress($completeCB=function(){}){
    TweenMax.to(this,0.5,{y:1300,onComplete:()=>{
      $completeCB()
      }});
  }

  showProgress($completeCB=function(){}){
    TweenMax.to(this,0.5,{y:1024,onComplete:()=>{
        $completeCB();
      }})
  }
  setBar($option={}){
    const self = this;
    if(this.children.length>=1){
      this.removeAllListeners();
      this.removeChildren();
    }

    let _width = $option.width || 300;
    this.points = $option.points || 3;
    let pointsNum = this.points;
    this.barWidth = _width*pointsNum;
    this.bgBar = new PIXI.Sprite(PIXI.Texture.from('timeback_png'));
    this.bgBar.pivot.x = this.bgBar.width/2;
    this.bgBar.pivot.y = this.bgBar.height/2;
    this.bar = new PIXI.Graphics()
    this.bar.beginFill(0x535353,0);
    this.bar.drawRoundedRect(0,-12,this.barWidth,30,15);
    this.bar.endFill();


    let barCloth = new PIXI.Sprite(PIXI.Texture.from('timeline_png'));
    this.barClothLight = new PIXI.Sprite(PIXI.Texture.from('timepoint_png'));
    let barClothMask = new PIXI.Graphics();

    barClothMask.beginFill(0xff0000,1);
    barClothMask.drawRoundedRect(5,14,this.barWidth-6,26,14);
    barClothMask.endFill();
    barClothMask.y = -28;
    barClothMask.pivot.x = 0;


    barClothMask.x = -1*this.barWidth/2;

    this.bar.pivot.x = this.bar.width/2;
    this.bar.pivot.y = this.bar.height/2;
    this.bar.y = 15;

    barCloth.pivot.x = barCloth.width/2;
    barCloth.pivot.y = barCloth.height/2;

    this.barClothLight.pivot.x = this.barClothLight.width;
    this.barClothLight.pivot.y = this.barClothLight.height/2;
   // barClothLight.alpha = 0;

    barCloth.width = this.bar.width;
    barCloth.height = this.bar.height;
    this.barClothLight.width = this.bar.width;
    this.barClothLight.height = this.bar.height;
    this.barClothLight.x = -1*this.barWidth/2+20+25;


    this.barClothLight.mask = barClothMask;



    this.addChild(this.bgBar)
    this.addChild(barCloth)
    this.addChild(this.barClothLight)
    this.addChild(barClothMask)
    this.addChild(this.bar);

    this.progressBall = new PIXI.Sprite(PIXI.Texture.from('timekey_png'));


    let blueBall = new PIXI.Graphics();
    blueBall.beginFill(0x2ae9f0);
    blueBall.drawCircle(12.5,-6.5,25);
    blueBall.endFill();
    blueBall.alpha = 0;

    this.progressBall.pivot.y = this.progressBall.height/2+50;
    this.progressBall.pivot.x = this.progressBall.width/2;
    // this.progressBall.y = this.bar.y+this.bar.height/2
    this.progressBall.x =25;


    this.progressText=new PIXI.Text(this.progress+'',{
      fontFamily: 'Microsoft YaHei',
      fontSize: 54,

      fontWeight: 'bold',
      fill: 0xff9546, // gradient

    });
    this.progressText.pivot.x = this.progressText.width/2;
    this.progressText.pivot.y = this.progressText.height/2;
    this.progressText.x = 58;
    this.progressText.y = 42;
    this.progressBall.addChild(this.progressText);


    this.bar.addChild(this.progressBall)


  }

}
export default ProgressBar;
