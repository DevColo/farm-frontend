<script setup>
import { ref } from 'vue'
import { usePastureStore } from '@/stores/pasture.store'

const pastureStore = usePastureStore()

const validated = ref(false)
const pastureName = ref('')
const country = ref('')
const description = ref('')
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
    description: description.value,
    status: isActive.value ? '1' : '0',
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
              <CFormSelect
                id="country"
                v-model="country"
                required
                :options="[
                  { label: 'Choose a country', value: '', disabled: true },
                  { label: 'Rwanda', value: 'Rwanda' },
                  { label: 'Uganda', value: 'Uganda' },
                  { label: 'Burundi', value: 'Burundi' },
                  { label: 'DR Congo', value: 'DR Congo' },
                ]"
              >
              </CFormSelect>
              <CFormFeedback invalid> Please select country. </CFormFeedback>
            </CCol>
            <CCol :xs="12">
              <CFormLabel for="exampleFormControlTextarea1">Description</CFormLabel>
              <CFormTextarea
                id="exampleFormControlTextarea1"
                rows="3"
                v-model="description"
              ></CFormTextarea>
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
