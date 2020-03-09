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
              :value="item.LINE_LOCATION_NUMBER.toString()"/>
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
              :value="item.LOCATION_NUMBER.toString()"/>
          </el-select>
        </el-form-item>
        <el-form-item  label="操作员ID：" class="marBottom7">
          <el-select
            clearable
            filterable
            class="width200"
            v-model="formItem.operationId">
            <el-option
              v-for="(item,index) in operatorIdList"
              :key="index"
              :label="item.USERNAME + '-' + item.USERID"
              :value="item.USERID.toString()"/>
          </el-select>
        </el-form-item>
        <el-form-item label="单据类型：" class="marBottom7">
          <el-select
            class="width200"
            clearable
            v-model="formItem.type">
            <el-option
              v-for="(item,index) in statusList"
              :key="index"
              :label="item.NAME"
              :value="item.VALUE"/>
          </el-select>
        </el-form-item>
        <el-form-item label="单据号：" class="marBottom7">
          <el-input clearable v-model="formItem.orderNum" placeholder="请输入单据号" class="width200"/>
        </el-form-item>
        <el-form-item label="创建时间：" class="marBottom7">
          <el-date-picker
            :default-time="['00:00:00', '23:59:59']"
            v-model="formItem.dateTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"/>
        </el-form-item>
        <br>
        <el-form-item class="fr marBottom7">
          <el-button type="primary" v-if="limitBtn.queryBtn" @click="getData">查询</el-button>
          <el-button type="warning" @click="resetFormItem">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="tableWp">
      <div class="marBottom10">
        <!-- 按钮部分 -->
        <el-button type="primary" :disabled="disabledBtn.create" v-if="limitBtn.WithTicket" @click="ticketBtn">配票/备用金
        </el-button>
        <el-button type="primary" :disabled="disabledBtn.add" v-if="limitBtn.AdditionalTickets" @click="addBtn">
          追加票/备用金
        </el-button>
        <el-button type="primary" :disabled="disabledBtn.earnings" v-if="limitBtn.earnings " @click="earningsBtn">收益预收
        </el-button>
        <el-button type="primary" :disabled="disabledBtn.recycle" v-if="limitBtn.recycle" @click="recycleBtn">回收
        </el-button>
        <el-button  v-if="limitBtn.finalBtn" :disabled="disabledBtn.finalBtn" @click="finalBtn" type="primary">结算单</el-button>
      </div>
      <!-- 表格内容 -->
      <el-table :data="tableData" border stripe :default-sort="{prop:'CREATE_TIME',order:'descending'}">
        <el-table-column prop="LINE_NAME" label="线路" header-align="center" align="center"/>
        <el-table-column prop="STATION_NAME" label="车站" header-align="center" align="center"/>
        <el-table-column prop="ORDER_ID" label="记录号" header-align="center" align="center"/>
        <el-table-column prop="OPERATE_TYPE_NAME" label="记录类型" header-align="center" align="center"/>
        <el-table-column prop="CREATE_TIME" sortable label="创建时间" width="160px" header-align="center" align="center"/>
        <el-table-column label="售票员" header-align="center" align="center">
          <template slot-scope="scope">
            <span>{{scope.row.BOM_OPERATOR_NAME}}</span>
            <span>-</span>
            <span>{{scope.row.BOM_OPERATOR_ID}}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作员" header-align="center" align="center">
          <template slot-scope="scope">
            <span>{{scope.row.BOM_CREATOR_NAME}}</span>
            <span>-</span>
            <span>{{scope.row.BOM_CREATOR_ID}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="OPERATE_STATE_NAME" sortable label="记录状态" header-align="center" align="center"/>
        <el-table-column label="操作" header-align="center" align="center">
          <template slot-scope="scope">
            <el-button v-if="limitBtn.detail" @click.stop="handleClick(scope.row)" type="primary">详情</el-button>
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
    <!--BOM操作单详情-->
    <el-dialog
      append-to-body
      :fullscreen="isScreen"
      :before-close="resetDetail"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :visible.sync="dialogDetailVisible">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">BOM操作单详情</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreen = !isScreen"></i>
      </div>
      <el-form :model="formDetail" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="线路：">
              <el-input v-model="formDetail.lines" disabled/>
            </el-form-item>
            <el-form-item label="单据号：">
              <el-input v-model="formDetail.orderNum" disabled/>
            </el-form-item>
            <el-form-item label="售票员id：">
              <el-input v-model="formDetail.operator_id" disabled/>
            </el-form-item>
            <el-form-item label="创建时间：">
              <el-input v-model="formDetail.create_time" disabled/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="车站：">
              <el-input v-model="formDetail.station" disabled/>
            </el-form-item>
            <el-form-item label="单据状态：">
              <el-input v-model="formDetail.status" disabled/>
            </el-form-item>
            <el-form-item label="单据类型：">
              <el-input v-model="formDetail.order_type" disabled/>
            </el-form-item>
            <el-form-item label="操作金额：">
              <el-input v-model="formDetail.MONEY" disabled/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <el-table :data="tableDetail" border stripe>
        <el-table-column prop="OPERATE_TYPE_NAME" label="操作类型" header-align="center" align="center"/>
        <el-table-column prop="CREATE_TIME" width="200px" label="操作时间" header-align="center" align="center"/>
        <el-table-column prop="TICKET_TYPE_NAME" label="票种" header-align="center" align="center"/>
        <el-table-column prop="TICKET_NUMBER" label="操作数量(张)" header-align="center" align="center"/>
      </el-table>
      <div slot="footer">
        <el-button type="primary" @click="resetDetail">关闭</el-button>
      </div>
    </el-dialog>
  </Box>
</template>
<script>
  import Box from "../../../components/Box";
  import {dateFilter} from "../../../assets/js/filters";

  export default {
    name: "BOMOperation",
    components: {Box},
    data() {
      return {
        isScreen: false, // 详情放大缩小
        // 查询表单
        formItem: {
          lines: '', // 线路
          station: '', //车站
          type: '', // 操作类型
          dateTime: [], // 创建时间
          operationId: '', // 操作员id
          orderNum: '' // 单据编号
        },
        linesListArr: [], // 调入调出位置
        // 表格
        tableData: [],
        // 分页
        options: {
          total: 0, // 总条数
          currentPage: 1, // 当前页码
          pageSize: 10 // 显示条数
        },
        // 单据类型
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
          WithTicket: false, // 配票/备用金
          AdditionalTickets: false, // 追加票/备用金
          earnings: false, // 收益预收
          recycle: false, // 回收
          undo: false, // 撤销
          detail: false, // 详情
          finalBtn: false // 结算单
        },
        // 按钮启用禁用
        disabledBtn: {
          create: false, // 配票
          add: false, // 追加
          earnings: false, // 收益预收
          recycle: false, // 回收
          finalBtn: false, // 结算单
          createDis: true, // 车站线路
        },
        // BOM操作单详情表单
        formDetail: {
          order_id: '', // 当前编号
          lines: '', // 线路
          station: '', // 车站
          status: '', // 单据状态
          orderNum: '', // 单据号
          operator_id: '', // 操作员id
          create_time: '', // 创建时间
          order_type: '', // 单据类型
          MONEY: '', // 操作金额
        },
        // BOM操作单详情表格
        tableDetail: [],
        // 分页
        detailOptions: {
          total: 0, // 总条数
          currentPage: 1, // 当前页码
          pageSize: 10 // 显示条数
        },
        // 详情蒙版
        dialogDetailVisible: false,
        // 表格选中数据集合
        tableSelect: {
          id: '', // id
        },
        // 从cookie中获取
        cookieMap: {
          location_number: this.getCookie('LOCATION_NUMBER'), // 位置编号
          user_id: this.getCookie('USER_ID'), // 操作员ID
          role: this.getCookie('USER_TYPE'), // 用户角色
        }
      };
    },
    methods: {
      // 重置查询表单
      resetFormItem() {
        var _t = this;
        // 创建时间
        _t.formItem.dateTime = [];
        // 单据编号
        _t.formItem.orderNum = '';
        // 操作类型
        _t.formItem.type = '';
        _t.getStatusData();
        _t.getLinesAndStation();
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
      // 查询按钮
      getData() {
        var _t = this;
        var location_number = '';
        var operator_id = '';
        var location_number_query = '';
        location_number =  _t.formItem.lines?  _t.formItem.lines: _t.cookieMap.location_number;
        operator_id = _t.formItem.operationId === '' ? _t.cookieMap.user_id : _t.formItem.operationId;
        location_number_query = _t.formItem.station;
        //  获取当天时间
        var start_dtime = _t.getCookie('TIME') + ' ' + '00:00:00';
        var end_dtime = _t.getCookie('TIME') + ' ' + '23:59:59';
        let postData = {
          location_number: location_number, // 线路
          location_number_query: location_number_query === '' ? null : location_number_query, // 车站
          order_id: _t.formItem.orderNum.trim() === '' ? null : _t.formItem.orderNum.trim(), // 单据号
          bom_creator_id: _t.formItem.operationId, // 操作员id
          option_type: _t.formItem.type,
          operate_type: _t.formItem.type === '' ? null : _t.formItem.type, // 单据类型
          operate_state: null, // 单据状态
          start_dt: _t.formItem.dateTime !== null ? (_t.formItem.dateTime[0] !== undefined ? dateFilter(_t.formItem.dateTime[0].getTime()) : start_dtime) : start_dtime, // 开始时间
          end_dt: _t.formItem.dateTime !== null ? (_t.formItem.dateTime[1] !== undefined ? dateFilter(_t.formItem.dateTime[1].getTime()) : end_dtime) : end_dtime, // 结束时间
          pageNum: _t.options.currentPage, // 当前页
          pageSize: _t.options.pageSize, // 每页显示条数
        };
        _t.$api.post("/tsGateWay/bommanager/operationListQuery", postData, function (res) {
          _t.$store.commit("setLoading", false);
          if (res.rtCode && res.rtCode === "12006") {
            _t.tableData = res.rtData === null ? [] : res.rtData;
            _t.options.total = res.totalCount ? res.totalCount : 0;
          } else if (res.rtCode) {
            _t.alertDialogTip(_t, res.rtMessage);
          }
        });
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
          if (res.rtCode && res.rtCode === "14010") {
            _t.statusList = res.rtData === null ? [] : res.rtData;
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
      // 配票备用金
      ticketBtn() {
        var _t = this;
        _t.$router.push({name: 'BOMOperationAdd'});
      },
      // 追加票备用金
      addBtn() {
        var _t = this;
        _t.$router.push({name: 'BOMOperationEdit'});
      },
      // 收益预收
      earningsBtn() {
        var _t = this;
        _t.$router.push({name: 'BOMOperationAdvance'});
      },
      // 回收
      recycleBtn() {
        var _t = this;
        _t.$router.push({name: 'BOMOperationRecycle'});
      },
      // 结算单
      finalBtn() {
        var _t = this;
        _t.$router.push({name: 'BOMOperationCurrency'});
      },
      // BOM操作单单详情
      handleClick(row) {
        var _t = this;
        _t.dialogDetailVisible = true;
        _t.formDetail.order_id = row.ORDER_ID;
        _t.getDetailData();
      },
      // 获取详情接口数据
      getDetailData() {
        var _t = this;
        let str = "order_id=" + _t.formDetail.order_id;
        let Base64 = require("js-base64").Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        var params = {
          order_id: _t.formDetail.order_id, // 单据号
          pageNum: _t.detailOptions.currentPage, // 当前页
          pageSize: _t.detailOptions.pageSize, // 每页显示条数
          token: keyToken, // token
        };
        _t.$api.post('/tsGateWay/bommanager/operationinfoquery', params, function (res) {
          if (res.rtCode && res.rtCode === '12006') {
            _t.tableDetail = res.reData === null ? [] : res.rtData;
            _t.detailOptions.total = res.totalCount !== undefined ? res.totalCount : 0;
            // 取出表格中固定的字段
            if (_t.tableDetail.length !== 0) {
              _t.formDetail.lines = _t.tableDetail[0].LINE_NAME ? _t.tableDetail[0].LINE_NAME : ''; // 线路
              _t.formDetail.station = _t.tableDetail[0].STATION_NAME ? _t.tableDetail[0].STATION_NAME : ''; // 车站
              _t.formDetail.operator_id = _t.tableDetail[0].BOM_OPERATOR_ID ? _t.tableDetail[0].BOM_OPERATOR_ID : ''; // 操作员
              _t.formDetail.orderNum = _t.tableDetail[0].ORDER_ID ? _t.tableDetail[0].ORDER_ID : ''; // 单据号
              _t.formDetail.status = _t.tableDetail[0].OPERATE_STATE_NAME ? _t.tableDetail[0].OPERATE_STATE_NAME : ''; // 单据状态
              _t.formDetail.create_time = _t.tableDetail[0].CREATE_TIME ? _t.tableDetail[0].CREATE_TIME : ''; // 创建时间
              _t.formDetail.order_type = _t.tableDetail[0].OPERATE_TYPE_NAME ? _t.tableDetail[0].OPERATE_TYPE_NAME : ''; // 单据类型
              _t.formDetail.MONEY = _t.tableDetail[0].MONEY ? _t.tableDetail[0].MONEY : '0'; // 操作金额
            }
          } else if (res.rtCode) {
            _t.alertDialogTip(_t, res.rtMessage);
          }
        });
      },
      // 改变当前页码
      handleCurrentChangeDetail(val) {
        var _t = this;
        _t.detailOptions.currentPage = val;
        _t.getDetailData();
      },
      // 改变每页显示条数
      handleSizeChangeSubDetail(val) {
        var _t = this;
        _t.detailOptions.pageSize = val;
        _t.getDetailData();
      },
      // 重置详情表单
      resetDetail() {
        var _t = this;
        _t.dialogDetailVisible = false;
        _t.tableDetail = []; // 表格置空
        _t.detailOptions.total = 0; // 总条数置为0
        _t.formDetail.lines = ''; // 线路
        _t.formDetail.station = ''; // 车站
        _t.formDetail.operator_id = ''; // 操作员
        _t.formDetail.orderNum = ''; // 单据号
        _t.formDetail.status = ''; // 单据状态
        _t.formDetail.create_time = ''; // 创建时间
        _t.formDetail.order_id = ''; // 详情缓存order_id
        _t.formDetail.order_type = ''; // 单据类型
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
          }
        });
        // 判断权限按钮
        limitBtnArr.forEach(item => {
          // 查询
          if (item.MENU_ID === "GUID00000000000000000000000000000099") {
            _t.limitBtn.queryBtn = true;
          }
          // 配票/备用金
          if (item.MENU_ID === "GUID00000000000000000000000000000100") {
            _t.limitBtn.WithTicket = true;
          }
          // 追加票/备用金
          if (item.MENU_ID === "GUID00000000000000000000000000000101") {
            _t.limitBtn.AdditionalTickets = true;
          }
          // 收益预收
          if (item.MENU_ID === "GUID00000000000000000000000000000102") {
            _t.limitBtn.earnings = true;
          }
          // 回收
          if (item.MENU_ID === "GUID00000000000000000000000000000103") {
            _t.limitBtn.recycle = true;
          }
          // 撤销
          if (item.MENU_ID === "GUID00000000000000000000000000000104") {
            _t.limitBtn.undo = true;
          }
          // 结算单
          if (item.MENU_ID === "MENU20191018144715wnMvuyTrpvsaHS") {
            _t.limitBtn.finalBtn = true;
          }
          // 详情
          if (item.MENU_ID === "GUID00000000000000000000000000000105") {
            _t.limitBtn.detail = true;
          }
        });
      }
    }
  };
</script>

<style scoped>

</style>
