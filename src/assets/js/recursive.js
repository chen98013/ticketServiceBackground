// 公用js 方法
// 对某个字段进行 排序操作 prop:需要排序的字段 rev true:为升序,false为降序
const sortObjectValue = (prop, rev) => {
  // 第二个参数没有传递，默认升序排序
  if (rev === undefined) {
    rev = 1;
  } else {
    rev = rev ? 1 : -1;
  }
  return function (obj1, obj2) {
    var val1 = obj1[prop],
      val2 = obj2[prop];
    return val1 < val2 ? rev * (-1) : rev * 1;
  }
};

export {sortObjectValue};
