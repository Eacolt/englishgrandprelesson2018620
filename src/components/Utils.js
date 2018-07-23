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



///End加载逻辑

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
  checkForJumpRoute, Debugs, myVueMixin, TextureCache
}
