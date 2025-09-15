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
  <div class="login-container">
    <!-- Animated Background -->
    <div class="bg-animation">
      <div class="floating-orb orb-1"></div>
      <div class="floating-orb orb-2"></div>
      <div class="floating-orb orb-3"></div>
      <div class="grid-overlay"></div>
    </div>

    <!-- Left Panel - Hero Section -->
    <div class="hero-panel">
      <div class="hero-content">
        <h1 class="hero-title">
          Transform Your
          <span class="gradient-text">Farm Management</span>
        </h1>

        <div class="feature-grid">
          <div class="feature-card">
            <div class="feature-content">
              <h4>Real-time Analytics</h4>
              <p>Monitor farm metrics and livestock data instantly</p>
            </div>
          </div>
          
          <div class="feature-card">
            <div class="feature-content">
              <h4>Livestock Tracking</h4>
              <p>Track health, breeding cycles, and growth patterns</p>
            </div>
          </div>
          
          <div class="feature-card">
            <div class="feature-content">
              <h4>Smart Automation</h4>
              <p>Automate feeding schedules and health monitoring</p>
            </div>
          </div>
          <img
          src="@/assets/images/banner.png"
          alt="Dashboard Preview"
          class="img-fluid"
        />
        </div>
      </div>
    </div>

    <!-- Right Panel - Login Form -->
    <div class="form-panel">
      <div class="form-container">
        <div class="login-card">
          <div class="login-header">
            <div class="logo-container">
              <div class="logo-icon">
                <img
                    src="@/assets/images/logo.png"
                    alt="Logo"
                    class="mb-3"
                    style="width: 120px"
                  />
              </div>
            </div>
            <p class="login-subtitle">Login</p>
          </div>

          <CForm @submit.prevent="handleLogin" class="login-form">
            <div class="input-group-modern">
              <label class="input-label">Email Address</label>
              <div class="input-wrapper">
                <CIcon icon="cil-user" class="input-icon" />
                <CFormInput
                  v-model="email"
                  placeholder="Enter your email"
                  autocomplete="email"
                  class="modern-input"
                />
              </div>
            </div>

            <div class="input-group-modern">
              <label class="input-label">Password</label>
              <div class="input-wrapper">
                <CIcon icon="cil-lock-locked" class="input-icon" />
                <CFormInput
                  v-model="password"
                  type="password"
                  placeholder="Enter your password"
                  autocomplete="current-password"
                  class="modern-input"
                />
              </div>
            </div>

            <div class="form-options">
              <label class="checkbox-container">
                <input type="checkbox" class="custom-checkbox">
                <span class="checkmark"></span>
                Remember me
              </label>
              <a href="#" class="forgot-link">Forgot Password?</a>
            </div>

            <CButton
              :disabled="authStore.loading"
              class="login-button"
              type="submit"
            >
              <span v-if="authStore.loading" class="loading-content">
                <div class="spinner"></div>
                Signing in...
              </span>
              <span v-else class="button-content">
                <CIcon icon="cil-arrow-right" class="button-icon" />
                Sign In
              </span>
            </CButton>
          </CForm>
        </div>
      </div>
    </div>
  </div>
</template>