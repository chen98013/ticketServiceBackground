<template>
  <Box>
    <div class="formBox-top">
      <el-form inline :model="formItem" ref="form" label-width="110px">
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
            clearable
            class="width200"
            placeholder="请选择车站"
            v-model="formItem.station">
            <el-option
              v-for="(item,index) in stationList"
              :key="index"
              :label="item.STATION_LOCATION_NAME"
              :value="item.LOCATION_NUMBER.toString()"/>
          </el-select>
        </el-form-item>
        <el-form-item label="车票类型：" class="marBottom7">
          <el-select
            clearable
            class="width200"
            v-model="formItem.ticketType"
            placeholder="请选择车票类型">
            <el-option
              v-for="(item,index) in ticketType"
              :key="index"
              :label="item.STOCK_TYPE_NAME_CN"
              :value="item.STOCK_MANAGE_TYPE_ID"/>
          </el-select>
        </el-form-item>
        <el-form-item label="库存状态：" class="marBottom7">
          <el-select
            clearable
            class="width200"
            v-model="formItem.status"
            placeholder="请选择库存状态">
            <el-option
              v-for="item in statusList"
              :key="item.VALUE"
              :label="item.NAME"
              :value="item.VALUE"/>
          </el-select>
        </el-form-item>
        <br>
        <el-form-item class="marBottom7 fl">
          <el-button v-if="limitBtn.addBtn" type="primary" @click="handleAdd">新增</el-button>
        </el-form-item>
        <el-form-item class="marBottom7 fr">
          <el-button v-if="limitBtn.queryBtn" type="primary" @click="getData">查询</el-button>
          <el-button type="warning" @click="resetFormItem">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="tableWp">
      <el-table :data="tableData" border stripe :default-sort="{prop:'STOCK_STATE',order:'descending'}">
        <el-table-column prop="LOCATION_TYPE_NAME" label="线路" header-align="center" align="center"/>
        <el-table-column prop="STATION_NAME" label="车站" header-align="center" align="center"/>
        <el-table-column prop="STOCK_TYPE_NAME_CN" width="180px" label="车票类型" header-align="center" align="center"/>
        <el-table-column prop="STOCK_STATE_NAME" label="库存状态" sortable header-align="center" align="center"/>
        <el-table-column prop="TICKET_NUMBER" label="可用库存" header-align="center" align="center"/>
        <el-table-column prop="FROZEN_NUMBER" label="冻结库存" header-align="center" align="center"/>
        <el-table-column prop="TOTAL_NUMBER" label="总库存" header-align="center" align="center"/>
        <el-table-column fixed="right" width="300px" header-align="center" align="center" label="操作">
          <template slot-scope="scope">
            <el-button v-if="scope.row.LOCATION_NUMBER == cookieMap.location_number" @click="handleClick(scope.row)"
                       type="primary">库存操作
            </el-button>
            <el-button v-if="scope.row.LOCATION_NUMBER == cookieMap.location_number" @click="freezeClick(scope.row)"
                       type="primary">冻结库存操作
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页-->
      <pages
        :total='options.total'
        :currentPage='options.currentPage'
        :page-size="options.pageSize"
        @handleSizeChangeSub="handleSizeChangeSub"
        @handleCurrentChangeSub="handleCurrentChange"/>
    </div>
    <!--库存操作-->
    <el-dialog
      append-to-body
      :fullscreen="isScreen"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="resetStock"
      :visible.sync="dialogFormVisible">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">库存操作</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreen = !isScreen"></i>
      </div>
      <el-form ref="addEdit" :model="addEdit" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="线路：">
              <el-select
                disabled
                class="widthAll"
                placeholder="请选择线路"
                v-model="addEdit.lines">
                <el-option
                  v-for="(item,index) in linesList"
                  :key="index"
                  :label="item.LINE_LOCATION_NAME"
                  :value="item.LINE_LOCATION_NUMBER.toString()"/>
              </el-select>
            </el-form-item>
            <el-form-item label="车票类型：">
              <el-input disabled v-model="addEdit.stock_manage_type_name"/>
            </el-form-item>
            <el-form-item label="可用库存：">
              <el-input
                v-model="addEdit.stock_quantity"
                disabled/>
            </el-form-item>
            <el-form-item class="star" label="操作类型：">
              <el-select
                class="widthAll"
                v-model="addEdit.operation_type"
                @change="changeType(addEdit.operation_type)"
                placeholder="请选择操作类型">
                <el-option
                  v-for="(item,index) in typeList"
                  :key="index"
                  :label="item.TYPE_NAME"
                  :value="item.TYPE_VALUE"/>
              </el-select>
              <span v-if="errorTip.typeFlag" class="isNotNull">必填项不能为空</span>
            </el-form-item>
            <el-form-item class="star" label="认证操作人员：">
              <el-input
                maxlength="6"
                v-model="addEdit.identified_operator_id"
                @blur="blurInputUser(errorTip,addEdit.identified_operator_id,'userFlag')"
                placeholder="请输入认证操作人员"/>
              <span v-if="errorTip.userFlag" class="isNotNull">必填项不能为空</span>
            </el-form-item>
            <el-form-item class="star" label="操作数量(张)：">
              <el-input
                maxlength="6"
                oninput="value=value.replace(/[^\d]/g,'')"
                v-model="addEdit.quantity"
                @blur="blurInputNum"
                placeholder="请输入操作数量"/>
              <span v-if="errorTip.operationFlag" class="isNotNull">{{errorTip.operationTip}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="位置：">
              <el-select
                disabled
                class="widthAll"
                placeholder="请选择车站"
                v-model="addEdit.station">
                <el-option
                  v-for="(item,index) in stationList"
                  :key="index"
                  :label="item.STATION_LOCATION_NAME"
                  :value="item.LOCATION_NUMBER.toString()"/>
              </el-select>
            </el-form-item>
            <el-form-item label="总库存：">
              <el-input disabled v-model="addEdit.TOTAL_NUMBER"/>
            </el-form-item>
            <el-form-item label="冻结库存：">
              <el-input
                v-model="addEdit.FROZEN_NUMBER"
                disabled/>
            </el-form-item>
            <el-form-item class="star" label="变更原因：">
              <el-select
                class="widthAll"
                v-model="addEdit.change_reason"
                @change="changeReason(addEdit.change_reason)"
                placeholder="请选择变更原因">
                <el-option
                  v-for="(item,index) in reasonList"
                  :key="index"
                  :label="item.REASON_NAME"
                  :value="item.REASON_VALUE"/>
              </el-select>
              <span v-if="errorTip.reasonFlag" class="isNotNull">必填项不能为空</span>
            </el-form-item>
            <el-form-item class="star" label="密码：">
              <el-input
                maxlength="6"
                v-model="addEdit.identified_operator_password"
                type="password"
                @blur="blurInputUser(errorTip,addEdit.identified_operator_password,'passwordFlag')"
                placeholder="请输入密码"/>
              <span v-if="errorTip.passwordFlag" class="isNotNull">必填项不能为空</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注：">
          <el-input type="textarea" v-model="addEdit.note" maxlength="250" show-word-limit/>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="resetStock">取消</el-button>
        <el-button type="primary"  v-btn-control :disabled="disabledShow" @click="addEditData">确定</el-button>
      </div>
    </el-dialog>
    <!--冻结库存操作-->
    <el-dialog
      append-to-body
      :fullscreen="isScreen"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="resetStock"
      :visible.sync="freezeClickVisible">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">冻结库存操作</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreen = !isScreen"></i>
      </div>
      <el-form ref="addEdit" :model="addEdit" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="线路：">
              <el-select
                disabled
                class="widthAll"
                placeholder="请选择线路"
                v-model="addEdit.lines">
                <el-option
                  v-for="(item,index) in linesList"
                  :key="index"
                  :label="item.LINE_LOCATION_NAME"
                  :value="item.LINE_LOCATION_NUMBER.toString()"/>
              </el-select>
            </el-form-item>
            <el-form-item label="车票类型：">
              <el-input disabled v-model="addEdit.stock_manage_type_name"/>
            </el-form-item>
            <el-form-item class="star" label="操作类型：">
              <el-select
                class="widthAll"
                v-model="addEdit.operation_type"
                @change="changeType(addEdit.operation_type)"
                placeholder="请选择操作类型">
                <el-option
                  v-for="(item,index) in typeListArr"
                  :key="index"
                  :label="item.TYPE_NAME"
                  :value="item.TYPE_VALUE"/>
              </el-select>
              <span v-if="errorTip.typeFlag" class="isNotNull">必填项不能为空</span>
            </el-form-item>
            <el-form-item class="star" label="认证操作人员：">
              <el-input
                maxlength="6"
                v-model="addEdit.identified_operator_id"
                @blur="blurInputUser(errorTip,addEdit.identified_operator_id,'userFlag')"
                placeholder="请输入认证操作人员"/>
              <span v-if="errorTip.userFlag" class="isNotNull">必填项不能为空</span>
            </el-form-item>
            <el-form-item class="star" label="操作数量(张)：">
              <el-input
                maxlength="6"
                oninput="value=value.replace(/[^\d]/g,'')"
                v-model="addEdit.quantity"
                @blur="blurInputNum"
                placeholder="请输入操作数量"/>
              <span v-if="errorTip.operationFlag" class="isNotNull">{{errorTip.operationTip}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="位置：">
              <el-select
                disabled
                class="widthAll"
                placeholder="请选择车站"
                v-model="addEdit.station">
                <el-option
                  v-for="(item,index) in stationList"
                  :key="index"
                  :label="item.STATION_LOCATION_NAME"
                  :value="item.LOCATION_NUMBER.toString()"/>
              </el-select>
            </el-form-item>
            <el-form-item label="冻结库存：">
              <el-input
                v-model="addEdit.FROZEN_NUMBER"
                disabled/>
            </el-form-item>
            <el-form-item class="star" label="变更原因：">
              <el-select
                class="widthAll"
                v-model="addEdit.change_reason"
                @change="changeReason(addEdit.change_reason)"
                placeholder="请选择变更原因">
                <el-option
                  v-for="(item,index) in reasonList"
                  :key="index"
                  :label="item.REASON_NAME"
                  :value="item.REASON_VALUE"/>
              </el-select>
              <span v-if="errorTip.reasonFlag" class="isNotNull">必填项不能为空</span>
            </el-form-item>
            <el-form-item class="star" label="密码：">
              <el-input
                maxlength="6"
                v-model="addEdit.identified_operator_password"
                type="password"
                @blur="blurInputUser(errorTip,addEdit.identified_operator_password,'passwordFlag')"
                placeholder="请输入密码"/>
              <span v-if="errorTip.passwordFlag" class="isNotNull">必填项不能为空</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注：">
          <el-input type="textarea" v-model="addEdit.note" maxlength="250" show-word-limit/>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="resetStock">取消</el-button>
        <el-button type="primary" v-btn-control :disabled="disabledShow" @click="freezeData">确定</el-button>
      </div>
    </el-dialog>
    <!--    新增车票选择-->
    <el-dialog
      append-to-body
      :fullscreen="isScreenCreate"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="resetStock"
      :visible.sync="dialogAddSyn">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">新增车票选择</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenCreate = !isScreenCreate"></i>
      </div>
      <el-radio-group v-model="radioList">
        <el-radio v-for="(item, index) in ticketTypeList" :key="item.GUID" :label="item.STOCK_MANAGE_TYPE_ID">
          {{item.STOCK_TYPE_NAME_CN}}
        </el-radio>
      </el-radio-group>
      <div slot="footer">
        <el-button type="primary" @click="resetStock">取消</el-button>
        <el-button type="primary" v-btn-control  @click="synchronous">提交</el-button>
      </div>
    </el-dialog>
    <!--    新增提交弹框-->
    <el-dialog
      append-to-body
      :fullscreen="isScreenCreate"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="resetRole"
      :visible.sync="dialogAdd">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">新增车票</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenCreate = !isScreenCreate"></i>
      </div>
      <el-form :model="addEditCar" label-width="150px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="库存管理类型代码：">
              <el-input disabled v-model="addEditCar.stock_manage_type_id"/>
            </el-form-item>
            <el-form-item label="位置类型：" class="star">
              <el-input disabled
                v-model="addEditCar.location_type"/>
              <span v-if="errorTipAdd.location_type" class="isNotNull">必填项不能为空</span>
            </el-form-item>
            <el-form-item label="车票数量：" class="star">
              <el-input
                oninput="value=value.replace(/[^\d]/g,'')"
                @blur="ruleAddForm(addEditCar.ticket_number,'ticket_number')"
                maxlength="8" v-model="addEditCar.ticket_number"/>
              <span v-if="errorTipAdd.ticket_number" class="isNotNull">必填项不能为空</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="车票冻结数量：" class="star">
              <el-input
                @blur="ruleAddForm(addEditCar.ticket_frozen_number,'ticket_frozen_number')"
                placeholder="车票冻结数量"
                oninput="value=value.replace(/[^\d]/g,'')"
                v-model="addEditCar.ticket_frozen_number"
                maxlength="8"
              />
              <span v-if="errorTipAdd.ticket_frozen_number" class="isNotNull">必填项不能为空</span>
            </el-form-item>
            <el-form-item label="库存状态：" class="star">
              <el-select
                clearable v-model="addEditCar.stock_state" placeholder="请选择">
                <el-option
                  v-for="item in statusList"
                  :key="item.VALUE"
                  :label="item.NAME"
                  :value="item.VALUE"/>
              </el-select>
              <span v-if="errorTipAdd.stock_state" class="isNotNull">必填项不能为空</span>
            </el-form-item>
<!--            <el-form-item label="库区代码：" class="star">-->
<!--              <el-input-->
<!--                oninput="value=value.replace(/[^\d]/g,'')"-->
<!--                @blur="ruleAddForm(addEditCar.stock_manage_code,'stock_manage_code')"-->
<!--                v-model="addEditCar.stock_manage_code"-->
<!--              />-->
<!--              <span v-if="errorTipAdd.stock_manage_code" class="isNotNull">必填项不能为空</span>-->
<!--            </el-form-item>-->
<!--            <el-form-item label="票卡存放物理位置：" class="star">-->
<!--              <el-input-->
<!--                @blur="ruleAddForm(addEditCar.stock_actual_are,'stock_actual_are')"-->
<!--                v-model="addEditCar.stock_actual_are"-->
<!--              />-->
<!--              <span v-if="errorTipAdd.stock_actual_are" class="isNotNull">必填项不能为空</span>-->
<!--            </el-form-item>-->
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button type="primary" @click="resetRole">取消</el-button>
        <el-button type="primary" v-btn-control :disabled="disabledShow" @click="HandleSaver">保存</el-button>
      </div>
    </el-dialog>
  </Box>
</template>

<script>
  import Box from '../../../components/Box';

  export default {
    name: "ticketStockChange",
    components: {Box},
    data() {
      return {
        disabledShow: this.$store.state.disabledShow, // 提交禁选
        freezeClickVisible: false, // 冻结库存操作
        isScreenCreate: false,
        isScreen: false,
        // 新增提交弹框
        dialogAdd: false,
        //新增
        dialogAddSyn: false,
        // 查询表单
        formItem: {
          lines: '', // 线路
          station: '', // 车站
          ticketType: '', // 车票类型
          status: '', // 库存状态
        },
        typeListArr: [], // 冻结操作
        linesListArr: [],// 调出线路
        //新增效验
        errorTipAdd: {
          location_type: false,//位置类型
          location_number: false,//位置编码
          stock_manage_type_id: false,//	库存管理类型代码
          ticket_number: false,//车票数量
          ticket_frozen_number: false,//	车票冻结数量
          stock_manage_code: false,//	库区代码
          stock_actual_are: false,//	票卡存放物理位置
          stock_state: false,//	库存状态
          update_dt: false,//	更新时间
        },
        addEditCar: {
          guid: '',//	记录编号
          location_type: '',//位置类型
          location_number: '',//位置编码
          stock_manage_type_id: '',//	库存管理类型代码
          ticket_number: '',//车票数量
          ticket_frozen_number: '',//	车票冻结数量
          stock_manage_code: '',//	库区代码
          stock_actual_are: '',//	票卡存放物理位置
          stock_state: '',//	库存状态
          update_dt: '',//	更新时间
        },
        radioList: '',// 单选框选中数据
        ticketTypeList: [], // 单选框组数据
        disabledBtn: {
          create: true,
          createDis: true,
        },
        // 分页
        options: {
          total: 0, // 总条数
          currentPage: 1, // 当前页码
          pageSize: 10, // 显示条数
        },
        // 控制按钮权限显示隐藏
        limitBtn: {
          queryBtn: false,
          operation: false,
          addBtn: false,
        },
        // 库存操作蒙版
        dialogFormVisible: false,
        // 库存状态集合
        statusList: [],
        // 线路集合
        linesList: [],
        // 车站集合
        stationList: [],
        // 表格数据
        tableData: [],
        // 车票类型集合
        ticketType: [],
        // 操作类型集合
        typeList: [],
        // 变更原因集合
        reasonList: [],
        // 弹出层车站集合
        dialogStationList: [],
        // 库存操作
        addEdit: {
          lines: '', // 线路
          station: '', // 车站
          operation_type: '', // 操作类型
          change_reason: '', // 变更原因
          stock_manage_type_id: '', // 车票类型id
          stock_manage_type_name: '', // 车票类型名称
          stock_quantity: '', // 可用库存数量
          quantity: '', // 操作数量
          identified_operator_id: '', // 认证操作员
          identified_operator_password: '', // 密码
          note: '', // 备注
          TOTAL_NUMBER: '', // 总库存
          FROZEN_NUMBER: ''// 冻结库存
        },
        // 校验标识
        errorTip: {
          typeFlag: false, // 操作类型
          reasonFlag: false, // 变更原因
          operationFlag: false, // 操作数量
          operationTip: '', // 操作数量提示
          userFlag: false, // 认证操作员
          passwordFlag: false, // 密码
        },
        // 从cookie中获取
        cookieMap: {
          location_number: this.getCookie('LOCATION_NUMBER'), // 位置编号
          user_id: this.getCookie('USER_ID'), // 操作员ID
          role: this.getCookie('USER_TYPE'), // 用户角色
          type_id: this.getCookie('LOCATION_TYPE_ID'), // 车站位置类型
        }
      };
    },
    methods: {
      // 冻结库存保存
      freezeData () {
        var _t = this;
        _t.$store.commit('setShow', true);
        // 校验操作类型
        _t.blurInputUser(_t.errorTip, _t.addEdit.operation_type, 'typeFlag');
        // 校验变更原因
        _t.blurInputUser(_t.errorTip, _t.addEdit.change_reason, 'reasonFlag');
        // 校验操作数量
        _t.blurInputNum();
        // 校验认证操作员
        _t.blurInputUser(_t.errorTip, _t.addEdit.identified_operator_id, 'userFlag');
        // 校验密码
        _t.blurInputUser(_t.errorTip, _t.addEdit.identified_operator_password, 'passwordFlag');
        var location_number = _t.addEdit.station ? _t.addEdit.station : _t.addEdit.lines;
        if (_t.errorTip.typeFlag === false
          && _t.errorTip.reasonFlag === false
          && _t.errorTip.operationFlag === false
          && _t.errorTip.userFlag === false
          && _t.errorTip.passwordFlag === false) {
          let str = 'location_number=' + location_number
            + '&operator_id=' + _t.cookieMap.user_id
            + '&operation_type=' + _t.addEdit.operation_type
            + '&change_reason=' + _t.addEdit.change_reason
            + '&stock_manage_type_id=' + _t.addEdit.stock_manage_type_id
            + '&quantity=' + Number(_t.addEdit.quantity.trim())
            + '&identified_operator_id=' + _t.addEdit.identified_operator_id.trim()
            + '&identified_operator_password=' + _t.addEdit.identified_operator_password.trim();
          let Base64 = require('js-base64').Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          var params = {
            flag: '1',
            location_number: location_number, // 位置编号
            operator_id: _t.cookieMap.user_id, // 操作员id
            token: keyToken, // token
            operation_type: _t.addEdit.operation_type, // 操作类型
            change_reason: _t.addEdit.change_reason, // 操作原因
            stock_manage_type_id: _t.addEdit.stock_manage_type_id, // 车票类型
            quantity: Number(_t.addEdit.quantity.trim()), // 操作张数
            identified_operator_id: _t.addEdit.identified_operator_id.trim(), // 认证操作员id
            identified_operator_password: _t.addEdit.identified_operator_password.trim(), // 密码
            comment_info: _t.addEdit.note.trim(), // 备注
          };
          _t.$api.post('/tsGateWay/ticketStockManage/stockChangeSaveGateWay', params, function (res) {
            // 操作成功
            if (res.rtCode && res.rtCode === '10002') {
              _t.$alert(res.rtMessage, '温馨提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消'
              }).then(() => {
                _t.getData();
                _t.$store.commit('setShow', false);
                setTimeout(function () {
                  _t.resetStock();
                })
              }).catch(() => {
                _t.getData();
                _t.$store.commit('setShow', false);
                setTimeout(function () {
                  _t.resetStock();
                })
              });
            } else if (res.rtCode === '20016') {
              // 出库金额大于库存金额
              _t.$store.commit('setShow', false);
              _t.alertDialogTip(_t, res.rtMessage);
            } else if (res.rtCode) {
              _t.$store.commit('setShow', false);
              _t.alertDialogTip(_t, res.rtMessage);
            }
          });
        }
      },
      // 冻结库存操作
      freezeClick(row) {
        var _t = this;
        _t.freezeClickVisible = true;
        _t.addEdit.lines = _t.formItem.lines.toString();
        _t.addEdit.station = _t.formItem.station.toString();
        // 车票类型id
        _t.addEdit.stock_manage_type_id = row.STOCK_MANAGE_TYPE_ID ? row.STOCK_MANAGE_TYPE_ID : '';
        // 车票类型name
        _t.addEdit.stock_manage_type_name = row.STOCK_TYPE_NAME_CN ? row.STOCK_TYPE_NAME_CN : '';
        // 库存数量
        _t.addEdit.stock_quantity = row.TICKET_NUMBER !== undefined ? row.TICKET_NUMBER : '';
        _t.addEdit.FROZEN_NUMBER = row.FROZEN_NUMBER; // 冻结库存
        _t.addEdit.TOTAL_NUMBER = row.TOTAL_NUMBER; // 总库存
        _t.typeList.forEach(item => {
          if (item.TYPE_VALUE == '03') {
            _t.typeListArr.push(item)
          }
        })
      },
      // 新增操作
      handleAdd() {
        var _t = this;
        var locationNumber = _t.cookieMap.location_number.toString();
        _t.dialogAddSyn = true;
        _t.$api.post('/tsGageway/ticekStock/selectTicketStockManage', locationNumber, function (res) {
          if (res.rtCode && res.rtCode === '10005') {
            _t.ticketTypeList = res.rtData
          } else if (res.rtCode) {
            _t.resetRole();
            _t.alertDialogTip(_t, res.rtMessage);
          }
        })
      },
      // 新增提交保存
      HandleSaver() {
        var _t = this;
        _t.$store.commit('setShow', true);
        // _t.ruleAddForm(_t.addEditCar.location_type, 'location_type');//位置类型
        // _t.ruleAddForm(_t.addEditCar.location_number, 'location_number');//位置编码
        _t.ruleAddForm(_t.addEditCar.ticket_number, 'ticket_number');//车票数量
        _t.ruleAddForm(_t.addEditCar.ticket_frozen_number, 'ticket_frozen_number');//	车票冻结数量
        // _t.ruleAddForm(_t.addEditCar.stock_manage_code, 'stock_manage_code');//	库区代码
        // _t.ruleAddForm(_t.addEditCar.stock_actual_are, 'stock_actual_are');//	票卡存放物理位置
        _t.ruleAddForm(_t.addEditCar.stock_state, 'stock_state');//	库存状态
        var init = true;
        if (_t.addEditCar.stock_state == '') {
          init = false;
          _t.$store.commit('setShow', false);
          _t.alertDialogTip(_t, '库存状态不能为空!');
        }
        if (
          // _t.errorTipAdd.location_type === false &&
          // _t.errorTipAdd.location_number === false &&
          _t.errorTipAdd.ticket_number === false &&
          _t.errorTipAdd.ticket_frozen_number === false &&
          _t.errorTipAdd.stock_manage_code === false &&
          _t.errorTipAdd.stock_actual_are === false &&
          init
        ) {
          let str = 'location_type=' + _t.getCookie('LOCATION_TYPE_ID').toString()
            + '&location_number=' + _t.cookieMap.location_number.toString()
            + '&stock_manage_type_id=' + _t.addEditCar.stock_manage_type_id.toString()
            + '&ticket_number=' + _t.addEditCar.ticket_number.toString()
            + '&ticket_frozen_number=' + _t.addEditCar.ticket_frozen_number.toString()
            + '&stock_manage_code=' + '02'
            + '&stock_actual_are=' + '032'
            + '&stock_state=' + _t.addEditCar.stock_state.toString()
            + '&operator_id=' + _t.cookieMap.user_id.toString();
          let Base64 = require('js-base64').Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          var params = {
            location_type: _t.getCookie('LOCATION_TYPE_ID').toString(),
            location_number: _t.cookieMap.location_number.toString(),
            stock_manage_type_id: _t.addEditCar.stock_manage_type_id.toString(),
            ticket_number: _t.addEditCar.ticket_number.toString(),
            ticket_frozen_number: _t.addEditCar.ticket_frozen_number.toString(),
            stock_manage_code: '02', // 库存代码
            stock_actual_are: '032', // 票卡存放物理位置
            stock_state: _t.addEditCar.stock_state.toString(),
            operator_id: _t.cookieMap.user_id.toString(),
            token: keyToken
          };
          _t.$api.post('/tsGageway/ticekStock/addTicketStock', params, function (res) {
            if (res.rtCode && res.rtCode === '18018') {
              _t.$store.commit('setShow', false);
              _t.alertDialogTip(_t, res.rtMessage);
              _t.resetStock();
              _t.resetRole();
            } else if (res.rtCode) {
              _t.$store.commit('setShow', false);
              _t.resetRole();
              _t.resetStock();
              _t.alertDialogTip(_t, res.rtMessage);
            }
          })
        }

      },
      // 新增提交
      synchronous() {
        var _t = this;
        if (_t.radioList !== '') {
          _t.dialogAdd = true;
          _t.addEditCar.stock_manage_type_id = _t.radioList; // 记录编号
         _t.addEditCar.location_type = _t.getCookie('LOCATION_TYPE_ID') // 位置类型

        } else {
          _t.alertDialogTip(_t, '请选择一条数据');
        }
      },
      ruleAddForm(val, flag) {
        var _t = this;
        if (val.trim() === "") {
          _t.errorTipAdd[flag] = true;
        } else {
          _t.errorTipAdd[flag] = false;
        }
      },
      // 新增重
      resetRole() {
        var _t = this;
        _t.dialogAdd = false;
        // _t.dialogAddSyn = false;
        _t.addEditCar.guid = '';//	记录编号
        _t.addEditCar.location_type = '';//位置类型
        _t.addEditCar.location_number = '';//位置编码
        _t.addEditCar.stock_manage_type_id = '';//	库存管理类型代码
        _t.addEditCar.ticket_number = '';//车票数量
        _t.addEditCar.ticket_frozen_number = '';//	车票冻结数量
        _t.addEditCar.stock_manage_code = '';//	库区代码
        // _t.addEditCar.stock_actual_are = '';//	票卡存放物理位置
        _t.addEditCar.stock_state = '';//	库存状态
        _t.addEditCar.update_dt = '';//	更新时间
        _t.errorTipAdd.location_type = false;//位置类型
        _t.errorTipAdd.location_number = false;//位置类型
        _t.errorTipAdd.stock_manage_type_id = false;//位置类型
        _t.errorTipAdd.ticket_number = false;//位置类型
        _t.errorTipAdd.ticket_frozen_number = false;//位置类型
        _t.errorTipAdd.stock_manage_code = false;//位置类型
        _t.errorTipAdd.stock_actual_are = false;//位置类型
        _t.errorTipAdd.stock_state = false;//位置类型
        _t.errorTipAdd.update_dt = false;//位置类型
      },

      // 重置查询表单
      resetFormItem() {
        var _t = this;
        _t.formItem.ticketType = ''; // 车票类型
        _t.formItem.status = ''; // 库存状态
        _t.getData()
      },
      // 改变当前页码
      handleCurrentChange(val) {
        var _t = this;
        _t.options.currentPage = val;
        _t.limitBtn.operation = false;
        _t.getData();
      },
      // 改变每页显示条数
      handleSizeChangeSub(val) {
        var _t = this;
        _t.options.pageSize = val;
        _t.limitBtn.operation = false;
        _t.getData();
      },
      // 查询数据
      getData() {
        var _t = this;
        var location_number = ''; // 发送请求的 位置编号
        var location = _t.cookieMap.location_number; //车站位置
        var location_number_query = ''; // 发送请求的 query
        if (_t.cookieMap.role !== null && _t.cookieMap.role !== 'null'
          && _t.cookieMap.user_id !== null && _t.cookieMap.user_id !== 'null'
          && _t.cookieMap.location_number !== null && _t.cookieMap.location_number !== 'null') {
          if (_t.formItem.station === '') {
            location_number = _t.formItem.lines;
          } else {
            // 车站有值
            location_number = _t.formItem.station;
          }
          // 线路为空
          if (_t.formItem.lines === '') {
            location_number = _t.cookieMap.location_number;
          } else {
            // 线路不为空 判断车站是否为空
            if (_t.formItem.station === '') {
              // 车站为空
              location_number = _t.formItem.lines;
            } else {
              // 车站不为空
              location_number = _t.formItem.lines;
              location_number_query = _t.formItem.station;
            }
          }
        }
        if (location_number !== '' && _t.cookieMap.user_id !== null && _t.cookieMap.user_id !== 'null') {
          let str = 'location_number=' + location_number + '&operator_id=' + _t.cookieMap.user_id;
          let Base64 = require('js-base64').Base64;
          let keyToken = _t.$md5(Base64.encode(str));

          let postData = {
            location_number: location_number, // 位置编码
            location_number_query: location_number_query === '' ? null : location_number_query, // 位置编码
            operator_id: _t.cookieMap.user_id, // 操作员id
            stock_manage_type_id: _t.formItem.ticketType === '' ? null : _t.formItem.ticketType, // 车票类型
            stock_state: _t.formItem.status === '' ? null : _t.formItem.status, // 库存状态
            pageNum: _t.options.currentPage, // 当前页
            pageSize: _t.options.pageSize, // 每页显示条数
            token: keyToken, // token
          };
          // 车票库存查询
          _t.$api.post('/tsGateWay/ticketStockManage/ticketStockQueryGateWay', postData, function (res) {
            _t.$store.commit('setLoading', false);
            // 数据调取成功
            if (res.rtCode && res.rtCode === '10001') {
              _t.tableData = res.rtData === null ? [] : res.rtData;
              _t.options.total = res.totalCount ? res.totalCount : 0;
            } else if (res.rtCode) {
              _t.alertDialogTip(_t, res.rtMessage);
            }
          });
        }
      },
      // 查询线路及车站
      getLinesAndStation() {
        var _t = this;
        _t.$api.post('/tsGateWay/ticketUtility/locationCascadeQuery', {}, function (res) {
          // 查到线路信息
          if (res.rtCode && res.rtCode === '14007') {
            var linesStationArr = res.rtData === null ? [] : res.rtData;
            // 处理线路/车站/操作员数据
            _t.dealWithLinesAndStation(linesStationArr);
          } else if (res.rtCode) {
            _t.alertDialogTip(_t, res.rtMessage);
          }
        });
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
      //  改变线路
      changeLines(val) {
        var _t = this;
        if (val !== '') {
          _t.linesList.forEach((item) => {
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
              _t.formItem.station = '';
            }
          });
        } else {
          // 选中线路为空
          _t.stationList = [];
          _t.formItem.station = '';
        }
      },
      // 认证员校验
      blurInputUser(item, val, flag) {
        item[flag] = val.trim() === '' ? true : false;
      },
      // 获取操作类型及操作原因级联接口
      getTypeAndReason() {
        var _t = this;
        var params = {
          typeid: '01', // 01 车票 02 现金
        };
        _t.$api.post('/tsGateWay/ticketUtility/typeReasonCascadeQuery', params, function (res) {
          // 查询成功
          if (res.rtCode && res.rtCode === '14002') {
            _t.typeList = res.rtData === null ? [] : res.rtData;
          }
        });
      },
      // 改变操作类型
      changeType(val) {
        var _t = this;
        if (val !== '' && val !== null) {
          // 隐藏校验提示
          _t.errorTip.typeFlag = false;
          _t.typeList.forEach((item) => {
            if (item.TYPE_VALUE === val) {
              if (item.reasonList !== undefined && item.reasonList !== null) {
                // 变更原因赋值
                if (item.TYPE_VALUE == '01' && _t.cookieMap.type_id == '22') {
                  var arr = new Array()
                  item.reasonList.forEach((val) => {
                    if (val.REASON_VALUE == '2'  ||  val.REASON_VALUE == '26') {
                      arr.push(val)
                    }
                  });
                  _t.reasonList = arr;
                } else if (item.TYPE_VALUE == '02' && _t.cookieMap.type_id == '22') {
                  var arr1 = new Array()
                  item.reasonList.forEach((val) => {
                    if (val.REASON_VALUE == '1' || val.REASON_VALUE == '4' || val.REASON_VALUE == '7') {
                      arr1.push(val)
                    }
                  });
                  _t.reasonList = arr1;
                }else if (item.TYPE_VALUE == '01' && _t.cookieMap.type_id == '23') {
                  var arr = new Array()
                  item.reasonList.forEach((val) => {
                    if (val.REASON_VALUE == '26') {
                      arr.push(val)
                    }
                  });
                  _t.reasonList = arr;
                }else if (item.TYPE_VALUE == '02' && _t.cookieMap.type_id == '23'){
                  var arr1 = new Array()
                  item.reasonList.forEach((val) => {
                    if (val.REASON_VALUE == '7') {
                      arr1.push(val)
                    }
                  });
                  _t.reasonList = arr1;
                } else {
                  var arr2 = new Array()
                  item.reasonList.forEach(val => {
                    if ( val.REASON_VALUE !== '26') {
                      arr2.push(val)
                    }
                  });
                  _t.reasonList = arr2;
                }
              } else {
                _t.reasonList = []
              }
              //  变更原因置空
              _t.addEdit.change_reason = ''
            }
          });
        } else {
          // 显示提示
          _t.errorTip.typeFlag = true;
        }
      },
      // 改变变更原因
      changeReason(val) {
        var _t = this;
        _t.errorTip.reasonFlag = val !== '' ? false : true;
      },
      // 失去焦点校验操作数量
      blurInputNum() {
        var _t = this;
        if (_t.addEdit.quantity.trim() === '') {
          // 为空
          _t.errorTip.operationFlag = true;
          _t.errorTip.operationTip = '必填项不能为空';
        } else {
          // 不为空 校验是否为数字
          var reg = _t.$config.isNumber();
          if (reg.test(_t.addEdit.quantity.trim()) === false) {
            _t.errorTip.operationFlag = true;
            _t.errorTip.operationTip = '格式不正确';
          } else {
            _t.errorTip.operationFlag = false;
            _t.errorTip.operationTip = '';
          }
        }
      },
      // 点击库存操作按钮
      handleClick(row) {
        var _t = this;
        var role = _t.getCookie("USER_TYPE");
        if (row.LOCATION_NUMBER !== undefined) {
          _t.addEdit.lines = _t.formItem.lines.toString();
          _t.addEdit.station = _t.formItem.station.toString();
          // 车票类型id
          _t.addEdit.stock_manage_type_id = row.STOCK_MANAGE_TYPE_ID ? row.STOCK_MANAGE_TYPE_ID : '';
          // 车票类型name
          _t.addEdit.stock_manage_type_name = row.STOCK_TYPE_NAME_CN ? row.STOCK_TYPE_NAME_CN : '';
          // 库存数量
          _t.addEdit.stock_quantity = row.TICKET_NUMBER !== undefined ? row.TICKET_NUMBER : '';
          _t.addEdit.FROZEN_NUMBER = row.FROZEN_NUMBER; // 冻结库存
          _t.addEdit.TOTAL_NUMBER = row.TOTAL_NUMBER; // 总库存
          // 显示蒙版
          _t.dialogFormVisible = true;

        }
      },
      // 重置库存操作表单
      resetStock() {
        var _t = this;
        _t.dialogFormVisible = false;
        _t.dialogAddSyn = false;
        _t.addEdit.lines = ''; // 线路
        _t.addEdit.station = ''; // 车站
        _t.addEdit.operation_type = ''; // 操作类型
        _t.addEdit.change_reason = ''; // 变更原因
        _t.addEdit.stock_manage_type_id = ''; // 车票类型id
        _t.addEdit.stock_manage_type_name = ''; // 车票类型name
        _t.addEdit.stock_quantity = ''; // 库存数量
        _t.addEdit.quantity = ''; // 操作数量
        _t.addEdit.identified_operator_id = ''; // 认证操作员
        _t.addEdit.identified_operator_password = ''; // 密码
        _t.addEdit.note = ''; // 备注
        _t.errorTip.typeFlag = false; // 操作类型
        _t.errorTip.reasonFlag = false; // 变更原因
        _t.errorTip.operationFlag = false; // 操作数量
        _t.errorTip.operationTip = ''; // 操作数量提示
        _t.errorTip.userFlag = false; // 认证操作员
        _t.errorTip.passwordFlag = false; // 密码
        _t.dialogAdd = false;
        _t.radioList = '';
        _t.freezeClickVisible = false;
        _t.typeListArr =  [];
      },
      // 库存操作提交
      addEditData() {
        var _t = this;
        _t.$store.commit('setShow', true);
        // 校验操作类型
        _t.blurInputUser(_t.errorTip, _t.addEdit.operation_type, 'typeFlag');
        // 校验变更原因
        _t.blurInputUser(_t.errorTip, _t.addEdit.change_reason, 'reasonFlag');
        // 校验操作数量
        _t.blurInputNum();
        // 校验认证操作员
        _t.blurInputUser(_t.errorTip, _t.addEdit.identified_operator_id, 'userFlag');
        // 校验密码
        _t.blurInputUser(_t.errorTip, _t.addEdit.identified_operator_password, 'passwordFlag');
        var location_number = _t.addEdit.station ? _t.addEdit.station : _t.addEdit.lines;
        if (_t.errorTip.typeFlag === false
          && _t.errorTip.reasonFlag === false
          && _t.errorTip.operationFlag === false
          && _t.errorTip.userFlag === false
          && _t.errorTip.passwordFlag === false) {
          let str = 'location_number=' + location_number
            + '&operator_id=' + _t.cookieMap.user_id
            + '&operation_type=' + _t.addEdit.operation_type
            + '&change_reason=' + _t.addEdit.change_reason
            + '&stock_manage_type_id=' + _t.addEdit.stock_manage_type_id
            + '&quantity=' + Number(_t.addEdit.quantity.trim())
            + '&identified_operator_id=' + _t.addEdit.identified_operator_id.trim()
            + '&identified_operator_password=' + _t.addEdit.identified_operator_password.trim();
          let Base64 = require('js-base64').Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          var params = {
            flag: '0',
            location_number: location_number, // 位置编号
            operator_id: _t.cookieMap.user_id, // 操作员id
            token: keyToken, // token
            operation_type: _t.addEdit.operation_type, // 操作类型
            change_reason: _t.addEdit.change_reason, // 操作原因
            stock_manage_type_id: _t.addEdit.stock_manage_type_id, // 车票类型
            quantity: Number(_t.addEdit.quantity.trim()), // 操作金额
            identified_operator_id: _t.addEdit.identified_operator_id.trim(), // 认证操作员id
            identified_operator_password: _t.addEdit.identified_operator_password.trim(), // 密码
            comment_info: _t.addEdit.note.trim(), // 备注
          };
          _t.$api.post('/tsGateWay/ticketStockManage/stockChangeSaveGateWay', params, function (res) {
            // 操作成功
            if (res.rtCode && res.rtCode === '10002') {
              _t.$alert(res.rtMessage, '温馨提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消'
              }).then(() => {
                _t.getData();
                _t.$store.commit('setShow', false);
                setTimeout(function () {
                  _t.resetStock();
                })
              }).catch(() => {
                _t.getData();
                _t.$store.commit('setShow', false);
                setTimeout(function () {
                  _t.resetStock();
                })
              });
            } else if (res.rtCode === '20016') {
              // 出库金额大于库存金额
              _t.$store.commit('setShow', false);
              _t.alertDialogTip(_t, res.rtMessage);
            } else if (res.rtCode) {
              _t.$store.commit('setShow', false);
              _t.alertDialogTip(_t, res.rtMessage);
            }
          });
        }
      },
      // 获取车票类型
      getTicketType() {
        var _t = this;
        if (_t.cookieMap.location_number) {
          if (_t.cookieMap.location_number !== null
            && _t.cookieMap.location_number !== 'null'
            && _t.cookieMap.user_id !== null
            && _t.cookieMap.user_id !== 'null') {
            let str = 'location_number=' + _t.cookieMap.location_number + '&operator_id=' + _t.cookieMap.user_id;
            let Base64 = require('js-base64').Base64;
            let keyToken = _t.$md5(Base64.encode(str));
            let params = {
              flag: 1,
              location_number: _t.cookieMap.location_number,
              operator_id: _t.cookieMap.user_id,
              token: keyToken,
              pageNum: _t.options.currentPage, // 当前页
              pageSize: 100, // 每页显示条数
            };
            _t.$api.post('/tsGateWay/inventoryListService/ticketTypeQueryGateWay', params, function (res) {
              if (res.rtCode && res.rtCode === '10005') {
                _t.ticketType = res.rtData === null ? [] : res.rtData;
              }
            });
          }
        }


      },
      // 获取车票库存状态字典
      getStatusData() {
        var _t = this;
        let str = 'guid=GUID000722201906191607';
        let Base64 = require('js-base64').Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        var params = {
          guid: 'GUID000722201906191607',
          token: keyToken
        };
        _t.$api.post('/tsGateWay/ticketUtility/queryDict', params, function (res) {
          // 查询成功
          if (res.rtCode && res.rtCode === '14010') {
            _t.statusList = res.rtData === null ? [] : res.rtData;
          }
        });
      },
    },
    created() {
      var _t = this;
      if (_t.getCookie('LOCATION_TYPE_ID') !== '09') {
        _t.disabledBtn.createDis = false;
      }
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
            // 本页面业务逻辑
            _t.getTicketType();
            _t.getStatusData();
            _t.getTypeAndReason();
            _t.getLinesAndStation();
          }
        });
        // 判断权限按钮
        limitBtnArr.forEach((item) => {
          // 查询按钮 权限
          if (item.MENU_ID === 'GUID00000000000000000000000000000005') {
            _t.limitBtn.queryBtn = true;
          }
          // 新增 权限
          if (item.MENU_ID === 'MENU20191030165707JsEejjCGoamUxk') {
            _t.limitBtn.addBtn = true;
          }
          // 库存操作权限
          if (item.MENU_ID === 'GUID00000000000000000000000000000006') {
            _t.limitBtn.operation = false;
          }
        });
      }
    }
  };
</script>

<style scoped>

</style>
