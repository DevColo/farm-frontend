<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useCowStore } from '@/stores/cow.store'
import { useCowSalesStore } from '@/stores/cow-sales.store'
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
  CFormFeedback,
} from '@coreui/vue'
import { cilPencil, cilTrash } from '@coreui/icons'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'

const cowStore = useCowStore()
const cowSalesStore = useCowSalesStore()
const customerStore = useCustomerStore()

const showModal = ref(false)
const isEditing = ref(false)
const validated = ref(false)

const currentCowSales = ref({
  id: null,
  cow_id: '',
  customer_id: '',
  unit_price: '',
  sales_date: '',
})

// fetch data
onMounted(() => {
  cowSalesStore.fetchCowSales()
  cowStore.fetchCows()
  customerStore.fetchCustomers()
})

// search & pagination
const searchQuery = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)

const filteredCowSales = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return cowSalesStore.cowSales
  return cowSalesStore.cowSales.filter((m) =>
    [m.sales_date, m.quantity].some((f) => f?.toLowerCase().includes(q)),
  )
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredCowSales.value.length / itemsPerPage.value)),
)
const paginatedCowSales = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredCowSales.value.slice(start, start + itemsPerPage.value)
})

// Fix for the prop type warning
watch(
  () => currentCowSales.value.cow_id,
  (newValue) => {
    if (typeof newValue === 'number') {
      currentCowSales.value.cow_id = String(newValue)
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
  currentCowSales.value = {
    id: null,
    cow_id: '',
    customer_id: '',
    unit_price: '',
    sales_date: '',
  }
  showModal.value = true
}

function openEdit(cowSales) {
  isEditing.value = true
  validated.value = false
  currentCowSales.value = { ...cowSales }
  showModal.value = true
}

function confirmDelete(id) {
  if (confirm('Are you sure you want to delete this cow sales record?')) {
    cowSalesStore.deleteCowSales(id)
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
    cow_id: currentCowSales.value.cow_id.value,
    customer_id: currentCowSales.value.customer_id.value,
    unit_price: currentCowSales.value.unit_price,
    sales_date: currentCowSales.value.sales_date,
  }
  if (isEditing.value) {
    await cowSalesStore.editCowSales(currentCowSales.value.id, payload)
  } else {
    await cowSalesStore.createCowSales(payload)
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
    head: [['ID', 'Food', 'Quantity', 'Sales Date', 'Pasture']],
    body: filteredCowSales.value.map((feeding) => [
      feeding.id,
      feeding.food,
      feeding.quantity,
      feeding.sales_date,
      feeding.pasture?.pasture,
    ]),
  })
  doc.save('feedings.pdf')
}

// Export in CSV
function exportCSV() {
  const rows = [
    ['ID', 'Food', 'Quantity', 'Sales Date', 'Pasture'],
    ...filteredCowSales.value.map((feeding) => [
      feeding.id,
      feeding.food?.food,
      feeding.quantity,
      feeding.sales_date,
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

const selectedCow = computed(() => {
  return cowStore.cows.find((cow) => cow.id === currentCowSales.cow_id) || null
})

watch(
  () => currentCowSales.value.cow_id,
  (foodId) => {
    selectedCow.value = cowStore.cows.find((f) => f.id === foodId) || null
  },
)
</script>

<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader class="d-flex justify-content-between align-items-center">
          <strong>Cow Sales List</strong>
          <div class="d-flex gap-2 mb-3">
            <CButton color="dark" variant="outline" title="Export CSV" @click="exportCSV"
              ><CIcon icon="cil-file"
            /></CButton>
            <CButton color="dark" variant="outline" class="sm" title="Export PDF" @click="exportPDF"
              ><CIcon icon="cil-cloud-download"
            /></CButton>
            <CButton color="dark" @click="openCreate">+ Add Sales</CButton>
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

          <!-- sales table -->
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Cow</CTableHeaderCell>
                <CTableHeaderCell>Customer</CTableHeaderCell>
                <CTableHeaderCell>Sale Date</CTableHeaderCell>
                <CTableHeaderCell>Cost (Rwf)</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="cowSales in paginatedCowSales" :key="cowSales.id">
                <CTableDataCell
                  ><router-link :to="`/cows/${cowSales.cow?.id}`">
                    {{ cowSales.cow?.ear_tag ?? '' }}
                  </router-link></CTableDataCell
                >
                <CTableDataCell>
                  <router-link :to="`/customers/${cowSales.customer?.id}`">
                    {{ cowSales.customer?.first_name + ' ' + cowSales.customer?.last_name }}
                  </router-link>
                </CTableDataCell>
                <CTableDataCell>{{ cowSales.sales_date }}</CTableDataCell>
                <CTableDataCell>{{ cowSales.unit_price }}</CTableDataCell>
                <CTableDataCell
                  ><router-link
                    :to="`/pasture/cow/${cowSales.pasture?.id}`"
                    class="text-decoration-none text-dark"
                    >{{ cowSales.pasture?.pasture ?? '' }}</router-link
                  ></CTableDataCell
                >
                <CTableDataCell>
                  <!-- Edit Cow Button -->
                  <CButton
                    size="sm"
                    color="info"
                    class="me-2 text-white"
                    title="Edit cowSales Record"
                    @click="openEdit(cowSales)"
                  >
                    <CIcon :icon="cilPencil" />
                  </CButton>

                  <!-- Delete Cow Button -->
                  <CButton
                    size="sm"
                    color="danger"
                    class="text-white"
                    title="Delete cowSales Record"
                    @click="confirmDelete(cowSales.id)"
                  >
                    <CIcon :icon="cilTrash" />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
              <CTableRow v-if="paginatedCowSales.length === 0">
                <CTableDataCell colspan="8" class="text-center">
                  No sales record found.
                </CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>

          <!-- pagination controls -->
          <div class="text-end mb-3">
            <strong>Total Records:</strong> {{ filteredCowSales.length }}
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
        isEditing ? 'Edit Milk Sales Record' : 'Add Milk Sales Record'
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
          <CFormLabel for="cow">Cow</CFormLabel>
          <Multiselect
            id="cow"
            v-model="currentCowSales.cow_id"
            :options="[
              { label: 'Select Cow', value: '' },
              ...cowStore.cows.map((cow) => ({
                label: cow.ear_tag,
                value: cow.id,
              })),
            ]"
            label="label"
            track-by="value"
            placeholder="Select Cow"
            :searchable="true"
            :allowEmpty="true"
            @input="validated.value = !!currentCowSales.cow_id"
          />
          <CFormFeedback invalid v-if="!currentCowSales.cow_id">Cow is required.</CFormFeedback>
        </CCol>

        <CCol :md="12">
          <CFormLabel for="unit_price">Price (Rwf)</CFormLabel>
          <CFormInput
            id="unit_price"
            v-model="currentCowSales.unit_price"
            type="number"
            min="1"
            required
          />
          <CFormFeedback invalid v-if="!currentCowSales.unit_price">
            Price is required.
          </CFormFeedback>
        </CCol>

        <CCol :md="12">
          <CFormLabel for="customer">Customer</CFormLabel>
          <Multiselect
            id="customer"
            v-model="currentCowSales.customer_id"
            :options="[
              { label: 'Select Customer', value: '' },
              ...customerStore.customers.map((customer) => ({
                label: customer.first_name + ' ' + customer.last_name,
                value: customer.id,
              })),
            ]"
            label="label"
            track-by="value"
            placeholder="Select Customer"
            :searchable="true"
            :allowEmpty="true"
            :value="currentCowSales.customer_id"
            @input="validated.value = !!currentCowSales.customer_id"
            required
          />
          <CFormFeedback invalid v-if="!currentCowSales.customer_id"
            >Customer is required.</CFormFeedback
          >
        </CCol>

        <CCol :md="12">
          <CFormLabel for="salesDate">Sales Date</CFormLabel>
          <CFormInput id="salesDate" type="date" v-model="currentCowSales.sales_date" required />
          <CFormFeedback invalid>Sales Date is required.</CFormFeedback>
        </CCol>

        <CCol :xs="12" class="d-flex justify-content-end">
          <CButton color="secondary" class="me-2" @click="showModal = false">Cancel</CButton>
          <CButton color="success" type="submit">{{ isEditing ? 'Update' : 'Create' }}</CButton>
        </CCol>
      </CForm>
    </CModalBody>
  </CModal>
</template>
