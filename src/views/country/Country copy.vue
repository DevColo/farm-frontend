<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useCountryStore } from '@/stores/country.store'
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
import { cilPencil, cilTrash, cilUser } from '@coreui/icons'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'

const countryStore = useCountryStore()

const showModal = ref(false)
const isEditing = ref(false)
const validated = ref(false)

const editingId = ref(null)
const currentCountry = ref(null)

// fetch data
onMounted(() => {
  countryStore.fetchCountries()
})

// search & pagination
const searchQuery = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)

const filteredCountries = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return countryStore.countries.filter((c) => {
    const matchesQuery =
      !q ||
      [c.country].some((f) =>
        f?.toLowerCase().includes(q),
      )
    return matchesQuery
  })
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredCountries.value.length / itemsPerPage.value)),
)
const paginatedCountries = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredCountries.value.slice(start, start + itemsPerPage.value)
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
  editingId.value = null
  currentCountry.value = null
  showModal.value = true
}

function openEdit(country) {
  isEditing.value = true
  validated.value = false
  editingId.value = country.id
  currentCountry.value = countries.find(c => c.value === country.country) || null
  showModal.value = true
}


function confirmDelete(id) {
  if (confirm('Are you sure you want to delete this country?')) {
    countryStore.deleteCountry(id)
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
    country: currentCountry.value?.value, 
  }

  if (isEditing.value) {
    payload.country_id = editingId.value

    await countryStore.updateCountry(payload)
  } else {
    await countryStore.createCountry(payload)
  }

  showModal.value = false
  countryStore.fetchCountries()
}


const countries = [
  { value: 'Rwanda', label: 'Rwanda' },
  { value: 'DR Congo', label: 'DR Congo' },
  { value: 'Uganda', label: 'Uganda' },
  { value: 'Burundi', label: 'Burundi' },
]
</script>

<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader class="d-flex justify-content-between align-items-center">
          <strong>Coutries</strong>
          <div class="d-flex gap-2 mb-3">
            <CButton color="dark" @click="openCreate">+ Create Country</CButton>
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
                placeholder="Search by Country"
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

          <!-- users table -->
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Country</CTableHeaderCell>
                <CTableHeaderCell>Created At</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="country in paginatedCountries" :key="country.id">
                <CTableDataCell>{{ country.country }}</CTableDataCell>
                <CTableDataCell>{{
                  new Date(country.created_at).toLocaleString() || ''
                }}</CTableDataCell>
                <CTableDataCell>
                  <!-- Edit country Button -->
                  <CButton
                    size="sm"
                    color="info"
                    class="me-2 text-white"
                    title="Edit country"
                    @click="openEdit(country)"
                  >
                    <CIcon :icon="cilPencil" />
                  </CButton>

                  <!-- Delete country Button -->
                  <CButton
                    size="sm"
                    color="danger"
                    class="text-white"
                    title="Delete country"
                    @click="confirmDelete(country.id)"
                  >
                    <CIcon :icon="cilTrash" />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
              <CTableRow v-if="paginatedCountries.length === 0">
                <CTableDataCell colspan="8" class="text-center"> No country found. </CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>

          <!-- pagination controls -->
          <div class="text-end mb-3">
            <strong>Total Records:</strong> {{ filteredCountries.length }}
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
      <CModalTitle>{{ isEditing ? 'Edit Country' : 'Add Country' }}</CModalTitle>
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
          <CFormLabel for="country">Country</CFormLabel>
          <Multiselect
            v-model="currentCountry"
            placeholder="Select Country"
            track-by="value"
            label="label"
            :options="countries"
            :show-no-results="false"
            :close-on-select="true"
            :clear-on-select="false"
            :preserve-search="true"
            :preselect-first="false"
            required
          />
          <CFormFeedback invalid>This field is required.</CFormFeedback>
        </CCol>

        <CCol :md="12" class="d-flex justify-content-end">
          <CButton color="light" class="me-2" @click="showModal = false">Cancel</CButton>
          <CButton color="dark" type="submit">{{ isEditing ? 'Update' : 'Create' }}</CButton>
        </CCol>
      </CForm>
    </CModalBody>
  </CModal>
</template>
