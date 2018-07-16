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
    console.log.call(null, ...arguments);

  }
}

class AudioManager {

  static audios = [];



   add($manifest=[],$callback = null) {
    let loadedNum = 0;
    let sameAssets = null;
    // for(let i=0;i<$manifest.length;i++){
    //   let idx = AudioManager.audios.indexOf($manifest[i].name);
    //   AudioManager.audios.splice(idx,1);
    // }

    // let avalid  = AudioManager.audios.every((item)=>{
    //   for(let i=0;i<$manifest.length;i++){
    //     if(item.name == $manifest[i].name){
    //       sameAssets = item.name;
    //       return item.name == $manifest[i].name;
    //       break;
    //     }
    //   }
    //
    // });
    // if(!avalid){
    //   console.warn('都是相同的资源')
    //   return false;
    // }
    for(let i=0;i<$manifest.length;i++){
      let avalidsound = AudioManager.audios.some((item)=>{
        return item.name == $manifest[i].name;
      });
      if(avalidsound){
        console.log('音乐重复：',$manifest[i].name)
        return;
      }

      let audio = new Audio();
      audio.src = $manifest[i].url;
       audio.load();
      audio.ondurationchange = function(){
        if(audio.duration>0){

          // let dd = AudioManager.audios.some((item)=>{
          //   return item.name == $manifest[i].name
          // });

          AudioManager.audios.push({
            audio: audio,
            name: $manifest[i].name
          });
          loadedNum++;
          console.log(loadedNum,loadedNum>=$manifest.length)
          if(loadedNum>=$manifest.length){
            if($callback){
              $callback();
              // AudioManager.audios.forEach((item)=>{
              //   item.ondurationchange = null;
              // })
              console.warn('音效加载完毕')
            }

          }
        }
      }
    }

    return AudioManager;

  }
  destroyAudio($name){

  }
  static playAudio($name){
    let myaudio = AudioManager.getAudio($name) || null;
    if(myaudio && myaudio.duration>0){
      myaudio.play();
    }
  }
  static loadAudios(){
    if(AudioManager.audios.length<=0)return;

    for(let i=0;i<AudioManager.audios.length;i++){

    }

  }

  static getAudio($name) {
    let myaudio = null;
    for (let i = 0; i < AudioManager.audios.length; i++) {
      if (AudioManager.audios[i].name == $name && AudioManager.audios[i].audio.duration>0) {
        myaudio = AudioManager.audios[i].audio;
        break;
      }
    }
    return myaudio;
  }

  static getId($id) {
    return document.getElementById($id)
  }

  getSrcByName($name){


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
var loaderAssetsByValided = function(modulesUrl,$newAssets,GameStart,$otherAssets=[]){
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



var myVueMixin_Popup = {
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

      let d = Number(restArrangmentArr[0].split('-')[1]);
      target.$store.dispatch('SET_LESSONPARTSINDEX', d);
      target.$router.push({name: restArrangmentArr[0]});
    }
  } else {
    let allLessonComponentsNames = target.$store.state.allLessonComponentsNames;
    // let b = Number(allLessonComponentsNames[0].split('-')[1]);
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
