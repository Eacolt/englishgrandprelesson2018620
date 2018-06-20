import PixiSwiper from '../gameComponents/SwiperCtn.js'
import {LoadingAnimation} from "./gameui/GameManager";
import {TextureCache} from './Utils.js'
import PixiHammer from './gameui/PixiHammer.js'
//
// const PIXI = require('pixi.js')


class PixiScene1 extends PIXI.Container {
  constructor($options) {
    super();

    this.app = $options.app;
    this.resource = $options.res;
    this.vueInstance = $options.vueInstance;

    this.gameLevel = 0;

    this.swiperContainer = null;
    this.swiperPosition = -1;




    this.ufoSlides = [];


    this.on('added', this.addedToStage, this)
  }

  addedToStage() {
    console.log("FFFUUUU")
    const self = this;
    this.swiperContainer = new PIXI.Container();

    console.log('x',this.vueInstance.$store.state.lessonPartsList[3])


    for (let i = 0; i <this.vueInstance.$store.state.lessonPartsList.length; i++) {

      let slideUfo = new PIXI.Container();
      var monsterData;
      switch (this.vueInstance.$store.state.lessonPartsList[i].name) {
        case 'song':
          monsterData = self.resource['indexMonster1_json'].spineData;
          break;
        case 'vocabulary':
          monsterData = self.resource['indexMonster2_json'].spineData;
          break;
        case 'sentences':
          monsterData = self.resource['indexMonster3_json'].spineData;
          break;
        case 'story':
          monsterData = self.resource['indexMonster4_json'].spineData;
          break;
        case 'grammar':
          monsterData = self.resource['indexMonster5_json'].spineData;
          break;
        case 'text':
          monsterData = self.resource['indexMonster6_json'].spineData;
          break;
        case 'ketpet':
          monsterData = self.resource['indexMonster7_json'].spineData;
          break;
        default:
          break;
      }

      let monsters = new PIXI.spine.Spine(monsterData);
      if (monsters.state.hasAnimation('standing')) {
        // run forever, little boy!
        monsters.state.setAnimation(0, 'standing', true);
        // dont run too fast
        monsters.state.timeScale =1
      }


      // monsters.state.setAnimation(0, 'standing', true)
      monsters.x = 200+300*i;
      monsters.y = -10;
      //  monsters.state.timeScale = 0;
      // let plate = new PIXI.Sprite(TextureCache['ufoPlate']);
      //
      // // plate.x = sprite_ball.x-sprite_ball.width/2;
      // plate.y = 160;
      // plate.x = 35;
    //  slideUfo.addChild(monsters);

      self.addChild(monsters);

      // this.ufoSlides.push(slideUfo)
      // slideUfo.interactive = true;
      // slideUfo.on('pointerdown',this.ufoSlidePointerDown,this)
      // slideUfo.y = 600;
    }

    this.addChild(this.swiperContainer)



  }

}

export default PixiScene1;
