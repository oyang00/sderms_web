<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>我</el-breadcrumb-item>
      <el-breadcrumb-item>修改密码</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordFormRules" label-width="80px"
               class="password_form">
        <el-form-item label="旧密码" prop="oldPass">
          <el-input v-model="passwordForm.oldPass"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPass">
          <el-input v-model="passwordForm.newPass"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="password">修改</el-button>
          <el-button @click="resetPasswordForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        passwordForm: {
          oldPass: '',
          newPass: ''
        },
        passwordFormRules: {
          oldPass: [
            {
              required: true,
              message: '请输入旧密码',
              trigger: 'blur'
            },
            {
              min: 6,
              max: 50,
              message: '长度在 6 到 50 个字符',
              trigger: 'blur'
            }
          ],
          newPass: [
            {
              required: true,
              message: '请输入新密码',
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
    methods: {
      resetPasswordForm () {
        this.$refs.passwordFormRef.resetFields()
      },
      password () {
        this.$refs.passwordFormRef.validate(async valid => {
          if (!valid) return
          this.passwordForm.oldPass = this.$md5(this.passwordForm.oldPass)
          this.passwordForm.newPass = this.$md5(this.passwordForm.newPass)
          const { data: res } = await this.$http.put('user/password', this.passwordForm)
          if (res.code !== 200) return this.$message.error(res.msg)
          this.$message.success('修改成功')
          this.resetPasswordForm()
        })
      }
    }
  }
</script>

<style scoped lang="less">
  .password_form {
    margin-top: 20px;
  }
</style>
