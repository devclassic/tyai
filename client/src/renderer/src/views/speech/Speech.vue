<template>
  <div class="page">
    <div class="header">
      <div class="title">端点科技</div>
      <div @click="state.showMneu = !state.showMneu" class="btn-type"></div>
      <div @click="showTypesDialog" class="btn-custom"></div>
      <div @click="refresh" class="btn-refresh"></div>
      <div v-show="state.showMneu" class="menu">
        <div class="menu-box">
          <div
            v-for="item in state.types"
            @click="changeType(item)"
            class="item"
            :class="{ active: item.id === state.currentTypeId }">
            <div class="icon"></div>
            <div class="text">{{ item.name }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="content">
      <div class="content-header">
        <div class="title">多人语音</div>
        <div class="status"></div>
      </div>
      <div ref="chatBox" class="chat-box">
        <template v-for="(item, i) in state.messages">
          <div v-if="item.pos === 'left'" class="item left">
            <div class="avatar"></div>
            <div class="right">
              <div class="text" v-html="item.content"></div>
              <div class="tool-box">
                <div @click="re(item, i)" class="tool tool1"></div>
                <div @click="copy(item.raw)" class="tool tool2"></div>
                <div @click="tts(item.raw)" class="tool tool3"></div>
              </div>
            </div>
          </div>
          <div v-else class="item right">
            <div class="msg">
              <div class="text" v-html="item.content"></div>
              <div class="tool-box">
                <div @click="copy(item.content)" class="tool tool2"></div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
    <div class="input-box">
      <div class="left">
        <div class="header">{{ state.status }}</div>
        <textarea
          v-model="state.input"
          spellcheck="false"
          placeholder="请输入提示词"
          class="input"></textarea>
        <div class="btns">
          <div class="btn btn-send"></div>
        </div>
      </div>
      <div class="right">
        <div class="header">
          <div class="btn-rename"></div>
        </div>
        <div class="list">
          <div class="item">
            <span>说话人0：</span>
            你好？
          </div>
          <div class="item">
            <span>说话人0：</span>
            你是谁，怎么回事？
          </div>
          <div class="item">
            <span>说话人0：</span>
            我日你哥！
          </div>
          <div class="item">
            <span>说话人0：</span>
            你好？
          </div>
          <div class="item">
            <span>说话人0：</span>
            你是谁，怎么回事？
          </div>
          <div class="item">
            <span>说话人0：</span>
            我日你哥！
          </div>
          <div class="item">
            <span>说话人0：</span>
            你好？
          </div>
          <div class="item">
            <span>说话人0：</span>
            你是谁，怎么回事？
          </div>
          <div class="item">
            <span>说话人0：</span>
            我日你哥！
          </div>
        </div>
        <div class="btns">
          <div class="btn btn-upload"></div>
          <div class="btn btn-record"></div>
          <div class="btn btn-pause"></div>
          <div class="btn btn-recover"></div>
          <div class="btn btn-complete"></div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="state.showTypeList" class="dialog-types">
    <div class="type-header">
      <div class="type-title">自定义生成类型</div>
      <div @click="showAddTypeDialog" class="type-btn-add"></div>
    </div>
    <div class="type-content">
      <table class="table">
        <tbody>
          <tr class="table-header">
            <td>类型名称</td>
            <td>操作</td>
          </tr>
          <tr v-for="item in state.types">
            <td>{{ item.name }}</td>
            <td>
              <div class="table-action">
                <div @click="showEditTypeDialog(item.id)" class="btn">修改</div>
                <div @click="handleTypeDelete(item.id)" class="btn">删除</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="type-footer">
      <div @click="hideTypesDialog" class="type-btn-cancel"></div>
      <div @click="hideTypesDialog" class="type-btn-ok"></div>
    </div>
  </div>
  <div v-if="state.showTypeEdit" class="dialog-type">
    <div class="type-header">
      <div class="type-title">编辑类型</div>
    </div>
    <div class="item">
      <div class="label">名称</div>
      <input v-model="state.type.name" type="text" />
    </div>
    <div class="item">
      <div class="label">内容</div>
      <textarea v-model="state.type.query"></textarea>
    </div>
    <div class="type-footer">
      <div @click="hideTypeEditDialog" class="type-btn-cancel"></div>
      <div @click="handleTypeOk" class="type-btn-ok"></div>
    </div>
  </div>
</template>

<script setup>
  import { reactive, computed, useTemplateRef } from 'vue'
  import { fetchEventSource } from '@microsoft/fetch-event-source'
  import { marked } from 'marked'
  import { ElMessage } from 'element-plus'
  import { useAxios } from '../../hooks/useAxios'
  import { useRecorder } from '../../hooks/useRecorder'

  const state = reactive({
    showMneu: false,
    id: '',
    action: '',
    showMneu: false,
    showTypeList: false,
    showTypeEdit: false,
    types: [],
    type: {
      name: '',
      query: '',
    },
    status: '',
    input: '',
    currentTypeId: '',
    messages: [],
    chatBoxRef: useTemplateRef('chatBox'),
  })

  const http = useAxios()
  const recorder = useRecorder()

  const getTypes = async () => {
    const res = await http.post('/api/types/all', { type: 'speech' })
    state.types = res.data.data
  }
  getTypes()

  const changeType = item => {
    state.input = item.query
    state.currentTypeId = item.id
  }

  const headerHeight = computed(() => {
    return state.showMneu ? '160px' : '100px'
  })

  const contentHeight = computed(() => {
    return state.showMneu ? '350px' : '410px'
  })

  const showTypesDialog = () => {
    state.showTypeList = true
  }

  const hideTypesDialog = () => {
    state.showTypeList = false
  }

  const showAddTypeDialog = () => {
    state.action = 'add'
    state.showTypeEdit = true
  }

  const showEditTypeDialog = async id => {
    state.action = 'edit'
    const res = await http.post('/api/types/get', { id })
    state.type = res.data.data
    state.id = id
    state.showTypeEdit = true
  }

  const hideTypeEditDialog = () => {
    state.showTypeEdit = false
    state.type = {
      name: '',
      key: '',
    }
  }

  const handleTypeDelete = async id => {
    await http.post('/api/types/delete', { id })
    getTypes()
  }

  const handleTypeOk = async () => {
    switch (state.action) {
      case 'add':
        await http.post('/api/types/add', {
          type: 'speech',
          name: state.type.name,
          query: state.type.query,
        })
        break
      case 'edit':
        await http.post('/api/types/update', {
          id: state.id,
          name: state.type.name,
          query: state.type.query,
        })
        break
    }
    getTypes()
    hideTypeEditDialog()
    state.type = {
      name: '',
      key: '',
    }
  }

  const tts = content => {
    const msg = new SpeechSynthesisUtterance(content)
    window.speechSynthesis.speak(msg)
  }

  const refresh = () => {
    getTypes()
    state.messages = []
    state.input = ''
    state.upfiles = []
    state.images = []
    state.files = []
  }

  const copy = content => {
    navigator.clipboard.writeText(content)
    ElMessage.success('复制成功')
  }

  let recording = false
  const asr = async () => {
    if (!recording) {
      recorder.start(
        () => {
          state.status = '正在收音...'
          ElMessage.success('正在收音...')
          recording = true
        },
        () => {
          state.status = ''
          ElMessage.error('收音失败')
          recording = false
        },
      )
    } else {
      const res = await recorder.getResult()
      state.input = res.data[0].text
      state.status = ''
      recording = false
    }
  }

  const re = async (item, index) => {
    const query = state.messages[index - 1].content
    let result = ''
    const base = localStorage.getItem('base')
    const url = `${base}/api/chat`
    const ctrl = new AbortController()
    await fetchEventSource(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query, type: 'speech' }),
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
          if (chunk.event === 'message_end') {
            state.status = ''
          } else {
            state.status = '生成中...'
          }
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
        state.status = ''
        console.log('🔚 SSE closed')
      },
    })
  }

  const clean = () => {
    state.input = ''
  }

  const handleKeydown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const submit = async () => {
    if (!state.input) return
    state.messages.push({
      pos: 'right',
      content: state.input.replace(/\n/g, '<br>'),
    })
    const msg = reactive({
      pos: 'left',
      content: '',
      raw: '',
    })
    state.messages.push(msg)

    const base = localStorage.getItem('base')
    let url = `${base}/api/upload`

    const formData = new FormData()
    state.files.forEach(file => {
      formData.append('files', file)
    })
    state.status = '文件上传中...'
    const res = await http.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    state.status = '文件上传完成...'
    state.upfiles = res.data.data

    let result = ''
    url = `${base}/api/chat`
    const ctrl = new AbortController()
    await fetchEventSource(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: state.input, type: 'speech' }),
      signal: ctrl.signal,
      async onopen(e) {
        if (e.ok) {
          state.input = ''
          state.status = '生成中...'
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
          console.log(chunk)
          if (chunk.event === 'message_end') {
            state.status = ''
          }
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
        state.status = ''
        console.log('🔚 SSE closed')
      },
    })
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
      background: url('../../assets/images/header-title.png') no-repeat center center / 100% 100%;
      position: absolute;
      top: 5px;
      left: 50%;
      transform: translateX(-50%);
    }
    .btn-type {
      width: 90px;
      height: 27px;
      background: url('../../assets/images/header-btn-type.png') no-repeat center center / 100% 100%;
      cursor: pointer;
      app-region: no-drag;
      position: absolute;
      top: 63px;
      left: 0px;
    }
    .btn-type:hover {
      background: url('../../assets/images/header-btn-type-hover.png') no-repeat center center /
        100% 100%;
    }
    .btn-custom {
      width: 69px;
      height: 27px;
      background: url('../../assets/images/header-btn-custom.png') no-repeat center center / 100%
        100%;
      cursor: pointer;
      app-region: no-drag;
      position: absolute;
      top: 63px;
      left: 100px;
    }
    .btn-custom:hover {
      background: url('../../assets/images/header-btn-custom-hover.png') no-repeat center center /
        100% 100%;
    }
    .btn-refresh {
      width: 60px;
      height: 27px;
      background: url('../../assets/images/header-btn-refresh.png') no-repeat center center / 100%
        100%;
      cursor: pointer;
      app-region: no-drag;
      position: absolute;
      top: 63px;
      right: 0px;
    }
    .btn-refresh:hover {
      background: url('../../assets/images/header-btn-refresh-hover.png') no-repeat center center /
        100% 100%;
    }
    .menu {
      width: 100%;
      height: 60px;
      overflow: auto;
      display: flex;
      app-region: no-drag;
      position: absolute;
      top: 98px;
      .menu-box {
        display: flex;
      }
      .item {
        width: 180px;
        height: 40px;
        background: #ffffff;
        font-size: 12px;
        color: #262626;
        display: flex;
        align-items: center;
        padding: 0 15px;
        margin-right: 10px;
        border-radius: 18px;
        box-shadow: 0px 5px 5px -2px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        &:hover,
        &.active {
          background: #e4d9dd;
        }
        .icon {
          width: 14px;
          height: 14px;
          background: url('../../assets/images/header-menu-icon-1.png') no-repeat center center /
            100% 100%;
        }
        .text {
          margin-left: 10px;
        }
      }
    }
  }

  .content {
    width: 100%;
    height: v-bind(contentHeight);
    border: 1px solid #e6e5e7;
    padding: 0 10px;
    background: #ffffff;
    border-radius: 15px;
    box-shadow: 0px 5px 5px -2px rgba(0, 0, 0, 0.1);
    .content-header {
      height: 40px;
      line-height: 40px;
      border-bottom: 1px solid #a39aac;
      display: flex;
      .title {
        font-size: 14px;
        color: #000000;
      }
      .status {
        font-size: 12px;
        color: #79747e;
        margin-left: 10px;
      }
    }
    .chat-box {
      overflow: auto;
      margin-top: 10px;
      height: calc(100% - 40px - 10px - 10px);
      app-region: no-drag;
      .item {
        margin-top: 10px;
      }
      .item:first-child {
        margin-top: 0px;
      }
      .item:last-child {
        margin-bottom: 10px;
      }
      .item.left {
        display: flex;
        .avatar {
          width: 44px;
          height: 44px;
          background: url('../../assets/images/avatar.png');
        }
        .right {
          margin-left: 10px;
          .text {
            user-select: text;
            width: fit-content;
            max-width: 470px;
            background: #ece6f0;
            font-size: 12px;
            color: #49454f;
            padding: 15px 10px;
            border-radius: 10px;
            box-shadow: 0px 0px 5px -2px rgba(0, 0, 0, 0.1);
          }
          .tool-box {
            display: flex;
            justify-content: end;
            margin-top: 10px;
            .tool {
              width: 17px;
              height: 17px;
              margin-right: 10px;
              cursor: pointer;
            }
            .tool1 {
              background: url('../../assets/images/msg-icon-1.png') no-repeat center center / 100%
                100%;
            }
            .tool2 {
              background: url('../../assets/images/msg-icon-2.png') no-repeat center center / 100%
                100%;
            }
            .tool3 {
              background: url('../../assets/images/msg-icon-3.png') no-repeat center center / 100%
                100%;
            }
          }
        }
      }
      .item.right {
        display: flex;
        justify-content: end;
        .text {
          user-select: text;
          width: fit-content;
          max-width: 470px;
          background: #efd2dd;
          font-size: 12px;
          color: #49454f;
          padding: 15px 10px;
          border-radius: 10px;
          box-shadow: 0px 5px 5px -2px rgba(0, 0, 0, 0.1);
        }
        .tool-box {
          display: flex;
          justify-content: end;
          margin-top: 10px;
        }
        .tool {
          width: 17px;
          height: 17px;
          margin-right: 10px;
          cursor: pointer;
        }
        .tool2 {
          background: url('../../assets/images/msg-icon-2.png') no-repeat center center / 100% 100%;
        }
      }
    }
  }

  .input-box {
    display: flex;
    justify-content: space-between;
    height: 180px;
    margin-top: 15px;
    app-region: no-drag;
    .left {
      width: 545px;
      height: 100%;
      background: #ffffff;
      border-radius: 15px;
      box-shadow: 0px 5px 5px -2px rgba(0, 0, 0, 0.1);
      padding: 0 10px;
      .input {
        width: 100%;
        height: 85px;
        margin-top: 10px;
        border: none;
        outline: none;
        resize: none;
      }
      .btns {
        display: flex;
        justify-content: end;
        margin-top: 10px;
        .btn {
          width: 65px;
          height: 30px;
          margin-right: 10px;
          cursor: pointer;
        }
        .btn-send {
          background: url('../../assets/images/input-btn-send.png') no-repeat center center / 100%
            100%;
        }
        .btn-send:hover {
          background: url('../../assets/images/input-btn-send-hover.png') no-repeat center center /
            100% 100%;
        }
      }
    }
    .right {
      width: 545px;
      height: 100%;
      background: #ffffff;
      border-radius: 15px;
      box-shadow: 0px 5px 5px -2px rgba(0, 0, 0, 0.1);
      padding: 0 10px;
      .list {
        height: 85px;
        overflow: auto;
        margin-top: 10px;
        user-select: text;
        .item {
          font-size: 14px;
          line-height: 1.5;
          color: #262626;
          span {
            color: red;
          }
        }
      }
      .btns {
        display: flex;
        justify-content: end;
        margin-top: 10px;
        .btn {
          margin-left: 10px;
        }
        .btn-upload {
          width: 77px;
          height: 30px;
          cursor: pointer;
          background: url('../../assets/images/input-btn-upaudio.png') no-repeat center center /
            100% 100%;
        }
        .btn-upload:hover {
          background: url('../../assets/images/input-btn-upaudio-hover.png') no-repeat center
            center / 100% 100%;
        }
        .btn-record {
          width: 77px;
          height: 30px;
          cursor: pointer;
          background: url('../../assets/images/input-btn-record.png') no-repeat center center / 100%
            100%;
        }
        .btn-record:hover {
          background: url('../../assets/images/input-btn-record-hover.png') no-repeat center
            center / 100% 100%;
        }
        .btn-pause {
          width: 65px;
          height: 30px;
          cursor: pointer;
          background: url('../../assets/images/input-btn-pause.png') no-repeat center center / 100%
            100%;
        }
        .btn-pause:hover {
          background: url('../../assets/images/input-btn-pause-hover.png') no-repeat center center /
            100% 100%;
        }
        .btn-recover {
          width: 65px;
          height: 30px;
          cursor: pointer;
          background: url('../../assets/images/input-btn-recover.png') no-repeat center center /
            100% 100%;
        }
        .btn-recover:hover {
          background: url('../../assets/images/input-btn-recover-hover.png') no-repeat center
            center / 100% 100%;
        }
        .btn-complete {
          width: 65px;
          height: 30px;
          cursor: pointer;
          background: url('../../assets/images/input-btn-complete.png') no-repeat center center /
            100% 100%;
        }
        .btn-complete:hover {
          background: url('../../assets/images/input-btn-complete-hover.png') no-repeat center
            center / 100% 100%;
        }
      }
    }
    .header {
      height: 35px;
      font-size: 12px;
      color: #79747e;
      border-bottom: 1px solid #9883b2;
      display: flex;
      align-items: center;
      .btn-rename {
        width: 67px;
        height: 22px;
        background: url('../../assets/images/input-btn-rename.png') no-repeat center center / 100%
          100%;
        cursor: pointer;
      }
      .btn-rename:hover {
        background: url('../../assets/images/input-btn-rename-hover.png') no-repeat center center /
          100% 100%;
      }
    }
  }

  .dialog-types {
    width: 530px;
    height: 270px;
    background: #ffffff;
    border: 1px solid #7f7f7f;
    border-radius: 10px;
    box-shadow: 0px 5px 5px -2px #7f7f7f;
    padding: 0px 20px;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    .type-header {
      height: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .type-title {
        font-size: 16px;
        color: #4a4459;
      }
      .type-btn-add {
        width: 65px;
        height: 30px;
        background: url('../../assets/images/btn-add-type.png') no-repeat center center / 100% 100%;
        cursor: pointer;
      }
      .type-btn-add:hover {
        background: url('../../assets/images/btn-add-type-hover.png') no-repeat center center / 100%
          100%;
      }
    }
    .type-content {
      height: 190px;
      overflow: auto;
      .table {
        border-collapse: collapse;
        width: 100%;
        .table-header {
          td {
            height: 40px;
            color: #000000;
            font-weight: bold;
          }
        }
        td {
          border: 1px solid #555555;
          height: 40px;
          text-align: center;
          font-size: 14px;
          color: #8a858e;
          user-select: text;
          .table-action {
            display: flex;
            justify-content: center;
            align-items: center;
            .btn {
              width: 50%;
              height: 40px;
              line-height: 40px;
              text-align: center;
              background: #c9bbd8;
              color: #000000;
              font-size: 12px;
              cursor: pointer;
            }
            .btn:hover {
              background: #6750a4;
              color: #ffffff;
            }
          }
        }
      }
    }
    .type-footer {
      display: flex;
      justify-content: end;
      align-items: center;
      margin-top: 5px;
      .type-btn-cancel {
        width: 65px;
        height: 30px;
        background: url('../../assets/images/btn-cancel.png') no-repeat center center / 100% 100%;
        cursor: pointer;
      }
      .type-btn-cancel:hover {
        background: url('../../assets/images/btn-cancel-hover.png') no-repeat center center / 100%
          100%;
      }
      .type-btn-ok {
        width: 65px;
        height: 30px;
        background: url('../../assets/images/btn-ok.png') no-repeat center center / 100% 100%;
        cursor: pointer;
        margin-left: 10px;
      }
      .type-btn-ok:hover {
        background: url('../../assets/images/btn-ok-hover.png') no-repeat center center / 100% 100%;
      }
    }
  }

  .dialog-type {
    width: 530px;
    background: #ffffff;
    border: 1px solid #7f7f7f;
    border-radius: 10px;
    box-shadow: 0px 5px 5px -2px #7f7f7f;
    padding: 0px 20px;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    .type-header {
      height: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .type-title {
        font-size: 16px;
        color: #4a4459;
      }
    }
    .item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 10px;
      .label {
        width: 28px;
        font-size: 14px;
        color: #4a4459;
        margin-right: 10px;
      }
      input {
        flex: 1;
        height: 26px;
        border: 1px solid #555555;
        border-radius: 5px;
        outline: none;
      }
      textarea {
        flex: 1;
        height: 115px;
        border: 1px solid #555555;
        border-radius: 5px;
        outline: none;
      }
    }
    .type-footer {
      display: flex;
      justify-content: end;
      align-items: center;
      margin-bottom: 5px;
      .type-btn-cancel {
        width: 65px;
        height: 30px;
        background: url('../../assets/images/btn-cancel.png') no-repeat center center / 100% 100%;
        cursor: pointer;
      }
      .type-btn-cancel:hover {
        background: url('../../assets/images/btn-cancel-hover.png') no-repeat center center / 100%
          100%;
      }
      .type-btn-ok {
        width: 65px;
        height: 30px;
        background: url('../../assets/images/btn-ok.png') no-repeat center center / 100% 100%;
        cursor: pointer;
        margin-left: 10px;
      }
      .type-btn-ok:hover {
        background: url('../../assets/images/btn-ok-hover.png') no-repeat center center / 100% 100%;
      }
    }
  }
</style>
