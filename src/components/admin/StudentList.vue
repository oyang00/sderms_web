<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>学生管理</el-breadcrumb-item>
      <el-breadcrumb-item>学生列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入学生姓名" v-model="queryInfo.query" clearable @clear="getStudentList">
            <el-button slot="append" icon="el-icon-search" @click="getQueryFormList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 学生列表区域 -->
      <el-table :data="studentList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="学号" prop="account"></el-table-column>
        <el-table-column label="姓名" prop="name"></el-table-column>
        <el-table-column label="宿舍" prop="dormitory.name"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 修改学生宿舍 -->
            <el-button type="primary" icon="el-icon-office-building" size="mini"
                       @click="showEditDormitoryDialog(scope.row)"></el-button>
            <!-- 修改学生密码 -->
            <el-button type="warning" icon="el-icon-lock" size="mini"
                       @click="showEditPasswordDialog(scope.row)"></el-button>
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
    <!-- 修改学生宿舍对话框 -->
    <el-dialog title="修改学生宿舍" :visible.sync="editDormitoryDialogVisible" width="40%" @close="editDormitoryDialogClosed">
      <!-- 内容主题区域 -->
      <el-form :model="editDormitoryForm" :rules="editDormitoryFormRules" ref="editDormitoryFormRef"
               label-width="100px">
        <el-form-item label="学生账号" prop="studentAccount">
          <el-input v-model="editDormitoryForm.studentAccount" disabled></el-input>
        </el-form-item>
        <el-form-item label="管理员密码" prop="adminPass">
          <el-input type="password" v-model="editDormitoryForm.adminPass"></el-input>
        </el-form-item>
        <el-form-item label="学生新宿舍" prop="studentNewDormitory">
          <el-select v-model="editDormitoryForm.studentNewDormitory" placeholder="请选择">
            <el-option v-for="item in dormitoryList"
                       :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDormitoryDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDormitory">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改学生密码对话框 -->
    <el-dialog title="修改学生密码" :visible.sync="editPasswordDialogVisible" width="40%" @close="editPasswordDialogClosed">
      <!-- 内容主题区域 -->
      <el-form :model="editPasswordForm" :rules="editPasswordFormRules" ref="editPasswordFormRef"
               label-width="100px">
        <el-form-item label="学生账号" prop="studentAccount">
          <el-input v-model="editPasswordForm.studentAccount" disabled></el-input>
        </el-form-item>
        <el-form-item label="管理员密码" prop="adminPass">
          <el-input type="password" v-model="editPasswordForm.adminPass"></el-input>
        </el-form-item>
        <el-form-item label="学生新密码" prop="studentNewPass">
          <el-input type="password" v-model="editPasswordForm.studentNewPass"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editPasswordDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editPassword">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 删除学生对话框 -->
    <el-dialog title="删除学生" :visible.sync="deleteDialogVisible" width="40%" @close="deleteDialogClosed">
      <!-- 内容主题区域 -->
      <el-form :model="deleteForm" :rules="deleteFormRules" ref="deleteFormRef" label-width="100px">
        <el-form-item label="学生账号" prop="studentAccount">
          <el-input v-model="deleteForm.studentAccount" disabled></el-input>
        </el-form-item>
        <el-form-item label="管理员密码" prop="adminPass">
          <el-input type="password" v-model="deleteForm.adminPass"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="deleteStudent">确 定</el-button>
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
        studentList: [],
        dormitoryList: [],
        total: 0,
        editDormitoryDialogVisible: false,
        editDormitoryForm: {
          adminPass: '',
          studentAccount: '',
          studentNewDormitory: ''
        },
        editDormitoryFormRules: {
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
        editPasswordDialogVisible: false,
        editPasswordForm: {
          adminPass: '',
          studentAccount: '',
          studentNewPass: ''
        },
        editPasswordFormRules: {
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
          ],
          studentNewPass: [
            {
              required: true,
              message: '请输入学生新密码',
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
        deleteDialogVisible: false,
        deleteForm: {
          adminPass: '',
          studentAccount: ''
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
      this.getStudentList()
      this.getDormitoryList()
    },
    methods: {
      showDeleteDialog (row) {
        this.deleteForm.studentAccount = row.account
        this.deleteDialogVisible = true
      },
      deleteStudent () {
        this.$refs.deleteFormRef.validate(async valid => {
          if (!valid) return
          this.deleteForm.adminPass = this.$md5(this.deleteForm.adminPass)
          const { data: res } = await this.$http.delete('admin/student', { data: this.deleteForm })
          if (res.code !== 200) return this.$message.error(res.msg)
          this.$message.success('删除成功')
          // 隐藏对话框
          this.deleteDialogVisible = false
          // 重新获取数据
          this.getStudentList()
        })
      },
      deleteDialogClosed () {
        this.$refs.deleteFormRef.resetFields()
      },
      showEditPasswordDialog (row) {
        this.editPasswordForm.studentAccount = row.account
        this.editPasswordDialogVisible = true
      },
      editPassword () {
        this.$refs.editPasswordFormRef.validate(async valid => {
          if (!valid) return
          this.editPasswordForm.adminPass = this.$md5(this.editPasswordForm.adminPass)
          this.editPasswordForm.studentNewPass = this.$md5(this.editPasswordForm.studentNewPass)
          const { data: res } = await this.$http.put('admin/student/password', this.editPasswordForm)
          if (res.code !== 200) return this.$message.error(res.msg)
          this.$message.success('修改成功')
          // 隐藏对话框
          this.editPasswordDialogVisible = false
          // 重新获取数据
          this.getStudentList()
        })
      },
      editPasswordDialogClosed () {
        this.$refs.editPasswordFormRef.resetFields()
      },
      showEditDormitoryDialog (row) {
        this.editDormitoryForm.studentNewDormitory = row.dormitory.id
        this.editDormitoryForm.studentAccount = row.account
        this.editDormitoryDialogVisible = true
      },
      editDormitory () {
        this.$refs.editDormitoryFormRef.validate(async valid => {
          if (!valid) return
          this.editDormitoryForm.adminPass = this.$md5(this.editDormitoryForm.adminPass)
          const { data: res } = await this.$http.put('admin/student/dormitory', this.editDormitoryForm)
          if (res.code !== 200) return this.$message.error(res.msg)
          this.$message.success('修改成功')
          // 隐藏对话框
          this.editDormitoryDialogVisible = false
          // 重新获取数据
          this.getStudentList()
        })
      },
      editDormitoryDialogClosed () {
        this.$refs.editDormitoryFormRef.resetFields()
      },
      async getDormitoryList () {
        const { data: res } = await this.$http.get('user/dormitory')
        if (res.code !== 201) {
          return this.$message.error(res.msg)
        }
        this.dormitoryList = res.data
      },
      async getStudentList () {
        const { data: res } = await this.$http.get('admin/student/all', { params: this.queryInfo })
        if (res.code !== 201) {
          return this.$message.error(res.msg)
        }
        this.studentList = res.data.students
        this.total = res.data.total
      },
      async getQueryFormList () {
        if (this.queryInfo.query === '') {
          this.getStudentList()
          return
        }
        const { data: res } = await this.$http.get('admin/student/query', { params: this.queryInfo })
        if (res.code !== 201) {
          return this.$message.error(res.msg)
        }
        this.studentList = res.data.students
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
