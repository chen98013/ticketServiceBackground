<template>
  <!--回收-->
  <Box>
    <!--回收-->
    <div>
      <el-form :model="recycleFormItem" inline>
        <!--认证信息-->
        <p class="title">日期时间</p>
        <div class="formBox-top">
          <el-form-item v-if="disabledBtn.createDis" label="线路：" class="marBottom7">
            <el-select
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
          <el-form-item v-if="disabledBtn.createDis" label="车站：" class="star marBottom7">
            <el-select
              clearable
              class="width200"
              v-model="formItem.station">
              <el-option
                v-for="(item,index) in stationList"
                :key="index"
                :label="item.STATION_LOCATION_NAME"
                :value="item.LOCATION_NUMBER.toString()"/>
            </el-select>
            <span class="isNotNull" v-if="recycleFormItem.station">必填项不能为空</span>
          </el-form-item>
          <el-form-item class="marBottom20 star" label="日期：">
            <el-date-picker
              v-model="formItem.dateTime"
              type="date"
              placeholder="选择日期"
              :picker-options="pickerOptions"/>
            <span class="isNotNull" v-if="recycleFormItem.dateTime">必填项不能为空</span>
          </el-form-item>
          <el-form-item class="marBottom20">
            <el-button type="primary" v-btn-control @click="getRecycleData">确认</el-button>
          </el-form-item>
        </div>
        <div v-if="recycleFormItem.showModule">
          <el-row :gutter="100">
            <el-col :span="12">
              <!--装机信息-->
              <p class="title">装机信息</p>
              <el-table :data="recycleTableForLading" border stripe class="marBottom10">
                <el-table-column prop="DEVICE_ID" label="设备编号" header-align="center" align="center"/>
                <el-table-column prop="DEVICE_NAME" label="设备名称" header-align="center" align="center"/>
                <el-table-column prop="MONEY" label="装机金额(元)" header-align="center" align="center"/>
                <el-table-column prop="TICKET_YOUXIAO" label="装票数量(张)" header-align="center" align="center"/>
              </el-table>
            </el-col>
            <el-col :span="12">
              <!--补充信息-->
              <p class="title">补充信息</p>
              <el-table :data="recycleTableForSupplement" border stripe class="marBottom10">
                <el-table-column prop="DEVICE_ID" label="设备编号" header-align="center" align="center"/>
                <el-table-column prop="DEVICE_NAME" label="设备名称" header-align="center" align="center"/>
                <el-table-column prop="MONEY" label="补充金额(元)" header-align="center" align="center"/>
                <el-table-column prop="TICKET_YOUXIAO" label="补票数量(张)" header-align="center" align="center"/>
              </el-table>
            </el-col>
          </el-row>
          <!--清点信息-->
          <p class="title">清点信息</p>
          <el-table :data="recycleTableForMake" border stripe class="marBottom10">
            <el-table-column prop="DEVICE_ID" label="设备编号" header-align="center" align="center"/>
            <el-table-column prop="DEVICE_NAME" label="设备名称" header-align="center" align="center"/>
            <el-table-column prop="MONEY" label="清点金额(元)" header-align="center" align="center"/>
            <el-table-column prop="TICKET_YOUXIAO" label="清点单程票(有效)数量(张)" header-align="center" align="center"/>
            <el-table-column prop="TICKET_WUXIAO" label="清点单程票(无效)数量(张)" header-align="center" align="center"/>
          </el-table>
          <!--回收信息-->
          <p class="title">回收信息</p>
          <el-table :data="recycleTableForRecycle" border stripe class="marBottom10">
            <el-table-column prop="DEVICE_NAME" label="设备名称" header-align="center" align="center"/>
            <el-table-column prop="MONEY" label="已回收金额(元)" header-align="center" align="center"></el-table-column>
            <el-table-column prop="TICKET_YOUXIAO" label="已回收单程票(有效)数量(张)" header-align="center"
                             align="center"></el-table-column>
            <el-table-column prop="TICKET_WUXIAO" label="已回收单程票(无效)数量(张)" header-align="center"
                             align="center"></el-table-column>
          </el-table>
        </div>
      </el-form>
    </div>
    <!--回收失败错误信息弹出层-->
    <el-dialog
      v-dialogDrag
      append-to-body
      :fullscreen="isScreen"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="resetDetail"
      :visible.sync="dialogDetailVisible">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">温馨提示</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreen = !isScreen"></i>
      </div>
      <el-table :data="detailTable" border stripe class="marBottom20">
        <el-table-column prop="recoverRecord" label="错误信息"/>
      </el-table>
      <div slot="footer">
        <el-button @click="resetDetail">取消</el-button>
        <el-button type="primary" @click="resetDetail">确定</el-button>
      </div>
    </el-dialog>
  </Box>
</template>

<script>
  import Box from "../../../components/Box";

  export default {
    name: "TVMOperationRecycle",
    components: {Box},
    data() {
      return {
        isScreen: false, // 错误提示放大缩小
        // 操作类型
        statusList: [],
        // 线路集合
        linesList: [],
        // 车站集合
        stationList: [],
        // 操作员id集合
        operatorIdList: [],
        // 禁选日期
        pickerOptions: {
          disabledDate(time) {
            return time.getTime() > Date.now();
          },
        },
        // 基本信息表单
        formItem: {
          lines: '', // 线路
          station: '', //车站
          operationId: '', // 操作员id
          operate_type: '03', // 操作类型
          dateTime: new Date(), // 日期
        },
        disabledBtn: {
          createDis: false
        },
        // 回收表单
        recycleFormItem: {
          station: false, // 车站
          dateTime: false, // 时间
          operatorUser: '', // 认证id
          operatorPassword: '', // 密码
          userFlag: false, // 操作员标识
          passwordFlag: false, // 密码标识
          showModule: false, // 控制表格区域显示隐藏
        },
        recycleTableForLading: [], // 回收装机信息
        recycleTableForSupplement: [], // 回收补充信息
        recycleTableForMake: [], // 回收清点信息
        recycleTableForRecycle: [], // 回收回收信息
        dialogDetailVisible: false, // 回收错误信息蒙版
        detailTable: [], // 回收错误信息表格
        // 从cookie中获取
        cookieMap: {
          location_number: this.getCookie('LOCATION_NUMBER'), // 位置编号
          user_id: this.getCookie('USER_ID'), // 操作员ID
          role: this.getCookie('USER_TYPE'), // 用户角色
        },
        content: 0,
      }

    },
    methods: {
      // 重置错误信息弹出层
      resetDetail() {
        var _t = this;
        _t.dialogDetailVisible = false;
        _t.detailTable = [];
      },
      // 获取单据类型字典
      getStatusData() {
        var _t = this;
        let str = "guid=GUID000722201906191628";
        let Base64 = require("js-base64").Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        var params = {
          guid: "GUID000722201906191628",
          token: keyToken
        };
        _t.$api.post("/tsGateWay/ticketUtility/queryDict", params, function (res) {
          // 查询成功
          if (res.rtCode && res.rtCode === "14010") {
            _t.statusList = res.rtData === null ? [] : res.rtData;
          }
        });
      },

      // 回收查询表格信息
      getRecycleData() {
        var _t = this;
        // location_number 不为空
        if (1) {
          // 校验认证操作员
          _t.recycleFormItem.dateTime = false;
          _t.recycleFormItem.station = false;
          if (!_t.formItem.dateTime) {
            _t.recycleFormItem.dateTime = true
          }
          var init = true;
          if (_t.getCookie('LOCATION_TYPE_ID') == '22') {
            if(_t.formItem.station == '') {
              _t.recycleFormItem.station = true;
              init =false
            }
          }
          // 校验密码
          // _t.blurInput(_t.recycleFormItem, 'passwordFlag', _t.recycleFormItem.operatorPassword);
          // 可以提交
          if (_t.recycleFormItem.dateTime === false && init) {
            _t.getRecycle('00'); // 装机
            _t.getRecycle('01'); // 补充
            _t.getRecycle('02'); // 清点
            _t.getRecycle('03'); // 回收

          }
        }
      },
      p(s) {
        return s < 10 ? '0' + s : s
      },
      // 改变线路
      changeLines(val) {
        var _t = this;
        if (val !== "") {
          _t.linesList.forEach(item => {
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
              _t.formItem.station = "";
              // 操作员下拉框置空
              _t.operatorIdList = [];
              // 操作员id置空
              _t.formItem.operationId = "";
            }
          });
        } else {
          // 选中线路为空
          _t.stationList = [];
          _t.formItem.station = "";
          _t.operatorIdList = [];
          _t.formItem.operationId = "";
        }
      },
      // 查询线路及车站
      getLinesAndStation() {
        var _t = this;
        _t.$api.post("/tsGateWay/ticketUtility/locationCascadeQuery", {}, function (res) {
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

                          }
                        });
                      });
                    }
                  }
                })
              }
            });
            _t.linesList = linesArr;
            _t.stationList = stationArr;
            _t.operatorIdList = operationArr;
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
      },
      // 获取回收信息
      getRecycle(type) {
        var _t = this;
        var loction = _t.formItem.station? _t.formItem.station: _t.cookieMap.location_number.toString()
        var d =  new Date(_t.formItem.dateTime);
        const resDate = d.getFullYear() + '-' + _t.p((d.getMonth() + 1)) + '-' + _t.p(d.getDate());
        let str = "location_number=" +  loction
          + "&operate_type=" + type
          + "&tvm_operator_id=" + _t.recycleFormItem.operatorUser.trim()
          + "&password=" + _t.recycleFormItem.operatorPassword.trim();
        let Base64 = require("js-base64").Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        var params = {
          flag: '0',
          balance_date: resDate,
          operate_flag: '1',
          location_number: loction,
          operate_type: type, // 00 装机 01 补充 02 清点 03 回收
          tvm_operator_id: _t.recycleFormItem.operatorUser.trim(),
          password: _t.recycleFormItem.operatorPassword.trim(),
          token: keyToken
        };

        _t.$api.post('/tsGateWay/tvmManager/getTvmOperationInfo', params, function (res) {
          if (res.rtCode && res.rtCode === '13010' && type === '00') {
            // 装机
            _t.recycleTableForLading = res.rtData === null ? [] : res.rtData;
          } else if (res.rtCode && res.rtCode === '13011' && type === '01') {
            // 补充
            _t.recycleTableForSupplement = res.rtData === null ? [] : res.rtData;
          } else if (res.rtCode && res.rtCode === '13012' && type === '02') {
            // 清点
            _t.recycleTableForMake = res.rtData === null ? [] : res.rtData;
          } else if (res.rtCode && res.rtCode === '13012' && type === '03') {
            _t.recycleFormItem.showModule = true; // 显示表格信息
            // 回收
            _t.recycleTableForRecycle = res.rtData;
          } else if (res.rtCode) {
            if (res.rtCode) {
              _t.content++;
              if (_t.content >= 4) {
                _t.content = 0;
                _t.alertDialogTip(_t, res.rtMessage);
              }
            } else {
              _t.alertDialogTip(_t, res.rtMessage);
            }

          }
        });
      },
      // 失去焦点时校验
      blurInput(item, flag, val) {
        item[flag] = val.trim() === '' ? true : false;
      },
    },
    created() {
      var _t = this;
      var locationNum = _t.getCookie('LOCATION_NUMBER');
      if (locationNum !== null && locationNum !== 'null') {
        _t.getStatusData();
        if (_t.getCookie('LOCATION_TYPE_ID') == '22') {
          _t.getLinesAndStation();
          _t.disabledBtn.createDis = true;
        }
      }
    }
  }
</script>

<style scoped>
 .title {
   font-size: 14px;
   margin-bottom: 10px;
 }
</style>
