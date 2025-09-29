<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCowStore } from '@/stores/cow.store'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CContainer,
  CRow,
  CCol,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CButton,
  CInputGroup,
  CFormInput,
  CBadge,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
} from '@coreui/vue'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const route = useRoute()
const cowStore = useCowStore()
const cow = ref({})
const imageUrl = ref('')
const activeTab = ref('feeding')

// Search and pagination states
const feedingSearch = ref('')
const medicationSearch = ref('')
const maternitySearch = ref('')
const feedingCurrentPage = ref(1)
const medicationCurrentPage = ref(1)
const maternityCurrentPage = ref(1)
const itemsPerPage = 5

onMounted(async () => {
  const cowId = route.params.id
  await cowStore.fetchCowById(cowId)
  cow.value = cowStore.cow
  console.log(cow.value)
  if (cow.value.image) {
    imageUrl.value = cow.value.image.startsWith('http')
      ? cow.value.image
      : `${import.meta.env.VITE_API_BASE_URL}/${cow.value.image.replace(/\\/g, '/')}`
  }
})

// Filtered and paginated data
const filteredFeedings = computed(() => {
  if (!cow.value.feedings) return []
  return cow.value.feedings.filter(feed => 
    feed.food?.food?.toLowerCase().includes(feedingSearch.value.toLowerCase()) ||
    feed.fed_date?.toLowerCase().includes(feedingSearch.value.toLowerCase()) ||
    feed.quantity?.toString().includes(feedingSearch.value.toLowerCase())
  )
})

const filteredMedications = computed(() => {
  if (!cow.value.medications) return []
  return cow.value.medications.filter(med => 
    med.medication?.toLowerCase().includes(medicationSearch.value.toLowerCase()) ||
    med.reason?.toLowerCase().includes(medicationSearch.value.toLowerCase()) ||
    med.medication_date?.toLowerCase().includes(medicationSearch.value.toLowerCase())
  )
})

const filteredMaternities = computed(() => {
  if (!cow.value.maternities) return []
  return cow.value.maternities.filter(mat => 
    mat.mating_date?.toLowerCase().includes(maternitySearch.value.toLowerCase()) ||
    mat.pregnancy_status?.toLowerCase().includes(maternitySearch.value.toLowerCase()) ||
    (cow.value.type === 'Female' ? mat.bull?.ear_tag : mat.cow?.ear_tag)?.toLowerCase().includes(maternitySearch.value.toLowerCase())
  )
})

const paginatedFeedings = computed(() => {
  const start = (feedingCurrentPage.value - 1) * itemsPerPage
  return filteredFeedings.value.slice(start, start + itemsPerPage)
})

const paginatedMedications = computed(() => {
  const start = (medicationCurrentPage.value - 1) * itemsPerPage
  return filteredMedications.value.slice(start, start + itemsPerPage)
})

const paginatedMaternities = computed(() => {
  const start = (maternityCurrentPage.value - 1) * itemsPerPage
  return filteredMaternities.value.slice(start, start + itemsPerPage)
})

const feedingTotalPages = computed(() => Math.ceil(filteredFeedings.value.length / itemsPerPage))
const medicationTotalPages = computed(() => Math.ceil(filteredMedications.value.length / itemsPerPage))
const maternityTotalPages = computed(() => Math.ceil(filteredMaternities.value.length / itemsPerPage))

function exportCowProfilePDF() {
  if (!cow.value) return

  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(20)
  doc.setFont(undefined, 'bold')
  doc.text('Cow Profile Report', 14, 22)
  
  // Basic Info
  doc.setFontSize(12)
  doc.setFont(undefined, 'normal')
  doc.text(`Name: ${cow.value.name || '—'}`, 14, 40)
  doc.text(`Ear Tag: ${cow.value.ear_tag || '—'}`, 14, 48)
  doc.text(`Breed: ${cow.value.breed || '—'}`, 14, 56)
  doc.text(`Type: ${cow.value.type || '—'}`, 14, 64)
  doc.text(`Date of Birth: ${cow.value.date_of_birth || '—'}`, 14, 72)
  doc.text(`Pasture: ${cow.value.pasture?.pasture || '—'}`, 14, 80)
  doc.text(`Owner: ${cow.value.owner?.first_name || '—'}`, 14, 88)
  doc.text(`Status: ${cow.value.status === '1' ? 'Active' : cow.value.status === '0' ? 'Inactive' : cow.value.status}`, 14, 96)
  
  let yPosition = 110

  // Feeding history table
  if (cow.value.feedings && cow.value.feedings.length) {
    doc.setFontSize(14)
    doc.setFont(undefined, 'bold')
    doc.text('Feeding History', 14, yPosition)
    yPosition += 10

    autoTable(doc, {
      startY: yPosition,
      head: [['Date', 'Food', 'Quantity']],
      body: cow.value.feedings.map((f) => [f.fed_date, f.food?.food || '-', f.quantity]),
      theme: 'striped',
      headStyles: { fillColor: [52, 152, 219] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 10 },
    })
    yPosition = doc.previousAutoTable.finalY + 15
  }

  // Medication history table
  if (cow.value.medications && cow.value.medications.length) {
    doc.setFontSize(14)
    doc.setFont(undefined, 'bold')
    doc.text('Medication History', 14, yPosition)
    yPosition += 10

    autoTable(doc, {
      startY: yPosition,
      head: [['Date', 'Medication', 'Reason']],
      body: cow.value.medications.map((m) => [m.medication_date, m.medication, m.reason]),
      theme: 'striped',
      headStyles: { fillColor: [46, 204, 113] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 10 },
    })
    yPosition = doc.previousAutoTable.finalY + 15
  }

  // Maternity history table
  if (cow.value.maternities && cow.value.maternities.length) {
    doc.setFontSize(14)
    doc.setFont(undefined, 'bold')
    doc.text('Maternity History', 14, yPosition)
    yPosition += 10

    autoTable(doc, {
      startY: yPosition,
      head: [['Mating Date', cow.value.type === 'Female' ? 'Bull' : 'Cow', 'Pregnancy Status']],
      body: cow.value.maternities.map((m) => [
        m.mating_date,
        cow.value.type === 'Female' ? m.bull?.ear_tag : m.cow?.ear_tag,
        m.pregnancy_status === 'Given Birth'
          ? `${m.pregnancy_status} to ${m.calf_amount} calves on ${m.birth_date}`
          : m.pregnancy_status === 'Pregnant'
          ? `Pregnant - Expecting: ${calculateExpectedBirth(m.mating_date)}`
          : m.pregnancy_status
      ]),
      theme: 'striped',
      headStyles: { fillColor: [155, 89, 182] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 10 },
    })
  }

  doc.save(`Cow_Profile_${cow.value.name || cow.value.ear_tag}_${new Date().toISOString().split('T')[0]}.pdf`)
}

function calculateExpectedBirth(matingDate) {
  if (!matingDate) return null
  const date = new Date(matingDate)
  date.setMonth(date.getMonth() + 9)
  const options = { year: 'numeric', month: 'long' }
  return date.toLocaleDateString(undefined, options)
}

function getStatusBadgeColor(status) {
  return status === '1' ? 'success' : status === '0' ? 'danger' : 'secondary'
}

function getPregnancyStatusBadge(status) {
  switch (status) {
    case 'Pregnant': return 'warning'
    case 'Given Birth': return 'success' 
    case 'Not Pregnant': return 'secondary'
    default: return 'secondary'
  }
}

function formatDate(dateString) {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <CContainer class="mt-4" fluid>
    <!-- Enhanced Breadcrumb -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <nav class="breadcrumb-nav">
        <router-link to="/cows" class="text-decoration-none text-primary">
          <i class="fas fa-arrow-left me-2"></i>Back to Cows
        </router-link>
        <span class="mx-2 text-muted">></span>
        <span class="fw-semibold">{{ cow.name }} - {{ cow.ear_tag }}</span>
      </nav>
    </div>

    <CRow class="g-4">
      <!-- Enhanced Profile Card -->
      <CCol lg="4">
        <CCard class="shadow border-0 h-100 rounded-3">
          <!-- Header -->
          <CCardHeader class="bg-gradient-primary text-white rounded-top d-flex align-items-center">
            <h5 class="mb-0 text-dark">Cow Profile</h5>
          </CCardHeader>

          <CCardBody class="p-4">
            <!-- Image Section -->
            <div class="text-center mb-4">
              <div
                class="profile-image-container d-inline-block border rounded-circle shadow-sm p-1 bg-white"
              >
                <img
                  :src="imageUrl"
                  alt="Cow Image"
                  class="w-100 h-100"
                  style="object-fit: cover;"
                />
              </div>
              <h6 class="mt-3 mb-0 fw-bold">{{ cow.name || 'Unnamed' }}</h6>
              <small class="text-muted">#{{ cow.ear_tag || '—' }}</small>
            </div>

            <!-- Profile Details -->
            <div class="profile-details">
              <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span class="fw-semibold text-muted">Gender</span>
                <span>{{ cow.gender || '—' }}</span>
              </div>

              <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span class="fw-semibold text-muted">Breed</span>
                <span>{{ cow.breed || '' }}</span>
              </div>

              <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span class="fw-semibold text-muted">Class</span>
                <span>{{ cow.class || '' }}</span>
              </div>

              <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span class="fw-semibold text-muted">Birth Date</span>
                <span>{{ formatDate(cow.date_of_birth) }}</span>
              </div>

              <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span class="fw-semibold text-muted">Status</span>
                <CBadge :color="getStatusBadgeColor(cow.status)" class="px-3 py-1 rounded-pill">
                  {{ cow.status === '1' ? 'Active' : cow.status === '0' ? 'Inactive' : cow.status }}
                </CBadge>
              </div>

              <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span class="fw-semibold text-muted">Pasture</span>
                <span>{{ cow.pasture?.pasture || '' }}</span>
              </div>

              <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span class="fw-semibold text-muted">Origin</span>
                <span>{{ cow.from_farm == 'yes' ? 'Born on farm' : cow.source_location }}</span>
              </div>

               <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span class="fw-semibold text-muted">Description</span>
                <span>{{ cow.description || '' }}</span>
              </div>

              <div class="d-flex justify-content-between align-items-center py-2">
                <span class="fw-semibold text-muted">Created By</span>
                <span>{{ cow.user?.first_name || '—' }}</span>
              </div>
            </div>

            <!-- Action Button -->
            <div class="mt-4">
              <CButton
                color="success"
                variant="outline"
                @click="exportCowProfilePDF"
                class="w-100 py-2 fw-semibold rounded-pill"
              >
                <i class="fas fa-file-pdf me-2"></i> Export PDF Report
              </CButton>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <!-- Enhanced Data Tables -->
      <CCol lg="8">
        <!-- Tab Navigation -->
        <CNav variant="tabs" class="mb-4">
          <CNavItem>
            <CNavLink 
              :active="activeTab === 'feeding'" 
              @click="activeTab = 'feeding'"
              class="cursor-pointer"
            >
              <i class="fas fa-utensils me-2"></i>Feeding History
              <CBadge color="primary" class="ms-2" v-if="cow.feedings?.length">
                {{ cow.feedings.length }}
              </CBadge>
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink 
              :active="activeTab === 'medication'" 
              @click="activeTab = 'medication'"
              class="cursor-pointer"
            >
              <i class="fas fa-pills me-2"></i>Medication History
              <CBadge color="primary" class="ms-2" v-if="cow.medications?.length">
                {{ cow.medications.length }}
              </CBadge>
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink 
              :active="activeTab === 'maternity'" 
              @click="activeTab = 'maternity'"
              class="cursor-pointer"
            >
              <i class="fas fa-heart me-2"></i>Maternity History
              <CBadge color="primary" class="ms-2" v-if="cow.maternities?.length">
                {{ cow.maternities.length }}
              </CBadge>
            </CNavLink>
          </CNavItem>
        </CNav>

        <CTabContent>
          <!-- Feeding History Tab -->
          <CTabPane :visible="activeTab === 'feeding'">
            <CCard class="shadow-sm border-0">
              <CCardHeader class="bg-light border-bottom">
                <div class="d-flex justify-content-between align-items-center">
                  <h6 class="mb-0">
                    <i class="fas fa-utensils me-2 text-primary"></i>Feeding Records
                  </h6>
                  <CInputGroup style="width: 300px;">
                    <CFormInput
                      v-model="feedingSearch"
                      placeholder="Search feeding records..."
                      size="sm"
                    />
                    <span class="input-group-text">
                      <i class="fas fa-search"></i>
                    </span>
                  </CInputGroup>
                </div>
              </CCardHeader>
              <CCardBody class="p-0">
                <CTable striped hover responsive class="mb-0">
                  <CTableHead class="table-light">
                    <CTableRow>
                      <CTableHeaderCell class="fw-semibold">Date</CTableHeaderCell>
                      <CTableHeaderCell class="fw-semibold">Food Type</CTableHeaderCell>
                      <CTableHeaderCell class="fw-semibold">Quantity</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    <CTableRow v-for="feed in paginatedFeedings" :key="feed.id">
                      <CTableDataCell>
                        <i class="fas fa-calendar-alt me-2 text-muted"></i>
                        {{ formatDate(feed.fed_date) }}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color="info" variant="outline" class="px-2 py-1">
                          {{ feed.food?.food || 'Unknown' }}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell class="fw-semibold">{{ feed.quantity }}</CTableDataCell>
                    </CTableRow>
                    <CTableRow v-if="paginatedFeedings.length === 0">
                      <CTableDataCell colspan="3" class="text-center py-4 text-muted">
                        <i class="fas fa-utensils fa-2x mb-2 opacity-50"></i>
                        <div>No feeding records found</div>
                      </CTableDataCell>
                    </CTableRow>
                  </CTableBody>
                </CTable>
                
                <!-- Feeding Pagination -->
                <div class="d-flex justify-content-between align-items-center p-3 border-top bg-light" v-if="feedingTotalPages > 1">
                  <span class="text-muted small">
                    Showing {{ (feedingCurrentPage - 1) * itemsPerPage + 1 }} to 
                    {{ Math.min(feedingCurrentPage * itemsPerPage, filteredFeedings.length) }} 
                    of {{ filteredFeedings.length }} entries
                  </span>
                  <div class="btn-group" role="group">
                    <CButton 
                      size="sm" 
                      variant="outline" 
                      :disabled="feedingCurrentPage === 1"
                      @click="feedingCurrentPage--"
                    >
                      <i class="fas fa-chevron-left"></i>
                    </CButton>
                    <CButton 
                      size="sm" 
                      variant="outline" 
                      v-for="page in feedingTotalPages" 
                      :key="page"
                      :color="page === feedingCurrentPage ? 'primary' : ''"
                      @click="feedingCurrentPage = page"
                    >
                      {{ page }}
                    </CButton>
                    <CButton 
                      size="sm" 
                      variant="outline" 
                      :disabled="feedingCurrentPage === feedingTotalPages"
                      @click="feedingCurrentPage++"
                    >
                      <i class="fas fa-chevron-right"></i>
                    </CButton>
                  </div>
                </div>
              </CCardBody>
            </CCard>
          </CTabPane>

          <!-- Medication History Tab -->
          <CTabPane :visible="activeTab === 'medication'">
            <CCard class="shadow-sm border-0">
              <CCardHeader class="bg-light border-bottom">
                <div class="d-flex justify-content-between align-items-center">
                  <h6 class="mb-0">
                    <i class="fas fa-pills me-2 text-success"></i>Medication Records
                  </h6>
                  <CInputGroup style="width: 300px;">
                    <CFormInput
                      v-model="medicationSearch"
                      placeholder="Search medication records..."
                      size="sm"
                    />
                    <span class="input-group-text">
                      <i class="fas fa-search"></i>
                    </span>
                  </CInputGroup>
                </div>
              </CCardHeader>
              <CCardBody class="p-0">
                <CTable striped hover responsive class="mb-0">
                  <CTableHead class="table-light">
                    <CTableRow>
                      <CTableHeaderCell class="fw-semibold">Date</CTableHeaderCell>
                      <CTableHeaderCell class="fw-semibold">Medication</CTableHeaderCell>
                      <CTableHeaderCell class="fw-semibold">Reason</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    <CTableRow v-for="med in paginatedMedications" :key="med.id">
                      <CTableDataCell>
                        <i class="fas fa-calendar-alt me-2 text-muted"></i>
                        {{ formatDate(med.medication_date) }}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color="success" variant="outline" class="px-2 py-1">
                          {{ med.medication }}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>{{ med.reason }}</CTableDataCell>
                    </CTableRow>
                    <CTableRow v-if="paginatedMedications.length === 0">
                      <CTableDataCell colspan="3" class="text-center py-4 text-muted">
                        <i class="fas fa-pills fa-2x mb-2 opacity-50"></i>
                        <div>No medication records found</div>
                      </CTableDataCell>
                    </CTableRow>
                  </CTableBody>
                </CTable>

                <!-- Medication Pagination -->
                <div class="d-flex justify-content-between align-items-center p-3 border-top bg-light" v-if="medicationTotalPages > 1">
                  <span class="text-muted small">
                    Showing {{ (medicationCurrentPage - 1) * itemsPerPage + 1 }} to 
                    {{ Math.min(medicationCurrentPage * itemsPerPage, filteredMedications.length) }} 
                    of {{ filteredMedications.length }} entries
                  </span>
                  <div class="btn-group" role="group">
                    <CButton 
                      size="sm" 
                      variant="outline" 
                      :disabled="medicationCurrentPage === 1"
                      @click="medicationCurrentPage--"
                    >
                      <i class="fas fa-chevron-left"></i>
                    </CButton>
                    <CButton 
                      size="sm" 
                      variant="outline" 
                      v-for="page in medicationTotalPages" 
                      :key="page"
                      :color="page === medicationCurrentPage ? 'primary' : ''"
                      @click="medicationCurrentPage = page"
                    >
                      {{ page }}
                    </CButton>
                    <CButton 
                      size="sm" 
                      variant="outline" 
                      :disabled="medicationCurrentPage === medicationTotalPages"
                      @click="medicationCurrentPage++"
                    >
                      <i class="fas fa-chevron-right"></i>
                    </CButton>
                  </div>
                </div>
              </CCardBody>
            </CCard>
          </CTabPane>

          <!-- Maternity History Tab -->
          <CTabPane :visible="activeTab === 'maternity'">
            <CCard class="shadow-sm border-0">
              <CCardHeader class="bg-light border-bottom">
                <div class="d-flex justify-content-between align-items-center">
                  <h6 class="mb-0">
                    <i class="fas fa-heart me-2 text-danger"></i>Maternity Records
                  </h6>
                  <CInputGroup style="width: 300px;">
                    <CFormInput
                      v-model="maternitySearch"
                      placeholder="Search maternity records..."
                      size="sm"
                    />
                    <span class="input-group-text">
                      <i class="fas fa-search"></i>
                    </span>
                  </CInputGroup>
                </div>
              </CCardHeader>
              <CCardBody class="p-0">
                <CTable striped hover responsive class="mb-0">
                  <CTableHead class="table-light">
                    <CTableRow>
                      <CTableHeaderCell class="fw-semibold">Mating Date</CTableHeaderCell>
                      <CTableHeaderCell class="fw-semibold">{{ cow.type === 'Female' ? 'Bull' : 'Cow' }}</CTableHeaderCell>
                      <CTableHeaderCell class="fw-semibold">Pregnancy Status</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    <CTableRow v-for="maternity in paginatedMaternities" :key="maternity.id">
                      <CTableDataCell>
                        <i class="fas fa-calendar-alt me-2 text-muted"></i>
                        {{ formatDate(maternity.mating_date) }}
                      </CTableDataCell>
                      <CTableDataCell>
                        <router-link
                          :to="`/cows/${cow.type === 'Female' ? maternity.bull?.id : maternity.cow?.id}`"
                          class="text-decoration-none"
                        >
                          <CBadge color="primary" variant="outline" class="px-2 py-1">
                            {{ cow.type === 'Female' ? maternity.bull?.ear_tag : maternity.cow?.ear_tag }}
                          </CBadge>
                        </router-link>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge :color="getPregnancyStatusBadge(maternity.pregnancy_status)" class="px-2 py-1 me-2">
                          {{ maternity.pregnancy_status }}
                        </CBadge>
                        <div class="small text-muted mt-1" v-if="maternity.pregnancy_status === 'Given Birth'">
                          {{ maternity.calf_amount }} calves born on {{ formatDate(maternity.birth_date) }}
                        </div>
                        <div class="small text-muted mt-1" v-else-if="maternity.pregnancy_status === 'Pregnant'">
                          Expected delivery: {{ calculateExpectedBirth(maternity.mating_date) }}
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                    <CTableRow v-if="paginatedMaternities.length === 0">
                      <CTableDataCell colspan="3" class="text-center py-4 text-muted">
                        <i class="fas fa-heart fa-2x mb-2 opacity-50"></i>
                        <div>No maternity records found</div>
                      </CTableDataCell>
                    </CTableRow>
                  </CTableBody>
                </CTable>

                <!-- Maternity Pagination -->
                <div class="d-flex justify-content-between align-items-center p-3 border-top bg-light" v-if="maternityTotalPages > 1">
                  <span class="text-muted small">
                    Showing {{ (maternityCurrentPage - 1) * itemsPerPage + 1 }} to 
                    {{ Math.min(maternityCurrentPage * itemsPerPage, filteredMaternities.length) }} 
                    of {{ filteredMaternities.length }} entries
                  </span>
                  <div class="btn-group" role="group">
                    <CButton 
                      size="sm" 
                      variant="outline" 
                      :disabled="maternityCurrentPage === 1"
                      @click="maternityCurrentPage--"
                    >
                      <i class="fas fa-chevron-left"></i>
                    </CButton>
                    <CButton 
                      size="sm" 
                      variant="outline" 
                      v-for="page in maternityTotalPages" 
                      :key="page"
                      :color="page === maternityCurrentPage ? 'primary' : ''"
                      @click="maternityCurrentPage = page"
                    >
                      {{ page }}
                    </CButton>
                    <CButton 
                      size="sm" 
                      variant="outline" 
                      :disabled="maternityCurrentPage === maternityTotalPages"
                      @click="maternityCurrentPage++"
                    >
                      <i class="fas fa-chevron-right"></i>
                    </CButton>
                  </div>
                </div>
              </CCardBody>
            </CCard>
          </CTabPane>
        </CTabContent>
      </CCol>
    </CRow>
  </CContainer>
</template>