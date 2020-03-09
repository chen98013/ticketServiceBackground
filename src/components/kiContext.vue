<template>
  <div>
  <!--鼠标右键点击显示菜单-->
    <ul class="menu" id="menu">
      <li><span>复制</span></li>
      <li><span>粘贴</span></li>
      <li><span>刷新</span></li>
      <li><span>其他功能1</span></li>
      <li><span>其他功能2</span></li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'kiContext',
  mounted() {

  },
  methods: {

  },
  created() {
    this.init()
  }
}
</script>

<style scoped>

</style>
