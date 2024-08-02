<template>
  <div>
    <h2>{{ currentSheetName }}</h2>
    <div class="search-container">
      <div class="search-bar">
        <input
          v-model="searchQuery"
          placeholder="Search..."
          @input="performSearch"
        />
        <button v-if="searchQuery" @click="clearSearch" class="clear-search">
          ✕
        </button>
      </div>
      <div class="column-select">
        <button
          @click="toggleAllColumns"
          :class="{ selected: allColumnsSelected }"
        >
          All
        </button>
        <button
          v-for="header in headers"
          :key="header"
          @click="toggleColumn(header)"
          :class="{ selected: selectedColumns.includes(header) }"
        >
          {{ header }}
        </button>
      </div>
    </div>
    <div class="button-container">
      <button @click="showAddItemForm" class="add-button">Add Item</button>
      <button @click="exportFilteredToExcel" class="export-button">
        Export Filtered
      </button>
    </div>
    <div v-if="headers.length > 0" class="table-wrapper">
      <div class="table-container">
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
                <span class="sort-icon">
                  {{ getSortIcon(header) }}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, rowIndex) in filteredRows"
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
        <div class="confirm-cancel">
          <div class="button-container">
            <button class="confirm-button" @click="deleteRow">Yes</button>
            <button class="cancel-button" @click="cancelDelete">No</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import EditExcel from "./EditExcel.vue";
import AddItem from "./AddItem.vue";
import * as XLSX from "xlsx";

export default {
  components: {
    EditExcel,
    AddItem,
  },
  props: ["sheetName"],
  data() {
    return {
      currentSheetName: "",
      headers: [],
      rows: [],
      hoveredRow: null,
      editingRow: null,
      addingItem: false,
      showDeleteConfirmation: false,
      rowToDelete: null,
      sortConfig: {},
      searchQuery: "",
      selectedColumns: [],
    };
  },
  computed: {
    allColumnsSelected() {
      return this.selectedColumns.length === this.headers.length;
    },
    filteredRows() {
      if (!this.searchQuery || this.selectedColumns.length === 0)
        return this.rows;

      return this.rows.filter((row) => {
        return this.selectedColumns.some((column) => {
          return (
            row[column] &&
            row[column]
              .toString()
              .toLowerCase()
              .includes(this.searchQuery.toLowerCase())
          );
        });
      });
    },
  },
  watch: {
    sheetName: {
      immediate: true,
      handler(newSheetName) {
        if (newSheetName) {
          this.currentSheetName = newSheetName;
          this.loadSheetData();
        }
      },
    },
  },
  mounted() {
    if (this.sheetName) {
      this.currentSheetName = this.sheetName;
      this.loadSheetData();
    }
  },
  methods: {
    async loadSheetData() {
      console.log("ViewExcel: Loading sheet data for", this.sheetName);
      if (!this.sheetName) {
        console.log("ViewExcel: No sheet name provided");
        return;
      }

      try {
        const jsonData = await window.electron.loadJsonFile(
          "imported_data.json"
        );
        console.log(
          "ViewExcel: JSON data loaded",
          jsonData ? "successfully" : "is null"
        );
        if (jsonData) {
          const allSheets = JSON.parse(jsonData);
          const sheetData = allSheets[this.currentSheetName];
          if (sheetData) {
            console.log("ViewExcel: Sheet data found", this.currentSheetName);
            this.headers = sheetData.headers;
            this.rows = sheetData.rows;
            this.selectedColumns = []; // No columns selected by default
          } else {
            console.log("ViewExcel: No data for sheet", this.currentSheetName);
          }
        } else {
          console.log("ViewExcel: No JSON data found");
        }
      } catch (err) {
        console.error("ViewExcel: Error loading sheet data:", err);
      }
    },
    editRow(rowIndex) {
      const rowToEdit = this.filteredRows[rowIndex];
      const indexInFullDataset = this.rows.findIndex((row) =>
        Object.keys(row).every((key) => row[key] === rowToEdit[key])
      );
      if (indexInFullDataset !== -1) {
        this.editingRow = indexInFullDataset;
      }
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
      for (let key in this.sortConfig) {
        if (key !== header) {
          this.sortConfig[key] = null;
        }
      }

      if (!this.sortConfig[header] || this.sortConfig[header] === "desc") {
        this.sortConfig[header] = "asc";
      } else {
        this.sortConfig[header] = "desc";
      }

      this.rows.sort((a, b) => {
        let comparison = 0;
        if (a[header] < b[header]) {
          comparison = -1;
        } else if (a[header] > b[header]) {
          comparison = 1;
        }

        return this.sortConfig[header] === "desc"
          ? comparison * -1
          : comparison;
      });

      this.refreshTable();
    },
    getSortIcon(header) {
      if (!this.sortConfig[header]) return "↕";
      return this.sortConfig[header] === "asc" ? "↑" : "↓";
    },
    confirmDelete(rowIndex) {
      this.rowToDelete = this.filteredRows[rowIndex];
      this.showDeleteConfirmation = true;
    },
    async deleteRow() {
      if (this.rowToDelete) {
        const indexInFullDataset = this.rows.findIndex((row) =>
          Object.keys(row).every((key) => row[key] === this.rowToDelete[key])
        );
        if (indexInFullDataset !== -1) {
          this.rows.splice(indexInFullDataset, 1);
          await this.saveToJsonFile();
          this.refreshTable();
        }
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
        allSheets[this.currentSheetName] = {
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
    performSearch() {
      // The actual filtering is done in the computed property
    },
    toggleColumn(header) {
      const index = this.selectedColumns.indexOf(header);
      if (index > -1) {
        this.selectedColumns.splice(index, 1);
      } else {
        this.selectedColumns.push(header);
      }
    },
    toggleAllColumns() {
      if (this.allColumnsSelected) {
        this.selectedColumns = [];
      } else {
        this.selectedColumns = [...this.headers];
      }
    },
    clearSearch() {
      this.searchQuery = "";
    },
    async exportFilteredToExcel() {
      try {
        // Create a new workbook
        const workbook = XLSX.utils.book_new();

        // Ensure all headers are included
        const fullData = this.filteredRows.map((row) => {
          const fullRow = {};
          this.headers.forEach((header) => {
            fullRow[header] = row[header] || ""; // Use empty string if the value is undefined
          });
          return fullRow;
        });

        // Convert the full data to a worksheet
        const worksheet = XLSX.utils.json_to_sheet(fullData);

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(
          workbook,
          worksheet,
          this.currentSheetName
        );

        // Generate a binary string
        const excelBinaryString = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "binary",
        });

        // Convert binary string to Uint8Array
        const uint8Array = new Uint8Array(excelBinaryString.length);
        for (let i = 0; i < excelBinaryString.length; i++) {
          uint8Array[i] = excelBinaryString.charCodeAt(i) & 0xff;
        }

        // Use Electron's dialog to get the save file path
        const result = await window.electron.dialog.showSaveDialog({
          title: "Export Filtered Excel File",
          defaultPath: `${this.currentSheetName}_filtered.xlsx`,
          filters: [{ name: "Excel Files", extensions: ["xlsx"] }],
        });

        if (!result.canceled && result.filePath) {
          // Use Electron's fs module to write the file
          await window.electron.writeFile(result.filePath, uint8Array);
          console.log("Filtered data exported successfully");
        }
      } catch (err) {
        console.error("Error exporting filtered data to Excel:", err);
      }
    },
  },
};
</script>

<style scoped>
.search-container {
  margin-bottom: 20px;
}

.search-bar {
  position: relative;
  width: 50%;
  margin-bottom: 10px;
}

.search-bar input {
  width: 100%;
  padding: 8px;
  padding-right: 30px;
}

.clear-search {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #999;
}

.clear-search:hover {
  color: #333;
}

.column-select {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.column-select button {
  padding: 5px 10px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 3px;
  cursor: pointer;
}

.column-select button.selected {
  background-color: #71797e;
  color: white;
}

.table-wrapper {
  padding-right: 10px;
  overflow-x: auto; /* Enable horizontal scroll */
  overflow-y: hidden; /* Disable vertical scroll */
  margin-bottom: 20px; /* Ensure there's space for the scrollbar */
  position: relative; /* Position relative for the scrollbar */
}

.table-container {
  overflow-y: auto; /* Enable vertical scroll */
  max-height: 60vh; /* Adjust max height as needed */
}

table {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
}

td {
  padding: 8px;
  text-align: left;
  white-space: nowrap;
  border-bottom: 1px solid #ddd; /* Ensure borders for table body cells */
  border-right: 1px solid #ddd; /* Ensure borders for table body cells */
}


th {
  padding: 8px;
  text-align: left;
  white-space: nowrap;
  background-color: #f2f2f2;
  top: 0;
  cursor: pointer;
  z-index: 2;
  position: sticky;
  border-top: 2px solid #ddd;
  border-bottom: 2px solid #ddd; /* Ensure border for the sticky header */
  border-right: 2px solid #ddd; /* Ensure border for the sticky header */
}

th:first-child, td:first-child {
  border-left: 2px solid #ddd; /* Ensure left border for the first column */
}

th:last-child, td:last-child {
  border-right: 1px solid #ddd; /* Ensure right border for the last column */
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

.edit-button,
.delete-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1em;
  border-radius: 50%;
  transition: background-color 0.1s;
}

.edit-button {
  color: #007bff;
}

.delete-button {
  color: #dc3545;
}

.edit-button:hover,
.delete-button:hover {
  background-color: #e9ecef;
}

.add-button {
  background-color: #e65416;
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
  background-color: #dc4a0c;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
}

.button-container {
  margin-top: 10px;
}

.confirm-button,
.cancel-button {
  padding: 8px 16px;
  margin: 0 5px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.confirm-button {
  background-color: #28a745;
  color: white;
}

.cancel-button {
  background-color: #dc3545;
  color: white;
}

.confirm-cancel {
  display: flex;
  justify-content: center;
  align-items: center;
}

.button-container {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.export-button {
  background-color: #28a745;
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

.export-button:hover {
  background-color: #218838;
}
</style>
