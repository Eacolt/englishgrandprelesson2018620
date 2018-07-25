<template>
  <div>
    <div  class="bg" :style="bgStyle"></div>
    <div  id="swiperContainerMain" class="swiper-container">
      <div v-cloak id="swiperWrapperMain" class="swiper-wrapper">
        <div   v-for="(item,index) in slideLists" class="swiper-slide swiper-slide-main">
          <div class="slideInnerPic" :style="item.styles">

          </div>
        </div>
      </div>
      <!-- 如果需要分页器 -->
      <div class="swiper-button-prev diyButtonPrev"></div>
      <div class="swiper-button-next diyButtonNext"></div>
    </div>

    <div ref="paginationPic" class="paginationPicture" :style="paginationPicture">
      <div  id="paginationdiy" class=" swiper-container ">
        <div v-cloak class="swiper-wrapper swiper-wrapper-paginationdiv ">
          <div v-for="(item,index) in slideLists" class="swiper-slide swiper-slide-paginationdiy">


            <div
                 @click="paginationBallClick(index)" class="paginationballs" :style="paginationballs_style">
              {{index+1}}
            </div>
          </div>
        </div>
      </div>
      <div class="pagi_triangles">
        <div class="left" @click="goPrevPagi()" :style="leftTriangle_style" v-show="leftTriangleShow"></div>
        <div class="right"  @click="goNextPagi()" :style="rightTriangle_style" v-show="rightTriangleShow"></div>
      </div>
    </div>

    <div class="canvasApp" :style="canvasAppLevel" ref="pixicanvas"></div>

    <div v-show="showCheckArea" class="babyChechArea" @click="boyBtnAreaClicked"></div>
      <congraPopup :showType="popupType" v-if="showCongra"
                   @quitGame="quitGame_hdr()"
                   @continueGame="continueGame_hdr()"
                   @continueClicked="clickContinue_hdr()"
                   @againClicked="againClicked_hdr">
      </congraPopup>


  </div>
</template>
<script>
  import {myVueMixin,checkForJumpRoute} from './Utils.js'
  import {mapActions, mapState} from 'vuex'
  import PixiScene1 from './picSwipeModule.js'

  import congraPopup from './gameui/congraPopup.vue'
  import {Debugs} from "./Utils";
  import {swiper, swiperSlide} from 'vue-awesome-swiper'

  var canvasApp = null;
  var pixiScene = null;
  var mySwiper = null;
  var mySwiperPagination = null;
  var modulesUrl = null;
  var globalStatic = null;
  export default {
    name: "module1",
    mixins:[myVueMixin],
    data: function () {
      return {
        canvasAppLevel:{
          zIndex:1
        },
        showCheckArea:false,
        slideLists: [],
        paginationLists: [],
        paginationPicture: {},
        openEnergyed:-1,

        popupType:'popup2',
        paginationballs_style:{
          opacity:0
        },
        currentPage:0,
        currentGameLevel:0,
        showCongra:false,


        leftTriangle_style:{},
        rightTriangle_style:{},


        currentPaginationPages:-1,
        bgStyle:{
          backgroundImage:'url("static/themetypeui/backbg.jpg")',
          backgroundSize:'contain'
        }


      }
    },
    components:{congraPopup},
    computed: {
      ...mapState(['lessonPartsList','assetsPages','appPlatform','gameSecondPlayed','allPartNames','lessonPartsIndex','allLessonsNum','showPopupDelay','allLessonComponentsNames','energyCurrentNum','restArrangementStat','lessonCurrentPageIndex','gameHasBeenCompleted']),
      leftTriangleShow(){
        return this.currentPaginationPages>=4
      },
      rightTriangleShow(){

        return this.currentPaginationPages<=this.slideLists.length-5
      }
    },


    methods: {
      ...mapActions(['SET_CANVASPAGE','SET_INDEXPAGEINITIALSLIDE','SET_ASSETSPAGES','PUSH_GAMES','SET_LESSONCOMPLETESTAT','SET_RESTARRANGEMENTSTAT','SET_LESSONCURRENTPAGEINDEX']),
      goPrevPagi(){

        if(mySwiperPagination){

          mySwiperPagination.slidePrev()
        }
      },
      goNextPagi(){

        if(mySwiperPagination){
          mySwiperPagination.slideNext();
        }
      },
      boyBtnAreaClicked(){
        const self = this;

        this.canvasAppLevel = {
          zIndex:100
        }

        if(mySwiper){
          if(mySwiper.activeIndex <mySwiper.slides.length-1){
            return;
          }
        }
        if(pixiScene){
          pixiScene.stopAudios();
        };
        var showPopupDelay = null;
        if(self.$route.meta.completed != 1){
          showPopupDelay = 1000;
        }else{
          showPopupDelay = 0;
        }


       //TODO:开始设置清算界面逻辑全套66;
        self.$route.meta.completed = 1;
        self.setOwnLessonComplete();
        if (self.gameHasBeenCompleted == false) {
          window.parent.postMessage({
            type: "stepSubmit",
            page: self.lessonCurrentPageIndex
          }, "*");
        }
        setTimeout(() => {
          let isQingsuan = self.$route.name == self.restArrangementStat[self.restArrangementStat.length - 1];//开始清算;
          setTimeout(() => {
            if (isQingsuan && !self.gameHasBeenCompleted) {

               pixiScene.gameMenuBar.bookScene.openEnergyCan(false);

              createjs.Sound.play('win_jump')

            } else if (isQingsuan == false && !self.gameHasBeenCompleted) {
              self.showCongra = true;
              // Debugs.log('游戏没有完成，并且也不是清算页')
              createjs.Sound.play('win_jump')
            }else if(self.gameHasBeenCompleted && self.gameSecondPlayed){
              self.showCongra = true;
              // Debugs.log('游戏第二周目，继续玩')
              createjs.Sound.play('win_jump')
            }  else if (self.gameHasBeenCompleted && !self.gameSecondPlayed) {
              pixiScene.gameMenuBar.bookScene.openEnergyCan(true);
              createjs.Sound.play('win_jump')

            }
          }, showPopupDelay);
          self.updateRestArrangementStat();
        }, 1);
        //TODO:开始设置清算界面逻辑全套---END;




      },
      quitGame_hdr(){
        const self = this;

        let arr = this.$route.fullPath.split('/');
        let index = self.allPartNames.indexOf(arr[2]);
        self.SET_INDEXPAGEINITIALSLIDE(Number(index));

        self.$router.push('/index/');

      },
      continueGame_hdr(){
        this.showCongra = false;
        this.popupType = 'popup2'
      },
      clickContinue_hdr(){

        if(this.gameHasBeenCompleted){
          checkForJumpRoute.call(this,false);

        }else{
          checkForJumpRoute.call(this,true);
        }
      },
      againClicked_hdr(){
        this.showCongra = false;


        if(mySwiper){
          mySwiper.slideTo(0,500)
        }
      },

      paginationBallClick(index){
        const self = this;
        if(mySwiperPagination){


          if(index==mySwiperPagination.activeIndex){

            mySwiperPagination.slideTo(index-4,300,false);

          }else{
            mySwiperPagination.slideTo(index,300,false);
          }
         // self.mySwiperPagination.slideTo(index,300,false);

         Array.prototype.forEach.call(this.slideLists,function(item,index){
           mySwiperPagination.slides.eq(index).find('.paginationballs').css({
             backgroundImage:"url("+globalStatic+'/pagiball1.png'+")",
             backgroundRepeat:'no-repeat',
             backgroundSize:'contain',
             color:"#539bc5"
           });
         });

          mySwiperPagination.slides.eq(index).find('.paginationballs').css({
            backgroundImage:"url("+globalStatic+'/pagiball2.png'+")",
            backgroundRepeat:'no-repeat',
            backgroundSize:'contain',
            color:"white"
          });
          mySwiper.slideTo(index,300,false);
          this.currentPage = index;
        }

      },


      gameStart(app) {
        const self = this;
         modulesUrl = this.$route.meta.assetsUrl;
         globalStatic = 'static/' + modulesUrl;
        self.axios.get(globalStatic + '/gameconfig.json').then((gameConfigData) => {
            self.slideLists = gameConfigData.data.gameData.pictureList.map((item, index) => {
              return {
                styles:{
                  backgroundImage: "url("+globalStatic+'/'+ gameConfigData.data.gameData.pictureList[index].picture+")",
                  backgroundSize: "100% 100%",
                  backgroundRepeat: "no-repeat"
                }
              }
            });


            //$nextTicker;

          self.$nextTick(gameTask);
          function gameTask(){
            Object.assign(self.paginationballs_style,{
              backgroundImage:"url("+globalStatic+'/pagiball1.png'+")",
              backgroundRepeat:'no-repeat',
              backgroundSize:'contain',
              opacity:1
            });

            self.paginationPicture = {
              backgroundImage: "url(static/themetypeui"+'/pagination.png'+")",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat"
            }
            self.leftTriangle_style = {
              backgroundImage: "url("+globalStatic+'/sanjiao.png'+")",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
              transform:"scaleX(-1)"
            }
            self.rightTriangle_style = {
              backgroundImage: "url("+globalStatic+'/sanjiao.png'+")",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",

            }

            mySwiperPagination = new Swiper('#paginationdiy', {
              direction: 'horizontal',
              slidesPerView: 5,
              slidesPerGroup: 4,
              resistanceRatio:0,
              on:{
                init(){
                  this.update();
                }
              }
            });
            mySwiper = new Swiper('#swiperContainerMain', {
              direction: 'horizontal',
              centeredSlides: true,
              slidesPerView: 1.3,
              spcaeBetween: 15,
              touchEventsTarget: 'wrapper',
              // 如果需要前进后退按钮
              navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
              },
              on: {
                slideChangeTransitionStart: function () {
                  const _swiper = this;
                  Array.prototype.forEach.call(this.slides,function(item,index){
                    _swiper.slides.eq(index).removeClass('none-effect');
                    mySwiperPagination.slides.eq(index).find('.paginationballs').css({
                      backgroundImage:"url("+globalStatic+'/pagiball1.png'+")",
                      backgroundRepeat:'no-repeat',
                      backgroundSize:'contain',
                      color:"#539bc5"
                    });
                  });
                  mySwiperPagination.slides.eq(_swiper.activeIndex).find('.paginationballs').css({
                    backgroundImage:"url("+globalStatic+'/pagiball2.png'+")",
                    backgroundRepeat:'no-repeat',
                    backgroundSize:'contain',
                    color:"white"
                  });
                  mySwiperPagination.slideTo(_swiper.activeIndex, 1000);
                },
                slideChange(){
                  self.currentPage = this.activeIndex;
                  if(this.activeIndex>=this.slides.length-1){
                    if(pixiScene){
                      pixiScene.showBoy();
                    }
                    self.showCheckArea = true;
                  }else{
                    if(pixiScene){
                      pixiScene.hideBoy();
                    }
                    self.canvasAppLevel = {
                      zIndex:1
                    }
                    self.showCheckArea = false;
                  }
                  if(pixiScene){
                    pixiScene.stopAudios();
                    pixiScene.playAudios();
                  }
                  self.currentPaginationPages = this.realIndex;
                },
                tap: function () {
                  self.currentPage = this.activeIndex;
                },
                init: function () {
                  this.slides.eq(this.activeIndex).addClass('none-effect');
                  setTimeout(()=>{
                    mySwiperPagination.slides.eq(0).find('.paginationballs').css({
                      backgroundImage:"url("+globalStatic+'/pagiball2.png'+")",
                      backgroundRepeat:'no-repeat',
                      backgroundSize:'contain',
                      color:"white"
                    });
                  },20)
                  this.update();
                }
              },
            });
            var audioManifest = [];
            for(let i=0;i< gameConfigData.data.gameData.pictureList.length;i++){
              let audioSrc =  gameConfigData.data.gameData.pictureList[i].audioSrc;
              let audioSrcTrim = _.trim(audioSrc);
              if(audioSrcTrim!=''){
                let audioName = modulesUrl+'_'+audioSrcTrim.replace(/\./g,'_');
                audioManifest.push({
                  id:audioName,
                  src:'static/'+modulesUrl+'/'+audioSrc
                });
              };

            };

            var audioAvalid = false;
            for(let i=0;i<audioManifest.length;i++){
              if(PIXI.loader.resources[audioManifest[i]]){
                audioAvalid = true;
                break;
              }
            }
            if(self.assetsPages[modulesUrl] && self.assetsPages[modulesUrl] == 1) {
              pixiScene = new PixiScene1({
                json: gameConfigData.data.gameData,
                vueInstance:self,
                swiper:mySwiper
              });
              app.stage.addChild(pixiScene);
              document.getElementById('gamebasemasker').style.visibility = 'hidden';
            }else {
              var queue = new createjs.LoadQueue();
              queue.installPlugin(createjs.Sound);
              queue.on("complete", handleComplete, this);
              queue.loadManifest(audioManifest);
              function handleComplete() {

                pixiScene = new PixiScene1({
                  json: gameConfigData.data.gameData,
                  vueInstance:self,
                  swiper:mySwiper
                });
                app.stage.addChild(pixiScene);
                document.getElementById('gamebasemasker').style.visibility = 'hidden';

                self.SET_ASSETSPAGES({
                  assetsName:modulesUrl,
                  completedStat:1
                });
              }
            }
          }
        });

      }
    },
    beforeCreate(){
      if(this.$store.state.lessonPartsList.length==0){
        this.$router.push('/');
        window.location.reload()
      }
    },
    created(){
      document.getElementById('gamebasemasker').style.visibility = 'visible';
    },
    beforeDestroy(){
      this.slideLists = null;
      this.paginationLists = null;
      this.showCongra = false;

        mySwiper.destroy(true,true);
        mySwiperPagination.destroy(true,true);


      if(pixiScene){
        pixiScene.destroyed();
        pixiScene.destroy();
        pixiScene = null
      }
      if(canvasApp){
        canvasApp.destroy(true);
        canvasApp = null;
      }

    },

    mounted() {
      const self = this;
      self.SET_LESSONCURRENTPAGEINDEX(Number(self.allLessonComponentsNames.indexOf(self.$route.name)));


      canvasApp  = new PIXI.Application({
        width: 1920,
        height: 1080,
        antialias: false,
         transparent:true
      });

      canvasApp.view.style.position = 'absolute';
      canvasApp.view.style.width = '100%';
      canvasApp.view.style.height = '100%';
      canvasApp.view.style.top = '0px';
      canvasApp.view.style.left = '0px';
      canvasApp.view.style.right = '0px';
      canvasApp.view.style.margin = '0px auto';
      self.$refs.pixicanvas.appendChild(canvasApp.view);
      this.gameStart(canvasApp)



    },
  }
</script>

<style scoped>
  .bg {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
  }

  .swiper-container {
    position: absolute;
    top: 1rem;
  }
  .diyButtonPrev{

    width:2.5rem;
    height:6.6rem;
    background:transparent;
    left:0;
    top:2.2rem;


  }
  .diyButtonNext{
    background:none;
    width:2.5rem;
    height:6.6rem;
    background:transparent;
    right:0;
    top:2.2rem;


  }
  .swiper-slide-active, .swiper-slide-duplicate-active {

  }
  .swiper-slide-active.none-effect {
    /*color: green;*/
  }
  .none-effect {

  }
  #swiperContainerMain {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-grow: 1;
    padding: 0;
    margin: 0;
    width: 100%;
    transform-origin: center center;
    margin: 0 auto;
    left: 0;
    right: 0;
    top: 1.8rem;
    height: 8rem;
    z-index: 20;
  }
  .paginationPicture {
    position: absolute;
    width: 5.3rem;
    height: 1.8rem;
    left: 0;
    right: 0;
    margin: 0 auto;
    top: 8.8rem;
    z-index: 22;
  }
.pagi_triangles{
  position: absolute;
  width:5rem;
  height:0.8rem;
  margin:0 auto;
  left:0;
  right:0;
  top:0.22rem;
  z-index: 33;
}
.pagi_triangles .left{
  position: absolute;
  width:0.22rem;
  height:0.4rem;
  left:0.2rem;
  top:0.23rem;
}
  .pagi_triangles .right{
    position: absolute;
    width:0.22rem;
    height:0.4rem;
    right:0.2rem;
    top:0.23rem;
  }
  .slideInnerPic {
    position: absolute;
    width: 100%;
    height: 100%;
  }
  .paginationballs{
    position:relative;
    width:0.72rem;
    height:0.72rem;
    border-radius:50%;
    font-size:0.42rem;
    line-height:0.6rem;
    text-align:center;
    top:-0.02rem;
    color:#539bc5;
    line-height:170%;
    /*font-weight:bold;*/
  }
  #paginationdiy {
    position: absolute !important;
    width: 4rem;
    height: 1rem;
    left: 0;
    right: 0;
    margin: 0 auto;
    box-sizing: border-box;
    top:0.15rem;
    z-index:50;
  }
  .swiper-slide-paginationdiy {
    position:relative;
    display:flex;
    flex-grow:1;
    flex-direction:row;
    justify-content:center;
    align-items:center;
    background: transparent;
    width: 0.7rem;
    box-sizing: border-box;
  }
  .swiper-wrapper-paginationdiv {
    position: relative;
    box-sizing: border-box;
  }
  .swiper-slide-main {
    position: relative;
    height: 7.8rem;
    top: 0rem;

    box-sizing: border-box;
    background: transparent;
  }

  [v-cloak] {
    display: none;
  }

  .canvasApp{
    position: absolute;

    width:100%;
    height:100%;
    z-index: 100;
    top:0;
    left:0;
  }
  .babyChechArea{
    position: absolute;
    width:2rem;
    height:4rem;

    right:0;
    top:4rem;
    background: transparent;
    z-index: 80;
  }

</style>
