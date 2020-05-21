<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>报修表单</el-breadcrumb-item>
      <el-breadcrumb-item>我的报修</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 搜索与选择区域 -->
      <el-row :gutter="20">
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
                <el-button type="text" @click="goOnePage(0, scope.row.propose.account)" class="extend_right">
                  {{scope.row.propose.name}}({{scope.row.propose.account}})
                </el-button>
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
                <span>-------------------------------</span>
                <br/>
                <span>反馈:</span>
                <br/>
                <span>{{scope.row.feedback===null?'无':scope.row.feedback}}</span>
                <br/>
                <el-button type="text" @click="goOnePage(1, scope.row.repair.account)" class="extend_right">
                  {{scope.row.repair.account}}
                </el-button>
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
        <el-table-column label="操作" v-if="type == '0'">
          <template slot-scope="scope">
            <!-- 报修反馈 -->
            <el-button :disabled="scope.row.isHandle === 1? false : true" type="primary" icon="el-icon-edit-outline"
                       size="mini"
                       @click="showFeedbackDialog(scope.row)"></el-button>
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
    <!-- 报修反馈对话框 -->
    <el-dialog title="报修反馈" :visible.sync="feedbackDialogVisible" width="40%" @close="feedbackDialogClosed">
      <!-- 内容主题区域 -->
      <el-form :model="feedbackForm" :rules="feedbackFormRules" ref="feedbackFormRef" label-width="70px">
        <el-form-item label="反馈" prop="feedback">
          <el-input type="textarea" v-model="feedbackForm.feedback"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="feedbackDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="feedback">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        // 查询报修列表的对象
        queryInfo: {
          // 当前页数
          pageNum: 1,
          // 当前每页显示多少条数据
          pageSize: 5,
          isHandle: -1
        },
        formList: [],
        total: 0,
        isHandle: -1,
        type: 0,
        feedbackDialogVisible: false,
        feedbackForm: {
          id: 0,
          feedback: ''
        },
        feedbackFormRules: {
          feedback: [
            {
              required: true,
              message: '请输入反馈',
              trigger: 'blur'
            }
          ]
        }
      }
    },
    created () {
      this.getFormList()
      this.getStorageUser()
    },
    methods: {
      // 获取用户信息
      getStorageUser () {
        this.type = window.sessionStorage.getItem('type')
      },
      async getFormList () {
        this.isHandleDisable = false
        const { data: res } = await this.$http.get('forms/my', { params: this.queryInfo })
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
      },
      // 跳转到查询某人页面
      goOnePage (type, account) {
        this.$router.push('/forms/one/' + type + '/' + account)
      },
      feedbackDialogClosed () {
        this.$refs.feedbackFormRef.resetFields()
      },
      showFeedbackDialog (row) {
        this.feedbackDialogVisible = true
        this.feedbackForm.id = row.id
      },
      feedback () {
        this.$refs.feedbackFormRef.validate(async valid => {
          if (!valid) return
          const { data: res } = await this.$http.put('forms/feedback', this.feedbackForm)
          if (res.code !== 200) return this.$message.error(res.msg)
          this.$message.success('反馈成功')
          // 隐藏对话框
          this.feedbackDialogVisible = false
          // 重新获取数据
          await this.getFormList()
        })
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
