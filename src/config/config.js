// 校验 金额 正则
var isMoneyNumber = /(^[1-9]\d*(\.\d{1,2})?$)|(^[0]{1}(\.\d{1,2})?$)/;
// 校验 数字 正则
var isNumber = /^([0-9]+$)$/;

export default {
  // 校验 金额 正则
  isMoneyNumber: function () {
    return isMoneyNumber;
  },
  // 校验 数字 正则
  isNumber: function () {
    return isNumber;
  }
}
