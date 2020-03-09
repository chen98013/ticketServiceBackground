<template>
  <Box>
    <div class="formBox-top">
      <el-form inline ref="form" :model="formItem" label-width="120px">
        <el-form-item label="线路:" class="marBottom7">
          <el-select
            class="width200"
            :disabled="disabledBtn.createDis"
            @change="changeLines(formItem.lines)"
            v-model="formItem.lines">
            <el-option
              v-for="(item,index) in linesList"
              :key="index"
              :label="item.LINE_LOCATION_NAME"
              :value="item.LINE_LOCATION_NUMBER.toString()"/>
          </el-select>
        </el-form-item>
        <el-form-item label="车站:" class="marBottom7">
          <el-select :disabled="disabledBtn.createDis" clearable class="width200" v-model="formItem.station">
            <el-option
              v-for="(item,index) in stationList"
              :key="index"
              :label="item.STATION_LOCATION_NAME"
              :value="item.LOCATION_NUMBER.toString()"/>
          </el-select>
        </el-form-item>
        <el-form-item label="上交单号:" class="marBottom7">
          <el-input clearable class="width200" v-model="formItem.orderNum" placeholder="请输入上交单号"/>
        </el-form-item>
        <el-form-item label="单据状态:" class="marBottom7">
          <el-select class="width200" clearable v-model="formItem.status">
            <el-option
              v-for="item in statusList"
              :key="item.VALUE"
              :label="item.NAME"
              :value="item.VALUE"/>
          </el-select>
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
          <el-button v-if="limitBtn.queryBtn" type="primary" @click="getData">查询</el-button>
          <el-button type="warning" @click="resetFormItem">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="tableWp">
      <div class="marBottom10">
        <el-button
          v-if="limitBtn.create"
          type="primary"
          @click="createBtn">创建上交单
        </el-button>
        <el-button
          v-if="limitBtn.undo"
          :disabled="disabledBtn.undo"
          type="primary"
          @click="undoBtn">撤销
        </el-button>
        <el-button
          v-if="limitBtn.accept"
          :disabled="disabledBtn.accept"
          type="primary"
          @click="acceptBtn">接收
        </el-button>
        <el-button
          v-if="limitBtn.refuse"
          :disabled="disabledBtn.refuse"
          type="primary"
          @click="refuseBtn">拒绝
        </el-button>
        <el-button
          v-if="limitBtn.ticket"
          :disabled="disabledBtn.ticket"
          type="primary"
          @click="ticketBtn">备款
        </el-button>
        <el-button
          v-if="limitBtn.distribution"
          :disabled="disabledBtn.distribution"
          type="primary"
          @click="distributionBtn">配送
        </el-button>
      </div>
      <el-table border stripe :data="tableData" @row-click="rowClick"
                :default-sort="{prop:'UPDATE_DT',order:'descending'}">
        <el-table-column label="请选择" width="70px" header-align="center" align="center">
          <template slot-scope="scope">
            <el-radio
              @change.native="changeTableBox(scope.row)"
              v-model="tableSelect.id"
              :label="scope.row.ROW_ID">&nbsp;
            </el-radio>
          </template>
        </el-table-column>
        <el-table-column prop="ORDER_ID" label="上交单号" header-align="center" align="center"/>
        <el-table-column prop="CREATE_LINE_NAME" label="线路" header-align="center" align="center"/>
        <el-table-column prop="IMPORT_LINE_NAME" label="调入位置" header-align="center" align="center"/>
        <el-table-column prop="EXPORT_STATION_NAME" label="调出位置" header-align="center" align="center"/>
        <el-table-column prop="ORDER_STATE_NAME" sortable label="上交单状态" header-align="center" align="center"/>
        <el-table-column prop="BALANCE_DATE" sortable label="运营日期" header-align="center" align="center"/>
        <el-table-column prop="UPDATE_DT" sortable label="创建时间" header-align="center" align="center"/>
        <el-table-column label="操作" header-align="center" align="center">
          <template slot-scope="scope">
            <el-button v-if="limitBtn.detail" type="primary" @click.stop="detailBtn(scope.row)">上交单详情</el-button>
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
    <!--创建上交单-->
    <el-dialog
      v-dialogDrag
      append-to-body
      :fullscreen="isScreenCreate"
      :before-close="resetData"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :visible.sync="dialogVisible">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">创建上交单</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenCreate = !isScreenCreate"></i>
      </div>
      <el-form :model="addEdit" ref="addEdit" label-width="150px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="线路：">
              <el-select v-model="addEdit.lines" disabled class="widthAll">
                <el-option
                  v-for="(item,index) in linesList"
                  :key="index"
                  :label="item.LINE_LOCATION_NAME"
                  :value="item.LINE_LOCATION_NUMBER.toString()"/>
              </el-select>
            </el-form-item>
            <el-form-item label="操作员：">
              <el-input v-model="addEdit.operator_idAndName" disabled/>
            </el-form-item>
            <el-form-item  label="创建位置：">
              <el-select v-model="addEdit.location" disabled class="widthAll">
                <el-option
                  v-for="(item,index) in linesListStation"
                  :key="index"
                  :label="item.location_name"
                  :value="item.location_number.toString()"/>
              </el-select>
            </el-form-item>
            <el-form-item  label="调出位置：">
              <el-select v-model="addEdit.outLocation" disabled class="widthAll">
                <el-option
                  v-for="(item,index) in linesListStation"
                  :key="index"
                  :label="item.location_name"
                  :value="item.location_number.toString()"/>
              </el-select>
            </el-form-item>
            <el-form-item label="调入位置：">
              <el-select v-model="addEdit.inLocation" disabled class="widthAll">
                <el-option
                  v-for="(item,index) in linesListStation"
                  :key="index"
                  :label="item.location_name"
                  :value="item.location_number.toString()"/>
              </el-select>
            </el-form-item>

            <el-form-item class="star" label="认证操作员：">
              <el-input
                maxlength="6"
                v-model="addEdit.operationUser"
                @blur="blurInputUser(addEdit.operationUser,'userFlag')"/>
              <span class="isNotNull" v-if="errorTip.userFlag">必填项不能为空</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="位置：">
              <el-select v-model="addEdit.station" disabled class="widthAll">
                <el-option
                  v-for="(item,index) in stationList"
                  :key="index"
                  :label="item.STATION_LOCATION_NAME"
                  :value="item.LOCATION_NUMBER.toString()"/>
              </el-select>
            </el-form-item>
            <el-form-item label="单据类型：">
              <el-select v-model="addEdit.type" disabled class="widthAll">
                <el-option label="上交单" value="03"/>
              </el-select>
            </el-form-item>
            <el-form-item label="操作类型：">
              <el-input v-model="addEdit.operationType" disabled/>
            </el-form-item>
            <el-form-item label="当前库存金额(元)：">
              <el-input v-model="addEdit.allMoney" disabled/>
            </el-form-item>
            <el-form-item class="star" label="上交金额(元)：">
              <el-input
                maxlength="9"
                oninput="value=value.replace(/[^\d]/g,'')"
                @blur="blurInputMoney"
                v-model="addEdit.operationMoney"/>
              <span class="isNotNull" v-if="errorTip.moneyFlag">{{errorTip.moneyTip}}</span>
            </el-form-item>
            <el-form-item class="star" label="密码：">
              <el-input
                maxlength="6"
                v-model="addEdit.operationPassword"
                @blur="blurInputUser(addEdit.operationPassword,'passwordFlag')"
                type="password"/>
              <span class="isNotNull" v-if="errorTip.passwordFlag">必填项不能为空</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注：">
          <el-input type="textarea" v-model="addEdit.note" maxlength="250" show-word-limit/>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="resetData">取消</el-button>
        <el-button type="primary" v-btn-control :disabled="disabledShow" @click="addData">确定</el-button>
      </div>
    </el-dialog>
    <!--备款-->
    <el-dialog
      v-dialogDrag
      append-to-body
      :fullscreen="isScreenMoney"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="resetMoney"
      :visible.sync="dialogMoneyVisible">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">备款</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenMoney = !isScreenMoney"></i>
      </div>
      <el-form :model="moneyFormItem" ref="moneyFormItem" label-width="160px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="当前位置：">
              <el-select v-model="moneyFormItem.location" disabled class="widthAll">
                <el-option
                  v-for="(item,index) in linesListStation"
                  :key="index"
                  :label="item.location_name"
                  :value="item.location_number.toString()"/>
              </el-select>
            </el-form-item>
            <el-form-item label="单据编号：">
              <el-input v-model="moneyFormItem.orderNum" disabled/>
            </el-form-item>
            <el-form-item class="star" label="认证操作员id：">
              <el-input
                maxlength="6"
                v-model="moneyFormItem.operatorUser"
                @blur="ruleMoneyInput(moneyFormItem.operatorUser,'userFlag')"/>
              <span class="isNotNull" v-if="moneyFormItem.userFlag">必填项不能为空</span>
            </el-form-item>
            <el-form-item label="当前库存金额(元)：">
              <el-input disabled v-model="moneyFormItem.allMoney"/>
            </el-form-item>
            <el-form-item class="star" label="实际备款金额(元)：">
              <el-input
                v-model="moneyFormItem.money"
                @blur="ruleMoney"/>
              <span class="isNotNull" v-if="moneyFormItem.moneyFlag">{{moneyFormItem.moneyTip}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作人员：">
              <el-input v-model="moneyFormItem.operator_idAndName" disabled/>
            </el-form-item>
            <el-form-item label="操作前状态：">
              <el-select v-model="moneyFormItem.status" disabled class="widthAll">
                <el-option
                  v-for="item in statusList"
                  :key="item.VALUE"
                  :label="item.NAME"
                  :value="item.VALUE"/>
              </el-select>
            </el-form-item>
            <el-form-item class="star" label="密码：">
              <el-input
                maxlength="6"
                v-model="moneyFormItem.operatorPassword"
                @blur="ruleMoneyInput(moneyFormItem.operatorPassword,'passwordFlag')"
                type="password"/>
              <span class="isNotNull" v-if="moneyFormItem.passwordFlag">必填项不能为空</span>
            </el-form-item>
            <el-form-item label="配发金额(元)：">
              <el-input disabled v-model="moneyFormItem.sendMoney"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button @click="resetMoney">取消</el-button>
        <el-button type="primary" v-btn-control @click="addMoney">确定</el-button>
      </div>
    </el-dialog>
    <!--配送-->
    <el-dialog
      v-dialogDrag
      append-to-body
      :fullscreen="isScreenSend"
      :before-close="resetSendData"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :visible.sync="dialogSendVisible">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">配送</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenSend = !isScreenSend"></i>
      </div>
      <el-form :model="sendFormItem" ref="sendFormItem" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="当前位置：">
              <el-select v-model="sendFormItem.location" disabled class="widthAll">
                <el-option
                  v-for="(item,index) in linesListStation"
                  :key="index"
                  :label="item.location_name"
                  :value="item.location_number.toString()"/>
              </el-select>
            </el-form-item>
            <el-form-item label="单据编号：">
              <el-input v-model="sendFormItem.orderNum" disabled/>
            </el-form-item>
            <el-form-item class="star" label="认证操作员id：">
              <el-input
                maxlength="6"
                v-model="sendFormItem.operatorUser"
                @blur="ruleSend(sendFormItem.operatorUser,'userFlag')"/>
              <span class="isNotNull" v-if="sendFormItem.userFlag">必填项不能为空</span>
            </el-form-item>
            <el-form-item class="star" label="配送员id：">
              <el-input
                maxlength="6"
                v-model="sendFormItem.sendUser"
                @blur="ruleSend(sendFormItem.sendUser,'sendUserFlag')"/>
              <span class="isNotNull" v-if="sendFormItem.sendUserFlag">必填项不能为空</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作人员：">
              <el-input v-model="sendFormItem.operator_idAndName" disabled/>
            </el-form-item>
            <el-form-item label="操作前状态：">
              <el-select v-model="sendFormItem.status" disabled class="widthAll">
                <el-option
                  v-for="item in statusList"
                  :key="item.VALUE"
                  :label="item.NAME"
                  :value="item.VALUE"/>
              </el-select>
            </el-form-item>
            <el-form-item class="star" label="密码：">
              <el-input
                maxlength="6"
                v-model="sendFormItem.operatorPassword"
                @blur="ruleSend(sendFormItem.operatorPassword,'passwordFlag')"
                type="password"/>
              <span class="isNotNull" v-if="sendFormItem.passwordFlag">必填项不能为空</span>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button @click="resetSendData">取消</el-button>
        <el-button type="primary" v-btn-control @click="sendData">确定</el-button>
      </div>
    </el-dialog>
    <!--详情蒙版-->
    <el-dialog
      v-dialogDrag
      append-to-body
      :fullscreen="isScreenDetail"
      :before-close="resetDetail"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :visible.sync="dialogDetailVisible">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">上交单详情</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenDetail = !isScreenDetail"></i>
      </div>
      <el-form :model="detailFormItem" ref="detailFormItem" label-width="140px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="线路名称：">
              <el-input v-model="detailFormItem.linesName" disabled/>
            </el-form-item>
            <el-form-item label="单据创建人：">
              <el-input v-model="detailFormItem.createName" disabled/>
            </el-form-item>
            <el-form-item label="单据类型：">
              <el-input v-model="detailFormItem.orderType === '03' ? '上交单' : ''" disabled/>
            </el-form-item>
            <el-form-item label="调入位置：">
              <el-input v-model="detailFormItem.inLocation" disabled/>
            </el-form-item>
            <el-form-item label="操作原因：">
              <el-input v-model="detailFormItem.reason" disabled/>
            </el-form-item>
            <el-form-item label="创建日期：">
              <el-input v-model="detailFormItem.createTime" disabled/>
            </el-form-item>
            <el-form-item label="计划操作金额(元)：">
              <el-input v-model="detailFormItem.quantityRequest" disabled/>
            </el-form-item>
            <el-form-item label="配送员Id：">
              <el-input v-model="detailFormItem.DELIVERY_OPERATOR_ID" disabled/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="车站名称：">
              <el-input v-model="detailFormItem.station" disabled/>
            </el-form-item>
            <el-form-item label="单据编号：">
              <el-input v-model="detailFormItem.orderNum" disabled/>
            </el-form-item>
            <el-form-item label="创建位置：">
              <el-input v-model="detailFormItem.createLocation" disabled/>
            </el-form-item>
            <el-form-item label="调出位置：">
              <el-input v-model="detailFormItem.outLocation" disabled/>
            </el-form-item>
            <el-form-item label="认证操作员：">
              <el-input v-model="detailFormItem.userName" disabled/>
            </el-form-item>
            <el-form-item label="运营日期：">
              <el-input v-model="detailFormItem.balanceDate" disabled/>
            </el-form-item>
            <el-form-item label="实际操作金额(元)：">
              <el-input v-model="detailFormItem.quantityActual" disabled/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注：">
          <el-input type="textarea" v-model="detailFormItem.commitInfo" disabled/>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button type="primary" @click="resetDetail">关闭</el-button>
      </div>
    </el-dialog>
  </Box>
</template>
<script>
  import Box from '../../../components/Box';
  import {dateFilter} from "../../../assets/js/filters";

  export default {
    name: "spareUpper",
    components: {Box},
    data() {
      return {
        disabledShow: false,
        isScreenCreate: false, // 创建上交单放大缩小
        isScreenSend: false, // 配送放大缩小
        isScreenMoney: false, // 备款放大缩小
        isScreenDetail: false, // 详情放大缩小
        // 查询表单
        formItem: {
          lines: '', // 线路
          station: '', // 车站
          orderNum: '', // 上交单号
          status: '', // 状态
          dateTime: [], // 创建时间
        },
        // 表格数据
        tableData: [],
        // 分页
        options: {
          total: 0, // 总条数
          currentPage: 1, // 当前页码
          pageSize: 10 // 显示条数
        },
        showBtn: false,
        // 权限
        limitBtn: {
          queryBtn: false, // 查询
          create: false, // 创建
          undo: false, // 撤销
          accept: false, // 接收
          refuse: false, // 拒绝
          ticket: false, // 备票
          distribution: false, // 配送
          detail: false, // 详情
        },
        linesListArr: [], // 调出位置
        // 启用禁用按钮
        disabledBtn: {
          create: true, // 创建
          undo: true, // 撤销
          accept: true, // 接收
          refuse: true, // 拒绝
          ticket: true, // 备票
          distribution: true, // 配送
          createDis: true, // 线路
        },
        // 单据状态
        statusList: [],
        // 线路集合
        linesList: [],
        // 车站集合
        stationList: [],
        // 创建蒙版
        dialogVisible: false,
        // 备款蒙版
        dialogMoneyVisible: false,
        // 配送蒙版
        dialogSendVisible: false,
        // 详情蒙版
        dialogDetailVisible: false,
        // 创建上交单
        addEdit: {
          lines: '', // 线路
          station: '', // 车站
          location_number: '', // 位置id
          operator_id: '', // 操作员id
          operator_idAndName: '', // 操作员id及姓名
          orderNum: '', // 配发单号
          type: '03', // 单据类型 01:配发 02:回收 03:上交
          location: '', // 创建位置
          inLocation: '', // 调入位置
          outLocation: '',// 调出位置
          operationUser: '', // 认证操作员
          operationPassword: '', // 密码
          operationType: '备用金上交', // 操作类型
          allMoney: '0', // 当前库存金额
          operationMoney: '', // 配发金额
          note: '', // 备注
        },
        // 调入位置
        inLineCar: '',
        // 创建表单校验
        errorTip: {
          userFlag: false, // 认证操作员
          passwordFlag: false, // 密码
          moneyFlag: false, // 调拨金额标识
          moneyTip: '', // 调拨金额提示
        },
        linesListStation:[], // 创建位置
        // 备款
        moneyFormItem: {
          location: '', // 当前位置
          operator: '', // 操作人员
          orderNum: '', // 单据编号
          status: '', // 操作前状态
          operatorUser: '', // 认证操作员
          operatorPassword: '', // 密码
          allMoney: '0', // 库存金额
          sendMoney: '0', // 配发金额
          money: '', // 操作金额
          userFlag: false, // 认证操作员id
          passwordFlag: false, // 密码
          moneyFlag: false, // 操作金额
          moneyTip: '', // 操作金额提示
        },
        // 配送
        sendFormItem: {
          location: '', // 当前位置
          operator_id: '', // 操作员id
          operator_idAndName: '', // 操作人员id及姓名
          orderNum: '', // 单据编号
          status: '', // 操作前状态
          operatorUser: '', // 认证操作员
          operatorPassword: '', // 密码
          sendUser: '', // 配送员id
          userFlag: false, // 认证操作员标识
          passwordFlag: false, // 密码标识
          sendUserFlag: false, // 配送员校验
        },
        // 详情
        detailFormItem: {
          linesName: '', // 线路名称
          station: '', // 车站名称
          orderNum: '', // 单据编号
          orderType: '', // 单据类型
          inLocation: '', // 调入位置
          reason: '', // 操作原因
          createTime: '', // 创建日期
          quantityRequest: '', // 计划金额
          commitInfo: '', // 备注
          createName: '', // 创建人
          createLocation: '', // 创建位置
          outLocation: '', // 调出位置
          userName: '', // 认证操作员
          balanceDate: '', // 运营日期
          quantityActual: '', // 实际操作金额
          DELIVERY_OPERATOR_ID: '', // 配送员Id
        },
        prententNode: '', // 父级节点
        prententNodeArr: [], // 父级数组
        // 表格选中数据集合
        tableSelect: {
          id: '', // id
          order_id: '',// 单据编号
          order_status_before: '', // 单据操作前状态
        }
      }
    },
    methods: {
      // 重置查询表单
      resetFormItem() {
        var _t = this;
        _t.formItem.orderNum = '';// 上交单号
        _t.formItem.status = '';// 状态
        _t.formItem.dateTime = ''; // 创建时间
        _t.getData()
      },
      // 点击行
      rowClick(row) {
        var _t = this;
        _t.tableSelect.id = row.ROW_ID;
        _t.changeTableBox(row);
      },
      // 改变表格选中状态
      changeTableBox(row) {
        var _t = this;
        _t.tableSelect.order_id = row.ORDER_ID ? row.ORDER_ID : ''; // 单据编号
        _t.tableSelect.order_status_before = row.ORDER_STATE ? row.ORDER_STATE : ''; // 操作前的状态
        // 01:已申请；02:已确认；03:已关闭；04:待配送；05:配送中；06:已完成；07:已拒绝
        var roleName = _t.getCookie('USER_TYPE');
        var location_number = _t.getCookie('LOCATION_NUMBER');
        if (roleName !== null && roleName !== 'null' && location_number !== null && location_number !== 'null') {
          switch (row.ORDER_STATE) {
            case '01': // 已申请(MLC接收和拒绝 SC自身撤销)
              if (row.IMPORT_LINE_LOCATION_NUMBER.toString() == location_number) {
                _t.disabledBtn.undo = true; // 撤销
                _t.disabledBtn.accept = false; // 接收
                _t.disabledBtn.refuse = false; // 拒绝
                _t.disabledBtn.ticket = true; // 备票
                _t.disabledBtn.distribution = true; // 配送
              } else {
                _t.disabledBtn.undo = false; // 撤销
                _t.disabledBtn.accept = true; // 接收
                _t.disabledBtn.refuse = true; // 拒绝
                _t.disabledBtn.ticket = true; // 备票
                _t.disabledBtn.distribution = true; // 配送
              }
              break;
            case '02': // 已确认(SC备票)
              if (row.EXPORT_STATION_LOCATION_NUMBER.toString() == location_number) {
                _t.disabledBtn.undo = true; // 撤销
                _t.disabledBtn.accept = true; // 接收
                _t.disabledBtn.refuse = true; // 拒绝
                _t.disabledBtn.ticket = false; // 备票
                _t.disabledBtn.distribution = true; // 配送
              } else {
                _t.disabledBtn.undo = true; // 撤销
                _t.disabledBtn.accept = true; // 接收
                _t.disabledBtn.refuse = true; // 拒绝
                _t.disabledBtn.ticket = true; // 备票
                _t.disabledBtn.distribution = true; // 配送
              }
              break;
            case '03': // 已关闭(无)
              _t.disabledBtn.undo = true; // 撤销
              _t.disabledBtn.accept = true; // 接收
              _t.disabledBtn.refuse = true; // 拒绝
              _t.disabledBtn.ticket = true; // 备票
              _t.disabledBtn.distribution = true; // 配送
              break;
            case '04': // 待配送(SC配送)
              if (row.EXPORT_STATION_LOCATION_NUMBER.toString() == location_number) {
                _t.disabledBtn.undo = true; // 撤销
                _t.disabledBtn.accept = true; // 接收
                _t.disabledBtn.refuse = true; // 拒绝
                _t.disabledBtn.ticket = true; // 备票
                _t.disabledBtn.distribution = false; // 配送
              } else {
                _t.disabledBtn.undo = true; // 撤销
                _t.disabledBtn.accept = true; // 接收
                _t.disabledBtn.refuse = true; // 拒绝
                _t.disabledBtn.ticket = true; // 备票
                _t.disabledBtn.distribution = true; // 配送
              }
              break;
            case '05': // 配送中(MLC拒绝和接收)
              if (row.IMPORT_LINE_LOCATION_NUMBER.toString() == location_number) {
                _t.disabledBtn.undo = true; // 撤销
                _t.disabledBtn.accept = false; // 接收
                _t.disabledBtn.refuse = false; // 拒绝
                _t.disabledBtn.ticket = true; // 备票
                _t.disabledBtn.distribution = true; // 配送
              } else {
                _t.disabledBtn.undo = true; // 撤销
                _t.disabledBtn.accept = true; // 接收
                _t.disabledBtn.refuse = true; // 拒绝
                _t.disabledBtn.ticket = true; // 备票
                _t.disabledBtn.distribution = true; // 配送
              }
              break;
            case '06': // 已完成(无)
              _t.disabledBtn.undo = true; // 撤销
              _t.disabledBtn.accept = true; // 接收
              _t.disabledBtn.refuse = true; // 拒绝
              _t.disabledBtn.ticket = true; // 备票
              _t.disabledBtn.distribution = true; // 配送
              break;
            case '07': // 已拒绝(SC拒绝和接收)
              if (row.EXPORT_STATION_LOCATION_NUMBER.toString() == location_number) {
                _t.disabledBtn.undo = true; // 撤销
                _t.disabledBtn.accept = false; // 接收
                _t.disabledBtn.refuse = false; // 拒绝
                _t.disabledBtn.ticket = true; // 备票
                _t.disabledBtn.distribution = true; // 配送
              } else {
                _t.disabledBtn.undo = true; // 撤销
                _t.disabledBtn.accept = true; // 接收
                _t.disabledBtn.refuse = true; // 拒绝
                _t.disabledBtn.ticket = true; // 备票
                _t.disabledBtn.distribution = true; // 配送
              }
              break;
            default:
              _t.disabledBtn.undo = true; // 撤销
              _t.disabledBtn.accept = true; // 接收
              _t.disabledBtn.refuse = true; // 拒绝
              _t.disabledBtn.ticket = true; // 备票
              _t.disabledBtn.distribution = true; // 配送
              break;
          }
        }
      },
      // 重置表格选中数据
      resetTableValue() {
        var _t = this;
        _t.tableSelect.id = ''; // 重置选中id
        _t.tableSelect.order_id = ''; // 重置选中 单据id
        _t.tableSelect.order_status_before = ''; // 重置选中 单据操作前状态
        _t.disabledBtn.undo = true; // 撤销
        _t.disabledBtn.accept = true; // 接收
        _t.disabledBtn.refuse = true; // 拒绝
        _t.disabledBtn.ticket = true; // 备票
        _t.disabledBtn.distribution = true; // 配送
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
        var role = _t.getCookie('USER_TYPE'); // 角色
        var location = _t.getCookie('LOCATION_NUMBER'); // 位置编号
        var user_id = _t.getCookie('USER_ID'); // 用户id
        var location_number = ''; // 发送请求的 位置编号
        var location_number_query = ''; // 发送请求的 位置编号
        // 车站为空
        if (_t.formItem.station === '') {
          location_number = location;
        } else {
          // 车站有值
          location_number = _t.formItem.station;
        }
        // 线路为空
        if (_t.formItem.lines === '') {
          location_number = location;
        } else {
          // 线路不为空
          if (_t.formItem.station === '') {
            // 车站为空
            location_number = _t.formItem.lines;
          } else {
            // 车站不为空
            location_number = _t.formItem.station;
            location_number_query = _t.formItem.station;
          }
        }
        if (location_number !== '' && user_id !== null && user_id !== 'null') {
          let str = 'location_number=' + location_number + '&operator_id=' + user_id;
          let Base64 = require('js-base64').Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          //  获取当天时间
          var start_dtime = _t.getCookie('TIME') + ' ' + '00:00:00';
          var end_dtime = _t.getCookie('TIME') + ' ' + '23:59:59';
          var params = {
            location_number: location_number, // 位置编码
            location_number_query: location_number_query === '' ? null : location_number_query,
            operator_id: user_id, // 操作员id
            token: keyToken, // token
            order_id: _t.formItem.orderNum.trim() === '' ? null : _t.formItem.orderNum.trim(), // 单号
            order_state: _t.formItem.status === '' ? null : _t.formItem.status,
            start_time: _t.formItem.dateTime !== null ? (_t.formItem.dateTime[0] !== undefined ? dateFilter(_t.formItem.dateTime[0].getTime()) : start_dtime) : start_dtime, // 开始时间
            end_time: _t.formItem.dateTime !== null ? (_t.formItem.dateTime[1] !== undefined ? dateFilter(_t.formItem.dateTime[1].getTime()) : end_dtime) : end_dtime, // 结束时间
            order_type: '03', // 01: 配发 02:回收 03:上交
            pageNum: _t.options.currentPage, // 当前页
            pageSize: _t.options.pageSize, // 每页显示条数
          };
          _t.$api.post('/tsGateWay/readyMoney/transferOrderQueryGateWay', params, function (res) {
            _t.$store.commit('setLoading', false);
            if (res.rtCode && res.rtCode === '11104') {
              // 请求成功
              _t.tableData = res.rtData === null ? [] : res.rtData;
              _t.options.total = res.totalCount ? res.totalCount : 0;
              _t.tableSelect.id = '';
              _t.tableSelect.order_id = '';
              _t.tableSelect.order_status_before = '';
            } else if (res.rtCode) {
              _t.alertDialogTip(_t, res.rtMessage);
            }
            // 重置全局操作按钮
            _t.resetTableValue();
          });
        }
      },
      // 查询线路及车站
      getLinesAndStation() {
        var _t = this;
        var params = {};
        _t.$api.post('/tsGateWay/ticketUtility/locationCascadeQuery', params, function (res) {
          // 查到线路信息
          if (res.rtCode && res.rtCode === '14007') {
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
                     _t.inLineCar = lts.LINE_LOCATION_NUMBER.toString();
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
        if (val !== '') {
          _t.linesList.forEach((item) => {
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
              _t.formItem.station = '';
            }
          });
        } else {
          // 选中线路为空
          _t.stationList = [];
          _t.formItem.station = '';
        }
      },
      // 获取盘点单状态字典
      getStatusData() {
        var _t = this;
        let str = 'guid=GUID000722201906191619';
        let Base64 = require('js-base64').Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        var params = {
          guid: 'GUID000722201906191619',
          token: keyToken
        };
        _t.$api.post('/tsGateWay/ticketUtility/queryDict', params, function (res) {
          // 查询成功
          if (res.rtCode && res.rtCode === '14010') {
            _t.statusList = res.rtData === null ? [] : res.rtData;
          }
        });
      },
      // 失去焦点校验操作金额
      blurInputMoney() {
        var _t = this;
        // 校验为空
        if (_t.addEdit.operationMoney.trim() === '') {
          _t.errorTip.moneyFlag = true;
          _t.disabledShow = false;
          _t.errorTip.moneyTip = '必填项不能为空';
        } else {
          // 不为空 校验格式
          var reg = _t.$config.isMoneyNumber();
          if (reg.test(_t.addEdit.operationMoney.trim()) === false) {
            _t.disabledShow = false;
            _t.errorTip.moneyFlag = true;
            _t.errorTip.moneyTip = '格式不正确';
          } else {
            // 格式正确 校验不能大于库存
            if (_t.addEdit.operationMoney.trim() * 1 > _t.addEdit.allMoney * 1) {
              _t.disabledShow = false;
              _t.errorTip.moneyFlag = true;
              _t.errorTip.moneyTip = '调拨金额不能大于库存金额';
            } else {
              _t.errorTip.moneyFlag = false;
              _t.errorTip.moneyTip = '';
            }
          }
        }
      },
      // 认证员校验
      blurInputUser(val, flag) {
        var _t = this;
        _t.errorTip[flag] = val.trim() === '' ? true : false;
      },
      // 创建上交提交
      addData() {
        var _t = this;
        _t.disabledShow = true;
        // 校验认证操作员
        if (_t.addEdit.operationUser.trim() === '') {
          _t.disabledShow = false;
          _t.errorTip.userFlag = true;
        } else {
          _t.errorTip.userFlag = false;
        }
        // 校验密码
        if (_t.addEdit.operationPassword.trim() === '') {
          _t.disabledShow = false;
          _t.errorTip.passwordFlag = true;
        } else {
          _t.errorTip.passwordFlag = false;
        }
        // setTimeout(function () {
        //   _t.showBtn = false;
        // },2000);
        // 校验操作金额
        _t.blurInputMoney();
        // 可以提交
        if (_t.errorTip.userFlag === false
          && _t.errorTip.passwordFlag === false
          && _t.errorTip.moneyFlag === false) {
          let str = 'location_number=' + _t.addEdit.location_number
            + '&operator_id=' + _t.addEdit.operator_id
            + '&order_type=' + _t.addEdit.type
            + '&create_location_number=' + _t.addEdit.location
            + '&import_location_number=' + _t.addEdit.inLocation
            + '&export_location_number=' + _t.addEdit.outLocation
            + '&check_operator_id=' + _t.addEdit.operationUser.trim()
            + '&check_operator_password=' + _t.addEdit.operationPassword.trim()
            + '&operate_amount=' + _t.addEdit.operationMoney.trim();
          let Base64 = require('js-base64').Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          var params = {
            location_number: _t.addEdit.location_number,
            operator_id: _t.addEdit.operator_id,
            order_type: _t.addEdit.type,
            create_location_number: _t.addEdit.location,
            import_location_number: _t.addEdit.inLocation,
            export_location_number: _t.addEdit.outLocation,
            check_operator_id: _t.addEdit.operationUser.trim(),
            check_operator_password: _t.addEdit.operationPassword.trim(),
            operate_amount: _t.addEdit.operationMoney.trim(),
            token: keyToken,
            reason: '1', // 出库
            comment_info: _t.addEdit.note.trim(),
            stock_type: '01', // 现金金库存类型
            money_state: '01' // 现金状态
          };
          _t.$api.post('/tsGateWay/readyMoney/transferOrderCreateGateWay', params, function (res) {
            if (res.rtCode && res.rtCode === '11105') {
              _t.$alert(res.rtMessage, '温馨提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消'
              }).then(() => {
                _t.disabledShow = false;
                _t.getData();
                _t.resetTableValue();
                _t.resetData();
              }).catch(() => {
                _t.disabledShow = false;
                _t.getData();
                _t.resetTableValue();
                _t.resetData();
              });
            } else if (res.rtCode) {
              _t.disabledShow = false;
              _t.alertDialogTip(_t, res.rtMessage);
            }
          });
        }
      },
      // 创建上交单
      createBtn() {
        var _t = this;
        _t.dialogVisible = true;
        var location_number = _t.getCookie('LOCATION_NUMBER');
        var user_id = _t.getCookie('USER_ID');
        var user_name = _t.getCookie('USER_NAME');
        var roleName = _t.getCookie("USER_TYPE");
        if (location_number !== null && location_number !== 'null' && user_id !== null && user_id !== 'null') {
          _t.addEdit.operator_id = user_id; // 操作员id
          _t.addEdit.operator_idAndName = user_name == null ? '' + user_id : user_name + '-' + user_id; // 操作员
          _t.addEdit.location_number = location_number; // 位置编码

            if(_t.linesList.length > 1) {
              _t.addEdit.station = ''; // 车站
              _t.addEdit.lines = location_number; // 线路
              _t.addEdit.inLocation = location_number; // 调入位置
            }else if (_t.linesList.length == 1)  {
              _t.addEdit.station = location_number; // 车站
              _t.addEdit.lines = _t.formItem.lines; // 线路
              _t.addEdit.inLocation = _t.inLineCar; // 调入位置
            }
          _t.addEdit.location = location_number; // 创建位置
          _t.addEdit.outLocation = location_number; // 调出位置
          // 线路 调入位置
          _t.getDetailData(location_number, user_id, true); // 创建上交单
        }
      },
      // 重置创建表单
      resetData() {
        var _t = this;
        _t.dialogVisible = false;
        _t.addEdit.lines = ''; // 线路
        _t.addEdit.station = ''; // 车站
        _t.addEdit.location_number = ''; // 位置id
        _t.addEdit.operator_id = ''; // 操作员id
        _t.addEdit.operator_idAndName = ''; // 操作员id及姓名
        _t.addEdit.orderNum = ''; // 配发单号
        _t.addEdit.location = ''; // 创建位置
        _t.addEdit.inLocation = ''; // 调入位置
        _t.addEdit.outLocation = '';// 调出位置
        _t.addEdit.operationUser = ''; // 认证操作员
        _t.addEdit.operationPassword = ''; // 密码
        _t.addEdit.allMoney = '0'; // 当前库存金额
        _t.addEdit.operationMoney = ''; // 配发金额
        _t.addEdit.note = ''; // 备注
        _t.errorTip.userFlag = false; // 认证操作员
        _t.errorTip.passwordFlag = false; // 密码
        _t.errorTip.moneyFlag = false; // 调拨金额标识
        _t.errorTip.moneyTip = ''; // 调拨金额提示
      },
      // 获取库存金额
      getDetailData(location_number, userId, flag) {
        var _t = this;
        let str = 'location_number=' + location_number
          + '&operator_id=' + userId
          + '&stock_type=' + '01';
        // + '&money_state=' + '01';
        let Base64 = require('js-base64').Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        var params = {
          location_number: location_number, // 车站位置
          location_number_query: location_number, // 查线路本身
          operator_id: userId, // 操作员id
          stock_type: "01", // 01 备用金
          money_state: "01", // 01 余额
          token: keyToken, // token
          pageNum: 1, // 当前页
          pageSize: 10, // 每页显示条数
        };
        _t.$api.post('/tsGateWay/readyMoney/readyMoneyStockQueryGateWay', params, function (res) {

          if (res.rtCode && res.rtCode === '11101') {
            var allMoney = 0; // 当前库存金额
            if (res.rtData && res.rtData !== null && res.rtData.length !== 0) {
              allMoney = res.rtData[0].MONEY_AMOUNT_YUAN ? res.rtData[0].MONEY_AMOUNT_YUAN : 0;
            } else {
              allMoney = 0;
            }
            if (flag) {
              // 创建配发单
              _t.addEdit.allMoney = allMoney;
            } else {
              // 备款
              _t.moneyFormItem.allMoney = allMoney;
            }
          } else if (res.rtCode) {
            _t.alertDialogTip(_t, res.rtMessage);
          }
        });
      },
      // 撤销
      undoBtn() {
        var _t = this;
        _t.$confirm('是否确认撤销', '温馨提示', {
          confirmButtonText: '是',
          cancelButtonText: '否',
          type: 'warning'
        }).then(() => {
          // 是
          var location_number = _t.getCookie('LOCATION_NUMBER');
          var user_id = _t.getCookie('USER_ID');
          if (_t.tableSelect.order_id !== ''
            && _t.tableSelect.order_status_before !== ''
            && location_number !== null
            && location_number !== 'null'
            && user_id !== null
            && user_id !== 'null') {
            let str = 'location_number=' + location_number
              + '&operator_id=' + user_id
              + '&order_id=' + _t.tableSelect.order_id
              + '&order_state_before=' + _t.tableSelect.order_status_before;
            let Base64 = require('js-base64').Base64;
            let keyToken = _t.$md5(Base64.encode(str));
            var params = {
              location_number: location_number, // 位置编码
              operator_id: user_id, // 操作员id
              order_id: _t.tableSelect.order_id, // 单据编号
              order_state_before: _t.tableSelect.order_status_before, // 操作前状态
              token: keyToken, // token
            };
            _t.$api.post('/tsGateWay/readyMoney/transferOrderCancelGateWay', params, function (res) {
              if (res.rtCode && res.rtCode === '11106') {
                _t.$alert(res.rtMessage, '温馨提示', {
                  confirmButtonText: '确定'
                }).then(() => {
                  _t.getData();
                  _t.resetTableValue();
                }).catch(() => {
                  _t.getData();
                  _t.resetTableValue();
                });
              } else if (res.rtCode) {
                _t.$alert(res.rtMessage, '温馨提示', {
                  confirmButtonText: '确定'
                }).then(() => {
                  _t.resetTableValue();
                }).catch(() => {
                  _t.resetTableValue();
                });
              }
            });
          }
        }).catch(() => {
          // 否
          return false;
        });
      },
      // 接收
      acceptBtn() {
        var _t = this;
        _t.$confirm('是否确认接收', '温馨提示', {
          confirmButtonText: '是',
          cancelButtonText: '否',
          type: 'warning'
        }).then(() => {
          // 是
          var location_number = _t.getCookie('LOCATION_NUMBER');
          var user_id = _t.getCookie('USER_ID');
          if (_t.tableSelect.order_id !== ''
            && _t.tableSelect.order_status_before !== ''
            && location_number !== null
            && location_number !== 'null'
            && user_id !== null
            && user_id !== 'null') {
            let str = 'location_number=' + location_number
              + '&operator_id=' + user_id
              + '&order_id=' + _t.tableSelect.order_id
              + '&order_state_before=' + _t.tableSelect.order_status_before
              + '&check_operator_id=' + user_id;
            let Base64 = require('js-base64').Base64;
            let keyToken = _t.$md5(Base64.encode(str));
            var params = {
              location_number: location_number, // 位置编码
              operator_id: user_id, // 操作员id
              order_id: _t.tableSelect.order_id, // 单据编号
              order_state_before: _t.tableSelect.order_status_before, // 操作前状态
              check_operator_id: user_id,
              token: keyToken, // token
            };
            _t.$api.post('/tsGateWay/readyMoney/transferOrderAgreeGateWay', params, function (res) {
              if (res.rtCode && res.rtCode === '11107') {
                _t.$alert(res.rtMessage, '温馨提示', {
                  confirmButtonText: '确定'
                }).then(() => {
                  _t.getData();
                  _t.resetTableValue();
                }).catch(() => {
                  _t.getData();
                  _t.resetTableValue();
                });
              } else if (res.rtCode) {
                _t.$alert(res.rtMessage, '温馨提示', {
                  confirmButtonText: '确定'
                }).then(() => {
                  _t.resetTableValue();
                }).catch(() => {
                  _t.resetTableValue();
                });
              }
            });
          }
        }).catch(() => {
          // 否
          return false;
        });
      },
      // 拒绝
      refuseBtn() {
        var _t = this;
        _t.$confirm('是否确认拒绝', '温馨提示', {
          confirmButtonText: '是',
          cancelButtonText: '否',
          type: 'warning'
        }).then(() => {
          // 是
          var location_number = _t.getCookie('LOCATION_NUMBER');
          var user_id = _t.getCookie('USER_ID');
          if (_t.tableSelect.order_id !== ''
            && _t.tableSelect.order_status_before !== ''
            && location_number !== null
            && location_number !== 'null'
            && user_id !== null
            && user_id !== 'null') {
            let str = 'location_number=' + location_number
              + '&operator_id=' + user_id
              + '&order_id=' + _t.tableSelect.order_id
              + '&order_state_before=' + _t.tableSelect.order_status_before;
            let Base64 = require('js-base64').Base64;
            let keyToken = _t.$md5(Base64.encode(str));
            var params = {
              location_number: location_number, // 位置编码
              operator_id: user_id, // 操作员id
              order_id: _t.tableSelect.order_id, // 单据编号
              order_state_before: _t.tableSelect.order_status_before, // 操作前状态
              token: keyToken, // token
            };
            _t.$api.post('/tsGateWay/readyMoney/transferOrderRefuseGateWay', params, function (res) {
              if (res.rtCode && res.rtCode === '11108') {
                _t.$alert(res.rtMessage, '温馨提示', {
                  confirmButtonText: '确定'
                }).then(() => {
                  _t.getData();
                  _t.resetTableValue();
                }).catch(() => {
                  _t.getData();
                  _t.resetTableValue();
                });
              } else if (res.rtCode) {
                _t.$alert(res.rtMessage, '温馨提示', {
                  confirmButtonText: '确定'
                }).then(() => {
                  _t.resetTableValue();
                }).catch(() => {
                  _t.resetTableValue();
                });
              }
            });
          }
        }).catch(() => {
          // 否
          return false;
        });
      },
      // 备款
      ticketBtn() {
        var _t = this;
        _t.dialogMoneyVisible = true;
        // 备款表单赋值
        var location_number = _t.getCookie('LOCATION_NUMBER');
        var user_id = _t.getCookie('USER_ID');
        var user_name = _t.getCookie('USER_NAME');
        if (location_number !== null && location_number !== 'null' && user_id !== null && user_id !== 'null') {
          _t.moneyFormItem.location = location_number; // 当前位置
          _t.moneyFormItem.operator_id = user_id; // 操作员id
          _t.moneyFormItem.operator_idAndName = user_name ? user_name + '-' + user_id : user_id; // 操作员
          _t.moneyFormItem.orderNum = _t.tableSelect.order_id; // 单据编号
          _t.moneyFormItem.status = _t.tableSelect.order_status_before; // 操作前状态
          _t.getDetailData(location_number, user_id, false); // false 备款
          _t.getSendDetail(location_number, user_id);
        }
      },
      // 获取备款详情
      getSendDetail(location_number, user_id) {
        var _t = this;
        let str = 'location_number=' + location_number + '&operator_id=' + user_id
          + '&order_id=' + _t.tableSelect.order_id;
        let Base64 = require('js-base64').Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        var params = {
          location_number: location_number,
          operator_id: user_id,
          order_id: _t.tableSelect.order_id,
          token: keyToken
        };
        _t.$api.post('/tsGateWay/readyMoney/transferOrderDetailGateWay', params, function (res) {

          if (res.rtCode && res.rtCode === '11111') {
            var sendMoney = 0; // 配发金额初始化
            if (res.rtData && res.rtData !== null) {
              sendMoney = res.rtData.QUANTITY_REQUEST ? res.rtData.QUANTITY_REQUEST : 0;
            } else {
              sendMoney = 0;
            }
            _t.moneyFormItem.sendMoney = sendMoney;
          }
        });
      },
      // 校验备款金额
      ruleMoney() {
        var _t = this;
        // 校验为空
        if (_t.moneyFormItem.money.trim() === '') {
          _t.moneyFormItem.moneyFlag = true;
          _t.moneyFormItem.moneyTip = '必填项不能为空';
        } else {
          // 不为空
          var reg = _t.$config.isMoneyNumber();
          // 校验格式
          if (reg.test(_t.moneyFormItem.money.trim()) === false) {
            _t.moneyFormItem.moneyFlag = true;
            _t.moneyFormItem.moneyTip = '格式不正确';
          } else {
            // 格式正确 实际备款不能大于库存
            if (_t.moneyFormItem.money.trim() * 1 > _t.moneyFormItem.allMoney * 1) {
              _t.moneyFormItem.moneyFlag = true;
              _t.moneyFormItem.moneyTip = '实际备款金额不能大于库存金额';
            } else {
              _t.moneyFormItem.moneyFlag = false;
              _t.moneyFormItem.moneyTip = '';
            }
          }
        }
      },
      // 校验备款输入
      ruleMoneyInput(val, flag) {
        var _t = this;
        if (val.trim() === '') {
          _t.moneyFormItem[flag] = true;
        } else {
          _t.moneyFormItem[flag] = false;
        }
      },
      // 备款提交
      addMoney() {
        var _t = this;
        // 校验认证操作员
        if (_t.moneyFormItem.operatorUser.trim() === '') {
          _t.moneyFormItem.userFlag = true;
        } else {
          _t.moneyFormItem.userFlag = false;
        }
        // 校验密码
        if (_t.moneyFormItem.operatorPassword.trim() === '') {
          _t.moneyFormItem.passwordFlag = true;
        } else {
          _t.moneyFormItem.passwordFlag = false;
        }
        // 校验实际备款金额
        _t.ruleMoney();
        // 可以提交
        if (_t.moneyFormItem.userFlag === false
          && _t.moneyFormItem.passwordFlag === false
          && _t.moneyFormItem.moneyFlag === false) {
          let str = 'location_number=' + _t.moneyFormItem.location
            + '&operator_id=' + _t.moneyFormItem.operator_id
            + '&order_id=' + _t.moneyFormItem.orderNum
            + '&order_state_before=' + _t.moneyFormItem.status
            + '&check_operator_id=' + _t.moneyFormItem.operatorUser.trim()
            + '&check_operator_password=' + _t.moneyFormItem.operatorPassword.trim()
            + '&quantity_actual=' + _t.moneyFormItem.money.trim();
          let Base64 = require('js-base64').Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          var params = {
            location_number: _t.moneyFormItem.location, // 当前位置
            operator_id: _t.moneyFormItem.operator_id, // 操作员id
            order_id: _t.moneyFormItem.orderNum, // 单据编号
            order_state_before: _t.moneyFormItem.status, // 操作前状态
            check_operator_id: _t.moneyFormItem.operatorUser.trim(),
            check_operator_password: _t.moneyFormItem.operatorPassword.trim(), // 密码
            quantity_actual: (_t.moneyFormItem.money.trim()).toString(), // 实际操作金额
            token: keyToken, // token
          };
          _t.$api.post('/tsGateWay/readyMoney/transferOrderPrepareMoneyGateWay', params, function (res) {
            if (res.rtCode && res.rtCode === '11109') {
              _t.$alert(res.rtMessage, '温馨提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消'
              }).then(() => {
                _t.getData();
                _t.resetTableValue();
                _t.resetMoney();
              }).catch(() => {
                _t.getData();
                _t.resetTableValue();
                _t.resetMoney();
              });
            } else if (res.rtCode) {
              _t.$alert(res.rtMessage, '温馨提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消'
              }).then(() => {
                _t.resetTableValue();
              }).catch(() => {
                _t.resetTableValue();
              });
            }
          });
        }
      },
      // 重置备款提交表单
      resetMoney() {
        var _t = this;
        _t.dialogMoneyVisible = false;
        _t.moneyFormItem.location = ''; // 当前位置
        _t.moneyFormItem.operator = ''; // 操作人员
        _t.moneyFormItem.orderNum = ''; // 单据编号
        _t.moneyFormItem.status = ''; // 操作前状态
        _t.moneyFormItem.operatorUser = ''; // 认证操作员
        _t.moneyFormItem.operatorPassword = ''; // 密码
        _t.moneyFormItem.money = ''; // 操作金额
        _t.moneyFormItem.userFlag = false; // 认证操作员id
        _t.moneyFormItem.passwordFlag = false; // 密码
        _t.moneyFormItem.moneyFlag = false; // 操作金额
        _t.moneyFormItem.moneyTip = ''; // 操作金额提示
      },
      // 配送
      distributionBtn() {
        var _t = this;
        _t.dialogSendVisible = true;
        // 备款表单赋值
        var location_number = _t.getCookie('LOCATION_NUMBER');
        var user_id = _t.getCookie('USER_ID');
        var user_name = _t.getCookie('USER_NAME');
        if (location_number !== null && location_number !== 'null' && user_id !== null && user_id !== 'null') {
          _t.sendFormItem.location = location_number; // 当前位置
          _t.sendFormItem.operator_id = user_id; // 操作员id
          _t.sendFormItem.operator_idAndName = user_name ? user_name + '-' + user_id : user_id; // 操作员
          _t.sendFormItem.orderNum = _t.tableSelect.order_id; // 单据编号
          _t.sendFormItem.status = _t.tableSelect.order_status_before; // 操作前状态
        }
      },
      // 校验配送表单
      ruleSend(val, flag) {
        var _t = this;
        if (val.trim() === '') {
          _t.sendFormItem[flag] = true;
        } else {
          _t.sendFormItem[flag] = false;
        }
      },
      // 配送提交
      sendData() {
        var _t = this;
        // 校验认证操作员
        _t.ruleSend(_t.sendFormItem.operatorUser, 'userFlag');
        // 校验密码
        _t.ruleSend(_t.sendFormItem.operatorPassword, 'passwordFlag');
        // 校验配送员id
        _t.ruleSend(_t.sendFormItem.sendUser, 'sendUserFlag');
        // 可以提交
        if (_t.sendFormItem.userFlag === false
          && _t.sendFormItem.passwordFlag === false
          && _t.sendFormItem.sendUserFlag === false) {
          let str = 'location_number=' + _t.sendFormItem.location
            + '&operator_id=' + _t.sendFormItem.operator_id
            + '&order_id=' + _t.sendFormItem.orderNum
            + '&check_operator_id=' + _t.sendFormItem.operatorUser.trim()
            + '&check_operator_password=' + _t.sendFormItem.operatorPassword.trim()
            + '&order_state_before=' + _t.sendFormItem.status
            + '&delivery_operator_id=' + _t.sendFormItem.sendUser.trim();
          let Base64 = require('js-base64').Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          var params = {
            location_number: _t.sendFormItem.location, // 位置
            operator_id: _t.sendFormItem.operator_id, // 操作员id
            order_id: _t.sendFormItem.orderNum, // 单据编号
            order_state_before: _t.sendFormItem.status, // 操作前状态
            check_operator_id: _t.sendFormItem.operatorUser.trim(), // 认证操作员id
            check_operator_password: _t.sendFormItem.operatorPassword.trim(), // 密码
            delivery_operator_id: _t.sendFormItem.sendUser.trim(), // 配送员id
            token: keyToken, // token
          };
          _t.$api.post('/tsGateWay/readyMoney/transferOrderSendGateWay', params, function (res) {
            if (res.rtCode && res.rtCode === '11110') {
              _t.$alert(res.rtMessage, '温馨提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消'
              }).then(() => {
                _t.getData();
                _t.resetTableValue();
                _t.resetSendData();
              }).catch(() => {
                _t.getData();
                _t.resetTableValue();
                _t.resetSendData();
              });
            } else if (res.rtCode) {
              _t.$alert(res.rtMessage, '温馨提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消'
              }).then(() => {
                _t.resetTableValue();
              }).catch(() => {
                _t.resetTableValue();
              });
            }
          });
        }
      },
      // 重置配送表单
      resetSendData() {
        var _t = this;
        _t.dialogSendVisible = false;
        _t.sendFormItem.location = ''; // 当前位置
        _t.sendFormItem.operator_id = ''; // 操作员id
        _t.sendFormItem.operator_idAndName = ''; // 操作人员id及姓名
        _t.sendFormItem.orderNum = ''; // 单据编号
        _t.sendFormItem.status = ''; // 操作前状态
        _t.sendFormItem.operatorUser = ''; // 认证操作员
        _t.sendFormItem.operatorPassword = ''; // 密码
        _t.sendFormItem.sendUser = ''; // 配送员id
        _t.sendFormItem.userFlag = false; // 认证操作员标识
        _t.sendFormItem.passwordFlag = false; // 密码标识
        _t.sendFormItem.sendUserFlag = false; // 配送员校验
      },
      // 详情
      detailBtn(row) {
        var _t = this;
        _t.dialogDetailVisible = true;
        var location_number = _t.getCookie('LOCATION_NUMBER');
        var user_id = _t.getCookie('USER_ID');
        if (location_number !== null && location_number !== 'null' && user_id !== null && user_id !== 'null') {
          let str = 'location_number=' + location_number
            + '&operator_id=' + user_id
            + '&order_id=' + row.ORDER_ID;
          let Base64 = require('js-base64').Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          var params = {
            location_number: location_number,
            operator_id: user_id,
            order_id: row.ORDER_ID,
            token: keyToken
          };
          _t.$api.post('/tsGateWay/readyMoney/transferOrderDetailGateWay', params, function (res) {
            if (res.rtCode && res.rtCode === '11111') {
              _t.detailFormItem.linesName = res.rtData.CREATE_LINE_NAME ? res.rtData.CREATE_LINE_NAME : ''; // 线路
              _t.detailFormItem.orderNum = res.rtData.ORDER_ID ? res.rtData.ORDER_ID : ''; // 单据编号
              _t.detailFormItem.orderType = res.rtData.ORDER_TYPE ? res.rtData.ORDER_TYPE : ''; // 单据类型
              _t.detailFormItem.inLocation = res.rtData.IMPORT_STATION_NAME ? res.rtData.IMPORT_STATION_NAME : ''; // 调入位置
              _t.detailFormItem.outLocation = res.rtData.EXPORT_STATION_LOCATION_NAME ? res.rtData.EXPORT_STATION_LOCATION_NAME : ''; // 调出位置
              _t.detailFormItem.commitInfo = res.rtData.COMMENT_INFO ? res.rtData.COMMENT_INFO : ''; // 备注
              _t.detailFormItem.quantityRequest = res.rtData.QUANTITY_REQUEST ? res.rtData.QUANTITY_REQUEST : ''; // 计划金额
              _t.detailFormItem.createLocation = res.rtData.CREATE_LINE_NAME ? res.rtData.CREATE_LINE_NAME : ''; // 创建位置
              _t.detailFormItem.createName = res.rtData.CREATE_OPERATOR_ID ? res.rtData.CREATE_OPERATOR_ID : ''; // 创建人
              _t.detailFormItem.reason = '备用金上交'; // 操作原因
              _t.detailFormItem.createTime = res.rtData.ORDER_TIME ? res.rtData.ORDER_TIME : ''; // 创建日期
              _t.detailFormItem.balanceDate = res.rtData.BALANCE_DATE ? res.rtData.BALANCE_DATE : ''; // 运营日期
              _t.detailFormItem.userName = res.rtData.CHECK_OPERATOR_ID ? res.rtData.CHECK_OPERATOR_ID : ''; // 认证操作员
              _t.detailFormItem.quantityActual = res.rtData.QUANTITY_ACTUAL ? res.rtData.QUANTITY_ACTUAL : ''; // 实际金额
              _t.detailFormItem.station = res.rtData.CREATE_STATION_LOCATION_NAME;  // 车站
              _t.detailFormItem.DELIVERY_OPERATOR_ID = res.rtData.DELIVERY_OPERATOR_ID  // 配送员ID
            } else if (res.rtCode) {
              _t.alertDialogTip(_t, res.rtMessage);
            }
          });
        }
      },
      // 重置详情表单
      resetDetail() {
        var _t = this;
        _t.dialogDetailVisible = false;
        _t.detailFormItem.linesName = ''; // 线路名称
        _t.detailFormItem.station = ''; // 车站名称
        _t.detailFormItem.orderNum = ''; // 单据编号
        _t.detailFormItem.orderType = ''; // 单据类型
        _t.detailFormItem.inLocation = ''; // 调入位置
        _t.detailFormItem.reason = ''; // 操作原因
        _t.detailFormItem.createTime = ''; // 创建日期
        _t.detailFormItem.quantityRequest = ''; // 计划金额
        _t.detailFormItem.commitInfo = ''; // 备注
        _t.detailFormItem.createName = ''; // 创建人
        _t.detailFormItem.createLocation = ''; // 创建位置
        _t.detailFormItem.outLocation = ''; // 调出位置
        _t.detailFormItem.userName = ''; // 认证操作员
        _t.detailFormItem.balanceDate = ''; // 运营日期
        _t.detailFormItem.quantityActual = ''; // 实际操作金额
      }
    },
    created() {
      var _t = this;
      if ( _t.getCookie('LOCATION_TYPE_ID') !== '09') {
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
            _t.getStatusData();
            _t.getLinesAndStation();
          }
        });
        // 判断权限按钮
        limitBtnArr.forEach((item) => {
          // 查询
          if (item.MENU_ID === "GUID00000000000000000000000000000063") {
            _t.limitBtn.queryBtn = true;
          }
          // 创建上交单
          if (item.MENU_ID === "GUID00000000000000000000000000000064") {
            _t.limitBtn.create = true;
            // SC角色 或者 MLC location_number 1开头的创建
          }
          // 撤销
          if (item.MENU_ID === "GUID00000000000000000000000000000065") {
            _t.limitBtn.undo = true;
          }
          // 接收
          if (item.MENU_ID === "GUID00000000000000000000000000000066") {
            _t.limitBtn.accept = true;
          }
          // 拒绝
          if (item.MENU_ID === "GUID00000000000000000000000000000067") {
            _t.limitBtn.refuse = true;
          }
          // 备票
          if (item.MENU_ID === "GUID00000000000000000000000000000068") {
            _t.limitBtn.ticket = true;
          }
          // 配送
          if (item.MENU_ID === "GUID00000000000000000000000000000069") {
            _t.limitBtn.distribution = true;
          }
          // 上交单详情
          if (item.MENU_ID === "GUID00000000000000000000000000000070") {
            _t.limitBtn.detail = true;
          }
        });
      }
    }
  }

</script>
<style scoped>
</style>
