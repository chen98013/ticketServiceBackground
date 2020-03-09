<template>
  <Box>
    <div class="formBox-top">
      <el-form inline ref="form" :model="formItem" label-width="110px">
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
            v-model="formItem.station">
            <el-option
              v-for="(item,index) in stationList"
              :key="index"
              :label="item.STATION_LOCATION_NAME"
              :value="item.LOCATION_NUMBER.toString()"/>
          </el-select>
        </el-form-item>
<!--        <el-form-item label="盘点单状态：" class="marBottom7">-->
<!--          <el-select-->
<!--            class="width200"-->
<!--            v-model="formItem.status"-->
<!--            placeholder="请选择盘点单状态"-->
<!--            clearable>-->
<!--            <el-option-->
<!--              v-for="item in statusList"-->
<!--              :key="item.VALUE"-->
<!--              :label="item.NAME"-->
<!--              :value="item.VALUE"/>-->
<!--          </el-select>-->
<!--        </el-form-item>-->
        <el-form-item label="创建时间：" class="marBottom7">
          <el-date-picker
            v-model="formItem.dateTime"
            :default-time="['00:00:00', '23:59:59']"
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
        <el-button v-if="limitBtn.create" type="primary" @click="addData">
          <span>创建盘点单</span>
        </el-button>
      </div>
      <el-table border stripe :data="tableData" :default-sort="{prop:'CREATE_DT',order:'descending'}">
        <el-table-column prop="ORDER_ID" label="盘点单号" header-align="center" align="center"/>
        <el-table-column prop="LINE_NAME" label="线路" header-align="center" align="center"/>
        <el-table-column prop="STATION_NAME" label="车站" header-align="center" align="center"/>
        <el-table-column prop="ORDER_STATE_NAME" sortable label="盘点单状态" header-align="center" align="center"/>
        <el-table-column prop="BALANCE_DATE" sortable label="运营日期" header-align="center" align="center"/>
        <el-table-column prop="CREATE_DT" sortable label="创建时间" header-align="center" align="center"/>
        <el-table-column label="操作" header-align="center" align="center">
          <template slot-scope="scope">
            <el-button v-if="limitBtn.detail" @click="handleClick(scope.row)" type="primary">详情</el-button>
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
    <!--创建盘点单-->
    <el-dialog
      append-to-body
      :fullscreen="isScreen"
      :before-close="resetData"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :visible.sync="dialogVisible">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">创建盘点单</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreen = !isScreen"></i>
      </div>
      <!--外层表单-->
      <el-form :model="addEdit" label-width="150px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="线路：">
              <el-select v-model="addEdit.lines" class="widthAll" disabled>
                <el-option
                  v-for="(item,index) in linesList"
                  :key="index"
                  :label="item.LINE_LOCATION_NAME"
                  :value="item.LINE_LOCATION_NUMBER.toString()"/>
              </el-select>
            </el-form-item>
            <el-form-item label="操作人员：">
              <el-input v-model="addEdit.operator_idAndName" disabled/>
            </el-form-item>
            <el-form-item class="star" label="认证操作人员ID：">
              <el-input
                maxlength="6"
                placeholder="请输入认证操作员ID"
                @blur="ruleAddForm(addEdit.operatorUser,'userFlag')"
                v-model="addEdit.operatorUser"/>
              <span class="isNotNull" v-if="errorTip.userFlag">必填项不能为空</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="车站：">
              <el-select v-model="addEdit.station" class="widthAll" disabled>
                <el-option
                  v-for="(item,index) in stationList"
                  :key="index"
                  :label="item.STATION_LOCATION_NAME"
                  :value="item.LOCATION_NUMBER.toString()"/>
              </el-select>
            </el-form-item>
            <el-form-item class="visibility" label="占位换行">
              <el-input v-model="addEdit.station"/>
            </el-form-item>
            <el-form-item class="star" label="密码：">
              <el-input
                maxlength="6"
                placeholder="请输入密码"
                @blur="ruleAddForm(addEdit.operatorPassword,'passwordFlag')"
                v-model="addEdit.operatorPassword"
                type="password"/>
              <span class="isNotNull" v-if="errorTip.passwordFlag">必填项不能为空</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注：">
          <el-input v-model="addEdit.note" type="textarea" maxlength="250" show-word-limit/>
        </el-form-item>
      </el-form>
      <!--添加按钮-->
      <div class="marBottom10">
        <el-button type="primary" @click="addListBtn">添加盘点单票卡类型</el-button>
      </div>
      <!--表格-->
      <div class="lowerPart">
        <el-table border stripe :data="addList" class="marBottom15">
          <el-table-column prop="name" label="车票库存类型" header-align="center" align="center"/>
<!--          <el-table-column prop="ticketNumber" label="当前库存数量(张)" header-align="center" align="center"/>-->
          <el-table-column label="盘点数量(张)" header-align="center" align="center">
            <template slot-scope="scope">
              <el-input
                maxlength="9"
                oninput="value=value.replace(/[^\d]/g,'')"
                v-model="scope.row.number"/>
            </template>
          </el-table-column>
          <el-table-column label="盘点无效票(张)" header-align="center" align="center">
            <template slot-scope="scope">
              <el-input
                maxlength="9"
                oninput="value=value.replace(/[^\d]/g,'')"
                v-model="scope.row.numberWuxiao"/>
            </template>
          </el-table-column>
          <el-table-column label="操作" header-align="center" align="center" width="100px">
            <template slot-scope="scope">
              <el-button type="danger" @click="deleteData(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!--添加内层蒙版-->
      <el-dialog
        append-to-body
        :fullscreen="isScreenIn"
        :before-close="resetTicket"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :visible.sync="dialogAddVisible">
        <div slot="title" class="dialogTitle clearFix">
          <span class="title">添加盘点单票卡类型</span>
          <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenIn = !isScreenIn"></i>
        </div>
        <el-checkbox-group v-model="checkList">
          <el-checkbox
            class="checkBox"
            v-for="(item,index) in ticketTypeList"
            :key="index"
            :label="item.STOCK_MANAGE_TYPE_ID">{{item.STOCK_TYPE_NAME_CN}}
          </el-checkbox>
          <br>
        </el-checkbox-group>
        <div slot="footer">
          <el-button @click="resetTicket">取消</el-button>
          <el-button type="primary" v-btn-control @click="addTicket">确定</el-button>
        </div>
      </el-dialog>
      <!--外层提交按钮-->
      <div slot="footer">
        <el-button @click="resetData">取消</el-button>
        <el-button type="primary" v-btn-control :disabled="disabledShow" @click="addEditData">确定</el-button>
      </div>
    </el-dialog>
    <!--盘点单详情-->
    <el-dialog
      v-dialogDrag
      append-to-body
      :fullscreen="isScreenDetail"
      :before-close="resetDetail"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :visible.sync="dialogFormVisible">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">盘点单详情</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenDetail = !isScreenDetail"></i>
      </div>
      <el-form :model="formDetailMap" label-width="90px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="线路：">
              <el-input v-model="formDetailMap.lines" disabled/>
            </el-form-item>
            <el-form-item label="操作员：">
              <el-input v-model="formDetailMap.operator" disabled/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="车站：">
              <el-input v-model="formDetailMap.station" disabled/>
            </el-form-item>
            <el-form-item label="盘点单号：">
              <el-input v-model="formDetailMap.order_id" disabled/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注：">
          <el-input v-model="formDetailMap.comment_info" disabled/>
        </el-form-item>
      </el-form>
      <el-table :data="formDetailData" border>
        <el-table-column prop="STOCK_TYPE_NAME_CN" label="车票类型" header-align="center" align="center"/>
        <el-table-column prop="STOCK_QUANTITY_SYSTEM" label="系统库存数量(张)" header-align="center" align="center"/>
        <el-table-column prop="STOCK_QUANTITY_INPUT" label="实际盘点数量(张)" header-align="center" align="center"/>
      </el-table>
      <!--分页-->
      <pages
        :total='optionsDetail.total'
        :currentPage='optionsDetail.currentPage'
        :page-size="optionsDetail.pageSize"
        @handleSizeChangeSub="handleSizeChangeSubDetail"
        @handleCurrentChangeSub="handleCurrentChangeDetail"/>
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
    name: "ticketStockInventory",
    components: {Box},
    data() {
      return {
        disabledShow:false, // 提交禁选
        isScreen: false, // 创建盘点单放大缩小
        isScreenIn: false, // 添加票卡类型放大缩小
        isScreenDetail: false, // 详情放大缩小
        // 查询表单
        formItem: {
          lines: '', // 线路
          station: '', // 车站
          status: '', // 盘点单状态
          dateTime: [], // 创建时间
        },
        // 创建盘点单
        dialogVisible: false,
        // 详情
        dialogFormVisible: false,
        // 添加蒙版
        dialogAddVisible: false,
        // 表格数据
        tableData: [],
        // 分页
        options: {
          total: 0, // 总条数
          currentPage: 1, // 当前页码
          pageSize: 10, // 显示条数
        },
        // 分页
        optionsDetail: {
          total: 0, // 总条数
          currentPage: 1, // 当前页码
          pageSize: 10, // 显示条数
        },
        // 按钮权限
        limitBtn: {
          queryBtn: false, // 查询
          create: false, // 创建盘点单
          detail: false, // 详情
        },
        // 启用禁用
        disabledBtn: {
          create: true, // 创建
          createDis: true, // 线路车站
        },
        // 盘点单详情表格
        formDetailData: [],
        // 盘点单详情表单
        formDetail: {
          location_number: '', // 位置
          order_id: '', // 单据号
        },
        // 线路集合
        linesList: [],
        // 车站集合
        stationList: [],
        // 盘点单状态
        statusList: [],
        // 添加列表
        addList: [],
        // 添加选中的票卡类型
        checkList: [],
        // 添加票卡类型列表
        ticketTypeList: [],
        // 创建表单
        addEdit: {
          lines: '', // 线路
          station: '', // 车站
          operator_id: '', // 操作员id
          operator_idAndName: '', // 操作员id及姓名
          operatorUser: '', // 认证操作员
          operatorPassword: '', // 密码
          note: "", // 备注
        },
        linesListArr: [],// 调入(出)线路
        // 校验表单
        errorTip: {
          userFlag: false, // 认证操作员
          passwordFlag: false, // 密码
        },
        // 详情页面头部公用信息表单
        formDetailMap: {
          lines: '', // 线路
          station: '', // 车站
          operator: '', // 操作员
          order_id: '', // 单据号
          comment_info: '', // 备注
        }
      };
    },
    methods: {
      // 重置查询表单
      resetFormItem() {
        var _t = this;
        _t.formItem.status = ''; // 盘点单状态
        _t.formItem.dateTime = []; // 创建时间
        _t.getData()
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
      // 改变当前页码
      handleCurrentChangeDetail(val) {
        var _t = this;
        _t.optionsDetail.currentPage = val;
        _t.getData();
      },
      // 改变每页显示条数
      handleSizeChangeSubDetail(val) {
        var _t = this;
        _t.optionsDetail.pageSize = val;
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
        // 车站为空
        if (_t.formItem.station === '') {
          location_number = location;
        } else {
          // 车站有值
          location_number = _t.formItem.station;
        }
        if (location_number !== '' && user_id !== null && user_id !== 'null') {
          let str = 'location_number=' + location_number;
          let Base64 = require('js-base64').Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          //  获取当天时间
          var start_dtime = _t.getCookie('TIME') + ' ' + '00:00:00';
          var end_dtime = _t.getCookie('TIME') + ' ' + '23:59:59';
          let postData = {
            location_number: location_number, // 位置编码
            location_number_query: location_number_query === '' ? null : location_number_query,
            token: keyToken, // token
            order_state: _t.formItem.status === '' ? null : _t.formItem.status, // 状态
            start_time: _t.formItem.dateTime !== null ? (_t.formItem.dateTime[0] !== undefined ? dateFilter(_t.formItem.dateTime[0].getTime()) : start_dtime) :start_dtime, // 开始时间
            end_time: _t.formItem.dateTime !== null ? (_t.formItem.dateTime[1] !== undefined ? dateFilter(_t.formItem.dateTime[1].getTime()) : end_dtime) : end_dtime, // 结束时间
            pageNum: _t.options.currentPage, // 当前页
            pageSize: _t.options.pageSize, // 每页显示条数
          };
          _t.$api.post('/tsGateWay/inventoryListService/inventoryOrderQueryGateWay', postData, function (res) {
            _t.$store.commit('setLoading', false);
            if (res.rtCode && res.rtCode === '10004') {
              _t.tableData = res.rtData === null ? [] : res.rtData;
              _t.options.total = res.totalCount ? res.totalCount : 0;
            } else if (res.rtCode) {
              _t.alertDialogTip(_t, res.rtMessage);
            }
          });
        }
      },
      // 获取盘点单状态字典
      getStatusData() {
        var _t = this;
        let str = 'guid=GUID000722201906191617';
        let Base64 = require('js-base64').Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        var params = {
          guid: 'GUID000722201906191617',
          token: keyToken
        };
        _t.$api.post('/tsGateWay/ticketUtility/queryDict', params, function (res) {
          // 查询成功
          if (res.rtCode && res.rtCode === '14010') {
            _t.statusList = res.rtData === null ? [] : res.rtData;
          }
        });
      },
      // 盘点单详情
      handleClick(row) {
        var _t = this;
        // 显示蒙版
        _t.dialogFormVisible = true;
        _t.formDetail.location_number = row.LOCATION_NUMBER ? row.LOCATION_NUMBER : '';
        _t.formDetail.order_id = row.ORDER_ID ? row.ORDER_ID : '';
        _t.formDetailMap.lines = row.LINE_NAME; // 线路
        _t.formDetailMap.station = row.STATION_NAME; // 车站
        _t.getDetailData(row);
      },
      // 获取详情接口数据
      getDetailData(row) {
        var _t = this;
        if (_t.formDetail.location_number !== '' && _t.formDetail.order_id !== '') {
          let str = 'location_number=' + _t.formDetail.location_number
            + "&order_id=" + _t.formDetail.order_id;
          let Base64 = require('js-base64').Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          var params = {
            location_number: _t.formDetail.location_number, // 位置
            order_id: _t.formDetail.order_id, // 单据号
            token: keyToken, // token
            pageNum: _t.optionsDetail.currentPage, // 当前页
            pageSize: _t.optionsDetail.pageSize, // 每页条数
          };
          _t.$api.post('/tsGateWay/inventoryListService/inventoryOrderDetailGateWay', params, function (res) {
            if (res.rtCode && res.rtCode === '10008') {

              _t.formDetailData = res.rtData === null ? [] : res.rtData;
              _t.optionsDetail.total = res.totalCount ? res.totalCount : 0;
              // 判断表格长度,不为0时取出下标为0的线路，车站，操作员，单号
              if (_t.formDetailData.length !== 0) {
                // // 判断线路
                // if (_t.formDetailData[0].LOCATION_TYPE_NAME !== undefined && _t.formDetailData[0].LOCATION_TYPE_NAME !== null) {
                //   _t.formDetailMap.lines = _t.formDetailData[0].LOCATION_TYPE_NAME;
                // }
                // // 判断车站
                // if (_t.formDetailData[0].STATION_NAME !== undefined && _t.formDetailData[0].STATION_NAME !== null) {
                //   _t.formDetailMap.station = _t.formDetailData[0].STATION_NAME;
                // }
                // 判断操作员
                if (_t.formDetailData[0].USERNAME !== undefined && _t.formDetailData[0].USERNAME !== null) {
                  _t.formDetailMap.operator = _t.formDetailData[0].USERNAME;
                }
                // 判断盘点单号
                if (_t.formDetailData[0].ORDER_ID !== undefined && _t.formDetailData[0].ORDER_ID !== null) {
                  _t.formDetailMap.order_id = _t.formDetailData[0].ORDER_ID;
                }
                // 备注
                if (row.COMMENT_INFO !== undefined && row.COMMENT_INFO !== null) {
                  _t.formDetailMap.comment_info = row.COMMENT_INFO;
                }
              }
            } else if (res.rtCode) {
              _t.alertDialogTip(_t, res.rtMessage);
            }
          });
        }
      },
      // 重置盘点单详情
      resetDetail() {
        var _t = this;
        _t.dialogFormVisible = false; // 蒙版
        _t.formDetailMap.lines = ''; // 线路
        _t.formDetailMap.station = ''; // 车站
        _t.formDetailMap.operator = ''; // 操作员
        _t.formDetailMap.order_id = ''; // 单据号
        _t.formDetailMap.comment_info = ''; // 备注
        _t.formDetailData = []; // 表格
        _t.optionsDetail.total = 0; // 总条数
      },
      // 查询线路及车站
      getLinesAndStation() {
        var _t = this;
        var params = {};
        _t.$api.post('/tsGateWay/ticketUtility/locationCascadeQuery', params, function (res) {
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
      // 创建盘点单
      addData() {
        var _t = this;
        _t.dialogVisible = true;
        var roleName = _t.getCookie("USER_TYPE");
        var location_number = _t.getCookie('LOCATION_NUMBER');
        var user_id = _t.getCookie('USER_ID');
        var user_name = _t.getCookie('USER_NAME');
        if (location_number !== null && location_number !== 'null' && user_id !== null && user_id !== 'null') {
          _t.addEdit.lines = _t.formItem.lines; // 线路
            if (_t.linesList.length == 1){
              _t.addEdit.station = location_number; // 车站
            }else if(_t.linesList.length> 1){
              _t.addEdit.station = '';
            }
          _t.addEdit.location_number = location_number; // 位置
          _t.addEdit.operator_id = user_id; // 操作员id
          _t.addEdit.operator_idAndName = user_name == null ? user_id : user_name + '-' + user_id;
        }
      },
      // 创建盘点单重置
      resetData() {
        var _t = this;
        _t.dialogVisible = false;
        _t.addEdit.lines = ''; // 线路
        _t.addEdit.station = ''; // 车站
        _t.addEdit.operator_id = ''; // 操作员id
        _t.addEdit.operator_idAndName = ''; // 操作员id及姓名
        _t.addEdit.operatorUser = ''; // 认证操作员
        _t.addEdit.operatorPassword = ''; // 密码
        _t.addEdit.note = ''; // 备注
        _t.errorTip.userFlag = false;
        _t.errorTip.passwordFlag = false;
        _t.addList = [];
      },
      // 添加类型
      addListBtn() {
        var _t = this;
        _t.dialogAddVisible = true;
        _t.getTicketType();
      },
      // 获取票卡类型
      getTicketType() {
        var _t = this;
        var location_number = _t.getCookie('LOCATION_NUMBER');
        var user_id = _t.getCookie('USER_ID');
        if (location_number !== null && location_number !== 'null' && user_id !== null && user_id !== 'null') {
          let str = 'location_number=' + location_number + '&operator_id=' + user_id;
          let Base64 = require('js-base64').Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          var params = {
            flag: 1,
            location_number: location_number,
            operator_id: user_id,
            token: keyToken,
            pageNum: 1,
            pageSize: 100
          };
          _t.$api.post('/tsGateWay/inventoryListService/ticketTypeQueryGateWay', params, function (res) {
            if (res.rtCode && res.rtCode === "10005") {
              _t.ticketTypeList = res.rtData === null ? [] : res.rtData;
              // 勾选已有项
              var listArr = new Array();
              _t.addList.forEach((item) => {
                listArr.push(item.id);
              });
              _t.checkList = listArr;
            }
          });
        }
      },
      // 删除数据
      deleteData(index) {
        var _t = this;
        _t.addList.splice(index, 1);
      },
      // 重置添加
      resetTicket() {
        var _t = this;
        _t.dialogAddVisible = false;
        _t.checkList = [];
      },
      // 添加票卡类型
      addTicket() {
        var _t = this;
        var listArr = new Array();
        _t.ticketTypeList.forEach((item) => {
          _t.checkList.forEach((val) => {
            if (item.STOCK_MANAGE_TYPE_ID === val) {
              var obj = new Object();
              obj.id = item.STOCK_MANAGE_TYPE_ID;
              obj.name = item.STOCK_TYPE_NAME_CN;
              obj.ticketNumber = item.TICKET_NUMBER;
              obj.number = ' ';
              obj.note = '';
              listArr.push(obj);
            }
          });
        });
        _t.addList = listArr;
        _t.resetTicket();
      },
      // 校验创建表单
      ruleAddForm(val, flag) {
        var _t = this;
        _t.disabledShow = false;
        _t.errorTip[flag] = val.trim() === '' ? true : false;
      },
      // 提交创建盘点单
      addEditData() {
        var _t = this;
        _t.disabledShow = true;
        // 校验认证操作员
        _t.ruleAddForm(_t.addEdit.operatorUser, 'userFlag');
        // 校验密码
        _t.ruleAddForm(_t.addEdit.operatorPassword, 'passwordFlag');
        var number = 0;
        var wuxiao = 0;
        _t.addList.forEach(item => {
          if (item.number.trim() == '') {
            number++;
          }
          if(item.numberWuxiao) {

          }else {
            wuxiao++;
          }
        });
        var init = true
         if (number !== 0 || wuxiao !== 0) {
           number = 0;
           wuxiao = 0;
           init = false;
           _t.disabledShow = false;
           _t.alertDialogTip(_t, "盘点张数或盘点无效票不能为空!");
         }
        if (_t.addList.length !== 0){
            // 可以提交
            if (_t.errorTip.userFlag === false
              && _t.errorTip.passwordFlag === false) {
              var location_number = _t.getCookie('LOCATION_NUMBER');
              var user_id = _t.getCookie('USER_ID');
              if (location_number !== null && location_number !== 'null' && user_id !== null && user_id !== 'null') {
                let str = 'location_number=' + location_number
                  + '&operator_id=' + user_id
                  + '&check_operator_id=' + _t.addEdit.operatorUser.trim()
                  + '&check_operator_password=' + _t.addEdit.operatorPassword.trim();
                let Base64 = require('js-base64').Base64;
                let keyToken = _t.$md5(Base64.encode(str));
                var addList = new Array();
                _t.addList.forEach((item) => {
                  var obj = new Object();
                  obj.stock_manage_type_id = item.id;
                  obj.stock_quantity_system = item.ticketNumber;
                  obj.stock_quantity_input = item.number;
                  obj.wuXiaoNuber = item.numberWuxiao;
                  obj.comment_info = item.note;
                  addList.push(obj);
                });
                var params = {
                  location_number: location_number,
                  operator_id: user_id,
                  check_operator_id: _t.addEdit.operatorUser.trim(),
                  check_operator_password: _t.addEdit.operatorPassword.trim(),
                  ticket_Inventory_data: addList,
                  comment_info: _t.addEdit.note.trim(),
                  token: keyToken
                };
                _t.$api.post('/tsGateWay/inventoryListService/inventoryOrderSubmitGateWay', params, function (res) {
                  if (res.rtCode && res.rtCode === '10007') {
                    _t.$alert(res.rtMessage, '温馨提示', {
                      confirmButtonText: '确定',
                      cancelButtonText: '取消'
                    }).then(() => {
                      _t.disabledShow = false;
                      _t.getData();
                      _t.resetData();
                    }).catch(() => {
                      _t.disabledShow = false;
                      _t.getData();
                      _t.resetData();
                    });
                  } else if (res.rtCode) {
                    _t.disabledShow = false;
                    _t.alertDialogTip(_t, res.rtMessage);
                  }
                });
              }
            }
          }else {
          _t.alertDialogTip(_t, '盘点单不能为空');
        }

      },
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
            // _t.getStatusData(); // 获取盘点单数据
            _t.getLinesAndStation();
          }
        });
        // 判断权限按钮
        limitBtnArr.forEach((item) => {
          // 查询按钮 权限
          if (item.MENU_ID === "GUID00000000000000000000000000000010") {
            _t.limitBtn.queryBtn = true;
          }
          // 创建盘点单权限
          if (item.MENU_ID === "GUID00000000000000000000000000000011") {
            _t.limitBtn.create = true;
          }
          // 盘点单详情权限
          if (item.MENU_ID === "GUID00000000000000000000000000000015") {
            _t.limitBtn.detail = true;
          }
        });
      }
    }
  };
</script>

<style scoped>
  .checkBox {
    margin: 0 35px 25px 0;
  }

  .tableHeader li {
    color: #909399;
    font-weight: bold;
  }

  .tableHeader li,
  .tableBody li {
    width: 100%;
    border-bottom: 1px solid #EBEEF5;
    display: flex;
    flex-direction: row;
  }

  .tableHeader li > span,
  .tableBody li > span {
    height: 65px;
    line-height: 65px;
    display: inline-block;
    flex: 1;
  }

  .tableHeader li > span:first-child,
  .tableBody li > span:first-child {
    width: 80px;
  }


  .tableHeader li > span:last-child,
  .tableBody li > span:last-child {
    width: 100px;
  }
</style>
