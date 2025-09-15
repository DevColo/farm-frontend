<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { usePastureStore } from '@/stores/pasture.store'
import { useFeedingStore } from '@/stores/feeding.store'
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
  CFormFeedback,
} from '@coreui/vue'
import { cilPencil, cilTrash } from '@coreui/icons'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'

const pastureStore = usePastureStore()
const feedingStore = useFeedingStore()
const foodStore = useFoodStore()

const showModal = ref(false)
const isEditing = ref(false)
const validated = ref(false)

const currentFeeding = ref({
  id: null,
  food_id: '',
  quantity: '',
  fed_date: '',
  pasture_id: '',
})

// fetch data
onMounted(() => {
  feedingStore.fetchFeedings()
  pastureStore.fetchPastures()
  foodStore.fetchFoods()
})

// search & pagination
const searchQuery = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)

const filteredFeedings = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return feedingStore.feedings
  return feedingStore.feedings.filter((c) => [c.food].some((f) => f?.toLowerCase().includes(q)))
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredFeedings.value.length / itemsPerPage.value)),
)
const paginatedFeedings = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredFeedings.value.slice(start, start + itemsPerPage.value)
})

// Fix for the prop type warning
watch(
  () => currentFeeding.value.pasture_id,
  (newValue) => {
    if (typeof newValue === 'number') {
      currentFeeding.value.pasture_id = String(newValue)
    }
  },
)

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
  currentFeeding.value = {
    id: null,
    food_id: '',
    quantity: '',
    fed_date: '',
    pasture_id: '',
  }
  showModal.value = true
}

function openEdit(feeding) {
  isEditing.value = true
  validated.value = false
  currentFeeding.value = { ...feeding }
  showModal.value = true
}

function confirmDelete(id) {
  if (confirm('Are you sure you want to delete this feeding record?')) {
    feedingStore.deleteFeeding(id)
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
    food_id: currentFeeding.value.food_id.value,
    pasture_id: currentFeeding.value.pasture_id.value,
    fed_date: currentFeeding.value.fed_date,
    quantity: currentFeeding.value.quantity,
  }
  if (isEditing.value) {
    await feedingStore.editFeeding(currentFeeding.value.id, payload)
  } else {
    await feedingStore.createFeeding(payload)
  }
  showModal.value = false
  //resetPage()
}

// Export in PDF
async function exportPDF() {
  const { default: jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text('feedings Feeding Records', 105, 15, { align: 'center' })
  doc.setFontSize(12)
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 25, { align: 'center' })
  autoTable(doc, {
    startY: 35,
    head: [['ID', 'Food', 'Quantity', 'Date of Feeding', 'Pasture']],
    body: filteredFeedings.value.map((feeding) => [
      feeding.id,
      feeding.food,
      feeding.quantity,
      feeding.fed_date,
      feeding.pasture?.pasture,
    ]),
  })
  doc.save('feedings.pdf')
}

// Export in CSV
function exportCSV() {
  const rows = [
    ['ID', 'Food', 'Quantity', 'Date of Feeding', 'Pasture'],
    ...filteredFeedings.value.map((feeding) => [
      feeding.id,
      feeding.food?.food,
      feeding.quantity,
      feeding.fed_date,
      feeding.pasture?.pasture,
    ]),
  ]

  const csvContent = rows
    .map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', 'feedings.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Get Comsumed Quantity
function getConsumedQuantity(food) {
  if (!food.Feedings || food.Feedings.length === 0) return 0

  return food.Feedings.reduce((total, feeding) => {
    return total + parseFloat(feeding.quantity || 0)
  }, 0)
}

const selectedFood = computed(() => {
  return foodStore.foods.find((food) => food.id === currentFeeding.food_id) || null
})

watch(
  () => currentFeeding.value.food_id,
  (foodId) => {
    selectedFood.value = foodStore.foods.find((f) => f.id === foodId) || null
  },
)

const availableQuantity = computed(() => {
  if (!selectedFood.value) return 0
  const consumed = getConsumedQuantity(selectedFood.value)
  return selectedFood.value.quantity - consumed
})
</script>

<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader class="d-flex justify-content-between align-items-center">
          <strong>Cows Feeding List</strong>
          <div class="d-flex gap-2 mb-3">
            <CButton color="dark" variant="outline" title="Export CSV" @click="exportCSV"
              ><CIcon icon="cil-file"
            /></CButton>
            <CButton color="dark" variant="outline" class="sm" title="Export PDF" @click="exportPDF"
              ><CIcon icon="cil-cloud-download"
            /></CButton>
            <CButton color="dark" @click="openCreate">+ Add Feeding Record</CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          <!-- search + page-size -->

          <div class="d-flex justify-content-between align-items-center mb-3">
            <input
              type="text"
              v-model="searchQuery"
              class="form-control w-25"
              placeholder="Search by food"
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

          <!-- cows table -->
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Food</CTableHeaderCell>
                <CTableHeaderCell>Quantity</CTableHeaderCell>
                <CTableHeaderCell>Date of Feeding</CTableHeaderCell>
                <CTableHeaderCell>Pasture</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="feeding in paginatedFeedings" :key="feeding.id">
                <CTableDataCell>{{ feeding.food?.food ?? '' }}</CTableDataCell>
                <CTableDataCell>{{ feeding.quantity }}</CTableDataCell>
                <CTableDataCell>{{ feeding.fed_date }}</CTableDataCell>
                <CTableDataCell
                  ><router-link
                    :to="`/pasture/cow/${feeding.pasture?.id}`"
                    class="text-decoration-none text-dark"
                    >{{ feeding.pasture?.pasture ?? '' }}</router-link
                  ></CTableDataCell
                >
                <CTableDataCell>
                  <!-- Edit Cow Button -->
                  <CButton
                    size="sm"
                    color="info"
                    class="me-2 text-white"
                    title="Edit Feeding Record"
                    @click="openEdit(feeding)"
                  >
                    <CIcon :icon="cilPencil" />
                  </CButton>

                  <!-- Delete Cow Button -->
                  <CButton
                    size="sm"
                    color="danger"
                    class="text-white"
                    title="Delete Feeding Record"
                    @click="confirmDelete(feeding.id)"
                  >
                    <CIcon :icon="cilTrash" />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
              <CTableRow v-if="paginatedFeedings.length === 0">
                <CTableDataCell colspan="8" class="text-center">
                  No feeding record found.
                </CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>

          <!-- pagination controls -->
          <div class="text-end mb-3">
            <strong>Total Records:</strong> {{ filteredFeedings.length }}
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
  <!-- <CModal :visible="showModal" size="lg" backdrop="static" @close="() => (visible = false)"> -->
  <CModal :visible="showModal" @close="showModal = false" backdrop="static" size="md">
    <CModalHeader>
      <CModalTitle>{{
        isEditing ? 'Edit Cow Feeding Record' : 'Add Cow Feeding Record'
      }}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CForm
        class="row g-3 needs-validation"
        novalidate
        :validated="validated"
        @submit="handleSubmit"
      >
        <CCol :md="12">
          <CFormLabel for="food">Food</CFormLabel>
          <Multiselect
            id="food"
            v-model="currentFeeding.food_id"
            :options="[
              { label: 'Select Food', value: '' },
              ...foodStore.foods.map((food) => ({
                label:
                  food.food + ' (' + (food.quantity - getConsumedQuantity(food)) + ' kg available)',
                value: food.id,
              })),
            ]"
            label="label"
            track-by="value"
            placeholder="Select Food"
            :searchable="true"
            :allowEmpty="true"
            @input="validated.value = !!currentFeeding.food_id"
          />

          <!-- <Multiselect
            id="food"
            v-model="currentFeeding.food_id"
            :options="[
              { label: 'Select Food', value: '' },
              ...foodStore.foods.map((food) => ({
                label: food.food + ' (' + (food.quantity - getConsumedQuantity(food)) + 'kg)',
                value: food.id,
              })),
            ]"
            label="label"
            track-by="value"
            placeholder="Select Food"
            :searchable="true"
            :allowEmpty="true"
            :value="currentFeeding.food_id"
            @input="validated.value = !!currentFeeding.food_id"
            required
          /> -->
          <CFormFeedback invalid v-if="!currentFeeding.food_id">Food is required.</CFormFeedback>
        </CCol>

        <CCol :md="12">
          <CFormLabel for="quantity">Quantity (kg)</CFormLabel>
          <CFormInput
            id="quantity"
            v-model="currentFeeding.quantity"
            type="number"
            min="1"
            required
          />
          <CFormFeedback invalid v-if="!currentFeeding.quantity">
            Quantity is quantity.
          </CFormFeedback>
        </CCol>

        <CCol :md="12">
          <CFormLabel for="pasture">Pasture</CFormLabel>
          <Multiselect
            id="pasture"
            v-model="currentFeeding.pasture_id"
            :options="[
              { label: 'Select Pasture', value: '' },
              ...pastureStore.pastures.map((pasture) => ({
                label: pasture.pasture,
                value: pasture.id,
              })),
            ]"
            label="label"
            track-by="value"
            placeholder="Select Pasture"
            :searchable="true"
            :allowEmpty="true"
            :value="currentFeeding.pasture_id"
            @input="validated.value = !!currentFeeding.pasture_id"
            required
          />
          <CFormFeedback invalid v-if="!currentFeeding.pasture_id"
            >Pasture is required.</CFormFeedback
          >
        </CCol>

        <CCol :md="12">
          <CFormLabel for="dateOfFeeding">Date of Feeding</CFormLabel>
          <CFormInput id="dateOfFeeding" type="date" v-model="currentFeeding.fed_date" required />
          <CFormFeedback invalid>Date of Feeding is required.</CFormFeedback>
        </CCol>

        <CCol :xs="12" class="d-flex justify-content-end">
          <CButton color="secondary" class="me-2" @click="showModal = false">Cancel</CButton>
          <CButton color="success" type="submit">{{ isEditing ? 'Update' : 'Create' }}</CButton>
        </CCol>
      </CForm>
    </CModalBody>
  </CModal>
</template>
