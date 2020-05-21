<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>报修表单</el-breadcrumb-item>
      <el-breadcrumb-item>提出报修</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <el-form ref="proposeFormRef" :model="proposeForm" :rules="proposeFormRules" label-width="80px"
               class="propose_form">
        <el-form-item label="标题" prop="title">
          <el-input v-model="proposeForm.title"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="desc">
          <el-input type="textarea" v-model="proposeForm.desc"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="propose">立即创建</el-button>
          <el-button @click="resetProposeForm">清空</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        proposeForm: {
          title: '',
          desc: ''
        },
        proposeFormRules: {
          title: [
            {
              required: true,
              message: '请输入标题',
              trigger: 'blur'
            }
          ],
          desc: [
            {
              required: true,
              message: '请输入描述',
              trigger: 'blur'
            }
          ]
        }
      }
    },
    methods: {
      resetProposeForm () {
        this.$refs.proposeFormRef.resetFields()
      },
      propose () {
        this.$refs.proposeFormRef.validate(async valid => {
          if (!valid) return
          const { data: res } = await this.$http.post('forms/form', this.proposeForm)
          if (res.code !== 200) return this.$message.error(res.msg)
          this.$message.success('提交成功')
          this.resetProposeForm()
        })
      }
    }
  }
</script>

<style scoped lang="less">
  .propose_form {
    margin-top: 20px;
  }
</style>
