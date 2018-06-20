import {TweenMax} from 'gsap'
class Masker extends PIXI.Container{
  constructor(){
    super();
    this.maskerBg = null;
    this.on('added',this.addedToStage,this);
  }
  addedToStage(){
    this.maskerBg = new PIXI.Graphics();
    this.maskerBg.beginFill(0x000000,1);
    this.maskerBg.drawRect(0,0,1920,1080);
    this.maskerBg.endFill();
    this.maskerBg.interactive = false;
    this.addChild(this.maskerBg);
  }

  showMakser($time=.3,$callback=function(){}){
    const self = this;
    TweenMax.to(this.maskerBg,$time,{
      alpha:1,
      onStart:()=>{
        self.maskerBg.interactive = true;
      }
    })
  }
  hideMakser($time=.3,$callback=function(){}){
    const self = this;
    TweenMax.to(this.maskerBg,$time,{
      alpha:0,
      onComplete:()=>{
        self.maskerBg.interactive = false;
      }
    })
  }
}
export default Masker;
