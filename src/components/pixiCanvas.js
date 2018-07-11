// const PIXI = require('pixi.js')
import {Debugs} from "./Utils";

var pixiCanvas = {};
var myApps =null;
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
      },
      emitRender:{
        type:Boolean,
        default:false
      }
    },
    template: `<div :style="pixiCanvasStyle" ref="pixicanvas"></div>`,
    mounted() {
      const self = this;
      myApps = [];
        PIXI.utils.skipHello();
        var myApp  = new PIXI.Application({
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


        myApps.push(myApp);
        if(self.autoRender){
          self.$emit('startGame', myApp);
        }else{
          let unwatch = self.$watch(()=>{
            return self.emitRender;
          },(newval)=>{
            if(newval==true){
              self.$emit('startGame', myApp);
              Debugs.log('在此调用成功')
              unwatch();
            }
          })

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
      if (myApps && myApps.length>0) {
        myApps.forEach((item)=>{
          item.destroy();
        })
        myApps = null;
       // this.app.loader.reset();
        // PIXI.utils.clearTextureCache();
        // PIXI.utils.destroyTextureCache();
      }
    }
  });
}
export default pixiCanvas;
