<script setup>
import { onMounted, ref } from 'vue'
import avatar from '@/assets/images/avatars/8.jpg'
import { useUserStore } from '@/stores/user.store.js';

const userStore = useUserStore()
const validated = ref(false)

onMounted(() => {
  userStore.getCurrentUser();
})
console.log('User Data:', userStore.user)
// Edit Profile Modal
const activeTab = ref('profile')
const showModal = ref(false)
const userData = ref({})

function editProfileModal(user) {
  userData.value = { ...user, password: '' }
  showModal.value = true
}

async function handleSubmit(e) {
  const form = e.currentTarget
  if (!form.checkValidity()) {
    e.preventDefault()
    e.stopPropagation()
    validated.value = true
    return
  }
  e.preventDefault()
  const payload = {
    first_name: userData.value.first_name,
    other_name: userData.value.other_name,
    last_name: userData.value.last_name,
    phone: userData.value.phone,
    email: userData.value.email,
    address: userData.value.address,
    photo: userData.value.photo,
    ...(userData.value.password ? { password: userData.value.password } : {}),
  }

  await userStore.updateCurrentUser(payload)
  showModal.value = false
}

// Remove Photo
const removePhoto = () => {
  userData.value.photo = null
}

// Get User Image
function getUserImage(imageUrl) {
  return imageUrl ? `${import.meta.env.VITE_API_BASE_URL}/${imageUrl}` : avatar
}

// Get user initials for fallback
function getUserInitials(user) {
  const first = user?.first_name?.charAt(0) || ''
  const last = user?.last_name?.charAt(0) || ''
  return (first + last).toUpperCase()
}
</script>

<template>
  <div class="profile-container">
    <!-- Profile Header Section -->
    <CRow class="mb-4">
      <CCol :xs="12">
        <div class="profile-header-card">
          <div class="profile-banner"></div>
          <div class="profile-content">
            <div class="profile-avatar-section">
              <div class="avatar-wrapper">
                <CAvatar 
                  :src="getUserImage(userStore.user?.photo)" 
                  size="xl"
                  class="profile-avatar"
                />
              </div>
              <div class="profile-info">
                <h2 class="profile-name">
                  {{ userStore.user?.first_name }} {{ userStore.user?.other_name }} {{ userStore.user?.last_name }}
                </h2>
                <p class="profile-email">{{ userStore.user?.email }}</p>
                <div class="profile-badges">
                  <CBadge v-for="role in userStore.user?.roles || []" 
                        :key="role" 
                        color="primary" 
                        class="me-1">
                  {{ role }}
                </CBadge>
                </div>
              </div>
            </div>
            <div class="profile-actions">
              <CButton 
                color="primary" 
                variant="outline"
                @click="editProfileModal(userStore.user)"
                class="edit-profile-btn"
              >
                <CIcon name="cilPencil" class="me-2" />
                Edit Profile
              </CButton>
            </div>
          </div>
        </div>
      </CCol>
    </CRow>

    <!-- Profile Details Section -->
    <CRow>
      <CCol :lg="8" :md="12">
        <CCard class="profile-details-card">
          <CCardHeader class="profile-card-header">
            <h5 class="mb-0">
              <CIcon name="cilUser" class="me-2" />
              Personal Information
            </h5>
          </CCardHeader>
          <CCardBody>
            <CRow>
              <CCol :md="6" class="mb-3">
                <div class="info-item">
                  <label class="info-label">First Name</label>
                  <p class="info-value">{{ userStore.user?.first_name || '' }}</p>
                </div>
              </CCol>
              <CCol :md="6" class="mb-3">
                <div class="info-item">
                  <label class="info-label">Other Name</label>
                  <p class="info-value">{{ userStore.user?.other_name || '' }}</p>
                </div>
              </CCol>
              <CCol :md="6" class="mb-3">
                <div class="info-item">
                  <label class="info-label">Last Name</label>
                  <p class="info-value">{{ userStore.user?.last_name || '' }}</p>
                </div>
              </CCol>
              <CCol :md="6" class="mb-3">
                <div class="info-item">
                  <label class="info-label">Phone Number</label>
                  <p class="info-value">{{ userStore.user?.phone || '' }}</p>
                </div>
              </CCol>
              <CCol :md="12" class="mb-3">
                <div class="info-item">
                  <label class="info-label">Email Address</label>
                  <p class="info-value">{{ userStore.user?.email || '' }}</p>
                </div>
              </CCol>
              <CCol :md="12" class="mb-3">
                <div class="info-item">
                  <label class="info-label">Address</label>
                  <p class="info-value">{{ userStore.user?.address || '' }}</p>
                </div>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>

      <!-- Quick Actions Sidebar -->
      <CCol :lg="4" :md="12">
        <CCard class="quick-actions-card">
          <CCardHeader class="profile-card-header">
            <h5 class="mb-0">
              <CIcon name="cilSettings" class="me-2" />
              Quick Actions
            </h5>
          </CCardHeader>
          <CCardBody>
            <div class="action-item">
              <CButton 
                color="light" 
                variant="ghost" 
                class="w-100 text-start action-btn"
                @click="editProfileModal(userStore.user)"
              >
                <CIcon name="cilPencil" class="me-3" />
                Edit Profile
              </CButton>
            </div>
            <div class="action-item">
              <CButton 
                color="light" 
                variant="ghost" 
                class="w-100 text-start action-btn"
              >
                <CIcon name="cilLockLocked" class="me-3" />
                Change Password
              </CButton>
            </div>
            <div class="action-item">
              <CButton 
                color="light" 
                variant="ghost" 
                class="w-100 text-start action-btn"
              >
                <CIcon name="cilBell" class="me-3" />
                Notification Settings
              </CButton>
            </div>
            <div class="action-item">
              <CButton 
                color="light" 
                variant="ghost" 
                class="w-100 text-start action-btn"
              >
                <CIcon name="cilShieldAlt" class="me-3" />
                Privacy Settings
              </CButton>
            </div>
          </CCardBody>
        </CCard>

        <!-- Profile Statistics -->
        <CCard class="stats-card mt-3">
          <CCardHeader class="profile-card-header">
            <h5 class="mb-0">
              <CIcon name="cilChart" class="me-2" />
              Account Stats
            </h5>
          </CCardHeader>
          <CCardBody>
            <div class="stat-item">
              <div class="stat-icon">
                <CIcon name="cilCalendar" />
              </div>
              <div class="stat-content">
                <p class="stat-label">Member Since</p>
                <p class="stat-value">{{ new Date(userStore.user?.created_at).toLocaleDateString() || '' }}</p>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">
                <CIcon name="cilCheck" />
              </div>
              <div class="stat-content">
                <p class="stat-label">Profile Completion</p>
                <p class="stat-value">85%</p>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">
                <CIcon name="cilShieldAlt" />
              </div>
              <div class="stat-content">
                <p class="stat-label">Security Score</p>
                <p class="stat-value">Good</p>
              </div>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </div>

  <!-- Enhanced Edit Profile Modal -->
  <CModal :visible="showModal" @close="showModal = false" backdrop="static" size="lg" class="profile-modal">
    <CModalHeader class="modal-header-custom">
      <CModalTitle class="modal-title-custom">
        <CIcon name="cilPencil" class="me-2" />
        Edit Profile
      </CModalTitle>
    </CModalHeader>
    <CModalBody class="modal-body-custom">
      <CForm
        class="row g-3 needs-validation profile-form"
        enctype="multipart/form-data"
        novalidate
        :validated="validated"
        @submit="handleSubmit"
      >
        <!-- Photo Upload Section -->
        <CCol :xs="12" class="mb-4">
          <div class="photo-upload-section">
            <div class="current-photo">
              <img
                v-if="userData.photo && typeof userData.photo === 'string'"
                :src="getUserImage(userData?.photo)"
                class="preview-image"
                alt="Current Photo"
              />
              <div v-else class="no-photo-placeholder">
                <CIcon name="cilUser"/>
              </div>
            </div>
            <div class="photo-controls">
              <CFormLabel for="photo" class="form-label-custom">Profile Photo</CFormLabel>
              <CFormInput
                type="file"
                id="photo"
                @change="(e) => (userData.photo = e.target.files[0])"
                accept="image/*"
                class="file-input-custom"
              />
              <CButton 
                v-if="userData.photo" 
                color="danger" 
                variant="outline"
                size="sm" 
                @click="removePhoto"
                class="mt-2"
              >
                <CIcon name="cilTrash" class="me-1" />
                Remove Photo
              </CButton>
            </div>
          </div>
        </CCol>

        <!-- Form Fields -->
        <CCol :md="6">
          <CFormLabel for="first_name" class="form-label-custom">First Name</CFormLabel>
          <CFormInput 
            id="first_name" 
            v-model="userData.first_name" 
            required 
            class="form-input-custom"
            placeholder="Enter your first name"
          />
          <CFormFeedback invalid>First Name is required.</CFormFeedback>
        </CCol>

        <CCol :md="6">
          <CFormLabel for="other_name" class="form-label-custom">Other Name</CFormLabel>
          <CFormInput 
            id="other_name" 
            v-model="userData.other_name" 
            class="form-input-custom"
            placeholder="Enter your other name (optional)"
          />
        </CCol>

        <CCol :md="6">
          <CFormLabel for="last_name" class="form-label-custom">Last Name</CFormLabel>
          <CFormInput 
            id="last_name" 
            v-model="userData.last_name" 
            required 
            class="form-input-custom"
            placeholder="Enter your last name"
          />
          <CFormFeedback invalid>Last Name is required.</CFormFeedback>
        </CCol>

        <CCol :md="6">
          <CFormLabel for="phone" class="form-label-custom">Phone Number</CFormLabel>
          <CFormInput 
            id="phone" 
            v-model="userData.phone" 
            required 
            class="form-input-custom"
            placeholder="Enter your phone number"
          />
          <CFormFeedback invalid>Phone is required.</CFormFeedback>
        </CCol>

        <CCol :md="12">
          <CFormLabel for="email" class="form-label-custom">Email Address</CFormLabel>
          <CFormInput 
            id="email" 
            v-model="userData.email" 
            type="email"
            required 
            class="form-input-custom"
            placeholder="Enter your email address"
            disabled
          />
          <CFormFeedback invalid>Please provide a valid email address.</CFormFeedback>
        </CCol>

        <CCol :md="12">
          <CFormLabel for="address" class="form-label-custom">Address</CFormLabel>
          <CFormTextarea 
            id="address" 
            v-model="userData.address" 
            rows="3"
            class="form-input-custom"
            placeholder="Enter your address"
          />
        </CCol>

        <CCol :md="12">
          <CFormLabel for="password" class="form-label-custom">New Password</CFormLabel>
          <CFormInput 
            id="password" 
            v-model="userData.password" 
            type="password"
            class="form-input-custom"
            placeholder="Leave blank to keep current password"
          />
          <small class="text-muted">Leave blank if you don't want to change your password</small>
        </CCol>

        <!-- Modal Footer -->
        <CCol :xs="12" class="d-flex justify-content-end gap-2 mt-4">
          <CButton 
            color="light" 
            variant="outline"
            @click="showModal = false"
            class="modal-btn-cancel"
          >
            Cancel
          </CButton>
          <CButton 
            color="primary" 
            type="submit"
            class="modal-btn-submit"
          >
            <CIcon name="cilCheckAlt" class="me-1" />
            Update Profile
          </CButton>
        </CCol>
      </CForm>
    </CModalBody>
  </CModal>
</template>