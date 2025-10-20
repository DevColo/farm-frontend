<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user.store'
import avatar from '@/assets/images/avatars/8.jpg'
import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CBadge,
  CButton,
  CAvatar,
  CSpinner,
  CAlert,
} from '@coreui/vue'
import CIcon from '@coreui/icons-vue'

const route = useRoute()
const userStore = useUserStore()

// reactive state
const user = ref({
  first_name: '',
  other_name: '',
  last_name: '',
  email: '',
  phone: '',
  address: '',
  photo: '',
  roles: [],
  country: '',
  created_at: null,
})
const imageUrl = ref('')
const loading = ref(false)
const error = ref('')

// Fetch user by ID on mount — support either store method name
async function loadUser() {
  const userId = route.params.id
  if (!userId) {
    error.value = 'No user id provided in route.'
    return
  }

  loading.value = true
  error.value = ''
  try {
    // support both possible store action names
    if (typeof userStore.fetchUserById === 'function') {
      await userStore.fetchUserById(userId)
    } else if (typeof userStore.getUserById === 'function') {
      await userStore.getUserById(userId)
    } else {
      throw new Error('No user fetch method found in user store (fetchUserById or getUserById).')
    }

    // assign safely — normalize shape so template doesn't break
    const fetched = userStore.user || userStore.users || {}
    user.value = {
      first_name: fetched.first_name || fetched.firstName || '',
      other_name: fetched.other_name || fetched.otherName || '',
      last_name: fetched.last_name || fetched.lastName || '',
      email: fetched.email || '',
      phone: fetched.phone || '',
      address: fetched.address || '',
      photo: fetched.photo || fetched.image || '',
      roles: Array.isArray(fetched.roles) ? fetched.roles : (fetched.roles ? [fetched.roles] : []),
      country: fetched.country || '',
      created_at: fetched.created_at || fetched.createdAt || null,
      id: fetched.id || null,
    }

    // build image url safely
    if (user.value.photo) {
      imageUrl.value = user.value.photo.startsWith('http')
        ? user.value.photo
        : `${import.meta.env.VITE_API_BASE_URL}/${user.value.photo.replace(/\\/g, '/')}`
    } else {
      imageUrl.value = '' // fallback handled in template
    }
  } catch (err) {
    console.error('Failed to load user:', err)
    error.value = err.response?.data?.message || err.message || 'Failed to fetch user data'
  } finally {
    loading.value = false
  }
}

onMounted(loadUser)

// helper: return image or local avatar
function getUserImage(photoPath) {
  if (!photoPath) return avatar
  // if already absolute url
  if (photoPath.startsWith('http')) return photoPath
  return `${import.meta.env.VITE_API_BASE_URL}/${photoPath.replace(/\\/g, '/')}`
}

function formatDate(dateString) {
  if (!dateString) return '—'
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}

// profile edit button handler (placeholder)
function onEditProfile() {
  // If you have an edit modal or route, call it here.
  // Example: open modal or navigate to edit route
  // showModal.value = true
  // or router.push({ name: 'EditUser', params: { id: user.value.id } })
  console.log('Edit profile clicked for user id:', user.value.id)
}
</script>

<template>
  <div class="profile-container">
    <CRow class="mb-4">
      <CCol xs="12">
        <CCard class="profile-header-card shadow-sm border-0">
          <CCardHeader class="bg-gradient-primary text-white rounded-top d-flex align-items-center justify-content-between">
            <h5 class="mb-0">User Profile</h5>
            <CBadge color="light">{{ user.roles?.[0] || 'User' }}</CBadge>
          </CCardHeader>

          <CCardBody class="p-4">
            <!-- Loading / Error -->
            <div v-if="loading" class="text-center py-4">
              <CSpinner />
            </div>

            <div v-else>
              <CAlert color="danger" v-if="error" dismissible>
                {{ error }}
              </CAlert>

              <!-- Profile top -->
              <div class="profile-top d-flex flex-column align-items-center text-center">
                <div class="avatar-wrapper mb-3">
                  <img
                    :src="imageUrl || getUserImage(user.photo)"
                    alt="User avatar"
                    class="rounded-circle shadow-sm"
                    style="width:120px; height:120px; object-fit:cover;"
                  />
                </div>

                <!-- Edit button moved under the image -->
                <div class="mt-2">
                  <CButton color="primary" variant="outline" size="sm" @click="onEditProfile">
                    <CIcon name="cilPencil" class="me-2" /> Edit Profile
                  </CButton>
                </div>

                <h2 class="mt-3 mb-0 fw-bold">
                  {{ user.first_name }} {{ user.other_name ? user.other_name : '' }} {{ user.last_name ? user.last_name : '' }}
                </h2>
                <small class="text-muted">{{ user.email }}</small>

                <div class="mt-2">
                  <span v-for="role in user.roles" :key="role" class="me-1">
                    <CBadge color="primary">{{ role }}</CBadge>
                  </span>
                </div>
              </div>

              <!-- Content row -->
              <CRow class="mt-4">
                <!-- Left column: personal info -->
                <CCol lg="8" md="12">
                  <CCard class="profile-details-card mb-3">
                    <CCardHeader class="profile-card-header">
                      <h5 class="mb-0"><CIcon name="cilUser" class="me-2" /> Personal Information</h5>
                    </CCardHeader>
                    <CCardBody>
                      <CRow>
                        <CCol md="6" class="mb-3">
                          <label class="info-label">First Name</label>
                          <p class="info-value">{{ user.first_name || '—' }}</p>
                        </CCol>
                        <CCol md="6" class="mb-3">
                          <label class="info-label">Other Name</label>
                          <p class="info-value">{{ user.other_name || '—' }}</p>
                        </CCol>
                        <CCol md="6" class="mb-3">
                          <label class="info-label">Last Name</label>
                          <p class="info-value">{{ user.last_name || '—' }}</p>
                        </CCol>
                        <CCol md="6" class="mb-3">
                          <label class="info-label">Phone Number</label>
                          <p class="info-value">{{ user.phone || '—' }}</p>
                        </CCol>
                        <CCol md="12" class="mb-3">
                          <label class="info-label">Email</label>
                          <p class="info-value">{{ user.email || '—' }}</p>
                        </CCol>
                        <CCol md="12" class="mb-3">
                          <label class="info-label">Address</label>
                          <p class="info-value">{{ user.address || '—' }}</p>
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                </CCol>

                <!-- Right column: quick actions + stats -->
                <CCol lg="4" md="12">
                  <CCard class="quick-actions-card mb-3">
                    <CCardHeader class="profile-card-header">
                      <h5 class="mb-0"><CIcon name="cilSettings" class="me-2" /> Quick Actions</h5>
                    </CCardHeader>
                    <CCardBody>
                      <CButton color="light" variant="ghost" class="w-100 mb-2 text-start" @click="onEditProfile">
                        <CIcon name="cilPencil" class="me-2" /> Edit Profile
                      </CButton>
                      <CButton color="light" variant="ghost" class="w-100 mb-2 text-start">
                        <CIcon name="cilLockLocked" class="me-2" /> Change Password
                      </CButton>
                      <CButton color="light" variant="ghost" class="w-100 mb-2 text-start">
                        <CIcon name="cilBell" class="me-2" /> Notification Settings
                      </CButton>
                      <CButton color="light" variant="ghost" class="w-100 text-start">
                        <CIcon name="cilShieldAlt" class="me-2" /> Privacy Settings
                      </CButton>
                    </CCardBody>
                  </CCard>

                  <CCard class="stats-card">
                    <CCardHeader class="profile-card-header">
                      <h5 class="mb-0"><CIcon name="cilChart" class="me-2" /> Account Stats</h5>
                    </CCardHeader>
                    <CCardBody>
                      <div class="stat-item d-flex align-items-center mb-3">
                        <CIcon name="cilCalendar" class="me-3" />
                        <div>
                          <p class="stat-label mb-0">Member Since</p>
                          <p class="stat-value mb-0">{{ formatDate(user.created_at) }}</p>
                        </div>
                      </div>
                      <div class="stat-item d-flex align-items-center mb-3">
                        <CIcon name="cilCheck" class="me-3" />
                        <div>
                          <p class="stat-label mb-0">Profile Completion</p>
                          <p class="stat-value mb-0">{{ Math.floor(([
                            user.first_name, user.last_name, user.email, user.phone, user.address, user.photo
                          ].filter(Boolean).length / 6) * 100) }}%</p>
                        </div>
                      </div>
                      <div class="stat-item d-flex align-items-center">
                        <CIcon name="cilShieldAlt" class="me-3" />
                        <div>
                          <p class="stat-label mb-0">Security Score</p>
                          <p class="stat-value mb-0">Good</p>
                        </div>
                      </div>
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </div>
</template>

<style scoped>
.profile-header-card {
  border-radius: 8px;
}
.avatar-wrapper img {
  border: 3px solid #fff;
}
.profile-top .profile-badges {
  margin-top: 6px;
}
.info-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 4px;
}
.info-value {
  margin: 0;
  color: #495057;
}
</style>
