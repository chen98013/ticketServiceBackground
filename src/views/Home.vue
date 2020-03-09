<template>
  <div>
    <!-- 平铺布局 -->
    <div v-if="isMLC === true">
      <!--  若干车站长短款记录  -->
      <div v-if="limitBtn.stationMoney" class="marBottom50">
        <p class="title">{{ formItem.LOCATION_NUMBER_NAME}} - 长短款记录</p>
        <div id="moneyRecordMLC" class="eCharts"></div>
      </div>
      <!--  若干车站车票、备用金、收益库存  -->
      <div v-if="limitBtn.stationNumber" class="marBottom50">
        <p class="title">{{ formItem.LOCATION_NUMBER_NAME}} - 车票、备用金、收益库存</p>
        <div id="inventoryMLC" class="eCharts"></div>
      </div>
      <ul class="home_list clearFix">
        <li v-if="limitBtn.BOMInfo">
          <!--  待审核BOM单据  -->
          <p class="title">待结算提交BOM单据</p>
          <el-table class="isNotBtnTable" :data="BOMData" border>
            <el-table-column prop="STATION_NAME" label="位置/车站"/>
            <el-table-column prop="ORDER_ID" label="单据号"/>
            <el-table-column prop="OPERATE_TYPE_NAME" label="单据类型"/>
          </el-table>
          <div class="tr">
            <el-button type="text" @click="clickMore('BOM')">查看更多...</el-button>
          </div>
        </li>
        <!--  待审核TVM单据  -->
        <li v-if="limitBtn.TVMInfo">
          <p class="title">待结算提交TVM单据</p>
          <el-table class="isNotBtnTable" :data="TVMData" border>
            <el-table-column prop="STATION_NAME" label="位置/车站"/>
            <el-table-column prop="ORDER_ID" label="单据号"/>
            <el-table-column prop="OPERATE_TYPE_NAME" label="单据类型"/>
          </el-table>
          <div class="tr">
            <el-button type="text" @click="clickMore('TVM')">查看更多...</el-button>
          </div>
        </li>
        <!--  当前位置短款单据  -->
        <li v-if="limitBtn.shortBill">
          <p class="title">当前位置短款单据</p>
          <el-table class="isNotBtnTable" :data="shortData" border>
            <el-table-column prop="station_name" label="位置/车站"/>
            <el-table-column prop="guid" label="单据号"/>
            <el-table-column prop="difference_total_amount_yuan" label="金额"/>
            <el-table-column prop="issue_name" label="单据状态"/>
          </el-table>
          <div class="tr">
            <el-button type="text" @click="clickMore('shortage')">查看更多...</el-button>
          </div>
        </li>
        <!--  当前位置若干车票调配单据  -->
        <li v-if="limitBtn.ticketWith">
          <p class="title">当前位置{{ formItem.LOCATION_NUMBER_NAME}}车票调配单据</p>
          <el-table class="isNotBtnTable" :data="ticketData" border>
            <el-table-column prop="ORDER_ID" label="单据号"/>
            <el-table-column prop="IMPORT_STATION_NAME" label="调入位置"/>
            <el-table-column prop="EXPORT_STATION_NAME" label="调出位置"/>
            <el-table-column prop="ORDER_STATE_NAME" label="单据状态"/>
          </el-table>
          <div class="tr">
            <el-button type="text" @click="clickMore('ticketTransfers')">查看更多调拨单...</el-button>
            <el-button type="text" @click="clickMore('ticketHandIn')">查看更多上交单...</el-button>
            <el-button type="text" @click="clickMore('ticketWith')">查看更多配发单...</el-button>
          </div>
        </li>
        <!--  当前位置备用金调配单据  -->
        <li v-if="limitBtn.moneyWith">
          <p class="title">当前位置备用金调配单据</p>
          <el-table class="isNotBtnTable" :data="moneyData" border>
            <el-table-column prop="ORDER_ID" label="单据号"/>
            <el-table-column prop="IMPORT_STATION_NAME" label="调入位置"/>
            <el-table-column prop="EXPORT_STATION_NAME" label="调出位置"/>
            <el-table-column prop="ORDER_TYPE_NAME" label="单据类型"/>
          </el-table>
          <div class="tr">
            <el-button type="text" @click="clickMore('standMoneyWith')">查看更多配发单...</el-button>
            <el-button type="text" @click="clickMore('standMoneyHandIn')">查看更多上交单...</el-button>
            <el-button type="text" @click="clickMore('standMoneyRecycle')">查看更多回收单...</el-button>
          </div>
        </li>
      </ul>
    </div>
    <!--分段式布局-->
    <div v-if="isMLC === false">
      <div class="displayFlexRow">
        <div class="flex_1  borderRight paddingRight20">
          <div v-if="limitBtn.BOMInfo" class="marBottom50">
            <!--  待审核BOM单据  -->
            <p class="title">待结算提交BOM单据</p>
            <el-table class="isNotBtnTable" :data="BOMData" border>
              <el-table-column prop="STATION_NAME" label="位置/车站"/>
              <el-table-column prop="ORDER_ID" label="单据号"/>
              <el-table-column prop="OPERATE_TYPE_NAME" label="单据类型"/>
            </el-table>
            <div class="tr">
              <el-button type="text" @click="clickMore('BOM')">查看更多...</el-button>
            </div>
          </div>
          <!--  待审核TVM单据  -->
          <div v-if="limitBtn.TVMInfo">
            <p class="title">待结算提交TVM单据</p>
            <el-table class="isNotBtnTable" :data="TVMData" border>
              <el-table-column prop="STATION_NAME" label="位置/车站"/>
              <el-table-column prop="ORDER_ID" label="单据号"/>
              <el-table-column prop="OPERATE_TYPE_NAME" label="单据类型"/>
            </el-table>
            <div class="tr">
              <el-button type="text" @click="clickMore('TVM')">查看更多...</el-button>
            </div>
          </div>
        </div>
        <div class="flex_2  paddingLeft20 paddingRight20">
          <!--  若干车站长短款记录  -->
          <div v-if="limitBtn.stationMoney" class="marBottom50">
            <p class="title">{{ formItem.LOCATION_NUMBER_NAME}} - 长短款记录</p>
            <div id="moneyRecordSC" class="eCharts"></div>
          </div>
          <!--  若干车站车票、备用金、收益库存  -->
          <div v-if="limitBtn.stationNumber">
            <p class="title">{{ formItem.LOCATION_NUMBER_NAME}} - 备用金、收益库存</p>
            <div id="inventorySC" class="eCharts"></div>
          </div>
        </div>
        <div class="flex_3  borderLeft paddingLeft20">
          <!--  当前位置短款单据  -->
          <div v-if="limitBtn.shortBill" class="marBottom50">
            <p class="title">当前位置短款单据</p>
            <el-table class="isNotBtnTable" :data="shortData" border>
              <el-table-column prop="station_name" label="位置/车站"/>
              <el-table-column prop="guid" label="单据号"/>
              <el-table-column prop="difference_total_amount_yuan" label="金额"/>
              <el-table-column prop="issue_name" label="单据状态"/>
            </el-table>
            <div class="tr">
              <el-button type="text" @click="clickMore('shortage')">查看更多...</el-button>
            </div>
          </div>
          <!--  当前位置若干车票调配单据  -->
          <div v-if="limitBtn.ticketWith" class="marBottom50">
            <p class="title">当前位置{{ formItem.LOCATION_NUMBER_NAME}}车票调配单据</p>
            <el-table class="isNotBtnTable" :data="ticketData" border>
              <el-table-column prop="ORDER_ID" label="单据号"/>
              <el-table-column prop="IMPORT_STATION_NAME" label="调入位置"/>
              <el-table-column prop="EXPORT_STATION_NAME" label="调出位置"/>
              <el-table-column prop="ORDER_STATE_NAME" label="单据状态"/>
            </el-table>
            <div class="tr">
              <el-button type="text" @click="clickMore('ticketTransfers')">查看更多调拨单...</el-button>
              <el-button type="text" @click="clickMore('ticketHandIn')">查看更多上交单...</el-button>
              <el-button type="text" @click="clickMore('ticketWith')">查看更多配发单...</el-button>
            </div>
          </div>
          <!--  当前位置备用金调配单据  -->
          <div v-if="limitBtn.moneyWith">
            <p class="title">当前位置备用金调配单据</p>
            <el-table class="isNotBtnTable" :data="moneyData" border>
              <el-table-column prop="ORDER_ID" label="单据号"/>
              <el-table-column prop="IMPORT_STATION_NAME" label="调入位置"/>
              <el-table-column prop="EXPORT_STATION_NAME" label="调出位置"/>
              <el-table-column prop="ORDER_TYPE_NAME" label="单据类型"/>
            </el-table>
            <div class="tr">
              <el-button type="text" @click="clickMore('standMoneyWith')">查看更多配发单...</el-button>
              <el-button type="text" @click="clickMore('standMoneyHandIn')">查看更多上交单...</el-button>
              <el-button type="text" @click="clickMore('standMoneyRecycle')">查看更多回收单...</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Box from '../components/Box';
  import {dateFilterThisDay} from "../assets/js/filters";
  import {getBeforeDate} from '../config/uitls'
  export default {
    name: "Home",
    data() {
      return {
        // 位置表单
        formItem: {
          OPERATOR_ID: this.getCookie('USER_ID'), // 工号
          OPERATOR_NAME: this.getCookie('USER_NAME'), // 姓名
          LOCATION_NUMBER_NAME: this.getCookie('LOCATION_NUMBER_NAME')
        },
        // 待审核BOM单据
        BOMData: [],
        // 待审核TVM单据
        TVMData: [],
        // 当前位置长短款单据
        shortData: [],
        // 若干车票调配单据
        ticketData: [],
        // 若干备用金调配单据
        moneyData: [],
        // 区域权限
        limitBtn: {
          BOMInfo: false, // BOM单据
          TVMInfo: false, // TVM单据
          stationMoney: false, // 若干车站长短款记录
          stationNumber: false, // 若干车站车票、备用金、收益库存
          shortBill: false, // 当前位置短款单据
          ticketWith: false, // 当前位置车票调配单据
          moneyWith: false, // 当前位置备用金调配单据
          tiled: false,  // 平铺布局
          subsection: false, // 分段式布局
        },
        // 布局结构
        isMLC: '', // MLC一种, SC一种
        // 车站长短款记录
        // 长短款数据处理
        ParagraphData: {
          // 五天前
          fiveDay: getBeforeDate(-5),
          // 四天前
          fourDay: getBeforeDate(-4),
          // 三天前
          threeDay: getBeforeDate(-3),
          // 两天前
          twoDay: getBeforeDate(-2),
          //  昨天
          yesterday: getBeforeDate(-1),
        },
        // 长短款数组
        optionsMoney: {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }

          },
          legend: {
            data: ['BOM长款', 'BOM短款', 'TVM长款', 'TVM短款']
          },
          color: ["#EAEA26", "#906BF9", "#FE5656", "#01E17E", "#3DD1F9", "#FFAD05"],
          grid: {
            left: '1%',
            right: '1%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: function () {
              var list = [];
              for (var i = 1; i <= 5; i++) {
                var date1 = new Date();
                var date2 = new Date(date1);
                date2.setDate(date1.getDate() - i);
                var time2 = date2.getFullYear() + "-" + (date2.getMonth() + 1) + "-" + date2.getDate();
                list.push(time2);
              }
              return list;
            }()

          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              name: 'BOM长款',
              type: 'bar',
              data: []
            },
            {
              name: 'BOM短款',
              type: 'bar',
              data: []
            },
            {
              name: 'TVM长款',
              type: 'bar',
              data: []
            },
            {
              name: 'TVM短款',
              type: 'bar',
              data: []
            }
          ]
        },
        // 车站库存
        optionsInventory: {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          legend: {
            data: ['备用金-余额', '备用金-已领用', '备用金-冻结', '收益库存']
          },
          color: ['#546ef3', '#a6cb09', '#f8bd00', "#3DD1F9"],
          grid: {
            left: '1%',
            right: '1%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: [this.getCookie('LOCATION_NUMBER_NAME')]

          },
          yAxis: {
            type: 'value',
          },
          series: [
            {
              name: '备用金-余额',
              type: 'bar',
              data: []
            },
            {
              name: '收益库存',
              type: 'bar',
              data: []
            },
            {
              name: '备用金-已领用',
              type: 'bar',
              data: []
            },
            {
              name: '备用金-冻结',
              type: 'bar',
              data: []
            }

          ]
        },
        // 车站库存变量

        // 从cookie中获取
        cookieMap: {
          location_number: this.getCookie('LOCATION_NUMBER'),
          role: this.getCookie('USER_TYPE'),
          user_id: this.getCookie('USER_ID'), // 操作员ID
        }
      }
    },
    methods: {
      // 获取接口数据
      getData(limitBtnArr) {
        var _t = this;
        _t.$store.commit('setLoading', false);
        // 区域权限
        limitBtnArr.forEach((item) => {
          // 待审核BOM单据
          if (item.MENU_ID === "MENU20190903105902iftkYmLoivdbXu") {
            _t.limitBtn.BOMInfo = true; // BOM单据
          }
          // 分段式布局
          if (item.MENU_ID === "MENU20191111110142VcOrTgPvjtvQBU") {
            _t.limitBtn.subsection = true; //  分段式布局
          }
          // 平铺布局
          if (item.MENU_ID === "MENU20191111110053AvtEgMJevORbAv") {
            _t.limitBtn.tiled = true; //   平铺布局
          }

          // 待审核TVM单据
          if (item.MENU_ID === "MENU20190903105927lWNnpTAIkaNILd") {
            _t.limitBtn.TVMInfo = true; // TVM单据
          }
          // 若干车站长短款记录
          if (item.MENU_ID === "MENU20190903110434weRIFLpghCCKJV") {
            _t.limitBtn.stationMoney = true; // 若干车站长短款记录
          }
          // 车票备用金收益库存
          if (item.MENU_ID === "MENU20190903110509mTTBmHpPaCyLfi") {
            _t.limitBtn.stationNumber = true; // 若干车站车票、备用金、收益库存
          }
          // 当前位置短款单据
          if (item.MENU_ID === "MENU20190903110538cIwJQhnuBQbdOh") {
            _t.limitBtn.shortBill = true; // 当前位置短款单据
          }
          // 若干位置车票调用单据
          if (item.MENU_ID === "MENU20190903110616ydhAWDDHUVgExc") {
            _t.limitBtn.ticketWith = true; // 当前位置车票调配单据
          }
          // 若干位置备用金调配单据
          if (item.MENU_ID === "MENU20190903110641WXIdanLItHjdVJ") {
            _t.limitBtn.moneyWith = true; // 当前位置备用金调配单据
          }
        });
        // 处理调用的接口以及显示页面的方式
        _t.dealDataAndDrawPage();
      },
      // 处理调用的接口以及显示页面的方式
      dealDataAndDrawPage() {
        var _t = this;
        // 判断是MLC登录还是SC登录从而判断加载哪种布局结构
        var user_type = _t.cookieMap.role;
        var location_number = _t.cookieMap.location_number;
        if (_t.limitBtn.subsection) {
          _t.isMLC = false;
        } else if (_t.limitBtn.tiled) {
          _t.isMLC = true;
        } else {
          _t.isMLC = '';
        }
        // 查询待审核BOM单据
        if (_t.limitBtn.BOMInfo) {
          _t.getAuditBOMData(location_number, _t.formItem.OPERATOR_ID);
        }
        // 查询待审核TVM单据
        if (_t.limitBtn.TVMInfo) {
          _t.getAuditTVMData(location_number, _t.formItem.OPERATOR_ID);
        }
        // 查询若干车站长短款记录
        if (_t.limitBtn.stationMoney) {
          _t.getStationMoneyRecord();
        }
        // 查询若干车站车票、备用金、收益库存
        if (_t.limitBtn.stationNumber) {
           _t.getStationInventoryRecord();
        }
        // 查询当前位置短款单据
        if (_t.limitBtn.shortBill) {
          _t.getShortData(location_number, _t.formItem.OPERATOR_ID);
        }
        // 查询当前位置车票调配单据
        if (_t.limitBtn.ticketWith) {
          _t.getTicketWithData(location_number, _t.formItem.OPERATOR_ID);
        }
        // 查询当前位置备用金调配单据
        if (_t.limitBtn.moneyWith) {
          _t.getMoneyWithData(location_number, _t.formItem.OPERATOR_ID);
        }
      },
      // 点击查看更多
      clickMore(flag) {
        var _t = this;
        if (flag === 'BOM') {
          // 待审核BOM单据
          _t.$router.push({name: "BOMOperation"});
        } else if (flag === 'TVM') {
          // 待审核TVM单据
          _t.$router.push({name: "TVMOperation"});
        } else if (flag === 'shortage') {
          // 短款
          _t.$router.push({name: "profitLengthBills"});
        } else if (flag === 'ticketTransfers') {
          // 车票调拨单
          _t.$router.push({name: "ticketTransfers"});
        } else if (flag === 'ticketHandIn') {
          // 车票上交单
          _t.$router.push({name: "ticketUpper"});
        } else if (flag === 'ticketWith') {
          // 车票配发单
          _t.$router.push({name: "ticketAllotment"});
        } else if (flag === 'standMoneyWith') {
          // 备用金配发单
          _t.$router.push({name: "spareAllotment"});
        } else if (flag === 'standMoneyHandIn') {
          // 备用金上交单
          _t.$router.push({name: "spareUpper"});
        } else if (flag === 'standMoneyRecycle') {
          // 备用金回收单
          _t.$router.push({name: "spareRecycle"});
        }
      },
      // 车站备用金
      getPettyData() {
        var _t = this;
        var location_number = _t.cookieMap.location_number; // 发送请求的 位置编号
        var location_number_query = ''; // 发送请求的 位置编号
        if (location_number !== '' && _t.cookieMap.user_id !== null && _t.cookieMap.user_id !== 'null') {
          let str = 'location_number=' + location_number
            + '&operator_id=' + _t.cookieMap.user_id
            + '&stock_type=' + '01';
          let Base64 = require('js-base64').Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          let postData = {
            location_number: location_number, // 位置编码
            operator_id: _t.cookieMap.user_id, // 操作员id
            token: keyToken, // token
            stock_type: '01', // 01 备用金
            pageNum: 1, // 当前页
            pageSize: 100, // 每页显示条数
          };
          _t.$api.post('/tsGateWay/readyMoney/readyMoneyStockQueryGateWay', postData, function (res) {
            if (res.rtCode && res.rtCode === '11101') {
              var optionsObject = {
                // 备用金余额
                balance: 0,
                // 备用金已领用
                receiveed: 0,
                //  备用金冻结
                freeze: 0
              };
              res.rtData.forEach(item => {
                if (item.MONEY_STATE == '01') {
                  // 余额
                  optionsObject.balance += parseInt(item.MONEY_AMOUNT_YUAN)
                } else if (item.MONEY_STATE == '02') {
                  // 已领用
                  optionsObject.receiveed += parseInt(item.MONEY_AMOUNT_YUAN)
                } else if (item.MONEY_STATE == '03') {
                  // 冻结
                  optionsObject.freeze += parseInt(item.MONEY_AMOUNT_YUAN)
                }

              })
              _t.optionsInventory.series.forEach(item => {
                if (item.name == '备用金-余额') {
                  item.data.push(optionsObject.balance)
                } else if (item.name == '备用金-已领用') {
                  item.data.push(optionsObject.receiveed)
                } else if (item.name == '备用金-冻结') {
                  item.data.push(optionsObject.freeze)
                }
              });
              _t.getStationInventoryRecord()
            } else if (res.rtCode) {
              _t.alertDialogTip(_t, res.rtMessage);
            }
          });
        }
      },
      // 获取收益管理
      getEarnings() {
        var _t = this;
        var location_number = _t.getCookie("LOCATION_NUMBER"); // 位置编号
        var user_id = _t.getCookie("USER_ID"); // 用户id
        let str = "userid=" + user_id + "&location_number=" + location_number;
        let Base64 = require("js-base64").Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        let postData = {
          userid: user_id, //登录用户
          location_number: location_number, // 位置编码
          location_number_query: location_number, // 位置编码
          token: keyToken, // token
          stock_state: "", // 状态
          pageNum: 1, // 当前页
          pageSize: 100 // 每页显示条数
        };
        _t.$api.post("/tsGateWay/incomeMoney/searchMoneyStockGateWay", postData, function (res) {
            _t.$store.commit("setLoading", false);
            if (res.rtCode && res.rtCode === "11001") {
              var optionsObject = {
                // 收益
                earnings: 0
              };
              res.rtData.forEach(item => {
                optionsObject.earnings += Number(item.money_amount_yuan);
              });
              _t.optionsInventory.series.forEach(item => {
                 if(item.name == '收益库存') {
                   item.data.push(optionsObject.earnings)
                 }
              });
              _t.getStationInventoryRecord()
            } else {
              _t.alertDialogTip(_t, res.rtData);
            }
          }
        )
      },
      // 获取待审核BOM表格
      getAuditBOMData(location_number, operator_id) {
        var _t = this;
        var params = {
          location_number: location_number, // 位置
          bom_operator_id: operator_id, // 操作员id
          order_id: null, // 单据号
          operate_type: null, // 单据类型
          operate_state: '01', // 单据状态 01待审核
          start_dt: dateFilterThisDay(new Date().getTime()), // 开始时间
          end_dt: null, // 结束时间
          pageNum: 1, // 当前页
          pageSize: 5, //每页显示条数
        };
        _t.$api.post("/tsGateWay/bommanager/operationListQuery", params, function (res) {
          if (res.rtCode && res.rtCode === "12006") {
            _t.BOMData = res.rtData === null ? [] : res.rtData;
          } else if (res.rtCode) {
            _t.BOMData = [];
          }
        });
      },
      // 获取待审核TVM表格
      getAuditTVMData(location_number, operator_id) {
        var _t = this;
        let params = {
          location_number: location_number, // 位置
          tvm_creator_id: operator_id, // 操作员id
          order_id: null, // 单据号
          operate_type: null, // 单据类型
          operate_state: '01', // 单据状态 01待审核
          start_dt: dateFilterThisDay(new Date().getTime()), // 开始时间
          end_dt: null, // 结束时间
          pageNum: 1, // 当前页
          pageSize: 5, //每页显示条数
        };
        _t.$api.post("/tsGateWay/tvmManager/getOperationOrder", params, function (res) {
          if (res.rtCode && res.rtCode === "13006") {
            _t.TVMData = res.rtData === null ? [] : res.rtData;
          } else if (res.rtCode) {
            _t.TVMData = [];
          }
        });
      },
      // 获取若干车站长短款记录
      getStationMoneyRecord() {
        var _t = this;
        _t.$nextTick(function () {
          var myECharts;
          if (_t.isMLC === true) {
            myECharts = _t.$echarts.init(document.getElementById('moneyRecordMLC'));
          } else if (_t.isMLC === false) {
            myECharts = _t.$echarts.init(document.getElementById('moneyRecordSC'));
          } else {
            myECharts = '';
          }
          if (myECharts !== '') {
            myECharts.setOption(_t.optionsMoney);
          }
        });
      },
      //  获取获取长短款数据
      getParagraphData() {
        var _t = this;
        var role = _t.getCookie("USER_TYPE"); // 角色
        var location = _t.getCookie("LOCATION_NUMBER"); // 位置编号
        var user_id = _t.getCookie("USER_ID"); // 用户id
        if (
          role !== null &&
          role !== "null" &&
          user_id !== null &&
          user_id !== "null" &&
          location !== null &&
          location !== "null"
        ) {
          if (location !== "") {
            let str = "userid=" + user_id + "&location_number=" + location;
            let Base64 = require("js-base64").Base64;
            let keyToken = _t.$md5(Base64.encode(str));
            var start_dtime = _t.getCookie('ODL_TIME') + ' ' + '00:00:00';
            var end_dtime = _t.getCookie('YESTERDAY') + ' ' + '23:59:59';
            let postData = {
              userid: user_id, // 操作员id
              location_number: location, // 位置编码
              location_number_query: location,
              create_dt_begin: start_dtime, // 开始时间
              create_dt_end: end_dtime, // 结束时间
              pageNum: 1, // 当前页
              pageSize: 100, //每页显示条数
              token: keyToken // token

            };
            _t.$api.post("/tsGateWay/incomeMoney/searchMoneyDifferenceRecordsGateWay", postData, function (res) {
                _t.$store.commit("setLoading", false);
                if (res.rtCode && res.rtCode === "11007") {
                  // 昨天
                  var yesterdayNumber = {
                    // BOM短款
                    bomShortage: 0,
                    // BOM长款
                    bomLongPattern: 0,
                    // TVM 短款
                    tvmShortage: 0,
                    // BOM长款
                    tvmLongPattern: 0,
                  };
                  // 两天前
                  var twoDayNumber = {
                    // BOM短款
                    bomShortage: 0,
                    // BOM长款
                    bomLongPattern: 0,
                    // TVM 短款
                    tvmShortage: 0,
                    // BOM长款
                    tvmLongPattern: 0,
                  };
                  // 三天
                  var threeDayNumber = {
                    // BOM短款
                    bomShortage: 0,
                    // BOM长款
                    bomLongPattern: 0,
                    // TVM 短款
                    tvmShortage: 0,
                    // BOM长款
                    tvmLongPattern: 0,
                  };
                  // 四天前
                  var fourDayNumber = {
                    // BOM短款
                    bomShortage: 0,
                    // BOM长款
                    bomLongPattern: 0,
                    // TVM 短款
                    tvmShortage: 0,
                    // BOM长款
                    tvmLongPattern: 0,
                  };
                  // 五天前
                  var fiveDayNumber = {
                    // BOM短款
                    bomShortage: 0,
                    // BOM长款
                    bomLongPattern: 0,
                    // TVM 短款
                    tvmShortage: 0,
                    // BOM长款
                    tvmLongPattern: 0,
                  };
                  // 取出数据并求和
                  res.rtData.forEach(item => {

                   //  01:BOM长款   02：BOM短款 03：TVM长款 04：TVM短款   05:收益长款  06:收益短款
                    if (item.create_dt.substring(0, 10) === _t.ParagraphData.yesterday) {
                      // 昨天
                      if (item.difference_type_code === '02') {
                        // BOM短款
                        yesterdayNumber.bomShortage += Number(item.difference_amount_yuan);
                      } else if (item.difference_type_code === '01') {
                        //BOM长款
                        yesterdayNumber.bomLongPattern += Number(item.difference_amount_yuan);
                      } else if (item.difference_type_code === '04') {
                        //TVM短款
                        yesterdayNumber.tvmShortage += Number(item.difference_amount_yuan);
                      } else if (item.difference_type_code === '03') {
                        yesterdayNumber.tvmLongPattern += Number(item.difference_amount_yuan);
                      }

                    } else if (item.create_dt.substring(0, 10) === _t.ParagraphData.twoDay) {
                      // 两天前
                      if (item.difference_type_code === '02') {
                        twoDayNumber.bomShortage += Number(item.difference_amount_yuan);
                      } else if (item.difference_type_code === '01') {
                        twoDayNumber.bomLongPattern += Number(item.difference_amount_yuan);
                      } else if (item.difference_type_code === '04') {
                        twoDayNumber.tvmShortage += Number(item.difference_amount_yuan);
                      } else if (item.difference_type_code === '03') {
                        twoDayNumber.tvmLongPattern += Number(item.difference_amount_yuan);
                      }
                    } else if (item.create_dt.substring(0, 10) === _t.ParagraphData.threeDay) {
                      // 三天前
                      if (item.difference_type_code === '02') {
                        threeDayNumber.bomShortage += Number(item.difference_amount_yuan);
                      } else if (item.difference_type_code === '01') {
                        threeDayNumber.bomLongPattern += Number(item.difference_amount_yuan);
                      } else if (item.difference_type_code === '04') {
                        threeDayNumber.tvmShortage += Number(item.difference_amount_yuan);
                      } else if (item.difference_type_code === '03') {
                        threeDayNumber.tvmLongPattern += Number(item.difference_amount_yuan);
                      }
                    } else if (item.create_dt.substring(0, 10) === _t.ParagraphData.fourDay) {
                      // 四天前
                      if (item.difference_type_code === '02') {
                        fourDayNumber.bomShortage += Number(item.difference_amount_yuan);
                      } else if (item.difference_type_code === '01') {
                        fourDayNumber.bomLongPattern += Number(item.difference_amount_yuan);
                      } else if (item.difference_type_code === '04') {
                        fourDayNumber.tvmShortage += Number(item.difference_amount_yuan);
                      } else if (item.difference_type_code === '03') {
                        fourDayNumber.tvmLongPattern = Number(item.difference_amount_yuan);
                      }
                    } else if (item.create_dt.substring(0, 10) === _t.ParagraphData.fiveDay) {
                      // 五天前
                      if (item.difference_type_code === '02') {
                        fiveDayNumber.bomShortage += Number(item.difference_amount_yuan);
                      } else if (item.difference_type_code === '01') {
                        fiveDayNumber.bomLongPattern += Number(item.difference_amount_yuan);
                      } else if (item.difference_type_code === '04') {
                        fiveDayNumber.tvmShortage += Number(item.difference_amount_yuan);
                      } else if (item.difference_type_code === '03') {
                        fiveDayNumber.tvmLongPattern += Number(item.difference_amount_yuan);
                      }
                    }

                  })
                  _t.optionsMoney.series.forEach(item => {
                    if (item.name == 'BOM长款') {
                      item.data.push(yesterdayNumber.bomLongPattern);
                      item.data.push(twoDayNumber.bomLongPattern);
                      item.data.push(threeDayNumber.bomLongPattern);
                      item.data.push(fourDayNumber.bomLongPattern);
                      item.data.push(fiveDayNumber.bomLongPattern);
                    } else if (item.name == 'BOM短款') {
                      item.data.push(yesterdayNumber.bomShortage);
                      item.data.push(twoDayNumber.bomShortage);
                      item.data.push(threeDayNumber.bomShortage);
                      item.data.push(fourDayNumber.bomShortage);
                      item.data.push(fiveDayNumber.bomShortage);
                    } else if (item.name == 'TVM长款') {
                      item.data.push(yesterdayNumber.tvmLongPattern);
                      item.data.push(twoDayNumber.tvmLongPattern);
                      item.data.push(threeDayNumber.tvmLongPattern);
                      item.data.push(fourDayNumber.tvmLongPattern);
                      item.data.push(fiveDayNumber.tvmLongPattern);
                    } else if (item.name == 'TVM短款') {
                      item.data.push(yesterdayNumber.tvmShortage);
                      item.data.push(twoDayNumber.tvmShortage);
                      item.data.push(threeDayNumber.tvmShortage);
                      item.data.push(fourDayNumber.tvmShortage);
                      item.data.push(fiveDayNumber.tvmShortage);
                    }
                  })
                  _t.getStationMoneyRecord()
                } else if (res.rtCode) {
                  _t.alertDialogTip(_t, res.rtMessage);
                }
              }
            );
          }
        }
      },
      // 获取若干车站库存记录
      getStationInventoryRecord() {
        var _t = this;
        _t.$nextTick(function () {
          var myECharts;
          if (_t.isMLC === true) {
            myECharts = _t.$echarts.init(document.getElementById('inventoryMLC'));
          } else if (_t.isMLC === false) {
            myECharts = _t.$echarts.init(document.getElementById('inventorySC'));
          } else {
            myECharts = '';
          }
          if (myECharts !== '') {
            myECharts.setOption(_t.optionsInventory);
          }
        });
      },
      // 获取长短款单据
      getShortData(location_number, operator_id) {
        var _t = this;
        let str = "userid=" + operator_id
          + "&location_number=" + location_number;
        let Base64 = require("js-base64").Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        let postData = {
          userid: operator_id, // 操作员id
          location_number: location_number, // 位置编码
          difference_state: '01', // 短款
          issue: '0', // 待补缴
          create_dt_begin: dateFilterThisDay(new Date().getTime()), // 开始时间
          create_dt_end: null, // 结束时间
          pageNum: 1, // 当前页
          pageSize: 5, //每页显示条数
          token: keyToken // token
        };
        _t.$api.post("/tsGateWay/incomeMoney/searchMoneyDifferenceOrderGateWay", postData, function (res) {
          if (res.rtCode && res.rtCode === "11010") {
            _t.shortData = res.rtData === null ? [] : res.rtData;
          } else if (res.rtCode) {
            _t.shortData = [];
          }
        });
      },
      // 获取车票调配单据
      getTicketWithData(location_number, operator_id) {
        var _t = this;
        let str = "location_number=" + location_number + "&operator_id=" + operator_id;
        let Base64 = require("js-base64").Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        let postData = {
          location_number: location_number, // 位置编码
          operator_id: operator_id, // 操作员id
          order_state: null, // 状态
          start_time: dateFilterThisDay(new Date().getTime()), // 开始时间
          end_time: null, // 结束时间
          order_id: null, //单据编号
          pageNum: 1, // 当前页
          pageSize: 5, // 每页显示条数
          token: keyToken, // token
        };
        _t.$api.post("/tsGateWay/ticketTransfer/transferOrderQueryGateWay", postData, function (res) {
          if (res.rtCode && res.rtCode === "10009") {
            _t.ticketData = res.rtData === null ? [] : res.rtData;
          } else {
            _t.ticketData = [];
          }
        });
      },
      // 获取若干备用金调配单据
      getMoneyWithData(location_number, operator_id) {
        var _t = this;
        let str = 'location_number=' + location_number + '&operator_id=' + operator_id;
        let Base64 = require('js-base64').Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        var params = {
          location_number: location_number, // 位置编码
          operator_id: operator_id, // 操作员id
          token: keyToken, // token
          order_id: null, // 单号
          order_state: null,
          start_time: dateFilterThisDay(new Date().getTime()), // 开始时间
          end_time: null, // 结束时间
          order_type: null, // 01: 配发 02:回收 03:上交
          pageNum: 1, // 当前页
          pageSize: 5, // 每页显示条数
        };
        _t.$api.post('/tsGateWay/readyMoney/transferOrderQueryGateWay', params, function (res) {
          if (res.rtCode && res.rtCode === '11104') {
            // 请求成功
            _t.moneyData = res.rtData === null ? [] : res.rtData;
          } else if (res.rtCode) {
            _t.moneyData = [];
          }
        });
      },
      // 获取前n天的时间
      getBeforeDate(n) {
        var d = new Date();
        var year = d.getFullYear();
        var mon = d.getMonth() + 1;
        var day = d.getDate();
        if (day <= n) {
          if (mon > 1) {
            mon = mon - 1;
          } else {
            year = year - 1;
            mon = 12;
          }
        }
        d.setDate(d.getDate() - n);
        year = d.getFullYear();
        mon = d.getMonth() + 1;
        day = d.getDate();
        var s = year + "-" + (mon < 10 ? ('0' + mon) : mon) + "-" + (day < 10 ? ('0' + day) : day);
        return s;
      },
      // 获取当天时间
      getTime() {
        var _t = this;
        var time = new Date();
        var year = time.getFullYear();
        var month = time.getMonth() + 1;
        var day = time.getDate();
        var dateTime = `${year}-${month}-${day}`; // 今天时间
        _t.setCookie('TIME', dateTime);
      }
    },
    created() {
      var _t = this;
      _t.getTime(); // 获取当天时间
      var fiveTime = _t.getBeforeDate(5);  // 获取前五天的时间
      var yesterday = _t.getBeforeDate(1);  // 获取昨天的时间
      _t.setCookie('ODL_TIME', fiveTime);
      _t.setCookie('YESTERDAY', yesterday);
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
            _t.getPettyData()
            // 本页面业务逻辑
            _t.getParagraphData();
            _t.getEarnings();
            _t.getData(limitBtnArr);

          }
        });
      }
    },
    mounted() {
      var _t = this;
      window.onresize = function () {
        var moneyRecordMLC = document.getElementById('moneyRecordMLC');
        var moneyRecordSC = document.getElementById('moneyRecordSC');
        var inventoryMLC = document.getElementById('inventoryMLC');
        var inventorySC = document.getElementById('inventorySC');
        if (moneyRecordMLC !== null) {
          var moneyEChartsMLC = _t.$echarts.init(moneyRecordMLC);
          moneyEChartsMLC.resize();
        }
        if (moneyRecordSC !== null) {
          var moneyEChartsSC = _t.$echarts.init(moneyRecordSC);
          moneyEChartsSC.resize();
        }
        if (inventoryMLC !== null) {
          var inventoryEChartsMLC = _t.$echarts.init(inventoryMLC);
          inventoryEChartsMLC.resize();
        }
        if (inventorySC !== null) {
          var inventoryEChartsSC = _t.$echarts.init(inventorySC);
          inventoryEChartsSC.resize();
        }
      };
    },

    destroyed() {
      // 组件离开时销毁
      window.onresize = null;
    }
  }
</script>

<style scoped>
  .title {
    font-size: 15px;
    font-weight: bold;
    height: 30px;
    line-height: 30px;
    margin-bottom: 15px;
  }

  .home_list li {
    float: left;
    width: 50%;
    min-height: 400px;
  }

  .home_list li:nth-child(odd) {
    border-right: 1px solid #ddd;
    padding-right: 10px;
  }

  .home_list li:nth-child(even) {
    padding-left: 10px;
  }

  .eCharts {
    width: 100%;
    height: 300px;
  }
</style>
