<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>我</el-breadcrumb-item>
      <el-breadcrumb-item>修改姓名</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <el-form ref="nameFormRef" :model="nameForm" :rules="nameFormRules" label-width="80px"
               class="name_form">
        <el-form-item label="姓名" prop="newName">
          <el-input v-model="nameForm.newName"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="name" :disabled="submitDisabled">修改</el-button>
          <el-button @click="resetNameForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        user: {},
        originName: '',
        nameForm: {
          newName: ''
        },
        nameFormRules: {
          newName: [
            {
              required: true,
              message: '请输入姓名',
              trigger: 'blur'
            }
          ]
        }
      }
    },
    computed: {
      submitDisabled: function () {
        if (this.nameForm.newName === this.originName) {
          return true
        }
        return false
      }
    },
    created () {
      this.getStorageUser()
    },
    methods: {
      resetNameForm () {
        this.nameForm.newName = this.originName
      },
      name () {
        this.$refs.nameFormRef.validate(async valid => {
          if (!valid) return
          const { data: res } = await this.$http.put('user/name', this.nameForm)
          if (res.code !== 200) return this.$message.error(res.msg)
          this.$message.success('修改成功')
          this.originName = this.nameForm.newName
          this.user.name = this.originName
          window.sessionStorage.setItem('user', JSON.stringify(this.user))
          this.resetNameForm()
          this.$router.go(0)
        })
      },
      // 获取存储的用户信息
      getStorageUser () {
        this.user = JSON.parse(window.sessionStorage.getItem('user'))
        this.nameForm.newName = this.user.name
        this.originName = this.nameForm.newName
      }
    }
  }
</script>

<style scoped lang="less">
  .name_form {
    margin-top: 20px;
  }
</style>
