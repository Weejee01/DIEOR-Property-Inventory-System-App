<template>
  <div>
    <h2>Import/Export Excel File</h2>
    <div class="button-container">
      <button @click="selectFile" class="action-button import-button">
        Import Excel File
      </button>
      <button @click="exportToExcel" class="action-button export-button">
        Export to Excel
      </button>
    </div>
    <div v-if="status" class="status-message">{{ status }}</div>

    <!-- Warning Dialog -->
    <div v-if="showWarning" class="warning-dialog">
      <div class="warning-content">
        <p>
          Warning: There is existing data. Do you want to export it before
          importing a new file?
        </p>
        <div class="warning-buttons">
          <button @click="exportToExcel" class="action-button export-button">
            Export First
          </button>
          <button @click="confirmImport" class="action-button import-button">
            Import Anyway
          </button>
          <button @click="cancelImport" class="action-button cancel-button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as XLSX from "xlsx";

export default {
  data() {
    return {
      status: "",
      hasExistingData: false,
      showWarning: false,
    };
  },
  mounted() {
    this.checkExistingData();
  },
  methods: {
    async checkExistingData() {
      try {
        const jsonData = await window.electron.loadJsonFile(
          "imported_data.json"
        );
        this.hasExistingData =
          !!jsonData && Object.keys(JSON.parse(jsonData)).length > 0;
      } catch (err) {
        console.error("Error checking existing data:", err);
        this.hasExistingData = false;
      }
    },
    async selectFile() {
      if (this.hasExistingData) {
        this.showWarning = true;
      } else {
        this.importFile();
      }
    },

    async importFile() {
      try {
        const result = await window.electron.dialog.showOpenDialog({
          properties: ["openFile"],
          filters: [{ name: "Excel Files", extensions: ["xls", "xlsx"] }],
        });

        if (!result.canceled && result.filePaths.length > 0) {
          const buffer = await window.electron.readFile(result.filePaths[0]);
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

          // Check if the sheet is hidden
          const sheetState = workbook.Workbook?.Sheets?.find(
            (s) => s.name === sheetName
          )?.State;
          const isHidden =
            sheetState === "hidden" || sheetState === "veryHidden";

          if (!isHidden) {
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
              header: 1,
              raw: false,
            });

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
          }
        });

        console.log("Parsed Visible Sheets:", allSheets);

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
        this.hasExistingData = true;
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
          const headers = sheetData.headers;
          const rows = sheetData.rows.map((row) => {
            const rowData = [];
            headers.forEach((header) => {
              rowData.push(row[header] !== undefined ? row[header] : "");
            });
            return rowData;
          });

          const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

          // Calculate column widths
          const colWidths = headers.map((header, colIndex) => {
            // Start with the header width
            let maxLength = header.length;

            // Calculate max width for each column
            rows.forEach((row) => {
              const cellValue = row[colIndex] ? String(row[colIndex]) : "";
              maxLength = Math.max(maxLength, cellValue.length);
            });

            // Return the maximum width for this column (adding padding)
            return { wch: maxLength + 2 }; // Adjust padding as needed
          });

          // Set the calculated column widths
          worksheet["!cols"] = colWidths;

          // Convert date cells to Excel numeric format
          headers.forEach((header, colIndex) => {
            rows.forEach((row, rowIndex) => {
              const cellValue = row[colIndex];
              if (this.isDateNumeric(cellValue)) {
                const cellRef = XLSX.utils.encode_cell({
                  r: rowIndex + 1,
                  c: colIndex,
                });
                worksheet[cellRef] = {
                  t: "n",
                  v: cellValue,
                  z: XLSX.SSF._table[14],
                }; // Using date format
              }
            });
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
    isDateNumeric(value) {
      return typeof value === "number" && !isNaN(value) && value > 0;
    },
    confirmImport() {
      this.showWarning = false;
      this.importFile();
    },

    cancelImport() {
      this.showWarning = false;
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
  background-color: #008cba;
}

.export-button {
  background-color: #4caf50;
}

.status-message {
  text-align: center;
  margin-top: 20px;
  font-weight: bold;
}

.warning-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.warning-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
}

.warning-buttons {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
}

.cancel-button {
  background-color: #f44336;
}
</style>
