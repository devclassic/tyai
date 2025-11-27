<template>
  <div class="win-btns">
    <div v-if="state.showMin" @click="minimize" class="min"></div>
    <div @click="close" class="close"></div>
  </div>
</template>

<script setup>
  import { reactive } from 'vue'

  const state = reactive({
    showMin: true,
  })

  electron.ipcRenderer.on('win-restored', () => {
    state.showMin = true
  })

  const minimize = async () => {
    state.showMin = false
    setTimeout(() => {
      electron.ipcRenderer.send('minimize')
    }, 10)
  }

  const close = () => {
    electron.ipcRenderer.send('close')
  }
</script>

<style lang="scss" scoped>
  .win-btns {
    display: flex;
    z-index: 9999;
    position: fixed;
    top: 0px;
    right: 0px;
    cursor: pointer;
    app-region: no-drag;
    .min {
      width: 32px;
      height: 32px;
      background: url('@renderer/assets/images/win-min.png') no-repeat center center / 100% 100%;
      &:hover {
        background: url('@renderer/assets/images/win-min-hover.png') no-repeat center center / 100%
          100%;
      }
    }
    .close {
      width: 32px;
      height: 32px;
      background: url('@renderer/assets/images/win-close.png') no-repeat center center / 100% 100%;
      &:hover {
        background: url('@renderer/assets/images/win-close-hover.png') no-repeat center center /
          100% 100%;
      }
    }
  }
</style>
