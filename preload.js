const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  scheduleShutdown: (minutes) => ipcRenderer.invoke('schedule-shutdown', minutes),
  cancelShutdown: () => ipcRenderer.invoke('cancel-shutdown'),
  getTimerStatus: () => ipcRenderer.invoke('get-timer-status'),
  exitApp: () => ipcRenderer.invoke('exit-app'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window')
});