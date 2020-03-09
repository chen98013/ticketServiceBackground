<template>
  <Box>
    <div class="formBox-top paddingBottom15">
      <el-form :model="formItem" inline class="clearFix" ref="formItem" label-width="110px">
        <el-form-item label="操作员id：" class="marBottom7">
          <el-input oninput="value=value.replace(/[^\d]/g,'')"  clearable maxlength="6" class="width200" v-model="formItem.userid"/>
        </el-form-item>
        <el-form-item label="操作员名称：" class="marBottom7">
          <el-input  clearable maxlength="6" class="width200" v-model="formItem.username"/>
        </el-form-item>
        <br>
      </el-form>
      <el-button class="fl" type="primary" v-if="limitBtn.create" @click="addUserBtn">新增用户</el-button>
      <el-upload
        ref="upload"
        action="http://172.16.12.56:80/tsGateWay/informationBatchImport"
        :onSuccess="uploadSuccess"
        :onError="uploadError"
        :beforeUpload="beforeAvatarUpload"
        class="fl upload-demo">
        <el-button type="primary" v-if="limitBtn.uploading">批量导入</el-button>
      </el-upload>
      <el-button class="fl download" type="primary" v-if="limitBtn.download" @click="download">下载批量导入模板</el-button>
      <div class="fr">
        <el-button type="primary" v-if="limitBtn.query" @click="getData">查询</el-button>
        <el-button type="warning" @click="resetFormItem">重置</el-button>
      </div>
    </div>
    <div class="tableWp">
      <el-table :data="tableData" stripe border ref="table">
        <el-table-column prop="USERID" label="操作员ID"/>
        <el-table-column prop="USERNAME" label="操作员名称"/>
        <el-table-column label="操作" width="600px" align="center" header-align="center">
          <template slot-scope="scope">
            <el-button type="primary" v-if="limitBtn.changePassword" @click="commitPassword(scope.row)">重置密码</el-button>
            <el-button type="warning" v-if="limitBtn.changeRole" @click="changeRole(scope.row)">调整角色</el-button>
            <el-button type="success" v-if="limitBtn.deblocking" @click="deblocking(scope.row)">解锁该用户</el-button>
            <el-button type="danger" v-if="limitBtn.delete" @click="deleteUserBtn(scope.row)">删除用户</el-button>
            <el-button type="primary" v-if="limitBtn.changeLocation" @click="changeLocation(scope.row)">调整位置</el-button>
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
    <!--新增弹出层-->
    <el-dialog
      v-dialogDrag
      append-to-body
      :fullscreen="isScreenCreate"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="resetUser"
      :visible.sync="dialogAddVisible">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">新增用户</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenCreate = !isScreenCreate"></i>
      </div>
      <el-form :model="addEdit" ref="addEdit" label-width="130px">
        <el-form-item class="star" label="操作员id：">
          <el-input
            oninput="value=value.replace(/[^\d]/g,'')"
            maxlength="6"
            @blur="blurRuleId(addEdit.operator_id,'idFlag','idTip')"
            v-model="addEdit.operator_id"/>
          <span class="isNotNull" v-if="errorTip.idFlag">{{errorTip.idTip}}</span>
        </el-form-item>
        <el-form-item class="star" label="操作员名称：">
          <el-input
            maxlength="10"
            @blur="ruleIsNotNull(errorTip,addEdit.operator_name,'nameFlag')"
            v-model="addEdit.operator_name"/>
          <span class="isNotNull" v-if="errorTip.nameFlag">必填项不能为空</span>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="resetUser">取消</el-button>
        <el-button type="primary" v-btn-control @click="addUser">保存</el-button>
      </div>
    </el-dialog>
    <!--修改密码-->
    <el-dialog
      v-dialogDrag
      append-to-body
      :fullscreen="isScreenPassword"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="resetPassword"
      :visible.sync="dialogPasswordVisible">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">修改密码</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenPassword = !isScreenPassword"></i>
      </div>
      <el-form :model="passwordForm" ref="passwordForm" label-width="180px">
        <el-form-item label="操作员ID：">
          <el-input oninput="value=value.replace(/[^\d]/g,'')" v-model="passwordForm.operator_id" disabled/>
        </el-form-item>
        <el-form-item label="操作员姓名：">
          <el-input v-model="passwordForm.operator_name" disabled/>
        </el-form-item>
        <el-form-item class="star" label="旧密码：">
          <el-input
            maxlength="12"
            @blur="ruleIsNotNull(passwordForm,passwordForm.oldPassword,'oldPasswordFlag')"
            v-model="passwordForm.oldPassword"
            type="password"/>
          <span class="isNotNull" v-if="passwordForm.oldPasswordFlag">必填项不能为空</span>
        </el-form-item>
        <el-form-item class="star" label="新密码：">
          <el-input
            maxlength="12"
            type="password"
            @blur="blurPassword(passwordForm,passwordForm.newPassword,passwordForm.confirmPassword)"
            v-model="passwordForm.newPassword"/>
          <span class="isNotNull" v-if="passwordForm.passwordFlag">必填项不能为空</span>
        </el-form-item>
        <el-form-item class="star" label="再次输入新密码：">
          <el-input
            maxlength="12"
            type="password"
            @blur="blurConfirmPassword(passwordForm,passwordForm.confirmPassword,passwordForm.newPassword)"
            v-model="passwordForm.confirmPassword"/>
          <span class="isNotNull" v-if="passwordForm.confirmPasswordFlag">{{passwordForm.confirmPasswordTip}}</span>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="resetPassword">取消</el-button>
        <el-button type="primary" v-btn-control @click="commitPassword">保存</el-button>
      </div>
    </el-dialog>
    <!--调整角色-->
    <el-dialog
      v-dialogDrag
      append-to-body
      :fullscreen="isScreenRole"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="resetRole"
      :visible.sync="dialogRoleVisible">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">调整角色</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenRole = !isScreenRole"></i>
      </div>
      <el-checkbox-group v-model="cacheRoleList">
        <el-checkbox
          class="roleMap"
          v-for="(item,index) in roleTableData"
          :key="index"
          :label="item.ROLECODE">{{item.ROLENAME}}
        </el-checkbox>
      </el-checkbox-group>
      <div slot="footer">
        <el-button @click="resetRole">取消</el-button>
        <el-button type="primary" v-btn-control @click="commitRoleList">保存</el-button>
      </div>
    </el-dialog>
    <!--调整位置-->
    <el-dialog
      v-dialogDrag
      append-to-body
      :fullscreen="isScreenLocation"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="resetLocation"
      :visible.sync="dialogLocationVisible">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">调整位置</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenLocation = !isScreenLocation"></i>
      </div>
      <div class="treeBox">
        <el-tree
          :data="locationTableData"
          :props="defaultProps"
          node-key="location_number"
          show-checkbox
          :check-on-click-node="true"
          default-expand-all
          check-strictly
          ref="tree"/>
      </div>
      <div slot="footer">
        <el-button @click="resetLocation">取消</el-button>
        <el-button type="primary" v-btn-control @click="commitLocationList">保存</el-button>
      </div>
    </el-dialog>
  </Box>
</template>

<script>
  import Box from '../../../components/Box';
  import axios from 'axios';

  export default {
    name: "userMaintenance",
    components: {Box},
    data() {
      return {
        isScreenCreate: false, // 新增编辑放大缩小
        isScreenPassword: false, // 修改密码放大缩小
        isScreenRole: false, // 修改角色放大缩小
        isScreenLocation: false, // 调整位置放大缩小
        // 表格数据
        tableData: [],
        // 用户分页
        options: {
          total: 0, // 总条数
          currentPage: 1, // 当前页码
          pageSize: 10, // 显示条数
        },
        // 新增用户蒙版
        dialogAddVisible: false,
        // 修改密码蒙版
        dialogPasswordVisible: false,
        // 调整角色蒙版
        dialogRoleVisible: false,
        // 调整位置蒙版
        dialogLocationVisible: false,
        // 新增用户表单
        addEdit: {
          operator_id: '', // 操作员id
          operator_name: '', // 操作员名称
          operator_password: '', // 操作员密码
          operator_confirmPassword: '', // 确认密码
        },
        // 新增编辑校验
        errorTip: {
          idFlag: false, // 操作员id校验标识
          idTip: '', // 操作员id提示
          nameFlag: false, // 操作员名称标识
          passwordFlag: false, //  密码标识
          confirmPasswordFlag: false, // 确认密码标识
          confirmPasswordTip: '', // 确认密码提示
        },
        // 修改密码表单
        passwordForm: {
          operator_id: '',// 操作员id
          operator_name: '', // 操作员姓名
          oldPassword: '', // 旧密码
          oldPasswordFlag: false, // 旧密码校验标识
          newPassword: '', // 修改后的密码
          confirmPassword: '', // 确认密码
          passwordFlag: false, //  密码标识
          confirmPasswordFlag: false, // 确认密码标识
          confirmPasswordTip: '', // 确认密码提示
        },
        formItem: {
          userid: '', // 操作员id
          username: '', // 操作员名称
        },
        // 调整角色表格
        roleTableData: [],
        // 缓存选中的角色集合
        cacheRoleList: [],
        // 调整位置表格
        locationTableData: [],
        // props
        defaultProps: {
          label: 'location_name',
          children: 'children'
        },
        // 权限按钮
        limitBtn: {
          query: false, // 查询
          create: false, // 新增用户
          delete: false, // 删除用户
          changePassword: false, // 修改密码
          changeRole: false, // 调整角色
          changeLocation: false, // 调整位置
          deblocking: false, // 解锁该用户
          uploading: false, // 批量导入
          download: false, // 下载
        },
        // 表格选中的id
        tableSelect: {
          user_id: ''
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
          axios.post('http://172.16.12.56:80/tsGateWay/systemManager/downloadExcel?flag=0', requestConfig, {
            responseType: "blob"
          }).then(res => {
            // 处理返回的文件流
            const content = res.data;
            const blob = new Blob([content]);
            var date = new Date().getFullYear() + "" + (new Date().getMonth() + 1) + "" + new Date().getDate();
            const fileName = '用户模板' + ".xlsx";
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
      uploadSuccess(val) {
        var _t = this;
        // 清空已上传的文件列表
        if (val.rtCode) {
          _t.alertDialogTip(_t, val.rtMessage)
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
        _t.formItem.userid = '';
        _t.formItem.username = '';
        _t.getData()
      },
      // 失去焦点校验操作员id
      blurRuleId(val, flag, tip) {
        var _t = this;
        // 校验为空
        if (val.trim() === '') {
          _t.errorTip[flag] = true;
          _t.errorTip[tip] = '必填项不能为空';
        } else {
          // 校验不为空
          var reg = _t.$config.isNumber();
          if (reg.test(val.trim()) === false) {
            // 非数字
            _t.errorTip[flag] = true;
            _t.errorTip[tip] = '格式必须是数字类型';
          } else {
            // 数字
            _t.errorTip[flag] = false;
            _t.errorTip[tip] = '';
          }
        }
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
      // 重置新增用户弹出层
      resetUser() {
        var _t = this;
        _t.dialogAddVisible = false;
        _t.addEdit.operator_id = ''; // id
        _t.addEdit.operator_name = ''; // 姓名
        _t.addEdit.operator_password = ''; // 密码
        _t.addEdit.operator_confirmPassword = ''; // 确认密码
        _t.errorTip.idFlag = false; // id标识
        _t.errorTip.idTip = ''; // id提示
        _t.errorTip.nameFlag = false; // name标识
        _t.errorTip.passwordFlag = false; // 密码
        _t.errorTip.confirmPasswordFlag = false; // 确认密码
        _t.errorTip.confirmPasswordTip = ''; // 确认密码提示
      },
      aleters() {
        return  _t.alertDialogTip(_t, '操作成功!');
      },
      // 新增用户
      addUserBtn() {
        var _t = this;
        _t.dialogAddVisible = true;
      },
      // 新增用户提交按钮
      addUser() {
        var _t = this;
        var arr = _t.addEdit.operator_id.trim();
        var arr1 =  arr.split('');
        var init = true;
        if (arr1.length!==6) {
          init = false;
          _t.alertDialogTip(_t, '请重新输入,操作员id必须6位');
        }
        // 校验操作员id
        _t.blurRuleId(_t.addEdit.operator_id, 'idFlag', 'idTip');
        // 校验操作员姓名
        _t.ruleIsNotNull(_t.errorTip, _t.addEdit.operator_name, 'nameFlag');
        // 默认密码
        var userPassword = '000000';


        // // 校验密码
        // _t.blurPassword(_t.errorTip, _t.addEdit.operator_password, _t.addEdit.operator_confirmPassword);
        // // 校验确认密码
        // _t.blurConfirmPassword(_t.errorTip, _t.addEdit.operator_confirmPassword, _t.addEdit.operator_password);
        // 可以提交
        if (_t.errorTip.idFlag === false
          && _t.errorTip.nameFlag === false
          && _t.errorTip.passwordFlag === false
          && _t.errorTip.confirmPasswordFlag === false
          && init
        ) {
          let str = 'userid=' + _t.addEdit.operator_id.trim()
            + '&username=' + _t.addEdit.operator_name.trim()
            + '&password=' + userPassword;
          let Base64 = require('js-base64').Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          var params = {
            userid: _t.addEdit.operator_id.trim(), // 操作员id
            username: _t.addEdit.operator_name.trim(), // 操作人姓名
            password: userPassword, // 密码
            token: keyToken, // token
          };
          _t.$api.post('/tsGateWay/systemManager/addnewuser', params, function (res) {
            if (res.rtCode && res.rtCode === '18002') {
              _t.$alert(res.rtMessage, '温馨提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消'
              }).then(() => {
                _t.resetUser();
                _t.getData();
              }).catch(() => {
                _t.resetUser();
                _t.getData();
              });
            } else if (res.rtCode) {
              if ( res.rtCode == '18019') {
                _t.aleters ();
              }else {
                _t.alertDialogTip(_t, res.rtMessage);
              }
            }
          });
        }
      },
      // 删除用户
      deleteUserBtn(row) {
        var _t = this;
        var hint = '是否删除' + " " + row.USERNAME + " " + '用户';
        _t.$confirm(hint, '删除用户', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let str = 'userid=' + row.USERID;
          let Base64 = require('js-base64').Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          var params = {
            userid: row.USERID, // id
            token: keyToken, // token
          };
          _t.$api.post('/tsGateWay/systemManager/deluser', params, function (res) {
            if (res.rtCode && res.rtCode === '18003') {
              res.rtMessage = '用户' + row.USERNAME + '删除成功!';
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
      // 重置密码
      resetPassword() {
        var _t = this;
        _t.dialogPasswordVisible = false;
        _t.passwordForm.operator_id = '';
        _t.passwordForm.operator_name = '';
        _t.passwordForm.oldPassword = ''; // 旧密码
        _t.passwordForm.oldPasswordFlag = false; // 旧密码标识
        _t.passwordForm.newPassword = ''; // 修改后的密码
        _t.passwordForm.confirmPassword = ''; // 确认密码
        _t.passwordForm.passwordFlag = false; //  密码标识
        _t.passwordForm.confirmPasswordFlag = false; // 确认密码标识
        _t.passwordForm.confirmPasswordTip = ''; // 确认密码提示
      },
      // 修改密码按钮
      changePassword(row) {
        var _t = this;
        _t.dialogPasswordVisible = true;

      },
      // 修改密码提交按钮
      commitPassword(row) {
        var _t = this;
        _t.passwordForm.operator_id = row.USERID;
        _t.passwordForm.operator_name = row.USERNAME;
        var userPassword = '000000';
        if (_t.passwordForm.oldPasswordFlag === false
          && _t.passwordForm.confirmPasswordFlag === false
          && _t.passwordForm.passwordFlag === false) {
          let str = 'userid=' + _t.passwordForm.operator_id
            + '&oldpassword=' + userPassword
            + '&newpassword=' + userPassword;
          let Base64 = require('js-base64').Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          var params = {
            userid: _t.passwordForm.operator_id, // 操作员id
            oldpassword: userPassword, // 旧密码
            newpassword: userPassword, // 新密码
            token: keyToken, // token
          };

          _t.$confirm('是否重置密码吗?', '重置', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            _t.$api.post('/tsGateWay/systemManager/repassword', params, function (res) {
              if (res.rtCode && res.rtCode === '18001') {
                _t.resetPassword();
                _t.$alert(res.rtMessage, '温馨提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消'
                }).then(() => {
                  _t.resetPassword();
                }).catch(() => {
                  _t.resetPassword();
                });
              } else if (res.rtCode) {
                _t.alertDialogTip(_t, res.rtMessage);
                _t.resetPassword();
              }
            });
          }).catch(() => {
            return false
          })

        }
      },
      // 改变当前页码
      handleCurrentChange(val) {
        var _t = this;
        _t.options.currentPage = val;
        _t.getData();
      },
      //  解锁用户按钮
      deblocking(row) {
        var _t = this;
        _t.$confirm('是否确认解锁该用户?', '解锁该用户吗?', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          var params = {
            userid: row.USERID,
            islock: '0'
          };
          _t.$api.post('/tsGateWay/systemManager/lockAccount', params, function (res) {
            if (res.rtCode === '14012') {
              _t.alertDialogTip(_t, res.rtMessage.substr(3, 8));
            }
          });
        }).catch(() => {
          return false
        })
      },
      // 改变每页显示条数
      handleSizeChangeSub(val) {
        var _t = this;
        _t.options.pageSize = val;
        _t.getData();
      },
      // 查询表格数据
      getData() {
        var _t = this;
        var params = {
          userid: _t.formItem.userid,
          username: _t.formItem.username,
          pageNum: _t.options.currentPage, // 当前页
          pageSize: _t.options.pageSize, // 每页条数
        };
        _t.$api.post('/tsGateWay/systemManager/queryuser', params, function (res) {
          _t.$store.commit('setLoading', false);
          if (res.rtCode && res.rtCode === '18004') {
            _t.tableData = res.rtData === null ? [] : res.rtData;
            _t.options.total = res.totalCount ? res.totalCount : 0;
          } else if (res.rtCode) {
            _t.alertDialogTip(_t, res.rtMessage);
          }
        });
      },
      // 重置调整角色
      resetRole() {
        var _t = this;
        _t.dialogRoleVisible = false;
        _t.cacheRoleList = [];
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
            _t.roleTableData = res.rtData === null ? [] : res.rtData;
            // 查询当前用户对应的角色
            _t.getRoleWithUserId();
          } else if (res.rtCode) {
            _t.roleTableData = [];
            _t.alertDialogTip(_t, res.rtMessage);
          }
        });
      },
      // 根据用户id查询对应的角色列表
      getRoleWithUserId() {
        var _t = this;
        if (_t.tableSelect.user_id !== '') {
          var params = {
            user_id: _t.tableSelect.user_id
          };
          _t.$api.post('/tsGateWay/systemManager/queryuserrole', params, function (res) {
            if (res.rtCode && res.rtCode === "18050") {
              var resData = res.rtData === null ? [] : res.rtData;
              var cacheRoleList = new Array();
              resData.forEach((item) => {
                cacheRoleList.push(item.ROLEID);
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
      // 调整角色按钮
      changeRole(row) {
        var _t = this;
        _t.dialogRoleVisible = true;
        _t.tableSelect.user_id = row.USERID;
        _t.getRoleData();
      },
      // 提交调整角色
      commitRoleList() {
        var _t = this;
        // 先删除用户的角色,再添加用户的角色
        if (_t.tableSelect.user_id !== '') {
          if (_t.cacheRoleList.length !== 0) {
            let str = 'userid=' + _t.tableSelect.user_id;
            let Base64 = require('js-base64').Base64;
            let keyToken = _t.$md5(Base64.encode(str));
            var params = {
              userid: _t.tableSelect.user_id,
              token: keyToken,
            };
            _t.$api.post('/tsGateWay/systemManager/deluserrole', params, function (res) {
              if (res.rtCode && res.rtCode === '18020') {
                // 删除成功 调用新增角色接口
                _t.addRoleWithUser(_t.tableSelect.user_id, keyToken);
              } else if (res.rtCode) {
                _t.alertDialogTip(_t, res.rtMessage);
              }
            });
          } else {
            _t.alertDialogTip(_t, '不能提交为空的数据!');
          }
        } else {
          _t.alertDialogTip(_t, '操作员id不能为空!');
        }
      },
      // 为用户添加角色
      addRoleWithUser(user_id, token) {
        var _t = this;
        var roleList = new Array();
        _t.cacheRoleList.forEach((item) => {
          var obj = new Object();
          obj.userid = user_id;
          obj.roleid = item;
          roleList.push(obj);
        });
        var params = {
          userid: user_id, // 用户id
          user_role_list: roleList, // 角色列表
          token: token,// token
        };
        _t.$api.post('/tsGateWay/systemManager/addnewuserrole', params, function (res) {
          if (res.rtCode && res.rtCode === '18019') {
            _t.$alert('操作成功!', '温馨提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消'
            }).then(() => {
              _t.resetRole();
            }).catch(() => {
              _t.resetRole();
            });
          } else if (res.rtCode) {
            _t.alertDialogTip(_t, res.rtMessage);
          }
        });
      },
      // 重置调整位置
      resetLocation() {
        var _t = this;
        _t.dialogLocationVisible = false;
        _t.$refs.tree.setCheckedKeys([]);
      },
      // 调整位置按钮
      changeLocation(row) {
        var _t = this;
        _t.dialogLocationVisible = true;
        _t.tableSelect.user_id = row.USERID;
        _t.getLocationList();
      },
      // 获取位置列表
      getLocationList() {
        var _t = this;
        var params = {};
        _t.$api.post('/tsGateWay/ticketUtility/locationCascadeQuery', params, function (res) {
          // 查到线路信息
          if (res.rtCode && res.rtCode === '14007') {
            var locationTableData = new Array();
            var resData = res.rtData === null ? [] : res.rtData;
            // 处理数据
            resData.forEach((item) => {
              var obj = new Object();
              obj.location_number = item.LINE_LOCATION_NUMBER.toString();
              obj.location_name = item.LINE_LOCATION_NAME;
              obj.children = new Array();
              if (item.mlcList !== null) {
                item.mlcList.forEach((val) => {
                  var str = new Object();
                  str.location_number = val.LINE_LOCATION_NUMBER.toString();
                  str.location_name = val.LINE_LOCATION_NAME;
                  str.children = new Array();

                  if (val.lineList !== null) {
                    val.lineList.forEach(itemVal => {
                      var lineStr = new Object();
                      lineStr.location_number = itemVal.LINE_LOCATION_NUMBER.toString();
                      lineStr.location_name = itemVal.LINE_LOCATION_NAME;
                      lineStr.children = new Array()
                      lineStr.disabled = true;
                      if (itemVal.stationList !== null) {
                        itemVal.stationList.forEach(e => {
                          var stationStr = new Object();
                          stationStr.location_number = e.LOCATION_NUMBER;
                          stationStr.location_name = e.STATION_LOCATION_NAME;
                          if (stationStr.location_name) {
                            lineStr.children.push(stationStr)
                          }
                        })
                      }
                      if (lineStr.location_name) {
                        str.children.push(lineStr)
                      }
                    })
                  }
                  if (str.location_number) {
                    obj.children.push(str);
                  }
                });
              }
              locationTableData.push(obj);
            });
            _t.locationTableData = locationTableData;
            _t.getLocationListWithUserId();
          } else if (res.rtCode) {
            _t.locationTableData = [];
            _t.alertDialogTip(_t, res.rtMessage);
          }
        });
      },
      // 获取用户对应的位置列表
      getLocationListWithUserId() {
        var _t = this;
        if (_t.tableSelect.user_id !== '') {
          var params = {
            user_id: _t.tableSelect.user_id,
          };
          _t.$api.post('/tsGateWay/systemManager/queryUserLocation', params, function (res) {
            if (res.rtCode && res.rtCode === "18049") {
              var resData = res.rtData === null ? [] : res.rtData;
              resData.forEach((item) => {
                _t.$refs.tree.setChecked(item.LOCATION_NUMBER, true);
              });
            } else if (res.rtCode) {
              _t.alertDialogTip(_t, res.rtMessage);
            }
          });
        }
      },
      // 提交调整位置
      commitLocationList() {
        var _t = this;
        // 先删除用户的位置, 再添加用户的位置
        if (_t.tableSelect.user_id !== '') {
          var selectLocation = _t.$refs.tree.getCheckedKeys();
          if (selectLocation.length !== 0) {
            let str = 'userid=' + _t.tableSelect.user_id;
            let Base64 = require('js-base64').Base64;
            let keyToken = _t.$md5(Base64.encode(str));
            var params = {
              userid: _t.tableSelect.user_id,
              token: keyToken
            };
            _t.$api.post('/tsGateWay/systemManager/deluserlocation', params, function (res) {
              if (res.rtCode && res.rtCode === '18006') {
                // 删除成功,调用 新增用户位置接口
                _t.addLocationWithUser(_t.tableSelect.user_id, selectLocation, keyToken);
              } else if (res.rtCode) {
                   _t.alertDialogTip(_t, res.rtMessage);
              }
            });
          } else {
            _t.alertDialogTip(_t, '不能提交为空的数据!');
          }
        } else {
          _t.alertDialogTip(_t, '操作员id不能为空!');
        }
      },
      // 新增用户位置
      addLocationWithUser(user_id, locationList, token) {
        var _t = this;
        var locationListArr = new Array();
        locationList.forEach((item) => {
          var obj = new Object();
          obj.userid = user_id;
          obj.location_number = item;
          locationListArr.push(obj);
        });
        var params = {
          userid: user_id, // 用户id
          user_location_list: locationListArr, // 位置列表
          token: token, // token
        };
        _t.$api.post('/tsGateWay/systemManager/adduserlocation', params, function (res) {
          if (res.rtCode && res.rtCode === '18005') {
            _t.$alert('保存成功!', '温馨提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消'
            }).then(() => {
              _t.resetLocation();
            }).catch(() => {
              _t.resetLocation();
            });
          } else if (res.rtCode) {
              _t.alertDialogTip(_t, res.rtMessage);
          }
        });
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
          if (item.MENU_ID === 'MENU20190827161405NCOqoZnjZwhaTz') {
            _t.limitBtn.query = true;
          }
          // 新增用户
          if (item.MENU_ID === 'MENU20190827161343bFlYhtgtPuhqrz') {
            _t.limitBtn.create = true;
          }
          // 删除用户
          if (item.MENU_ID === "MENU20190827161448raoTOzksxopaDJ") {
            _t.limitBtn.delete = true;
          }
          // 修改密码
          if (item.MENU_ID === "MENU20190827161432KGhmycwlvuVjYv") {
            _t.limitBtn.changePassword = true;
          }
          // 批量导入
          if (item.MENU_ID === "MENU20191021143915KQZiNdEhNiDxuV") {
            _t.limitBtn.uploading = true;
          }
          // 调整角色
          if (item.MENU_ID === "MENU20190827161513SwyvPKTMWHtiSK") {
            _t.limitBtn.changeRole = true;
          }
          // 调整位置
          if (item.MENU_ID === "MENU20190827161528aROszsaKeCOtIR") {
            _t.limitBtn.changeLocation = true;
          }
          // 解锁改用户
          if (item.MENU_ID === "MENU20191008102847ourLlUqxKJfdho") {
            _t.limitBtn.deblocking = true;
          }
          // 下载
          if (item.MENU_ID === "MENU20191023180235LGyAnhskePslSt") {
            _t.limitBtn.download = true;
          }
        });
      }
    }
  }
</script>

<style scoped>
  .roleMap {
    margin-right: 50px;
    margin-bottom: 30px;
  }

  .upload-demo {
    margin-left: 12px;
  }

  .download {
    margin-left: 10px;
  }

  .treeBox {
    max-height: 500px;
    overflow-y: auto;
  }
</style>
