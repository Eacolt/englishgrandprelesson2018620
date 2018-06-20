// const PIXI = require('pixi.js')
var pixiCanvas = {};
pixiCanvas.install = function (Vue) {

  Vue.component('pixiCanvas', {
    data() {
      return {
        myapp: null
      }
    },
    props: {
      screenW: {
        type: Number,
        default: 1920
      },
      screenH: {
        type: Number,
        default: 1080
      }
    },
    template: `<div class="pixiCanvas" ref="pixicanvas"></div>`,

    mounted() {
      if (this.app) return;
      const self = this;
      PIXI.utils.skipHello();
      this.app = new PIXI.Application({
        width: self.screenW,
        height: self.screenH,
        antialias: false,
        // roundPixels: true,
          transparent: true
      });
      this.app.renderer.autoResize = true;
      this.app.view.style.position = 'absolute';
      this.app.view.style.width = '100%';
      this.app.view.style.height = '100%';
      this.app.view.style.top = '0px';
      this.app.view.style.left = '0px';
      this.app.view.style.right = '0px';
      this.app.view.style.margin = '0px auto';
      self.$refs.pixicanvas.appendChild(this.app.view);
      self.$emit('startGame', this.app);



    },
    destroyed() {
      if (this.app) {
       // this.app.loader.reset();
        this.app.destroy();
        // PIXI.utils.clearTextureCache();
        // PIXI.utils.destroyTextureCache();

        // Object.keys(PIXI.utils.TextureCache).forEach(texture => {
        //   PIXI.utils.TextureCache[texture].destroy(true);
        // });
        this.app = null;
        delete this.app;

      }

    }
  });
}
export default pixiCanvas;
