<template>
  <Box>
    <div class="formBox-top">
      <el-form :model="formItem" label-width="110px" inline>
        <el-form-item label="线路：" class="marBottom7">
          <el-select
            :disabled="disabledBtn.createDis"
            class="width200"
            @change="changeLines(formItem.lines)"
            v-model="formItem.lines">
            <el-option
              v-for="(item,index) in linesList"
              :key="index"
              :label="item.LINE_LOCATION_NAME"
              :value="item.LINE_LOCATION_NUMBER.toString()"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="车站：" class="marBottom7">
          <el-select
            :disabled="disabledBtn.createDis"
            clearable
            class="width200"
            @change="changeStation(formItem.station)"
            v-model="formItem.station">
            <el-option
              v-for="(item,index) in stationList"
              :key="index"
              :label="item.STATION_LOCATION_NAME"
              :value="item.LOCATION_NUMBER.toString()"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="售票员ID：" class="marBottom7">
          <el-select
            clearable
            filterable
            class="width200"
            v-model="formItem.operationId">
            <el-option
              v-for="(item,index) in operatorIdList"
              :key="index"
              :label="item.USERNAME + '-' + item.USERID"
              :value="item.USERID.toString()"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="单据类型：" class="marBottom7">
          <el-select
            clearable
            class="width200"
            v-model="formItem.type">
            <el-option
              v-for="(item,index) in statusList"
              :key="index"
              :label="item.NAME"
              :value="item.VALUE"/>
          </el-select>
        </el-form-item>
        <el-form-item label="结算单号：" class="marBottom7">
          <el-input clearable class="width200" v-model="formItem.orderNum" placeholder="请输入单号"/>
        </el-form-item>
        <el-form-item label="运营日期：" class="marBottom7">
          <el-date-picker
            v-model="formItem.dateTime"
            type="date"
            value-format="yyyyMMdd"
            placeholder="选择日期"
            :picker-options="pickerOptions"/>
        </el-form-item>
        <br>
        <el-form-item class="fr marBottom7">
          <el-button type="primary" v-if="limitBtn.queryBtn" @click="getData">查询</el-button>
          <el-button type="warning" @click="resetFormItem">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="tableWp">
      <!-- 表格内容 -->
      <el-table :data="tableData" border stripe :default-sort="{prop:'UPDATE_DT',order:'descending'}">
        <el-table-column prop="LINE_NAME" label="线路" header-align="center" align="center"/>
        <el-table-column prop="STATION_NAME" label="车站" header-align="center" align="center"/>
        <el-table-column prop="ORDER_ID" label="单据号" header-align="center" align="center"/>
        <el-table-column prop="ORDER_STATE_NAME" label="单据类型" header-align="center" align="center"/>
        <el-table-column prop="BALANCE_DATE" sortable label="运营日期" header-align="center" align="center"/>
        <el-table-column label="售票员ID" header-align="center" align="center">
          <template slot-scope="scope">
            <span>{{scope.row.BOM_OPERATOR_NAME}}</span>
            <span>-</span>
            <span>{{scope.row.BOM_OPERATOR_ID}}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template slot-scope="scope">
            <el-button v-if="limitBtn.detail" @click="handleClick(scope.row)" type="primary">详情</el-button>
            <el-button v-if="limitBtn.modifier" @click="enterModifier(scope.row)" type="primary">修改</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <pages
        :total="options.total"
        :currentPage="options.currentPage"
        :page-size="options.pageSize"
        @handleSizeChangeSub="handleSizeChangeSub"
        @handleCurrentChangeSub="handleCurrentChange"/>
    </div>
    <!--BOM结算单详情-->
    <el-dialog
      append-to-body
      :fullscreen="isScreen"
      :before-close="resetDetail"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :visible.sync="dialogVisible">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">BOM结算单详情</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreen = !isScreen"></i>
      </div>
      <el-form :model="formDetail" label-width="140px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="线路：">
              <el-input v-model="formDetail.LINE_NAME" disabled/>
            </el-form-item>
            <el-form-item label="操作员ID：">
              <el-input v-model="formDetail.BOM_OPERATOR_NAME + '-' + formDetail.BOM_OPERATOR_ID" disabled/>
            </el-form-item>
            <el-form-item label="单据状态：">
              <el-input v-model="formDetail.ORDER_STATE" disabled/>
            </el-form-item>
            <el-form-item label="实缴金额(元)：">
              <el-input v-model="formDetail.ACT_AMOUNT" disabled/>
            </el-form-item>
            <el-form-item label="更新时间：">
              <el-input v-model="formDetail.UPDATE_DT" disabled/>
            </el-form-item>
            <el-form-item label="补票金额：">
              <el-input v-model="formDetail.fare_adjustment_money" disabled/>
            </el-form-item>
            <el-form-item label="行政支出金额：">
              <el-input v-model="formDetail. administrative_revenue_money" disabled/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="车站：">
              <el-input v-model="formDetail.STATION_NAME" disabled/>
            </el-form-item>
            <el-form-item label="运营日期：">
              <el-input v-model="formDetail.BALANCE_DATE" disabled/>
            </el-form-item>
            <el-form-item label="单据号：">
              <el-input v-model="formDetail.ORDER_ID" disabled/>
            </el-form-item>
            <el-form-item label="系统应收金额(元)：">
              <el-input v-model="formDetail.DUE_SYS_AMOUNT" disabled/>
            </el-form-item>
            <el-form-item label="售票/充值金额">
              <el-input v-model="formDetail.sell_recharge_money" disabled/>
            </el-form-item>
            <el-form-item label="行政收入金额">
              <el-input v-model="formDetail.administrative_expenditure_money" disabled/>
            </el-form-item>
            <el-form-item label="退款金额">
              <el-input v-model="formDetail.refund_money" disabled/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注：">
          <el-input type="textarea" v-model="formDetail.COMMENT_INFO" disabled/>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button type="primary" @click="resetDetail">关闭</el-button>
      </div>
    </el-dialog>
    <!--修改-->
    <el-dialog
      append-to-body
      :fullscreen="isScreen"
      :before-close="resetDetail"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :visible.sync="dialogVisibleModifier">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">BOM结算单修改</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreen = !isScreen"></i>
      </div>
      <el-form :model="formDetail" label-width="140px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="线路：">
              <el-input v-model="formDetail.LINE_NAME" disabled/>
            </el-form-item>
            <el-form-item label="操作员ID：">
              <el-input v-model="formDetail.BOM_OPERATOR_NAME + '-' + formDetail.BOM_OPERATOR_ID" disabled/>
            </el-form-item>
            <el-form-item label="单据状态：">
              <el-input v-model="formDetail.ORDER_STATE" disabled/>
            </el-form-item>
            <el-form-item label="实缴金额(元)：">
              <el-input clearable v-model="formDetail.ACT_AMOUNT"/>
            </el-form-item>
            <el-form-item label="更新时间：">
              <el-input v-model="formDetail.UPDATE_DT" disabled/>
            </el-form-item>
            <el-form-item label="补票金额：">
              <el-input v-model="formDetail.fare_adjustment_money" disabled/>
            </el-form-item>
            <el-form-item label="行政支出金额：">
              <el-input v-model="formDetail. administrative_revenue_money" disabled/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="车站：">
              <el-input v-model="formDetail.STATION_NAME" disabled/>
            </el-form-item>
            <el-form-item label="运营日期：">
              <el-input v-model="formDetail.BALANCE_DATE" disabled/>
            </el-form-item>
            <el-form-item label="单据号：">
              <el-input v-model="formDetail.ORDER_ID" disabled/>
            </el-form-item>
            <el-form-item label="系统应收金额(元)：">
              <el-input clearable v-model="formDetail.DUE_SYS_AMOUNT"/>
            </el-form-item>
            <el-form-item label="售票/充值金额">
              <el-input v-model="formDetail.sell_recharge_money" disabled/>
            </el-form-item>
            <el-form-item label="行政收入金额">
              <el-input v-model="formDetail.administrative_expenditure_money" disabled/>
            </el-form-item>
            <el-form-item label="退款金额">
              <el-input v-model="formDetail.refund_money" disabled/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注：">
          <el-input type="textarea" v-model="formDetail.COMMENT_INFO" disabled/>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="resetDetail">取消</el-button>
        <el-button type="primary" v-btn-control @click="handleModifier">确定</el-button>
      </div>
    </el-dialog>
  </Box>
</template>
<script>
  import Box from "../../../components/Box";
  import {dateFilter} from "../../../assets/js/filters";

  export default {
    name: "BOMSettlement",
    components: {Box},
    data() {
      return {
        isScreen: false, // 详情放大缩小
        dialogVisibleModifier: false, // 修改
        // 查询表单
        formItem: {
          lines: '', // 线路
          station: '', // 车站
          operationId: '', // 操作员id
          orderNum: '', // 结算单号
          type: '', // 单据类型
          dateTime: '', // 创建时间
        },
        // 禁选日期
        pickerOptions: {
          disabledDate(time) {
            return time.getTime() > Date.now();
          },
        },
        // 表格数据
        tableData: [],
        // 分页
        options: {
          total: 0, // 总条数
          currentPage: 1, // 当前页码
          pageSize: 10 // 显示条数
        },
        // 调入调出位置
        linesListArr: [],
        // 库存状态
        statusList: [],
        // 操作类型
        typeList: [],
        // 线路集合
        linesList: [],
        // 车站集合
        stationList: [],
        // 操作员id集合
        operatorIdList: [],
        // 按钮权限
        limitBtn: {
          queryBtn: false, // 查询
          detail: false, // 详情
          modifier: false, // 修改
        },
        // BOM结算单详情
        formDetail: {
          location_number: '',
          LINE_NAME: '', // 线路
          BOM_OPERATOR_ID: '', // 操作员ID
          BOM_OPERATOR_NAME: '', // 操作员名称
          START_DT: '', // 上岗时间
          ORDER_STATE: '', // 单据状态
          DUE_MANUL_AMOUNT: '', // 手工应缴金额
          ADJUST_AMOUNT: '', // 调整金额
          ACT_AMOUNT: '', // 实缴金额
          STATION_NAME: '', // 车站名称
          BALANCE_DATE: '', // 运营日期
          END_DT: '', // 下岗时间
          ORDER_ID: '', // 单据号
          DUE_SYS_AMOUNT: '', // 系统应缴金额
          ADJUST_REASON: '', // 调整原因
          UPDATE_DT: '', // 更新时间
          COMMENT_INFO: '', // 备注
          GET_MONEY: '', //配款+补充的钱
          sell_recharge_money: '',// 售票/充值金额
          fare_adjustment_money: '',// 补票金额
          administrative_expenditure_money: '', // 行政收入金额
          refund_money: '',// 退款金额
          administrative_revenue_money: '', // 行政支出金额
        },
        disabledBtn: {
          createDis: true
        },
        // 详情
        dialogVisible: false,
        // 从cookie中获取
        cookieMap: {
          location_number: this.getCookie('LOCATION_NUMBER'), // 位置编号
          user_id: this.getCookie('USER_ID'), // 操作员ID
          role: this.getCookie('USER_TYPE'), // 用户角色
        }
      };
    },
    methods: {
      //  修改
      enterModifier(row) {
        var _t = this;
        _t.dialogVisibleModifier = true;
        _t.getDetailModifier(row.ORDER_ID);
      },
      // 修改提交
      handleModifier() {
        var _t = this;
        var params = {
          balance_date: _t.formDetail.BALANCE_DATE, // 运营日
          order_id: _t.formDetail.ORDER_ID, //  审核单id
          operator_id: _t.formDetail.BOM_OPERATOR_ID,// 操作员id
          location_number: _t.formDetail.location_number, // 位置编码
          get_money: _t.formDetail.GET_MONEY,// 配款+补充的钱
          act_amount: _t.formDetail.ACT_AMOUNT, // 实缴金额
          due_sys_amount: _t.formDetail.DUE_SYS_AMOUNT, // 系统应缴金额
        };
        _t.$api.post('/tsGateWay/bommanager/editBomAuditInfo', params, function (res) {
          if (res.rtCode) {
            _t.alertDialogTip(_t, res.rtMessage);
            _t.resetDetail();
          }
        })
      },
      getDetailModifier(ORDER_ID) {
        var _t = this;
        let str = "order_id=" + ORDER_ID;
        let Base64 = require("js-base64").Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        var params = {
          order_id: ORDER_ID,
          pageNum: 1,
          pageSize: 10,
          token: keyToken
        };
        _t.$api.post('/tsGateWay/bommanager/statementinfoquery', params, function (res) {
          if (res.rtCode && res.rtCode === '12008') {
            if (res.rtData !== undefined && res.rtData !== null && res.rtData.length !== 0) {
              var resData = res.rtData[0];
              _t.formDetail.LINE_NAME = resData.LINE_NAME ? resData.LINE_NAME : ''; // 线路
              _t.formDetail.BOM_OPERATOR_ID = resData.BOM_OPERATOR_ID ? resData.BOM_OPERATOR_ID : ''; // 操作员ID
              _t.formDetail.BOM_OPERATOR_NAME = resData.BOM_OPERATOR_NAME ? resData.BOM_OPERATOR_NAME : ''; // 操作员名称
              _t.formDetail.START_DT = resData.START_DT ? resData.START_DT : ''; // 上岗时间
              _t.formDetail.ORDER_STATE = resData.ORDER_STATE_NAME ? resData.ORDER_STATE_NAME : ''; // 单据状态
              _t.formDetail.DUE_MANUL_AMOUNT = resData.DUE_MANUL_AMOUNT ? resData.DUE_MANUL_AMOUNT : ''; // 手工应缴金额
              _t.formDetail.ADJUST_AMOUNT = resData.ADJUST_AMOUNT ? resData.ADJUST_AMOUNT : ''; // 调整金额
              _t.formDetail.ACT_AMOUNT = resData.ACT_AMOUNT ? resData.ACT_AMOUNT : ''; // 实缴金额
              _t.formDetail.STATION_NAME = resData.STATION_NAME ? resData.STATION_NAME : ''; // 车站名称
              _t.formDetail.BALANCE_DATE = resData.BALANCE_DATE ? resData.BALANCE_DATE : ''; // 运营日期
              _t.formDetail.END_DT = resData.END_DT ? resData.END_DT : ''; // 下岗时间
              _t.formDetail.ORDER_ID = resData.ORDER_ID ? resData.ORDER_ID : ''; // 单据号
              _t.formDetail.DUE_SYS_AMOUNT = resData.DUE_SYS_AMOUNT ? resData.DUE_SYS_AMOUNT : ''; // 系统应缴金额
              _t.formDetail.sell_recharge_money = resData.sell_recharge_money;// 售票/充值金额
              _t.formDetail.fare_adjustment_money = resData.fare_adjustment_money;// 补票金额
              _t.formDetail.refund_money = resData.refund_money;// 退款金额
              _t.formDetail.administrative_revenue_money = resData.administrative_revenue_money; // 行政支出金额
              _t.formDetail.administrative_expenditure_money = resData.administrative_expenditure_money;// 行政收入金额
              _t.formDetail.ADJUST_REASON = resData.ADJUST_REASON ? resData.ADJUST_REASON : ''; // 调整原因
              _t.formDetail.UPDATE_DT = resData.UPDATE_DT ? resData.UPDATE_DT : ''; // 更新时间
              _t.formDetail.COMMENT_INFO = resData.COMMENT_INFO ? resData.COMMENT_INFO : ''; // 备注
              _t.formDetail.GET_MONEY = resData.GET_MONEY ? resData.GET_MONEY : '0' // 配款+补充的钱
              _t.formDetail.location_number = resData.LOCATION_NUMBER; // 车站位置
            }
          } else if (res.rtCode) {
            _t.alertDialogTip(_t, res.rtMessage);
          }
        });
      },
      // 重置查询表单
      resetFormItem() {
        var _t = this;
        _t.formItem.dateTime = '';  // 创建时间
        _t.formItem.type = '';  // 单据类型
        _t.formItem.orderNum = '';  // 结算单号

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
      // 获取单据类型状态字典
      getStatusData() {
        var _t = this;
        let str = "guid=GUID000722201906191627";
        let Base64 = require("js-base64").Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        var params = {
          guid: "GUID000722201906191627",
          token: keyToken
        };
        _t.$api.post("/tsGateWay/ticketUtility/queryDict", params, function (res) {
          // 查询成功
          if (res.rtCode && res.rtCode === "14010") {
            _t.statusList = res.rtData === null ? [] : res.rtData;
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
        var s = `${year}${(mon < 10 ? ('0' + mon) : mon)}${(day < 10 ? ('0' + day) : day)}`
        return s;
      },
      // 查询按钮
      getData() {
        var _t = this;
        var location_number = '';
        var operator_id = '';
        var location_number_query = '';
        var yesterday = _t.getBeforeDate(1);
        location_number = _t.formItem.lines ? _t.formItem.lines : _t.cookieMap.location_number;
        location_number_query = _t.formItem.station;
        operator_id = _t.formItem.operationId === '' ? _t.cookieMap.user_id : _t.formItem.operationId;
        //  获取当天时间
        // var start_dtime = _t.getCookie('TIME') + ' ' + '00:00:00';
        // var end_dtime = _t.getCookie('TIME') + ' ' + '23:59:59';
        let postData = {
          location_number: location_number, // 位置编码
          location_number_query: location_number_query === '' ? null : location_number_query,
          order_id: _t.formItem.orderNum.trim() === '' ? null : _t.formItem.orderNum.trim(), // 单据号
          bom_operator_id: _t.formItem.operationId, // 操作员id
          order_state: _t.formItem.type === '' ? null : _t.formItem.type, // 单据类型
          balance_date: _t.formItem.dateTime ? _t.formItem.dateTime : yesterday,
          // start_dt: _t.formItem.dateTime !== null ? (_t.formItem.dateTime[0] !== undefined ? dateFilter(_t.formItem.dateTime[0].getTime()) : start_dtime) : null, // 开始时间
          // end_dt: _t.formItem.dateTime !== null ? (_t.formItem.dateTime[1] !== undefined ? dateFilter(_t.formItem.dateTime[1].getTime()) : end_dtime) : null, // 结束时间
          pageNum: _t.options.currentPage, // 当前页
          pageSize: _t.options.pageSize //每页显示条数
        };
        _t.$api.post("/tsGateWay/bommanager/statementlistquery", postData, function (res) {
          _t.$store.commit("setLoading", false);
          if (res.rtCode && res.rtCode === "12007") {
            _t.tableData = res.rtData === null ? [] : res.rtData;
            _t.options.total = res.totalCount ? res.totalCount : 0;
          } else if (res.rtCode) {
            _t.alertDialogTip(_t, res.rtMessage);
          }
        });
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
                              // if (data.USERID === _t.getCookie("USER_ID")) {
                              //   USERID = data.USERID;
                              // }
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
        _t.getData();
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
      // 改变车站
      changeStation(val) {
        var _t = this;
        if (val !== "") {
          // 遍历车站集合
          _t.stationList.forEach(item => {
            // 找到车站
            if (item.LOCATION_NUMBER.toString() === val) {
              // 存在操作员集合
              if (item.userList !== undefined && item.userList !== null) {
                // 操作员集合赋值
                _t.operatorIdList = item.userList;
                // 遍历操作员集合
                _t.operatorIdList.forEach(data => {
                  // 找到自身
                  if (data.USERID === _t.cookieMap.user_id) {
                    _t.formItem.operationId = data.USERID;
                  } else {
                    // 置为空
                    _t.formItem.operationId = "";
                  }
                });
              } else {
                // 对应车站没有操作员集合
                _t.operatorIdList = [];
                _t.formItem.operationId = "";
              }
            }
          });
        } else {
          // 车站改变值为空
          _t.operatorIdList = [];
          _t.formItem.operationId = "";
        }
      },
      // BOM结算单单详情
      handleClick(row) {
        var _t = this;
        _t.dialogVisible = true;
        _t.getDetailData(row.ORDER_ID);
      },
      // 获取详情数据
      getDetailData(ORDER_ID) {
        var _t = this;
        let str = "order_id=" + ORDER_ID;
        let Base64 = require("js-base64").Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        var params = {
          order_id: ORDER_ID,
          pageNum: 1,
          pageSize: 10,
          token: keyToken
        };
        _t.$api.post('/tsGateWay/bommanager/statementinfoquery', params, function (res) {
          if (res.rtCode && res.rtCode === '12008') {
            if (res.rtData !== undefined && res.rtData !== null && res.rtData.length !== 0) {
              var resData = res.rtData[0];
              _t.formDetail.LINE_NAME = resData.LINE_NAME ? resData.LINE_NAME : ''; // 线路
              _t.formDetail.BOM_OPERATOR_ID = resData.BOM_OPERATOR_ID ? resData.BOM_OPERATOR_ID : ''; // 操作员ID
              _t.formDetail.BOM_OPERATOR_NAME = resData.BOM_OPERATOR_NAME ? resData.BOM_OPERATOR_NAME : ''; // 操作员名称
              _t.formDetail.START_DT = resData.START_DT ? resData.START_DT : ''; // 上岗时间
              _t.formDetail.ORDER_STATE = resData.ORDER_STATE_NAME ? resData.ORDER_STATE_NAME : ''; // 单据状态
              _t.formDetail.DUE_MANUL_AMOUNT = resData.DUE_MANUL_AMOUNT ? resData.DUE_MANUL_AMOUNT : ''; // 手工应缴金额
              _t.formDetail.ADJUST_AMOUNT = resData.ADJUST_AMOUNT ? resData.ADJUST_AMOUNT : ''; // 调整金额
              _t.formDetail.ACT_AMOUNT = resData.ACT_AMOUNT ? resData.ACT_AMOUNT : ''; // 实缴金额
              _t.formDetail.STATION_NAME = resData.STATION_NAME ? resData.STATION_NAME : ''; // 车站名称
              _t.formDetail.BALANCE_DATE = resData.BALANCE_DATE ? resData.BALANCE_DATE : ''; // 运营日期
              _t.formDetail.END_DT = resData.END_DT ? resData.END_DT : ''; // 下岗时间
              _t.formDetail.ORDER_ID = resData.ORDER_ID ? resData.ORDER_ID : ''; // 单据号
              _t.formDetail.DUE_SYS_AMOUNT = resData.DUE_SYS_AMOUNT ? resData.DUE_SYS_AMOUNT : ''; // 系统应缴金额
              _t.formDetail.sell_recharge_money = resData.sell_recharge_money;// 售票/充值金额
              _t.formDetail.fare_adjustment_money = resData.fare_adjustment_money;// 补票金额
              _t.formDetail.refund_money = resData.refund_money;// 退款金额
              _t.formDetail.administrative_revenue_money = resData.administrative_revenue_money; // 行政支出金额
              _t.formDetail.administrative_expenditure_money = resData.administrative_expenditure_money;// 行政收入金额
              _t.formDetail.ADJUST_REASON = resData.ADJUST_REASON ? resData.ADJUST_REASON : ''; // 调整原因
              _t.formDetail.UPDATE_DT = resData.UPDATE_DT ? resData.UPDATE_DT : ''; // 更新时间
              _t.formDetail.COMMENT_INFO = resData.COMMENT_INFO ? resData.COMMENT_INFO : ''; // 备注
            }
          } else if (res.rtCode) {
            _t.alertDialogTip(_t, res.rtMessage);
          }
        });
      },
      // 重置详情表单
      resetDetail() {
        var _t = this;
        _t.dialogVisibleModifier = false;
        _t.dialogVisible = false;
        _t.formDetail.location_number = '';
        _t.formDetail.LINE_NAME = ''; // 线路
        _t.formDetail.BOM_OPERATOR_ID = ''; // 操作员ID
        _t.formDetail.BOM_OPERATOR_NAME = ''; // 操作员名称
        _t.formDetail.START_DT = ''; // 上岗时间
        _t.formDetail.ORDER_STATE = ''; // 单据状态
        _t.formDetail.DUE_MANUL_AMOUNT = ''; // 手工应缴金额
        _t.formDetail.ADJUST_AMOUNT = ''; // 调整金额
        _t.formDetail.ACT_AMOUNT = ''; // 实缴金额
        _t.formDetail.STATION_NAME = ''; // 车站名称
        _t.formDetail.BALANCE_DATE = ''; // 运营日期
        _t.formDetail.END_DT = ''; // 下岗时间
        _t.formDetail.ORDER_ID = ''; // 单据号
        _t.formDetail.DUE_SYS_AMOUNT = ''; // 系统应缴金额
        _t.formDetail.ADJUST_REASON = ''; // 调整原因
        _t.formDetail.UPDATE_DT = ''; // 更新时间
        _t.formDetail.COMMENT_INFO = ''; // 备注
        _t.formDetail.GET_MONEY = ''; // 配款+补充的钱
        _t.formDetail.sell_recharge_money = '';// 售票/充值金额
        _t.formDetail.fare_adjustment_money = '';// 补票金额
        _t.formDetail.refund_money = '';// 退款金额
        _t.formDetail.administrative_revenue_money = ''; // 行政支出金额
        _t.formDetail.administrative_expenditure_money = '';// 行政收入金额
      }
    },
    created() {
      var _t = this;
      if (_t.getCookie('LOCATION_TYPE_ID') !== '09') {
        _t.disabledBtn.createDis = false;
      }
      _t.$store.commit("setLoading", true);
      var limitMenuList = JSON.parse(localStorage.getItem("limitMenuList"));
      if (limitMenuList !== null && limitMenuList.length !== 0) {
        var limitBtnArr = new Array();
        limitMenuList.forEach(item => {
          var path = _t.$route.path;
          // 找到了对应权限的页面
          if (item.URL === path) {
            // 获取按钮级别权限
            if (item.CHILDREN !== null) {
              limitBtnArr = item.CHILDREN;
            }
            // 本页面业务逻辑
            _t.getStatusData();
            _t.getLinesAndStation();
          }
        });
        // 判断权限按钮
        limitBtnArr.forEach(item => {
          // 查询
          if (item.MENU_ID === "GUID00000000000000000000000000000107") {
            _t.limitBtn.queryBtn = true;
          }
          // 详情
          if (item.MENU_ID === "GUID00000000000000000000000000000108") {
            _t.limitBtn.detail = true;
          }
          // 修改
          if (item.MENU_ID === 'MENU20191230204412jrIhuzwfTdWBgs') {
            _t.limitBtn.modifier = true;
          }
        });
      }
    }
  };
</script>

<style scoped>

</style>
