import Recorder from 'js-audio-recorder'
import { useAxios } from './useAxios'

const http = useAxios()

const recorder = new Recorder({
  sampleBits: 16,
  sampleRate: 16000,
  numChannels: 1,
})

export const useRecorder = () => {
  return {
    async start(success = () => {}, error = e => {}) {
      try {
        await recorder.start()
        success()
        console.log('录音开始')
      } catch (e) {
        error(e)
        console.log('录音开始失败', e)
      }
    },
    pause(success = () => {}) {
      recorder.pause()
      success()
      console.log('录音暂停')
    },
    resume(success = () => {}) {
      recorder.resume()
      success()
      console.log('录音继续')
    },
    stop(success = () => {}) {
      recorder.stop()
      success()
      console.log('录音停止')
    },
    getWAVBlob() {
      return recorder.getWAVBlob()
    },
    async getResult(audio = null) {
      let file = null
      if (audio) {
        file = audio
      } else {
        const blob = this.getWAVBlob()
        file = new File([blob], 'audio.wav')
      }
      const formData = new FormData()
      formData.append('file', file)
      const http = useAxios()
      const res = await http.post('/api/asr', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return res.data
    },
    async getPermission(success = () => {}, error = e => {}) {
      try {
        await Recorder.getPermission()
        success()
        console.log('录音权限获取成功')
      } catch (e) {
        error(e)
        console.log('录音权限获取失败', e)
      }
    },
  }
}
