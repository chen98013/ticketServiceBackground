<template>
  <Box>
    <div class="formBox-top paddingBottom15">
      <el-form :model="formItem" inline label-width="110px">
        <el-form-item  label="查询名称：" class="marBottom7">
          <el-input clearable v-model="formItem.name" class="width200"/>
        </el-form-item>
      </el-form>
      <br>
      <el-button class="fl" type="primary" v-if="limitBtn.create" @click="addRoleBtn">新增角色</el-button>
      <el-upload
        ref="upload"
        action="http://172.16.12.56:80/tsGateWay/informationBatchImport"
        :onSuccess="uploadSuccess"
        :onError="uploadError"
        :beforeUpload="beforeAvatarUpload"
         class="fl upload-demo">
        <el-button class="" type="primary" v-if="limitBtn.uploading">批量导入</el-button>
      </el-upload>
      <el-button class="download" type="primary" v-if="limitBtn.download" @click="download">下载批量导入模板</el-button>
      <div class="fr">
        <el-button type="primary" v-if="limitBtn.query" @click="getData">查询</el-button>
        <el-button type="warning" @click="resetFormItem">重置</el-button>
      </div>
    </div>
    <div class="tableWp">
      <el-table :data="tableData" stripe border ref="table">
        <el-table-column prop="ROLECODE" label="角色ID"/>
        <el-table-column prop="ROLENAME" label="角色名称"/>
        <el-table-column prop="COMMENT_INFO" label="备注"/>
        <el-table-column label="操作" width="350px" header-align="center" align="center">
          <template slot-scope="scope">
            <el-button type="primary" v-if="limitBtn.changeRole" @click="changeRoleBtn(scope.row)">修改</el-button>
            <el-button type="danger" v-if="limitBtn.delete" @click="deleteRole(scope.row)">删除</el-button>
            <el-button type="primary" v-if="limitBtn.changeLimit" @click="changeLimit(scope.row)">调整权限</el-button>
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
    <!--新增/编辑角色-->
    <el-dialog
      append-to-body
      :fullscreen="isScreenCreate"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="resetRole"
      :visible.sync="dialogAddVisible">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">新增/编辑角色</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenCreate = !isScreenCreate"></i>
      </div>
      <el-form :model="addEdit" ref="addEdit" label-width="120px">
        <el-form-item class="star" label="角色名称：">
          <el-input
            @blur="blurInput(errorTip,addEdit.roleName,'roleNameFlag')"
            v-model="addEdit.roleName"/>
          <span class="isNotNull" v-if="errorTip.roleNameFlag">必填项不能为空</span>
        </el-form-item>
        <el-form-item label="备注：">
          <el-input type="textarea" v-model="addEdit.note" maxlength="250" show-word-limit/>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="resetRole">取消</el-button>
        <el-button v-if="isAdd === true" type="primary" v-btn-control @click="addRole">保存</el-button>
        <el-button v-if="isAdd === false" type="primary" v-btn-control @click="editRole">保存</el-button>
      </div>
    </el-dialog>
    <!--调整权限-->
    <el-dialog
      append-to-body
      :fullscreen="isScreenLimit"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="resetLimit"
      :visible.sync="dialogLimitVisible">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">调整权限</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenLimit = !isScreenLimit"></i>
      </div>
      <div class="treeBox">
        <el-tree
          :data="limitData"
          show-checkbox
          ref="tree"
          node-key="MENU_ID"
          :props="defaultProps"
          :default-expanded-keys="selectKeys"
          :default-checked-keys="selectKeys"
          />
      </div>
      <div slot="footer">
        <el-button @click="resetLimit">取消</el-button>
        <el-button type="primary" v-btn-control @click="commitLimitData">保存</el-button>
      </div>
    </el-dialog>
  </Box>
</template>

<script>
  import Box from '../../../components/Box';
  import axios from 'axios';
  export default {
    name: "roleMaintenance",
    components: {Box},
    data() {
      return {
        isScreenCreate: false, // 新增编辑放大缩小
        isScreenLimit: false, // 权限放大缩小
        // 表格数据
        tableData: [],
        // 角色名称
        formItem: {
          name: '', // 角色名称
          usernameList: ''// 下拉框名称
        },
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
          id: '', // 角色id
          roleName: '', // 角色名称
          note: '', // 备注
        },
        isAdd: true, // 是否新增
        // 校验角色表单
        errorTip: {
          roleNameFlag: false, // 校验角色名称
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
      // 下载
      download() {
        var _t = this;
        _t.$alert('确定下载吗?', '温馨提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(() => {
          let requestConfig = {
            headers: {
              "Content-Type": "application/json;application/octet-stream"
            }
          };
          axios.post('http://172.16.12.56:80/tsGateWay/systemManager/downloadExcel?flag=1', requestConfig, {
            responseType: "blob"
          }).then(res => {
            // 处理返回的文件流
            const content = res.data;
            const blob = new Blob([content]);
            var date = new Date().getFullYear() + "" + (new Date().getMonth() + 1) + "" + new Date().getDate();
            const fileName = '角色模板' + ".xlsx";
            if ("download" in document.createElement("a")) {
              // 非IE下载
              const elink = document.createElement("a");
              elink.download = fileName;
              elink.style.display = "none";
              elink.href = URL.createObjectURL(blob);
              document.body.appendChild(elink);
              elink.click();
              URL.revokeObjectURL(elink.href); // 释放URL 对象
              document.body.removeChild(elink);
            } else {
              // IE10+下载
              navigator.msSaveBlob(blob, fileName);
            }
          });
          // window.location.href = urldata
        }).catch(() => {
          return false
        });

      },
      // 文件上传成功时调用
      uploadSuccess (val) {
        var _t = this;
        // 清空已上传的文件列表
        if (val.rtCode) {
          _t.alertDialogTip(_t, val.rtData)
        }
        _t.$refs.upload.clearFiles();
      },
      // 上传失败时调用
      uploadError() {
        var _t = this;
        _t.alertDialogTip(_t, '上传失败请重新上传!');
      },
      // 上传前对文件的判断
      beforeAvatarUpload(file) {
        var _t = this;
        const extension = file.name.split('.')[1] === 'xls';
        const extension2 = file.name.split('.')[1] === 'xlsx';
        if (!extension && !extension2 && !extension3 && !extension4) {
          _t.alertDialogTip(_t, '上传模板只能是 xls、xlsx 格式!');
        }
        return extension || extension2
      },
      // 重置查询表单
      resetFormItem() {
        var _t = this;
        _t.formItem.name = '';
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
      // 校验不能为空
      blurInput(item, val, flag) {
        item[flag] = val.trim() === '' ? true : false;
      },
      // row-key
      getRowKey(row) {
        return row.ROW_ID;
      },
      // 查询数据
      getData() {
        var _t = this;
        var params = {
          rolename: _t.formItem.name,
          pageNum: _t.options.currentPage, // 当前页
          pageSize: _t.options.pageSize, // 每页显示条数
        };
        _t.$api.post('/tsGateWay/systemManager/queryrole', params, function (res) {
          _t.$store.commit('setLoading', false);
          if (res.rtCode && res.rtCode === '18028') {
            _t.tableData = res.rtData === null ? [] : res.rtData;
            _t.options.total = res.totalCount ? res.totalCount : 0;
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
      // 新增角色
      addRoleBtn() {
        var _t = this;
        _t.isAdd = true;
        _t.dialogAddVisible = true;
      },
      // 修改角色
      changeRoleBtn(row) {
        var _t = this;
        _t.isAdd = false;
        _t.dialogAddVisible = true;
        _t.addEdit.id = row.ROLECODE; // 角色id
        _t.addEdit.roleName = row.ROLENAME; // 角色名称
        _t.addEdit.note = row.COMMENT_INFO; // 备注
      },
      // 删除角色
      deleteRole(row) {
        var _t = this;
        _t.$confirm('是否确认删除操作?', '删除角色', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let str = 'rolecode=' + row.ROLECODE;
          let Base64 = require('js-base64').Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          var params = {
            rolecode: row.ROLECODE, // id
            token: keyToken, // token
          };
          _t.$api.post('/tsGateWay/systemManager/delrole', params, function (res) {
            if (res.rtCode && res.rtCode === '18027') {
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
      // 重置角色
      resetRole() {
        var _t = this;
        _t.isAdd = true;
        _t.dialogAddVisible = false;
        _t.addEdit.id = ''; // id
        _t.addEdit.roleName = ''; // 名称
        _t.addEdit.note = ''; // 备注
        _t.errorTip.roleNameFlag = false;
      },
      // 新增角色提交
      addRole() {
        var _t = this;
        // 校验角色名称
        _t.blurInput(_t.errorTip, _t.addEdit.roleName, 'roleNameFlag');
        var user_id = _t.getCookie('USER_ID');
        // 可以提交
        if (user_id !== null && user_id !== 'null' && _t.errorTip.roleNameFlag === false) {
          let str = 'userid=' + user_id
            + '&rolename=' + _t.addEdit.roleName.trim();
          let Base64 = require('js-base64').Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          var params = {
            userid: user_id,// 操作员id
            rolename: _t.addEdit.roleName.trim(), // 旧密码
            comment_info: _t.addEdit.note, // 新密码
            token: keyToken, // token
          };
          _t.$api.post('/tsGateWay/systemManager/addnewrole', params, function (res) {
            if (res.rtCode && res.rtCode === '18026') {
              _t.$alert(res.rtMessage, '温馨提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消'
              }).then(() => {
                _t.getData();
                _t.resetRole();
              }).catch(() => {
                _t.getData();
                _t.resetRole();
              });
            } else if (res.rtCode) {
              _t.alertDialogTip(_t, res.rtMessage);
            }
          });
        }
      },
      // 编辑角色提交
      editRole() {
        var _t = this;
        // 校验角色名称
        _t.blurInput(_t.errorTip, _t.addEdit.roleName, 'roleNameFlag');

        // 可以提交
        if (_t.errorTip.roleNameFlag === false) {

          let str ='userid='+_t.cookieMap.user_id.toString()+ '&rolecode=' + _t.addEdit.id
            + '&rolename=' + _t.addEdit.roleName.trim();
          let Base64 = require('js-base64').Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          var params = {
            userid: _t.cookieMap.user_id,
            rolecode: _t.addEdit.id,
            rolename: _t.addEdit.roleName.trim(), // 旧密码
            comment_info: _t.addEdit.note, // 新密码
            token: keyToken, // token
          };
          _t.$api.post('/tsGateWay/systemManager/editrole', params, function (res) {
            if (res.rtCode && res.rtCode === '18029') {
              _t.$alert(res.rtMessage, '温馨提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消'
              }).then(() => {
                _t.getData();
                setTimeout(function () {
                  _t.resetRole();
                },100)

              }).catch(() => {
                _t.getData();
                setTimeout(function () {
                  _t.resetRole();
                },100)
              });
            } else if (res.rtCode) {
              _t.alertDialogTip(_t, res.rtMessage);
            }
          });
        }
      },
      // 调整权限按钮
      changeLimit(row) {
        var _t = this;
        _t.dialogLimitVisible = true;
        _t.tableSelect.id = row.ROLECODE; // 选中角色
        _t.getLimitData();
      },
      // 重置权限
      resetLimit() {
        var _t = this;
        _t.dialogLimitVisible = false;
        _t.tableSelect.id = ''; // 角色id
        _t.$refs.tree.setCheckedKeys([]); // 勾选为空
        _t.selectKeys = []; // 默认勾选为空
      },
      // 查询权限数据列表 (菜单)
      getLimitData() {
        var _t = this;
        var params = {};
        _t.$api.post('/tsGateWay/systemManager/querymenutree', params, function (res) {
          if (res.rtCode && res.rtCode === '18047') {
            // 渲染菜单树
            _t.limitData = res.rtData === null ? [] : res.rtData;
            // 获取当前角色对应的菜单列表
            _t.getRoleLimitData();
          } else if (res.rtCode) {
            _t.alertDialogTip(_t, res.rtMessage);
          }
        });
      },
      // 获取当前角色对应的菜单信息
      getRoleLimitData() {
        var _t = this;
        if (_t.tableSelect.id !== '') {
          var params = {
            role_id: _t.tableSelect.id, // 角色id
          };
          _t.$api.post('/tsGateWay/systemManager/queryrolefunction', params, function (res) {
            if (res.rtCode && res.rtCode === '18048') {
              // 菜单集合
              var resData = res.rtData === null ? [] : res.rtData;

              resData.forEach((item) => {
                if(item.flag== '1'){
                  _t.$refs.tree.setChecked(item.MENU_ID, true);
                }
              });
            } else if (res.rtCode) {
              _t.alertDialogTip(_t, res.rtMessage);
            }
          });
        }
      },
      // 调整权限 提交
      commitLimitData() {
        var _t = this;
        // 先调用删除角色权限关联接口, 删除成功以后调用新增权限接口
        if (_t.tableSelect.id !== '') {
          // 角色id不为空 判断权限勾选是否为空
           var treeData = _t.$refs.tree.getCheckedKeys().concat(_t.$refs.tree.getHalfCheckedKeys());
          //  var treeData = _t.$refs.tree.getCheckedKeys();
          //  var treeData = [].concat(this.$refs.tree.getHalfCheckedKeys(), this.$refs.tree.getCheckedKeys());
          if (treeData.length !== 0) {
            let str = 'rolecode=' + _t.tableSelect.id;
            let Base64 = require('js-base64').Base64;
            let keyToken = _t.$md5(Base64.encode(str));
            var params = {
              rolecode: _t.tableSelect.id, // id
              token: keyToken, // token
            };
            _t.$api.post('/tsGateWay/systemManager/delrolefunction', params, function (res) {
              if (res.rtCode && res.rtCode === '18031') {
                // 删除成功调用 新增接口
                _t.addMenuFunction(treeData);
              } else if (res.rtCode) {
                _t.alertDialogTip(_t, res.rtMessage);
              }
            });
          } else {
            _t.alertDialogTip(_t, '不能提交为空的记录!');
          }
        } else {
          _t.alertDialogTip(_t, '角色id为空!');
        }
      },
      // 提交新增的权限列表
      addMenuFunction(arr) {
        var _t = this;
        var user_id = _t.getCookie('USER_ID');
        var menuList = new Array();
        arr.forEach((item) => {
          var obj = new Object();
          obj.menuid = item; // 菜单id
          obj.roleid = _t.tableSelect.id; // 角色id
          menuList.push(obj);
        });
        if (user_id !== null && user_id !== 'null') {
          let str = 'userid=' + user_id;
          let Base64 = require('js-base64').Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          var params = {
            userid: user_id, // id
            role_menuid_list: menuList,
            token: keyToken, // token
          };
          _t.$api.post('/tsGateWay/systemManager/addnewrolefunction', params, function (res) {
            if (res.rtCode && res.rtCode === '18030') {
              _t.$alert('操作成功!', '温馨提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消'
              }).then(() => {
                _t.resetLimit();
              }).catch(() => {
                _t.resetLimit();
              });
            } else if (res.rtCode) {
              _t.alertDialogTip(_t, res.rtMessage);
            }
          });
        }
      }
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
          if (item.MENU_ID === "MENU20190827161658iNplaDepdegKLQ") {
            _t.limitBtn.query = true;
          }
          // 新增角色
          if (item.MENU_ID === 'MENU20190827161717PFfBAxYSYPpDXr') {
            _t.limitBtn.create = true;
          }
          // 删除角色
          if (item.MENU_ID === "MENU20190827161754qgwKLMcXcugpOq") {
            _t.limitBtn.delete = true;
          }
          // 批量导入
          if (item.MENU_ID === "MENU20191021143958YHygoxkrXWrlPg") {
            _t.limitBtn.uploading = true;
          }
          // 修改角色
          if (item.MENU_ID === "MENU20190827161733GQMZGEqiHJhhSs") {
            _t.limitBtn.changeRole = true;
          }
          // 调整权限
          if (item.MENU_ID === "MENU20190827161808rxdKYvwJtTSArv") {
            _t.limitBtn.changeLimit = true;
          }
          // 下载
          if (item.MENU_ID === "MENU20191023180259psCSYezHmFIIAU") {
            _t.limitBtn.download = true;
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
  .download {
    margin-left: 13px;
  }
  .upload-demo {
    margin-left: 13px;
  }
</style>
