<template>
  <div class="wrapper min-vh-100 d-flex flex-row align-items-center">
    <CContainer>
      <CRow class="justify-content-center">
        <CCol class="mx-auto" style="max-width: 400px;">
          <CCardGroup>
            <CCard class="p-4 w-100">
              <CCardBody>
                <CForm>
                  <h1>Enter your email</h1>
                  <p class="text-body-secondary">Enter Your Email to Reset Your Password</p>
                  <CInputGroup class="mb-3">
                    <CInputGroupText>
                      <CIcon icon="cil-envelope-closed" />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Email"
                      type="email"
                      autocomplete="email"
                    />
                  </CInputGroup>

                  <!-- Send email button below the email field -->
                  <div class="d-grid">
                    <CButton color="primary" class="mt-3">
                      Send Email
                    </CButton>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCardGroup>
        </CCol>
      </CRow>
    </CContainer>
  </div>
</template>
