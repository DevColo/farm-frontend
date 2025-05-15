<template>
  <div>
    <h4 class="mb-4">Add Daily Record</h4>

    <CForm @submit.prevent="handleSubmit">
      <div class="d-flex flex-wrap gap-4">
        <!-- Left Column: Milk Collection Info -->
        <CCard class="flex-grow-1" style="min-width: 300px;">
          <CCardHeader>Milk Collection Info</CCardHeader>
          <CCardBody>
             <CCol :md="12">
                <CFormLabel for="validationCustom04"><strong>Cow</strong></CFormLabel>
                <CFormSelect id="validationCustom04">
                  <option disabled>Choose a cow</option>
                  <option>cow 1</option>
                   <option>cow 2</option>
                    <option>cow 3</option>
                     <option>cow 4</option>
                     <option>cow 5</option>
                     <option>cow 6</option>
                </CFormSelect>
              </CCol>

            <CFormLabel for="date"><strong>Date</strong></CFormLabel>
            <CFormInput id="date" type="date" v-model="form.date" required class="mb-3" />

            <CFormLabel for="morning"><strong>Morning Quantity (L)</strong></CFormLabel>
            <CFormInput id="morning" type="number" v-model.number="form.morningQuantity" min="0" step="0.1" class="mb-3" />

            <CFormLabel for="evening"><strong>Evening Quantity (L)</strong></CFormLabel>
            <CFormInput id="evening" type="number" v-model.number="form.eveningQuantity" min="0" step="0.1" class="mb-3" />

            <CFormLabel><strong>Total Quantity (L)</strong></CFormLabel>
            <CFormInput :value="totalQuantity.toFixed(2)" readonly class="mb-3" />
          </CCardBody>
        </CCard>

        <!-- Right Column: Usage Info -->
        <CCard class="flex-grow-1" style="min-width: 300px;">
          <CCardHeader>Usage Info</CCardHeader>
          <CCardBody>
            <CFormLabel for="usageType"><strong>Usage Type</strong></CFormLabel>
            <CFormSelect id="usageType" v-model="form.usageType" class="mb-3">
              <option value="">Select</option>
              <option value="Kept">Kept</option>
              <option value="Sold">Sold</option>
              <option value="Both">Both</option>
            </CFormSelect>

            <div v-if="form.usageType === 'Sold' || form.usageType === 'Both'">
              <CFormLabel for="soldQty">Sold Quantity (L)</CFormLabel>
              <CFormInput id="soldQty" type="number" v-model.number="form.soldQuantity" min="0" step="0.1" class="mb-3" />

              <CFormLabel for="price">Price per Liter ($)</CFormLabel>
              <CFormInput id="price" type="number" v-model.number="form.pricePerLitre" min="0" step="0.01" class="mb-3" />

              <CFormLabel>Revenue ($)</CFormLabel>
              <CFormInput :value="revenue.toFixed(2)" readonly class="mb-3" />
            </div>

            <CFormLabel for="remarks"><strong>Remarks</strong>
            </CFormLabel>
            <CFormTextarea id="remarks" v-model="form.remarks" rows="3" class="mb-3" />
          </CCardBody>
        </CCard>
      </div>

      <!-- Submit Button -->
      <div class="mt-4">
        <CButton color="primary" type="submit">Submit</CButton>
      </div>
    </CForm>
  </div>
</template>

<script setup>
import {
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CButton,
  CCard,
  CCardHeader,
  CCardBody,
} from '@coreui/vue'

import { ref, computed } from 'vue'

const form = ref({
  cow: '',
  date: '',
  morningQuantity: 0,
  eveningQuantity: 0,
  usageType: '',
  soldQuantity: 0,
  pricePerLitre: 0,
  remarks: '',
})

const totalQuantity = computed(() =>
  parseFloat(form.value.morningQuantity || 0) + parseFloat(form.value.eveningQuantity || 0)
)

const revenue = computed(() =>
  (form.value.soldQuantity || 0) * (form.value.pricePerLitre || 0)
)

const handleSubmit = () => {
  const newRecord = {
    ...form.value,
    totalQuantity: totalQuantity.value,
    revenue: revenue.value,
  }

  console.log('Submitting:', newRecord)

  form.value = {
    cow: '',
    date: '',
    morningQuantity: 0,
    eveningQuantity: 0,
    usageType: '',
    soldQuantity: 0,
    pricePerLitre: 0,
    remarks: '',
  }

  alert('Daily record submitted successfully!')
}
</script>
