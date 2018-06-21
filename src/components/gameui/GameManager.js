class LoadingAnimation{
   static loading = null;

  static setMaskShow(newVal,$callback=function(){}){

    if(newVal==true){


     TweenMax.to(LoadingAnimation.loading.$el,.3,{opacity:1,onComplete:function(){
       $callback();
       }})
    }else{

     TweenMax.to(LoadingAnimation.loading.$el,.3,{opacity:0,onComplete:function(){
       $callback();
       }})
    }
  }
}
export {LoadingAnimation}
