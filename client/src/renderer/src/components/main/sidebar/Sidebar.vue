<template>
  <div class="sidebar">
    <div class="logo">智能AI助手</div>
    <div class="type">主要功能</div>
    <div
      @click="router.push('/knowledge')"
      class="item"
      :class="{ active: route.path === '/knowledge' }">
      <div class="icon icon-1"></div>
      <div class="text">知识库</div>
    </div>
    <div @click="showItem2" class="item" :class="{ 'active-2': state.showItem2 }">
      <div class="icon icon-2"></div>
      <div class="text">智能语音</div>
      <div class="icon icon-down"></div>
    </div>
    <div
      v-show="state.showItem2"
      @click="router.push('/speech')"
      class="item item-2 item-2-1"
      :class="{ active: route.path === '/speech' }">
      <div class="icon icon-2-1"></div>
      <div class="text">多人语音</div>
    </div>
    <div
      v-show="state.showItem2"
      @click="router.push('/form')"
      class="item item-2 item-2-2"
      :class="{ active: route.path === '/form' }">
      <div class="icon icon-2-2"></div>
      <div class="text">表单填写</div>
    </div>
    <div @click="router.push('/doc')" class="item" :class="{ active: route.path === '/doc' }">
      <div class="icon icon-3"></div>
      <div class="text">智能公文</div>
    </div>
    <div @click="router.push('/ocr')" class="item" :class="{ active: route.path === '/ocr' }">
      <div class="icon icon-4"></div>
      <div class="text">ORC识别</div>
    </div>
    <div @click="router.push('/docs')" class="item" :class="{ active: route.path === '/docs' }">
      <div class="icon icon-5"></div>
      <div class="text">文档分析</div>
    </div>
    <div class="line"></div>
    <div class="type">个人中心</div>
    <div class="item">
      <div class="icon icon-6"></div>
      <div class="text">个人资料</div>
    </div>
    <div @click="showSettings" class="item">
      <div class="icon icon-7"></div>
      <div class="text">系统设置</div>
    </div>
    <div class="item">
      <div class="icon icon-8"></div>
      <div class="text">历史记录</div>
    </div>
  </div>

  <el-dialog v-model="state.showSettings" title="系统设置" width="500" class="dialog-settings">
    <el-form label-width="auto">
      <el-form-item label="应用名称">
        <el-input v-model="settingsStore.title" placeholder="请输入应用名称" />
      </el-form-item>
      <el-form-item label="服务地址">
        <el-select v-model="settingsStore.base" placeholder="请选择服务地址">
          <el-option label="http://localhost:7800" value="http://localhost:7800" />
          <el-option label="https://client.epoint.ink" value="https://client.epoint.ink" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="state.showSettings = false">取消</el-button>
        <el-button type="primary" @click="saveSettings">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
  import { reactive, watchEffect } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { ElDialog, ElForm, ElFormItem, ElSelect, ElOption, ElInput } from 'element-plus'
  import { useSettingsStore } from '@renderer/stores/main/settings'

  const state = reactive({
    showItem2: false,
    showSettings: false,
  })

  const settingsStore = useSettingsStore()
  settingsStore.title = localStorage.getItem('title')
  settingsStore.base = localStorage.getItem('base')

  const router = useRouter()
  const route = useRoute()

  watchEffect(() => {
    const routes = ['/speech', '/form']
    if (routes.includes(route.path)) {
      state.showItem2 = true
    } else {
      state.showItem2 = false
    }
  })

  const showItem2 = () => {
    state.showItem2 = !state.showItem2
  }

  const showSettings = () => {
    state.showSettings = true
  }

  const saveSettings = () => {
    localStorage.setItem('title', settingsStore.title)
    localStorage.setItem('base', settingsStore.base)
    state.showSettings = false
  }
</script>

<style lang="scss">
  .el-dialog__headerbtn {
    app-region: no-drag;
  }
</style>

<style lang="scss" scoped>
  .sidebar {
    width: 130px;
    height: 100%;
    background: #e4d9dd;
    padding: 0 10px;
    overflow: auto;
    .logo {
      height: 75px;
      line-height: 75px;
      text-align: center;
      border-bottom: 1px solid #8d8595;
      font-size: 16px;
      color: #625b71;
    }
    .type {
      font-size: 12px;
      color: #6d667a;
      margin-top: 10px;
    }
    .line {
      width: 100%;
      height: 1px;
      background: #9f96a3;
      margin-top: 10px;
    }
    .item {
      height: 40px;
      font-size: 14px;
      color: #4a4459;
      display: flex;
      align-items: center;
      cursor: pointer;
      margin-top: 10px;
      border-radius: 5px;
      app-region: no-drag;
      .icon {
        width: 16px;
        height: 16px;
        margin-left: 5px;
        &.icon-1 {
          background: url('@renderer/assets/images/menu-icon-1.png') no-repeat center center / 100%
            100%;
        }
        &.icon-2 {
          background: url('@renderer/assets/images/menu-icon-2.png') no-repeat center center / 100%
            100%;
        }
        &.icon-2-1 {
          background: url('@renderer/assets/images/menu-icon-2-1.png') no-repeat center center /
            100% 100%;
        }
        &.icon-2-2 {
          background: url('@renderer/assets/images/menu-icon-2-2.png') no-repeat center center /
            100% 100%;
        }
        &.icon-3 {
          background: url('@renderer/assets/images/menu-icon-3.png') no-repeat center center / 100%
            100%;
        }
        &.icon-4 {
          background: url('@renderer/assets/images/menu-icon-4.png') no-repeat center center / 100%
            100%;
        }
        &.icon-5 {
          background: url('@renderer/assets/images/menu-icon-5.png') no-repeat center center / 100%
            100%;
        }
        &.icon-6 {
          background: url('@renderer/assets/images/menu-icon-6.png') no-repeat center center / 100%
            100%;
        }
        &.icon-7 {
          background: url('@renderer/assets/images/menu-icon-7.png') no-repeat center center / 100%
            100%;
        }
        &.icon-8 {
          background: url('@renderer/assets/images/menu-icon-8.png') no-repeat center center / 100%
            100%;
        }
        &.icon-down {
          width: 11px;
          height: 6px;
          background: url('@renderer/assets/images/menu-icon-down.png') no-repeat center center /
            100% 100%;
        }
      }
      .text {
        margin-left: 5px;
      }
      &:hover,
      &.active {
        color: #ffffff;
        background: #756882;
        &.item-2 {
          background: #4e3d57;
        }
        & .icon-1 {
          background: url('@renderer/assets/images/menu-icon-1-hover.png') no-repeat center center /
            100% 100%;
        }
        & .icon-2 {
          background: url('@renderer/assets/images/menu-icon-2-hover.png') no-repeat center center /
            100% 100%;
        }
        & .icon-3 {
          background: url('@renderer/assets/images/menu-icon-3-hover.png') no-repeat center center /
            100% 100%;
        }
        & .icon-4 {
          background: url('@renderer/assets/images/menu-icon-4-hover.png') no-repeat center center /
            100% 100%;
        }
        & .icon-5 {
          background: url('@renderer/assets/images/menu-icon-5-hover.png') no-repeat center center /
            100% 100%;
        }
        & .icon-6 {
          background: url('@renderer/assets/images/menu-icon-6-hover.png') no-repeat center center /
            100% 100%;
        }
        & .icon-7 {
          background: url('@renderer/assets/images/menu-icon-7-hover.png') no-repeat center center /
            100% 100%;
        }
        & .icon-8 {
          background: url('@renderer/assets/images/menu-icon-8-hover.png') no-repeat center center /
            100% 100%;
        }
        & .icon-down {
          width: 11px;
          height: 6px;
          background: url('@renderer/assets/images/menu-icon-down-hover.png') no-repeat center
            center / 100% 100%;
        }
      }
      &.active-2 {
        background: #756882;
        border-radius: 5px 5px 0px 0px;
        & .icon-2 {
          background: url('@renderer/assets/images/menu-icon-2-hover.png') no-repeat center center /
            100% 100%;
        }
        & .text {
          color: #ffffff;
        }
        & .icon-down {
          width: 11px;
          height: 6px;
          background: url('@renderer/assets/images/menu-icon-down-hover.png') no-repeat center
            center / 100% 100%;
        }
      }
      &.item-2 {
        margin-top: 0px;
        background: #756882;
        & .text {
          color: #ffffff;
        }
      }
      &.item-2.active {
        background: #4e3d57;
      }
      &.item-2-1 {
        border-radius: 0px;
      }
      &.item-2-2 {
        border-radius: 0px 0px 5px 5px;
      }
    }
  }

  .dialog-settings {
    app-region: no-drag;
  }
</style>
