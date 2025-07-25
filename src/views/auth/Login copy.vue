<template>
  <div class="wrapper min-vh-200 d-flex flex-row align-items-center">
    <CContainer>
      <CRow class="justify-content-center">
        <CCol class="mx-auto" style="max-width: 600px">
          <CCardGroup>
            <CCard class="p-4 w-100">
              <CCardBody>
                <CForm>
                  <h1>Login</h1>
                  <img
                    src="@/assets/images/logo.png"
                    alt="Logo"
                    class="mb-4"
                    style="width: 100px; height: auto"
                  />
                  <p class="text-body-secondary">Sign In to your account</p>
                  <CInputGroup class="mb-3">
                    <CInputGroupText>
                      <CIcon icon="cil-user" />
                    </CInputGroupText>
                    <CFormInput placeholder="Username" autocomplete="username" />
                  </CInputGroup>
                  <CInputGroup class="mb-4">
                    <CInputGroupText>
                      <CIcon icon="cil-lock-locked" />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Password"
                      autocomplete="current-password"
                    />
                  </CInputGroup>
                  <CRow>
                    <CCol :xs="6">
                      <CButton color="primary" class="px-4"> Login </CButton>
                    </CCol>
                    <CCol :xs="6" class="text-right">
                      <CButton color="link" class="px-0" @click="$router.push('/reset-password')">
                        Forgot password?
                      </CButton>
                    </CCol>
                  </CRow>
                </CForm>
              </CCardBody>
            </CCard>
          </CCardGroup>
        </CCol>
      </CRow>
    </CContainer>
  </div>
</template>
