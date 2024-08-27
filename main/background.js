import path from 'path'
import { app, ipcMain } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers'
import {SerialPort} from 'serialport'

const isProd = process.env.NODE_ENV === 'production'
let port;
let dataBuffer = '';
let mainWindow
if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

;(async () => {
  await app.whenReady()

   mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (isProd) {
    await mainWindow.loadURL('app://./home')
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/home`)
    mainWindow.webContents.openDevTools()
  }
})()

app.on('window-all-closed', () => {
  app.quit()
})

ipcMain.on('message', async (event, arg) => {
  event.reply('message', `${arg} World!`)
})
ipcMain.handle("list-ports", async () => {
  try {
    const ports = await SerialPort.list();
    console.log("Connected ports:", ports);
    return ports;
  } catch (error) {
    console.error("Error listing ports:", error.message);
    return { error: error.message };
  }
});
ipcMain.handle("open-port", async (event,  config ) => {
  const{path,baudRate}=config
  console.log("path0",path)
  try {
    port = new SerialPort({
      path,
      baudRate,
      autoOpen: false,
    });

    await new Promise((resolve, reject) => {
      port.open((err) => {
        if (err) {
          console.error("Failed to open port:", err.message);
          mainWindow.webContents.send(
            "serial-error",
            `Failed to open port: ${err.message}`
          );
          reject(err);
        } else {
          console.log(`Port ${path} opened at baud rate ${baudRate}`);
          resolve();
        }
      });
    });

    // Handle incoming data for open-port
    port.on("data", (data) => {
      dataBuffer += data.toString();
      let startIndex = 0;
      while (startIndex < dataBuffer.length) {
        const openBraceIndex = dataBuffer.indexOf("{", startIndex);
        const closeBraceIndex = dataBuffer.indexOf("}", openBraceIndex);
        if (openBraceIndex === -1 || closeBraceIndex === -1) {
          break;
        }
        const segment = dataBuffer.substring(
          openBraceIndex,
          closeBraceIndex + 1
        );
        startIndex = closeBraceIndex + 1;
        mainWindow.webContents.send("serial-data", segment);
        console.log("Processed segment length:", segment.length);
        console.log("Valid segment:", segment);
      }
      dataBuffer = dataBuffer.substring(startIndex);
      if (dataBuffer.length > 0) {
        console.log("Remaining buffer length:", dataBuffer.length);
        console.log("Remaining buffer content:", dataBuffer);
      }
    });

    port.on("error", (err) => {
      mainWindow.webContents.send("serial-error", err.message);
    });

    return true;
  } catch (error) {
    console.error("Error opening port:", error);
    return false;
  }
});
ipcMain.handle("close-port", async () => {
  try {
    if (port && port.isOpen) {
      console.log("Closing port...");
      return new Promise((resolve, reject) => {
        port.close((err) => {
          if (err) {
            console.error("Failed to close port:", err.message);
            mainWindow.webContents.send(
              "serial-error",
              `Failed to close port: ${err.message}`
            );
            reject(false);
          } else {
            console.log("Port closed successfully");
            port = null; // Clear the port instance
            resolve(true);
          }
        });
      });
    } else {
      console.log("No port is open to close.");
      return false;
    }
  } catch (error) {
    console.error("Error closing port:", error);
    mainWindow.webContents.send(
      "serial-error",
      `Error closing port: ${error.message}`
    );
    return false;
  }
});
ipcMain.handle("read-data", async (event, { data }) => {
  try {
    if (!port || !port.isOpen) {
      throw new Error("Serial port is not open");
    }
    await new Promise((resolve, reject) => {
      port.write(data, (err) => {
        if (err) {
          console.error("Error writing to serial port:", err.message);
          reject(new Error("Failed to write to serial port"));
        } else {
          console.log("Command sent to serial port:", data);
          resolve();
        }
      });
    });
    return new Promise((resolve, reject) => {
      let responseBuffer = "";

      const onData = (incomingData) => {
        responseBuffer += incomingData.toString();
        console.log("Received data:", responseBuffer);
        if (responseBuffer.includes("stop")) { 
          port.off("data", onData); 
          resolve({ success: true, message: responseBuffer.trim() });
        }
      };
      mainWindow.webContents.send("Read-SD-data", responseBuffer);
      port.on("data", onData);
    });

  } catch (error) {
    console.error("Error during serial communication:", error);
    return {
      success: false,
      message: `Failed to complete operation: ${error.message}`,
    };
  }
});
ipcMain.handle("clear-data", async (event, { data }) => {
  try {
    if (!port || !port.isOpen) {
      throw new Error("Serial port is not open");
    }
    await new Promise((resolve, reject) => {
      port.write(data, (err) => {
        if (err) {
          console.error("Error writing to serial port:", err.message);
          reject(new Error("Failed to write to serial port"));
        } else {
          console.log("Command sent to serial port:", data);
          resolve();
        }
      });
    });
    return new Promise((resolve, reject) => {
      let responseBuffer1 = "";

      const onData1 = (incomingData) => {
        responseBuffer1 += incomingData.toString();
        console.log("Received data:", responseBuffer1);
        if (responseBuffer1.includes("Cleared")) { 
          port.off("data", onData1); 
          resolve({ success: true, message: responseBuffer1.trim() });
        }
      };
      port.on("data", onData1);
    });

  } catch (error) {
    console.error("Error during serial communication:", error);
    return {
      success: false,
      message: `Failed to complete operation: ${error.message}`,
    };
  }
});