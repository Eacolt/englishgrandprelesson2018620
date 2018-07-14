import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    // mainCanvas
    // canvasPages: [],
    appPlatform: "",//当前平台类型
    currentPage: 0,
    gamesArr: [],
    gamesPixiAssets: [],
    routeNames: [],

    gameThemeType:0,//游戏主题颜色;

    alreadyHasOneCard:false,//获得了一张卡片;
    gameSecondPlayed:false,//游戏已经二周目

    openMagicBookByGameIndex:0,//从游戏返回翻开魔法书;

    bookOpened:-1,//是否打开宝箱后就退出页面了？

    showMagicBook:false,//展示魔法书，仅仅从最后获得卡片回到主页的时候展现，并且只能有一次

    indexPageInitialSlide:0,//页面初始化滑动停留位置;

    showPopupDelay: 1200,//弹出框间隔时间

    gameInitResponse: null,//indexpage初始化获取的数据


    energyCurrentNum: 0,//能量条进度.百分比
    completedLessonNum: 0,//完成的课程数目;

    allLessonCompleteStat: [],//****所有课程完成情况
    allLessonComponentsNames: [],//*****todo:所有课程的组件名字，也可以得到課程總數
    allLessonsNum: 0,//todo:所有課程總數
    allPartNames: [],//todo：每一个大课的名字

    allGameCards: 0,//游戏卡片数目;

    gameHasBeenCompleted: false,//游戏全部完成，在点击最后清算页面后触发

    lessonCurrentPageIndex: 0,//所有课程组件某一个课所在的索引位


    baseAssetsCompleted: false,//基礎部分資源加載完畢//烏龜
    //
    lessonPartsList: [],//哪儿一个大部分：
    lessonChoiced: 0,//look还是practice
    lessonPartsIndex: 0,//索引,大场景的索引;

    preparationJson: null,
    currentModuleList: [],//当前看一看分支或者练一练分支
    modulesIndex: 0,//看一看或者练一练具体课程索引
    lessonCompletedList: [],//课程完成情况，其实保存着所有可用组件的meta(completed,name),

    restArrangementStat: [],//***剩余查询机制，按从左到右放入未完成的课程组件名字，字符串类型，用来跳转。

    loadingAlready: false,

    //所有资源;
    assetsPages: {
      indexPage: null,//0为资源未加载，1为加载过
      choicePage:null
    }
  },
  actions: {
    SET_GAMESECONDPLAYED({commit},payload){
      commit('setGameSecondPlayed',payload);
    },
    //设置弹出框出现时间间隔;
    SET_SHOWPOPUPDELAY({commit},payload){
      commit('shouwPopupDelay',payload)
    },

    SET_MAGICBOOKBYGAMEINDEX({commit},payload){
      commit('setMagicBookByGameIndex',payload)
    },

    SET_BOOKOPENED({commit},payload){
      commit('setBookOpened',payload);
    },


    //当获得卡片的时候触发;
    SET_ALREADYHASONECARD({commit},payload){
      commit('setAlreadyHasOneCard',payload)
    },
    //设置主题颜色;
    SET_GAMETHEMETYPE({commit},payload){
      commit('setGameThemeType',payload);
    },
    SET_SHOWMAGICBOOK({commit},payload){
      commit('setShowMagicBook',payload)
    },
    //设置页面初始化Swiper的索引位置;
    SET_INDEXPAGEINITIALSLIDE({commit},payload){
      commit('setIndexPageInitialSlide',payload)
    },
    SET_GAMECARDS({commit}, payload) {
      commit('setGameCards', payload)
    },
    //初始化所有的页面资源包
    SET_ALLASSETSPACKAGE({commit}, payload) {
      commit('setAllAssetsPackage', payload);
    },

    //设置页面资源加载状态存库
    SET_ASSETSPAGES({commit}, payload) {
      commit('setAssetsPages', payload);
    },
    SET_COMPLETEDLESSONNUM({commit}, payload) {
      commit('setCompletedLessonNum', payload)
    },
    SET_ALLLESSONNUM({commit}, payload) {
      commit('setAllLessonNum', payload);
    },
    SET_GAMEINITRESPONSE({commit}, payload) {
      commit('setGameInitResponse', payload)
    },
    SET_ALLPARTNAMES({commit}, payload) {
      commit('setAllPartNames', payload)
    },
    SET_GAMEHASBEENCOMPLETED({commit}, payload) {
      commit('setGameHasBeenCompleted', payload)
    },
    SET_LESSONCURRENTPAGEINDEX({commit}, payload) {
      commit('setLessonCurrentPageIndex', payload)

    },
    //设置每一个页面的名字放在一个数组中记录
    SET_ALLLESSONCOMPONENTSNAMES({commit}, payload) {
      commit('setAllLessonComponentNames', payload);

    },
    // //设置每一个完成度情况;
    // SET_PERLESSONPROGRESS({commit}, payload) {
    //   // commit('setPerLessonProgress', payload)
    // },
    SET_ENERGY({commit}, payload) {
      commit('setEnergy', payload)
    },
    SET_RESTARRANGEMENTSTAT({commit}, payload) {
      commit('setRestArrangementStat', payload);
    },


    //

    SET_LESSONCOMPLETESTAT({commit}, payload) {
      commit('setLessonCompleteStat', payload)
    }
    ,
    SET_LOADINGANIMATION_STAT({commit}, payload) {
      commit('setLoadingAnimationReady', payload)
    },

    SET_PLATFORM({commit}, payload) {
      commit('setPlatform', payload);
    },
    //设置看一看或练练的所在的列表信息
    SET_MODULELIST({commit}, payload) {
      commit('setModuleList', payload);
    },
    //设置看一看或练练的哪一个index
    SET_MODULEINDEX({commit}, payload) {
      commit('setModuleIndex', payload);
    },
    //设置哪一个大类别

    SET_LESSONPARTSLIST({commit}, payload) {
      commit('setLessonPartsList', payload);
    },
    SET_LESSONPARTSINDEX({commit}, payload) {
      commit('setLessonPartsIndex', payload);
    },


    SET_PREPARATION({commit}, payload) {
      commit('setPreparation', payload);
    },

    PUSH_GAMES({commit}, payload) {
      commit('pushGames', payload)
    },

    SET_CURRENTPAGE({commit}, payload) {
      commit('setCurrentPage', payload);
    },
    // SET_CANVASPAGE({commit}, payload) {
    //   commit('setCanvasPage', payload)
    // },

    SET_BASEASSETSCOMPLETE({commit}, payload) {
      commit('setBaseAssetsComplete', payload)
    },
  },
  mutations: {
    setEnergy(state, payload) {
      state.energyCurrentNum = payload;
    },
    setGameSecondPlayed(state,payload){
      state.gameSecondPlayed = payload;
    },
    setBookOpened(state,payload){
      state.bookOpened = payload;
    },
    setMagicBookByGameIndex(state,payload){
      state.openMagicBookByGameIndex = payload;
    },
    setShowMagicBook(state,payload){
      state.showMagicBook = payload;
    },
    setGameThemeType(state,payload){
      state.gameThemeType = payload;
    },

    setAlreadyHasOneCard(state,payload){
      state.alreadyHasOneCard = payload;
    },
    setIndexPageInitialSlide(state,payload){
      state.indexPageInitialSlide = payload;
    },
    setAllAssetsPackage(state, payload) {
      payload.forEach((item)=>{
        state.assetsPages[item] = null;
      })
    },

    setAssetsPages(state, payload) {
      state.assetsPages[payload.assetsName] = payload.completedStat;
    },

    setGameCards(state, payload) {
      state.allGameCards = payload;
    },
    setAllLessonNum(state, payload) {
      state.allLessonsNum = payload;
    },
    setCompletedLessonNum(state, payload) {
      state.completedLessonNum = payload;
    },
    setGameInitResponse(state, payload) {
      state.gameInitResponse = payload;
    },
    setAllPartNames(state, payload) {
      state.allPartNames = payload;
    },
    setGameHasBeenCompleted(state, payload) {
      state.gameHasBeenCompleted = payload;
    },
    setLessonCurrentPageIndex(state, payload) {
      state.lessonCurrentPageIndex = payload;
    },
    setAllLessonComponentNames(state, payload) {
      state.allLessonComponentsNames = payload;
    },
    setRestArrangementStat(state, payload) {
      state.restArrangementStat = payload;
    },
    // setPerLessonProgress(state, payload) {
    //   // state.perLessonProgressArr = payload;
    // },

    setLessonCompleteStat(state, payload) {
      state.allLessonCompleteStat = payload;
    },
    setLoadingAnimationReady(state, payload) {
      state.loadingAlready = payload;
    },
    setBaseAssetsComplete(state, payload) {
      state.baseAssetsCompleted = payload;
    },
    setLessonCompletedList(state, payload) {
      state.lessonCompletedList = payload;
    },
    setPlatform(state, payload) {
      state.appPlatform = payload;
    },
    setModuleIndex(state, payload) {
      state.modulesIndex = payload;
    },
    setModuleList(state, payload) {
      state.currentModuleList = payload;
    },
    setLessonPartsList(state, payload) {

      state.lessonPartsList = payload;
    },
    setLessonPartsIndex(state, payload) {
      state.lessonPartsIndex = payload;
    },

    setPreparation(state, payload) {
      state.preparationJson = payload;
    },

    pushGames(state, payload) {
      state.gamesArr.push(payload);
    },


    setCurrentPage(state, payload) {
      state.currentPage = payload;
    },
    shouwPopupDelay(state,payload){
      state.shouwPopupDelay = payload
    }
    // setCanvasPage(state, payload) {
    //   // state.canvasPages[payload] = true;
    //
    // }
  }
});
export default store;
