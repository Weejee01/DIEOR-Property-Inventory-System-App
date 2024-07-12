<template>
  <div>
    <button @click="selectFile" class="import-button">Import Excel File</button>
    <div v-if="headers.length > 0" class="table-container">
      <table>
        <thead>
          <tr>
            <th>Actions</th>
            <th v-for="header in headers" :key="header" @click="sortTable(header)" class="sortable-header">
              {{ header }}
              <span class="sort-icon">↕</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in rows" :key="rowIndex" @mouseover="hoveredRow = rowIndex" @mouseleave="hoveredRow = null">
            <td>
              <button v-if="hoveredRow === rowIndex" @click="editRow(rowIndex)" class="edit-button" title="Edit">
                ✎
              </button>
              <button v-if="hoveredRow === rowIndex" @click="confirmDelete(rowIndex)" class="delete-button" title="Delete">
                🗑️
              </button>
            </td>
            <td v-for="header in headers" :key="`${rowIndex}-${header}`">
              {{ row[header] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else-if="noFileFound">
      No JSON file found in the jsonFiles directory.
    </div>
    <div v-else>
      No data to display
    </div>
    <EditExcel
      v-if="editingRow !== null"
      :row="rows[editingRow]"
      :headers="headers"
      @save="saveEdit"
      @cancel="cancelEdit"
    />
    <!-- Confirmation Modal -->
    <div v-if="showDeleteConfirmation" class="modal">
      <div class="modal-content thinner">
        <p>Are you sure you want to delete this row?</p>
        <div class="button-container">
          <button class="confirm-button" @click="deleteRow">Yes</button>
          <button class="cancel-button" @click="cancelDelete">No</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as XLSX from "xlsx";
import EditExcel from "./EditExcel.vue";

export default {
  components: {
    EditExcel,
  },
  data() {
    return {
      headers: [],
      rows: [],
      noFileFound: false,
      hoveredRow: null,
      editingRow: null,
      showDeleteConfirmation: false,
      rowToDelete: null,
    };
  },
  mounted() {
    this.loadExistingJson();
  },
  computed: {
    editButtonStyle() {
      if (this.hoveredRow === null) return {};
      const row = this.$el.querySelectorAll(".table-row")[this.hoveredRow];
      if (!row) return {};
      const rect = row.getBoundingClientRect();
      const tableRect = this.$el
        .querySelector(".table-container")
        .getBoundingClientRect();
      return {
        top: `${rect.top - tableRect.top + window.scrollY}px`,
        height: `${rect.height}px`,
      };
    },
  },
  methods: {
    async loadExistingJson() {
      try {
        if (typeof window.electron.loadJsonFile !== "function") {
          console.error(
            "loadJsonFile is not a function. Electron API might not be properly initialized."
          );
          this.noFileFound = true;
          return;
        }
        const jsonData = await window.electron.loadJsonFile(
          "imported_data.json"
        );
        if (jsonData) {
          this.rows = JSON.parse(jsonData);
          if (this.rows.length > 0) {
            this.headers = Object.keys(this.rows[0]);
          }
        } else {
          this.noFileFound = true;
        }
      } catch (err) {
        console.error("Error loading existing JSON file:", err);
        this.noFileFound = true;
      }
    },
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
      }
    },
    parseExcelData(buffer) {
      try {
        const data = new Uint8Array(buffer);
        const workbook = XLSX.read(data, { type: "array" });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert the sheet data to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Assuming the first row is the header
        this.headers = jsonData[0];

        // Convert the remaining rows to objects
        this.rows = jsonData
          .slice(1)
          .map((row) => {
            const rowObject = {};
            this.headers.forEach((header, index) => {
              if (row[index] !== undefined && row[index] !== "") {
                rowObject[header] = row[index];
              }
            });
            return rowObject;
          })
          .filter((row) => Object.keys(row).length > 0); // Filter out empty objects

        console.log("Parsed JSON Data:", this.rows);

        // Save data to JSON file
        this.saveToJsonFile(this.rows);
      } catch (err) {
        console.error("Error while parsing Excel:", err);
      }
    },
    async saveToJsonFile(data) {
      try {
        // Filter out any remaining empty objects
        const filteredData = data.filter((obj) => Object.keys(obj).length > 0);

        if (filteredData.length > 0) {
          const jsonData = JSON.stringify(filteredData, null, 2);
          await window.electron.saveJsonFile(jsonData, "imported_data.json");
          console.log("Data saved to JSON file");
          // Update the component's data
          this.rows = filteredData;
        } else {
          console.log("No non-empty data to save");
        }
      } catch (err) {
        console.error("Error saving data to JSON file:", err);
      }
    },
    editRow(rowIndex) {
      this.editingRow = rowIndex;
    },
    saveEdit(editedRow) {
      this.rows[this.editingRow] = editedRow;
      this.editingRow = null;
      this.saveToJsonFile(this.rows);
      this.refreshTable();
    },
    refreshTable() {
      // Create a new array reference to trigger a re-render
      this.rows = [...this.rows];
    },
    cancelEdit() {
      this.editingRow = null;
    },
    sortTable(header) {
      this.rows.sort((a, b) => {
        if (a[header] < b[header]) return -1;
        if (a[header] > b[header]) return 1;
        return 0;
      });
      this.refreshTable();
    },
    confirmDelete(rowIndex) {
      this.rowToDelete = rowIndex;
      this.showDeleteConfirmation = true;
    },
    deleteRow() {
      if (this.rowToDelete !== null) {
        this.rows.splice(this.rowToDelete, 1);
        this.saveToJsonFile(this.rows);
        this.rowToDelete = null;
        this.showDeleteConfirmation = false;
      }
    },
    cancelDelete() {
      this.rowToDelete = null;
      this.showDeleteConfirmation = false;
    },
  },
};
</script>

<style scoped>
/* Existing styles */

.table-container {
  overflow-x: auto;
  max-width: 100%;
}

table {
  border-collapse: collapse;
  width: 100%;
}

td, th {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
  white-space: nowrap;
}

th {
  background-color: #f2f2f2;
  position: sticky;
  top: 0;
  cursor: pointer;
}

.sortable-header:hover {
  background-color: #e9ecef;
}

.sort-icon {
  cursor: pointer;
  user-select: none;
  padding-left: 5px;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

.table-row {
  position: relative;
}

.table-row:hover {
  background-color: #f5f5f5;
}

.edit-button-container {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background-color: inherit;
  padding-right: 10px;
}

.edit-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1em;
  color: #007bff;
  border-radius: 50%;
  transition: background-color 0.1s;
}

.edit-button:hover {
  background-color: #e9ecef;
}

.delete-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1em;
  color: #dc3545; /* Red color for delete */
  border-radius: 50%;
  transition: background-color 0.1s;
}

.delete-button:hover {
  background-color: #f8d7da; /* Light red on hover */
}

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

/* Modal styles */
.modal {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent black background */
}

.modal-content {
  background-color: #fefefe;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.modal-content.thinner {
  padding: 10px; /* Adjusted padding */
  max-width: fit-content; /* Limit width to content width */
  margin: 0 auto; /* Center horizontally */
}

.button-container {
  margin-top: 10px; /* Add space between buttons */
  display: flex;
  justify-content: center; /* Center buttons horizontally */
}

.confirm-button {
  background-color: #28a745; /* Blue color for confirmation */
  color: #fff;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 4px;
  margin-right: 10px;
  width: calc(50% - 5px); /* Half width minus margin */
}

.confirm-button:hover {
  opacity: 0.8;
}

.cancel-button {
  background-color: #dc3545; /* Red color for cancel */
  color: #fff;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 4px;
  width: calc(50% - 5px); /* Half width minus margin */
}

.cancel-button:hover {
  opacity: 0.8;
}
</style>
