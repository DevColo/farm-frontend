<script setup>
import { ref } from 'vue'
const validatedCustom01 = ref(false)
const validatedDefault01 = ref(false)
const validatedTooltip01 = ref(false)

const handleSubmitCustom01 = (event) => {
  const form = event.currentTarget
  if (form.checkValidity() === false) {
    event.preventDefault()
    event.stopPropagation()
  }

  validatedCustom01.value = true
}

const handleSubmitDefault01 = (event) => {
  const form = event.currentTarget
  if (form.checkValidity() === false) {
    event.preventDefault()
    event.stopPropagation()
  }

  validatedDefault01.value = true
}

const handleSubmitTooltip01 = (event) => {
  const form = event.currentTarget
  if (form.checkValidity() === false) {
    event.preventDefault()
    event.stopPropagation()
  }

  validatedTooltip01.value = true
}
</script>

<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader> <strong>Validation</strong> <small>Custom styles</small> </CCardHeader>
        <CCardBody>
          <DocsExample href="forms/validation.html">
            <CForm
              class="row g-3 needs-validation"
              novalidate
              :validated="validatedCustom01"
              @submit="handleSubmitCustom01"
            >
            <CCol :md="12">
                <CFormLabel for="validationCustomUsername">Block Name</CFormLabel>
                <CInputGroup class="has-validation">
                  <CFormInput
                    id="validationCustomUsername"
                    value=""
                    aria-describedby="inputGroupPrepend"
                    required
                  />
                  <CFormFeedback invalid> Please choose a username. </CFormFeedback>
                </CInputGroup>
              </CCol>
              <CCol :md="12">
                <CFormLabel for="validationCustom04">Farm</CFormLabel>
                <CFormSelect id="validationCustom04">
                  <option disabled>Choose a farm</option>
                  <option>Farm 1</option>
                   <option>Farm 2</option>
                    <option>Farm 3</option>
                     <option>Farm 4</option>
                     <option>Farm 5</option>
                     <option>Farm 6</option>
                </CFormSelect>
                <CFormFeedback invalid> Please provide a valid city. </CFormFeedback>
              </CCol>
              <CCol :xs="12">
                <CFormCheck
                  id="invalidCheck"
                  type="checkbox"
                  label="Active block"
                  required
                />
                <CFormFeedback invalid> You must agree before submitting. </CFormFeedback>
              </CCol>
              <CCol :xs="12">
                <CButton color="primary" type="submit">Submit</CButton>
              </CCol>
            </CForm>
          </DocsExample>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

