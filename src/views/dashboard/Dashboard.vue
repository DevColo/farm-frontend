<script setup>
import avatar1 from '@/assets/images/avatars/1.jpg'
import MainChart from './MainChart.vue'
import DashboardStats from '../../components/DashboardStats.vue'

const tableExample = [
  {
    avatar: { src: avatar1, status: 'success' },
    user: {
      name: 'Yiorgos Avraamu',
      new: true,
      registered: 'Jan 1, 2023',
    },
    country: { name: 'USA', flag: 'cif-us' },
    usage: {
      value: 50,
      period: 'Jun 11, 2023 - Jul 10, 2023',
      color: 'success',
    },
    payment: { name: 'Mastercard', icon: 'cib-cc-mastercard' },
    activity: '10 sec ago',
  },
]
</script>

<template>
  <div>
    <DashboardStats class="mb-4" />
    <!-- <CRow>
      <CCol :md="12">
        <CCard class="mb-4">
          <CCardHeader> Traffic &amp; Sales </CCardHeader>
          <CCardBody>
            <CTable align="middle" class="mb-0 border" hover responsive>
              <CTableHead class="text-nowrap">
                <CTableRow>
                  <CTableHeaderCell class="bg-body-secondary text-center">
                    <CIcon name="cil-people" />
                  </CTableHeaderCell>
                  <CTableHeaderCell class="bg-body-secondary"> User </CTableHeaderCell>
                  <CTableHeaderCell class="bg-body-secondary text-center">
                    Country
                  </CTableHeaderCell>
                  <CTableHeaderCell class="bg-body-secondary"> Usage </CTableHeaderCell>
                  <CTableHeaderCell class="bg-body-secondary text-center">
                    Payment Method
                  </CTableHeaderCell>
                  <CTableHeaderCell class="bg-body-secondary"> Activity </CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow v-for="item in tableExample" :key="item.name">
                  <CTableDataCell class="text-center">
                    <CAvatar size="md" :src="item.avatar.src" :status="item.avatar.status" />
                  </CTableDataCell>
                  <CTableDataCell>
                    <div>{{ item.user.name }}</div>
                    <div class="small text-body-secondary text-nowrap">
                      <span>{{ item.user.new ? 'New' : 'Recurring' }}</span> |
                      {{ item.user.registered }}
                    </div>
                  </CTableDataCell>
                  <CTableDataCell class="text-center">
                    <CIcon size="xl" :name="item.country.flag" :title="item.country.name" />
                  </CTableDataCell>
                  <CTableDataCell>
                    <div class="d-flex justify-content-between align-items-baseline">
                      <div class="fw-semibold">{{ item.usage.value }}%</div>
                      <div class="text-nowrap text-body-secondary small ms-3">
                        {{ item.usage.period }}
                      </div>
                    </div>
                    <CProgress thin :color="item.usage.color" :value="item.usage.value" />
                  </CTableDataCell>
                  <CTableDataCell class="text-center">
                    <CIcon size="xl" :name="item.payment.icon" />
                  </CTableDataCell>
                  <CTableDataCell>
                    <div class="small text-body-secondary">Last login</div>
                    <div class="fw-semibold text-nowrap">
                      {{ item.activity }}
                    </div>
                  </CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow> -->
  </div>
</template>
