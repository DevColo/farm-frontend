<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useMilkStore } from '@/stores/milk.store'
import { usePastureStore } from '@/stores/pasture.store'
import {CRow,
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
  CFormSelect,
  CFormFeedback,
  CTabContent,
  CTabPane,
  CInputGroup,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CSpinner,
} from '@coreui/vue'
import { cilPencil, cilTrash, cilPlus, cilCloudDownload, cilSearch, cilFilter } from '@coreui/icons'
import Swal from 'sweetalert2'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import logo from '@/assets/images/logo.png'

const milkStore = useMilkStore()
const pastureStore = usePastureStore()

const showModal = ref(false)
const isEditing = ref(false)
const validated = ref(false)
const loading = ref(false)
const showFilters = ref(false)

const currentMilkRecord = ref({
  id: null,
  morning_qty: '',
  evening_qty: '',
  record_date: '',
  pasture_id: '',
})

// Enhanced search and filter states
const searchQuery = ref('')
const filterPasture = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)
const sortField = ref('name')
const sortOrder = ref('asc')
const pastureList = ref([])
const editingId = ref(null)
const filterYearAndMonth = ref('')
const filterYear = ref('')

// fetch data
onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      milkStore.fetchMilkRecords(),
      pastureStore.fetchPastures(),
    ])
  } finally {
    loading.value = false
  }
})

// Watch the store in case pastures are updated dynamically later
watch(
  () => pastureStore.pastures,
  (newPastures) => {
    pastureList.value = newPastures.map(c => ({
      value: c.id,
      label: c.pasture,
    }))
  },
  { deep: true }
)

// Generate filter options
const availablePastures = computed(() => {
  const pastures = milkStore.milkRecords
    .map(milk => milk.pasture)
    .filter(Boolean);

  // deduplicate by pasture.id
  const unique = new Map(pastures.map(p => [p.id, p]));
  return Array.from(unique.values());
});

const availableYearMonth = computed(() => {
  const pastures = milkStore.milkRecords
    .map(milk => milk.record_date)
    .filter(Boolean);

  // Convert to Date objects first
  const parsedDates = pastures.map(dateStr => new Date(dateStr));

  // Deduplicate by year+month key
  const uniqueMap = new Map(
    parsedDates.map(d => [
      `${d.getFullYear()}-${d.getMonth()}`, // key like "2025-4"
      d
    ])
  );

  // Sort by actual date
  const sorted = [...uniqueMap.values()].sort((a, b) => a - b);

  // Convert to "YYYY Month"
  return sorted.map(d =>
    d.toLocaleDateString("en-US", { year: "numeric", month: "long" })
  );
});

const availableYears = computed(() => {
  const years = milkStore.milkRecords
    .map(milk => new Date(milk.record_date).getFullYear())
    .filter(Boolean);

  // Deduplicate + sort ascending
  return [...new Set(years)].sort((a, b) => a - b);
});

// Enhanced filtering and sorting
const filteredMilkRecords = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  let filtered = milkStore.milkRecords.filter((milk) => {
  const matchesQuery = !q || [milk.pasture.pasture, milk.record_date, milk.morning_qty, milk.evening_qty].some((field) =>
    field?.toString().toLowerCase().includes(q)
  );

  const matchesPasture =
    !filterPasture.value || milk.pasture_id === filterPasture.value;

  // format Year + Month
  const recordYearMonth = new Date(milk.record_date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long"
  });

  const matchesYearMonth =
    !filterYearAndMonth.value || recordYearMonth === filterYearAndMonth.value;

  // extract Year only
  const recordYear = new Date(milk.record_date).getFullYear();

  const matchesYear =
    !filterYear.value || recordYear === Number(filterYear.value);

  return matchesQuery && matchesPasture && matchesYearMonth && matchesYear;
});


  // Apply sorting
  filtered.sort((a, b) => {
    let aValue = a[sortField.value]
    let bValue = b[sortField.value]
    
    // Handle special cases
    if (sortField.value === 'age') {
      aValue = calculateAge(a.date_of_birth)
      bValue = calculateAge(b.date_of_birth)
    } else if (sortField.value === 'pasture') {
      aValue = a.pasture?.pasture || ''
      bValue = b.pasture?.pasture || ''
    }
    
    // Convert to strings for comparison
    aValue = String(aValue || '').toLowerCase()
    bValue = String(bValue || '').toLowerCase()
    
    if (sortOrder.value === 'asc') {
      return aValue.localeCompare(bValue)
    } else {
      return bValue.localeCompare(aValue)
    }
  })

  return filtered
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredMilkRecords.value.length / itemsPerPage.value))
)

const paginatedMilkRecords = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredMilkRecords.value.slice(start, start + itemsPerPage.value)
})

function getStatusBadge(status) {
  return status === '1' ? { color: 'success', text: 'Active' } : { color: 'danger', text: 'Inactive' }
}

// Sorting
function sortBy(field) {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortOrder.value = 'asc'
  }
}

function getSortIcon(field) {
  if (sortField.value !== field) return '↕️'
  return sortOrder.value === 'asc' ? '↑' : '↓'
}

// Filter management
function clearAllFilters() {
  searchQuery.value = ''
  filterPasture.value = ''
  filterYearAndMonth.value = ''
  filterYear.value = ''
  resetPage()
}

function resetPage() {
  currentPage.value = 1
}

// Pagination
function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}
function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}
function goToPage(page) {
  currentPage.value = page
}

// Modal handlers
function openCreate() {
  isEditing.value = false
  validated.value = false
  editingId.value = null
  currentMilkRecord.value = {
    morning_qty: '',
    evening_qty: '',
    record_date: '',
    pasture_id: '',
  }
  showModal.value = true
}

function openEdit(milkRecord) {
  isEditing.value = true
  validated.value = false
  editingId.value = milkRecord.id
  currentMilkRecord.value = { ...milkRecord }
  // Find matching pasture object from options
  const pastureObj = pastureList.value.find(c => 
    c.value == milkRecord.pasture_id
  )
  currentMilkRecord.value.pasture_id = pastureObj || null
  showModal.value = true
}

const confirmDelete = async (id, record_date) => {
  Swal.fire({
    html: `
      <div class="custom-modal-header d-flex align-items-center justify-content-center flex-column">
        <h3 class="custom-modal-title d-flex align-items-center justify-content-center flex-row font-inter fw-semibold text-grey-v13 py-3">
          <i class="material-symbols-rounded text-red rounded-circle position-relative d-flex align-items-center justify-content-center me-3">delete</i>
          <span></span>
        </h3>
        <p class="custom-modal-description font-inter fw-normal text-grey-v6">
          Are you sure to delete ${record_date} record?
        </p>
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
  }).then(async (result) => {
    if (result.isConfirmed) {
      loading.value = true
      try {
        await milkStore.deleteMilkRecord(id)
        // optional: show success message
        //Swal.fire('Deleted!', 'The record has been deleted.', 'success')
      } finally {
        loading.value = false
      }
    }
  })
}

async function handleSubmit(e) {
  if (e) e.preventDefault()

  // Manual validation for required fields
  if (
    !currentMilkRecord.value.record_date ||
    !currentMilkRecord.value.pasture_id ||
    !currentMilkRecord.value.morning_qty
  ) {
    validated.value = true
    return
  }

  loading.value = true
  try {
    const payload = {
      pasture_id: currentMilkRecord.value.pasture_id.value || currentMilkRecord.value.pasture_id, 
      morning_qty: currentMilkRecord.value.morning_qty,
      evening_qty: currentMilkRecord.value.evening_qty || 0,
      record_date: currentMilkRecord.value.record_date,
    }

    if (isEditing.value) {
      payload.milk_id = editingId.value // pass record id for update
      const res = await milkStore.editMilkRecord(payload)
      if(res == 1){
        showModal.value = false
      }
    } else {
      const res = await milkStore.createMilkRecord(payload)
      if(res == 1){
        showModal.value = false
      }
    }

    
  } finally {
    loading.value = false
  }
}

// Watch for changes
watch([searchQuery, filterPasture, filterYearAndMonth, filterYear], () => {
  resetPage()
})

// Calculate Total Qty
const getTotalQuantity = (morning_qty = 0, evening_qty = 0) => {
  return BigInt(morning_qty) + BigInt(evening_qty)
}

// Export PDF
const exportPDF = () => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'A4',
  })

  // Header: Add Image
  const img = new Image()
  img.src = logo
  doc.addImage(img, 'PNG', 40, 20, 50, 50) // x, y, width, height

  // Header: Add Text
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Jakaja', 100, 30)

  // Header: Add Text
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Farm Management System', 100, 45)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Dialy Milk Records - created: ${new Date().toLocaleDateString()}`, 100, 58)

  // Calculate total quantity
  const totalQty = filteredMilkRecords.value.reduce(
    (sum, r) => sum + Number(r.morning_qty || 0) + Number(r.evening_qty || 0),
    0
  )
  doc.text(`Total Qty: ${totalQty} liters`, 100, 70)

  // Table columns
  const tableColumn = ["Record Date", "Morning Qty (L)", "Evening Qty (L)", "Total Qty (L)", "Pasture"]
  const tableRows = []

  filteredMilkRecords.value.forEach(record => {
    const row = [
      record.record_date,
      record.morning_qty,
      record.evening_qty,
      (Number(record.morning_qty || 0) + Number(record.evening_qty || 0)).toString(),
      record.pasture?.pasture || ''
    ]
    tableRows.push(row)
  })

  // Table
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 100, // start after header
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 80 },
      2: { cellWidth: 80 },
      3: { cellWidth: 80 },
      4: { cellWidth: 150 },
    },
    didDrawPage: (data) => {
      // Optional: repeat header on every page
      // You can leave this empty if not needed
    }
  })

  // Save PDF
  doc.save('daily-milk-records.pdf')
}

</script>

<template>
  <div class="position-relative">
    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <CSpinner color="primary" variant="grow" />
    </div>

    <!-- Main Content -->
      <!-- Main Table Card -->
      <CCol cols="12">
        <CCard class="shadow-sm border-0">
          <!-- Enhanced Header -->
          <CCardHeader class="bg-white border-bottom">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h5 class="mb-1">
                  <i class="fas fa-list-ul me-2 text-primary"></i>Daily Milk Record
                </h5>
              </div>
              <div class="d-flex gap-2">
                <CDropdown>
                  <CDropdownToggle color="outline-secondary" size="sm">
                    <CIcon :icon="cilCloudDownload" class="me-1" />Export
                  </CDropdownToggle>
                  <CDropdownMenu>
                    <CDropdownItem @click="exportPDF">
                      <i class="fas fa-file-pdf me-2 text-danger"></i>Export PDF
                    </CDropdownItem>
                  </CDropdownMenu>
                </CDropdown>
                <CButton color="dark" @click="openCreate">
                  <CIcon :icon="cilPlus" class="me-1" />Add Milk Record
                </CButton>
              </div>
            </div>
          </CCardHeader>

          <CCardBody class="p-0">
            <!-- Enhanced Search and Filter Controls -->
            <div class="search-filter-section p-4 bg-light border-bottom">
              <!-- Main Search -->
              <div class="row g-3 mb-3">
                <div  class="col-md-11" style="display: flex; gap: 10px;">
                  <div class="col-md-3">
                    <CInputGroup>
                      <span class="input-group-text">
                        <CIcon :icon="cilSearch" />
                      </span>
                      <CFormInput
                        v-model="searchQuery"
                        placeholder="Search by pasture, date or quantity"
                        @input="resetPage"
                      />
                    </CInputGroup>
                  </div>
                  <div>
                    <CButton 
                      :color="showFilters ? 'primary' : 'outline-primary'" 
                      @click="showFilters = !showFilters"
                      class="w-100"
                    >
                      <CIcon :icon="cilFilter"/>
                    </CButton>
                  </div>
                </div>

                <div class="col-md-1">
                  <CFormSelect v-model="itemsPerPage" @change="resetPage">
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </CFormSelect>
                </div>
              </div>

              <!-- Advanced Filters -->
              <div v-if="showFilters" class="advanced-filters">
                <div class="row g-3">
                  <div class="col-md-2">
                    <CFormSelect v-model="filterPasture" @change="resetPage">
                      <option value="">All Pasture</option>
                      <option v-for="pasture in availablePastures" :key="pasture.id" :value="pasture.id">
                        {{ pasture.pasture }}
                      </option>
                    </CFormSelect>
                  </div>
                  <div class="col-md-2">
                    <CFormSelect v-model="filterYearAndMonth" @change="resetPage">
                      <option value="">All Month</option>
                      <option v-for="month in availableYearMonth" :key="month" :value="month">
                        {{ month }}
                      </option>
                    </CFormSelect>
                  </div>
                  <div class="col-md-2">
                    <CFormSelect v-model="filterYear" @change="resetPage">
                      <option value="">All Years</option>
                      <option v-for="year in availableYears" :key="year" :value="year">
                        {{ year }}
                      </option>
                    </CFormSelect>
                  </div>
                  <div class="col-md-2">
                    <CButton color="outline-secondary" @click="clearAllFilters" class="w-100">
                      Clear All
                    </CButton>
                  </div>
                </div>
              </div>
            </div>

            <!-- Enhanced Table -->
            <div class="table-responsive">
              <CTable hover class="mb-0 modern-table">
                <CTableHead class="table-light">
                  <CTableRow>
                    <CTableHeaderCell class="sortable" @click="sortBy('record_date')">
                      Record Date {{ getSortIcon('record_date') }}
                    </CTableHeaderCell>
                    <CTableHeaderCell>Morning Qty (L)</CTableHeaderCell>
                    <CTableHeaderCell>Evening Qty (L)</CTableHeaderCell>
                    <CTableHeaderCell>Total Qty (L)</CTableHeaderCell>
                    <CTableHeaderCell>Pasture</CTableHeaderCell>
                    <CTableHeaderCell width="120">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  <CTableRow v-for="milk in paginatedMilkRecords" :key="milk.id" class="table-row">
                    <CTableDataCell>
                      <router-link :to="`/milks/${milk.id}`" class="text-decoration-none cow-link">
                        {{ milk?.record_date }}
                      </router-link>
                    </CTableDataCell>
                    <CTableDataCell>
                      {{ milk?.morning_qty }}
                    </CTableDataCell>
                    <CTableDataCell>
                        {{ milk?.evening_qty }}
                    </CTableDataCell>
                    <CTableDataCell>
                      {{ getTotalQuantity(milk.morning_qty, milk.evening_qty) }}
                    </CTableDataCell>
                    <CTableDataCell>
                        {{ milk?.pasture?.pasture }}
                    </CTableDataCell>
                    <CTableDataCell>
                      <div class="d-flex gap-1">
                        <CButton
                          size="sm"
                          color="info"
                          variant="outline"
                          title="Edit milk"
                          @click="openEdit(milk)"
                        >
                          <CIcon :icon="cilPencil"/>
                        </CButton>
                        <CButton
                          size="sm"
                          color="danger"
                          variant="outline"
                          title="Delete milk"
                          @click="confirmDelete(milk.id, milk.record_date)"
                        >
                          <CIcon :icon="cilTrash"/>
                        </CButton>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                  <CTableRow v-if="paginatedMilkRecords.length === 0">
                    <CTableDataCell colspan="10" class="text-center py-5">
                      <div class="empty-state">
                        <i class="fas fa-cow fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">No pastures found</h5>
                        <p class="text-muted mb-3">Try adjusting your search criteria or add a new pasture</p>
                        <CButton color="primary" @click="openCreate">
                          <CIcon :icon="cilPlus" class="me-1" />Add Your First Pasture
                        </CButton>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                </CTableBody>
              </CTable>
            </div>

            <!-- Enhanced Pagination -->
            <div class="pagination-section p-3 bg-light border-top">
              <div class="d-flex justify-content-between align-items-center">
                <div class="pagination-info">
                  <span class="text-muted small">
                    Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to 
                    {{ Math.min(currentPage * itemsPerPage, filteredMilkRecords.length) }} 
                    of {{ filteredMilkRecords.length }} entries
                    <span v-if="filteredMilkRecords.length !== milkStore.milkRecords.length">
                      (filtered from {{ milkStore.milkRecords.length }} total)
                    </span>
                  </span>
                </div>
                <div class="pagination-controls d-flex align-items-center gap-2" v-if="totalPages > 1">
                  <CButton 
                    size="sm" 
                    variant="outline" 
                    :disabled="currentPage === 1"
                    @click="prevPage"
                  >
                    Previous
                  </CButton>

                  <CButton 
                    size="sm" 
                    variant="outline" 
                    :disabled="currentPage === totalPages"
                    @click="nextPage"
                  >
                    Next
                  </CButton>
                </div>

              </div>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
  </div>

  <!-- Enhanced Create/Edit Modal -->
  <CModal :visible="showModal" @close="showModal = false" backdrop="static" size="lg">
    <CModalHeader class="border-bottom">
      <CModalTitle>
        <i class="fas fa-cow me-2"></i>
        {{ isEditing ? 'Edit Milk Record' : 'Add New Milk Record' }}
      </CModalTitle>
    </CModalHeader>
    <CModalBody class="p-0">

      <!-- Tab Content -->
      <CForm
        class="p-4"
        novalidate
        :validated="validated"
        @submit="handleSubmit"
      >
        <CTabContent>
          <!-- Cow Details Tab -->
          <CTabPane visible>
            <CRow class="g-3">
              <CCol md="6">
                <CFormLabel for="pasture" class="fw-semibold">Record Date <span style="color: red;">*</span></CFormLabel>
                <CFormInput type="date" v-model="currentMilkRecord.record_date" required />
                <CFormFeedback invalid>Record Date is required.</CFormFeedback>
              </CCol>

              <CCol md="6">
                <CFormLabel for="from_farm" class="fw-semibold">Pasture <span style="color: red;">*</span></CFormLabel>
                <Multiselect
                  v-model="currentMilkRecord.pasture_id"
                  placeholder="Select Pasture"
                  track-by="value"
                  label="label"
                  :options="pastureList"
                  :show-no-results="false"
                  :close-on-select="true"
                  :clear-on-select="false"
                  :preserve-search="true"
                  :preselect-first="false"
                  required
                />
                <CFormFeedback invalid>Pasture is required.</CFormFeedback>
              </CCol>

              <CCol md="6">
                <CFormLabel for="pasture" class="fw-semibold">Morning Quantity (liters) <span style="color: red;">*</span></CFormLabel>
                <CFormInput type="number" v-model="currentMilkRecord.morning_qty" required />
                <CFormFeedback invalid>Morning Quantity is required.</CFormFeedback>
              </CCol>

              <CCol md="6">
                <CFormLabel for="pasture" class="fw-semibold">Evening Quantity (liters)</CFormLabel>
                <CFormInput type="number" v-model="currentMilkRecord.evening_qty" />
                <CFormFeedback invalid>Evening Quantity is required.</CFormFeedback>
              </CCol>
            </CRow>
          </CTabPane>
        </CTabContent>
      </CForm>
    </CModalBody>
    <CModalFooter class="border-top">
      <CButton color="secondary" @click="showModal = false">
        Cancel
      </CButton>
      <CButton 
        type="submit"
        color="dark" 
        @click="handleSubmit"
        :disabled="loading"
      >
        <CSpinner v-if="loading" size="sm" class="me-2" />
        <i v-else :class="isEditing ? 'fas fa-save' : 'fas fa-plus'" class="me-2"></i>
        {{ isEditing ? 'Update Milk Record' : 'Create Milk Record' }}
      </CButton>
    </CModalFooter>
  </CModal>
</template>