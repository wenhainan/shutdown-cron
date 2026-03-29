<template>
  <div class="app-container">
    <!-- 自定义工具栏 -->
    <div class="title-bar">
      <div class="title">定时关机软件</div>
      <div class="title-buttons">
        <button class="title-btn minimize-btn" @click="minimizeWindow">
          <span class="btn-icon">—</span>
        </button>
        <button class="title-btn maximize-btn" @click="maximizeWindow">
          <span class="btn-icon">□</span>
        </button>
        <button class="title-btn close-btn" @click="closeWindow">
          <span class="btn-icon">×</span>
        </button>
      </div>
    </div>
    
    <div class="content">
      
    <div class="logo-container">
      <img src="/app.ico" alt="海豚定时关机" class="app-logo">
    </div>

    <div class="timer-display">
      <div class="time" v-if="remainingTime > 0">
        {{ formatTime(remainingTime) }}
      </div>
      <div class="status" v-else-if="isTimerRunning">
        正在等待关机...
      </div>
      <div class="status" v-else>
        就绪
      </div>
    </div>
    
    <div class="preset-times">
      <h3>预设时间</h3>
      <div class="button-group">
        <button @click="setPresetTime(5)" :disabled="isTimerRunning">5分钟</button>
        <button @click="setPresetTime(10)" :disabled="isTimerRunning">10分钟</button>
        <button @click="setPresetTime(30)" :disabled="isTimerRunning">30分钟</button>
        <button @click="setPresetTime(60)" :disabled="isTimerRunning">1小时</button>
      </div>
    </div>
    
    <div class="custom-time">
      <h3>自定义倒计时(分钟)</h3>
      <div class="input-group">
        <input 
          type="number" 
          v-model.number="customMinutes" 
          placeholder="输入分钟数"
          min="1"
          :disabled="isTimerRunning"
        >
        <button @click="startCustomShutdown" :disabled="isTimerRunning || !customMinutes">开始</button>
      </div>
    </div>
    
    <div class="custom-time">
      <h3>关机时刻设置</h3>
      <div class="input-group time-picker">
        <select v-model="customHour" :disabled="isTimerRunning">
          <option v-for="hour in 23" :key="hour" :value="hour">{{ hour.toString().padStart(2, '0') }}</option>
        </select>
        <span>:</span>
        <select v-model="customMinute" :disabled="isTimerRunning">
          <option v-for="minute in 59" :key="minute" :value="minute">{{ minute.toString().padStart(2, '0') }}</option>
        </select>
        <button @click="startCustomTimeShutdown" :disabled="isTimerRunning">设置</button>
      </div>
    </div>
    
    <div class="control-button">
      <button @click="cancelShutdown" :disabled="!isTimerRunning" class="cancel-btn">
        取消关机
      </button>
    </div>
    
    <div class="control-button" v-if="showExitButton">
      <button @click="exitApp" class="exit-btn">
        退出软件
      </button>
    </div>
  </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      isTimerRunning: false,
      remainingTime: 0,
      customMinutes: 0,
      customHour: new Date().getHours(),
      customMinute: new Date().getMinutes() + 1,
      countdownInterval: null,
      showExitButton: false
    }
  },
  methods: {
    async setPresetTime(minutes) {
      await this.startShutdown(minutes)
    },
    
    async startCustomShutdown() {
      if (this.customMinutes > 0) {
        await this.startShutdown(this.customMinutes)
      }
    },
    
    async startCustomTimeShutdown() {
      const now = new Date()
      const shutdownTime = new Date()
      shutdownTime.setHours(this.customHour)
      shutdownTime.setMinutes(this.customMinute)
      shutdownTime.setSeconds(0)
      
      // 如果设置的时间已经过去，则设置为明天
      if (shutdownTime <= now) {
        shutdownTime.setDate(shutdownTime.getDate() + 1)
      }
      
      const diffMs = shutdownTime - now
      const diffMinutes = Math.ceil(diffMs / (1000 * 60))
      
      await this.startShutdown(diffMinutes)
    },
    
    async startShutdown(minutes) {
      try {
        const totalSeconds = await window.electronAPI.scheduleShutdown(minutes)
        this.isTimerRunning = true
        this.remainingTime = totalSeconds
        
        // 启动倒计时
        this.countdownInterval = setInterval(() => {
          this.remainingTime--
          if (this.remainingTime <= 0) {
            clearInterval(this.countdownInterval)
            this.countdownInterval = null
          }
        }, 1000)
        
        console.log(`已设置 ${minutes} 分钟后关机`)
      } catch (error) {
        console.error('设置关机失败:', error)
      }
    },
    
    async cancelShutdown() {
      try {
        await window.electronAPI.cancelShutdown()
        this.isTimerRunning = false
        this.remainingTime = 0
        
        if (this.countdownInterval) {
          clearInterval(this.countdownInterval)
          this.countdownInterval = null
        }
        
        console.log('已取消关机')
      } catch (error) {
        console.error('取消关机失败:', error)
      }
    },
    
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    },
    
    async exitApp() {
      try {
        await window.electronAPI.exitApp()
      } catch (error) {
        console.error('退出应用失败:', error)
      }
    },
    
    async minimizeWindow() {
      try {
        await window.electronAPI.minimizeWindow()
      } catch (error) {
        console.error('最小化窗口失败:', error)
      }
    },
    
    async maximizeWindow() {
      try {
        await window.electronAPI.maximizeWindow()
      } catch (error) {
        console.error('最大化窗口失败:', error)
      }
    },
    
    async closeWindow() {
      try {
        await window.electronAPI.closeWindow()
      } catch (error) {
        console.error('关闭窗口失败:', error)
      }
    }
  },
  
  beforeUnmount() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval)
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

  .title-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 32px;
  background-color: #f0f0f0;
  color: #000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px;
  -webkit-app-region: drag;
  cursor: move;
  border-bottom: 1px solid #d0d0d0;
  box-sizing: border-box;
  z-index: 1000;
}

  .title {
  font-size: 13px;
  font-weight: 400;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin-left: 8px;
}

  .title-buttons {
  display: flex;
  -webkit-app-region: no-drag;
}

  .title-btn {
  width: 45px;
  height: 32px;
  border: none;
  background: none;
  color: #000;
  font-size: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-weight: lighter;
}

  .title-btn:hover {
  background-color: #e5e5e5;
}

  .close-btn:hover {
  background-color: #e81123;
  color: white;
}

  .btn-icon {
  font-size: 12px;
  font-weight: lighter;
  font-family: Arial, sans-serif;
}

  .content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  padding-top: 52px; /* 为工具栏留出空间 */
  box-sizing: border-box;
}

  .app-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  overflow: hidden;
}

body {
  font-family: Arial, sans-serif;
  background-color: #f5f5f5;
}

.app-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

h1 {
  color: #333;
  margin-bottom: 30px;
  font-size: 28px;
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.app-logo {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

.timer-display {
  width: 100%;
  max-width: 300px;
  height: 100px;
  background-color: #fff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.time {
  font-size: 48px;
  font-weight: bold;
  color: #333;
}

.status {
  font-size: 24px;
  color: #666;
}

.preset-times, .custom-time {
  width: 100%;
  max-width: 300px;
  margin-bottom: 20px;
}

h3 {
  color: #333;
  margin-bottom: 10px;
  font-size: 16px;
}

.button-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

button {
  padding: 12px;
  border: none;
  border-radius: 5px;
  background-color: #4CAF50;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #45a049;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.input-group {
  display: flex;
  gap: 10px;
}

.input-group.time-picker {
  align-items: center;
}

.time-picker select {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  min-width: 70px;
}

.time-picker span {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
}

.control-button {
  width: 100%;
  max-width: 300px;
}

.cancel-btn {
  width: 100%;
  background-color: #f44336;
}

.cancel-btn:hover {
  background-color: #d32f2f;
}

.exit-btn {
  width: 100%;
  background-color: #9e9e9e;
  margin-top: 10px;
}

.exit-btn:hover {
  background-color: #757575;
}
</style>