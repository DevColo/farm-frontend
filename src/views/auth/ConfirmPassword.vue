<template>
  <!-- START PAGE -->
  <div class="page">
    <div class="">
      <!-- CONTAINER OPEN -->
      <div class="col col-login mx-auto">
        <div class="main-logo text-center">
          <img
            src="../../assets/images/brand/light-logo.png"
            class="header-brand-img"
            alt=""
          />
          <img
            src="../../assets/images/brand/dark-logo.png"
            class="header-brand-img theme-logos"
            alt=""
          />
        </div>
      </div>
      <div class="container-login100">
        <div class="wrap-login100 p-6">
          <form class="login100-form validate-form" @submit.prevent="login">
            <span class="login100-form-title"> Confirm New  Password</span>
            <div
              class="wrap-input100 validate-input"
              data-validate="Password is required"
            >
              <div class="form-group">
                <label class="form-label"> New Password</label>
                <input
                  class="input100"
                  type="password"
                  v-model="password"
                  name="pass"
                  placeholder="Password"
                />
                <span class="focus-input100"></span>
                <span class="symbol-input100">
                  <i class="ri-lock-line" aria-hidden="true"></i>
                </span>
              </div>
               <div class="form-group">
                <label class="form-label"> Confirm Password</label>
                <input
                  class="input100"
                  type="password"
                  v-model="password"
                  name="pass"
                  placeholder="Password"
                />
                <span class="focus-input100"></span>
                <span class="symbol-input100">
                  <i class="ri-lock-line" aria-hidden="true"></i>
                </span>
              </div>
            </div>

            <div class="container-login100-form-btn">
              <button type="submit" class="login100-form-btn btn-primary">
                Confirm
              </button>
            </div>
          </form>
        </div>
      </div>
      <!-- CONTAINER CLOSED -->
    </div>
  </div>
  <!-- END PAGE -->
</template>