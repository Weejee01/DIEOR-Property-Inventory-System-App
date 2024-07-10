<template>
  <div>
    <button @click="selectFile">Import Excel File</button>
    <div v-if="headers.length > 0" class="table-container">
      <table>
        <thead>
          <tr>
            <th v-for="header in headers" :key="header">{{ header }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
            <td v-for="header in headers" :key="`${rowIndex}-${header}`">
              {{ row[header] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      No data to display
    </div>
  </div>
</template>

<script>
import * as XLSX from 'xlsx';

export default {
  data() {
    return {
      headers: [],
      rows: []
    };
  },
  methods: {
    async selectFile() {
      try {
        const { filePaths, canceled } = await window.electron.dialog.showOpenDialog({
          properties: ['openFile'],
          filters: [
            { name: 'Excel Files', extensions: ['xls', 'xlsx'] }
          ]
        });

        if (!canceled && filePaths.length > 0) {
          const buffer = await window.electron.readFile(filePaths[0]);
          this.parseExcelData(buffer);
        }
      } catch (err) {
        console.error('Error while opening file dialog:', err);
      }
    },
    parseExcelData(buffer) {
      try {
        const data = new Uint8Array(buffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert the sheet data to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Assuming the first row is the header
        this.headers = jsonData[0];
        
        // Convert the remaining rows to objects
        this.rows = jsonData.slice(1).map(row => {
          const rowObject = {};
          this.headers.forEach((header, index) => {
            rowObject[header] = row[index];
          });
          return rowObject;
        });

        console.log('Parsed JSON Data:', this.rows);
      } catch (err) {
        console.error('Error while parsing Excel:', err);
      }
    }
  }
};
</script>

<style scoped>
.table-container {
  overflow-x: auto;
  max-width: 100%;
}

table {
  border-collapse: collapse;
  width: 100%;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
  white-space: nowrap;
}

th {
  background-color: #f2f2f2;
  position: sticky;
  top: 0;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

tr:hover {
  background-color: #f5f5f5;
}
</style>