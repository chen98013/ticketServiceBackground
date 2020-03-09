<template>
  <!--BOM回收-->
  <Box>
    <!--回收-->
    <div class="recycle">
      <el-form :model="recycleFormItem" inline>
        <!--售票员信息-->
        <p class="title">日期时间</p>
        <div class="formBox-top">
          <el-form-item v-if="disabledBtn.createDis" label="线路：" class="marBottom7">
            <el-select
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
          <el-form-item v-if="disabledBtn.createDis" label="车站：" class="star marBottom7">
            <el-select
              clearable
              class="width200"
              v-model="formItem.station">
              <el-option
                v-for="(item,index) in stationList"
                :key="index"
                :label="item.STATION_LOCATION_NAME"
                :value="item.LOCATION_NUMBER.toString()"/>
            </el-select>
            <span class="isNotNull" v-if="recycleFormItem.station">必填项不能为空</span>
          </el-form-item>
          <el-form-item class="marBottom20 star" label="日期：">
            <el-date-picker
              v-model="formItem.dateTime"
              type="date"
              placeholder="选择日期"
              :picker-options="pickerOptions"/>
            <span class="isNotNull" v-if="recycleFormItem.dateTime">必填项不能为空</span>
          </el-form-item>
          <el-form-item class="marBottom20">
            <el-button type="primary" @click="getHandleUser">确认</el-button>
          </el-form-item>
        </div>
        <div class="showBtn" v-if="recycleFormItem.showBtn">
          <el-button type="primary" @click="handleShow">其他用户</el-button>
        </div>
        <div v-if="recycleFormItem.showModule">
          <!--车票回收信息-->
          <p class="title">车票回收信息</p>
          <el-table :data="recycleTableData" border stripe class="marBottom10">
            <el-table-column prop="stock_manage_type_name" label="车票类型"/>
            <el-table-column prop="ticket_value" label="面值(元)"/>
            <el-table-column prop="use_ticket_number" label="配票数量(张)"/>
            <el-table-column prop="add_ticket_number" label="追加数量(张)"/>
            <el-table-column prop="RECOVER_TICKET_NUM" label="归还数量(张)"></el-table-column>
            <el-table-column prop="lose_ticket_num" label="遗失票卡(张)"></el-table-column>
            <el-table-column prop="wu_xiao_ticket_num" label="无效票卡(张)"></el-table-column>
            <el-table-column prop="other_ticket_number" label="其他(张)"></el-table-column>
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
          <!--回收信息-->
          <p class="title">回收信息</p>
          <div class="formBox-top">
            <el-form-item class="marBottom20 star" label="回收金额(元)：">
              <el-input
                disabled
                v-model="recycleFormItem.money"
                class="width200"/>
              <span class="isNotNull" v-model="recycleFormItem.moneyFlag">{{recycleFormItem.moneyTip}}</span>
            </el-form-item>
          </div>
        </div>
        <div v-show="recycleFormItem.userid">
          <el-table
            strip
            :data="recycleTableuUser"
            highlight-current-row
            @row-click="handleRowChange"
            @current-change="handleCurrentChange"
            border stripe class="marBottom10">
<!--            <el-table-column fixed label="请选择" align="center" width="80">-->
<!--              <template slot-scope="scope">-->
<!--                <el-radio-->
<!--                  v-model="radio"-->
<!--                  :label="scope.row.ROW_ID"-->
<!--                >&nbsp;-->
<!--                </el-radio>-->
<!--              </template>-->
<!--            </el-table-column>-->
            <el-table-column prop="BOM_OPERATOR_ID" label="用户id"/>
            <el-table-column prop="USERNAME" label="用户名称"/>
          </el-table>
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
       disabledBtn: {
         createDis: false
       },
        // 操作类型
        statusList: [],
        // 线路集合
        linesList: [],
        // 车站集合
        stationList: [],
        // 操作员id集合
        operatorIdList: [],
        // 禁选日期
        pickerOptions: {
          disabledDate(time) {
            return time.getTime() > Date.now();
          },
        },
        radio: '',
        recycleTableuUser: [],
        // 基本信息表单
        formItem: {
          lines: '', // 线路
          station: '', //车站
          operationId: '', // 操作员id
          operate_type: '04', // 操作类型
          dateTime: new Date,// 时间
        },
        dateVale: '',
        // 回收表单
        recycleFormItem: {
          station: false,
          showBtn: false, // 其他用户
          userid: false, // 用户表格
          operatorUser: '', // 售票员ID
          operatorPassword: '', // 密码
          dateTime: false, //时间标识
          sendMoney: '0', // 配备金额
          addMoney: '0', // 追加金额
          allMoney: '0', // 收益预收总金额
          money: '', // 回收金额
          moneyFlag: false, // 回收金额校验
          moneyTip: '', // 回收金额提示
          showModule: false, // 控制表格区域显示隐藏
        },
        // 回收表格
        recycleTableData: [],
        // 从cookie中获取
        cookieMap: {
          location_number: this.getCookie('LOCATION_NUMBER'), // 位置编号
          user_id: this.getCookie('USER_ID'), // 操作员ID
          role: this.getCookie('USER_TYPE'), // 用户角色
        }
      }
    },
    methods: {
      // 用户ID用户名称 点击表格
      handleCurrentChange(val) {
        this.currentRow = val;
      },
      // 其他用户
      handleShow () {
       var _t = this;
       _t.recycleFormItem.showModule = false;
        _t.recycleFormItem.showBtn = false;
       _t.recycleFormItem.userid = true;
      },
      // 获取某一行的数据
      handleRowChange(row){
        var _t =this;
        _t.recycleFormItem.operatorUser = row.BOM_OPERATOR_ID;
        _t.radio = row.ROW_ID;
        _t.getRecycleData();
      },
      // 取消按钮
      resetData() {
        var _t = this;
        _t.$router.push({name: 'BOMOperation'});
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
      // 失去焦点时校验
      blurInput(item, flag, val) {
        item[flag] = val? true : false;
      },
      // 改变线路
      changeLines(val) {
        var _t = this;
        if (val !== "") {
          _t.linesList.forEach(item => {
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
              _t.formItem.station = "";
              // 操作员下拉框置空
              _t.operatorIdList = [];
              // 操作员id置空
              _t.formItem.operationId = "";
            }
          });
        } else {
          // 选中线路为空
          _t.stationList = [];
          _t.formItem.station = "";
          _t.operatorIdList = [];
          _t.formItem.operationId = "";
        }
      },
      // 查询线路及车站
      getLinesAndStation() {
        var _t = this;
        _t.$api.post("/tsGateWay/ticketUtility/locationCascadeQuery", {}, function (res) {
            // 查到线路信息
            if (res.rtCode && res.rtCode === "14007") {
              var linesStationArr = res.rtData === null ? [] : res.rtData;
              // 处理线路/车站/操作员数据
              _t.dealWithLinesAndStation(linesStationArr);
            } else if (res.rtCode) {
              _t.alertDialogTip(_t, res.rtMessage);
            }
          }
        );
      },
      // 处理线路及车站首次加载数据问题
      dealWithLinesAndStation(linesStationArr) {
        var _t = this;
        // 判断角色
        var role = _t.getCookie("USER_TYPE");
        var location = _t.getCookie("LOCATION_NUMBER").toString();
        // 角色和location都不为空
        if (
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

                          }
                        });
                      });
                    }
                  }
                })
              }
            });
            _t.linesList = linesArr;
            _t.stationList = stationArr;
            _t.operatorIdList = operationArr;
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
      },
      p(s) {
        return s < 10 ? '0' + s : s
      },
        //时间查询用户
      getHandleUser() {
        var _t = this;
        _t.recycleFormItem.dateTime = false;
        _t.recycleFormItem.station = false;
        if (!_t.formItem.dateTime) {
          _t.recycleFormItem.dateTime = true
        }
        var init = true;
        if (_t.getCookie('LOCATION_TYPE_ID') == '22') {
           if(_t.formItem.station == '') {
             _t.recycleFormItem.station = true;
             init =false
           }
        }
       var d =  new Date(_t.formItem.dateTime);
        const resDate = d.getFullYear() + '-' + _t.p((d.getMonth() + 1)) + '-' + _t.p(d.getDate());
        if (resDate && init) {
          var params = {
            pageSize: 10,
            pageNum: 1,
            location_number:_t.formItem.station?_t.formItem.station:_t.cookieMap.location_number.toString(),
            balance_date: resDate
          };
          _t.$api.post('/tsGateWay/bommanager/queryHistoryOperator', params, function (res) {
            if (res.rtCode && res.rtCode === '12012') {
               _t.recycleFormItem.userid = true;
               _t.recycleFormItem.showModule = false;
               _t.recycleFormItem.showBtn = false;
              _t.recycleTableuUser = res.rtData
            } else if (res.rtCode) {
              _t.alertDialogTip(_t, res.rtMessage);
            }
          })
        }
      },
      // 获取回收信息
      getRecycleData() {
        var _t = this;
        var d =  new Date(_t.formItem.dateTime);
        var loction =_t.formItem.station?_t.formItem.station:_t.cookieMap.location_number.toString()
        const resDate = d.getFullYear() + '-' + _t.p((d.getMonth() + 1)) + '-' + _t.p(d.getDate());
        if (1) {
          // _t.blurInput(_t.recycleFormItem, 'passwordFlag', _t.recycleFormItem.operatorPassword);
          // 可以提交
          if (_t.recycleFormItem.operatorUser) {
            let str = "location_number=" + loction
              + "&bom_operator_id=" + _t.recycleFormItem.operatorUser
              + "&password=" + _t.recycleFormItem.operatorPassword.trim()
              + "&bom_creator_id=" + _t.cookieMap.user_id.toString();
            let Base64 = require("js-base64").Base64;
            let keyToken = _t.$md5(Base64.encode(str));
            var params = {
              flag: '0',
              operate_flag: '1',
              location_number: loction,
              bom_operator_id: _t.recycleFormItem.operatorUser,
              password: _t.recycleFormItem.operatorPassword.trim(),
              bom_creator_id: _t.cookieMap.user_id.toString(),
              balance_date: resDate,
              token: keyToken
            };
            _t.$api.post('/tsGateWay/bommanager/receivehistoryquery', params, function (res) {
              if (res.rtCode && res.rtCode === '12009') {
                _t.recycleFormItem.userid = false;
                _t.recycleFormItem.showBtn = true;
                _t.recycleFormItem.showModule = true; // 显示领用记录
                var resData = res.rtData === null ? {} : res.rtData; // data
                var tableData = resData.TICKET_DATA ? resData.TICKET_DATA : []; // 领用记录表格
                var tableDataArr = new Array();
                  tableData.forEach((item) => {
                  var obj = new Object();
                  obj.stock_manage_type_id = item.STOCK_MANAGE_TYPE_ID ? item.STOCK_MANAGE_TYPE_ID : ''; // 车票类型id
                  obj.stock_manage_type_name = item.STOCK_TYPE_NAME_CN ? item.STOCK_TYPE_NAME_CN : ''; // 车票类型名称
                  obj.ticket_value = item.issue_amount_yuan !== undefined ? item.issue_amount_yuan.toString() : '0'; // 面值 ssy
                  obj.use_ticket_number = item.RECEIVE_TICKET_NUM !== undefined ? item.RECEIVE_TICKET_NUM.toString() : '0'; // 配票数量 ssy
                  obj.add_ticket_number = item.APPEND_TICKET_NUM !== undefined ? item.APPEND_TICKET_NUM.toString() : '0'; // 追加数量 ssy
                  obj.return_ticket_number = item.return_ticket_number; // 归还数量
                  obj.lose_ticket_num = item.lose_ticket_num; // 遗失票卡
                  obj.wu_xiao_ticket_num = item.wu_xiao_ticket_num?item.wu_xiao_ticket_num: '0'; // 无效票卡
                  obj.other_ticket_number = item.other_ticket_number; // 其他
                  obj.RECOVER_TICKET_NUM = item.RECOVER_TICKET_NUM;
                  tableDataArr.push(obj);
                });
                // 车票回收信息
                _t.recycleTableData = tableDataArr;

                _t.recycleFormItem.sendMoney = resData.RECEIVE_MOENY_NUM !== undefined ? resData.RECEIVE_MOENY_NUM.toString() : '0';

                _t.recycleFormItem.addMoney = resData.APPEND_MOENY_NUM;

                _t.recycleFormItem.allMoney = resData.EARNING_MOENY_NUM !== undefined ? resData.EARNING_MOENY_NUM.toString() : '0';
                _t.recycleFormItem.money = resData.RECOVER_MOENY_NUM !== undefined ? resData.RECOVER_MOENY_NUM.toString() : '0';
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

      // 校验回收金额
      ruleRecycleData(val) {
        var _t = this;
        if (val.trim() === '') {
          _t.recycleFormItem.moneyFlag = true;
          _t.recycleFormItem.moneyTip = '必填项不能为空';
        } else {
          // 校验格式
          var reg = _t.$config.isMoneyNumber();
          if (reg.test(val.trim()) === false) {
            _t.recycleFormItem.moneyFlag = true;
            _t.recycleFormItem.moneyTip = '格式不正确';
          } else {
            // 格式正确
            _t.recycleFormItem.moneyFlag = false;
            _t.recycleFormItem.moneyTip = '';
          }
        }
      }
    },
    created() {
      var _t = this;
      // _t.formItem.dateTime = _t.getCookie('TIME');
      var locationNum = _t.getCookie('LOCATION_NUMBER');
      if (locationNum !== null && locationNum !== 'null') {
        _t.getStatusData();
        if (_t.getCookie('LOCATION_TYPE_ID') == '22') {
          _t.getLinesAndStation();
          _t.disabledBtn.createDis = true;
        }

      }
    }
  }
</script>

<style scoped>
  .showBtn {
    margin-bottom: 15px;
  }
  p.title {
    font-size: 14px;
    margin-bottom: 10px;
  }
</style>
