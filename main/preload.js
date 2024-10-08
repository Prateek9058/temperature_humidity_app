import { contextBridge, ipcRenderer } from "electron";

const handler = {
  listPorts() {
    return ipcRenderer.invoke("list-ports");
  },
  closePort() {
    return ipcRenderer.invoke("close-port");
  },
  openPort(config) {
    return ipcRenderer.invoke("open-port", config);
  },
  readData(config) {
    return ipcRenderer.invoke("read-data", config);
  },
  clearData(config) {
    return ipcRenderer.invoke("clear-data", config);
  },
  onSerialData(callback) {
    ipcRenderer.on("serial-data", (event, data) => callback(data));
    return () => ipcRenderer.removeListener("serial-data", callback);
  },
  offSerialData() {
    // Unregister the callback
    ipcRenderer.removeAllListeners('serial-data');
},
  onReceivingSD_Data(callback) {
    ipcRenderer.on("Read-SD-data", (event, data) => callback(data));
    return () => ipcRenderer.removeListener("Read-SD-data", callback);
  },
  on(channel, callback) {
    ipcRenderer.on(channel, (event, ...args) => callback(...args));
    return () => ipcRenderer.removeListener(channel, callback);
  },
  send(channel, ...args) {
    ipcRenderer.send(channel, ...args);
  },
  triggerNotification(title, body) {
    ipcRenderer.send("trigger-notification", { title, body });
  },
  reloadApp() {
    return ipcRenderer.send("reload-app");
  },
};

contextBridge.exposeInMainWorld("ipc", handler);
