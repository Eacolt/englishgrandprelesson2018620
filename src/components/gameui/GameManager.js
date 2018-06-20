class LoadingAnimation{
   static loading = null;

  static setMaskShow(newVal){

    if(newVal==true){


     TweenMax.to(LoadingAnimation.loading.$el,.3,{opacity:1})
    }else{

     TweenMax.to(LoadingAnimation.loading.$el,.3,{opacity:0})
    }
  }
}
export {LoadingAnimation}
