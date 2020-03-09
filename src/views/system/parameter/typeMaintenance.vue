<template>
  <Box>
    <div class="formBox-top paddingBottom15">
      <el-form :model="formItem" inline label-width="110px">
        <el-form-item label="票种名称：" class="marBottom7">
          <el-input clearable v-model="formItem.name" class="width200"/>
        </el-form-item>
      </el-form>
      <br>
      <el-button type="primary" v-if="limitBtn.create" @click="addRoleBtn">新增</el-button>
      <el-button type="primary" v-if="limitBtn.changeLimit" @click="changeLimit">
        同步
      </el-button>
      <div class="fr">
        <el-button type="primary" v-if="limitBtn.query" @click="getData">查询</el-button>
        <el-button type="warning" @click="resetFormItem">重置</el-button>
      </div>
    </div>
    <div class="tableWp">
      <el-table :data="tableData" stripe border ref="table">
        <el-table-column prop="STOCK_MANAGE_TYPE_ID" label="库存管理类型代码"/>
        <el-table-column prop="CARD_ISSUER_NAME" label="卡发行商名称"/>
        <el-table-column prop="CARD_TYPE_NAME" label="卡物理类型名称"/>
        <el-table-column prop="STOCK_TYPE_NAME_CN" label="票种名称"/>
        <el-table-column label="是否启用">
          <template slot-scope="scope">
            <span v-if="scope.row.USE_FLAG == 1">是</span>
            <span v-if="scope.row.USE_FLAG == 0">否</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="350" header-align="center" align="center">
          <template slot-scope="scope">
            <el-button type="primary" v-if="limitBtn.changeRole" @click="changeRoleBtn(scope.row)">修改</el-button>
            <el-button type="primary" v-if="limitBtn.detils" @click="detils(scope.row)">详情</el-button>
            <el-button type="danger" v-if="limitBtn.delete" @click="deleteRole(scope.row)">删除</el-button>
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
    <!--修改车票类型-->
    <el-dialog
      append-to-body
      :fullscreen="isScreenCreate"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="resetRole"
      :visible.sync="dialogAddVisible">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">修改车票类型</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenCreate = !isScreenCreate"></i>
      </div>
      <el-form :model="detailFormItem" ref="detailFormItem" label-width="140px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="库存管理类型代码：" class="marBottom7">
              <el-input disabled v-model="detailFormItem.STOCK_MANAGE_TYPE_ID"></el-input>
            </el-form-item>
            <el-form-item label="票卡属性：" class="marBottom7">
              <el-select v-model="detailFormItem.TICKET_CATEGORY_NAME" placeholder="请选择">
                <el-option label="无值类型" value="00">无值类型</el-option>
                <el-option label="钱包" value="01">钱包</el-option>
                <el-option label="计次" value="02">计次</el-option>
                <el-option label="定期" value="03">定期</el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="车票状态：" class="marBottom7">
              <el-select v-model="detailFormItem.TICKET_STATE_NAME" placeholder="请选择">
                <el-option label="未售" value="0">未售</el-option>
                <el-option label="已售" value="3">已售</el-option>
                <el-option label="回收" value="7">回收</el-option>
                <el-option label="黑名单锁定" value="9">黑名单锁定</el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="票务状态：" class="marBottom7">
              <el-select v-model="detailFormItem.EVALUATION_FLAG_NAME" placeholder="请选择">
                <el-option label="未初始化" value="1">未初始化</el-option>
                <el-option label="已初始化" value="2">已初始化</el-option>
                <el-option label="预赋值" value="3">预赋值</el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="是否有效：" class="marBottom7">
              <el-radio-group v-model="detailFormItem.TICKET_VALID_NAME">
                <el-radio label="9">废卡</el-radio>
                <el-radio label="10">有效卡</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="中文名称：" class="marBottom7">
              <el-input v-model="detailFormItem.STOCK_TYPE_NAME_CN"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button @click="resetRole">取消</el-button>
        <el-button type="primary" v-btn-control @click="editRole">保存</el-button>
      </div>
    </el-dialog>
    <!--新增车票类型-->
    <el-dialog
      append-to-body
      :fullscreen="isScreenCreate"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="resetRole"
      :visible.sync="dialogAddVisible1">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">新增车票类型</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenCreate = !isScreenCreate"></i>
      </div>
      <el-form :model="addFormItem" ref="detailFormItem" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="卡发行商ID：" class="star">
              <el-select v-model="addFormItem.card_issuer_id" placeholder="请选择">
                <el-option label="一卡通" value="1">一卡通</el-option>
                <el-option label="ACC" value="2">ACC</el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="卡物理类型:" class="star">
              <el-select v-model="addFormItem.card_type" placeholder="请选择">
                <el-option label="M1K" value="0">M1K</el-option>
                <el-option label="K4M" value="1">K4M</el-option>
                <el-option label="CPU" value="2">CPU</el-option>
                <el-option label="UL" value="3">UL</el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="票卡类型：" class="star ">
              <el-select v-model="addFormItem.ticket_type" placeholder="请选择">
                <el-option
                  v-for="item in ticketTypeArr"
                  :key="item.GUID"
                  :label="item.TICKET_NAME"
                  :value="item.TICKET_TYPE">{{item.TICKET_NAME}}
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="有效期：" class="star">
              <el-date-picker
                v-model="addFormItem.valid_date"
                type="date"
                placeholder="选择日期">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="票务状态：" class="star">
              <el-select v-model="addFormItem.evaluation_flag" placeholder="请选择">
                <el-option label="未初始化" value="1">未初始化</el-option>
                <el-option label="已初始化" value="2">已初始化</el-option>
                <el-option label="预赋值" value="3">预赋值</el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="车票状态：" class="star">
              <el-select v-model="addFormItem.ticket_state" placeholder="请选择">
                <el-option label="未售" value="0">未售</el-option>
                <el-option label="已售" value="3">已售</el-option>
                <el-option label="回收" value="7">回收</el-option>
                <el-option label="黑名单锁定" value="9">黑名单锁定</el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="是否有效：" class="star">
              <el-radio-group v-model="addFormItem.ticket_valid">
                <el-radio label="09">废卡</el-radio>
                <el-radio label="10">有效卡</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="票卡属性：" class="star">
              <el-select v-model="addFormItem.ticket_category" placeholder="请选择">
                <el-option label="无值类型" value="00">无值类型</el-option>
                <el-option label="钱包" value="01">钱包</el-option>
                <el-option label="计次" value="02">计次</el-option>
                <el-option label="定期" value="03">定期</el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="预赋值金额：" class="star">
              <el-input maxlength="9" oninput="value=value.replace(/[^\d]/g,'')" v-model="addFormItem.evaluation_balance"></el-input>
            </el-form-item>
            <el-form-item label="预赋值次数：" class="star">
              <el-input v-model="addFormItem.evaluation_rides"></el-input>
            </el-form-item>
            <el-form-item label="销售金额：" class="star">
              <el-input maxlength="9" oninput="value=value.replace(/[^\d]/g,'')" v-model="addFormItem.issue_amount"></el-input>
            </el-form-item>
            <el-form-item label="押金：" class="star">
              <el-input  maxlength="4" oninput="value=value.replace(/[^\d]/g,'')" v-model="addFormItem.evaluation_diposit"></el-input>
            </el-form-item>
            <el-form-item label="中文名称：" class="star">
              <el-input v-model="addFormItem.stock_type_name_cn"></el-input>
            </el-form-item>
            <el-form-item label="是否启用：" class="star">
              <el-radio-group v-model="addFormItem.use_flag">
                <el-radio label="1">是</el-radio>
                <el-radio label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button @click="resetRole">取消</el-button>
        <el-button type="primary" v-btn-control @click="addRole">保存</el-button>
      </div>
    </el-dialog>
    <!--    详情-->
    <el-dialog
      v-dialogDrag
      append-to-body
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :visible.sync="dialogDetailVisible"
      :fullscreen="isScreenDetail"
    >
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">详情</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenDetail = !isScreenDetail"></i>
      </div>
      <el-form :model="detailFormItem" ref="detailFormItem" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="票卡属性：" class="marBottom7">
              <el-input v-model="detailFormItem.TICKET_CATEGORY_NAME" disabled></el-input>
            </el-form-item>
            <el-form-item label="车票状态：" class="marBottom7">
              <el-input v-model="detailFormItem.TICKET_STATE_NAME" disabled></el-input>
            </el-form-item>
            <el-form-item label="中文名称：" class="marBottom7">
              <el-input v-model="detailFormItem.STOCK_TYPE_NAME_CN" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="票务状态：" class="marBottom7">
              <el-input v-model="detailFormItem.EVALUATION_FLAG_NAME" disabled></el-input>
            </el-form-item>
            <el-form-item label="是否有效：" class="marBottom7">
              <el-input v-model="detailFormItem.TICKET_VALID_NAME" disabled></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button type="primary" @click="resetRole">关闭</el-button>
      </div>
    </el-dialog>
    <!--    同步-->
    <el-dialog
      append-to-body
      :fullscreen="isScreenCreate"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="resetRole"
      :visible.sync="dialogAddSyn">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">同步</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenCreate = !isScreenCreate"></i>
      </div>
      <div class="text">
        <p>注:</p>
        "<span class="text_d">+</span>"<span class="text_sapn">是添加到本地库</span>
        "<span class="text_d">-</span>"<span>是从本地库删除</span>
      </div>
      <el-checkbox-group v-model="checkList">
        <el-checkbox
          class="checkBox"
          v-for="(item,index) in ticketTypeList"
          :class="item.flag==1? 'flagStyle': 'flagStyles'"
          :key="index"
          :label="item"
        >{{item.TICKET_NAME}}
        </el-checkbox>
      </el-checkbox-group>
      <div slot="footer">
        <el-button type="primary" @click="resetRole">取消</el-button>
        <el-button type="primary" v-btn-control @click="synchronous">保存</el-button>
      </div>
    </el-dialog>
  </Box>
</template>

<script>
  import Box from '../../../components/Box';

  export default {
    name: "roleMaintenance",
    components: {Box},
    data() {
      return {
        checkAll: [], // 单选框全选
        isIndeterminate: true,
        isScreenCreate: false, // 新增编辑放大缩小
        isScreenLimit: false, // 权限放大缩小
        // 表格数据
        tableData: [],
        ticketTypeArr: [], // 卡票类型数据
        // 同步选中数据
        checkList: [],
        // 同步数据
        ticketTypeList: [],
        // 角色名称
        formItem: {
          name: '', // 角色名称
          usernameList: ''// 下拉框名称
        },
        usernameList: [],//角色名称下拉数组
        // 角色分页
        options: {
          total: 0, // 总条数
          currentPage: 1, // 当前页码
          pageSize: 10, // 显示条数
        },
        // 是否放大缩小
        isScreenDetail: false,
        // 修改蒙版
        dialogAddVisible: false,
        // 新增角色蒙版
        dialogAddVisible1: false,
        // 调整权限蒙版
        dialogLimitVisible: false,
        // 详情
        dialogDetailVisible: false,
        // 同步
        dialogAddSyn: false,
        // 详情数据
        detailFormItem: {
          TICKET_CATEGORY_NAME: '', //票卡属性名称
          EVALUATION_FLAG_NAME: '', //票务状态名称
          TICKET_STATE_NAME: '',//车票状态名称
          TICKET_VALID_NAME: '', //是否有效名称
          STOCK_TYPE_NAME_CN: '',//库存管理类型中文名称
          STOCK_MANAGE_TYPE_ID: '' //库存管理类型代码
        },
        // 新增数据
        addFormItem: {
          stock_manage_type_id: "", //库存管理类型代码
          card_issuer_id: "", //卡发行商ID
          card_type: "", //卡物理类型
          ticket_type: "", // 票卡类型
          derivative_id: "", //票卡子类型
          ticket_category: "", // 票卡属性
          evaluation_balance: '', //预赋值金额
          evaluation_rides: '', //预赋值次数
          issue_amount: '', // 销售金额
          evaluation_diposit: '', // 押金
          valid_date: '', // 有效期
          evaluation_flag: "", // 票务状态
          ticket_state: "", //车票状态
          ticket_valid: "", //是否有效
          stock_type_name_cn: "", // 库存管理类型中文名称
          stock_type_name_en: "",//库存管理类型英文名称
          stock_type_name_xn: "", //库存管理类型X文名称
          use_flag: "", // 是否启用
          ticket_sort: '' //排序
        },
        // 新增/编辑角色表单
        addEdit: {
          id: '', // 角色id
          roleName: '', // 角色名称
          note: '', // 备注
        },
        isAdd: true, // 是否新增
        // 校验角色表单
        errorTip: {
          roleNameFlag: false, // 校验角色名称
          note: false // 备注
        },
        // 调整权限 树形数据
        limitData: [],
        // 调整权限 选中
        tableSelect: {
          id: ''
        },
        defaultProps: {
          children: 'CHILDREN',
          label: 'NAME'
        },
        // 调整权限 数据回显的 集合
        selectKeys: [],
        // 按钮权限
        limitBtn: {
          query: false, // 查询
          create: false, // 新增
          delete: false, // 删除
          changeRole: false, // 修改
          changeLimit: false, // 同步
          detils: false, // 详情
          changeLimitLoading: false,
        },
        // 从cookie中获取
        cookieMap: {
          location_number: this.getCookie('LOCATION_NUMBER'), // 位置编号
          user_id: this.getCookie('USER_ID'), // 操作员ID
          role: this.getCookie('USER_TYPE'), // 用户角色
        }
      }
    },
    methods: {
      // 重置查询表单
      resetFormItem() {
        var _t = this;
        _t.formItem.name = '';
        _t.getData();
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
      // 校验不能为空
      blurInput(item, val, flag) {
        item[flag] = val.trim() === '' ? true : false;
      },
      // row-key
      getRowKey(row) {
        return row.ROW_ID;
      },
      // 详情
      detils(row) {
        this.dialogDetailVisible = true;
        this.detailFormItem.TICKET_CATEGORY_NAME = row.TICKET_CATEGORY_NAME;//票卡属性名称
        this.detailFormItem.EVALUATION_FLAG_NAME = row.EVALUATION_FLAG_NAME; //票务状态名称
        this.detailFormItem.TICKET_STATE_NAME = row.TICKET_STATE_NAME;//车票状态名称
        this.detailFormItem.TICKET_VALID_NAME = row.TICKET_VALID_NAME;//是否有效名称
        this.detailFormItem.STOCK_TYPE_NAME_CN = row.STOCK_TYPE_NAME_CN;//库存管理类型中文名称
      },
      // 同步
      changeLimit() {
        var _t = this;
        _t.dialogAddSyn = true;
        var params = {};
        _t.$api.post('/tsGateWay/compareDiff', params, function (res) {
          if (res.rtCode && res.rtCode === '18018') {
            _t.ticketTypeList = res.rtData.sys.concat(res.rtData.core);
          } else if (res.rtCode) {
            _t.alertDialogTip(_t, res.rtMessage);
          }
        })
      },
      // 同步保存
      synchronous() {
        var _t = this;
        if (_t.checkList.length !== 0) {
          _t.$api.post('/tsGateWay/syncGateWay', _t.checkList, function (res) {
            if (res.rtCode && res.rtCode === '19010') {
              _t.resetRole();
              _t.alertDialogTip(_t, res.rtMessage);
            } else if (res.rtCode) {
              _t.alertDialogTip(_t, res.rtMessage);
              _t.resetRole();
            }
          })
        } else {
          _t.alertDialogTip(_t, '请选择一个选项');
        }

      },
      // 查询数据
      getData() {
        var _t = this;
        var params = {
          stock_type_name_cn: _t.formItem.name,
          pageNum: _t.options.currentPage, // 当前页
          pageSize: _t.options.pageSize, // 每页显示条数
        };
        _t.$api.post('/tsGateWay/systemManager/queryTicketStockManageType', params, function (res) {
          _t.$store.commit('setLoading', false);
          if (res.rtCode && res.rtCode === '18044') {
            _t.tableData = res.rtData === null ? [] : res.rtData;
            _t.options.total = res.totalCount ? res.totalCount : 0;
          } else if (res.rtCode) {
            _t.alertDialogTip(_t, res.rtMessage);
          }
        });
      },
      // 新增
      addRoleBtn() {
        var _t = this;
        _t.dialogAddVisible1 = true;
        _t.ticketType();
      },
      // 修改
      changeRoleBtn(row) {
        var _t = this;
        _t.isAdd = false;
        _t.dialogAddVisible = true;
        this.detailFormItem.TICKET_CATEGORY_NAME = row.TICKET_CATEGORY;//票卡属性名称
        this.detailFormItem.EVALUATION_FLAG_NAME = row.EVALUATION_FLAG; //票务状态名称
        this.detailFormItem.TICKET_STATE_NAME = row.TICKET_STATE;//车票状态名称
        this.detailFormItem.TICKET_VALID_NAME = row.TICKET_VALID;//是否有效名称
        this.detailFormItem.STOCK_TYPE_NAME_CN = row.STOCK_TYPE_NAME_CN;//库存管理类型中文名称
        this.detailFormItem.STOCK_MANAGE_TYPE_ID = row.STOCK_MANAGE_TYPE_ID//库存管理类型代码;
      },
      // 删除
      deleteRole(row) {
        var _t = this;
        var STOCK_MANAGE = row.STOCK_MANAGE_TYPE_ID;
        _t.$confirm('是否确认删除操作?', '删除角色', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let str = 'stock_manage_type_id=' + STOCK_MANAGE.toString();
          let Base64 = require('js-base64').Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          var params = {
            stock_manage_type_id: STOCK_MANAGE, // id
            token: keyToken, // token
          };
          _t.$api.post('/tsGateWay/systemManager/delTicketStockManageType', params, function (res) {
            if (res.rtCode && res.rtCode === '18046') {
              _t.$alert(res.rtMessage, '温馨提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消'
              }).then(() => {
                _t.getData();
              }).catch(() => {
                _t.getData();
              });
            } else if (res.rtCode) {
              _t.alertDialogTip(_t, res.rtMessage);
            }
          });
        }).catch(() => {
          return false;
        });
      },
      // 重置
      resetRole() {
        var _t = this;
        _t.isAdd = true;
        _t.dialogDetailVisible = false;
        _t.dialogAddVisible = false;
        _t.dialogAddVisible1 = false;
        _t.dialogAddSyn = false;
        _t.addEdit.id = ''; // id
        _t.addEdit.roleName = ''; // 名称
        _t.addEdit.note = ''; // 备注
        _t.errorTip.roleNameFlag = false;
        _t.detailFormItem.TICKET_CATEGORY_NAME = '';//票卡属性名称
        _t.detailFormItem.EVALUATION_FLAG_NAME = ''; //票务状态名称
        _t.detailFormItem.TICKET_STATE_NAME = '';//车票状态名称
        _t.detailFormItem.TICKET_VALID_NAME = '';//是否有效名称
        _t.detailFormItem.STOCK_TYPE_NAME_CN = '';//库存管理类型中文名称
        _t.checkList = [];
        _t.addFormItem.stock_manage_type_id = ""; //库存管理类型代码
        _t.addFormItem.card_issuer_id = ""; //卡发行商ID
        _t.addFormItem.card_type = ""; //卡物理类型
        _t.addFormItem.ticket_type = ""; // 票卡类型
        _t.addFormItem.derivative_id = ""; //票卡子类型
        _t.addFormItem.ticket_category = ""; // 票卡属性
        _t.addFormItem.evaluation_balance = ''; //预赋值金额
        _t.addFormItem.evaluation_rides = ''; //预赋值次数
        _t.addFormItem.issue_amount = ''; // 销售金额
        _t.addFormItem.evaluation_diposit = ''; // 押金
        _t.addFormItem.valid_date = ''; // 有效期
        _t.addFormItem.evaluation_flag = ""; // 票务状态
        _t.addFormItem.ticket_state = ""; //车票状态
        _t.addFormItem.ticket_valid = ""; //是否有效
        _t.addFormItem.stock_type_name_cn = ""; // 库存管理类型中文名称
        _t.addFormItem.stock_type_name_en = "";//库存管理类型英文名称
        _t.addFormItem.stock_type_name_xn = ""; //库存管理类型X文名称
        _t.addFormItem.use_flag = ""; // 是否启用
        _t.addFormItem.ticket_sort = ''; //排序
      },
      // 时间补零
      time(s) {
        return s < 10 ? '0' + s : s
      },
      // 新增提交
      addRole() {
        var _t = this;
        // 校验角色名称
        var user_id = _t.getCookie('USER_ID').toString();
        var data = new Date(_t.addFormItem.valid_date);
        var timeData = `${data.getFullYear()}:${_t.time(data.getMonth() + 1)}:${_t.time(data.getDate())}`;
        // 可以提交
        if (_t.addFormItem.card_issuer_id !== ''
          && _t.addFormItem.card_type !== ''
          && _t.addFormItem.ticket_type !== ''
          && _t.addFormItem.ticket_category !== ''
          && _t.addFormItem.evaluation_balance !== ''
          && _t.addFormItem.evaluation_rides !== ''
          && _t.addFormItem.issue_amount !== ''
          && _t.addFormItem.evaluation_diposit !== ''
          && _t.addFormItem.valid_date !== ''
          && _t.addFormItem.evaluation_flag !== ''
          && _t.addFormItem.ticket_state !== ''
          && _t.addFormItem.ticket_valid !== ''
          // && _t.addFormItem.stock_type_name_cn !== ''
          // && _t.addFormItem.stock_type_name_en !== ''
          && _t.addFormItem.use_flag !== ''
        // && _t.addFormItem.ticket_sort !== ''
        ) {
          let str = 'userid=' + user_id
            + '&card_issuer_id=' + _t.addFormItem.card_issuer_id.toString()
            + '&card_type=' + _t.addFormItem.card_type.toString()
            + '&ticket_type=' + _t.addFormItem.ticket_type.toString()
            + '&ticket_category=' + _t.addFormItem.ticket_category.toString()
            + '&evaluation_balance=' + _t.addFormItem.evaluation_balance.toString()
            + '&evaluation_rides=' + _t.addFormItem.evaluation_rides.toString()
            + '&issue_amount=' + _t.addFormItem.issue_amount.toString()
            + '&evaluation_diposit=' + _t.addFormItem.evaluation_diposit.toString()
            + '&valid_date=' + timeData
            + '&evaluation_flag=' + _t.addFormItem.evaluation_flag.toString()
            + '&ticket_state=' + _t.addFormItem.ticket_state.toString()
            + '&ticket_valid=' + _t.addFormItem.ticket_valid.toString()
            + '&stock_type_name_cn=' + _t.addFormItem.stock_type_name_cn.toString()
            // + '&stock_type_name_en=' + _t.addFormItem.stock_type_name_en.toString()
            + '&use_flag=' + _t.addFormItem.use_flag.toString()
          // + '&ticket_sort=' + _t.addFormItem.ticket_sort.toString();
          let Base64 = require('js-base64').Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          var params = {
            userid: user_id,
            card_issuer_id: _t.addFormItem.card_issuer_id.toString(), //卡发行商ID
            card_type: _t.addFormItem.card_type.toString(), //卡物理类型
            ticket_type: _t.addFormItem.ticket_type.toString(), // 票卡类型
            ticket_category: _t.addFormItem.ticket_category.toString(), // 票卡属性
            evaluation_balance: _t.addFormItem.evaluation_balance.toString(), //预赋值金额
            evaluation_rides: _t.addFormItem.evaluation_rides.toString(), //预赋值次数
            issue_amount: _t.addFormItem.issue_amount.toString(), // 销售金额
            evaluation_diposit: _t.addFormItem.evaluation_diposit.toString(), // 押金
            valid_date: timeData, // 有效期
            evaluation_flag: _t.addFormItem.evaluation_flag.toString(), // 票务状态
            ticket_state: _t.addFormItem.ticket_state.toString(), //车票状态
            ticket_valid: _t.addFormItem.ticket_valid.toString(), //是否有效
            stock_type_name_cn: _t.addFormItem.stock_type_name_cn.toString(), // 库存管理类型中文名称
            // stock_type_name_en: _t.addFormItem.stock_type_name_en.toString(),//库存管理类型英文名称
            // stock_type_name_xn: _t.addFormItem.stock_type_name_xn.toString(), //库存管理类型X文名称
            use_flag: _t.addFormItem.use_flag.toString(), // 是否启用
            ticket_sort: _t.addFormItem.ticket_sort.toString(), //排序
            locationNumber: _t.cookieMap.location_number.toString(),
            operatorId: _t.cookieMap.user_id.toString(),
            token: keyToken
          };
          _t.$api.post('/tsGateWay/systemManager/addTicketStockManageType', params, function (res) {
            if (res.rtCode && res.rtCode === '18043') {
              _t.$alert(res.rtMessage, '温馨提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消'
              }).then(() => {
                _t.getData();
                setTimeout(function () {
                  _t.resetRole();
                }, 100)
              }).catch(() => {
                _t.getData();
                setTimeout(function () {
                  _t.resetRole();
                }, 100)
              });
            } else if (res.rtCode) {
              _t.alertDialogTip(_t, res.rtMessage);
            }
          });
        } else {
          _t.alertDialogTip(_t, '必填项不能为空!');
        }
      },
      // 修改提交
      editRole() {
        var _t = this;
        var userid = _t.cookieMap.user_id.toString();
        // 可以提交
        if (_t.detailFormItem.STOCK_MANAGE_TYPE_ID !== '') {
          let str = 'userid=' + userid + '&stock_manage_type_id=' + _t.detailFormItem.STOCK_MANAGE_TYPE_ID.toString();
          let Base64 = require('js-base64').Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          var params = {
            userid: userid,
            ticket_state: _t.detailFormItem.TICKET_STATE_NAME.toString(), //车票状态
            ticket_category: _t.detailFormItem.TICKET_CATEGORY_NAME.toString(), // 票卡属性
            ticket_valid: _t.detailFormItem.TICKET_VALID_NAME.toString(), //是否有效
            evaluation_flag: _t.detailFormItem.EVALUATION_FLAG_NAME.toString(), // 票务状态
            stock_manage_type_id: _t.detailFormItem.STOCK_MANAGE_TYPE_ID.toString(),
            stock_type_name_cn: _t.detailFormItem.STOCK_TYPE_NAME_CN,
            token: keyToken, // token
          };
          _t.$api.post('/tsGateWay/systemManager/editTicketStockManageType', params, function (res) {
            if (res.rtCode && res.rtCode === '18045') {
              _t.$alert(res.rtMessage, '温馨提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消'
              }).then(() => {
                _t.getData();
                setTimeout(function () {
                  _t.resetRole();
                }, 100)

              }).catch(() => {
                _t.getData();
                setTimeout(function () {
                  _t.resetRole();
                }, 100)
              });
            } else if (res.rtCode) {
              _t.alertDialogTip(_t, res.rtMessage);
            }
          });
        } else {
          _t.alertDialogTip(_t, '必填项不能为空!');
        }
      },
      // 获取票卡类型
      ticketType() {
        var _t = this;
        var params = {};
        _t.$api.post('/gateway/ticket/selectTicketType', params, function (res) {
          if (res.rtCode && res.rtCode === '18018') {
            _t.ticketTypeArr = res.rtData;
          }
        });
      }
    },
    created() {
      var _t = this;
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
            _t.getData();
          }
        });
        // 判断权限按钮
        limitBtnArr.forEach((item) => {
          // 查询
          if (item.MENU_ID === "MENU20191017111704BySVsVQYgjwmjc") {
            _t.limitBtn.query = true;
          }
          // 新增
          if (item.MENU_ID === 'MENU20191017130040KuXwGvNvyLOGom') {
            _t.limitBtn.create = true;
          }
          // 删除角色
          if (item.MENU_ID === "MENU20191017130213wBdfpOmsOHsSxq") {
            _t.limitBtn.delete = true;
          }
          // 修改角色
          if (item.MENU_ID === "MENU20191017130141pvNFZvJivgvRMZ") {
            _t.limitBtn.changeRole = true;
          }
          // 同步
          if (item.MENU_ID === "MENU20191017130114yUGZApTJanOVNx") {
            _t.limitBtn.changeLimit = true;
          }
          // 详情
          if (item.MENU_ID === "MENU20191017130003QWpDamkbKfVLlt") {
            _t.limitBtn.detils = true;
          }
        });
      }
    }
  }
</script>

<style scoped="scoped">

  .flagStyle:after {
    content: '+';
    color: red;
    position: absolute;

    font-size: 20px;
  }

  .text {
    margin-bottom: 10px;
    color: #cccccc;
  }

  .text_d {
    color: red;
  }

  .text_sapn {
    margin-right: 10px;
  }

  .flagStyles:after {
    content: '-';
    color: red;
    font-size: 20px;
    position: absolute;
  }

  .treeBox {
    max-height: 500px;
    overflow-y: auto;
  }

  .el-form-item__label {
    background: red !important;
  }
</style>
