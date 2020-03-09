// 引入axios
import axios from 'axios';
import cache from './cache'
import {store} from '../store'

// 所有接口的 base_url 前缀
// var root = 'http://172.18.71.104:8229'; // 项目部

// var root = 'http://172.16.3.32:80'; // 中心地铁站
var root = 'http://172.16.12.55:8922'; // 测试环境
//  引入 element 弹框
// import {MessageBox} from 'element-ui'
// 请求时间
 axios.defaults.timeout = 15000;
import {
  message
} from './resetMessage';
var errs = true;
function apiAxios(method, url, params, success) {
  axios({
    method: method, // 请求方式 post get delete get等
    url: url, // 具体接口地址
    data: method === 'POST' || method === 'PUT' ? params : null,
    params: method === 'GET' || method === 'DELETE' ? params : null,
    baseURL: root, // base_url
    withCredentials: false,  // cookie
    headers: {
      'Content-Type': 'application/json;charset=utf-8', // 请求头
    },
    adapter: cache({
      time: 2000
    })
  }).then(function (res) {
    // 成功时回调
    if (typeof res.data === 'string') {
      var stringData = res.data;
      if (stringData.indexOf('27004') !== -1) {
        alert('服务异常!');
      }
    } else {
      if (success) {
        success(res.data);
      }
    }
  }).catch(function (err) {

    // 异常时回调
    // if (errs) {
    //
    // }
    store.commit('setShow', false);
    // MessageBox.alert('网络连接失败,请检查网络!');
    message.warning('网络连接失败, 请检查网络......');
    // errs = false;

    return false;
  });
}
// setTimeout(function () {
//   errs = true
// },100);
// 返回在vue模板中的调用接口
export default {
  // 查询
  get: function (url, params, success) {
    return apiAxios('GET', url, params, success);
  },
  // 修改
  post: function (url, params, success) {
    return apiAxios('POST', url, params, success);
  },
  // 更新
  put: function (url, params, success) {
    return apiAxios('PUT', url, params, success);
  },
  // 删除
  delete: function (url, params, success) {
    return apiAxios('DELETE', url, params, success);
  }
}
