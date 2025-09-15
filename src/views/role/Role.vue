<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoleStore } from '@/stores/role.store'
import {
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CForm,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CFormFeedback,
} from '@coreui/vue'
import { cilPencil, cilTrash } from '@coreui/icons'
import avatar from '@/assets/images/avatars/8.jpg'

const roleStore = useRoleStore()

const showModal = ref(false)
const isEditing = ref(false)
const validated = ref(false)

const currentRole = ref({
  id: null,
  name: '',
})

// fetch data
onMounted(() => {
  roleStore.fetchRoles()
})

// search & pagination
const searchQuery = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)

const filteredRoles = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return roleStore.roles.filter((role) => {
    const matchesQuery = !q || [role.name].some((f) => f?.toLowerCase().includes(q))
    return matchesQuery
  })
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredRoles.value.length / itemsPerPage.value)),
)
const paginatedRoles = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredRoles.value.slice(start, start + itemsPerPage.value)
})

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}
function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}
function resetPage() {
  currentPage.value = 1
}

// modal handlers
function openCreate() {
  isEditing.value = false
  validated.value = false
  currentRole.value = {
    id: null,
    name: '',
  }
  showModal.value = true
}

function openEdit(role) {
  isEditing.value = true
  validated.value = false
  currentRole.value = { ...role }
  showModal.value = true
}

function confirmDelete(id) {
  if (confirm('Are you sure you want to delete this role?')) {
    roleStore.deleteRole(id)
  }
}

async function handleSubmit(e) {
  const form = e.currentTarget
  if (!form.checkValidity()) {
    e.preventDefault()
    e.stopPropagation()
    validated.value = true
    return
  }
  e.preventDefault()
  const payload = {
    name: currentRole.value.name,
  }
  if (isEditing.value) {
    await roleStore.updateRole(currentRole.value.id, payload)
  } else {
    await roleStore.createRole(payload)
  }
  showModal.value = false
  roleStore.fetchRoles()
}
</script>

<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader class="d-flex justify-content-between align-items-center">
          <strong>Role List</strong>
          <div class="d-flex gap-2 mb-3">
            <CButton color="dark" @click="openCreate">+ Create Role</CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          <!-- search + page-size -->
          <div class="d-flex justify-content-start align-items-center flex-wrap mb-3">
            <!-- Search Input -->
            <div class="d-flex align-items-center me-2" style="min-width: 250px">
              <input
                type="text"
                v-model="searchQuery"
                class="form-control"
                style="max-width: 250px"
                placeholder="Search by role name"
                @input="resetPage"
              />
            </div>
            <!-- Items per Page -->
            <div
              class="d-flex align-items-center"
              style="float: right; right: 18px; position: absolute"
            >
              <label class="me-2 mb-0">Show:</label>
              <select v-model="itemsPerPage" @change="resetPage" class="form-select w-auto">
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
            </div>
          </div>

          <!-- roles table -->
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>ID</CTableHeaderCell>
                <CTableHeaderCell>Role</CTableHeaderCell>
                <CTableHeaderCell>Created At</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="role in paginatedRoles" :key="role.id">
                <CTableDataCell>{{ role.id }}</CTableDataCell>
                <CTableDataCell>{{ role.name }}</CTableDataCell>
                <CTableDataCell>{{ role.createdAt }}</CTableDataCell>
                <CTableDataCell>
                  <!-- Edit role Button -->
                  <CButton
                    size="sm"
                    color="info"
                    class="me-2 text-white"
                    title="Edit Role"
                    @click="openEdit(role)"
                  >
                    <CIcon :icon="cilPencil" />
                  </CButton>

                  <!-- Delete Role Button -->
                  <CButton
                    size="sm"
                    color="danger"
                    class="text-white"
                    title="Delete Role"
                    @click="confirmDelete(role.id)"
                  >
                    <CIcon :icon="cilTrash" />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
              <CTableRow v-if="paginatedRoles.length === 0">
                <CTableDataCell colspan="8" class="text-center"> No role found. </CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>

          <!-- pagination controls -->
          <div class="text-end mb-3">
            <strong>Total Records:</strong> {{ filteredRoles.length }}
          </div>
          <div class="d-flex justify-content-between align-items-center mt-3">
            <CButton color="dark" variant="outline" :disabled="currentPage === 1" @click="prevPage">
              Previous
            </CButton>
            <div>Page {{ currentPage }} of {{ totalPages }}</div>
            <CButton
              color="dark"
              variant="outline"
              :disabled="currentPage === totalPages"
              @click="nextPage"
            >
              Next
            </CButton>
          </div>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>

  <!-- Create/Edit Modal -->
  <CModal :visible="showModal" @close="showModal = false" backdrop="static" size="lg">
    <CModalHeader>
      <CModalTitle>{{ isEditing ? 'Edit Role' : 'Add Role' }}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CForm
        class="row g-3 needs-validation"
        enctype="multipart/form-data"
        novalidate
        :validated="validated"
        @submit="handleSubmit"
      >
        <CCol :md="12">
          <CFormLabel for="name">Role</CFormLabel>
          <CFormInput id="name" v-model="currentRole.name" required />
          <CFormFeedback invalid>Role is required.</CFormFeedback>
        </CCol>

        <CCol :md="12" class="d-flex justify-content-end">
          <CButton color="secondary" class="me-2" @click="showModal = false">Cancel</CButton>
          <CButton color="success" type="submit">{{ isEditing ? 'Update' : 'Create' }}</CButton>
        </CCol>
      </CForm>
    </CModalBody>
  </CModal>
</template>
