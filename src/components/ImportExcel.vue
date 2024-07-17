<template>
  <div>
    <h2>Import/Export Excel</h2>
    <div class="button-container">
      <button @click="selectFile" class="action-button import-button">
        Import Excel File
      </button>
      <button @click="exportToExcel" class="action-button export-button">
        Export to Excel
      </button>
    </div>
    <div v-if="status" class="status-message">{{ status }}</div>
  </div>
</template>

<script>
import * as XLSX from "xlsx";

export default {
  data() {
    return {
      status: "",
    };
  },
  methods: {
    async selectFile() {
      try {
        const { filePaths, canceled } =
          await window.electron.dialog.showOpenDialog({
            properties: ["openFile"],
            filters: [{ name: "Excel Files", extensions: ["xls", "xlsx"] }],
          });

        if (!canceled && filePaths.length > 0) {
          const buffer = await window.electron.readFile(filePaths[0]);
          this.parseExcelData(buffer);
        }
      } catch (err) {
        console.error("Error while opening file dialog:", err);
        this.status = "Error selecting file";
      }
    },
    parseExcelData(buffer) {
      try {
        const data = new Uint8Array(buffer);
        const workbook = XLSX.read(data, { type: "array" });

        const allSheets = {};

        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          const headers = jsonData[0];
          const rows = jsonData
            .slice(1)
            .map((row) => {
              const rowObject = {};
              headers.forEach((header, index) => {
                if (row[index] !== undefined && row[index] !== "") {
                  rowObject[header] = row[index];
                }
              });
              return rowObject;
            })
            .filter((row) => Object.keys(row).length > 0);

          allSheets[sheetName] = { headers, rows };
        });

        console.log("Parsed All Sheets:", allSheets);

        this.saveToJsonFile(allSheets);
      } catch (err) {
        console.error("Error while parsing Excel:", err);
        this.status = "Error parsing Excel file";
      }
    },
    async saveToJsonFile(data) {
      try {
        const jsonData = JSON.stringify(data, null, 2);
        await window.electron.saveJsonFile(jsonData, "imported_data.json");
        this.status = "Data imported successfully";
        this.$emit("importComplete", Object.keys(data));
      } catch (err) {
        console.error("Error saving data to JSON file:", err);
        this.status = "Error importing data";
      }
    },
    async exportToExcel() {
      try {
        const jsonData = await window.electron.loadJsonFile(
          "imported_data.json"
        );
        if (!jsonData) {
          this.status = "No data to export";
          return;
        }

        const allSheets = JSON.parse(jsonData);
        const workbook = XLSX.utils.book_new();

        Object.entries(allSheets).forEach(([sheetName, sheetData]) => {
          const worksheet = XLSX.utils.json_to_sheet(sheetData.rows, {
            header: sheetData.headers,
          });
          XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        });

        const excelBuffer = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });

        const result = await window.electron.dialog.showSaveDialog({
          title: "Export Excel File",
          defaultPath: "exported_data.xlsx",
          filters: [{ name: "Excel Files", extensions: ["xlsx"] }],
        });

        if (!result.canceled && result.filePath) {
          await window.electron.writeFile(result.filePath, excelBuffer);
          this.status = "Data exported successfully";
        }
      } catch (err) {
        console.error("Error exporting to Excel:", err);
        this.status = "Error exporting data";
      }
    },
  },
};
</script>

<style scoped>
.button-container {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.action-button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  color: white;
}

.import-button {
  background-color: #4caf50;
}

.export-button {
  background-color: #008cba;
}

.status-message {
  text-align: center;
  margin-top: 20px;
  font-weight: bold;
}
</style>
