<template>
  <div>
    <button @click="selectFile">Import Excel File</button>
    <table>
      <thead>
        <tr>
          <th v-for="header in headers" :key="header">{{ header }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in rows" :key="index">
          <td v-for="header in headers" :key="header">{{ row[header] }}</td>
        </tr>
      </tbody>
    </table>
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
          console.log('File Buffer:', buffer); // Log the buffer for debugging
          this.parseExcelData(buffer);
        }
      } catch (err) {
        console.error('Error while opening file dialog:', err);
      }
    },
    parseExcelData(buffer) {
      try {
        const workbook = XLSX.read(buffer, { type: 'buffer' });

        // Assuming first sheet is the one you want to parse
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert the sheet data to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Assuming the first row is the header
        this.headers = jsonData[0];
        this.rows = jsonData.slice(1); // Exclude header row

        // Log jsonData for debugging
        console.log('Parsed JSON Data:', jsonData);
      } catch (err) {
        console.error('Error while parsing Excel:', err);
      }
    }
  }
};
</script>

<style scoped>
/* Your component styling here */
</style>
