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
        <div class="title">OCR识别</div>
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
      <div class="left">
        <div class="header">生成对话...</div>
        <textarea spellcheck="false" placeholder="请输入提示词" class="input"></textarea>
        <div class="btns">
          <div class="btn btn-speech"></div>
          <div class="btn btn-send"></div>
        </div>
      </div>
      <div class="right">
        <div class="header">图像上传</div>
        <div class="list">
          <div class="list-box">
            <div class="item">
              <img src="../../assets/images/img.png" />
            </div>
            <div class="item">
              <img src="../../assets/images/img.png" />
            </div>
            <div class="item">
              <img src="../../assets/images/img.png" />
            </div>
            <div class="item">
              <img src="../../assets/images/img.png" />
            </div>
            <div class="item">
              <img src="../../assets/images/img.png" />
            </div>
            <div class="item">
              <img src="../../assets/images/img.png" />
            </div>
            <div class="item">
              <img src="../../assets/images/img.png" />
            </div>
            <div class="item">
              <img src="../../assets/images/img.png" />
            </div>
            <div class="item">
              <img src="../../assets/images/img.png" />
            </div>
            <div class="item">
              <img src="../../assets/images/img.png" />
            </div>
          </div>
        </div>
        <div class="btns">
          <div class="btn-upload"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { reactive, computed } from 'vue'

  const state = reactive({
    showMneu: false,
  })

  const headerHeight = computed(() => {
    return state.showMneu ? '160px' : '100px'
  })

  const contentHeight = computed(() => {
    return state.showMneu ? '350px' : '410px'
  })
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
        .btn-speech {
          background: url('../../assets/images/input-btn-speech.png') no-repeat center center / 100%
            100%;
        }
        .btn-speech:hover {
          background: url('../../assets/images/input-btn-speech-hover.png') no-repeat center
            center / 100% 100%;
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
        height: 90px;
        display: flex;
        overflow: auto;
        margin-top: 10px;
        .list-box {
          display: flex;
          .item {
            width: 70px;
            height: 70px;
            margin-right: 40px;
            position: relative;
            img {
              width: 100%;
              height: 100%;
            }
            &::after {
              content: '';
              width: 9px;
              height: 9px;
              background: url('../../assets/images/item-close.png') no-repeat center center / 100%
                100%;
              position: absolute;
              top: 0px;
              right: -13px;
              cursor: pointer;
            }
          }
        }
      }
      .btns {
        display: flex;
        justify-content: end;
        margin-top: 7px;
        .btn-upload {
          width: 87px;
          height: 30px;
          cursor: pointer;
          background: url('../../assets/images/input-btn-upimg.png') no-repeat center center / 100%
            100%;
        }
        .btn-upload:hover {
          background: url('../../assets/images/input-btn-upimg-hover.png') no-repeat center center /
            100% 100%;
        }
      }
    }
    .header {
      height: 35px;
      line-height: 35px;
      font-size: 12px;
      color: #79747e;
      border-bottom: 1px solid #9883b2;
    }
  }
</style>
