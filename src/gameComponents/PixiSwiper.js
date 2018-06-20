class PixiSwiper extends PIXI.Container {
  constructor($options = null, $swiperOption = null) {
    super()
    this.ticker = $options.ticker;

    this.slideNum = $swiperOption.slides || 8;
    this.slideOffset = $swiperOption.slideOffset || 2;
    this.slideWidth = $swiperOption.slideWidth || 200;
    this.slideHeight = $swiperOption.slideHeight || 400;
    this.swiperDirection = $swiperOption.direction || 'horizontal';


    this.swiperWidth = $swiperOption.swiperWidth || 4 * (this.slideWidth + this.slideOffset);
    this.swiperHight = $swiperOption.swiperHight || this.slideHeight;
    //
    this.slideArr = [];

    this.wrapper = null;


    this.hitAreaRect = null;


    this.isSwiping = false;
    this.offsetSwiperHor = 0;


    this.pointerDownX = 0;
    this.lastPointerDownX = 0;//最后一次按下鼠标时候;
    this.movedDistX = 0;

    //位移偏移度数值库
    this.swiperOffsetsNumArr = [];
    //甩出去的距离，与偏移数值相关：是他们三个间隔值的差;
    this.tweensDistX = 0;
    //是否是第一次按下;
    this.clicked = false;

    this.thriods = 10;

    this.ternimalX = 0;


    this.on('added', this.initial, this);
  }

  initial() {
    const self = this;
    var swiperMaskBg = new PIXI.Graphics();
    swiperMaskBg.beginFill(0xff0000);
    swiperMaskBg.drawRect(0, 0, this.swiperWidth, this.swiperHight);
    swiperMaskBg.endFill();
    this.addChild(swiperMaskBg)


    var swiperMask = new PIXI.Graphics();
    swiperMask.beginFill(0xff0000);
    swiperMask.drawRect(0, 0, this.swiperWidth, this.swiperHight);
    swiperMask.endFill();
    this.addChild(swiperMask)


    this.wrapper = new PIXI.Container();
    //this.wrapper.interactive = true;
    this.interactive = true;


    if (this.swiperDirection == 'horizontal') {
      for (let i = 0; i < this.slideNum; i++) {
        let slideContainer = new PIXI.Container();
        slideContainer.width = 200;
        slideContainer.height = 400;
        let slideBg = new PIXI.Graphics();
        slideBg.beginFill(0xff0000);
        slideBg.drawRect(0, 0, this.slideWidth, this.slideHeight);
        slideBg.endFill();
        slideContainer.addChild(slideBg);
        this.wrapper.addChild(slideContainer);
        slideContainer.mask = slideBg;

        let slideBg2 = new PIXI.Graphics();
        slideBg2.beginFill(0x00ff00);
        slideBg2.drawRect(0, 0, 300, 400);
        slideBg2.endFill();
        slideContainer.addChild(slideBg2);

        slideContainer.x += i * (this.slideWidth + this.slideOffset);


      }
      this.addChild(this.wrapper)
      this.wrapper.mask = swiperMask;
    }
    //  this.interactive = true;
    //  this.hitArea = new PIXI.Rectangle(0,0,this.swiperWidth,this.swiperHight);

    this.on('pointerdown', this.swiperPressDownHandler, this);
    this.on('pointerup', this.swiperPressUpHandler, this);
    this.on('pointerupoutside', this.swiperPressUpHandler, this);
    this.on('pointermove', this.swiperPressMoveHandler, this);

    var tickerTimes = 0;
    var ticker = new PIXI.ticker.Ticker();
    ticker.add(() => {
      tickerTimes++;



      self.ternimalX  = self.movedDistX + (self.tweensDistX * 1.2);


      let offsetX = (self.ternimalX  - self.wrapper.x) / self.thriods;
      if(Math.abs(offsetX)<=0.01){
        offsetX = 0;
      }


      self.wrapper.x += offsetX;




    });
    ticker.start();


  }

  swiperPressDownHandler(event) {
    this.isSwiping = true;
    this.clicked = true;


    this.pointerDownX = event.data.global.x - this.x;


  }

  swiperPressUpHandler(event) {
    this.isSwiping = false;



    this.lastPointerDownX = this.movedDistX;
    this.tweensDistX = this.swiperOffsetsNumArr[this.swiperOffsetsNumArr.length - 1] - this.swiperOffsetsNumArr[0];

  }

  swiperPressMoveHandler(event) {
    if (this.isSwiping) {




      let tempPointerDownX = event.data.global.x - this.x
      //移动的位置等于上一次记录的坐标lastPointerDownX与位移的和；
      // if(this.wrapper.x<=0){
      //   this.lastPointerDownX=0
      // }
      this.movedDistX = tempPointerDownX - this.pointerDownX + this.lastPointerDownX;

      this.swiperOffsetsNumArr.push(tempPointerDownX - this.pointerDownX);
      if (this.swiperOffsetsNumArr.length > 3) {
        this.swiperOffsetsNumArr.shift()
      }
      // if( this.movedDistX<0){
      //   // self.tweensDistX=0;
      //   this.movedDistX+=5;
      // }


    }
  }


}

export default PixiSwiper;
