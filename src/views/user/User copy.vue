<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/user.store'
import { useCountryStore } from '@/stores/country.store'
import {
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CFormSelect,
  CFormCheck,
  CFormFeedback,
} from '@coreui/vue'
import { cilPencil, cilTrash, cilUser } from '@coreui/icons'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'
import avatar from '@/assets/images/avatars/8.jpg'

const userStore = useUserStore()
const countryStore = useCountryStore()

const showModal = ref(false)
const isEditing = ref(false)
const validated = ref(false)

const currentUser = ref({
  id: null,
  first_name: '',
  other_name: '',
  last_name: '',
  phone: '',
  email: '',
  address: '',
  roles: '',
  country: '',
  image: null,
})
const countries = ref([])

// Fetch data on mount
onMounted(() => { 
  userStore.fetchUsers()
  countryStore.fetchCountries() 
})

// Watch the store in case countries are updated dynamically later
watch(
  () => countryStore.countries,
  (newCountries) => {
    countries.value = newCountries.map(c => ({
      value: c.id,
      label: c.country,
    }))
  },
  { deep: true }
)

// search & pagination
const searchQuery = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)

const filteredUsers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return userStore.users.filter((c) => {
    const matchesQuery =
      !q ||
      [c.first_name, c.other_name, c.last_name, c.phone, c.email].some((f) =>
        f?.toLowerCase().includes(q),
      )
    return matchesQuery
  })
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredUsers.value.length / itemsPerPage.value)),
)
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredUsers.value.slice(start, start + itemsPerPage.value)
})

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}
function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}
function resetPage() {
  currentPage.value = 1
}

// modal handlers
function openCreate() {
  isEditing.value = false
  validated.value = false
  currentUser.value = {
    id: null,
    first_name: '',
    other_name: '',
    last_name: '',
    phone: '',
    email: '',
    address: '',
    roles: '',
    country: '',
    image: null,
  }
  showModal.value = true
}

function openEdit(cow) {
  isEditing.value = true
  validated.value = false
  currentUser.value = { ...cow }
  showModal.value = true
}

function confirmDelete(id) {
  if (confirm('Are you sure you want to delete this user?')) {
    userStore.deleteCow(id)
  }
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
    first_name: currentUser.value.first_name,
    other_name: currentUser.value.other_name,
    last_name: currentUser.value.last_name,
    phone: currentUser.value.phone,
    email: currentUser.value.email,
    address: currentUser.value.address,
    roles: currentUser.value.roles,
    country: currentUser.value.country.value,
    image: currentUser.value.image,
    password: currentUser.value.password,
    ...(currentUser.value.password ? { password: currentUser.value.password } : {}),
  }

  if (isEditing.value) {
    await userStore.updateUser(currentUser.value.id, payload)
  } else {
    await userStore.createUser(payload)
  }
  showModal.value = false
  userStore.fetchUsers()
}

// Remove image
const removeImage = () => {
  currentUser.value.photo = null
}

// Get User Image
function getUserImage(imageUrl) {
  return imageUrl ? `${import.meta.env.VITE_API_BASE_URL}/${imageUrl}` : avatar
}
</script>

<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader class="d-flex justify-content-between align-items-center">
          <strong>User List</strong>
          <div class="d-flex gap-2 mb-3">
            <CButton color="dark" @click="openCreate">+ Create User</CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          <!-- search + page-size -->
          <div class="d-flex justify-content-start align-items-center flex-wrap mb-3">
            <!-- Search Input -->
            <div class="d-flex align-items-center me-2" style="min-width: 250px">
              <input
                type="text"
                v-model="searchQuery"
                class="form-control"
                style="max-width: 250px"
                placeholder="Search by name, phone, or email"
                @input="resetPage"
              />
            </div>
            <!-- Items per Page -->
            <div
              class="d-flex align-items-center"
              style="float: right; right: 18px; position: absolute"
            >
              <label class="me-2 mb-0">Show:</label>
              <select v-model="itemsPerPage" @change="resetPage" class="form-select w-auto">
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
            </div>
          </div>

          <!-- users table -->
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Fullname</CTableHeaderCell>
                <CTableHeaderCell>Phone</CTableHeaderCell>
                <CTableHeaderCell>Email</CTableHeaderCell>
                <CTableHeaderCell>Role</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="user in paginatedUsers" :key="user.id">
                <!-- <CTableDataCell
                  ><CAvatar :src="getUserImage(user?.photo)" size="md"
                /></CTableDataCell> -->
                <CTableDataCell>{{ user.first_name }} {{ user.other_name }} {{ user.last_name }}</CTableDataCell>
                <CTableDataCell>{{ user.phone }}</CTableDataCell>
                <CTableDataCell>{{ user.email }}</CTableDataCell>
                <CTableDataCell>{{ user.roles[0] }}</CTableDataCell>
                <CTableDataCell>
                  <!-- Edit user Button -->
                  <CButton
                    size="sm"
                    color="info"
                    class="me-2 text-white"
                    title="Edit user"
                    @click="openEdit(user)"
                  >
                    <CIcon :icon="cilPencil" />
                  </CButton>

                  <!-- Delete user Button -->
                  <CButton
                    size="sm"
                    color="danger"
                    class="text-white"
                    title="Delete user"
                    @click="confirmDelete(user.id)"
                  >
                    <CIcon :icon="cilTrash" />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
              <CTableRow v-if="paginatedUsers.length === 0">
                <CTableDataCell colspan="8" class="text-center"> No user found. </CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>

          <!-- pagination controls -->
          <div class="text-end mb-3">
            <strong>Total Records:</strong> {{ filteredUsers.length }}
          </div>
          <div class="d-flex justify-content-between align-items-center mt-3">
            <CButton color="dark" variant="outline" :disabled="currentPage === 1" @click="prevPage">
              Previous
            </CButton>
            <div>Page {{ currentPage }} of {{ totalPages }}</div>
            <CButton
              color="dark"
              variant="outline"
              :disabled="currentPage === totalPages"
              @click="nextPage"
            >
              Next
            </CButton>
          </div>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>

  <!-- Create/Edit Modal -->
  <CModal :visible="showModal" @close="showModal = false" backdrop="static" size="lg">
    <CModalHeader>
      <CModalTitle>{{ isEditing ? 'Edit User' : 'Add User' }}</CModalTitle>
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
          <CFormInput id="first_name" v-model="currentUser.first_name" required />
          <CFormFeedback invalid>First Name is required.</CFormFeedback>
        </CCol>

        <CCol :md="6">
          <CFormLabel for="other_name">Other Name</CFormLabel>
          <CFormInput id="other_name" v-model="currentUser.other_name" />
        </CCol>

        <CCol :md="6">
          <CFormLabel for="last_name">Last Name</CFormLabel>
          <CFormInput id="last_name" v-model="currentUser.last_name" required />
          <CFormFeedback invalid>Last name is required.</CFormFeedback>
        </CCol>

        <CCol :md="6">
          <CFormLabel for="phone">Phone</CFormLabel>
          <CFormInput id="phone" v-model="currentUser.phone" />
        </CCol>

        <CCol :md="6">
          <CFormLabel for="address">Address</CFormLabel>
          <CFormInput id="address" v-model="currentUser.address" />
        </CCol>

        <CCol :md="6">
          <CFormLabel for="email">Email</CFormLabel>
          <CFormInput id="email" v-model="currentUser.email" required />
          <CFormFeedback invalid>Email is required.</CFormFeedback>
        </CCol>

        <CCol :md="6">
          <CFormLabel for="roles">User Role</CFormLabel>
          <CFormSelect
            id="roles"
            v-model="currentUser.roles"
            :options="[
              { label: 'Select Type', value: '' },
              { label: 'Superadmin', value: 'superadmin' },
              { label: 'Manager', value: 'managing_director' },
              { label: 'Accountant', value: 'accountant' },
              { label: 'agronomist', value: 'agronomist' },
              { label: 'Veterinarian', value: 'veterinarian' },
            ]"
            required
          />
          <CFormFeedback invalid>This field is required for males.</CFormFeedback>
        </CCol>

        <CCol :md="6">
          <CFormLabel for="country">Country</CFormLabel>
          <Multiselect
            v-model="currentUser.country"
            placeholder="Select Country"
            track-by="value"
            label="label"
            :options="countries"
            :show-no-results="false"
            :close-on-select="true"
            :clear-on-select="false"
            :preserve-search="true"
            :preselect-first="false"
            required
          />
          <CFormFeedback invalid>This field is required.</CFormFeedback>
        </CCol>

        <CCol :md="6">
          <CFormLabel for="password">Password</CFormLabel>
          <CFormInput id="password" v-model="currentUser.password" />
          <CFormFeedback invalid>Password is required.</CFormFeedback>
        </CCol>

        <CCol
          :md="4"
          v-if="isEditing && currentUser.photo && typeof currentUser.photo === 'string'"
        >
          <div class="d-flex align-items-start gap-3 mb-2">
            <img
              :src="getUserImage(currentUser.photo)"
              class="img-fluid rounded"
              style="max-height: 100px"
              alt="Cow"
            />
            <CButton color="danger" size="sm" title="Remove Image" @click="removeImage"
              ><CIcon :icon="cilTrash"
            /></CButton>
          </div>
        </CCol>
        <CCol :md="6">
          <CFormLabel for="image">User Image</CFormLabel>
          <CFormInput
            type="file"
            id="image"
            @change="(e) => (currentUser.photo = e.target.files[0])"
            accept="image/*"
          />
        </CCol>

        <CCol :md="12" class="d-flex justify-content-end">
          <CButton color="light" class="me-2" @click="showModal = false">Cancel</CButton>
          <CButton color="dark" type="submit">{{ isEditing ? 'Update' : 'Create' }}</CButton>
        </CCol>
      </CForm>
    </CModalBody>
  </CModal>
</template>
