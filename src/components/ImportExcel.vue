<template>
  <div>
    <button @click="selectFile" class="import-button">Import Excel File</button>
    <div v-if="importStatus">{{ importStatus }}</div>
  </div>
</template>

<script>
import * as XLSX from "xlsx";

export default {
  data() {
    return {
      importStatus: "",
    };
  },
  methods: {
    async selectFile() {
      try {
        const { filePaths, canceled } = await window.electron.dialog.showOpenDialog({
          properties: ["openFile"],
          filters: [{ name: "Excel Files", extensions: ["xls", "xlsx"] }],
        });

        if (!canceled && filePaths.length > 0) {
          const buffer = await window.electron.readFile(filePaths[0]);
          this.parseExcelData(buffer);
        }
      } catch (err) {
        console.error("Error while opening file dialog:", err);
        this.importStatus = "Error selecting file";
      }
    },
    parseExcelData(buffer) {
      try {
        const data = new Uint8Array(buffer);
        const workbook = XLSX.read(data, { type: "array" });

        const allSheets = {};

        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          const headers = jsonData[0];
          const rows = jsonData.slice(1).map(row => {
            const rowObject = {};
            headers.forEach((header, index) => {
              if (row[index] !== undefined && row[index] !== "") {
                rowObject[header] = row[index];
              }
            });
            return rowObject;
          }).filter(row => Object.keys(row).length > 0);

          allSheets[sheetName] = { headers, rows };
        });

        console.log("Parsed All Sheets:", allSheets);

        this.saveToJsonFile(allSheets);
      } catch (err) {
        console.error("Error while parsing Excel:", err);
        this.importStatus = "Error parsing Excel file";
      }
    },
    async saveToJsonFile(data) {
      try {
        const jsonData = JSON.stringify(data, null, 2);
        await window.electron.saveJsonFile(jsonData, "imported_data.json");
        this.importStatus = "Data imported successfully";
        this.$emit('importComplete', Object.keys(data));
      } catch (err) {
        console.error("Error saving data to JSON file:", err);
        this.importStatus = "Error importing data";
      }
    },
  },
};
</script>

<style scoped>
.import-button {
  background-color: #4caf50;
  border: none;
  color: white;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 4px;
}

.import-button:hover {
  background-color: #45a049;
}
</style>


