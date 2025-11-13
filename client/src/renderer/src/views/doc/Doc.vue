<template>
  <div class="page">
    <div class="header">
      <div class="title">端点科技</div>
      <div @click="state.showMneu = !state.showMneu" class="btn-type"></div>
      <div class="btn-custom"></div>
      <div class="btn-refresh"></div>
      <div v-show="state.showMneu" class="menu">
        <div class="menu-box">
          <div class="item">
            <div class="icon"></div>
            <div class="text">政策法规智能咨询</div>
          </div>
          <div class="item">
            <div class="icon"></div>
            <div class="text">政策法规智能咨询</div>
          </div>
          <div class="item">
            <div class="icon"></div>
            <div class="text">政策法规智能咨询</div>
          </div>
          <div class="item">
            <div class="icon"></div>
            <div class="text">政策法规智能咨询</div>
          </div>
          <div class="item">
            <div class="icon"></div>
            <div class="text">政策法规智能咨询</div>
          </div>
        </div>
      </div>
    </div>
    <div class="content">
      <div class="content-header">
        <div class="title">智能公文</div>
        <div class="status">生成对话...</div>
      </div>
      <div class="chat-box">
        <div class="item left">
          <div class="avatar"></div>
          <div class="right">
            <div class="text">今天有什么可以帮到你的？</div>
            <div class="tool-box">
              <div class="tool tool1"></div>
              <div class="tool tool2"></div>
              <div class="tool tool3"></div>
            </div>
          </div>
        </div>
        <div class="item right">
          <div class="msg">
            <div class="text">今天有什么可以帮到你的？</div>
            <div class="tool-box">
              <div class="tool tool2"></div>
            </div>
          </div>
        </div>
        <div class="item left">
          <div class="avatar"></div>
          <div class="right">
            <div class="text">今天有什么可以帮到你的？</div>
            <div class="tool-box">
              <div class="tool tool1"></div>
              <div class="tool tool2"></div>
              <div class="tool tool3"></div>
            </div>
          </div>
        </div>
        <div class="item right">
          <div class="msg">
            <div class="text">今天有什么可以帮到你的？</div>
            <div class="tool-box">
              <div class="tool tool2"></div>
            </div>
          </div>
        </div>
        <div class="item left">
          <div class="avatar"></div>
          <div class="right">
            <div class="text">今天有什么可以帮到你的？</div>
            <div class="tool-box">
              <div class="tool tool1"></div>
              <div class="tool tool2"></div>
              <div class="tool tool3"></div>
            </div>
          </div>
        </div>
        <div class="item right">
          <div class="msg">
            <div class="text">今天有什么可以帮到你的？</div>
            <div class="tool-box">
              <div class="tool tool2"></div>
            </div>
          </div>
        </div>
        <div class="item left">
          <div class="avatar"></div>
          <div class="right">
            <div class="text">今天有什么可以帮到你的？</div>
            <div class="tool-box">
              <div class="tool tool1"></div>
              <div class="tool tool2"></div>
              <div class="tool tool3"></div>
            </div>
          </div>
        </div>
        <div class="item right">
          <div class="msg">
            <div class="text">今天有什么可以帮到你的？</div>
            <div class="tool-box">
              <div class="tool tool2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="input-box">
      <textarea
        ref="textarea"
        v-model="input"
        spellcheck="false"
        placeholder="请输入提示词"
        class="input"></textarea>
      <div class="btn-box">
        <div class="btn btn-speech"></div>
        <div class="btn btn-clean"></div>
        <div class="btn btn-send"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { reactive, computed } from 'vue'
  import { useTextareaAutosize } from '@vueuse/core'

  const state = reactive({
    showMneu: false,
  })

  const headerHeight = computed(() => {
    return state.showMneu ? '160px' : '100px'
  })

  const contentHeight = computed(() => {
    return state.showMneu ? '430px' : '490px'
  })

  const { textarea, input } = useTextareaAutosize()
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
      line-height: 1;
      max-height: calc(1em * 10);
      border: none;
      outline: none;
      border-radius: 15px;
      padding: 0 10px;
      margin-top: 10px;
      resize: none;
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
      background: url('../../assets/images/input-btn-speech.png') no-repeat center center / 100%
        100%;
    }
    .btn-speech:hover {
      background: url('../../assets/images/input-btn-speech-hover.png') no-repeat center center /
        100% 100%;
    }
    .btn-clean {
      background: url('../../assets/images/input-btn-clean.png') no-repeat center center / 100% 100%;
    }
    .btn-clean:hover {
      background: url('../../assets/images/input-btn-clean-hover.png') no-repeat center center /
        100% 100%;
    }
    .btn-send {
      background: url('../../assets/images/input-btn-send.png') no-repeat center center / 100% 100%;
    }
    .btn-send:hover {
      background: url('../../assets/images/input-btn-send-hover.png') no-repeat center center / 100%
        100%;
    }
  }
</style>
