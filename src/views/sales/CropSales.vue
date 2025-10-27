<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useCropSaleStore } from '@/stores/crop-sales.store'
import { useCustomerStore } from '@/stores/customer.store'
import { useHarvestStore } from '@/stores/harvest.store'
import { useFarmStore } from '@/stores/farm.store'
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

const cropSalesStore = useCropSaleStore()
const customerStore = useCustomerStore()
const harvestStore = useHarvestStore()
const farmStore = useFarmStore()

const showModal = ref(false)
const isEditing = ref(false)
const validated = ref(false)
const editingId = ref(null)

// Crop Rejection status
const rejectionStatus = [
  { value: 'No', label: 'No'},
  { value: 'Yes', label: 'Yes'},
]

const currentSales = ref({
  id: null,
  farm_id: '',
  harvest_record_id: '',
  customer_id: '',
  quantity: '',
  unit_price: '',
  sales_date: '',
  is_rejected: 'No',
})
const farms = ref([])
const harvests = ref([])
const maxQty = ref(0)
const isRejected = ref(false)

// fetch data
onMounted(() => {
  cropSalesStore.fetchCropSales()
  customerStore.fetchCustomers()
  farmStore.fetchFarms()
})

watch(
  () => farmStore.farms,
  (newFarms) => {
    farms.value = newFarms.map(b => ({
      value: b.id,
      label: `${b?.farm_code} - ${b?.name}`,
    }))
  },
  { deep: true }
)

// search & pagination
const searchQuery = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)

const filteredSales = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return cropSalesStore.cropSales
  return cropSalesStore.cropSales.filter((m) =>
    [m.sales_date, m.quantity].some((f) => f?.toLowerCase().includes(q)),
  )
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredSales.value.length / itemsPerPage.value)),
)
const paginatedSales = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredSales.value.slice(start, start + itemsPerPage.value)
})

// Fix for the prop type warning
watch(
  () => currentSales.value.harvest_record_id,
  (newValue) => {
    if (typeof newValue === 'number') {
      currentSales.value.harvest_record_id = String(newValue)
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
  currentSales.value = {
    id: null,
    farm_id: '',
    harvest_record_id: '',
    customer_id: '',
    quantity: '',
    unit_price: '',
    sales_date: '',
    is_rejected: 'No',
  }
  showModal.value = true
}

function openEdit(cropSales) {
  isEditing.value = true
  validated.value = false
  editingId.value = cropSales.id
  currentSales.value = { ...cropSales }
  currentSales.value = {
    sales_date: cropSales.sale_date,
    customer_id: cropSales.customer_id
      ? { value: cropSales.customer_id, label: `${cropSales.customer?.first_name  } ${cropSales.customer?.last_name}` }
      : '',
    harvest_record_id: cropSales.farm_harvest_id
      ? { value: cropSales.farm_harvest_id, label: `${cropSales.farm_harvest?.harvest_date} - ${cropSales.farm_harvest?.fruit}` }
      : '',
    quantity: cropSales.quantity,
    unit_price: cropSales.price,
    is_rejected: cropSales.is_rejected ? { value: cropSales.is_rejected, label: cropSales.is_rejected } : 'No',
    farm_id: cropSales.farm_id
      ? { value: cropSales.farm_id, label: `${cropSales.farm?.farm_code} - ${cropSales.farm?.name}` }
      : '',
    id: cropSales.id, 
  }
  showModal.value = true
}

function confirmDelete(id) {
  if (confirm('Are you sure you want to delete this crop sales record?')) {
    cropSalesStore.deleteCropSale(id)
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
    farm_id: currentSales.value.farm_id.value,
    farm_harvest_id: currentSales.value.harvest_record_id.value,
    customer_id: currentSales.value.customer_id.value,
    quantity: currentSales.value.quantity,
    price: currentSales.value.unit_price,
    sale_date: currentSales.value.sales_date,
    is_rejected: currentSales.value.is_rejected,
  }
  if (isEditing.value) {
    payload.id = editingId.value
    await cropSalesStore.editCropSale(payload)
  } else {
    await cropSalesStore.createCropSale(payload)
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
    body: filteredSales.value.map((feeding) => [
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
    ...filteredSales.value.map((feeding) => [
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
  return cropStore.cropSales.find((milk) => milk.id === currentSales.harvest_record_id) || null
})

// watch(
//   () => currentSales.value.harvest_record_id,
//   (foodId) => {
//     selectedFood.value = cropStore.cropSales.find((f) => f.id === foodId) || null
//   },
// )

const availableQuantity = computed(() => {
  if (!selectedFood.value) return 0
  const consumed = getConsumedQuantity(selectedFood.value)
  return selectedFood.value.quantity - consumed
})

async function handleHarvestByFarm(farmId) {
  const farmIdValue = farmId?.value ?? farmId
  // Reset if no farm selected
  if (!farmIdValue) {
    harvests.value = []
    return
  }
  // clear previous options while loading
  harvests.value = []
  await harvestStore.fetchHarvestsByFarmId(farmIdValue)
  const res = harvestStore.harvests;
  harvests.value = Array.isArray(res) ? 
    res.map(h => (
      { 
        value: h.id,
        label: `${h?.harvest_date} - ${h?.fruit} ${h?.type != '' ? `(${h?.type})` : ''} - ${h?.quantity}kg`,
        quantity: h?.quantity,
      })) 
  : []
  console.log('Fetched harvests:', harvests.value)
}

function getMaxQuantity(qty) {
  const qtyValue = qty?.quantity ?? qty
   console.log('Fetched qtyValue:', qty)
  if (!qtyValue) {
    maxQty.value = []
    return
  }
 
}
//getMaxQuantity
// Ensure function runs whenever farm changes
watch(
  () => currentSales.value.farm_id,
  (newFarmId) => {
    handleHarvestByFarm(newFarmId)
  }
)

watch(
  () => currentSales.value.harvest_record_id,
  (newHarvestRecordId) => {
    //handleHarvestByFarm(newFarmId)
    maxQty.value = newHarvestRecordId?.quantity
  }
)
</script>

<template>
  <CRow>
    <CCol :xs="12">
      <!-- sales stats -->
          <div class="d-flex flex-wrap gap-3 mb-3">
            <div class="p-3 border rounded text-center" style="min-width: 150px;">
              <div class="text-muted small">Total Records</div>
              <div class="h5 mb-0">{{ filteredSales.length }}</div>
            </div>

            <div class="p-3 border rounded text-center" style="min-width: 150px;">
              <div class="text-muted small">Total Quantity (Kg)</div>
              <div class="h5 mb-0">
          {{
            filteredSales.length
              ? filteredSales.reduce((s, it) => s + (Number(it.quantity) || 0), 0)
              : 0
          }}
              </div>
            </div>

            <div class="p-3 border rounded text-center" style="min-width: 150px;">
              <div class="text-muted small">Total Revenue (Rwf)</div>
              <div class="h5 mb-0">
          {{
            filteredSales.length
              ? filteredSales
            .reduce(
              (s, it) => s + (Number(it.quantity) || 0) * (Number(it.price) || 0),
              0,
            )
            .toFixed(2)
              : '0.00'
          }}
              </div>
            </div>

            <div class="p-3 border rounded text-center" style="min-width: 150px;">
              <div class="text-muted small">Avg Unit Price (Rwf)</div>
              <div class="h5 mb-0">
          {{
            filteredSales.length
              ? (
            filteredSales.reduce((s, it) => s + (Number(it.price) || 0), 0) /
            filteredSales.length
                ).toFixed(2)
              : '0.00'
          }}
              </div>
            </div>

            <div class="p-3 border rounded text-center" style="min-width: 150px;">
              <div class="text-muted small">Rejected Sales</div>
              <div class="h5 mb-0">
          {{
            filteredSales.length
              ? filteredSales.filter((it) => it.is_rejected === 'Yes' || it.is_rejected === true)
            .length
              : 0
          }}
              </div>
            </div>
          </div>
          <!-- Fruit-specific stats -->
          <div class="mb-4">
            <h5>Sales by Fruit Type</h5>
            <div class="d-flex flex-wrap gap-3">
              <!-- Rejected Only -->
              <template v-for="fruit in [...new Set(filteredSales.map(sale => sale.farm_harvest))]" :key="fruit">
                <div v-if="fruit?.fruit.toLowerCase() == 'avocado' && fruit?.is_rejected == 'Yes'" class="p-3 border rounded" style="min-width: 200px;background: #ff8b8b;">
                  <h6 class="mb-2">Rejected {{ fruit?.fruit }}</h6>
                  <div class="small">
                    <div class="d-flex justify-content-between mb-1">
                      <span>Total Quantity:</span>
                      <strong>{{ 
                        filteredSales
                          .filter(sale => sale.farm_harvest?.fruit === fruit?.fruit && sale.farm_harvest?.is_rejected == 'Yes')
                          .reduce((sum, sale) => sum + (Number(sale.quantity) || 0), 0)
                      }} kg</strong>
                    </div>
                    <div class="d-flex justify-content-between mb-1">
                      <span>Total Revenue:</span>
                      <strong>{{ 
                        filteredSales
                          .filter(sale => sale.farm_harvest?.fruit === fruit?.fruit && sale.farm_harvest?.is_rejected == 'Yes')
                          .reduce((sum, sale) => sum + ((Number(sale.quantity) || 0) * (Number(sale.price) || 0)), 0)
                          .toFixed(2)
                      }} Rwf</strong>
                    </div>
                    
                    <!-- Avocado type breakdown -->
                    <template v-if="fruit === 'Avocado'">
                      <hr class="my-2">
                      <div class="mt-2">
                        <h6 class="mb-2">By Type:</h6>
                        <template v-for="type in [...new Set(filteredSales
                          .filter(sale => sale.farm_harvest?.fruit === 'Avocado')
                          .map(sale => sale.farm_harvest?.type))]" 
                          :key="type">
                          <div v-if="type" class="d-flex justify-content-between mb-1">
                            <span>{{ type }}:</span>
                            <strong>
                              {{
                                  filteredSales
                                    .filter(
                                      sale =>
                                        sale.farm_harvest?.fruit === 'Avocado' &&
                                        sale.farm_harvest?.type === type &&
                                        sale.farm_harvest?.is_rejected == 'Yes'
                                    )
                                    .reduce(
                                      (sum, sale) =>
                                        sum + (Number(sale.quantity) || 0) * (Number(sale.price) || 0),
                                      0
                                    )
                                    .toFixed(2)
                                }} Rwf 
                            </strong>
                            <!-- <strong>

                              {{ 
                              filteredSales
                                .filter(sale => sale.farm_harvest?.fruit === 'Avocado' && sale.farm_harvest?.type === type)
                                .reduce((sum, sale) => sum + (Number(sale.quantity) || 0), 0)
                            }} kg</strong> -->
                          </div>
                        </template>
                      </div>
                    </template>
                  </div>
                </div>
              </template>

              <!-- Calculate stats for each unique fruit and Accepted Avocado-->
              <template v-for="fruit in [...new Set(filteredSales.map(sale => sale.farm_harvest))]" :key="fruit">
                <div v-if="fruit?.is_rejected != 'Yes'" class="p-3 border rounded" style="min-width: 200px;">
                  <h6 class="mb-2">Rejected {{ fruit?.fruit }}</h6>
                  <div class="small">
                    <div class="d-flex justify-content-between mb-1">
                      <span>Total Quantity:</span>
                      <strong>{{ 
                        filteredSales
                          .filter(sale => sale.farm_harvest?.fruit === fruit?.fruit && sale.farm_harvest?.is_rejected != 'Yes')
                          .reduce((sum, sale) => sum + (Number(sale.quantity) || 0), 0)
                      }} kg</strong>
                    </div>
                    <div class="d-flex justify-content-between mb-1">
                      <span>Total Revenue:</span>
                      <strong>{{ 
                        filteredSales
                          .filter(sale => sale.farm_harvest?.fruit === fruit?.fruit && sale.farm_harvest?.is_rejected != 'Yes')
                          .reduce((sum, sale) => sum + ((Number(sale.quantity) || 0) * (Number(sale.price) || 0)), 0)
                          .toFixed(2)
                      }} Rwf</strong>
                    </div>
                    
                    <!-- Avocado type breakdown -->
                    <template v-if="fruit === 'Avocado'">
                      <hr class="my-2">
                      <div class="mt-2">
                        <h6 class="mb-2">By Type:</h6>
                        <template v-for="type in [...new Set(filteredSales
                          .filter(sale => sale.farm_harvest?.fruit === 'Avocado')
                          .map(sale => sale.farm_harvest?.type))]" 
                          :key="type">
                          <div v-if="type" class="d-flex justify-content-between mb-1">
                            <span>{{ type }}:</span>
                            <strong>
                              {{
                                  filteredSales
                                    .filter(
                                      sale =>
                                        sale.farm_harvest?.fruit === 'Avocado' &&
                                        sale.farm_harvest?.type === type &&
                                        sale.farm_harvest?.is_rejected != 'Yes'
                                    )
                                    .reduce(
                                      (sum, sale) =>
                                        sum + (Number(sale.quantity) || 0) * (Number(sale.price) || 0),
                                      0
                                    )
                                    .toFixed(2)
                                }} Rwf 
                            </strong>
                            <!-- <strong>

                              {{ 
                              filteredSales
                                .filter(sale => sale.farm_harvest?.fruit === 'Avocado' && sale.farm_harvest?.type === type)
                                .reduce((sum, sale) => sum + (Number(sale.quantity) || 0), 0)
                            }} kg</strong> -->
                          </div>
                        </template>
                      </div>
                    </template>
                  </div>
                </div>
              </template>
            </div>
          </div>
      <CCard class="mb-4">
        <CCardHeader class="d-flex justify-content-between align-items-center">
          <strong>Harvest Sales List</strong>
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
          <CTableHeaderCell>Harvest</CTableHeaderCell>
          <CTableHeaderCell>Customer</CTableHeaderCell>
          <CTableHeaderCell>Sold Qty (Kg)</CTableHeaderCell>
          <CTableHeaderCell>Sold Date</CTableHeaderCell>
          <CTableHeaderCell>Unit Price (RWF)</CTableHeaderCell>
          <CTableHeaderCell>Total Price (Rwf)</CTableHeaderCell>
          <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="cropSales in paginatedSales" :key="cropSales.id">
          <CTableDataCell>{{ cropSales.farm_harvest?.harvest_date ?? '' }} - {{ cropSales.farm_harvest?.fruit ?? '' }} {{ cropSales.farm_harvest?.fruit.toLowerCase() == 'avocado' ? `(${cropSales.farm_harvest?.type})` : '' }} {{ `${cropSales.farm_harvest?.quantity}Kg` ?? '' }}</CTableDataCell>
          <CTableDataCell
            ><router-link :to="`/customers/${cropSales.customer?.id}`">
              {{ cropSales.customer?.first_name ?? '' + ' ' + cropSales.customer?.last_name ?? '' }}
            </router-link>
            </CTableDataCell>
          <CTableDataCell>{{ cropSales?.quantity ?? '' }}</CTableDataCell>
          <CTableDataCell>{{ cropSales?.sale_date ?? '' }}</CTableDataCell>
          <CTableDataCell>{{ cropSales?.price ?? '' }}</CTableDataCell>
          <CTableDataCell>{{ (Number(cropSales?.quantity) || 0) * (Number(cropSales?.price) || 0) }}</CTableDataCell>
          <CTableDataCell>
            <!-- Edit Cow Button -->
            <CButton
              size="sm"
              color="info"
              class="me-2 text-white"
              title="Edit cropSales Record"
              @click="openEdit(cropSales)"
            >
              <CIcon :icon="cilPencil" />
            </CButton>

            <!-- Delete Cow Button -->
            <CButton
              size="sm"
              color="danger"
              class="text-white"
              title="Delete Crop Sales Record"
              @click="confirmDelete(cropSales.id)"
            >
              <CIcon :icon="cilTrash" />
            </CButton>
          </CTableDataCell>
              </CTableRow>
              <CTableRow v-if="paginatedSales.length === 0">
          <CTableDataCell colspan="8" class="text-center">
            No sales record found.
          </CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>

          <!-- pagination controls -->
          <div class="text-end mb-3">
            <strong>Total Records:</strong> {{ filteredSales.length }}
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
        isEditing ? 'Edit Crop Sales Record' : 'Add Crop Sales Record'
      }}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CForm
        class="row g-3 needs-validation"
        novalidate
        :validated="validated"
        @submit="handleSubmit"
      >
        <CCol md="12">
            <CFormLabel for="farm_id" class="fw-semibold">Farm <span style="color: red;">*</span></CFormLabel>
            <Multiselect
              v-model="currentSales.farm_id"
              placeholder="Select Farm"
              track-by="value"
              label="label"
              :options="farms"
              :show-no-results="false"
              :close-on-select="true"
              :clear-on-select="false"
              :preserve-search="true"
              :preselect-first="false"
              @input="handleHarvestByFarm(currentSales.farm_id.value)"
            />
            <div v-if="validated && !currentSales.farm_id" class="invalid-feedback d-block">
              Farm is required.
            </div>
          </CCol>

          <CCol md="12">
            <CFormLabel for="tree" class="fw-semibold">Harvest <span style="color: red;">*</span></CFormLabel>
            <Multiselect
              v-model="currentSales.harvest_record_id"
              placeholder="Select Harvest"
              track-by="value"
              label="label"
              :options="harvests"
              :show-no-results="false"
              :close-on-select="true"
              :clear-on-select="false"
              :preserve-search="true"
              :preselect-first="false"
              @input="getMaxQuantity(currentSales.harvest_record_id.value)"
            >
              <template #option="{ option }">
                {{ option.label }}
              </template>
              <template #singleLabel="{ option }">
                {{ option.label }}
              </template>
            </Multiselect>
            <div v-if="validated && !currentSales.harvest_record_id" class="invalid-feedback d-block">
              Harvest is required.
            </div>
          </CCol>

        <CCol :md="12">
  <CFormLabel for="is_rejected">Is Rejected</CFormLabel>
  <select
    id="is_rejected"
    v-model="currentSales.is_rejected"
    class="form-select"
  >
    <option value="No">No</option>
    <option value="Yes">Yes</option>
  </select>
  <CFormFeedback invalid v-if="!currentSales.is_rejected">
    Rejection status is required.
  </CFormFeedback>
</CCol>


        <CCol :md="12">
          <CFormLabel for="quantity">Quantity (kg)</CFormLabel>
          <CFormInput
            id="quantity"
            v-model="currentSales.quantity"
            type="number"
            min="1"
            :max="maxQty"
            @input="(e) => {
              const val = Number(e.target.value);
              if (maxQty && !isNaN(val) && val > Number(maxQty)) {
                e.target.setCustomValidity('Quantity cannot exceed available: ' + maxQty);
                e.target.reportValidity();
              } else {
                e.target.setCustomValidity('');
              }
            }"
            required
          />
          <CFormFeedback invalid v-if="!currentSales.quantity">
            Quantity is quantity.
          </CFormFeedback>
        </CCol>

        <CCol :md="12">
          <CFormLabel for="unit_price">Unit Price (Rwf)</CFormLabel>
          <CFormInput
            id="unit_price"
            v-model="currentSales.unit_price"
            type="number"
            min="1"
            required
          />
          <CFormFeedback invalid v-if="!currentSales.unit_price">
            Unit Price is required.
          </CFormFeedback>
        </CCol>

        <CCol :md="12">
          <CFormLabel for="customer">Customer</CFormLabel>
          <Multiselect
            id="customer"
            v-model="currentSales.customer_id"
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
            :value="currentSales.customer_id"
            @input="validated.value = !!currentSales.customer_id"
            required
          />
          <CFormFeedback invalid v-if="!currentSales.customer_id"
            >Customer is required.</CFormFeedback
          >
        </CCol>

        <CCol :md="12">
          <CFormLabel for="salesDate">Sales Date</CFormLabel>
          <CFormInput id="salesDate" type="date" v-model="currentSales.sales_date" required />
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
