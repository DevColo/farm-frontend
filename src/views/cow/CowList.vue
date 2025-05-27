<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCowStore } from '@/stores/cow.store'
import { usePastureStore } from '@/stores/pasture.store'
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
  CInputGroup,
} from '@coreui/vue'

const cowStore = useCowStore()
const pastureStore = usePastureStore()

const showModal = ref(false)
const isEditing = ref(false)
const validated = ref(false)

const herdFromOutside = computed(() => currentCow.value.herd === 'from_outside')

const currentCow = ref({
  id: null,
  name: '',
  ear_tag: '',
  date_of_birth: '',
  type: '',
  breed: '',
  herd: '',
  from_location: '',
  description: '',
  pasture_id: '',
  status: true,
  image: null,
})

onMounted(() => {
  cowStore.fetchCows()
  pastureStore.fetchPastures()
})

const openCreate = () => {
  isEditing.value = false
  validated.value = false
  currentCow.value = {
    id: null,
    name: '',
    ear_tag: '',
    date_of_birth: '',
    type: '',
    breed: '',
    herd: '',
    from_location: '',
    description: '',
    pasture_id: '',
    status: true,
    image: null,
  }
  showModal.value = true
}

const openEdit = (cow) => {
  isEditing.value = true
  currentCow.value = { ...cow, status: cow.status === '1' }
  showModal.value = true
}

const handleSubmit = async (event) => {
  const form = event.currentTarget
  if (!form.checkValidity()) {
    event.preventDefault()
    event.stopPropagation()
    validated.value = true
    return
  }

  event.preventDefault()

  const payload = {
    name: currentCow.value.name,
    ear_tag: currentCow.value.ear_tag,
    date_of_birth: currentCow.value.date_of_birth,
    type: currentCow.value.type,
    breed: currentCow.value.breed,
    herd: currentCow.value.herd,
    from_location: currentCow.value.herd === 'from_outside' ? currentCow.value.from_location : '',
    description: currentCow.value.description,
    pasture_id: currentCow.value.pasture_id,
    status: currentCow.value.status ? '1' : '0',
    image: currentCow.value.image,
  }

  if (isEditing.value) {
    await cowStore.editCow(currentCow.value.id, payload)
  } else {
    await cowStore.createCow(payload)
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
            <strong>Cow List</strong>
            <CButton color="primary" @click="openCreate">+ Add Cow</CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>ID</CTableHeaderCell>
                <CTableHeaderCell>Name</CTableHeaderCell>
                <CTableHeaderCell>Ear Tag</CTableHeaderCell>
                <CTableHeaderCell>Date of Birth</CTableHeaderCell>
                <CTableHeaderCell>Breed</CTableHeaderCell>
                <CTableHeaderCell>Pasture</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="cow in cowStore.cows" :key="cow.id">
                <CTableDataCell>{{ cow.id }}</CTableDataCell>
                <CTableDataCell>{{ cow.name }}</CTableDataCell>
                <CTableDataCell>{{ cow.ear_tag }}</CTableDataCell>
                <CTableDataCell>{{ cow.date_of_birth }}</CTableDataCell>
                <CTableDataCell>{{ cow.breed }}</CTableDataCell>
                <CTableDataCell>{{ cow.pasture?.pasture || '—' }}</CTableDataCell>
                <CTableDataCell>
                  <span :class="['badge', cow.status === '1' ? 'bg-success' : 'bg-danger']">
                    {{ cow.status === '1' ? 'Active' : 'Inactive' }}
                  </span>
                </CTableDataCell>
                <CTableDataCell>
                  <CButton size="sm" color="info" @click="openEdit(cow)">Edit</CButton>
                </CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>

  <!-- Modal -->
  <CModal :visible="showModal" @close="showModal = false" backdrop="static" size="lg">
    <CModalHeader>
      <CModalTitle>{{ isEditing ? 'Edit Cow' : 'Add Cow' }}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CForm
        class="row g-3 needs-validation"
        novalidate
        :validated="validated"
        @submit="handleSubmit"
      >
        <CCol :md="6">
          <CFormLabel for="name">Cow Name</CFormLabel>
          <CFormInput id="name" v-model="currentCow.name" />
          <CFormFeedback invalid>Name is required.</CFormFeedback>
        </CCol>

        <CCol :md="6">
          <CFormLabel for="earTag">Ear Tag</CFormLabel>
          <CFormInput id="earTag" v-model="currentCow.ear_tag" required />
          <CFormFeedback invalid>Ear tag is required.</CFormFeedback>
        </CCol>

        <CCol :md="6">
          <CFormLabel for="dateOfBirth">Date of Birth</CFormLabel>
          <CFormInput id="dateOfBirth" type="date" v-model="currentCow.date_of_birth" required />
          <CFormFeedback invalid>Date of birth is required.</CFormFeedback>
        </CCol>

        <CCol :md="6">
          <CFormLabel for="type">Type</CFormLabel>
          <CFormSelect
            id="type"
            v-model="currentCow.type"
            :options="[
              { label: 'Select Type', value: '' },
              { label: 'Cow', value: 'cow' },
              { label: 'Bull', value: 'bull' },
            ]"
            required
          />
          <CFormFeedback invalid>Type is required.</CFormFeedback>
        </CCol>

        <CCol :md="6">
          <CFormLabel for="breed">Breed</CFormLabel>
          <CFormSelect
            id="breed"
            v-model="currentCow.breed"
            :options="
              [
                { label: 'Select Breed', value: '' },
                'Holstein',
                'Jersey',
                'Guernsey',
                'Angus',
                'Hereford',
                'Simmental',
                'Brahman',
                'Limousin',
                'Charolais',
                'Red Poll',
              ].map((b) => (typeof b === 'string' ? { label: b, value: b } : b))
            "
            required
          />
          <CFormFeedback invalid>Breed is required.</CFormFeedback>
        </CCol>

        <CCol :md="6">
          <CFormLabel for="herd">Herd</CFormLabel>
          <CFormSelect
            id="herd"
            v-model="currentCow.herd"
            :options="[
              { label: 'Select Herd', value: '' },
              { label: 'From Farm', value: 'from_farm' },
              { label: 'From Outside', value: 'from_outside' },
            ]"
            required
          />
          <CFormFeedback invalid>Herd is required.</CFormFeedback>
        </CCol>

        <CCol :md="6" v-if="herdFromOutside">
          <CFormLabel for="from_location">Source Location</CFormLabel>
          <CFormInput id="from_location" v-model="currentCow.from_location" required />
          <CFormFeedback invalid>Source location required if from outside.</CFormFeedback>
        </CCol>

        <CCol :md="6">
          <CFormLabel for="pasture">Pasture</CFormLabel>
          <CFormSelect
            id="pasture"
            v-model="currentCow.pasture_id"
            :options="[
              { label: 'Select pasture', value: '' },
              ...pastureStore.pastures.map((p) => ({ label: p.pasture, value: p.id })),
            ]"
            required
          />
          <CFormFeedback invalid>Select pasture.</CFormFeedback>
        </CCol>

        <CCol :xs="12">
          <CFormLabel for="description">Description</CFormLabel>
          <CFormTextarea id="description" rows="3" v-model="currentCow.description" />
        </CCol>

        <CCol :xs="12">
          <CFormLabel for="image">Cow Image</CFormLabel>
          <CFormInput
            type="file"
            id="image"
            @change="(e) => (currentCow.image = e.target.files[0])"
          />
        </CCol>

        <CCol :xs="12">
          <CFormCheck v-model="currentCow.status" type="checkbox" label="Active" />
        </CCol>

        <CCol :xs="12">
          <CButton color="success" type="submit">{{ isEditing ? 'Update' : 'Create' }}</CButton>
        </CCol>
      </CForm>
    </CModalBody>
  </CModal>
</template>
