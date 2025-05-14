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
        <CCardHeader> <strong>Add</strong> <small>a block</small> </CCardHeader>
        <CCardBody>
          <DocsExample href="forms/validation.html">
            <CForm
              class="row g-3 needs-validation"
              novalidate
              :validated="validatedCustom01"
              @submit="handleSubmitCustom01"
            >
             <CCol :md="12">
                <CFormLabel for="validationCustom04"><strong>Cow</strong></CFormLabel>
                <CFormSelect id="validationCustom04">
                  <option disabled>Choose a farm</option>
                  <option>Cow 1</option>
                   <option>Cow 2</option>
                    <option>Cow 3</option>
                     <option>Cow 4</option>
                     <option>Cow 5</option>
                     <option>Cow 6</option>
                </CFormSelect>
                <CFormFeedback invalid> Please provide a valid city. </CFormFeedback>
              </CCol>
              <CCol :md="12">
               <CFormLabel for="date"><strong>Date</strong></CFormLabel>
               <CInputGroup class="has-validation">
                 <CFormInput
                  id="birthDate"
                   type="date"
                   required
                      />
                <CFormFeedback invalid> Please select date. </CFormFeedback>
                </CInputGroup>
                </CCol>
            <CCol :md="12">
            <CFormLabel for="validationCustomNumber"><strong>Morning quantity</strong></CFormLabel>
            <CInputGroup class="has-validation">
            <CFormInput
               id="validationCustomNumber"
               type="number"
               value=""
               aria-describedby="inputGroupPrepend"
               required
               />
            <CFormFeedback invalid> Please enter a morning quantity. </CFormFeedback>
            </CInputGroup>
            </CCol>

             <CCol :md="12">
            <CFormLabel for="validationCustomNumber"><strong>Evening quantity</strong></CFormLabel>
            <CInputGroup class="has-validation">
            <CFormInput
               id="validationCustomNumber"
               type="number"
               value=""
               aria-describedby="inputGroupPrepend"
               required
               />
            <CFormFeedback invalid> Please enter a evening quantity. </CFormFeedback>
            </CInputGroup>
            </CCol>
            
             <CCol :md="12">
            <CFormLabel for="validationCustomNumber"><strong>Total quantity</strong></CFormLabel>
            <CInputGroup class="has-validation">
            <CFormInput
               id="validationCustomNumber"
               type="number"
               value=""
               aria-describedby="inputGroupPrepend"
               required
               />
            <CFormFeedback invalid> Please enter total quantity. </CFormFeedback>
            </CInputGroup>
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
<script>
export default {
  data() {
    return {
      morningQuantity: 0,
      eveningQuantity: 0,
    };
  },
  computed: {
    totalQuantity() {
      return this.morningQuantity + this.eveningQuantity;
    },
  },
};
</script>

