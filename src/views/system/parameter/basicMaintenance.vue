<template>
  <Box>
    <div class="formBox-top">
      <el-form :model="formItem" inline label-width="110px">
        <el-form-item label="参数编号：" class="marBottom7">
          <el-input  clearable v-model="formItem.code" class="width200"/>
        </el-form-item>
        <br>
        <el-form-item class="fl marBottom7">
          <el-button v-if="limitBtn.query" type="primary" @click="getData">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="marBottom10">
      <el-button class="fl" v-if="limitBtn.create" type="primary" @click="addDataBtn">新增参数</el-button>

    </div>
    <div class="tableWp">
      <el-table :data="tableData" border stripe>
        <el-table-column prop="GUID" label="参数编号"/>
        <el-table-column prop="PARAMETER_NAME" label="参数名称"/>
        <el-table-column prop="PARAMETER_VALUE" label="参数值"/>
        <el-table-column prop="PARAMETER_UPDATE" label="修改时间"/>
        <el-table-column prop="PARAMETER_COMMENT" label="参数说明"/>
        <el-table-column label="操作" width="330px" align="center" header-align="center">
          <template slot-scope="scope">
            <el-button type="primary" v-if="limitBtn.edit" @click="editDataBtn(scope.row)">编辑参数</el-button>
            <el-button type="danger" v-if="scope.row.showBtn" @click="deleteDataBtn(scope.row)">删除</el-button>
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
    <!--新增/编辑基础参数-->
    <el-dialog
      append-to-body
      :fullscreen="isScreen"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="resetData"
      :visible.sync="dialogVisible">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">新增/编辑基础参数</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreen = !isScreen"></i>
      </div>
      <el-form :model="addEdit" label-width="120px">
        <el-form-item class="star" label="参数名称：">
          <el-input
            @blur="blurInput(errorTip,addEdit.name,'nameFlag')"
            v-model="addEdit.name"/>
          <span class="isNotNull" v-if="errorTip.nameFlag">必填项不能为空</span>
        </el-form-item>
        <el-form-item class="star" label="参数值：">
          <el-input
            @blur="blurInput(errorTip,addEdit.value,'valueFlag')"
            v-model="addEdit.value"/>
          <span class="isNotNull" v-if="errorTip.valueFlag">必填项不能为空</span>
        </el-form-item>
        <el-form-item label="参数说明：">
          <el-input v-model="addEdit.description" type="textarea"/>
        </el-form-item>
      </el-form>
      <el-upload
        v-if="addEdit.guid  =='GUID88888820191030184239'"
        ref="upload"
        name="uploadFile"
        action="http://172.16.12.56:80/tsGateWay/sysUploadFileService/uploadBgm"
        :onSuccess="uploadSuccess"
        :onError="uploadError"
        :beforeUpload="beforeAvatarUpload" class="upload">
        <el-button type="primary">上传图片</el-button>
      </el-upload>
      <div slot="footer">
        <el-button @click="resetData">取消</el-button>
        <el-button type="primary" v-if="isAdd === true" v-btn-control @click="addData">保存</el-button>
        <el-button type="primary" v-if="isAdd === false"  v-btn-control @click="editData">保存</el-button>
      </div>
    </el-dialog>
  </Box>
</template>

<script>
  import Box from '../../../components/Box';

  export default {
    name: "basicMaintenance",
    components: {Box},
    data() {
      return {
        isScreen: false, // 新增编辑放大缩小
        // 查询表单
        formItem: {
          code: '', // 参数编号
        },
        showBtn: false,// 删除是否显示
        // 表格数据
        tableData: [],
        // 表格分页
        options: {
          total: 0, // 总条数
          currentPage: 1, // 当前页码
          pageSize: 10, // 显示条数
        },
        // 新增编辑蒙版层
        dialogVisible: false,
        // 判断是新增还是编辑
        isAdd: true,
        // 新增编辑表单
        addEdit: {
          guid: '', // guid
          name: '', // 参数名称
          value: '', // 参数值
          description: '',  // 参数说明
        },
        // 表单校验
        errorTip: {
          nameFlag: false, // 参数名称
          valueFlag: false, // 参数值
        },
        // 按钮权限
        limitBtn: {
          query: false, // 查询
          create: false, // 新增
          edit: false, // 编辑
          delete: false, // 删除
          uploadingImg: false, // 上传图片
        }
      }
    },
    methods: {
      // 文件上传成功时调用
      uploadSuccess(val) {
        var _t = this;
        // 清空已上传的文件列表
        if (val.rtCode) {
          _t.getData();
          _t.dialogVisible = false;
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

      },
      // 重置查询表单
      resetFormItem() {
        var _t = this;
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
      // 重置新增编辑表单
      resetData() {
        var _t = this;
        _t.dialogVisible = false;
        _t.isAdd = true;
        _t.addEdit.guid = ''; // guid
        _t.addEdit.name = ''; // 参数名称
        _t.addEdit.value = ''; // 参数值
        _t.addEdit.description = ''; // 参数说明
        _t.errorTip.nameFlag = false; // 参数名称校验
        _t.errorTip.valueFlag = false; // 参数值校验
      },
      // 查询表格数据
      getData() {
        var _t = this;
        var params = {
          guid: _t.formItem.code.trim() === '' ? null : _t.formItem.code.trim(),
          pageNum: _t.options.currentPage, // 当前页
          pageSize: _t.options.pageSize, // 每页显示条数
        };
        _t.$api.post('/tsGateWay/systemManager/queryParameter', params, function (res) {
          _t.$store.commit('setLoading', false);
          if (res.rtCode && res.rtCode === '18040') {
            _t.tableData = res.rtData === null ? [] : res.rtData;
            _t.tableData.forEach(item => {
              if (item.GUID !=='DEVCRI999999999'&&item.GUID !=='DEV8888820190828171945'&&item.GUID !=='DEV8888820190828172042'
                &&item.GUID !=='DEV88888820190829112101'&&item.GUID !=='GUID88888820191030184239'
              ) {
                item.showBtn = true
              }
            });
            _t.options.total = res.totalCount ? res.totalCount : 0;
          } else if (res.rtCode) {
            _t.alertDialogTip(_t, res.rtMessage);
          }
        });
      },
      // 新增按钮
      addDataBtn() {
        var _t = this;
        _t.isAdd = true;
        _t.dialogVisible = true;
      },
      // 新增基础参数提交
      addData() {
        var _t = this;
        var user_id = _t.getCookie('USER_ID');
        if (user_id !== null && user_id !== 'null') {
          // 校验参数名称
          _t.blurInput(_t.errorTip, _t.addEdit.name, 'nameFlag');
          // 校验参数值
          _t.blurInput(_t.errorTip, _t.addEdit.value, 'valueFlag');
          // 可以提交
          if (_t.errorTip.nameFlag === false
            && _t.errorTip.valueFlag === false) {
            let str = 'userid=' + user_id
              + '&parameter_name=' + _t.addEdit.name.trim()
              + '&parameter_value=' + _t.addEdit.value.trim();
            let Base64 = require('js-base64').Base64;
            let keyToken = _t.$md5(Base64.encode(str));
            var params = {
              userid: user_id, // 操作员id
              parameter_name: _t.addEdit.name.trim(), // 参数名称
              parameter_value: _t.addEdit.value.trim(), // 参数值
              showBtn: true,
              token: keyToken, // token
              parameter_comment: _t.addEdit.description.trim(), // 参数说明
            };
            _t.$api.post('/tsGateWay/systemManager/addParameter', params, function (res) {
              if (res.rtCode && res.rtCode === '18039') {
                _t.$alert(res.rtMessage, '温馨提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消'
                }).then(() => {
                  _t.resetData();
                  _t.getData();
                }).catch(() => {
                  _t.resetData();
                  _t.getData();
                });
              } else if (res.rtCode) {
                _t.alertDialogTip(_t, res.rtMessage);
              }
            });
          }
        } else {
          _t.alertDialogTip(_t, '用户id不能为空!');
        }
      },
      // 编辑按钮
      editDataBtn(row) {
        var _t = this;
        _t.isAdd = false;
        _t.dialogVisible = true;
        _t.addEdit.guid = row.GUID; // guid
        _t.addEdit.name = row.PARAMETER_NAME; // 参数名称
        _t.addEdit.value = row.PARAMETER_VALUE; // 参数值
        _t.addEdit.description = row.PARAMETER_COMMENT; // 参数描述
      },
      // 编辑基础参数提交
      editData() {
        var _t = this;
        var user_id = _t.getCookie('USER_ID').toString();
        if (user_id !== null && user_id !== 'null') {
          // 校验参数名称
          _t.blurInput(_t.errorTip, _t.addEdit.name, 'nameFlag');
          // 校验参数值
          _t.blurInput(_t.errorTip, _t.addEdit.value, 'valueFlag');
          // 可以提交
          if (_t.errorTip.nameFlag === false
            && _t.errorTip.valueFlag === false) {
            let str = 'guid=' + _t.addEdit.guid.trim();
            // + '&parameter_name=' + _t.addEdit.name.trim()
            // + '&parameter_value=' + _t.addEdit.value.trim();
            let Base64 = require('js-base64').Base64;
            let keyToken = _t.$md5(Base64.encode(str));
            var params = {
              userid: user_id, // 操作员id
              guid: _t.addEdit.guid, // guid
              parameter_name: _t.addEdit.name.trim(), // 参数名称
              parameter_value: _t.addEdit.value.trim(), // 参数值
              token: keyToken, // token
              parameter_comment: _t.addEdit.description.trim(), // 参数说明
            };
            _t.$api.post('/tsGateWay/systemManager/editParameter', params, function (res) {
              if (res.rtCode && res.rtCode === '18041') {
                _t.$alert(res.rtMessage, '温馨提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消'
                }).then(() => {
                  setTimeout(function () {
                    _t.resetData();
                  }, 100)
                  _t.getData();
                }).catch(() => {
                  setTimeout(function () {
                    _t.resetData();
                  }, 100)
                  _t.getData();
                });
              } else if (res.rtCode) {
                _t.alertDialogTip(_t, res.rtMessage);
              }
            });
          }
        } else {
          _t.alertDialogTip(_t, '用户id不能为空!');
        }
      },
      // 删除按钮
      deleteDataBtn(row) {
        var _t = this;
        _t.$confirm('是否确认删除操作?', '删除基础参数', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let str = 'guid=' + row.GUID;
          let Base64 = require('js-base64').Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          var params = {
            guid: row.GUID, // id
            token: keyToken, // token
          };
          _t.$api.post('/tsGateWay/systemManager/delParameter', params, function (res) {
            if (res.rtCode && res.rtCode === '18042') {
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
          if (item.MENU_ID === "MENU20190827162156cGgWzndLXPTYZZ") {
            _t.limitBtn.query = true;
          }
          // 上传图片
          if (item.MENU_ID === "MENU20191030184609SKNhwRWRPbVorP") {
            _t.limitBtn.uploadingImg = true;
          }
          // 新增
          if (item.MENU_ID === "MENU20190827162212fKLmkXfMZxaIQH") {
            _t.limitBtn.create = true;
          }
          // 删除
          if (item.MENU_ID === "MENU20190827162242lAZeqeIzknqoXI") {
            _t.limitBtn.delete = true;
          }
          // 编辑
          if (item.MENU_ID === "MENU20190827162229CFWlzMHRuXYYBC") {
            _t.limitBtn.edit = true;
          }
        });
      }
    }
  }
</script>

<style scoped>
  .upload {
    display: inline-block;
  }
  .upload-demo {
    margin-left: 10px;
  }
</style>
