<template>
  <Box>
    <div class="formBox-top">
      <!-- 头部查询部分 -->
      <el-form :model="formItem" label-width="120px" :inline="true">
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
            clearable
            :disabled="disabledBtn.createDis"
            v-model="formItem.station" class="width200">
            <el-option
              v-for="(item,index) in stationList"
              :key="index"
              :label="item.STATION_LOCATION_NAME"
              :value="item.LOCATION_NUMBER.toString()"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="解行单号" class="marBottom7">
          <el-input  maxlength="36" placeholder="请输入内容" v-model="formItem.orderNum" class="width200" clearable />
        </el-form-item>
        <el-form-item label="单据状态：" class="marBottom7">
          <el-select
            clearable
            v-model="formItem.order_state_code" class="width200">
            <el-option label="编辑中" value="00"/>
            <el-option label="待审核" value="01"/>
            <el-option label="已作废" value="02"/>
            <el-option label="已解行" value="03"/>
          </el-select>
        </el-form-item>
        <el-form-item label="操作时间：" class="marBottom7">
          <el-date-picker
            :default-time="['00:00:00', '23:59:59']"
            v-model="formItem.dateTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
        </el-form-item>
        <br />
        <el-form-item class="fr marBottom7">
          <el-button type="primary" v-if="limitBtn.queryBtn" @click="getData">查询</el-button>
          <el-button type="warning" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 按钮部分 -->
    <div class="marBottom10">
      <el-button
        type="primary"
        @click="create"
        v-if="limitBtn.create"
      >创建解行单</el-button>
      <el-button
        type="primary"
        @click="entering"
        v-if="limitBtn.entering"
        :disabled="disabledBtn.entering"
      >单据录入</el-button>
    </div>
    <!-- 表格内容 -->
    <div class="tableWp">
      <el-table
        :data="tableData"
        border
        :row-key="getRowKey"
        @select="selectionChange"
        @select-all="selectionChange"
        ref="clearSelection"
        stripe
        :default-sort="{prop: 'update_dt', order: 'descending'}"
      >
        <el-table-column :selectable='isDisabled' reserve-selection type="selection" fixed align="center" />
        <el-table-column prop="order_id" label="解行单号" align="center" />
        <el-table-column prop="line_name" label="线路" align="center" />
        <el-table-column prop="station_name" label="车站" align="center" />
        <el-table-column prop="bank_name" label="解行银行" align="center" />
        <el-table-column prop="apply_money_amount_yuan" label="解行金额(元)" align="center" />
        <el-table-column prop="order_state_name" label="状态" align="center" sortable />
        <el-table-column prop="update_dt" label="解行时间" width="160" align="center" sortable />
        <el-table-column fixed="right" label="操作" align="center">
          <template slot-scope="scope">
            <el-button @click="detailBtn(scope.row)" type="primary">详情</el-button>
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
    <div class="dialog">
      <el-dialog
        v-dialogDrag
        :fullscreen="isScreenCreate"
        :visible.sync="dialogCreateVisible"
        append-to-body
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :before-close="resetChecked"
      >
        <div slot="title" class="dialogTitle clearFix">
          <span class="title">创建解行单</span>
          <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenCreate=!isScreenCreate"></i>
        </div>
        <el-form :model="addEdit" label-width="110px">
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
                <el-input
                  disabled
                  v-model="addEdit.operation_type"
                />
                <span v-if="errorTip.typeFlag" class="isNotNull">必选项不能为空</span>
              </el-form-item>
              <el-form-item label="解行银行：">
                <el-select
                  class="widthAll"
                  @change="changeType3(addEdit.bankCode)"
                  v-model="addEdit.bankCode"
                  placeholder="请选择银行"
                >
                  <el-option
                    v-for="item in bankList"
                    :key="item.VALUE"
                    :label="item.NAME"
                    :value="item.VALUE"
                  />
                </el-select>
                <span v-if="errorTip.bankFlag" class="isNotNull">必选项不能为空</span>
              </el-form-item>
              <el-form-item label="认证操作员" class="star">
                <el-input
                  maxlength="6"
                  placeholder="请输入操作员id"
                  @blur="blurInputUser(addEdit.operator_id,'userFlag')"
                  v-model="addEdit.operator_id"
                />
                <span v-if="errorTip.userFlag" class="isNotNull">操作员不能为空</span>
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
              <el-form-item label="收益库存(元)：">
                <el-input v-model="stockMoney" disabled />
              </el-form-item>
              <el-form-item label="解行金额(元)：">
                <el-input
                  placeholder="请输入解行金额"
                  oninput="value=value.replace(/[^\d]/g,'')"
                  v-model="addEdit.money"
                  maxlength="9"
                  @blur="blurInputUser(addEdit.money,'moneyFlag');loseFocus()"
                />
                <span v-if="errorTip.moneyFlag" class="isNotNull">解行金额不能为空</span>
              </el-form-item>
              <el-form-item label="密码：" class="star">
                <el-input
                  placeholder="请输入密码"
                  type="password"
                  maxlength="6"
                  @blur="blurInputUser(addEdit.identified_operator_password,'passwordFlag')"
                  v-model="addEdit.identified_operator_password"
                />
                <span v-if="errorTip.passwordFlag" class="isNotNull">密码不能为空</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="备注：">
            <el-input
              v-model="addEdit.commentInfo"
              type="textarea"
              maxlength="250"
              show-word-limit
            />
          </el-form-item>
        </el-form>
        <div slot="footer">
          <el-button @click="resetChecked">取消</el-button>
          <el-button type="primary" v-btn-control  :disabled="disabledShow" @click="addEditData">保存</el-button>
        </div>
      </el-dialog>
      <el-dialog
        v-dialogDrag
        :fullscreen="isScreenTypeIn"
        :visible.sync="dialogEnteringVisible"
        append-to-body
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :before-close="resetCheckedTwo"
      >
        <div slot="title" class="dialogTitle clearFix">
          <span class="title">单据录入</span>
          <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenTypeIn = !isScreenTypeIn"></i>
        </div>
        <el-form label-width="100px" :model="enteringList">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="操作员id">
                <el-input v-model="enteringList.operator_id" disabled />
              </el-form-item>
              <el-form-item label="操作类型">
                 <el-input disabled v-model="enteringList.operation_type"></el-input>
                <span v-if="errorTip2.typeFlag" class="isNotNull">必选项不能为空</span>
              </el-form-item>
              <el-form-item label="认证操作员" class="star">
                <el-input
                  maxlength="6"
                  placeholder="请输入操作员id"
                  @blur="blurInputUser2(enteringList.operatorUser,'userFlag')"
                  v-model="enteringList.operatorUser"
                />
                <span v-if="errorTip2.userFlag" class="isNotNull">必填项不能为空</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="车站">
                <el-select v-model="enteringList.station" class="widthAll" disabled>
                  <el-option
                    v-for="(item,index) in linesListStation"
                    :key="index"
                    :label="item.location_name"
                    :value="item.location_number.toString()"
                  />
                </el-select>
              </el-form-item>
              <!-- 此标签只用来占位，没有其他用途 -->
              <el-form-item class="visibility" label="占位隐藏：">
                <el-input v-model="addEdit.inLocation"></el-input>
              </el-form-item>
              <el-form-item label="密码" class="star">
                <el-input
                  type="password"
                  placeholder="请输入密码"
                  maxlength="6"
                  @blur="blurInputUser2(enteringList.identified_operator_password,'passwordFlag')"
                  v-model="enteringList.identified_operator_password"
                />
                <span v-if="errorTip2.passwordFlag" class="isNotNull">必填项不能为空</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div class="lowerPart">
          <el-table border :data="selectedData" stripe>
            <el-table-column prop="order_id" label="解行单号" align="center" />
            <el-table-column  width="50" prop="line_name" label="线路" align="center" />
            <el-table-column width="50" prop="station_name" label="车站" align="center" />
            <el-table-column  prop="apply_money_amount" label="车站解行金额(元)" align="center" />
            <el-table-column width="250" label="银行解行单号" align="center" >
              <template slot-scope="scope">
                <el-input v-model="scope.row.money_send_order_id" />
              </template>
            </el-table-column>
            <el-table-column width="200" label="银行解行金额(元)" align="center">
              <template slot-scope="scope">
                <el-input
                  oninput="value=value.replace(/[^\d]/g,'')"
                  @blur="lose()"
                  maxlength="9"
                  v-model="scope.row.money_amount" />
              </template>
            </el-table-column>
            <el-table-column width="200"  label="备注" align="center">
              <template slot-scope="scope">
                <el-input type="textarea" resize="none" v-model="scope.row.comment_info" />
              </template>
            </el-table-column>
          </el-table>
        </div>
        <span slot="footer">
          <el-button @click="resetCheckedTwo">取消</el-button>
          <el-button type="primary" v-btn-control   @click="commitEntering">保存</el-button>
        </span>
      </el-dialog>
      <!--收益解行详情-->
      <el-dialog
        v-dialogDrag
        :fullscreen="isScreen"
        append-to-body
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :visible.sync="dialogDetailVisible"
      >
        <div slot="title" class="dialogTitle clearFix">
          <span class="title">收益解行详情</span>
          <i class="el-icon-copy-document" title="放大/缩小" @click="isScreen = !isScreen"></i>
        </div>
        <el-form :model="detailFormItem" ref="detailFormItem" label-width="120px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="线路：" class="marBottom7">
                <el-input v-model="detailFormItem.lines" disabled></el-input>
              </el-form-item>
              <el-form-item label="解行单号：" class="marBottom7">
                <el-input v-model="detailFormItem.order_id" disabled></el-input>
              </el-form-item>
              <el-form-item label="解行银行" class="marBottom7">
                <el-input v-model="detailFormItem.bank_name" disabled></el-input>
              </el-form-item>
              <el-form-item label="申请解行金额" class="marBottom7">
                <el-input v-model="detailFormItem.apply_money_amount_yuan" disabled></el-input>
              </el-form-item>
              <el-form-item label="状态" class="marBottom7">
                <el-input v-model="detailFormItem.order_state_name" disabled></el-input>
              </el-form-item>
              <el-form-item label="操作员" class="marBottom7">
                <el-input v-model="detailFormItem.operator_name" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="车站：" class="marBottom7">
                <el-input v-model="detailFormItem.station" disabled></el-input>
              </el-form-item>
              <el-form-item label="银行解行单号" class="marBottom7">
                <el-input v-model="detailFormItem.money_send_order_id" disabled></el-input>
              </el-form-item>
              <el-form-item label="实际解行金额" class="marBottom7">
                <el-input v-model="detailFormItem.money_amount_yuan" disabled></el-input>
              </el-form-item>
              <el-form-item label="操作时间：" class="marBottom7">
                <el-input v-model="detailFormItem.update_dt" disabled></el-input>
              </el-form-item>
              <el-form-item label="认证操作员" class="marBottom7">
                <el-input v-model="detailFormItem.check_operator_id" disabled></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="备注：" class="marBottom7">
            <el-input v-model="detailFormItem.comment_info" disabled type="textarea"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer">
          <el-button type="primary" @click="dialogDetailVisible = false">关闭</el-button>
        </div>
      </el-dialog>
    </div>
  </Box>
</template>
<script>
import Box from "../../../components/Box";
import { dateFilter } from "../../../assets/js/filters";
export default {
  name: "profitSolution",
  components: { Box },
  data() {
    return {
      disabledShow: false,
      // 放大缩小
      isScreen: false,
      // 创建解行单放大缩小
      isScreenCreate: false,
      // 单据录入放大缩小
      isScreenTypeIn: false,
      // 解行详情
      dialogDetailVisible: false,
      linesListStation: [], // 线路车站
      // 查询表单
      formItem: {
        lines: "", // 线路
        station: "", // 车站
        orderNum: "", // 单据编号
        dateTime: [], // 选择时间
        order_state_code: '', // 单据状态
      },
      // 分页
      options: {
        total: 0, // 总条数
        currentPage: 1, // 当前页码
        pageSize: 10 // 显示条数
      },
      // 解行详情
      detailFormItem: {
        lines: "", //线路
        station: "", //车站
        order_id: '', // 解行单号
        bank_name: '', // 解行银行
        apply_money_amount_yuan: '',// 申请解行金额
        order_state_name: '', // 状态
        operator_name: '',
        operator_id: '', //操作员
        money_send_order_id: '', // 银行解行单号
        money_amount_yuan: '', // 实际解行金额
        update_dt: '', // 操作时间
        check_operator_id: '',
        check_operator_name: '', // 认证操作员
        comment_info: "" //备注
      },
      // 线路集合
      linesList: [],
      // 车站集合
      stationList: [],
      tableData: [],
      //创建解行单
      dialogCreateVisible: false,
      // 单据录入
      dialogEnteringVisible: false,
      // 按钮权限
      limitBtn: {
        queryBtn: false, // 查询
        create: false, // 创建
        entering: false // 单据录入
      },
      linesListArr: [], //调入调出位置
      // 启用禁用按钮
      disabledBtn: {
        create: true, //创建
        entering: true, //单据录入
        createDis: true, // 车站线路
      },
      //收益库存
      stockAmount: [],
      // 库存金额
      stockMoney: "",
      //创建解行单
      addEdit: {
        lines: "", //线路
        station: "", //车站
        operation_type: "收益解行", //操作类型
        money: "", //解行金额
        moneyTwo: "",
        operator_id: "", //认证操作员
        identified_operator_password: "", //密码
        commentInfo: "", // 备注
        bankCode: "", //解行银行编码
        order_state_code: '', // 单据状态
      },
      // 创建解行单校验
      errorTip: {
        typeFlag: false, // 操作类型
        earningFlag: false, //收益库存
        moneyFlag: false, //解行金额
        userFlag: false, // 认证操作员
        passwordFlag: false, // 密码
        bankFlag: false // 解行银行编码
      },
      // 操作类型
      typeList: [],
      statusList: [],
      // 单据录入
      enteringList: {
        operator_id: "", //操作员ID
        lines: "", //线路
        station: "", //车站
        operation_type: "收益解行", //操作类型
        operatorUser: "", //认证操作员
        identified_operator_password: "" //密码
      },
      // 单据录入校验
      errorTip2: {
        typeFlag: false, //操作类型
        userFlag: false, //认证操作员
        passwordFlag: false // 密码
      },
      //单据录入提交携带的参数
      enteringParams: {
        order_id: '', // 解行单
        guid: "", //指定系统解行编号
        money_send_order_id: "", //银行提供的解行单号
        bankMoneyAmount: "" //银行解行金额
      },
      //选中的数据集合
      selectedData: [],
      // 银行及编码值
      bankList: []
    };
  },
  methods: {
    // 部分复选框禁止
    isDisabled (row) {
      if (row.order_state_code == '03'){
        return false
      }else {
        return true
      }
    },
    // 创建解行单失去焦点自动保留两位小数
    loseFocus() {
      var _t = this;
      if (_t.addEdit.money.trim() == "") {
        _t.addEdit.money = "";
      } else {
        _t.addEdit.moneyTwo = _t.addEdit.money ? _t.addEdit.money : "";
        _t.addEdit.money = (_t.addEdit.moneyTwo * 1).toFixed(2)
          ? (_t.addEdit.moneyTwo * 1).toFixed(2)
          : "";
      }
    },
    // 银行解行金失去焦点
    lose(){
      this.selectedData.forEach(item => {
        item.money_amount = (item.money_amount * 1).toFixed(2)
      })

    },
    // 失去焦点校验操作金额
    blurInputMoney() {
      var _t = this;
      if (_t.addEdit.money.trim() === "") {
        _t.errorTip.operationFlag = true;
        _t.errorTip.operationTip = "必填项不能为空";
      } else {
        var reg = _t.$config.isMoneyNumber();
        if (reg.test(_t.addEdit.money.trim()) === false) {
          _t.errorTip.operationFlag = true;
          _t.errorTip.operationTip = "格式不正确";
        } else {
          _t.errorTip.operationFlag = false;
          _t.errorTip.operationTip = "";
        }
      }
    },
     // 点击详情操作
    detailBtn(row) {
      var _t = this;
      _t.dialogDetailVisible = true;
      //线路
      _t.detailFormItem.lines = row.line_name;
      //车站
      _t.detailFormItem.station = row.station_name;
      // 解行单号
      _t.detailFormItem.order_id = row.order_id;
      // 解行银行
      _t.detailFormItem.bank_name = row.bank_name;
      // 申请解行金额
      _t.detailFormItem.apply_money_amount_yuan = row.apply_money_amount_yuan;
      // 状态
      _t.detailFormItem.order_state_name = row.order_state_name;
      // 操作后金额
      _t.detailFormItem.amount_after_yuan = row.amount_after_yuan;
      // 状态
      _t.detailFormItem.stock_state_name = row.stock_state_name;
      // 操作员ID
      _t.detailFormItem.operator_name = row.operator_name + "-" + row.operator_id;
      // 认证操作员
      _t.detailFormItem.check_operator_id =
        row.check_operator_name + "-" + row.check_operator_id ;
      // 银行解行单号
      _t.detailFormItem.money_send_order_id = row.money_send_order_id
      // 实际解行金额
      _t.detailFormItem.money_amount_yuan = row.money_amount_yuan
      // 操作时间
      _t.detailFormItem.update_dt = row.update_dt;
      //备注
      _t.detailFormItem.comment_info = row.comment_info;

    },
    // 点击复选框
    selectionChange(row) {
      var _t = this;
      if (row.length !== 0) {
        _t.disabledBtn.entering = false;
      } else {
        _t.disabledBtn.entering = true;
      }
      var selectedArr = new Array();
      row.forEach(item => {
        var obj = new Object();
        obj.order_id = item.order_id; //解行单号
        obj.line_name = item.line_name; //线路
        obj.station_name = item.station_name; //车站
        obj.apply_money_amount = item.apply_money_amount_yuan; //车站解行金额
        obj.money_amount = ""; //银行解行金额
        obj.guid = item.guid;
        obj.comment_info = "";
        selectedArr.push(obj);
      });
      _t.selectedData = selectedArr;
    },
    // 返回row-key
    getRowKey(row) {
      return row.order_id;
    },
    // 改变当前页码
    handleSizeChangeSub(val) {
      var _t = this;
      _t.options.pageSize = val;
      _t.getData();
    },
    handleCurrentChange(val) {
      var _t = this;
      _t.options.currentPage = val;
      _t.getData();
    },
    // 改变每页显示条数
    // 点击创建解行单
    create() {
      var _t = this;
      _t.getStockAmount();
      _t.dialogCreateVisible = true;
      var location_number = _t.getCookie("LOCATION_NUMBER");
      var user_id = _t.getCookie("USER_ID");
      if (
        location_number !== null &&
        location_number !== "null" &&
        user_id !== null &&
        user_id !== "null"
      ) {
         if(_t.linesList.length == 1) {
           _t.addEdit.lines = _t.formItem.lines; // 线路
           _t.addEdit.station = location_number; // 车站
         }else if (_t.linesList.length > 1) {
           _t.addEdit.lines = location_number; // 线路
           _t.addEdit.station = ''; // 车站
         }
        _t.getStockAmount();
      }
    },
    // 创建解行单提交
    addEditData() {
      var _t = this;
      // 校验解行金额
      if (_t.addEdit.money === null || _t.addEdit.money === "") {

        _t.errorTip.moneyFlag = true;
      } else {
        _t.errorTip.moneyFlag = false;
      }
      // 校验操作人员
      if (_t.addEdit.operator_id.trim() === "") {
        _t.errorTip.userFlag = true;
      } else {
        _t.errorTip.userFlag = false;
      }
      // 校验密码
      if (_t.addEdit.identified_operator_password.trim() === "") {
        _t.errorTip.passwordFlag = true;
      } else {
        _t.errorTip.passwordFlag = false;
      }
      // 校验银行
      if (_t.addEdit.bankCode === null || _t.addEdit.bankCode === "") {
        _t.errorTip.bankFlag = true;
      } else {
        _t.errorTip.bankFlag = false;
      }
      if (
        _t.errorTip.typeFlag === false &&
        _t.errorTip.earningFlag === false &&
        _t.errorTip.moneyFlag === false &&
        _t.errorTip.userFlag === false &&
        _t.errorTip.passwordFlag === false &&
        _t.errorTip.bankFlag === false
      ) {
        var location_number = _t.getCookie("LOCATION_NUMBER");
        var user_id = _t.getCookie("USER_ID");
        // 提交
        let str =
          "userid=" +
          user_id +
          "&location_number=" +
          location_number +
          "&apply_money_amount=" +
          _t.addEdit.money +
          "&bank_code=" +
          _t.addEdit.bankCode +
          "&check_operator_id=" +
          _t.addEdit.operator_id.trim() +
          "&check_operator_password=" +
          _t.addEdit.identified_operator_password.trim();
        let Base64 = require("js-base64").Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        var params = {
          userid: user_id, // 操作员id
          location_number: location_number.toString(), // 位置编号
          apply_money_amount: _t.addEdit.money, //解行金额
          bank_code: _t.addEdit.bankCode, //解行银行
          check_operator_id: _t.addEdit.operator_id, // 认证操作员
          check_operator_password: _t.addEdit.identified_operator_password, // 密码
          comment_info: _t.addEdit.commentInfo, //备注
          token: keyToken //token
        };
        _t.$api.post(
          "/tsGateWay/incomeMoney/createMoneySendBankOrderGateWay",
          params,
          function(res) {
            // 操作成功
            if (res.rtCode && res.rtCode === "11015") {
              _t.$alert(res.rtMessage, "温馨提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消"
              }).then(() => {
                _t.resetChecked();
                  setTimeout(function () {
                    _t.getData();
                  }, 100)
                }).catch(() => {
                  _t.getData();
                  setTimeout(function () {
                    _t.resetChecked();
                  }, 100)
                });
            } else {
              _t.alertDialogTip(_t, res.rtMessage);
            }
          }
        );
      }
    },
    // 取消时重置创建校验
    resetChecked() {
      var _t = this;
      _t.dialogCreateVisible = false; // 隐藏蒙版
      _t.addEdit.lines = ""; // 线路
      _t.addEdit.station = ""; // 车站
      _t.addEdit.earnings = ""; // 收益库存
      _t.addEdit.money = ""; // 解行金额
      _t.addEdit.bankCode = ""; //解行银行
      _t.addEdit.operator_id = ""; // 认证操作员
      _t.addEdit.identified_operator_password = ""; // 密码
      _t.addEdit.commentInfo = ""; //备注
      _t.errorTip.typeFlag = false; // 操作类型
      _t.errorTip.earningFlag = false; // 收益库存
      _t.errorTip.moneyFlag = false; // 解行金额
      _t.errorTip.userFlag = false; // 认证操作员
      _t.errorTip.passwordFlag = false; // 密码
      _t.errorTip.bankFlag = false; //解行银行
    },
    // 创建解行单校验
    blurInputUser(val, flag) {
      var _t = this;
      if (val.trim() === "") {
        _t.errorTip[flag] = true;
      } else {
        _t.errorTip[flag] = false;
      }
    },
    // 单据录入校验
    blurInputUser2(val, flag) {
      var _t = this;
      if (val.trim() === "") {
        _t.errorTip2[flag] = true;
      } else {
        _t.errorTip2[flag] = false;
      }
    },
    // 点击单据录入
    entering() {
      var _t = this;
      _t.dialogEnteringVisible = true;
      var location_number = _t.getCookie("LOCATION_NUMBER");
      var user_id = _t.getCookie("USER_ID");
      if (
        location_number !== null &&
        location_number !== "null" &&
        user_id !== null &&
        user_id !== "null"
      ) {
        //需要改参数的部分
        _t.selectedData.forEach(item => {
          _t.enteringParams.order_id = item.order_id;
          _t.enteringParams.guid = item.guid; //guid
          _t.enteringParams.bankMoneyAmount = item.money_amount;
        });
        _t.enteringList.operator_id = user_id; // 操作员ID
        _t.enteringList.station = location_number; // 车站
        // 获取操作类型及原因
      }
    },
    // 单据录入提交
    commitEntering() {
      var _t = this;
      // 校验操作人员
      if (_t.enteringList.operatorUser.trim() === "") {
        _t.errorTip2.userFlag = true;
      } else {
        _t.errorTip2.userFlag = false;
      }
      // 校验密码
      if (_t.enteringList.identified_operator_password.trim() === "") {
        _t.errorTip2.passwordFlag = true;
      } else {
        _t.errorTip2.passwordFlag = false;
      }
      var init = true;
      var payingBank = true;
      _t.selectedData.forEach(item => {
        if (item.money_amount == '0.00' || item.money_amount.trim() == '' ) {
          init = false
        }
        if (item.money_send_order_id == undefined) {
          payingBank = false;
        }
      });
      if (!payingBank) {
        _t.alertDialogTip(_t, '请检查解行单号是否为空!');
      }
      if (!init) {
        _t.alertDialogTip(_t, '请检查解行金额是否为空或为零!');
      }
      if (
        _t.errorTip2.typeFlag === false &&
        _t.errorTip2.userFlag === false &&
        _t.errorTip2.passwordFlag === false
        && init && payingBank
      ) {
        var location_number = _t.getCookie("LOCATION_NUMBER");
        var user_id = _t.getCookie("USER_ID");
        _t.selectedData.forEach(item => {
          _t.enteringParams.money_send_order_id = item.money_send_order_id;
            item.money_amount = Number(item.money_amount)
        });
        // 提交
        let str =
          "userid=" +
          user_id +
          "&location_number=" +
          location_number +
          "&check_operator_id=" +
          _t.enteringList.operatorUser.trim() +
          "&check_operator_password=" +
          _t.enteringList.identified_operator_password.trim();
        let Base64 = require("js-base64").Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        var params = {
          userid: user_id, // 操作员id
          location_number: location_number.toString(), // 位置编号
          check_operator_id: _t.enteringList.operatorUser.trim(), //认证操作员
          check_operator_password: _t.enteringList.identified_operator_password.trim(), //密码
          token: keyToken, //token
          order_list: _t.selectedData
        };
        _t.$api.post(
          "/tsGateWay/incomeMoney/updateMoneySendBankOrderGateWay",
          params,
          function(res) {
            // 操作成功
            if (res.rtCode && res.rtCode === "11016") {
              _t.$alert(res.rtMessage, "温馨提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消"
              }).then(() => {
                  _t.getData();
                  setTimeout(function () {
                    _t.resetCheckedTwo();
                  }, 100);
                }).catch(() => {
                  _t.getData();
                  setTimeout(function () {
                    _t.resetCheckedTwo();
                  }, 100);
                });
            } else {
              _t.alertDialogTip(_t, res.rtMessage);
            }
          }
        );
      }
    },
    // 取消时重置录入校验
    resetCheckedTwo() {
      var _t = this;
      _t.disabledBtn.entering = true;
      _t.dialogEnteringVisible = false; // 隐藏蒙版
      _t.enteringList.operator_id = ""; // 操作员ID
      _t.enteringList.station = ""; // 车站
      _t.enteringList.operatorUser = ""; // 认证操作员
      _t.enteringList.identified_operator_password = ""; // 密码
      _t.selectedData = [];
      _t.$refs.clearSelection.clearSelection();
      _t.errorTip2.typeFlag = false; // 操作类型
      _t.errorTip2.userFlag = false; // 认证操作人员
      _t.errorTip2.passwordFlag = false; // 密码
    },
    // 获取收益库存
    getStockAmount() {
      var _t = this;
      var location = _t.getCookie("LOCATION_NUMBER"); // 位置编号
      var user_id = _t.getCookie("USER_ID"); // 用户ids
      var location_number = ""; // 发送请求的 位置编号
      let str = "userid=" + user_id + "&location_number=" + location;
      let Base64 = require("js-base64").Base64;
      let keyToken = _t.$md5(Base64.encode(str));
      let postData = {
        userid: user_id,
        location_number: location,
        pageNum: _t.options.currentPage, // 当前页
        pageSize: _t.options.pageSize, //每页显示条数
        token: keyToken
      };
      _t.$api.post(
        "/tsGateWay/incomeMoney/searchMoneyStockGateWay",
        postData,
        function(res) {
          if (res.rtCode && res.rtCode === "11001") {
            _t.stockAmount = res.rtData;
            _t.stockAmount.forEach(item => {
              _t.stockMoney = item.money_amount_yuan === null ? "" : item.money_amount_yuan;
            });
          }else if(res.rtCode){
            _t.stockMoney = "0.00";
          }
        }
      );
    },
    // 查询按钮
    getData() {
      var _t = this;
      var role = _t.getCookie("USER_TYPE"); // 角色
      var location = _t.getCookie("LOCATION_NUMBER"); // 位置编号
      var user_id = _t.getCookie("USER_ID"); // 用户id
      var location_number = ""; // 发送请求的 位置编号
      var location_number_query = ""; // 发送请求的 query
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
      // 车站为空
      if (_t.formItem.station === "") {
        location_number = location;
      } else {
        // 车站有值
        location_number = _t.formItem.station;
      }
      if (location_number !== "" && user_id !== null && user_id !== "null") {
        let str = "userid=" + user_id + "&location_number=" + location_number;
        let Base64 = require("js-base64").Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        //  获取当天时间
        var start_dtime = _t.getCookie('TIME') + ' ' + '00:00:00';
        var end_dtime = _t.getCookie('TIME') + ' ' + '23:59:59';
        let postData = {
          userid: user_id,
          location_number: location_number, // 位置编码
          pageNum: _t.options.currentPage, // 当前页
          pageSize: _t.options.pageSize, //每页显示条数
          order_state_code: _t.formItem.order_state_code,
          order_id: _t.formItem.orderNum === "" ? null : _t.formItem.orderNum, // 单据编号
          update_dt_begin: _t.formItem.dateTime !== null ? (_t.formItem.dateTime[0] !== undefined ? dateFilter(_t.formItem.dateTime[0].getTime()) : start_dtime) : start_dtime, // 开始时间
          update_dt_end: _t.formItem.dateTime !== null ? (_t.formItem.dateTime[1] !== undefined ? dateFilter(_t.formItem.dateTime[1].getTime()) : end_dtime) : end_dtime, // 结束时间
          token: keyToken // token
        };
        _t.$api.post(
          "/tsGateWay/incomeMoney/searchMoneySendBankOrderGateWay",
          postData,
          function(res) {
            _t.$store.commit("setLoading", false);
            if (res.rtCode && res.rtCode === "11014") {
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
      this.formItem.orderNum = ""; // 单据编号
      this.formItem.dateTime = []; // 选择时间
      this.getData()
    },
    //获取状态
    getStatusData() {
      var _t = this;
      let str = "guid=GUID000722201906191719";
      let Base64 = require("js-base64").Base64;
      let keyToken = _t.$md5(Base64.encode(str));
      var params = {
        guid: "GUID000722201906191719",
        token: keyToken
      };
      _t.$api.post("/tsGateWay/ticketUtility/queryDict", params, function(res) {
        // 查询成功
        if (res.rtCode && res.rtCode === "14010") {
          _t.statusList = res.rtData === null ? [] : res.rtData;
        }
      });
    },
    //获取银行及编码
    getBankData() {
      var _t = this;
      let str = "guid=GUID000722201906191816";
      let Base64 = require("js-base64").Base64;
      let keyToken = _t.$md5(Base64.encode(str));
      var params = {
        guid: "GUID000722201906191816",
        token: keyToken
      };
      _t.$api.post("/tsGateWay/ticketUtility/queryDict", params, function(res) {
        // 查询成功
        if (res.rtCode && res.rtCode === "14010") {
          _t.bankList = res.rtData === null ? [] : res.rtData;
        }
      });
    },
    // 获取操作类型及原因
    getTypeAndReason() {
      var _t = this;
      var params = {
        typeid: "04" // 01 车票 02 现金
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
    // 改变创建操作类型
    changeType(val) {
      var _t = this;
      if (val !== null && val !== "") {
        _t.errorTip.typeFlag = false;
        _t.typeList.forEach(item => {
          if (item.TYPE_VALUE === val) {
            // 变更原因赋值
            _t.reasonList = item.reasonList === null ? [] : item.reasonList;
          }
        });
      } else {
        _t.errorTip.typeFlag = true;
      }
    },
    //校验解行银行
    changeType3(val) {
      var _t = this;
      if (_t.val !== null && val !== "") {
        _t.errorTip.bankFlag = false;
      } else {
        _t.errorTip.bankFlag = true;
      }
    },
    // 改变录入操作类型
    changeType2(val) {
      var _t = this;
      if (val !== null && val !== "") {
        _t.errorTip2.typeFlag = false;
        _t.typeList.forEach(item => {
          if (item.TYPE_VALUE === val) {
            // 变更原因赋值
            _t.reasonList = item.reasonList === null ? [] : item.reasonList;
          }
        });
      } else {
        _t.errorTip2.typeFlag = true;
      }
    },
    // 查询线路及车站
    getLinesAndStation() {
      var _t = this;
      var params = {};
      _t.$api.post(
        "/tsGateWay/ticketUtility/locationCascadeQuery",
        params,
        function(res) {
          // 查到线路信息
          if (res.rtCode && res.rtCode === "14007") {
            var linesStationArr = res.rtData === null ? [] : res.rtData;
            var locationTableData = new Array()
            res.rtData.forEach((item) => {
              var obj = new Object();
              obj.location_number = item.LINE_LOCATION_NUMBER.toString();
              obj.location_name = item.LINE_LOCATION_NAME;
              if (item.mlcList !== null) {
                item.mlcList.forEach((val) => {
                  var str = new Object();
                  str.location_number = val.LINE_LOCATION_NUMBER.toString();
                  str.location_name = val.LINE_LOCATION_NAME;
                  if (val.lineList !== null) {
                    val.lineList.forEach(itemVal => {
                      var lineStr = new Object();
                      lineStr.location_number = itemVal.LINE_LOCATION_NUMBER.toString();
                      lineStr.location_name = itemVal.LINE_LOCATION_NAME;
                      lineStr.station_id = itemVal.STATION_ID;
                      if (itemVal.stationList !== null) {
                        itemVal.stationList.forEach(e => {
                          var stationStr = new Object();
                          stationStr.location_number = e.LOCATION_NUMBER;
                          stationStr.location_name = e.STATION_LOCATION_NAME;
                          stationStr.station_id = e.STATION_ID;
                          locationTableData.push(stationStr)
                        })
                      }
                      locationTableData.unshift(lineStr);
                    })
                  }
                  locationTableData.unshift(str);
                });
              }
              locationTableData.unshift(obj)
            });
            _t.linesListStation = locationTableData;
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
    },
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
          _t.getBankData();
          _t.getLinesAndStation();
        }
      });
      // 判断权限按钮
      limitBtnArr.forEach(item => {
        // 查询
        if (item.MENU_ID === "GUID00000000000000000000000000000093") {
          _t.limitBtn.queryBtn = true;
        }
        // 创建解行单
        if (item.MENU_ID === "GUID00000000000000000000000000000094") {
          _t.limitBtn.create = true;
        }
        // 单据录入
        if (item.MENU_ID === "GUID00000000000000000000000000000095") {
          _t.limitBtn.entering = true;
        }
      });
    }
  }
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style >
  .el-dialog {
    width: 70%;
  }
</style>
