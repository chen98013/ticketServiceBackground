<template>
  <Box>
    <div class="menu_box">
      <div class="formBox-top">
        <el-form :model="formItem" inline class="clearFix" ref="formItem" label-width="110px">
          <el-form-item label="位置名称：" class="marBottom7">
            <el-input clearable class="width200" v-model="formItem.userId"/>
          </el-form-item>
          <br>
          <el-form-item class="fr marBottom7">
            <el-button type="primary" v-if="limitBtn.query" @click="getData">查询</el-button>
            <el-button type="warning" @click="resetFormItem">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="tableWp">
        <el-table :data="tableData" @expand-change="screen" :row-class-name="getClassName" border stripe ref="table">
          <!--展开行-->
          <el-table-column type="expand">
            <template  v-if="expands.length > 0" slot-scope="scope">
              <!-- 第二层表格 -->
              <el-table  :data="expands" border stripe>
                <el-table-column type="expand">
                  <template slot-scope="first">
                    <!-- 第三层表格 -->
                    <el-table :data="first.row.children" border stripe>
                      <el-table-column type="expand">
                        <template slot-scope="first">
                          <!-- 第四层表格 -->
                          <el-table :data="first.row.children" border stripe>
                            <el-table-column prop="location_number" label="位置Id"/>
                            <el-table-column prop="location_name" label="车站"/>
                            <el-table-column label="操作" align="center" header-align="center">
                              <template slot-scope="first">
                                <el-button type="primary" v-if="limitBtn.edit" @click="editCode(first.row)">修改
                                </el-button>
                              </template>
                            </el-table-column>
                          </el-table>
                        </template>
                      </el-table-column>
                      <el-table-column prop="location_number" label="位置Id"/>
                      <el-table-column prop="location_name" label="车站"/>
                      <el-table-column label="操作" align="center" header-align="center">
                        <template slot-scope="first">
                          <el-button type="primary" v-if="limitBtn.create" @click="addChildrenCode(scope.row)">新增车站
                          </el-button>
                          <el-button type="primary" v-if="limitBtn.edit" @click="editCode(first.row)">修改</el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                  </template>
                </el-table-column>
                <el-table-column prop="location_number" label="位置Id"/>
                <el-table-column prop="location_name" label="车站"/>
                <el-table-column label="操作" align="center" header-align="center">
                  <template slot-scope="first">
                    <el-button type="primary" v-if="limitBtn.create" @click="addChildrenCode(scope.row)">新增车站
                    </el-button>
                    <el-button type="primary" v-if="limitBtn.edit" @click="editCode(first.row)">修改</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </el-table-column>
          <el-table-column prop="location_number" label="位置ID:"/>
          <el-table-column prop="location_name" label="线路:"/>
          <el-table-column label="操作" width="400px" align="center" header-align="center">
            <template slot-scope="scope">
              <!--新增二级-->
              <el-button type="primary" v-if="limitBtn.create" @click="addChildrenCode(scope.row)">新增车站</el-button>
              <el-button type="primary" v-if="limitBtn.edit" @click="editCode(scope.row)">修改</el-button>
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
    </div>
    <!--新增编辑弹出层-->
    <el-dialog
      append-to-body
      :fullscreen="isScreen"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="resetCode"
      :visible.sync="dialogVisible">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">新增/编辑码表</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreen = !isScreen"></i>
      </div>
      <el-form :model="addEdit" ref="addEdit" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="父级线路id：">
              <el-input v-model="addEdit.userid" disabled/>
            </el-form-item>
            <el-form-item class="star" label="新增位置ID：">
              <el-input v-model="addEdit.newlyNameId"/>
            </el-form-item>
            <el-form-item class="star" label="新增位置编码：">
              <el-input v-model="addEdit.newlyLocation"/>
            </el-form-item>
            <el-form-item label="语言编码：">
              <el-input maxlength="4" v-model="addEdit.language"/>
            </el-form-item>
            <el-form-item v-if="addEdit.newlyType == '09'" label="换乘站标记：">
              <el-radio-group v-model="addEdit.is_transferstation">
                <el-radio label="1">是</el-radio>
                <el-radio label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="addEdit.newlyType == '09'" label="车站编码：">
              <el-input v-model="addEdit.station_id"/>
            </el-form-item>
            <el-form-item v-if="addEdit.newlyType == '09'" label="计费位置编码：">
              <el-input v-model="addEdit.fare_station_id"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="父级线路名称：">
              <el-input v-model="addEdit.parentName" disabled/>
            </el-form-item>
            <el-form-item class="star" label="新增位置名称：">
              <el-input v-model="addEdit.newlyName"/>
            </el-form-item>
            <el-form-item label="排序：">
              <el-input v-model="addEdit.station_sort"/>
            </el-form-item>
            <el-form-item label="位置类型：">
              <el-select
                v-model="addEdit.newlyType"
              >
                <el-option
                  v-for="(item,index) in statusList"
                  :key="index"
                  :label="item.NAME"
                  :value="item.VALUE"
                />
              </el-select>
            </el-form-item>
            <el-form-item v-if="addEdit.newlyType == '09'" label="管理站标记：">
              <el-radio-group v-model="addEdit.manager_flag">
                <el-radio label="1">是</el-radio>
                <el-radio label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="addEdit.newlyType == '09'" label="车站名称：">
              <el-input v-model="addEdit.station_name"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button @click="resetCode">取消</el-button>
        <el-button v-if="isAdd === true" type="primary" v-btn-control @click="addCodeData">保存</el-button>
        <el-button v-if="isAdd === false" type="primary" v-btn-control @click="editCodeData">保存</el-button>
      </div>
    </el-dialog>
    <!--修改弹框-->
    <el-dialog
      append-to-body
      :fullscreen="isScreen"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="resetCode"
      :visible.sync="dialogVisible1">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">修改/编辑码表</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreen = !isScreen"></i>
      </div>
      <el-form :model="addEdit" ref="addEdit" label-width="120px">
        <el-form-item class="star" label="位置编码：">
          <el-input v-model="addEdit.newlyLocation" disabled/>
        </el-form-item>
        <el-form-item label="车站名称：">
          <el-input v-model="addEdit.station_name"/>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="resetCode">取消</el-button>
        <el-button type="primary" v-btn-control @click="editCodeData">保存</el-button>
      </div>
    </el-dialog>

  </Box>
</template>

<script>
  import Box from '../../../components/Box';

  export default {
    name: "codeMaintenance",
    components: {Box},
    data() {
      return {
        // 第二层表格数据
        expands: [],
        isScreen: false, // 新增编辑放大缩小
        // 查询表单
        formItem: {
          userId: '', // 编号
        },
        expanded: [], // 模糊展开
        // 车站列表
        stationArr: [],
        // 左侧树接口
        treeData: [],
        defaultProps: {
          label: 'NAME',
          children: 'CHILDREN'
        },
        // 表格数据
        tableData: [],
        // 分页
        options: {
          total: 0, // 总条数
          currentPage: 1, // 当前页码
          pageSize: 10, // 显示条数
        },
        // 是否新增
        isAdd: false,
        // 新增编辑蒙版层
        dialogVisible: false,
        dialogVisible1: false,
        // 新增编辑表单
        addEdit: {
          userid: '', // 父级id
          parentName: '', // 父级名称
          user_location_list: [], // 新增子集列表
          newlyName: '', //车站编码
          newlyLocation: '', //车站位置编码
          newlyNameId: '', //车站名称
          newlyType: '', // 车票类型
          fare_station_id: "", // 计费位置编码
          is_transferstation: "1", // 换乘站标记
          manager_flag: "1", // 管理站标记
          station_sort: "", // 车站排序
          language: '', // 语言编码
          station_id: '', //车站编码
          station_name: '', //车站名称
        },
        // 校验表单
        errorTip: {},
        // 按钮权限
        limitBtn: {
          query: false, // 查询
          create: false, // 新增
          edit: false, // 编辑
          delete: false, // 删除
        },
        statusList: [], // 位置字典
        // 从cookie中获取
        cookieMap: {
          location_number: this.getCookie('LOCATION_NUMBER'), // 位置编号
          user_id: this.getCookie('USER_ID'), // 操作员ID
          role: this.getCookie('USER_TYPE'), // 用户角色
        }
      }
    },
    methods: {
      getRowKeys (row) {
        return row.location_name
      },
      // 表格展开获取子表格
      screen(row) {
        this.expands = [];
        if (row.children) {
          row.children.forEach(item => {
            if (item.location_number !== row.location_number) {
              this.expands.push(item)
            }
          })
        }
      },
      // 重置查询表单
      resetFormItem() {
        var _t = this;
        _t.formItem.userId = '';
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
      //控制展开行是否显示
      getClassName({row}) {
        return row.location_number === null ? 'expendTable' : '';
      },
      // 获取表格数据
      getData() {
        var _t = this;
        var location = _t.formItem.userId ? _t.formItem.userId : "";
        var params = {
          location_type_name: location
        };
        _t.$api.post('/tsGateWay/ticketUtility/locationCascadeQuery', params, function (res) {
          _t.$store.commit('setLoading', false);
          if (res.rtCode && res.rtCode === "14007") {
            var locationTableData = new Array()
            res.rtData.forEach((item) => {
              var obj = new Object();
              obj.location_number = item.LINE_LOCATION_NUMBER.toString();
              obj.location_name = item.LINE_LOCATION_NAME;
              obj.children = new Array();
              if (item.mlcList !== null) {
                item.mlcList.forEach((val) => {
                  var str = new Object();
                  str.location_number = val.LINE_LOCATION_NUMBER.toString();
                  str.location_name = val.LINE_LOCATION_NAME;
                  str.children = new Array();
                  if (val.lineList !== null) {
                    val.lineList.forEach(itemVal => {
                      var lineStr = new Object();
                      lineStr.location_number = itemVal.LINE_LOCATION_NUMBER.toString();
                      lineStr.location_name = itemVal.LINE_LOCATION_NAME;
                      lineStr.station_id = itemVal.STATION_ID;
                      lineStr.children = new Array()
                      if (itemVal.stationList !== null) {
                        itemVal.stationList.forEach(e => {
                          var stationStr = new Object();
                          stationStr.location_number = e.LOCATION_NUMBER;
                          stationStr.location_name = e.STATION_LOCATION_NAME;
                          stationStr.station_id = e.STATION_ID;
                          lineStr.children.push(stationStr)
                        })
                      }
                      if (lineStr.location_name) {
                        str.children.push(lineStr)
                      }
                    })
                  }
                  if (str.location_number) {
                    obj.children.push(str);
                  }
                });
              }
              locationTableData.push(obj);
            });
            _t.tableData = locationTableData;
            _t.options.total = res.totalCount ? res.totalCount : 0;
          } else if (res.rtCode && res.rtCode === "18014") {
            var arr = new Array()
            res.rtData.forEach(item => {
              var obj = new Object();
              obj.location_number = item.LOCATION_NUMBER.toString();
              obj.location_name =  item.STATION_NAME;
              arr.push(obj);
            });
            _t.tableData = arr;
          } else if (res.rtCode) {
            _t.alertDialogTip(_t, res.rtMessage);
          }
        });
      },
      // 点击新增码表按钮
      addCode() {
        var _t = this;
        _t.isAdd = true;
        _t.dialogVisible = true;
      },
      // 点击新增按钮
      addChildrenCode(row) {
        var _t = this;
        _t.isAdd = true;
        _t.dialogVisible = true;
        // 给父级id和name赋值
        _t.addEdit.userid = row.LINE_LOCATION_NUMBER; // 父级id
        _t.addEdit.parentName = row.LINE_LOCATION_NAME; // 父级名称
      },
      // 点击修改按钮
      editCode(row) {
        var _t = this;
        _t.isAdd = false;
        _t.dialogVisible1 = true;
        _t.addEdit.parentId = row.parent_id; // 父级编号
        _t.addEdit.parentName = row.parent_name; // 父级名称
        _t.addEdit.newlyLocation = row.location_number; // 位置编码
        _t.addEdit.station_name = row.location_name; // 车站名称
        _t.addEdit.station_sort = row.STATION_SORT ? row.STATION_SORT : row.station_sort; // 排序
      },
      deleteCode(row) {
        var _t = this;
        var location = row.LINE_LOCATION_NUMBER ? row.LINE_LOCATION_NUMBER : row.LOCATION_NUMBER;
        _t.$confirm('是否确认删除操作?', '删除码表', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let str = 'location_number=' + location.toString();
          let Base64 = require('js-base64').Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          var params = {
            location_number: location, // 位置id
            token: keyToken, // token
          };
          _t.$api.post('/tsGateWay/systemManager/delLocation', params, function (res) {
            if (res.rtCode && res.rtCode === '18013') {
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
      // 重置新增编辑表单
      resetCode() {
        var _t = this;
        _t.dialogVisible = false;
        _t.dialogVisible1 = false;
        _t.addEdit.userid = ''; // 父级编号
        _t.addEdit.parentName = ''; // 父级名称
        _t.addEdit.newlyName = ''; //车站编码
        _t.addEdit.newlyLocation = '';  //车站位置编码
        _t.addEdit.newlyNameId = ''; //车站名称
        _t.addEdit.newlyType = ''; // 车票类型
        _t.addEdit.fare_station_id = ''; // 计费位置编码
        _t.addEdit.is_transferstation = '1'; // 换乘站标记
        _t.addEdit.manager_flag = '1'; // 管理站标记
        _t.addEdit.station_sort = ''; // 车站排序
        _t.addEdit.language = ''; // 语言编码
        _t.addEdit.station_id = ''; //车站编码
        _t.addEdit.station_name = ''; //车站编码
      },

      // 新增码表提交
      addCodeData() {
        var _t = this;
        var user_id = _t.getCookie('USER_ID').toString();
        if (user_id && _t.addEdit.newlyLocation !== '' && _t.addEdit.newlyType !== '' && _t.addEdit.newlyName !== '') {
          let str = 'userid=' + user_id
            + '&location_number=' + _t.addEdit.newlyLocation.toString()
            + '&location_type_id=' + _t.addEdit.newlyType.toString()
            + '&location_type_name=' + _t.addEdit.newlyName.toString()
            + '&location_linguistic_code=' + _t.addEdit.language.toString();
          let Base64 = require('js-base64').Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          var params = {
            userid: user_id,
            location_number: _t.addEdit.newlyLocation, //位置编码
            location_type_id: _t.addEdit.newlyType, //位置类型ID
            location_type_name: _t.addEdit.newlyName, //位置类型名称
            location_linguistic_code: _t.addEdit.language, //语言编码
            station_id: _t.addEdit.station_id, //车站编码
            station_name: _t.addEdit.station_name,//车站名称
            fare_station_id: _t.addEdit.fare_station_id, // 计费位置编码
            is_transferstation: _t.addEdit.is_transferstation, // 换乘站标记
            manager_flag: _t.addEdit.manager_flag, // 管理站标记
            station_sort: _t.addEdit.station_sort, // 车站排序
            token: keyToken
          };
          _t.$api.post('/tsGateWay/systemManager/addNewLocation', params, function (res) {
            if (res.rtCode && res.rtCode === "18012") {
              _t.getData();
              setTimeout(function () {
                _t.resetCode()
              }, 100)
              _t.alertDialogTip(_t, res.rtMessage);
            } else if (res.rtCode) {
              _t.resetCode()
              _t.alertDialogTip(_t, res.rtMessage);
            }
          });
        } else {
          _t.alertDialogTip(_t, '必填项不能为空');
        }
      },
      // 获取位置类型
      getStatusData() {
        var _t = this;
        let str = "guid=GUID000722201906191615";
        let Base64 = require("js-base64").Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        var params = {
          "guid": "GUID000722201906191615",
          "token": keyToken,
        };
        _t.$api.post("/tsGateWay/ticketUtility/queryDict", params, function (res) {
          // 查询成功
          if (res.rtCode && res.rtCode === "14010") {
            _t.statusList = res.rtData === null ? [] : res.rtData;
          }
        });
      },
      // 修改码表提交
      editCodeData() {
        var _t = this;
        var user_id = _t.getCookie('USER_ID').toString();
        if (user_id !== '' && _t.addEdit.newlyLocation !== '') {
          let str = 'userid=' + user_id
            + '&location_number=' + _t.addEdit.newlyLocation.toString();
          let Base64 = require('js-base64').Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          var params = {
            userid: user_id,
            location_number: _t.addEdit.newlyLocation.toString(), //位置类型ID
            station_name: _t.addEdit.station_name, //车站名称
            station_sort: _t.addEdit.station_sort, // 排序
            token: keyToken
          };
          _t.$api.post('/tsGateWay/systemManager/editLocation', params, function (res) {
            if (res.rtCode && res.rtCode === "18015") {
              _t.tableData = res.rtData === null ? [] : res.rtData;
              _t.options.total = res.totalCount ? res.totalCount : 0;
            } else if (res.rtCode) {
              _t.alertDialogTip(_t, res.rtMessage);
            }
          });
        } else {
          _t.alertDialogTip(_t, '必填项不能为空');
        }
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
            _t.getStatusData()
          }
        });
        // 判断权限按钮
        limitBtnArr.forEach((item) => {
          // 查询
          if (item.MENU_ID === "MENU20191008165838smewGipGccZKrm") {
            _t.limitBtn.query = true;
          }
          // 新增
          if (item.MENU_ID === "MENU20191008165859piFKcoaJzbDniR") {
            // _t.limitBtn.create = true;
          }
          // 修改
          if (item.MENU_ID === "MENU20191008165914pXLDLdlrsmaCDT") {
            _t.limitBtn.delete = true;
          }
          // 删除
          if (item.MENU_ID === "MENU20191008165931TxXBoxEOkvpPkF") {
            _t.limitBtn.edit = true;
          }
        });
      }
    }
  }
</script>

<style scoped>

</style>
