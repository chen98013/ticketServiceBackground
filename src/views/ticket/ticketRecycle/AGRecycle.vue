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
        <el-form-item label="位置：" class="marBottom7">
          <el-select
            :disabled="disabledBtn.createDis"
            clearable
            v-model="formItem.station"
            @change="changeStation(formItem.station)"
            class="width200">
            <el-option
              v-for="(item,index) in stationList"
              :key="index"
              :label="item.STATION_LOCATION_NAME"
              :value="item.LOCATION_NUMBER.toString()"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="操作员：" class="marBottom7">
          <el-select clearable filterable v-model="formItem.operationId" class="width200">
            <el-option
              v-for="(item,index) in operatorIdList"
              :key="index"
              :label="item.USERNAME + '-' + item.USERID"
              :value="item.USERID.toString()"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="回收单号：" class="marBottom7">
          <el-input clearable maxlength="36" v-model="formItem.orderNum" placeholder="请输入单号" class="width200"></el-input>
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
    <div class="tableWp">
      <div class="marBottom10">
        <!-- 按钮部分 -->
        <el-button
          type="primary"
          v-if="limitBtn.create"
          @click="createBtn"
        >创建回收单</el-button>
      </div>
      <!-- 表格内容 -->
      <el-table
        :data="tableData"
        border
        :default-sort="{prop: 'CREATE_DT', order: 'descending'}"
        @row-click="rowClick"
      >
        <el-table-column fixed prop="ORDER_ID" label="单据编号" align="center" />
        <el-table-column prop="STATION_NAME" label="车站名称" align="center" />
        <el-table-column prop="" label="操作员" align="center">
          <template slot-scope="scope">
            <span>{{scope.row.OPERATOR_NAME}}</span>
            <span>-</span>
            <span>{{scope.row.OPERATOR_ID}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="IDENTIFIED_OPERATOR_ID" label="认证操作员" align="center" />
        <el-table-column prop="ORDER_STATE_NAME" label="单据状态" align="center" sortable />
        <el-table-column prop="BALANCE_DATE" label="运营日期" align="center" sortable />
        <el-table-column prop="CREATE_DT" width="180" label="创建日期" align="center" sortable />
        <el-table-column fixed="right" label="操作" align="center">
          <template slot-scope="scope">
            <el-button v-if="limitBtn.detail" @click.stop="detailBtn(scope.row)" type="primary">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="footer">
        <!-- 分页 -->
        <pages
          :total="options.total"
          :currentPage="options.currentPage"
          :page-size="options.pageSize"
          @handleSizeChangeSub="handleSizeChangeSub"
          @handleCurrentChangeSub="handleCurrentChange"
        />
      </div>
    </div>
    <div class="dialog">
      <!-- 创建回收单 -->
      <el-dialog
        v-dialogDrag
        append-to-body
        :before-close="resetData"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :visible.sync="dialogVisible"
        :fullscreen="isScreenCreate"
      >
        <div slot="title" class="dialogTitle clearFix">
          <span class="title">创建回收单</span>
          <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenCreate = !isScreenCreate"></i>
        </div>
        <el-form :model="addEdit" ref="addEdit" label-width="120px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="线路：">
                <el-select v-model="addEdit.lines" disabled class="widthAll">
                  <el-option
                    v-for="(item,index) in linesList"
                    :key="index"
                    :label="item.LINE_LOCATION_NAME"
                    :value="item.LINE_LOCATION_NUMBER.toString()"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="操作员：" class="star">
                <el-input v-model="addEdit.operator_idAndName" placeholder="请输入操作员id" disabled />
              </el-form-item>
              <el-form-item label="认证操作员：" class="star">
                <el-input
                  v-model="addEdit.operationUser"
                  @blur="ruleAddForm(addEdit.operationUser,'userFlag')"
                  placeholder="请输入认证操作员id"
                  maxlength="6"
                />
                <span class="isNotNull" v-if="errorTip.userFlag">认证操作员不能为空</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="车站：">
                <el-select v-model="addEdit.station" disabled class="widthAll">
                  <el-option
                    v-for="(item,index) in stationList"
                    :key="index"
                    :label="item.STATION_LOCATION_NAME"
                    :value="item.LOCATION_NUMBER.toString()"
                  />
                </el-select>
              </el-form-item>
              <!-- 此标签只用来占位，没有其他用途 -->
              <el-form-item class="visibility" label="占位隐藏：">
                <el-input v-model="addEdit.inLocation"></el-input>
              </el-form-item>
              <el-form-item class="star" label="密码：">
                <el-input
                  v-model="addEdit.operationPassword"
                  @blur="ruleAddForm(addEdit.operationPassword,'passwordFlag')"
                  type="password"
                  placeholder="请输入密码"
                  maxlength="6"
                />
                <span class="isNotNull" v-if="errorTip.passwordFlag">密码不能为空</span>
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
        <div class="marBottom10">
          <el-button type="primary" @click="addListBtn">添加</el-button>
        </div>
        <!--表格-->
        <div class="lowerPart">
          <el-table border :data="addList" stripe>
            <el-table-column prop="device_id" label="设备编号" align="center" />
            <el-table-column label="有效票数量(张)" align="center">
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.valid_ticket_number"
                  oninput="value=value.replace(/[^\d]/g,'')"
                  maxlength="8"
                />
              </template>
            </el-table-column>
            <el-table-column label="无效票数量(张)" align="center">
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.invalid_ticket_number"
                  oninput="value=value.replace(/[^\d]/g,'')"
                  maxlength="8"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100px" align="center">
              <template slot-scope="scope">
                <el-button type="danger" @click="deleteData(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div slot="footer">
          <el-button @click="resetData">取消</el-button>
          <el-button type="primary" v-btn-control @click="addEditData">保存</el-button>
        </div>
      </el-dialog>
      <!--添加内层蒙版-->
      <el-dialog
        v-dialogDrag
        append-to-body
        :before-close="resetTicketAdd"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :visible.sync="dialogAddVisible"
        :fullscreen="isScreenAdd"
      >
        <div slot="title" class="dialogTitle clearFix">
          <span class="title">添加回收设备类型</span>
          <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenAdd = !isScreenAdd"></i>
        </div>
<!--        <el-input v-model="searchVal" class="width200 marBottom15" placeholder="请输入要搜索的内容"></el-input>-->
        <el-table
          border
          stripe

          :data="newItems"
          :row-key="getRowKey"
          @select="selectionChange"
          @select-all="selectionChange"
          class="theadNotSelection"
          ref="clearSelection"
        >
          <el-table-column reserve-selection type="selection" fixed align="center" />
          <el-table-column prop="DEVICE_ID" label="设备编号" align="center" />
          <el-table-column prop="DEVICE_TYPE" label="闸机设备类型" align="center" />
          <el-table-column prop="DEVICE_NAME" label="闸机设备名称" align="center" />
          <el-table-column prop="STATION_NAME" label="位置名称" align="center" />
          <el-table-column prop="IP_ADDRESS" label="IP地址" width="100px" align="center" />
        </el-table>
        <div slot="footer">
          <el-button @click="resetTicketAdd">取消</el-button>
          <el-button type="primary" @click="addTicket">确定</el-button>
        </div>
      </el-dialog>
      <!--回收单详情-->
      <el-dialog
        v-dialogDrag
        append-to-body
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :visible.sync="dialogDetailVisible"
        :fullscreen="isScreenDetail"
      >
        <div slot="title" class="dialogTitle clearFix">
          <span class="title">回收单详情</span>
          <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenDetail = !isScreenDetail"></i>
        </div>
        <el-form :model="detailFormItem" label-width="120px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="线路：" class="marBottom7">
                <el-input v-model="detailFormItem.linesName" disabled></el-input>
              </el-form-item>
              <el-form-item label="创建人：" class="marBottom7">
                <el-input v-model="detailFormItem.createName" disabled></el-input>
              </el-form-item>
              <el-form-item label="单据状态：" class="marBottom7">
                <el-input v-model="detailFormItem.status" disabled></el-input>
              </el-form-item>
              <el-form-item label="创建时间：" class="marBottom7">
                <el-input v-model="detailFormItem.createTime" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="单据编号：" class="marBottom7">
                <el-input v-model="detailFormItem.orderNum" disabled></el-input>
              </el-form-item>
              <el-form-item label="创建位置：" class="marBottom7">
                <el-input v-model="detailFormItem.createLocation" disabled></el-input>
              </el-form-item>
              <el-form-item label="单据类型：" class="marBottom7">
                <el-input v-model="detailFormItem.orderType" disabled></el-input>
              </el-form-item>
              <el-form-item label="运营日期：" class="marBottom7">
                <el-input v-model="detailFormItem.balanceDate" disabled></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="备注：" class="marBottom7">
            <el-input v-model="detailFormItem.commentInfo" disabled type="textarea"></el-input>
          </el-form-item>
        </el-form>
        <el-table border :data="tableDetail" stripe class="marBottom15">
          <el-table-column prop="DEVICE_NAME" label="设备编号" align="center">
          </el-table-column>
          <el-table-column prop="VALID_TICKET_NUMBER" label="有效票数量(张)" align="center" />
          <el-table-column prop="INVALID_TICKET_NUMBER" label="无效票数量(张)" align="center" />
        </el-table>
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
  name: "AGRecycle",
  components: {
    Box
  },
  data() {
    return {
      // 添加时模糊查询查询票卡类型
      searchVal: "",
      //创建回收单放大缩小
      isScreenCreate: false,
      // 内层添加放大缩小
      isScreenAdd: false,
      // 详情放大缩小
      isScreenDetail: false,
      //创建
      dialogVisible: false,
      // 添加
      dialogAddVisible: false,
      // 详情
      dialogDetailVisible: false,
      tableData: [],
      // 创建回收单
      addEdit: {
        lines: "", // 线路
        station: "", // 车站
        operator_idAndName: "", // 操作员
        operationUser: "", // 认证操作员
        operationPassword: "", // 密码
        commentInfo: "" //备注
      },
      // 创建表单校验
      errorTip: {
        userFlag: false, // 认证操作员
        passwordFlag: false // 密码
      },
      // 添加列表
      addList: [],
      // 添加选中的票卡类型
      checkList: [],
      linesListArr: [], // 调出(入)线路
      // 添加票卡类型列表
      ticketTypeList: [],
      // 按钮权限
      limitBtn: {
        queryBtn: false, // 查询
        create: false, // 创建
        detail: false // 详情
      },
      // 启用禁用按钮
      disabledBtn: {
        create: true, // 创建
        createDis: true, // 车站线路
      },
      // 线路集合
      linesList: [],
      // 车站集合
      stationList: [],
      // 状态集合
      statusList: [],
      // 操作员id集合
      operatorIdList: [],
      // 查询表单
      formItem: {
        lines: "", // 线路
        station: "", // 车站
        dateTime: [],
        orderNum: "" ,// 单据编号
        operationId:'',
      },
      // 分页
      options: {
        total: 0, // 总条数
        currentPage: 1, // 当前页码
        pageSize: 10 // 显示条数
      },
      // 回收单详情
      detailFormItem: {
        linesName: "", // 线路名称
        orderNum: "", // 单据编号
        orderType: "", // 单据类型
        status: "", //单据状态
        createTime: "", // 创建日期
        commentInfo: "", // 备注
        createName: "", // 创建人
        createLocation: "", // 创建位置
        balanceDate: "" // 运营日期
      },
      // 详情内表格数据
      tableDetail: [],
      // 表格选中数据集合
      tableSelect: {
        id: "", // id
        order_id: "", // 单据编号
        order_status_before: "" // 单据操作前状态
      },
      addListArrs: [],
      // 添加时选中的数据
      selectedData: [],
      // 从cookie中获取
      cookieMap: {
        location_number: this.getCookie('LOCATION_NUMBER'), // 位置编号
        user_id: this.getCookie('USER_ID'), // 操作员ID
        role: this.getCookie('USER_TYPE'), // 用户角色
      }
    };
  },
  computed: {
    newItems() {
      var _t = this;
      var newItems = [];
      _t.ticketTypeList.map(function(item) {
        if (item.DEVICE_NAME.search(_t.searchVal) != -1) {
          newItems.push(item);
        }
      });
      return newItems;
    }
  },
  methods: {
    // 点击复选框
    selectionChange(row) {
      var _t = this;
      _t.selectedData = row;
    },
    // 返回row-key
    getRowKey(row) {
      return row.DEVICE_ID;
    },
    // 点击行
    rowClick(row) {
      var _t = this;
      _t.tableSelect.id = row.ROW_ID;
    },
    // 重置表格选中数据
    resetTableValue() {
      var _t = this;
      _t.tableSelect.id = ""; // 重置选中id
      _t.tableSelect.order_id = ""; // 重置选中 单据id
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
    // 回收单详情
    detailBtn(row) {
      var _t = this;
      _t.dialogDetailVisible = true;
      var location_number = row.LOCATION_NUMBER.toString();
      var user_id = _t.getCookie("USER_ID");
      if (
        location_number !== null &&
        location_number !== "null" &&
        user_id !== null &&
        user_id !== "null"
      ) {
        let str = "location_number=" + location_number + "&order_id=" + row.ORDER_ID;
        let Base64 = require("js-base64").Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        var params = {
          location_number: location_number,
          order_id: row.ORDER_ID,
          token: keyToken
        };
        _t.$api.post("/tsGateWay/agRecycle/agRecycleOrderDetailGateWay", params, function(res) {

          if (res.rtCode && res.rtCode === "10025") {
            // 线路
              _t.detailFormItem.linesName = res.rtData.LINE_NAME
                ? res.rtData.LINE_NAME
                : "";
              // 单据编号
              _t.detailFormItem.orderNum = res.rtData.ORDER_ID
                ? res.rtData.ORDER_ID
                : "";
              // 单据类型
              _t.detailFormItem.orderType = 'AG回收'

              // 备注
              _t.detailFormItem.commentInfo = res.rtData.COMMENT_INFO
                ? res.rtData.COMMENT_INFO
                : "";
              // 创建位置
              _t.detailFormItem.createLocation = res.rtData.STATION_NAME
                ? res.rtData.STATION_NAME
                : "";
              // 创建人
              _t.detailFormItem.createName = res.rtData.OPERATOR_NAME + '-' + res.rtData.OPERATOR_ID

              // 单据状态
              _t.detailFormItem.status = res.rtData.ORDER_STATE_NAME
                ? res.rtData.ORDER_STATE_NAME
                : "";
              // 创建日期
              _t.detailFormItem.createTime = res.rtData.CREATE_DT
                ? res.rtData.CREATE_DT
                : "";
              // 运营日期
              _t.detailFormItem.balanceDate = res.rtData.BALANCE_DATE
                ? res.rtData.BALANCE_DATE
                : "";
              _t.tableDetail = res.rtData.ag_recycle_detail_data;
            } else if (res.rtCode) {
            _t.alertDialogTip(_t, res.rtMessage);
            }
          }
        );
      }
    },
    // 查询按钮
    getData() {
      var _t = this;
      var role = _t.getCookie("USER_TYPE"); // 角色
      var location = _t.getCookie("LOCATION_NUMBER"); // 位置编号
      var user_id = _t.formItem.operationId?_t.formItem.operationId : ''; // 用户id
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
      if (location_number !== "") {
        let str = "location_number=" + location_number;
        let Base64 = require("js-base64").Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        //  获取当天时间
        var start_dtime = _t.getCookie('TIME') + ' ' + '00:00:00';
        var end_dtime = _t.getCookie('TIME') + ' ' + '23:59:59';
        let postData = {
          operator_id: user_id,
          location_number: location_number, // 位置编码
          location_number_query:
            location_number_query === "" ? null : location_number_query, // 位置编码
          token: keyToken, // token
          order_id: _t.formItem.orderNum, //单据编号
          start_time: _t.formItem.dateTime !== null ? (_t.formItem.dateTime[0] !== undefined ? dateFilter(_t.formItem.dateTime[0].getTime()) : start_dtime) : start_dtime, // 开始时间
          end_time: _t.formItem.dateTime !== null ? (_t.formItem.dateTime[1] !== undefined ? dateFilter(_t.formItem.dateTime[1].getTime()) : end_dtime) :  end_dtime, // 结束时间
          pageNum: _t.options.currentPage, // 当前页
          pageSize: _t.options.pageSize // 每页显示条数
        };
        _t.$api.post(
          "/tsGateWay/agRecycle/agRecycleOrderQueryGateWay",
          postData,
          function(res) {
            _t.$store.commit("setLoading", false);
            if (res.rtCode && res.rtCode === "10021") {
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
      this.formItem.dateTime = [];
      this.formItem.orderNum = '';
      this.getData()
    },
    // 创建回收单
    createBtn() {
      var _t = this;
      _t.dialogVisible = true;
      var location_number = _t.getCookie("LOCATION_NUMBER");
      var user_id = _t.getCookie("USER_ID");
      var user_name = _t.getCookie("USER_NAME");
      var roleName = _t.getCookie("USER_TYPE");
      if (
        location_number !== null &&
        location_number !== "null" &&
        user_id !== null &&
        user_id !== "null"
      ) {

        if (_t.getCookie('LOCATION_TYPE_ID') !== '09') {
          _t.addEdit.station = '';
        }else if (_t.getCookie('LOCATION_TYPE_ID') == '09') {
          _t.addEdit.station = location_number; // 车站SC
        }
        _t.addEdit.lines = _t.formItem.lines; // 线路
        _t.addEdit.location_number = location_number; // 位置
        _t.addEdit.operator_id = user_id; // 操作员id
        _t.addEdit.operator_idAndName =
          user_name == null ? user_id : user_name + "-" + user_id;
        _t.addEdit.createLocation = location_number; //创建位置
      }
    },
    // 添加类型
    addListBtn() {
      var _t = this;
      _t.dialogAddVisible = true;
      _t.getTicketType();
    },
    // 创建回收单重置
    resetData() {
      var _t = this;
      _t.dialogVisible = false;
      _t.addEdit.lines = ""; // 线路
      _t.addEdit.station = ""; // 车站
      _t.addEdit.operator_idAndName = ""; // 操作员
      _t.addEdit.createLocation = ""; // 创建位置
      _t.addEdit.operationUser = ""; // 认证操作员
      _t.addEdit.operationPassword = ""; // 密码
      _t.errorTip.userFlag = false;
      _t.errorTip.passwordFlag = false;
      _t.addList = [];
      _t.addEdit.commentInfo = ""; //备注
       _t.$refs.clearSelection.clearSelection();
      _t.selectedData = [];
      _t.addListArrs = [];
    },
    // 重置添加
    resetTicket() {
      var _t = this;
      _t.searchVal = "";
      _t.dialogAddVisible = false;
      _t.checkList = [];

    },
    resetTicketAdd() {
      var _t = this;
      _t.searchVal = "";
      _t.dialogAddVisible = false;
      _t.checkList = [];
      _t.$refs.clearSelection.clearSelection();
      _t.addListArrs = [];
    },
    // 删除数据
    deleteData(index) {
      var _t = this;
      _t.$confirm("是否确认删除?", "温馨提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          // 确定
          _t.addList.splice(index, 1);
        })
        .catch(() => {
          // 取消
          return false;
        });
    },
    // 获取AG设备信息
    getTicketType() {
      var _t = this;
      var location_number = _t.getCookie("LOCATION_NUMBER");
      var user_id = _t.getCookie("USER_ID");
      if (
        location_number !== null &&
        location_number !== "null" &&
        user_id !== null &&
        user_id !== "null"
      ) {
        let str = "location_number=" + location_number;
        let Base64 = require("js-base64").Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        var params = {
          location_number: location_number,
          token: keyToken,
          pageNum: 1,
          pageSize: 100
        };
        _t.$api.post(
          "/tsGateWay/agRecycle/agDeviceInfoQueryGateWay",
          params,
          function(res) {
            if (res.rtCode && res.rtCode === "10022") {
              _t.ticketTypeList = res.rtData === null ? [] : res.rtData;
              // 勾选已有项
              var listArr = new Array();
              _t.addList.forEach(item => {
                listArr.push(item.device_id);
              });
              _t.checkList = listArr;
            }
          }
        );
      }
    },
    // 添加回收设备类型
    addTicket() {
      var _t = this;
      var listArr = new Array();
      _t.selectedData.forEach(item => {
        var obj = new Object();
        obj.device_id = item.DEVICE_ID;
        obj.valid_ticket_number = "";
        obj.invalid_ticket_number = "";
        obj.comment_info = "";
        listArr.push(obj);
      });
      _t.addList = _t.addList.concat(listArr);
      // _t.addList = Object.assign([], listArr ,_t.addList);
      _t.addList = listArr;
      // 调用一次重置
      _t.resetTicket();
    },
    // 创建表单校验
    ruleAddForm(val, flag) {
      var _t = this;
      if (val.trim() === "") {
        _t.errorTip[flag] = true;
      } else {
        _t.errorTip[flag] = false;
      }
    },
    // 提交创建回收单
    addEditData() {
      var _t = this;
      // 校验认证操作员
      _t.ruleAddForm(_t.addEdit.operationUser, "userFlag");
      // 校验密码
      _t.ruleAddForm(_t.addEdit.operationPassword, "passwordFlag");
      // 校验库存表格
      var intend = true
      if (_t.addList.length === 0) {
        _t.$alert("表格内容不能为空", "温馨提示", {
          confirmButtonText: "确定"
        }).then(() => {
            return false;
          }).catch(() => {
            return false;
          });
      }
      _t.addList.forEach(item => {
        if (item.invalid_ticket_number === "0" && item.valid_ticket_number === "0") {
          _t.alertDialogTip(_t, '有效票数量和无效票数量不能同时为零');
          intend = false;
        }
        if (item.invalid_ticket_number == "" || item.valid_ticket_number =="") {
          _t.alertDialogTip(_t, '有效票数量或无效票数量不能为空');
          intend = false;
        }
      });
      // 可以提交
      if (
        _t.errorTip.userFlag === false &&
        _t.errorTip.passwordFlag === false &&
        _t.addList.length !== 0 &&
        intend
      ) {
        var location_number = _t.getCookie("LOCATION_NUMBER");
        var user_id = _t.getCookie("USER_ID");
        if (
          location_number !== null &&
          location_number !== "null" &&
          user_id !== null &&
          user_id !== "null"
        ) {
          let str =
            "location_number=" +
            location_number +
            "&operator_id=" +
            user_id +
            "&identified_operator_id=" +
            _t.addEdit.operationUser +
            "&identified_operator_password=" +
            _t.addEdit.operationPassword.trim();
          let Base64 = require("js-base64").Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          var params = {
            location_number: location_number, //位置
            operator_id: user_id, //用户ID
            identified_operator_id: _t.addEdit.operationUser.trim(), // 认证操作员
            identified_operator_password: _t.addEdit.operationPassword.trim(), // 密码
            start_time: dateFilter(_t.formItem.startTime), // 开始时间
            end_time: dateFilter(_t.formItem.endTime), // 结束时间
            order_state: "02", // 状态
            comment_info: _t.addEdit.commentInfo, //备注
            token: keyToken,
            ag_recycle_data: _t.addList
          };
          _t.$api.post(
            "/tsGateWay/agRecycle/agRecycleOrderCreateGateWay",
            params,
            function(res) {
              if (res.rtCode && res.rtCode === "10023") {
                _t.$alert(res.rtMessage, "温馨提示", {
                  confirmButtonText: "确定",
                  cancelButtonText: "取消"
                }).then(() => {
                  _t.getData();
                  setTimeout(function(){
                    _t.resetData();
                  })

                  }).catch(() => {
                    _t.getData();
                  setTimeout(function(){
                    _t.resetData();
                  })
                  });
              } else if (res.rtCode) {
                _t.alertDialogTip(_t, res.rtMessage);
              }
            }
          );
        }
      }
    },
    // 获取车票库存状态字典
    getStatusData() {
      var _t = this;
      let str = "guid=GUID000722201906191619";
      let Base64 = require("js-base64").Base64;
      let keyToken = _t.$md5(Base64.encode(str));
      var params = {
        guid: "GUID000722201906191619",
        token: keyToken
      };
      _t.$api.post("/tsGateWay/ticketUtility/queryDict", params, function(res) {
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
          }
        });
      } else {
        // 选中线路为空
        _t.stationList = [];
        _t.formItem.station = "";
      }
    },
    // 改变车站
    changeStation(val) {
      var _t = this;
      if (val !== '') {
        // 遍历车站集合
        _t.stationList.forEach((item) => {
          // 找到车站
          if (item.LOCATION_NUMBER.toString() === val) {
            // 存在操作员集合
            if (item.userList !== undefined && item.userList !== null) {
              // 操作员集合赋值
              _t.operatorIdList = item.userList;
              // 遍历操作员集合
              _t.operatorIdList.forEach((data) => {
                // 找到自身
                if (data.USERID === _t.cookieMap.user_id) {
                  _t.formItem.operationId = data.USERID;
                } else {
                  // 置为空
                  _t.formItem.operationId = '';
                }
              });
            } else {
              // 对应车站没有操作员集合
              _t.operatorIdList = [];
              _t.formItem.operationId = '';
            }
          }
        });
      } else {
        // 车站改变值为空
        _t.operatorIdList = [];
        _t.formItem.operationId = '';
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
        if (item.MENU_ID === "GUID00000000000000000000000000000129") {
          _t.limitBtn.queryBtn = true;
        }
        // 创建回收单
        if (item.MENU_ID === "GUID00000000000000000000000000000130") {
          _t.limitBtn.create = true;
        }
        // 回收单详情
        if (item.MENU_ID === "GUID00000000000000000000000000000131") {
          _t.limitBtn.detail = true;
        }
      });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
