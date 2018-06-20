import $ from 'jquery'
import FormatDate from 'dateformat'
import {Debugs} from "../Utils";


class ControllBar extends PIXI.Container {
  constructor($option) {
    super();
    this.headbtnDraggable = false;
    this.gameConfig = $option.gameConfig;
    this.video = $option.video;
    this.vueInstance = $option.vueInstance;
    this.gameMenuBar = $option.gameMenu;


    this.videoLongTime = 0;
    this.videoCurrentTime = 0;
    this.videoTimeFormat = "";
    this.isPlaying = true;
    this.progressPercent = 0;

    this.progressWidth = 1362;
    this.draggableLongs = 0;
    this.playedProgressBar = null;//已经播放过了的长度;



    this.controlTimes = null;
    this.headbtn = this.progressbar = this.playbtn = this.pausebtn = null;

    this.clearAllDomListener = null;
    this.on('added', this.initial, this);


  }

  toClockTime($second) {
    if (Math.floor($second) == 0) {
      return '00:00';
    } else {
      return FormatDate(Math.floor($second) * 1000, "MM:ss")
    }
  }

  initial() {

    const self = this;

    var bgBlack = new PIXI.Graphics();
    bgBlack.beginFill(0x000000, 0.5);
    bgBlack.drawRect(0, 0, 1920, 120);
    bgBlack.endFill();
    this.addChild(bgBlack)

    this.videoLongTime = this.video.duration;

    this.videoTimeFormat = self.toClockTime(this.video.currentTime) + " / " + self.toClockTime(this.videoLongTime);


    this.controlTimes = new PIXI.Text(this.videoTimeFormat, {
      fontFamily: 'Arial',
      fontSize: 32,
      fontWeight: 'bold',
      fill: ['#ffffff'], // gradient
      stroke: '#4a1850',
      strokeThickness: 1,
    });
    this.playbtn = new PIXI.Sprite(PIXI.Texture.from('pausebtn_png'));
    this.playbtn.interactive = true;
    this.addChild(this.playbtn);
    //
    // this.playbtn.pivot.x = this.playbtn.widt
    // h/2;
    // this.playbtn.pivot.y = this.playbtn.height/2;
    this.playbtn.x = 90;
   this.playbtn.y = this.playbtn.height / 2 - 20


    this.progressbar = new PIXI.Graphics();
    this.progressbar.lineStyle(4,0x008bfb)
    this.progressbar.beginFill(0xd1e0ee);
    this.progressbar.drawRoundedRect(0, 0, this.progressWidth, 18, 10);
    this.progressbar.endFill();
    this.progressbar.shadowBox = new PIXI.Graphics();
    this.progressbar.shadowBox.beginFill(0x000000, 0.5);
    this.progressbar.shadowBox.drawRoundedRect(0, 0, this.progressWidth, 18, 9);
    this.progressbar.shadowBox.endFill();
    let colorMatrix = new PIXI.filters.BlurFilter();
    colorMatrix.blur = 5;
    this.progressbar.shadowBox.filters = [colorMatrix];
    this.progressbar.shadowBox.scale.y = 0.5;




    var progressMaskBar = new PIXI.Graphics();
    progressMaskBar.beginFill(0xd1e0ee);
    progressMaskBar.drawRoundedRect(0, 0, this.progressWidth, 18, 9);
    progressMaskBar.endFill();


    this.playedProgressBar = new PIXI.Graphics();
    //内部颜色
    this.playedProgressBar.beginFill(0x00b2ff);
    this.playedProgressBar.drawRect(0, 0, 100, 18);
    this.playedProgressBar.endFill();
    this.progressbar.addChild(progressMaskBar);
    this.playedProgressBar.mask = progressMaskBar;
    this.playedProgressBar.width = this.video.currentTime * this.progressPercent;

    this.progressbar.addChild(this.playedProgressBar);

    this.addChild(this.progressbar.shadowBox);
    this.addChild(this.progressbar);
    this.progressbar.x = this.playbtn.x + this.playbtn.width + 50;
    this.progressbar.y = this.height / 2 - 10;

    this.progressbar.shadowBox.y = this.progressbar.y + 12;
    this.progressbar.shadowBox.x = this.progressbar.x;


    var progressHitArea = new PIXI.Rectangle(0,-40,this.progressWidth,80)
    this.progressbar.hitArea = progressHitArea;

    this.addChild(this.controlTimes);
    this.controlTimes.x = this.progressbar.x + this.progressbar.width + 40;
    this.controlTimes.y = 38;

    this.headbtn = new PIXI.Sprite(PIXI.Texture.from('headbtn_png'));
    this.headbtn.pivot.y = this.headbtn.height / 2 - 5;
    this.progressbar.addChild(this.headbtn);
    this.progressbar.interactive = true;
    this.headbtn.interactive = true;
    this.headbtn.draggable = false;

    this.draggableLongs = this.progressWidth - this.headbtn.width / 2 - 20;

    this.headbtn.on('pointerdown', this.headbtnPointerDownHandler, this);

    this.headbtn.on('pointermove', this.headbtnPointerMoveHandler, this);
    this.parent.on('pointerup', this.headbtnPointerUpHandler, this);
    this.parent.on('pointerupoutside', this.headbtnPointerUpHandler, this);
    this.playbtn.on('pointerdown', this.changePlayBtnHandler, this);
    this.progressbar.on('pointerdown',this.clickProgressbar,this)
    this.video.addEventListener('timeupdate', this.videTimeupDateHandler.bind(self));
    this.clearAllDomListener = function(){
      self.video.removeEventListener('timeupdate',self.videTimeupDateHandler.bind(self))

    }
  }
  clearAllEvents(){

    this.headbtn.removeListener('pointermove', this.headbtnPointerMoveHandler, this);
    this.headbtn.removeListener('pointerup', this.headbtnPointerUpHandler, this);
    this.headbtn.removeListener('pointerupoutside', this.headbtnPointerUpHandler, this);
    this.playbtn.removeListener('pointerdown', this.changePlayBtnHandler, this);
    this.progressbar.removeListener('pointerdown',this.clickProgressbar,this)

    this.video.removeEventListener('timeupdate',this.videTimeupDateHandler,this);
  }
  videTimeupDateHandler(event) {
    const self = this;
      this.videoTimeFormat = this.toClockTime(event.currentTarget.currentTime) + " / " + this.toClockTime(this.videoLongTime);
      this.controlTimes.text = this.videoTimeFormat;
      this.headbtn.x = (event.currentTarget.currentTime / this.videoLongTime) * (this.progressWidth - 70 / 2 - 20);
      this.playedProgressBar.width = (event.currentTarget.currentTime / this.videoLongTime + 0.01) * this.draggableLongs;

      //显示完成;
      if(this.video.currentTime >= this.video.duration){

        self.video.removeEventListener('timeupdate',self.videTimeupDateHandler,self);
        //开始设置清算界面逻辑全套;
        self.vueInstance.$route.meta.completed = 1;
        self.vueInstance.setOwnLessonComplete();
        //【注意！】gameStat必须设置为0 ，让上部导航不可继续隐藏
        self.parent.gameStat = 0;



        //开始清算。。
        if(self.vueInstance.gameHasBeenCompleted == false){
          window.parent.postMessage({
            type: "stepSubmit",
            page:self.vueInstance.lessonCurrentPageIndex

          }, "*");
        };


        self.vueInstance.$watch(()=>{
          return self.vueInstance.energyCurrentNum
        },(newval)=>{
          self.gameMenuBar.energy = newval;
          self.gameMenuBar.playStars();
        });

        setTimeout(()=>{


          let isQingsuan = self.vueInstance.$route.name==self.vueInstance.restArrangementStat[self.vueInstance.restArrangementStat.length-1];//开始清算;
          if(isQingsuan && !self.vueInstance.gameHasBeenCompleted ){
            setTimeout(()=>{
            self.gameMenuBar.bookScene.openEnergyCan(false);
            },self.vueInstance.showPopupDelay)
          }
          setTimeout(()=>{

            if(self.vueInstance.alreadyHasOneCard){
              self.vueInstance.showCongra = true;
              let sound = new Audio('static/sound/win_jump.mp3');
              sound.play();
              return;
            }
            if(self.vueInstance.gameHasBeenCompleted && !self.vueInstance.alreadyHasOneCard){
             self.gameMenuBar.bookScene.openEnergyCan(true);
            }
            if(!self.vueInstance.gameHasBeenCompleted && isQingsuan==false){

              self.vueInstance.showCongra = true;
              let sound = new Audio('static/sound/win_jump.mp3');
              sound.play();

            };

          },self.vueInstance.showPopupDelay);
          self.vueInstance.updateRestArrangementStat();


        },1);
        //开始设置清算界面逻辑全套---END;



        ///////
      }

  }
  clickProgressbar(event){
    let offsetX = event.currentTarget.parent.x +event.currentTarget.x+this.headbtn.width/2;
    var moved = event.data.global.x - offsetX;
    this.progressPercent = moved / this.draggableLongs;
    this.headbtn.x = moved;
    this.playedProgressBar.width = (this.progressPercent + 0.01) * this.draggableLongs;
    this.video.currentTime = this.progressPercent * this.video.duration;
  }
  changePlayBtnHandler(event) {

    if (this.isPlaying) {
      event.currentTarget.texture = PIXI.Texture.from('playbtn_png');
      this.video.pause()
    } else {
      event.currentTarget.texture = PIXI.Texture.from('pausebtn_png')
      this.video.play()
    }
    this.isPlaying = !this.isPlaying;


  }

  headbtnPointerDownHandler(event) {
    this.headbtnDraggable = true;

  }

  headbtnPointerMoveHandler(event) {
    if (this.headbtnDraggable == true) {

      let offsetX = this.x + event.currentTarget.parent.x + event.currentTarget.width / 2;
      var moved = event.data.global.x - offsetX;
      // let longs = this.progressWidth-event.currentTarget.width/2-20
      //限制滑动范围;
      if (moved >= 0 && moved <= this.progressWidth - event.currentTarget.width / 2 - 20) {
        this.progressPercent = moved / this.draggableLongs;
        event.currentTarget.x = moved;
        this.video.currentTime = this.progressPercent * this.video.duration;
        this.playedProgressBar.width = (this.progressPercent + 0.01) * this.draggableLongs;

      }
      if(moved>=1220){





      }


    }


  }

  headbtnPointerUpHandler(event) {
    this.headbtnDraggable = false;

  }
}

export default ControllBar;
