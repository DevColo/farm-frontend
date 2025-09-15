<script setup>
import { ref, onMounted } from 'vue'
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
} from '@coreui/vue'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const route = useRoute()
const cowStore = useCowStore()
const cow = ref({})
const imageUrl = ref('')

onMounted(async () => {
  const cowId = route.params.id
  await cowStore.fetchCowById(cowId)
  cow.value = cowStore.cow
  console.log(cow.value)
  if (cow.value.image) {
    imageUrl.value = cow.value.image.startsWith('http')
      ? cow.value.image
      : `${import.meta.env.VITE_API_BASE_URL}/cow_images/${cow.value.image.replace(/\\/g, '/')}`
  }
})

function exportCowProfilePDF() {
  if (!cow.value) return

  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text('Cow Profile', 14, 22)

  doc.setFontSize(12)
  doc.text(`Name: ${cow.value.name || '—'}`, 14, 35)
  doc.text(`Ear Tag: ${cow.value.ear_tag || '—'}`, 14, 43)
  doc.text(`Breed: ${cow.value.breed || '—'}`, 14, 51)
  doc.text(`Type: ${cow.value.type || '—'}`, 14, 59)
  doc.text(`Date of Birth: ${cow.value.date_of_birth || '—'}`, 14, 67)
  doc.text(`Pasture: ${cow.value.pasture?.pasture || '—'}`, 14, 75)
  doc.text(`Owner: ${cow.value.owner?.first_name || '—'}`, 14, 83)
  doc.text(
    `Status: ${
      cow.value.status === '1' ? 'Active' : cow.value.status === '0' ? 'Inactive' : cow.value.status
    }`,
    14,
    91,
  )
  doc.text(`Description:`, 14, 99)

  const splitDescription = doc.splitTextToSize(cow.value.description || '—', 180)
  doc.text(splitDescription, 14, 107)

  // Feeding history table
  if (cow.value.feedings && cow.value.feedings.length) {
    autoTable(doc, {
      startY: 120 + splitDescription.length * 6,
      head: [['Food', 'Quantity', 'Date']],
      body: cow.value.feedings.map((f) => [f.food?.food || '-', f.quantity, f.fed_date]),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 10 },
    })
  }

  // Medication history table
  if (cow.value.medications && cow.value.medications.length) {
    const startY = doc.previousAutoTable ? doc.previousAutoTable.finalY + 10 : 150

    autoTable(doc, {
      startY,
      head: [['Medication', 'Reason', 'Date']],
      body: cow.value.medications.map((m) => [m.medication, m.reason, m.medication_date]),
      theme: 'grid',
      headStyles: { fillColor: [39, 174, 96] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 10 },
    })
  }

  doc.save(`Cow_Profile_${cow.value.name || cow.value.ear_tag}.pdf`)
}

// Calculate expected birth date based on mating date
function calculateExpectedBirth(matingDate) {
  if (!matingDate) return null

  const date = new Date(matingDate)
  date.setMonth(date.getMonth() + 9) // add 9 months

  const options = { year: 'numeric', month: 'long' }
  return date.toLocaleDateString(undefined, options) // Example: "April 2026"
}
</script>
<template>
  <CContainer class="mt-4">
    <!-- Breadcrumb + Download Button -->
    <div class="flex justify-between items-center mb-4">
      <nav class="text-gray-500 text-sm">
        <router-link to="/cows" class="text-blue-600 hover:underline">Cows</router-link>
        <span class="mx-2">/</span>
        <span class="text-gray-700 font-semibold">Cow Profile</span>
      </nav>
    </div>
    <CRow>
      <CCol md="4">
        <CCard>
          <CCardHeader><strong>Cow Profile</strong></CCardHeader>
          <CCardBody>
            <div class="text-center mb-3">
              <img
                :src="imageUrl"
                alt="Cow Image"
                class="img-fluid rounded"
                style="max-height: 200px"
              />
            </div>
            <p><strong>Name:</strong> {{ cow.name }}</p>
            <p><strong>Ear Tag:</strong> {{ cow.ear_tag }}</p>
            <p><strong>Breed:</strong> {{ cow.breed }}</p>
            <p><strong>Type:</strong> {{ cow.type }}</p>
            <p><strong>Date of Birth:</strong> {{ cow.date_of_birth }}</p>
            <p>
              <strong>Status:</strong>
              {{ cow.status === '1' ? 'Active' : cow.status === '0' ? 'Inactive' : cow.status }}
            </p>
            <p><strong>Pasture:</strong> {{ cow.pasture?.pasture }}</p>
            <p><strong>Owner:</strong> {{ cow.owner?.first_name }}</p>
            <CButton color="dark" @click="exportCowProfilePDF"
              ><CIcon icon="cil-cloud-download" /> Download</CButton
            >
          </CCardBody>
        </CCard>
      </CCol>

      <CCol md="8">
        <CCard>
          <CCardHeader><strong>Feeding History</strong></CCardHeader>
          <CCardBody>
            <CTable striped hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Date</CTableHeaderCell>
                  <CTableHeaderCell>Food</CTableHeaderCell>
                  <CTableHeaderCell>Quantity</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow v-for="feed in cow.feedings" :key="feed.id">
                  <CTableDataCell>{{ feed.fed_date }}</CTableDataCell>
                  <CTableDataCell>{{ feed.food?.food }}</CTableDataCell>
                  <CTableDataCell>{{ feed.quantity }}</CTableDataCell>
                </CTableRow>
                <CTableRow v-if="!cow.feedings || cow.feedings.length === 0">
                  <CTableDataCell colspan="3" class="text-center"
                    >No feeding records</CTableDataCell
                  >
                </CTableRow>
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>

        <CCard class="mt-4">
          <CCardHeader><strong>Medication History</strong></CCardHeader>
          <CCardBody>
            <CTable striped hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Date</CTableHeaderCell>
                  <CTableHeaderCell>Medication</CTableHeaderCell>
                  <CTableHeaderCell>Reason</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow v-for="med in cow.medications" :key="med.id">
                  <CTableDataCell>{{ med.medication_date }}</CTableDataCell>
                  <CTableDataCell>{{ med.medication }}</CTableDataCell>
                  <CTableDataCell>{{ med.reason }}</CTableDataCell>
                </CTableRow>
                <CTableRow v-if="!cow.medications || cow.medications.length === 0">
                  <CTableDataCell colspan="3" class="text-center"
                    >No medication records</CTableDataCell
                  >
                </CTableRow>
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>

        <CCard class="mt-4">
          <CCardHeader><strong>Maternity History</strong></CCardHeader>
          <CCardBody>
            <CTable striped hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Date of Mating</CTableHeaderCell>
                  <CTableHeaderCell>{{ cow.type == 'Female' ? 'Bull' : 'Cow' }}</CTableHeaderCell>
                  <CTableHeaderCell>Pregnacy Status</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow v-for="maternity in cow.maternities" :key="maternity.id">
                  <CTableDataCell>{{ maternity.mating_date }}</CTableDataCell>
                  <CTableDataCell
                    ><router-link
                      :to="`/cows/${cow.type == 'Female' ? maternity.bull?.id : maternity.cow?.id}`"
                      >{{
                        cow.type == 'Female' ? maternity.bull?.ear_tag : maternity.cow?.ear_tag
                      }}</router-link
                    ></CTableDataCell
                  >
                  <CTableDataCell>{{
                    maternity.pregnancy_status == 'Given Birth'
                      ? maternity.pregnancy_status +
                        ' to ' +
                        maternity.calf_amount +
                        ' calves on ' +
                        maternity.birth_date
                      : maternity.pregnancy_status == 'Pregnant'
                      ? ' Pregnant - Expecting Delivery: ' +
                        calculateExpectedBirth(maternity.mating_date)
                      : maternity.pregnancy_status
                  }}</CTableDataCell>
                </CTableRow>
                <CTableRow v-if="!cow.maternities || cow.maternities.length === 0">
                  <CTableDataCell colspan="3" class="text-center"
                    >No maternity record</CTableDataCell
                  >
                </CTableRow>
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </CContainer>
</template>
