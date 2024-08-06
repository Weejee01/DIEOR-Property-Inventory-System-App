const { contextBridge, ipcRenderer } = require("electron");
const fs = require("fs").promises;
const path = require("path");

contextBridge.exposeInMainWorld("electron", {
  dialog: {
    showOpenDialog: (options) =>
      ipcRenderer.invoke("dialog:showOpenDialog", options),
    showSaveDialog: (options) =>
      ipcRenderer.invoke("dialog:showSaveDialog", options),
  },
  readFile: async (filePath) => {
    try {
      const buffer = await fs.readFile(filePath);
      return buffer;
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  },
  copyFile: async (originalFilePath) => {
    try {
      const fileName = path.basename(originalFilePath);
      const targetPath = path.join(
        app.getPath("userData"),
        "excelFiles",
        fileName
      );
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.copyFile(originalFilePath, targetPath);
      return fileName;
    } catch (error) {
      throw new Error(`Failed to copy file: ${error.message}`);
    }
  },
 saveJsonFile: (data, filename) =>
    ipcRenderer.invoke("save-json-file", data, filename),
  loadJsonFile: (filename) => ipcRenderer.invoke("load-json-file", filename),
  writeFile: (filePath, data) =>
    ipcRenderer.invoke("writeFile", filePath, data),
});
