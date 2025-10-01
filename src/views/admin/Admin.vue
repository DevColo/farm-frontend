<script setup>
import { ref, computed } from 'vue'
import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CBreadcrumb,
  CBreadcrumbItem,
  CButton,
  CInputGroup,
  CFormInput,
} from '@coreui/vue'
import { 
  cilUser, 
  cilShieldAlt, 
  cilLockLocked, 
  cilGlobeAlt, 
  cilPeople,
  cilSearch,
  cilSettings
} from '@coreui/icons'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')

// Administration modules
const adminModules = ref([
  {
    id: 1,
    title: 'Users',
    description: 'Manage system users and their profiles',
    icon: cilUser,
    route: '/users',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    id: 2,
    title: 'Roles',
    description: 'Define and manage user roles',
    icon: cilShieldAlt,
    route: '/roles',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  {
    id: 3,
    title: 'Permissions',
    description: 'Control access and permissions',
    icon: cilLockLocked,
    route: '/permissions',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  {
    id: 4,
    title: 'Countries',
    description: 'Manage countries and regions',
    icon: cilGlobeAlt,
    route: '/countries',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  },
  {
    id: 5,
    title: 'Customers',
    description: 'Manage customer information',
    icon: cilPeople,
    route: '/customers',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  }
])

// Filtered modules based on search
const filteredModules = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return adminModules.value
  
  return adminModules.value.filter(module => 
    module.title.toLowerCase().includes(query) || 
    module.description.toLowerCase().includes(query)
  )
})

// Navigate to module
const navigateToModule = (route) => {
  router.push(route)
}
</script>

<template>
  <div class="administration-container">
    <!-- Breadcrumb -->
    <CBreadcrumb class="mb-4">
      <CBreadcrumbItem>
        <router-link to="/dashboard" class="text-decoration-none">Dashboard</router-link>
      </CBreadcrumbItem>
      <CBreadcrumbItem active>Administration</CBreadcrumbItem>
    </CBreadcrumb>

    <!-- Administration Modules Grid -->
    <CRow class="mb-4">
      <CCol :xs="12">
        <h5 class="section-title mb-3">Administration Modules</h5>
      </CCol>
      <CCol 
        v-for="module in filteredModules" 
        :key="module.id" 
        :xl="4"
        :lg="6" 
        :md="6" 
        :sm="12"
        class="mb-4"
      >
        <CCard 
          class="module-card h-100 border-0 shadow-sm"
          @click="navigateToModule(module.route)"
        >
          <CCardBody class="d-flex flex-column">
            <!-- Card Header with Icon -->
            <div class="module-header">
               <div class="module-content flex-grow-1">
              <h4 class="module-title mb-2">{{ module.title }}</h4>
              <p class="module-description text-muted">{{ module.description }}</p>
            </div>
              <div 
                class="module-icon-wrapper"
                :style="{ background: module.gradient }"
              >
                <CIcon :icon="module.icon" size="2xl" class="text-white" />
              </div>
            </div>

            <!-- Card Footer with Stats -->
            <div class="module-footer">
              <div class="module-action">
                <CButton 
                  variant="ghost"
                  size="sm"
                  class="action-button"
                >
                  Manage
                  <i class="fas fa-arrow-right ms-2"></i>
                </CButton>
              </div>
            </div>
          </CCardBody>
          
          <!-- Hover Effect Overlay -->
          <div class="hover-overlay"></div>
        </CCard>
      </CCol>

      <!-- No Results -->
      <CCol v-if="filteredModules.length === 0" :xs="12">
        <CCard class="border-0 shadow-sm">
          <CCardBody class="text-center py-5">
            <CIcon :icon="cilSearch" size="3xl" class="text-muted mb-3" />
            <h4 class="text-muted">No modules found</h4>
            <p class="text-muted">Try adjusting your search query</p>
            <CButton color="primary" @click="searchQuery = ''">
              Clear Search
            </CButton>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Additional Info Section -->
    <CRow>
      <CCol :xs="12">
        <CCard class="info-card border-0 shadow-sm">
          <CCardHeader class="bg-light border-bottom">
            <h5 class="mb-0">
              <i class="fas fa-info-circle me-2"></i>
              Administration Guidelines
            </h5>
          </CCardHeader>
          <CCardBody>
            <CRow>
              <CCol :md="4" class="mb-3">
                <div class="guideline-item">
                  <div class="guideline-content">
                    <h6>Security First</h6>
                    <p class="text-muted small mb-0">Always follow security best practices when managing users and permissions.</p>
                  </div>
                </div>
              </CCol>
              <CCol :md="4" class="mb-3">
                <div class="guideline-item">
                  <div class="guideline-content">
                    <h6>Role-Based Access</h6>
                    <p class="text-muted small mb-0">Assign appropriate roles to ensure users have the right level of access.</p>
                  </div>
                </div>
              </CCol>
              <CCol :md="4" class="mb-3">
                <div class="guideline-item">
                  <div class="guideline-content">
                    <h6>Audit Trail</h6>
                    <p class="text-muted small mb-0">All administrative actions are logged for security and compliance.</p>
                  </div>
                </div>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </div>
</template>

<style scoped>
/* Container */
.administration-container {
  padding: 0;
}

/* Page Header */
.page-header {
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
}

.page-subtitle {
  font-size: 1rem;
  color: #6c757d;
  margin-bottom: 0;
}

/* Quick Stats Cards */
.stats-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
}

.stats-icon-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stats-content {
  flex: 1;
}

.stats-number {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2c3e50;
}

.stats-label {
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 500;
}

/* Search Card */
.search-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.search-input {
  font-size: 1rem;
  padding: 0.75rem 1rem;
}

.search-input:focus {
  box-shadow: none;
  border-color: #dee2e6;
}

.search-card .input-group-text {
  padding: 0.75rem 1rem;
}

/* Section Title */
.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  border-left: 4px solid #667eea;
  padding-left: 1rem;
}

/* Module Cards */
.module-card {
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.module-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15) !important;
}

.module-card:hover .hover-overlay {
  opacity: 1;
}

.module-card:hover .action-button {
  transform: translateX(5px);
}

.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.module-icon-wrapper {
  width: 50px;
  height: 50px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.module-content {
  padding: 0.5rem 0;
}

.module-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.module-description {
  font-size: 0.875rem;
  line-height: 1.5;
  color: #6c757d;
}

.module-footer {
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.module-stats {
  display: flex;
  align-items: baseline;
}

.stats-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
}

.stats-label {
  font-size: 0.75rem;
}

.action-button {
  font-weight: 600;
  transition: transform 0.3s ease;
}

/* Info Card */
.info-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

.guideline-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.guideline-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.guideline-content h6 {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }

  .stats-icon-wrapper {
    width: 50px;
    height: 50px;
  }

  .stats-number {
    font-size: 1.5rem;
  }

  .module-icon-wrapper {
    width: 60px;
    height: 60px;
  }

  .module-title {
    font-size: 1.1rem;
  }

  .stats-value {
    font-size: 1.25rem;
  }
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.module-card {
  animation: fadeInUp 0.5s ease forwards;
}

.module-card:nth-child(1) { animation-delay: 0.1s; }
.module-card:nth-child(2) { animation-delay: 0.2s; }
.module-card:nth-child(3) { animation-delay: 0.3s; }
.module-card:nth-child(4) { animation-delay: 0.4s; }
.module-card:nth-child(5) { animation-delay: 0.5s; }
</style>