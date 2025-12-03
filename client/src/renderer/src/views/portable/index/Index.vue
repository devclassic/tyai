<template>
  <div class="box" :class="box">
    <div @click="close" class="close"></div>
    <div class="main">
      <div class="left">
        <div v-for="(item, i) in data.state.imgs" class="img">
          <div @click="removeImg(i)" class="close"></div>
          <img :src="item" height="100%" />
        </div>
      </div>
      <div class="right">
        <textarea ref="input" v-model="text" spellcheck="false" class="input"></textarea>
        <div class="btns">
          <div class="btn-group">
            <div class="btn">内容分析</div>
            <div class="btn">翻译</div>
          </div>
          <div class="btn-group">
            <input ref="file" type="file" @change="handleFileChange" multiple class="file" />
            <div class="icon icon-speech"></div>
            <div @click="upload" class="icon icon-upload"></div>
            <div class="icon icon-send"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { useDataStore } from '@renderer/stores/portable/data'
  import { computed, useTemplateRef, nextTick, ref, watch, watchEffect } from 'vue'

  const data = useDataStore()
  const inputRef = useTemplateRef('input')

  const text = ref('')

  let mirror = null
  nextTick(() => {
    mirror = document.createElement('div')
    mirror.style.cssText = `
      position: absolute;
      visibility: hidden;
      left: -9999px;
      top: -9999px;
      pointer-events: none;
      white-space: pre-wrap;      /* 关键：保留换行与空格 */
      word-wrap: break-word;      /* 允许长单词换行 */
      width: ${inputRef.value.clientWidth - 0}px; /* 减去左右 padding/border */
      line-height: 22px;
      font-size: ${getComputedStyle(inputRef.value).fontSize};
      font-family: ${getComputedStyle(inputRef.value).fontFamily};
      padding: 0;               /* 与 textarea 保持一致 */
      border: 0;
      margin: 0;
    `
    document.body.appendChild(mirror)
  })

  const visualRows = ref(0)

  watch(
    text,
    () => {
      nextTick(() => {
        if (!mirror) return
        mirror.textContent = text.value || ' '
        const h = mirror.offsetHeight
        visualRows.value = Math.round(h / 22)
      })
    },
    { immediate: true },
  )

  const boxTextSmall = computed(() => {
    return visualRows.value <= 2
  })

  const box = ref('')

  watchEffect(() => {
    if (data.state.imgs.length === 1) {
      electron.ipcRenderer.send('resize-portable', { width: 630, height: 145 })
      box.value = 'box-img-single'
    } else if (data.state.imgs.length > 1) {
      electron.ipcRenderer.send('resize-portable', { width: 630, height: 290 })
      box.value = 'box-img-multi'
    } else {
      if (boxTextSmall.value) {
        electron.ipcRenderer.send('resize-portable', { width: 630, height: 145 })
        box.value = 'box-text-small'
      } else {
        electron.ipcRenderer.send('resize-portable', { width: 630, height: 290 })
        box.value = 'box-text'
      }
    }
  })

  const close = () => {
    electron.ipcRenderer.send('close')
  }

  const fileRef = useTemplateRef('file')
  const upload = () => {
    fileRef.value.click()
  }

  const handleFileChange = () => {
    data.state.imgs = []
    data.state.files = []
    const files = fileRef.value.files
    data.state.files = Array.from(files)
    for (const file of files) {
      const url = URL.createObjectURL(file)
      data.state.imgs.push(url)
    }
  }

  const removeImg = i => {
    data.state.imgs.splice(i, 1)
    data.state.files.splice(i, 1)
  }

  const base64ToFile = (base64String, fileName, mimeType) => {
    const byteCharacters = atob(base64String.split(',')[1])
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: mimeType })
    const file = new File([blob], fileName, { type: mimeType })
    return file
  }

  electron.ipcRenderer.send('portable-ready')

  electron.ipcRenderer.on('load', (e, json) => {
    if (!json) return
    data.state.imgs = []
    data.state.files = []
    const items = JSON.parse(json)
    items.forEach(async item => {
      if (item.type === 'text') {
        text.value += item.payload + '\n\n'
      } else if (item.type === 'image') {
        const base64 = await electron.ipcRenderer.invoke('read-local-image', item.payload)
        data.state.imgs.push(base64)
        const file = base64ToFile(base64, item.payload.split('\\').pop(), 'image/png')
        data.state.files.push(file)
      }
    })
  })
</script>

<style lang="scss" scoped>
  .box-img-single {
    height: 145px !important;
    .left,
    .right {
      height: 100px;
    }
    .input {
      height: 55px !important;
    }
    .left {
      overflow: hidden !important;
    }
    .img {
      margin-top: 5px !important;
    }
  }

  .box-text-small {
    height: 145px !important;
    .left {
      display: none;
    }
    .left,
    .right {
      height: 100px;
    }
    .right {
      margin-left: 0 !important;
    }
    .input {
      height: 55px !important;
    }
  }

  .box-text {
    .left {
      display: none;
    }
    .right {
      margin-left: 0 !important;
    }
  }

  .box {
    width: 630px;
    height: 290px;
    background: rgba(31, 29, 39, 0.5);
    border-radius: 15px;
    padding: 35px 10px 0;
    position: relative;
    .close {
      width: 30px;
      height: 30px;
      background: url('@renderer/assets/images/index-close.png') no-repeat center center / 100% 100%;
      cursor: pointer;
      position: absolute;
      top: 2px;
      right: 5px;
      app-region: no-drag;
      &:hover {
        background: url('@renderer/assets/images/index-close-hover.png') no-repeat center center /
          100% 100%;
      }
    }
  }

  .main {
    app-region: no-drag;
    display: flex;
    justify-content: space-between;
  }

  .left {
    width: 202px;
    height: 247px;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 15px;
    overflow: auto;
    &::-webkit-scrollbar-thumb {
      background: #bfbfbf;
    }
    &::-webkit-scrollbar {
      width: 5px;
      background: rgba(0, 0, 0, 0);
    }
    .img {
      width: 160px;
      height: 90px;
      background: #656c70;
      margin: 22px auto 0;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      img {
        max-width: 100%;
        height: 100%;
        object-fit: cover;
      }
      &:last-child {
        margin-bottom: 22px;
      }
      .close {
        width: 15px;
        height: 15px;
        background: url('@renderer/assets/images/index-img-close.png') no-repeat center center /
          100% 100%;
        cursor: pointer;
        position: absolute;
        top: 5px;
        right: 5px;
        z-index: 9999;
      }
    }
  }

  .right {
    flex: 1;
    margin-left: 10px;
    height: 247px;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 15px;
    padding: 10px;
    .input {
      width: 100%;
      height: 200px;
      background: transparent;
      border: none;
      outline: none;
      resize: none;
      font-size: 16px;
      color: #ffffff;
      &::-webkit-scrollbar-thumb {
        background: #bfbfbf;
      }
      &::-webkit-scrollbar {
        width: 5px;
        background: rgba(0, 0, 0, 0);
      }
    }
    .btns {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
      .file {
        width: 0;
        height: 0;
        opacity: 0;
      }
      .btn-group {
        display: flex;
      }
      .btn {
        width: 70px;
        height: 20px;
        line-height: 20px;
        text-align: center;
        background: #333333;
        color: #ffffff;
        font-size: 12px;
        border-radius: 5px;
        margin-right: 10px;
        cursor: pointer;
        &:hover {
          background: #cccccc;
          color: #000000;
        }
      }
      .icon {
        width: 22px;
        height: 22px;
        cursor: pointer;
        margin-left: 10px;
      }
      .icon-speech {
        background: url('@renderer/assets/images/index-icon-speech.png') no-repeat center center /
          100% 100%;
        &:hover {
          background: url('@renderer/assets/images/index-icon-speech-hover.png') no-repeat center
            center / 100% 100%;
        }
      }
      .icon-upload {
        background: url('@renderer/assets/images/index-icon-upload.png') no-repeat center center /
          100% 100%;
        &:hover {
          background: url('@renderer/assets/images/index-icon-upload-hover.png') no-repeat center
            center / 100% 100%;
        }
      }
      .icon-send {
        background: url('@renderer/assets/images/index-icon-send.png') no-repeat center center /
          100% 100%;
        &:hover {
          background: url('@renderer/assets/images/index-icon-send-hover.png') no-repeat center
            center / 100% 100%;
        }
      }
    }
  }
</style>
