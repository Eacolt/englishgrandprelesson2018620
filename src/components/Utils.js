import $ from "jquery";
import {Back, TweenMax} from "gsap";

class Utils {
  resourceById() {

  }
}

const TextureCache = PIXI.utils.TextureCache;

class Debugs {
  static locked = false;

  static log() {
    if (Debugs.locked) return;
    console.log.call(null, ...arguments)

  }
}

class AudioManager {

  static audios = [];

  static setAudio($name, $src) {
    let audio = new Audio($src);
    AudioManager.audios.push({
      audio: audio,
      name: $name
    })
  }

  static getAudio($name) {
    for (let i = 0; i < AudioManager.audios.length; i++) {
      if (AudioManager.audios[i].name == $name) {
        return AudioManager.audios[i].audio;
      }
    }
  }

  static getId($id) {
    return document.getElementById($id)
  }

}

class ResourceMent {
  constructor($resource) {
    this.resList = $resource;
  }

  getSrcById($id) {
    for (let i = 0; i < this.resList.length; i++) {
      if (this.resList[i].id == Number($id)) {
        //return this.resList[i].host + '/' + this.resList[i].src;
        return this.resList[i].src;
      }
    }

  }

}
//计算可以进行加载的东西，没有在resources里的

////加载逻辑
/*
* //选文：
                  .add([
                  ])*/
const loaderAssetsByValided = function(modulesUrl,$newAssets,GameStart,$otherAssets=[]){
  const self = this;
  var getValidedAssets = function ($newAssets) {
    let newAssetsArr = [];
    let validAssetsArr = [];
    for (let i = 0; i < $newAssets.length; i++) {
      newAssetsArr.push({
        name: $newAssets[i].name,
        url: $newAssets[i].url
      });
    }
    ;
    newAssetsArr.forEach((item, index) => {
      if (PIXI.loader.resources[item.name] == undefined) {
        validAssetsArr.push(item);
      }
    });
    return validAssetsArr;
  }
  self.axios.get('static/' + modulesUrl + '/gameconfig.json').then((gameConfigData) => {
    var assets = gameConfigData.data.assets.map((item, index) => {
      return {
        name: '' + item.name,
        url: item.url
      }
    });
    if(getValidedAssets(assets).length<=0){
      GameStart.call(self,PIXI.loader.resources,gameConfigData.data);
      return;
    }
    PIXI.loader.add(getValidedAssets(assets))
      .load(function (loader,resources) {
        GameStart.call(self,resources,gameConfigData.data);
      });
  });

}
///End加载逻辑


//Vue
const myVueMixin_Swiper = {
  methods: {
    toCanvasPosX(x) {
      return 1920 * (x) / parseInt($('#app').width())
    },
    toCanvasPosY(x) {
      return 1920 * x / parseInt(document.documentElement.clientHeight)
    }
  }
}
const myVueMixin_Popup = {
  methods: {
    beforeEnter: function (el) {
      TweenMax.to(el, 0, {css: {opacity: 0, pointerEvents: 'none'}})

    },
    enter: function (el, done) {

      TweenMax.to(el, .6, {css: {opacity: 1, pointerEvents: 'auto'}})

    },
    leave: function (el, done) {
      TweenMax.to(el, .6, {css: {opacity: 0, pointerEvents: 'none'}})
    },

  }
}
const myVueMixin = {
  computed: {},
  methods: {
    //每次更改了route上meta completed都要调用一次，用来触发能量条进度,SET_LESSONCOMPLETESTAT是保存着所有子页面的meta值
    setOwnLessonComplete() {
      let allEnergy = []
      this.$router.options.routes.forEach((item, index) => {
        if (item.children) {
          var arr = item.children.filter((_item, index) => {
            return _item.meta.completed != null
          });
          allEnergy.push(arr);
        }
      });
      this.SET_LESSONCOMPLETESTAT(allEnergy)
    },
    //更新清算机制
    updateRestArrangementStat() {
      let updateArr = [];

      this.$router.options.routes.forEach((item, index) => {
        if (item.children) {
          var arr = item.children.filter((_item, index) => {

            return _item.meta.completed != null

          });
          //updateArr.push(arr);
          arr.forEach((resItem) => {
            if (resItem.meta.completed == 0) {
              updateArr.push(resItem.name);
            }

          })

        }
      });


      this.SET_RESTARRANGEMENTSTAT(updateArr)

    }
  }

}


//检测跳转到下一个大场景;
function checkForJumpRoute($checked = true) {
  const self = this;
  let target = this.vueInstance ? this.vueInstance : this;

  if ($checked) {
    /////////////////////
    let restArrangmentArr = target.$store.state.restArrangementStat;
    if (restArrangmentArr.length > 0) {
      target.$router.push({name: restArrangmentArr[0]});
      let d = Number(restArrangmentArr[0].split('-')[1]);
      target.$store.dispatch('SET_LESSONPARTSINDEX', d);
    }
  } else {
    let allLessonComponentsNames = target.$store.state.allLessonComponentsNames;
    let b = Number(allLessonComponentsNames[0].split('-')[1]);
    let currentPageIndex = target.lessonCurrentPageIndex;
    if (currentPageIndex < allLessonComponentsNames.length - 1) {
      target.$router.push({name: allLessonComponentsNames[currentPageIndex + 1]});
    } else {
      target.$router.push({name: allLessonComponentsNames[0]});
    }


  }

}

export {
  ResourceMent, checkForJumpRoute, Debugs, myVueMixin, TextureCache,
  myVueMixin_Popup, AudioManager, loaderAssetsByValided
}
