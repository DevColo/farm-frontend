import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/auth/Login.vue";
import ResetPassword from "../views/auth/ResetPassword.vue";
import AdminLayout from "../views/layout/AdminLayout.vue";
import Dashboard from "../views/admin/Dashboard.vue";
import AddFarm from "../views/farm/AddFarm.vue";

const routes = [
  {
    path: "/",
    name: "Login",
    component: Login,
  },
  {
    path: "/reset-password",
    name: "ResetPassword",
    component: ResetPassword,
  },
  {
    path: "/admin",
    component: AdminLayout,
    children: [
      {
        path: "",
        name: "Dashboard",
        component: Dashboard,
      },
      {
        path: "/add-farm",
        name: "add-farm",
        component: AddFarm,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
