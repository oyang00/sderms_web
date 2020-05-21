<template>
  <div class="register_container">
    <div class="register_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/images/login_logo.png" alt="">
      </div>
      <!-- 登录表单区域 -->
      <el-form ref="registerFormRef" :model="registerForm" :rules="registerFormRules" label-width="0px"
               class="register_form">
        <!-- 账号 -->
        <el-form-item prop="account">
          <el-input v-model="registerForm.account" prefix-icon="el-icon-user" placeholder="请输入账号"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input v-model="registerForm.password" type="password" prefix-icon="el-icon-lock"
                    placeholder="请输入密码"></el-input>
        </el-form-item>
        <!-- 姓名 -->
        <el-form-item prop="name">
          <el-input v-model="registerForm.name" prefix-icon="el-icon-lock"
                    placeholder="请输入姓名"></el-input>
        </el-form-item>
        <!-- 宿舍选择 -->
        <el-form-item prop="dormitory">
          <el-select v-model="registerForm.dormitory" placeholder="请选择">
            <el-option v-for="item in dormitoryList"
                       :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="7">
            <!-- 返回区域 -->
            <el-button type="primary" icon="el-icon-arrow-left" @click="$router.push('/login')"></el-button>
          </el-col>
          <el-col :span="17">
            <!-- 按钮区域 -->
            <el-form-item class="btns">
              <el-button type="primary" @click="register">注册</el-button>
              <el-button type="info" @click="resetRegisterForm">重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<script>
  export default {
    data () {
      const checkAccount = async (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入账号'))
        } else {
          const { data: res } = await this.$http.get('user/check', { params: { account: value } })
          if (res.code !== 200) callback(res.msg)
          callback()
        }
      }
      return {
        showRegister: true,
        // 登录表单的数据
        registerForm: {
          account: '',
          password: '',
          name: '',
          dormitory: ''
        },
        // 表单验证规则
        registerFormRules: {
          // 账号
          account: [
            {
              validator: checkAccount,
              trigger: 'blur'
            }
          ],
          // 验证密码
          password: [
            {
              required: true,
              message: '请输入密码',
              trigger: 'blur'
            },
            {
              min: 6,
              max: 50,
              message: '长度在 6 到 50 个字符',
              trigger: 'blur'
            }
          ],
          name: [
            {
              required: true,
              message: '请输入姓名',
              trigger: 'blur'
            }
          ],
          dormitory: [
            {
              required: true,
              message: '请选择宿舍',
              trigger: 'blur'
            }
          ]
        },
        dormitoryList: []
      }
    },
    created () {
      this.getDormitoryList()
    },
    methods: {
      // 点击重置登录表单
      resetRegisterForm () {
        this.$refs.registerFormRef.resetFields()
      },
      register () {
        this.$refs.registerFormRef.validate(async valid => {
          if (!valid) return
          this.registerForm.password = this.$md5(this.registerForm.password)
          const { data: res } = await this.$http.post('user/register', this.registerForm)
          if (res.code !== 200) return this.$message.error(res.msg)
          this.$message.success('注册成功')

          const { data: res1 } = await this.$http.post('user/login', {
            account: this.registerForm.account,
            password: this.registerForm.password,
            type: 0
          })
          if (res1.code !== 200) return this.$message.error(res1.msg)
          window.sessionStorage.setItem('user', JSON.stringify(res1.data))
          window.sessionStorage.setItem('type', 0)
          window.sessionStorage.setItem('token', res1.data.token)
          await this.$router.push('/home')
        })
      },
      async getDormitoryList () {
        const { data: res } = await this.$http.get('user/dormitory')
        if (res.code !== 201) {
          return this.$message.error(res.msg)
        }
        this.dormitoryList = res.data
      }
    }
  }
</script>

<style scoped lang="less">
  // scoped 代表样式只在当前文件生效
  .register_container {
    background-color: #7093DB;
    height: 100%;
  }

  .register_box {
    width: 450px;
    height: 450px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    .avatar_box {
      height: 130px;
      width: 130px;
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 10px;
      box-shadow: 0 0 10px #ddd;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -40%);
      background-color: #fff;

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }
  }

  .btns {
    display: flex;
    justify-content: flex-end;
  }

  .register_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;

    .el-select {
      width: 100%;
    }
  }

  .register {
    display: flex;
    justify-content: flex-start;
  }
</style>
