<template>
  <div class="load_wrapper" :style="{backgroundImage: 'url(' + coverImgUrl + ')', backgroundSize:'100%'}">
    <!--  标题区域  -->
    <div class="title_wrapper">
      <h1 class="title">{{formItem.title}}</h1>
      <h2 class="description">
        <span>欢迎使用&nbsp;</span>
        <span>{{formItem.description}}</span>
      </h2>
    </div>
    <!--  表单区域  -->
    <div v-if="isShowLoginForm" class="form_wrapper">
      <div class="title">账户登录</div>
      <el-form class="formLogin" :model="formModel">
        <el-form-item>
          <el-input
            placeholder="请输入账号"
            maxlength="6"
            v-model="formModel.user"
            @input="inputUser">
            <i slot="suffix" class="el-icon-user-solid fontSize18 marRight10"></i>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-input
            placeholder="请输入密码"
            v-model="formModel.password"
            maxlength="6"
            @input="inputUser"
            @keyup.enter.native="loadBtn($event)"
            type="password">
            <i slot="suffix" class="el-icon-goods fontSize18 marRight10"></i>
          </el-input>
        </el-form-item>
        <el-form-item align="center" class="marBottom10">
          <el-button @click="loadBtn" v-btn-control  type="primary" class="loginBtn">登录</el-button>
        </el-form-item>
      </el-form>
      <p class="titleTip" v-if="isError">{{formModel.loginTip}}</p>
    </div>
    <!--  版权栏区域  -->
    <div class="copyright">
      <span>{{formItem.copyright}}</span>
      <span>{{formItem.version}}</span>
    </div>
    <!--  选择位置区域  -->
    <el-dialog
      title="选择位置"
      :visible.sync="dialogVisible"
      append-to-body
      width="500px"
      :before-close="clearCache"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <div class="treeBox">
        <el-tree
          @check-change="checkChange"
          :data="tableData"
          :props="defaultProps"
          node-key="location_number"
          show-checkbox
          :check-on-click-node="true"
          default-expand-all
          check-strictly
          @check="changeRadio"
          ref="treeForm"/>
      </div>
      <div slot="footer">
        <el-button type="primary" @click="handleClick">确定</el-button>
      </div>
    </el-dialog>
    <!--修改密码弹出层-->
    <el-dialog
      title="修改密码"
      :visible.sync="passwordDialog"
      append-to-body
      :before-close="resetPassword"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <el-form :model="passwordForm" label-width="180px">
        <el-form-item class="star" label="初始密码：">
          <el-input
            maxlength="6"
            @blur="ruleIsNotNull(passwordForm,passwordForm.oldPassword,'oldPasswordFlag')"
            v-model="passwordForm.oldPassword"
            class="width200"
            type="password"/>
          <span class="isNotNull" v-if="passwordForm.oldPasswordFlag">必填项不能为空</span>
        </el-form-item>
        <el-form-item class="star" label="新密码：">
          <el-input
            maxlength="6"
            class="width200"
            type="password"
            @blur="blurPassword(passwordForm,passwordForm.newPassword,passwordForm.confirmPassword)"
            v-model="passwordForm.newPassword"/>
          <span class="isNotNull" v-if="passwordForm.passwordFlag">必填项不能为空</span>
        </el-form-item>
        <el-form-item class="star" label="确认新密码：">
          <el-input
            maxlength="6"
            class="width200"
            type="password"
            @blur="blurConfirmPassword(passwordForm,passwordForm.confirmPassword,passwordForm.newPassword)"
            v-model="passwordForm.confirmPassword"/>
          <span class="isNotNull" v-if="passwordForm.confirmPasswordFlag">{{passwordForm.confirmPasswordTip}}</span>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="resetPassword">取消</el-button>
        <el-button type="primary" @click="commitPassword">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  export default {
    name: "Login",
    data() {
      return {
        // 登录表单
        formModel: {
          user: '',
          password: '',
          loginTip: ''
        },
          coverImgUrl: '',
        //  用户登录验证是否超过3次
        // 重复登录的用户名
        userObj: {
          userName: '',
          userNameError: 0,
          islock: false
        },
        // 校验提示
        isError: false,
        // 信息表单
        formItem: {
          backgroundUrl: '', // 背景图地址
          title: '',
          description: '',
          copyright: '',
          version: ''
        },
        // props
        defaultProps: {
          label: 'location_name',
          children: 'children'
        },
        // 选择位置蒙版 默认首次登录 需要展示选中位置
        dialogVisible: true,
        // 位置列表
        tableData: [],
        // 是否显示登录表单
        isShowLoginForm: true,
        // 位置表单
        locationForm: {
          id: '',
          location_name: '', // 位置名称
          location_number: '', // 位置编码
          location_type_id: '', // 位置类型(和位置相关,09:车站 , 23:线路中心, 22:多线路)
          station_id: '' // 车站类型id
        },
        // 登录权限
        authorityData: [],
        // 修改密码弹出层
        passwordDialog: false,
        // 修改密码表单
        passwordForm: {
          oldPassword: '', // 旧密码
          oldPasswordFlag: false, // 旧密码校验标识
          newPassword: '', // 修改后的密码
          confirmPassword: '', // 确认密码
          passwordFlag: false, //  密码标识
          confirmPasswordFlag: false, // 确认密码标识
          confirmPasswordTip: '', // 确认密码提示
        },
        i: 0, // 计数器
        examine: [],
        examinearr: [],
      }
    },
    methods: {
      // 校验必填项不能为空
      ruleIsNotNull(item, val, flag) {
        item[flag] = val.trim() === '' ? true : false;
      },
      // 校验确认密码
      blurPassword(item, valPwd, valConfirmPwd) {
        if (valPwd.trim() === '') {
          // 为空的校验
          item.passwordFlag = true;
        } else {
          item.passwordFlag = false;
          // 校验两次面输入是否一致
          if (valPwd.trim().toLowerCase() === valConfirmPwd.trim().toLowerCase()) {
            item.confirmPasswordFlag = false;
            item.confirmPasswordTip = '';
          } else if (valConfirmPwd.trim() !== '' && valPwd.trim().toLowerCase() !== valConfirmPwd.trim().toLowerCase()) {
            item.confirmPasswordFlag = true;
            item.confirmPasswordTip = '两次密码输入不一致!';
          }
        }
      },
      // 校验再次确认密码
      blurConfirmPassword(item, valNew, valOld) {
        if (valNew.trim() === '') {
          item.confirmPasswordFlag = true;
          item.confirmPasswordTip = '必填项不能为空!';
        } else {
          // 不为空 校验和第一次输入的密码是否一致
          if (valOld.trim().toLowerCase() === valNew.trim().toLowerCase()) {
            // 相同
            item.confirmPasswordFlag = false;
            item.confirmPasswordTip = '';
          } else {
            // 不相同
            item.confirmPasswordFlag = true;
            item.confirmPasswordTip = '两次密码输入不一致!';
          }
        }
      },
      // 输入校验
      inputUser() {
        var _t = this;
        if (_t.formModel.user.trim() === '' || _t.formModel.password.trim() === '') {
          _t.formModel.loginTip = '账户名或密码不能为空!';
          _t.isError = true;
        } else {
          _t.formModel.loginTip = '';
          _t.isError = false;
        }
      },
      // 提交修改密码
      commitPassword() {
        var _t = this;
        if (_t.formModel.user !== null && _t.formModel.user !== 'null') {
          // 校验旧密码不能为空
          _t.ruleIsNotNull(_t.passwordForm, _t.passwordForm.oldPassword, 'oldPasswordFlag');
          // 校验新密码
          _t.blurPassword(_t.passwordForm, _t.passwordForm.newPassword, _t.passwordForm.confirmPassword);
          // 校验确认新密码
          _t.blurConfirmPassword(_t.passwordForm, _t.passwordForm.confirmPassword, _t.passwordForm.newPassword);
          // 可以提交
          if (_t.passwordForm.oldPasswordFlag === false
            && _t.passwordForm.confirmPasswordFlag === false
            && _t.passwordForm.passwordFlag === false) {
            let str = 'userid=' + _t.formModel.user
              + '&oldpassword=' + _t.passwordForm.oldPassword.trim()
              + '&newpassword=' + _t.passwordForm.newPassword.trim();
            let Base64 = require('js-base64').Base64;
            let keyToken = _t.$md5(Base64.encode(str));
            var params = {
              userid: _t.formModel.user, // 操作员id
              oldpassword: _t.passwordForm.oldPassword.trim(), // 旧密码
              newpassword: _t.passwordForm.newPassword.trim(), // 新密码
              token: keyToken, // token
            };
            _t.$api.post('/tsGateWay/systemManager/editpassword', params, function (res) {
              if (res.rtCode && res.rtCode === '18001') {
                _t.resetPassword();
                setTimeout(function () {
                  _t.alertDialogTip(_t, res.rtMessage);
                }, 1000)
              } else if (res.rtCode) {
                _t.alertDialogTip(_t, res.rtMessage);
              }
            });
          }
        }
      },
      // 重置密码弹出层
      resetPassword() {
        var _t = this;
        _t.passwordDialog = false;
        _t.passwordForm.oldPassword = ''; // 旧密码
        _t.passwordForm.oldPasswordFlag = false; // 旧密码标识
        _t.passwordForm.newPassword = ''; // 修改后的密码
        _t.passwordForm.confirmPassword = ''; // 确认密码
        _t.passwordForm.passwordFlag = false; //  密码标识
        _t.passwordForm.confirmPasswordFlag = false; // 确认密码标识
        _t.passwordForm.confirmPasswordTip = ''; // 确认密码提示
        _t.formModel.password = ''  // 重置首页用户密码
      },
      // 登录按钮
      loadBtn(event) {
        var _t = this;
        event.preventDefault();
        // 校验账户名
        if (_t.formModel.user.trim() === '' || _t.formModel.password.trim() === '') {
          _t.formModel.loginTip = '账户名或密码不能为空!';
          _t.isError = true;
        } else if (_t.formModel.user.trim() !== '' && _t.formModel.password.trim() !== '') {
          _t.isError = false;
          _t.toLogin();
        } else {
          _t.isError = false;
        }
      },
      // 发送登录请求
      toLogin() {
        var _t = this;
        var tokenString = 'userid' + '=' + _t.formModel.user.trim() + '&' + "password" + '=' + _t.formModel.password.trim();
        var Base64 = require('js-base64').Base64;
        var token = _t.$md5(Base64.encode(tokenString));
        var postData = {
          userid: _t.formModel.user.trim(),
          password: _t.formModel.password.trim(),
          token: token
        };
        _t.$api.post('/tsGateWay/systemManager/login', postData, function (res) {
          // 17005 登录成功
          if (res.rtCode && res.rtCode === '17005') {
            // 设置userid
            _t.setCookie('USER_ID', _t.formModel.user.trim());
            // 判断用户密码是不是为000000 初始密码 如果是强制修改
            if (_t.formModel.password === '000000') {
              _t.$confirm('此密码为初始密码是否修改密码', '修改密码', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              }).then(() => {
                _t.passwordDialog = true;
              }).catch(() => {
                return false;
              });
              return;
            }
            // 判断 角色 是否包含 MLC 包含MLC 用MLC 否则用 SC
            var resData = res.rtData;
            _t.authorityData = resData[0].Rolelist;
            // _t.dealWithData(resData[0].Rolelist);
            if (resData && resData.length !== 0) {
              // 处理用户信息
              var Locationlist = resData[0].Locationlist ? resData[0].Locationlist : [];
              if (Locationlist[0]) {
                // 用户昵称
                _t.setCookie('USER_NAME', Locationlist[0].USERNAME);
              }
              // 处理角色
              var roleList = resData[0].Rolelist ? resData[0].Rolelist : [];
              var isMLC = false;
              var limitArr = new Array();
              roleList.forEach((item) => {
                isMLC = true;
                // limitArr = item.Functionlist;
                // 设置 角色类型
                _t.setCookie('USER_TYPE', item.ROLENAME);
              });
              // 没有MLC
              // if (isMLC === false) {
              //   roleList.forEach((item) => {
              //     if (item.ROLENAME === 'SC') {
              //       limitArr = item.Functionlist;
              //       // 设置 角色类型
              //       _t.setCookie('USER_TYPE', item.ROLENAME);
              //     }
              //   });
              // }
              // 显示选择位置表格
              // _t.getData(Locationlist);
              _t.getLocationList(Locationlist);

            }
          } else if (res.rtCode === '24001') {
            //  24001 密码校验失败
            //  限制同一账号密码是否超过3次
            var lock = JSON.parse(_t.getCookie('lock'));
            _t.alertDialogTip(_t, res.rtMessage);
            if (!_t.userObj.islock) {
              if (_t.userObj.userName !== _t.formModel.user && _t.userObj.userNameError == 0) {
                _t.userObj.userName = _t.formModel.user;
                return;
              }
              if (_t.userObj.userName == _t.formModel.user && _t.userObj.userNameError < 3) {
                _t.userObj.userNameError++;
              }
              if (_t.userObj.userName == _t.formModel.user && _t.userObj.userNameError == 3) {
                _t.deblocking(_t.userObj)
              }
            } else {
              if (lock.islock) {
                _t.alertDialogTip(_t, '该用户已锁定');
                _t.clearCache();
                return
              }
            }

          } else if (res.rtCode === '24004') {
            // 24004 查无此人
            _t.alertDialogTip(_t, res.rtMessage);
          } else if (res.rtCode === '24016') {
            _t.alertDialogTip(_t, '用户已被锁定,请联系管理员解锁');
          } else if (res.rtCode === '24005') {
            _t.alertDialogTip(_t, res.rtMessage);
          } else if (res.rtCode === '24006') {
            _t.alertDialogTip(_t, res.rtMessage);
          } else {
            _t.alertDialogTip(_t, res.rtMessage);
          }
        });
      },
      // 锁定用户
      deblocking(val) {
        var _t = this;
        var params = {
          userid: val.userName,
          islock: '1'
        };
        _t.$api.post('/tsGateWay/systemManager/lockAccount', params, function (res) {
          if (res.rtCode === '14012') {
            val.islock = true;
            _t.setCookie('lock', JSON.stringify(val));
            _t.alertDialogTip(_t, '用户锁定成功!');
            _t.formModel.user = '';
            _t.formModel.password = '';
          }
        })
      },
      // 递归将树形转为扁平
      getTreeList(arr, result) {
        var self = this;
        arr.forEach(function (item) {
          if (item !== undefined && item !== null) {
            if (item.CHILDREN !== undefined && item.CHILDREN !== null) {
              result.push(item);
              self.getTreeList(item.CHILDREN, result)
            } else {
              result.push(item);
            }
          }
        });
        return result;
      },
      // 一维数组转换树
      translateDataToTree(treeArray) {
        var data = [...treeArray];
        var tree = data.filter((father) => {
          var branchArr = data.filter((child) => {
            if (father['MENU_ID'] === child['PARENT_ID']) child._hasParent = true;
            return father['MENU_ID'] === child['PARENT_ID'];
          });
          if (branchArr.length > 0) father['CHILDREN'] = branchArr;
          return !father._hasParent;
        });

        // MARK 为什么在这里还得加一个过滤
        tree = tree.filter((item) => {
          return !item._hasParent;
        });
        return tree;
      },
      // 去除数组中menu_id相同的对象
      returnIsNotData(data) {
        let hash = {};
        return data.reduce((pre, cur) => {
          hash[cur.MENU_ID] ? '' : hash[cur.MENU_ID] = true && pre.push(cur);
          return pre;
        }, []);
      },
      // 处理数据
      dealWithData(role) {
        var _t = this;
        // 获取角色关联的菜单集合
        var roleList = role;
        var menuList = new Array(); // 一维数组 用于缓存转换后的菜单集合
        // 遍历集合 将菜单树转为一维数组
        roleList.forEach((item) => {
          if (item.Functionlist !== undefined && item.Functionlist !== null) {
            // 每个角色下的菜单递归转为一维数组
            var funList = _t.getTreeList(item.Functionlist, []);
            funList.forEach((val) => {
              if (val !== undefined && val !== null) {
                menuList.push(val);
              }
            });
          }
        });
        // 去重后的一维数组
        // var oldArr = _t.returnIsNotData(menuList);
        // console.log(oldArr);
        // 新的树
        var newTree = _t.translateDataToTree(_t.returnIsNotData(menuList));
        // 设置路由缓存
        localStorage.setItem('MENU_LIST', JSON.stringify(newTree));
        // 进入系统
        _t.$router.push({name: 'index'});
      },
      // 清除缓存
      clearCache() {
        var _t = this;
        _t.delCookie('USER_ID');
        _t.delCookie('USER_NAME');
        _t.delCookie('USER_TYPE');
        _t.delCookie('LOCATION_NUMBER');
        _t.delCookie('LOCATION_NUMBER_NAME');
        _t.delCookie('LOCATION_TYPE_ID');
        localStorage.removeItem('MENU_LIST');
        localStorage.removeItem('limitMenuList');
        localStorage.removeItem('LOCATION_INFO');
        localStorage.removeItem('BOM_TYPE');
        localStorage.removeItem('TVM_TYPE');
        _t.isShowLoginForm = true;
        _t.dialogVisible = false;
        _t.locationForm.location_number = '';
        _t.locationForm.location_name = '';
        _t.$store.commit('resetState', true);
        _t.i = 0;
      },
      // 获取位置列表
      getLocationList(tableData) {
        var _t = this;
        var params = {};
        _t.$api.post('/tsGateWay/ticketUtility/locationCascadeQuery', params, function (res) {
          // 查到线路信息
          if (res.rtCode && res.rtCode === '14007') {
            var locationTableData = new Array();
            var resData = res.rtData === null ? [] : res.rtData;
            // 处理数据
            resData.forEach((item) => {
              var obj = new Object();
              obj.location_number = item.LINE_LOCATION_NUMBER.toString();
              obj.location_name = item.LINE_LOCATION_NAME;
              obj.location_type_id = item.LINE_LOCATION_TYPE_ID;
              obj.children = new Array();
              obj.disabled = true;
              if (item.mlcList !== null) {
                item.mlcList.forEach((val) => {
                  var str = new Object();
                  str.location_number = val.LINE_LOCATION_NUMBER.toString();
                  str.location_name = val.LINE_LOCATION_NAME;
                  str.location_type_id = val.LINE_LOCATION_TYPE_ID;
                  str.children = new Array();
                  str.disabled = true;
                  if (val.lineList !== null) {
                    val.lineList.forEach(itemVal => {
                      var lineStr = new Object();
                      lineStr.location_number = itemVal.LINE_LOCATION_NUMBER.toString();
                      lineStr.location_name = itemVal.LINE_LOCATION_NAME;
                      lineStr.station_id = itemVal.STATION_ID;
                      lineStr.children = new Array()
                      lineStr.disabled = true;
                      if (itemVal.stationList !== null) {
                        itemVal.stationList.forEach(e => {
                          tableData.forEach(dome => {
                            if (dome.LOCATION_NUMBER == e.LOCATION_NUMBER) {
                              var stationStr = new Object();
                              stationStr.location_number = e.LOCATION_NUMBER;
                              stationStr.location_name = e.STATION_LOCATION_NAME;
                              stationStr.station_id = e.STATION_ID;
                              stationStr.location_type_id = e.LOCATION_TYPE_ID;
                              lineStr.children.push(stationStr)
                            }
                          });

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
            for (var i = 0; i < 10; i++) {
              locationTableData[0].children[0].children.forEach((items, index) => {
                if (items.children.length == 0) {
                  locationTableData[0].children[0].children.splice(index, 1);
                }
              });
            }
            locationTableData.forEach(item => {
              tableData.forEach(e => {
                if (e.LOCATION_NUMBER == item.location_number) {
                  item.disabled = false;
                }
                item.children.forEach(val => {
                  if (e.LOCATION_NUMBER == val.location_number) {
                    val.disabled = false;
                  }
                })
              })
            });
            if (tableData[0].LOCATION_TYPE_ID && tableData.length == 1) {
              _t.setCookie('LOCATION_NUMBER', tableData[0].LOCATION_NUMBER);
              _t.setCookie('LOCATION_NUMBER_NAME', tableData[0].STATION_NAME);
              _t.setCookie('LOCATION_TYPE_ID', tableData[0].LOCATION_TYPE_ID);
              _t.setCookie('STATION_ID', _t.locationForm.station_id);
              _t.getLocationLimited(tableData[0].LOCATION_TYPE_ID);
            } else if (tableData.length == 1 && tableData[0].LOCATION_NUMBER == '385875969') {
              _t.setCookie('LOCATION_NUMBER', locationTableData[0].location_number);
              _t.setCookie('LOCATION_NUMBER_NAME', locationTableData[0].location_name);
              _t.setCookie('LOCATION_TYPE_ID', locationTableData[0].location_type_id);
              _t.getLocationLimited(locationTableData[0].location_type_id);

            } else if (tableData.length == 1 && tableData[0].LOCATION_NUMBER == '369099009') {
              _t.setCookie('LOCATION_NUMBER', locationTableData[0].children[0].location_number);
              _t.setCookie('LOCATION_NUMBER_NAME', locationTableData[0].children[0].location_name);
              _t.setCookie('LOCATION_TYPE_ID', locationTableData[0].children[0].location_type_id);
              _t.getLocationLimited(locationTableData[0].children[0].location_type_id);

            } else {
              // 显示选择位置弹出层
              _t.dialogVisible = true;
              // 隐藏登录表单区域
              _t.isShowLoginForm = false;
              _t.tableData = locationTableData;
            }

          } else if (res.rtCode) {
            _t.locationTableData = [];
            _t.alertDialogTip(_t, res.rtMessage);
          }
        });
      },
      // 获取缓存的位置信息
      getData(tableData) {
        var _t = this;
        // 遍历缓存的位置信息
        tableData.forEach((item) => {
          // 字段重置,防止字段为空
          item.LOCATION_NUMBER = item.LOCATION_NUMBER ? item.LOCATION_NUMBER : '';
          item.STATION_NAME = item.STATION_NAME ? item.STATION_NAME : '';
        });
        _t.tableData = tableData;
        // 判断位置条数只有一条时直接登录
        if (_t.tableData.length === 1) {
          _t.setCookie('LOCATION_NUMBER', _t.tableData[0].LOCATION_NUMBER);
          _t.setCookie('LOCATION_NUMBER_NAME', _t.tableData[0].STATION_NAME);
          _t.setCookie('LOCATION_TYPE_ID', _t.tableData[0].LOCATION_TYPE_ID);
          // 隐藏选择位置弹出层
          _t.dialogVisible = false;
          // 显示登录表单区域
          _t.isShowLoginForm = true;
          _t.$router.push({name: 'index'});
        } else {
          // 显示选择位置弹出层
          _t.dialogVisible = true;
          // 隐藏登录表单区域
          _t.isShowLoginForm = false;
        }
      },
      // 获取用户对应的位置列表
      getLocationListWithUserId() {
        var _t = this;
        if (_t.tableSelect.user_id !== '') {
          var params = {
            user_id: _t.tableSelect.user_id,
          };
          _t.$api.post('/tsGateWay/systemManager/queryUserLocation', params, function (res) {
            if (res.rtCode && res.rtCode === "18049") {
              var resData = res.rtData === null ? [] : res.rtData;
              resData.forEach((item) => {
                _t.$refs.tree.setChecked(item.LOCATION_NUMBER, true);
              });
            } else if (res.rtCode) {
              _t.alertDialogTip(_t, res.rtMessage);
            }
          });
        }
      },
      // 点击选择车站按钮
      handleClick() {
        var _t = this;
        if (_t.locationForm.id !== '') {
          // 可以提交 设置location_number 及 location_name
          _t.setCookie('LOCATION_NUMBER', _t.locationForm.location_number);
          _t.setCookie('LOCATION_NUMBER_NAME', _t.locationForm.location_name);
          _t.setCookie('LOCATION_TYPE_ID', _t.locationForm.location_type_id);
          _t.getLocationLimited(_t.locationForm.location_type_id);
          _t.setCookie('STATION_ID', _t.locationForm.station_id);
          // 隐藏选择位置蒙版
          _t.dialogVisible = false;
          // 显示登录表单
          _t.isShowLoginForm = true;

        } else {
          // 未选中车站
          _t.alertDialogTip(_t, '请选择登录位置或相关信息!');
        }
      },
      // tree 单选问题
      checkChange(data, checked, node) {
        if (checked) {
          this.$refs.treeForm.setCheckedNodes([data]);
        }
      },
      // 改变 表格的 单选按钮
      changeRadio(data) {
        var _t = this;
        _t.locationForm.id = '';
        if(this.$refs.treeForm.getCheckedNodes().length > 0) {
          _t.locationForm.id = _t.$refs.treeForm.getCheckedNodes()[0].location_number; // id
          _t.locationForm.location_number =_t.$refs.treeForm.getCheckedNodes()[0].location_number; // 位置编码
          _t.locationForm.location_name = _t.$refs.treeForm.getCheckedNodes()[0].location_name; // 位置名称
          _t.locationForm.station_id = _t.$refs.treeForm.getCheckedNodes()[0].station_id; // 车站类型id
          _t.locationForm.location_type_id = _t.$refs.treeForm.getCheckedNodes()[0].location_type_id ?_t.$refs.treeForm.getCheckedNodes()[0].location_type_id : ''
        }

        // _t.locationForm.location_type_id = row.LOCATION_TYPE_ID; // 位置类型
      },
      // 点击表格行
      rowClick(row) {
        var _t = this;
        _t.changeRadio(row);
      },
      // 获取前五天的时间
      getBeforeDate(n) {
        var n = n;
        var d = new Date();
        var year = d.getFullYear();
        var mon = d.getMonth() + 1;
        var day = d.getDate();
        if (day <= n) {
          if (mon > 1) {
            mon = mon - 1;
          } else {
            year = year - 1;
            mon = 12;
          }
        }
        d.setDate(d.getDate() - n);
        year = d.getFullYear();
        mon = d.getMonth() + 1;
        day = d.getDate();
        var s = year + "-" + (mon < 10 ? ('0' + mon) : mon) + "-" + (day < 10 ? ('0' + day) : day);
        return s;
      },
      getTime() {
        var _t = this;
        var fiveTime = _t.getBeforeDate(5);  // 获取前五天的时间
        var yesterday = _t.getBeforeDate(1);  // 获取昨天的时间
        _t.setCookie('ODL_TIME', fiveTime);
        _t.setCookie('YESTERDAY', yesterday);
      },
      // 获取版本信息
      getVersions() {
        var _t = this;
        var params = {
          pageNum: 1, // 当前页
          pageSize: 20, // 每页显示条数
        };
        _t.$api.post('/tsGateWay/systemManager/queryParameter', params, function (res) {
          if (res.rtCode && res.rtCode === '18040') {
            var versionsAll = {
              copyright: '',
              versionNumber: '',
              welcomeLanguage: '',
              backstage: '',
              baseURL: ''
            };
            res.rtData.forEach(item => {
              if (item.GUID === 'DEVCRI999999999') {
                // 版权
                versionsAll.copyright = item.PARAMETER_VALUE;
              } else if (item.GUID === 'DEV88888820190829112101') {
                // 欢迎语
                versionsAll.welcomeLanguage = item.PARAMETER_VALUE;
              } else if (item.GUID === 'DEV8888820190828171945') {
                // 后台名称
                versionsAll.backstage = item.PARAMETER_VALUE
              } else if (item.GUID === 'DEV8888820190828172042') {
                // 版本号
                versionsAll.versionNumber = item.PARAMETER_VALUE;
              } else if (item.GUID === 'GUID88888820191030184239') {
                // 背景图
                versionsAll.baseURL = item.PARAMETER_VALUE;
              }

            });
            _t.formItem.title = versionsAll.welcomeLanguage; // 欢迎语
            _t.formItem.description = versionsAll.welcomeLanguage;
            _t.formItem.copyright = versionsAll.copyright + " " + '版权所有' + ' '; // 版权
            _t.formItem.version = versionsAll.versionNumber;
            _t.formItem.backgroundUrl = versionsAll.baseURL; // 背景图片
           _t.coverImgUrl = versionsAll.baseURL;
            _t.setCookie('BACKSTAGE', versionsAll.backstage);
          } else if (res.rtCode) {
            _t.alertDialogTip(_t, res.rtMessage);
          }
        });
      },
      //获取位置权限
      getLocationLimited(data) {
        var _t = this;
        var params = {
          location_type_id: data,
          operate_type: '0',
        };
        _t.$api.post('/tsGateWay/systemManager/queryLocationRole', params, function (res) {
          if (res.rtCode && res.rtCode === "18066") {
            var resData = res.rtData? res.rtData : [];
            var arr = [];
            _t.authorityData.forEach(item => {
              resData.forEach(val => {
                if (item.ROLECODE == val) {
                  arr.push(item)
                }
              })
            });
            if (arr.length == 0) {
               _t.alertDialogTip(_t, '该用户没有登录此位置权限,请联系管理员配置权限!');
            }else {
              _t.dealWithData(arr);
            }

          } else if (res.rtCode) {
            _t.alertDialogTip(_t, res.rtMessage);
          }
        });
      },
    },
    created() {
      this.getTime();
      this.clearCache();
      this.getVersions();

    }
  }
</script>
<style scoped>
  .load_wrapper {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    /*background: url("../../src/assets/img/login_bg.jpg") no-repeat center center/ 100% 100%;*/
  }

  .title_wrapper {
    position: absolute;
    left: 30%;
    top: 45%;
    height: 300px;
    color: #fff;
    transform: translate(-50%, -50%);
  }

  .title_wrapper .title {
    font-size: 40px;
    margin-bottom: 50px;
  }

  .title_wrapper .description {
    font-size: 30px;
  }

  .form_wrapper {
    position: absolute;
    left: 70%;
    top: 45%;
    width: 430px;
    height: 300px;
    transform: translate(-50%, -50%);
    background-color: #fff !important;
    padding: 10px 30px;
    border-radius: 10px;
    border: 1px solid #fff;
    color: #fff;
    font-size: 14px;
    opacity: .78;
  }

  .form_wrapper .title {
    font-size: 30px;
    text-align: center;
    color: #333;
    height: 55px;
    line-height: 55px;
    margin-bottom: 15px;
  }

  .loginBtn {
    width: 100%;
  }

  .titleTip {
    color: #fb6041;
    text-align: center;
  }

  .copyright {
    height: 50px;
    line-height: 50px;
    text-align: center;
    font-size: 14px;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    color: #fff;
  }
</style>
<style>
  .formLogin label.el-form-item__label {
    font-weight: bold;
  }
</style>
