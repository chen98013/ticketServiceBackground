<template>
  <Box>
    <div class="formBox-top">
      <!-- 头部查询部分 -->
      <el-form :model="formItem" label-width="120px" :inline="true">
        <el-form-item label="来源：" class="marBottom7">
          <el-select
            clearable
            v-model="formItem.source"
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
        <el-form-item label="类型：" class="marBottom7">
          <el-select
            clearable
            v-model="formItem.type"
            class="width200"
          >
            <el-option
              v-for="(item,index) in typeDate"
              :key="index"
              :label="item.NAME"
              :value="item.VALUE"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="面值：" class="marBottom7">
          <el-select
            clearable
            v-model="formItem.faceValue"
            class="width200"
          >
            <el-option
              v-for="(item,index) in faceValueData"
              :key="index"
              :label="item.NAME"
              :value="item.VALUE"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="客值ID：" class="marBottom7">
          <el-input maxlength="6"  oninput="value=value.replace(/[^\d]/g,'')" v-model="formItem.clientNumber" placeholder="请输入客值" class="width200" clearable/>
        </el-form-item>
        <el-form-item label="确认人ID：" class="marBottom7">
          <el-input maxlength="6"  oninput="value=value.replace(/[^\d]/g,'')" v-model="formItem.ldentifying" placeholder="请输入确认人ID" class="width200" clearable/>
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
          <el-button type="primary" v-if="limitBtn.addDate" @click="Added">新增</el-button>
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
        :default-sort="{prop: 'BANLANCE_DATE', order: 'descending'}"
      >
        <el-table-column prop="BANLANCE_DATE" label="日期" align="center"/>
        <el-table-column prop="SOURCE" label="来源" align="center"/>
        <el-table-column prop="TYPE" label="类型" align="center"/>
        <el-table-column prop="CONDUCTOR_ID" label="售票员ID" align="center"/>
        <el-table-column prop="CONDUCTOR_NAME" label="售票员名称" align="center"/>
        <el-table-column prop="DEVICE_ID" label="TVM设备编号" align="center"/>
        <el-table-column prop="FACE_VALUE" label="面值" align="center"/>
        <el-table-column prop="AMOUNT" label="张数/枚数" align="center"/>
        <el-table-column prop="OPERATOR_ID" label="客值ID" align="center"/>
        <el-table-column prop="OPERATOR_NAME" label="客值名称" align="center"/>
        <el-table-column prop="CHECK_OPERATOR_ID" label="确认人ID" align="center"/>
        <el-table-column prop="CHECK_OPERATOR_NAME" label="确认人名称" align="center"/>
        <el-table-column prop="DOCUMENT_STATUS" label="单据状态" align="center"/>
        <el-table-column prop="UPDATE_DT" label="操作时间" align="center"/>
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
        <span class="title">新增非标准币记录</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenCreate = !isScreenCreate"></i>
      </div>
      <el-form ref="addEdit" :model="addEdit" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item class="star" label="客值ID：">
                <el-input
                  maxlength="6"
                  @blur="blurInputUser(addEdit.client_id,'client_id')"
                   oninput="value=value.replace(/[^\d]/g,'')"
                  v-model="addEdit.client_id"
                  placeholder="请输入客值ID"/>
                <span v-if="errorTip.client_id" class="isNotNull">必填项不能为空</span>
            </el-form-item>
            <el-form-item class="star" label="来源：">
              <el-select
                class="widthAll"
                v-model="addEdit.source"
                placeholder="请选择来源">
                <el-option
                  v-for="(item,index) in sourceDate"
                  :key="index"
                  :label="item.NAME"
                  :value="item.VALUE"/>
              </el-select>
              <span v-if="errorTip.source" class="isNotNull">必填项不能为空</span>
            </el-form-item>
            <el-form-item class="star" label="售票员ID：">
              <el-input
                maxlength="6"
                @blur="blurInputUser(addEdit.conductor_id,'conductor_id')"
                oninput="value=value.replace(/[^\d]/g,'')"
                v-model="addEdit.conductor_id"
                placeholder="请输入售票员ID"/>
              <span v-if="errorTip.conductor_id" class="isNotNull">必填项不能为空</span>
            </el-form-item>
            <el-form-item label="面值：">
              <el-select
                class="widthAll"
                placeholder="请选择面值"
                v-model="addEdit.faceValue">
                <el-option
                  v-for="(item,index) in faceValueData"
                  :key="index"
                  :label="item.NAME"
                  :value="item.VALUE"
                />
              </el-select>
              <span v-if="errorTip.faceValue" class="isNotNull">必填项不能为空</span>
            </el-form-item>
            <el-form-item label="操作时间："  class="star">
              <el-date-picker
                value-format="yyyy-MM-dd"
                v-model="addEdit.dateTime"
                type="date"
              />
              <span v-if="errorTip.dateTime" class="isNotNull">必填项不能为空</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item class="star" label="客值名称：">
              <el-input  @blur="blurInputUser(addEdit.clientName,'clientName')"  v-model="addEdit.clientName"/>
              <span v-if="errorTip.clientName" class="isNotNull">必填项不能为空</span>
            </el-form-item>
            <el-form-item label="类型：">
              <el-select
                class="widthAll"
                placeholder="请选择类型"
                v-model="addEdit.typeReceipts">
                <el-option
                  v-for="(item,index) in typeDate"
                  :key="index"
                  :label="item.NAME"
                  :value="item.VALUE"
                />
              </el-select>
              <span v-if="errorTip.typeReceipts" class="isNotNull">必填项不能为空</span>
            </el-form-item>
            <el-form-item class="star" label="售票员名称：">
              <el-input
                @blur="blurInputUser(addEdit.conductor_name,'conductor_name')"
                maxlength="6"
                v-model="addEdit.conductor_name"
                placeholder="请输入售票员名称"/>
              <span v-if="errorTip.conductor_name" class="isNotNull">必填项不能为空</span>
            </el-form-item>
            <el-form-item class="star" label="张数/枚数：">
              <el-input
                maxlength="9"
                oninput="value=value.replace(/[^\d]/g,'')"
                v-model="addEdit.amount"
                @blur="blurInputUser(addEdit.amount,'amount')"
                placeholder="请输入售票员名称"/>
              <span v-if="errorTip.amount" class="isNotNull">必填项不能为空</span>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button type="primary" @click="resetQuery">取消</el-button>
        <el-button type="primary" v-btn-control @click="handleSubmit">提交</el-button>
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
    name: 'nonstandardMoney',
    data() {
      return {

        isScreenCreate: false,
        dialogAddSyn: false, //新增
        typeDate:[], // 类型状态
        faceValueData: [], // 面值数据
        typeReceiptsData: [], // 单据类型
        formItem: {
          dateTime: [],
          source: '', // 来源
          type: '', //类型
          faceValue: '', // 面值
          clientNumber: '',// 客值
          ldentifying: '',// 确认人
          typeReceipts: '', // 类型状态
        },
        addEdit: {
          client_id: '',// 客值id
          clientName: '',// 客值名称
          source: '', // 来源
          conductor_id: '', // 售票员id
          conductor_name: '', // 售票员名称
          typeReceipts: '', // 类型
          faceValue: '', // 面值
          amount: '',//张数
          dateTime: '', // 操作时间
        },
        con: 0,
        tableData: [], // 查询表格数据
        // 分页
        options: {
          total: 0, // 总条数
          currentPage: 1, // 当前页码
          pageSize: 10 // 显示条数
        },
        errorTip: {
          source: false,
          client_id: false,
          faceValue: false,
          conductor_id: false,
          clientName: false,
          conductor_name: false,
          amount: false,
          dateTime: false,
          typeReceipts: false,
        },
        limitBtn: {
          queryBtn: false,
          addDate: false,
        },
        sourceDate: [], // 来源数据
      }
    },
    methods: {
      // 校验
      blurInputUser(val, flag) {
        var _t = this;
        if (val.trim() === "") {
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
      // 点击新增
      Added() {
        var _t = this;
        _t.dialogAddSyn = true;
      },
      // 新增提交
      handleSubmit() {
        var _t = this;

        _t.blurInputUser(_t.addEdit.client_id,'client_id');
        _t.blurInputUser(_t.addEdit.faceValue,'faceValue');
        _t.blurInputUser(_t.addEdit.dateTime,'dateTime');
        _t.blurInputUser(_t.addEdit.source,'source');
        _t.blurInputUser(_t.addEdit.conductor_id,'conductor_id');
        _t.blurInputUser(_t.addEdit.clientName,'clientName');
        _t.blurInputUser(_t.addEdit.conductor_name,'conductor_name');
        _t.blurInputUser(_t.addEdit.amount,'amount');
        _t.blurInputUser(_t.addEdit.typeReceipts,'typeReceipts');
        if (_t.errorTip.client_id === false
          && _t.errorTip.conductor_id === false
          && _t.errorTip.clientName === false
          && _t.errorTip.conductor_name === false
          && _t.errorTip.source === false
          && _t.errorTip.amount === false
          && _t.errorTip.faceValue === false
          && _t.errorTip.dateTime === false
          && _t.errorTip.typeReceipts === false
        ) {
          var params ={
            update_dt: _t.addEdit.dateTime,
            source: _t.addEdit.source,
            operator_id:_t.addEdit.client_id,
            operator_name: _t.addEdit.clientName,
            conductor_id: _t.addEdit.conductor_id,
            conductor_name: _t.addEdit.conductor_name,
            type: _t.addEdit.typeReceipts,
            face_value: _t.addEdit.faceValue,
            amount: _t.addEdit.amount,
          };
          _t.$api.post('/tsGateWay/noStandardCurrency/addNoStandardCurrencyGateWay', params, function (res) {
             if (res.rtCode) {
               _t.getData();
               _t.resetQuery();
             }
          });
        }



      },
      // 查询
      getData() {
        var _t = this;
        var params ={
          begin_time:_t.formItem.dateTime !== null ? (_t.formItem.dateTime[0] !== undefined ? dateFilter(_t.formItem.dateTime[0].getTime()) : '') : null ,
          end_time:_t.formItem.dateTime !== null ? (_t.formItem.dateTime[1] !== undefined ? dateFilter(_t.formItem.dateTime[1].getTime()) : '') : null,
          source: _t.formItem.source ,//来源
          type: _t.formItem.type , //类型
          face_value: _t.formItem.faceValue, //面值
          operator_id:_t.formItem.clientNumber, //客值id
          document_status: _t.formItem.typeReceipts, //单据状态
          check_operator_id:_t.formItem.ldentifying, //确认人id
          pageNum: 1,
          pageSize: 10,
        };
        _t.$api.post('/tsGateWay/noStandardCurrency/queryNoStandardCurrencyGateWay', params, function (res) {
          if(res.rtCode ==='11023'){
            _t.tableData = res.rtData;
            _t.options.total = res.totalCount ? res.totalCount : 0;
          }else if (res.rtCode) {
            _t.alertDialogTip(_t, res.rtMessage);
          }
        })
      },
      // 获取 下拉框
      getSelect(){
      //  1 来源 2 类型 3 面值 4 单据状态 5 审核状态
        this.getSelectData('1');
        this.getSelectData('2');
        this.getSelectData('3');
        this.getSelectData('4');
      },
      getSelectData(val) {
        var _t = this;
        var params ={
          flag: val
        };
        _t.$api.post('/tsGateWay/noStandardCurrency/queryNoStandardCurrencySourceGateWay', params, function (res) {
           if(res.rtCode ==='11018') {
             // 来源
            _t.sourceDate = res.rtData
           }else if (res.rtCode ==='11019'){
             //2 类型
             _t.typeDate = res.rtData
           }else if (res.rtCode ==='11020') {
             // 3 面值
             _t.faceValueData = res.rtData;
           }else if (res.rtCode ==='11021') {
             // 4 单据状态
             _t.typeReceiptsData = res.rtData
           }else {
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
        _t.formItem.source= ''; // 来源
        _t.formItem.type= '';//类型
        _t.formItem.faceValue ='';// 面值
        _t.formItem.clientNumber = '';// 客值
        _t.formItem.ldentifying = '';// 确认人
        _t.formItem.typeReceipts = '';// 类型状态
        _t.addEdit.client_id = '';// 客值id
        _t.addEdit.clientName = '';// 客值名称
        _t.addEdit.source = ''; // 来源
        _t.addEdit.conductor_id = '';// 售票员id
        _t.addEdit.conductor_name = '';// 售票员名称
        _t.addEdit.typeReceipts = ''; // 类型
        _t.addEdit.faceValue = '';// 面值
        _t.addEdit.amount = '';//张数
        _t.addEdit.dateTime = '';// 操作时间
        _t.errorTip.client_id = false;
        _t.errorTip.conductor_id = false;
        _t.errorTip.clientName = false;
         _t.errorTip.conductor_name = false;
         _t.errorTip.source = false;
         _t.errorTip.amount = false;
         _t.errorTip.faceValue = false;
         _t.errorTip.dateTime = false;
        _t.errorTip.typeReceipts = false;
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
            _t.getSelect();
            _t.getData();
          }
        });
        // 判断权限按钮
        limitBtnArr.forEach(item => {
          // 查询
          if (item.MENU_ID === "MENU20191129143130rXXjuIfocIkcOb") {
            _t.limitBtn.queryBtn = true;
          }
          // 新增
          if (item.MENU_ID === "MENU20191129143112kgnigoaWmMjzyF") {
            _t.limitBtn.addDate = true;
          }
        });
      }
    }
  }
</script>

<style scoped>

</style>
