<template>
  <div class="app_wrapper">
    <!--布局-->
    <div class="app_box">
      <!--左侧菜单-->
      <div class="app_side_box">
        <div class="headerTitle">{{formItem.title}}</div>
        <Menu/>
      </div>
      <!--顶部菜单-->
      <div class="app_header_box">
        <div class="headerBox tr">
          <div class="displayInlineBlock" v-if="formItem.isShow">
            <span class="colorWhite marRight20" v-if="formItem.location_name !== ''">{{formItem.location_name}}</span>
          </div>
          <span class="userName colorWhite">{{formItem.user_name}}-{{formItem.user_id}}</span>
<!--          <el-badge :value="badgeValue" :max="99" class="marRight20 message">-->
<!--            <el-button size="small" type="primary">消息</el-button>-->
<!--          </el-badge>-->
          <el-button @click="changePass" size="small" type="primary">修改密码</el-button>
          <el-button @click="loginOut" size="small" type="primary">退出</el-button>
        </div>
        <div @contextmenu.prevent="show" class="template-tabs">
          <el-tabs
            v-model="activeIndex"
            type="border-card"
            closable
            @tab-click="tabClick"
            @tab-remove="tabRemove">
            <el-tab-pane
              :key="item.name"
              v-for="(item, index) in options"
              :label="item.title"
              :name="item.name">
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
      <!--内容区域-->
      <div class="app_main_box" id="app_main_box">
        <div class="content-wrap">
          <keep-alive v-if="isRouterAlive" :include="cached">
            <router-view></router-view>
          </keep-alive>
        </div>
      </div>
      <ul class="menu" id="menu">
        <li @click.stop="closeAll"><span>全部关闭</span></li>
        <!--        <li @click.stop="refresh"><span>刷新</span></li>-->
        <li @click.stop="close"><span>关闭</span></li>
      </ul>
    </div>
    <!--修改密码弹出层-->
    <el-dialog
      title="修改密码"
      :visible.sync="passwordDialog"
      append-to-body
      :before-close="resetPassword"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <el-form :model="passwordForm" label-width="180px">
        <el-form-item class="star" label="旧密码：">
          <el-input
            maxlength="6"
            @blur="ruleIsNotNull(passwordForm,passwordForm.oldPassword,'oldPasswordFlag')"
            v-model="passwordForm.oldPassword"
            class="width200"
            type="password"/>
          <span class="isNotNull" v-if="passwordForm.oldPasswordFlag">必填项不能为空</span>
        </el-form-item>
        <el-form-item class="star" label="新密码：">
          <el-input
            maxlength="6"
            class="width200"
            type="password"
            @blur="blurPassword(passwordForm,passwordForm.newPassword,passwordForm.confirmPassword)"
            v-model="passwordForm.newPassword"/>
          <span class="isNotNull" v-if="passwordForm.passwordFlag">必填项不能为空</span>
        </el-form-item>
        <el-form-item class="star" label="确认新密码：">
          <el-input
            maxlength="6"
            class="width200"
            type="password"
            @blur="blurConfirmPassword(passwordForm,passwordForm.confirmPassword,passwordForm.newPassword)"
            v-model="passwordForm.confirmPassword"/>
          <span class="isNotNull" v-if="passwordForm.confirmPasswordFlag">{{passwordForm.confirmPasswordTip}}</span>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="resetPassword">取消</el-button>
        <el-button type="primary" @click="commitPassword">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import Menu from "../components/menuList";
  import kitContext from '../components/kiContext'

  export default {
    name: "Index",
    components: {
      Menu
    },
    data() {
      return {
        isRouterAlive: true,
        // 表头表单
        formItem: {
          title: this.getCookie('BACKSTAGE'),// 欢迎语
          location_name: '', // 位置名称
          location_number: '', // 位置编码
          user_id: this.getCookie('USER_ID'), // 用户id
          user_name: this.getCookie('USER_NAME'), // 用户名
          isShow: false, // 是否显示位置
        },
        badgeValue: 9, // 消息提示
        cached: [], // 缓存的组件
        hackReset: true,
        // 修改密码弹出层
        passwordDialog: false,
        // 修改密码表单
        passwordForm: {
          oldPassword: '', // 旧密码
          oldPasswordFlag: false, // 旧密码校验标识
          newPassword: '', // 修改后的密码
          confirmPassword: '', // 确认密码
          passwordFlag: false, //  密码标识
          confirmPasswordFlag: false, // 确认密码标识
          confirmPasswordTip: '', // 确认密码提示
        },
        routePath: ''
      }
    },
    methods: {
      // 刷新
      refresh() {
        this.isRouterAlive = false;
        this.$nextTick(function () {
          this.isRouterAlive = true;
        })
      },
      // 退出登录
      loginOut() {
        var _t = this;
        _t.$confirm('是否确认退出登录', '温馨提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          _t.delCookie('userId');
          _t.$router.push({name: 'Login'});
        }).catch(() => {
          return false;
        });
      },
      // 获取登录车站位置的缓存数据
      getData() {
        var _t = this;
        // 没有location_number就是首次登录
        var location_number = _t.getCookie('LOCATION_NUMBER');
        if (location_number !== null && location_number !== 'null' && location_number !== '') {
          // 获取登录位置及编号
          var location_name = _t.getCookie('LOCATION_NUMBER_NAME');
          if (location_name !== null && location_name !== 'null') {
            // 赋值登录位置
            _t.formItem.location_name = location_name;
          }
          if (location_number !== null && location_number !== 'null') {
            // 赋值登录位置编号
            _t.formItem.location_number = location_number;
          }
          if (_t.formItem.location_name !== '' || _t.formItem.location_number !== '') {
            // 显示登录位置区域
            _t.formItem.isShow = true;
          }
        }
      },
      // 修改密码弹出层
      changePass() {
        var _t = this;
        _t.passwordDialog = true;
      },
      // 重置密码弹出层
      resetPassword() {
        var _t = this;
        _t.passwordDialog = false;
        _t.passwordForm.oldPassword = ''; // 旧密码
        _t.passwordForm.oldPasswordFlag = false; // 旧密码标识
        _t.passwordForm.newPassword = ''; // 修改后的密码
        _t.passwordForm.confirmPassword = ''; // 确认密码
        _t.passwordForm.passwordFlag = false; //  密码标识
        _t.passwordForm.confirmPasswordFlag = false; // 确认密码标识
        _t.passwordForm.confirmPasswordTip = ''; // 确认密码提示
      },
      // 校验必填项不能为空
      ruleIsNotNull(item, val, flag) {
        item[flag] = val.trim() === '' ? true : false;
      },
      // 校验确认密码
      blurPassword(item, valPwd, valConfirmPwd) {
        if (valPwd.trim() === '') {
          // 为空的校验
          item.passwordFlag = true;
        } else {
          item.passwordFlag = false;
          // 校验两次面输入是否一致
          if (valPwd.trim().toLowerCase() === valConfirmPwd.trim().toLowerCase()) {
            item.confirmPasswordFlag = false;
            item.confirmPasswordTip = '';
          } else if (valConfirmPwd.trim() !== '' && valPwd.trim().toLowerCase() !== valConfirmPwd.trim().toLowerCase()) {
            item.confirmPasswordFlag = true;
            item.confirmPasswordTip = '两次密码输入不一致!';
          }
        }
      },
      // 校验再次确认密码
      blurConfirmPassword(item, valNew, valOld) {
        if (valNew.trim() === '') {
          item.confirmPasswordFlag = true;
          item.confirmPasswordTip = '必填项不能为空!';
        } else {
          // 不为空 校验和第一次输入的密码是否一致
          if (valOld.trim().toLowerCase() === valNew.trim().toLowerCase()) {
            // 相同
            item.confirmPasswordFlag = false;
            item.confirmPasswordTip = '';
          } else {
            // 不相同
            item.confirmPasswordFlag = true;
            item.confirmPasswordTip = '两次密码输入不一致!';
          }
        }
      },
      // 提交修改密码
      commitPassword() {
        var _t = this;
        if (_t.formItem.user_id !== null && _t.formItem.user_id !== 'null') {
          // 校验旧密码不能为空
          _t.ruleIsNotNull(_t.passwordForm, _t.passwordForm.oldPassword, 'oldPasswordFlag');
          // 校验新密码
          _t.blurPassword(_t.passwordForm, _t.passwordForm.newPassword, _t.passwordForm.confirmPassword);
          // 校验确认新密码
          _t.blurConfirmPassword(_t.passwordForm, _t.passwordForm.confirmPassword, _t.passwordForm.newPassword);
          // 可以提交
          if (_t.passwordForm.oldPasswordFlag === false
            && _t.passwordForm.confirmPasswordFlag === false
            && _t.passwordForm.passwordFlag === false) {
            let str = 'userid=' + _t.formItem.user_id
              + '&oldpassword=' + _t.passwordForm.oldPassword.trim()
              + '&newpassword=' + _t.passwordForm.newPassword.trim();
            let Base64 = require('js-base64').Base64;
            let keyToken = _t.$md5(Base64.encode(str));
            var params = {
              userid: _t.formItem.user_id, // 操作员id
              oldpassword: _t.passwordForm.oldPassword.trim(), // 旧密码
              newpassword: _t.passwordForm.newPassword.trim(), // 新密码
              token: keyToken, // token
            };
            _t.$api.post('/tsGateWay/systemManager/editpassword', params, function (res) {
              if (res.rtCode && res.rtCode === '18001') {
                _t.$alert(res.rtMessage, '温馨提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消'
                }).then(() => {
                  _t.$router.push({name: 'Login'});
                }).catch(() => {
                  _t.$router.push({name: 'Login'});
                });
              } else if (res.rtCode === '24001') {
                _t.alertDialogTip(_t, res.rtMessage);
              } else {
                _t.alertDialogTip(_t, res.rtMessage);
              }
            });
          }
        }
      },
      // 标签页

      // tab切换时，动态的切换路由
      tabClick(tab) {
        var _t = this;
        if (tab.name !== _t.$route.name) {
          _t.$router.push({name: _t.activeIndex});
        }
      },
      // 删除页签
      tabRemove(path) {
        var _t = this;
        // 首页不可删除
        if (path === 'index') {
          return;
        }
        this.cached.forEach((item, index) => {
          if (item == path) {
            this.cached.splice(index, 1)
          }
        });
        _t.cached.push(path);
        // 删除当前页签
        _t.$store.commit('delete_tabs', path);
        _t.routePath = path;
        // 判断是否删除当前 若是:激活前一项
        if (_t.activeIndex === path) {
          // 设置当前激活的路由
          if (_t.options && _t.options.length >= 1) {
            _t.$store.commit('set_active_index', _t.options[_t.options.length - 1].name);
            _t.$router.push({name: _t.activeIndex});
          } else {
            _t.$router.push({name: 'index'});
          }
        }
      },
      // 单击右键关闭全部
      closeAll() {
        var menu = document.getElementById('menu');
        menu.style.display = 'none';
        menu.style.left = 0 + 'px';
        menu.style.top = 0 + 'px';
        var obj = {
          name: "index",
          route: "/index",
          title: "首页"
        };
        this.$store.commit('deleteAll', obj);
        this.$router.push({name: 'index'});
      },
      // 单击右键关闭
      close() {
        var _t = this;
        // 首页不可删除
        var menu = document.getElementById('menu');
        menu.style.display = 'none';
        menu.style.left = 0 + 'px';
        menu.style.top = 0 + 'px';
        if (this.$route.name === 'index') {
          return;
        }
        _t.$store.commit('delete_tabs', _t.$route.name);
        // 判断是否删除当前 若是:激活前一项
        if (_t.activeIndex === this.$route.name) {
          // 设置当前激活的路由
          if (_t.options && _t.options.length >= 1) {
            _t.$store.commit('set_active_index', _t.options[_t.options.length - 1].name);
            _t.$router.push({name: _t.activeIndex});
          } else {
            _t.$router.push({name: 'index'});
          }
        }
      },
      show(el) {
        var _t = this;
        // 获取节点
        var menu = document.getElementById('menu');

        //获取可视区宽度,高度
        var winWidth = document.documentElement.clientWidth || document.body.clientWidth;
        var winHeight = document.documentElement.clientHeight || document.body.clientHeight;

        // 点击空白区域 隐藏菜单
        document.addEventListener('click', function () {
          menu.style.display = 'none';
          menu.style.left = 0 + 'px';
          menu.style.top = 0 + 'px';
        });

        // // 点击菜单
        // menu.addEventListener('click', function (e) {
        //   var e = e || window.event;
        //   if (e.target.innerText == '全部关闭') {
        //     menu.style.display = 'none';
        //     menu.style.left = 0 + 'px';
        //     menu.style.top = 0 + 'px';
        //   }else if (e.target.innerText == '关闭') {
        //     menu.style.display = 'none';
        //     menu.style.left = 0 + 'px';
        //     menu.style.top = 0 + 'px';
        //   }
        // });

        //右键菜单
        document.oncontextmenu = function (e) {
          return false;
        };
        var els = el || window.event;
        menu.style.display = 'block';
        // 获取鼠标坐标
        var mouseX = els.clientX;
        var mouseY = els.clientY;
        // 判断边界值，防止菜单栏溢出可视窗口
        if (mouseX >= (winWidth - menu.offsetWidth)) {
          mouseX = winWidth - menu.offsetWidth;
        } else {
          mouseX = mouseX
        }
        if (mouseY > winHeight - menu.offsetHeight) {
          mouseY = winHeight - menu.offsetHeight;
        } else {
          mouseY = mouseY;
        }
        menu.style.left = mouseX + 'px';
        menu.style.top = mouseY + 'px';
      },
    },
    created() {
      var _t = this;
      _t.getData();
    },
    mounted() {
      var _t = this;
    },
    computed: {
      options() {
        this.cached = [];
        this.$store.state.options.forEach(item => {
          this.cached.push(item.name)
        });
        return this.$store.state.options;
      },
      activeIndex: {
        get() {
          return this.$store.state.activeIndex;
        },
        set(val) {
          this.$store.commit('set_active_index', val);
        }
      }

    },
    watch: {
      $route(to, from) {
        var _t = this;
        let flag = false;
        for (var option of _t.options) {
          if (option.name === to.name) {
            flag = true;
            _t.$store.commit('set_active_index', to.name);
            break;
          }
        }
        if (!flag) {
          _t.$store.commit('add_tabs', {
            route: to.path,
            title: to.meta.title,
            name: to.name
          });
          _t.$store.commit('set_active_index', to.name);
        }
      },
    }
  }

</script>
<style scoped>
  .menu {
    width: 100px;
    border: 1px solid #ccc;
    position: absolute;
    box-shadow: 2px 2px 8px 1px rgba(0, 0, 0, .2);
    display: none;
    background: #fff;
    z-index: 9999;
  }

  .menu li {
    list-style: none;
    width: 100%;
  }
  /*!*解决蓝色边框*!*/
  /*.tabNews .el-tabs__item:focus.is-active.is-focus:not(:active) {*/
  /*  -webkit-box-shadow: none;*/
  /*  box-shadow: none;*/
  /*}*/

  .menu li span {
    display: inline-block;
    text-decoration: none;
    color: #555;
    width: 100%;
    padding: 10px 0;
    text-align: center;
    cursor: pointer;
  }

  .menu li:first-of-type {
    border-radius: 5px 5px 0 0;
  }

  .menu li span:hover {
    background: #eee;
    color: #CC1A1A;
  }

  .app_wrapper,
  .app_box {
    width: 100%;
    height: 100%;
  }

  .app_header_box {
    position: fixed;
    left: 240px;
    right: 0;
    top: 0;
    z-index: 11;
    color: #000;
  }

  .app_side_box {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 10;
    width: 240px;
    overflow: auto;
    background-color: #545c64;
  }

  .app_main_box {
    position: fixed;
    top: 90px;
    left: 240px;
    right: 0;
    bottom: 0;
    z-index: 10;
    overflow: auto;
  }

  .userName {
    margin-right: 20px;
  }

  .colorWhite {
    font-size: 16px;
    color: #333;
  }

  .headerTitle {
    color: #333;
    font-size: 18px;
    height: 90px;
    line-height: 100px;
    text-align: center;
    border-bottom: 1px solid #999;
    border-right: 1px solid #ddd;
    background-color: #f0f0f0;
    /*box-shadow: 0 0 10px 5px #ddd inset*/
  }

  .headerBox {
    height: 50px;
    line-height: 50px;
    padding: 0 20px;
    border-bottom: 1px solid #ddd;
    background-color: #f3f3f4;
  }
</style>
<style>
  .message .el-badge__content.is-fixed {
    top: 10px;
    right: 20px;
  }
</style>
