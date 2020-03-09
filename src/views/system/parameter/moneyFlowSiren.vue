<template>
  <Box>
    <div class="formBox-top paddingBottom15">
      <el-form :model="formItem" inline label-width="110px">
        <el-form-item label="线路：" class="marBottom7">
          <el-select
            clearable
            :disabled="disabledBtn.createDis"
            class="width200"
            @change="changeLines(formItem.lines)"
            v-model="formItem.lines">
            <el-option
              v-for="(item,index) in linesList"
              :key="index"
              :label="item.LINE_LOCATION_NAME"
              :value="item.LINE_LOCATION_NUMBER.toString()"/>
          </el-select>
        </el-form-item>
        <el-form-item label="车站：" class="marBottom7">
          <el-select
            clearable
            :disabled="disabledBtn.createDis"
            class="width200"
            v-model="formItem.station">
            <el-option
              v-for="(item,index) in stationList"
              :key="index"
              :label="item.STATION_LOCATION_NAME"
              :value="item.LOCATION_NUMBER.toString()"/>
          </el-select>
        </el-form-item>
      </el-form>
      <br>
      <div class="fr">
        <el-button type="primary" v-if="limitBtn.query" @click="getData">查询</el-button>
        <el-button type="warning" @click="resetFormItem">重置</el-button>
      </div>
    </div>
    <div class="tableWp">
      <el-table :data="tableData" stripe border ref="table">
        <el-table-column prop="GUID" label="记录编号"/>
        <el-table-column prop="STOCK_TYPE_NAME" label="类型名称"/>
        <el-table-column prop="AMOUNT" label="数量"/>
        <el-table-column prop="LOW_SAFETY_VALUE" label="最低库存安全阀值"/>
        <el-table-column prop="HIGH_SAFETY_VALUE" label="最高库存安全阀值"/>
        <el-table-column prop="EMPTY_SAFETY_VALUE" label="库存将空阀值"/>
        <el-table-column prop="FULL_SAFETY_VALUE" label="库存将满阀值"/>
        <el-table-column label="操作" header-align="center" align="center">
          <template slot-scope="scope">
            <el-button type="primary" v-if="limitBtn.changeRole" @click="changeRoleBtn(scope.row)">修改</el-button>
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
    <!--现金库存报警参数-->
    <el-dialog
      append-to-body
      :fullscreen="isScreenCreate"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="resetRole"
      :visible.sync="dialogAddVisible">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">现金库存报警参数/修改</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenCreate = !isScreenCreate"></i>
      </div>
      <el-form :model="detailFormItem" ref="detailFormItem" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="记录编号：" class="star marBottom7">
              <el-input v-model="detailFormItem.guid"></el-input>
            </el-form-item>
            <el-form-item label="最低库存安全阀值：" class=" marBottom7">
              <el-input v-model="detailFormItem.low_safety_value"></el-input>
            </el-form-item>
            <el-form-item label="最高库存安全阀值：" class=" marBottom7">
              <el-input v-model="detailFormItem.high_safety_value"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库存将空阀值：" class=" marBottom7">
              <el-input v-model="detailFormItem.empty_safety_value"></el-input>
            </el-form-item>
            <el-form-item label="库存将满阀值：" class=" marBottom7">
              <el-input v-model="detailFormItem.full_safety_value"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button @click="resetRole">取消</el-button>
        <el-button type="primary" v-btn-control @click="editRole">保存</el-button>
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
        stationList: [], // 车站集合
        // 线路集合
        linesList: [],
        isScreenCreate: false, // 新增编辑放大缩小
        isScreenLimit: false, // 权限放大缩小
        // 表格数据
        tableData: [],
        // 启用禁用
        disabledBtn: {
          create: true, // 创建
          createDis: true, // 线路车站
        },
        // 角色名称
        formItem: {
          lines:'', // 线路
          name: '', // 角色名称
          usernameList: '',// 下拉框名称
          station: '', // 车站
        },
        usernameList: [],//角色名称下拉数组
        // 角色分页
        options: {
          total: 0, // 总条数
          currentPage: 1, // 当前页码
          pageSize: 10, // 显示条数
        },
        linesListArr:[],
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
        detailFormItem: {
          guid:"TBMSA20190701124820kgfn4pbk64i68", //记录编号
          low_safety_value:"100", //最低库存安全阀值
          high_safety_value:"60000", //最高库存安全阀值
          empty_safety_value:"1", //库存将空阀值
          full_safety_value:"70000", // 库存将满阀值
        },
        // 校验表单
        errorTip: {
          roleNameFlag: false, // 校验角色名称
          note: false // 备注
        },

        // 按钮权限
        limitBtn: {
          query: false, // 查询
          changeRole: false, // 修改
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
      // 查询数据
      getData() {
        var _t = this;
        var location_number = _t.formItem.station?_t.formItem.station.toString(): _t.formItem.lines.toString();
        let str = 'location_number=' + location_number;
        let Base64 = require('js-base64').Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        var params = {
          pageNum: 1,
          pageSize: 10,
          location_number: location_number,
          flag: '0',
          token:keyToken
        };
        _t.$api.post('/tsGateWay/systemManager/queryAlarmParm', params, function (res) {
          _t.$store.commit('setLoading', false);
          if (res.rtCode && res.rtCode === '18053') {
            _t.tableData = res.rtData === null ? [] : res.rtData;
            _t.options.total = res.totalCount ? res.totalCount : 0;
          } else if (res.rtCode) {
            _t.alertDialogTip(_t, res.rtMessage);
          }
        });
      },
      // 修改
      changeRoleBtn(row) {
        var _t = this;
        _t.isAdd = false;
        _t.dialogAddVisible = true;
        this.detailFormItem.guid = row.GUID; // 记录编号
        this.detailFormItem.low_safety_value = row.LOW_SAFETY_VALUE; // 最低库存安全阀值
        this.detailFormItem.high_safety_value = row.HIGH_SAFETY_VALUE; //最高库存安全阀值
        this.detailFormItem.empty_safety_value = row.EMPTY_SAFETY_VALUE; //库存将空阀值
        this.detailFormItem.full_safety_value = row.FULL_SAFETY_VALUE; // 库存将满阀值
      },
      // 重置
      resetRole() {
        var _t = this;
        _t.isAdd = true;
        _t.dialogDetailVisible = false;
        _t.dialogAddVisible = false;
        _t.dialogAddVisible1 = false;
        _t.errorTip.roleNameFlag = false;
      },
      // 修改提交
      editRole() {
        var _t = this;
        // 可以提交
        if (_t.detailFormItem.guid !== '') {
          let str = 'guid=' + _t.detailFormItem.guid.toString();
          let Base64 = require('js-base64').Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          var params = {
            guid: _t.detailFormItem.guid.toString(), //记录编号
            low_safety_value:_t.detailFormItem.low_safety_value.toString(), //最低库存安全阀值
            high_safety_value:_t.detailFormItem.high_safety_value.toString(), //最高库存安全阀值
            empty_safety_value:_t.detailFormItem.empty_safety_value.toString(), //库存将空阀值
            full_safety_value:_t.detailFormItem.full_safety_value.toString(), // 库存将满阀值
            token: keyToken, // token
          };
          _t.$api.post('/tsGateWay/systemManager/updateMoneyAlarmParam', params, function (res) {
            if (res.rtCode && res.rtCode === '18055') {
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
      // 查询线路及车站
      getLinesAndStation() {
        var _t = this;
        _t.$api.post('/tsGateWay/ticketUtility/locationCascadeQuery', {}, function (res) {
          // 查到线路信息
          if (res.rtCode && res.rtCode === '14007') {
            var linesStationArr = res.rtData === null ? [] : res.rtData;
            // 处理线路/车站/操作员数据
            _t.dealWithLinesAndStation(linesStationArr);
          } else if (res.rtCode) {
            _t.alertDialogTip(_t, res.rtMessage);
          }
        });
      },
      // 处理线路及车站首次加载数据问题
      dealWithLinesAndStation(linesStationArr) {
        var _t = this;
        // 判断角色
        var role = _t.getCookie("USER_TYPE");
        var location = _t.getCookie("LOCATION_NUMBER").toString();
        // 角色和location都不为空
        if (
          role !== null &&
          role !== "null" &&
          location !== null &&
          location !== "null"
        ) {
          // 车站角色
          var linesArr = new Array(); // 线路集合
          var stationArr = new Array(); // 车站集合
          var LINE_LOCATION_NUMBER = ""; // 选中的线路
          var LOCATION_NUMBER = ""; // 选中的车站
          if (location !== '') {
            let lines = linesStationArr [0];
            linesStationArr.forEach(item => {
              if (item.LINE_LOCATION_NUMBER == location) {
                linesArr.push(item);
                item.mlcList.forEach(val => {
                  _t.linesListArr.push(val);
                  linesArr.push(val);
                  val.lineList.forEach(e => {
                    linesArr.push(e);
                    _t.linesListArr.push(e);
                  });
                  LINE_LOCATION_NUMBER = location;
                });
              } else {
                item.mlcList.forEach(lts => {
                  if (lts.LINE_LOCATION_NUMBER == location) {
                    linesArr.push(lts);
                    lts.lineList.forEach(vals => {
                      linesArr.push(vals);
                      _t.linesListArr.push(vals);
                      LINE_LOCATION_NUMBER = location;
                    });
                  } else {
                    if (lts.lineList && lts.lineList !== null) {
                      // 遍历线路
                      lts.lineList.forEach(valStr => {
                        valStr.stationList.forEach(e => {
                          if (e.LOCATION_NUMBER == location) {
                            // 线路选中值
                            LINE_LOCATION_NUMBER = valStr.LINE_LOCATION_NUMBER.toString();
                            // 车站选中值
                            LOCATION_NUMBER = location;
                            // 线路下拉框
                            linesArr.push(valStr);
                            // 找到了对应的车站
                            stationArr.push(e);
                          }
                        });
                      });
                    }
                  }
                })
              }
              // 线路存在车站

            });
            _t.linesList = linesArr;
            _t.stationList = stationArr;
            // 选中的线路
            if (LINE_LOCATION_NUMBER !== "") {
              _t.formItem.lines = LINE_LOCATION_NUMBER;
            }
            // 选中的车站
            if (LOCATION_NUMBER !== "") {
              _t.formItem.station = LOCATION_NUMBER;
            }
          }
        }
        // 线路接口调完之后调用查询接口
        _t.getData();
      },
      //  改变线路
      changeLines(val) {
        var _t = this;
        if (val !== '') {
          _t.linesList.forEach((item) => {
            // 找到对应线路
            if (item.LINE_LOCATION_NUMBER.toString() === val) {
              // 存在对应的车站集合
              if (item.stationList !== undefined && item.stationList !== null) {
                // 车站下拉框赋值
                _t.stationList = item.stationList;
              } else {
                // 车站下拉框置空
                _t.stationList = [];
              }
              // 选中车站置空
              _t.formItem.station = '';
            }
          });
        } else {
          // 选中线路为空
          _t.stationList = [];
          _t.formItem.station = '';
        }
      },
    },
    created() {
      var _t = this;
      if ( _t.getCookie('LOCATION_TYPE_ID') !== '09') {
        _t.disabledBtn.createDis = false;
      }
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
            _t.getLinesAndStation();
          }
        });
        // 判断权限按钮
        limitBtnArr.forEach((item) => {
          // 查询
          if (item.MENU_ID === "MENU20191022133245oAYYMoADzbhenY") {
            _t.limitBtn.query = true;
          }
          // 修改
          if (item.MENU_ID === "MENU20191022133150HjpREdhsOGzSik") {
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
</style>
