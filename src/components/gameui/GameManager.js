class LoadingAnimation{
   static loading = null;

  static setMaskShow(newVal,$time=.3,$callback=function(){}){

    if(newVal==true){


     TweenMax.to(LoadingAnimation.loading.$el,$time,{opacity:1,onComplete:function(){
       $callback();
       }})
    }else{

     TweenMax.to(LoadingAnimation.loading.$el,$time,{opacity:0,onComplete:function(){
       $callback();
       }})
    }
  }
}
export {LoadingAnimation}
