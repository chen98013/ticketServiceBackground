import Vue from 'vue';
import Router from 'vue-router';
// 主页面
const index = () => import('@/views/index');
// 登录页
const Login = () => import('@/views/Login');
// 首页
const Home = () => import('@/views/Home');
// 车票库存
const ticketStockChange = () => import('@/views/ticket/ticketStock/ticketStockChange');
// 车票库存操作记录
const ticketStockRecord = () => import('@/views/ticket/ticketStock/ticketStockRecord');
// 车票库存盘点
const ticketStockInventory = () => import('@/views/ticket/ticketStock/ticketStockInventory');
// 车票调拨
const ticketTransfers = () => import('@/views/ticket/ticketAllocate/ticketTransfers');
// 车票配发
const ticketAllotment = () => import('@/views/ticket/ticketAllocate/ticketAllotment');
// 车票上交
const ticketUpper = () => import('@/views/ticket/ticketAllocate/ticketUpper');
// AG回收
const AGRecycle = () => import('@/views/ticket/ticketRecycle/AGRecycle');
// MLC回收SC库存
const MLCRecycle = () => import('@/views/ticket/ticketRecycle/MLCRecycle');
// 备用金库存变更
const moneyStockChange = () => import('@/views/spareMoney/spareMoneyStock/moneyStockChange');
// 备用金库存操作记录
const moneyStockRecord = () => import('@/views/spareMoney/spareMoneyStock/moneyStockRecord');
// 备用金调配的配发
const spareAllotment = () => import('@/views/spareMoney/spareMoneyAllocate/spareAllotment');
// 备用金调配的上交
const spareUpper = () => import('@/views/spareMoney/spareMoneyAllocate/spareUpper');
// 备用金调配的回收
const spareRecycle = () => import('@/views/spareMoney/spareMoneyAllocate/spareRecycle');
// 收益管理库存变更
const profitStockChange = () => import('@/views/profit/profitStock/profitStockChange');
// 收益管理库存操作记录
const profitStockRecord = () => import('@/views/profit/profitStock/profitStockRecord');
// 长短款管理
const profitLengthChange = () => import('@/views/profit/profitLength/profitLengthChange');
// 长短款补款单据
const profitLengthBills = () => import('@/views/profit/profitLength/profitLengthBills');
// 收益解行
const profitSolution = () => import('@/views/profit/profitSolution/profitSolution');
// 审核管理 -> BOM操作单
const BOMOperation = () => import('@/views/examine/BOM/BOMOperation');
// 审核管理 -> BOM结算单
const BOMSettlement = () => import('@/views/examine/BOM/BOMSettlement');
// 审核管理 -> BOM操作单 -> 详情
const BOMOperationDetail = () => import('@/views/examine/BOM/BOMOperationDetail');
// 审核管理 -> BOM操作单 -> 配票备用金
const BOMOperationAdd = () => import('@/views/examine/BOM/BOMOperationAdd');
// 审核管理 -> BOM操作单 -> 追加备用金
const BOMOperationEdit = () => import('@/views/examine/BOM/BOMOperationEdit');
// 审核管理 -> BOM操作单 -> 收益预收
const BOMOperationAdvance = () => import('@/views/examine/BOM/BOMOperationAdvance');
// 审核管理 -> BOM操作单 -> 回收
const BOMOperationRecycle = () => import('@/views/examine/BOM/BOMOperationRecycle');
// 审核管理 -> BOM操作单 -> 结算单
const BOMOperationCurrency = () => import('@/views/examine/BOM/BOMOperationCurrency');
// 审核管理 -> TVM操作单
const TVMOperation = () => import('@/views/examine/TVM/TVMOperation');
// 审核管理 -> TVM结算单
const TVMSettlement = () => import('@/views/examine/TVM/TVMSettlement');
// 审核管理 -> TVM操作单 -> 详情
const TVMOperationDetail = () => import('@/views/examine/TVM/TVMOperationDetail');

// 审核管理 -> TVM操作单 -> 装机
const TVMOperationAdd = () => import('@/views/examine/TVM/TVMOperationAdd');
// 审核管理 -> TVM操作单 -> 补充
const TVMOperationEdit = () => import('@/views/examine/TVM/TVMOperationEdit');
// 审核管理 -> TVM操作单 -> 清点
const TVMOperationAdvance = () => import('@/views/examine/TVM/TVMOperationAdvance');
// 审核管理 -> TVM操作单 -> 回收
const TVMOperationRecycle = () => import('@/views/examine/TVM/TVMOperationRecycle');
// 审核管理 -> TVM操作单 -> 装机信息结算单
const TVMOperationCurrency = () => import('@/views/examine/TVM/TVMOperationCurrency');
// 系统管理 -> 用户管理
const userMaintenance = () => import('@/views/system/user/userMaintenance');
// 系统管理 -> 角色管理
const roleMaintenance = () => import('@/views/system/user/roleMaintenance');
// 系统管理 -> 位置管理
const locationMaintenance = () => import('@/views/system/user/locationMaintenance');
// 系统管理 -> 菜单管理
const menuMaintenance = () => import('@/views/system/user/menuMaintenance');
// 系统管理 -> 基础参数管理
const basicMaintenance = () => import('@/views/system/parameter/basicMaintenance');
// 系统管理 -> 码表管理
const codeMaintenance = () => import('@/views/system/parameter/codeMaintenance');
// 系统管理 -> 现金库存报警参数
const moneyFlowSiren = () => import('@/views/system/parameter/moneyFlowSiren');
// 系统管理 -> 车票库存报警参数 ticketFlowSiren
const ticketFlowSiren = () => import('@/views/system/parameter/ticketFlowSiren');
// 系统管理 -> 设备管理
const equipmentMaintenance = () => import('@/views/system/parameter/equipmentMaintenance');
// 系统管理 -> 车站管理
const stationMaintenance = () => import('@/views/system/parameter/stationMaintenance');
// 系统管理 -> 定时任务管理
const taskMaintenance = () => import('@/views/system/parameter/taskMaintenance');
// 系统管理 -> 位置权限合并
const locationLimitedMerge = () => import('@/views/system/parameter/locationLimitedMerge');
// 系统管理 -> 车票库存管理类型
const typeMaintenance = () => import('@/views/system/parameter/typeMaintenance');

// 系统报表管理 -> 全线速报 -> 时实客流统计
const newestPassenger = () => import('@/views/systemReportFile/allExpress/newestPassenger');

// 系统报表管理 -> 客流统计 -> 车站设备客流统计
const equipmentPassenger = () => import('@/views/systemReportFile/passengerStatistics/equipmentPassenger');
// 系统报表管理 -> 客流统计 -> 车站票种客流统计
const ticketPassenger = () => import('@/views/systemReportFile/passengerStatistics/ticketPassenger');
// 系统报表管理 -> 客流统计 -> 车站单程票销售数量统计
const singleNumber = () => import('@/views/systemReportFile/passengerStatistics/singleNumber');
// 系统报表管理 -> 客流统计 -> 线路设备客流统计
const lineEquipmentPassenger = () => import('@/views/systemReportFile/passengerStatistics/lineEquipmentPassenger');
// 系统报表管理 -> 客流统计 -> 线路票种客流统计
const lineTicketPassenger = () => import('@/views/systemReportFile/passengerStatistics/lineTicketPassenger');

// 系统报表管理 -> 消费统计 -> 线路分票种消费统计
const lineTicketConsume = () => import('@/views/systemReportFile/consumptionStatistics/lineTicketConsume');
// 系统报表管理 -> 消费统计 ->  车站分设备消费统计
const stationEquipmentConsume = () => import('@/views/systemReportFile/consumptionStatistics/stationEquipmentConsume');

// 系统报表管理 -> 收益统计 ->  车站操作员结算统计
const stationOperation = () => import('@/views/systemReportFile/earningsStatistics/stationOperation');
// 系统报表管理 -> 收益统计 ->  TVM结算统计
const TVMOperationStatistics = () => import('@/views/systemReportFile/earningsStatistics/TVMOperationStatistics');
// 系统报表管理 -> 收益统计 ->  线路运营发售收益
const lineRunStatistics = () => import('@/views/systemReportFile/earningsStatistics/lineRunStatistics');
// 系统报表管理 -> 收益统计 ->  线路BOM收益汇总
const lineBOMStatistics = () => import('@/views/systemReportFile/earningsStatistics/lineBOMStatistics');
// 系统报表管理 -> 收益统计 ->  线路TVM收益汇总
const lineTVMStatistics = () => import('@/views/systemReportFile/earningsStatistics/lineTVMStatistics');
// 系统报表管理 -> 收益统计 ->  线路分票种收益汇总
const lineTicketStatistics = () => import('@/views/systemReportFile/earningsStatistics/lineTicketStatistics');

// 系统报表管理 -> 车票销售回收统计 ->  线路车票销售统计
const lineFareMarket = () => import('@/views/systemReportFile/fareMarketRecycle/lineFareMarket');
// 系统报表管理 -> 车票销售回收统计 ->  线路单程票销售统计
const lineSingleMarket = () => import('@/views/systemReportFile/fareMarketRecycle/lineSingleMarket');

// 系统报表管理 ->  进出站量统计 ->  全栈进出站量统计
const completeTurnover = () => import('@/views/systemReportFile/turnover/completeTurnover');
// 系统报表管理 ->  进出站量统计 ->   票种进出站量分时段统计
const ticketTurnover = () => import('@/views/systemReportFile/turnover/ticketTurnover');
// 系统报表管理 ->  进出站量统计 ->  车站进出站量分时段统计
const stationTurnover = () => import('@/views/systemReportFile/turnover/stationTurnover');
// 系统报表管理 ->  进出站量统计 ->  进出闸客流分时段统计
const turnoverFlashboard = () => import('@/views/systemReportFile/turnover/turnoverFlashboard');
// 系统报表管理 ->  进出站量统计 ->  线路OD统计分析
const lineODStatistics = () => import('@/views/systemReportFile/turnover/lineODStatistics');

// 系统报表管理 -> 设备故障 ->  设备故障日志
const equipmentJournalFile = () => import('@/views/systemReportFile/outOfOrder/equipmentJournalFile');
// 系统报表管理 -> 设备故障 -> 设备完好率统计报表
const equipmentGoodCondition = () => import('@/views/systemReportFile/outOfOrder/equipmentGoodCondition');

// 系统报表管理 -> 票务报表 -> 票务TVM票款差异结算报表
const TVMDifferenceStatement = () => import('@/views/systemReportFile/ticketingReportFile/TVMDifferenceStatement');
// 系统报表管理 -> 票务报表 -> 票务TVM票款结算汇总统计报表
const TVMCurrencyTotal = () => import('@/views/systemReportFile/ticketingReportFile/TVMCurrencyTotal');
// 系统报表管理 -> 票务报表 -> 票务车站车票库存日报表
const stationFarePer = () => import('@/views/systemReportFile/ticketingReportFile/stationFarePer');
// 系统报表管理 -> 票务报表 -> 票务车站收益汇总表
const stationEarningsTotal = () => import('@/views/systemReportFile/ticketingReportFile/stationEarningsTotal');
// 系统报表管理 -> 票务报表 -> 票务车站营收日报表
const stationRevenuePer = () => import('@/views/systemReportFile/ticketingReportFile/stationRevenuePer');
// 系统报表管理 -> 票务报表 -> 票务售票员结算单
const conductorCurrency = () => import('@/views/systemReportFile/ticketingReportFile/conductorCurrency');
// 系统报表管理 -> 票务报表 -> 票务售票员结算汇总统计表
const conductorCurrencyTotal = () => import('@/views/systemReportFile/ticketingReportFile/conductorCurrencyTotal');
// 系统报表管理 -> 票务报表 -> 线路单程票无效票回收统计表
const singleInvalidRecycle = () => import('@/views/systemReportFile/ticketingReportFile/singleInvalidRecycle');
// 特殊票管理 ->非标准币管理 -> 非标准币SC nonstandardMoney
const nonstandardMoney = () => import('@/views/specialTicket/nonstandardCurrency/nonstandardMoney');
// 特殊票管理 ->非标准币管理 -> 非标准币审核 LC nonstandardMoneyAudit
const nonstandardMoneyAudit = () => import('@/views/specialTicket/nonstandardCurrency/nonstandardMoneyAudit');
// 特殊票管理 ->特殊票管理 -> 特殊情况票款交接记录SC specialBillConnect
const specialBillConnect = () => import('@/views/specialTicket/specialbill/specialBillConnect');
// 特殊票管理 ->特殊票管理 -> 特殊票款交接审核LC specialBillAudit
const specialBillAudit = () => import('@/views/specialTicket/specialbill/specialBillAudit');

Vue.use(Router);

const fixedRouter = [
  // 路由重定向
  {path: "/", redirect: "/index"},
  {
    path: '/index', name: 'Index', component: index, children: [
      // Home页
      {
        path: "/index",
        name: 'index',
        meta: {title: '首页'},
        component: Home
      },
      // 车票管理 -> 库存管理 -> 车票库存
      {
        path: "/ticket/ticketStock/ticketStockChange",
        name: "ticketStockChange",
        meta: {title: '车票库存'},
        component: ticketStockChange
      },
      // 车票管理 -> 库存管理 -> 库存操作记录
      {
        path: "/ticket/ticketStock/ticketStockRecord",
        name: "ticketStockRecord",
        meta: {title: '车票库存操作记录'},
        component: ticketStockRecord
      },
      // 车票管理 -> 库存管理 -> 库存盘点
      {
        path: "/ticket/ticketStock/ticketStockInventory",
        name: "ticketStockInventory",
        meta: {title: '车票库存盘点'},
        component: ticketStockInventory
      },
      // 车票管理 -> 车票调配 -> 车票调拨
      {
        path: "/ticket/ticketAllocate/ticketTransfers",
        name: "ticketTransfers",
        meta: {title: '车票调拨'},
        component: ticketTransfers
      },
      // 车票管理 -> 车票调配 -> 车票上交
      {
        path: "/ticket/ticketAllocate/ticketUpper",
        name: "ticketUpper",
        meta: {title: '车票上交'},
        component: ticketUpper
      },
      // 车票管理 -> 车票调配 -> 车票配发
      {
        path: "/ticket/ticketAllocate/ticketAllotment",
        name: "ticketAllotment",
        meta: {title: '车票配发'},
        component: ticketAllotment
      },
      // 车票管理 -> 车票回收 -> AG回收
      {
        path: "/ticket/ticketRecycle/AGRecycle",
        name: "AGRecycle",
        meta: {title: 'AG回收'},
        component: AGRecycle
      },
      // 车票管理 -> 车票回收 -> MLC回收SC库存
      {
        path: "/ticket/ticketRecycle/MLCRecycle",
        name: "MLCRecycle",
        meta: {title: '车票回收'},
        component: MLCRecycle
      },
      // 备用金管理 -> 库存管理 -> 库存变更
      {
        path: "/ticket/spareMoneyStock/moneyStockChange",
        name: "moneyStockChange",
        meta: {title: '备用金库存'},
        component: moneyStockChange
      },
      // 备用金管理 -> 库存管理 -> 库存操作记录
      {
        path: "/ticket/spareMoneyStock/moneyStockRecord",
        name: "moneyStockRecord",
        meta: {title: '备用金库存操作记录'},
        component: moneyStockRecord
      },
      // 备用金管理 -> 备用金调配 -> 配发
      {
        path: "/ticket/spareMoneyAllocate/spareAllotment",
        name: "spareAllotment",
        meta: {title: '备用金配发'},
        component: spareAllotment
      },
      // 备用金管理 -> 备用金调配 -> 上交
      {
        path: "/ticket/spareMoneyAllocate/spareUpper",
        name: "spareUpper",
        meta: {title: '备用金上交'},
        component: spareUpper
      },
      // 备用金管理 -> 备用金调配 -> 回收
      {
        path: "/ticket/spareMoneyAllocate/spareRecycle",
        name: "spareRecycle",
        meta: {title: '备用金回收'},
        component: spareRecycle
      },
      // 收益管理 -> 库存管理 -> 库存变更
      {
        path: "/ticket/profitStock/profitStockChange",
        name: "profitStockChange",
        meta: {title: '收益库存'},
        component: profitStockChange
      },
      // 收益管理 -> 库存管理 -> 库存操作记录
      {
        path: "/ticket/profitStock/profitStockRecord",
        name: "profitStockRecord",
        meta: {title: '收益库存操作记录'},
        component: profitStockRecord
      },
      // 收益管理 -> 长短款管理 -> 长短款管理
      {
        path: "/ticket/profitLength/profitLengthChange",
        name: "profitLengthChange",
        meta: {title: '长短款管理'},
        component: profitLengthChange
      },
      // 收益管理 -> 长短款管理 -> 长短款补款单据
      {
        path: "/ticket/profitLength/profitLengthBills",
        name: "profitLengthBills",
        meta: {title: '长短款补款单据'},
        component: profitLengthBills
      },
      // 收益管理 -> 收益解行 -> 收益解行
      {
        path: "/ticket/profitSolution/profitSolution",
        name: "profitSolution",
        meta: {title: '收益解行'},
        component: profitSolution
      },
      // 审核管理 -> BOM管理 -> BOM操作单管理
      {
        path: "/ticket/BOM/BOMOperation",
        name: "BOMOperation",
        meta: {
          title: 'BOM操作单管理',
          level: 4
        },
        component: BOMOperation
      },
      // 审核管理 -> BOM管理 -> BOM操作单管理 -> 详情
      {
        path: "/ticket/BOM/BOMOperation/BOMOperationDetail",
        name: "BOMOperationDetail",
        meta: {
          title: 'BOM操作单管理详情',
        },
        component: BOMOperationDetail
      },
      // 审核管理 -> BOM管理 -> BOM操作单管理 -> 配票备用金
      {
        path: "/ticket/BOM/BOMOperation/BOMOperationAdd",
        name: "BOMOperationAdd",
        meta: {
          title: 'BOM配票/备用金',
        },
        component: BOMOperationAdd
      },
      // 审核管理 -> BOM操作单 -> 结算单
      {
        path: "/ticket/BOM/BOMOperationCurrency",
        name: "BOMOperationCurrency",
        meta: {
          title: 'BOM结算单',
        },
        component: BOMOperationCurrency
      },
      // 审核管理 -> BOM管理 -> BOM操作单管理 -> 追加票/备用金
      {
        path: "/ticket/BOM/BOMOperation/BOMOperationEdit",
        name: "BOMOperationEdit",
        meta: {
          title: 'BOM追加票/备用金',
          // level: 4
        },
        component: BOMOperationEdit
      },
      // 审核管理 -> BOM管理 -> BOM操作单管理 -> 收益预收
      {
        path: "/ticket/BOM/BOMOperation/BOMOperationAdvance",
        name: "BOMOperationAdvance",
        meta: {
          title: 'BOM收益预收',
          // level: 4
        },
        component: BOMOperationAdvance
      },
      // 审核管理 -> BOM管理 -> BOM操作单管理 -> 回收
      {
        path: "/ticket/BOM/BOMOperation/BOMOperationRecycle",
        name: "BOMOperationRecycle",
        meta: {
          title: 'BOM回收',
          // level: 4
        },
        component: BOMOperationRecycle
      },
      // 审核管理 -> BOM管理 -> BOM结算单管理
      {
        path: "/ticket/BOM/BOMSettlement",
        name: "BOMSettlement",
        meta: {title: 'BOM结算单管理'},
        component: BOMSettlement
      },
      // 审核管理 -> TVM管理 -> TVM操作单管理
      {
        path: "/ticket/TVM/TVMOperation",
        name: "TVMOperation",
        meta: {
          title: 'TVM操作单管理',
          level: 4
        },
        component: TVMOperation
      },
      // 审核管理 -> TVM管理 -> TVM操作单管理 -> 详情
      {
        path: "/ticket/TVM/TVMOperation/TVMOperationDetail",
        name: "TVMOperationDetail",
        meta: {
          title: 'TVM操作单管理详情',
          // level: 4
        },
        component: TVMOperationDetail
      },
      // 审核管理 -> TVM管理 -> TVM操作单管理 -> 装机
      {
        path: "/ticket/TVM/TVMOperation/TVMOperationAdd",
        name: "TVMOperationAdd",
        meta: {
          title: 'TVM装机',
          // level: 4
        },
        component: TVMOperationAdd
      },
      // 审核管理 -> TVM管理 -> TVM操作单管理 -> 补充
      {
        path: "/ticket/TVM/TVMOperation/TVMOperationEdit",
        name: "TVMOperationEdit",
        meta: {
          title: 'TVM补充',
          // level: 4
        },
        component: TVMOperationEdit
      },
      // 审核管理 -> TVM管理 -> TVM操作单管理 -> 清点
      {
        path: "/ticket/TVM/TVMOperation/TVMOperationAdvance",
        name: "TVMOperationAdvance",
        meta: {
          title: 'TVM清点',
          // level: 4
        },
        component: TVMOperationAdvance
      },
      // 审核管理 -> TVM管理 -> TVM操作单管理 -> 回收
      {
        path: "/ticket/TVM/TVMOperation/TVMOperationRecycle",
        name: "TVMOperationRecycle",
        meta: {
          title: 'TVM回收',
          // level: 4
        },
        component: TVMOperationRecycle
      },
      // 审核管理 -> TVM管理 -> TVM结算单管理
      {
        path: "/ticket/TVM/TVMSettlement",
        name: "TVMSettlement",
        meta: {title: 'TVM结算单管理'},
        component: TVMSettlement
      },
      // 审核管理 -> TVM操作单 -> 装机信息结算单
      {
        path: "/ticket/TVM/TVMOperationCurrency",
        name: "TVMOperationCurrency",
        meta: {title: 'TVM结算单'},
        component: TVMOperationCurrency
      },
      // 系统管理 -> 用户管理 -> 用户管理
      {
        path: "/ticket/user/userMaintenance",
        name: "userMaintenance",
        meta: {title: '用户管理'},
        component: userMaintenance
      },
      // 系统管理 -> 用户管理 -> 角色管理
      {
        path: "/ticket/user/roleMaintenance",
        name: "roleMaintenance",
        meta: {title: '角色管理'},
        component: roleMaintenance
      },
      // 系统管理 -> 用户管理 -> 位置管理
      {
        path: "/ticket/user/locationMaintenance",
        name: "locationMaintenance",
        meta: {title: '位置管理'},
        component: locationMaintenance
      },
      // 系统管理 -> 用户管理 -> 菜单管理
      {
        path: "/ticket/user/menuMaintenance",
        name: "menuMaintenance",
        meta: {title: '菜单管理'},
        component: menuMaintenance
      },
      // 系统管理 -> 参数管理 -> 基础参数管理
      {
        path: "/ticket/parameter/basicMaintenance",
        name: "basicMaintenance",
        meta: {title: '基础参数管理'},
        component: basicMaintenance
      },
      // 系统管理 -> 参数管理 -> 码表管理
      {
        path: "/ticket/parameter/codeMaintenance",
        name: "codeMaintenance",
        meta: {title: '码表管理'},
        component: codeMaintenance
      },
      // 系统管理 -> 现金库存报警参数
      {
        path: "/ticket/parameter/moneyFlowSiren",
        name: "moneyFlowSiren",
        meta: {title: '现金库存报警参数'},
        component: moneyFlowSiren
      },
      // 系统管理 -> 车票库存报警参数
      {
        path: "/ticket/parameter/ticketFlowSiren",
        name: "ticketFlowSiren",
        meta: {title: '车票库存报警参数'},
        component: ticketFlowSiren
      },
      // 系统管理 -> 参数管理 -> 设备管理
      {
        path: "/ticket/parameter/equipmentMaintenance",
        name: "equipmentMaintenance",
        meta: {title: '设备管理'},
        component: equipmentMaintenance
      },
      // 系统管理 -> 参数管理 -> 车站管理
      {
        path: "/ticket/parameter/stationMaintenance",
        name: "stationMaintenance",
        meta: {title: '车站管理'},
        component: stationMaintenance
      },
      // 系统管理 -> 参数管理 -> 定时任务管理
      {
        path: "/ticket/parameter/taskMaintenance",
        name: "taskMaintenance",
        meta: {title: '定时任务管理'},
        component: taskMaintenance
      },
      // 系统管理 -> 参数管理 -> 票种管理
      {
        path: "/ticket/parameter/locationLimitedMerge",
        name: "locationLimitedMerge",
        meta: {title: '位置权限合并'},
        component: locationLimitedMerge
      },
      // 系统管理 -> 参数管理 -> 车票库存管理类型
      {
        path: "/ticket/parameter/typeMaintenance",
        name: "typeMaintenance",
        meta: {title: '车票库存管理类型'},
        component: typeMaintenance
      },
      // 系统报表管理 -> 全线速报 -> 时实客流统计
      {
        path: "/ticket/systemReportFile/allExpress/newestPassenger",
        name: "newestPassenger",
        meta: {title: '实时客流统计'},
        component: newestPassenger
      },
      // 系统报表管理 -> 客流统计 -> 车站设备客流统计
      {
        path: "/ticket/systemReportFile/equipmentPassenger",
        name: "equipmentPassenger",
        meta: {title: '车站分设备客流统计'},
        component: equipmentPassenger
      },
      // 系统报表管理 -> 客流统计 -> 车站票种客流统计
      {
        path: "/ticket/systemReportFile/ticketPassenger",
        name: "ticketPassenger",
        meta: {title: '车站分票种客流统计'},
        component: ticketPassenger
      },
      // 系统报表管理 -> 客流统计 -> 车站单程票销售数量统计
      {
        path: "/ticket/systemReportFile/singleNumber",
        name: "singleNumber",
        meta: {title: '车站单程票销售数量统计'},
        component: singleNumber
      },
      // 系统报表管理 -> 客流统计 -> 线路设备客流统计
      {
        path: "/ticket/systemReportFile/lineEquipmentPassenger",
        name: "lineEquipmentPassenger",
        meta: {title: '线路分设备客流统计'},
        component: lineEquipmentPassenger
      },
      // 系统报表管理 -> 客流统计 -> 线路票种客流统计
      {
        path: "/ticket/systemReportFile/lineTicketPassenger",
        name: "lineTicketPassenger",
        meta: {title: '线路分票种客流统计'},
        component: lineTicketPassenger
      },
      // 系统报表管理 -> 消费统计 -> 线路分票种消费统计
      {
        path: "/ticket/consumptionStatistics/lineTicketConsume",
        name: "lineTicketConsume",
        meta: {title: '线路分票种销售统计'},
        component: lineTicketConsume
      },
      // 系统报表管理 -> 消费统计 ->  车站分设备消费统计
      {
        path: "/ticket/consumptionStatistics/stationEquipmentConsume",
        name: "stationEquipmentConsume",
        meta: {title: '车站分设备销售统计'},
        component: stationEquipmentConsume
      },
      // 系统报表管理 -> 收益统计 ->  车站操作员结算统计
      {
        path: "/ticket/earningsStatistics/stationOperation",
        name: "stationOperation",
        meta: {title: '车站操作员结算统计'},
        component: stationOperation
      },
      // 系统报表管理 -> 收益统计 ->  TVM结算统计
      {
        path: "/ticket/earningsStatistics/TVMOperationStatistics",
        name: "TVMOperationStatistics",
        meta: {title: 'TVM结算统计'},
        component: TVMOperationStatistics
      },
      // 系统报表管理 -> 收益统计 ->  线路运营发售收益
      {
        path: "/ticket/earningsStatistics/lineRunStatistics",
        name: "lineRunStatistics",
        meta: {title: '线路运营发售收益'},
        component: lineRunStatistics
      },
      // 系统报表管理 -> 收益统计 ->  线路BOM收益汇总
      {
        path: "/ticket/earningsStatistics/lineBOMStatistics",
        name: "lineBOMStatistics",
        meta: {title: '线路BOM收益汇总'},
        component: lineBOMStatistics
      },
      // 系统报表管理 -> 收益统计 ->  线路TVM收益汇总
      {
        path: "/ticket/earningsStatistics/lineTVMStatistics",
        name: "lineTVMStatistics",
        meta: {title: '线路TVM收益汇总'},
        component: lineTVMStatistics
      },
      // 系统报表管理 -> 收益统计 ->  线路分票种收益汇总
      {
        path: "/ticket/earningsStatistics/lineTicketStatistics",
        name: "lineTicketStatistics",
        meta: {title: '线路分票种收益汇总'},
        component: lineTicketStatistics
      },
      // 系统报表管理 -> 车票销售回收统计 ->  线路车票销售统计
      {
        path: "/ticket/fareMarketRecycle/lineFareMarket",
        name: "lineFareMarket",
        meta: {title: '线路车票销售统计'},
        component: lineFareMarket
      },
      // 系统报表管理 -> 车票销售回收统计 ->  线路单程票销售统计
      {
        path: "/ticket/fareMarketRecycle/lineSingleMarket",
        name: "lineSingleMarket",
        meta: {title: '线路单程票销售统计'},
        component: lineSingleMarket
      },
      // 系统报表管理 ->  进出站量统计 ->  全栈进出站量统计
      {
        path: "/ticket/turnover/completeTurnover",
        name: "completeTurnover",
        meta: {title: '全线进出站量统计'},
        component: completeTurnover
      },
      // 系统报表管理 ->  进出站量统计 ->   票种进出站量分时段统计
      {
        path: "/ticket/turnover/ticketTurnover",
        name: "ticketTurnover",
        meta: {title: '票种进出站量分时段统计'},
        component: ticketTurnover
      },
      // 系统报表管理 ->  进出站量统计 ->  车站进出站量分时段统计
      {
        path: "/ticket/turnover/stationTurnover",
        name: "stationTurnover",
        meta: {title: '车站进出站量分时段统计'},
        component: stationTurnover
      },
      // 系统报表管理 ->  进出站量统计 ->  进出闸客流分时段统计
      {
        path: "/ticket/turnover/turnoverFlashboard",
        name: "turnoverFlashboard",
        meta: {title: '进出闸客流分时段统计'},
        component: turnoverFlashboard
      },
      // 系统报表管理 ->  进出站量统计 ->  线路OD统计分析
      {
        path: "/ticket/turnover/lineODStatistics",
        name: "lineODStatistics",
        meta: {title: '线路OD统计分析'},
        component: lineODStatistics
      },
      // 系统报表管理 -> 设备故障 ->  设备故障明细 equipmentJournalFile
      {
        path: "/ticket/outOfOrder/equipmentJournalFile",
        name: "equipmentJournalFile",
        meta: {title: '设备故障明细'},
        component: equipmentJournalFile
      },
      // 系统报表管理 -> 设备故障 -> 设备完好率统计报表 equipmentGoodCondition
      {
        path: "/ticket/outOfOrder/equipmentGoodCondition",
        name: "equipmentGoodCondition",
        meta: {title: '设备完好率'},
        component: equipmentGoodCondition
      },
      // 系统报表管理 -> 票务报表 -> 票务TVM票款差异结算报表 TVMDifferenceStatement
      {
        path: "/ticket/ticketingReportFile/TVMDifferenceStatement",
        name: "TVMDifferenceStatement",
        meta: {title: '票务TVM票款差异结算报表'},
        component: TVMDifferenceStatement
      },
      // 系统报表管理 -> 票务报表 -> 票务TVM票款结算汇总统计报表
      {
        path: "/ticket/ticketingReportFile/TVMCurrencyTotal",
        name: "TVMCurrencyTotal",
        meta: {title: '票务TVM票款结算汇总统计报表'},
        component: TVMCurrencyTotal
      },
     // 系统报表管理 -> 票务报表 -> 票务车站车票库存日报表
      {
        path: "/ticket/ticketingReportFile/stationFarePer",
        name: "stationFarePer",
        meta: {title: '票务车站车票库存日报表'},
        component: stationFarePer
      },
     // 系统报表管理 -> 票务报表 -> 票务车站收益汇总表
      {
        path: "/ticket/ticketingReportFile/stationEarningsTotal",
        name: "stationEarningsTotal",
        meta: {title: '票务车站收益汇总表'},
        component: stationEarningsTotal
      },
     // 系统报表管理 -> 票务报表 -> 票务车站营收日报表
      {
        path: "/ticket/ticketingReportFile/stationRevenuePer",
        name: "stationRevenuePer",
        meta: {title: '票务车站营收日报表'},
        component: stationRevenuePer
      },
     // 系统报表管理 -> 票务报表 -> 票务售票员结算单 conductorCurrency
      {
        path: "/ticket/ticketingReportFile/conductorCurrency",
        name: "conductorCurrency",
        meta: {title: '票务售票员结算单'},
        component: conductorCurrency
      },
     // 系统报表管理 -> 票务报表 -> 票务售票员结算汇总统计表
      {
        path: "/ticket/ticketingReportFile/conductorCurrencyTotal",
        name: "conductorCurrencyTotal",
        meta: {title: '票务售票员结算汇总统计表'},
        component: conductorCurrencyTotal
      },
     // 系统报表管理 -> 票务报表 -> 线路单程票无效票回收统计表
      {
        path: "/ticket/ticketingReportFile/singleInvalidRecycle",
        name: "singleInvalidRecycle",
        meta: {title: '线路单程票无效票回收统计表'},
        component: singleInvalidRecycle
      },
    // 特殊票管理 ->非标准币管理 -> 非标准币SC nonstandardMoney
      {
        path: "/specialTicket/nonstandardCurrency/nonstandardMoney",
        name: "nonstandardMoney",
        meta: {title: '非标准币'},
        component: nonstandardMoney
      },

// 特殊票管理 ->非标准币管理 -> 非标准币审核 LC nonstandardMoneyAudit
      {
        path: "/specialTicket/nonstandardCurrency/nonstandardMoneyAudit",
        name: "nonstandardMoneyAudit",
        meta: {title: '非标准币审核'},
        component: nonstandardMoneyAudit
      },
// 特殊票管理 ->特殊票管理 -> 特殊情况票款交接记录SC specialBillConnect
      {
        path: "/specialTicket/specialbill/specialBillConnect",
        name: "specialBillConnect",
        meta: {title: '特殊情况票款交接记录'},
        component: specialBillConnect
      },
// 特殊票管理 ->特殊票管理 -> 特殊票款交接审核LC specialBillAudit
      {
        path: "/specialTicket/specialbill/specialBillAudit",
        name: "specialBillAudit",
        meta: {title: '特殊票款交接审核'},
        component: specialBillAudit
      },
    ]
  },
  {path: '/login', name: 'Login', component: Login}
];
export default new Router({
  routes: fixedRouter
});
