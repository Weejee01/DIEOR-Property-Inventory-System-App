<template>
  <div>
    <h2>{{ currentSheet }}</h2>
    <button @click="showAddItemForm" class="add-button">Add Item</button>
    <div v-if="headers.length > 0" class="table-container">
      <table>
        <thead>
          <tr>
            <th class="actions-column">Actions</th>
            <th
              v-for="header in headers"
              :key="header"
              @click="sortTable(header)"
              class="sortable-header"
            >
              {{ header }}
              <span class="sort-icon">↕</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, rowIndex) in rows"
            :key="rowIndex"
            @mouseover="hoveredRow = rowIndex"
            @mouseleave="hoveredRow = null"
          >
            <td>
              <button
                v-if="hoveredRow === rowIndex"
                @click="editRow(rowIndex)"
                class="edit-button"
                title="Edit"
              >
                ✎
              </button>
              <button
                v-if="hoveredRow === rowIndex"
                @click="confirmDelete(rowIndex)"
                class="delete-button"
                title="Delete"
              >
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
    <div v-else>No data to display</div>
    <EditExcel
      v-if="editingRow !== null"
      :row="rows[editingRow]"
      :headers="headers"
      @save="saveEdit"
      @cancel="cancelEdit"
    />
    <AddItem
      v-if="addingItem"
      :headers="headers"
      @add="addItem"
      @cancel="cancelAdd"
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
import EditExcel from "./EditExcel.vue";
import AddItem from "./AddItem.vue";

export default {
  components: {
    EditExcel,
    AddItem,
  },
  props: ["sheetName"],
  data() {
    return {
      currentSheet: this.sheetName,
      headers: [],
      rows: [],
      hoveredRow: null,
      editingRow: null,
      addingItem: false,
      showDeleteConfirmation: false,
      rowToDelete: null,
    };
  },
  watch: {
    sheetName: {
      immediate: true,
      handler: "loadSheetData",
    },
  },
  mounted() {
    this.loadSheetData();
  },
  methods: {
    async loadSheetData() {
      if (!this.sheetName) return;
      
      try {
        const jsonData = await window.electron.loadJsonFile("imported_data.json");
        if (jsonData) {
          const allSheets = JSON.parse(jsonData);
          const sheetData = allSheets[this.sheetName];
          if (sheetData) {
            this.headers = sheetData.headers;
            this.rows = sheetData.rows;
          }
        }
      } catch (err) {
        console.error("Error loading sheet data:", err);
      }
    },
    editRow(rowIndex) {
      this.editingRow = rowIndex;
    },
    async saveEdit(editedRow) {
      this.rows[this.editingRow] = editedRow;
      this.editingRow = null;
      await this.saveToJsonFile();
      this.refreshTable();
    },
    refreshTable() {
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
    async deleteRow() {
      if (this.rowToDelete !== null) {
        this.rows.splice(this.rowToDelete, 1);
        await this.saveToJsonFile();
        this.rowToDelete = null;
        this.showDeleteConfirmation = false;
      }
    },
    cancelDelete() {
      this.rowToDelete = null;
      this.showDeleteConfirmation = false;
    },
    showAddItemForm() {
      this.addingItem = true;
    },
    async addItem(newRow) {
      this.rows.push(newRow);
      this.addingItem = false;
      await this.saveToJsonFile();
      this.refreshTable();
    },
    cancelAdd() {
      this.addingItem = false;
    },
    async saveToJsonFile() {
      try {
        const jsonData = await window.electron.loadJsonFile(
          "imported_data.json"
        );
        const allSheets = JSON.parse(jsonData);
        allSheets[this.currentSheet] = {
          headers: this.headers,
          rows: this.rows,
        };
        const updatedJsonData = JSON.stringify(allSheets, null, 2);
        await window.electron.saveJsonFile(
          updatedJsonData,
          "imported_data.json"
        );
      } catch (err) {
        console.error("Error saving data to JSON file:", err);
      }
    },
  },
};
</script>

<style scoped>
/* Existing styles */

.table-container {
  overflow-x: auto;
  max-width: 100%;
  padding-bottom: 20px;
}

table {
  border-collapse: collapse;
  width: 100%;
}

td,
th {
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

.actions-column {
  padding-right: 20px;
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
  background-color: #dc3545; /* Red color for cancellation */
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

.add-button {
  background-color: #007bff;
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

.add-button:hover {
  background-color: #0056b3;
}
</style>
