
class Swiper extends PIXI.Container {
  constructor($options) {
    super();
    this.app = $options.app;
    this.loader = $options.loader;
    this.ticker = $options.ticker;

    this.swiperDirection = 'horizontal';


    this.slidePosArr = [];
    this.slidesArr = [];

    this.swiperCtn = null;
    this.wrapperMask = null;
    this.wrapper = null;

    this.slideWidth = 400;
    this.slideHeight = 200;

    this.swiperWidth = 1500;
    this.swiperHight = 200;
    this.slides = 6;
    this.offsetH = 20;



    this.ori_single_n = 0;//一旦需要折回的布尔值，触发一次需求；
    this.lastIndexBox = 0;//开始折回后的目标索引
    this.lastIndexBoxArr = [];//用于检测误判的数组
    this.on('added', this.addedToStage);
  }

  // set swiperX(x){
  //
  // }
  addedToStage() {
    const self = this;
    //////////////////
    if (self.swiperDirection == 'horizontal') {

      self.setUpHorizontal.call(self)
      self.startHorizontalMoving.call(self)
    } else if (self.swiperDirection == 'vertical') {
      self.setUpVertical.call(self)
      self.startVerticalMoving.call(self)


    }


  }

  setUpVertical() {
    const self = this;
    self.slidePosArr = [];

    self.wrapperMask = new PIXI.Graphics();
    self.wrapper = new PIXI.Container();
    for (let i = 0; i < self.slides; i++) {
      let box = new PIXI.Graphics();
      box.beginFill(0xcd6719);
      box.drawRect(0, 0, self.slideWidth, self.slideHeight);
      box.pivot.x = box.width / 2;
      box.pivot.y = box.height / 2;
      box.endFill();
      self.wrapper.addChild(box);
      box.y = (box.height + self.offsetH) * i;
      self.slidePosArr.push(box.y);
      self.slidesArr.push(box)
    }
    self.wrapper.x = 0;
    self.wrapper.y = 0;
    self.wrapperMask.beginFill(0x00ff00);
    self.wrapperMask.drawRect(0, 0, self.swiperWidth, self.swiperHight);
    self.wrapperMask.endFill();
    self.addChild(self.wrapperMask);
    self.wrapperMask.x = self.wrapper.x - self.wrapper.getChildAt(0).width / 2;
    self.wrapperMask.y = self.wrapper.y - self.wrapper.getChildAt(0).height / 2;
    self.wrapper.mask = self.wrapperMask;
    self.addChild(self.wrapper);

    self.wrapperMask.interactive = true;
    self.wrapperMask.interactiveChildren = true;


  }


  setUpHorizontal() {
    const self = this;
    self.slidePosArr = [];
    self.wrapperMask = new PIXI.Graphics();
    self.wrapper = new PIXI.Container();
    for (let i = 0; i < self.slides; i++) {

      let slideBox = new PIXI.Container();


      let box = new PIXI.Graphics();
      box.beginFill(0xcd6719);
      box.drawRect(0, 0, self.slideWidth, self.slideHeight);
      box.endFill();

      self.wrapper.addChild(slideBox);
      self.wrapper.addChild(box);
      //slideBox.mask = box;


      slideBox.x = (self.slideWidth + self.offsetH) * i;
      box.x = (self.slideWidth + self.offsetH) * i;
      self.slidePosArr.push(slideBox.x);

      self.slidesArr.push(slideBox);
    }
    self.wrapper.x = 0;
    self.wrapper.y = 0;
    self.wrapperMask.beginFill(0x00ff00);
    self.wrapperMask.drawRect(0, 0, self.swiperWidth, self.swiperHight);
    self.wrapperMask.endFill()
    self.addChild(self.wrapperMask);
    self.wrapperMask.x = self.wrapper.x - self.wrapper.getChildAt(0).width / 2;
    self.wrapperMask.y = self.wrapper.y - self.wrapper.getChildAt(0).height / 2;
    self.wrapper.mask = self.wrapperMask;
    self.addChild(self.wrapper);
    self.wrapperMask.interactive = true;
    self.wrapperMask.interactiveChildren = true;
  }

  startVerticalMoving() {
    const self = this;
    var callBackToPos = false;//让slide正确归位;
    var callBackOrigin = true;//归位,移动到正确节点后复原;

    var isFirstSwipe = false;
    var startMoving = false;
    var movingPosArr = [];
    var wrapperSlideUpY = this.y;
    var wrapperDistance = 0;//滑动的首部和鼠标落下的中间距离;
    self.wrapperMask.on('pointerdown', (event) => {
      movingPosArr = [];
      startMoving = true;
      //TweenMax.killAll();
      //   console.log('fuck')

      // wrapperDistance.wrapper.x - event.data
      wrapperDistance = event.data.global.y - self.wrapper.y;


    });


    self.wrapperMask.on('pointermove', (event) => {
      if (movingPosArr.length >= 5) {
        movingPosArr.shift()
      }

      if (startMoving) {
        movingPosArr.push(event.data.global.y);
        self.wrapper.y = event.data.global.y - wrapperDistance;
        if (self.wrapper.y >= 0) {
          self.wrapper.y = 0;
        }

        if (self.wrapper.y <= -1 * maxWrapperY) {
          self.wrapper.y = -1 * maxWrapperY;
        }
      }
    })
    self.wrapperMask.on('pointerup', pointerUpHandler,this);
    self.wrapperMask.on('pointerupoutside', pointerUpHandler,this)


    //self.on('pointerup', pointerUpHandler);
    function pointerUpHandler(event) {
      startMoving = false;
      let movingTl = null;
      let terminalDist = movingPosArr[movingPosArr.length - 1] - movingPosArr[0];
      wrapperSlideUpY = (self.wrapper.y + terminalDist) || self.y;
      console.log(wrapperSlideUpY)
      //callBackToPos = true;
      isFirstSwipe= true;

    }

    // var minWrapperX = self.wrapper.x;
    var maxWrapperY = self.wrapper.height - self.height - self.y;
    var tickerTime = 0;
    //
    var acspeed = 10;
    var acspeedCopy= acspeed;

    var dots = new PIXI.Graphics();
    dots.beginFill(0xff0000);
    dots.drawCircle(0, 0, 10);
    dots.endFill();
    //  self.addChild(dots)

    self.ticker.add(() => {
      if (tickerTime >= 999) {
        tickerTime = 0;
      }
      tickerTime++;
      if (startMoving == false) {

        // acspeed = (wrapperSlideUpY - self.wrapper.y) / 10;


        if (Math.abs(acspeed) <= 0.1 ) {
          acspeed = 0;

          let gl_y = self.slidesArr[1].toGlobal({x: 0, y: 0}).y;
          let gl_x = self.slidesArr[1].toGlobal({x: 0, y: 0}).x;

          let loc_x = self.toLocal({x: 0, y: 0}, self.slidesArr[1]).x;
          let loc_y = self.toLocal({x: 0, y: 0}, self.slidesArr[1]).y + self.slidesArr[1].height / 2;

          //  console.log('ti is:',loc_y);
          dots.x = loc_x;
          dots.y = loc_y;

          //取得所有位移中的坐标点;
          let mapsPoints = self.slidesArr.map((item, index) => {
            let loc_x = self.toLocal({x: 0, y: 0}, item).x;
            let loc_y = self.toLocal({x: 0, y: 0}, item).y + item.height / 2;
            return {x: loc_x, y: loc_y}

          });
          //匹配所有位移中各个点与Swiper中点的最近位置;
          let distMinArr = mapsPoints.map((item, index) => {
            let middlePoints = {x: item.x, y: self.swiperHight / 2};
            let dists = Math.sqrt((item.y - middlePoints.y) * (item.y - middlePoints.y));

            return dists;

            //  Math.min.apply(null,)

          });


        }

        if(!callBackToPos) {
          acspeed = (wrapperSlideUpY - self.wrapper.y) / 10;
          self.wrapper.y += acspeed;
          callBackOrigin = true;
        }

        if(Math.abs(acspeed)<=.2 && isFirstSwipe && callBackOrigin){
          acspeed = 0;
          callBackToPos = true;
          acspeedCopy =  (-200 - self.wrapper.y) / 10;
          self.wrapper.y += acspeedCopy;

          if(Math.abs(acspeedCopy)<=1){
            console.log('999')
            wrapperSlideUpY = self.wrapper.y;
            callBackToPos = false;

          }

        }


        if (self.wrapper.y >= 0) {
          self.wrapper.y = 0;
          acspeed = 0;
          ////
          let gl_y = self.slidesArr[1].toGlobal({x: 0, y: 0}).y;
          let gl_x = self.slidesArr[1].toGlobal({x: 0, y: 0}).x;

          let loc_x = self.toLocal({x: 0, y: 0}, self.slidesArr[1]).x;
          let loc_y = self.toLocal({x: 0, y: 0}, self.slidesArr[1]).y + self.slidesArr[1].height / 2;
          //  console.log('ti is:', loc_y);
          dots.x = loc_x;
          dots.y = loc_y;
        }
        if (self.wrapper.y <= -1 * maxWrapperY) {
          self.wrapper.y = -1 * maxWrapperY;
          acspeed = 0;
          ///
          let gl_y = self.slidesArr[1].toGlobal({x: 0, y: 0}).y;
          let gl_x = self.slidesArr[1].toGlobal({x: 0, y: 0}).x;

          let loc_x = self.toLocal({x: 0, y: 0}, self.slidesArr[1]).x;
          let loc_y = self.toLocal({x: 0, y: 0}, self.slidesArr[1]).y + self.slidesArr[1].height / 2;
          //  console.log('ti is:', loc_y);
          dots.x = loc_x;
          dots.y = loc_y;

        }


      }
      // console.log(acspeed)


    })
    self.ticker.start();

  }


  startHorizontalMoving() {
    const self = this;
    this.ori_single_n = 0;
    var callBackToPos = false;//让slide正确归位;
    var callBackOrigin = true;//归位,移动到正确节点后复原;
    var isFirstSwipe = false;
    var startMoving = false;
    var movingPosArr = [];
    var wrapperSlideUpX = this.x;
    var wrapperDistance = 0;//滑动的首部和鼠标落下的中间距离;
    self.wrapperMask.on('pointerdown', (event) => {
      movingPosArr = [];
      startMoving = true;

      wrapperDistance = event.data.global.x - self.wrapper.x;


    });


    self.wrapperMask.on('pointermove', (event) => {
      if (movingPosArr.length >= 5) {
        movingPosArr.shift()
      }


      if (startMoving) {
        movingPosArr.push(event.data.global.x);
        self.wrapper.x = event.data.global.x - wrapperDistance;
        if (self.wrapper.x >= 0) {
          self.wrapper.x = 0;
        }

        if (self.wrapper.x <= -1 * maxWrapperX) {
          self.wrapper.x = -1 * maxWrapperX;
        }
      }
    })
    self.wrapperMask.on('pointerup', pointerUpHandler,this);
    self.wrapperMask.on('pointerupoutside', pointerUpHandler,this)

    //self.on('pointerup', pointerUpHandler);
    function pointerUpHandler(event) {
      startMoving = false;
      let movingTl = null;
      let terminalDist = movingPosArr[movingPosArr.length - 1] - movingPosArr[0];
      wrapperSlideUpX = (self.wrapper.x + terminalDist) || self.x;
      console.log(wrapperSlideUpX)
      //callBackToPos = true;
      isFirstSwipe= true;

    }

    // var minWrapperX = self.wrapper.x;
    var maxWrapperX = self.wrapper.width - self.width - self.x;
    var tickerTime = 0;
    //
    var acspeed = 10;
    var acspeedCopy= acspeed;

    var dots = new PIXI.Graphics();
    dots.beginFill(0xff0000);
    dots.drawCircle(0, 0, 10);
    dots.endFill();
    //  self.addChild(dots)

    self.ticker.add(() => {
      if (tickerTime >= 999) {
        tickerTime = 0;
      }
      tickerTime++;
      if (startMoving == false) {

        // acspeed = (wrapperSlideUpY - self.wrapper.y) / 10;


        if (Math.abs(acspeed) <= 0.1 ) {
          acspeed = 0;
          //
          // let gl_y = self.slidesArr[1].toGlobal({x: 0, y: 0}).y;
          // let gl_x = self.slidesArr[1].toGlobal({x: 0, y: 0}).x;

          let loc_x = self.toLocal({x: 0, y: 0}, self.slidesArr[1]).x+ self.slidesArr[1].width / 2;
          let loc_y = self.toLocal({x: 0, y: 0}, self.slidesArr[1]).y;

          //  console.log('ti is:',loc_y);
          dots.x = loc_x;
          dots.y = loc_y;

          //取得所有位移中的坐标点;



          //var distMinArr = Math.min.apply(nul,mapsPoints)
        }

        if(!callBackToPos) {
          acspeed = (wrapperSlideUpX - self.wrapper.x) / 10;
          self.wrapper.x += acspeed;
          callBackOrigin = true;
          this.ori_single_n=0
          this.lastIndexBoxArr = [];






        }

        if(Math.abs(acspeed)<=.2 && isFirstSwipe && callBackOrigin && false){

          if(this.ori_single_n==1){
            var mapsPoints = self.slidesArr.map((item, index) => {
              let loc_x = self.toLocal({x: 0, y: 0}, item).x;
              let loc_y = self.toLocal({x: 0, y: 0}, item).y + item.height / 2;
              return Math.abs(Math.floor(loc_x))

            });
            var minNumber = Math.min.apply(null,mapsPoints)
            self.lastIndexBox = mapsPoints.indexOf(minNumber) ;

          }
          self.lastIndexBoxArr.push(self.lastIndexBox)

          console.log('lastIndex,',self.lastIndexBox)
          acspeed = 0;
          callBackToPos = true;
          // if(this.lastIndexBoxArr.length>1){
          //   acspeedCopy =  (self.slideWidth*this.lastIndexBox*-1- self.wrapper.x) / 10;
          // }
          let d = this.lastIndexBoxArr[1] == undefined ? 0 : (self.slideWidth*this.lastIndexBoxArr[1]*-1- self.wrapper.x)
           acspeedCopy =  (self.slideWidth*self.lastIndexBox*-1- self.wrapper.x) / 10;
          self.wrapper.x += acspeedCopy || 0;
          this.ori_single_n++;







          if(Math.abs(acspeedCopy)<=1 && callBackToPos){
          //  console.log('999')
            wrapperSlideUpX = self.wrapper.x;
            callBackToPos = false;
          }
        }
        if (self.wrapper.x >= 0) {
          self.wrapper.x = 0;
          acspeed = 0;
          ////
          let loc_x = self.toLocal({x: 0, y: 0}, self.slidesArr[1]).x+ self.slidesArr[1].width / 2;
          let loc_y = self.toLocal({x: 0, y: 0}, self.slidesArr[1]).y;
          //  console.log('ti is:', loc_y);
          dots.x = loc_x;
          dots.y = loc_y;
        }
        if (self.wrapper.x <= -1 * maxWrapperX) {
          self.wrapper.x = -1 * maxWrapperX;
          acspeed = 0;


          let loc_x = self.toLocal({x: 0, y: 0}, self.slidesArr[1]).x+ self.slidesArr[1].width / 2;
          let loc_y = self.toLocal({x: 0, y: 0}, self.slidesArr[1]).y;
          //  console.log('ti is:', loc_y);
          dots.x = loc_x;
          dots.y = loc_y;

        }


      }
      // console.log(acspeed)


    })
    self.ticker.start();

  }

}

export default Swiper;
