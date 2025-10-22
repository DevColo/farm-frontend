<script setup>
import { ref, watch } from 'vue'
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormCheck,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CButton,
} from '@coreui/vue'

// Roles
const selectedRole = ref('')
const roleDescription = ref('')

// Permission modules
const modules = ref([
  'Farms',
  'Blocks',
  'Parcels',
  'Trees',
  'Activities',
  'Pastures',
  'Cows',
  'Maternity',
  'Food Stock',
  'Feeding',
  'Health',
  'Daily Milk Record',
  'Production Targets',
  'Milk Sales',
  'Cow Sales',
])

// Initialize permissions
const permissions = ref(
  modules.value.map((name) => ({
    name,
    access: false,
    delete: false,
    edit: false,
    list: false,
    view: false,
  }))
)

// Watch “Access” and automatically control “Delete” + “Edit”
watch(
  permissions,
  (newPermissions) => {
    newPermissions.forEach((perm) => {
      if (perm.access) {
        perm.delete = true
        perm.edit = true
      } else {
        perm.delete = false
        perm.edit = false
      }
    })
  },
  { deep: true }
)

// Handle form submission
const handleSubmit = () => {
  const roleData = {
    role: selectedRole.value,
    description: roleDescription.value,
    permissions: permissions.value,
  }

  console.log('Submitted Role Data:', roleData)
  alert('Role permissions saved successfully!')
}
</script>

<template>
  <CCard class="shadow-sm border-0">
    <CCardBody>
      <!-- Role Info -->
      <CRow class="mb-4">
        <CCol md="6">
          <CFormLabel for="roleName">Role</CFormLabel>
          <CFormSelect id="roleName" v-model="selectedRole">
            <option value="">Select a role</option>
            <option value="accountant">Accountant</option>
            <option value="agronomist">Agronomist</option>
            <option value="managing director">Managing Director</option>
            <option value="super admin">Super Admin</option>
            <option value="veterinarian">Veterinarian</option>
          </CFormSelect>
        </CCol>

        <CCol md="6">
          <CFormLabel for="roleDesc">Description</CFormLabel>
          <CFormInput
            id="roleDesc"
            placeholder="e.g. Role Description"
            v-model="roleDescription"
          />
        </CCol>
      </CRow>

      <!-- Permissions Table -->
      <CTable bordered hover responsive class="text-center align-middle permissions-table">
        <CTableHead color="light">
          <CTableRow>
            <CTableHeaderCell class="text-start">Module</CTableHeaderCell>
            <CTableHeaderCell>Access</CTableHeaderCell>
            <CTableHeaderCell>Delete</CTableHeaderCell>
            <CTableHeaderCell>Edit</CTableHeaderCell>
            <CTableHeaderCell>List</CTableHeaderCell>
            <CTableHeaderCell>View</CTableHeaderCell>
          </CTableRow>
        </CTableHead>

        <CTableBody>
          <CTableRow v-for="(perm, index) in permissions" :key="index">
            <CTableDataCell class="text-start fw-semibold">{{ perm.name }}</CTableDataCell>
            <CTableDataCell><CFormCheck v-model="perm.access" /></CTableDataCell>
            <CTableDataCell><CFormCheck v-model="perm.delete" /></CTableDataCell>
            <CTableDataCell><CFormCheck v-model="perm.edit" /></CTableDataCell>
            <CTableDataCell><CFormCheck v-model="perm.list" /></CTableDataCell>
            <CTableDataCell><CFormCheck v-model="perm.view" /></CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>

      <!-- Submit Button -->
      <div class="text-end mt-4">
        <CButton color="primary" class="px-4" @click="handleSubmit">
          Submit
        </CButton>
      </div>
    </CCardBody>
  </CCard>
</template>

<style scoped>
.permissions-table {
  border: 1px solid #dee2e6;
}

.permissions-table th,
.permissions-table td {
  border: 1px solid #dee2e6 !important;
  vertical-align: middle;
}

.permissions-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.fw-semibold {
  font-weight: 500;
}
</style>
