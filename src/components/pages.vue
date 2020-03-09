<template>
  <!-- 分页组件 -->
  <div class="paging">
    <el-pagination
      background
      class="first-pager"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPageNum"
      :page-size="pageSize"
      layout="total,sizes,slot,prev"
      :total="total"
      :firstPage="firstPage"
      :lastPage="lastPage">
      <el-button type="text" :disabled="currentPageNum === firstPage" class="pageBtn-border" @click="toFirstPage">首页
      </el-button>
    </el-pagination>
    <el-pagination
      background
      class="last-pager"
      @current-change="handleCurrentChange"
      :current-page="currentPageNum"
      :page-size="pageSize"
      layout="pager,next,slot,jumper"
      :total="total"
      :firstPage="firstPage"
      :lastPage="lastPage">
      <el-button type="text" :disabled="currentPageNum === lastPage" class="page-btn-last" @click="toLastPage">末页
      </el-button>
    </el-pagination>

    <!--    <el-pagination-->
    <!--      background-->
    <!--      :page-size="pageSize"-->
    <!--      :current-page="currentPageNum"-->
    <!--      @size-change="handleSizeChange"-->
    <!--      @current-change="handleCurrentChange"-->
    <!--      layout="total, sizes, prev, pager, next, jumper"-->
    <!--      :total="total">-->
    <!--    </el-pagination>-->
  </div>
</template>

<script>
    export default {
        name: "pages",
        data() {
            return {
                // 组件内接收当前页码
                currentPageNum: this.currentPage
            }
        },
        props: {
            // 当前页
            currentPage: {
                type: Number,
                default: 1
            },
            // 每页数据条数
            pageSize: {
                type: Number,
                default: 10
            },
            // 总数据条数
            total: {
                type: Number,
                default: 0
            },
            // 首页页码
            firstPage: {
                type: Number,
                default: 1
            },
        },
        methods: {
            // 去首页
            toFirstPage() {
                var _t = this;
                _t.currentPageNum = _t.firstPage;
                _t.handleCurrentChange(_t.firstPage);
            },
            // 去末页
            toLastPage() {
                var _t = this;
                _t.currentPageNum = _t.lastPage;
                _t.handleCurrentChange(_t.lastPage);
            },
            // 改变当前页码
            handleCurrentChange(val) {
                var _t = this;
                _t.currentPageNum = val;
                _t.$emit("handleCurrentChangeSub", val);
            },
            // 改变条数
            handleSizeChange(val) {
                var _t = this;
                _t.$emit("handleSizeChangeSub", val);
            }
        },
        // 计算属性
        computed: {
            lastPage: function () {
                var _t = this;
                var pages = _t.total % _t.pageSize;
                if (pages !== 0) {
                    return parseInt(_t.total / _t.pageSize) + 1;
                } else {
                    return parseInt(_t.total / _t.pageSize);
                }
            }
        }
    }
</script>

<style scoped>
  .paging {
    margin: 15px 0;
  }

  .first-pager,
  .last-pager {
    display: inline-block;
  }

  .pageBtn-border,
  .pageBtn-border:disabled,
  .page-btn-last,
  .page-btn-last:disabled {
    padding: 0 10px;
    color: #252a2f;
    background-color: #f4f4f5;
  }

  .pageBtn-border:disabled,
  .page-btn-last:disabled {
    color: #C0C4CC !important;
  }

  .pageBtn-border:hover,
  .page-btn-last:hover {
    color: #252a2f;
  }
</style>
