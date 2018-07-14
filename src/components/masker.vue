<template>
  <div class="masker">
    <div class="loadingUI">
      <img src="static/img/loading.gif" width="100%" height="auto"/>
    </div>

  </div>

</template>
<script>
  export default {
    name: "masker",
    mounted() {
    },
  }
</script>

<style scoped>
  .masker {
    position: fixed;
    width: 19.2rem;
    height:10.80rem;
    top: 0px;
    left: 0px;
    background: black;
    z-index: 9999999999;
    pointer-events: none;
    padding:0;
    margin:0;
    visibility: hidden;


  }
  .loadingUI {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    width: 1.8rem;
    height: 1.8rem;
  }
</style>
