<template>
  <!--BOM回收-->
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
    <div class="recycle">
      <el-form :model="recycleFormItem" inline>
        <!--售票员信息-->
        <p class="title">售票员信息</p>
        <div class="formBox-top">
          <el-form-item class="marBottom20 star" label="售票员ID：">
            <el-input
              maxlength="6"
              @blur="blurInput(recycleFormItem,'userFlag',recycleFormItem.operatorUser)"
              v-model="recycleFormItem.operatorUser"
              class="width200"/>
            <span class="isNotNull" v-if="recycleFormItem.userFlag">必填项不能为空</span>
          </el-form-item>
          <el-form-item class="marBottom20 star" label="密码：">
            <el-input
              maxlength="6"
              @blur="blurInput(recycleFormItem,'passwordFlag',recycleFormItem.operatorPassword)"
              v-model="recycleFormItem.operatorPassword"
              type="password"
              class="width200"/>
            <span class="isNotNull" v-if="recycleFormItem.passwordFlag">必填项不能为空</span>
          </el-form-item>
          <el-form-item class="marBottom20">
            <el-button type="primary" @click="getRecycleData">确认</el-button>
          </el-form-item>
        </div>
        <div v-if="recycleFormItem.showModule">
          <!--车票回收信息-->
          <p class="title">车票回收信息</p>
          <el-table :data="recycleTableData" border stripe class="marBottom10">
            <el-table-column prop="stock_manage_type_name" label="车票类型"/>
            <el-table-column prop="ticket_value" label="面值(元)"/>
            <el-table-column prop="use_ticket_number" label="配票数量"/>
            <el-table-column prop="add_ticket_number" label="追加数量"/>
            <el-table-column prop="RECOVER_TICKET_NUM" label="已回收有效票"/>
            <el-table-column prop="lose_ticket_num" label="已回收遗失票"/>
            <el-table-column prop="wu_xiao_ticket_num" label="已回收无效票"/>
            <el-table-column prop="other_ticket_number1" label="已回收其他"/>
            <el-table-column label="归还数量">
              <template slot-scope="scope">
                <el-input
                  maxlength="9"
                  oninput="value=value.replace(/[^\d]/g,'')"
                  v-model="scope.row.return_ticket_number"/>
              </template>
            </el-table-column>
            <el-table-column label="遗失票卡">
              <template slot-scope="scope">
                <el-input
                  maxlength="9"
                  oninput="value=value.replace(/[^\d]/g,'')"
                  v-model="scope.row.lose_ticket_number"/>
              </template>
            </el-table-column>
            <el-table-column label="无效票卡">
              <template slot-scope="scope">
                <el-input
                  maxlength="9"
                  oninput="value=value.replace(/[^\d]/g,'')"
                  v-model="scope.row.invalid_ticket_number"/>
              </template>
            </el-table-column>
            <el-table-column label="其他">
              <template slot-scope="scope">
                <el-input
                  maxlength="9"
                  oninput="value=value.replace(/[^\d]/g,'')"
                  v-model="scope.row.other_ticket_number"/>
              </template>
            </el-table-column>
          </el-table>
          <!--备用金信息-->
          <p class="title">备用金信息</p>
          <div class="formBox-top">
            <el-form-item class="marBottom15" label="配备用金(元)：">
              <el-input v-model="recycleFormItem.sendMoney" disabled/>
            </el-form-item>
            <el-form-item class="marBottom15" label="追加备用金(元)：">
              <el-input v-model="recycleFormItem.addMoney" disabled/>
            </el-form-item>
          </div>
          <!--收益金额信息-->
          <p class="title">收益金额信息</p>
          <div class="formBox-top">
            <el-form-item class="marBottom15" label="收益预收金额(元)：">
              <el-input v-model="recycleFormItem.allMoney" disabled/>
            </el-form-item>
          </div>
          <p class="title">已回收金额</p>
          <div class="formBox-top">
            <el-form-item class="marBottom15" label="已回收金额(元)：">
              <el-input v-model="recycleFormItem.moneyMoney" disabled/>
            </el-form-item>
          </div>
          <!--回收信息-->
          <p class="title">回收信息</p>
          <div class="formBox-top">
            <el-form-item class="marBottom20 star" label="回收金额(元)：">
              <el-input
                @blur="ruleRecycleData(recycleFormItem.money)"
                v-model="recycleFormItem.money"
                class="width200"/>
              <span class="isNotNull" v-model="recycleFormItem.moneyFlag">{{recycleFormItem.moneyTip}}</span>
            </el-form-item>
          </div>
          <el-form-item>
            <el-button type="primary" :disabled="disabledShow" @click="addRecycleData">提交</el-button>
            <el-button type="warning" @click="resetData">取消</el-button>
          </el-form-item>
        </div>
      </el-form>
    </div>
  </Box>
</template>

<script>
  import Box from '../../../components/Box';

  export default {
    name: "BOMOperationRecycle",
    components: {Box},
    data() {
      return {
        disabledShow: false, // 提交禁选
        // 操作类型
        statusList: [],
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
          operate_type: '04', // 操作类型
        },
        linesListArr:[], // 调入调出线路
        // 回收表单
        recycleFormItem: {
          operatorUser: '', // 售票员ID
          operatorPassword: '', // 密码
          userFlag: false, // 校验售票员标识
          passwordFlag: false, // 校验密码标识
          sendMoney: '0', // 配备金额
          addMoney: '0', // 追加金额
          allMoney: '0', // 收益预收总金额
          money: '', // 回收金额
          moneyFlag: false, // 回收金额校验
          moneyTip: '', // 回收金额提示
          showModule: false, // 控制表格区域显示隐藏
          moneyMoney: '', // 已回收金额
        },
        // 从cookie中获取
        cookieMap: {
          location_number: this.getCookie('LOCATION_NUMBER'), // 位置编号
          user_id: this.getCookie('USER_ID'), // 操作员ID
          role: this.getCookie('USER_TYPE'), // 用户角色
        },
        // 回收表格
        recycleTableData: []
      }
    },
    methods: {
      // 取消按钮
      resetData() {
        var _t = this;
        _t.$router.push({name: 'BOMOperation'});
        _t.$store.commit('delete_tabs', _t.$route.name);
      },
      // 获取单据类型字典
      getStatusData() {
        var _t = this;
        let str = "guid=GUID000722201906191624";
        let Base64 = require("js-base64").Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        var params = {
          guid: "GUID000722201906191624",
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
            _t.$alert(res.rtMessage, "温馨提示", {
              confirmButtonText: "确定",
              cancelButtonText: "取消"
            }).then(() => {
              return false;
            });
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
      // 失去焦点时校验
      blurInput(item, flag, val) {
        item[flag] = val.trim() === '' ? true : false;
      },
      // 获取回收信息
      getRecycleData() {
        var _t = this;
        // location_number、操作员id 不为空
        if (_t.formItem.station !== '' && _t.formItem.operationId !== '') {
          // 校验售票员id
          _t.blurInput(_t.recycleFormItem, 'userFlag', _t.recycleFormItem.operatorUser);
          // 校验售票员密码
          _t.blurInput(_t.recycleFormItem, 'passwordFlag', _t.recycleFormItem.operatorPassword);
          // 可以提交
          if (_t.recycleFormItem.userFlag === false && _t.recycleFormItem.passwordFlag === false) {
            let str = "location_number=" + _t.formItem.station
              + "&bom_operator_id=" + _t.recycleFormItem.operatorUser.trim()
              + "&password=" + _t.recycleFormItem.operatorPassword.trim()
              + "&bom_creator_id=" + _t.formItem.operationId;
            let Base64 = require("js-base64").Base64;
            let keyToken = _t.$md5(Base64.encode(str));
            var params = {
              flag: '1',
              operate_flag: '0',
              location_number: _t.formItem.station,
              bom_operator_id: _t.recycleFormItem.operatorUser.trim(),
              password: _t.recycleFormItem.operatorPassword.trim(),
              bom_creator_id: _t.formItem.operationId,
              token: keyToken
            };
            _t.$api.post('/tsGateWay/bommanager/receivehistoryquery', params, function (res) {
              if (res.rtCode && res.rtCode === '12009') {
                _t.recycleFormItem.showModule = true; // 显示领用记录
                var resData = res.rtData === null ? {} : res.rtData; // data
                var tableData = resData.TICKET_DATA ? resData.TICKET_DATA:[]; // 领用记录表格
                var tableDataArr = new Array();
                tableData.forEach((item) => {
                  var obj = new Object();
                  obj.stock_manage_type_id = item.STOCK_MANAGE_TYPE_ID ? item.STOCK_MANAGE_TYPE_ID : ''; // 车票类型id
                  obj.stock_manage_type_name = item.STOCK_TYPE_NAME_CN ? item.STOCK_TYPE_NAME_CN : ''; // 车票类型名称
                  obj.ticket_value = item.ISSUE_AMOUNT !== undefined ? item.ISSUE_AMOUNT.toString() : '0'; // 面值 ssy
                  obj.use_ticket_number = item.RECEIVE_TICKET_NUM !== undefined ? item.RECEIVE_TICKET_NUM.toString() : '0'; // 配票数量 ssy
                  obj.add_ticket_number = item.APPEND_TICKET_NUM !== undefined ? item.APPEND_TICKET_NUM.toString() : '0'; // 追加数量 ssy
                  obj.return_ticket_number = '0'; // 归还数量
                  obj.RECOVER_TICKET_NUM =  item.RECOVER_TICKET_NUM?item.RECOVER_TICKET_NUM:'';
                  obj.lose_ticket_num = item.lose_ticket_num;
                  obj.wu_xiao_ticket_num = item.wu_xiao_ticket_num;
                  obj.other_ticket_number1 = item.other_ticket_number;
                  obj.lose_ticket_number = '0'; // 遗失票卡
                  obj.invalid_ticket_number = '0'; // 无效票卡
                  obj.other_ticket_number = '0'; // 其他
                  tableDataArr.push(obj);
                });
                _t.recycleTableData = tableDataArr;
                // 配备用金
                _t.recycleFormItem.sendMoney = resData.RECEIVE_MOENY_NUM !== undefined ? resData.RECEIVE_MOENY_NUM.toString() : '0';
                // 追加备用金
                _t.recycleFormItem.addMoney = resData.APPEND_MOENY_NUM !== undefined ? resData.APPEND_MOENY_NUM : '0';
                // 收益预收总金额
                _t.recycleFormItem.allMoney = resData.EARNING_MOENY_NUM !== undefined ? resData.EARNING_MOENY_NUM.toString() : '0';
                _t.recycleFormItem.moneyMoney = resData.RECOVER_MOENY_NUM !== undefined ? resData.RECOVER_MOENY_NUM.toString() : '0';
              } else if (res.rtCode === '22011') {
                _t.alertDialogTip(_t, res.rtMessage);
              } else if (res.rtCode) {
                _t.alertDialogTip(_t, res.rtMessage);
              }
            });
          }
        } else {
          _t.alertDialogTip(_t, '车站及操作员ID不能为空!');
        }
      },
      // 提交回收信息
      addRecycleData() {
        var _t = this;
        _t.disabledShow = true;
        if (_t.formItem.station !== '' && _t.formItem.operationId !== '') {
          if (_t.recycleFormItem.showModule) {
            // 校验售票员id
            _t.blurInput(_t.recycleFormItem, 'userFlag', _t.recycleFormItem.operatorUser);
            // 校验售票员密码
            _t.blurInput(_t.recycleFormItem, 'passwordFlag', _t.recycleFormItem.operatorPassword);
            // 校验回收金额
            _t.ruleRecycleData(_t.recycleFormItem.money);
            // 可以提交
            if (_t.recycleTableData) {
              var isErrorNum = 0;
              var reg = _t.$config.isNumber();
              _t.recycleTableData.forEach((item) => {
                // 校验归还数量
                if (item.return_ticket_number.trim() === '' || reg.test(item.return_ticket_number.trim()) === false) {
                  isErrorNum++;
                }
                // 校验遗失数量
                if (item.lose_ticket_number.trim() === '' || reg.test(item.lose_ticket_number.trim()) === false) {
                  isErrorNum++;
                }
                // 校验无效数量
                if (item.invalid_ticket_number.trim() === '' || reg.test(item.invalid_ticket_number.trim()) === false) {
                  isErrorNum++;
                }
                // 校验其他数量
                if (item.other_ticket_number.trim() === '' || reg.test(item.other_ticket_number.trim()) === false) {
                  isErrorNum++;
                }
              });
              // 没有错误 可以提交
              if (isErrorNum === 0) {
                if (_t.recycleFormItem.userFlag === false
                  && _t.recycleFormItem.passwordFlag === false
                  && _t.recycleFormItem.moneyFlag === false) {
                  let str =
                    "location_number=" + _t.formItem.station
                    + "&bom_operator_id=" + _t.recycleFormItem.operatorUser.trim()
                    + "&password=" + _t.recycleFormItem.operatorPassword.trim()
                    + "&bom_creator_id=" + _t.formItem.operationId;
                  let Base64 = require("js-base64").Base64;
                  let keyToken = _t.$md5(Base64.encode(str));
                  var params = {
                    location_number: _t.formItem.station, // 位置编码
                    bom_operator_id: _t.recycleFormItem.operatorUser.trim(), // 售票员id
                    password: _t.recycleFormItem.operatorPassword.trim(), // 密码
                    bom_creator_id: _t.formItem.operationId, // 操作员id
                    reserve_money: Number(_t.recycleFormItem.money), // 回收金额
                    ticket_data: _t.recycleTableData, // 表格数据
                    token: keyToken, // token
                  };
                  _t.$api.post('/tsGateWay/bommanager/recovery', params, function (res) {
                    if (res.rtCode && res.rtCode === '12004') {
                      _t.$alert(res.rtMessage, "温馨提示", {
                        confirmButtonText: "确定",
                        cancelButtonText: "取消"
                      }).then(() => {
                        _t.disabledShow = false;
                        _t.$store.commit('delete_tabs', _t.$route.name);
                        _t.$router.push({name: 'BOMOperation'});
                      }).catch(() => {
                        _t.disabledShow = false;
                        _t.$router.push({name: 'BOMOperation'});
                      });
                    } else if (res.rtCode) {
                      _t.disabledShow = false;
                      _t.alertDialogTip(_t, res.rtMessage);
                    }
                  });
                }
              } else {
                _t.disabledShow = false;
                _t.alertDialogTip(_t, '归还数量、遗失票卡、无效票卡以及其他等有为空或格式不正确!');
              }
            } else {
              _t.disabledShow = false;
              _t.alertDialogTip(_t, '表格数据条数不能为空!');
            }
          } else {
            _t.disabledShow = false;
            _t.alertDialogTip(_t, '请先查询车票备用金领用记录!');
          }
        } else {
          _t.disabledShow = false;
          _t.alertDialogTip(_t, '车站及操作员ID不能为空!');
        }
      },
      // 校验回收金额
      ruleRecycleData(val) {
        var _t = this;
        if (val === '') {
          _t.recycleFormItem.moneyFlag = true;
          _t.disabledShow = false;
          _t.recycleFormItem.moneyTip = '必填项不能为空';
        } else {
          // 校验格式
          var reg = _t.$config.isMoneyNumber();
          if (reg.test(val) === false) {
            _t.recycleFormItem.moneyFlag = true;
            _t.disabledShow = false;
            _t.recycleFormItem.moneyTip = '格式不正确';
          } else {
            _t.recycleFormItem.money = (_t.recycleFormItem.money * 1).toFixed(1).toString();
            // 格式正确
            _t.recycleFormItem.moneyFlag = false;
            _t.recycleFormItem.moneyTip = '';
          }
        }
      }
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
  p.title {
    font-size: 14px;
    margin-bottom: 10px;
  }
</style>
