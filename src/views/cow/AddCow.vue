<script setup>
import { ref, onMounted } from 'vue'
import { useCowStore } from '@/stores/cow.store'
import { usePastureStore } from '@/stores/pasture.store'

const cowStore = useCowStore()
const pastureStore = usePastureStore()

const validated = ref(false)

const earTag = ref('')
const dateOfBirth = ref('')
const type = ref('')
const breed = ref('')
const herd = ref('')
const description = ref('')
const pastureId = ref('')
const status = ref(true)

// Fetch pastures once component is mounted
onMounted(() => {
  //pastureStore.fetchPastures()
})

const handleSubmit = async (event) => {
  const form = event.currentTarget
  if (!form.checkValidity()) {
    event.preventDefault()
    event.stopPropagation()
    validated.value = true
    return
  }

  event.preventDefault()

  await cowStore.createCow({
    ear_tag: earTag.value,
    date_of_birth: dateOfBirth.value,
    type: type.value,
    breed: breed.value,
    herd: herd.value,
    description: description.value,
    pasture_id: pastureId.value,
    status: status.value ? '1' : '0',
  })

  // Reset the form
  earTag.value = ''
  dateOfBirth.value = ''
  type.value = ''
  breed.value = ''
  herd.value = ''
  description.value = ''
  pastureId.value = ''
  status.value = true
  validated.value = false
}
</script>

<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader><strong>Create New Cow</strong></CCardHeader>
        <CCardBody>
          <CForm
            class="row g-3 needs-validation"
            novalidate
            :validated="validated"
            @submit="handleSubmit"
          >
            <CCol :md="6">
              <CFormLabel for="earTag">Ear Tag</CFormLabel>
              <CInputGroup class="has-validation">
                <CFormInput id="earTag" v-model="earTag" required />
                <CFormFeedback invalid>Please enter ear tag.</CFormFeedback>
              </CInputGroup>
            </CCol>

            <CCol :md="6">
              <CFormLabel for="dateOfBirth">Date of Birth</CFormLabel>
              <CFormInput id="dateOfBirth" type="date" v-model="dateOfBirth" required />
              <CFormFeedback invalid>Please enter date of birth.</CFormFeedback>
            </CCol>

            <CCol :md="6">
              <CFormLabel for="type">Type</CFormLabel>
              <CFormInput id="type" v-model="type" />
            </CCol>

            <CCol :md="6">
              <CFormLabel for="breed">Breed</CFormLabel>
              <CFormInput id="breed" v-model="breed" />
            </CCol>

            <CCol :md="6">
              <CFormLabel for="herd">Herd</CFormLabel>
              <CFormInput id="herd" v-model="herd" />
            </CCol>

            <CCol :md="6">
              <CFormLabel for="pasture">Pasture</CFormLabel>
              <CFormSelect
                id="pasture"
                v-model="pastureId"
                required
                :options="[
                  { label: 'Select pasture', value: '', disabled: true },
                  ...pastureStore.pastures.map((p) => ({
                    label: p.pasture,
                    value: p.id,
                  })),
                ]"
              />
              <CFormFeedback invalid>Please select pasture.</CFormFeedback>
            </CCol>

            <CCol :xs="12">
              <CFormLabel for="description">Description</CFormLabel>
              <CFormTextarea id="description" rows="3" v-model="description"></CFormTextarea>
            </CCol>

            <CCol :xs="12">
              <CFormCheck v-model="status" type="checkbox" label="Active" />
            </CCol>

            <CCol :xs="12">
              <CButton color="success" type="submit">Submit</CButton>
            </CCol>
          </CForm>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>
