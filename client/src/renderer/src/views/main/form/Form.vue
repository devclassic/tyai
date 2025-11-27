<template>
  <div class="page">
    <div class="header">
      <div class="title">{{ settingsStore.title }}</div>
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
        <div class="title">表单填写</div>
        <div class="status">{{ state.status }}</div>
      </div>
      <div class="form-title">
        {{ state.types.find(item => item.id === state.currentTypeId)?.name }}
      </div>
      <div class="form">
        <template v-for="item in state.formItems">
          <div v-if="item.type === 'single'" class="item">
            <div class="label">{{ item.name }}</div>
            <div class="input">
              <input v-model="item.value" type="text" />
            </div>
            <div
              @click="item.checked = !item.checked"
              class="check"
              :class="{ active: item.checked }"></div>
          </div>
          <div v-if="item.type === 'multi'" class="item multi">
            <div class="label">{{ item.name }}</div>
            <div class="input">
              <textarea v-model="item.value"></textarea>
            </div>
            <div
              @click="item.checked = !item.checked"
              class="check"
              :class="{ active: item.checked }"></div>
          </div>
        </template>
      </div>
      <div v-if="state.currentTypeId" class="btns">
        <input ref="file" @change="handleFileChange" type="file" class="file" />
        <div @click="asr" class="btn btn-record" :class="{ active: state.recording }"></div>
        <div @click="handleOpt" class="btn btn-opt"></div>
        <div @click="state.fileRef.click()" class="btn btn-upload"></div>
        <div @click="handleDownload" class="btn btn-download"></div>
      </div>
    </div>
  </div>

  <div v-if="state.showTypeList" class="dialog-types">
    <div class="type-header">
      <div class="type-title">自定义类型</div>
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
                <div @click="showFormItemDialog(item.id)" class="btn">编辑项</div>
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

  <div v-if="state.showFormItem" class="dialog-types">
    <div class="type-header">
      <div class="type-title">自定义表单项</div>
    </div>
    <div class="type-content">
      <table class="table">
        <tbody>
          <tr class="table-header">
            <td>字段名称</td>
            <td>样式</td>
          </tr>
          <tr v-for="(item, i) in state.formItems">
            <td><input v-model="item.name" type="text" /></td>
            <td>
              <div class="table-action">
                <div
                  @click="item.type = 'single'"
                  class="btn"
                  :class="{ active: item.type === 'single' }">
                  单行
                </div>
                <div
                  @click="item.type = 'multi'"
                  class="btn"
                  :class="{ active: item.type === 'multi' }">
                  多行
                </div>
                <div @click="state.formItems.splice(i, 1)" class="btn">删除</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="type-footer">
      <div @click="handleAddFormItem" class="type-btn-add"></div>
      <div @click="hideFormItemDialog" class="type-btn-cancel"></div>
      <div @click="handleFormItemOk" class="type-btn-ok"></div>
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
    <div class="type-footer">
      <div @click="hideTypeEditDialog" class="type-btn-cancel"></div>
      <div @click="handleTypeOk" class="type-btn-ok"></div>
    </div>
  </div>
</template>

<script setup>
  import { reactive, computed, useTemplateRef } from 'vue'
  import { ElMessage } from 'element-plus'
  import { useAxios } from '@renderer/hooks/useAxios'
  import { useRecorder } from '@renderer/hooks/useRecorder'
  import { useSettingsStore } from '@renderer/stores/main/settings'

  const state = reactive({
    showMneu: false,
    status: '',
    types: [],
    currentTypeId: '',
    showTypeList: false,
    showTypeEdit: false,
    showFormItem: false,
    id: '',
    action: '',
    type: {
      name: '',
    },
    formId: '',
    formItems: [],
    items: [],
    recording: false,
    fileRef: useTemplateRef('file'),
  })

  const settingsStore = useSettingsStore()

  const http = useAxios()
  const recorder = useRecorder()

  const getTypes = async () => {
    const res = await http.post('/api/types/all', { type: 'form' })
    state.types = res.data.data
  }
  getTypes()

  const changeType = async item => {
    state.currentTypeId = item.id
    const res = await http.post('/api/form', { typeid: item.id })
    state.formItems = res.data.data
    ElMessage.success('设置成功')
  }

  const headerHeight = computed(() => {
    return state.showMneu ? '160px' : '100px'
  })

  const contentHeight = computed(() => {
    return state.showMneu ? '545px' : '605px'
  })

  const formHeight = computed(() => {
    return state.showMneu ? '390px' : '450px'
  })

  const handleText = async text => {
    let query = `
      <内容>${text}</内容>
      请你分析<内容>中内容，并提取其中的关键信息，以 JSON 的形式输出，输出的 JSON 需遵守以下的格式：
      `
    query += '{  '
    state.formItems.forEach(item => {
      query += `\n"${item.name}": "<${item.name}>",`
    })
    query.trimEnd(',')
    query += '\n}\n'
    query += `
      如果<内容>中没有相关信息，则输出空字符串。
      输出的 JSON 中，所有的字段都必须包含在 JSON 中，不能省略。
      `
    state.status = '正在处理...'
    const res = await http.post('/api/chat2', { query })
    const data = res.data.data
      .replace(/<think>[\s\S]*?<\/think>/g, '')
      .replace('```json', '')
      .replace('```', '')
    const json = JSON.parse(data)
    for (const item of state.formItems) {
      if (json[item.name]) {
        item.value = json[item.name]
      }
    }
    state.status = ''
    ElMessage.success('处理完成')
  }

  const handleFileChange = async () => {
    if (!state.fileRef.files.length) return
    const file = state.fileRef.files[0]
    state.status = '正在处理...'
    ElMessage.success('正在处理...')
    const res = await recorder.getResult(file)
    const text = res.data[0].text
    await handleText(text)
    state.fileRef.value = ''
  }

  const asr = async () => {
    if (!state.recording) {
      recorder.start(
        () => {
          state.status = '正在收音...'
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
      const text = res.data[0].text
      await handleText(text)
      state.recording = false
    }
  }

  const refresh = () => {
    getTypes()
    for (const item of state.formItems) {
      item.value = ''
      item.checked = false
    }
    ElMessage.success('刷新成功')
  }

  const handleOpt = async () => {
    state.status = '正在优化...'
    ElMessage.success('正在优化...')
    for (const item of state.formItems) {
      if (item.value && item.checked) {
        let query = `
      <内容>${item.value}</内容>
      请优化<内容>中内容，去除语气词，如果是方言请优化方言为普通话，书面化表达内容。直接输出优化后的内容，要纯文本格式，不要多余的说明。
      `
        const res = await http.post('/api/chat2', { query })
        const data = res.data.data
          .replace(/<think>[\s\S]*?<\/think>/g, '')
          .replace('```json', '')
          .replace('```', '')
        item.value = data
      }
    }
    state.status = ''
    ElMessage.success('优化完成')
  }

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
          type: 'form',
          name: state.type.name,
        })
        break
      case 'edit':
        await http.post('/api/types/update', {
          id: state.id,
          name: state.type.name,
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

  const handleAddFormItem = () => {
    state.formItems.push({
      name: '',
      type: 'single',
    })
  }

  const showFormItemDialog = async id => {
    state.formId = id
    const res = await http.post('/api/form', { typeid: id })
    state.formItems = res.data.data
    state.showFormItem = true
  }

  const handleFormItemOk = async () => {
    await http.post('/api/form/save', {
      typeid: state.formId,
      items: state.formItems,
    })
    hideFormItemDialog()
    changeType(state.types.find(item => item.id === state.formId) || {})
  }

  const hideFormItemDialog = () => {
    state.showFormItem = false
  }

  const handleDownload = async () => {
    const res = await http.post('/api/export', {
      items: state.formItems,
    })
    const base = localStorage.getItem('base')
    const url = base + res.data.data
    electron.ipcRenderer.send('download', url)
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
      background: url('@renderer/assets/images/header-title.png') no-repeat center center / 100% 100%;
      position: absolute;
      top: 5px;
      left: 50%;
      transform: translateX(-50%);
    }
    .btn-type {
      width: 90px;
      height: 27px;
      background: url('@renderer/assets/images/header-btn-type.png') no-repeat center center / 100% 100%;
      cursor: pointer;
      app-region: no-drag;
      position: absolute;
      top: 63px;
      left: 0px;
    }
    .btn-type:hover {
      background: url('@renderer/assets/images/header-btn-type-hover.png') no-repeat center center /
        100% 100%;
    }
    .btn-custom {
      width: 69px;
      height: 27px;
      background: url('@renderer/assets/images/header-btn-custom.png') no-repeat center center / 100%
        100%;
      cursor: pointer;
      app-region: no-drag;
      position: absolute;
      top: 63px;
      left: 100px;
    }
    .btn-custom:hover {
      background: url('@renderer/assets/images/header-btn-custom-hover.png') no-repeat center center /
        100% 100%;
    }
    .btn-refresh {
      width: 60px;
      height: 27px;
      background: url('@renderer/assets/images/header-btn-refresh.png') no-repeat center center / 100%
        100%;
      cursor: pointer;
      app-region: no-drag;
      position: absolute;
      top: 63px;
      right: 0px;
    }
    .btn-refresh:hover {
      background: url('@renderer/assets/images/header-btn-refresh-hover.png') no-repeat center center /
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
          background: url('@renderer/assets/images/header-menu-icon-1.png') no-repeat center center /
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
      .file {
        width: 0;
        height: 0;
        opacity: 0;
      }
      .btn {
        width: 76px;
        height: 27px;
        margin-left: 10px;
        cursor: pointer;
      }
      .btn-record {
        background: url('@renderer/assets/images/form-btn-record.png') no-repeat center center / 100%
          100%;
      }
      .btn-record:hover,
      .btn-record.active {
        background: url('@renderer/assets/images/form-btn-record-hover.png') no-repeat center center /
          100% 100%;
      }
      .btn-opt {
        background: url('@renderer/assets/images/form-btn-opt.png') no-repeat center center / 100% 100%;
      }
      .btn-opt:hover {
        background: url('@renderer/assets/images/form-btn-opt-hover.png') no-repeat center center / 100%
          100%;
      }
      .btn-upload {
        background: url('@renderer/assets/images/form-btn-upload.png') no-repeat center center / 100%
          100%;
      }
      .btn-upload:hover {
        background: url('@renderer/assets/images/form-btn-upload-hover.png') no-repeat center center /
          100% 100%;
      }
      .btn-download {
        background: url('@renderer/assets/images/form-btn-download.png') no-repeat center center / 100%
          100%;
      }
      .btn-download:hover {
        background: url('@renderer/assets/images/form-btn-download-hover.png') no-repeat center center /
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
        background: url('@renderer/assets/images/btn-add-type.png') no-repeat center center / 100% 100%;
        cursor: pointer;
      }
      .type-btn-add:hover {
        background: url('@renderer/assets/images/btn-add-type-hover.png') no-repeat center center / 100%
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
          input {
            width: 100%;
            height: 100%;
            border: none;
            outline: none;
            padding: 0 10px;
          }
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
            .btn:hover,
            .btn.active {
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
      .type-btn-add {
        width: 65px;
        height: 30px;
        background: url('@renderer/assets/images/btn-add.png') no-repeat center center / 100% 100%;
        cursor: pointer;
      }
      .type-btn-add:hover {
        background: url('@renderer/assets/images/btn-add-hover.png') no-repeat center center / 100% 100%;
      }
      .type-btn-cancel {
        width: 65px;
        height: 30px;
        margin-left: 10px;
        background: url('@renderer/assets/images/btn-cancel.png') no-repeat center center / 100% 100%;
        cursor: pointer;
      }
      .type-btn-cancel:hover {
        background: url('@renderer/assets/images/btn-cancel-hover.png') no-repeat center center / 100%
          100%;
      }
      .type-btn-ok {
        width: 65px;
        height: 30px;
        background: url('@renderer/assets/images/btn-ok.png') no-repeat center center / 100% 100%;
        cursor: pointer;
        margin-left: 10px;
      }
      .type-btn-ok:hover {
        background: url('@renderer/assets/images/btn-ok-hover.png') no-repeat center center / 100% 100%;
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
      align-items: center;
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
        background: url('@renderer/assets/images/btn-cancel.png') no-repeat center center / 100% 100%;
        cursor: pointer;
      }
      .type-btn-cancel:hover {
        background: url('@renderer/assets/images/btn-cancel-hover.png') no-repeat center center / 100%
          100%;
      }
      .type-btn-ok {
        width: 65px;
        height: 30px;
        background: url('@renderer/assets/images/btn-ok.png') no-repeat center center / 100% 100%;
        cursor: pointer;
        margin-left: 10px;
      }
      .type-btn-ok:hover {
        background: url('@renderer/assets/images/btn-ok-hover.png') no-repeat center center / 100% 100%;
      }
    }
  }
</style>
