<template>
  <Box>
    <div class="formBox-top">
      <!-- 头部查询部分 -->
      <el-form :model="formItem" label-width="120px" :inline="true">
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
              :value="item.STATION_ID.toString()"/>
          </el-select>
        </el-form-item>
        <el-form-item label="审核状态：" class="marBottom7">
          <el-select
            clearable
            v-model="formItem.typeClearing"
            class="width200"
          >
            <el-option
              v-for="(item,index) in auditTypeData"
              :key="index"
              :label="item.NAME"
              :value="item.VALUE"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="操作时间：" class="marBottom7">
          <el-date-picker
            :default-time="['00:00:00', '23:59:59']"
            v-model="formItem.dateTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
        </el-form-item>
        <br/>
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
        <el-table-column prop="UUID" label="编号" align="center"/>
        <el-table-column prop="LOCATION_NAME" label="车站" align="center"/>
        <el-table-column prop="MONEY_SOURCE_NAME" label="票款来源" align="center"/>
        <el-table-column prop="DEVICE_ID" label="设备编号" align="center"/>
        <el-table-column prop="AMOUNT" label="金额" align="center"/>
        <el-table-column prop="OPERATE_NAME" label="交款人/领款人" align="center"/>
        <el-table-column prop="CREATE_NAME" label="客值" align="center"/>
        <el-table-column prop="UPDATE_TIME" label="操作时间" align="center"/>
        <el-table-column prop="ADJUST_AMOUNT" label="调整金额" align="center"/>
        <el-table-column prop="AFTER_ADJUST_AMOUNT" label="调整后金额" align="center"/>
        <el-table-column prop="ADJUST_REASON" label="调整原因" align="center"/>
        <el-table-column prop="AUDIT_STATUS_NAME" label="审核状态" align="center"/>
        <el-table-column prop="ADUIT_TIME" label="审核时间" align="center"/>
        <el-table-column prop="ADUIT_NAME" label="审核人" align="center"/>
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
  </Box>
</template>

<script>
  import Box from "../../../components/Box";
  import {dateFilter} from "../../../assets/js/filters";

  export default {
    components: {
      Box
    },
    name: 'specialBillAudit',
    data() {
      return {
        disabledBtn: {
          createDis: false,
        },
        stationList: [],
        linesList: [], // 线路数据
        auditTypeData: [],
        formItem: {
          lines: '', // 线路
          dateTime: [], // 操作时间
          TVMticketSource: '', // TVM票款来源
          station: '', //车站
          equipmentNumber: '',// 设备编号
          typeClearing: '',// 结算状态
        },
        tableData: [], // 查询表格数据
        // 分页
        options: {
          total: 0, // 总条数
          currentPage: 1, // 当前页码
          pageSize: 10 // 显示条数
        },
        limitBtn: {
          queryBtn: false,
        },
        sourceDate: [], // 来源数据
      }
    },
    methods: {
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
      // 查询
      getData() {
        var _t = this;
        var params = {
          station_id: _t.formItem.station,
          audit_status: _t.formItem.typeClearing,
          begin_time: _t.formItem.dateTime !== null ? (_t.formItem.dateTime[0] !== undefined ? dateFilter(_t.formItem.dateTime[0].getTime()) : '') : null,
          end_time: _t.formItem.dateTime !== null ? (_t.formItem.dateTime[1] !== undefined ? dateFilter(_t.formItem.dateTime[1].getTime()) : '') : null,
          pageNum: 1,
          pageSize: 10,
        };
        _t.$api.post('/tsGateWay/noStandardCurrency/querySpecialTicketMoneyAuditGateWay', params, function (res) {
          if (res.rtCode === '11029') {
            _t.tableData = res.rtData;
            _t.options.total = res.totalCount ? res.totalCount : 0;
          } else if (res.rtCode) {
            _t.alertDialogTip(_t, res.rtMessage);
          }
        })
      },
      getSelectData() {
        var _t = this;
        var params = {
          flag: '5'
        };
        _t.$api.post('/tsGateWay/noStandardCurrency/queryNoStandardCurrencySourceGateWay', params, function (res) {
          if (res.rtCode == '11022') {
            _t.auditTypeData = res.rtData;
          } else {
            _t.alertDialogTip(_t, res.rtMessage);
          }
        })
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
            // // 选中的车站
            // if (LOCATION_NUMBER !== "") {
            //   _t.formItem.station = LOCATION_NUMBER;
            // }
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
      // 重置
      resetQuery() {
        var _t = this;
         _t.formItem.station = '';
         _t.formItem.typeClearing = '';
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
            _t.getLinesAndStation();
            _t.getSelectData();
          }
        });
        // 判断权限按钮
        limitBtnArr.forEach(item => {
          // 查询
          if (item.MENU_ID === "MENU20191202134441vdlXpVcnTTEjev") {
            _t.limitBtn.queryBtn = true;
          }
        });
      }
    }
  }
</script>

<style scoped>

</style>
