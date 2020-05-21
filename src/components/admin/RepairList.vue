<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>维修人员管理</el-breadcrumb-item>
      <el-breadcrumb-item>维修人员列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入维修人员账号" v-model="queryInfo.query" clearable @clear="getRepairList">
            <el-button slot="append" icon="el-icon-search" @click="getQueryFormList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="7">
          <el-button type="primary" @click="addDialogVisible = true">添加维修人员</el-button>
        </el-col>
      </el-row>
      <!-- 维修人员列表区域 -->
      <el-table :data="repairList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="账号" prop="account"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 修改维修人员密码 -->
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
    <!-- 修改学生密码对话框 -->
    <el-dialog title="修改维修人员密码" :visible.sync="editPasswordDialogVisible" width="50%" @close="editPasswordDialogClosed">
      <!-- 内容主题区域 -->
      <el-form :model="editPasswordForm" :rules="editPasswordFormRules" ref="editPasswordFormRef"
               label-width="150px">
        <el-form-item label="维修人员账号" prop="repairAccount">
          <el-input v-model="editPasswordForm.repairAccount" disabled></el-input>
        </el-form-item>
        <el-form-item label="管理员密码" prop="adminPass">
          <el-input type="password" v-model="editPasswordForm.adminPass"></el-input>
        </el-form-item>
        <el-form-item label="维修人员新密码" prop="repairNewPass">
          <el-input type="password" v-model="editPasswordForm.repairNewPass"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editPasswordDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editPassword">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 删除学生对话框 -->
    <el-dialog title="删除维修人员" :visible.sync="deleteDialogVisible" width="50%" @close="deleteDialogClosed">
      <!-- 内容主题区域 -->
      <el-form :model="deleteForm" :rules="deleteFormRules" ref="deleteFormRef" label-width="100px">
        <el-form-item label="维修人员账号" prop="repairAccount">
          <el-input v-model="deleteForm.repairAccount" disabled></el-input>
        </el-form-item>
        <el-form-item label="管理员密码" prop="adminPass">
          <el-input type="password" v-model="deleteForm.adminPass"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="deleteRepair">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加维修人员对话框 -->
    <el-dialog title="添加维修人员" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 内容主题区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="150px">
        <el-form-item label="管理员密码" prop="adminPass">
          <el-input v-model="addForm.adminPass" type="password"></el-input>
        </el-form-item>
        <el-form-item label="维修人员账号" prop="repairAccount">
          <el-input v-model="addForm.repairAccount"></el-input>
        </el-form-item>
        <el-form-item label="维修人员密码" prop="repairPass">
          <el-input v-model="addForm.repairPass" type="password"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRepair">确 定</el-button>
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
        repairList: [],
        total: 0,
        editPasswordDialogVisible: false,
        editPasswordForm: {
          adminPass: '',
          repairAccount: '',
          repairNewPass: ''
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
          repairNewPass: [
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
          repairAccount: ''
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
          repairAccount: '',
          repairPass: ''
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
          ],
          repairAccount: [
            {
              required: true,
              message: '请输入维修人员账号',
              trigger: 'blur'
            },
            {
              min: 4,
              max: 20,
              message: '长度在 4 到 20 个字符',
              trigger: 'blur'
            }
          ],
          repairPass: [
            {
              required: true,
              message: '请输入维修人员密码',
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
      this.getRepairList()
    },
    methods: {
      addRepair () {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          this.addForm.adminPass = this.$md5(this.addForm.adminPass)
          this.addForm.repairPass = this.$md5(this.addForm.repairPass)
          const { data: res } = await this.$http.post('admin/repair', this.addForm)
          if (res.code !== 200) return this.$message.error(res.msg)
          this.$message.success('新建成功')
          // 隐藏对话框
          this.addDialogVisible = false
          // 重新获取数据
          this.getRepairList()
        })
      },
      addDialogClosed () {
        this.$refs.addFormRef.resetFields()
      },
      showDeleteDialog (row) {
        this.deleteForm.repairAccount = row.account
        this.deleteDialogVisible = true
      },
      deleteRepair () {
        this.$refs.deleteFormRef.validate(async valid => {
          if (!valid) return
          this.deleteForm.adminPass = this.$md5(this.deleteForm.adminPass)
          const { data: res } = await this.$http.delete('admin/repair', { data: this.deleteForm })
          if (res.code !== 200) return this.$message.error(res.msg)
          this.$message.success('删除成功')
          // 隐藏对话框
          this.deleteDialogVisible = false
          // 重新获取数据
          this.getRepairList()
        })
      },
      deleteDialogClosed () {
        this.$refs.deleteFormRef.resetFields()
      },
      showEditPasswordDialog (row) {
        this.editPasswordForm.repairAccount = row.account
        this.editPasswordDialogVisible = true
      },
      editPassword () {
        this.$refs.editPasswordFormRef.validate(async valid => {
          if (!valid) return
          this.editPasswordForm.adminPass = this.$md5(this.editPasswordForm.adminPass)
          this.editPasswordForm.repairNewPass = this.$md5(this.editPasswordForm.repairNewPass)
          const { data: res } = await this.$http.put('admin/repair/password', this.editPasswordForm)
          if (res.code !== 200) return this.$message.error(res.msg)
          this.$message.success('修改成功')
          // 隐藏对话框
          this.editPasswordDialogVisible = false
          // 重新获取数据
          this.getRepairList()
        })
      },
      editPasswordDialogClosed () {
        this.$refs.editPasswordFormRef.resetFields()
      },
      async getRepairList () {
        const { data: res } = await this.$http.get('admin/repair/all', { params: this.queryInfo })
        if (res.code !== 201) {
          return this.$message.error(res.msg)
        }
        this.repairList = res.data.repairs
        this.total = res.data.total
      },
      async getQueryFormList () {
        if (this.queryInfo.query === '') {
          this.getRepairList()
          return
        }
        const { data: res } = await this.$http.get('admin/repair/query', { params: this.queryInfo })
        if (res.code !== 201) {
          return this.$message.error(res.msg)
        }
        this.repairList = res.data.repairs
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
