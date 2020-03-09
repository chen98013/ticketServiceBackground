<template>
  <!-- BOM追加 -->
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
    <!--追加票和备用金-->
    <div class="addTicketAndMoney">
      <el-form :model="addTicketFormItem" inline>
        <!--售票员信息-->
        <p class="title">售票员信息</p>
        <div class="formBox-top">
          <el-form-item class="marBottom20 star" label="售票员ID：">
            <el-input
              maxlength="6"
              @blur="blurInput(addTicketFormItem,'userFlag',addTicketFormItem.operatorUser)"
              class="width200"
              v-model="addTicketFormItem.operatorUser"/>
            <span class="isNotNull" v-if="addTicketFormItem.userFlag">必填项不能为空</span>
          </el-form-item>
          <el-form-item class="marBottom20 star" label="密码：">
            <el-input
              maxlength="6"
              class="width200"
              @blur="blurInput(addTicketFormItem,'passwordFlag',addTicketFormItem.operatorPassword)"
              v-model="addTicketFormItem.operatorPassword"
              type="password"/>
            <span class="isNotNull" v-if="addTicketFormItem.passwordFlag">必填项不能为空</span>
          </el-form-item>
          <el-form-item class="marBottom20">
            <el-button type="primary" v-btn-control @click="getAddData">确定</el-button>
          </el-form-item>
        </div>
        <!--控制表格部分显示隐藏-->
        <div v-if="addTicketFormItem.showModule">
          <!--配票类型-->
          <p class="title">配票信息</p>
          <div class="formBox-top">
            <el-form-item label="车票类型：">
              <el-select
                @change="changeAddTicket(addTicketFormItem.type)"
                v-model="addTicketFormItem.type">
                <el-option
                  v-for="(item,index) in ticketTypeList"
                  :key="index"
                  :label="item.STOCK_TYPE_NAME_CN"
                  :value="item.STOCK_MANAGE_TYPE_ID"/>
              </el-select>
            </el-form-item>
            <el-form-item label="库存数量(张)：">
              <el-input v-model="addTicketFormItem.allTicket" disabled class="width200"/>
            </el-form-item>
            <el-form-item label="面值(元)：">
              <el-input v-model="addTicketFormItem.ticket_value" disabled/>
            </el-form-item>
            <el-form-item label="追加数量(张)：">
              <el-input
                maxlength="9"
                oninput="value=value.replace(/[^\d]/g,'')"
                class="width200"
                v-model="addTicketFormItem.ticketNum"/>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="addToTicketBtn">添加</el-button>
            </el-form-item>
            <el-table :data="addTicketTableData" border stripe>
              <el-table-column prop="stock_manage_type_name" label="车票类型"/>
              <el-table-column prop="ticket_value" label="面值(元)"/>
              <el-table-column prop="receive_ticket_num" label="已领数量(张)"/>
              <el-table-column prop="quantity_borrow_add" label="已追加数量(张)"/>
<!--              <el-table-column prop="quantity_borrow" label="追加数量(张)"/>-->
              <el-table-column label="追加数量(张)">
                <template slot-scope="scope">
                  <span style="float:left">{{scope.row.quantity_borrow}}</span>
                  <i class="el-icon-circle-close reset"  @click="resetRow(scope.$index)"></i>
                </template>
              </el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button v-if="scope.row.show" type="danger" @click="deleteAddToTicket(scope.$index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <!--备用金信息-->
          <p class="title">备用金信息</p>
          <div class="formBox-top">
            <el-form-item class="marBottom20" label="备用金库存金额(元)：">
              <el-input v-model="addTicketFormItem.allMoney" class="width200" disabled/>
            </el-form-item>
            <el-form-item class="marBottom20" label="已领用金额(元)：">
              <el-input v-model="addTicketFormItem.useMoney" class="width200" disabled/>
            </el-form-item>
            <el-form-item class="marBottom20 star" label="追加金额(元)：">
              <el-input
                maxlength="9"
                @blur="ruleMoneyWithTicket(addTicketFormItem,addTicketFormItem.money,'moneyFlag','moneyTip','allMoney')"
                v-model="addTicketFormItem.money"
                class="width200"/>
              <span class="isNotNull" v-if="addTicketFormItem.moneyFlag">{{addTicketFormItem.moneyTip}}</span>
            </el-form-item>
          </div>
          <el-form-item>
            <el-button type="primary" v-btn-control :disabled="disabledShow" @click="addToTicketAndMoney">提交</el-button>
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
    name: "BOMOperationEdit",
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
          operate_type: '02', // 操作类型
        },
        // 追加表单
        addTicketFormItem: {
          operatorUser: '', // 售票员ID
          operatorPassword: '', // 密码
          userFlag: false, // 校验售票员标识
          passwordFlag: false, // 校验密码标识
          type: '', // 车票类型
          allTicket: '', // 车票库存数量
          ticket_value: '', // 面值
          ticketNum: '', // 追加数量
          allMoney: '0', // 备用金库存金额
          useMoney: '0', // 已领用金额
          money: '', // 追加金额
          moneyFlag: false, // 追加金额校验
          moneyTip: '', // 追加金额提示
          showModule: false, // 控制表格区域显示隐藏
        },
        // 追加表格
        addTicketTableData: [],
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
        // // 线路接口调完之后调用查询接口
        _t.getTicketTypeList();
        _t.getTicketMoney();
      },
      // 获取车站的备用金库存金额
      getTicketMoney() {
        var _t = this;
        let str = 'location_number=' + _t.formItem.station
          + '&operator_id=' + _t.formItem.operationId
          + '&stock_type=' + '01';
        // + '&money_state=' + '01';
        let Base64 = require('js-base64').Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        let postData = {
          location_number: _t.formItem.station, // 位置编码
          operator_id: _t.formItem.operationId, // 操作员id
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
              _t.addTicketFormItem.allMoney = resData[0].MONEY_AMOUNT_YUAN;
            }
          }
        });
      },
      // 获取车票类型接口
      getTicketTypeList() {
        var _t = this;
        var location = _t.formItem.station; // 位置编号
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
      // 获取追加的配票信息 领用记录
      getAddData() {
        var _t = this;
        // location_number、操作员id 不为空
        if (_t.formItem.station !== '' && _t.formItem.operationId !== '') {
          // 校验售票员id
          _t.blurInput(_t.addTicketFormItem, 'userFlag', _t.addTicketFormItem.operatorUser);
          // 校验售票员密码
          _t.blurInput(_t.addTicketFormItem, 'passwordFlag', _t.addTicketFormItem.operatorPassword);
          // 可以提交
          if (_t.addTicketFormItem.userFlag === false && _t.addTicketFormItem.passwordFlag === false) {
            let str = "location_number=" + _t.formItem.station
              + "&bom_operator_id=" + _t.addTicketFormItem.operatorUser.trim()
              + "&password=" + _t.addTicketFormItem.operatorPassword.trim()
              + "&bom_creator_id=" + _t.formItem.operationId;
            let Base64 = require("js-base64").Base64;
            let keyToken = _t.$md5(Base64.encode(str));
            var params = {
              flag: '1',
              operate_flag: '0',
              location_number: _t.formItem.station,
              bom_operator_id: _t.addTicketFormItem.operatorUser.trim(),
              password: _t.addTicketFormItem.operatorPassword.trim(),
              bom_creator_id: _t.formItem.operationId,
              token: keyToken
            };
            _t.$api.post('/tsGateWay/bommanager/receivehistoryquery', params, function (res) {
              if (res.rtCode && res.rtCode === '12009') {
                _t.addTicketFormItem.showModule = true; // 显示领用记录
                var resData = res.rtData === null ? {} : res.rtData;
                _t.addTicketFormItem.useMoney = resData.RECEIVE_MOENY_NUM === undefined ? 0 : resData.RECEIVE_MOENY_NUM; // 备用金已领用金额
                var tableData = resData.TICKET_DATA ? resData.TICKET_DATA:[] ; // 领用记录表格
                var tableDataArr = new Array();
                tableData.forEach((item) => {
                  var obj = new Object();
                  obj.stock_manage_type_id = item.STOCK_MANAGE_TYPE_ID ? item.STOCK_MANAGE_TYPE_ID : ''; // 车票类型id
                  obj.stock_manage_type_name = item.STOCK_TYPE_NAME_CN ? item.STOCK_TYPE_NAME_CN : ''; // 车票类型名称
                  obj.ticket_value = item.ISSUE_AMOUNT !== undefined ? item.ISSUE_AMOUNT.toString() : '0'; // 面值 ssy
                  obj.receive_ticket_num = item.RECEIVE_TICKET_NUM !== undefined ? item.RECEIVE_TICKET_NUM.toString() : '0'; // 已领数量 ssy
                  obj.quantity_borrow = '0'; // 追加数量
                  obj.quantity_borrow_add = item.APPEND_TICKET_NUM !== undefined ? item.APPEND_TICKET_NUM.toString() : '0'; // 追加数量 ssy
                  tableDataArr.push(obj);
                });
                _t.addTicketTableData = tableDataArr;
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
      // 追加添加按钮
      addToTicketBtn() {
        var _t = this;
        // 校验车票类型是否为空
        if (_t.addTicketFormItem.type !== '') {
          // 不为空校验 追加数量
          if (_t.addTicketFormItem.ticketNum.trim() !== '') {
            // 追加数量不为空 校验格式
            var reg = _t.$config.isNumber();
            if (reg.test(_t.addTicketFormItem.ticketNum.trim()) === false) {
              // 格式不正确
              _t.alertDialogTip(_t, '追加数量格式不正确!');
            } else {
              // 格式正确 校验配票数量是否大于库存数量
              if (_t.addTicketFormItem.ticketNum.trim() * 1 > _t.addTicketFormItem.allTicket * 1) {
                _t.alertDialogTip(_t, '追加数量不能大于库存数量!');
              } else {
                // 可以添加
                _t.addTableData(_t.addTicketTableData, 'stock_manage_type_id', _t.addTicketFormItem, 'type', 'add');
              }
            }
          } else {
            // 配票数量为空
            _t.alertDialogTip(_t, '追加数量不能为空!');
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
          con.quantity_borrow = (con.quantity_borrow * 1 + val.ticketNum * 1).toString()
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
          obj.quantity_borrow_add = '0'; // 票的数量
          obj.show = true;
          // 追加需要多一项领用金额
          if (flag === 'add') {
            obj.receive_ticket_num = '0';
          }
          arr.push(obj);
        }
      },
      // 追加备用金提交信息
      addToTicketAndMoney() {
        var _t = this;
        _t.$store.commit('setShow', true);
        if (_t.formItem.station !== '' && _t.formItem.operationId !== '') {
          if (_t.addTicketFormItem.showModule) {
            // 校验售票员id
            _t.blurInput(_t.addTicketFormItem, 'userFlag', _t.addTicketFormItem.operatorUser);
            // 校验售票员密码
            _t.blurInput(_t.addTicketFormItem, 'passwordFlag', _t.addTicketFormItem.operatorPassword);

            // 校验表格不能为空
            var quantity = 0;
            var quantityString = true;
            _t.addTicketTableData.forEach(item => {
              if (item.quantity_borrow !== '0') {
                quantity ++;
              }
            });
            if (quantity == 0 && (_t.addTicketFormItem.money == '0' || _t.addTicketFormItem.money == '')) {
              quantityString = false;
              _t.$store.commit('setShow', false);
              _t.alertDialogTip(_t, '追加金额和追加数量不能同时为0或为空!');
              return
            }
            // 校验追加金额
            _t.ruleMoneyWithTicket(_t.addTicketFormItem, _t.addTicketFormItem.money, 'moneyFlag', 'moneyTip', 'allMoney');
            var init = true;
            if (_t.addTicketFormItem.moneyFlag) {
               init = false
             }
            if (_t.addTicketTableData) {
              if (_t.addTicketFormItem.userFlag === false
                && _t.addTicketFormItem.passwordFlag === false
                && quantityString && init) {
                // 可以提交
                let str =
                  "location_number=" + _t.formItem.station
                  + "&operate_type=" + "02"
                  + "&bom_operator_id=" + _t.addTicketFormItem.operatorUser.trim()
                  + "&password=" + _t.addTicketFormItem.operatorPassword.trim()
                  + "&bom_creator_id=" + _t.formItem.operationId;
                let Base64 = require("js-base64").Base64;
                let keyToken = _t.$md5(Base64.encode(str));
                var params = {
                  location_number: _t.formItem.station, // 位置编码
                  operate_type: '02', // 追加
                  bom_operator_id: _t.addTicketFormItem.operatorUser.trim(), // 售票员id
                  password: _t.addTicketFormItem.operatorPassword.trim(), // 密码
                  bom_creator_id: _t.formItem.operationId, // 操作员id
                  reserve_money: Number(_t.addTicketFormItem.money), // 追加金额
                  ticket_data: _t.addTicketTableData, // 表格
                  token: keyToken, // token
                };
                _t.$api.post('/tsGateWay/bommanager/allocateticketmoney', params, function (res) {
                  if (res.rtCode && res.rtCode === '12002') {
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
              _t.alertDialogTip(_t, '表格数据条数不能为空!');
            }
          } else {
            _t.$store.commit('setShow', false);
            _t.alertDialogTip(_t, '请先查询车票备用金领用记录!');
          }
        } else {
          _t.$store.commit('setShow', false);
          _t.alertDialogTip(_t, '车站及操作员ID不能为空!');
        }
      },
      // 删除追加的表格信息
      deleteAddToTicket(index) {
        var _t = this;
        _t.addTicketTableData.splice(index, 1);
      },
      // 重置元素
      resetRow (index) {
        var _t = this;
        _t.addTicketTableData.forEach((item, inx) => {
          if (inx == index) {
            item.quantity_borrow = "0";
          }
        })
      },
      // 改变追加车票类型
      changeAddTicket(val) {
        var _t = this;
        _t.addTicketFormItem.ticketNum = '';
        if (val !== '') {
          // 不为空
          _t.ticketTypeList.forEach((item) => {
            // 找到对应的车票类型
            if (item.STOCK_MANAGE_TYPE_ID === val) {
              _t.addTicketFormItem.allTicket = item.TICKET_NUMBER.toString();
              _t.addTicketFormItem.ticket_value = item.ISSUE_AMOUNT_YUAN.toString();
            }
          });
        } else {
          // 为空
          _t.addTicketFormItem.allTicket = '';
          _t.addTicketFormItem.ticket_value = '';
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
            _t.addTicketFormItem.money = (_t.addTicketFormItem.money.trim() * 1).toFixed(1).toString();
          //@blur="ruleMoneyWithTicket(addTicketFormItem,addTicketFormItem.money,'moneyFlag','moneyTip','allMoney')"
            // _t.addEdit.operate_amount = (_t.addEdit.operate_amount.trim() * 1).toFixed(2).toString();
            // 格式正确 校验是否大于库存
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
  .reset {
    font-size: 20px;
    position: absolute;
    right: 10px;
  }
  .reset:hover {
    color: #E6A23C;
  }
  p.title {
    font-size: 14px;
    margin-bottom: 10px;
  }
</style>
