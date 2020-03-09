<template>
  <Box>
    <div class="formBox-top">
      <!--查询表单-->
      <el-form inline ref="formItem" :model="formItem" label-width="110px">
        <el-form-item label="线路：" class="marBottom7">
          <el-select
            :disabled="disabledBtn.createDis"
            @change="changeLines(formItem.lines)"
            class="width200"
            v-model="formItem.lines">
            <el-option
              v-for="(item,index) in linesList"
              :key="index"
              :label="item.LINE_LOCATION_NAME"
              :value="item.LINE_LOCATION_NUMBER.toString()"/>
          </el-select>
        </el-form-item>
        <el-form-item label="车站：" class="marBottom7">
          <el-select  :disabled="disabledBtn.createDis" clearable v-model="formItem.station" class="width200">
            <el-option
              v-for="(item,index) in stationList"
              :key="index"
              :label="item.STATION_LOCATION_NAME"
              :value="item.LOCATION_NUMBER.toString()"/>
          </el-select>
        </el-form-item>
        <el-form-item label="现金状态：" class="marBottom7">
          <el-select
            clearable
            v-model="formItem.money_state"
            class="width200">
            <el-option
              v-for="(item,index) in moneyList"
              :key="index"
              :label="item.NAME"
              :value="item.VALUE"/>
          </el-select>
        </el-form-item>
        <el-form-item label="库存状态：" class="marBottom7">
          <el-select
            v-model="formItem.status"
            class="width200"
            clearable>
            <el-option
              v-for="(item,index) in statusList"
              :key="index"
              :label="item.NAME"
              :value="item.VALUE"/>
          </el-select>
        </el-form-item>
        <br>
        <el-form-item class="fr marBottom7">
          <el-button v-if="limitBtn.queryBtn" type="primary" @click="getData">查询</el-button>
          <el-button type="warning" @click="resetFormItem">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="tableWp">
      <!--查询表格-->
      <el-table :data="tableData" border stripe :default-sort="{prop:'STOCK_STATE',order:'descending'}">
        <el-table-column prop="LINE_NAME" label="线路" header-align="center" align="center"/>
        <el-table-column prop="STATION_NAME" label="车站" header-align="center" align="center"/>
        <el-table-column prop="STOCK_STATE_NAME" sortable label="库存状态" header-align="center" align="center"/>
        <el-table-column prop="MONEY_STATE_NAME" sortable label="现金状态" header-align="center" align="center"/>
        <el-table-column prop="MONEY_AMOUNT_YUAN" label="库存金额(元)" header-align="center" align="center"/>
        <el-table-column label="操作" header-align="center" align="center">
          <template slot-scope="scope">
            <el-button v-if="scope.row.LOCATION_NUMBER == cookieMap.location_number && limitBtn.operation" @click="handleClick(scope.row)" type="primary">库存操作</el-button>
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
    <!--库存操作弹出层-->
    <el-dialog
      v-dialogDrag
      append-to-body
      :fullscreen="isScreen"
      :before-close="resetChecked"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :visible.sync="dialogFormVisible">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">库存操作</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreen = !isScreen"></i>
      </div>
      <el-form :model="addEdit" label-width="120px">
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
            <el-form-item label="库存金额(元)：">
              <el-input disabled v-model="addEdit.stock_quantity"/>
            </el-form-item>
            <el-form-item class="star" label="操作类型：">
              <el-select
                class="widthAll"
                @change="changeType(addEdit.operation_type)"
                v-model="addEdit.operation_type"
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
                placeholder="请输入认证操作人员ID"
                maxlength="6"
                @blur="blurInputUser(errorTip,addEdit.identified_operator_id,'userFlag')"
                v-model="addEdit.identified_operator_id"/>
              <span v-if="errorTip.userFlag" class="isNotNull">必填项不能为空</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="车站：">
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
            <el-form-item class="star" label="操作金额(元)：">
              <el-input
                oninput="value=value.replace(/[^\d]/g,'')"
                placeholder="请输入操作金额"
                maxlength="8"
                v-model="addEdit.operate_amount"/>
              <span v-if="errorTip.operationFlag" class="isNotNull">{{errorTip.operationTip}}</span>
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
                placeholder="请输入密码"
                type="password"
                maxlength="6"
                @blur="blurInputUser(errorTip,addEdit.identified_operator_password,'passwordFlag')"
                v-model="addEdit.identified_operator_password"/>
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
        <el-button type="primary" v-btn-control @click="addEditData">确定</el-button>
      </div>
    </el-dialog>
  </Box>
</template>

<script>
  import Box from '../../../components/Box';

  export default {
    name: "moneyStockChange",
    components: {Box},
    data() {
      return {
        isScreen: false, // 库存操作放大缩小
        // 表单查询集合
        formItem: {
          lines: '', // 线路
          station: '', // 车站
          status: '', // 库存状态
          money_state: '', // 现金状态
        },
        disabledBtn: {
          createDis: true
        },
        // 表格数据
        tableData: [],
        // 分页
        options: {
          total: 0, // 总条数
          currentPage: 1, // 当前页码
          pageSize: 10, // 显示条数
        },
        // 按钮权限
        limitBtn: {
          queryBtn: false, // 查询
          operation: false, // 库存操作
        },
        // 库存状态
        statusList: [],
        // 现金状态集合
        moneyList: [],
        // 操作类型
        typeList: [],
        // 操作原因
        reasonList: [],
        // 线路集合
        linesList: [],
        // 车站集合
        stationList: [],
        // 调入调出线路
        linesListArr: [],
        // 库存操作蒙版显示隐藏
        dialogFormVisible: false,
        // 库存操作集合
        addEdit: {
          lines: '', // 线路
          station: '', // 车站
          location_number: '', // 位置编码
          operation_type: '', // 变更类型
          change_reason: '', // 变更原因
          stock_quantity: '',// 库存金额
          operate_amount: '', // 操作金额
          identified_operator_id: '', // 操作人员
          identified_operator_password: '', // 密码
          money_state: '', // 现金状态
          comment_info: '', // 备注
        },
        // 校验标识
        errorTip: {
          typeFlag: false, // 操作类型
          reasonFlag: false, // 变更原因
          operationFlag: false, // 操作金额
          operationTip: '', // 操作金额提示
          userFlag: false, // 认证操作员
          passwordFlag: false, // 密码
        },
        // 库存操作车站下拉框集合
        dialogStationList: [],
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
        _t.formItem.status = ''; // 库存状态
        _t.formItem.money_state = ''; // 现金状态
        _t.getData();
      },
      // 获取操作类型及原因
      getTypeAndReason(row) {
        var _t = this;
        var params = {
          typeid: '02', // 01 车票 02 现金
        };
        _t.$api.post('/tsGateWay/ticketUtility/typeReasonCascadeQuery', params, function (res) {
          if (res.rtCode && res.rtCode === '14002') {
            if (row.MONEY_STATE == '03' || row.MONEY_STATE == '02') {
              var arr = new Array();
              res.rtData.forEach(item => {
                if (item.TYPE_VALUE == '03') {
                  // 调整
                  arr.push(item)
                }
              });
              _t.typeList = arr
            } else {
              _t.typeList = res.rtData
            }
          }
        });
      },
      // 改变操作类型
      changeType(val) {
        var _t = this;
        if (val !== null && val !== '') {
          _t.errorTip.typeFlag = false;
          _t.typeList.forEach((item) => {
            if (item.TYPE_VALUE === val) {
              if (item.reasonList !== undefined && item.reasonList !== null) {
                // 变更原因赋值
                _t.reasonList = item.reasonList;
              } else {
                _t.reasonList = []
              }
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
        _t.errorTip.reasonFlag = val !== '' ? false : true;
      },
      // 失去焦点校验操作金额
      blurInputMoney() {
        var _t = this;
        if (_t.addEdit.operate_amount.trim() === '') {
          _t.errorTip.operationFlag = true;
          _t.errorTip.operationTip = '必填项不能为空';
        } else {
          var reg = _t.$config.isMoneyNumber();
          if (reg.test(_t.addEdit.operate_amount.trim()) === false) {
            _t.errorTip.operationFlag = true;
            _t.errorTip.operationTip = '格式不正确';
          } else {
            // _t.addEdit.operate_amount = (_t.addEdit.operate_amount.trim() * 1).toFixed(2).toString();
            // 格式正确,校验是否大于 999999.99
            if (_t.addEdit.operate_amount * 1 > 9999999.99) {
              // _t.errorTip.operationFlag = true;
              // _t.errorTip.operationTip = '金额不能大于 9999999.99';
            } else {
              _t.errorTip.operationFlag = false;
              _t.errorTip.operationTip = '';
            }
          }
        }
      },
      // 认证员校验
      blurInputUser(item, val, flag) {
        item[flag] = val.trim() === '' ? true : false;
      },
      // 重置 校验
      resetChecked() {
        var _t = this;
        _t.dialogFormVisible = false; // 隐藏蒙版
        _t.addEdit.lines = ''; // 线路
        _t.addEdit.station = ''; // 车站
        _t.addEdit.operation_type = ''; // 变更类型
        _t.addEdit.change_reason = ''; // 变更原因
        _t.addEdit.stock_quantity = ''; // 库存金额
        _t.addEdit.operate_amount = ''; // 操作金额
        _t.addEdit.identified_operator_id = ''; // 操作人员
        _t.addEdit.identified_operator_password = ''; // 密码
        _t.addEdit.comment_info = ''; // 备注
        _t.addEdit.money_state = ''; //  现金状态
        _t.errorTip.typeFlag = false; // 操作类型
        _t.errorTip.reasonFlag = false; // 原因
        _t.errorTip.operationFlag = false; // 操作金额
        _t.errorTip.operationTip = ''; // 操作金额提示
        _t.errorTip.userFlag = false; // 操作人员
        _t.errorTip.passwordFlag = false; // 密码

      },
      // 库存操作提交
      addEditData() {
        var _t = this;
        // 校验 操作类型
        _t.blurInputUser(_t.errorTip, _t.addEdit.operation_type, 'typeFlag');
        // 校验 操作原因
        _t.blurInputUser(_t.errorTip, _t.addEdit.change_reason, 'reasonFlag');
        // 校验 操作金额
        _t.blurInputMoney(_t.errorTip, _t.addEdit.operate_amount, 'operationFlag');
        // 校验操作人员
        _t.blurInputUser(_t.errorTip, _t.addEdit.identified_operator_id, 'userFlag');
        // 校验密码
        _t.blurInputUser(_t.errorTip, _t.addEdit.identified_operator_password, 'passwordFlag');
        var location_number = _t.addEdit.station ? _t.addEdit.station : _t.formItem.lines;
        if (_t.errorTip.typeFlag === false
          && _t.errorTip.reasonFlag === false
          && _t.errorTip.operationFlag === false
          && _t.errorTip.userFlag === false
          && _t.errorTip.passwordFlag === false
          && _t.addEdit.operate_amount !== ''
        ) {
          // 提交
          let str = 'location_number=' + location_number
            + '&operator_id=' + _t.cookieMap.user_id
            + '&operate_type=' + _t.addEdit.operation_type
            + '&change_reason=' + _t.addEdit.change_reason
            + '&operate_amount=' + _t.addEdit.operate_amount.trim()
            + '&check_operator_id=' + _t.addEdit.identified_operator_id.trim()
            + '&check_operator_password=' + _t.addEdit.identified_operator_password.trim();
          let Base64 = require('js-base64').Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          var params = {
            location_number: location_number, // 位置编号
            operator_id: _t.cookieMap.user_id, // 操作员id
            operate_type: _t.addEdit.operation_type, // 操作类型
            change_reason: _t.addEdit.change_reason, // 操作原因
            operate_amount: _t.addEdit.operate_amount, // 操作金额
            check_operator_id: _t.addEdit.identified_operator_id.trim(), // 认证操作员id
            check_operator_password: _t.addEdit.identified_operator_password.trim(), // 密码
            stock_type: '01', // 备用金
            money_state: _t.addEdit.money_state, // 余额
            comment_info: _t.addEdit.comment_info.trim(), // 备注
            token: keyToken, // token
          };
          _t.$api.post('/tsGateWay/readyMoney/stockChangeSaveGateWay', params, function (res) {
            if (res.rtCode && res.rtCode === '11103') {
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
            } else if (res.rtCode) {
              _t.alertDialogTip(_t, res.rtMessage);
            }
          });
        } else {
          _t.alertDialogTip(_t, '请检查填写资料是否有误!');
        }
      },
      // 点击库存操作按钮
      handleClick(row) {
        var _t = this;
        if (row.LOCATION_NUMBER !== undefined) {
          var roleName = _t.getCookie("USER_TYPE");
          // 车站
          if (_t.linesList.length > 1) {
            _t.addEdit.station = '';
          }else if (_t.linesList.length == 1) {
            _t.addEdit.station = _t.cookieMap.location_number.toString();
          }
          _t.addEdit.lines = _t.formItem.lines;
          // 库存金额
          _t.addEdit.stock_quantity = row.MONEY_AMOUNT_YUAN ? row.MONEY_AMOUNT_YUAN : '';
          _t.addEdit.money_state = row.MONEY_STATE; // 现金状态
          // 显示蒙版
          _t.dialogFormVisible = true;
          // 操作类型及原因
          _t.getTypeAndReason(row);
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
      // 查询按钮
      getData() {
        var _t = this;
        var location_number = ''; // 发送请求的 位置编号
        var location_number_query = ''; // 发送请求的 位置编号
        if (_t.cookieMap.role !== null && _t.cookieMap.role !== 'null'
          && _t.cookieMap.user_id !== null
          && _t.cookieMap.user_id !== 'null'
          && _t.cookieMap.location_number !== null
          && _t.cookieMap.location_number !== 'null') {
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
        // 车站为空
        if (_t.formItem.station === '') {
          location_number = _t.formItem.lines;
        } else {
          // 车站有值
          location_number = _t.formItem.station;
        }
        if (location_number !== '' && _t.cookieMap.user_id !== null && _t.cookieMap.user_id !== 'null') {
          let str = 'location_number=' + location_number
            + '&operator_id=' + _t.cookieMap.user_id
            + '&stock_type=' + '01';
          let Base64 = require('js-base64').Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          let postData = {
            location_number: location_number, // 位置编码
            location_number_query: location_number_query === '' ? null : location_number_query,
            operator_id: _t.cookieMap.user_id, // 操作员id
            token: keyToken, // token
            stock_type: '01', // 01 备用金
            money_state: _t.formItem.money_state, // 01 余额
            stock_state: _t.formItem.status === '' ? null : _t.formItem.status, // 库存状态
            pageNum: _t.options.currentPage, // 当前页
            pageSize: _t.options.pageSize, // 每页显示条数
          };
          _t.$api.post('/tsGateWay/readyMoney/readyMoneyStockQueryGateWay', postData, function (res) {
            _t.$store.commit('setLoading', false);
            if (res.rtCode && res.rtCode === '11101') {
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
      // 改变线路
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
      // 获取现金状态字典
      getMoneyCodeData() {
        var _t = this;
        let str = 'guid=GUID000722201906191612';
        let Base64 = require('js-base64').Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        var params = {
          guid: 'GUID000722201906191612',
          token: keyToken
        };
        _t.$api.post('/tsGateWay/ticketUtility/queryDict', params, function (res) {
          // 查询成功
          if (res.rtCode && res.rtCode === '14010') {
            _t.moneyList = res.rtData === null ? [] : res.rtData;
          }
        });
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
            _t.getMoneyCodeData();
            _t.getLinesAndStation();
          }
        });
        // 判断权限按钮
        limitBtnArr.forEach((item) => {
          // 查询
          if (item.MENU_ID === "GUID00000000000000000000000000000048") {
            _t.limitBtn.queryBtn = true;
          }
          // 库存操作
          if (item.MENU_ID === "GUID00000000000000000000000000000049") {
            _t.limitBtn.operation = true;
          }
        });
      }
    }
  };
</script>

<style scoped>

</style>
