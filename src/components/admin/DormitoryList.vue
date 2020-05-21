<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>宿舍管理</el-breadcrumb-item>
      <el-breadcrumb-item>宿舍列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入宿舍名" v-model="queryInfo.query" clearable @clear="getDormitoryList">
            <el-button slot="append" icon="el-icon-search" @click="getQueryFormList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="7">
          <el-button type="primary" @click="addDialogVisible = true">添加宿舍</el-button>
        </el-col>
      </el-row>
      <!-- 维修人员列表区域 -->
      <el-table :data="dormitoryList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="宿舍名" prop="name"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 删除 -->
            <el-button type="danger" icon="el-icon-delete" size="mini"
                       @click="showDeleteDialog(scope.row)"></el-button>
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
    <!-- 删除宿舍对话框 -->
    <el-dialog title="删除宿舍" :visible.sync="deleteDialogVisible" width="50%" @close="deleteDialogClosed">
      <!-- 内容主题区域 -->
      <el-form :model="deleteForm" :rules="deleteFormRules" ref="deleteFormRef" label-width="100px">
        <el-form-item label="管理员密码" prop="adminPass">
          <el-input type="password" v-model="deleteForm.adminPass"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="deleteDormitory">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加宿舍对话框 -->
    <el-dialog title="添加宿舍" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 内容主题区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="150px">
        <el-form-item label="管理员密码" prop="adminPass">
          <el-input v-model="addForm.adminPass" type="password"></el-input>
        </el-form-item>
        <el-form-item label="宿舍名" prop="dormitoryName">
          <el-input v-model="addForm.dormitoryName"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addDormitory">确 定</el-button>
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
          pageSize: 5
        },
        dormitoryList: [],
        total: 0,
        deleteDialogVisible: false,
        deleteForm: {
          adminPass: '',
          dormitoryId: ''
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
        },
        addDialogVisible: false,
        addForm: {
          adminPass: '',
          dormitoryName: ''
        },
        addFormRules: {
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
      this.getDormitoryList()
    },
    methods: {
      addDormitory () {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          this.addForm.adminPass = this.$md5(this.addForm.adminPass)
          const { data: res } = await this.$http.post('admin/dormitory', this.addForm)
          if (res.code !== 200) return this.$message.error(res.msg)
          this.$message.success('新建成功')
          // 隐藏对话框
          this.addDialogVisible = false
          // 重新获取数据
          this.getDormitoryList()
        })
      },
      addDialogClosed () {
        this.$refs.addFormRef.resetFields()
      },
      showDeleteDialog (row) {
        this.deleteForm.dormitoryId = row.id
        this.deleteDialogVisible = true
      },
      deleteDormitory () {
        this.$refs.deleteFormRef.validate(async valid => {
          if (!valid) return
          this.deleteForm.adminPass = this.$md5(this.deleteForm.adminPass)
          const { data: res } = await this.$http.delete('admin/dormitory', { data: this.deleteForm })
          if (res.code !== 200) return this.$message.error(res.msg)
          this.$message.success('删除成功')
          // 隐藏对话框
          this.deleteDialogVisible = false
          // 重新获取数据
          this.getDormitoryList()
        })
      },
      deleteDialogClosed () {
        this.$refs.deleteFormRef.resetFields()
      },
      async getDormitoryList () {
        const { data: res } = await this.$http.get('admin/dormitory/all', { params: this.queryInfo })
        if (res.code !== 201) {
          return this.$message.error(res.msg)
        }
        this.dormitoryList = res.data.dormitories
        this.total = res.data.total
      },
      async getQueryFormList () {
        if (this.queryInfo.query === '') {
          this.getDormitoryList()
          return
        }
        const { data: res } = await this.$http.get('admin/dormitory/query', { params: this.queryInfo })
        if (res.code !== 201) {
          return this.$message.error(res.msg)
        }
        this.dormitoryList = res.data.dormitories
        this.total = res.data.total
      },
      // 监听 pagesize 改变的事件
      handleSizeChange (newSize) {
        this.queryInfo.pageSize = newSize
        this.getStudentList()
      },
      // 监听页码值改变的事件
      handleCurrentChange (newPage) {
        this.queryInfo.pageNum = newPage
        this.getStudentList()
      }
    }
  }
</script>

<style scoped>

</style>
