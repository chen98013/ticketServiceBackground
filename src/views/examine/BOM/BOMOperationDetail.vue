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
          <el-select filterable v-model="formItem.operationId" disabled>
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
    <!--配票/备用金-->
    <div v-if="showCode.withTicketAndMoney" class="withTicketAndMoney">
      <el-form :model="withTicketFormItem" inline>
        <!--配票信息-->
        <p class="title">配票信息</p>
        <div class="formBox-top">
          <el-form-item label="车票类型：">
            <el-select
              @change="changeWithTicket(withTicketFormItem.type)"
              v-model="withTicketFormItem.type">
              <el-option
                v-for="(item,index) in ticketTypeList"
                :key="index"
                :label="item.STOCK_TYPE_NAME_CN"
                :value="item.STOCK_MANAGE_TYPE_ID"/>
            </el-select>
          </el-form-item>
          <el-form-item label="库存数量(张)：">
            <el-input v-model="withTicketFormItem.allTicket" disabled class="width200"/>
          </el-form-item>
          <el-form-item label="面值(元)：">
            <el-input v-model="withTicketFormItem.ticket_value" disabled/>
          </el-form-item>
          <el-form-item label="配票数量(张)：">
            <el-input
              oninput="value=value.replace(/[^\d]/g,'')"
              class="width200"
              v-model="withTicketFormItem.ticketNum"/>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="addTicketBtn">添加</el-button>
          </el-form-item>
          <el-table :data="withTicketTableData" border stripe class="marBottom15">
            <el-table-column prop="stock_manage_type_name" label="车票类型"/>
            <el-table-column prop="ticket_value" label="面值(元)"/>
            <el-table-column prop="quantity_borrow" label="配票数量(张)"/>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="danger" @click="deleteAddTicket(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <!--备用金信息-->
        <p class="title">备用金信息</p>
        <div class="formBox-top">
          <el-form-item class="marBottom15" label="备用金库存金额(元)：">
            <el-input v-model="withTicketFormItem.allMoney" disabled/>
          </el-form-item>
          <el-form-item class="marBottom15 star" label="操作金额(元)：">
            <el-input
              @blur="ruleMoneyWithTicket(withTicketFormItem,withTicketFormItem.money,'moneyFlag','moneyTip','allMoney')"
              v-model="withTicketFormItem.money"/>
            <span class="isNotNull" v-if="withTicketFormItem.moneyFlag">{{withTicketFormItem.moneyTip}}</span>
          </el-form-item>
        </div>
        <!--售票员信息-->
        <p class="title">售票员信息</p>
        <div class="formBox-top">
          <el-form-item class="marBottom15 star" label="售票员ID：">
            <el-input
              maxlength="6"
              @blur="blurInput(withTicketFormItem,'userFlag',withTicketFormItem.operatorUser)"
              v-model="withTicketFormItem.operatorUser"
              class="width200"/>
            <span class="isNotNull" v-if="withTicketFormItem.userFlag">必填项不能为空</span>
          </el-form-item>
          <el-form-item class="marBottom15 star" label="密码：">
            <el-input
              maxlength="6"
              @blur="blurInput(withTicketFormItem,'passwordFlag',withTicketFormItem.operatorPassword)"
              v-model="withTicketFormItem.operatorPassword"
              class="width200"
              type="password"/>
            <span class="isNotNull" v-if="withTicketFormItem.passwordFlag">必填项不能为空</span>
          </el-form-item>
        </div>
        <el-form-item>
          <el-button type="primary" v-btn-control @click="addTicketAndMoney">提交</el-button>
          <el-button type="warning" @click="resetData">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!--追加票和备用金-->
    <div v-if="showCode.addTicketAndMoney" class="addTicketAndMoney">
      <el-form :model="addTicketFormItem" inline>
        <!--售票员信息-->
        <p class="title">售票员信息</p>
        <div class="formBox-top">
          <el-form-item class="marBottom15 star" label="售票员ID：">
            <el-input
              @blur="blurInput(addTicketFormItem,'userFlag',addTicketFormItem.operatorUser)"
              class="width200"
              v-model="addTicketFormItem.operatorUser"/>
            <span class="isNotNull" v-if="addTicketFormItem.userFlag">必填项不能为空</span>
          </el-form-item>
          <el-form-item class="marBottom15 star" label="密码：">
            <el-input
              maxlength="6"
              class="width200"
              @blur="blurInput(addTicketFormItem,'passwordFlag',addTicketFormItem.operatorPassword)"
              v-model="addTicketFormItem.operatorPassword"
              type="password"/>
            <span class="isNotNull" v-if="addTicketFormItem.passwordFlag">必填项不能为空</span>
          </el-form-item>
          <el-form-item class="marBottom15">
            <el-button type="primary" @click="getAddData">确定</el-button>
          </el-form-item>
        </div>
        <!--控制表格部分显示隐藏-->
        <div v-if="addTicketFormItem.showModule">
          <!--配票类型-->
          <p class="title">配票信息</p>
          <div class="formBox-top">
            <el-form-item label="车票类型：">
              <el-select
                @change="changeAddTicket(addTicketFormItem.type)"
                v-model="addTicketFormItem.type">
                <el-option
                  v-for="(item,index) in ticketTypeList"
                  :key="index"
                  :label="item.STOCK_TYPE_NAME_CN"
                  :value="item.STOCK_MANAGE_TYPE_ID"/>
              </el-select>
            </el-form-item>
            <el-form-item label="库存数量(张)：">
              <el-input v-model="addTicketFormItem.allTicket" disabled class="width200"/>
            </el-form-item>
            <el-form-item label="面值(元)：">
              <el-input v-model="addTicketFormItem.ticket_value" disabled/>
            </el-form-item>
            <el-form-item label="追加数量(张)：">
              <el-input
                oninput="value=value.replace(/[^\d]/g,'')"
                class="width200"
                v-model="addTicketFormItem.ticketNum"/>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="addToTicketBtn">添加</el-button>
            </el-form-item>
            <el-table :data="addTicketTableData" border stripe>
              <el-table-column prop="stock_manage_type_name" label="车票类型"/>
              <el-table-column prop="ticket_value" label="面值(元)"/>
              <el-table-column prop="receive_ticket_num" label="已领数量(张)"/>
              <el-table-column prop="quantity_borrow" label="追加数量(张)"/>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="danger" @click="deleteAddToTicket(scope.$index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <!--备用金信息-->
          <p class="title">备用金信息</p>
          <div class="formBox-top">
            <el-form-item class="marBottom15" label="备用金库存金额(元)：">
              <el-input v-model="addTicketFormItem.allMoney" class="width200" disabled/>
            </el-form-item>
            <el-form-item class="marBottom15" label="已领用金额(元)：">
              <el-input v-model="addTicketFormItem.useMoney" class="width200" disabled/>
            </el-form-item>
            <el-form-item class="marBottom15 star" label="追加金额(元)：">
              <el-input
                @blur="ruleMoneyWithTicket(addTicketFormItem,addTicketFormItem.money,'moneyFlag','moneyTip','allMoney')"
                v-model="addTicketFormItem.money"
                class="width200"/>
              <span class="isNotNull" v-if="addTicketFormItem.moneyFlag">{{addTicketFormItem.moneyTip}}</span>
            </el-form-item>
          </div>
        </div>
        <el-form-item>
          <el-button type="primary" v-btn-control @click="addToTicketAndMoney">提交</el-button>
          <el-button type="warning" @click="resetData">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!--收益预收-->
    <div v-if="showCode.incomeInAdvance" class="incomeInAdvance">
      <el-form :model="IncomeInAdvanceFormItem" inline>
        <!--售票员信息-->
        <p class="title">售票员信息</p>
        <div class="formBox-top">
          <el-form-item class="marBottom15 star" label="售票员ID：">
            <el-input
              @blur="blurInput(IncomeInAdvanceFormItem,'userFlag',IncomeInAdvanceFormItem.operatorUser)"
              v-model="IncomeInAdvanceFormItem.operatorUser"
              class="width200"/>
            <span class="isNotNull" v-if="IncomeInAdvanceFormItem.userFlag">必填项不能为空</span>
          </el-form-item>
          <el-form-item class="marBottom15" label="密码：">
            <el-input
              maxlength="6"
              @blur="blurInput(IncomeInAdvanceFormItem,'passwordFlag',IncomeInAdvanceFormItem.operatorPassword)"
              v-model="IncomeInAdvanceFormItem.operatorPassword"
              type="password"
              class="width200"/>
            <span class="isNotNull" v-if="IncomeInAdvanceFormItem.passwordFlag">必填项不能为空</span>
          </el-form-item>
          <el-form-item class="marBottom15">
            <el-button type="primary" @click="getIncomeInAdvance">确认</el-button>
          </el-form-item>
        </div>
        <!--控制表格部分显示隐藏-->
        <div v-if="IncomeInAdvanceFormItem.showModule">
          <!--收益金额预收信息-->
          <p class="title">收益金额预收信息</p>
          <div class="formBox-top">
            <el-form-item class="marBottom15" label="操作员收益总金额(元)：">
              <el-input v-model="IncomeInAdvanceFormItem.allMoney" class="width200" disabled/>
            </el-form-item>
            <el-form-item class="marBottom15 star" label="收益预收金额(元)：">
              <el-input
                @blur="ruleMoneyWithTicket(IncomeInAdvanceFormItem,IncomeInAdvanceFormItem.money,'moneyFlag','moneyTip','allMoney')"
                v-model="IncomeInAdvanceFormItem.money"
                class="width200"/>
              <span class="isNotNull"
                    v-if="IncomeInAdvanceFormItem.moneyFlag">{{IncomeInAdvanceFormItem.moneyTip}}</span>
            </el-form-item>
          </div>
        </div>
        <el-form-item>
          <el-button type="primary" v-btn-control @click="addIncodeInAdvanceData">提交</el-button>
          <el-button type="warning" @click="resetData">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!--回收-->
    <div v-if="showCode.recycle" class="recycle">
      <el-form :model="recycleFormItem" inline>
        <!--售票员信息-->
        <p class="title">售票员信息</p>
        <div class="formBox-top">
          <el-form-item class="marBottom15 star" label="售票员ID：">
            <el-input
              @blur="blurInput(recycleFormItem,'userFlag',recycleFormItem.operatorUser)"
              v-model="recycleFormItem.operatorUser"
              class="width200"/>
            <span class="isNotNull" v-if="recycleFormItem.userFlag">必填项不能为空</span>
          </el-form-item>
          <el-form-item class="marBottom15 star" label="密码：">
            <el-input
              maxlength="6"
              @blur="blurInput(recycleFormItem,'passwordFlag',recycleFormItem.operatorPassword)"
              v-model="recycleFormItem.operatorPassword"
              type="password"
              class="width200"/>
            <span class="isNotNull" v-if="recycleFormItem.passwordFlag">必填项不能为空</span>
          </el-form-item>
          <el-form-item class="marBottom15">
            <el-button type="primary" @click="getRecycleData">确认</el-button>
          </el-form-item>
        </div>
        <div v-if="recycleFormItem.showModule">
          <!--车票回收信息-->
          <p class="title">车票回收信息</p>
          <el-table :data="recycleTableData" border stripe class="marBottom10">
            <el-table-column prop="stock_manage_type_name" label="车票类型"/>
            <el-table-column prop="ticket_value" label="面值(元)"/>
            <el-table-column prop="use_ticket_number" label="配票数量(张)"/>
            <el-table-column prop="add_ticket_number" label="追加数量(张)"/>
            <el-table-column label="归还数量(张)">
              <template slot-scope="scope">
                <el-input
                  oninput="value=value.replace(/[^\d]/g,'')"
                  v-model="scope.row.return_ticket_number"/>
              </template>
            </el-table-column>
            <el-table-column label="遗失票卡(张)">
              <template slot-scope="scope">
                <el-input
                  oninput="value=value.replace(/[^\d]/g,'')"
                  v-model="scope.row.lose_ticket_number"/>
              </template>
            </el-table-column>
            <el-table-column label="无效票卡(张)">
              <template slot-scope="scope">
                <el-input
                  oninput="value=value.replace(/[^\d]/g,'')"
                  v-model="scope.row.invalid_ticket_number"/>
              </template>
            </el-table-column>
            <el-table-column label="其他(张)">
              <template slot-scope="scope">
                <el-input
                  oninput="value=value.replace(/[^\d]/g,'')"
                  v-model="scope.row.other_ticket_number"/>
              </template>
            </el-table-column>
          </el-table>
          <!--备用金信息-->
          <p class="title">备用金信息</p>
          <div class="formBox-top">
            <el-form-item class="marBottom15" label="配备用金(元)：">
              <el-input v-model="recycleFormItem.sendMoney" disabled/>
            </el-form-item>
            <el-form-item class="marBottom15" label="追加备用金(元)：">
              <el-input v-model="recycleFormItem.addMoney" disabled/>
            </el-form-item>
          </div>
          <!--收益金额信息-->
          <p class="title">收益金额信息</p>
          <div class="formBox-top">
            <el-form-item class="marBottom15" label="收益预收金额(元)：">
              <el-input v-model="recycleFormItem.allMoney" disabled/>
            </el-form-item>
          </div>
          <!--回收信息-->
          <p class="title">回收信息</p>
          <div class="formBox-top">
            <el-form-item class="marBottom15 star" label="回收金额(元)：">
              <el-input
                @blur="ruleRecycleData(recycleFormItem.money)"
                v-model="recycleFormItem.money"
                class="width200"/>
              <span class="isNotNull" v-model="recycleFormItem.moneyFlag">{{recycleFormItem.moneyTip}}</span>
            </el-form-item>
          </div>
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
    import Box from '../../../components/Box';

    export default {
        name: "BOMOperationDetail",
        components: {Box},
        data() {
            return {
                // 控制模块显示
                showCode: {
                    withTicketAndMoney: false, // 配票和备用金
                    addTicketAndMoney: false, // 追加票和备用金
                    incomeInAdvance: false, // 收益预收
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
                // 配票表单
                withTicketFormItem: {
                    operatorUser: '', // 售票员ID
                    operatorPassword: '', // 密码
                    userFlag: false, // 校验售票员标识
                    passwordFlag: false, // 校验密码标识
                    allMoney: '0', // 备用金库存金额
                    money: '', // 操作金额
                    moneyFlag: false, // 操作金额标识
                    moneyTip: '', // 操作金额提示
                    type: '', // 车票类型
                    allTicket: '0', // 车票库存数量
                    ticket_value: '0', // 面值
                    ticketNum: '', // 配票数量
                },
                // 配票车票类型
                ticketTypeList: [],
                // 配票表格
                withTicketTableData: [],
                // 追加表单
                addTicketFormItem: {
                    operatorUser: '', // 售票员ID
                    operatorPassword: '', // 密码
                    userFlag: false, // 校验售票员标识
                    passwordFlag: false, // 校验密码标识
                    type: '', // 车票类型
                    allTicket: '0', // 车票库存数量
                    ticket_value: '0', // 面值
                    ticketNum: '', // 追加数量
                    allMoney: '0', // 备用金库存金额
                    useMoney: '0', // 已领用金额
                    money: '', // 追加金额
                    moneyFlag: false, // 追加金额校验
                    moneyTip: '', // 追加金额提示
                    showModule: false, // 控制表格区域显示隐藏
                },
                // 追加表格
                addTicketTableData: [],
                // 收益预收表单
                IncomeInAdvanceFormItem: {
                    operatorUser: '', // 售票员ID
                    operatorPassword: '', // 密码
                    userFlag: false, // 校验售票员标识
                    passwordFlag: false, // 校验密码标识
                    allMoney: '0', // 收益预收总金额
                    money: '', // 预收操作金额
                    moneyFlag: false, // 收益预收标识
                    moneyTip: '', // 收益预收提示
                    showModule: false, // 控制表格区域显示隐藏
                },
                // 回收表单
                recycleFormItem: {
                    operatorUser: '', // 售票员ID
                    operatorPassword: '', // 密码
                    userFlag: false, // 校验售票员标识
                    passwordFlag: false, // 校验密码标识
                    sendMoney: '0', // 配备金额
                    addMoney: '0', // 追加金额
                    allMoney: '0', // 收益预收总金额
                    money: '', // 回收金额
                    moneyFlag: false, // 回收金额校验
                    moneyTip: '', // 回收金额提示
                    showModule: false, // 控制表格区域显示隐藏
                },
                // 回收表格
                recycleTableData: []
            }
        },
        methods: {
            // 获取单据类型字典
            getStatusData() {
                var _t = this;
                let str = "guid=GUID000722201906191624";
                let Base64 = require("js-base64").Base64;
                let keyToken = _t.$md5(Base64.encode(str));
                var params = {
                    guid: "GUID000722201906191624",
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
                    } else if (role === "MLC" || role === "ACC") {
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
                    // 根据type判断默认调用函数
                    if (_t.showCode.withTicketAndMoney === true) {
                        // 配票备用金
                        _t.getTicketMoney('ticket');
                        _t.getTicketTypeList();
                    } else if (_t.showCode.addTicketAndMoney === true) {
                        // 追加备用金
                        _t.getTicketMoney('add');
                        _t.getTicketTypeList();
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
                _t.$router.push({name: 'BOMOperation'});
            },
            // 失去焦点时校验
            blurInput(item, flag, val) {
                item[flag] = val.trim() === '' ? true : false;
            },
            // 获取车站的备用金库存金额
            getTicketMoney(val) {
                var _t = this;
                let str = 'location_number=' + _t.formItem.station
                    + '&operator_id=' + _t.formItem.operationId
                    + '&stock_type=' + '01';
                    // + '&money_state=' + '01';
                let Base64 = require('js-base64').Base64;
                let keyToken = _t.$md5(Base64.encode(str));
                let postData = {
                    location_number: _t.formItem.station, // 位置编码
                    operator_id: _t.formItem.operationId, // 操作员id
                    token: keyToken, // token
                    stock_type: '01', // 01 备用金
                    money_state: '01', // 01 余额
                    pageNum: 1, // 当前页
                    pageSize: 10, // 每页显示条数
                };
                _t.$api.post('/tsGateWay/readyMoney/readyMoneyStockQueryGateWay', postData, function (res) {
                    if (res.rtCode && res.rtCode === '11101') {
                        var resData = res.rtData === null ? [] : res.rtData;
                        if (resData.length !== 0) {
                            if (val === 'ticket') {
                                // 配票
                                _t.withTicketFormItem.allMoney = resData[0].MONEY_AMOUNT_YUAN;
                            } else if (val === 'add') {
                                // 追加
                                _t.addTicketFormItem.allMoney = resData[0].MONEY_AMOUNT_YUAN;
                            }
                        }
                    }
                });
            },
            // 获取车票类型接口
            getTicketTypeList() {
                var _t = this;
                var location = _t.formItem.station; // 位置编号
                var user_id = _t.formItem.operationId; // 用户id
                if (location !== '' && user_id !== '') {
                    let str = 'location_number=' + location + '&operator_id=' + user_id;
                    let Base64 = require('js-base64').Base64;
                    let keyToken = _t.$md5(Base64.encode(str));
                    let postData = {
                        location_number: location,
                        operator_id: user_id,
                        token: keyToken,
                        pageNum: 1,
                        pageSize: 100
                    };
                    _t.$api.post('/tsGateWay/inventoryListService/ticketTypeQueryGateWay', postData, function (res) {
                        if (res.rtCode && res.rtCode === '10005') {
                            _t.ticketTypeList = res.rtData === null ? [] : res.rtData;
                        }
                    });
                }
            },
            // 配票添加按钮
            addTicketBtn() {
                var _t = this;
                // 校验车票类型是否为空
                if (_t.withTicketFormItem.type !== '') {
                    // 不为空校验 配票数量
                    if (_t.withTicketFormItem.ticketNum.trim() !== '') {
                        // 配票数量不为空 校验格式
                        var reg = _t.$config.isNumber();
                        if (reg.test(_t.withTicketFormItem.ticketNum.trim()) === false) {
                            // 格式不正确
                            _t.alertDialogTip(_t, '配票数量格式不正确!');
                        } else {
                            // 格式正确 校验配票数量是否大于库存数量
                            if (_t.withTicketFormItem.ticketNum.trim() * 1 > _t.withTicketFormItem.allTicket * 1) {
                                _t.alertDialogTip(_t, '配票数量不能大于库存数量!');
                            } else {
                                // 可以添加
                                _t.addTableData(_t.withTicketTableData, 'stock_manage_type_id', _t.withTicketFormItem, 'type', 'create');
                            }
                        }
                    } else {
                        // 配票数量为空
                        _t.alertDialogTip(_t, '配票数量不能为空!');
                    }
                } else {
                    // 为空
                    _t.alertDialogTip(_t, '车票类型不能为空!');
                }
            },
            // 对添加数据做处理
            addTableData(arr, id, val, type, flag) {
                var _t = this;
                // 遍历数组看有没有需要添加的数据
                var con = arr.find((item) => {
                    if (item[id] === val[type]) {
                        return item;
                    }
                });
                // 有此项
                if (con !== undefined) {
                    con.quantity_borrow = val.ticketNum.trim()
                } else {
                    // 没有此项
                    var obj = new Object();
                    obj.stock_manage_type_id = val[type]; // 车票类型id 作为表格的行id
                    var name = _t.ticketTypeList.find((item) => {
                        if (item.STOCK_MANAGE_TYPE_ID === val[type]) {
                            return item;
                        } else {
                            return null;
                        }
                    });
                    obj.stock_manage_type_name = name.STOCK_TYPE_NAME_CN;
                    obj.ticket_value = val.ticket_value; // 面值
                    obj.quantity_borrow = val.ticketNum.trim(); // 票的数量
                    // 追加需要多一项领用金额
                    if (flag === 'add') {
                        obj.receive_ticket_num = '0';
                    }
                    arr.push(obj);
                }
            },
            // 校验金额
            ruleMoneyWithTicket(item, val, flag, tip, all) {
                var _t = this;
                // 校验是否为空
                if (val.trim() === '') {
                    item[flag] = true;
                    item[tip] = '必填项不能为空';
                } else {
                    // 不为空 校验格式
                    var reg = _t.$config.isMoneyNumber();
                    if (reg.test(val.trim()) === false) {
                        item[flag] = true;
                        item[tip] = '格式不正确';
                    } else {
                        // 格式正确 校验是否大于库存
                        if (val.trim() * 1 > item[all] * 1) {
                            item[flag] = true;
                            item[tip] = '操作金额不能大于库存金额';
                        } else {
                            item[flag] = false;
                            item[tip] = '';
                        }
                    }
                }
            },
            // 配票备用金提交信息
            addTicketAndMoney() {
                var _t = this;
                if (_t.formItem.station !== '' && _t.formItem.operationId !== '') {
                    // 校验售票员id
                    _t.blurInput(_t.withTicketFormItem, 'userFlag', _t.withTicketFormItem.operatorUser);
                    // 校验售票员密码
                    _t.blurInput(_t.withTicketFormItem, 'passwordFlag', _t.withTicketFormItem.operatorPassword);
                    // 校验备用金操作金额
                    _t.ruleMoneyWithTicket(_t.withTicketFormItem, _t.withTicketFormItem.money, 'moneyFlag', 'moneyTip', 'allMoney');
                    // 校验表格不能为空
                    if (_t.withTicketTableData.length !== 0) {
                        if (_t.withTicketFormItem.userFlag === false
                            && _t.withTicketFormItem.passwordFlag === false
                            && _t.withTicketFormItem.moneyFlag === false) {
                            // 可以提交
                            let str =
                                "location_number=" + _t.formItem.station
                                + "&operate_type=" + "01"
                                + "&bom_operator_id=" + _t.withTicketFormItem.operatorUser.trim()
                                + "&password=" + _t.withTicketFormItem.operatorPassword.trim()
                                + "&bom_creator_id=" + _t.formItem.operationId;
                            let Base64 = require("js-base64").Base64;
                            let keyToken = _t.$md5(Base64.encode(str));
                            var params = {
                                location_number: _t.formItem.station, // 位置编码
                                operate_type: '01', // 配票
                                bom_operator_id: _t.withTicketFormItem.operatorUser.trim(), // 售票员id
                                password: _t.withTicketFormItem.operatorPassword.trim(), // 密码
                                bom_creator_id: _t.formItem.operationId, // 操作员id
                                reserve_money: _t.withTicketFormItem.money.trim() * 100, // 备用金操作金额
                                ticket_data: _t.withTicketTableData, // 配票信息表格
                                token: keyToken, // token
                            };
                            _t.$api.post('/tsGateWay/bommanager/allocateticketmoney', params, function (res) {
                                if (res.rtCode && res.rtCode === '10001') {
                                    _t.$alert(res.rtMessage, "温馨提示", {
                                        confirmButtonText: "确定",
                                        cancelButtonText: "取消"
                                    }).then(() => {
                                        _t.$router.push({name: 'BOMOperation'});
                                    }).catch(() => {
                                        _t.$router.push({name: 'BOMOperation'});
                                    });
                                } else if (res.rtCode) {
                                  _t.alertDialogTip(_t, res.rtMessage);
                                }
                            });
                        }
                    } else {
                        _t.alertDialogTip(_t, '表格数据条数不能为空!');
                    }
                } else {
                    _t.alertDialogTip(_t, '车站及操作员ID不能为空!');
                }
            },
            // 删除配票的表格信息
            deleteAddTicket(index) {
                var _t = this;
                _t.withTicketTableData.splice(index, 1);
            },
            // 改变配票车票类型
            changeWithTicket(val) {
                var _t = this;
                if (val !== '') {
                    // 不为空
                    _t.ticketTypeList.forEach((item) => {
                        // 找到对应的车票类型
                        if (item.STOCK_MANAGE_TYPE_ID === val) {
                            _t.withTicketFormItem.allTicket = item.TICKET_NUMBER.toString();
                            _t.withTicketFormItem.ticket_value = item.ISSUE_AMOUNT.toString();
                        }
                    });
                } else {
                    // 为空
                    _t.withTicketFormItem.allTicket = '0';
                    _t.withTicketFormItem.ticket_value = '0';
                }
            },
            /*
              追加
             */
            // 获取追加的配票信息 领用记录
            getAddData() {
                var _t = this;
                // location_number、操作员id 不为空
                if (_t.formItem.station !== '' && _t.formItem.operationId !== '') {
                    // 校验售票员id
                    _t.blurInput(_t.addTicketFormItem, 'userFlag', _t.addTicketFormItem.operatorUser);
                    // 校验售票员密码
                    _t.blurInput(_t.addTicketFormItem, 'passwordFlag', _t.addTicketFormItem.operatorPassword);
                    // 可以提交
                    if (_t.addTicketFormItem.userFlag === false && _t.addTicketFormItem.passwordFlag === false) {
                        let str = "location_number=" + _t.formItem.station
                            + "&bom_operator_id=" + _t.addTicketFormItem.operatorUser.trim()
                            + "&password=" + _t.addTicketFormItem.operatorPassword.trim()
                            + "&bom_creator_id=" + _t.formItem.operationId;
                        let Base64 = require("js-base64").Base64;
                        let keyToken = _t.$md5(Base64.encode(str));
                        var params = {
                          flag: '1',
                          operate_flag: '0',
                            location_number: _t.formItem.station,
                            bom_operator_id: _t.addTicketFormItem.operatorUser.trim(),
                            password: _t.addTicketFormItem.operatorPassword.trim(),
                            bom_creator_id: _t.formItem.operationId,
                            token: keyToken
                        };
                        _t.$api.post('/tsGateWay/bommanager/receivehistoryquery', params, function (res) {
                            if (res.rtCode && res.rtCode === '12009') {
                                _t.addTicketFormItem.showModule = true; // 显示领用记录
                                var resData = res.rtData === null ? {} : res.rtData;
                                _t.addTicketFormItem.useMoney = resData.RECEIVE_MOENY_NUM === undefined ? 0 : resData.RECEIVE_MOENY_NUM; // 备用金已领用金额
                                var tableData = resData.TICKET_DATA === null ? [] : resData.TICKET_DATA; // 领用记录表格
                                var tableDataArr = new Array();
                                tableData.forEach((item) => {
                                    var obj = new Object();
                                    obj.stock_manage_type_id = item.STOCK_MANAGE_TYPE_ID ? item.STOCK_MANAGE_TYPE_ID : ''; // 车票类型id
                                    obj.stock_manage_type_name = item.STOCK_TYPE_NAME_CN ? item.STOCK_TYPE_NAME_CN : ''; // 车票类型名称
                                    obj.ticket_value = item.ISSUE_AMOUNT !== undefined ? item.ISSUE_AMOUNT.toString() : '0'; // 面值 ssy
                                    obj.receive_ticket_num = item.RECEIVE_TICKET_NUM !== undefined ? item.RECEIVE_TICKET_NUM.toString() : '0'; // 已领数量 ssy
                                    obj.quantity_borrow = item.APPEND_TICKET_NUM !== undefined ? item.APPEND_TICKET_NUM.toString() : '0'; // 追加数量 ssy
                                    tableDataArr.push(obj);
                                });
                                _t.addTicketTableData = tableDataArr;
                            } else if (res.rtCode === '22011') {
                                _t.alertDialogTip(_t, res.rtMessage);
                            } else if (res.rtCode) {
                              _t.alertDialogTip(_t, res.rtMessage);
                            }
                        });
                    }
                } else {
                    _t.alertDialogTip(_t, '车站及操作员ID不能为空!');
                }
            },
            // 追加添加按钮
            addToTicketBtn() {
                var _t = this;
                // 校验车票类型是否为空
                if (_t.addTicketFormItem.type !== '') {
                    // 不为空校验 追加数量
                    if (_t.addTicketFormItem.ticketNum.trim() !== '') {
                        // 追加数量不为空 校验格式
                        var reg = _t.$config.isNumber();
                        if (reg.test(_t.addTicketFormItem.ticketNum.trim()) === false) {
                            // 格式不正确
                            _t.alertDialogTip(_t, '追加数量格式不正确!');
                        } else {
                            // 格式正确 校验配票数量是否大于库存数量
                            if (_t.addTicketFormItem.ticketNum.trim() * 1 > _t.addTicketFormItem.allTicket * 1) {
                                _t.alertDialogTip(_t, '追加数量不能大于库存数量!');
                            } else {
                                // 可以添加
                                _t.addTableData(_t.addTicketTableData, 'stock_manage_type_id', _t.addTicketFormItem, 'type', 'add');
                            }
                        }
                    } else {
                        // 配票数量为空
                        _t.alertDialogTip(_t, '追加数量不能为空!');
                    }
                } else {
                    // 为空
                    _t.alertDialogTip(_t, '车票类型不能为空!');
                }
            },
            // 追加备用金提交信息
            addToTicketAndMoney() {
                var _t = this;
                if (_t.formItem.station !== '' && _t.formItem.operationId !== '') {
                    if (_t.addTicketFormItem.showModule) {
                        // 校验售票员id
                        _t.blurInput(_t.addTicketFormItem, 'userFlag', _t.addTicketFormItem.operatorUser);
                        // 校验售票员密码
                        _t.blurInput(_t.addTicketFormItem, 'passwordFlag', _t.addTicketFormItem.operatorPassword);
                        // 校验追加金额
                        _t.ruleMoneyWithTicket(_t.addTicketFormItem, _t.addTicketFormItem.money, 'moneyFlag', 'moneyTip', 'allMoney');
                        // 校验表格不能为空
                        if (_t.addTicketTableData.length !== 0) {
                            if (_t.addTicketFormItem.userFlag === false
                                && _t.addTicketFormItem.passwordFlag === false
                                && _t.addTicketFormItem.moneyFlag === false) {
                                // 可以提交
                                let str =
                                    "location_number=" + _t.formItem.station
                                    + "&operate_type=" + "02"
                                    + "&bom_operator_id=" + _t.addTicketFormItem.operatorUser.trim()
                                    + "&password=" + _t.addTicketFormItem.operatorPassword.trim()
                                    + "&bom_creator_id=" + _t.formItem.operationId;
                                let Base64 = require("js-base64").Base64;
                                let keyToken = _t.$md5(Base64.encode(str));
                                var params = {
                                    location_number: _t.formItem.station, // 位置编码
                                    operate_type: '02', // 追加
                                    bom_operator_id: _t.addTicketFormItem.operatorUser.trim(), // 售票员id
                                    password: _t.addTicketFormItem.operatorPassword.trim(), // 密码
                                    bom_creator_id: _t.formItem.operationId, // 操作员id
                                    reserve_money: _t.addTicketFormItem.money.trim() * 100, // 追加金额
                                    ticket_data: _t.addTicketTableData, // 表格
                                    token: keyToken, // token
                                };
                                _t.$api.post('/tsGateWay/bommanager/allocateticketmoney', params, function (res) {
                                    if (res.rtCode && res.rtCode === '10001') {
                                        _t.$alert(res.rtMessage, "温馨提示", {
                                            confirmButtonText: "确定",
                                            cancelButtonText: "取消"
                                        }).then(() => {
                                            _t.$router.push({name: 'BOMOperation'});
                                        }).catch(() => {
                                            _t.$router.push({name: 'BOMOperation'});
                                        });
                                    } else if (res.rtCode) {
                                      _t.alertDialogTip(_t, res.rtMessage);
                                    }
                                });
                            }
                        } else {
                            _t.alertDialogTip(_t, '表格数据条数不能为空!');
                        }
                    } else {
                        _t.alertDialogTip(_t, '请先查询车票备用金领用记录!');
                    }
                } else {
                    _t.alertDialogTip(_t, '车站及操作员ID不能为空!');
                }
            },
            // 删除追加的表格信息
            deleteAddToTicket(index) {
                var _t = this;
                _t.addTicketTableData.splice(index, 1);
            },
            // 改变追加车票类型
            changeAddTicket(val) {
                var _t = this;
                if (val !== '') {
                    // 不为空
                    _t.ticketTypeList.forEach((item) => {
                        // 找到对应的车票类型
                        if (item.STOCK_MANAGE_TYPE_ID === val) {
                            _t.addTicketFormItem.allTicket = item.TICKET_NUMBER.toString();
                            _t.addTicketFormItem.ticket_value = item.ISSUE_AMOUNT.toString();
                        }
                    });
                } else {
                    // 为空
                    _t.addTicketFormItem.allTicket = '0';
                    _t.addTicketFormItem.ticket_value = '0';
                }
            },
            /*
              收益预收
             */
            // 获取收益预收的信息
            getIncomeInAdvance() {
                var _t = this;
                // location_number、操作员id 不为空
                if (_t.formItem.station !== '' && _t.formItem.operationId !== '') {
                    // 校验售票员id
                    _t.blurInput(_t.IncomeInAdvanceFormItem, 'userFlag', _t.IncomeInAdvanceFormItem.operatorUser);
                    // 校验售票员密码
                    _t.blurInput(_t.IncomeInAdvanceFormItem, 'passwordFlag', _t.IncomeInAdvanceFormItem.operatorPassword);
                    // 可以提交
                    if (_t.IncomeInAdvanceFormItem.userFlag === false && _t.IncomeInAdvanceFormItem.passwordFlag === false) {
                        let str = "location_number=" + _t.formItem.station
                            + "&bom_operator_id=" + _t.IncomeInAdvanceFormItem.operatorUser.trim()
                            + "&password=" + _t.IncomeInAdvanceFormItem.operatorPassword.trim()
                            + "&bom_creator_id=" + _t.formItem.operationId;
                        let Base64 = require("js-base64").Base64;
                        let keyToken = _t.$md5(Base64.encode(str));
                        var params = {
                          flag: '1',
                          operate_flag: '0',
                            location_number: _t.formItem.station,
                            bom_operator_id: _t.IncomeInAdvanceFormItem.operatorUser.trim(),
                            password: _t.IncomeInAdvanceFormItem.operatorPassword.trim(),
                            bom_creator_id: _t.formItem.operationId,
                            token: keyToken
                        };
                        _t.$api.post('/tsGateWay/bommanager/receivehistoryquery', params, function (res) {
                            if (res.rtCode && res.rtCode === '12009') {
                                _t.IncomeInAdvanceFormItem.showModule = true; // 显示领用记录
                                var resData = res.rtData === null ? {} : res.rtData;
                                _t.IncomeInAdvanceFormItem.allMoney = resData.EARNING_MONEY_NUM !== undefined ? resData.EARNING_MONEY_NUM : 0; // 收益预收总金额
                            } else {
                              _t.alertDialogTip(_t, res.rtMessage);
                            }
                        });
                    }
                }
            },
            // 提交收益预收金额
            addIncodeInAdvanceData() {
                var _t = this;
                if (_t.formItem.station !== '' && _t.formItem.operationId !== '') {
                    if (_t.IncomeInAdvanceFormItem.showModule) {
                        // 校验售票员id
                        _t.blurInput(_t.IncomeInAdvanceFormItem, 'userFlag', _t.IncomeInAdvanceFormItem.operatorUser);
                        // 校验售票员密码
                        _t.blurInput(_t.IncomeInAdvanceFormItem, 'passwordFlag', _t.IncomeInAdvanceFormItem.operatorPassword);
                        // 校验预收金额
                        _t.ruleMoneyForInCode(_t.IncomeInAdvanceFormItem.money);
                        // 可以提交
                        if (_t.IncomeInAdvanceFormItem.userFlag === false
                            && _t.IncomeInAdvanceFormItem.passwordFlag === false
                            && _t.IncomeInAdvanceFormItem.moneyFlag === false) {
                            // 可以提交
                            let str =
                                "location_number=" + _t.formItem.station
                                + "&bom_operator_id=" + _t.IncomeInAdvanceFormItem.operatorUser.trim()
                                + "&password=" + _t.IncomeInAdvanceFormItem.operatorPassword.trim()
                                + "&bom_creator_id=" + _t.formItem.operationId
                                + "&reserve_money=" + _t.IncomeInAdvanceFormItem.money.trim() * 100;
                            let Base64 = require("js-base64").Base64;
                            let keyToken = _t.$md5(Base64.encode(str));
                            var params = {
                                location_number: _t.formItem.station, // 位置编码
                                bom_operator_id: _t.IncomeInAdvanceFormItem.operatorUser.trim(), // 售票员id
                                password: _t.IncomeInAdvanceFormItem.operatorPassword.trim(), // 密码
                                bom_creator_id: _t.formItem.operationId, // 操作员id
                                reserve_money: _t.IncomeInAdvanceFormItem.money.trim() * 100, // 预收操作金额
                                token: keyToken, // token
                            };
                            _t.$api.post('/tsGateWay/bommanager/earningsadvance', params, function (res) {
                                if (res.rtCode && res.rtCode === '11003') {
                                    _t.$alert(res.rtMessage, "温馨提示", {
                                        confirmButtonText: "确定",
                                        cancelButtonText: "取消"
                                    }).then(() => {
                                        _t.$router.push({name: 'BOMOperation'});
                                    }).catch(() => {
                                        _t.$router.push({name: 'BOMOperation'});
                                    });
                                } else if (res.rtCode) {
                                  _t.alertDialogTip(_t, res.rtMessage);
                                }
                            });
                        }
                    } else {
                        _t.alertDialogTip(_t, '请先查询收益余额预收信息!');
                    }
                } else {
                    _t.alertDialogTip(_t, '车站及操作员ID不能为空!');
                }
            },
            // 校验收益预收金额
            ruleMoneyForInCode(val) {
                var _t = this;
                if (val.trim() === '') {
                    _t.IncomeInAdvanceFormItem.moneyFlag = true;
                    _t.IncomeInAdvanceFormItem.moneyTip = '必填项不能为空';
                } else {
                    // 不为空 校验格式
                    var reg = _t.$config.isMoneyNumber();
                    if (reg.test(val.trim()) === false) {
                        _t.IncomeInAdvanceFormItem.moneyFlag = true;
                        _t.IncomeInAdvanceFormItem.moneyTip = '格式不正确';
                    } else {
                        // 格式正确 校验是否大于库存
                        if (val.trim() * 1 > _t.IncomeInAdvanceFormItem.allMoney * 1) {
                            _t.IncomeInAdvanceFormItem.moneyFlag = true;
                            _t.IncomeInAdvanceFormItem.moneyTip = '预收金额不能大于总金额';
                        } else {
                            _t.IncomeInAdvanceFormItem.moneyFlag = false;
                            _t.IncomeInAdvanceFormItem.moneyTip = '';
                        }
                    }
                }
            },
            /*
              回收
             */
            // 获取回收信息
            getRecycleData() {
                var _t = this;
                // location_number、操作员id 不为空
                if (_t.formItem.station !== '' && _t.formItem.operationId !== '') {
                    // 校验售票员id
                    _t.blurInput(_t.recycleFormItem, 'userFlag', _t.recycleFormItem.operatorUser);
                    // 校验售票员密码
                    _t.blurInput(_t.recycleFormItem, 'passwordFlag', _t.recycleFormItem.operatorPassword);
                    // 可以提交
                    if (_t.recycleFormItem.userFlag === false && _t.recycleFormItem.passwordFlag === false) {
                        let str = "location_number=" + _t.formItem.station
                            + "&bom_operator_id=" + _t.recycleFormItem.operatorUser.trim()
                            + "&password=" + _t.recycleFormItem.operatorPassword.trim()
                            + "&bom_creator_id=" + _t.formItem.operationId;
                        let Base64 = require("js-base64").Base64;
                        let keyToken = _t.$md5(Base64.encode(str));
                        var params = {
                          flag: '1',
                          operate_flag: '0',
                            location_number: _t.formItem.station,
                            bom_operator_id: _t.recycleFormItem.operatorUser.trim(),
                            password: _t.recycleFormItem.operatorPassword.trim(),
                            bom_creator_id: _t.formItem.operationId,
                            token: keyToken
                        };
                        _t.$api.post('/tsGateWay/bommanager/receivehistoryquery', params, function (res) {
                            if (res.rtCode && res.rtCode === '12009') {
                                _t.recycleFormItem.showModule = true; // 显示领用记录
                                var resData = res.rtData === null ? {} : res.rtData; // data
                                var tableData = resData.TICKET_DATA === null ? [] : resData.TICKET_DATA; // 领用记录表格
                                var tableDataArr = new Array();
                                tableData.forEach((item) => {
                                    var obj = new Object();
                                    obj.stock_manage_type_id = item.STOCK_MANAGE_TYPE_ID ? item.STOCK_MANAGE_TYPE_ID : ''; // 车票类型id
                                    obj.stock_manage_type_name = item.STOCK_TYPE_NAME_CN ? item.STOCK_TYPE_NAME_CN : ''; // 车票类型名称
                                    obj.ticket_value = item.ISSUE_AMOUNT !== undefined ? item.ISSUE_AMOUNT.toString() : '0'; // 面值 ssy
                                    obj.use_ticket_number = item.RECEIVE_TICKET_NUM !== undefined ? item.RECEIVE_TICKET_NUM.toString() : '0'; // 配票数量 ssy
                                    obj.add_ticket_number = item.APPEND_TICKET_NUM !== undefined ? item.APPEND_TICKET_NUM.toString() : '0'; // 追加数量 ssy
                                    obj.return_ticket_number = '0'; // 归还数量
                                    obj.lose_ticket_number = '0'; // 遗失票卡
                                    obj.invalid_ticket_number = '0'; // 无效票卡
                                    obj.other_ticket_number = '0'; // 其他
                                    tableDataArr.push(obj);
                                });
                                _t.recycleTableData = tableDataArr;
                                // 配备用金
                                _t.recycleFormItem.sendMoney = resData.RECEIVE_MOENY_NUM !== undefined ? resData.RECEIVE_MOENY_NUM.toString() : '0';
                                // 追加备用金
                                _t.recycleFormItem.addMoney = resData.APPEND_MONEY_NUM !== undefined ? resData.APPEND_MONEY_NUM.toString() : '0';
                                // 收益预收总金额
                                _t.recycleFormItem.allMoney = resData.EARNING_MOENY_NUM !== undefined ? resData.EARNING_MOENY_NUM.toString() : '0';
                            } else {
                              _t.alertDialogTip(_t, res.rtMessage);
                            }
                        });
                    }
                } else {
                    _t.alertDialogTip(_t, '车站及操作员ID不能为空!');
                }
            },
            // 提交回收信息
            addRecycleData() {
                var _t = this;
                if (_t.formItem.station !== '' && _t.formItem.operationId !== '') {
                    if (_t.recycleFormItem.showModule) {
                        // 校验售票员id
                        _t.blurInput(_t.recycleFormItem, 'userFlag', _t.recycleFormItem.operatorUser);
                        // 校验售票员密码
                        _t.blurInput(_t.recycleFormItem, 'passwordFlag', _t.recycleFormItem.operatorPassword);
                        // 校验回收金额
                        _t.ruleRecycleData(_t.recycleFormItem.money);
                        // 可以提交
                        if (_t.recycleTableData.length !== 0) {
                            var isErrorNum = 0;
                            var reg = _t.$config.isNumber();
                            _t.recycleTableData.forEach((item) => {
                                // 校验归还数量
                                if (item.return_ticket_number.trim() === '' || reg.test(item.return_ticket_number.trim()) === false) {
                                    isErrorNum++;
                                }
                                // 校验遗失数量
                                if (item.lose_ticket_number.trim() === '' || reg.test(item.lose_ticket_number.trim()) === false) {
                                    isErrorNum++;
                                }
                                // 校验无效数量
                                if (item.invalid_ticket_number.trim() === '' || reg.test(item.invalid_ticket_number.trim()) === false) {
                                    isErrorNum++;
                                }
                                // 校验其他数量
                                if (item.other_ticket_number.trim() === '' || reg.test(item.other_ticket_number.trim()) === false) {
                                    isErrorNum++;
                                }
                            });
                            // 没有错误 可以提交
                            if (isErrorNum === 0) {
                                if (_t.recycleFormItem.userFlag === false
                                    && _t.recycleFormItem.passwordFlag === false
                                    && _t.recycleFormItem.moneyFlag === false) {
                                    let str =
                                        "location_number=" + _t.formItem.station
                                        + "&bom_operator_id=" + _t.recycleFormItem.operatorUser.trim()
                                        + "&password=" + _t.recycleFormItem.operatorPassword.trim()
                                        + "&bom_creator_id=" + _t.formItem.operationId;
                                    let Base64 = require("js-base64").Base64;
                                    let keyToken = _t.$md5(Base64.encode(str));
                                    var params = {
                                        location_number: _t.formItem.station, // 位置编码
                                        bom_operator_id: _t.recycleFormItem.operatorUser.trim(), // 售票员id
                                        password: _t.recycleFormItem.operatorPassword.trim(), // 密码
                                        bom_creator_id: _t.formItem.operationId, // 操作员id
                                        reserve_money: _t.recycleFormItem.money.trim() * 100, // 回收金额
                                        ticket_data: _t.recycleTableData, // 表格数据
                                        token: keyToken, // token
                                    };
                                    _t.$api.post('/tsGateWay/bommanager/recovery', params, function (res) {
                                        if (res.rtCode && res.rtCode === '10001') {
                                            _t.$alert(res.rtMessage, "温馨提示", {
                                                confirmButtonText: "确定",
                                                cancelButtonText: "取消"
                                            }).then(() => {
                                                _t.$router.push({name: 'BOMOperation'});
                                            }).catch(() => {
                                                _t.$router.push({name: 'BOMOperation'});
                                            });
                                        } else if (res.rtCode) {
                                          _t.alertDialogTip(_t, res.rtMessage);
                                        }
                                    });
                                }
                            } else {
                                _t.alertDialogTip(_t, '归还数量、遗失票卡、无效票卡以及其他等有为空或格式不正确!');
                            }
                        } else {
                            _t.alertDialogTip(_t, '表格数据条数不能为空!');
                        }
                    } else {
                        _t.alertDialogTip(_t, '请先查询车票备用金领用记录!');
                    }
                } else {
                    _t.alertDialogTip(_t, '车站及操作员ID不能为空!');
                }
            },
            // 校验回收金额
            ruleRecycleData(val) {
                var _t = this;
                if (val.trim() === '') {
                    _t.recycleFormItem.moneyFlag = true;
                    _t.recycleFormItem.moneyTip = '必填项不能为空';
                } else {
                    // 校验格式
                    var reg = _t.$config.isMoneyNumber();
                    if (reg.test(val.trim()) === false) {
                        _t.recycleFormItem.moneyFlag = true;
                        _t.recycleFormItem.moneyTip = '格式不正确';
                    } else {
                        // 格式正确
                        _t.recycleFormItem.moneyFlag = false;
                        _t.recycleFormItem.moneyTip = '';
                    }
                }
            }
        },
        created() {
            var _t = this;
            // 从路由和缓存中获取显示的标识
            var code = _t.$route.params.BOM_TYPE ? _t.$route.params.BOM_TYPE : localStorage.getItem('BOM_TYPE');
            if (code === 'ticket') {
                // 配票 备用金
                _t.showCode.withTicketAndMoney = true;
                _t.showCode.addTicketAndMoney = false;
                _t.showCode.incomeInAdvance = false;
                _t.showCode.recycle = false;
                _t.formItem.operate_type = '01'; // 配票备用金
            } else if (code === 'add') {
                // 追加票 备用金
                _t.showCode.withTicketAndMoney = false;
                _t.showCode.addTicketAndMoney = true;
                _t.showCode.incomeInAdvance = false;
                _t.showCode.recycle = false;
                _t.formItem.operate_type = '02'; // 追加
            } else if (code === 'earnings') {
                // 收益预收
                _t.showCode.withTicketAndMoney = false;
                _t.showCode.addTicketAndMoney = false;
                _t.showCode.incomeInAdvance = true;
                _t.showCode.recycle = false;
                _t.formItem.operate_type = '03'; // 收益预收
            } else if (code === 'recycle') {
                // 回收
                _t.showCode.withTicketAndMoney = false;
                _t.showCode.addTicketAndMoney = false;
                _t.showCode.incomeInAdvance = false;
                _t.showCode.recycle = true;
                _t.formItem.operate_type = '04'; // 回收
            } else {
                _t.showCode.withTicketAndMoney = false;
                _t.showCode.addTicketAndMoney = false;
                _t.showCode.incomeInAdvance = false;
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
            localStorage.removeItem('BOM_TYPE');
        }
    }
</script>

<style scoped>
  p.title {
    font-size: 14px;
    margin-bottom: 10px;
  }
</style>
