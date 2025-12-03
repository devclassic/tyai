<template>
  <div class="box">
    <div class="header">
      <div class="title">灵犀板</div>
      <div @click="close" class="close"></div>
    </div>
    <div class="main">
      <div @click="toggleMulti" class="multi" :class="{ active: state.isMulti }">多选</div>
      <div class="content">
        <template v-for="item in state.history">
          <div
            v-if="item.type === 'text'"
            @click="checkItem(item)"
            class="item"
            :class="{ active: item.check }">
            <div class="close" @click="removeItem(item.id)"></div>
            <div class="text" :title="item.payload">{{ item.payload }}</div>
            <div class="date">{{ format(item.ts, 'yyyy-MM-dd HH:mm:ss') }}</div>
          </div>
          <div
            v-if="item.type === 'image'"
            @click="checkItem(item)"
            class="item"
            :class="{ active: item.check }">
            <div class="close" @click="removeItem(item.id)"></div>
            <div class="image">
              <img :src="item.data" />
            </div>
            <div class="date">{{ format(item.ts, 'yyyy-MM-dd HH:mm:ss') }}</div>
          </div>
        </template>
      </div>
      <div class="btns">
        <div @click="toDoc" class="btn btn-doc">生成文档</div>
        <div @click="state.showClear = true" class="btn btn-clear">清空记录</div>
        <div @click="toPortable" class="btn btn-ai">导入AI</div>
      </div>
    </div>
    <div class="footer"></div>
  </div>

  <div v-if="state.showClear" class="dialog-clear">
    <div class="text">是否清空灵犀板全部内容</div>
    <div class="btns">
      <div @click="clear" class="btn">清空</div>
      <div @click="state.showClear = false" class="btn">取消</div>
    </div>
  </div>
</template>

<script setup>
  import { reactive } from 'vue'
  import { format } from 'date-fns'

  const state = reactive({
    history: [],
    isMulti: false,
    showClear: false,
  })

  const getHistory = async () => {
    state.history = await electron.ipcRenderer.invoke('get-history')
    state.history.forEach(async item => {
      if (item.type === 'image') {
        item.data = await electron.ipcRenderer.invoke('read-local-image', item.payload)
      }
    })
  }
  getHistory()

  electron.ipcRenderer.on('new-clip', async (e, item) => {
    if (item.type === 'image') {
      item.data = await electron.ipcRenderer.invoke('read-local-image', item.payload)
    }
    state.history.unshift(item)
  })

  const close = () => {
    electron.ipcRenderer.send('close')
  }

  const removeItem = async id => {
    electron.ipcRenderer.send('remove-history', id)
    getHistory()
  }

  const clear = () => {
    electron.ipcRenderer.send('clear-history')
    getHistory()
    state.showClear = false
  }

  const checkItem = item => {
    if (state.isMulti) {
      item.check = !item.check
    } else {
      state.history.forEach(item => {
        item.check = false
      })
      item.check = true
    }
  }

  const toggleMulti = () => {
    state.isMulti = !state.isMulti
    if (!state.isMulti) {
      state.history.forEach(item => {
        item.check = false
      })
    }
  }

  const toDoc = () => {
    document.title = '灵犀板'
    const items = state.history.filter(item => item.check)
    if (items.length === 0) {
      electron.ipcRenderer.send('show-alert', {
        title: '灵犀板',
        message: '请选择要生成文档的内容',
      })
      return
    } else if (items.length > 1) {
      electron.ipcRenderer.send('show-alert', {
        title: '灵犀板',
        message: '只能选择单个内容生成文档',
      })
      return
    } else if (items[0].type !== 'image') {
      electron.ipcRenderer.send('show-alert', {
        title: '灵犀板',
        message: '只能选择图片类型生成文档',
      })
      return
    }
    const item = items[0]
  }

  const toPortable = () => {
    const history = state.history.filter(item => item.check)
    if (history.length === 0) {
      electron.ipcRenderer.send('show-alert', {
        title: '灵犀板',
        message: '请选择要导入AI的内容',
      })
      return
    }
    const json = JSON.stringify(history)
    electron.ipcRenderer.send('to-portable', json)
  }
</script>

<style lang="scss" scoped>
  .box {
    width: 380px;
    height: 600px;
    background: rgba(31, 29, 39, 0.2);
    position: relative;
  }

  .header {
    width: 100%;
    height: 30px;
    background: rgba(31, 29, 39, 0.5);
    position: relative;
    .title {
      font-size: 14px;
      color: #ffffff;
      position: absolute;
      top: 50%;
      left: 15px;
      transform: translateY(-50%);
    }
    .close {
      width: 30px;
      height: 30px;
      background: url('@renderer/assets/images/clip-close.png') no-repeat center center / 100% 100%;
      position: absolute;
      top: 0;
      right: 0;
      cursor: pointer;
      app-region: no-drag;
      &:hover {
        background: url('@renderer/assets/images/clip-close-hover.png') no-repeat center center /
          100% 100%;
      }
    }
  }

  .main {
    width: calc(100% - 50px);
    height: calc(100% - 30px - 25px);
    position: absolute;
    top: 30px;
    left: 50%;
    bottom: 25px;
    transform: translateX(-50%);
    app-region: no-drag;
    .multi {
      height: 35px;
      line-height: 35px;
      color: #ffffff;
      background: rgba(31, 29, 39, 0.5);
      font-size: 14px;
      text-align: center;
      margin-top: 10px;
      border-radius: 10px;
      cursor: pointer;
      app-region: no-drag;
      &.active {
        background: rgba(255, 255, 255, 0.8);
        color: #000000;
      }
    }
    .content {
      height: calc(100% - 35px - 20px - 60px);
      margin-top: 10px;
      overflow: auto;
      &::-webkit-scrollbar-thumb {
        background: #bfbfbf;
      }
      &::-webkit-scrollbar {
        width: 5px;
        background: rgba(0, 0, 0, 0);
      }
      .item {
        height: 125px;
        border-radius: 10px;
        padding: 0 15px;
        background: rgba(31, 29, 39, 0.8);
        display: flex;
        justify-content: center;
        margin-top: 25px;
        cursor: pointer;
        position: relative;
        &:first-child {
          margin-top: 0;
        }
        &.active {
          background: rgba(255, 255, 255, 0.8);
          .text {
            color: #000000;
          }
          .image {
            border: 1px solid #ffffff;
          }
          .date {
            color: #000000;
          }
        }
        .close {
          width: 10px;
          height: 10px;
          background: url('@renderer/assets/images/clip-item-close.png') no-repeat center center /
            100% 100%;
          position: absolute;
          top: 8px;
          right: 8px;
          cursor: pointer;
        }
        .text {
          width: 100%;
          margin-top: 15px;
          line-height: 1.5;
          font-size: 14px;
          --line-height: calc(14px * 1.5); /* 18.2px */
          --lines: 4;
          max-height: calc(var(--line-height) * var(--lines));
          color: #ffffff;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: var(--lines);
          overflow: hidden;
          word-break: break-word;
          overflow-wrap: anywhere;
          * {
            word-break: break-word;
            overflow-wrap: anywhere;
          }
        }
        .image {
          margin-top: 15px;
          width: 160px;
          height: 90px;
          border: 1px solid #000000;
          transform: translateX(-43%);
          display: flex;
          justify-content: center;
          align-items: center;
          img {
            max-width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
        .date {
          font-size: 12px;
          color: #ffffff;
          position: absolute;
          right: 20px;
          bottom: 5px;
        }
      }
    }

    .btns {
      height: 60px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .btn {
        width: 80px;
        height: 35px;
        line-height: 35px;
        text-align: center;
        border-radius: 10px;
        cursor: pointer;
        font-size: 14px;
        color: #ffffff;
        background: rgba(31, 29, 39, 0.5);
        &:hover {
          background: rgba(255, 255, 255, 0.5);
          color: #000000;
        }
      }

      .btn-ai {
        width: 150px;
      }
    }
  }

  .footer {
    width: 100%;
    height: 25px;
    background: rgba(31, 29, 39, 0.5);
    position: absolute;
    bottom: 0;
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
