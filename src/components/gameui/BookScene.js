
import {checkForJumpRoute} from '../Utils.js'
import GameMenuBars from "./GameMenuBar";
import {PIXIAudio} from "../EasyPIXI";
import {Debugs} from "../Utils";
class BookScene extends PIXI.Container{
  constructor($options={}){
    super();
    const self  = this;
    this.resources = PIXI.loader.resources;
    this.bookAn = null;//魔法书
    this.openBookAnimating = false;
    this.closeBookAnimating = false;
    this.menuCloseBtn = null;
    this.boxes = [];
    this.energyCan = null;
    this.energyCanCtn1 = null;//未完成的各个UI
    this.energyCanCtn2 = null;//完成的UI；
    this.treasureBoxUI = null;//开启宝箱的结果页面UI
    this.leftBtn = null;
    this.rightBtn = null;
    this.currentPage = 0;

    //第一页的按钮;
    this.page1StartBtn = null;
    this.page2StartBtn = null;
    this.page3StartBtn = null;
    this.currentBookPage = 0;//第一页
    this.backGroundMask  = null;//一个黑色背景;

    this.isGo = true;
    this.isGoIndex = null;
    this.getOne = true;
    this.on('added',this.initial,this);

  }
   getSlotRegionByName($animation,$name){
    for(let i =0;i<$animation.slotContainers.length;i++){
      for (let k=0;k<$animation.slotContainers[i].children.length;k++){
        if($animation.slotContainers[i].children[k].region.name==$name){
          return $animation.slotContainers[i]
        }
      }
    }
  }

  getCardPromise($number){
    const self = this;
    let getCardPromise = new Promise(function(resolve,reject){
      resolve($number);
    });
    getCardPromise.then((cardNum)=>{
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
    });
  }

  showBlackMask($time=.3){
    if(this.backGroundMask){
     // Tween
      this.backGroundMask.interactive = true;
      TweenMax.to(this.backGroundMask,$time,{alpha:.8})
    }
  };
  hideBlackMask($time=.3){
    const self = this;
    if(this.backGroundMask){
      // Tween

      TweenMax.to(this.backGroundMask,$time,{alpha:0,onComplete:()=>{
          self.backGroundMask.interactive = false;
        }})
    }
  }

  initial(){
    const self  = this;

    self.backGroundMask = new PIXI.Graphics();
    self.backGroundMask.beginFill(0x000000);
    self.backGroundMask.drawRect(0,0,1920,1080);
    self.backGroundMask.endFill();
    self.backGroundMask.interactive = false;
    self.addChild(self.backGroundMask);
    self.backGroundMask.alpha = 0;

    if(this.energyCanCtn2){
      this.energyCanCtn2.alpha = 0;
    }
    if(this.energyCanCtn1){
      this.energyCanCtn1.alpha = 0;
    };
     self.menuCloseBtn =  new PIXI.Sprite(PIXI.Texture.from('menubtnClose_png'));//PIXI.loader.resources['menuBtnClose_png'].texture;
     self.menuCloseBtn.interactive = false;
     self.menuCloseBtn.pivot.x = self.menuCloseBtn.width;
    self.menuCloseBtn.pivot.y = 0;
    self.addChild(self.menuCloseBtn);
    self.menuCloseBtn.alpha = 0;





    let energyCanTexture = self.resources['energyAnime_skeleton'].spineData;
    self.energyCan = new PIXI.spine.Spine(energyCanTexture);

    this.addChild( self.energyCan);



    self.energyCan.alpha = 0;
    self.energyCan.x = 1920/2;
    self.energyCan.y = 1080/2-50;
    ////
    let congracard = new PIXI.Sprite(self.resources['congracard_png'].texture);
    let texttable = new PIXI.Sprite(self.resources['texttable_png'].texture);
    self.treasureBoxUI = new PIXI.Container();


    self.treasureBoxUI.addChild(texttable)
    self.treasureBoxUI.addChild(congracard);
    texttable.scale.x = texttable.scale.y = 0.7;
    congracard.scale.x = congracard.scale.y = 0.7;
    texttable.y = -220;
    texttable.x = 20;
    congracard.y = 140;
    congracard.x = 30;
    self.addChild(self.treasureBoxUI);
    self.treasureBoxUI.x = 1920/2-250;
    self.treasureBoxUI.y = 500;
    self.treasureBoxUI.alpha = 0;
    var boxTexture = self.resources['boxAnime_skeleton'].spineData;
    for(let i=0;i<3;i++){
      this.boxes.push(new PIXI.spine.Spine(boxTexture));
      this.boxes[i].alpha = 0;
      this.boxes[i].x = 400+i*this.boxes[0].width/1.2;
      this.boxes[i].y = 1080/2;
      this.addChild(this.boxes[i])
      this.boxes[i].interactive = false;

      this.boxes[i].on('pointerdown',self.boxPointerDown_handler.bind(self,i),self)
    }

    var bookTexture =  self.resources["bookAnime_skeleton"].spineData;
    this.bookAn = new PIXI.spine.Spine(bookTexture);
    this.addChild(this.bookAn)
    this.bookAn.x = 920;
    this.bookAn.y = 600;
    this.bookAn.alpha = 0;

    this.page1StartBtn = new PIXI.Graphics();
    this.page1StartBtn.beginFill(0xff0000,0);
    this.page1StartBtn.drawRect(-10,-30,260,150);
    this.page1StartBtn.endFill();
    this.page1StartBtn.x = 150;
    this.page1StartBtn.y = 75;


    this.page2StartBtn = new PIXI.Graphics();
    this.page2StartBtn.beginFill(0xff0000,0);
    this.page2StartBtn.drawRect(-10,-30,260,150);
    this.page2StartBtn.endFill();
    this.page2StartBtn.x = -390;
    this.page2StartBtn.y = 80;






    var closeBtn = new PIXI.Graphics();
    closeBtn.beginFill(0xff0000,0.1);
    closeBtn.drawRect(0,0,120,120);
    closeBtn.endFill();
    closeBtn.x = 1710;
    closeBtn.y = 20;

    self.rightBtn = new PIXI.Graphics();

    self.rightBtn.beginFill(0xff0000,0.2);
    self.rightBtn.drawRect(10,-320,560,620);

    self.rightBtn.endFill();
    self.leftBtn = self.rightBtn.clone();
    self.leftBtn.x = -590;

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

      PIXIAudio.audios['book_turn'].play();

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

    })
    self.leftBtn.on('pointerdown',()=>{
      if(self.currentPage<=0){
        self.currentPage = 0;
        return;
      }

      PIXIAudio.audios['book_turn'].play();

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
    self.leftBtn.interactive = false;
    self.rightBtn.interactive = false;
    self.leftBtn.alpha = self.rightBtn.alpha = 0;
    //
    self.menuCloseBtn.alpha = 0;
    self.menuCloseBtn.interactive = false;
    self.menuCloseBtn.pivot.x = self.menuCloseBtn.width;
    self.menuCloseBtn.pivot.y = 0;

    self.menuCloseBtn.x = 1920-90;
    self.menuCloseBtn.y = 35;
  }

  //选择游戏按钮逻辑;
  page1StartBtn_tapHandler(){
    if(this.currentPage==0 && GameMenuBars.vueInstance.allGameCards>=4){
    //找你妹;
      window.parent.postMessage({
        type: "enterGame",
        game:1
      }, "*");
      Debugs.log('找你妹游戏开启')
    }else if(this.currentPage==1 && GameMenuBars.vueInstance.allGameCards>=12){
      window.parent.postMessage({
        type: "enterGame",
        game:3
      }, "*");
      Debugs.log('跑酷游戏开启')
    }

  }
  page2StartBtn_tapHandler(){
    if(this.currentPage==1 && GameMenuBars.vueInstance.allGameCards>=8){
      //找你妹;
      window.parent.postMessage({
        type: "enterGame",
        game:2
      }, "*");
      Debugs.log('换装游戏开启')
    }
  }
  //todo:某个宝箱单独按下
  boxPointerDown_handler(index,event){
    const self = this;
    var boxIndex = index;
    var EventTarget = event.currentTarget;
    EventTarget.interactive = false;
    self.boxes.forEach((item)=>{
      item.interactive = false;
      item.removeListener('pointerdown',self.boxPointerDown_handler,self);
    });


  //这个地方立即判断是否中奖;

     let mypromise = new Promise(function(resolve,reject){
       window.parent.postMessage({
         type: "stepSubmit",
         page:GameMenuBars.vueInstance.lessonCurrentPageIndex
       }, "*");
       window.parent.postMessage({
         type: "taskSubmit"
       }, "*");
       window.addEventListener('message', function(e) {
         if (e.data.type === 'getCard' && self.getOne) {
           self.getOne = false;
           resolve(Number(e.data.getCard));
         }else{
           if(self.isGo){
             resolve(1);
             self.isGo = false;
           }
         }
       });
       //看看得到卡片的结果是什么;
      // resolve(Math.floor(Math.random()*2));
      // resolve(0)
       //设置得到卡片，表示课程完成;
     });

    mypromise.then((value)=>{
      //中奖了
       if(value==1){
         GameMenuBars.vueInstance.SET_ALREADYHASONECARD(true);

         GameMenuBars.vueInstance.SET_GAMECARDS(GameMenuBars.vueInstance.allGameCards+1);

         TweenMax.to(EventTarget,1,{x:self.boxes[1].x,onStart:function(){
             self.boxes.forEach((item,_index)=>{
               if(_index!=boxIndex){
                 TweenMax.to(item,1,{alpha:0})
               }
             });
             let sound = new Audio('static/sound/box_right.mp3');
             sound.play();
           },onComplete:function(){
             EventTarget.state.setAnimation(0,'open1',false);
             //todo:让宝箱的UI消失
             setTimeout(()=>{
               TweenMax.to(self.treasureBoxUI,1,{alpha:1});
               //todo:打开魔法书后，页面及时跳转到主界面//
               setTimeout(()=>{

                 if(GameMenuBars.vueInstance.$route.fullPath=='/index'){
                   self.isGoIndex = true;
                 }else{
                   self.isGoIndex = false;
                 }
                 GameMenuBars.vueInstance.$router.push('/index')
                 TweenMax.to(self.treasureBoxUI,.5,{alpha:0});
                 TweenMax.to(EventTarget,.5,{alpha:0});

                 self.openBook();
                 if(self.isGoIndex){
                  // self.openBook();
                   Debugs.log('跳转宝箱')
                 }else{
                   GameMenuBars.vueInstance.SET_SHOWMAGICBOOK(true);
                 }
                 if(self.parent.parent.swiperHammer){
                   self.parent.parent.swiperHammer.lock = true;
                 }

               },1000);
             },1400);
           }})

       }else if(value==0){
         TweenMax.to(EventTarget,1,{alpha:1,onStart:function(){
             self.boxes.forEach((item,_index)=>{
               if(_index!=boxIndex){
                 TweenMax.to(item,1,{alpha:0})
               }
             });
             let sound = new Audio('static/sound/box_wrong.mp3');
             sound.play();
           },onComplete:function(){
             EventTarget.state.setAnimation(0,'open2',false);
             //todo:让宝箱的UI消失
             setTimeout(()=>{
               TweenMax.to(EventTarget,.5,{alpha:0});
               //todo:打开魔法书后，页面及时跳转到主界面;
               setTimeout(()=>{
                 GameMenuBars.vueInstance.$router.push('/index');

                    self.hideBlackMask();
                 if(self.parent.parent.swiperHammer){
                   self.parent.parent.swiperHammer.lock = true;
                 }
               },1000);
             },1400);
           }})
       }
    });
  }
  //Start翻书*****************************
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
      PIXIAudio.audios['bgSound'].play();

      this.leftBtn.interactive = this.rightBtn.interactive = false;
      if(this.currentPage==0){


          let track1 = this.bookAn.state.setAnimation(0,'close1',false);
          track1.listener = {
            complete:function(){
              self.closeBookAnimating = false;
              $callback();
              self.hideBlackMask()
              self.backGroundMask.interactive = false;
              if(self.parent.parent.swiperHammer){
                self.parent.parent.swiperHammer.lock = false;
              }
            }
          }
      }else{
         let track2 =  self.bookAn.state.setAnimation(0,'close2',false);
         track2.listener = {
           complete:function(){
             self.closeBookAnimating = false;
             $callback();
             self.hideBlackMask()
             self.backGroundMask.interactive = false;
             if(self.parent.parent.swiperHammer){
               self.parent.parent.swiperHammer.lock = false;
             }
           }
         }

      }
      this.currentPage = 0;


      PIXIAudio.audios['book_close'].play();
    }


  }

  openBook($callback=function(){}){
    const self = this;



    if(this.bookAn && this.openBookAnimating==false){
      self.showBlackMask();
      self.backGroundMask.interactive = true;
      this.openBookAnimating = true;
      this.bookAn.alpha = 1;
      this.boxes.forEach((item)=>{
        item.alpha = 0;
      });

      self.getCardPromise.call(self,GameMenuBars.vueInstance.allGameCards);
      self.page2StartBtn.interactive = self.page1StartBtn.interactive = false;
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
          self.menuCloseBtn.on('pointertap',self.menuCloseBtn_tapHandler,self)
        }
      }
      PIXIAudio.audios['book_open'].play();
    }
    setTimeout(()=>{
      self.leftBtn.interactive = self.rightBtn.interactive = true;
      $callback();
      self.openBookAnimating = false;
    },1500);
  }
  menuCloseBtn_tapHandler(event){
    const self = this;
    self.menuCloseBtn.alpha = 0;
    self.menuCloseBtn.interactive = false;
    self.closeBtnHandler(() => {

      self.menuCloseBtn.removeListener('pointertap',self.menuCloseBtn_tapHandler,self);



    });
  }


  //End翻书*****************************
  //Start开箱子******************************
  openBoxes(){
    if(this.boxes.length>0){
      this.bookAn.alpha = 0;
      this.boxes.forEach((item)=>{
        item.alpha = 1;
        item.state.setAnimation(0,'jump',true);
      })
    }
  }
  openEnergyCan($isEnd=false){
    const self =this;
    this.bookAn.alpha = 0;
    this.boxes.forEach((item)=>{
      item.alpha = 0;
    });
    if(self.parent.parent.swiperHammer){
      self.parent.parent.swiperHammer.lock = true;
    }


    self.showBlackMask();
    this.energyCan.alpha = 1;
    const MAX_TIME = 3.5;



    let currentTime = (GameMenuBars.vueInstance.$parent.completedLessonNum/GameMenuBars.vueInstance.$parent.allLessonsNum)*MAX_TIME;

    var track = this.energyCan.state.setAnimation(0,'power',false);
    let ticker = new PIXI.ticker.Ticker();
    self.energyCan.state.tracks[0].timeScale = 1;
    ticker.add(()=>{
      if(track.trackTime>=currentTime){
        showText($isEnd);
        ticker.stop();
        ticker.destroy();

        self.energyCan.state.tracks[0].timeScale  = 0;

      }
    });
    let sound = new Audio('static/sound/power_over.mp3');
    sound.play();
    ticker.start();
    if($isEnd){
      GameMenuBars.vueInstance.SET_GAMEHASBEENCOMPLETED(true);

    }
    function showText($isCompleted=false){
     // var
      if($isCompleted){


        self.energyCanCtn2 = new PIXI.Container();
        let text2 = new PIXI.Sprite(self.resources['text2_info'].texture);
        text2.pivot.x = text2.width/2;
        text2.y = 660;
        text2.x = 1920/2;

        let openBoxBtn = new PIXI.Sprite(self.resources['open_btn'].texture);
        openBoxBtn.pivot.x = openBoxBtn.width/2;
        openBoxBtn.x = 1920/2;
        openBoxBtn.y = 800;
        self.energyCanCtn2.addChild(openBoxBtn);

        openBoxBtn.interactive = true;
        openBoxBtn.on('pointerdown',self.openBox_pointerDown_handler,self);

        self.energyCanCtn2.addChild(text2);
        self.addChild(self.energyCanCtn2);




      }else{
        self.energyCanCtn1 = new PIXI.Container();
        let text1 = new PIXI.Sprite(self.resources['text1_info'].texture);
        text1.pivot.x = text1.width/2;
        text1.y = 660;
        text1.x = 1920/2;

        let continueBtn = new PIXI.Sprite(self.resources['continue_btn'].texture);
        continueBtn.pivot.x = continueBtn.width/2;
        continueBtn.x = 1920/2+200;
        continueBtn.y = 800;
        self.energyCanCtn1.addChild(continueBtn);

        let goHomeBtn = new PIXI.Sprite(self.resources['gohome_btn'].texture);
        goHomeBtn.pivot.x = goHomeBtn.width/2;
        goHomeBtn.x = 1920/2-200;
        goHomeBtn.y = 800;
        self.energyCanCtn1.addChild(goHomeBtn);

        continueBtn.interactive = goHomeBtn.interactive = false;
        continueBtn.on('pointerdown',self.continueBtn_pointerDown_handler,self);
        goHomeBtn.on('pointerdown',self.goHomeBtn_pointerDown_handler,self);

        self.energyCanCtn1.addChild(text1);
        self.addChild(self.energyCanCtn1)
        self.energyCanCtn1.alpha= 0;
        TweenMax.to(self.energyCanCtn1,1,{alpha:1,onComplete:function(){
            continueBtn.interactive = goHomeBtn.interactive = true;
          }});

      }
    }
  }
  hideAll_EnergyElement(){

    this.energyCan.alpha = 0;
    if(this.energyCanCtn1){
      this.energyCanCtn1.alpha = 0;
    }
    if(this.energyCanCtn2){
      this.energyCanCtn2.alpha = 0;
    }
  }
  //Interacitve Handler;
  openBox_pointerDown_handler(){
    this.hideAll_EnergyElement();
    this.openBoxes();
    GameMenuBars.vueInstance.SET_GAMESECONDPLAYED(true);//
    this.boxes.forEach((item)=>{
      item.interactive = true;
    })
  };
  continueBtn_pointerDown_handler(){
    checkForJumpRoute.call(GameMenuBars.vueInstance);
    this.hideAll_EnergyElement();
  };
  goHomeBtn_pointerDown_handler(){
    GameMenuBars.vueInstance.$router.push('/index/')
    this.hideAll_EnergyElement();


  };


}
export default  BookScene
