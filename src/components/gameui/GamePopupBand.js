import {TweenMax} from 'gsap'
class GamePopupBand extends PIXI.Container {
  constructor() {
    super();
    this.bandAgain = null;
    this.bandNext = null;
    this.bandWin = null;

    this.quitBtn = null;//退出页面;
    this.resumeBtn = null;//继续学习


    this.popup_nextband = null;
    this.popup_resumeband = null;
    this.popup_winband = null;


    this._emitQuitPage = null;
    this._emitResumePage = null;
    this._emitAgainPage = null;

    this._maskBg = null;


    this.on('added', this.addedToStage, this);


  }

  setEmitQuitPage($callback = function () {
  }) {
    this._emitQuitPage = $callback;
    // if(this._emitQuitPage){
    //   this._emitQuitPage();
    // }
  }

  setEmitResumePage($callback = function () {
  }) {
    this._emitResumePage = $callback;
    // if(this._emitResumePage){
    //   this._emitResumePage();
    // }
  }

  setEmitAgainPage($callback = function () {
  }) {
    this._emitAgainPage = $callback;
    // if(this._emitAgainPage){
    //   this._emitAgainPage();
    // }
  };


  showPopupWinBand($time=0.3){
    const self = this;
    this.popup_winband.alpha = 1;
    TweenMax.to(this.popup_winband,$time,{
      alpha:1,
      onComplete:()=>{
        self.popup_winband.interactiveChildren  =true;
      }
    });
    TweenMax.to(this._maskBg,$time,{
      alpha:.8
    });

  };
  hidePopupWinBand($time=.3){
    TweenMax.to(this.popup_winband,$time,{
      alpha:0
    });
    TweenMax.to(this._maskBg,$time,{
      alpha:0
    });
    this.popup_winband.interactiveChildren =false;
  }


  showPopupResumeBand($time=0.3){
    const self = this;

    console.log('..',this._maskBg)
    TweenMax.to(this.popup_nextband,$time,{
      alpha:1,
      onComplete:()=>{
        self.popup_nextband.interactiveChildren  =true;
      }
    });
    TweenMax.to(this._maskBg,$time,{
      alpha:.8
    });

  };
  hidePopupResumeBand($time=.3){
    TweenMax.to(this.popup_nextband,$time,{
      alpha:0
    });
    TweenMax.to(this._maskBg,$time,{
      alpha:0,

    });
    this.popup_nextband.interactiveChildren =false;
  }


  showPopupAgainBand($time=0.3){
    const self = this;

    console.log('..',this._maskBg)
    TweenMax.to(this.popup_resumeband,$time,{
      alpha:1,
      onComplete:()=>{
        self.popup_resumeband.interactiveChildren  =true;
      }
    });
    TweenMax.to(this._maskBg,$time,{
      alpha:.8
    });

  };
  hidePopupAgainBand($time=.3){
    TweenMax.to(this.popup_resumeband,$time,{
      alpha:0
    });
    TweenMax.to(this._maskBg,$time,{
      alpha:0,

    });
    this.popup_resumeband.interactiveChildren =false;
  }
  addedToStage() {
    const self = this;

    this._maskBg = new PIXI.Graphics();
    this._maskBg.beginFill(0x000000);
    this._maskBg.drawRect(0,0,1920,1080);
    this._maskBg.endFill();
    this._maskBg.alpha = 0;

    this.addChild(this._maskBg);

    this.quitBtn = new PIXI.Sprite(PIXI.loader.resources['popupIconQuit_png'].texture);
    this.resumeBtn = new PIXI.Sprite(PIXI.loader.resources['popupIconResume_png'].texture);
    this.bandNext = new PIXI.Sprite(PIXI.loader.resources['popupIconbandNext_png'].texture);
    this.bandWin = new PIXI.Sprite(PIXI.loader.resources['popupIconbandWin_png'].texture);


    createPopupWinband.call(this);
    createPopupAgainband.call(this)
    createPopupNextband.call(this);


    this.popup_winband.interactiveChildren =false;
    this.popup_nextband.interactiveChildren = false;
    this.popup_resumeband.interactiveChildren = false;
    this.popup_nextband.alpha = this.popup_winband.alpha = this.popup_resumeband.alpha=0;

    // function d(){
    //   this.popup_nextband.alpha = 0;
    //   this.popup_resumeband.alpha = 0;
    // }
    //
    // d.call(this)


    function createPopupAgainband() {
      const self = this;
      this.popup_resumeband = new PIXI.Container();
      let quitBtn = new PIXI.Sprite(PIXI.loader.resources['popupIconQuit_png'].texture);
      let resumeBtn = new PIXI.Sprite(PIXI.loader.resources['popupIconResume_png'].texture);
      let bandAgain = new PIXI.Sprite(PIXI.loader.resources['popupIconbandAgain_png'].texture);
      bandAgain.pivot.x = bandAgain.width / 2;
      bandAgain.pivot.y = 0;
      this.popup_resumeband.addChild(bandAgain);
      this.popup_resumeband.addChild(quitBtn);
      this.popup_resumeband.addChild(resumeBtn);
      quitBtn.x = -360;
      quitBtn.y = 420;
      resumeBtn.x = 20;
      resumeBtn.y = 420;
      this.addChild(this.popup_resumeband);
      this.popup_resumeband.x = 1920 / 2;
      this.popup_resumeband.y = 200;

      quitBtn.interactive = resumeBtn.interactive = true;
      quitBtn.on('pointertap', this._emitQuitPage, this);
      resumeBtn.on('pointertap', (evt) => {
        self._emitAgainPage.call(self, evt)
      }, this);

    };

    function createPopupNextband() {
      const self = this;
      this.popup_nextband = new PIXI.Container();
      let quitBtn = new PIXI.Sprite(PIXI.loader.resources['popupIconQuit_png'].texture);
      let doNextBtn = new PIXI.Sprite(PIXI.loader.resources['popupIconNext_png'].texture);
      let bandAgain = new PIXI.Sprite(PIXI.loader.resources['popupIconbandNext_png'].texture);
      bandAgain.pivot.x = bandAgain.width / 2;
      bandAgain.pivot.y = 0;
      this.popup_nextband.addChild(bandAgain);
      this.popup_nextband.addChild(quitBtn);
      this.popup_nextband.addChild(doNextBtn);
      quitBtn.x = -360;
      quitBtn.y = 420;
      doNextBtn.x = 20;
      doNextBtn.y = 420;
      this.addChild(this.popup_nextband);
      this.popup_nextband.x = 1920 / 2;
      this.popup_nextband.y = 200;

      quitBtn.interactive = doNextBtn.interactive = true;
      quitBtn.on('pointertap', this._emitQuitPage, this);
      doNextBtn.on('pointertap', (evt) => {
        self._emitResumePage.call(self, evt);
      }, this);

    }

    function createPopupWinband() {
      const self = this;
      this.popup_winband = new PIXI.Container();
      let quitBtn = new PIXI.Sprite(PIXI.loader.resources['popupIconQuit_png'].texture);
      let doNextBtn = new PIXI.Sprite(PIXI.loader.resources['popupIconNext_png'].texture);
      let bandAgain = new PIXI.Sprite(PIXI.loader.resources['popupIconbandWin_png'].texture);
      bandAgain.pivot.x = bandAgain.width / 2;
      bandAgain.pivot.y = 0;
      this.popup_winband.addChild(bandAgain);
      this.popup_winband.addChild(quitBtn);
      this.popup_winband.addChild(doNextBtn);
      quitBtn.x = -360;
      quitBtn.y = 730;
      doNextBtn.x = 40;
      doNextBtn.y = 730;
      this.addChild(this.popup_winband);
      this.popup_winband.x = 1920 / 2;
      this.popup_winband.y = 50;
      quitBtn.interactive = doNextBtn.interactive = true;
      quitBtn.on('pointertap', this._emitQuitPage, this);
      doNextBtn.on('pointertap', (evt) => {
        self._emitResumePage.call(self, evt);
      }, this);

    }
  }
}

export default GamePopupBand;
