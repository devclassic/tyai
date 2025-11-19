<template>
  <div class="page">
    <div class="header">
      <div class="title">{{ settingsStore.title }}</div>
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
        <div class="title">表单填写</div>
        <div class="status">优化中...</div>
      </div>
      <div class="form-title">基本信息</div>
      <div class="form">
        <div class="item">
          <div class="label">姓名</div>
          <div class="input">
            <input type="text" />
          </div>
          <div class="check active"></div>
        </div>
        <div class="item">
          <div class="label">性别</div>
          <div class="input">
            <input type="text" />
          </div>
          <div class="check active"></div>
        </div>
        <div class="item">
          <div class="label">年龄</div>
          <div class="input">
            <input type="text" />
          </div>
          <div class="check active"></div>
        </div>
        <div class="item">
          <div class="label">电话</div>
          <div class="input">
            <input type="text" />
          </div>
          <div class="check active"></div>
        </div>
        <div class="item">
          <div class="label">邮政编码</div>
          <div class="input">
            <input type="text" />
          </div>
          <div class="check active"></div>
        </div>
        <div class="item">
          <div class="label">邮箱</div>
          <div class="input">
            <input type="text" />
          </div>
          <div class="check active"></div>
        </div>
        <div class="item">
          <div class="label">婚姻状况</div>
          <div class="input">
            <input type="text" />
          </div>
          <div class="check active"></div>
        </div>
        <div class="item multi">
          <div class="label">地址</div>
          <div class="input">
            <textarea></textarea>
          </div>
          <div class="check"></div>
        </div>
        <div class="item multi">
          <div class="label">详细信息</div>
          <div class="input">
            <textarea></textarea>
          </div>
          <div class="check"></div>
        </div>
      </div>
      <div class="btns">
        <div class="btn btn-record"></div>
        <div class="btn btn-opt"></div>
        <div class="btn btn-upload"></div>
        <div @click="handleDownload" class="btn btn-download"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { reactive, computed } from 'vue'
  import { useSettingsStore } from '../../stores'

  const state = reactive({
    showMneu: false,
  })

  const settingsStore = useSettingsStore()

  const headerHeight = computed(() => {
    return state.showMneu ? '160px' : '100px'
  })

  const contentHeight = computed(() => {
    return state.showMneu ? '545px' : '605px'
  })

  const formHeight = computed(() => {
    return state.showMneu ? '390px' : '450px'
  })

  const handleDownload = () => {
    electron.ipcRenderer.send('download', 'https://www.baidu.com')
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
    app-region: no-drag;
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
    .form-title {
      color: #000000;
      font-size: 24px;
      padding: 20px 0;
      text-align: center;
    }
    .form {
      height: v-bind(formHeight);
      overflow: auto;
      .item {
        display: flex;
        align-items: center;
        &.multi {
          align-items: flex-start;
        }
        margin-bottom: 10px;
        .label {
          width: 100px;
          text-align: right;
          color: #222222;
          font-size: 14px;
        }
        .input {
          margin-left: 10px;
        }
        .input input {
          width: 890px;
          height: 30px;
          line-height: 30px;
          border: 1px solid #555555;
          outline: none;
          font-size: 12px;
          color: #79747e;
          padding: 0 10px;
          border-radius: 5px;
        }
        .input textarea {
          width: 890px;
          height: 95px;
          border: 1px solid #555555;
          outline: none;
          font-size: 12px;
          color: #79747e;
          padding: 10px;
          border-radius: 5px;
        }
        .check {
          width: 31px;
          height: 31px;
          margin-left: 10px;
          border: 1px solid #555555;
          border-radius: 5px;
          cursor: pointer;
          &.active {
            background: #6750a4;
          }
        }
      }
    }
    .btns {
      display: flex;
      justify-content: end;
      margin-top: 10px;
      .btn {
        width: 76px;
        height: 27px;
        margin-left: 10px;
        cursor: pointer;
      }
      .btn-record {
        background: url('../../assets/images/form-btn-record.png') no-repeat center center / 100%
          100%;
      }
      .btn-record:hover {
        background: url('../../assets/images/form-btn-record-hover.png') no-repeat center center /
          100% 100%;
      }
      .btn-opt {
        background: url('../../assets/images/form-btn-opt.png') no-repeat center center / 100% 100%;
      }
      .btn-opt:hover {
        background: url('../../assets/images/form-btn-opt-hover.png') no-repeat center center / 100%
          100%;
      }
      .btn-upload {
        background: url('../../assets/images/form-btn-upload.png') no-repeat center center / 100%
          100%;
      }
      .btn-upload:hover {
        background: url('../../assets/images/form-btn-upload-hover.png') no-repeat center center /
          100% 100%;
      }
      .btn-download {
        background: url('../../assets/images/form-btn-download.png') no-repeat center center / 100%
          100%;
      }
      .btn-download:hover {
        background: url('../../assets/images/form-btn-download-hover.png') no-repeat center center /
          100% 100%;
      }
    }
  }
</style>
