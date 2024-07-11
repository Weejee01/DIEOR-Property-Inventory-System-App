'use strict';

import { app, protocol, BrowserWindow } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer';
const { enable } = require('@electron/remote/main');
const path = require('path');
const { ipcMain } = require('electron')
const isDevelopment = process.env.NODE_ENV !== 'production';
const fs = require('fs').promises;

// Enable @electron/remote
enable(BrowserWindow);

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
]);

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    icon: "public/dieor_logo.ico",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Preload script for context isolation
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION, // Disable node integration
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION, // Enable context isolation
      enableRemoteModule: true // Enable remote module (temporary, to be replaced)
    }
  });

  if (isDevelopment && !process.env.IS_TEST) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    win.loadURL('app://./index.html');
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  // if (isDevelopment && !process.env.IS_TEST) {
  //   // Install Vue Devtools if in development mode
  //   try {
  //     await installExtension(VUEJS3_DEVTOOLS);
  //   } catch (e) {
  //     console.error('Vue Devtools failed to install:', e.toString());
  //   }
  // }

  console.log("Window created");
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}

ipcMain.handle('save-json-file', async (event, data, filename) => {
  // Get the path to the project root directory
  const projectRoot = path.resolve(__dirname, '..');
  const jsonFilesPath = path.join(projectRoot, 'jsonFiles');
  const filePath = path.join(jsonFilesPath, filename);
  
  try {
    // Ensure the jsonFiles directory exists
    await fs.mkdir(jsonFilesPath, { recursive: true });
    
    // Write the file
    await fs.writeFile(filePath, data, 'utf-8');
    
    console.log('File saved successfully:', filePath);
    return filePath;
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
  }
});

ipcMain.handle('load-json-file', async (event, filename) => {
  const projectRoot = path.resolve(__dirname, '..');
  const jsonFilesPath = path.join(projectRoot, 'jsonFiles');
  const filePath = path.join(jsonFilesPath, filename);
  
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return data;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('No JSON file found');
      return null;
    }
    console.error('Error loading JSON file:', error);
    throw error;
  }
});