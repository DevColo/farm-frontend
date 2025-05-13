export default [
  {
    component: 'CNavItem',
    name: 'Dashboard',
    to: '/dashboard',
    icon: 'cil-speedometer',
    // badge: {
    //   color: 'primary',
    //   text: 'NEW',
    // },
  },
  // {
  //   component: 'CNavTitle',
  //   name: 'Theme',
  // },
  // {
  //   component: 'CNavItem',
  //   name: 'Colors',
  //   to: '/theme/colors',
  //   icon: 'cil-drop',
  // },
  // {
  //   component: 'CNavItem',
  //   name: 'Typography',
  //   to: '/theme/typography',
  //   icon: 'cil-pencil',
  // },
  // Farm Management
  {
    component: 'CNavTitle',
    name: 'Farm Management',
  },
  // Farm
  {
    component: 'CNavGroup',
    name: 'Farm',
    to: '/base',
    icon: 'cil-notes',
    items: [
      {
        component: 'CNavItem',
        name: 'Add Farm',
        to: '/base/accordion',
      },
      {
        component: 'CNavItem',
        name: 'Farm List',
        to: '/base/breadcrumbs',
      },
    ],
  },
  // Block
  {
    component: 'CNavGroup',
    name: 'Block',
    to: '/base',
    icon: 'cil-layers',
    items: [
      {
        component: 'CNavItem',
        name: 'Add Block',
        to: '/base/accordion',
      },
      {
        component: 'CNavItem',
        name: 'Block List',
        to: '/base/breadcrumbs',
      },
    ],
  },
  // Parcel
  {
    component: 'CNavGroup',
    name: 'Parcel',
    to: '/base',
    icon: 'cil-puzzle',
    items: [
      {
        component: 'CNavItem',
        name: 'Add Parcel',
        to: '/base/accordion',
      },
      {
        component: 'CNavItem',
        name: 'Parcel List',
        to: '/base/breadcrumbs',
      },
    ],
  },

  // Cattle Management
  {
    component: 'CNavTitle',
    name: 'Cattle Management',
  },
  // Cow
  {
    component: 'CNavGroup',
    name: 'Cow',
    to: '/base',
    icon: 'cil-notes',
    items: [
      {
        component: 'CNavItem',
        name: 'Add Cow',
        to: '/base/accordion',
      },
      {
        component: 'CNavItem',
        name: 'Cow List',
        to: '/base/breadcrumbs',
      },
    ],
  },
  // Cattle Log
  {
    component: 'CNavGroup',
    name: 'Cattle Log',
    to: '/base',
    icon: 'cil-layers',
    items: [
      {
        component: 'CNavItem',
        name: 'Add Cattle Log',
        to: '/base/accordion',
      },
      {
        component: 'CNavItem',
        name: 'Cattle Log List',
        to: '/base/breadcrumbs',
      },
    ],
  },
  // Pasture
  {
    component: 'CNavGroup',
    name: 'Pasture',
    //to: '/base',
    icon: 'cil-puzzle',
    items: [
      {
        component: 'CNavItem',
        name: 'Add Pasture',
        to: '/add-pasture',
      },
      {
        component: 'CNavItem',
        name: 'Parcel List',
        to: '/base/breadcrumbs',
      },
    ],
  },

  // Milk Management
  {
    component: 'CNavTitle',
    name: 'Milk Management',
  },
  // Milk Record
  {
    component: 'CNavGroup',
    name: 'Milk Record',
    to: '/base',
    icon: 'cil-notes',
    items: [
      {
        component: 'CNavItem',
        name: 'Add Dialy Record',
        to: '/base/accordion',
      },
      {
        component: 'CNavItem',
        name: 'DIaly Record List',
        to: '/base/breadcrumbs',
      },
    ],
  },

  {
    component: 'CNavGroup',
    name: 'Base',
    to: '/base',
    icon: 'cil-puzzle',
    items: [
      {
        component: 'CNavItem',
        name: 'Accordion',
        to: '/base/accordion',
      },
      {
        component: 'CNavItem',
        name: 'Breadcrumbs',
        to: '/base/breadcrumbs',
      },
      {
        component: 'CNavItem',
        name: 'Cards',
        to: '/base/cards',
      },
      {
        component: 'CNavItem',
        name: 'Calendar',
        href: 'https://coreui.io/vue/docs/components/calendar.html',
        external: true,
        badge: {
          color: 'danger',
          text: 'PRO',
        },
      },
      {
        component: 'CNavItem',
        name: 'Carousels',
        to: '/base/carousels',
      },
      {
        component: 'CNavItem',
        name: 'Collapses',
        to: '/base/collapses',
      },
      {
        component: 'CNavItem',
        name: 'List Groups',
        to: '/base/list-groups',
      },
      {
        component: 'CNavItem',
        name: 'Navs & Tabs',
        to: '/base/navs',
      },
      {
        component: 'CNavItem',
        name: 'Paginations',
        to: '/base/paginations',
      },
      {
        component: 'CNavItem',
        name: 'Placeholders',
        to: '/base/placeholders',
      },
      {
        component: 'CNavItem',
        name: 'Popovers',
        to: '/base/popovers',
      },
      {
        component: 'CNavItem',
        name: 'Progress',
        to: '/base/progress',
      },
      {
        component: 'CNavItem',
        name: 'Smart Pagination',
        href: 'https://coreui.io/vue/docs/components/smart-pagination.html',
        badge: {
          color: 'danger',
          text: 'PRO',
        },
      },
      {
        component: 'CNavItem',
        name: 'Smart Table',
        external: true,
        href: 'https://coreui.io/vue/docs/components/smart-table.html',
        badge: {
          color: 'danger',
          text: 'PRO',
        },
      },
      {
        component: 'CNavItem',
        name: 'Spinners',
        to: '/base/spinners',
      },
      {
        component: 'CNavItem',
        name: 'Tables',
        to: '/base/tables',
      },
      {
        component: 'CNavItem',
        name: 'Tabs',
        to: '/base/tabs',
      },
      {
        component: 'CNavItem',
        name: 'Tooltips',
        to: '/base/tooltips',
      },
      {
        component: 'CNavItem',
        name: 'Virtual Scroller',
        href: 'https://coreui.io/vue/docs/components/virtual-scroller.html',
        external: true,
        badge: {
          color: 'danger',
          text: 'PRO',
        },
      },
    ],
  },
  {
    component: 'CNavGroup',
    name: 'Buttons',
    to: '/buttons',
    icon: 'cil-cursor',
    items: [
      {
        component: 'CNavItem',
        name: 'Buttons',
        to: '/buttons/standard-buttons',
      },
      {
        component: 'CNavItem',
        name: 'Button Groups',
        to: '/buttons/button-groups',
      },
      {
        component: 'CNavItem',
        name: 'Loading Button',
        href: 'https://coreui.io/vue/docs/components/loading-button.html',
        external: true,
        badge: {
          color: 'danger',
          text: 'PRO',
        },
      },
      {
        component: 'CNavItem',
        name: 'Dropdowns',
        to: '/buttons/dropdowns',
      },
    ],
  },
  {
    component: 'CNavGroup',
    name: 'Forms',
    to: '/forms',
    icon: 'cil-notes',
    items: [
      {
        component: 'CNavItem',
        name: 'Form Control',
        to: '/forms/form-control',
      },
      {
        component: 'CNavItem',
        name: 'Select',
        to: '/forms/select',
      },
      {
        component: 'CNavItem',
        name: 'Checks & Radios',
        to: '/forms/checks-radios',
      },
      {
        component: 'CNavItem',
        name: 'Range',
        to: '/forms/range',
      },
      {
        component: 'CNavItem',
        name: 'Range Slider',
        href: 'https://coreui.io/vue/docs/forms/range-slider.html',
        external: true,
        badge: {
          color: 'danger',
          text: 'PRO',
        },
      },
      {
        component: 'CNavItem',
        name: 'Input Group',
        to: '/forms/input-group',
      },
      {
        component: 'CNavItem',
        name: 'Floating Labels',
        to: '/forms/floating-labels',
      },
      {
        component: 'CNavItem',
        name: 'Date Picker',
        href: 'https://coreui.io/vue/docs/forms/date-picker.html',
        external: true,
        badge: {
          color: 'danger',
          text: 'PRO',
        },
      },
      {
        component: 'CNavItem',
        name: 'Date Range Picker',
        href: 'https://coreui.io/vue/docs/forms/date-range-picker.html',
        badge: {
          color: 'danger',
          text: 'PRO',
        },
      },
      {
        component: 'CNavItem',
        name: 'Rating',
        href: 'https://coreui.io/vue/docs/forms/rating.html',
        external: true,
        badge: {
          color: 'danger',
          text: 'PRO',
        },
      },
      {
        component: 'CNavItem',
        name: 'Time Picker',
        href: 'https://coreui.io/vue/docs/forms/time-picker.html',
        external: true,
        badge: {
          color: 'danger',
          text: 'PRO',
        },
      },
      {
        component: 'CNavItem',
        name: 'Layout',
        to: '/forms/layout',
      },
      {
        component: 'CNavItem',
        name: 'Validation',
        to: '/forms/validation',
      },
    ],
  },
  {
    component: 'CNavItem',
    name: 'Charts',
    to: '/charts',
    icon: 'cil-chart-pie',
  },
  {
    component: 'CNavGroup',
    name: 'Icons',
    to: '/icons',
    icon: 'cil-star',
    items: [
      {
        component: 'CNavItem',
        name: 'CoreUI Icons',
        to: '/icons/coreui-icons',
        badge: {
          color: 'info',
          text: 'NEW',
        },
      },
      {
        component: 'CNavItem',
        name: 'Brands',
        to: '/icons/brands',
      },
      {
        component: 'CNavItem',
        name: 'Flags',
        to: '/icons/flags',
      },
    ],
  },
  {
    component: 'CNavGroup',
    name: 'Notifications',
    to: '/notifications',
    icon: 'cil-bell',
    items: [
      {
        component: 'CNavItem',
        name: 'Alerts',
        to: '/notifications/alerts',
      },
      {
        component: 'CNavItem',
        name: 'Badges',
        to: '/notifications/badges',
      },
      {
        component: 'CNavItem',
        name: 'Modals',
        to: '/notifications/modals',
      },
      {
        component: 'CNavItem',
        name: 'Toasts',
        to: '/notifications/toasts',
      },
    ],
  },
  {
    component: 'CNavItem',
    name: 'Widgets',
    to: '/widgets',
    icon: 'cil-calculator',
    badge: {
      color: 'primary',
      text: 'NEW',
      shape: 'pill',
    },
  },
  {
    component: 'CNavTitle',
    name: 'Extras',
  },
  {
    component: 'CNavGroup',
    name: 'Pages',
    to: '/pages',
    icon: 'cil-star',
    items: [
      {
        component: 'CNavItem',
        name: 'Login',
        to: '/pages/login',
      },
      {
        component: 'CNavItem',
        name: 'Register',
        to: '/pages/register',
      },
      {
        component: 'CNavItem',
        name: 'Error 404',
        to: '/pages/404',
      },
      {
        component: 'CNavItem',
        name: 'Error 500',
        to: '/pages/500',
      },
    ],
  },
]
