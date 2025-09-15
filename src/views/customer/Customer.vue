<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCustomerStore } from '@/stores/customer.store'
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
  CModalFooter,
  CForm,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CFormSelect,
  CFormCheck,
} from '@coreui/vue'
import CIcon from '@coreui/icons-vue'
import { cilPencil, cilTrash } from '@coreui/icons'

const customerStore = useCustomerStore()

const showModal = ref(false)
const isEditing = ref(false)
const currentCustomer = ref({
  food: '',
  quantity: '',
  description: '',
})

const searchQuery = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)

onMounted(() => {
  customerStore.fetchCustomers()
})

const filteredCustomers = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return customerStore.customers
  return customerStore.customers.filter((c) =>
    [c.first_name, c.last_name, c.email, c.phone].some((field) =>
      field?.toLowerCase().includes(query),
    ),
  )
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredCustomers.value.length / itemsPerPage.value)),
)
const paginatedCustomers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredCustomers.value.slice(start, end)
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

function confirmDelete(id) {
  if (confirm('Are you sure you want to delete this food?')) {
    customerStore.deleteCustomer(id)
  }
}

function openCreate() {
  isEditing.value = false
  currentCustomer.value = {
    food: '',
    quantity: '',
    description: '',
  }
  showModal.value = true
}

function openEdit(food) {
  isEditing.value = true
  currentCustomer.value = { ...food }
  showModal.value = true
}

// Computed property to sync status string with checkbox boolean
const isActive = computed({
  get() {
    return currentCustomer.value.status === '1'
  },
  set(value) {
    currentCustomer.value.status = value ? '1' : '0'
  },
})

function handleSubmit() {
  if (isEditing.value) {
    customerStore.editCustomer(currentCustomer.value.id, currentCustomer.value)
  } else {
    customerStore.createCustomer(currentCustomer.value)
  }
  showModal.value = false
}
</script>

<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader>
          <div class="d-flex justify-content-between align-items-center">
            <strong>Customers</strong>
            <CButton color="dark" @click="openCreate">+ Create Customer Profile</CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          <div class="d-flex justify-content-between align-items-center mb-3">
            <input
              type="text"
              v-model="searchQuery"
              class="form-control w-25"
              placeholder="Search by first name, last name, or phone"
              @input="resetPage"
            />

            <div class="d-flex align-items-center">
              <label class="me-2">Show:</label>
              <select v-model="itemsPerPage" @change="resetPage" class="form-select">
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
            </div>
          </div>

          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Full Name</CTableHeaderCell>
                <CTableHeaderCell>Phone</CTableHeaderCell>
                <CTableHeaderCell>Email</CTableHeaderCell>
                <CTableHeaderCell>Created At</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="customer in paginatedCustomers" :key="customer.id">
                <CTableDataCell
                  ><router-link :to="`/customers/${customer.id}`">
                    {{ customer.first_name + ' ' ?? '' }} {{ customer.last_name ?? '' }}
                  </router-link></CTableDataCell
                >
                <CTableDataCell>{{ customer.phone ?? '' }}</CTableDataCell>
                <CTableDataCell>{{ customer.email ?? '' }}</CTableDataCell>
                <CTableDataCell>{{
                  new Date(customer.createdAt).toLocaleString() || ''
                }}</CTableDataCell>
                <CTableDataCell>
                  <CButton
                    color="info"
                    size="sm"
                    class="me-2 text-white"
                    title="Edit customer"
                    @click="openEdit(customer)"
                  >
                    <CIcon :icon="cilPencil" />
                  </CButton>
                  <CButton
                    color="danger"
                    title="Delete customer"
                    size="sm"
                    class="text-white"
                    @click="confirmDelete(customer.id)"
                  >
                    <CIcon :icon="cilTrash" />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
              <CTableRow v-if="paginatedCustomers.length === 0">
                <CTableDataCell colspan="6" class="text-center">No customer found.</CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>

          <div class="text-end mb-3">
            <strong>Total Records:</strong> {{ filteredCustomers.length }}
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
  <CModal :visible="showModal" @close="showModal = false" backdrop="static">
    <CModalHeader>
      <CModalTitle>{{
        isEditing ? 'Edit Customer Profile' : 'Create Customer Profile'
      }}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CForm @submit.prevent="handleSubmit">
        <div class="mb-3">
          <CFormLabel>First Name</CFormLabel>
          <CFormInput
            v-model="currentCustomer.first_name"
            placeholder="Enter first name"
            required
          />
          <CFormFeedback invalid v-if="!currentCustomer.first_name"
            >First name is required.</CFormFeedback
          >
        </div>
        <div class="mb-3">
          <CFormLabel>Last Name</CFormLabel>
          <CFormInput v-model="currentCustomer.last_name" placeholder="Enter last name" />
        </div>
        <div class="mb-3">
          <CFormLabel>Phone</CFormLabel>
          <CFormInput v-model="currentCustomer.phone" placeholder="Enter phone number" />
          <CFormFeedback invalid v-if="!currentCustomer.phone"
            >Last name is required.</CFormFeedback
          >
        </div>
        <div class="mb-3">
          <CFormLabel>Email</CFormLabel>
          <CFormInput v-model="currentCustomer.email" placeholder="Enter email" />
        </div>
        <CModalFooter>
          <CButton color="secondary" @click="showModal = false">Cancel</CButton>
          <CButton color="success" type="submit">{{ isEditing ? 'Update' : 'Create' }}</CButton>
        </CModalFooter>
      </CForm>
    </CModalBody>
  </CModal>
</template>
