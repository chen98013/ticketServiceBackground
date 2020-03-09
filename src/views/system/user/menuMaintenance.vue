<template>
  <Box>
    <div class="menu_box">
      <!--左侧树-->
      <div id="menu_navBar" class="menu_navBar">
        <p class="menu_title">
          <a href="javascript:;" @click="clickNode">功能菜单</a>
        </p>
        <el-tree
          id="menu_tree"
          class="menu_tree"
          :data="treeData"
          ref="treeMenu"
          node-key="MENU_ID"
          :props="defaultProps"
          highlight-current
          @node-click="getCurrentNode"
          :default-expand-all="false"/>
      </div>
      <!--拖拽线-->
      <div id="resize_menu" title="可拖拽"></div>
      <!--内容区-->
      <div id="menu_content" class="menu_content">
        <div class="formBox-top paddingBottom15">
          <el-button v-if="limitBtn.create" :disabled="formItem.type === '02'" type="primary" @click="addMenu">新增菜单
          </el-button>
          <el-button type="primary" v-if="limitBtn.query" @click="getData">查询</el-button>
          <el-button type="warning" @click="resetFormItem">重置</el-button>
        </div>
        <div class="tableMp">
          <el-table :data="tableData" border stripe>
            <el-table-column prop="MENU_ID" label="菜单ID"/>
            <el-table-column prop="NAME" label="菜单名称"/>
            <el-table-column prop="PARENT_ID" label="父菜单"/>
            <el-table-column label="类型" width="60px">
              <template slot-scope="scope">
                <span v-if="scope.row.TYPE === '00'" class="primaryBtn">目录</span>
                <span v-if="scope.row.TYPE === '01'" class="successBtn">菜单</span>
                <span v-if="scope.row.TYPE === '02'" class="warningBtn">按钮</span>
              </template>
            </el-table-column>
            <el-table-column prop="URL" label="请求地址"/>
            <el-table-column prop="ORDER_NUM" label="排序"/>
            <el-table-column label="是否可用" width="80px">
              <template slot-scope="scope">
                <span v-if="scope.row.ISENABLE === 0">启用</span>
                <span v-if="scope.row.ISENABLE === 1" class="redText">禁用</span>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" header-align="center" align="center" width="200px">
              <template slot-scope="scope">
                <el-button type="primary" v-if="limitBtn.modify" @click="editMenu(scope.row)">修改</el-button>
                <el-button type="danger" v-if="limitBtn.delete" @click="deleteMenu(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <!--分页-->
          <pages
            :total='options.total'
            :currentPage='options.currentPage'
            :page-size="options.pageSize"
            @handleSizeChangeSub="handleSizeChangeSub"
            @handleCurrentChangeSub="handleCurrentChange"/>
        </div>
      </div>
    </div>
    <!--新增编辑弹出层-->
    <el-dialog
      append-to-body
      :fullscreen="isScreen"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="resetMenu"
      :visible.sync="dialogVisible">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">新增/编辑菜单</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreen = !isScreen"></i>
      </div>
      <el-form :model="addEdit" ref="addEdit" label-width="120px">
        <!--新增时-->
        <el-form-item v-if="isAdd === true" label="父菜单ID：">
          <el-input v-model="addEdit.parentId" disabled/>
        </el-form-item>
        <!--编辑时-->
        <el-form-item v-if="isAdd === false" label="菜单ID：">
          <el-input v-model="addEdit.menuId" disabled/>
        </el-form-item>
        <el-form-item class="star" label="菜单名称：">
          <el-input  maxlength="12" v-model="addEdit.menuName" @blur="blurInput(errorTip,addEdit.menuName,'menuNameFlag')"/>
          <span class="isNotNull"  v-if="errorTip.menuNameFlag">必填项不能为空</span>
        </el-form-item>
        <el-form-item class="star" label="菜单URL：">
          <el-input  maxlength="70" v-model="addEdit.menuURL" @blur="blurInput(errorTip,addEdit.menuURL,'menuURLFlag')"/>
          <span class="isNotNull" v-if="errorTip.menuURLFlag">必填项不能为空</span>
        </el-form-item>
        <el-form-item class="star" label="菜单类型：">
          <el-select class="widthAll" v-model="addEdit.menuType"
                     @change="blurInput(errorTip,addEdit.menuType,'menuTypeFlag')">
            <el-option v-for="(item,index) in typeList" :key="index" :label="item.NAME" :value="item.VALUE"/>
          </el-select>
          <span class="isNotNull" v-if="errorTip.menuTypeFlag">必填项不能为空</span>
        </el-form-item>
        <!--        <el-form-item class="star" label="菜单图标：">-->
        <!--          <el-input class="width200" v-model="addEdit.menuIcon"-->
        <!--                    @blur="blurInput(errorTip,addEdit.menuIcon,'menuIconFlag')"/>-->
        <!--          <span class="isNotNull" v-if="errorTip.menuIconFlag">必填项不能为空</span>-->
        <!--        </el-form-item>-->
        <el-form-item class="star" label="排序：">
          <el-input
            oninput="value=value.replace(/[^\d]/g,'')"
            v-model="addEdit.menuSort"
            @blur="blurInput(errorTip,addEdit.menuSort,'menuSortFlag')"/>
          <span class="isNotNull" v-if="errorTip.menuSortFlag">必填项不能为空</span>
        </el-form-item>
        <el-form-item class="star" label="是否可用：">
          <el-radio-group v-model="addEdit.menuUse" @change="blurInput(errorTip,addEdit.menuUse,'menuUseFlag')">
            <el-radio label="0">启用</el-radio>
            <el-radio label="1">禁用</el-radio>
          </el-radio-group>
          <span class="isNotNull" v-if="errorTip.menuUseFlag">必填项不能为空</span>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="resetMenu">取消</el-button>
        <el-button v-if="isAdd === true" type="primary" v-btn-control @click="addMenuData">保存</el-button>
        <el-button v-if="isAdd === false" type="primary" v-btn-control @click="editMenuData">保存</el-button>
      </div>
    </el-dialog>
  </Box>
</template>

<script>
    import Box from '../../../components/Box';
    import {sortObjectValue} from "../../../assets/js/recursive";

    export default {
        name: "menuMaintenance",
        components: {Box},
        data() {
            return {
                isScreen: false, // 新增编辑放大缩小
                // 查询表单
                formItem: {
                    parentId: '0', // 当前菜单id
                    type: '00', // 类型
                },
                //右侧内容区默认的left值
                leftOfRightView: 172,
                // 左侧树接口
                treeData: [],
                defaultProps: {
                    label: 'NAME',
                    children: 'CHILDREN'
                },
                // 表格数据
                tableData: [],
                // 分页
                options: {
                    total: 0, // 总条数
                    currentPage: 1, // 当前页码
                    pageSize: 10, // 显示条数
                },
                // 是否新增
                isAdd: false,
                // 新增编辑蒙版层
                dialogVisible: false,
                // 新增编辑表单
                addEdit: {
                    parentId: '', // 父菜单id
                    menuId: '', // 当前菜单id
                    menuName: '', // 菜单名称
                    menuURL: '', // 菜单URL
                    menuType: '', // 菜单类型
                    menuIcon: 'el-icon-menu', // 菜单图标
                    menuSort: '', // 排序
                    menuUse: '0', // 是否可用
                },
                // 新增编辑表单校验
                errorTip: {
                    menuNameFlag: false, // 菜单名称
                    menuURLFlag: false, // 菜单URL
                    menuTypeFlag: false, // 菜单类型
                    menuIconFlag: false, // 菜单图标
                    menuSortFlag: false, // 排序
                    menuUseFlag: false, // 是否可用
                },
                // 菜单类型字典
                typeList: [],
                // 按钮权限
                limitBtn: {
                    query: false, // 查询
                    create: false, // 新增
                    modify: false, // 修改
                    delete: false, // 删除
                }
            }
        },
        methods: {
            // 重置查询表单
            resetFormItem() {
                var _t = this;
            },
            // 点击功能菜单
            clickNode() {
                var _t = this;
                _t.formItem.parentId = '0';
                _t.formItem.type = '00';
                _t.getData();
            },
            // 获取左侧树形数据
            getTreeData() {
                var _t = this;
                _t.$api.post('/tsGateWay/systemManager/querymenutree', {}, function (res) {
                  _t.$store.commit('setLoading', false);
                    if (res.rtCode && res.rtCode === '18047') {
                        var treeData = res.rtData === null ? [] : res.rtData;
                        treeData.sort(sortObjectValue('ORDER_NUM', true));
                        _t.treeData = treeData;
                        _t.getData();
                    } else if (res.rtCode) {
                      _t.alertDialogTip(_t, res.rtMessage);
                    }
                });
            },
            // 点击左侧树节点
            getCurrentNode(data) {
                var _t = this;
                _t.formItem.parentId = data.MENU_ID;
                _t.formItem.type = data.TYPE;
                _t.getData();
            },
            // 改变当前页码
            handleCurrentChange(val) {
                var _t = this;
                _t.options.currentPage = val;
                _t.getData();
            },
            // 改变每页显示条数
            handleSizeChangeSub(val) {
                var _t = this;
                _t.options.pageSize = val;
                _t.getData();
            },
            // 获取表格数据
            getData() {
                var _t = this;
                var params = {
                    parent_id: _t.formItem.parentId, // 父节点id
                    pageNum: _t.options.currentPage, // 当前页
                    pageSize: _t.options.pageSize, // 每页显示条数
                };
                _t.$api.post('/tsGateWay/systemManager/querymenu', params, function (res) {
                  _t.$store.commit('setLoading', false);
                  if (res.rtCode && res.rtCode === '18024') {
                        var tableData = res.rtData === null ? [] : res.rtData;
                        tableData.sort(sortObjectValue('ORDER_NUM', true));
                        _t.tableData = tableData;
                        _t.options.total = res.totalCount ? res.totalCount : 0;
                    } else if (res.rtCode) {
                    _t.alertDialogTip(_t, res.rtMessage);
                    }
                });
            },
            // 点击新增菜单按钮
            addMenu() {
                var _t = this;
                _t.isAdd = true;
                _t.dialogVisible = true;
                _t.addEdit.parentId = _t.formItem.parentId;
            },
            // 点击编辑按钮
            editMenu(row) {
                var _t = this;
                _t.isAdd = false;
                _t.dialogVisible = true;
                _t.addEdit.parentId = row.PARENT_ID; // 父节点id
                _t.addEdit.menuId = row.MENU_ID ? row.MENU_ID : ''; // 菜单id
                _t.addEdit.menuName = row.NAME ? row.NAME : ''; // 菜单名称
                _t.addEdit.menuURL = row.URL ? row.URL : ''; // 菜单URL
                _t.addEdit.menuType = row.TYPE ? row.TYPE : ''; // 菜单类型
                _t.addEdit.menuSort = row.ORDER_NUM ? row.ORDER_NUM.toString() : ''; // 排序序号
                _t.addEdit.menuUse = row.ISENABLE !== undefined ? row.ISENABLE.toString() : ''; // 是否启用
            },
            // 删除菜单按钮
            deleteMenu(row) {
                var _t = this;
                _t.$confirm('是否确认删除操作?', '删除菜单', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    let str = 'menuid=' + row.MENU_ID;
                    let Base64 = require('js-base64').Base64;
                    let keyToken = _t.$md5(Base64.encode(str));
                    var params = {
                        menuid: row.MENU_ID, // id
                        token: keyToken, // token
                    };
                    _t.$api.post('/tsGateWay/systemManager/delmenu', params, function (res) {
                        if (res.rtCode && res.rtCode === '18023') {
                            _t.$alert(res.rtMessage, '温馨提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消'
                            }).then(() => {
                                _t.getData();
                            }).catch(() => {
                                _t.getData();
                            });
                        } else if (res.rtCode) {
                          _t.alertDialogTip(_t, res.rtMessage);
                        }
                    });
                }).catch(() => {
                    return false;
                });
            },
            // 重置新增编辑表单
            resetMenu() {
                var _t = this;
                _t.dialogVisible = false;
                _t.addEdit.parentId = ''; // 父菜单id
                _t.addEdit.menuId = ''; // 当前菜单id
                _t.addEdit.menuName = ''; // 菜单名称
                _t.addEdit.menuURL = ''; // 菜单URL
                _t.addEdit.menuType = ''; // 菜单类型
                _t.addEdit.menuIcon = 'el-icon-menu'; // 菜单图标
                _t.addEdit.menuSort = ''; // 排序
                _t.addEdit.menuUse = '0'; // 是否可用
                _t.errorTip.menuNameFlag = false; // 菜单名称
                _t.errorTip.menuURLFlag = false; // 菜单URL
                _t.errorTip.menuTypeFlag = false; // 菜单类型
                _t.errorTip.menuIconFlag = false; // 菜单图标
                _t.errorTip.menuSortFlag = false; // 排序
                _t.errorTip.menuUseFlag = false; // 是否可用
            },
            // 校验输入为空
            blurInput(item, val, flag) {
                if (val.trim() === '') {
                    item[flag] = true;
                } else {
                    item[flag] = false;
                }
            },
            // 新增菜单提交
            addMenuData() {
                var _t = this;
                // 校验菜单名称
                _t.blurInput(_t.errorTip, _t.addEdit.menuName, 'menuNameFlag');
                // 校验菜单URL
                _t.blurInput(_t.errorTip, _t.addEdit.menuURL, 'menuURLFlag');
                // 校验菜单图标
                _t.blurInput(_t.errorTip, _t.addEdit.menuIcon, 'menuIconFlag');
                // 校验菜单排序
                _t.blurInput(_t.errorTip, _t.addEdit.menuSort, 'menuSortFlag');
                // 校验菜单可用
                _t.blurInput(_t.errorTip, _t.addEdit.menuUse, 'menuUseFlag');
                // 校验菜单类型
                _t.blurInput(_t.errorTip, _t.addEdit.menuType, 'menuTypeFlag');
                // 可以提交
                if (_t.errorTip.menuNameFlag === false
                    && _t.errorTip.menuURLFlag === false
                    && _t.errorTip.menuIconFlag === false
                    && _t.errorTip.menuSortFlag === false
                    && _t.errorTip.menuUseFlag === false
                    && _t.errorTip.menuTypeFlag === false) {
                    let str = 'parent_id=' + _t.addEdit.parentId
                        + '&name=' + _t.addEdit.menuName.trim()
                        + '&type=' + _t.addEdit.menuType.trim()
                        + '&isenable=' + _t.addEdit.menuUse;
                    let Base64 = require('js-base64').Base64;
                    let keyToken = _t.$md5(Base64.encode(str));
                    var params = {
                        parent_id: _t.addEdit.parentId, // 父菜单id
                        name: _t.addEdit.menuName.trim(), // 菜单名称
                        url: _t.addEdit.menuURL.trim(), // 菜单url
                        type: _t.addEdit.menuType.trim(), // 菜单类型
                        icon: _t.addEdit.menuIcon.trim(), // 菜单图标
                        order_num: _t.addEdit.menuSort.trim(), // 菜单序号
                        isenable: _t.addEdit.menuUse, // 是否启用
                        token: keyToken
                    };
                    _t.$api.post('/tsGateWay/systemManager/addnewmenu', params, function (res) {
                        if (res.rtCode && res.rtCode === '18022') {
                            _t.$alert(res.rtMessage, '温馨提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消'
                            }).then(() => {
                                _t.getData();
                                _t.resetMenu();
                            }).catch(() => {
                                _t.getData();
                                _t.resetMenu();
                            });
                        } else {
                          _t.alertDialogTip(_t, res.rtMessage);
                        }
                    });
                }
            },
            // 编辑菜单提交
            editMenuData() {
                var _t = this;
                // 校验菜单名称
                _t.blurInput(_t.errorTip, _t.addEdit.menuName, 'menuNameFlag');
                // 校验菜单URL
                _t.blurInput(_t.errorTip, _t.addEdit.menuURL, 'menuURLFlag');
                // 校验菜单图标
                _t.blurInput(_t.errorTip, _t.addEdit.menuIcon, 'menuIconFlag');
                // 校验菜单排序
                _t.blurInput(_t.errorTip, _t.addEdit.menuSort, 'menuSortFlag');
                // 校验菜单可用
                _t.blurInput(_t.errorTip, _t.addEdit.menuUse, 'menuUseFlag');
                // 校验菜单类型
                _t.blurInput(_t.errorTip, _t.addEdit.menuType, 'menuTypeFlag');
                // 可以提交
                if (_t.errorTip.menuNameFlag === false
                    && _t.errorTip.menuURLFlag === false
                    && _t.errorTip.menuIconFlag === false
                    && _t.errorTip.menuSortFlag === false
                    && _t.errorTip.menuUseFlag === false
                    && _t.errorTip.menuTypeFlag === false) {
                    let str = 'parent_id=' + _t.addEdit.parentId
                        + '&menuid=' + _t.addEdit.menuId;
                    let Base64 = require('js-base64').Base64;
                    let keyToken = _t.$md5(Base64.encode(str));
                    var params = {
                        menuid: _t.addEdit.menuId, // 当前节点id
                        parent_id: _t.addEdit.parentId, // 父菜单id
                        name: _t.addEdit.menuName.trim(), // 菜单名称
                        url: _t.addEdit.menuURL.trim(), // 菜单url
                        type: _t.addEdit.menuType.trim(), // 菜单类型
                        icon: _t.addEdit.menuIcon.trim(), // 菜单图标
                        order_num: _t.addEdit.menuSort.trim(), // 菜单序号
                        isenable: _t.addEdit.menuUse, // 是否启用
                        token: keyToken
                    };
                    _t.$api.post('/tsGateWay/systemManager/editmenu', params, function (res) {
                        if (res.rtCode && res.rtCode === '18025') {
                            _t.$alert(res.rtMessage, '温馨提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消'
                            }).then(() => {
                                _t.getData();
                                _t.resetMenu();
                            }).catch(() => {
                                _t.getData();
                                _t.resetMenu();
                            });
                        } else {
                          _t.alertDialogTip(_t, res.rtMessage);
                        }
                    });
                }
            },
            // 获取菜单类型状态字典
            getStatusData() {
                var _t = this;
                let str = 'guid=GUIDSC201908062115348888888z4mv9';
                let Base64 = require('js-base64').Base64;
                let keyToken = _t.$md5(Base64.encode(str));
                var params = {
                    guid: 'GUIDSC201908062115348888888z4mv9',
                    token: keyToken
                };
                _t.$api.post('/tsGateWay/ticketUtility/queryDict', params, function (res) {
                    // 查询成功;
                  _t.$store.commit('setLoading', false);
                  if (res.rtCode && res.rtCode === '14010') {
                        _t.typeList = res.rtData === null ? [] : res.rtData;
                    }
                });
            },
            // 左右拖拽调整左侧的树的大小
            reSizeWin() {
                var _t = this;
                var resize = document.getElementById("resize_menu");
                var right = document.getElementById("menu_content");
                var tree = document.getElementById("menu_navBar");
                resize.onmousedown = function (e) {
                    var startX = e.clientX;
                    resize.left = resize.offsetLeft;
                    document.onmousemove = function (e) {
                        var endX = e.clientX;
                        var moveLen = resize.left + (endX - startX);
                        if (moveLen < 172) moveLen = 172;
                        if (moveLen > 370) moveLen = 370;
                        resize.style.left = moveLen + "px";
                        _t.leftOfRightView = moveLen + 2;
                        right.style.left = _t.leftOfRightView + "px";
                        tree.style.width = moveLen + 'px';
                    };
                    document.onmouseup = function () {
                        document.onmousemove = null;
                        document.onmouseup = null;
                        resize.releaseCapture && resize.releaseCapture();
                    };
                    resize.setCapture && resize.setCapture();
                    return false;
                }
            },
        },
        created() {
            var _t = this;
          _t.$store.commit('setLoading',true);
            var limitMenuList = JSON.parse(localStorage.getItem('limitMenuList'));
            if (limitMenuList !== null && limitMenuList.length !== 0) {
                var limitBtnArr = new Array();
                limitMenuList.forEach((item) => {
                    var path = _t.$route.path;
                    // 找到了对应权限的页面
                    if (item.URL === path) {
                        // 获取按钮级别权限
                        if (item.CHILDREN !== null) {
                            limitBtnArr = item.CHILDREN
                        }
                        // 本页面业务逻辑
                        _t.getTreeData();
                        _t.getStatusData();
                    }
                });
                // 判断权限按钮
                limitBtnArr.forEach((item) => {
                    // 查询
                    if (item.MENU_ID === "MENU20190827162015BOdXJRehCzEtdF") {
                        _t.limitBtn.query = true;
                    }
                    // 新增菜单
                    if (item.MENU_ID === "MENU20190827162034gMZCnEcEyCJNVY") {
                        _t.limitBtn.create = true;
                    }
                    // 删除菜单
                    if (item.MENU_ID === "MENU20190827162116rQlPWyNugKUPaz") {
                        _t.limitBtn.delete = true;
                    }
                    // 修改菜单
                    if (item.MENU_ID === "MENU20190827162055dDQSLVGNIqMWgo") {
                        _t.limitBtn.modify = true;
                    }
                });
            }
        },
        mounted() {
            var _t = this;
            _t.reSizeWin();
        },
    }
</script>

<style>
  .menu_tree {
    width: 100%;
    position: relative;
  }
  .menu_tree .el-tree-node__content {
    height: 40px;
    line-height: 40px;
  }
  .menu_navBar {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 176px;
    overflow: auto;
  }
 .el-loading-spinner  {
   padding-top: 200px;
   height: 446px;
   background-color: rgba(255,255,255,.9);
 }
  .menu_title {
    height: 40px;
    line-height: 40px;
    font-size: 14px;
    padding-left: 10px;
    font-weight: bold;
  }
</style>
