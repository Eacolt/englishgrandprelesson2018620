import {LoadingAnimation} from "./gameui/GameManager";
import {TextureCache} from './Utils.js'
import PixiHammer from './gameui/PixiHammer.js'
import GameMenuBars from "./gameui/GameMenuBar.js";
import {PIXIAudio} from "./EasyPIXI";
import {Debugs} from "./Utils";


class PixiScene1 extends PIXI.Container {
  constructor($options) {
    super();
    this.gameConfig = $options.json;
    this.resource = PIXI.loader.resources;
    this.vueInstance = $options.vueInstance;

    this.gameMenuBar = null;

    this.gameLevel = 0;

    this.bearDefaultAn = null;
    this.swiperContainer = null;

    this.swiperPosition = -1;

    this.leftTouchBtn = null;//左边的按钮
    this.rightTouchBtn = null;//右边的按钮
    this.swiperHammer = null;
    this.swiperAnimating = false;

    this.ufoSlides = [];
    this.THEME_TYPE = null;



    this.on('added', this.addedToStage, this)
  }

  showMonsters() {
    for (let i = 0; i < this.ufoSlides.length; i++) {
      this.ufoSlides[i].alpha = 1;
    }
  }

  //展示中间的小怪物动画
  showFocusAnimation($index, $callBack) {

    if (this.ufoSlides.length > 0) {
      this.ufoSlides.forEach((item, index) => {

        item.getChildAt(1).state.setAnimation(0, 'standing', true);
      })
      this.ufoSlides[$index].getChildAt(1).state.setAnimation(0, 'ready', false);
      let track = this.ufoSlides[$index].getChildAt(1).state.addAnimation(0, 'working', true, 0);
      track.listener = {
        complete: function () {
          $callBack();

        }
      }
    }
  }

  updateFromVue(swiperX) {
    const self = this;
    if (!swiperX) return;

    // this.swiperContainer.x = swiperX/0.4
    this.ufoSlides.forEach((item, index) => {
      item.x = swiperX[index];
    });

  }

  clickonme($index, $callback = function () {
  }) {
    const self = this;
    //  this.ufoSlides[$index].getChildAt(1).state.setAnimation(0, 'ready', false);

    this.ufoSlides[$index].getChildAt(1).state.setAnimation(0, 'catching1', false);

    this.ufoSlides[$index].getChildAt(1).state.addListener({
      complete: function (entry) {
        if (entry.animation.name == 'catching1') {
          if ($callback) {
            $callback();
          }
        }
      }
    });
    GameMenuBars.freeze = true;
    // self.vueInstance.$parent.$refs.gameMenu.freeze = true;
  }
  createCommonAtlas($texturename){
    let sprite = new PIXI.Sprite(PIXI.loader.resources['commons_atlas'].textures[$texturename]);
    return sprite;
  }


  destroyed() {
    const self = this
    this.gameMenuBar.clearGameMenuEvents();
    this.gameMenuBar.destroy();
    this.gameMenuBar = null;
    this.ufoSlides = null
  }

  addedToStage() {
    const self = this;






    this.THEME_TYPE = self.vueInstance.gameThemeType;

    this.rightTouchBtn = new PIXI.Graphics();
    this.rightTouchBtn.beginFill(0xff0000);
    this.rightTouchBtn.drawRect(0, 0, 500, 700);
    this.rightTouchBtn.endFill();


    this.leftTouchBtn = new PIXI.Graphics();
    this.leftTouchBtn.beginFill(0xff0000);
    this.leftTouchBtn.drawRect(0, 0, 500, 700);
    this.leftTouchBtn.endFill();


    this.swiperContainer = new PIXI.Container();
    var ground = new PIXI.Sprite(self.resource['bgGround_jpg'].texture);
    var bgGround = new PIXI.Sprite(self.resource['indexback1_jpg'].texture);



    var boySpine = self.resource['boyskeleton'].spineData;
    var boy = new PIXI.spine.Spine(boySpine);
    boy.skeleton.setSkinByName('boy1');
    boy.skeleton.setSlotsToSetupPose();
    boy.state.setAnimation(0, 'hello1', true);
    boy.x = 1920 / 2 + 300;
    boy.y = 680;
    boy.scale.x = boy.scale.y = 0.36;


    switch (this.THEME_TYPE){
      case 1:
        boy.tint = 0xffbec4;
        break;
      case 2:
        boy.tint = 0xffd8a0;
        break;
      case 3:
        boy.tint = 0xdbff84;
        break;
      case 5:
        boy.tint = 0xe7c4ff;
        break;
      default:
        break;
    }
    //
    self.addChild(ground);
    self.addChild(boy)
    self.addChild(bgGround);
    Debugs.log('怪物列表：',this.vueInstance.$store.state.lessonPartsList)

    var monsterData="",lessonPartName="";
    for (let i = 0; i < this.vueInstance.$store.state.lessonPartsList.length; i++) {
      let slideUfo = new PIXI.Container();

      slideUfo.myIndex = i;
      lessonPartName = self.vueInstance.$store.state.lessonPartsList[i].name;

      switch (lessonPartName) {
        case 'song':
          monsterData = self.resource['indexMonster1_json'].spineData;
          break;
        case 'vocabulary':
          monsterData = self.resource['indexMonster2_json'].spineData;
          break;
        case 'sentences':
          monsterData = self.resource['indexMonster3_json'].spineData;
          break;
        case 'story':
          monsterData = self.resource['indexMonster4_json'].spineData;
          break;
        case 'grammar':
          monsterData = self.resource['indexMonster5_json'].spineData;
          break;
        case 'text':
          monsterData = self.resource['indexMonster6_json'].spineData;
          break;
        case 'ketpet':
          monsterData = self.resource['indexMonster7_json'].spineData;
          break;
        case 'reading':
          monsterData = self.resource['indexMonster8_json'].spineData;
          break;
        default:
          break;
      }
      Debugs.log('monsterData',monsterData)
      let monsters = new PIXI.spine.Spine(monsterData);
      monsters.state.setAnimation(0, 'standing', true);
      monsters.x = 308;
      monsters.y = -10;
      var tablebarStart = new PIXI.Sprite(self.resource['tablebar2_png'].texture);

      var plate =new PIXI.Sprite(self.resource['table_png'].texture);
      var tablebarDefault = new PIXI.Sprite(self.resource['tablebar_png'].texture);

      slideUfo.addChild(plate);
      plate.y = 160;
      plate.x = 12;
      slideUfo.addChild(monsters);


      let progressBar = new PIXI.Container()
      let progressMask = new PIXI.Graphics();
      progressMask.beginFill(0xff0000);
      progressMask.drawRect(0, 0, plate.width, 40);
      progressMask.endFill();
      progressBar.addChild(tablebarDefault);
      progressBar.addChild(tablebarStart);
      progressBar.addChild(progressMask);
      tablebarStart.mask = progressMask;
      progressBar.pivot.x = progressBar.width / 2;
      progressBar.pivot.y = progressBar.height / 2;
      progressBar.x = plate.width / 2 + 20;
      progressBar.y = 388;

      //得到各个课程的完成度情况，遍历meta.completed知道。
      function getPlusByCompleted() {
        let _arr = [];
        self.vueInstance.allLessonCompleteStat[i].forEach((item) => {
          _arr.push(Number(item.meta.completed))
        })
        //求和
        let _arrPlus = _arr.reduce((a, b) => {
          return a + b
        });
        return _arrPlus
      }

      progressMask.width =  getPlusByCompleted() / self.vueInstance.allLessonCompleteStat[i].length * tablebarStart.width;
      slideUfo.addChild(progressBar);
      var  text = new PIXI.Sprite(self.resource['tabletext_atlas'].textures[self.vueInstance.allPartNames[i] + '.png']);

      text.pivot.x = text.width / 2;
      text.x = plate.width / 2 + 26;
      text.y = 320;

      slideUfo.addChild(text)
      this.swiperContainer.addChild(slideUfo);
      this.ufoSlides.push(slideUfo)
      slideUfo.interactive = true;
      slideUfo.on('pointertap', this.ufoSlidePointerDown, this)
      slideUfo.y = 600;
    }

    this.ufoSlides.forEach((item, index) => {
      item.x = index * 650;
    });
    this.addChild(this.swiperContainer)

    this.swiperContainer.x = 650;
    this.swiperContainer.interactive = true;
//    this.swiperContainer.interactiveChildren = true;
    this.swiperContainer.on('tap', () => {

    });
    //赋值swiperPosition;
    this.swiperPosition = self.vueInstance.indexPageInitialSlide - 1

    this.interactive = true;
    this.on('pointerdown', this.scence_pointerdown, this);

    this.showFocusAnimation(self.swiperPosition + 1, function () {
    })
    this.swiperSlideTo.call(this, self.swiperPosition, function () {
    }, 0);
    this.swiperHammer = new PixiHammer({
      swiperContainer: self,
      swiperArea: {x: 0, width: 1920, y: 300, height: 1000}
    });
    this.swiperHammer.setMoveLeftCallBack(function () {
      if (self.swiperPosition >= self.ufoSlides.length -2) return;

      self.swiperAnimating = true;
      if (self.swiperPosition <= self.ufoSlides.length - 3) {
        self.swiperPosition++;
      }
      self.swiperSlideTo(self.swiperPosition, () => {
        self.showFocusAnimation(self.swiperPosition + 1, function () {
        })
      })
    });
    this.swiperHammer.setMoveRightCallBack(() => {

      if (self.swiperPosition <= -1) return;
      self.swiperAnimating = true;
      if (self.swiperPosition > -1) {
        self.swiperPosition--;
      }

      self.swiperSlideTo(self.swiperPosition, () => {

        self.showFocusAnimation(self.swiperPosition + 1, function () {
        })
      })
    });

    this.addChild(this.rightTouchBtn);
    this.addChild(this.leftTouchBtn)

    //顶部导航;

    GameMenuBars.vueInstance = self.vueInstance;
    this.gameMenuBar = new GameMenuBars();
    this.addChild(this.gameMenuBar);

    this.gameMenuBar.backBtnShow = true;
    this.gameMenuBar.homeBtnShow = false;
    this.gameMenuBar.bookBtnShow = true;
    this.gameMenuBar.soundBtnShow = false;
    this.gameMenuBar.updateGameMenu();
    GameMenuBars.freeze = false;
    setTimeout(()=>{
      //回到首页自动翻书
      if(self.vueInstance.showMagicBook && !GameMenuBars.gameHasOpendBook){
        self.swiperHammer.lock = true;
        self.gameMenuBar.bookScene.openBook();
        GameMenuBars.gameHasOpendBook = true;
        Debugs.log('首次打开翻书')
      }else if(Number(self.vueInstance.bookOpened) == 0 && self.vueInstance.gameHasBeenCompleted){
        self.gameMenuBar.bookScene.openEnergyCan(true);
        Debugs.log('再次打开能量条，因为宝箱未开就进来了',self.vueInstance.bookOpened,self.vueInstance.gameHasBeenCompleted)
      }else if(Number(self.vueInstance.openMagicBookByGameIndex)>=1){
        //从游戏回来的逻辑>>
        self.gameMenuBar.bookScene.openBook();
        self.swiperHammer.lock = true;
        self.vueInstance.SET_MAGICBOOKBYGAMEINDEX(-1);
        Debugs.log('从游戏回来打开翻书')
      }

    },200);
    this.gameMenuBar.setBackBtn_tapHandler(() => {
      //返回主目录;

        window.parent.postMessage({
          "type": "preparationClose"
        }, "*");
    });
    this.gameMenuBar.setBookBtn_tapHandler(() => {
      if (GameMenuBars.freeze) return;
      self.swiperHammer.lock = true;
      self.gameMenuBar.bookScene.openBook();
    });
    self.vueInstance.$watch(()=>{
      return self.vueInstance.energyCurrentNum
    },(newval)=>{
      this.gameMenuBar.energy = newval;
    });
    this.gameMenuBar.energyOnce = self.vueInstance.energyCurrentNum;
    this.leftTouchBtn.x = 50;
    this.leftTouchBtn.y = 300;
    this.rightTouchBtn.x = 1400;
    this.rightTouchBtn.y = 300;
    this.rightTouchBtn.alpha = this.leftTouchBtn.alpha = 0;
    this.rightTouchBtn.interactive = true;
    this.leftTouchBtn.interactive = true;
    this.rightTouchBtn.on('pointertap', this.rightAreaPointerTap, this);
    this.leftTouchBtn.on('pointertap', this.leftAreaPointerTap, this);
  }
  //End Added
  swiperSlideTo($n, $callback = function () {
  }, $time = 0.3) {
    const self = this;
    TweenMax.to(this.swiperContainer, $time, {
      x: $n * 650 * -1, onComplete: function () {
        $callback();
        self.swiperAnimating = false;
      }, onStart: function () {
        self.swiperAnimating = true;
      }
    })
  };


  ufoSlidePointerDown(event) {
    const self = this;

    if (self.swiperHammer &&  self.swiperHammer.swiperMovedX == 0) {
      const myIndex = event.currentTarget.myIndex;
      self.leftTouchBtn.interactive = self.rightTouchBtn.interactive = false;
      self.swiperHammer.removeAllSwiperListener();
      self.swiperHammer = null;
      event.currentTarget.removeListener('pointertap', this.ufoSlidePointerDown, this)

      event.currentTarget.getChildAt(1).state.setAnimation(0, 'catching1', false);
      event.currentTarget.getChildAt(1).state.addListener({
        complete: function (entry) {
          if (entry.animation.name == 'catching1') {

            LoadingAnimation.setMaskShow(true)
            setTimeout(() => {
              self.vueInstance.$router.push('/index/' + self.vueInstance.lessonPartsList[myIndex].name);
              self.vueInstance.SET_LESSONPARTSINDEX(myIndex);
              self.vueInstance.SET_INDEXPAGEINITIALSLIDE(myIndex);
            }, 1000);
          }
        }
      });


      GameMenuBars.freeze = true;

      PIXIAudio.audios['hand_down2'].play()

      setTimeout(() => {

        PIXIAudio.audios['hand_up'].play();

      }, 1800);

    }


  }

  scence_pointerdown(event) {

    if (event.data.global.y > 325 && event.data.global.y < 1080) {

    }

  }

  leftAreaPointerTap() {

    const self = this;
    if (self.swiperHammer.swiperMovedX != 0) return;
    if (self.swiperPosition > -1) {
      self.swiperPosition--;
    }
    self.swiperSlideTo(self.swiperPosition, () => {
      self.showFocusAnimation(self.swiperPosition + 1, function () {
      })
    })
  }

  rightAreaPointerTap() {

    const self = this;


    if (self.swiperHammer.swiperMovedX != 0) return;

    if (self.swiperPosition <= self.ufoSlides.length - 3) {
      self.swiperPosition++;
    }
    self.swiperSlideTo(self.swiperPosition, () => {
      self.showFocusAnimation(self.swiperPosition + 1, function () {
      })
    })
  }


}

export default PixiScene1;
