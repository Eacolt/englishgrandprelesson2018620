
import {checkForJumpRoute} from '../Utils.js'

import { Debugs} from "../Utils";
class BookScene extends PIXI.Container{
  constructor(){
    super();
    const self  = this;
    this.resources = PIXI.loader.resources;
    this.menuCloseBtn = null;
    this.boxes = [];
    this.energyCan = null;
    this.energyCanCtn1 = null;//未完成的各个UI
    this.energyCanCtn2 = null;//完成的UI；
    this.treasureBoxUI = null;//开启宝箱的结果页面UI
    this.vueInstance = null;
    this.isGo = true;
    this.isGoIndex = null;
    this.backGroundMask = null;
    this.getOne = true;
    this.on('added',this.initial,this);

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
         page:self.vueInstance.lessonCurrentPageIndex
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
             resolve(1);//TODO：中奖
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
         self.vueInstance.SET_ALREADYHASONECARD(true);

         self.vueInstance.SET_GAMECARDS(self.vueInstance.allGameCards+1);

         TweenMax.to(EventTarget,1,{x:self.boxes[1].x,onStart:function(){
             self.boxes.forEach((item,_index)=>{
               if(_index!=boxIndex){
                 TweenMax.to(item,1,{alpha:0})
               }
             });



             createjs.Sound.play('box_right')
           },onComplete:function(){
             EventTarget.state.setAnimation(0,'open1',false);
             //todo:让宝箱的UI消失
             setTimeout(()=>{
               TweenMax.to(self.treasureBoxUI,1,{alpha:1});
               //todo:打开魔法书后，页面及时跳转到主界面//
               setTimeout(()=>{

                 if(self.vueInstance.$route.fullPath=='/index'){
                   self.isGoIndex = true;
                 }else{
                   self.isGoIndex = false;
                 }
                 self.vueInstance.$router.push('/index')
                 TweenMax.to(self.treasureBoxUI,.5,{alpha:0});
                 TweenMax.to(EventTarget,.5,{alpha:0});

                 // self.openBook();
                 if(self.isGoIndex){

                   Debugs.log('跳转宝箱')
                 }else{
                   self.vueInstance.SET_SHOWMAGICBOOK(true);
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


         //    PIXI.loader.resources['box_wrong'].sound.play();
             createjs.Sound.play('box_wrong')
           },onComplete:function(){
             EventTarget.state.setAnimation(0,'open2',false);
             //todo:让宝箱的UI消失
             setTimeout(()=>{
               TweenMax.to(EventTarget,.5,{alpha:0});
               //todo:打开魔法书后，页面及时跳转到主界面;
               setTimeout(()=>{
                 self.vueInstance.$router.push('/index');

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

  openBoxes(){
    if(this.boxes.length>0){
      this.boxes.forEach((item)=>{
        item.alpha = 1;
        item.state.setAnimation(0,'jump',true);
      })
    }
  }
  openEnergyCan($isEnd=false){
    const self =this;
    this.boxes.forEach((item)=>{
      item.alpha = 0;
    });
    if(self.parent.parent.swiperHammer){
      self.parent.parent.swiperHammer.lock = true;
    }
    self.showBlackMask();


    this.energyCan.alpha = 1;
    const MAX_TIME = 3.5;



    let currentTime = (self.vueInstance.$parent.completedLessonNum/self.vueInstance.$parent.allLessonsNum)*MAX_TIME;

    var track = this.energyCan.state.setAnimation(0,'power',false);
    let ticker = new PIXI.ticker.Ticker();
    self.energyCan.state.tracks[0].timeScale = 1;
    ticker.add(()=>{
      if(track.trackTime>=currentTime){
        showText($isEnd);
        ticker.stop();
        ticker.destroy();
        ticker = null;

        self.energyCan.state.tracks[0].timeScale  = 0;

      }
    });

    createjs.Sound.play('power_over')
    ticker.start();
    if($isEnd){
      self.vueInstance.SET_GAMEHASBEENCOMPLETED(true);


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
        // self.energyCanCtn1.alpha= 0;
        self.energyCanCtn1.alpha = 1;
        continueBtn.interactive = goHomeBtn.interactive = true;

        // TweenMax.to(self.energyCanCtn1,1,{alpha:1,onComplete:function(){
        //     continueBtn.interactive = goHomeBtn.interactive = true;
        //   }});

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
  //TODO:开启宝箱；
  openBox_pointerDown_handler(){
    this.hideAll_EnergyElement();
    this.openBoxes();
    this.vueInstance.SET_BOOKOPENED(1);//让书打开；
    this.vueInstance.SET_GAMESECONDPLAYED(true);//
    this.boxes.forEach((item)=>{
      item.interactive = true;
    })
  };
  continueBtn_pointerDown_handler(){
    var self = this;
    checkForJumpRoute.call(self.vueInstance);
    this.hideAll_EnergyElement();
  };
  goHomeBtn_pointerDown_handler(){
    this.vueInstance.$router.push('/index/')
    this.hideAll_EnergyElement();


  };
  destroyed(){
    if(this.boxes){
      this.boxes.forEach((item)=>{
        item.destroy();
      })
    }
    if(this.energyCan){
      this.energyCan.destroy();
    }
    if(this.treasureBoxUI){
      this.treasureBoxUI.destroy();
    }

    if(this.energyCanCtn1){
      this.energyCanCtn1.destroy();
    }
    if(this.energyCanCtn2){
      this.energyCanCtn2.destroy();
    }




    this.vueInstance = null;
    this.resources = null;
    this.menuCloseBtn = null;
    this.boxes = null;
    this.energyCan = null;
    this.energyCanCtn1 = null;//未完成的各个UI
    this.energyCanCtn2 = null;//完成的UI；
    this.treasureBoxUI = null;//开启宝箱的结果页面UI

    this.isGo = true;
    this.isGoIndex = null;
    this.getOne = true;
    super.destroy();
    this.destroy();
  }


}
export default  BookScene
