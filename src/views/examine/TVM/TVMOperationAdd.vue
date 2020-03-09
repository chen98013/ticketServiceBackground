<template>
  <!--装机-->
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
    <!--装机-->
    <div>
      <el-form :model="ladingFormItem" inline>
        <!--装机信息-->
        <p class="title">装机信息</p>
        <el-table :data="ladingTableData" border stripe class="marBottom10">
          <el-table-column prop="device_name" label="设备名称" header-align="center" align="center"/>
          <el-table-column label="装机金额(元)" header-align="center" align="center">
            <template slot-scope="scope">
              <el-input  oninput="value=value.replace(/[^\d]/g,'')" maxlength="6" placeholder="0" v-model="scope.row.money"/>
            </template>
          </el-table-column>
          <el-table-column label="装票数量(张)" header-align="center" align="center">
            <template slot-scope="scope">
              <el-input
                maxlength="6"
                placeholder="0"
                oninput="value=value.replace(/[^\d]/g,'')"
                v-model="scope.row.ticket"/>
            </template>
          </el-table-column>
          <el-table-column label="备注" header-align="center" align="center">
            <template slot-scope="scope">
              <el-input maxlength="25" v-model="scope.row.comment_info"/>
            </template>
          </el-table-column>
          <el-table-column label="操作" header-align="center" align="center">
            <template slot-scope="scope">
              <el-button type="danger" @click="deleteLading(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!--认证信息-->
        <p class="title">认证信息</p>
        <div class="formBox-top">
          <el-form-item class="marBottom20 star" label="认证ID：">
            <el-input
              maxlength="6"
              @blur="blurInput(ladingFormItem,'userFlag',ladingFormItem.operatorUser)"
              v-model="ladingFormItem.operatorUser"
              class="width200"/>
            <span class="isNotNull" v-if="ladingFormItem.userFlag">必填项不能为空</span>
          </el-form-item>
          <el-form-item class="marBottom20 star" label="密码：">
            <el-input
              maxlength="6"
              @blur="blurInput(ladingFormItem,'passwordFlag',ladingFormItem.operatorPassword)"
              v-model="ladingFormItem.operatorPassword"
              class="width200"
              type="password"/>
            <span class="isNotNull" v-if="ladingFormItem.passwordFlag">必填项不能为空</span>
          </el-form-item>
        </div>
        <el-form-item>
          <el-button type="primary" v-btn-control :disabled="disabledShow" @click="addLadingBtn">提交</el-button>
          <el-button type="warning" @click="resetData">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </Box>
</template>

<script>
  import Box from "../../../components/Box";

  export default {
    name: "TVMOperationAdd",
    components: {Box},
    data() {
      return {
        disabledShow: this.$store.state.disabledShow, // 提交禁选
        // 操作类型
        statusList: [],
        // 线路集合
        linesList: [],
        // 车站集合
        stationList: [],
        // 操作员id集合
        operatorIdList: [],
        queryOneWayTicket: [],
        // 基本信息表单
        formItem: {
          lines: '', // 线路
          station: '', //车站
          operationId: '', // 操作员id
          operate_type: '00', // 操作类型
        },
        allMoney: '', // 库存金额
        linesListArr:[], // 调入调出位置
        // 装机表单
        ladingFormItem: {
          operatorUser: '', // 认证id
          operatorPassword: '', // 密码
          userFlag: false, // 操作员标识
          passwordFlag: false, // 密码标识
        },
        // 装机表格
        ladingTableData: [],
      }
    },
    methods: {
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
        // 调取所有未装机的设备
        _t.getLadingData();
      },

      // 查询装机表格信息(未装机的)
      getLadingData() {
        var _t = this;
        var location_number = _t.formItem.station?_t.formItem.station:_t.getCookie('LOCATION_NUMBER');
        if (location_number !== null && location_number !== 'null') {
          let str = "location_number=" + location_number;
          let Base64 = require("js-base64").Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          var params = {
            location_number: location_number, // 位置编码
            token: keyToken, // token
            pageNum: 1, // 当前页
            pageSize: 100, // 每页显示条数
          };
          _t.$api.post('/tsGateWay/tvmManager/getTvmInfo', params, function (res) {
            if (res.rtCode && res.rtCode === '13001') {
              var tableData = new Array();
              var resData = res.rtData === null ? [] : res.rtData;
              resData.forEach((item) => {
                var obj = new Object();
                obj.device_id = item.DEVICE_ID; // 设备id
                obj.device_name = item.DEVICE_NAME; // 设备名称
                obj.money = ''; // 装机金额
                obj.ticket = ''; // 装票数量
                obj.comment_info = ''; // 备注
                tableData.push(obj);
              });
              _t.ladingTableData = tableData;
            } else if (res.rtCode) {
              _t.alertDialogTip(_t, res.rtMessage);
            }
          });
        }
      },
      // 装机提交按钮
      addLadingBtn() {
        var _t = this;
        _t.$store.commit('setShow', true);
        if (_t.formItem.station !== '' && _t.formItem.operationId !== '') {
          // 校验认证操作员
          _t.blurInput(_t.ladingFormItem, 'userFlag', _t.ladingFormItem.operatorUser);
          // 校验密码
          _t.blurInput(_t.ladingFormItem, 'passwordFlag', _t.ladingFormItem.operatorPassword);
          // 判断表格不能为空
          if (_t.ladingTableData.length !== 0) {
            // 表格数据条数不为空
            var errorNum = 0;
            var regMoney = _t.$config.isMoneyNumber();
            var regNumber = _t.$config.isNumber();
            var initNumber = true;
            var ticketNumber = 0;
            var moneyNumber = 0;
            _t.ladingTableData.forEach((item) => {
              ticketNumber += item.ticket*1;
            });
            _t.ladingTableData.forEach((item) => {
              moneyNumber += item.money*1;
            });
            if(_t.allMoney < moneyNumber) {
              initNumber = false;
              _t.$store.commit('setShow', false);
              _t.alertDialogTip(_t, '操作金额大于库存数量');
            }
            if (_t.queryOneWayTicket< ticketNumber) {
              initNumber = false;
              _t.$store.commit('setShow', false);
              _t.alertDialogTip(_t, '操作票数量大于库存票数量');
            }
            _t.ladingTableData.forEach((item) => {
              // // 校验装机金额
              // if ((item.money.trim() === '' || regMoney.test(item.money.trim()) === false) || item.money.trim() === '0' ) {
              //   errorNum++;
              // }
              // // 校验装票数量
              // if ((item.ticket.trim() === '' || regNumber.test(item.ticket.trim()) === false) || item.ticket.trim() === '0' ) {
              //   errorNum++;
              // }
              if(item.ticket.trim() === '0' && item.money.trim() === '0' || item.ticket.trim() === '' && item.money.trim() === '') {
                errorNum++;
              }
            });
            if (errorNum !== 0) {
              _t.$store.commit('setShow', false);
              _t.alertDialogTip(_t, '请检查补充金额、补票数量是否为空或者格式是否正确!');
            }
            if (errorNum === 0 && initNumber) {
              // 错误数量为0 可以提交
              if (_t.ladingFormItem.userFlag === false
                && _t.ladingFormItem.passwordFlag === false) {
                let str = "location_number=" + _t.formItem.station
                  + "&operate_type=" + "00"
                  + "&tvm_operator_id=" + _t.ladingFormItem.operatorUser.trim()
                  + "&password=" + _t.ladingFormItem.operatorPassword.trim()
                  + "&tvm_creator_id=" + _t.formItem.operationId;
                let Base64 = require("js-base64").Base64;
                let keyToken = _t.$md5(Base64.encode(str));
                var params = {
                  location_number: _t.formItem.station,
                  operate_type: "00", // 00 装机
                  tvm_operator_id: _t.ladingFormItem.operatorUser.trim(),
                  password: _t.ladingFormItem.operatorPassword.trim(),
                  tvm_creator_id: _t.formItem.operationId,
                  deviceList: _t.ladingTableData,
                  token: keyToken
                };
                _t.$api.post('/tsGateWay/tvmManager/tvmInstall', params, function (res) {
                  if (res.rtCode && res.rtCode === '13002') {
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
                  } else {
                    if(res.rtData == '2000') {
                      _t.$store.commit('setShow', false);
                      var newArr = res.rtData.split(';');
                      var rtMessage = newArr[1].split('\\"');
                      _t.alertDialogTip(_t, rtMessage[0]);
                    }else if (res.rtCode){
                      _t.$store.commit('setShow', false);
                      _t.alertDialogTip(_t, res.rtMessage);
                    }
                  }
                });
              }
            } else {
              _t.$store.commit('setShow', false);
              // 错误数量不为0 提示
              // _t.alertDialogTip(_t, '请检查装机金额、装票数量是否为空或者为零,或者格式是否正确!');
            }
          } else {
            _t.$store.commit('setShow', false);
            // 表格数据为空
            _t.alertDialogTip(_t, '表格数据条数不能为空!');
          }
        } else {
          _t.$store.commit('setShow', false);
          _t.alertDialogTip(_t, '车站及操作员ID不能为空!');
        }
      },
      // 装机表格删除
      deleteLading(index) {
        var _t = this;
        _t.ladingTableData.splice(index, 1);
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
      // 获取库存总数量
      getNumberData() {
        var _t = this;
        var params  ={
          location_number:_t.getCookie('LOCATION_NUMBER')
        };
        _t.$api.post('/tsGateWay/ticketStockManage/queryOneWayTicket', params, function (res){
          if (res.rtCode == '10001') {
            _t.queryOneWayTicket = res.rtData*1
          }
        })
      },
      // 获取车站的备用金库存金额
      getTicketMoney() {
        var _t = this;
        var operationId = _t.formItem.operationId ? _t.formItem.operationId : _t.getCookie('USER_ID');
        var station = _t.formItem.station ? _t.formItem.station : _t.getCookie('LOCATION_NUMBER');
        let str = 'location_number=' + station
          + '&operator_id=' + operationId
          + '&stock_type=' + '01';
        // + '&money_state=' + '01';
        let Base64 = require('js-base64').Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        let postData = {
          location_number: station, // 位置编码
          operator_id: operationId, // 操作员id
          token: keyToken, // token
          stock_type: '01', // 01 备用金
          money_state: '01', // 01 余额
          pageNum: 1, // 当前页
          pageSize: 10, // 每页显示条数
        };
        _t.$api.post('/tsGateWay/readyMoney/readyMoneyStockQueryGateWay', postData, function (res) {
          if (res.rtCode && res.rtCode === '11101') {
            var resData = res.rtData === null ? [] : res.rtData;
            if (resData.length !== 0) {
              _t.allMoney = resData[0].MONEY_AMOUNT_YUAN *1 ;
            }
          }
        });
      },
    },
    created() {
      var _t = this;
      var roleName = _t.getCookie('USER_TYPE');
      var locationNum = _t.getCookie('LOCATION_NUMBER');
      if (roleName !== null && roleName !== 'null' && locationNum !== null && locationNum !== 'null') {

        // 本页面业务逻辑
        _t.getNumberData();
        _t.getTicketMoney();
        _t.getStatusData();
        _t.getLinesAndStation();
      }
    }
  }
</script>

<style scoped>

</style>
