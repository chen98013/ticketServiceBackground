<template>
  <Box>
    <div class="formBox-top paddingBottom15">
      <el-form :model="formItem" inline label-width="110px">
        <el-form-item label="查询名称：" class="marBottom7">
          <el-input v-model="formItem.name" class="width200"/>
        </el-form-item>
      </el-form>
      <br>
      <el-button type="primary" v-if="limitBtn.create" @click="addRoleBtn">新增</el-button>
      <el-button type="primary" v-if="limitBtn.changeLimit" @click="changeLimit">同步</el-button>
      <div class="fr">
        <el-button type="primary" v-if="limitBtn.query" @click="getData">查询</el-button>
        <el-button type="warning" @click="resetFormItem">重置</el-button>
      </div>
    </div>
    <div class="tableWp">
      <el-table :data="tableData" stripe border ref="table">
        <el-table-column prop="DEVICE_ID" label="设备编号"/>
        <el-table-column prop="IP_ADDRESS" label="IP地址"/>
        <el-table-column prop="DEVICE_NAME" label="设备名称"/>
        <el-table-column prop="DEVICE_TYPE" label="设备类型"/>
        <el-table-column label="操作" width="350" header-align="center" align="center">
          <template slot-scope="scope">
            <el-button type="primary" v-if="limitBtn.changeRole" @click="changeRoleBtn(scope.row)">修改</el-button>
            <el-button type="primary" v-if="limitBtn.detils" @click="detils(scope.row)">详情</el-button>
            <el-button type="danger" v-if="limitBtn.delete" @click="deleteRole(scope.row)">删除</el-button>
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
    <!--修改设备-->
    <el-dialog
      append-to-body
      :fullscreen="isScreenCreate"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="resetRole"
      :visible.sync="dialogAddVisible">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">修改设备</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenCreate = !isScreenCreate"></i>
      </div>
      <el-form :model="detailFormItem" ref="detailFormItem" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备编号：" class=" star marBottom7">
              <el-input v-model="detailFormItem.device_id"></el-input>
            </el-form-item>
            <el-form-item label="设备类型：" class="star marBottom7">
              <el-input v-model="detailFormItem.device_type"></el-input>
            </el-form-item>
            <el-form-item label="设备序号：" class="star marBottom7">
              <el-input v-model="detailFormItem.device_unique_id"></el-input>
            </el-form-item>
            <el-form-item label="站厅ID：" class="star marBottom7">
              <el-input v-model="detailFormItem.hall_id"></el-input>
            </el-form-item>
            <el-form-item label="横向位置：" class=" star marBottom7">
              <el-input v-model="detailFormItem.x_position"></el-input>
            </el-form-item>
            <el-form-item label="纵向位置：" class="star marBottom7">
              <el-input v-model="detailFormItem.y_position"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label=" 组编号：" class="star marBottom7">
              <el-input v-model="detailFormItem.group_id"></el-input>
            </el-form-item>
            <el-form-item label="组内设备编号：" class="star marBottom7">
              <el-input v-model="detailFormItem.group_device_id"></el-input>
            </el-form-item>
            <el-form-item label="IP地址：" class="star marBottom7">
              <el-input v-model="detailFormItem.ip_address"></el-input>
            </el-form-item>
            <el-form-item label="设备名称：" class="star marBottom7">
              <el-input v-model="detailFormItem.device_name"></el-input>
            </el-form-item>
            <el-form-item label="设备管理状态：" star class="marBottom7">
              <el-input v-model="detailFormItem.device_state"></el-input>
            </el-form-item>
            <el-form-item label="设备方向：" class="star marBottom7">
              <el-input v-model="detailFormItem.direction"></el-input>
            </el-form-item>
            <el-form-item label="所属车站：" class="star marBottom7">
              <el-input v-model="detailFormItem.station_id"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button @click="resetRole">取消</el-button>
        <el-button type="primary" v-btn-control @click="editRole">保存</el-button>
      </div>
    </el-dialog>
    <!--新增设备-->
    <el-dialog
      append-to-body
      :fullscreen="isScreenCreate"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="resetRole"
      :visible.sync="dialogAddVisible1">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">新增设备</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenCreate = !isScreenCreate"></i>
      </div>
      <el-form :model="addFormItem" ref="detailFormItem" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备编号：" class=" star marBottom7">
              <el-input v-model="addFormItem.device_id"></el-input>
            </el-form-item>
            <el-form-item label="设备类型：" class="star marBottom7">
              <el-input maxlength="2" v-model="addFormItem.device_type"></el-input>
            </el-form-item>
            <el-form-item label="设备序号：" class="star marBottom7">
              <el-input v-model="addFormItem.device_unique_id"></el-input>
            </el-form-item>
            <el-form-item label="站厅ID：" class="star marBottom7">
              <el-input v-model="addFormItem.hall_id"></el-input>
            </el-form-item>
            <el-form-item label="横向位置：" class=" star marBottom7">
              <el-input v-model="addFormItem.x_position"></el-input>
            </el-form-item>
            <el-form-item label="纵向位置：" class="star marBottom7">
              <el-input v-model="addFormItem.y_position"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label=" 组编号：" class="star marBottom7">
              <el-input v-model="addFormItem.group_id"></el-input>
            </el-form-item>
            <el-form-item label="组内设备编号：" class="star marBottom7">
              <el-input v-model="addFormItem.group_device_id"></el-input>
            </el-form-item>
            <el-form-item label="IP地址：" class="star marBottom7">
              <el-input v-model="addFormItem.ip_address"></el-input>
            </el-form-item>
            <el-form-item label="设备名称：" class="star marBottom7">
              <el-input v-model="addFormItem.device_name"></el-input>
            </el-form-item>
            <el-form-item label="设备管理状态：" star class="marBottom7">
              <el-input v-model="addFormItem.device_state"></el-input>
            </el-form-item>
            <el-form-item label="设备方向：" class="star marBottom7">
              <el-input maxlength="1" v-model="addFormItem.direction"></el-input>
            </el-form-item>
            <el-form-item label="所属车站：" class="star marBottom7">
              <el-input v-model="addFormItem.station_id"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button @click="resetRole">取消</el-button>
        <el-button type="primary" v-btn-control @click="addRole">保存</el-button>
      </div>
    </el-dialog>
    <!--    详情-->
    <el-dialog
      v-dialogDrag
      append-to-body
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :visible.sync="dialogDetailVisible"
      :fullscreen="isScreenDetail"
    >
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">详情</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenDetail = !isScreenDetail"></i>
      </div>
      <el-form :model="detailFormItem" ref="detailFormItem" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备编号：" class=" star marBottom7">
              <el-input v-model="detailFormItem.device_id" disabled></el-input>
            </el-form-item>
            <el-form-item label="设备类型：" class="star marBottom7">
              <el-input maxlength="2" v-model="detailFormItem.device_type" disabled></el-input>
            </el-form-item>
            <el-form-item label="设备序号：" class="star marBottom7">
              <el-input v-model="detailFormItem.device_unique_id" disabled></el-input>
            </el-form-item>
            <el-form-item label="站厅ID：" class="star marBottom7">
              <el-input v-model="detailFormItem.hall_id" disabled></el-input>
            </el-form-item>
            <el-form-item label="横向位置：" class=" star marBottom7">
              <el-input v-model="detailFormItem.x_position" disabled ></el-input>
            </el-form-item>
            <el-form-item label="纵向位置：" class="star marBottom7">
              <el-input v-model="detailFormItem.y_position" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label=" 组编号：" class="star marBottom7">
              <el-input v-model="addFormItem.group_id" disabled></el-input>
            </el-form-item>
            <el-form-item label="组内设备编号：" class="star marBottom7">
              <el-input v-model="addFormItem.group_device_id" disabled></el-input>
            </el-form-item>
            <el-form-item label="IP地址：" class="star marBottom7">
              <el-input v-model="addFormItem.ip_address" disabled></el-input>
            </el-form-item>
            <el-form-item label="设备名称：" class="star marBottom7">
              <el-input v-model="addFormItem.device_name" disabled></el-input>
            </el-form-item>
            <el-form-item label="设备管理状态：" star class="marBottom7">
              <el-input v-model="addFormItem.device_state" disabled></el-input>
            </el-form-item>
            <el-form-item label="设备方向：" class="star marBottom7">
              <el-input maxlength="1" v-model="addFormItem.direction" disabled></el-input>
            </el-form-item>
            <el-form-item label="所属车站：" class="star marBottom7">
              <el-input v-model="addFormItem.station_id" disabled></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button type="primary" @click="resetRole">关闭</el-button>
      </div>
    </el-dialog>
    <!--    同步-->
    <el-dialog
      append-to-body
      :fullscreen="isScreenCreate"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="resetRole"
      :visible.sync="dialogAddSyn">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">同步</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenCreate = !isScreenCreate"></i>
      </div>
      <div class="text">
        <p>注:</p>
        "<span class="text_d">+</span>"<span class="text_sapn">是添加到本地库</span>
        "<span class="text_d">-</span>"<span>是从本地库删除</span>
      </div>
      <el-checkbox-group v-model="checkList">
        <el-checkbox
          class="checkBox"
          v-for="(item,index) in ticketTypeList"
          :class="item.flag==1? 'flagStyle': 'flagStyles'"
          :key="index"
          :label="item"
        >{{item.DEVICE_NAME}}
        </el-checkbox>
      </el-checkbox-group>
      <div slot="footer">
        <el-button type="primary" @click="resetRole">取消</el-button>
        <el-button type="primary" v-btn-control @click="synchronous">保存</el-button>
      </div>
    </el-dialog>
  </Box>
</template>

<script>
  import Box from '../../../components/Box';

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
        // 是否放大缩小
        isScreenDetail: false,
        // 修改蒙版
        dialogAddVisible: false,
        // 新增角色蒙版
        dialogAddVisible1: false,
        // 调整权限蒙版
        dialogLimitVisible: false,
        // 详情
        dialogDetailVisible: false,
        // 同步
        dialogAddSyn: false,
        // 详情数据
        detailFormItem: {
          device_id: "", //  设备编号
          device_type: "", // 设备类型
          device_sub_type: "",//  设备子类型
          device_unique_id: "", //  设备序号
          hall_id: "", //  站厅ID
          group_id: "", //  组编号
          group_device_id: "", //  组内设备编号
          ip_address: "", //IP地址
          device_name: "", // 设备名称
          device_state: "", // 设备管理状态01：在用；02：停用；03：移除
          x_position: "", //横向位置
          y_position: "", //  纵向位置
          direction: "", //   设备方向
          station_id: "", //  所属车站
        },
        // 新增数据
        addFormItem: {
          device_id: "", //  设备编号
          device_type: "", // 设备类型
          device_sub_type: "",//  设备子类型
          device_unique_id: "", //  设备序号
          hall_id: "", //  站厅ID
          group_id: "", //  组编号
          group_device_id: "", //  组内设备编号
          ip_address: "", //IP地址
          device_name: "", // 设备名称
          device_state: "", // 设备管理状态01：在用；02：停用；03：移除
          x_position: "", //横向位置
          y_position: "", //  纵向位置
          direction: "", //   设备方向
          station_id: "", //  所属车站
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
        limitData: [],
        // 同步
        checkList: [],
        ticketTypeList: [],
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
          detils: false, // 详情
          changeLimit: false, // 同步
          changeLimitLoading: false,
        },
        // 从cookie中获取
        cookieMap: {
          location_number: this.getCookie('LOCATION_NUMBER'), // 位置编号
          user_id: this.getCookie('USER_ID'), // 操作员ID
          role: this.getCookie('USER_TYPE'), // 用户角色
          station_id: this.getCookie('STATION_ID'), // 车站类型id
        }
      }
    },
    methods: {
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
      // 详情
      detils(row) {
        this.dialogDetailVisible = true;
        this.detailFormItem.device_id = row.DEVICE_ID; // 设备编号
        this.detailFormItem.device_type = row.DEVICE_TYPE; // 设备类型
        this.detailFormItem.device_sub_type = row.DEVICE_SUB_TYPE; //  设备子类型
        this.detailFormItem.station_id = row.STATION_ID; //  所属车站
        this.detailFormItem.direction = row.DIRECTION;//   设备方向
        this.detailFormItem.y_position = row.Y_POSITION; //  纵向位置
        this.detailFormItem.x_position = row.X_POSITION; //横向位置
        this.detailFormItem.device_state = row.DEVICE_STATE; // 设备管理状态
        this.detailFormItem.ip_address = row.IP_ADDRESS;  //IP地址
        this.detailFormItem.device_name = row.DEVICE_NAME;  // // 设备名称
        this.detailFormItem.group_device_id = row.GROUP_DEVICE_ID;  //  组内设备编号
        this.detailFormItem.group_id = row.GROUP_ID;  //  组编号
        this.detailFormItem.hall_id = row.HALL_ID;  //  站厅ID
        this.detailFormItem.device_unique_id = row.DEVICE_UNIQUE_ID;   //  设备序号
      },
      // 查询数据
      getData() {
        var _t = this;
        var station_id = _t.cookieMap.station_id;
        let str = 'station_id=' + station_id;
        let Base64 = require('js-base64').Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        var params = {
          device_name: _t.formItem.name,
          station_id: station_id,
          pageNum: _t.options.currentPage, // 当前页
          pageSize: _t.options.pageSize, // 每页显示条数
          token: keyToken
        };
        _t.$api.post('/tsGateWay/systemManager/queryDevice', params, function (res) {
          _t.$store.commit('setLoading', false);
          if (res.rtCode && res.rtCode === '18010') {
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
        this.detailFormItem.device_id = row.DEVICE_ID; // 设备编号
        this.detailFormItem.device_type = row.DEVICE_TYPE; // 设备类型
        this.detailFormItem.device_sub_type = row.DEVICE_SUB_TYPE; //  设备子类型
        this.detailFormItem.station_id = row.STATION_ID; //  所属车站
        this.detailFormItem.direction = row.DIRECTION;//   设备方向
        this.detailFormItem.y_position = row.Y_POSITION; //  纵向位置
        this.detailFormItem.x_position = row.X_POSITION; //横向位置
        this.detailFormItem.device_state = row.DEVICE_STATE; // 设备管理状态
        this.detailFormItem.ip_address = row.IP_ADDRESS;  //IP地址
        this.detailFormItem.device_name = row.DEVICE_NAME;  // // 设备名称
        this.detailFormItem.group_device_id = row.GROUP_DEVICE_ID;  //  组内设备编号
        this.detailFormItem.group_id = row.GROUP_ID;  //  组编号
        this.detailFormItem.hall_id = row.HALL_ID;  //  站厅ID
        this.detailFormItem.device_unique_id = row.DEVICE_UNIQUE_ID;   //  设备序号
      },
      // 删除
      deleteRole(row) {
        var _t = this;
        var device_ids = row.DEVICE_ID;
        _t.$confirm('是否确认删除操作?', '删除角色', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let str = 'device_id=' + device_ids.toString();
          let Base64 = require('js-base64').Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          var params = {
            device_id: device_ids, // id
            token: keyToken, // token
          };
          _t.$api.post('/tsGateWay/systemManager/delDevice', params, function (res) {
            if (res.rtCode && res.rtCode === '18009') {
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
      // 同步
      changeLimit() {
        var _t = this;
        _t.dialogAddSyn = true;
        var params = {};
        _t.$api.post('/gateway/device/compareDiff', params, function (res) {
          if (res.rtCode && res.rtCode === '18010') {
            _t.ticketTypeList = res.rtData.sys.concat(res.rtData.core);
          } else if (res.rtCode) {
            _t.alertDialogTip(_t, res.rtMessage);
          }
        })
      },
      // 同步保存
      synchronous() {
        var _t = this;
        if (_t.checkList.length !== 0) {
          _t.$api.post('/gateway/device/sync',_t.checkList, function (res) {
            if (res.rtCode && res.rtCode === '19010') {
              _t.resetRole();
              _t.alertDialogTip(_t, res.rtMessage);
            } else if (res.rtCode) {
              _t.alertDialogTip(_t, res.rtMessage);
              _t.resetRole();
            }
          })
        }else {
          _t.alertDialogTip(_t, '请选择一个选项');
        }

      },
      // 重置
      resetRole() {
        var _t = this;
        _t.isAdd = true;
        _t.dialogDetailVisible = false;
        _t.dialogAddVisible = false;
        _t.dialogAddVisible1 = false;
        _t.dialogAddSyn = false;
        _t.addEdit.id = ''; // id
        _t.addEdit.roleName = ''; // 名称
        _t.addEdit.note = ''; // 备注
        _t.errorTip.roleNameFlag = false;
        _t.addFormItem.device_id = "";
        _t.addFormItem.device_type = "";
        _t.addFormItem.device_sub_type = "";
        _t.addFormItem.device_unique_id = "";
        _t.addFormItem.hall_id = "";
        _t.addFormItem.group_id = "";
        _t.addFormItem.group_device_id = "";
        _t.addFormItem.ip_address = "";
        _t.addFormItem.device_name = "";
        _t.addFormItem.device_state = "";
        _t.addFormItem.x_position = "";
        _t.addFormItem.y_position = "";
        _t.addFormItem.direction = "";
        _t.addFormItem.station_id = "";

      },
      // 新增提交
      addRole() {
        var _t = this;
        // 校验角名称
        var user_id = _t.getCookie('USER_ID').toString();
        // 可以提交
        if (_t.addFormItem.device_id !== '' && _t.addFormItem.device_type !== '' &&
          _t.addFormItem.device_unique_id !== '' &&
          _t.addFormItem.hall_id !== '' &&
          _t.addFormItem.group_id !== '' &&
          _t.addFormItem.group_device_id !== '' &&
          _t.addFormItem.ip_address !== '' &&
          _t.addFormItem.device_name !== '' &&
          _t.addFormItem.device_state !== '' &&
          _t.addFormItem.x_position !== '' &&
          _t.addFormItem.y_position !== '' &&
          _t.addFormItem.direction !== '' &&
          _t.addFormItem.station_id !== ''
        ) {
          let str = 'userid=' + user_id
            + '&device_id=' + _t.addFormItem.device_id.toString()
            + '&device_type=' + _t.addFormItem.device_type.toString()
            + '&device_unique_id=' + _t.addFormItem.device_unique_id.toString()
            + '&hall_id=' + _t.addFormItem.hall_id.toString()
            + '&group_id=' + _t.addFormItem.group_id.toString()
            + '&group_device_id=' + _t.addFormItem.group_device_id.toString()
            + '&ip_address=' + _t.addFormItem.ip_address.toString()
            + '&device_name=' + _t.addFormItem.device_name.toString()
            + '&device_state=' + _t.addFormItem.device_state.toString()
            + '&x_position=' + _t.addFormItem.x_position.toString()
            + '&y_position=' + _t.addFormItem.y_position.toString()
            + '&direction=' + _t.addFormItem.direction.toString()
            + '&station_id=' + _t.addFormItem.station_id.toString();
          let Base64 = require('js-base64').Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          var params = {
            userid: user_id, //操作员ID
            device_id: _t.addFormItem.device_id.toString(), //  设备编号
            device_type: _t.addFormItem.device_type.toString(), // 设备类型
            device_unique_id: _t.addFormItem.device_unique_id.toString(), //  设备序号
            hall_id: _t.addFormItem.hall_id.toString(), //  站厅ID
            group_id: _t.addFormItem.group_id.toString(), //  组编号
            group_device_id: _t.addFormItem.group_device_id.toString(), //  组内设备编号
            ip_address: _t.addFormItem.ip_address.toString(), //IP地址
            device_name: _t.addFormItem.device_name.toString(), // 设备名称
            device_state: _t.addFormItem.device_state.toString(), // 设备管理状态01：在用；02：停用；03：移除
            x_position: _t.addFormItem.x_position.toString(), //横向位置
            y_position: _t.addFormItem.y_position.toString(), //  纵向位置
            direction: _t.addFormItem.direction.toString(), //   设备方向
            station_id: _t.addFormItem.station_id.toString(), //  所属车站
            token: keyToken
          };
          _t.$api.post('/tsGateWay/systemManager/addDevice', params, function (res) {
            if (res.rtCode && res.rtCode === '18043') {
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
          _t.alertDialogTip(_t, '必填参数不能为空!');
        }
      },
      // 修改提交
      editRole() {
        var _t = this;
        var userid = _t.cookieMap.user_id.toString();
        // 可以提交
        if (_t.detailFormItem.device_id !== '') {
          let str = 'device_id=' + _t.detailFormItem.device_id.toString();
          let Base64 = require('js-base64').Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          var params = {
            userid: userid, //操作员ID
            device_id: _t.detailFormItem.device_id.toString(), //  设备编号
            device_type: _t.detailFormItem.device_type.toString(), // 设备类型
            device_unique_id: _t.detailFormItem.device_unique_id.toString(), //  设备序号
            hall_id: _t.detailFormItem.hall_id.toString(), //  站厅ID
            group_id: _t.detailFormItem.group_id.toString(), //  组编号
            group_device_id: _t.detailFormItem.group_device_id.toString(), //  组内设备编号
            ip_address: _t.detailFormItem.ip_address.toString(), //IP地址
            device_name: _t.detailFormItem.device_name.toString(), // 设备名称
            device_state: _t.detailFormItem.device_state.toString(), // 设备管理状态01：在用；02：停用；03：移除
            x_position: _t.detailFormItem.x_position.toString(), //横向位置
            y_position: _t.detailFormItem.y_position.toString(), //  纵向位置
            direction: _t.detailFormItem.direction.toString(), //   设备方向
            station_id: _t.detailFormItem.station_id.toString(), //  所属车站
            token: keyToken, // token
          };
          _t.$api.post('/tsGateWay/systemManager/editDevice', params, function (res) {
            if (res.rtCode && res.rtCode === '18011') {
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
          if (item.MENU_ID === "MENU20191012163923PtqWkjBgLvqUcP") {
            _t.limitBtn.query = true;
          }
          // 新增
          if (item.MENU_ID === 'MENU20191022101156KRopIhFFQujyaj') {
            _t.limitBtn.create = true;
          }
          // 删除
          if (item.MENU_ID === "MENU20191012164045NFhoGHfEgwlMLU") {
            _t.limitBtn.delete = true;
          }
          // 修改
          if (item.MENU_ID === "MENU20191012164018LKGlGKCueoiGLy") {
            _t.limitBtn.changeRole = true;
          }
          // 同步
          if (item.MENU_ID === "MENU20191012163958pVBMvaDMaoLhwm") {
            _t.limitBtn.changeLimit = true;
          }
          // 详情
          if (item.MENU_ID === "MENU20191012163936peXWoaEAICjiDD") {
            _t.limitBtn.detils = true;
          }
        });
      }
    }
  }
</script>

<style scoped>
  .flagStyle:after{
    content: '+';
    color: red;
    font-size: 20px;
    position: absolute;
  }
  .text {
    margin-bottom: 10px;
    color: #cccccc;
  }
  .text_d {
    color: red;
  }
  .text_sapn {
    margin-right: 10px;
  }
  .flagStyles:after{
    content: '-';
    font-size: 20px;
    color: red;
    position: absolute;
  }
  .treeBox {
    max-height: 500px;
    overflow-y: auto;
  }
</style>
