"use strict";

import { app, protocol, BrowserWindow } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
//import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer';
import { initialize, enable } from "@electron/remote/main";
const path = require("path");
const { ipcMain, dialog } = require("electron");
const isDevelopment = process.env.NODE_ENV !== "production";
const fs = require("fs").promises;

// Enable @electron/remote
initialize();

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

function getAssetPath(asset) {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, asset);
  }
  return path.join(__dirname, "..", asset);
}

async function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    icon:"public/dieor_logo.ico",
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      enableRemoteModule: false,
    },
  });

  enable(win.webContents);

  if (isDevelopment && !process.env.IS_TEST) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  console.log("Window created");
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}

ipcMain.handle("save-json-file", async (event, data, filename) => {
  const jsonFilesPath = getAssetPath("jsonFiles");
  const filePath = path.join(jsonFilesPath, filename);

  try {
    await fs.mkdir(jsonFilesPath, { recursive: true });
    await fs.writeFile(filePath, data, "utf-8");
    console.log("File saved successfully:", filePath);
    return filePath;
  } catch (error) {
    console.error("Error saving file:", error);
    throw error;
  }
});

ipcMain.handle("load-json-file", async (event, filename) => {
  const jsonFilesPath = getAssetPath("jsonFiles");
  const filePath = path.join(jsonFilesPath, filename);

  console.log("Main: Attempting to load JSON file:", filePath);

  try {
    const data = await fs.readFile(filePath, "utf-8");
    console.log("Main: JSON file loaded successfully");
    return data;
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log("Main: No JSON file found at", filePath);
      return null;
    }
    console.error("Main: Error loading JSON file:", error);
    throw error;
  }
});

ipcMain.handle("writeFile", async (event, filePath, data) => {
  try {
    await fs.writeFile(filePath, Buffer.from(data));
    console.log("File written successfully:", filePath);
    return true;
  } catch (error) {
    console.error("Error writing file:", error);
    throw error;
  }
});

ipcMain.handle("dialog:showOpenDialog", async (event, options) => {
  const result = await dialog.showOpenDialog(options);
  return result;
});

ipcMain.handle("dialog:showSaveDialog", async (event, options) => {
  const result = await dialog.showSaveDialog(options);
  return result;
});
