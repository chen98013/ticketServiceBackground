<template>
  <!-- BOM配票备用金 -->
  <Box>
    <!--基本信息-->
    <p class="title">基本信息</p>
    <div class="formBox-top">
      <el-form inline :model="formItem">
        <el-form-item class="marBottom15" label="线路：">
          <el-select
            disabled
            v-model="formItem.lines">
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
    <!--配票/备用金-->
    <div class="withTicketAndMoney">
      <el-form :model="withTicketFormItem" inline>
        <!--配票信息-->
        <p class="title">配票信息</p>
        <div class="formBox-top">
          <el-form-item label="车票类型：">
            <el-select
              @change="changeWithTicket(withTicketFormItem.type)"
              v-model="withTicketFormItem.type">
              <el-option
                v-for="(item,index) in ticketTypeList"
                :key="index"
                :label="item.STOCK_TYPE_NAME_CN"
                :value="item.STOCK_MANAGE_TYPE_ID"/>
            </el-select>
          </el-form-item>
          <el-form-item label="库存数量(张)：">
            <el-input v-model="withTicketFormItem.allTicket" disabled class="width200"/>
          </el-form-item>
          <el-form-item label="面值(元)：">
            <el-input v-model="withTicketFormItem.ticket_value" disabled/>
          </el-form-item>
          <el-form-item label="配票数量(张)：">
            <el-input
              maxlength="9"
              oninput="value=value.replace(/[^\d]/g,'')"
              class="width200"
              v-model="withTicketFormItem.ticketNum"/>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="addTicketBtn">添加</el-button>
          </el-form-item>
          <el-table :data="withTicketTableData" border stripe class="marBottom15">
            <el-table-column prop="stock_manage_type_name" label="车票类型"/>
            <el-table-column prop="ticket_value" label="面值(元)"/>
            <el-table-column prop="quantity_borrow" label="配票数量(张)"/>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="danger" @click="deleteAddTicket(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <!--备用金信息-->
        <p class="title">备用金信息</p>
        <div class="formBox-top">
          <el-form-item class="marBottom20" label="备用金库存金额(元)：">
            <el-input v-model="withTicketFormItem.allMoney" disabled/>
          </el-form-item>
          <el-form-item class="marBottom20 star" label="操作金额(元)：">
            <el-input
              maxlength="9"
              oninput="value=value.replace(/[^\d\\.]/g,'')"
              @blur="ruleMoneyWithTicket(withTicketFormItem,withTicketFormItem.money,'moneyFlag','moneyTip','allMoney')"
              v-model="withTicketFormItem.money"/>
            <span class="isNotNull" v-if="withTicketFormItem.moneyFlag">{{withTicketFormItem.moneyTip}}</span>
          </el-form-item>
        </div>
        <!--售票员信息-->
        <p class="title">售票员信息</p>
        <div class="formBox-top">
          <el-form-item class="marBottom20 star" label="售票员ID：">
            <el-input
              maxlength="6"
              @blur="blurInput(withTicketFormItem,'userFlag',withTicketFormItem.operatorUser)"
              v-model="withTicketFormItem.operatorUser"
              class="width200"/>
            <span class="isNotNull" v-if="withTicketFormItem.userFlag">必填项不能为空</span>
          </el-form-item>
          <el-form-item class="marBottom20 star" label="密码：">
            <el-input
              maxlength="6"
              @blur="blurInput(withTicketFormItem,'passwordFlag',withTicketFormItem.operatorPassword)"
              v-model="withTicketFormItem.operatorPassword"
              class="width200"
              type="password"/>
            <span class="isNotNull" v-if="withTicketFormItem.passwordFlag">必填项不能为空</span>
          </el-form-item>
        </div>
        <el-form-item>
          <el-button type="primary" v-btn-control :disabled="disabledShow" @click="addTicketAndMoney">提交</el-button>
          <el-button type="warning" @click="resetData">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </Box>
</template>

<script>
  import Box from '../../../components/Box';

  export default {
    name: "BOMOperationAdd",
    components: {Box},
    data() {
      return {
        // 操作类型
        statusList: [],
        // 线路集合
        linesList: [],
        // 车站集合
        stationList: [],
        // 调入调出位置
        linesListArr: [],
        disabledShow: this.$store.state.disabledShow, // 提交禁选
        // 操作员id集合
        operatorIdList: [],
        // 基本信息表单
        formItem: {
          lines: '', // 线路
          station: '', //车站
          operationId: '', // 操作员id
          operate_type: '01', // 操作类型
        },
        // 配票表单
        withTicketFormItem: {
          operatorUser: '', // 售票员ID
          operatorPassword: '', // 密码
          userFlag: false, // 校验售票员标识
          passwordFlag: false, // 校验密码标识
          allMoney: '', // 备用金库存金额
          money: '', // 操作金额
          moneyFlag: false, // 操作金额标识
          moneyTip: '', // 操作金额提示
          type: '', // 车票类型
          allTicket: '', // 车票库存数量
          ticket_value: '', // 面值
          ticketNum: '', // 配票数量
        },
        // 配票车票类型
        ticketTypeList: [],
        // 配票表格
        withTicketTableData: [],
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
        // 获取车票类型接口
        _t.getTicketTypeList();
        _t.getTicketMoney();
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
              _t.withTicketFormItem.allMoney = resData[0].MONEY_AMOUNT_YUAN;
            }
          }
        });
      },
      // 获取车票类型接口
      getTicketTypeList() {
        var _t = this;
        var location = _t.formItem.station ? _t.formItem.station : _t.getCookie('LOCATION_NUMBER'); // 位置编号
        var user_id = _t.formItem.operationId; // 用户id
        if (location !== '' && user_id !== '') {
          let str = 'location_number=' + location + '&operator_id=' + user_id;
          let Base64 = require('js-base64').Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          let postData = {
            flag: 1,
            location_number: location,
            operator_id: user_id,
            token: keyToken,
            pageNum: 1,
            pageSize: 100
          };
          _t.$api.post('/tsGateWay/inventoryListService/ticketTypeQueryGateWay', postData, function (res) {
            if (res.rtCode && res.rtCode === '10005') {
              _t.ticketTypeList = res.rtData === null ? [] : res.rtData;
            }
          });
        }
      },
      // 失去焦点时校验
      blurInput(item, flag, val) {
        item[flag] = val.trim() === '' ? true : false;
      },
      // 配票添加按钮
      addTicketBtn() {
        var _t = this;
        // 校验车票类型是否为空
        if (_t.withTicketFormItem.type !== '') {
          // 不为空校验 配票数量
          if (_t.withTicketFormItem.ticketNum.trim() !== '') {
            // 配票数量不为空 校验格式
            var reg = _t.$config.isNumber();
            if (reg.test(_t.withTicketFormItem.ticketNum.trim()) === false) {
              // 格式不正确
              _t.alertDialogTip(_t, '配票数量格式不正确!');
            } else {
              // 格式正确 校验配票数量是否大于库存数量
              if (_t.withTicketFormItem.ticketNum.trim() * 1 > _t.withTicketFormItem.allTicket * 1) {
                _t.alertDialogTip(_t, '配票数量不能大于库存数量!');
              } else {
                // 可以添加
                _t.addTableData(_t.withTicketTableData, 'stock_manage_type_id', _t.withTicketFormItem, 'type', 'create');
              }
            }
          } else {
            // 配票数量为空
            _t.alertDialogTip(_t, '配票数量不能为空!');
          }
        } else {
          // 为空
          _t.alertDialogTip(_t, '车票类型不能为空!');
        }
      },
      // 对添加数据做处理
      addTableData(arr, id, val, type, flag) {
        var _t = this;
        // 遍历数组看有没有需要添加的数据
        var con = arr.find((item) => {
          if (item[id] === val[type]) {
            return item;
          }
        });
        // 有此项
        if (con !== undefined) {
          con.quantity_borrow = val.ticketNum.trim()
        } else {
          // 没有此项
          var obj = new Object();
          obj.stock_manage_type_id = val[type]; // 车票类型id 作为表格的行id
          var name = _t.ticketTypeList.find((item) => {
            if (item.STOCK_MANAGE_TYPE_ID === val[type]) {
              return item;
            } else {
              return null;
            }
          });
          obj.stock_manage_type_name = name.STOCK_TYPE_NAME_CN;
          obj.ticket_value = val.ticket_value; // 面值
          obj.quantity_borrow = val.ticketNum.trim(); // 票的数量
          // 追加需要多一项领用金额
          if (flag === 'add') {
            obj.receive_ticket_num = '0';
          }
          arr.push(obj);
        }
      },
      // 校验金额
      ruleMoneyWithTicket(item, val, flag, tip, all) {
        var _t = this;
        // 校验是否为空
        if (val.trim() === '') {
          // item[flag] = true;
          // item[tip] = '必填项不能为空';
        } else {
          // 不为空 校验格式
          var reg = _t.$config.isMoneyNumber();
          if (reg.test(val.trim()) === false) {
            item[flag] = true;
            item[tip] = '格式不正确';
          } else {
            // 格式正确 校验是否大于库存
            _t.withTicketFormItem.money = (_t.withTicketFormItem.money.trim() * 1).toFixed(1).toString();
            if (val.trim() * 1 > item[all] * 1) {
              item[flag] = true;
              item[tip] = '操作金额不能大于库存金额';
            } else {
              item[flag] = false;
              item[tip] = '';
            }
          }
        }
      },
      // 配票备用金提交信息
      addTicketAndMoney() {
        var _t = this;
        _t.$store.commit('setShow', true);
        if (_t.formItem.station !== '' && _t.formItem.operationId !== '') {
          // 校验售票员id
          _t.blurInput(_t.withTicketFormItem, 'userFlag', _t.withTicketFormItem.operatorUser);
          // 校验售票员密码
          _t.blurInput(_t.withTicketFormItem, 'passwordFlag', _t.withTicketFormItem.operatorPassword);
          // 校验备用金操作金额
          _t.ruleMoneyWithTicket(_t.withTicketFormItem, _t.withTicketFormItem.money, 'moneyFlag', 'moneyTip', 'allMoney');
          var init = 0;
          // if(_t.withTicketFormItem.money == '0.0') {
          //   init  = false;
          //   _t.alertDialogTip(_t, '备用金操作金额不能为零!')
          //   _t.disabledShow = false;
          // }
          var quantity = 0;
          _t.withTicketTableData.forEach(item => {
            quantity += item.quantity_borrow *1;
            if (item.quantity_borrow == '0') {
              init++;
              _t.$store.commit('setShow', false);
              // _t.alertDialogTip(_t, '配票张数不能为零!')
            }
          });
          var Flag = true;
          if (quantity === 0 && _t.withTicketFormItem.money == '') {
            Flag = false;
            _t.$store.commit('setShow', false);
            _t.alertDialogTip(_t, '配票数量为零和操作金额为空不能同时存在')
          }else if (_t.withTicketTableData.length == 0 && _t.withTicketFormItem.money == '0.0') {
            Flag = false;
            _t.$store.commit('setShow', false);
            _t.alertDialogTip(_t, '配票数量为空的情况下操作金额不能为零!')
          }
          var inpt = true;
          if (init !== 0 && _t.withTicketFormItem.money == '0.0') {
            inpt = false;
            _t.$store.commit('setShow', false);
            _t.alertDialogTip(_t, '表格数据和操作金额不能同时为零!')
          }
          // 校验表格不能为空
          if (1) {
            if (_t.withTicketFormItem.userFlag === false
              && _t.withTicketFormItem.passwordFlag === false
              && _t.withTicketFormItem.moneyFlag === false
              && Flag
              && inpt
            ) {
              // 可以提交
              let str =
                "location_number=" + _t.formItem.station
                + "&operate_type=" + "01"
                + "&bom_operator_id=" + _t.withTicketFormItem.operatorUser.trim()
                + "&password=" + _t.withTicketFormItem.operatorPassword.trim()
                + "&bom_creator_id=" + _t.formItem.operationId;
              let Base64 = require("js-base64").Base64;
              let keyToken = _t.$md5(Base64.encode(str));
              var params = {
                location_number: _t.formItem.station, // 位置编码
                operate_type: '01', // 配票
                bom_operator_id: _t.withTicketFormItem.operatorUser.trim(), // 售票员id
                password: _t.withTicketFormItem.operatorPassword.trim(), // 密码
                bom_creator_id: _t.formItem.operationId, // 操作员id
                reserve_money: Number(_t.withTicketFormItem.money), // 备用金操作金额
                ticket_data: _t.withTicketTableData, // 配票信息表格
                token: keyToken, // token
              };
              _t.$api.post('/tsGateWay/bommanager/allocateticketmoney', params, function (res) {
                if (res.rtCode && res.rtCode === '12001') {
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
            } else {
              _t.$store.commit('setShow', false);
              // _t.alertDialogTip(_t, '填写有误,请重新填写!');
            }
          } else {
            _t.$store.commit('setShow', false);
            // _t.alertDialogTip(_t, '填写有误,请重新填写!');
          }
        } else {
          _t.$store.commit('setShow', false);
          _t.alertDialogTip(_t, '车站及操作员ID不能为空!');
        }
      },
      // 删除配票的表格信息
      deleteAddTicket(index) {
        var _t = this;
        _t.withTicketTableData.splice(index, 1);
      },
      // 改变配票车票类型
      changeWithTicket(val) {
        var _t = this;
        if (val !== '') {
          // 不为空
          _t.ticketTypeList.forEach((item) => {
            // 找到对应的车票类型
            if (item.STOCK_MANAGE_TYPE_ID === val) {
              _t.withTicketFormItem.allTicket = item.TICKET_NUMBER.toString();
              _t.withTicketFormItem.ticket_value = (item.ISSUE_AMOUNT_YUAN * 1).toString();
              _t.withTicketFormItem.ticketNum = ''; // 配票数量清空
            }
          });
        } else {
          // 为空
          _t.withTicketFormItem.allTicket = '0';
          _t.withTicketFormItem.ticket_value = '0';
        }
      },
    },
    created() {
      var _t = this;
      var roleName = _t.getCookie('USER_TYPE');
      var locationNum = _t.getCookie('LOCATION_NUMBER');
      if (locationNum !== null && locationNum !== 'null') {
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
