import GameMenuBars from "./gameui/GameMenuBar";

import {AudioManager, Debugs} from "./Utils";

class ChoiceInterface extends PIXI.Container {
  constructor($options) {
    super();
    this.resources = PIXI.loader.resources;
    this.vueInstance = $options.vueInstance;
    this.gameMenuBars = null;

    this.practiceBoxes = [];
    this.monsterHasDroped = false;
    this.monster = null;


    this.canDragDown = false;

    this.THEME_TYPE = GameMenuBars.vueInstance.gameThemeType;


    this.once('added', this.addedToStage, this)
  }
  //返回一个纯净的字母
  killAlias($str){
    return $str.replace(/[0-9]+/g,'');
  }

  createCommonAtlas($texturename) {
    let sprite = new PIXI.Sprite(PIXI.loader.resources['commons_atlas'].textures[$texturename]);
    return sprite;
  }

  getSlotRegionByName($animation, $name) {
    for (let i = 0; i < $animation.slotContainers.length; i++) {
      for (let k = 0; k < $animation.slotContainers[i].children.length; k++) {
        if ($animation.slotContainers[i].children[k].region.name == $name) {
          return $animation.slotContainers[i]
        }
      }
    }
  }

  clickBoxHandler(i = 0, $timespeed = 1, event) {
    const self = this;
    if (this.canDragDown == false) return;
    if (this.monsterHasDroped == true) return;

    this.monsterHasDroped = true;

    GameMenuBars.freeze = true;


    this.monster.y = 650;


    if (i == 0) {
      if (self.killAlias(event.currentTarget.boxName) == 'learning') {

        event.currentTarget.state.setAnimation(0, 'learning_select', true);

      } else {

        event.currentTarget.state.setAnimation(0, 'practice_select', true);
      }
      TweenMax.to(self.monster, $timespeed, {
        x: self.practiceBoxes[0].x, onComplete: function () {

          self.monster.state.addAnimation(0, 'dropdown', false, 0);

          PIXI.loader.resources['hand_down'].sound.play()


        }
      })

      this.monster.state.addListener({
        complete: function (entry) {

          if (entry.animation.name == 'dropdown') {

              self.vueInstance.$store.dispatch("SET_MODULEINDEX", i);

              let moduleList = self.vueInstance.$store.state.lessonPartsList[self.vueInstance.$store.state.lessonPartsIndex].menus
              self.vueInstance.$store.dispatch('SET_MODULELIST', moduleList);

              self.vueInstance.$router.push(self.vueInstance.$route.fullPath + '/' + self.vueInstance.$store.state.currentModuleList[i].name);

            let bgsound = PIXI.loader.resources['bgSound'].sound.play();
            bgsound.volume = 0;


          }

        }
      })


    } else if (i == 1) {

      if (self.killAlias(event.currentTarget.boxName) == 'learning') {

        event.currentTarget.state.setAnimation(0, 'learning_select', true);
      } else {
        event.currentTarget.state.setAnimation(0, 'practice_select', true);
      }

      TweenMax.to(self.monster, $timespeed, {
        x: self.practiceBoxes[1].x, onComplete: function () {
          self.monster.state.addAnimation(0, 'dropdown', false, 0);




          PIXI.loader.resources['hand_down'].sound.play();

        }
      })

      this.monster.state.addListener({
        complete: function (entry) {


            if (entry.animation.name == 'dropdown') {

              self.vueInstance.$store.dispatch("SET_MODULEINDEX", i);
              let moduleList = self.vueInstance.$store.state.lessonPartsList[self.vueInstance.$store.state.lessonPartsIndex].menus;
              self.vueInstance.$store.dispatch('SET_MODULELIST', moduleList);

              self.vueInstance.$router.push(self.vueInstance.$route.fullPath + '/' + self.vueInstance.$store.state.currentModuleList[i].name);


            }






        }
      })


    }

  }

  destroyed() {
    this.gameMenuBars.clearGameMenuEvents();
    this.gameMenuBars.destroy();
    this.gameMenuBars = null;

    if(this.practiceBoxes.length>0){
      this.practiceBoxes.forEach((item)=>{
        item.destroy();
      })
    }

    this.practiceBoxes = null;
    this.monsterHasDroped = null;
    this.monster.destroy();
    this.monster = null;
    this.canDragDown = null;
    this.practiceBoxes = null;
    this.resources = null;
    this.vueInstance = null;
    this.destroy();


  }

  addedToStage() {
    const self = this;

    let desk = new PIXI.Sprite(self.resources['choiceDesk_png'].texture);

    let gameBg = new PIXI.Sprite(self.resources['choicebg_jpg'].texture);

    this.addChild(gameBg)


    var boySpine = self.resources['boyskeleton'].spineData;
    var boy = new PIXI.spine.Spine(boySpine);
    boy.scale.x = boy.scale.y = 0.75;

    boy.x = 1920 / 2 + 650;
    boy.y = 1080 / 2 + 200;
    boy.skeleton.setSkinByName('boy2');
    boy.skeleton.setSlotsToSetupPose();
    boy.state.setAnimation(0, 'hello2', true);
    self.addChild(boy);

    switch (this.THEME_TYPE) {
      case 1:
        boy.tint = 0xffbec4;
        break;
      case 2:
        boy.tint = 0xffd8a0;
        break;
      case 3:
        boy.tint = 0xdbff84;
        break;
      case 5:
        boy.tint = 0xe7c4ff;
        break;
      default:
        break;
    }


    this.addChild(desk)
    desk.y = 860

    var ske = self.resources['practiceBox_skeleton'].spineData;
    var _menus = self.vueInstance.$store.state.lessonPartsList[self.vueInstance.$store.state.lessonPartsIndex].menus;
    for (let i = 0; i < _menus.length; i++) {
      let box_practice = new PIXI.spine.Spine(ske);
      //TODO:设置主题皮肤;

      switch (self.THEME_TYPE) {
        case 1:
          box_practice.skeleton.setSkinByName('dorpbox1');
          box_practice.skeleton.setSlotsToSetupPose();
          break;
        case 2:
          box_practice.skeleton.setSkinByName('dorpbox2');
          box_practice.skeleton.setSlotsToSetupPose();
          break;
        case 3:
          box_practice.skeleton.setSkinByName('dorpbox3');
          box_practice.skeleton.setSlotsToSetupPose();
          break;
        case 4:
          box_practice.skeleton.setSkinByName('dorpbox4');
          box_practice.skeleton.setSlotsToSetupPose();
          break;
        case 5:
          box_practice.skeleton.setSkinByName('dorpbox5');
          box_practice.skeleton.setSlotsToSetupPose();
          break;
        default:
          break;

      }


      self.practiceBoxes.push(box_practice);
      this.addChild(box_practice);
    }
    if (self.practiceBoxes.length == 1) {
      self.practiceBoxes[0].x = 1920 / 2;
      self.practiceBoxes[0].y = 860;
      self.practiceBoxes[0].interactive = true;
      self.practiceBoxes[0].scale.x = self.practiceBoxes[0].scale.y = 0.86;


      self.practiceBoxes[0].state.setAnimation(0, self.killAlias(_menus[0].name) + '_warming', true);
      self.practiceBoxes[0].boxName = self.killAlias(_menus[0].name);
      self.practiceBoxes[0].on('pointerdown', self.clickBoxHandler.bind(self, 0, 0), self);

    } else {
      self.practiceBoxes[0].x = 1920 / 2 - 350;
      self.practiceBoxes[0].y = 860;
      self.practiceBoxes[1].x = 1920 / 2 + 350;
      self.practiceBoxes[1].y = 860;


      self.practiceBoxes.forEach((item, index) => {
        item.scale.x = item.scale.y = 0.86;
        item.interactive = true;
        item.boxName = self.killAlias(_menus[index].name);
        item.on('pointerdown', self.clickBoxHandler.bind(self, index, 1), self);
      });


      self.practiceBoxes[0].state.setAnimation(0, self.killAlias(_menus[0].name) + '_warming', true);
      self.practiceBoxes[1].state.setAnimation(0, self.killAlias(_menus[1].name) + '_warming', true);

    }

    //

    let whichMonster = self.vueInstance.$store.state.lessonPartsList[self.vueInstance.$store.state.lessonPartsIndex].name;
    var monsterData = null;
    switch (whichMonster) {
      case 'song':
        monsterData = self.resources['indexMonster1_json'].spineData;
        break;
      case 'vocabulary':
        monsterData = self.resources['indexMonster2_json'].spineData;
        break;
      case 'sentences':
        monsterData = self.resources['indexMonster3_json'].spineData;
        break;
      case 'story':
        monsterData = self.resources['indexMonster4_json'].spineData;
        break;

      case 'grammar':
        monsterData = self.resources['indexMonster5_json'].spineData;
        break;
      case 'text':
        monsterData = self.resources['indexMonster6_json'].spineData;
        break;
      case 'ketpet':
        monsterData = self.resources['indexMonster7_json'].spineData;
        break;
      case 'reading':
        monsterData = self.resources['indexMonster8_json'].spineData;
        break;
      default:
        break;

    }



    self.monster = new PIXI.spine.Spine(monsterData);
    self.monster.x = 1920 / 2;
    self.monster.y = 650;
    this.addChild(self.monster)
    let monsterAn = self.monster.state.setAnimation(0,'catching2',false);

    monsterAn.listener = {
      complete:()=>{
        self.canDragDown = true;
      }
    }





    this.gameMenuBars = new GameMenuBars();
    this.addChild(this.gameMenuBars);
    GameMenuBars.freeze = false;
    this.gameMenuBars.bookBtnShow = false;
    this.gameMenuBars.backBtnShow = true;
    this.gameMenuBars.homeBtnShow = false;
    this.gameMenuBars.updateGameMenu();
    this.gameMenuBars.setBackBtn_tapHandler(() => {

        self.vueInstance.$router.push('/index/')


    });

    this.vueInstance.$watch(() => {
      return self.vueInstance.energyCurrentNum
    }, (newval) => {
      this.gameMenuBars.energy = newval;
    });
    this.gameMenuBars.energyOnce = self.vueInstance.energyCurrentNum;


  }
}

export default ChoiceInterface;
