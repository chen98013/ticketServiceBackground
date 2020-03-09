<template>
  <Box>
    <div class="formBox-top paddingBottom15">
      <!--      <el-form :model="formItem" inline label-width="110px">-->
      <!--        <el-form-item  label="查询名称：" class="marBottom7">-->
      <!--          <el-input clearable v-model="formItem.name" class="width200"/>-->
      <!--        </el-form-item>-->
      <!--      </el-form>-->
      <!--      <br>-->
      <el-button class="fl" type="primary" v-if="limitBtn.create" @click="addRoleBtn">新增</el-button>
      <!--      <div class=" marge fl">-->
      <!--        <el-button type="primary" v-if="limitBtn.query" @click="getData">查询</el-button>-->
      <!--        <el-button type="warning" @click="resetFormItem">重置</el-button>-->
      <!--      </div>-->
    </div>
    <div class="tableWp">
      <el-table :data="tableData" stripe border ref="table">
        <el-table-column prop="LOCATION_TYPE_ID" label="位置类型id"/>
        <el-table-column prop="LOCATION_TYPE_NAME" label="位置类型名称"/>
        <el-table-column label="操作" width="350px" header-align="center" align="center">
          <template slot-scope="scope">
            <el-button type="primary" v-if="limitBtn.changeRole" @click="changeRoleBtn(scope.row)">修改</el-button>
            <el-button type="danger" v-if="limitBtn.delete" @click="deleteRole(scope.row)">删除</el-button>
            <el-button type="primary" v-if="limitBtn.changeLimit" @click="changeLimit(scope.row)">调整权限</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页-->
      <!--      <pages-->
      <!--        :total='options.total'-->
      <!--        :currentPage='options.currentPage'-->
      <!--        :page-size="options.pageSize"-->
      <!--        @handleSizeChangeSub="handleSizeChangeSub"-->
      <!--        @handleCurrentChangeSub="handleCurrentChange"/>-->
    </div>
    <!--新增/编辑角色-->
    <el-dialog
      append-to-body
      :fullscreen="isScreenCreate"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="resetLimit"
      :visible.sync="dialogAddVisible">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">新增</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenCreate = !isScreenCreate"></i>
      </div>
      <el-form :model="addEdit" ref="addEdit" label-width="120px">
        <el-form-item class="star" label="位置类型id：">
          <el-input
            @blur="blurInput(errorTip,addEdit.roleid,'roleidFlag')"
            v-model="addEdit.roleid"/>
          <span class="isNotNull" v-if="errorTip.roleidFlag">必填项不能为空</span>
        </el-form-item>

        <el-form-item class="star" label="位置类型名称：">
          <el-input
            @blur="blurInput(errorTip,addEdit.roleName,'roleNameFlag')"
            v-model="addEdit.roleName"/>

          <span class="isNotNull" v-if="errorTip.roleNameFlag">必填项不能为空</span>
        </el-form-item>
        <el-form-item class="star" label="角色权限名称：">
          <el-select placeholder="请选择角色" clearable v-model="addEdit.rolePlay" class="widthAll">
            <el-option
              v-for="(item,index) in stationList"
              :key="index"
              :label="item.ROLENAME"
              :value="item.ROLECODE"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="resetLimit">取消</el-button>
        <el-button type="primary"  v-btn-control @click="addRole">保存</el-button>
      </div>
    </el-dialog>
<!--    修改-->
    <el-dialog
      v-dialogDrag
      append-to-body
      :fullscreen="isScreenLimit"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="resetLimit"
      :visible.sync="dialogRoleVisible">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">修改</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenLimit = !isScreenLimit"></i>
      </div>
      <el-checkbox-group v-model="cacheRoleList">
        <el-checkbox
          class="roleMap"
          v-for="(item,index) in stationList"
          :key="index"
          :value="item.ROLECODE"
          :label="item.ROLECODE">{{item.ROLENAME}}
        </el-checkbox>
      </el-checkbox-group>
      <div slot="footer">
        <el-button @click="resetLimit">取消</el-button>
        <el-button type="primary" v-btn-control @click="RoleData">保存</el-button>
      </div>
    </el-dialog>
  </Box>
</template>

<script>
  import Box from '../../../components/Box';
  import axios from 'axios';

  export default {
    name: "locationLimitedMerge",
    components: {Box},
    data() {
      return {
        isScreenCreate: false, // 新增编辑放大缩小
        isScreenLimit: false, // 权限放大缩小
        dialogRoleVisible: false,
        stationList: [], // 角色数据
        cacheRoleList: [], // 选中角色
        // 表格数据
        tableData: [],
        // 角色名称
        // formItem: {
        //   rolePlay: '',// 角色权限
        //   roleid: '',// 位置类型id
        //   roleName: '',//位置类型名称
        // },
        usernameList: [],//角色名称下拉数组
        // 角色分页
        options: {
          total: 0, // 总条数
          currentPage: 1, // 当前页码
          pageSize: 10, // 显示条数
        },
        // 新增角色蒙版
        dialogAddVisible: false,
        // 调整权限蒙版
        dialogLimitVisible: false,
        // 新增/编辑角色表单
        addEdit: {
          rolePlay: '',// 角色权限
          roleid: '',// 位置类型id
          roleName: '',//位置类型名称
          id: '',
        },
        isAdd: true, // 是否新增
        // 校验角色表单
        errorTip: {
          roleidFlag: false, // 位置类型id
          roleNameFlag: false, // 位置类型名称
          note: false // 备注
        },
        // 调整权限 树形数据
        limitData: [],
        // 调整权限 选中
        tableSelect: {
          id: ''
        },
        defaultProps: {
          children: 'CHILDREN',
          label: 'NAME'
        },
        // 调整权限 数据回显的 集合
        selectKeys: [],
        // 按钮权限
        limitBtn: {
          query: false, // 查询
          create: false, // 新增角色
          delete: false, // 删除角色
          changeRole: false, // 修改角色
          changeLimit: false, // 调整权限
          uploading: false, // 批量导入
          download: false, // 下载
        },
        // 从cookie中获取
        cookieMap: {
          location_number: this.getCookie('LOCATION_NUMBER'), // 位置编号
          user_id: this.getCookie('USER_ID'), // 操作员ID
          role: this.getCookie('USER_TYPE'), // 用户角色
        }
      }
    },
    methods: {
      // 重置查询表单
      // resetFormItem() {
      //   var _t = this;
      //   _t.formItem.name = '';
      //   _t.getData();
      // },

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
      // 校验不能为空
      blurInput(item, val, flag) {
        item[flag] = val.trim() === '' ? true : false;
      },
      // row-key
      getRowKey(row) {
        return row.ROW_ID;
      },
      // 查询角色列表
      getRoleData() {
        var _t = this;
        var params = {
          pageNum: 1, // 当前页
          pageSize: 100, // 每页显示条数
        };
        _t.$api.post('/tsGateWay/systemManager/queryrole', params, function (res) {
          _t.$store.commit('setLoading', false);
          if (res.rtCode && res.rtCode === '18028') {
            _t.stationList = res.rtData === null ? [] : res.rtData;
          } else if (res.rtCode) {
            _t.stationList = [];
            _t.alertDialogTip(_t, res.rtMessage);
          }
        });
      },
      // 查询数据
      getData() {
        var _t = this;
        var params = {
          operate_type: '1',
        };
        _t.$api.post('/tsGateWay/systemManager/queryLocationRole', params, function (res) {
          _t.$store.commit('setLoading', false);
          if (res.rtCode && res.rtCode === '18066') {
            _t.tableData = res.rtData === null ? [] : res.rtData;
          } else if (res.rtCode) {
            _t.$alert(res.rtMessage, '温馨提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消'
            }).then(() => {
              return false;
            });
          }
        });
      },
      // 新增
      addRoleBtn() {
        var _t = this;
        _t.isAdd = true;
        _t.getRoleData();
        _t.dialogAddVisible = true;
      },
      // 修改
      changeRoleBtn(row) {
        var _t = this;
        _t.isAdd = false;
        _t.dialogRoleVisible = true;
        _t.addEdit.id = row.LOCATION_TYPE_ID;
        _t.addEdit.roleName = row.LOCATION_TYPE_NAME;
        _t.getRoleData();
        _t.getRoleWithUserId();
      },
      // 根据用户id查询对应的角色列表
      getRoleWithUserId() {
        var _t = this;
        if (_t.getCookie('LOCATION_TYPE_ID')) {
          var params = {
           operate_type: '0',
           location_type_id: _t.addEdit.id
          };
          _t.$api.post('/tsGateWay/systemManager/queryLocationRole', params, function (res) {
            if (res.rtCode && res.rtCode === "18066") {
              var resData = res.rtData === null ? [] : res.rtData;
              var cacheRoleList = new Array();
              resData.forEach((item) => {
                cacheRoleList.push(item);
              });
              _t.cacheRoleList = cacheRoleList;
            } else if (res.rtCode) {
              _t.cacheRoleList = [];
              _t.alertDialogTip(_t, res.rtMessage);
            }
          });
        } else {
          _t.alertDialogTip(_t, '操作员id不能为空!');
        }
      },
      //修改提交
      RoleData() {
        var _t = this;
        var user_id = _t.getCookie('USER_ID');
        var cacheckArr = [];
        _t.cacheRoleList.forEach(item => {
          var obj = new Object();
          obj.role_id = item;
          cacheckArr.push(obj)
        })
        // 可以提交
        if (user_id) {
          var params = {
            user_id: user_id,// 操作员id
            location_type_id: _t.addEdit.id,
            location_type_name: _t.addEdit.roleName,
            location_role_list:cacheckArr,
          };
          _t.$api.post('/tsGateWay/systemManager/editLocationRole', params, function (res) {
            if (res.rtCode && res.rtCode === '18068') {
              _t.$alert(res.rtMessage, '温馨提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消'
              }).then(() => {
                _t.getData();
                _t.resetLimit();
              }).catch(() => {
                _t.getData();
                _t.resetLimit();
              });
            } else if (res.rtCode) {
              _t.alertDialogTip(_t, res.rtMessage);
            }
          });
        }
      },
      // 删除角色
      deleteRole(row) {
        var _t = this;
        _t.$confirm('是否确认删除操作?', '删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          var params = {
            location_type_id: row.LOCATION_TYPE_ID
          };
          _t.$api.post('/tsGateWay/systemManager/deleteLocationRole', params, function (res) {
            if (res.rtCode && res.rtCode === '18069') {
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
      // 新增角色提交
      addRole() {
        var _t = this;
        var user_id = _t.getCookie('USER_ID');
        _t.blurInput(_t.errorTip,_t.addEdit.roleid,'roleidFlag');
        _t.blurInput(_t.errorTip,_t.addEdit.roleName,'roleNameFlag');
        var init = true;
        if (_t.addEdit.rolePlay == '') {
          init = false
          _t.alertDialogTip(_t,'角色权限名称不能为空!');
        }
        // 可以提交
        if (_t.errorTip.roleidFlag == false && _t.errorTip.roleNameFlag == false && init) {
          var params = {
            user_id: user_id,// 操作员id
            location_type_id: _t.addEdit.roleid,
            location_type_name: _t.addEdit.roleName,
            role_id: _t.addEdit.rolePlay,
          };
          _t.$api.post('/tsGateWay/systemManager/addLocationType', params, function (res) {
            if (res.rtCode && res.rtCode === '18067') {
              setTimeout(function () {
                _t.getData();
              });
              _t.resetLimit();
              _t.alertDialogTip(_t, res.rtMessage);
            } else if (res.rtCode) {
              _t.dialogAddVisible = false;
              _t.alertDialogTip(_t, res.rtMessage);
            }
          });
        }
      },
      // 重置
      resetLimit() {
        var _t = this;
        _t.dialogAddVisible = false;
        _t.dialogRoleVisible = false;
        _t.addEdit.roleid = '';
        _t.addEdit.roleName = '';
        _t.addEdit.rolePlay = '';
        _t._t.cacheRoleList = [];
      },
    },
    created() {
      var _t = this;
      _t.$store.commit('setLoading', true);
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
            _t.getData();
          }
        });
        // 判断权限按钮
        limitBtnArr.forEach((item) => {

          // 查询
          if (item.MENU_ID === "MENU20191119154151IFknYTSfiXSkOG") {
            _t.limitBtn.query = true;
          }
          // 新增
          if (item.MENU_ID === 'MENU20191119154048uiEfZgUlGjJUFO') {
            _t.limitBtn.create = true;
          }
          // 删除
          if (item.MENU_ID === "MENU20191119154124wuyFNWDgXVBTrU") {
            _t.limitBtn.delete = true;
          }
          // 修改
          if (item.MENU_ID === "MENU20191119154105sAjgOgKAsfSNhE") {
            _t.limitBtn.changeRole = true;
          }
        });
      }
    }
  }
</script>

<style scoped>
  .treeBox {
    max-height: 500px;
    overflow-y: auto;
  }

  .marge {
    margin-left: 15px;
  }

  .download {
    margin-left: 13px;
  }

  .upload-demo {
    margin-left: 13px;
  }
</style>
