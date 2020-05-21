<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>报修表单</el-breadcrumb-item>
      <el-breadcrumb-item>报修列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 搜索与选择区域 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入标题" v-model="queryInfo.query" clearable @clear="getFormList">
            <el-button slot="append" icon="el-icon-search" @click="getQueryFormList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="7">
          <el-radio-group v-model="isHandle" @change="isHandleChange" :disabled="isHandleDisable">
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
                <span>提出人反馈:</span>
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
        <el-table-column label="操作" v-if="type !== '0'">
          <template slot-scope="scope">
            <!-- 完善报修 -->
            <el-button v-if="type === '1'" :disabled="scope.row.isHandle === 0? false : true" type="primary"
                       icon="el-icon-edit" size="mini"
                       @click="showImproveDialog(scope.row)"></el-button>
            <!-- 删除 -->
            <el-button v-if="type === '2'" type="danger" icon="el-icon-delete" size="mini"
                       @click="showDeleteDialog(scope.row.id)"></el-button>
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
    <!-- 完善报修对话框 -->
    <el-dialog title="完善报修" :visible.sync="improveDialogVisible" width="40%" @close="improveDialogClosed">
      <!-- 内容主题区域 -->
      <el-form :model="improveForm" :rules="improveFormRules" ref="improveFormRef" label-width="70px">
        <el-form-item label="描述" prop="desc">
          <el-input type="textarea" v-model="improveForm.desc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="improveDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="improve">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 删除报修对话框 -->
    <el-dialog title="删除报修" :visible.sync="deleteDialogVisible" width="40%" @close="deleteDialogClosed">
      <!-- 内容主题区域 -->
      <el-form :model="deleteForm" :rules="deleteFormRules" ref="deleteFormRef" label-width="100px">
        <el-form-item label="管理员密码" prop="adminPass">
          <el-input type="password" v-model="deleteForm.adminPass"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="deleteFormById">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        type: 0,
        // 查询报修列表的对象
        queryInfo: {
          query: '',
          // 当前页数
          pageNum: 1,
          // 当前每页显示多少条数据
          pageSize: 5,
          isHandle: -1
        },
        formList: [],
        total: 0,
        isHandle: -1,
        isHandleDisable: true,
        improveDialogVisible: false,
        improveForm: {
          id: 0,
          desc: ''
        },
        improveFormRules: {
          desc: [
            {
              required: true,
              message: '请输入描述',
              trigger: 'blur'
            }
          ]
        },
        deleteDialogVisible: false,
        deleteForm: {
          adminPass: '',
          formId: 0
        },
        deleteFormRules: {
          adminPass: [
            {
              required: true,
              message: '请输入管理员密码',
              trigger: 'blur'
            },
            {
              min: 6,
              max: 50,
              message: '长度在 6 到 50 个字符',
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
      deleteFormById () {
        this.$refs.deleteFormRef.validate(async valid => {
          if (!valid) return
          this.deleteForm.adminPass = this.$md5(this.deleteForm.adminPass)
          const { data: res } = await this.$http.delete('admin/form', { data: this.deleteForm })
          if (res.code !== 200) return this.$message.error(res.msg)
          this.$message.success('删除成功')
          // 隐藏对话框
          this.deleteDialogVisible = false
          // 重新获取数据
          await this.getFormList()
        })
      },
      showDeleteDialog (id) {
        this.deleteDialogVisible = true
        this.deleteForm.formId = id
      },
      deleteDialogClosed () {
        this.$refs.deleteFormRef.resetFields()
      },
      improveDialogClosed () {
        this.$refs.improveFormRef.resetFields()
      },
      showImproveDialog (row) {
        this.improveDialogVisible = true
        this.improveForm.id = row.id
      },
      improve () {
        this.$refs.improveFormRef.validate(async valid => {
          if (!valid) return
          const { data: res } = await this.$http.put('forms/form', this.improveForm)
          if (res.code !== 200) return this.$message.error(res.msg)
          this.$message.success('提交成功')
          // 隐藏对话框
          this.improveDialogVisible = false
          // 重新获取数据
          await this.getFormList()
        })
      },
      // 获取用户信息
      getStorageUser () {
        this.type = window.sessionStorage.getItem('type')
      },
      async getFormList () {
        this.isHandleDisable = false
        const { data: res } = await this.$http.get('forms/all', { params: this.queryInfo })
        if (res.code !== 201) {
          return this.$message.error(res.msg)
        }
        this.formList = res.data.forms
        this.total = res.data.total
      },
      async getQueryFormList () {
        this.isHandleDisable = true
        if (this.queryInfo.query === '') {
          await this.getFormList()
          return
        }
        const { data: res } = await this.$http.get('forms/query', { params: this.queryInfo })
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
