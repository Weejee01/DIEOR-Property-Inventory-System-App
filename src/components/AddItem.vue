<template>
  <div class="add-modal">
    <div class="add-content">
      <h2 class="form-title">Add New Item</h2>
      <form @submit.prevent="save">
        <div v-for="header in headers" :key="header" class="form-group">
          <label :for="header">{{ header }}</label>
          <input 
            :id="header" 
            v-model="newRow[header]" 
            :placeholder="header"
            :type="getInputType(header)"
          >
        </div>
        <div class="button-group">
          <button type="submit" class="save-button">Add</button>
          <button type="button" @click="cancel" class="cancel-button">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AddItem',
  props: {
    headers: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      newRow: this.initializeNewRow()
    }
  },
  methods: {
    initializeNewRow() {
      return this.headers.reduce((obj, header) => {
        obj[header] = header.toLowerCase() === 'reference_id' ? 'INDUST-' : '';
        return obj;
      }, {});
    },
    save() {
      this.$emit('add', this.newRow);
    },
    cancel() {
      this.$emit('cancel');
    },
    getInputType(header) {
      if (header.toLowerCase().includes('number') || header.toLowerCase().includes('amount')) {
        return 'number'
      }
      return 'text'
    }
  }
}
</script>

<style scoped>
.add-modal {
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

.add-content {
  background-color: white;
  border-radius: 5px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 15px;
  padding-left: 20px;
  padding-right: 20px;
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
  background-color: #E5E4E2;
  padding: 10px;
  border-top: 1px solid #A9A9A9;
  text-align: center;
  font-weight: bold;
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

.form-title {
  background-color: #E5E4E2;
  padding: 10px;
  border-bottom: 1px solid #A9A9A9;
  text-align: center;
  font-weight: bold;
}
</style>
