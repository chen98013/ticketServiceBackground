<template>
  <Box>
    <!--基本信息-->
    <p class="title">基本信息</p>
    <div class="formBox-top">
      <el-form inline :model="formItem">
        <el-form-item class="marBottom15" label="线路：">
          <el-select
            @change="changeLines(formItem.lines)"
            v-model="formItem.lines" disabled>
            <el-option
              v-for="(item,index) in linesList"
              :key="index"
              :label="item.LINE_LOCATION_NAME"
              :value="item.LINE_LOCATION_NUMBER.toString()"/>
          </el-select>
        </el-form-item>
        <el-form-item class="marBottom15" label="车站：">
          <el-select
            @change="changeStation(formItem.station)"
            v-model="formItem.station" disabled>
            <el-option
              v-for="(item,index) in stationList"
              :key="index"
              :label="item.STATION_LOCATION_NAME"
              :value="item.LOCATION_NUMBER.toString()"/>
          </el-select>
        </el-form-item>
        <el-form-item class="marBottom15" label="操作员ID：">
          <el-select v-model="formItem.operationId" disabled>
            <el-option
              v-for="(item,index) in operatorIdList"
              :key="index"
              :label="item.USERNAME + '-' + item.USERID"
              :value="item.USERID.toString()"/>
          </el-select>
        </el-form-item>
        <el-form-item class="marBottom15" label="操作类型：">
          <el-select v-model="formItem.operate_type" disabled>
            <el-option
              v-for="(item,index) in statusList"
              :key="index"
              :label="item.NAME"
              :value="item.VALUE"/>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <!--装机-->
    <div v-if="showCode.lading">
      <el-form :model="ladingFormItem" inline>
        <!--装机信息-->
        <p class="title">装机信息</p>
        <el-table :data="ladingTableData" border stripe class="marBottom10">
          <el-table-column prop="device_name" label="设备名称" header-align="center" align="center"/>
          <el-table-column label="装机金额(元)" header-align="center" align="center">
            <template slot-scope="scope">
              <el-input v-model="scope.row.money"/>
            </template>
          </el-table-column>
          <el-table-column label="装票数量(张)" header-align="center" align="center">
            <template slot-scope="scope">
              <el-input
                oninput="value=value.replace(/[^\d]/g,'')"
                v-model="scope.row.ticket"/>
            </template>
          </el-table-column>
          <el-table-column label="备注" header-align="center" align="center">
            <template slot-scope="scope">
              <el-input v-model="scope.row.comment_info"/>
            </template>
          </el-table-column>
          <el-table-column label="操作" header-align="center" align="center">
            <template slot-scope="scope">
              <el-button type="danger" @click="deleteLading(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!--认证信息-->
        <p class="title">认证信息</p>
        <div class="formBox-top">
          <el-form-item class="marBottom15 star" label="认证ID：">
            <el-input
              @blur="blurInput(ladingFormItem,'userFlag',ladingFormItem.operatorUser)"
              v-model="ladingFormItem.operatorUser"
              class="width200"/>
            <span class="isNotNull" v-if="ladingFormItem.userFlag">必填项不能为空</span>
          </el-form-item>
          <el-form-item class="marBottom15 star" label="密码：">
            <el-input
              maxlength="6"
              @blur="blurInput(ladingFormItem,'passwordFlag',ladingFormItem.operatorPassword)"
              v-model="ladingFormItem.operatorPassword"
              class="width200"
              type="password"/>
            <span class="isNotNull" v-if="ladingFormItem.passwordFlag">必填项不能为空</span>
          </el-form-item>
        </div>
        <el-form-item>
          <el-button type="primary" v-btn-control @click="addLadingBtn">提交</el-button>
          <el-button type="warning" @click="resetData">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!--补充-->
    <div v-if="showCode.supplement">
      <el-form :model="supplementFormItem" inline>
        <!--售票员信息-->
        <p class="title">认证信息</p>
        <div class="formBox-top">
          <el-form-item class="marBottom15 star" label="认证ID：">
            <el-input
              @blur="blurInput(supplementFormItem,'userFlag',supplementFormItem.operatorUser)"
              v-model="supplementFormItem.operatorUser"
              class="width200"/>
            <span class="isNotNull" v-if="supplementFormItem.userFlag">必填项不能为空</span>
          </el-form-item>
          <el-form-item class="marBottom15 star" label="密码：">
            <el-input
              maxlength="6"
              @blur="blurInput(supplementFormItem,'passwordFlag',supplementFormItem.operatorPassword)"
              v-model="supplementFormItem.operatorPassword"
              class="width200"
              type="password"/>
            <span class="isNotNull" v-if="supplementFormItem.passwordFlag">必填项不能为空</span>
          </el-form-item>
          <el-form-item class="marBottom15">
            <el-button type="primary" @click="getSupplementData">确认</el-button>
          </el-form-item>
        </div>
        <!--装机信息-->
        <div v-if="supplementFormItem.showModule">
          <p class="title">装机信息</p>
          <el-table :data="supplementTableData" border stripe class="marBottom10">
            <el-table-column prop="device_name" label="设备名称" header-align="center" align="center"/>
            <el-table-column prop="allMoney" label="已装金额(元)" header-align="center" align="center"/>
            <el-table-column label="补充金额(元)" header-align="center" align="center">
              <template slot-scope="scope">
                <el-input v-model="scope.row.money"/>
              </template>
            </el-table-column>
            <el-table-column prop="allTicket" label="已装票数量(张)" header-align="center" align="center"/>
            <el-table-column label="补票数量(张)" header-align="center" align="center">
              <template slot-scope="scope">
                <el-input
                  oninput="value=value.replace(/[^\d]/g,'')"
                  v-model="scope.row.ticket"/>
              </template>
            </el-table-column>
            <el-table-column label="备注" header-align="center" align="center">
              <template slot-scope="scope">
                <el-input v-model="scope.row.comment_info"/>
              </template>
            </el-table-column>
            <el-table-column label="操作" header-align="center" align="center">
              <template slot-scope="scope">
                <el-button type="danger" @click="deleteSupplement(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <el-form-item>
          <el-button type="primary" v-btn-control @click="addSupplementBtn">提交</el-button>
          <el-button type="warning" @click="resetData">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!--清点-->
    <div v-if="showCode.make">
      <el-form :model="makeForm" inline>
        <!--售票员信息-->
        <p class="title">售票员信息</p>
        <div class="formBox-top">
          <el-form-item class="marBottom15 star" label="售票员ID：">
            <el-input
              @blur="blurInput(makeForm,'userFlag',makeForm.operatorUser)"
              v-model="makeForm.operatorUser"
              class="width200"/>
            <span class="isNotNull" v-if="makeForm.userFlag">必填项不能为空</span>
          </el-form-item>
          <el-form-item class="marBottom15 star" label="密码：">
            <el-input
              maxlength="6"
              @blur="blurInput(makeForm,'passwordFlag',makeForm.operatorPassword)"
              v-model="makeForm.operatorPassword"
              class="width200"
              type="password"/>
            <span class="isNotNull" v-if="makeForm.passwordFlag">必填项不能为空</span>
          </el-form-item>
          <el-form-item class="marBottom15">
            <el-button type="primary" @click="getMakeData">确认</el-button>
          </el-form-item>
        </div>
        <div v-if="makeForm.showModule">
          <!--清点信息-->
          <p class="title">清点信息</p>
          <el-table :data="makeTableData" border stripe class="marBottom10">
            <el-table-column prop="device_name" label="设备名称" header-align="center" align="center"/>
            <el-table-column label="清点金额(元)" header-align="center" align="center">
              <template slot-scope="scope">
                <el-input v-model="scope.row.money"/>
              </template>
            </el-table-column>
            <el-table-column label="清点单程票(有效)数量(张)" header-align="center" align="center">
              <template slot-scope="scope">
                <el-input
                  oninput="value=value.replace(/[^\d]/g,'')"
                  v-model="scope.row.ticket_youxiao"/>
              </template>
            </el-table-column>
            <el-table-column label="清点单程票(无效)数量(张)" header-align="center" align="center">
              <template slot-scope="scope">
                <el-input
                  oninput="value=value.replace(/[^\d]/g,'')"
                  v-model="scope.row.ticket_wuxiao"/>
              </template>
            </el-table-column>
            <el-table-column label="备注" header-align="center" align="center">
              <template slot-scope="scope">
                <el-input v-model="scope.row.comment_info"/>
              </template>
            </el-table-column>
            <el-table-column label="操作" header-align="center" align="center">
              <template slot-scope="scope">
                <el-button type="danger" @click="deleteMakeBtn(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <el-form-item>
          <el-button type="primary" v-btn-control @click="addMakeBtn">提交</el-button>
          <el-button type="warning" @click="resetData">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!--回收-->
    <div v-if="showCode.recycle">
      <el-form :model="recycleFormItem" inline>
        <!--售票员信息-->
        <p class="title">认证信息</p>
        <div class="formBox-top">
          <el-form-item class="marBottom15 star" label="认证ID：">
            <el-input
              class="width200"
              @blur="blurInput(recycleFormItem,'userFlag',recycleFormItem.operatorUser)"
              v-model="recycleFormItem.operatorUser"/>
            <span class="isNotNull" v-if="recycleFormItem.userFlag">必填项不能为空</span>
          </el-form-item>
          <el-form-item class="marBottom15 star" label="密码：">
            <el-input
              maxlength="6"
              class="width200"
              @blur="blurInput(recycleFormItem,'passwordFlag',recycleFormItem.operatorPassword)"
              v-model="recycleFormItem.operatorPassword"
              type="password"/>
            <span class="isNotNull" v-if="recycleFormItem.passwordFlag">必填项不能为空</span>
          </el-form-item>
          <el-form-item class="marBottom15">
            <el-button type="primary" @click="getRecycleData">确认</el-button>
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
            <el-table-column prop="device_name" label="设备名称" header-align="center" align="center"/>
            <el-table-column label="回收金额(元)" header-align="center" align="center">
              <template slot-scope="scope">
                <el-input v-model="scope.row.money"/>
              </template>
            </el-table-column>
            <el-table-column label="回收单程票(有效)数量(张)" header-align="center" align="center">
              <template slot-scope="scope">
                <el-input
                  oninput="value=value.replace(/[^\d]/g,'')"
                  v-model="scope.row.ticket_youxiao"/>
              </template>
            </el-table-column>
            <el-table-column label="回收单程票(无效)数量(张)" header-align="center" align="center">
              <template slot-scope="scope">
                <el-input
                  oninput="value=value.replace(/[^\d]/g,'')"
                  v-model="scope.row.ticket_wuxiao"/>
              </template>
            </el-table-column>
            <el-table-column label="备注" header-align="center" align="center">
              <template slot-scope="scope">
                <el-input v-model="scope.row.comment_info"/>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <el-form-item>
          <el-button type="primary" v-btn-control @click="addRecycleData">提交</el-button>
          <el-button type="warning" @click="resetData">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </Box>
</template>
<script>
  import Box from "../../../components/Box";

  export default {
    name: "TVMOperationDetail",
    components: {Box},
    data() {
      return {
        // 控制模块显示
        showCode: {
          lading: false, // 装机
          supplement: false, // 补充
          make: false, // 清点
          recycle: false, // 回收
        },
        // 操作类型
        statusList: [],
        // 线路集合
        linesList: [],
        // 车站集合
        stationList: [],
        // 操作员id集合
        operatorIdList: [],
        // 基本信息表单
        formItem: {
          lines: '', // 线路
          station: '', //车站
          operationId: '', // 操作员id
          operate_type: '', // 操作类型
        },
        // 装机表单
        ladingFormItem: {
          operatorUser: '', // 认证id
          operatorPassword: '', // 密码
          userFlag: false, // 操作员标识
          passwordFlag: false, // 密码标识
        },
        // 装机表格
        ladingTableData: [],
        // 补充表单
        supplementFormItem: {
          operatorUser: '', // 认证id
          operatorPassword: '', // 密码
          userFlag: false, // 操作员标识
          passwordFlag: false, // 密码标识
          showModule: false, // 控制表格区域显示隐藏
        },
        // 补充表格
        supplementTableData: [],
        // 清点表单
        makeForm: {
          operatorUser: '', // 认证id
          operatorPassword: '', // 密码
          userFlag: false, // 操作员标识
          passwordFlag: false, // 密码标识
          showModule: false, // 控制表格区域显示隐藏
        },
        // 清点表格
        makeTableData: [],
        // 回收表单
        recycleFormItem: {
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
      };
    },
    methods: {
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
      // 查询线路及车站
      getLinesAndStation() {
        var _t = this;
        var params = {};
        _t.$api.post("/tsGateWay/ticketUtility/locationCascadeQuery", params, function (res) {
          // 查到线路信息
          if (res.rtCode && res.rtCode === "14007") {
            var linesStationArr = res.rtData === null ? [] : res.rtData;
            // 处理线路/车站/操作员数据
            _t.dealWithLinesAndStation(linesStationArr);
          } else if (res.rtCode) {
            _t.$alert(res.rtMessage, "温馨提示", {
              confirmButtonText: "确定",
              cancelButtonText: "取消"
            }).then(() => {
              return false;
            });
          }
        });
      },
      // 处理线路/车站/操作员之间首次加载数据问题
      dealWithLinesAndStation(linesStationArr) {
        var _t = this;
        // 判断角色
        var role = _t.getCookie("USER_TYPE");
        var location = _t.getCookie("LOCATION_NUMBER");
        // 角色和location都不为空
        if (role !== null && role !== "null" && location !== null && location !== "null") {
          // 车站角色
          var linesArr = new Array(); // 线路集合
          var stationArr = new Array(); // 车站集合
          var operationArr = new Array(); // 操作员id集合
          var LINE_LOCATION_NUMBER = ""; // 选中的线路
          var LOCATION_NUMBER = ""; // 选中的车站
          var USERID = ""; // 选中的操作员
          if (role === "SC") {
            // SC登录的具体车站
            linesStationArr.forEach(item => {
              // 存在车站集合
              if (item.stationList && item.stationList !== null) {
                // 遍历车站
                item.stationList.forEach(val => {
                  // 找到了对应的车站
                  if (val.LOCATION_NUMBER.toString() === location) {
                    // 线路下拉框
                    linesArr[0] = item;
                    // 线路选中值
                    LINE_LOCATION_NUMBER = item.LINE_LOCATION_NUMBER.toString();
                    // 车站下拉框
                    stationArr[0] = val;
                    // 车站选中值
                    LOCATION_NUMBER = location;
                    // 存在操作员集合
                    if (val.userList && val.userList !== null) {
                      // 操作员集合赋值 允许多个操作员
                      operationArr = val.userList;
                      // 遍历操作员集合
                      operationArr.forEach(data => {
                        // 匹配到自身 并赋值
                        if (data.USERID === _t.getCookie("USER_ID")) {
                          USERID = data.USERID;
                        }
                      });
                    }
                  }
                });
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
            // 选中的操作员
            if (USERID !== "") {
              _t.formItem.operationId = USERID;
            }
          } else if (role === "MLC" && location.substr(0, 1) === "1") {
            // MLC登录的具体车站
            linesStationArr.forEach(item => {
              // 线路存在车站
              if (item.stationList && item.stationList !== null) {
                // 遍历车站
                item.stationList.forEach(val => {
                  // 找到了对应的车站
                  if (val.LOCATION_NUMBER.toString() === location) {
                    // 线路下拉框
                    linesArr = linesStationArr;
                    // 线路选中值
                    LINE_LOCATION_NUMBER = item.LINE_LOCATION_NUMBER.toString();
                    // 车站下拉框
                    stationArr = item.stationList;
                    // 车站选中值
                    LOCATION_NUMBER = location;
                    if (val.userList && val.userList !== null) {
                      operationArr = val.userList;
                      operationArr.forEach(data => {
                        if (data.USERID === _t.getCookie("USER_ID")) {
                          USERID = data.USERID;
                        }
                      });
                    }
                  }
                });
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
            // 选中的操作员
            if (USERID !== "") {
              _t.formItem.operationId = USERID;
            }
          }
          // 根据type类型判断
          if (_t.showCode.lading === true) {
            // 调取所有未装机的设备
            _t.getLadingData();
          }
        }
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
      // 改变车站
      changeStation(val) {
        var _t = this;
        if (val !== "") {
          // 遍历车站集合
          _t.stationList.forEach(item => {
            // 找到车站
            if (item.LOCATION_NUMBER.toString() === val) {
              // 存在操作员集合
              if (item.userList && item.userList !== null) {
                // 操作员集合赋值
                _t.operatorIdList = item.userList;
                // 遍历操作员集合
                _t.operatorIdList.forEach(data => {
                  // 找到自身
                  if (data.USERID === _t.getCookie("USER_ID")) {
                    _t.formItem.operationId = data.USERID;
                  } else {
                    // 置为空
                    _t.formItem.operationId = "";
                  }
                });
              } else {
                // 对应车站没有操作员集合
                _t.operatorIdList = [];
                _t.formItem.operationId = "";
              }
            }
          });
        } else {
          // 车站改变值为空
          _t.operatorIdList = [];
          _t.formItem.operationId = "";
        }
      },
      // 取消按钮
      resetData() {
        var _t = this;
        _t.$router.push({name: 'TVMOperation'});
      },
      // 失去焦点时校验
      blurInput(item, flag, val) {
        item[flag] = val.trim() === '' ? true : false;
      },
      // 查询装机表格信息(未装机的)
      getLadingData() {
        var _t = this;
        var location_number = _t.formItem.station;
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
              var tableData = new Array();
              var resData = res.rtData === null ? [] : res.rtData;
              resData.forEach((item) => {
                var obj = new Object();
                obj.device_id = item.DEVICE_ID; // 设备id
                obj.device_name = item.DEVICE_NAME; // 设备名称
                obj.money = '0'; // 装机金额
                obj.ticket = '0'; // 装票数量
                obj.comment_info = ''; // 备注
                tableData.push(obj);
              });
              _t.ladingTableData = tableData;
            } else {
              _t.alertDialogTip(_t, res.rtMessage);
            }
          });
        }
      },
      // 装机提交按钮
      addLadingBtn() {
        var _t = this;
        if (_t.formItem.station !== '' && _t.formItem.operationId !== '') {
          // 校验认证操作员
          _t.blurInput(_t.ladingFormItem, 'userFlag', _t.ladingFormItem.operatorUser);
          // 校验密码
          _t.blurInput(_t.ladingFormItem, 'passwordFlag', _t.ladingFormItem.operatorPassword);
          // 判断表格不能为空
          if (_t.ladingTableData.length !== 0) {
            // 表格数据条数不为空 校验金额和数量
            var errorNum = 0;
            var regMoney = _t.$config.isMoneyNumber();
            var regNumber = _t.$config.isNumber();
            _t.ladingTableData.forEach((item) => {
              // 校验装机金额
              if (item.money.trim() === '' || regMoney.test(item.money.trim()) === false) {
                errorNum++;
              }
              // 校验装票数量
              if (item.ticket.trim() === '' || regNumber.test(item.ticket.trim()) === false) {
                errorNum++;
              }
            });
            if (errorNum === 0) {
              // 错误数量为0 可以提交
              if (_t.ladingFormItem.userFlag === false
                && _t.ladingFormItem.passwordFlag === false) {
                let str = "location_number=" + _t.formItem.station
                  + "&operate_type=" + "00"
                  + "&tvm_operator_id=" + _t.ladingFormItem.operatorUser.trim()
                  + "&password=" + _t.ladingFormItem.operatorPassword.trim()
                  + "&tvm_creator_id=" + _t.formItem.operationId;
                let Base64 = require("js-base64").Base64;
                let keyToken = _t.$md5(Base64.encode(str));
                var params = {
                  location_number: _t.formItem.station,
                  operate_type: "00", // 00 装机
                  tvm_operator_id: _t.ladingFormItem.operatorUser.trim(),
                  password: _t.ladingFormItem.operatorPassword.trim(),
                  tvm_creator_id: _t.formItem.operationId,
                  deviceList: _t.ladingTableData,
                  token: keyToken
                };
                _t.$api.post('/tsGateWay/tvmManager/tvmInstall', params, function (res) {
                  if (res.rtCode && res.rtCode === '13002') {
                    _t.$alert(res.rtMessage, "温馨提示", {
                      confirmButtonText: "确定",
                      cancelButtonText: "取消"
                    }).then(() => {
                      _t.$router.push({name: 'TVMOperation'});
                    }).catch(() => {
                      _t.$router.push({name: 'TVMOperation'});
                    });
                  } else if (res.rtCode) {
                    _t.alertDialogTip(_t, res.rtMessage);
                  }
                });
              }
            } else {
              // 错误数量不为0 提示
              _t.alertDialogTip(_t, '请检查装机金额、装票数量是否为空或者格式是否正确!');
            }
          } else {
            // 表格数据为空
            _t.alertDialogTip(_t, '表格数据条数不能为空!');
          }
        } else {
          _t.alertDialogTip(_t, '车站及操作员ID不能为空!');
        }
      },
      // 装机表格删除
      deleteLading(index) {
        var _t = this;
        _t.ladingTableData.splice(index, 1);
      },
      // 补充查询表格信息
      getSupplementData() {
        var _t = this;
        // location_number 不为空
        if (_t.formItem.station !== '') {
          // 校验认证操作员
          _t.blurInput(_t.supplementFormItem, 'userFlag', _t.supplementFormItem.operatorUser);
          // 校验密码
          _t.blurInput(_t.supplementFormItem, 'passwordFlag', _t.supplementFormItem.operatorPassword);
          // 可以提交
          if (_t.supplementFormItem.userFlag === false && _t.supplementFormItem.passwordFlag === false) {
            let str = "location_number=" + _t.formItem.station
              + "&operate_type=" + "01"
              + "&tvm_operator_id=" + _t.supplementFormItem.operatorUser.trim()
              + "&password=" + _t.supplementFormItem.operatorPassword.trim();
            let Base64 = require("js-base64").Base64;
            let keyToken = _t.$md5(Base64.encode(str));
            var params = {
              flag: '1',
              operate_flag: '0',
              location_number: _t.formItem.station,
              operate_type: '01', // 01 补充
              tvm_operator_id: _t.supplementFormItem.operatorUser.trim(),
              password: _t.supplementFormItem.operatorPassword.trim(),
              token: keyToken
            };
            _t.$api.post('/tsGateWay/tvmManager/getTvmOperationInfo', params, function (res) {
              if (res.rtCode && res.rtCode === '13011') {
                _t.supplementFormItem.showModule = true; // 显示表格数据
                var tableData = new Array();
                var resData = res.rtData === null ? [] : res.rtData;
                resData.forEach((item) => {
                  var obj = new Object();
                  obj.device_id = item.DEVICE_ID; // 设备id
                  obj.device_name = item.DEVICE_NAME; // 设备名称
                  obj.allMoney = item.MONEY.toString(); // 已装金额
                  obj.money = '0'; // 补充金额
                  obj.allTicket = item.TICKET_YOUXIAO === undefined ? '0' : item.TICKET_YOUXIAO.toString(); // 已装票数量
                  obj.ticket = '0'; // 补票数量
                  obj.comment_info = ''; // 备注
                  tableData.push(obj);
                });
                _t.supplementTableData = tableData;
              } else {
                _t.alertDialogTip(_t, res.rtMessage);
              }
            });
          }
        }
      },
      // 补充表格删除
      deleteSupplement(index) {
        var _t = this;
        _t.supplementTableData.splice(index, 1);
      },
      // 补充提交
      addSupplementBtn() {
        var _t = this;
        if (_t.formItem.station !== '' && _t.formItem.operationId !== '') {
          if (_t.supplementFormItem.showModule) {
            // 校验认证操作员
            _t.blurInput(_t.supplementFormItem, 'userFlag', _t.supplementFormItem.operatorUser);
            // 校验密码
            _t.blurInput(_t.supplementFormItem, 'passwordFlag', _t.supplementFormItem.operatorPassword);
            // 校验表格
            if (_t.supplementTableData.length !== 0) {
              // 表格数据条数不为空 校验金额和数量
              var errorNum = 0;
              var regMoney = _t.$config.isMoneyNumber();
              var regNumber = _t.$config.isNumber();
              _t.supplementTableData.forEach((item) => {
                // 校验补充金额
                if (item.money.trim() === '' || regMoney.test(item.money.trim()) === false) {
                  errorNum++;
                }
                // 校验补票数量
                if (item.ticket.trim() === '' || regNumber.test(item.ticket.trim()) === false) {
                  errorNum++;
                }
              });
              if (errorNum === 0) {
                // 错误数量为0 可以提交
                if (_t.supplementFormItem.userFlag === false
                  && _t.supplementFormItem.passwordFlag === false) {
                  let str = "location_number=" + _t.formItem.station
                    + "&operate_type=" + "01"
                    + "&tvm_operator_id=" + _t.supplementFormItem.operatorUser.trim()
                    + "&password=" + _t.supplementFormItem.operatorPassword.trim()
                    + "&tvm_creator_id=" + _t.formItem.operationId;
                  let Base64 = require("js-base64").Base64;
                  let keyToken = _t.$md5(Base64.encode(str));
                  var params = {
                    location_number: _t.formItem.station,
                    operate_type: "01", // 01 补充
                    tvm_operator_id: _t.supplementFormItem.operatorUser.trim(),
                    password: _t.supplementFormItem.operatorPassword.trim(),
                    tvm_creator_id: _t.formItem.operationId,
                    deviceList: _t.supplementTableData,
                    token: keyToken
                  };
                  _t.$api.post('/tsGateWay/tvmManager/tvmSupply', params, function (res) {
                    if (res.rtCode && res.rtCode === '13003') {
                      _t.$alert(res.rtMessage, "温馨提示", {
                        confirmButtonText: "确定",
                        cancelButtonText: "取消"
                      }).then(() => {
                        _t.$router.push({name: 'TVMOperation'});
                      }).catch(() => {
                        _t.$router.push({name: 'TVMOperation'});
                      });
                    } else if (res.rtCode) {
                      _t.alertDialogTip(_t, res.rtMessage);
                    }
                  });
                }
              } else {
                // 错误数量不为0 提示
                _t.alertDialogTip(_t, '请检查补充金额、补票数量是否为空或者格式是否正确!');
              }
            } else {
              _t.alertDialogTip(_t, '表格数据条数不能为空!');
            }
          } else {
            _t.alertDialogTip(_t, '请先查询装机信息记录!');
          }
        } else {
          _t.alertDialogTip(_t, '车站及操作员ID不能为空!');
        }
      },
      // 清点查询表格信息
      getMakeData() {
        var _t = this;
        // location_number 不为空
        if (_t.formItem.station !== '') {
          // 校验认证操作员
          _t.blurInput(_t.makeForm, 'userFlag', _t.makeForm.operatorUser);
          // 校验密码
          _t.blurInput(_t.makeForm, 'passwordFlag', _t.makeForm.operatorPassword);
          // 可以提交
          if (_t.makeForm.userFlag === false && _t.makeForm.passwordFlag === false) {
            let str = "location_number=" + _t.formItem.station
              + "&operate_type=" + "02"
              + "&tvm_operator_id=" + _t.makeForm.operatorUser.trim()
              + "&password=" + _t.makeForm.operatorPassword.trim();
            let Base64 = require("js-base64").Base64;
            let keyToken = _t.$md5(Base64.encode(str));
            var params = {
              flag: '1',
              operate_flag: '0',
              location_number: _t.formItem.station,
              operate_type: '02', // 02 清点
              tvm_operator_id: _t.makeForm.operatorUser.trim(),
              password: _t.makeForm.operatorPassword.trim(),
              token: keyToken
            };
            _t.$api.post('/tsGateWay/tvmManager/getTvmOperationInfo', params, function (res) {
              if (res.rtCode && res.rtCode === '13012') {
                _t.makeForm.showModule = true; // 显示表格信息
                var tableData = new Array();
                var resData = res.rtData === null ? [] : res.rtData;
                resData.forEach((item) => {
                  var obj = new Object();
                  obj.device_id = item.DEVICE_ID; // 设备id
                  obj.device_name = item.DEVICE_NAME; // 设备名称
                  obj.money = '0'; // 清点金额
                  obj.ticket_youxiao = '0'; // 有效数量
                  obj.ticket_wuxiao = '0'; // 有效数量
                  obj.comment_info = ''; // 备注
                  tableData.push(obj);
                });
                _t.makeTableData = tableData;
              }
            });
          }
        }
      },
      // 删除清点表格数据
      deleteMakeBtn(index) {
        var _t = this;
        _t.makeTableData.splice(index, 1);
      },
      // 清点提交
      addMakeBtn() {
        var _t = this;
        if (_t.formItem.station !== '' && _t.formItem.operationId !== '') {
          if (_t.makeForm.showModule) {
            // 校验认证操作员
            _t.blurInput(_t.makeForm, 'userFlag', _t.makeForm.operatorUser);
            // 校验密码
            _t.blurInput(_t.makeForm, 'passwordFlag', _t.makeForm.operatorPassword);
            // 校验表格
            if (_t.makeTableData.length !== 0) {
              // 表格数据条数不为空 校验金额和数量
              var errorNum = 0;
              var regMoney = _t.$config.isMoneyNumber();
              var regNumber = _t.$config.isNumber();
              _t.makeTableData.forEach((item) => {
                // 校验清点金额
                if (item.money.trim() === '' || regMoney.test(item.money.trim()) === false) {
                  errorNum++;
                }
                // 校验有效票数量
                if (item.ticket_youxiao.trim() === '' || regNumber.test(item.ticket_youxiao.trim()) === false) {
                  errorNum++;
                }
                // 校验无效票数量
                if (item.ticket_wuxiao.trim() === '' || regNumber.test(item.ticket_wuxiao.trim()) === false) {
                  errorNum++;
                }
              });
              if (errorNum === 0) {
                // 错误数量为0 可以提交
                if (_t.makeForm.userFlag === false
                  && _t.makeForm.passwordFlag === false) {
                  let str = "location_number=" + _t.formItem.station
                    + "&operate_type=" + "02"
                    + "&tvm_operator_id=" + _t.makeForm.operatorUser.trim()
                    + "&password=" + _t.makeForm.operatorPassword.trim()
                    + "&tvm_creator_id=" + _t.formItem.operationId;
                  let Base64 = require("js-base64").Base64;
                  let keyToken = _t.$md5(Base64.encode(str));
                  var params = {
                    location_number: _t.formItem.station,
                    operate_type: "02", // 02 清点
                    tvm_operator_id: _t.makeForm.operatorUser.trim(),
                    password: _t.makeForm.operatorPassword.trim(),
                    tvm_creator_id: _t.formItem.operationId,
                    deviceList: _t.makeTableData,
                    token: keyToken
                  };
                  _t.$api.post('/tsGateWay/tvmManager/tvmCheck', params, function (res) {
                    if (res.rtCode && res.rtCode === '13004') {
                      _t.$alert(res.rtMessage, "温馨提示", {
                        confirmButtonText: "确定",
                        cancelButtonText: "取消"
                      }).then(() => {
                        _t.$router.push({name: 'TVMOperation'});
                      }).catch(() => {
                        _t.$router.push({name: 'TVMOperation'});
                      });
                    } else if (res.rtCode) {
                      _t.alertDialogTip(_t, res.rtMessage);
                    }
                  });
                }
              } else {
                // 错误数量不为0 提示
                _t.alertDialogTip(_t, '请检查清点金额、有效数量及无效数量是否为空或者格式是否正确!');
              }
            } else {
              // 表格数据为空
              _t.alertDialogTip(_t, '表格数据条数不能为空!');
            }
          } else {
            _t.alertDialogTip(_t, '请先查询清点信息记录!');
          }
        } else {
          _t.alertDialogTip(_t, '车站及操作员ID不能为空!');
        }
      },
      // 回收查询表格信息
      getRecycleData() {
        var _t = this;
        // location_number 不为空
        if (_t.formItem.station !== '') {
          // 校验认证操作员
          _t.blurInput(_t.recycleFormItem, 'userFlag', _t.recycleFormItem.operatorUser);
          // 校验密码
          _t.blurInput(_t.recycleFormItem, 'passwordFlag', _t.recycleFormItem.operatorPassword);
          // 可以提交
          if (_t.recycleFormItem.userFlag === false && _t.recycleFormItem.passwordFlag === false) {
            _t.getRecycle('00'); // 装机
            _t.getRecycle('01'); // 补充
            _t.getRecycle('02'); // 清点
            _t.getRecycle('03'); // 回收

          }
        }
      },
      // 获取回收信息
      getRecycle(type) {
        var _t = this;
        let str = "location_number=" + _t.formItem.station
          + "&operate_type=" + type
          + "&tvm_operator_id=" + _t.recycleFormItem.operatorUser.trim()
          + "&password=" + _t.recycleFormItem.operatorPassword.trim();
        let Base64 = require("js-base64").Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        var params = {
          flag: '1',
          operate_flag: '0',
          location_number: _t.formItem.station,
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
            var tableData = new Array();
            var resData = res.rtData === null ? [] : res.rtData;
            resData.forEach((item) => {
              var obj = new Object();
              obj.device_id = item.DEVICE_ID; // 设备id
              obj.device_name = item.DEVICE_NAME; // 设备名称
              obj.money = '0'; // 回收金额
              obj.ticket_wuxiao = '0'; // 无效数量
              obj.ticket_youxiao = '0'; // 有效数量
              obj.comment_info = ''; // 备注
              tableData.push(obj);
            });
            _t.recycleTableForRecycle = tableData;
          }
        });
      },
      // 提交回收信息
      addRecycleData() {
        var _t = this;
        if (_t.formItem.station !== '' && _t.formItem.operationId !== '') {
          if (_t.recycleFormItem.showModule) {
            // 校验认证操作员
            _t.blurInput(_t.recycleFormItem, 'userFlag', _t.recycleFormItem.operatorUser);
            // 校验密码
            _t.blurInput(_t.recycleFormItem, 'passwordFlag', _t.recycleFormItem.operatorPassword);
            // 校验表格
            if (_t.recycleTableForRecycle.length !== 0) {
              // 表格数据条数不为空 校验金额和数量
              var errorNum = 0;
              var regMoney = _t.$config.isMoneyNumber();
              var regNumber = _t.$config.isNumber();
              _t.makeTableData.forEach((item) => {
                // 校验回收金额
                if (item.money.trim() === '' || regMoney.test(item.money.trim()) === false) {
                  errorNum++;
                }
                // 校验有效票数量
                if (item.ticket_youxiao.trim() === '' || regNumber.test(item.ticket_youxiao.trim()) === false) {
                  errorNum++;
                }
                // 校验无效票数量
                if (item.ticket_wuxiao.trim() === '' || regNumber.test(item.ticket_wuxiao.trim()) === false) {
                  errorNum++;
                }
              });
              if (errorNum === 0) {
                // 错误数量为0 可以提交
                if (_t.recycleFormItem.userFlag === false
                  && _t.recycleFormItem.passwordFlag === false) {
                  let str = "location_number=" + _t.formItem.station
                    + "&operate_type=" + "03"
                    + "&tvm_operator_id=" + _t.recycleFormItem.operatorUser.trim()
                    + "&password=" + _t.recycleFormItem.operatorPassword.trim()
                    + "&tvm_creator_id=" + _t.formItem.operationId;
                  let Base64 = require("js-base64").Base64;
                  let keyToken = _t.$md5(Base64.encode(str));
                  var params = {
                    location_number: _t.formItem.station,
                    operate_type: "03", // 03 回收
                    tvm_operator_id: _t.recycleFormItem.operatorUser.trim(),
                    password: _t.recycleFormItem.operatorPassword.trim(),
                    tvm_creator_id: _t.formItem.operationId,
                    deviceList: _t.recycleTableForRecycle,
                    token: keyToken
                  };
                  _t.$api.post('/tsGateWay/tvmManager/tvmRecover', params, function (res) {
                    if (res.rtCode && res.rtCode === '13005') {
                      _t.$alert(res.rtMessage, "温馨提示", {
                        confirmButtonText: "确定",
                        cancelButtonText: "取消"
                      }).then(() => {
                        _t.$router.push({name: 'TVMOperation'});
                      }).catch(() => {
                        _t.$router.push({name: 'TVMOperation'});
                      });
                    } else if (res.rtCode) {
                      _t.alertDialogTip(_t, res.rtMessage);
                    }
                  });
                }
              } else {
                // 错误数量不为0 提示
                _t.alertDialogTip(_t, '请检查回收金额、有效数量及无效数量是否为空或者格式是否正确!');
              }
            } else {
              // 表格数据为空
              _t.alertDialogTip(_t, '表格数据条数不能为空!');
            }
          } else {
            _t.alertDialogTip(_t, '请先查询回收信息记录!');
          }
        } else {
          _t.alertDialogTip(_t, '车站及操作员ID不能为空!');
        }
      }
    },
    created() {
      var _t = this;
      // 从路由和缓存中获取显示的标识
      var code = _t.$route.params.TVM_TYPE ? _t.$route.params.TVM_TYPE : localStorage.getItem('TVM_TYPE');
      if (code === 'lading') {
        // 装机
        _t.showCode.lading = true;
        _t.showCode.supplement = false;
        _t.showCode.make = false;
        _t.showCode.recycle = false;
        _t.formItem.operate_type = '00';
      } else if (code === 'supplement') {
        // 补充
        _t.showCode.lading = false;
        _t.showCode.supplement = true;
        _t.showCode.make = false;
        _t.showCode.recycle = false;
        _t.formItem.operate_type = '01';
      } else if (code === 'make') {
        // 清点
        _t.showCode.lading = false;
        _t.showCode.supplement = false;
        _t.showCode.make = true;
        _t.showCode.recycle = false;
        _t.formItem.operate_type = '02';
      } else if (code === 'recycle') {
        // 回收
        _t.showCode.lading = false;
        _t.showCode.supplement = false;
        _t.showCode.make = false;
        _t.showCode.recycle = true;
        _t.formItem.operate_type = '03';
      } else {
        _t.showCode.lading = false;
        _t.showCode.supplement = false;
        _t.showCode.make = false;
        _t.showCode.recycle = false;
      }
      var roleName = _t.getCookie('USER_TYPE');
      var locationNum = _t.getCookie('LOCATION_NUMBER');
      if (roleName !== null && roleName !== 'null' && locationNum !== null && locationNum !== 'null') {
        if (roleName === 'SC' || (roleName === 'MLC' && locationNum.substr(0, 1) === '1')) {
          // 本页面业务逻辑
          _t.getStatusData();
          _t.getLinesAndStation();
        }
      }
    },
    beforeDestroy() {
      localStorage.removeItem('TVM_TYPE');
    }
  };
</script>
<style scoped>
  p.title {
    font-size: 14px;
    margin-bottom: 10px;
  }
</style>

