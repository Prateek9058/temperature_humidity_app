import path from "path";
import {
  app,
  ipcMain,
  Notification,
  Menu,
  dialog,
  shell,
  webContents,
} from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import { SerialPort } from "serialport";
import fs from "fs";
import Store from "electron-store";
import { log } from "console";
import { send } from "process";

const isProd = process.env.NODE_ENV === "production";
let port;
let dataBuffer = "";
let mainWindow;
const store = new Store();

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}
const showNotification = (title, body) => {
  new Notification({ title, body }).show();
};
// Clear the default menu
Menu.setApplicationMenu(null);
const driverFilePath = "C:\\WINDOWS\\System32\\Drivers\\CH341S64.SYS";

const isDriverInstalled = () => {
  try {
    return fs.existsSync(driverFilePath);
  } catch (err) {
    console.error("Error checking driver installation:", err);
    return false;
  }
};

(async () => {
  await app.whenReady();

  // Check if the 'isDriverInstalled' flag is stored
  const driverInstalledFlag = store.get("isDriverInstalled");

  // If the flag is not set and the driver is not installed, show the dialog
  if (!driverInstalledFlag && !isDriverInstalled()) {
    const result = await dialog.showMessageBox({
      type: "info",
      buttons: ["OK", "Cancel"],
      title: "Driver Installation Required",
      message:
        "First you have to install CH34X driver, then restart the app to continue.",
    });

    if (result.response === 0) {
      // OK button is pressed, open the driver's download page
      const driverDownloadURL = "https://sparks.gogo.co.nz/ch340.html";
      shell.openExternal(driverDownloadURL);

      // Wait for the user to install the driver and close the app
      app.quit();
    } else {
      // If user presses 'Cancel', quit the app
      app.quit();
      return;
    }
  } else {
    // If driver is installed or the flag is set, create and load the main window
    mainWindow = createWindow("main", {
      width: 1000,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
      },
    });

    if (isProd) {
      await mainWindow.loadURL("app://./home");
    } else {
      const port = process.argv[2];
      await mainWindow.loadURL(`http://localhost:${port}/home`);
      mainWindow.webContents.openDevTools();
    }
  }
})();

console.log("Is driver installed:", isDriverInstalled());
app.on("window-all-closed", () => {
  app.quit();
});

ipcMain.on("message", async (event, arg) => {
  event.reply("message", `${arg} World!`);
});
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
ipcMain.handle("open-port", async (event, config) => {
  const { path, baudRate } = config;
  console.log("path0", path);
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
          showNotification(`Port ${path} opened successfully`);
          resolve();
        }
      });
    });
    let timeoutId;
    const startDataTimeout = (msg) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        mainWindow.webContents.send("check-data", msg);
        console.log(msg);
      }, 5000);
    };

    // Handle incoming data for open-port

    port.on("data", (data) => {
      let validDataReceived = false;
      let segmentLength;
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
        clearTimeout(timeoutId);
        console.log("Processed segment length:", segment.length);
        console.log("Valid segment:", segment);
        segmentLength = segment.length;
      }

      if (!validDataReceived) {
        const msg = "No data received from COM port within 10 seconds";
        startDataTimeout(msg);
      }
      if (segmentLength == 0) {
        const msg = "data received";
        startDataTimeout(msg);
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
ipcMain.on("trigger-notification", (event, { title, body }) => {
  new Notification({ title, body }).show();
});
ipcMain.on("reload-app", () => {
  if (mainWindow) {
    mainWindow.reload(); // Reload the app window
  }
});
