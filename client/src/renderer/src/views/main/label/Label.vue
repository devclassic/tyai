<template>
  <div class="page">
    <div class="header">
      <div class="title">{{ settingsStore.title }}</div>
    </div>
    <div class="content">
      <input
        type="file"
        ref="file"
        accept="image/*,video/*"
        @change="handleFileChange"
        class="file" />
      <div v-if="!state.url" class="btn-box">
        <div class="btn-bg">
          <div @click="upimg" class="upload">上传图片</div>
        </div>
        <div class="btn-bg">
          <div @click="upvid" class="upload">上传视频</div>
        </div>
      </div>
      <div v-if="state.type && state.url" class="show">
        <div @click="close" class="close"></div>
        <img v-if="state.type === 'img'" :src="state.url" />
        <video v-if="state.type === 'vid'" :src="state.url" controls></video>
      </div>
    </div>
    <div class="input-box">
      <textarea
        ref="textarea"
        v-model="input"
        spellcheck="false"
        placeholder="请输入提示词"
        @keydown="handleKeydown"
        :disabled="state.showBack"
        class="input"></textarea>
      <div class="btn-box">
        <div
          v-if="!state.showBack"
          @click="asr"
          class="btn btn-speech"
          :class="{ active: state.recording }"></div>
        <div v-if="!state.showBack" @click="clean" class="btn btn-clean"></div>
        <div v-if="!state.showBack" @click="submit" class="btn btn-send"></div>
        <div v-if="state.showBack" @click="back" class="btn btn-back"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { reactive, computed, useTemplateRef } from 'vue'
  import { useTextareaAutosize } from '@vueuse/core'
  import { ElMessage, ElLoading } from 'element-plus'
  import { useAxios } from '@renderer/hooks/useAxios'
  import { useRecorder } from '@renderer/hooks/useRecorder'
  import { useSettingsStore } from '@renderer/stores/main/settings'

  const state = reactive({
    type: '',
    url: '',
    backupUrl: '',
    recording: false,
    showBack: false,
    file: useTemplateRef('file'),
  })

  const settingsStore = useSettingsStore()

  const http = useAxios()
  const recorder = useRecorder()

  const headerHeight = computed(() => {
    return state.showMneu ? '160px' : '100px'
  })

  const contentHeight = computed(() => {
    return state.showMneu ? '430px' : '490px'
  })

  const { textarea, input } = useTextareaAutosize()

  const upimg = () => {
    state.type = 'img'
    state.file.click()
  }

  const upvid = () => {
    state.type = 'vid'
    state.file.click()
  }

  const handleFileChange = () => {
    if (state.file.files.length) {
      const file = state.file.files[0]
      state.url = URL.createObjectURL(file)
      state.backupUrl = state.url
    }
  }

  const close = () => {
    if (state.url === state.backupUrl) {
      state.type = ''
      state.url = ''
      state.backupUrl = ''
      state.file.value = null
      input.value = ''
    } else {
      state.url = state.backupUrl
    }
  }

  const back = () => {
    close()
    state.showBack = false
    input.value = ''
  }

  const asr = async () => {
    if (!state.recording) {
      recorder.start(
        () => {
          ElMessage.success('正在收音...')
          state.recording = true
        },
        () => {
          ElMessage.error('收音失败')
          state.recording = false
        },
      )
    } else {
      const res = await recorder.getResult()
      input.value = res.data[0].text
      ElMessage.success('停止收音...')
      state.recording = false
    }
  }

  const handleKeydown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const clean = () => {
    input.value = ''
  }

  const submit = async () => {
    if (!input.value) {
      return
    }
    if (state.file.files.length === 0) {
      ElMessage.error('请选择需要处理的视觉文件')
      return
    }
    const loading = ElLoading.service({
      target: '.page',
      text: '处理中...',
    })
    state.showBack = true
    const base = localStorage.getItem('baseSam3')
    let url = ''
    switch (state.type) {
      case 'img':
        url = base + '/api/image'
        break
      case 'vid':
        url = base + '/api/video'
        break
    }
    const formData = new FormData()
    formData.append('file', state.file.files[0])
    formData.append('query', input.value)
    const res = await http.post(url, formData)
    state.url = base + res.data.data
    loading.close()
  }
</script>

<style lang="scss" scoped>
  .page {
    height: 100%;
    position: relative;
  }

  .header {
    width: 100%;
    height: v-bind(headerHeight);
    position: relative;
    .title {
      width: 662px;
      height: 79px;
      line-height: 79px;
      text-align: center;
      font-size: 45px;
      color: #625b71;
      background: url('@renderer/assets/images/header-title.png') no-repeat center center / 100%
        100%;
      position: absolute;
      top: 5px;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  .content {
    app-region: no-drag;
    width: 100%;
    height: v-bind(contentHeight);
    border: 1px solid #e6e5e7;
    padding: 0 10px;
    background: #ffffff;
    border-radius: 15px;
    box-shadow: 0px 5px 5px -2px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: center;
    align-items: center;
    .file {
      width: 0;
      height: 0;
      opacity: 0;
    }
    .show {
      width: 1060px;
      height: 440px;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #e6e6e6;
      border-radius: 20px;
      position: relative;
      img {
        height: 90%;
      }
      video {
        height: 90%;
      }
      .close {
        width: 20px;
        height: 20px;
        position: absolute;
        top: -15px;
        right: -15px;
        cursor: pointer;
        background: url('@renderer/assets/images/label-close.png') no-repeat center center / 100%
          100%;
      }
    }
    .btn-box {
      width: 1060px;
      height: 440px;
      display: flex;
      justify-content: space-between;
      .btn-bg {
        width: 515px;
        height: 100%;
        background: #e6e6e6;
        border-radius: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        .upload {
          width: 205px;
          height: 40px;
          line-height: 40px;
          text-align: center;
          font-size: 16px;
          color: #ffffff;
          background: #756882;
          border-radius: 10px;
          cursor: pointer;
          &:hover {
            background: #cbc1db;
            color: #000000;
          }
        }
      }
    }
  }

  .input-box {
    width: 100%;
    min-height: 100px;
    box-shadow: 0px 5px 5px -2px rgba(0, 0, 0, 0.1);
    background: #ffffff;
    border-radius: 15px;
    position: absolute;
    bottom: 15px;
    app-region: no-drag;
    padding-bottom: 10px;
    border: 1px solid #d5d4d6;
    .input {
      width: 100%;
      min-height: 40px;
      line-height: 1.5;
      max-height: calc(1em * 10);
      border: none;
      outline: none;
      border-radius: 15px;
      padding: 0 10px;
      margin-top: 10px;
      resize: none;
      &:disabled {
        background: #ffffff;
      }
    }
    .btn-box {
      display: flex;
      justify-content: end;
      margin-top: 10px;
    }
    .btn {
      width: 65px;
      height: 30px;
      margin-right: 15px;
      cursor: pointer;
    }
    .btn-speech {
      background: url('@renderer/assets/images/input-btn-speech.png') no-repeat center center / 100%
        100%;
    }
    .btn-speech:hover,
    .btn-speech.active {
      background: url('@renderer/assets/images/input-btn-speech-hover.png') no-repeat center
        center / 100% 100%;
    }
    .btn-clean {
      background: url('@renderer/assets/images/input-btn-clean.png') no-repeat center center / 100%
        100%;
    }
    .btn-clean:hover {
      background: url('@renderer/assets/images/input-btn-clean-hover.png') no-repeat center center /
        100% 100%;
    }
    .btn-send {
      background: url('@renderer/assets/images/input-btn-send.png') no-repeat center center / 100%
        100%;
    }
    .btn-send:hover {
      background: url('@renderer/assets/images/input-btn-send-hover.png') no-repeat center center /
        100% 100%;
    }
    .btn-back {
      background: url('@renderer/assets/images/btn-back.png') no-repeat center center / 100% 100%;
    }
    .btn-back:hover {
      background: url('@renderer/assets/images/btn-back-hover.png') no-repeat center center / 100%
        100%;
    }
  }
</style>
