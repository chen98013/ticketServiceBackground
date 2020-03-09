<template>
  <Box>
    <div class="formBox-top">
      <!-- 头部查询部分 -->
      <el-form :model="formItem" label-width="120px" :inline="true">
        <el-form-item label="设备ID：" class="marBottom7">
          <el-select
            class="width200"
            clearable
            v-model="formItem.DEVICE_ID">
            <el-option
              v-for="(item,index) in FacilityArr"
              :key="index"
              :label="item.DEVICE_NAME + '-' + item.DEVICE_ID"
              :value="item.DEVICE_ID.toString()"/>
          </el-select>
        </el-form-item>
        <el-form-item label="票款来源：" class="marBottom7">
          <el-select
            clearable
            v-model="formItem.ticketSource"
            class="width200"
          >
            <el-option
              v-for="(item,index) in sourceDate"
              :key="index"
              :label="item.NAME"
              :value="item.VALUE"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="客值ID：" class="marBottom7">
          <el-input maxlength="36" v-model="formItem.clientId" placeholder="请输入客值id" class="width200" clearable/>
        </el-form-item>
        <el-form-item label="交款人ID：" class="marBottom7">
          <el-input maxlength="36" v-model="formItem.payerID" placeholder="请输入交款人ID" class="width200" clearable/>
        </el-form-item>
        <el-form-item label="单据状态：" class="marBottom7">
          <el-select
            clearable
            v-model="formItem.typeReceipts"
            class="width200"
          >
            <el-option
              v-for="(item,index) in typeReceiptsData"
              :key="index"
              :label="item.NAME"
              :value="item.VALUE"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间：" class="marBottom7">
          <el-date-picker
            v-model="formItem.dateTime"
            :default-time="['00:00:00', '23:59:59']"
            type="daterange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"/>
        </el-form-item>
        <br/>
        <el-form-item class="fl marBottom7">
          <el-button type="primary" v-if="limitBtn.addDate" @click="Added">新增TVM其他票款来源</el-button>
          <el-button type="primary" v-if="limitBtn.addDate" @click="AddedDate">新增其他票款来源记录</el-button>
        </el-form-item>
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
        :default-sort="{prop: 'balance_date', order: 'descending'}"
      >
        <el-table-column prop="DEVICE_ID" label="设备编号" align="center"/>
        <el-table-column prop="MONEY_SOURCE_NAME" label="票款来源" align="center"/>
        <el-table-column prop="COIN_MONEY" label="硬币金额" align="center"/>
        <el-table-column prop="PAPER_MONEY" label="纸币金额" align="center"/>
        <el-table-column prop="CREATE_ID" label="客值ID" align="center"/>
        <el-table-column prop="CREATE_NAME" label="客值名称" align="center"/>
        <el-table-column prop="OPERATE_ID" label="交款人ID" align="center"/>
        <el-table-column prop="OPERATE_NAME" label="交款人名称" align="center"/>
        <el-table-column prop="UPDATE_TIME" label="操作时间" align="center"/>
        <el-table-column prop="DOCUMENT_STATUS" label="单据状态" align="center"/>
        <el-table-column prop="COMMON_INFO" label="备注" align="center"/>
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
    <!--    新增-->
    <el-dialog
      append-to-body
      :fullscreen="isScreenCreate"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="resetQuery"
      :visible.sync="dialogAddSyn">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">新增TVM其他票款来源</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenCreate = !isScreenCreate"></i>
      </div>
      <el-form ref="addEdit" :model="addEdit" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item class="star" label="客值ID：">
              <el-input
                disabled
                maxlength="6"
                @blur="blurInputUser(addEdit.client_id,'client_id')"
                oninput="value=value.replace(/[^\d]/g,'')"
                v-model="addEdit.client_id"
                placeholder="请输入客值ID"/>
              <span v-if="errorTip.client_id" class="isNotNull">必填项不能为空</span>
            </el-form-item>
            <el-form-item class="star" label="设备ID：">
              <el-select
                clearable
                v-model="addEdit.equipmentName">
                <el-option
                  v-for="(item,index) in FacilityArr"
                  :key="index"
                  :label="item.DEVICE_NAME + '-' + item.DEVICE_ID"
                  :value="item.DEVICE_ID.toString()"/>
              </el-select>
              <span v-if="errorTip.equipmentName" class="isNotNull">必填项不能为空</span>
            </el-form-item>
            <el-form-item class="star" label="纸币金额：">
              <el-input maxlength="6" @blur="blurInputUser(addEdit.paperSheet,'paperSheet')"
                        oninput="value=value.replace(/[^\d]/g,'')" v-model="addEdit.paperSheet" placeholder="请输入纸币金额"
                        class="" clearable/>
              <span v-if="errorTip.paperSheet" class="isNotNull">必填项不能为空</span>
            </el-form-item>

          </el-col>
          <el-col :span="12">
            <el-form-item class="star" label="客值名称：">
              <el-input disabled placeholder="请输入客值名称" @blur="blurInputUser(addEdit.clientName,'clientName')"
                        v-model="addEdit.clientName"/>
              <span v-if="errorTip.clientName" class="isNotNull">必填项不能为空</span>
            </el-form-item>
            <el-form-item class="star" label="票款来源：">
              <el-select
                clearable
                v-model="addEdit.ticketSource"
              >
                <el-option
                  v-for="(item,index) in sourceDate"
                  :key="index"
                  :label="item.NAME"
                  :value="item.VALUE"
                />
              </el-select>
              <span v-if="errorTip.ticketSource" class="isNotNull">必填项不能为空</span>
            </el-form-item>
            <el-form-item class="star" label="硬币金额：">
              <el-input maxlength="6" @blur="blurInputUser(addEdit.coinSheet,'coinSheet')"
                        oninput="value=value.replace(/[^\d]/g,'')" v-model="addEdit.coinSheet" placeholder="请输入硬币金额"
                        class="" clearable/>
              <span v-if="errorTip.coinSheet" class="isNotNull">必填项不能为空</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注：">
          <el-input type="textarea" v-model="addEdit.comment_info"/>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button type="primary" @click="resetQuery">取消</el-button>
        <el-button type="primary" v-btn-control @click="handleSubmit">提交</el-button>
      </div>
    </el-dialog>
    <el-dialog
      append-to-body
      :fullscreen="isScreenCreate"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="resetQuery"
      :visible.sync="dialogAddSynData">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">新增其他票款来源记录</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenCreate = !isScreenCreate"></i>
      </div>
      <el-form ref="addEdit" :model="addEdit" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item class="star" label="客值ID：">
              <el-input
                disabled
                maxlength="6"
                @blur="blurInputUser(addEdit.client_id,'client_id')"
                oninput="value=value.replace(/[^\d]/g,'')"
                v-model="addEdit.client_id"
                placeholder="请输入客值ID"/>
              <span v-if="errorTip.client_id" class="isNotNull">必填项不能为空</span>
            </el-form-item>
            <el-form-item class="star" label="金额：">
              <el-input maxlength="6" @blur="blurInputUser(addEdit.amount,'amount')"
                        oninput="value=value.replace(/[^\d]/g,'')" v-model="addEdit.amount" placeholder="请输入金额" class=""
                        clearable/>
              <span v-if="errorTip.amount" class="isNotNull">必填项不能为空</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item class="star" label="客值名称：">
              <el-input disabled placeholder="请输入客值名称" @blur="blurInputUser(addEdit.clientName,'clientName')"
                        v-model="addEdit.clientName"/>
              <span v-if="errorTip.clientName" class="isNotNull">必填项不能为空</span>
            </el-form-item>
            <el-form-item class="star" label="票款来源：">
              <el-select
                clearable
                v-model="addEdit.ticketSource"
              >
                <el-option
                  v-for="(item,index) in sourceDate"
                  :key="index"
                  :label="item.NAME"
                  :value="item.VALUE"
                />
              </el-select>
              <span v-if="errorTip.ticketSource" class="isNotNull">必填项不能为空</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注：">
          <el-input type="textarea" v-model="addEdit.comment_info"/>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button type="primary" @click="resetQuery">取消</el-button>
        <el-button type="primary" v-btn-control @click="handleAdd">提交</el-button>
      </div>
    </el-dialog>
  </Box>
</template>

<script>
  import Box from "../../../components/Box";
  import {dateFilter} from "../../../assets/js/filters";

  export default {
    components: {
      Box
    },
    name: 'specialBillConnect',
    data() {
      return {
        dialogAddSynData: false,
        isScreenCreate: false,
        dialogAddSyn: false,
        formItem: {
          equipmentName: '', // 设备名称
          ticketSource: '', //票款来源
          clientId: '',// 客值id
          payerID: '',// 交款人id
          typeReceipts: '', // 单据状态
          dateTime: [],
        },
        typeReceiptsData: [], // 单据类型
        FacilityArr: [],
        addEdit: {
          amount: '',
          paperSheet: '', //纸币金额
          coinSheet: '', //硬币金额
          comment_info: '', // 备注
          equipmentName: '', // 设备名称
          ticketSource: '', //票款来源
          client_id: this.getCookie('USER_ID'),// 客值id
          clientName: this.getCookie('USER_NAME'),// 客值名称
          payerID: '',// 交款人id
          typeReceipts: '', // 单据状态
        },
        tableData: [], // 查询表格数据
        //验证
        errorTip: {
          amount: false,
          paperSheet: false, //纸币金额
          coinSheet: false, //硬币金额
          equipmentName: false, // 设备名称
          ticketSource: false, //票款来源
          client_id: false,// 客值id
          clientName: false,
          payerID: false,// 交款人id
          typeReceipts: '', // 单据状态
        },
        // 分页
        options: {
          total: 0, // 总条数
          currentPage: 1, // 当前页码
          pageSize: 10 // 显示条数
        },
        limitBtn: {
          queryBtn: false,
          addDate: false,
        },
        sourceDate: [], // 来源数据
        // 从cookie中获取
        cookieMap: {
          location_number: this.getCookie('LOCATION_NUMBER'), // 位置编号
          user_id: this.getCookie('USER_ID'), // 操作员ID
          role: this.getCookie('USER_TYPE'), // 用户角色
        }
      }
    },
    methods: {
      // 校验
      blurInputUser(val, flag) {
        var _t = this;
        if (val === "") {
          _t.errorTip[flag] = true;
        } else {
          _t.errorTip[flag] = false;
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
      // 新增
      Added() {
        var _t = this;
        _t.dialogAddSyn = true;
      },
      // 新增记录
      AddedDate() {
        var _t = this;
        _t.dialogAddSynData = true;
      },
      //新增TVM其他票款来源
      handleSubmit() {
        var _t = this;
        _t.blurInputUser(_t.addEdit.equipmentName, 'equipmentName');
        _t.blurInputUser(_t.addEdit.ticketSource, 'ticketSource');
        _t.blurInputUser(_t.addEdit.coinSheet, 'coinSheet');
        _t.blurInputUser(_t.addEdit.paperSheet, 'paperSheet');
        if (
          _t.errorTip.equipmentName === false
          && _t.errorTip.ticketSource === false
          && _t.errorTip.coinSheet === false
          && _t.errorTip.paperSheet === false
        ) {
          // amount   金额
          var params = {
            flag: "0",
            device_id: _t.addEdit.equipmentName,  // TVMid
            money_source: _t.addEdit.ticketSource, //来源
            coin_money: _t.addEdit.coinSheet,//   硬币
            paper_money: _t.addEdit.paperSheet, //    纸币
            common_info: _t.addEdit.comment_info,//   备注
            create_id: this.getCookie('USER_ID'),//   客值id
          };
          _t.$api.post('/tsGateWay/noStandardCurrency/addSpecialTicketMoneyGateWay', params, function (res) {
            if (res.rtCode) {
              _t.getData();
              _t.alertDialogTip(_t, res.rtMessage);
              _t.resetQuery();
            }
          });
        }
      },
      //新增其他票款来源 记录
      handleAdd () {
        var _t = this;
        _t.blurInputUser(_t.addEdit.amount, 'amount');
        _t.blurInputUser(_t.addEdit.ticketSource, 'ticketSource');
        if (
          _t.errorTip.amount === false
          && _t.errorTip.ticketSource === false
        ) {
          // amount   金额
          var params = {
            flag: "1",
            amount: _t.addEdit.amount,
            money_source: _t.addEdit.ticketSource, //来源
            common_info: _t.addEdit.comment_info,//   备注
            create_id: this.getCookie('USER_ID'),//   客值id
          };
          _t.$api.post('/tsGateWay/noStandardCurrency/addSpecialTicketMoneyGateWay', params, function (res) {
            if (res.rtCode) {
              _t.getData();
              _t.alertDialogTip(_t, res.rtMessage);
              _t.resetQuery();
            }
          });
        }
      },
      // 查询
      getData() {
        var _t = this;
        var params = {
          device_id: _t.formItem.DEVICE_ID,
          money_source: _t.formItem.ticketSource,
          document_status: _t.formItem.typeReceipts,
          create_id: _t.formItem.clientId,
          operate_id: _t.formItem.payerID,
          begin_time: _t.formItem.dateTime !== null ? (_t.formItem.dateTime[0] !== undefined ? dateFilter(_t.formItem.dateTime[0].getTime()) : '') : null,
          end_time: _t.formItem.dateTime !== null ? (_t.formItem.dateTime[1] !== undefined ? dateFilter(_t.formItem.dateTime[1].getTime()) : '') : null,
          pageNum: 1,
          pageSize: 10,
        };
        _t.$api.post('/tsGateWay/noStandardCurrency/querySpecialTicketMoneyGateWay', params, function (res) {
          if (res.rtCode === '11026') {
            _t.tableData = res.rtData;
            _t.options.total = res.totalCount ? res.totalCount : 0;
          } else if (res.rtCode) {
            _t.alertDialogTip(_t, res.rtMessage);
          }
        })
      },
      // 获取 下拉框
      getSelect() {
        //  6 来源 2 类型 3 面值 4 单据状态 5 审核状态
        this.getSelectData('6');
        this.getSelectData('4');
      },
      // 获取设备id
      getFacility() {
        var _t = this;
        var location_number = _t.cookieMap.location_number;
        if (location_number !== null && location_number !== 'null') {
          let str = "location_number=" + location_number;
          let Base64 = require("js-base64").Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          var params = {
            location_number: location_number, // 位置编码
            token: keyToken, // token
            pageNum: 1, // 当前页
            pageSize: 100, // 每页显示条数
          };
          _t.$api.post('/tsGateWay/tvmManager/getTvmInfo', params, function (res) {
            if (res.rtCode && res.rtCode === '13001') {
              var resData = res.rtData === null ? [] : res.rtData;
              _t.FacilityArr = resData;
            } else if (res.rtCode) {
              _t.alertDialogTip(_t, res.rtMessage);
            }
          });
        }
      },
      getSelectData(val) {
        var _t = this;
        var params = {
          flag: val
        };
        _t.$api.post('/tsGateWay/noStandardCurrency/queryNoStandardCurrencySourceGateWay', params, function (res) {
          if (res.rtCode === '11022') {
            // 来源
            _t.sourceDate = res.rtData
          } else if (res.rtCode === '11019') {
            //2 类型
            _t.typeDate = res.rtData
          } else if (res.rtCode === '11020') {
            // 3 面值
            _t.faceValueData = res.rtData;
          } else if (res.rtCode === '11021') {
            // 4 单据状态
            _t.typeReceiptsData = res.rtData
          } else {
            _t.con++;
            if (res.rtCode == '27004' && _t.con == 4) {
              _t.alertDialogTip(_t, res.rtMessage);
            }
          }
        })
      },
      // 重置
      resetQuery() {
        var _t = this;
        _t.dialogAddSyn = false;
        _t.dialogAddSynData = false;
        _t.addEdit.equipmentName = '';  // TVMid
        _t.addEdit.ticketSource = ''; //来源
        _t.addEdit.coinSheet = '';//   硬币
        _t.addEdit.paperSheet = ''; //    纸币
        _t.addEdit.comment_info = '';//   备注
        _t.addEdit.amount = '';//   备注
        _t.formItem.DEVICE_ID = '';
        _t.formItem.ticketSource = '';
        _t.formItem.typeReceipts = '';
        _t.formItem.clientId = '';
        _t.formItem.payerID = '';
        _t.formItem.dateTime = [];
      },

    },
    created() {
      var _t = this;
      // _t.$store.commit("setLoading", true);
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
            _t.getData();
            _t.getSelect();
            _t.getFacility()
          }
        });
        // 判断权限按钮
        limitBtnArr.forEach(item => {
          // 查询
          if (item.MENU_ID === "MENU20191202134406zvSvmpLJTRwRbB") {
            _t.limitBtn.queryBtn = true;
          }
          // 新增
          if (item.MENU_ID === "MENU20191202134906mWWxpWUzJJCovR") {
            _t.limitBtn.addDate = true;
          }
        });
      }
    }
  }
</script>

<style scoped>

</style>
