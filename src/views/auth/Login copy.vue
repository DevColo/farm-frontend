<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CForm,
  CInputGroup,
  CInputGroupText,
  CFormInput,
  CButton,
} from '@coreui/vue'
import CIcon from '@coreui/icons-vue'
import { useAuthStore } from '@/stores/auth'

const email = ref('')
const password = ref('')
const authStore = useAuthStore()
const router = useRouter()

const handleLogin = async () => {
  await authStore.login(email.value.trim(), password.value.trim(), router)
  if (authStore.error) {
    alert(authStore.error)
  }
}
</script>

<template>
  <div class="login-wrapper d-flex min-vh-100">
    <!-- Left Side -->
    <div class="login-left d-flex flex-column justify-content-center text-white p-5">
      <div class="mb-4">
        <h2>Easily manage your farm, livestock, and productivity anywhere.</h2>
      </div>
      <ul class="list-unstyled mt-4">
        <li class="mb-3">⚡ Organize all farm records and cattle data</li>
        <li class="mb-3">⚡ Monitor livestock health and growth in real time</li>
        <li>⚡ Improve farm efficiency with smart automation</li>
      </ul>
      <div class="mt-5 text-center">
        <img
          src="@/assets/images/banner.png"
          alt="Dashboard Preview"
          class="img-fluid"
        />
      </div>
    </div>

    <!-- Right Side -->
    <div class="login-right d-flex align-items-center justify-content-center flex-grow-1 p-5">
      <CContainer>
        <CRow class="justify-content-center">
          <CCol md="6" lg="6" xl="6">
              <CCardBody>
                <div class="text-center mb-4">
                  <img
                    src="@/assets/images/logo.png"
                    alt="Logo"
                    class="mb-3"
                    style="width: 120px"
                  />
                  <h4>Login</h4>
                </div>

                <CForm @submit.prevent="handleLogin">
                  <CInputGroup class="mb-3">
                    <CInputGroupText>
                      <CIcon icon="cil-user" />
                    </CInputGroupText>
                    <CFormInput
                      v-model="email"
                      placeholder="Your Username/Email"
                      autocomplete="email"
                    />
                  </CInputGroup>

                  <CInputGroup class="mb-4">
                    <CInputGroupText>
                      <CIcon icon="cil-lock-locked" />
                    </CInputGroupText>
                    <CFormInput
                      v-model="password"
                      type="password"
                      placeholder="Password"
                      autocomplete="current-password"
                    />
                  </CInputGroup>

                  <CButton
                    :disabled="authStore.loading"
                    color="dark"
                    class="w-100"
                    type="submit"
                  >
                    <span v-if="authStore.loading">Logging in..</span>
                    <span v-else>Login</span>
                  </CButton>
                </CForm>
              </CCardBody>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  </div>
</template>

<style scoped>
.login-left {
  flex: 1;
  background: #000d2a; /* dark navy background */
  color: #fff;
}
.login-right {
  flex: 1;
  background: #fff;
}
</style>
