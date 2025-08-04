import { h, resolveComponent } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import DefaultLayout from '@/layouts/DefaultLayout'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue'),
      },
      {
        path: 'pastures',
        name: 'Pastures',
        component: () => import('@/views/pasture/PastureList.vue'),
      },
      {
        path: 'pasture/cow/:pastureId',
        name: 'Pasture Cows',
        component: () => import('@/views/cow/PastureCow.vue'),
      },
      {
        path: 'breed/cow/:breed',
        name: 'Breed Cows',
        component: () => import('@/views/cow/BreedCow.vue'),
      },
      {
        path: 'gender/cow/:gender',
        name: 'Gender Cows',
        component: () => import('@/views/cow/GenderCow.vue'),
      },
      {
        path: 'class/cow/:class',
        name: 'Class Cows',
        component: () => import('@/views/cow/ClassCow.vue'),
      },
      {
        path: 'cows',
        name: 'Cows',
        component: () => import('@/views/cow/CowList.vue'),
      },
      {
        path: '/cows/:id',
        name: 'Cow View',
        component: () => import('@/views/cow/CowView.vue'),
        props: true,
      },
      {
        path: 'feedings',
        name: 'Cows Feeding',
        component: () => import('@/views/feeding/Feeding.vue'),
      },
      {
        path: 'medications',
        name: 'Cows Medications',
        component: () => import('@/views/medication/Medication.vue'),
      },
      {
        path: 'maternity',
        name: 'Cows Maternity',
        component: () => import('@/views/maternity/Maternity.vue'),
      },
      {
        path: 'daily-milk-records',
        name: 'Daily Milk Record',
        component: () => import('@/views/milk/DailyMilkRecord.vue'),
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/user/Profile.vue'),
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/user/User.vue'),
      },
      {
        path: 'roles',
        name: 'Roles',
        component: () => import('@/views/role/Role.vue'),
      },
      {
        path: 'foods',
        name: 'Cow Foods',
        component: () => import('@/views/food/FoodList.vue'),
      },
      {
        path: 'customers',
        name: 'Customers',
        component: () => import('@/views/customer/Customer.vue'),
      },
      {
        path: 'milk-sales',
        name: 'Milk Sales',
        component: () => import('@/views/sales/MilkSales.vue'),
      },
      {
        path: 'cow-sales',
        name: 'Cow Sales',
        component: () => import('@/views/sales/CowSales.vue'),
      },
      {
        path: 'farm-list',
        name: 'Farm List',
        component: () => import('@/views/farm/FarmList.vue'),
      },
      {
        path: 'block-list',
        name: 'Block List',
        component: () => import('@/views/blocks/BlockList.vue'),
      },
      {
        path: 'parcel-list',
        name: 'Parcel List',
        component: () => import('@/views/parcel/ParcelList.vue'),
      },

      // Theme
      {
        path: 'theme',
        name: 'Theme',
        redirect: '/dashboard/theme/typography',
      },
      {
        path: 'theme/colors',
        name: 'Colors',
        component: () => import('@/views/theme/Colors.vue'),
      },
      {
        path: 'theme/typography',
        name: 'Typography',
        component: () => import('@/views/theme/Typography.vue'),
      },

      // Base
      {
        path: 'base',
        name: 'Base',
        component: { render: () => h(resolveComponent('router-view')) },
        redirect: '/dashboard/base/breadcrumbs',
        children: [
          {
            path: 'accordion',
            name: 'Accordion',
            component: () => import('@/views/base/Accordion.vue'),
          },
          {
            path: 'breadcrumbs',
            name: 'Breadcrumbs',
            component: () => import('@/views/base/Breadcrumbs.vue'),
          },
          {
            path: 'cards',
            name: 'Cards',
            component: () => import('@/views/base/Cards.vue'),
          },
          {
            path: 'carousels',
            name: 'Carousels',
            component: () => import('@/views/base/Carousels.vue'),
          },
          {
            path: 'collapses',
            name: 'Collapses',
            component: () => import('@/views/base/Collapses.vue'),
          },
          {
            path: 'list-groups',
            name: 'List Groups',
            component: () => import('@/views/base/ListGroups.vue'),
          },
          {
            path: 'navs',
            name: 'Navs',
            component: () => import('@/views/base/Navs.vue'),
          },
          {
            path: 'paginations',
            name: 'Paginations',
            component: () => import('@/views/base/Paginations.vue'),
          },
          {
            path: 'placeholders',
            name: 'Placeholders',
            component: () => import('@/views/base/Placeholders.vue'),
          },
          {
            path: 'popovers',
            name: 'Popovers',
            component: () => import('@/views/base/Popovers.vue'),
          },
          {
            path: 'progress',
            name: 'Progress',
            component: () => import('@/views/base/Progress.vue'),
          },
          {
            path: 'spinners',
            name: 'Spinners',
            component: () => import('@/views/base/Spinners.vue'),
          },
          {
            path: 'tables',
            name: 'Tables',
            component: () => import('@/views/base/Tables.vue'),
          },
          {
            path: 'tabs',
            name: 'Tabs',
            component: () => import('@/views/base/Tabs.vue'),
          },
          {
            path: 'tooltips',
            name: 'Tooltips',
            component: () => import('@/views/base/Tooltips.vue'),
          },
        ],
      },

      // Buttons
      {
        path: 'buttons',
        name: 'Buttons',
        component: { render: () => h(resolveComponent('router-view')) },
        redirect: '/dashboard/buttons/standard-buttons',
        children: [
          {
            path: 'standard-buttons',
            name: 'Button Component',
            component: () => import('@/views/buttons/Buttons.vue'),
          },
          {
            path: 'dropdowns',
            name: 'Dropdowns',
            component: () => import('@/views/buttons/Dropdowns.vue'),
          },
          {
            path: 'button-groups',
            name: 'Button Groups',
            component: () => import('@/views/buttons/ButtonGroups.vue'),
          },
        ],
      },

      // Forms
      {
        path: 'forms',
        name: 'Forms',
        component: { render: () => h(resolveComponent('router-view')) },
        redirect: '/dashboard/forms/form-control',
        children: [
          {
            path: 'form-control',
            name: 'Form Control',
            component: () => import('@/views/forms/FormControl.vue'),
          },
          {
            path: 'select',
            name: 'Select',
            component: () => import('@/views/forms/Select.vue'),
          },
          {
            path: 'checks-radios',
            name: 'Checks & Radios',
            component: () => import('@/views/forms/ChecksRadios.vue'),
          },
          {
            path: 'range',
            name: 'Range',
            component: () => import('@/views/forms/Range.vue'),
          },
          {
            path: 'input-group',
            name: 'Input Group',
            component: () => import('@/views/forms/InputGroup.vue'),
          },
          {
            path: 'floating-labels',
            name: 'Floating Labels',
            component: () => import('@/views/forms/FloatingLabels.vue'),
          },
          {
            path: 'layout',
            name: 'Layout',
            component: () => import('@/views/forms/Layout.vue'),
          },
          {
            path: 'validation',
            name: 'Validation',
            component: () => import('@/views/forms/Validation.vue'),
          },
        ],
      },

      // Charts
      {
        path: 'charts',
        name: 'Charts',
        component: () => import('@/views/charts/Charts.vue'),
      },

      // Icons
      {
        path: 'icons',
        name: 'Icons',
        component: { render: () => h(resolveComponent('router-view')) },
        redirect: '/dashboard/icons/coreui-icons',
        children: [
          {
            path: 'coreui-icons',
            name: 'CoreUI Icons',
            component: () => import('@/views/icons/CoreUIIcons.vue'),
          },
          {
            path: 'brands',
            name: 'Brands',
            component: () => import('@/views/icons/Brands.vue'),
          },
          {
            path: 'flags',
            name: 'Flags',
            component: () => import('@/views/icons/Flags.vue'),
          },
        ],
      },

      // Notifications
      {
        path: 'notifications',
        name: 'Notifications',
        component: { render: () => h(resolveComponent('router-view')) },
        redirect: '/dashboard/notifications/alerts',
        children: [
          {
            path: 'alerts',
            name: 'Alerts',
            component: () => import('@/views/notifications/Alerts.vue'),
          },
          {
            path: 'badges',
            name: 'Badges',
            component: () => import('@/views/notifications/Badges.vue'),
          },
          {
            path: 'modals',
            name: 'Modals',
            component: () => import('@/views/notifications/Modals.vue'),
          },
          {
            path: 'toasts',
            name: 'Toasts',
            component: () => import('@/views/notifications/Toasts.vue'),
          },
        ],
      },

      {
        path: 'widgets',
        name: 'Widgets',
        component: () => import('@/views/widgets/Widgets.vue'),
      },
    ],
  },

  // Public routes
  // Public routes
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
  },
  {
    path: '/reset-password',
    name: 'Reset Password',
    component: () => import('@/views/pages/ResetPassword.vue'),
  },
  {
    path: '/confirm-password',
    name: 'Confirm Password',
    component: () => import('@/views/pages/ConfirmPassword.vue'),
  },

  // {
  //   path: '/login',
  //   name: 'Pages',
  //   component: { render: () => h(resolveComponent('router-view')) },
  //   children: [
  //     {
  //       path: 'login',
  //       name: 'Login',
  //       component: () => import('@/views/auth/Login.vue'),
  //     },
  //     {
  //       path: 'reset-password',
  //       name: 'Reset Password',
  //       component: () => import('@/views/pages/ResetPassword.vue'),
  //     },
  //     {
  //       path: 'confirm-password',
  //       name: 'Confirm Password',
  //       component: () => import('@/views/pages/ConfirmPassword.vue'),
  //     },
  //   ],
  // },

  // fallback route
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// Auth Guard
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.token) {
    next('/login')
  } else {
    next()
  }
})

export default router
