<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useMilkStore } from '@/stores/milk.store'
import { useMilkSalesStore } from '@/stores/milk-sales.store'
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

const milkStore = useMilkStore()
const milkSalesStore = useMilkSalesStore()
const customerStore = useCustomerStore()

const showModal = ref(false)
const isEditing = ref(false)
const validated = ref(false)

const currentMilkSales = ref({
  id: null,
  milk_record_id: '',
  customer_id: '',
  quantity: '',
  unit_price: '',
  sales_date: '',
})

// fetch data
onMounted(() => {
  milkSalesStore.fetchMilkSales()
  milkStore.fetchMilkRecords()
  customerStore.fetchCustomers()
})

// search & pagination
const searchQuery = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)

const filteredMilkSales = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return milkSalesStore.milkSales
  return milkSalesStore.milkSales.filter((m) =>
    [m.sales_date, m.quantity].some((f) => f?.toLowerCase().includes(q)),
  )
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredMilkSales.value.length / itemsPerPage.value)),
)
const paginatedMilkSales = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredMilkSales.value.slice(start, start + itemsPerPage.value)
})

// Fix for the prop type warning
watch(
  () => currentMilkSales.value.milk_record_id,
  (newValue) => {
    if (typeof newValue === 'number') {
      currentMilkSales.value.milk_record_id = String(newValue)
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
  currentMilkSales.value = {
    id: null,
    milk_record_id: '',
    customer_id: '',
    quantity: '',
    unit_price: '',
    sales_date: '',
  }
  showModal.value = true
}

function openEdit(milkSales) {
  isEditing.value = true
  validated.value = false
  currentMilkSales.value = { ...milkSales }
  showModal.value = true
}

function confirmDelete(id) {
  if (confirm('Are you sure you want to delete this milk sales record?')) {
    milkSalesStore.deleteMilkSales(id)
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
    milk_record_id: currentMilkSales.value.milk_record_id.value,
    customer_id: currentMilkSales.value.customer_id.value,
    quantity: currentMilkSales.value.quantity,
    unit_price: currentMilkSales.value.unit_price,
    sales_date: currentMilkSales.value.sales_date,
  }
  if (isEditing.value) {
    await milkSalesStore.editMilkSales(currentMilkSales.value.id, payload)
  } else {
    await milkSalesStore.createMilkSales(payload)
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
    body: filteredMilkSales.value.map((feeding) => [
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
    ...filteredMilkSales.value.map((feeding) => [
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

// Get Comsumed Quantity
function getConsumedQuantity(milk) {
  if (!milk.Feedings || milk.Feedings.length === 0) return 0

  return milk.Feedings.reduce((total, feeding) => {
    return total + parseFloat(feeding.quantity || 0)
  }, 0)
}

// Get Revenue
function getRevenue(milk) {
  const quantity = parseFloat(milk.quantity) || 0
  const unitPrice = parseFloat(milk.unit_price) || 0
  return (quantity * unitPrice).toFixed(2)
}

const selectedFood = computed(() => {
  return milkStore.milkRecords.find((milk) => milk.id === currentMilkSales.milk_record_id) || null
})

watch(
  () => currentMilkSales.value.milk_record_id,
  (foodId) => {
    selectedFood.value = milkStore.milkRecords.find((f) => f.id === foodId) || null
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
          <strong>Milk Sales List</strong>
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
                <CTableHeaderCell>Milk Recorded Date</CTableHeaderCell>
                <CTableHeaderCell>Customer</CTableHeaderCell>
                <CTableHeaderCell>Qty Recorded</CTableHeaderCell>
                <CTableHeaderCell>Sold Date</CTableHeaderCell>
                <CTableHeaderCell>Qty Sold</CTableHeaderCell>
                <CTableHeaderCell>Unit Price (Rwf)</CTableHeaderCell>
                <CTableHeaderCell>Revenue (Rwf)</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="milkSales in paginatedMilkSales" :key="milkSales.id">
                <CTableDataCell>{{ milkSales.milk_record?.record_date ?? '' }}</CTableDataCell>
                <CTableDataCell
                  ><router-link :to="`/customers/${milkSales.customer?.id}`">
                    {{ milkSales.customer?.first_name + ' ' + milkSales.customer?.last_name }}
                  </router-link></CTableDataCell
                >
                <CTableDataCell>{{
                  Number(milkSales.milk_record?.morning_qty) +
                    Number(milkSales.milk_record?.evening_qty) ?? ''
                }}</CTableDataCell>
                <CTableDataCell>{{ milkSales.sales_date }}</CTableDataCell>
                <CTableDataCell>{{ milkSales.quantity }}</CTableDataCell>
                <CTableDataCell>{{ milkSales.unit_price }}</CTableDataCell>
                <CTableDataCell>{{ getRevenue(milkSales) }}</CTableDataCell>
                <CTableDataCell
                  ><router-link
                    :to="`/pasture/cow/${milkSales.pasture?.id}`"
                    class="text-decoration-none text-dark"
                    >{{ milkSales.pasture?.pasture ?? '' }}</router-link
                  ></CTableDataCell
                >
                <CTableDataCell>
                  <!-- Edit Cow Button -->
                  <CButton
                    size="sm"
                    color="info"
                    class="me-2 text-white"
                    title="Edit milkSales Record"
                    @click="openEdit(milkSales)"
                  >
                    <CIcon :icon="cilPencil" />
                  </CButton>

                  <!-- Delete Cow Button -->
                  <CButton
                    size="sm"
                    color="danger"
                    class="text-white"
                    title="Delete milkSales Record"
                    @click="confirmDelete(milkSales.id)"
                  >
                    <CIcon :icon="cilTrash" />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
              <CTableRow v-if="paginatedMilkSales.length === 0">
                <CTableDataCell colspan="8" class="text-center">
                  No sales record found.
                </CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>

          <!-- pagination controls -->
          <div class="text-end mb-3">
            <strong>Total Records:</strong> {{ filteredMilkSales.length }}
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
          <CFormLabel for="food">Recorded Milk</CFormLabel>
          <Multiselect
            id="food"
            v-model="currentMilkSales.milk_record_id"
            :options="[
              { label: 'Select Recorded Milk Date', value: '' },
              ...milkStore.milkRecords.map((milk) => ({
                label:
                  milk.record_date +
                  ' (' +
                  (Number(milk.morning_qty) +
                    Number(milk.evening_qty) -
                    Number(getConsumedQuantity(milk))) +
                  ' kg available)',
                value: milk.id,
              })),
            ]"
            label="label"
            track-by="value"
            placeholder="Select Recorded Milk Date"
            :searchable="true"
            :allowEmpty="true"
            @input="validated.value = !!currentMilkSales.milk_record_id"
          />
          <CFormFeedback invalid v-if="!currentMilkSales.milk_record_id"
            >Recorded Milk Date is required.</CFormFeedback
          >
        </CCol>

        <CCol :md="12">
          <CFormLabel for="quantity">Quantity (kg)</CFormLabel>
          <CFormInput
            id="quantity"
            v-model="currentMilkSales.quantity"
            type="number"
            min="1"
            required
          />
          <CFormFeedback invalid v-if="!currentMilkSales.quantity">
            Quantity is quantity.
          </CFormFeedback>
        </CCol>

        <CCol :md="12">
          <CFormLabel for="unit_price">Unit Price (Rwf)</CFormLabel>
          <CFormInput
            id="unit_price"
            v-model="currentMilkSales.unit_price"
            type="number"
            min="1"
            required
          />
          <CFormFeedback invalid v-if="!currentMilkSales.unit_price">
            Unit Price is required.
          </CFormFeedback>
        </CCol>

        <CCol :md="12">
          <CFormLabel for="customer">Customer</CFormLabel>
          <Multiselect
            id="customer"
            v-model="currentMilkSales.customer_id"
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
            :value="currentMilkSales.customer_id"
            @input="validated.value = !!currentMilkSales.customer_id"
            required
          />
          <CFormFeedback invalid v-if="!currentMilkSales.customer_id"
            >Customer is required.</CFormFeedback
          >
        </CCol>

        <CCol :md="12">
          <CFormLabel for="salesDate">Sales Date</CFormLabel>
          <CFormInput id="salesDate" type="date" v-model="currentMilkSales.sales_date" required />
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
