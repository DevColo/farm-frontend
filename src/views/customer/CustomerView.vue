<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCustomerStore } from '@/stores/customer.store'
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
const customerStore = useCustomerStore()
const customer = ref({})

onMounted(async () => {
  const customerId = route.params.id
  await customerStore.fetchCustomerById(customerId)
  customer.value = customerStore.customer
})

function exportCustomerProfilePDF() {
  if (!customer.value) return

  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text('Cow Profile', 14, 22)

  doc.setFontSize(12)
  doc.text(`First Name: ${customer.value?.first_name || '—'}`, 14, 35)
  doc.text(`Last Name: ${customer.value?.last_name || '—'}`, 14, 45)
  doc.text(`Phone: ${customer.value.phone || '—'}`, 14, 55)
  doc.text(`Email: ${customer.value.email || '—'}`, 14, 65)
  doc.text(`Created By: ${customer.value.owner?.first_name || '—'}`, 14, 75)

  // Milk Sales history table
  if (customer.value.MilkSales && customer.value.MilkSales.length) {
    autoTable(doc, {
      didDrawPage: (data) => {
        doc.setFontSize(16)
        doc.setTextColor(40)
        doc.text('Milk Sales History', data.settings.margin.left, 85)
      },
      startY: 87,
      head: [['Date', 'Quantity', 'Unit Price (Rwf)', 'Total Cost (Rwf)']],
      body: customer.value.MilkSales.map((f) => [
        f.sales_date || '-',
        f.quantity,
        f.unit_price,
        Number(f.quantity) * Number(f.unit_price),
      ]),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 10 },
    })
  }

  // Cow Sales history table
  if (customer.value.CowSales && customer.value.CowSales.length) {
    autoTable(doc, {
      didDrawPage: (data) => {
        doc.setFontSize(16)
        doc.setTextColor(40)
        doc.text('Cow Sales History', data.settings.margin.left, 147)
      },
      startY: 150,
      head: [['Date', 'Cost (RWF)', 'Date']],
      body: customer.value.CowSales.map((m) => [m.sales_date, m.unit_price]),
      theme: 'grid',
      headStyles: { fillColor: [39, 174, 96] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 10 },
    })
  }

  doc.save(`Customer_Profile_${customer.value.first_name || customer.value.last_name}.pdf`)
}
</script>
<template>
  <CContainer class="mt-4">
    <!-- Breadcrumb + Download Button -->
    <div class="flex justify-between items-center mb-4">
      <nav class="text-gray-500 text-sm">
        <router-link to="/customers" class="text-blue-600 hover:underline">Customers</router-link>
        <span class="mx-2">/</span>
        <span class="text-gray-700 font-semibold">Customer Profile</span>
      </nav>
    </div>
    <CRow>
      <CCol md="4">
        <CCard>
          <CCardHeader><strong>Customer Profile</strong></CCardHeader>
          <CCardBody>
            <p><strong>First Name:</strong> {{ customer.first_name }}</p>
            <p><strong>Last Name:</strong> {{ customer.last_name }}</p>
            <p><strong>Phone:</strong> {{ customer.phone }}</p>
            <p><strong>Email:</strong> {{ customer.email }}</p>
            <p><strong>Created By:</strong> {{ customer.owner?.first_name }}</p>
            <CButton color="dark" @click="exportCustomerProfilePDF"
              ><CIcon icon="cil-cloud-download" /> Download</CButton
            >
          </CCardBody>
        </CCard>
      </CCol>

      <CCol md="8">
        <CCard>
          <CCardHeader><strong>Milk Purchase History</strong></CCardHeader>
          <CCardBody>
            <CTable striped hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Date</CTableHeaderCell>
                  <CTableHeaderCell>Quantity</CTableHeaderCell>
                  <CTableHeaderCell>Unit Price (Rwf)</CTableHeaderCell>
                  <CTableHeaderCell>Total Cost (Rwf)</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow v-for="milkSales in customer.MilkSales" :key="milkSales.id">
                  <CTableDataCell>{{ milkSales.sales_date }}</CTableDataCell>
                  <CTableDataCell>{{ milkSales.quantity }}</CTableDataCell>
                  <CTableDataCell>{{ milkSales.unit_price }}</CTableDataCell>
                  <CTableDataCell>{{
                    Number(milkSales.quantity) * Number(milkSales.unit_price)
                  }}</CTableDataCell>
                </CTableRow>
                <CTableRow v-if="!customer.MilkSales || customer.MilkSales.length === 0">
                  <CTableDataCell colspan="3" class="text-center"
                    >No milk sales records</CTableDataCell
                  >
                </CTableRow>
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>

        <CCard class="mt-4">
          <CCardHeader><strong>Cow Purchase History</strong></CCardHeader>
          <CCardBody>
            <CTable striped hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Date</CTableHeaderCell>
                  <CTableHeaderCell>Cow</CTableHeaderCell>
                  <CTableHeaderCell>Total Cost (Rwf)</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow v-for="cowSales in customer.CowSales" :key="cowSales.id">
                  <CTableDataCell>{{ cowSales.sales_date }}</CTableDataCell>
                  <CTableDataCell
                    ><router-link :to="`/cows/${cowSales.cow_id}`">
                      View Cow
                    </router-link></CTableDataCell
                  >
                  <CTableDataCell>{{ cowSales.unit_price }}</CTableDataCell>
                </CTableRow>
                <CTableRow v-if="!customer.CowSales || customer.CowSales.length === 0">
                  <CTableDataCell colspan="3" class="text-center"
                    >No cow sales records</CTableDataCell
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
