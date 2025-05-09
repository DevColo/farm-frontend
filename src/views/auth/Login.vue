<script>
import "../../style.css";
import "../../assets/plugins/bootstrap/css/bootstrap.min.css";
import "../../assets/css/style.css";
import "../../assets/css/plugin.css";
import "../../assets/css/icons.css";
import "../../assets/switcher/css/switcher.css";
import "../../assets/switcher/demo.css";

// Import jQuery
import "../../assets/js/vendors/jquery.min.js";
import "../../assets/plugins/bootstrap/js/popper.min.js";
import "../../assets/plugins/bootstrap/js/bootstrap.min.js";
import "../../assets/js/custom-switcher.js";
import "../../assets/switcher/js/switcher.js";

export default {
  name: "Login",
  data() {
    return {
      email: "",
      password: "",
    };
  },
  methods: {
    goToReset() {
      this.$router.push({ name: "ResetPassword" });
    },
    goToRegister() {
      this.$router.push({ name: "Register" });
    },
    login() {
      // Handle login logic here
      console.log("Login with:", this.email, this.password);
      // Example: this.$store.dispatch('auth/login', { email: this.email, password: this.password });
      this.$router.push({ name: "Dashboard" });
    },
  },
};
</script>
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
            <span class="login100-form-title"> Member Login </span>
            <div
              class="wrap-input100 validate-input"
              data-validate="Valid email is required: ex@abc.xyz"
            >
              <div class="form-group">
                <label class="form-label">Email</label>
                <input
                  class="input100"
                  type="text"
                  v-model="email"
                  name="email"
                  placeholder="Email"
                />
                <span class="focus-input100"></span>
                <span class="symbol-input100">
                  <i class="ri-mail-send-line" aria-hidden="true"></i>
                </span>
              </div>
            </div>
            <div
              class="wrap-input100 validate-input"
              data-validate="Password is required"
            >
              <div class="form-group">
                <label class="form-label">Password</label>
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
            <div class="text-end pt-1">
              <p class="mb-0">
                <a @click="goToReset" class="text-primary ms-1"
                  >Forgot Password?</a
                >
              </p>
            </div>
            <div class="container-login100-form-btn">
              <button type="submit" class="login100-form-btn btn-primary">
                Login
              </button>
            </div>
            <div class="text-center pt-3">
              <p class="text-dark mb-0">
                Not a member?
                <a @click="goToRegister" class="text-primary ms-1"
                  >Sign UP now</a
                >
              </p>
            </div>
          </form>
        </div>
      </div>
      <!-- CONTAINER CLOSED -->
    </div>
  </div>
  <!-- END PAGE -->
</template>
