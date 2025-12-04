<template>
  <div class="box" :class="{ 'has-img': hasImgs }">
    <div class="win-btns">
      <div @click="state.showClear = true" class="btn btn-clear"></div>
      <div @click="minimize" class="btn btn-min"></div>
      <div @click="close" class="btn btn-close"></div>
    </div>
    <div ref="chatBox" class="chat-box">
      <template v-for="(item, i) in state.messages">
        <div v-if="item.pos === 'left'" class="item left">
          <div class="content">
            <div class="message" v-html="item.content"></div>
            <div class="btns">
              <div @click="re(item, i)" class="btn btn-re"></div>
              <div @click="copy(item.raw)" class="btn btn-copy"></div>
              <div @click="tts(item.raw)" class="btn btn-play"></div>
            </div>
          </div>
        </div>
        <div v-if="item.pos === 'right'" class="item right">
          <div class="content">
            <div v-if="item.files.length > 0" class="imgs">
              <div v-for="img in item.files" class="img"></div>
            </div>
            <div class="message" v-html="item.content"></div>
            <div class="btns">
              <div @click="copy(item.raw)" class="btn btn-copy"></div>
            </div>
          </div>
        </div>
      </template>
    </div>
    <div v-if="hasImgs" class="img-box">
      <div v-for="(item, i) in data.state.imgs" class="img">
        <div @click="removeImg(i)" class="close"></div>
        <img :src="item" />
      </div>
    </div>
    <div class="input-box">
      <textarea
        v-model="data.state.input"
        @keydown="handleKeydown"
        spellcheck="false"
        class="input"></textarea>
      <div class="btns">
        <input ref="file" type="file" multiple @change="handleFileChange" class="file" />
        <div @click="asr" class="icon icon-speech" :class="{ active: state.recording }"></div>
        <div @click="upload" class="icon icon-upload"></div>
        <div @click="submit" class="icon icon-send"></div>
      </div>
    </div>
  </div>

  <div v-if="state.showClear" class="dialog-clear">
    <div class="text">开启新对话将清空当前聊天</div>
    <div class="btns">
      <div @click="clear" class="btn">清空</div>
      <div @click="state.showClear = false" class="btn">取消</div>
    </div>
  </div>
</template>

<script setup>
  import { computed, onMounted, reactive, useTemplateRef } from 'vue'
  import { ElMessage } from 'element-plus'
  import { fetchEventSource } from '@microsoft/fetch-event-source'
  import { marked } from 'marked'
  import { useRecorder } from '@renderer/hooks/useRecorder'
  import { useDataStore } from '@renderer/stores/portable/data'
  import { useAxios } from '@renderer/hooks/useAxios'

  const state = reactive({
    messages: [],
    showClear: false,
    recording: false,
    fileRef: useTemplateRef('file'),
    chatBoxRef: useTemplateRef('chatBox'),
  })

  const http = useAxios()
  const recorder = useRecorder()
  const data = useDataStore()

  onMounted(() => {
    submit()
  })

  const hasImgs = computed(() => data.state.imgs.length > 0)

  const minimize = () => {
    electron.ipcRenderer.send('minimize')
  }

  const close = () => {
    electron.ipcRenderer.send('close')
  }

  const clear = () => {
    state.messages = []
    data.state.input = ''
    data.state.imgs = []
    data.state.files = []
    data.state.upfiles = []
    state.showClear = false
  }

  const removeImg = i => {
    data.state.imgs.splice(i, 1)
    data.state.files.splice(i, 1)
  }

  const upload = () => {
    state.fileRef.click()
  }

  const handleFileChange = () => {
    data.state.imgs = []
    data.state.files = []
    const files = state.fileRef.files
    data.state.files = Array.from(files)
    for (const file of files) {
      const url = URL.createObjectURL(file)
      data.state.imgs.push(url)
    }
  }

  const copy = async text => {
    await navigator.clipboard.writeText(text)
    ElMessage.success('复制成功')
  }

  const tts = content => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel()
    } else {
      const msg = new SpeechSynthesisUtterance(content)
      speechSynthesis.speak(msg)
    }
  }

  const asr = async () => {
    if (!state.recording) {
      recorder.start(
        () => {
          ElMessage.success('正在收音...')
          state.recording = true
        },
        () => {
          state.status = ''
          ElMessage.error('收音失败')
          state.recording = false
        },
      )
    } else {
      const res = await recorder.getResult()
      data.state.input = res.data[0].text
      ElMessage.success('停止收音...')
      state.recording = false
    }
  }

  const re = async (item, i) => {
    const q = state.messages[i - 1]
    const query = q.content
    let result = ''
    const base = localStorage.getItem('base')
    const url = `${base}/api/chat`
    const ctrl = new AbortController()
    await fetchEventSource(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query, type: 'ocr', upfiles: q.files }),
      signal: ctrl.signal,
      async onopen(e) {
        if (e.ok) {
          state.input = ''
          console.log('✅ SSE opened')
        } else {
          throw new Error(await e.text())
        }
      },
      async onmessage(e) {
        try {
          const chunk = JSON.parse(e.data)
          result += chunk.answer || ''
          result = result.replace(/<think>[\s\S]*?<\/think>/g, '')
          item.raw = result
          item.content = marked.parse(result)
          state.chatBoxRef.scrollTo({
            top: state.chatBoxRef.scrollHeight,
            behavior: 'smooth',
          })
        } catch (e) {}
      },
      onerror(err) {
        console.error(err)
        ctrl.abort()
      },
      onclose() {
        console.log('🔚 SSE closed')
      },
    })
  }

  const handleKeydown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const submit = async () => {
    if (data.state.input.trim() === '') {
      return
    }

    let base = localStorage.getItem('base')
    let url = `${base}/api/upload`

    const formData = new FormData()
    data.state.files.forEach(file => {
      formData.append('files', file)
    })
    const res = await http.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    data.state.upfiles = res.data.data

    state.messages.push({
      pos: 'right',
      content: data.state.input,
      raw: data.state.input,
      files: data.state.upfiles,
    })
    const msg = reactive({
      pos: 'left',
      content: '',
      raw: '',
    })
    state.messages.push(msg)

    let result = ''
    base = localStorage.getItem('base')
    url = `${base}/api/chat`
    const ctrl = new AbortController()
    await fetchEventSource(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: data.state.input, type: 'ocr', upfiles: data.state.upfiles }),
      signal: ctrl.signal,
      async onopen(e) {
        if (e.ok) {
          data.state.input = ''
          console.log('✅ SSE opened')
        } else {
          throw new Error(await e.text())
        }
      },
      async onmessage(e) {
        try {
          const chunk = JSON.parse(e.data)
          result += chunk.answer || ''
          result = result.replace(/<think>[\s\S]*?<\/think>/g, '')
          msg.raw = result
          msg.content = marked.parse(result)
          state.chatBoxRef.scrollTo({
            top: state.chatBoxRef.scrollHeight,
            behavior: 'smooth',
          })
        } catch (e) {}
      },
      onerror(err) {
        console.error(err)
        ctrl.abort()
      },
      onclose() {
        console.log('🔚 SSE closed')
      },
    })
  }
</script>

<style lang="scss" scoped>
  .img-box {
    app-region: no-drag;
    margin-top: 7.5px;
    padding: 0 10px;
    display: flex;
    .img {
      width: 45px;
      height: 50px;
      background: #d9d9d9;
      margin-left: 18px;
      position: relative;
      &:first-child {
        margin-left: 0;
      }
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .close {
        width: 7px;
        height: 7px;
        background: url('@renderer/assets/images/chat-img-close.png') no-repeat center center / 100%
          100%;
        position: absolute;
        top: -3.5px;
        right: -10px;
        cursor: pointer;
      }
    }
  }

  .has-img {
    .chat-box {
      height: 275px !important;
    }
    .input-box {
      margin-top: 7px !important;
    }
  }

  .box {
    width: 660px;
    height: 485px;
    background: rgba(31, 29, 39, 0.5);
    border-radius: 15px;
    padding: 37px 10px 10px;
    position: relative;
    .win-btns {
      app-region: no-drag;
      position: absolute;
      top: 3px;
      right: 5px;
      display: flex;
      .btn {
        width: 30px;
        height: 30px;
        cursor: pointer;
      }
      .btn-clear {
        background: url('@renderer/assets/images/chat-clear.png') no-repeat center center / 100%
          100%;
        &:hover {
          background: url('@renderer/assets/images/chat-clear-hover.png') no-repeat center center /
            100% 100%;
        }
      }
      .btn-min {
        background: url('@renderer/assets/images/chat-min.png') no-repeat center center / 100% 100%;
        &:hover {
          background: url('@renderer/assets/images/chat-min-hover.png') no-repeat center center /
            100% 100%;
        }
      }
      .btn-close {
        background: url('@renderer/assets/images/chat-close.png') no-repeat center center / 100%
          100%;
        &:hover {
          background: url('@renderer/assets/images/chat-close-hover.png') no-repeat center center /
            100% 100%;
        }
      }
    }
  }

  .chat-box {
    app-region: no-drag;
    height: 328px;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 15px;
    padding: 10px;
    overflow: auto;
    &::-webkit-scrollbar-thumb {
      background: #bfbfbf;
    }
    &::-webkit-scrollbar {
      width: 5px;
      background: rgba(0, 0, 0, 0);
    }
    .item {
      display: flex;
      margin-top: 15px;
      &:first-child {
        margin-top: 0;
      }
      &.left {
        justify-content: flex-start;
        .btns {
          justify-content: flex-end;
          .btn {
            margin-right: 5px;
          }
        }
      }
      &.right {
        justify-content: flex-end;
        .btns {
          justify-content: flex-start;
          .btn {
            margin-left: 5px;
          }
        }
      }
      .content {
        width: 330px;
        .imgs {
          background: #d9d9d9;
          height: 30px;
          border-radius: 10px;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          padding: 0 5px;
          .img {
            width: 23px;
            height: 24px;
            background: url('@renderer/assets/images/chat-img.png') no-repeat center center / 100%
              100%;
            margin-left: 10px;
            &:first-child {
              margin-left: 0;
            }
          }
        }
        .message {
          font-size: 14px;
          padding: 10px 10px;
          background: rgba(31, 29, 39, 0.8);
          border-radius: 15px;
          color: #ffffff;
          line-height: 1.5;
          word-break: break-all;
          * {
            word-break: break-all;
          }
        }
        .btns {
          display: flex;
          margin-top: 5px;
          .btn {
            width: 20px;
            height: 20px;
            cursor: pointer;
          }
          .btn-re {
            background: url('@renderer/assets/images/chat-re.png') no-repeat center center / 100%
              100%;
            &:hover {
              background: url('@renderer/assets/images/chat-re-hover.png') no-repeat center center /
                100% 100%;
            }
          }
          .btn-copy {
            background: url('@renderer/assets/images/chat-copy.png') no-repeat center center / 100%
              100%;
            &:hover {
              background: url('@renderer/assets/images/chat-copy-hover.png') no-repeat center
                center / 100% 100%;
            }
          }
          .btn-play {
            background: url('@renderer/assets/images/chat-play.png') no-repeat center center / 100%
              100%;
            &:hover {
              background: url('@renderer/assets/images/chat-play-hover.png') no-repeat center
                center / 100% 100%;
            }
          }
        }
      }
    }
  }

  .input-box {
    app-region: no-drag;
    height: 100px;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 15px;
    margin-top: 10px;
    .input {
      width: 100%;
      height: 60px;
      background: transparent;
      border: none;
      outline: none;
      resize: none;
      box-sizing: border-box;
      color: #ffffff;
      font-size: 14px;
      margin: 5px 0;
      padding: 0 10px;
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
      justify-content: flex-end;
      margin-right: 10px;
      .file {
        width: 0;
        height: 0;
        opacity: 0;
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
        &:hover,
        &.active {
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

  .dialog-clear {
    width: 200px;
    height: 100px;
    background: #ffffff;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    .text {
      word-break: keep-all;
      font-size: 14px;
      color: #000000;
      position: absolute;
      top: 30px;
      left: 50%;
      transform: translateX(-50%);
    }
    .btns {
      width: 160px;
      display: flex;
      justify-content: space-between;
      position: absolute;
      top: 60px;
      left: 50%;
      transform: translateX(-50%);
      .btn {
        background: #d9d9d9;
        color: #000000;
        border-radius: 10px;
        padding: 5px 10px;
        font-size: 14px;
        cursor: pointer;
        &:hover {
          background: #5b5b5b;
          color: #ffffff;
        }
      }
    }
  }
</style>
