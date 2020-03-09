<template>
  <Box>
    <div class="formBox-top">
      <!-- 头部查询部分 -->
      <el-form :model="formItem" label-width="120px" :inline="true">
        <el-form-item label="线路：" class="marBottom7">
          <el-select
            clearable
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
          <el-select  :disabled="disabledBtn.createDis" clearable v-model="formItem.station" class="width200">
            <el-option
              v-for="(item,index) in stationList"
              :key="index"
              :label="item.STATION_LOCATION_NAME"
              :value="item.LOCATION_NUMBER.toString()"
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
        <br/>
        <el-form-item class="fr marBottom7">
          <el-button type="primary" v-if="limitBtn.queryBtn" @click="getData">查询</el-button>
          <el-button type="warning" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 表格内容 -->
    <div class="tableWp">
      <el-table
        :data="tableData"
        border
        stripe
        :default-sort="{prop: 'stock_state_name', order: 'descending'}"
      >
        <el-table-column prop="line_name" label="线路" align="center"/>
        <el-table-column prop="station_name" label="车站" align="center"/>
        <el-table-column prop="stock_state_name" label="库存状态" align="center" sortable/>
        <el-table-column prop="money_amount_yuan" label="库存金额(元)" align="center"/>
        <el-table-column fixed="right" label="操作" align="center">
          <template slot-scope="scope">
            <el-button v-if="scope.row.location_number == cookieMap.location_number && limitBtn.operation" @click="handleClick(scope.row)" type="primary">库存操作</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页-->
      <pages
        :total="options.total"
        :currentPage="options.currentPage"
        :page-size="options.pageSize"
        @handleSizeChangeSub="handleSizeChangeSub"
        @handleCurrentChangeSub="handleCurrentChange"
      />
    </div>
    <!-- 库存操作 -->
    <div class="dialog">
      <el-dialog
        :fullscreen="isScreen"
        :visible.sync="dialogVisible"
        append-to-body
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :before-close="resetChecked"
      >
        <div slot="title" class="dialogTitle clearFix">
          <span class="title">库存操作</span>
          <i class="el-icon-copy-document" title="放大/缩小" @click="isScreen = !isScreen"></i>
        </div>
        <el-form :model="addEdit" label-width="120px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="线路：">
                <el-select v-model="addEdit.lines" class="widthAll" disabled>
                  <el-option
                    v-for="(item,index) in linesList"
                    :key="index"
                    :label="item.LINE_LOCATION_NAME"
                    :value="item.LINE_LOCATION_NUMBER.toString()"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="操作类型：">
                <el-select
                  class="widthAll"
                  @change="changeType(addEdit.operation_type)"
                  v-model="addEdit.operation_type"
                  placeholder="请选择操作类型"
                >
                  <el-option
                    v-for="(item,index) in typeList"
                    :key="index"
                    :label="item.TYPE_NAME"
                    :value="item.TYPE_VALUE"
                  />
                </el-select>
                <span v-if="errorTip.typeFlag" class="isNotNull">必选项不能为空</span>
              </el-form-item>
              <el-form-item label="库存金额(元)：" class="star">
                <el-input disabled v-model="addEdit.stock_quantity"/>
              </el-form-item>
              <el-form-item label="认证操作员" class="star">
                <el-input
                  maxlength="6"
                  placeholder="请输入操作员id"
                  @blur="blurInputUser(addEdit.identified_operator_id2,'userFlag2')"
                  v-model="addEdit.identified_operator_id2"
                />
                <span v-if="errorTip.userFlag2" class="isNotNull">必填项不能为空</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="车站：">
                <el-select v-model="addEdit.station" class="widthAll" disabled>
                  <el-option
                    v-for="(item,index) in stationList"
                    :key="index"
                    :label="item.STATION_LOCATION_NAME"
                    :value="item.LOCATION_NUMBER.toString()"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="变更原因：">
                <el-select
                  class="widthAll"
                  v-model="addEdit.change_reason"
                  @change="changeReason(addEdit.change_reason)"
                  placeholder="请选择变更原因"
                >
                  <el-option
                    @blur="blurInputUser(addEdit.identified_operator_id1,'reasonFlag')"
                    v-for="(item,index) in reasonList"
                    :key="index"
                    :label="item.REASON_NAME"
                    :value="item.REASON_VALUE"
                  />
                </el-select>
                <span v-if="errorTip.reasonFlag" class="isNotNull">变更原因不能为空</span>
              </el-form-item>
              <el-form-item label="操作金额(元)：" class="star">
                <el-input
                  placeholder="请输入操作金额"
                  oninput="value=value.replace(/[^\d]/g,'')"
                  v-model="addEdit.operate_amount"
                  maxlength="8"
                  @blur="blurInputMoney(addEdit.operate_amount,'operationFlag')"
                />
                <span v-if="errorTip.operationFlag" class="isNotNull">操作金额不能为空</span>
              </el-form-item>
              <el-form-item label="密码：" class="star">
                <el-input
                  placeholder="请输入密码"
                  type="password"
                  @blur="blurInputUser(addEdit.identified_operator_password,'passwordFlag')"
                  v-model="addEdit.identified_operator_password"
                  maxlength="6"
                />
                <span v-if="errorTip.passwordFlag" class="isNotNull">必填项不能为空</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="备注：">
            <el-input type="textarea" v-model="addEdit.comment_info" maxlength="250" show-word-limit/>
          </el-form-item>
        </el-form>
        <div slot="footer">
          <el-button @click="resetChecked">取消</el-button>
          <el-button type="primary" v-btn-control @click="addEditData">保存</el-button>
        </div>
      </el-dialog>
    </div>
  </Box>
</template>
<script>
  import Box from "../../../components/Box";
  import {dateFilter} from "../../../assets/js/filters";

  export default {
    name: "profitStockChange",
    components: {Box},
    data() {
      return {
        // 放大缩小
        isScreen: false,
        // 查询表单
        formItem: {
          lines: "", // 线路
          station: "", // 车站
          status: "" // 状态
        },
        // 分页
        options: {
          total: 0, // 总条数
          currentPage: 1, // 当前页码
          pageSize: 10 // 显示条数
        },
        linesListArr:[], // 调入线路
        // 表格
        tableData: [],
        // 库存操作
        dialogVisible: false,
        // 收益库存变更状态
        statusList: [],
        // 操作类型
        typeList: [],
        // 操作原因
        reasonList: [],
        // 线路集合
        linesList: [],
        // 车站集合
        stationList: [],
        // 按钮权限
        limitBtn: {
          queryBtn: false, // 查询
          operation: false // 库存操作
        },
        // 按钮禁选
        disabledBtn: {
          createDis: true
        },
        // 库存操作
        addEdit: {
          lines: "", // 线路
          station: "", // 车站
          operation_type: "", // 操作类型
          change_reason: "", // 变更原因
          stock_quantity: "", // 库存金额
          operate_amount: "", // 操作金额
          operate_amountFocus: "", //操作金额失去焦点
          identified_operator_id1: "", // 操作人员1
          identified_operator_id2: "", // 操作人员2
          identified_operator_password: "", // 密码
          comment_info: '', // 备注
        },
        // 操作表单校验
        errorTip: {
          typeFlag: false, // 操作类型
          reasonFlag: false, // 变更原因
          operationFlag: false, // 操作金额
          userFlag1: false, // 认证操作员1
          userFlag2: false, // 认证操作员2
          passwordFlag: false // 密码
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
      //操作金额失去焦点自动保留两位小数
      loseFocus() {
        var _t = this;
        if (_t.addEdit.operate_amount.trim() == "") {
          _t.addEdit.operate_amount = "";
        } else {
          _t.addEdit.operate_amountFocus = _t.addEdit.operate_amount;
          _t.addEdit.operate_amount = (
            _t.addEdit.operate_amountFocus * 1
          ).toFixed(2);
        }
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
      // 获取操作类型及原因
      getTypeAndReason() {
        var _t = this;
        var params = {
          typeid: "03" // 01 车票 02 现金
        };
        _t.$api.post(
          "/tsGateWay/ticketUtility/typeReasonCascadeQuery",
          params,
          function (res) {
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
          _t.errorTip.typeFlag = false;
          _t.typeList.forEach(item => {
            if (item.TYPE_VALUE === val) {
              // 变更原因赋值
              _t.reasonList = item.reasonList === null ? [] : item.reasonList;
              _t.addEdit.change_reason = ''
            }
          });
        } else {
          _t.errorTip.typeFlag = true;
        }
      },
      // 改变变更原因
      changeReason(val) {
        var _t = this;
        if (val !== "") {
          // 不为空
          _t.errorTip.reasonFlag = false;
        } else {
          // 为空
          _t.errorTip.reasonFlag = true;
        }
      },
      // 失去焦点校验操作金额
      blurInputMoney() {
        var _t = this;
        if (_t.addEdit.operate_amount.trim() === "") {
          _t.errorTip.operationFlag = true;
          _t.errorTip.operationTip = "必填项不能为空";
        } else {
          var reg = _t.$config.isMoneyNumber();
          if (reg.test(_t.addEdit.operate_amount.trim()) === false) {
            _t.errorTip.operationFlag = true;
            _t.errorTip.operationTip = "格式不正确";
          } else {
            _t.errorTip.operationFlag = false;
            _t.errorTip.operationTip = "";
          }
        }
      },
      // 认证员校验
      blurInputUser(val, flag) {
        var _t = this;
        if (val.trim() === "") {
          _t.errorTip[flag] = true;
        } else {
          _t.errorTip[flag] = false;
        }
      },
      // 重置校验
      resetChecked() {
        var _t = this;
        _t.dialogVisible = false; // 隐藏蒙版
        _t.addEdit.lines = ""; // 线路
        _t.addEdit.station = ""; // 车站
        _t.addEdit.location_number = ""; // 位置编码
        _t.addEdit.operation_type = ""; // 变更类型
        _t.addEdit.change_reason = ""; // 变更原因
        _t.addEdit.stock_quantity = ""; // 库存金额
        _t.addEdit.operate_amount = ""; // 操作金额
        _t.addEdit.identified_operator_id1 = ""; // 操作人员1
        _t.addEdit.identified_operator_id2 = ""; // 操作人员2
        _t.addEdit.identified_operator_password = ""; // 密码
        _t.errorTip.typeFlag = false; // 操作类型
        _t.errorTip.reasonFlag = false; // 原因
        _t.errorTip.operationFlag = false; // 操作金额
        _t.errorTip.userFlag1 = false; // 操作人员1
        _t.errorTip.userFlag2 = false; // 操作人员2
        _t.errorTip.passwordFlag = false; // 密码
        _t.addEdit.comment_info = '' // 备注
      },
      // 库存操作提交
      addEditData() {
        var _t = this;
        // 校验 操作类型
        if (
          _t.addEdit.operation_type === null ||
          _t.addEdit.operation_type === ""
        ) {
          _t.errorTip.typeFlag = true;
        } else {
          _t.errorTip.typeFlag = false;
        }
        // 校验 操作原因
        if (
          _t.addEdit.change_reason === null ||
          _t.addEdit.change_reason === ""
        ) {
          _t.errorTip.reasonFlag = true;
        } else {
          _t.errorTip.reasonFlag = false;
        }
        // 校验操作人员1
        // if (_t.addEdit.identified_operator_id1.trim() === "") {
        //   _t.errorTip.userFlag1 = true;
        // } else {
        //   _t.errorTip.userFlag1 = false;
        // }
        // 校验操作人员2
        if (_t.addEdit.identified_operator_id2.trim() === "") {
          _t.errorTip.userFlag2 = true;
        } else {
          _t.errorTip.userFlag2 = false;
        }
        // 校验密码
        if (_t.addEdit.identified_operator_password.trim() === "") {
          _t.errorTip.passwordFlag = true;
        } else {
          _t.errorTip.passwordFlag = false;
        }
        if (
          _t.errorTip.typeFlag === false &&
          _t.errorTip.reasonFlag === false &&
          _t.errorTip.operationFlag === false &&
          _t.errorTip.userFlag1 === false &&
          _t.errorTip.userFlag2 === false &&
          _t.errorTip.passwordFlag === false
        ) {
          var location_number = _t.getCookie("LOCATION_NUMBER");
          var user_id = _t.getCookie("USER_ID");
          // 提交
          let str =
            "userid=" +
            user_id +
            "&location_number=" +
            location_number +
            "&operation_type=" +
            _t.addEdit.operation_type +
            "&change_reason=" +
            _t.addEdit.change_reason +
            "&amount=" +
            _t.addEdit.operate_amount.trim() +
            "&identified_operator_id1=" +
            user_id +
            "&identified_operator_id2=" +
            _t.addEdit.identified_operator_id2.trim() +
            "&identified_operator_password2=" +
            _t.addEdit.identified_operator_password.trim();
          let Base64 = require("js-base64").Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          var params = {
            userid: user_id, // 操作员id
            location_number: location_number.toString(), // 位置编号
            operation_type: _t.addEdit.operation_type, //操作类型
            change_reason: _t.addEdit.change_reason, //操作原因
            amount: _t.addEdit.operate_amount.trim(), //操作金额
            identified_operator_id1: user_id, //操作员1
            identified_operator_id2: _t.addEdit.identified_operator_id2.trim(), //操作员2
            identified_operator_password2: _t.addEdit.identified_operator_password.trim(), //密码
            comment_info: _t.addEdit.comment_info.trim(), // 备注
            token: keyToken //token
          };
          _t.$api.post(
            "/tsGateWay/incomeMoney/changeMoneyStockGateWay",
            params,
            function (res) {
              // 操作成功
              if (res.rtCode && res.rtCode === "11006") {
                _t.$alert(res.rtMessage, '温馨提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消'
                }).then(() => {
                  _t.getData();
                  _t.resetChecked();
                }).catch(() => {
                  _t.getData();
                  _t.resetChecked();
                });
              } else {
                _t.alertDialogTip(_t, res.rtMessage);
              }
            }
          );
        }
      },
      // 库存操作按钮
      handleClick(row) {
        var _t = this;
        // 显示蒙版
        _t.dialogVisible = true;
        // 位置编号
        _t.addEdit.location_number = row.LOCATION_NUMBER ? row.LOCATION_NUMBER : "";

        if (_t.linesList.length == 1) {
          _t.addEdit.station = row.station_name ? row.station_name : "";
        }else if (_t.linesList.length > 1) {
          // 车站
          _t.addEdit.station = "";
        }
        // 线路
        _t.addEdit.lines = row.line_name ? row.line_name : "";
        // 库存金额
        _t.addEdit.stock_quantity = row.money_amount_yuan ? row.money_amount_yuan : "";
        // 获取操作类型及原因
        _t.getTypeAndReason();
      },
      // 查询按钮
      getData() {
        var _t = this;
        var role = _t.getCookie("USER_TYPE"); // 角色
        var location = _t.getCookie("LOCATION_NUMBER"); // 位置编号
        var user_id = _t.getCookie("USER_ID"); // 用户id
        var location_number = ""; // 发送请求的 位置编号
        var location_number_query = ""; // 发送请求的 query
        // 车站为空
        if (_t.formItem.station === "") {
          location_number = location;
        } else {
          // 车站有值
          location_number = _t.formItem.station;
        }
        // 线路为空
        if (_t.formItem.lines === "") {
          location_number = location;
        } else {
          // 线路不为空
          if (_t.formItem.station === "") {
            // 车站为空
            location_number = _t.formItem.lines;
          } else {
            // 车站不为空
            location_number = _t.formItem.station;
            location_number_query = _t.formItem.station;
          }
        }
        if (location_number !== "" && user_id !== null && user_id !== "null") {
          let str = "userid=" + user_id + "&location_number=" + location_number;
          let Base64 = require("js-base64").Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          let postData = {
            userid: user_id, //登录用户
            location_number: location_number, // 位置编码
            location_number_query:
              location_number_query === "" ? null : location_number_query, // 位置编码
            token: keyToken, // token
            stock_state: _t.formItem.status === "" ? null : _t.formItem.status, // 状态
            pageNum: _t.options.currentPage, // 当前页
            pageSize: _t.options.pageSize // 每页显示条数
          };
          _t.$api.post("/tsGateWay/incomeMoney/searchMoneyStockGateWay", postData, function (res) {
              _t.$store.commit("setLoading", false);
              if (res.rtCode && res.rtCode === "11001") {
                _t.tableData = res.rtData === null ? [] : res.rtData;
                _t.options.total = res.totalCount ? res.totalCount : 0;
              } else {
                _t.alertDialogTip(_t, res.rtMessage);
              }
            }
          );
        }
      },
      // 重置查询按钮
      resetQuery() {
        var _t = this;
        _t.formItem.status = "" // 状态
        _t.getData()
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
        _t.$api.post(
          "/tsGateWay/ticketUtility/locationCascadeQuery",
          params,
          function (res) {
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
            }
          });
        } else {
          // 选中线路为空
          _t.stationList = [];
          _t.formItem.station = "";
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

          }
        });
        // 判断权限按钮
        limitBtnArr.forEach(item => {
          // 查询
          if (item.MENU_ID === "GUID00000000000000000000000000000083") {
            _t.limitBtn.queryBtn = true;
          }
          // 库存操作
          if (item.MENU_ID === "GUID00000000000000000000000000000084") {
            _t.limitBtn.operation = true;
          }
        });
      }
    }
  };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  body {
    user-select: none;
  }
  .el-dialog__wrapper {
    user-select: none
  }
  .el-select-dropdown__list {
    user-select: none
  }
</style>
