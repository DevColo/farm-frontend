<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFoodStore } from '@/stores/food.store'
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

const foodStore = useFoodStore()

const showModal = ref(false)
const isEditing = ref(false)
const currentFood = ref({
  food: '',
  quantity: '',
  description: '',
})

const searchQuery = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)

onMounted(() => {
  foodStore.fetchFoods()
})

const filteredFoods = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return foodStore.foods
  return foodStore.foods.filter((f) =>
    [f.food, f.description].some((field) => field?.toLowerCase().includes(query)),
  )
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredFoods.value.length / itemsPerPage.value)),
)
const paginatedFoods = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredFoods.value.slice(start, end)
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
    foodStore.deleteFood(id)
  }
}

function openCreate() {
  isEditing.value = false
  currentFood.value = {
    food: '',
    quantity: '',
    description: '',
  }
  showModal.value = true
}

function openEdit(food) {
  isEditing.value = true
  currentFood.value = { ...food }
  showModal.value = true
}

// Computed property to sync status string with checkbox boolean
const isActive = computed({
  get() {
    return currentFood.value.status === '1'
  },
  set(value) {
    currentFood.value.status = value ? '1' : '0'
  },
})

function handleSubmit() {
  if (isEditing.value) {
    foodStore.editFood(currentFood.value.id, currentFood.value)
  } else {
    foodStore.createFood(currentFood.value)
  }
  showModal.value = false
  foodStore.fetchFoods()
}

// Get Comsumed Quantity
function getConsumedQuantity(food) {
  if (!food.Feedings || food.Feedings.length === 0) return 0

  return food.Feedings.reduce((total, feeding) => {
    return total + parseFloat(feeding.quantity || 0)
  }, 0)
}
</script>

<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader>
          <div class="d-flex justify-content-between align-items-center">
            <strong>Food List</strong>
            <CButton color="dark" @click="openCreate">+ Create Food</CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          <div class="d-flex justify-content-between align-items-center mb-3">
            <input
              type="text"
              v-model="searchQuery"
              class="form-control w-25"
              placeholder="Search by food or description"
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
                <CTableHeaderCell>Food</CTableHeaderCell>
                <CTableHeaderCell>Description</CTableHeaderCell>
                <CTableHeaderCell>Quantity Added Instock</CTableHeaderCell>
                <CTableHeaderCell>Quantity Instock</CTableHeaderCell>
                <CTableHeaderCell>Quantity Consumed</CTableHeaderCell>
                <CTableHeaderCell>Created At</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="food in paginatedFoods" :key="food.id">
                <CTableDataCell>{{ food.food ?? '' }}</CTableDataCell>
                <CTableDataCell>{{ food.description ?? '' }}</CTableDataCell>
                <CTableDataCell>{{ food.quantity ?? '' }}</CTableDataCell>
                <CTableDataCell>{{ food.quantity - getConsumedQuantity(food) }}</CTableDataCell>
                <CTableDataCell>{{ getConsumedQuantity(food) }}</CTableDataCell>
                <CTableDataCell>{{
                  new Date(food.createdAt).toLocaleString() || ''
                }}</CTableDataCell>
                <CTableDataCell>
                  <CButton
                    color="info"
                    size="sm"
                    class="me-2 text-white"
                    title="Edit Food"
                    @click="openEdit(food)"
                  >
                    <CIcon :icon="cilPencil" />
                  </CButton>
                  <CButton
                    color="danger"
                    title="Delete Food"
                    size="sm"
                    class="text-white"
                    @click="confirmDelete(food.id)"
                  >
                    <CIcon :icon="cilTrash" />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
              <CTableRow v-if="paginatedFoods.length === 0">
                <CTableDataCell colspan="6" class="text-center">No food found.</CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>

          <div class="text-end mb-3">
            <strong>Total Records:</strong> {{ filteredFoods.length }}
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
      <CModalTitle>{{ isEditing ? 'Edit Food' : 'Create Food' }}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CForm @submit.prevent="handleSubmit">
        <div class="mb-3">
          <CFormLabel>Food</CFormLabel>
          <CFormInput v-model="currentFood.food" placeholder="Enter food name" required />
        </div>
        <div class="mb-3">
          <CFormLabel>Quantity (Kg)</CFormLabel>
          <CFormInput v-model="currentFood.quantity" type="number" required />
        </div>
        <div class="mb-3">
          <CFormLabel>Description</CFormLabel>
          <CFormTextarea rows="3" v-model="currentFood.description" />
        </div>
        <CModalFooter>
          <CButton color="secondary" @click="showModal = false">Cancel</CButton>
          <CButton color="success" type="submit">{{ isEditing ? 'Update' : 'Create' }}</CButton>
        </CModalFooter>
      </CForm>
    </CModalBody>
  </CModal>
</template>
