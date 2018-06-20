class PixiHammer{
  constructor($option){
    this.swiperContainer = $option.swiperContainer;
    this.swiperArea = $option.swiperArea;
    this.swiperDirection = $option.swiperDirection || 'horizontal';

    this.swiperIsDown = false;
    this.swiperX_arr = [];

    this.swiperTimes = 0;
    this.swiperTicker = null;
    this.swiperMovedX = 0;

    this.lock  = false;



    this.moveToLeft = function(){};
    this.moveToRight = function(){};
    this.initial();
  }
  initial(){
    this.swiperContainer.interactive = true;
    this.swiperContainer.on('pointerdown',this.swiperCtn_pointerDown,this);
    this.swiperContainer.on('pointermove',this.swiperCtn_pointerMove,this);
    this.swiperContainer.on('pointerup',this.swiperCtn_pointerUp,this);
    this.swiperContainer.on('pointerupoutside',this.swiperCtn_pointerUp,this);
  }
  removeAllSwiperListener(){
    this.moveToLeft = function(){};
    this.moveToRight = function(){};
    this.swiperContainer.removeListener('pointerdown',this.swiperCtn_pointerDown,this);
    this.swiperContainer.removeListener('pointermove',this.swiperCtn_pointerMove,this);
    this.swiperContainer.removeListener('pointerup',this.swiperCtn_pointerUp,this);
    this.swiperContainer.removeListener('pointerupoutside',this.swiperCtn_pointerUp,this);

  }

  setMoveLeftCallBack($callback){
    if(this.lock)return;
    this.moveToLeft = $callback;
  }
  setMoveRightCallBack($callback){
    if(this.lock)return;
    this.moveToRight = $callback;
  }

  swiperCtn_pointerDown(event){
    if(this.lock)return;
    if(this.swiperIsDown == false){
      if(this.swiperArea){


        if(event.data.global.x>this.swiperArea.x && event.data.global.x<=this.swiperArea.width &&
        event.data.global.y<this.swiperArea.height && event.data.global.y>=this.swiperArea.y){
          this.swiperIsDown = true;
        }

      }else{
        this.swiperIsDown = true;

      }

    };

    this.swiperTimes = new Date().getTime();

  }
  swiperCtn_pointerMove(event){
    if(this.lock)return;
    if(this.swiperIsDown){
      this.inMovingDetectSwiperX.call(this,event.data.global.x)

    }
  }
  swiperCtn_pointerUp(){
    if(this.lock)return;
    if(this.swiperIsDown==true){
      this.swiperIsDown = false;
    }
    this.swiperTimes = new Date().getTime() - this.swiperTimes;
    let swiperX = this.getCurrentSwiperX();
    if(this.swiperTimes<500){

      if(swiperX>10){
        this.moveToRight();
       // return;
      }
      if(swiperX<-10){
        this.moveToLeft();
      }


      this.swiperMovedX = 0;

    }
  }

  inMovingDetectSwiperX(posX){
    if(this.lock)return;
    //如果水平移动;
    if(this.swiperDirection == 'horizontal'){
      if(this.swiperX_arr.length>3){
        this.swiperX_arr[0] = null;
        this.swiperX_arr.shift();
      }
      this.swiperMovedX = this.swiperX_arr[this.swiperX_arr.length-1]-this.swiperX_arr[0] || 0;
      this.swiperX_arr.push(posX);
    }
  }
  //释放鼠标清空
  getCurrentSwiperX(){
    if(this.lock)return;
    let swiperX = 0;
    if(this.swiperDirection == 'horizontal'){
        if(this.swiperX_arr.length>0){
          swiperX = this.swiperX_arr[this.swiperX_arr.length-1]-this.swiperX_arr[0]
        }
        this.swiperX_arr = [];
    }
    return swiperX;
  }
}



export default PixiHammer;
