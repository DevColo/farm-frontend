<script setup>
import { ref } from 'vue'
import { usePastureStore } from '@/stores/pasture.store'

const pastureStore = usePastureStore()

const validated = ref(false)
const pastureName = ref('')
const country = ref('')
const isActive = ref(true)

const handleSubmit = async (event) => {
  const form = event.currentTarget
  if (!form.checkValidity()) {
    event.preventDefault()
    event.stopPropagation()
    validated.value = true
    return
  }

  event.preventDefault()

  await pastureStore.createPasture({
    pasture: pastureName.value,
    country: country.value,
    status: isActive.value ? 'active' : 'inactive',
  })
}
</script>

<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader> <strong>Create New Pasture</strong></CCardHeader>
        <CCardBody>
          <CForm
            class="row g-3 needs-validation"
            novalidate
            :validated="validated"
            @submit="handleSubmit"
          >
            <CCol :md="6">
              <CFormLabel for="pastureName">Pasture Name</CFormLabel>
              <CInputGroup class="has-validation">
                <CFormInput id="pastureName" v-model="pastureName" required />
                <CFormFeedback invalid> Please enter pasture. </CFormFeedback>
              </CInputGroup>
            </CCol>
            <CCol :md="6">
              <CFormLabel for="country">Country</CFormLabel>
              <CFormSelect id="country" v-model="country" required>
                <option disabled value="">Choose a country</option>
                <option>Rwanda</option>
                <option>DR Congo</option>
                <option>Uganda</option>
                <option>Burundi</option>
              </CFormSelect>
              <CFormFeedback invalid> Please select country. </CFormFeedback>
            </CCol>
            <CCol :xs="12">
              <CFormLabel for="exampleFormControlTextarea1">Description</CFormLabel>
              <CFormTextarea id="exampleFormControlTextarea1" rows="3"></CFormTextarea>
            </CCol>
            <CCol :xs="12">
              <CFormCheck v-model="isActive" type="checkbox" label=" Active" />
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
