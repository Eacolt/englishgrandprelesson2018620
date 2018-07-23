
import PixiHammer from './gameui/PixiHammer.js'
import GameMenuBars from "./gameui/GameMenuBar.js";
import { Debugs} from "./Utils";
import {PIXIAudio} from "./EasyPIXI";
import BookAn from "./gameui/BookAn.js";


var gameMenuBar = null;
class PixiScene1 extends PIXI.Container {
  constructor($options) {
    super();
    this.resource = PIXI.loader.resources;
    this.vueInstance = $options.vueInstance;
    this.swiperContainer = null;
    this.swiperPosition = -1;
    this.leftTouchBtn = null;//左边的按钮
    this.rightTouchBtn = null;//右边的按钮
    this.swiperHammer = null;
    this.swiperAnimating = false;
    this.ufoSlides = [];
    this.THEME_TYPE = null;
    this.bookAn = null;
    this.on('added', this.addedToStage, this);
  }


  destroyed() {
    const self = this;
    if(gameMenuBar){
      gameMenuBar.destroyed();
      gameMenuBar.destroy();
    }
    if(this.bookAn){
      this.bookAn.destroyed();
    }

    if(this.ufoSlides){
      this.ufoSlides.forEach((item)=>{
        item.destroy();
      });
    }
    if(this.swiperHammer){
      this.swiperHammer.destroyed();
    }
    this.resource = null;
    this.vueInstance = null;

    gameMenuBar = null;
    this.swiperContainer = null;
    this.swiperPosition = null;
    this.leftTouchBtn = null;//左边的按钮
    this.rightTouchBtn = null;//右边的按钮
    this.swiperHammer = null;
    this.swiperAnimating = null;
    this.THEME_TYPE = null;
    this.ufoSlides = null;
    this.bookAn = null;
    super.destroy();
    this.destroy();

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

  addedToStage() {
    const self = this;

    // let bgsound = createjs.Sound.play("ground_music");
    // bgsound.volume = 1;

    PIXIAudio.audios['bgSound'].volume = 1;



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
    var ground = new PIXI.Sprite(PIXI.Texture.from('bgGround_jpg'));
    var bgGround = new PIXI.Sprite(PIXI.Texture.from('indexback1_jpg'));



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
      let slideUfo_ctn = new PIXI.Container();

      slideUfo_ctn.myIndex = i;
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
      var tablebarStart = new PIXI.Sprite(PIXI.Texture.from('tablebar2_png'));

      var plate =new PIXI.Sprite(self.resource['table_png'].texture);
      var tablebarDefault = new PIXI.Sprite(PIXI.Texture.from('tablebar_png'));

      slideUfo_ctn.addChild(plate);
      plate.y = 160;
      plate.x = 12;
      slideUfo_ctn.addChild(monsters);


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
      slideUfo_ctn.addChild(progressBar);
      var  text = new PIXI.Sprite(self.resource['tabletext_atlas'].textures[self.vueInstance.allPartNames[i] + '.png']);

      text.pivot.x = text.width / 2;
      text.x = plate.width / 2 + 26;
      text.y = 320;

      slideUfo_ctn.addChild(text)
      this.swiperContainer.addChild(slideUfo_ctn);
      this.ufoSlides.push(slideUfo_ctn)
      slideUfo_ctn.interactive = true;
      slideUfo_ctn.on('pointertap', this.ufoSlidePointerDown, this)
      slideUfo_ctn.y = 600;
    }

    this.ufoSlides.forEach((item, index) => {
      item.x = index * 650;
    });
    this.addChild(this.swiperContainer)

    this.swiperContainer.x = 650;
    this.swiperContainer.interactive = true;

    this.swiperPosition = self.vueInstance.indexPageInitialSlide - 1

    this.interactive = true;
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
    this.addChild(this.leftTouchBtn);

    GameMenuBars.vueInstance = self.vueInstance;
    gameMenuBar = new GameMenuBars();
    this.addChild(gameMenuBar);
    gameMenuBar.backBtnShow = true;
    gameMenuBar.homeBtnShow = false;
    gameMenuBar.bookBtnShow = true;
    gameMenuBar.soundBtnShow = false;
    gameMenuBar.updateGameMenu();
    GameMenuBars.freeze = false;
    setTimeout(()=>{
      //回到首页自动翻书
      if(self.vueInstance.showMagicBook && !GameMenuBars.gameHasOpendBook){
        if(self.swiperHammer){
          self.swiperHammer.lock = true;
        }

        self.bookAn.openBook(()=>{
          self.bookAn.alpha = 1
          console.log('openBook...')
        })
        GameMenuBars.gameHasOpendBook = true;
       // Debugs.log('首次打开翻书')
      }else if(Number(self.vueInstance.bookOpened) == 0 && self.vueInstance.gameHasBeenCompleted){
        gameMenuBar.bookScene.openEnergyCan(true);
       // Debugs.log('再次打开能量条，因为宝箱未开就进来了',self.vueInstance.bookOpened,self.vueInstance.gameHasBeenCompleted)
      }else if(Number(self.vueInstance.openMagicBookByGameIndex)>=1){
        //从游戏回来的逻辑>>


        self.bookAn.openBook(()=>{
          self.bookAn.alpha = 1
          console.log('openBook...')
        })
        if(self.swiperHammer){
          self.swiperHammer.lock = true;
        }

        self.vueInstance.SET_MAGICBOOKBYGAMEINDEX(-1);
      //  Debugs.log('从游戏回来打开翻书')
      }

    },100);
    gameMenuBar.setBackBtn_tapHandler(() => {
      //返回主目录;

        window.parent.postMessage({
          "type": "preparationClose"
        }, "*");
    });
    gameMenuBar.setBookBtn_tapHandler(() => {
      if (GameMenuBars.freeze) return;
      if(self.swiperHammer){
        self.swiperHammer.lock = true;
      }
      console.log("???")

      self.bookAn.openBook(()=>{
        self.bookAn.alpha = 1
        console.log('openBook...')
      })
    });
    self.vueInstance.$watch(()=>{
      return self.vueInstance.energyCurrentNum
    },(newval)=>{
      gameMenuBar.energy = newval;
    });
    gameMenuBar.energyOnce = self.vueInstance.energyCurrentNum;
    this.leftTouchBtn.x = 50;
    this.leftTouchBtn.y = 300;
    this.rightTouchBtn.x = 1400;
    this.rightTouchBtn.y = 300;
    this.rightTouchBtn.alpha = this.leftTouchBtn.alpha = 0;
    this.rightTouchBtn.interactive = true;
    this.leftTouchBtn.interactive = true;
    this.rightTouchBtn.on('pointertap', this.rightAreaPointerTap, this);
    this.leftTouchBtn.on('pointertap', this.leftAreaPointerTap, this);




    this.bookAn = new BookAn({vueInstance:self.vueInstance});
    this.addChild(this.bookAn);
    this.bookAn.alpha = 0;

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


              self.vueInstance.$router.push('/index/' + self.vueInstance.lessonPartsList[myIndex].name);
              self.vueInstance.SET_LESSONPARTSINDEX(myIndex);
              self.vueInstance.SET_INDEXPAGEINITIALSLIDE(myIndex);

          }
        }
      });


      GameMenuBars.freeze = true;

     // PIXI.loader.resources['hand_down2'].sound.play();
      createjs.Sound.play('hand_down2')

      setTimeout(() => {

      //  PIXI.loader.resources['hand_up'].sound.play();
        createjs.Sound.play('hand_up')
      }, 1800);

    }


  }


  leftAreaPointerTap() {

    const self = this;
    if (self.swiperHammer && self.swiperHammer.swiperMovedX != 0) return;
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


    if (self.swiperHammer  &&  self.swiperHammer.swiperMovedX != 0) return;

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
