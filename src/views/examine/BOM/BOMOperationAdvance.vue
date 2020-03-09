<template>
  <!--BOM收益预收-->
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
    <!--收益预收-->
    <div class="incomeInAdvance">
      <el-form :model="IncomeInAdvanceFormItem" inline>
        <!--售票员信息-->
        <p class="title">售票员信息</p>
        <div class="formBox-top">
          <el-form-item class="marBottom20 star" label="售票员ID：">
            <el-input
              maxlength="6"
              @blur="blurInput(IncomeInAdvanceFormItem,'userFlag',IncomeInAdvanceFormItem.operatorUser)"
              v-model="IncomeInAdvanceFormItem.operatorUser"
              class="width200"/>
            <span class="isNotNull" v-if="IncomeInAdvanceFormItem.userFlag">必填项不能为空</span>
          </el-form-item>
          <el-form-item class="marBottom20" label="密码：">
            <el-input
              maxlength="6"
              @blur="blurInput(IncomeInAdvanceFormItem,'passwordFlag',IncomeInAdvanceFormItem.operatorPassword)"
              v-model="IncomeInAdvanceFormItem.operatorPassword"
              type="password"
              class="width200"/>
            <span class="isNotNull" v-if="IncomeInAdvanceFormItem.passwordFlag">必填项不能为空</span>
          </el-form-item>
          <el-form-item class="marBottom15">
            <el-button type="primary" @click="getIncomeInAdvance">确认</el-button>
          </el-form-item>
        </div>
        <!--控制表格部分显示隐藏-->
        <div v-if="IncomeInAdvanceFormItem.showModule">
          <!--收益金额预收信息-->
          <p class="title">收益金额预收信息</p>
          <div class="formBox-top">
            <el-form-item class="marBottom20" label="操作员收益总金额(元)：">
              <el-input v-model="IncomeInAdvanceFormItem.allMoney" class="width200" disabled/>
            </el-form-item>
            <el-form-item class="marBottom20 star" label="收益预收金额(元)：">
              <el-input
                @blur="ruleMoneyWithTicket(IncomeInAdvanceFormItem,IncomeInAdvanceFormItem.money,'moneyFlag','moneyTip','allMoney')"
                v-model="IncomeInAdvanceFormItem.money"
                class="width200"/>
              <span class="isNotNull"
                    v-if="IncomeInAdvanceFormItem.moneyFlag">{{IncomeInAdvanceFormItem.moneyTip}}</span>
            </el-form-item>
          </div>
          <el-form-item>
            <el-button type="primary" v-btn-control :disabled="disabledShow" @click="addIncodeInAdvanceData">提交</el-button>
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
    name: "BOMOperationAdvance",
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
        // 基本信息表单
        formItem: {
          lines: '', // 线路
          station: '', //车站
          operationId: '', // 操作员id
          operate_type: '03', // 操作类型
        },
        // 收益预收表单
        IncomeInAdvanceFormItem: {
          operatorUser: '', // 售票员ID
          operatorPassword: '', // 密码
          userFlag: false, // 校验售票员标识
          passwordFlag: false, // 校验密码标识
          allMoney: '0', // 收益预收总金额
          money: '', // 预收操作金额
          moneyFlag: false, // 收益预收标识
          moneyTip: '', // 收益预收提示
          showModule: false, // 控制表格区域显示隐藏
        },
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
      // 获取收益预收的信息
      getIncomeInAdvance() {
        var _t = this;
        // location_number、操作员id 不为空
        if (_t.formItem.station !== '' && _t.formItem.operationId !== '') {
          // 校验售票员id
          _t.blurInput(_t.IncomeInAdvanceFormItem, 'userFlag', _t.IncomeInAdvanceFormItem.operatorUser);
          // 校验售票员密码
          _t.blurInput(_t.IncomeInAdvanceFormItem, 'passwordFlag', _t.IncomeInAdvanceFormItem.operatorPassword);
          // 可以提交
          if (_t.IncomeInAdvanceFormItem.userFlag === false && _t.IncomeInAdvanceFormItem.passwordFlag === false) {
            let str = "location_number=" + _t.formItem.station
              + "&bom_operator_id=" + _t.IncomeInAdvanceFormItem.operatorUser.trim()
              + "&password=" + _t.IncomeInAdvanceFormItem.operatorPassword.trim()
              + "&bom_creator_id=" + _t.formItem.operationId;
            let Base64 = require("js-base64").Base64;
            let keyToken = _t.$md5(Base64.encode(str));
            var params = {
              flag: '1',
              operate_flag: '0',
              location_number: _t.formItem.station,
              bom_operator_id: _t.IncomeInAdvanceFormItem.operatorUser.trim(),
              password: _t.IncomeInAdvanceFormItem.operatorPassword.trim(),
              bom_creator_id: _t.formItem.operationId,
              token: keyToken
            };
            _t.$api.post('/tsGateWay/bommanager/receivehistoryquery', params, function (res) {
              if (res.rtCode && res.rtCode === '12009') {
                _t.IncomeInAdvanceFormItem.showModule = true; // 显示领用记录
                var resData = res.rtData === null ? {} : res.rtData;
                _t.IncomeInAdvanceFormItem.allMoney = resData.EARNING_MOENY_NUM !== undefined ? resData.EARNING_MOENY_NUM : 0; // 收益预收总金额
              } else if (res.rtCode === '22011') {
                _t.alertDialogTip(_t, res.rtMessage);
              } else if (res.rtCode) {
                _t.alertDialogTip(_t, res.rtMessage);
              }
            });
          }
        }
      },
      // 提交收益预收金额
      addIncodeInAdvanceData() {
        var _t = this;
        _t.$store.commit('setShow', true);
        if (_t.formItem.station !== '' && _t.formItem.operationId !== '') {
          if (_t.IncomeInAdvanceFormItem.showModule) {
            // 校验售票员id
            _t.blurInput(_t.IncomeInAdvanceFormItem, 'userFlag', _t.IncomeInAdvanceFormItem.operatorUser);
            // 校验售票员密码
            _t.blurInput(_t.IncomeInAdvanceFormItem, 'passwordFlag', _t.IncomeInAdvanceFormItem.operatorPassword);
            // 校验预收金额
            _t.ruleMoneyForInCode(_t.IncomeInAdvanceFormItem.money);
            // 可以提交
            if (_t.IncomeInAdvanceFormItem.userFlag === false
              && _t.IncomeInAdvanceFormItem.passwordFlag === false
              && _t.IncomeInAdvanceFormItem.moneyFlag === false) {
              // 可以提交
              let str =
                "location_number=" + _t.formItem.station
                + "&bom_operator_id=" + _t.IncomeInAdvanceFormItem.operatorUser.trim()
                + "&password=" + _t.IncomeInAdvanceFormItem.operatorPassword.trim()
                + "&bom_creator_id=" + _t.formItem.operationId
                + "&reserve_money=" + Number(_t.IncomeInAdvanceFormItem.money);
              let Base64 = require("js-base64").Base64;
              let keyToken = _t.$md5(Base64.encode(str));
              var params = {
                location_number: _t.formItem.station, // 位置编码
                bom_operator_id: _t.IncomeInAdvanceFormItem.operatorUser.trim(), // 售票员id
                password: _t.IncomeInAdvanceFormItem.operatorPassword.trim(), // 密码
                bom_creator_id: _t.formItem.operationId, // 操作员id
                reserve_money: Number(_t.IncomeInAdvanceFormItem.money), // 预收操作金额
                token: keyToken, // token
              };
              _t.$api.post('/tsGateWay/bommanager/earningsadvance', params, function (res) {
                if (res.rtCode && res.rtCode === '12003') {
                  _t.$alert(res.rtMessage, "温馨提示", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消"
                  }).then(() => {
                    _t.$store.commit('setShow', false);
                    _t.$store.commit('delete_tabs', _t.$route.name);
                    _t.$router.push({name: 'BOMOperation'});
                  }).catch(() => {
                    _t.$store.commit('setShow', false);
                    _t.$router.push({name: 'BOMOperation'});
                  });
                } else if (res.rtCode) {
                  _t.$store.commit('setShow', false);
                  _t.alertDialogTip(_t, res.rtMessage);
                }
              });
            }
          } else {
            _t.$store.commit('setShow', false);
            _t.alertDialogTip(_t, '请先查询收益余额预收信息!');
          }
        } else {
          _t.$store.commit('setShow', false);
          _t.alertDialogTip(_t, '车站及操作员ID不能为空!');
        }
      },
      // 校验收益预收金额
      ruleMoneyForInCode(val) {
        var _t = this;
        if (val.trim() === '') {
          _t.IncomeInAdvanceFormItem.moneyFlag = true;
          _t.IncomeInAdvanceFormItem.moneyTip = '必填项不能为空';
        } else {
          // 不为空 校验格式
          var reg = _t.$config.isMoneyNumber();
          if (reg.test(val.trim()) === false) {
            _t.IncomeInAdvanceFormItem.moneyFlag = true;
            _t.IncomeInAdvanceFormItem.moneyTip = '格式不正确';
          } else {
            // 格式正确 校验是否大于库存
            // if (val.trim() * 1 > _t.IncomeInAdvanceFormItem.allMoney * 1) {
            //     _t.IncomeInAdvanceFormItem.moneyFlag = true;
            //     _t.IncomeInAdvanceFormItem.moneyTip = '预收金额不能大于总金额';
            // } else {
            _t.IncomeInAdvanceFormItem.moneyFlag = false;
            _t.IncomeInAdvanceFormItem.moneyTip = '';
            // }
          }
        }
      },
      // 校验金额
      ruleMoneyWithTicket(item, val, flag, tip, all) {
        var _t = this;
        // 校验是否为空
        if (val.trim() === '') {
          item[flag] = true;
          item[tip] = '必填项不能为空';
        } else {
          // 不为空 校验格式
          var reg = _t.$config.isMoneyNumber();
          if (reg.test(val.trim()) === false) {
            item[flag] = true;
            item[tip] = '格式不正确';
          } else {
            _t.IncomeInAdvanceFormItem.money= (_t.IncomeInAdvanceFormItem.money.trim() * 1).toFixed(1).toString();
           // 格式正确 校验是否大于库存
            if (val.trim() * 1 > item[all] * 1) {
                // item[flag] = true;
                // item[tip] = '操作金额不能大于库存金额';
            } else {
            item[flag] = false;
            item[tip] = '';
             }

          }
        }
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
  p.title {
    font-size: 14px;
    margin-bottom: 10px;
  }
</style>
