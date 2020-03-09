<template>
  <!--所有内容组件的加载区域-->
  <div id="appMain"
       class="app-main"
       v-loading.body.lock="loading"
       element-loading-text="拼命加载中...">
    <div class="box-wrap">
      <!--插槽-->
      <slot/>
    </div>
  </div>
</template>

<script>
    export default {
        name: "Box",
        props: ['currentPage', 'crumbs'],
        // 计算属性
        computed: {
            loading() {
                return this.$store.state.loading;
            }
        }
    }
</script>

<style scoped>
  .app-main {
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
  }

  .box-wrap {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100%;
    overflow: auto;
    padding: 20px;
  }
</style>
