<template>
    <div style="position:absolute;left:0;top:0;width:100%;height:100%;z-index: 9999999;">
      <!--popup1 游戏的返回 -->
      <div class="maskerband" v-if="showType=='popup1'" >
        <div class="popup1" :style="backgroundPopup1">
          <div @click="againHandler"  class="continuneBtn" :style="leftBtnPopup1"></div>
          <div @click="continueHandler"  class="continuneBtn" :style="rightBtnPopup1"></div>
        </div>
      </div>


      <div class="maskerband" v-if="showType=='popup2'">
        <div  class="popup2" :style="backgroundPopup2">
          <div @click="againHandler"  class="continuneBtn" :style="leftBtnPopup2"></div>
          <div @click="continueHandler"  class="continuneBtn" :style="rightBtnPopup2"></div>
        </div>
      </div>

      <div class="maskerband" v-if="showType=='shutback'">
        <div  class="popup2" :style="backgroundPopup_shutback">
          <div @click="quitGame"  class="continuneBtn" :style="leftBtnPopup3"></div>
          <div @click="continueGame"  class="continuneBtn" :style="rightBtnPopup3"></div>
        </div>
      </div>



    </div>
</template>

<script>
    export default {
        name: "congra-popup",
      props:{
          showType:{
            type:String,
            default:"popup1"
          }
      },
      data(){
          return{}

      },
      methods:{
        continueHandler(){
          this.$emit('continueClicked')

        },
        againHandler(){
          this.$emit('againClicked')
        },
        quitGame(){
          this.$emit('quitGame')
        },
        //继续游戏
        continueGame(){
          this.$emit('continueGame')
        },
      },

      computed:{
        backgroundPopup_shutback(){
          return{
            background:"url('static/img/menus/popups/tuichuyemian.png') no-repeat",
            backgroundSize:"100% 100%"
          }
        },
        backgroundPopup2(){
          return{
            background:"url('static/img/menus/popups/icon-tankuang.png') no-repeat",
            backgroundSize:"100% 100%"
          }
        },
        //游戏里的
        backgroundPopup1(){
          return{
            background:"url('static/img/menus/popups/icon-win.png') no-repeat",
            backgroundSize:"100% 100%"
          }
        },
        leftBtnPopup1(){
          return{
            position:"absolute",
            background:"url('static/img/menus/popups/btn-2.png') no-repeat",
            backgroundSize:"100% 100%",
            top:"7.8rem",
            left:".4rem"
          }
        },
        rightBtnPopup1(){
          return{
            position:"absolute",
            background:"url('static/img/menus/popups/btn-1.png') no-repeat",
            backgroundSize:"100% 100%",
            top:"7.8rem",
            left:"4.9rem"
          }
        },
        leftBtnPopup2(){
          return{
            position:"absolute",
            background:"url('static/img/menus/popups/btn-2.png') no-repeat",
            backgroundSize:"100% 100%",
            left:"1.2rem",
            top:"4.2rem",

          }
        },
        rightBtnPopup2(){
          return{
            position:"absolute",
            background:"url('static/img/menus/popups/btn-1.png') no-repeat",
            backgroundSize:"100% 100%",
            right:"1.2rem",
            top:"4.2rem",

          }
        },
        leftBtnPopup3(){
          return{
            position:"absolute",
            background:"url('static/img/menus/popups/btn-quit.png') no-repeat",
            backgroundSize:"100% 100%",
            left:"1.2rem",
            top:"4.2rem",

          }
        },
        rightBtnPopup3(){
          return{
            position:"absolute",
            background:"url('static/img/menus/popups/btn-1.png') no-repeat",
            backgroundSize:"100% 100%",
            right:"1.2rem",
            top:"4.2rem",

          }
        }
      }
    }
</script>

<style scoped>
.popup1{
  position: absolute;
  width:8.39rem;
  height:7rem;
  margin:0 auto;
  left:0;
  right:0;
  top:1rem;


}
.maskerband{
  position: absolute;
  width:100%;
  height:100%;
  left:0;
  top:0;
  background-color: rgba(0,0,0,0.8);
  z-index: 10;
}
.popup2{
  position: absolute;
  width:9.80rem;
  height:6.30rem;
  margin:0 auto;
  left:0;
  right:0;
  top:2rem;

}
  .continuneBtn{
    position: absolute;
    width:3.36rem;
    height:.93rem;
  }

</style>
