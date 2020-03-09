<template>
  <Box>
    <div class="formBox-top">
      <!-- 头部查询部分 -->
      <el-form :model="formItem" label-width="130px" :inline="true">
        <el-form-item label="线路：" class="marBottom7">
          <el-select
            :disabled="disabledBtn.createDis"
            @change="changeLines(formItem.lines)"
            v-model="formItem.lines"
            class="width200"
          >
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
            @change="changeStation(formItem.station)"
            v-model="formItem.station"
            class="width200"
            clearable
          >
            <el-option
              v-for="(item,index) in stationList"
              :key="index"
              :label="item.STATION_LOCATION_NAME"
              :value="item.LOCATION_NUMBER.toString()"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="操作员ID：" class="marBottom7">
          <el-select clearable filterable v-model="formItem.operationId" class="width200">
            <el-option
              v-for="(item,index) in operatorIdList"
              :key="index"
              :label="item.USERNAME + '-' + item.USERID"
              :value="item.USERID.toString()"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="库存状态：" class="marBottom7">
          <el-select v-model="formItem.status" class="width200" clearable>
            <el-option
              v-for="item in statusList"
              :key="item.VALUE"
              :label="item.NAME"
              :value="item.VALUE"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="操作类型：" class="marBottom7">
          <el-select
            v-model="formItem.type"
            @change="changeType(formItem.type)"
            class="width200"
            clearable
          >
            <el-option
              v-for="(item,index) in typeList"
              :key="index"
              :label="item.TYPE_NAME"
              :value="item.TYPE_VALUE"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="操作原因：" class="marBottom7">
          <el-select v-model="formItem.reason" class="width200" clearable>
            <el-option
              v-for="(item,index) in reasonList"
              :key="index"
              :label="item.REASON_NAME"
              :value="item.REASON_VALUE"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="操作时间："  class="marBottom7">
          <el-date-picker
            v-model="formItem.dateTime"
            :default-time="['00:00:00', '23:59:59']"
            type="daterange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
        </el-form-item>
        <br />
        <el-form-item class="fr marBottom7">
          <el-button type="primary" @click="getData" v-if="limitBtn.queryBtn">查询</el-button>
          <el-button type="warning" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 表格内容 -->
    <div class="tableWp">
      <el-table
        border
        :data="tableData"
        stripe
        :default-sort="{prop: 'update_dt', order: 'descending'}"
      >
        <el-table-column prop="line_name" label="线路" align="center" />
        <el-table-column prop="station_name" label="车站" align="center" />
        <el-table-column prop="operation_type_name" label="操作类型" align="center" />
        <el-table-column prop="change_reason_name" label="操作原因" align="center" />
        <el-table-column prop="amount_yuan" label="操作数量" align="center" />
        <el-table-column prop="stock_state_name" label="库存状态" align="center" sortable />
        <el-table-column label="操作员ID" align="center">
          <template slot-scope="scope">
            <span>{{scope.row.operator_name}}</span>
            <span>-</span>
            <span>{{scope.row.operator_id}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="update_dt" width="170"  sortable label="操作时间" header-align="center" align="center"/>
        <el-table-column fixed="right" label="操作" align="center">
          <template slot-scope="scope">
            <el-button  v-if="limitBtn.details" @click="detailBtn(scope.row)" type="primary">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <pages
        :total="options.total"
        :currentPage="options.currentPage"
        :page-size="options.pageSize"
        @handleSizeChangeSub="handleSizeChangeSub"
        @handleCurrentChangeSub="handleCurrentChange"
      />
    </div>
    <!--库存操作记录详情-->
    <el-dialog
      v-dialogDrag
      :fullscreen="isScreen"
      append-to-body
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :visible.sync="dialogDetailVisible"
    >
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">库存操作记录详情</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreen = !isScreen"></i>
      </div>
      <el-form :model="detailFormItem" ref="detailFormItem" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="线路：" class="marBottom7">
              <el-input v-model="detailFormItem.lines" disabled></el-input>
            </el-form-item>
            <el-form-item label="库存状态：" class="marBottom7">
              <el-input v-model="detailFormItem.state" disabled></el-input>
            </el-form-item>
            <el-form-item label="操作类型：" class="marBottom7">
              <el-input v-model="detailFormItem.type" disabled></el-input>
            </el-form-item>
            <el-form-item label="操作员ID：" class="marBottom7">
              <el-input v-model="detailFormItem.operatorId" disabled></el-input>
            </el-form-item>
            <el-form-item label="操作金额(元)：" class="marBottom7">
              <el-input v-model="detailFormItem.operatorMoney" disabled></el-input>
            </el-form-item>
            <el-form-item label="操作前金额(元)：" class="marBottom7">
              <el-input v-model="detailFormItem.beforeMoney" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="车站：" class="marBottom7">
              <el-input v-model="detailFormItem.station" disabled></el-input>
            </el-form-item>
            <el-form-item label="认证操作员：" class="marBottom7">
              <el-input v-model="detailFormItem.identifiedOperatorId2" disabled></el-input>
            </el-form-item>
            <el-form-item label="操作原因：" class="marBottom7">
              <el-input v-model="detailFormItem.reason" disabled></el-input>
            </el-form-item>
            <el-form-item label="操作时间：" class="marBottom7">
              <el-input v-model="detailFormItem.operationTime" disabled></el-input>
            </el-form-item>
            <el-form-item label="操作后金额(元)：" class="marBottom7">
              <el-input v-model="detailFormItem.afterMoney" disabled></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注：" class="marBottom7">
          <el-input v-model="detailFormItem.commentInfo" disabled type="textarea"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogDetailVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogDetailVisible = false">确定</el-button>
      </div>
    </el-dialog>
  </Box>
</template>

<script>
import Box from "../../../components/Box";
import { dateFilter } from "../../../assets/js/filters";
export default {
  name: "profitStockRecord",
  components: { Box },
  data() {
    return {
      // 放大缩小
      isScreen: false,
      // 详情
      dialogDetailVisible: false,
      // 查询表单
      formItem: {
        lines: "", // 线路
        station: "", //车站
        status: "", // 库存状态
        type: "", // 操作类型
        reason: "", // 操作原因
        dateTime: [],
        operationId: "" // 操作员id
      },
      // 分页
      options: {
        total: 0, // 总条数
        currentPage: 1, // 当前页码
        pageSize: 10 // 显示条数
      },
      linesListArr:[], // 调入调出位置
      // 按钮权限
      limitBtn: {
        queryBtn: false, // 查询
        details:false, // 详情
      },
      tableData: [],
      // 收益库存操作状态集合
      statusList: [],
      // 操作类型
      typeList: [],
      // 操作原因
      reasonList: [],
      // 操作员id集合
      operatorIdList: [],
      // 线路集合
      linesList: [],
      // 车站集合
      stationList: [],
      // 按钮禁选
      disabledBtn: {
        createDis: true
      },
      // 详情
      detailFormItem: {
        lines: "", //线路
        station: "", //车站
        type: "", //操作类型
        reason: "", //操作原因
        beforeMoney: "", //操作前金额
        operatorMoney: "", //操作金额
        afterMoney: "", //操作后金额
        state: "", //状态
        operatorId: "", //操作员ID
        identifiedOperatorId1: "", //认证操作员1
        identifiedOperatorId2: "", //认证操作员2
        operationTime: "", //操作时间
        commentInfo: "" //备注
      }
    };
  },
  methods: {
    // 详情按钮
    detailBtn(row) {
      var _t = this;
      _t.dialogDetailVisible = true;
      //线路
      _t.detailFormItem.lines = row.line_name;
      //车站
      _t.detailFormItem.station = row.station_name;
      //操作类型
      _t.detailFormItem.type = row.operation_type_name;
      //操作原因
      _t.detailFormItem.reason = row.change_reason_name;
      //操作前金额
      _t.detailFormItem.beforeMoney = row.amount_before_yuan;
      // 操作金额
      _t.detailFormItem.operatorMoney = row.amount_yuan;
      // 操作后金额
      _t.detailFormItem.afterMoney = row.amount_after_yuan;
      // 状态
      _t.detailFormItem.state = row.stock_state_name;
      // 操作员ID
      _t.detailFormItem.operatorId = row.operator_name + "-" + row.operator_id;
      // 认证操作员1
      _t.detailFormItem.identifiedOperatorId1 =
        row.identified_operator_name1 + "-" + row.identified_operator_id1;
      // 认证操作员2
      _t.detailFormItem.identifiedOperatorId2 =
        row.identified_operator_name2 + "-" + row.identified_operator_id2;
      // 操作时间
      _t.detailFormItem.operationTime = row.update_dt;
      // 备注
      _t.detailFormItem.commentInfo =  row.comment_info
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
    //获取状态
    getStatusData() {
      var _t = this;
      let str = "guid=GUID000722201906191607";
      let Base64 = require("js-base64").Base64;
      let keyToken = _t.$md5(Base64.encode(str));
      var params = {
        guid: "GUID000722201906191607",
        token: keyToken
      };
      _t.$api.post("/tsGateWay/ticketUtility/queryDict", params, function(res) {
        // 查询成功
        if (res.rtCode && res.rtCode === "14010") {
          _t.statusList = res.rtData === null ? [] : res.rtData;
        }
      });
    },
    // 查询按钮
    getData() {
      var _t = this;
      var role = _t.getCookie("USER_TYPE"); // 角色
      var location = _t.getCookie("LOCATION_NUMBER"); // 位置编号
      var user_id = _t.getCookie("USER_ID"); // 用户id
      var location_number = ""; // 发送请求的 位置编号
      var location_number_query = ""; // 发送请求的 位置编号
      var operator_id = ""; // 操作员id
      if (
        role !== null &&
        role !== "null" &&
        user_id !== null &&
        user_id !== "null" &&
        location !== null &&
        location !== "null"
      ) {
        // 线路为空 操作员id必为空
        if (_t.formItem.lines === "") {
          location_number = location;
          operator_id = user_id;
        } else {
          // 线路不为空
          if (_t.formItem.station === "") {
            // 车站为空 操作员必为空
            location_number = _t.formItem.lines;
            operator_id = user_id;
          } else {
            // 车站不为空
            if (_t.formItem.operationId === "") {
              // 操作员为空
              location_number = _t.formItem.lines;
              location_number_query = _t.formItem.station;
              operator_id = user_id;
            } else {
              // 操作员不为空
              location_number = _t.formItem.lines;
              operator_id = _t.formItem.operationId;
              location_number_query = _t.formItem.station;
            }
          }
        }
        // 车站为空 操作员必为空
        if (_t.formItem.station === "") {
          location_number = location;
          operator_id = user_id;
        } else {
          // 车站有值
          location_number = _t.formItem.station;
          // 操作员为空
          if (_t.formItem.operationId === "") {
            operator_id = user_id;
          } else {
            // 操作员不为空
            operator_id = _t.formItem.operationId;
          }
        }
        if (location_number !== "" && operator_id !== "") {
          let str = "location_number=" + location_number;
          let Base64 = require("js-base64").Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          //  获取当天时间
          var start_dtime = _t.getCookie('TIME') + ' ' + '00:00:00';
          var end_dtime = _t.getCookie('TIME') + ' ' + '23:59:59';
          let postData = {
            // userid: user_id, // 操作员id
            location_number: location_number, // 位置编码
            location_number_query:
              location_number_query === "" ? null : location_number_query,
            stock_type: "02",
            money_state: "01",
            operation_type: _t.formItem.type === "" ? null : _t.formItem.type, //操作类型
            stock_state: _t.formItem.status === "" ? null : _t.formItem.status, // 状态
            change_reason:
              _t.formItem.reason === "" ? null : _t.formItem.reason, // 操作原因
            update_dt_begin: _t.formItem.dateTime !== null ? (_t.formItem.dateTime[0] !== undefined ? dateFilter(_t.formItem.dateTime[0].getTime()) : start_dtime) : start_dtime, // 开始时间
            update_dt_end: _t.formItem.dateTime !== null ? (_t.formItem.dateTime[0] !== undefined ? dateFilter(_t.formItem.dateTime[1].getTime()) : end_dtime) : end_dtime, // 结束时间
            pageNum: _t.options.currentPage, // 当前页
            pageSize: _t.options.pageSize, // 每页显示条数
            operator_id: _t.formItem.operationId === "" ? '' : _t.formItem.operationId, //操作员ID
            token: keyToken
          };
          _t.$api.post("/tsGateWay/incomeMoney/searchMoneyStockChangeRecordsGateWay",
            postData,
            function(res) {
              _t.$store.commit("setLoading", false);
              if (res.rtCode && res.rtCode === "11005") {
                _t.tableData = res.rtData === null ? [] : res.rtData;
                _t.options.total = res.totalCount ? res.totalCount : 0;
              } else if (res.rtCode) {
                _t.alertDialogTip(_t, res.rtMessage)
              }
            }
          );
        }
      }
    },
    // 重置查询按钮
    resetQuery() {
      var _t = this;
      _t.formItem.status = ''; //库存状态
      _t.formItem.type = ''; // 操作类型
      _t.formItem.reason = ''; // 操作原因
      _t.formItem.dateTime = []; //库存状态
      _t.getData()
    },
    // 获取车票类型
    getTicketType() {
      var _t = this;
      var location_number = _t.getCookie("LOCATION_NUMBER");
      var operator_id = _t.getCookie("USER_ID");
      if (
        location_number !== null &&
        location_number !== "null" &&
        operator_id !== null &&
        operator_id !== "null"
      ) {
        let str =
          "location_number=" + location_number + "&operator_id=" + operator_id;
        let Base64 = require("js-base64").Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        let postData = {
          location_number: location_number,
          operator_id: operator_id,
          token: keyToken
        };
        _t.$api.post(
          "/tsGateWay/inventoryListService/ticketTypeQueryGateWay",
          postData,
          function(res) {
            _t.$store.commit("setLoading", false);
            if (res.rtCode && res.rtCode === "10005") {
              _t.ticketType = res.rtData === null ? [] : res.rtData;
            }
          }
        );
      }
    },
    // 获取操作类型及原因
    getTypeAndReason() {
      var _t = this;
      var params = {
        typeid: "03" // 01 车票 02 现金
      };
      _t.$api.post(
        "/tsGateWay/ticketUtility/typeReasonCascadeQuery",
        params,
        function(res) {
          // 查询成功
          if (res.rtCode && res.rtCode === "14002") {
            _t.typeList = res.rtData === null ? [] : res.rtData;
          }
        }
      );
    },
    // 改变操作类型
    changeType(val) {
      var _t = this;
      if (val !== null && val !== "") {
        _t.typeList.forEach(item => {
          if (item.TYPE_VALUE === val) {
            // 变更原因赋值
            _t.reasonList = item.reasonList === null ? [] : item.reasonList;
            _t.formItem.reason = '';
          }
        });
      } else {
        _t.reasonList = [];
        _t.formItem.reason = "";
      }
    },
    // 查询线路及车站
    getLinesAndStation() {
      var _t = this;
      var params = {};
      _t.$api.post("/tsGateWay/ticketUtility/locationCascadeQuery",
        params,
        function(res) {
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
            if (item.stationList && item.stationList !== null) {
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
            if (item.userList && item.userList !== null) {
              // 操作员集合赋值
              _t.operatorIdList = item.userList;
              // 遍历操作员集合
              _t.operatorIdList.forEach(data => {
                // 找到自身
                if (data.USERID === _t.getCookie("USER_ID")) {
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
    }
  },
  created() {
    var _t = this;
    if ( _t.getCookie('LOCATION_TYPE_ID') !== '09') {
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
          _t.getTicketType();
          _t.getTypeAndReason();
        }
      });
      // 判断权限按钮
      limitBtnArr.forEach(item => {
        // 查询
        if (item.MENU_ID === "GUID00000000000000000000000000000086") {
          _t.limitBtn.queryBtn = true;
        }
        // 详情
        if (item.MENU_ID === "MENU20190917145128YpoCHvaTYkjLeo") {
          _t.limitBtn.details = true;
        }
      });
    }
  }
};
</script>

<style scoped>
</style>
