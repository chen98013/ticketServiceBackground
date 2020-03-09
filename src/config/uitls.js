//   // 获取前几天的时间
export  function getBeforeDate(n) {
  var date1 = new Date(),
    time1=date1.getFullYear()+"-"+(date1.getMonth()+1)+"-"+date1.getDate();//time1表示当前时间
  var date2 = new Date(date1);
  date2.setDate(date1.getDate()+n);
  var time2 = date2.getFullYear()+"-"+(date2.getMonth()+1)+"-"+date2.getDate();
  return time2
}

