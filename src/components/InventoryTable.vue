<template>
  <div>
    <h1>Property Inventory</h1>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>Reference ID</th>
          <th>Quantity</th>
          <th>Unit</th>
          <th>Name</th>
          <th>Description 1</th>
          <th>Description 2</th>
          <th>Serial Number</th>
          <th>MR Date</th>
          <th>DAQD</th>
          <th>Prop No</th>
          <th>Class No</th>
          <th>Unit Cost</th>
          <th>Total Cost</th>
          <th>End User</th>
          <th>Official</th>
          <th>Location</th>
          <th>Allotment</th>
          <th>Project</th>
          <th>Unit Name</th>
          <th>Office Code</th>
          <th>Remarks</th>
          <th>Cluster No</th>
          <th>Insurance</th>
          <th>Property Card</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.referenceId">
          <td>{{ item.referenceId }}</td>
          <td>{{ item.quantity }}</td>
          <td>{{ item.unit }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.description1 }}</td>
          <td>{{ item.description2 }}</td>
          <td>{{ item.serialNumber }}</td>
          <td>{{ item.mrDate }}</td>
          <td>{{ item.daqd }}</td>
          <td>{{ item.propNo }}</td>
          <td>{{ item.classNo }}</td>
          <td>{{ item.uCost }}</td>
          <td>{{ item.tCost }}</td>
          <td>{{ item.endUser }}</td>
          <td>{{ item.official }}</td>
          <td>{{ item.location }}</td>
          <td>{{ item.allotment }}</td>
          <td>{{ item.project }}</td>
          <td>{{ item.unitName }}</td>
          <td>{{ item.officeCode }}</td>
          <td>{{ item.remarks }}</td>
          <td>{{ item.clusterNo }}</td>
          <td>{{ item.insurance }}</td>
          <td>{{ item.propertyCard }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [
        // Example items, replace with your data source
        {
          referenceId: 'REF123',
          quantity: 10,
          unit: 'pcs',
          name: 'Chair',
          description1: 'Wooden',
          description2: 'Brown',
          serialNumber: 'SN123',
          mrDate: '2024-01-01',
          daqd: '2024-02-01',
          propNo: 1,
          classNo: 1,
          uCost: 100.0,
          tCost: 1000.0,
          endUser: 'John Doe',
          official: 'Alice Smith',
          location: 'Warehouse 1',
          allotment: 'Dept A',
          project: 'Proj A',
          unitName: 'Admin Dept',
          officeCode: 'OC123',
          remarks: 'None',
          clusterNo: 1,
          insurance: 'Ins A',
          propertyCard: 'PC123'
        }
      ]
    }
  }
}
</script>