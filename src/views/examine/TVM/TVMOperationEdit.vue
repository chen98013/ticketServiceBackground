<template>
  <!--补充-->
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
    <!--补充-->
    <div>
      <el-form :model="supplementFormItem" inline>
        <!--认证信息-->
        <p class="title">认证信息</p>
        <div class="formBox-top">
          <el-form-item class="marBottom20 star" label="认证ID：">
            <el-input
              maxlength="6"
              @blur="blurInput(supplementFormItem,'userFlag',supplementFormItem.operatorUser)"
              v-model="supplementFormItem.operatorUser"
              class="width200"/>
            <span class="isNotNull" v-if="supplementFormItem.userFlag">必填项不能为空</span>
          </el-form-item>
          <el-form-item class="marBottom20 star" label="密码：">
            <el-input
              maxlength="6"
              @blur="blurInput(supplementFormItem,'passwordFlag',supplementFormItem.operatorPassword)"
              v-model="supplementFormItem.operatorPassword"
              class="width200"
              type="password"/>
            <span class="isNotNull" v-if="supplementFormItem.passwordFlag">必填项不能为空</span>
          </el-form-item>
          <el-form-item class="marBottom20">
            <el-button type="primary" @click="getRecycleData">确认</el-button>
          </el-form-item>
        </div>
        <!--装机信息-->
        <div v-if="supplementFormItem.showModule">
          <p class="title">装机信息</p>
          <el-table :data="supplementTableData" border stripe class="marBottom10">
            <el-table-column prop="device_name" label="设备名称" header-align="center" align="center"/>
            <el-table-column prop="allMoney" label="已装金额(元)" header-align="center" align="center"/>
            <el-table-column prop="MONEY" label="已补金额(元)" header-align="center" align="center"/>
            <el-table-column label="补充金额(元)" header-align="center" align="center">
              <template slot-scope="scope">
                <el-input oninput="value=value.replace(/[^\d]/g,'')" maxlength="9" v-model="scope.row.money"/>
              </template>
            </el-table-column>
            <el-table-column prop="allTicket" label="已装票数量(张)" header-align="center" align="center"/>
            <el-table-column prop="TICKET_YOUXIAO" label="已补装票数量(张)" header-align="center" align="center"/>
            <el-table-column label="补票数量(张)" header-align="center" align="center">
              <template slot-scope="scope">
                <el-input
                  maxlength="9"
                  oninput="value=value.replace(/[^\d]/g,'')"
                  v-model="scope.row.ticket"/>
              </template>
            </el-table-column>
            <el-table-column label="操作" header-align="center" align="center">
              <template slot-scope="scope">
                <el-button type="danger" @click="deleteSupplement(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-form-item>
            <el-button type="primary" v-btn-control :disabled="disabledShow" @click="addSupplementBtn">提交</el-button>
            <el-button type="warning" @click="resetData">取消</el-button>
          </el-form-item>
        </div>
      </el-form>
    </div>
  </Box>
</template>

<script>
  import Box from "../../../components/Box";

  export default {
    name: "TVMOperationEdit",
    components: {Box},
    data() {
      return {
        disabledShow: this.$store.state.disabledShow, // 提交禁选
        // 操作类型
        statusList: [],
        // 线路集合
        linesList: [],
        queryOneWayTicket: '',// 库存总数量
        // 车站集合
        stationList: [],
        // 操作员id集合
        operatorIdList: [],
        // 基本信息表单
        formItem: {
          lines: '', // 线路
          station: '', //车站
          operationId: '', // 操作员id
          operate_type: '01', // 操作类型
        },
        // 补充表单
        supplementFormItem: {
          operatorUser: '', // 认证id
          operatorPassword: '', // 密码
          userFlag: false, // 操作员标识
          passwordFlag: false, // 密码标识
          showModule: false, // 控制表格区域显示隐藏
        },
        allMoney: '',
        // 从cookie中获取
        cookieMap: {
          location_number: this.getCookie('LOCATION_NUMBER'), // 位置编号
          user_id: this.getCookie('USER_ID'), // 操作员ID
          role: this.getCookie('USER_TYPE'), // 用户角色
        },
        // 补充表格
        //  新建装机信息数据
        installData: [],
        // 补充装机数据
        supplementData: [],
        consont: 0
      }
    },
    computed: {
      supplementTableData() {
        //  装机信息 拼接数组
        var newArr = [];
        for (var i = 0; i < this.installData.length; i++) {
          newArr.push(Object.assign(this.installData[i], this.supplementData[i]))
        }
        return newArr
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
        // 线路接口调完之后调用查询接口
        // _t.getData();
      },
      // 补充查询表格信息
      getSupplementData(type) {
        var _t = this;
        // location_number 不为空
        if (_t.formItem.station !== '') {
          // 校验认证操作员
          _t.blurInput(_t.supplementFormItem, 'userFlag', _t.supplementFormItem.operatorUser);
          // 校验密码
          _t.blurInput(_t.supplementFormItem, 'passwordFlag', _t.supplementFormItem.operatorPassword);
          // 可以提交
          if (_t.supplementFormItem.userFlag === false && _t.supplementFormItem.passwordFlag === false) {
            let str = "location_number=" + _t.formItem.station
              + "&operate_type=" + type
              + "&tvm_operator_id=" + _t.supplementFormItem.operatorUser.trim()
              + "&password=" + _t.supplementFormItem.operatorPassword.trim();
            let Base64 = require("js-base64").Base64;
            let keyToken = _t.$md5(Base64.encode(str));

            var params = {
              flag: '1',
              operate_flag: '0',
              location_number: _t.formItem.station,
              operate_type: type, // 01 补充
              tvm_operator_id: _t.supplementFormItem.operatorUser.trim(),
              tvm_creator_id: _t.cookieMap.user_id.toString(),
              password: _t.supplementFormItem.operatorPassword.trim(),
              token: keyToken
            };
            _t.$api.post('/tsGateWay/tvmManager/getTvmOperationInfo', params, function (res) {

              if (res.rtCode && res.rtCode === '13010') {
                //  TVM装机记录
                _t.supplementFormItem.showModule = true; // 显示表格数据
                var tableData = new Array();
                var resData = res.rtData === null ? [] : res.rtData;
                resData.forEach((item) => {
                  var obj = new Object();
                  obj.device_id = item.DEVICE_ID; // 设备id
                  obj.device_name = item.DEVICE_NAME; // 设备名称
                  obj.allMoney = item.MONEY; // 已装金额
                  obj.money = '0'; // 补充金额
                  obj.allTicket = item.TICKET_YOUXIAO === undefined ? '0' : item.TICKET_YOUXIAO; // 已装票数量
                  obj.ticket = '0'; // 补票数量
                  tableData.push(obj);
                });
                _t.installData = tableData;
              } else if (res.rtCode && res.rtCode === '13011' && type === '01') {
                // TVM补充记录
                var tableData = new Array();
                var resData = res.rtData === null ? [] : res.rtData;
                resData.forEach(item => {
                  var obj = new Object();
                  obj.MONEY = item.MONEY;
                  obj.TICKET_YOUXIAO = item.TICKET_YOUXIAO;
                  tableData.push(obj);
                });
                _t.supplementData = tableData;
              } else if (res.rtCode) {
                if (res.rtCode == '27011') {
                  _t.consont++;
                  if (_t.consont == 2) {
                    _t.consont = 0;
                    _t.alertDialogTip(_t, res.rtMessage);
                  }
                } else {
                  _t.alertDialogTip(_t, res.rtMessage);
                }
              }
            });
          }
        }
      },
      // 调用 补充查询表格信息
      getRecycleData() {
        var _t = this;
        // location_number 不为空
        if (_t.formItem.station !== '') {
          // 校验认证操作员
          _t.blurInput(_t.supplementFormItem, 'userFlag', _t.supplementFormItem.operatorUser);
          // 校验密码
          _t.blurInput(_t.supplementFormItem, 'passwordFlag', _t.supplementFormItem.operatorPassword);
          // 可以提交
          _t.getSupplementData('00'); // 装机
          _t.getSupplementData('01'); // 补充

        }
      },
      // 补充表格删除
      deleteSupplement(index) {
        var _t = this;
        _t.supplementTableData.splice(index, 1);
      },
      // 补充提交
      addSupplementBtn() {
        var _t = this;
        _t.$store.commit('setShow', true);
        if (_t.formItem.station !== '' && _t.formItem.operationId !== '') {
          if (_t.supplementFormItem.showModule) {
            // 校验认证操作员
            _t.blurInput(_t.supplementFormItem, 'userFlag', _t.supplementFormItem.operatorUser);
            // 校验密码
            _t.blurInput(_t.supplementFormItem, 'passwordFlag', _t.supplementFormItem.operatorPassword);
            // 校验表格
            if (_t.supplementTableData.length !== 0) {
              // 表格数据条数不为空 校验金额和数量
              var errorNum = 0;
              var regMoney = _t.$config.isMoneyNumber();
              var regNumber = _t.$config.isNumber();
              var initNumber = true;
              var ticketNumber = 0;
              var moneyNumber = 0;
              _t.supplementTableData.forEach((item) => {
                ticketNumber += item.ticket*1;
              });
              _t.supplementTableData.forEach((item) => {
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
                _t.alertDialogTip(_t, '操作补票数量大于库存数量');
              }
              _t.supplementTableData.forEach((item) => {
                // 校验补充金额
                if (item.money.trim() === '' || regMoney.test(item.money.trim()) === false) {
                  errorNum++;
                }
                // 校验补票数量
                if (item.ticket.trim() === '' || regNumber.test(item.ticket.trim()) === false) {
                  errorNum++;
                }
                if (item.money === '0' && item.ticket === '0') {
                  errorNum++;
                  _t.$store.commit('setShow', false);
                  _t.alertDialogTip(_t, '补票数量和补充金额不能同时为零!');
                }
              });

              if (errorNum !== 0) {
                _t.$store.commit('setShow', false);
                _t.alertDialogTip(_t, '请检查补充金额、补票数量是否为空或者格式是否正确!');
              }
              if (initNumber && errorNum === 0) {
                // 错误数量为0 可以提交
                if (_t.supplementFormItem.userFlag === false
                  && _t.supplementFormItem.passwordFlag === false) {
                  let str = "location_number=" + _t.formItem.station
                    + "&operate_type=" + "01"
                    + "&tvm_operator_id=" + _t.supplementFormItem.operatorUser.trim()
                    + "&password=" + _t.supplementFormItem.operatorPassword.trim()
                    + "&tvm_creator_id=" + _t.formItem.operationId;
                  let Base64 = require("js-base64").Base64;
                  let keyToken = _t.$md5(Base64.encode(str));
                  var params = {
                    location_number: _t.formItem.station,
                    operate_type: "01", // 01 补充
                    tvm_operator_id: _t.supplementFormItem.operatorUser.trim(),
                    password: _t.supplementFormItem.operatorPassword.trim(),
                    tvm_creator_id: _t.formItem.operationId,
                    deviceList: _t.supplementTableData,
                    token: keyToken
                  };
                  _t.$api.post('/tsGateWay/tvmManager/tvmSupply', params, function (res) {
                    if (res.rtCode && res.rtCode === '13003') {
                      _t.$alert(res.rtMessage, "温馨提示", {
                        confirmButtonText: "确定",
                        cancelButtonText: "取消"
                      }).then(() => {
                        _t.$store.commit('setShow', false);
                        _t.supplementFormItem.operatorUser = '';
                        _t.supplementFormItem.operatorPassword = '';
                        _t.supplementFormItem.showModule = false;
                        _t.$store.commit('delete_tabs', _t.$route.name);
                        _t.$router.push({name: 'TVMOperation'});
                      }).catch(() => {
                        _t.$store.commit('setShow', false);
                        _t.supplementFormItem.operatorUser = '';
                        _t.supplementFormItem.operatorPassword = '';
                        _t.supplementFormItem.showModule = false;
                        _t.$store.commit('delete_tabs', _t.$route.name);
                        _t.$router.push({name: 'TVMOperation'});
                      });
                    } else if (res.rtCode) {
                      _t.$store.commit('setShow', false);
                      if (res.rtCode == '27004') {
                        _t.alertDialogTip(_t, res.rtMessage);
                      } else if (res.rtCode == '21065') {
                        _t.alertDialogTip(_t, res.rtMessage);
                      } else {
                        _t.alertDialogTip(_t, res.rtMessage);
                      }

                    }
                  });
                }
              } else {
                _t.$store.commit('setShow', false);
                // 错误数量不为0 提示

              }
            } else {
              _t.$store.commit('setShow', false);
              _t.alertDialogTip(_t, '表格数据条数不能为空!');
            }
          } else {
            _t.$store.commit('setShow', false);
            _t.alertDialogTip(_t, '请先查询装机信息记录!');
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
        _t.$store.commit('delete_tabs', _t.$route.name);
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
              _t.allMoney = resData[0].MONEY_AMOUNT_YUAN *1;
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
        _t.getStatusData();
        _t.getLinesAndStation();
        _t.getTicketMoney();
        _t.getNumberData(); // 获取库存总数量
      }
    }
  }
</script>

<style scoped>

</style>
