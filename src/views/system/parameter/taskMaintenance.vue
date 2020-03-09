<template>
  <Box>
    <div class="formBox-top paddingBottom15">
      <el-button type="primary" v-if="limitBtn.create" @click="manualGear">手动结算</el-button>
      <el-button type="primary" v-if="limitBtn.create" @click="addRoleBtn">添加</el-button>
    </div>
    <div class="tableWp">
      <el-table :data="tableData" stripe border ref="table">
        <el-table-column prop="id" label="定时任务id"/>
        <el-table-column prop="jobName" label="定时任务名称"/>
        <el-table-column prop="beanClass" label="任务类"/>
        <el-table-column prop="jobGroup" label="定时任务分组"/>
        <el-table-column prop="cronExpression" label="cron表达式"/>
        <el-table-column prop="jobStatus" label="定时任务状态">
          <template slot-scope="scope">
            <el-button type="primary" v-if="scope.row.jobStatus == '1'" @click="detils(scope.row)">关闭</el-button>
            <el-button type="primary" v-if="scope.row.jobStatus == '0'" @click="detils(scope.row)">开启</el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="350" header-align="center" align="center">
          <template slot-scope="scope">
            <el-button type="primary" :disabled="scope.row.jobStatus == '1'" v-if="limitBtn.changeRole"
                       @click="changeRoleBtn(scope.row)">修改
            </el-button>
            <el-button type="danger" :disabled="scope.row.jobStatus == '1'" v-if="limitBtn.delete"
                       @click="deleteRole(scope.row)">删除
            </el-button>
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
    <!--修改定时任务-->
    <el-dialog
      append-to-body
      :fullscreen="isScreenCreate"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="resetRole"
      :visible.sync="dialogAddVisible">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">修改定时任务</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenCreate = !isScreenCreate"></i>
      </div>
      <el-form :model="addFormItem" ref="detailFormItem" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="任务名称：" class=" star marBottom7">
              <el-input v-model="addFormItem.jobName"></el-input>
            </el-form-item>
            <el-form-item label="定时任务：" class="star marBottom7">
              <el-input v-model="addFormItem.beanClass"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务分组：" class="star marBottom7">
              <el-input v-model="addFormItem.jobGroup"></el-input>
            </el-form-item>
            <el-form-item label="cron表达式：" class="star marBottom7">
              <el-input v-model="addFormItem.cronExpression"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注：" class="star marBottom7">
          <el-input v-model="addFormItem.description"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="resetRole">取消</el-button>
        <el-button type="primary" v-btn-control @click="editRole">保存</el-button>
      </div>
    </el-dialog>

    <el-dialog
      append-to-body
      :fullscreen="isScreenCreate"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="resetRole"
      :visible.sync="dialogAddVisible1">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">添加定时任务</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenCreate = !isScreenCreate"></i>
      </div>
      <el-form :model="addFormItem" ref="detailFormItem" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="任务名称：" class=" star marBottom7">
              <el-input v-model="addFormItem.jobName"></el-input>
            </el-form-item>
            <el-form-item label="定时任务：" class="star marBottom7">
              <el-input v-model="addFormItem.beanClass"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务分组：" class="star marBottom7">
              <el-input v-model="addFormItem.jobGroup"></el-input>
            </el-form-item>
            <el-form-item label="cron表达式：" class="star marBottom7">
              <el-input v-model="addFormItem.cronExpression"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注：" class="star marBottom7">
          <el-input v-model="addFormItem.description"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="resetRole">取消</el-button>
        <el-button type="primary" v-btn-control @click="addRole">保存</el-button>
      </div>
    </el-dialog>
    <!--     手动结算-->
    <el-dialog
      append-to-body
      :fullscreen="isScreenCreate"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="resetRole"
      :visible.sync="dialogAddmanualGear">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">手动结算</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenCreate = !isScreenCreate"></i>
      </div>
      <p class="text">请输入结算的日期</p>
      <el-date-picker
        class="picker"
        :editable="false"
        v-model="timeDate"
        type="date"
        placeholder="请输入结算的日期">
      </el-date-picker>
      <div slot="footer">
        <el-button @click="resetRole">取消</el-button>
        <el-button type="primary" v-btn-control @click="manualGearRole">保存</el-button>
      </div>
    </el-dialog>
    <!--启用停用-->
    <!--    <el-dialog-->
    <!--      append-to-body-->
    <!--      :fullscreen="isScreenCreate"-->
    <!--      :close-on-click-modal="false"-->
    <!--      :close-on-press-escape="false"-->
    <!--      :before-close="resetRole"-->
    <!--      :visible.sync="dialogDetailVisible">-->
    <!--      <div slot="title" class="dialogTitle clearFix">-->
    <!--        <span class="title">启用停用</span>-->
    <!--        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenCreate = !isScreenCreate"></i>-->
    <!--      </div>-->
    <!--      <el-form :model="addFormItem" ref="detailFormItem" label-width="100px">-->
    <!--        <el-form-item label="启用/停用：">-->
    <!--          <el-radio-group v-model="addFormItem.codeUse">-->
    <!--            <el-radio label="1">启用</el-radio>-->
    <!--            <el-radio label="0">停用</el-radio>-->
    <!--          </el-radio-group>-->
    <!--        </el-form-item>-->
    <!--      </el-form>-->
    <!--      <div slot="footer">-->
    <!--        <el-button @click="resetRole">取消</el-button>-->
    <!--        <el-button type="primary" @click="startStop">保存</el-button>-->
    <!--      </div>-->
    <!--    </el-dialog>-->
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
        dialogAddmanualGear: false, //  手动结算
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
        timeDate: '', // 手动结算日期
        // 是否放大缩小
        isScreenDetail: false,
        // 修改蒙版
        dialogAddVisible: false,
        // 新增角色蒙版
        dialogAddVisible1: false,
        // 调整权限蒙版
        dialogLimitVisible: false,
        // 启用停用
        dialogDetailVisible: false,
        // 详情数据
        detailFormItem: {
          TICKET_CATEGORY_NAME: '', //票卡属性名称
          EVALUATION_FLAG_NAME: '', //票务状态名称
          TICKET_STATE_NAME: '',//车票状态名称
          TICKET_VALID_NAME: '', //是否有效名称
          STOCK_TYPE_NAME_CN: '',//库存管理类型中文名称
          STOCK_MANAGE_TYPE_ID: '' //库存管理类型代码
        },
        // 新增数据
        addFormItem: {
          jobName: '', // 任务名称
          jobGroup: '', // 任务分组
          cronExpression: '', //cron表达式
          description: '', // 描述
          beanClass: '',//定时任务
          id: '',//定时任务id
          codeUse: '', // 启用停用
        },
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
          create: false, // 新增
          delete: false, // 删除
          changeRole: false, // 修改
          detils: false, // 启用/停用
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
      // 手动结算
      manualGear() {
        var _t = this;
        _t.dialogAddmanualGear = true;
      },
      // 手动结算保存
      manualGearRole() {
        var _t = this;
        var data = new Date(_t.timeDate);
        var timeData = `${data.getFullYear()}${_t.time(data.getMonth() + 1)}${_t.time(data.getDate())}`;
        if (timeData !== '') {
          var params = {
            balanceDate: timeData
          };
          axios.post('http://172.16.12.55:8908/daily/manualSettlement', params).then(function (response) {
            if (response.data.rtCode == '15004') {
              _t.resetRole();
              _t.alertDialogTip(_t, response.data.rtMessage);
            }else {
              _t.timeDate = '';
              _t.alertDialogTip(_t, response.data.rtMessage);
            }
          })
        } else {
          _t.alertDialogTip(_t, '请选择日期');
        }
      },
      // 时间补零
      time(s) {
        return s < 10 ? '0' + s : s
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
      // 启用停用
      detils(row) {
        var _t = this;
        var cmds = '';
        var ditioas = '';

        _t.addFormItem.codeUse = row.jobStatus;
        _t.addFormItem.id = row.id;
        if (_t.addFormItem.codeUse == '1') {
          cmds = 'stop';
          ditioas = '该任务是启用状态,你要停止吗!'
        } else {
          cmds = 'start';
          ditioas = '该任务是停止状态,你要启用吗!'
        }
        _t.$confirm(ditioas, '启用停用', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let str = 'id=' + _t.addFormItem.id.trim().toString()
            + '&cmd=' + cmds;
          let Base64 = require('js-base64').Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          var params = {
            id: _t.addFormItem.id,
            cmd: cmds, // 启用/停用状态
            token: keyToken
          };
          _t.$api.post('/tsGateWay/systemManager/changeJobStatus', params, function (res) {
            if (res.rtCode && res.rtCode === '18065') {
              _t.getData();
              _t.alertDialogTip(_t, res.rtMessage);
            } else if (res.rtCode) {
              _t.alertDialogTip(_t, res.rtMessage);
            }
          });
        }).catch(() => {
          ditioas = '';
          _t.resetRole();
          return false;
        });
      },
      // 启用停用提交
      startStop() {
        var _t = this;
        var cmds = '';
        var ditioas = '';
        if (_t.addFormItem.codeUse == '1') {
          cmds = 'stop';
          ditioas = '该任务是启用状态,你要停止吗!'
        } else {
          cmds = 'start';
          ditioas = '该任务是停止状态,你要启用吗!'
        }
        _t.$confirm(ditioas, '启用停用', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let str = 'id=' + _t.addFormItem.id.trim().toString()
            + '&cmd' + cmds;
          let Base64 = require('js-base64').Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          var params = {
            id: _t.addFormItem.id,
            cmd: cmds, // 启用/停用状态
            token: keyToken
          };
          _t.$api.post('/tsGateWay/systemManager/changeJobStatus', params, function (res) {
            if (res.rtCode && res.rtCode === '18065') {
              _t.alertDialogTip(_t, res.rtMessage);
            } else if (res.rtCode) {
              _t.alertDialogTip(_t, res.rtMessage);
            }
          });
        }).catch(() => {
          ditioas = '';
          _t.resetRole();
          return false;
        });
      },
      // 查询数据
      getData() {
        var _t = this;
        var params = {
          pageNum: _t.options.currentPage, // 当前页
          pageSize: _t.options.pageSize, // 每页显示条数
        };
        _t.$api.post('/tsGateWay/systemManager/jobList', params, function (res) {
          _t.$store.commit('setLoading', false);
          if (res.rtCode && res.rtCode === '18060') {
            _t.tableData = res.rtData === null ? [] : res.rtData;
            _t.options.total = res.totalCount ? res.totalCount : 0;
          } else if (res.rtCode) {
            _t.alertDialogTip(_t, res.rtMessage);
          }
        });
      },
      // 新增
      addRoleBtn() {
        var _t = this;
        // _t.isAdd = true;
        _t.dialogAddVisible1 = true;
      },
      // 修改
      changeRoleBtn(row) {
        var _t = this;
        _t.isAdd = false;
        _t.dialogAddVisible = true;
        _t.addFormItem.jobName = row.jobName;// 任务名称
        _t.addFormItem.cronExpression = row.cronExpression; //cron表达式
        _t.addFormItem.jobGroup = row.jobGroup; // 任务分组
        _t.addFormItem.description = row.description;// 描述
        _t.addFormItem.beanClass = row.beanClass;//定时任务
        _t.addFormItem.id = row.id;//定时任务id
      },
      // 删除
      deleteRole(row) {
        var _t = this;
        var arr = [];
        var id = row.id;
        arr.push(id)
        _t.$confirm('是否确认删除操作?', '删除角色', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if (row.jobStatus == '1') {
            // 已启动
            _t.alertDialogTip(_t, '该任务已启动,无法删除!')
          } else {
            var params = {
              jobIds: arr
            };
            _t.$api.post('/tsGateWay/systemManager/delJob', params, function (res) {
              if (res.rtCode && res.rtCode === '18064') {
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
          }
        }).catch(() => {
          return false;
        });
      },
      // 重置
      resetRole() {
        var _t = this;
        _t.isAdd = true;
        _t.timeDate = '';
        _t.dialogDetailVisible = false;
        _t.dialogAddVisible = false;
        _t.dialogAddVisible1 = false;
        _t.dialogAddmanualGear = false;
        _t.addEdit.id = ''; // id
        _t.addEdit.roleName = ''; // 名称
        _t.addEdit.note = ''; // 备注
        _t.errorTip.roleNameFlag = false;
        _t.addFormItem.jobName = '';// 任务名称
        _t.addFormItem.cronExpression = ''; //cron表达式
        _t.addFormItem.jobGroup = ''; // 任务分组
        _t.addFormItem.description = '';// 描述
        _t.addFormItem.beanClass = '';//定时任务
        _t.addFormItem.id = '';//定时任务id
      },
      // 新增提交
      addRole() {
        var _t = this;
        // 校验角色名称
        var user_id = _t.getCookie('USER_ID').toString();
        // 可以提交
        if (_t.addFormItem.jobName !== '' && _t.addFormItem.jobGroup !== ''
          && _t.addFormItem.beanClass !== ''
          && _t.addFormItem.cronExpression !== ''
          && _t.addFormItem.description !== ''
        ) {
          let str = 'jobName=' + _t.addFormItem.jobName.trim().toString()
            + '&jobGroup=' + _t.addFormItem.jobGroup.trim().toString()
            + '&beanClass=' + _t.addFormItem.beanClass.trim().toString()
            + '&cronExpression=' + _t.addFormItem.cronExpression.trim().toString()
            + '&description=' + _t.addFormItem.description.trim().toString()
            + '&userId=' + user_id;
          let Base64 = require('js-base64').Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          var params = {
            jobName: _t.addFormItem.jobName.trim().toString(),
            jobGroup: _t.addFormItem.jobGroup.trim().toString(),
            beanClass: _t.addFormItem.beanClass.trim().toString(),
            cronExpression: _t.addFormItem.cronExpression.trim().toString(),
            description: _t.addFormItem.description.trim().toString(),
            userId: user_id,
            token: keyToken
          };
          _t.$api.post('/tsGateWay/systemManager/addJob', params, function (res) {
            if (res.rtCode && res.rtCode === '18061') {
              _t.$alert(res.rtMessage, '温馨提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消'
              }).then(() => {
                _t.getData();
                setTimeout(function () {
                  _t.resetRole();
                }, 100)
              }).catch(() => {
                _t.getData();
                setTimeout(function () {
                  _t.resetRole();
                }, 100)
              });
            } else if (res.rtCode) {
              _t.alertDialogTip(_t, res.rtMessage);
            }
          });
        } else {
          _t.alertDialogTip(_t, '必填项不能为空');
        }
      },
      // 修改提交
      editRole(row) {
        var _t = this;
        // 可以提交
        if (1) {
          var params = {
            id: _t.addFormItem.id.trim().toString(),
            jobName: _t.addFormItem.jobName.trim().toString(),
            jobGroup: _t.addFormItem.jobGroup.trim().toString(),
            beanClass: _t.addFormItem.beanClass.trim().toString(),
            cronExpression: _t.addFormItem.cronExpression.trim().toString(),
            description: _t.addFormItem.description.trim().toString(),
          };
          _t.$api.post('/tsGateWay/systemManager/editJob', params, function (res) {
            if (res.rtCode && res.rtCode === '18062') {
              _t.$alert(res.rtMessage, '温馨提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消'
              }).then(() => {
                _t.getData();
                setTimeout(function () {
                  _t.resetRole();
                }, 100)

              }).catch(() => {
                _t.getData();
                setTimeout(function () {
                  _t.resetRole();
                }, 100)
              });
            } else if (res.rtCode) {
              _t.alertDialogTip(_t, res.rtMessage);
            }
          });
        }
      },
      // 重置权限
      resetLimit() {
        var _t = this;
        _t.dialogLimitVisible = false;
        _t.tableSelect.id = ''; // 角色id
        _t.$refs.tree.setCheckedKeys([]); // 勾选为空
        _t.selectKeys = []; // 默认勾选为空
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
          if (item.MENU_ID === "MENU20191017103727vtsroNcuBFCUpi") {
            _t.limitBtn.query = true;
          }
          // 新增
          if (item.MENU_ID === 'MENU20191019104251UbsCPdvDAMIKOn') {
            _t.limitBtn.create = true;
          }
          // 删除
          if (item.MENU_ID === "MENU20191019133850PYyDaedrkZGgXj") {
            _t.limitBtn.delete = true;
          }
          // 修改
          if (item.MENU_ID === "MENU20191017103750byvbhinCoMPCLk") {
            _t.limitBtn.changeRole = true;
          }
          // 定时任务的启用和停用
          if (item.MENU_ID === "MENU20191017103827uLaqqttHGgXDQn") {
            _t.limitBtn.detils = true;
          }
        });
      }
    }
  }
</script>

<style scoped>
  .text {
    margin-bottom: 20px;
    margin-left: 5px;
    font-size: 20px;
    color: #000;
    font-weight: 500;
  }
  .picker {
    margin-bottom: 50px;
  }
  .treeBox {
    max-height: 500px;
    overflow-y: auto;
  }
</style>
