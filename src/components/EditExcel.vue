<template>
  <div class="edit-modal">
    <div class="edit-content">
      <h2>Edit Entry</h2>
      <form @submit.prevent="saveEdit">
        <div v-for="header in headers" :key="header" class="form-group">
          <label :for="header">{{ header }}</label>
          <input 
            :id="header" 
            v-model="editedRow[header]" 
            :placeholder="header"
            :type="getInputType(header)"
          >
        </div>
        <div class="button-group">
          <button type="submit" class="save-button">Save</button>
          <button type="button" @click="cancel" class="cancel-button">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EditExcel',
  props: {
    row: {
      type: Object,
      required: true
    },
    headers: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      editedRow: JSON.parse(JSON.stringify(this.row))
    }
  },
  methods: {
    saveEdit() {
      this.$emit('save', this.editedRow)
    },
    cancel() {
      this.$emit('cancel')
    },
    getInputType(header) {
      // You can customize this method to return different input types based on the header
      if (header.toLowerCase().includes('date')) {
        return 'date'
      } else if (header.toLowerCase().includes('number') || header.toLowerCase().includes('amount')) {
        return 'number'
      }
      return 'text'
    }
  }
}
</script>

<style scoped>
.edit-modal {
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

.edit-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.save-button, .cancel-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-left: 10px;
}

.save-button {
  background-color: #4CAF50;
  color: white;
}

.cancel-button {
  background-color: #f44336;
  color: white;
}

.save-button:hover, .cancel-button:hover {
  opacity: 0.8;
}
</style>