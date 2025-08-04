<script setup>
import { ref } from 'vue'
import avatar from '@/assets/images/avatars/8.jpg'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const validated = ref(false)

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

  await authStore.updateUser(authStore.user?.id, payload)
  showModal.value = false
  //resetPage()
}

// Remove Photo
const removePhoto = () => {
  userData.value.photo = null
}

// Get User Image
function getUserImage(imageUrl) {
  return imageUrl ? `${import.meta.env.VITE_API_BASE_URL}/${imageUrl}` : avatar
}
</script>

<template>
  <CRow>
    <CCol :xs="12">
      <div class="col-xxl-6 col-xl-6 col-sm-12">
        <div class="card">
          <div class="card-body d-flex align-items-center">
            <div class="me-3 text-white bg-light p-3">
              <CAvatar :src="getUserImage(authStore.user?.photo)" size="lg" />
            </div>
          </div>
          <div class="p-3">
            <div class="text-body-secondary fw-semibold small">
              First Name: {{ authStore.user?.first_name }}
            </div>
            <div class="text-body-secondary fw-semibold small">
              Other Name: {{ authStore.user?.other_name }}
            </div>
            <div class="text-body-secondary fw-semibold small">
              Last Name: {{ authStore.user?.last_name }}
            </div>
            <div class="text-body-secondary fw-semibold small">
              Phone: {{ authStore.user?.phone }}
            </div>
            <div class="text-body-secondary fw-semibold small">
              Email: {{ authStore.user?.email }}
            </div>
            <div class="text-body-secondary fw-semibold small">
              Address: {{ authStore.user?.address }}
            </div>
          </div>
          <div class="card-footer">
            <CButton color="dark" @click="editProfileModal(authStore.user)">Edit Profile</CButton>
          </div>
        </div>
      </div>
    </CCol>
  </CRow>

  <!-- Create/Edit Modal -->
  <CModal :visible="showModal" @close="showModal = false" backdrop="static" size="lg">
    <CModalHeader>
      <CModalTitle>Edit Profile</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CForm
        class="row g-3 needs-validation"
        enctype="multipart/form-data"
        novalidate
        :validated="validated"
        @submit="handleSubmit"
      >
        <CCol :md="6">
          <CFormLabel for="first_name">First Name</CFormLabel>
          <CFormInput id="first_name" v-model="userData.first_name" required />
          <CFormFeedback invalid>First Name is required.</CFormFeedback>
        </CCol>

        <CCol :md="6">
          <CFormLabel for="other_name">Other Name</CFormLabel>
          <CFormInput id="other_name" v-model="userData.other_name" />
          <CFormFeedback invalid>Other Name is required.</CFormFeedback>
        </CCol>

        <CCol :md="6">
          <CFormLabel for="last_name">Last Name</CFormLabel>
          <CFormInput id="last_name" v-model="userData.last_name" required />
          <CFormFeedback invalid>Last Name is required.</CFormFeedback>
        </CCol>

        <CCol :md="6">
          <CFormLabel for="phone">Phone</CFormLabel>
          <CFormInput id="phone" v-model="userData.phone" required />
          <CFormFeedback invalid>Phone is required.</CFormFeedback>
        </CCol>

        <CCol :md="6">
          <CFormLabel for="address">Address</CFormLabel>
          <CFormInput id="address" v-model="userData.address" />
          <CFormFeedback invalid>Address is required.</CFormFeedback>
        </CCol>

        <CCol :md="6">
          <CFormLabel for="email">Email</CFormLabel>
          <CFormInput id="email" v-model="userData.email" required />
          <CFormFeedback invalid>Email is required.</CFormFeedback>
        </CCol>

        <CCol :md="6">
          <CFormLabel for="password">Password</CFormLabel>
          <CFormInput id="password" v-model="userData.password" />
          <CFormFeedback invalid>Password is required.</CFormFeedback>
        </CCol>

        <CCol :xs="4" v-if="userData.photo && typeof userData.photo === 'string'">
          <div class="d-flex align-items-start gap-3 mb-2">
            <img
              :src="getUserImage(userData?.photo)"
              class="img-fluid rounded"
              style="max-height: 200px"
              alt="User Photo"
            />

            <CButton color="danger" size="sm" title="Remove Photo" @click="removePhoto"
              ><CIcon :icon="cilTrash"
            /></CButton>
          </div>
        </CCol>
        <CCol :xs="6">
          <CFormLabel for="photo">Profile Photo</CFormLabel>
          <CFormInput
            type="file"
            id="photo"
            @change="(e) => (userData.photo = e.target.files[0])"
            accept="image/*"
          />
        </CCol>

        <CCol :xs="12" class="d-flex justify-content-end">
          <CButton color="secondary" class="me-2" @click="showModal = false">Cancel</CButton>
          <CButton color="success" type="submit">Update</CButton>
        </CCol>
      </CForm>
    </CModalBody>
  </CModal>
</template>
