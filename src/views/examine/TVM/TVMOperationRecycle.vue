<template>
  <!--回收-->
  <Box>
    <!--基本信息-->
    <p class="title">基本信息</p>
    <div class="formBox-top">
      <el-form inline :model="formItem">
        <el-form-item class="marBottom15" label="线路：">
          <el-select
            v-model="formItem.lines" disabled>
            <el-option
              v-for="(item,index) in linesList"
              :key="index"
              :label="item.LINE_LOCATION_NAME"
              :value="item.LINE_LOCATION_NUMBER.toString()"/>
          </el-select>
        </el-form-item>
        <el-form-item class="marBottom15" label="车站：">
          <el-select
            v-model="formItem.station" disabled>
            <el-option
              v-for="(item,index) in stationList"
              :key="index"
              :label="item.STATION_LOCATION_NAME"
              :value="item.LOCATION_NUMBER.toString()"/>
          </el-select>
        </el-form-item>
        <el-form-item class="marBottom15" label="操作员ID：">
          <el-select v-model="formItem.operationId" disabled>
            <el-option
              v-for="(item,index) in operatorIdList"
              :key="index"
              :label="item.USERNAME + '-' + item.USERID"
              :value="item.USERID.toString()"/>
          </el-select>
        </el-form-item>
        <el-form-item class="marBottom15" label="操作类型：">
          <el-select v-model="formItem.operate_type" disabled>
            <el-option
              v-for="(item,index) in statusList"
              :key="index"
              :label="item.NAME"
              :value="item.VALUE"/>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <!--回收-->
    <div>
      <el-form :model="recycleFormItem" inline>
        <!--认证信息-->
        <p class="title">认证信息</p>
        <div class="formBox-top">
          <el-form-item class="marBottom20 star" label="认证ID：">
            <el-input
              maxlength="6"
              class="width200"
              @blur="blurInput(recycleFormItem,'userFlag',recycleFormItem.operatorUser)"
              v-model="recycleFormItem.operatorUser"/>
            <span class="isNotNull" v-if="recycleFormItem.userFlag">必填项不能为空</span>
          </el-form-item>
          <el-form-item class="marBottom20 star" label="密码：">
            <el-input
              maxlength="6"
              class="width200"
              @blur="blurInput(recycleFormItem,'passwordFlag',recycleFormItem.operatorPassword)"
              v-model="recycleFormItem.operatorPassword"
              type="password"/>
            <span class="isNotNull" v-if="recycleFormItem.passwordFlag">必填项不能为空</span>
          </el-form-item>
          <el-form-item class="marBottom20">
            <el-button type="primary" @click="getRecycleData">确认</el-button>
          </el-form-item>
        </div>
        <div v-if="recycleFormItem.showModule">
          <el-row :gutter="100">
            <el-col :span="12">
              <!--装机信息-->
              <p class="title">装机信息</p>
              <el-table :data="recycleTableForLading" border stripe class="marBottom10">
                <el-table-column prop="DEVICE_ID" label="设备编号" header-align="center" align="center"/>
                <el-table-column prop="DEVICE_NAME" label="设备名称" header-align="center" align="center"/>
                <el-table-column prop="MONEY" label="装机金额(元)" header-align="center" align="center"/>
                <el-table-column prop="TICKET_YOUXIAO" label="装票数量(张)" header-align="center" align="center"/>
              </el-table>
            </el-col>
            <el-col :span="12">
              <!--补充信息-->
              <p class="title">补充信息</p>
              <el-table :data="recycleTableForSupplement" border stripe class="marBottom10">
                <el-table-column prop="DEVICE_ID" label="设备编号" header-align="center" align="center"/>
                <el-table-column prop="DEVICE_NAME" label="设备名称" header-align="center" align="center"/>
                <el-table-column prop="MONEY" label="补充金额(元)" header-align="center" align="center"/>
                <el-table-column prop="TICKET_YOUXIAO" label="补票数量(张)" header-align="center" align="center"/>
              </el-table>
            </el-col>
          </el-row>
          <!--清点信息-->
          <p class="title">清点信息</p>
          <el-table :data="recycleTableForMake" border stripe class="marBottom10">
            <el-table-column prop="DEVICE_ID" label="设备编号" header-align="center" align="center"/>
            <el-table-column prop="DEVICE_NAME" label="设备名称" header-align="center" align="center"/>
            <el-table-column prop="MONEY" label="清点金额(元)" header-align="center" align="center"/>
            <el-table-column prop="TICKET_YOUXIAO" label="清点单程票(有效)数量(张)" header-align="center" align="center"/>
            <el-table-column prop="TICKET_WUXIAO" label="清点单程票(无效)数量(张)" header-align="center" align="center"/>
          </el-table>
          <!--回收信息-->
          <p class="title">回收信息</p>
          <el-table :data="recycleTableForRecycle" border stripe class="marBottom10">
            <el-table-column prop="device_name" label="设备名称" header-align="center" align="center"/>
            <el-table-column prop="MONEY" label="已回收金额(元)" header-align="center" align="center"/>
            <el-table-column prop="TICKET_YOUXIAO" label="已回收单程票(有效)" header-align="center" align="center"/>
            <el-table-column prop="TICKET_WUXIAO" label="已回收单程票(无效)" header-align="center" align="center"/>
            <el-table-column label="回收金额(元)" header-align="center" align="center">
              <template slot-scope="scope">
                <el-input  maxlength="6" placeholder="0" v-model="scope.row.money"/>
              </template>
            </el-table-column>
            <el-table-column label="回收单程票(有效)" header-align="center" align="center">
              <template slot-scope="scope">
                <el-input
                  placeholder="0"
                  maxlength="6"
                  oninput="value=value.replace(/[^\d]/g,'')"
                  v-model="scope.row.ticket_youxiao"/>
              </template>
            </el-table-column>
            <el-table-column label="回收单程票(无效)" header-align="center" align="center">
              <template slot-scope="scope">
                <el-input
                  maxlength="6"
                  placeholder="0"
                  oninput="value=value.replace(/[^\d]/g,'')"
                  v-model="scope.row.ticket_wuxiao"/>
              </template>
            </el-table-column>
            <el-table-column label="操作" header-align="center" align="center">
              <template slot-scope="scope">
                <el-button type="danger" @click="deleteLading(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-form-item>
            <el-button type="primary" v-btn-control :disabled="disabledShow"  @click="addRecycleData">提交</el-button>
            <el-button type="warning" @click="resetData">取消</el-button>
          </el-form-item>
        </div>
      </el-form>
    </div>
    <!--回收失败错误信息弹出层-->
    <el-dialog
      v-dialogDrag
      append-to-body
      :fullscreen="isScreen"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="resetDetail"
      :visible.sync="dialogDetailVisible">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">温馨提示</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreen = !isScreen"></i>
      </div>
      <el-table :data="detailTable" border stripe class="marBottom20">
        <el-table-column prop="recoverRecord" label="错误信息"/>
      </el-table>
      <div slot="footer">
        <el-button @click="resetDetail">取消</el-button>
        <el-button type="primary" v-btn-control  @click="resetDetail">确定</el-button>
      </div>
    </el-dialog>
  </Box>
</template>

<script>
  import Box from "../../../components/Box";

  export default {
    name: "TVMOperationRecycle",
    components: {Box},
    data() {
      return {
        disabledShow: this.$store.state.disabledShow, // 提交禁选
        isScreen: false, // 错误提示放大缩小
        // 操作类型
        statusList: [],
        linesListArr: [],
        // 线路集合
        linesList: [],
        // 车站集合
        stationList: [],

        // 操作员id集合
        operatorIdList: [],
        // 基本信息表单
        formItem: {
          lines: '', // 线路
          station: '', //车站
          operationId: '', // 操作员id
          operate_type: '03', // 操作类型
        },
        // 回收表单
        recycleFormItem: {
          operatorUser: '', // 认证id
          operatorPassword: '', // 密码
          userFlag: false, // 操作员标识
          passwordFlag: false, // 密码标识
          showModule: false, // 控制表格区域显示隐藏
        },
        // 从cookie中获取
        cookieMap: {
          location_number: this.getCookie('LOCATION_NUMBER'), // 位置编号
          user_id: this.getCookie('USER_ID'), // 操作员ID
          role: this.getCookie('USER_TYPE'), // 用户角色
        },
        content: 0,
        recycleTableForLading: [], // 回收装机信息
        recycleTableForSupplement: [], // 回收补充信息
        recycleTableForMake: [], // 回收清点信息
        recycleTableForRecycle: [], // 回收回收信息
        dialogDetailVisible: false, // 回收错误信息蒙版
        detailTable: [], // 回收错误信息表格
      }

    },
    methods: {
      // 重置错误信息弹出层
      resetDetail() {
        var _t = this;
        _t.dialogDetailVisible = false;
        _t.detailTable = [];
      },
      // 删除回收信息数据
      deleteLading (index) {
        this.recycleTableForRecycle.splice(index, 1)
      },
      // 获取单据类型字典
      getStatusData() {
        var _t = this;
        let str = "guid=GUID000722201906191628";
        let Base64 = require("js-base64").Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        var params = {
          guid: "GUID000722201906191628",
          token: keyToken
        };
        _t.$api.post("/tsGateWay/ticketUtility/queryDict", params, function (res) {
          // 查询成功
          if (res.rtCode && res.rtCode === "14010") {
            _t.statusList = res.rtData === null ? [] : res.rtData;
          }
        });
      },
      // 查询线路及车站
      getLinesAndStation() {
        var _t = this;
        var params = {};
        _t.$api.post("/tsGateWay/ticketUtility/locationCascadeQuery", params, function (res) {
          // 查到线路信息
          if (res.rtCode && res.rtCode === "14007") {
            var linesStationArr = res.rtData === null ? [] : res.rtData;
            // 处理线路/车站/操作员数据
            _t.dealWithLinesAndStation(linesStationArr);
          } else if (res.rtCode) {
            _t.alertDialogTip(_t, res.rtMessage);
          }
        });
      },
      // 处理线路及车站首次加载数据问题
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
          var operationArr = new Array(); // 操作员id集合
          var USERID = ""; // 选中的操作员
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
                            operationArr = e.userList;
                            operationArr.forEach(data => {
                              if (data.USERID === _t.getCookie("USER_ID")) {
                                USERID = data.USERID;
                              }
                            });
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
            _t.operatorIdList = operationArr;
            // 选中的线路
            if (LINE_LOCATION_NUMBER !== "") {
              _t.formItem.lines = LINE_LOCATION_NUMBER;
            }
            // 选中的操作员
            if (USERID !== "") {
              _t.formItem.operationId = USERID;
            }
            // 选中的车站
            if (LOCATION_NUMBER !== "") {
              _t.formItem.station = LOCATION_NUMBER;
            }
          }
        }
      },
      // 回收查询表格信息
      getRecycleData() {
        var _t = this;
        // location_number 不为空
        if (_t.formItem.station !== '') {
          // 校验认证操作员
          _t.blurInput(_t.recycleFormItem, 'userFlag', _t.recycleFormItem.operatorUser);
          // 校验密码
          _t.blurInput(_t.recycleFormItem, 'passwordFlag', _t.recycleFormItem.operatorPassword);
          // 可以提交
          if (_t.recycleFormItem.userFlag === false && _t.recycleFormItem.passwordFlag === false) {
            _t.getRecycle('00'); // 装机
            _t.getRecycle('01'); // 补充
            _t.getRecycle('02'); // 清点
            _t.getRecycle('03'); // 回收
          }
        }
      },
      // 获取回收信息
      getRecycle(type) {
        var _t = this;
        let str = "location_number=" + _t.formItem.station
          + "&operate_type=" + type
          + "&tvm_operator_id=" + _t.recycleFormItem.operatorUser.trim()
          + "&password=" + _t.recycleFormItem.operatorPassword.trim();
        let Base64 = require("js-base64").Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        var params = {
          flag: '1',
          operate_flag: '0',
          location_number: _t.formItem.station,
          operate_type: type, // 00 装机 01 补充 02 清点 03 回收
          tvm_operator_id: _t.recycleFormItem.operatorUser.trim(),
          tvm_creator_id: _t.cookieMap.user_id.toString(),
          password: _t.recycleFormItem.operatorPassword.trim(),
          token: keyToken
        };
        _t.$api.post('/tsGateWay/tvmManager/getTvmOperationInfo', params, function (res) {
          if (res.rtCode && res.rtCode === '13010' && type === '00') {
            // 装机
            _t.recycleTableForLading = res.rtData === null ? [] : res.rtData;
          } else if (res.rtCode && res.rtCode === '13011' && type === '01') {
            // 补充
            _t.recycleTableForSupplement = res.rtData === null ? [] : res.rtData;
          } else if (res.rtCode && res.rtCode === '13012' && type === '02') {
            // 清点
            _t.recycleTableForMake = res.rtData === null ? [] : res.rtData;
          } else if (res.rtCode && res.rtCode === '13012' && type === '03') {
            _t.recycleFormItem.showModule = true; // 显示表格信息
            // 回收
            var tableData = new Array();
            var resData = res.rtData === null ? [] : res.rtData;
            resData.forEach((item) => {
              var obj = new Object();
              obj.device_id = item.DEVICE_ID; // 设备id
              obj.device_name = item.DEVICE_NAME; // 设备名称
              obj.MONEY = item.MONEY;// 已回收金额
              obj.TICKET_YOUXIAO = item.TICKET_YOUXIAO;// 已有效数量
              obj.TICKET_WUXIAO = item.TICKET_WUXIAO;// 已无效数量
              obj.money = '0'; // 回收金额
              obj.ticket_wuxiao = '0'; // 无效数量
              obj.ticket_youxiao = '0'; // 有效数量
              obj.comment_info = ''; // 备注
              tableData.push(obj);
            });
            _t.recycleTableForRecycle = tableData;
          } else if (res.rtCode) {

            if (res.rtCode == '24001') {
              _t.content++
               if (_t.content == 4) {
                 _t.alertDialogTip(_t, res.rtMessage);
                 _t.content = 0;
               }
            }else {
              _t.alertDialogTip(_t, res.rtMessage);
            }
          }
        });
      },
      // 提交回收信息
      addRecycleData() {
        var _t = this;
        _t.$store.commit('setShow', true);
        if (_t.formItem.station !== '' && _t.formItem.operationId !== '') {
          if (_t.recycleFormItem.showModule) {
            // 校验认证操作员
            _t.blurInput(_t.recycleFormItem, 'userFlag', _t.recycleFormItem.operatorUser);
            // 校验密码
            _t.blurInput(_t.recycleFormItem, 'passwordFlag', _t.recycleFormItem.operatorPassword);
            // 校验表格
            if (_t.recycleTableForRecycle.length !== 0) {
              // 表格数据条数不为空 校验金额和数量
              var errorNum = 0;
              var regMoney = _t.$config.isMoneyNumber();
              var regNumber = _t.$config.isNumber();
              _t.recycleTableForRecycle.forEach((item) => {
                // 校验回收金额
                if (item.money.trim() === '' || regMoney.test(item.money.trim()) === false) {
                  errorNum++;
                }
                // 校验有效票数量
                if (item.ticket_youxiao.trim() === '' || regNumber.test(item.ticket_youxiao.trim()) === false) {
                  errorNum++;
                }
                // 校验无效票数量
                if (item.ticket_wuxiao.trim() === '' || regNumber.test(item.ticket_wuxiao.trim()) === false) {
                  errorNum++;
                }
              });
              if (errorNum === 0) {
                // 错误数量为0 可以提交
                if (_t.recycleFormItem.userFlag === false
                  && _t.recycleFormItem.passwordFlag === false) {
                  let str = "location_number=" + _t.formItem.station
                    + "&operate_type=" + "03"
                    + "&tvm_operator_id=" + _t.recycleFormItem.operatorUser.trim()
                    + "&password=" + _t.recycleFormItem.operatorPassword.trim()
                    + "&tvm_creator_id=" + _t.formItem.operationId;
                  let Base64 = require("js-base64").Base64;
                  let keyToken = _t.$md5(Base64.encode(str));
                  var params = {
                    location_number: _t.formItem.station,
                    operate_type: "03", // 03 回收
                    tvm_operator_id: _t.recycleFormItem.operatorUser.trim(),
                    password: _t.recycleFormItem.operatorPassword.trim(),
                    tvm_creator_id: _t.formItem.operationId,
                    deviceList: _t.recycleTableForRecycle,
                    token: keyToken
                  };
                  _t.$api.post('/tsGateWay/tvmManager/tvmRecover', params, function (res) {
                    if (res.rtCode && res.rtCode === '13005') {
                      _t.$alert(res.rtMessage, "温馨提示", {
                        confirmButtonText: "确定",
                        cancelButtonText: "取消"
                      }).then(() => {
                        _t.$store.commit('setShow', false);
                        _t.$store.commit('delete_tabs', _t.$route.name);
                        _t.$router.push({name: 'TVMOperation'});
                      }).catch(() => {
                        _t.$store.commit('setShow', false);
                        _t.$router.push({name: 'TVMOperation'});
                      });
                    } else if (res.rtCode === '23005') {
                      _t.detailTable = res.rtData === null ? [] : res.rtData;
                      _t.dialogDetailVisible = true;
                      _t.$store.commit('setShow', false);
                    } else if (res.rtCode) {
                      _t.$store.commit('setShow', false);
                      _t.alertDialogTip(_t, res.rtMessage);
                    }
                  });
                }
              } else {
                // 错误数量不为0 提示
                _t.$store.commit('setShow', false);
                _t.alertDialogTip(_t, '请检查回收金额、有效数量及无效数量是否为空或者格式是否正确!');
              }
            } else {
              // 表格数据为空
              _t.$store.commit('setShow', false);
              _t.alertDialogTip(_t, '表格数据条数不能为空!');
            }
          } else {
            _t.$store.commit('setShow', false);
            _t.alertDialogTip(_t, '请先查询回收信息记录!');
          }
        } else {
          _t.$store.commit('setShow', false);
          _t.alertDialogTip(_t, '车站及操作员ID不能为空!');
        }
      },
      // 取消按钮
      resetData() {
        var _t = this;
        _t.$router.push({name: 'TVMOperation'});
      },
      // 失去焦点时校验
      blurInput(item, flag, val) {
        item[flag] = val.trim() === '' ? true : false;
      },
    },
    created() {
      var _t = this;
      var roleName = _t.getCookie('USER_TYPE');
      var locationNum = _t.getCookie('LOCATION_NUMBER');
      if (roleName !== null && roleName !== 'null' && locationNum !== null && locationNum !== 'null') {
        // 本页面业务逻辑
        _t.getStatusData();
        _t.getLinesAndStation();
      }
    }
  }
</script>

<style scoped>

</style>
