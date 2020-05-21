<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>报修表单</el-breadcrumb-item>
      <el-breadcrumb-item>查询 {{this.$route.params.account}}</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <!-- 搜索与选择区域 -->
      <el-row :gutter="20">
        <el-col :span="2">
          <el-button type="primary" icon="el-icon-arrow-left" @click="$router.back(-1)"></el-button>
        </el-col>
        <el-col :span="7">
          <el-radio-group v-model="isHandle" @change="isHandleChange">
            <el-radio-button :label=-1>全部</el-radio-button>
            <el-radio-button :label=0>未处理</el-radio-button>
            <el-radio-button :label=1>已处理</el-radio-button>
          </el-radio-group>
        </el-col>
      </el-row>
      <!-- 报修列表区域 -->
      <el-table :data="formList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-card class="extend_card">
              <div slot="header">
                <span>{{scope.row.proposeTitle}}</span>
                <span class="extend_right">
                  {{scope.row.proposeTime | dateFormat}}
                </span>
              </div>
              <div>
                <span>{{scope.row.proposeDesc}}</span>
                <br/>
                <span>-------------------------------</span>
                <br/>
                <span>提出人反馈:</span>
                <br/>
                <span>{{scope.row.feedback===null?'无':scope.row.feedback}}</span>
                <br/>
                <span class="extend_right">
                  {{scope.row.propose.name}}({{scope.row.propose.account}})
                </span>
                <br/>
              </div>
            </el-card>
            <el-card class="extend_card" v-if="scope.row.isHandle === 1">
              <div slot="header">
                <span><el-tag type="success">已处理</el-tag></span>
                <span class="extend_right">
                  {{scope.row.repairTime | dateFormat}}
                </span>
              </div>
              <div>
                <span>{{scope.row.repairDesc}}</span>
                <br/>
                <span class="extend_right">{{scope.row.repair.account}}</span>
                <br/>
              </div>
            </el-card>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="提出人" prop="propose.name"></el-table-column>
        <el-table-column label="标题" prop="proposeTitle"></el-table-column>
        <el-table-column label="提出时间">
          <template slot-scope="scope">
            {{scope.row.proposeTime | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="是否处理">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.isHandle === 1">已处理</el-tag>
            <el-tag type="danger" v-else>未处理</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="queryInfo.pageNum"
              :page-sizes="[1, 2, 5, 10]"
              :page-size="queryInfo.pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        // 查询报修列表的对象
        queryInfo: {
          // 账号
          account: this.$route.params.account,
          // 用户类型
          type: this.$route.params.type,
          // 当前页数
          pageNum: 1,
          // 当前每页显示多少条数据
          pageSize: 5,
          isHandle: -1
        },
        formList: [],
        total: 0,
        isHandle: -1
      }
    },
    created () {
      this.getFormList()
    },
    methods: {
      async getFormList () {
        const { data: res } = await this.$http.get('forms/one', { params: this.queryInfo })
        if (res.code !== 201) {
          return this.$message.error(res.msg)
        }
        this.formList = res.data.forms
        this.total = res.data.total
      },
      // 监听 pagesize 改变的事件
      handleSizeChange (newSize) {
        this.queryInfo.pageSize = newSize
        this.getFormList()
      },
      // 监听页码值改变的事件
      handleCurrentChange (newPage) {
        this.queryInfo.pageNum = newPage
        this.getFormList()
      },
      // 监听 isHandle 变化
      isHandleChange () {
        this.queryInfo.isHandle = this.isHandle
        this.getFormList()
      }
    }
  }
</script>

<style scoped lang="less">
  .extend_card {
    font-size: 14px;
    width: 550px;
    margin-top: 10px;
  }

  .extend_right {
    float: right;
    padding: 3px 0;
    color: #7093DB;
  }
</style>
