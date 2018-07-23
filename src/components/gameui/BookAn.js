class BookAn extends PIXI.Container{
  constructor($option){
    super();
    this.resources = PIXI.loader.resources;
    this.page1StartBtn = null;
    this.page2StartBtn = null;
    this.bookAn = null;
    this.rightBtn = null;
    this.leftBtn = null;
    this.openBookAnimating = false;
    this.closeBookAnimating = false;
    this.menuCloseBtn = null;
    this.backGroundMask = null;
    this.currentPage = 0;
    this.vueInstance = $option.vueInstance;
    this.on('added',this.addedToStage,this);
  }
  destroyed(){
    this.page1StartBtn.destroy();
    this.page2StartBtn.destroy();
    this.leftBtn.destroy();
    this.rightBtn.destroy();
    this.bookAn.destroy();
    this.menuCloseBtn.destroy();
    this.backGroundMask.destroy();

    this.resources = null;
    this.page1StartBtn = null;
    this.page2StartBtn = null;
    this.bookAn = null;
    this.rightBtn = null;
    this.leftBtn = null;
    this.openBookAnimating = false;
    this.closeBookAnimating = false;
    this.menuCloseBtn = null;
    this.backGroundMask = null;
    this.currentPage = 0;
    this.vueInstance = null;
  }

  addedToStage(){
    var self = this;

    self.backGroundMask = new PIXI.Graphics();
    self.backGroundMask.beginFill(0x000000);
    self.backGroundMask.drawRect(0,0,1920,1080);
    self.backGroundMask.endFill();
    self.backGroundMask.interactive = false;
    self.addChild(self.backGroundMask);
    self.backGroundMask.alpha = 0;


    self.menuCloseBtn =  new PIXI.Sprite(PIXI.Texture.from('menubtnClose_png'));//PIXI.loader.resources['menuBtnClose_png'].texture;
    self.menuCloseBtn.interactive = false;
    self.menuCloseBtn.pivot.x = self.menuCloseBtn.width;
    self.menuCloseBtn.pivot.y = 0;
    self.addChild(self.menuCloseBtn);
    self.menuCloseBtn.x = 1830;
    self.menuCloseBtn.y = 36;


    var bookTexture =  self.resources["bookAnime_skeleton"].spineData;
    this.bookAn = new PIXI.spine.Spine(bookTexture);
    this.addChild(this.bookAn)
    this.bookAn.x = 920;
    this.bookAn.y = 600;
    this.bookAn.alpha = 1;

    this.page1StartBtn = new PIXI.Graphics();
    this.page1StartBtn.beginFill(0xffffff,0);
    this.page1StartBtn.drawRect(-10,-30,260,150);
    this.page1StartBtn.endFill();
    this.page1StartBtn.x = 150;
    this.page1StartBtn.y = 75;


    this.page2StartBtn = new PIXI.Graphics();
    this.page2StartBtn.beginFill(0xffffff,0);
    this.page2StartBtn.drawRect(-10,-30,260,150);
    this.page2StartBtn.endFill();
    this.page2StartBtn.x = -390;
    this.page2StartBtn.y = 80;

    self.rightBtn = new PIXI.Graphics();
    self.rightBtn.beginFill(0xff0000,0);
    self.rightBtn.drawRect(10,-320,560,620);
    self.rightBtn.endFill();
    self.leftBtn = self.rightBtn.clone();
    self.leftBtn.x = -590;
    self.leftBtn.interactive = false;
    self.rightBtn.interactive = false;

    this.bookAn.addChild(self.rightBtn);
    this.bookAn.addChild(self.leftBtn);
    this.bookAn.addChild(this.page1StartBtn);
    this.bookAn.addChild(this.page2StartBtn);
    this.page1StartBtn.interactive = this.page2StartBtn.interactive = false;
    this.page1StartBtn.on('pointerdown',this.page1StartBtn_tapHandler,this);
    this.page2StartBtn.on('pointerdown',this.page2StartBtn_tapHandler,this);

    self.rightBtn.on('pointerdown',()=>{
      if(self.currentPage>=1){
        self.currentPage = 1;
        return;
      }
      let track = self.bookAn.state.setAnimation(0,'turnnext',false);
      self.currentPage++;
      createjs.Sound.play('book_turn')
      self.page1StartBtn.interactive = self.page2StartBtn.interactive = false;
      self.rightBtn.interactive = self.leftBtn.interactive = false;
      if(self.currentPage == 0){
        self.page2StartBtn.alpha = 0;
        self.page1StartBtn.alpha = 1;
      }else if(self.currentPage == 1){
        self.page2StartBtn.alpha = 1;
        self.page1StartBtn.alpha = 1;
      }
      track.listener = {
        complete:function(){
          self.page1StartBtn.interactive = self.page2StartBtn.interactive = true;
          self.rightBtn.interactive = self.leftBtn.interactive = true;
          self.bookAn.state.setAnimation(0,'stay2',true);
        }
      }
    });


    self.leftBtn.on('pointerdown',()=>{
      if(self.currentPage<=0){
        self.currentPage = 0;
        return;
      }
      // PIXI.loader.resources['book_turn'].sound.play();
      createjs.Sound.play('book_turn')
      self.page1StartBtn.interactive = self.page2StartBtn.interactive = false;
      let track = self.bookAn.state.setAnimation(0,'turnback',false);
      self.currentPage--;

      self.rightBtn.interactive = self.leftBtn.interactive = false;

      if(self.currentPage == 0){
        self.page2StartBtn.alpha = 0;
        self.page1StartBtn.alpha = 1;
      }else if(self.currentPage == 1){
        self.page2StartBtn.alpha = 1;
        self.page1StartBtn.alpha = 0;
      }

      track.listener = {
        complete:function(){
          self.page2StartBtn.interactive = false;
          self.page1StartBtn.interactive = true;
          self.rightBtn.interactive = self.leftBtn.interactive = true;
          self.bookAn.state.setAnimation(0,'stay1',true);
        }
      }


    });



    self.leftBtn.alpha = self.rightBtn.alpha = 1;







  }

  openBook($onstart=null,$callback=null){
    const self = this;
    if($onstart){
      $onstart();
    }

    if(this.openBookAnimating==false && this.closeBookAnimating == false){
      console.log('开口啊')
     self.showBlackMask();
     // self.backGroundMask.interactive = true;
      this.openBookAnimating = true;
      this.menuCloseBtn.alpha = 1;
       self.getCardPromise.call(self,self.vueInstance.allGameCards);
      // self.page2StartBtn.interactive = self.page1StartBtn.interactive = false;
      let track = this.bookAn.state.setAnimation(0,'open',false);
      if(self.currentPage == 0){
        self.page2StartBtn.alpha = 0;
        self.page1StartBtn.alpha = 1;
        self.page2StartBtn.interactive = false;
      }
      track.listener = {
        complete:function(){
          self.page1StartBtn.interactive = true;
          self.bookAn.state.setAnimation(0,'stay1',true);
          self.menuCloseBtn.alpha = 1;
          self.menuCloseBtn.interactive = true;
          self.menuCloseBtn.on('pointertap',self.menuCloseBtn_tapHandler,self);
          self.leftBtn.interactive = self.rightBtn.interactive = true;
          if($callback){
            $callback();
          }

        }
      }

      createjs.Sound.play('book_open')
    }
  }

  menuCloseBtn_tapHandler(event){
    const self = this;
    if(self.closeBookAnimating){
      return;
    }
    self.menuCloseBtn.alpha = 0;
    self.menuCloseBtn.interactive = false;

    self.closeBtnHandler(() => {
      if(self.parent.swiperHammer){
        self.parent.swiperHammer.lock = false;
      }

      self.openBookAnimating = false;
      self.menuCloseBtn.removeListener('pointertap',self.menuCloseBtn_tapHandler,self);
      self.hideBlackMask()

    });
  }

  //选择游戏按钮逻辑;
  page1StartBtn_tapHandler(){
    console.log('点到我啦')
    if(this.currentPage==0 && this.vueInstance.allGameCards>=4){
      //找你妹;
      window.parent.postMessage({
        type: "enterGame",
        game:1
      }, "*");

    }else if(this.currentPage==1 && this.vueInstance.allGameCards>=12){
      window.parent.postMessage({
        type: "enterGame",
        game:3
      }, "*");

    }

  }
  page2StartBtn_tapHandler(){
    console.log('点到22啦')
    if(this.currentPage==1 && this.vueInstance.allGameCards>=8){
      //找你妹;
      window.parent.postMessage({
        type: "enterGame",
        game:2
      }, "*");

    }
  }


  //TODO:关闭书;
  closeBtnHandler($callback = function(){}){
    const self = this;


    if(self.page1StartBtn && self.page2StartBtn){
      self.page1StartBtn.interactive = false;
      self.page2StartBtn.interactive = false;
      self.page2StartBtn.alpha = self.page1StartBtn.alpha = 0;

    }

    if(this.closeBookAnimating==false){
      this.closeBookAnimating = true;
      // PIXI.loader.resources['bgSound'].sound.play();
      createjs.Sound.play('bgSound')
      this.leftBtn.interactive = this.rightBtn.interactive = false;
      if(this.currentPage==0){
        let track1 = this.bookAn.state.setAnimation(0,'close1',false);
        track1.listener = {
          complete:function(){
            self.closeBookAnimating = false;
            $callback();
           // self.hideBlackMask()
           // self.backGroundMask.interactive = false;

          }
        }
      }else{
        let track2 =  self.bookAn.state.setAnimation(0,'close2',false);
        track2.listener = {
          complete:function(){
            self.closeBookAnimating = false;
            $callback();
            self.hideBlackMask()
            //self.backGroundMask.interactive = false;

          }
        }

      }
      this.currentPage = 0;
      createjs.Sound.play('book_close')
    }


  }

  getCardPromise(cardNum){
    const self = this;

      if(cardNum==0)return;
      let whichCard = cardNum%4==0?4:cardNum%4;
      let whichPage = cardNum%4==0 ?  Math.floor(cardNum/4)-1  : Math.floor(cardNum/4);
      switch (whichPage){
        case 0:
          let slot1 = self.bookAn.skeleton.findSlot('page_imgs1');
          let myAttach1 =  self.bookAn.skeleton.getAttachment(slot1.data.index,'page_imgs1-'+whichCard)
          slot1.setAttachment(myAttach1);

          break;
        case 1:
          let _slot1 = self.bookAn.skeleton.findSlot('page_imgs1');
          let _myAttach1 =  self.bookAn.skeleton.getAttachment(_slot1.data.index,'page_imgs1-'+4)
          _slot1.setAttachment(_myAttach1);

          let _slot2 = self.bookAn.skeleton.findSlot('page_imgs2');
          let _myAttach2 =  self.bookAn.skeleton.getAttachment(_slot2.data.index,'page_imgs2-'+whichCard)
          _slot2.setAttachment(_myAttach2);
          break;
        case 2:
          let slot1_3 = self.bookAn.skeleton.findSlot('page_imgs1');
          let myAttach1_3 =  self.bookAn.skeleton.getAttachment(slot1_3.data.index,'page_imgs1-'+4)
          slot1_3.setAttachment(myAttach1_3);

          let slot2_3 = self.bookAn.skeleton.findSlot('page_imgs2');
          let myAttach2_3 =  self.bookAn.skeleton.getAttachment(slot2_3.data.index,'page_imgs2-'+4)
          slot2_3.setAttachment(myAttach2_3);

          let slot3_3 = self.bookAn.skeleton.findSlot('imgs_back');
          let myAttach3_3 =  self.bookAn.skeleton.getAttachment(slot3_3.data.index,'imgs_back-'+whichCard)
          slot3_3.setAttachment(myAttach3_3);
          break;
        default:
          break;
      }
    // });
  }

  showBlackMask(){
    if(this.backGroundMask){
      this.backGroundMask.interactive = true;
      this.backGroundMask.alpha = 0.8;
    }
  };
  hideBlackMask(){
    if(this.backGroundMask){
      this.backGroundMask.alpha = 0;
      this.backGroundMask.interactive = false;
    }
  }

}
export default BookAn;
