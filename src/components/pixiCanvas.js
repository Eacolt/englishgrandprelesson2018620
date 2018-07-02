// const PIXI = require('pixi.js')
var pixiCanvas = {};
var myApp = null;
var vueUnWatch = null;
pixiCanvas.install = function (Vue) {
  Vue.component('pixiCanvas', {
    props: {
      screenW: {
        type: Number,
        default: 1920
      },
      screenH: {
        type: Number,
        default: 1080
      },
      canTouch:{
        type:Boolean,
        default:true
      },
      zOrder:{
        type:Number,
        default:0
      },
      autoRender:{
        type:Boolean,
        default:true
      }
    },
    template: `<div :style="pixiCanvasStyle" ref="pixicanvas"></div>`,
    mounted() {

      const self = this;
      if (myApp==null){
        PIXI.utils.skipHello();
        myApp  = new PIXI.Application({
          width: self.screenW,
          height: self.screenH,
          antialias: true,
          // roundPixels: true,
          transparent: true
        });
        myApp.renderer.autoResize = true;
        myApp.view.style.position = 'absolute';
        myApp.view.style.width = '100%';
        myApp.view.style.height = '100%';
        myApp.view.style.top = '0px';
        myApp.view.style.left = '0px';
        myApp.view.style.right = '0px';
        myApp.view.style.margin = '0px auto';
        self.$refs.pixicanvas.appendChild(myApp.view);

        vueUnWatch = self.$watch(()=>{
          return self.autoRender
        },(newval,oldval)=>{
          if(newval==true){
            self.$emit('startGame', myApp);
          }
        });
        if(self.autoRender==true){
          self.$emit('startGame', myApp);
        }

      }

    },
    computed:{
      pixiCanvasStyle(){
        return {
          pointerEvents:this.canTouch==true ? 'auto' : 'none',
          zIndex:this.zOrder
        }

      }
    },
    destroyed() {
      if (myApp) {
        vueUnWatch();
       // this.app.loader.reset();
        myApp.destroy();

        // PIXI.utils.clearTextureCache();
        // PIXI.utils.destroyTextureCache();
        myApp = null;
        vueUnWatch = null;

      }
    }
  });
}
export default pixiCanvas;
