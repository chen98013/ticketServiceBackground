import Vue from 'vue'
// 限制按钮点击事件，在结果返回以前不能继续点击
Vue.directive('btn-control', {
  inserted(el, binding) {
    el.addEventListener('click', e => {
      if (!el.disabled) {
        el.disabled = true;
        el.style.cursor = 'not-allowed';
        setTimeout(() => {
          el.style.cursor = 'pointer';
          el.disabled = false
        }, 2000)
      }
    })
  }
});
export default {}.install = (Vue, options = {}) => {

}
