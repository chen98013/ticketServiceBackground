<template>
  <Box>
    <div class="menu_box">
      <div class="formBox-top">
        <el-form :model="formItem" inline class="clearFix" ref="formItem" label-width="110px">
          <el-form-item label="编号：" class="marBottom7">
            <el-input  clearable class="width200" v-model="formItem.guid"/>
          </el-form-item>
          <el-form-item label="类型：" class="marBottom7">
            <el-select class="width200" v-model="formItem.codeType" clearable>
              <el-option value="00" label="00"/>
              <el-option value="01" label="01"/>
              <el-option value="02" label="02"/>
            </el-select>
          </el-form-item>
          <br>
          <el-form-item class="fr marBottom7">
            <el-button type="primary" v-if="limitBtn.query" @click="getData">查询</el-button>
            <el-button type="warning" @click="resetFormItem">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="marBottom10">
        <el-button type="primary" v-if="limitBtn.create" @click="addCode">新增一级</el-button>
      </div>
      <div class="tableWp">
        <el-table :data="tableData"  @expand-change="screen" :row-class-name="getClassName" border stripe ref="table">
          <!--展开行-->
          <el-table-column type="expand">
            <template slot-scope="scope">
              <!-- 第二层表格 -->
              <el-table :data="scope.row.expands" border stripe>
                <el-table-column type="expand">
                  <template slot-scope="first">
                    <!--第三层表格-->
                    <el-table :data="first.row.CHILDREN" border stripe>
                      <el-table-column prop="guid" label="编号"/>
                      <el-table-column prop="name" label="标签名"/>
                      <el-table-column prop="value" label="数据值"/>
                      <el-table-column prop="type_id" label="类型编号"/>
                      <el-table-column prop="del_flag_name" label="是否已删除"/>
                      <el-table-column label="操作" width="250px" align="center" header-align="center">
                        <template slot-scope="second">
                          <el-button type="primary" v-if="limitBtn.edit" @click="editCode(second.row)">修改</el-button>
                          <el-button type="danger" v-if="limitBtn.delete" @click="deleteCode(second.row)">删除
                          </el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                  </template>
                </el-table-column>
                <el-table-column prop="guid" label="编号"/>
                <el-table-column prop="name" label="标签名"/>
                <el-table-column prop="value" label="数据值"/>
                <el-table-column prop="type_id" label="类型编号"/>
                <el-table-column prop="del_flag_name" label="是否已删除"/>
                <el-table-column label="操作" width="300px" align="center" header-align="center">
                  <template slot-scope="first">
                    <!--新增三级-->
                    <el-button type="primary" v-if="limitBtn.create" @click="addChildrenCode(first.row)">新增子级
                    </el-button>
                    <el-button type="primary" v-if="limitBtn.edit" @click="editCode(first.row)">修改</el-button>
                    <el-button type="danger" v-if="limitBtn.delete" @click="deleteCode(first.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </el-table-column>
          <el-table-column prop="GUID" label="编号"/>
          <el-table-column prop="NAME" label="标签名"/>
          <el-table-column prop="VALUE" label="数据值"/>
          <el-table-column prop="TYPE_ID" label="类型编号"/>
          <el-table-column prop="DEL_FLAG_NAME" label="是否已删除"/>
          <el-table-column label="操作" width="300px" align="center" header-align="center">
            <template slot-scope="scope">
              <!--新增二级-->
              <el-button type="primary" v-if="limitBtn.create" @click="addChildrenCode(scope.row)">新增子级</el-button>
              <el-button type="primary" v-if="limitBtn.edit" @click="editCode(scope.row)">修改</el-button>
              <el-button type="danger" v-if="limitBtn.delete" @click="deleteCode(scope.row)">删除</el-button>
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
        <el-form-item label="父级编号：">
          <el-input v-model="addEdit.parentId" disabled/>
        </el-form-item>
        <el-form-item label="父级名称：">
          <el-input v-model="addEdit.parentName" disabled/>
        </el-form-item>
        <el-form-item label="标签名：">
          <el-input v-model="addEdit.codeName"/>
        </el-form-item>
        <el-form-item label="数据值：">
          <el-input v-model="addEdit.codeData"/>
        </el-form-item>
        <el-form-item label="排序：">
          <el-input
            oninput="value=value.replace(/[^\d]/g,'')"
            v-model="addEdit.codeSort"/>
        </el-form-item>
        <el-form-item label="是否删除：">
          <el-radio-group v-model="addEdit.codeUse">
            <el-radio label="1">已删除</el-radio>
            <el-radio label="0">未删除</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述：">
          <el-input type="textarea" v-model="addEdit.codeNote"/>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="resetCode">取消</el-button>
        <el-button v-if="isAdd === true" type="primary" v-btn-control @click="addCodeData">保存</el-button>
        <el-button v-if="isAdd === false" type="primary" v-btn-control @click="editCodeData">保存</el-button>
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
          guid: '', // 编号
          codeType: '', // 类型
        },
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
        // 新增编辑表单
        addEdit: {
          parentId: '', // 父级编号
          parentName: '', // 父级名称
          codeNum: '', // 编号
          codeName: '', // 标签名
          codeData: '', // 数据值
          codeSort: '', // 排序序号
          codeNote: '', // 描述
          codeUse: '', // 是否删除
          type: '',// 类型
          GUID: ''// 表格编号
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
        // 从cookie中获取
        cookieMap: {
          location_number: this.getCookie('LOCATION_NUMBER'), // 位置编号
          user_id: this.getCookie('USER_ID'), // 操作员ID
          role: this.getCookie('USER_TYPE'), // 用户角色
        }
      }
    },
    methods: {
      screen(row) {
        // this.expands = [];
        row.expands = [];
        row.CHILDREN.forEach(item => {
          if (item.parent_name == row.NAME) {
            row.expands.push(item)
          }
        })
      },
      // 重置查询表单
      resetFormItem() {
        var _t = this;
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
      // 控制展开行是否显示
      getClassName({row}) {
        return row.CHILDREN === null ? 'expendTable' : '';
      },
      blurInput(item, val, flag) {
        item[flag] = val.trim() === '' ? true : false;
      },
      // 获取表格数据
      getData() {
        var _t = this;
        var params = {
          code_type: _t.formItem.codeType === '' ? '00' : _t.formItem.codeType,
          guid: _t.formItem.guid.trim() === '' ? null : _t.formItem.guid.trim(),
          pageNum: _t.options.currentPage, // 当前页
          pageSize: _t.options.pageSize, // 每页显示条数
        };
        _t.$api.post('/tsGateWay/systemManager/querySysCodeTree', params, function (res) {
          _t.$store.commit('setLoading', false);
          if (res.rtCode && res.rtCode === "18052") {
            _t.tableData = res.rtData === null ? [] : res.rtData;
            _t.options.total = res.totalCount ? res.totalCount : 0;
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
        _t.addEdit.parentId =  '0';
        _t.addEdit.parentName = '0';
        _t.addEdit.type = '00'; // 类型
      },
      // 点击新增子级按钮
      addChildrenCode(row) {
        var _t = this;
        _t.isAdd = true;
        _t.dialogVisible = true;
        // 给父级id和name赋值
        _t.addEdit.parentId = row.GUID ? row.GUID : row.guid; // 父级id
        _t.addEdit.parentName = row.NAME ? row.NAME : row.name; // 父级名称
        _t.addEdit.type = row.TYPE_ID ? row.TYPE_ID : row.type_id; // 类型
      },
      // 点击修改按钮
      editCode(row) {
        var _t = this;
        _t.isAdd = false;
        _t.dialogVisible = true;
        _t.addEdit.parentId = row.PARENT_ID? row.PARENT_ID: row.parent_id; // 父级编号
        _t.addEdit.parentName = row.parent_name; // 父级名称
        _t.addEdit.codeName = row.NAME?row.NAME: row.name; // 标签名
        _t.addEdit.codeData = row.VALUE?row.VALUE: row.value; // 数据值
        _t.addEdit.codeSort = row.SORT?row.SORT: row.sort; // 排序
        _t.addEdit.codeNote = row.description; // 描述
        _t.addEdit.codeUse = row.DEL_FLAG_ID?row.DEL_FLAG_ID:row.del_flag_id; // 是否删除
        _t.addEdit.GUID = row.GUID ? row.GUID: row.guid; // 表格编号
        _t.addEdit.type = row.TYPE_ID?row.TYPE_ID: row.type_id;
      },
      // 删除菜单按钮
      deleteCode(row) {
        var _t = this;
        var guid = row.guid ?row.guid:row.GUID
        _t.$confirm('是否确认删除操作?', '删除码表', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let str = 'guid=' + guid;
          let Base64 = require('js-base64').Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          var params = {
            guid: guid, // id
            token: keyToken, // token
          };
          _t.$api.post('/tsGateWay/systemManager/delSysCode', params, function (res) {
            if (res.rtCode && res.rtCode === '18037') {
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
        _t.addEdit.parentId = ''; // 父级编号
        _t.addEdit.parentName = ''; // 父级名称
        _t.addEdit.codeNum = ''; // 编号
        _t.addEdit.codeName = ''; // 标签名
        _t.addEdit.codeData = ''; // 数据值
        _t.addEdit.codeSort = ''; // 排序序号
        _t.addEdit.codeNote = ''; // 描述
        _t.addEdit.type = ''; //  类型
        _t.addEdit.GUID = ''; // 表格编号
      },
      // 新增码表提交
      addCodeData() {
        var _t = this;
        var userid = _t.cookieMap.user_id;
        let str = "userid=" + userid
          + "&name=" + _t.addEdit.codeName
          + "&value=" + _t.addEdit.codeData
          + "&type=" + _t.addEdit.type
          + "&sort=" + _t.addEdit.codeSort
          + "&parent_id=" + _t.addEdit.parentId
          + "&del_flag=" + _t.addEdit.codeUse;
        let Base64 = require("js-base64").Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        var params = {

          "token": keyToken,
          userid: _t.cookieMap.user_id.toString(), // 操作员id
          name: _t.addEdit.codeName.toString(), // 标签名
          value: _t.addEdit.codeData.toString(), // 数据值
          type: _t.addEdit.type.toString(),// 类型
          description: _t.addEdit.codeNote,// 描述
          sort: _t.addEdit.codeSort.toString(),// 排序（升序）
          parent_id: _t.addEdit.parentId,// 父级编号
          del_flag: _t.addEdit.codeUse, // 删除标记
          remarks: '',
        };
        _t.$api.post('/tsGateWay/systemManager/addSysCode', params, function (res) {
          if (res.rtCode && res.rtCode === '18035') {
            _t.getData();
            setTimeout(function () {
              _t.resetCode();
            }, 100);
          } else if (res.rtCode) {
            _t.alertDialogTip(_t, res.rtMessage);
          }
        });

      },
      // 修改表提交
      editCodeData() {
        var _t = this;
        let str = "userid=" + _t.cookieMap.user_id.toString()
          +'&guid='+  _t.addEdit.GUID;

        let Base64 = require("js-base64").Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        var params = {
          "token": keyToken,
          guid: _t.addEdit.GUID ,
          userid: _t.cookieMap.user_id.toString(), // 操作员id
          name: _t.addEdit.codeName.toString(), // 标签名
          value: _t.addEdit.codeData.toString(), // 数据值
          type: _t.addEdit.type.toString(),// 类型
          description: _t.addEdit.codeNote,// 描述
          sort: _t.addEdit.codeSort.toString(),// 排序（升序）
          parent_id: _t.addEdit.parentId,// 父级编号
          del_flag: _t.addEdit.codeUse, // 删除标记
          remarks: '',
        };
        _t.$api.post('/tsGateWay/systemManager/editSysCode', params, function (res) {
          if (res.rtCode && res.rtCode === '18036') {
            setTimeout(function(){
              _t.resetCode();
            },100);
            _t.getData();
          } else if (res.rtCode) {
            _t.alertDialogTip(_t, res.rtMessage);
          }
        });
      },
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
          if (item.MENU_ID === "MENU20190827162420HvJtrTBNjGbmsi") {
            _t.limitBtn.query = true;
          }
          // 新增
          if (item.MENU_ID === "MENU20190827162431kafJOosgNWORcu") {
            _t.limitBtn.create = true;
          }
          // 删除
          if (item.MENU_ID === "MENU20190827162457iJwdZCwWsTVYpg") {
            _t.limitBtn.delete = true;
          }
          // 编辑
          if (item.MENU_ID === "MENU20190827162442WFqaHCknnCQzaK") {
            _t.limitBtn.edit = true;
          }
        });
      }
    }
  }
</script>

<style scoped>

</style>
