<template>
  <div class="menu_tree_box">
    <el-menu :default-active="current" :router="true" background-color="#545c64" text-color="#fff"
             active-text-color="#409eff" :unique-opened="true">
      <template v-for="(item,index) in menuList">
        <el-submenu :disabled="slang" class="first_level" v-if="item.TYPE === '00'" :index="item.MENU_ID">
          <template slot="title">
            <i :class="item.ICON"></i>
            {{item.NAME}}
          </template>
          <template v-for="(val,j) in item.CHILDREN">
            <el-submenu  :disabled="slang" class="second_level" v-if="val.TYPE === '00'" :index="val.MENU_ID">
              <template slot="title">
                <i :class="val.ICON"></i>
                {{val.NAME}}
              </template>
              <el-menu-item  :disabled="slang" class="third_level" v-for="(i,index2) in val.CHILDREN" :key="index2" :index="i.URL">
                <i :class="i.ICON"></i>
                {{i.NAME}}
              </el-menu-item>
            </el-submenu>
            <el-menu-item :disabled="slang" class="second_level" v-if="val.TYPE === '01'" :key="val.MENU_ID" :index="val.URL">
              <i :class="val.ICON"></i>
              {{val.NAME}}
            </el-menu-item>
          </template>
        </el-submenu>
        <el-menu-item :disabled="slang" class="first_level" v-if="item.TYPE === '01'" :key="item.MENU_ID" :index="item.URL">
          <i :class="item.ICON"></i>
          {{item.NAME}}
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script>
  import {sortObjectValue} from "../assets/js/recursive";

  export default {
    name: "menuList",
    data() {
      return {
        menuList: [], // 显示集合
        cacheMenu: [], // 缓存集合 菜单
        defaultExpandedKeys: [], // 默认展开的节点数据
        // 树节点配置
        defaultProps: {
          label: 'NAME', // 显示名称
          children: 'CHILDREN', // 子节点
          disabled: function (data) {
            // type 01 菜单级别
            if (data.TYPE === '01') {
              // 不显示在页面上
              var url = data.URL.split('/');
              data.IndexName = url[url.length - 1];
              data.CHILDREN = null; // 清除 type 02的节点
            }
            // 全部禁用 复选框, 利用 禁用树形的css类名 隐藏复选框
            return true;
          }
        }
      }
    },
    methods: {
      // 获取菜单列表
      getMenuList() {
        var _t = this;
        var menuList = new Array();
        menuList = localStorage.getItem('MENU_LIST');
        if (menuList !== null) {
          menuList = JSON.parse(menuList).filter(item => item !== null);
          // 安装order_num排序
          menuList.sort(sortObjectValue('ORDER_NUM', true));
          _t.menuList = menuList;
          // 处理高亮
          var cacheMenu = _t.getTreeList(_t.menuList, []);
          var cacheMenuArr = new Array();
          // 过滤 type 为 01(菜单) 类型的
          cacheMenu.forEach((item) => {
            // type 为 01 值增加 IndexName
            if (item.TYPE === '01') {
              var url = item.URL.split('/');
              var length = url.length === 0 ? 0 : url.length;
              if (length !== 0) {
                item.IndexName = url[length - 1];
              } else {
                item.IndexName = '';
              }
              cacheMenuArr.push(item);
            }
          });
          // 缓存赋值
          _t.cacheMenu = cacheMenuArr;
          localStorage.setItem('limitMenuList', JSON.stringify(_t.cacheMenu));
        }
      },
      // 递归将树形转为扁平
      getTreeList(arr, result) {
        var self = this;
        arr.forEach(function (item) {
          if (item.CHILDREN !== undefined && item.CHILDREN !== null) {
            result.push(item);
            self.getTreeList(item.CHILDREN, result)
          } else {
            result.push(item);
          }
        });
        return result;
      },
    },

    computed: {
      slang () {
        if (this.$store.state.options.length == '10') {
         return  true;
        } else {
          return  false;
        }
      },
      // 监听 url 详情页面的导航
      current() {

        var arr = this.$route.path.split('/');
        if (arr.length > 4) {
          arr.pop();
          return arr.join("/");
        } else {
          return this.$route.path;
        }
      }
    },
    created() {
      var _t = this;
      // 获取菜单列表
      _t.getMenuList();
    },
    mounted() {
      // 刷新时以当前路由做为tab加入tabs
      var _t = this;
      if (_t.$route.name !== 'index') {
        // 非首页且非详情页
        _t.$store.commit('add_tabs', {route: '/index', title: '首页', name: 'index'});
        _t.$store.commit('add_tabs', {
          route: _t.$route.path,
          title: _t.$route.meta.title,
          name: _t.$route.name
        });
        _t.$store.commit('set_active_index', _t.$route.name);
      } else {
        // 首页
        _t.$store.commit('add_tabs', {route: '/index', title: '首页', name: 'index'});
        _t.$store.commit('set_active_index', 'index');
      }
    },
  }
</script>

<style>
  .menu_tree_box .el-menu {
    background: transparent;
  }
  .el-menu {
    border: none;
  }
  .menu_tree_box .el-menu-item.is-active {
    background-color: #f0f7ff !important;
    color: #409eff !important;
  }

  .menu_tree_box .el-submenu__title,
  .menu_tree_box .el-menu-item,
  .menu_tree_box .el-menu i {
    color: #fff;
  }

  .menu_tree_box .el-menu-item.first_level,
  .first_level > .el-submenu__title {
    padding-left: 10px !important;
  }

  .menu_tree_box .el-menu-item.second_level,
  .second_level > .el-submenu__title {
    padding-left: 30px !important;
  }

  .menu_tree_box .el-menu-item.third_level {
    padding-left: 50px !important;
  }

  .menu_tree_box .el-menu-item:focus,
  .menu_tree_box .el-menu-item:hover {
    /*background-color: #f0f7ff;*/
    /*color: #474747;*/
    /*background-color: #f0f7ff;*/
    /*color: #474747;*/
  }
  .el-submenu .el-menu {

  }
  /*.menu_tree_box .el-menu-item:focus i,*/
  /*.menu_tree_box .el-menu-item:hover i,*/
  /*.menu_tree_box .el-submenu__title:hover,*/
  /*.menu_tree_box .el-submenu__title:hover i,*/
  .menu_tree_box .el-menu-item.is-active i {
    color: #474747;
  }
</style>
