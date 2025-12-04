<template>
  <div class="box" :class="{ 'has-img': hasImgs }">
    <div class="win-btns">
      <div @click="state.showClear = true" class="btn btn-clear"></div>
      <div @click="minimize" class="btn btn-min"></div>
      <div @click="close" class="btn btn-close"></div>
    </div>
    <div class="chat-box">
      <div class="item left">
        <div class="content">
          <div class="message">
            测试内容测试内容测试内容测试内容测试内容测试内容测试内容测试内容测试内容测试内容
            测试内容测试内容测试内容测试内容测试内容测试内容测试内容测试内容测试内容测试内容
            测试内容测试内容测试内容测试内容测试内容测试内容测试内容测试内容测试内容测试内容
          </div>
          <div class="btns">
            <div class="btn btn-re"></div>
            <div class="btn btn-copy"></div>
            <div class="btn btn-play"></div>
          </div>
        </div>
      </div>
      <div class="item right">
        <div class="content">
          <div class="imgs">
            <div class="img"></div>
            <div class="img"></div>
            <div class="img"></div>
            <div class="img"></div>
            <div class="img"></div>
            <div class="img"></div>
            <div class="img"></div>
            <div class="img"></div>
            <div class="img"></div>
            <div class="img"></div>
          </div>
          <div class="message">
            测试内容测试内容测试内容测试内容测试内容测试内容测试内容测试内容测试内容测试内容
            测试内容测试内容测试内容测试内容测试内容测试内容测试内容测试内容测试内容测试内容
            测试内容测试内容测试内容测试内容测试内容测试内容测试内容测试内容测试内容测试内容
          </div>
          <div class="btns">
            <div class="btn btn-copy"></div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="hasImgs" class="img-box">
      <div class="img">
        <div class="close"></div>
      </div>
      <div class="img">
        <div class="close"></div>
      </div>
      <div class="img">
        <div class="close"></div>
      </div>
      <div class="img">
        <div class="close"></div>
      </div>
      <div class="img">
        <div class="close"></div>
      </div>
      <div class="img">
        <div class="close"></div>
      </div>
      <div class="img">
        <div class="close"></div>
      </div>
      <div class="img">
        <div class="close"></div>
      </div>
      <div class="img">
        <div class="close"></div>
      </div>
      <div class="img">
        <div class="close"></div>
      </div>
    </div>
    <div class="input-box">
      <textarea spellcheck="false" class="input"></textarea>
      <div class="btns">
        <div class="icon icon-speech"></div>
        <div class="icon icon-upload"></div>
        <div class="icon icon-send"></div>
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
  import { computed, reactive } from 'vue'
  import { useDataStore } from '@renderer/stores/portable/data'

  const state = reactive({
    showClear: false,
  })

  const data = useDataStore()

  const hasImgs = computed(() => data.state.imgs.length > 0)

  const minimize = () => {
    electron.ipcRenderer.send('minimize')
  }

  const close = () => {
    electron.ipcRenderer.send('close')
  }

  const clear = () => {}
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
          padding: 10px;
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
