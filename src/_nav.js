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
  //Farm
  {
    component: 'CNavGroup',
    name: 'Farm',
    to: '/farm',
    icon: 'cil-notes',
    items: [
      {
        component: 'CNavItem',
        name: 'Farm List',
        to: '/farm-list',
      },
      {
        component: 'CNavItem',
        name: 'Blocks',
        to: '/block-list',
      },
      {
        component: 'CNavItem',
        name: 'Trees',
        to: '/tree-list',
      },
      {
        component: 'CNavItem',
        name: 'Activities',
        items: [
          {
            component: 'CNavItem',
            name: 'Harvest',
            to: '/harvests',
          },
        ],
      },
    ],
  },

  // Cattle Management
  {
    component: 'CNavTitle',
    name: 'Cattle Management',
  },
  // Pasture
  {
    component: 'CNavItem',
    name: 'Pasture',
    to: '/pastures',
    icon: 'cil-puzzle',
  },
  // Cow
  {
    component: 'router-link',
    name: 'Cow',
    //to: '/cows',
    icon: 'cil-layers',
    items: [
      {
        component: 'CNavItem',
        name: 'Cow List',
        to: '/cows',
      },
      {
        component: 'CNavItem',
        name: 'Maternity',
        to: '/maternity',
      },
      {
        component: 'CNavItem',
        name: 'Nutrition',
        items: [
          {
            component: 'CNavItem',
            name: 'Food Stock',
            to: '/cow-foods',
          },
          {
            component: 'CNavItem',
            name: 'Feeding',
            to: '/feedings',
          }
        ],
      },
      {
        component: 'router-link',
        name: 'Health',
        items: [
          {
            component: 'CNavItem',
            name: 'Medication',
            to: '/medications',
          },
          {
            component: 'CNavItem',
            name: 'Clinical Care',
            to: '/clinical-cares',
          }
        ],
      },
    ],
  },

  // /Stock Management
  {
    component: 'CNavTitle',
    name: 'Stock Management',
  },
  {
    component: 'router-link',
    name: 'Stock Management',
    icon: 'cil-basket',
    items: [
      {
        component: 'CNavItem',
        name: 'Daily Milk Record',
        to: '/daily-milk-records',
      },
      {
        component: 'CNavItem',
        name: 'Cow Food',
        to: '/foods',
      },
      // {
      //   component: 'CNavItem',
      //   name: 'Crops',
      //   to: '/roles',
      // },
    ],
  },

  // Sales Management
  {
    component: 'CNavTitle',
    name: 'Sales Management',
  },
  {
    component: 'router-link',
    name: 'Sales Management',
    icon: 'cil-dollar',
    items: [
      {
        component: 'CNavItem',
        name: 'Milk Sales',
        to: '/milk-sales',
      },
      {
        component: 'CNavItem',
        name: 'Cow Sales',
        to: '/cow-sales',
      },
      // {
      //   component: 'CNavItem',
      //   name: 'Product Sales',
      //   to: '/product-sales',
      // },
    ],
  },

  // General Settings
  {
    component: 'CNavTitle',
    name: 'General Settings',
  },
  //User Management
  {
    component: 'router-link',
    name: 'User Management',
    icon: 'cil-user',
    items: [
      {
        component: 'CNavItem',
        name: 'System User',
        to: '/users',
      },
      {
        component: 'CNavItem',
        name: 'Customer',
        to: '/customers',
      },
      {
        component: 'CNavItem',
        name: 'Country',
        to: '/countries',
      },
      {
        component: 'CNavItem',
        name: 'Role',
        to: '/roles',
      },
      // {
      //   component: 'CNavItem',
      //   name: 'Permission',
      //   to: '/medications',
      // },
    ],
  },

  // {
  //   component: 'CNavGroup',
  //   name: 'Base',
  //   to: '/base',
  //   icon: 'cil-puzzle',
  //   items: [
  //     {
  //       component: 'CNavItem',
  //       name: 'Accordion',
  //       to: '/base/accordion',
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Breadcrumbs',
  //       to: '/base/breadcrumbs',
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Cards',
  //       to: '/base/cards',
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Calendar',
  //       href: 'https://coreui.io/vue/docs/components/calendar.html',
  //       external: true,
  //       badge: {
  //         color: 'danger',
  //         text: 'PRO',
  //       },
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Carousels',
  //       to: '/base/carousels',
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Collapses',
  //       to: '/base/collapses',
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'List Groups',
  //       to: '/base/list-groups',
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Navs & Tabs',
  //       to: '/base/navs',
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Paginations',
  //       to: '/base/paginations',
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Placeholders',
  //       to: '/base/placeholders',
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Popovers',
  //       to: '/base/popovers',
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Progress',
  //       to: '/base/progress',
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Smart Pagination',
  //       href: 'https://coreui.io/vue/docs/components/smart-pagination.html',
  //       badge: {
  //         color: 'danger',
  //         text: 'PRO',
  //       },
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Smart Table',
  //       external: true,
  //       href: 'https://coreui.io/vue/docs/components/smart-table.html',
  //       badge: {
  //         color: 'danger',
  //         text: 'PRO',
  //       },
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Spinners',
  //       to: '/base/spinners',
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Tables',
  //       to: '/base/tables',
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Tabs',
  //       to: '/base/tabs',
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Tooltips',
  //       to: '/base/tooltips',
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Virtual Scroller',
  //       href: 'https://coreui.io/vue/docs/components/virtual-scroller.html',
  //       external: true,
  //       badge: {
  //         color: 'danger',
  //         text: 'PRO',
  //       },
  //     },
  //   ],
  // },
  // {
  //   component: 'CNavGroup',
  //   name: 'Buttons',
  //   to: '/buttons',
  //   icon: 'cil-cursor',
  //   items: [
  //     {
  //       component: 'CNavItem',
  //       name: 'Buttons',
  //       to: '/buttons/standard-buttons',
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Button Groups',
  //       to: '/buttons/button-groups',
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Loading Button',
  //       href: 'https://coreui.io/vue/docs/components/loading-button.html',
  //       external: true,
  //       badge: {
  //         color: 'danger',
  //         text: 'PRO',
  //       },
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Dropdowns',
  //       to: '/buttons/dropdowns',
  //     },
  //   ],
  // },
  // {
  //   component: 'CNavGroup',
  //   name: 'Forms',
  //   to: '/forms',
  //   icon: 'cil-notes',
  //   items: [
  //     {
  //       component: 'CNavItem',
  //       name: 'Form Control',
  //       to: '/forms/form-control',
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Select',
  //       to: '/forms/select',
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Checks & Radios',
  //       to: '/forms/checks-radios',
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Range',
  //       to: '/forms/range',
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Range Slider',
  //       href: 'https://coreui.io/vue/docs/forms/range-slider.html',
  //       external: true,
  //       badge: {
  //         color: 'danger',
  //         text: 'PRO',
  //       },
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Input Group',
  //       to: '/forms/input-group',
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Floating Labels',
  //       to: '/forms/floating-labels',
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Date Picker',
  //       href: 'https://coreui.io/vue/docs/forms/date-picker.html',
  //       external: true,
  //       badge: {
  //         color: 'danger',
  //         text: 'PRO',
  //       },
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Date Range Picker',
  //       href: 'https://coreui.io/vue/docs/forms/date-range-picker.html',
  //       badge: {
  //         color: 'danger',
  //         text: 'PRO',
  //       },
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Rating',
  //       href: 'https://coreui.io/vue/docs/forms/rating.html',
  //       external: true,
  //       badge: {
  //         color: 'danger',
  //         text: 'PRO',
  //       },
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Time Picker',
  //       href: 'https://coreui.io/vue/docs/forms/time-picker.html',
  //       external: true,
  //       badge: {
  //         color: 'danger',
  //         text: 'PRO',
  //       },
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Layout',
  //       to: '/forms/layout',
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Validation',
  //       to: '/forms/validation',
  //     },
  //   ],
  // },
  // {
  //   component: 'CNavItem',
  //   name: 'Charts',
  //   to: '/charts',
  //   icon: 'cil-chart-pie',
  // },
  // {
  //   component: 'CNavGroup',
  //   name: 'Icons',
  //   to: '/icons',
  //   icon: 'cil-star',
  //   items: [
  //     {
  //       component: 'CNavItem',
  //       name: 'CoreUI Icons',
  //       to: '/icons/coreui-icons',
  //       badge: {
  //         color: 'info',
  //         text: 'NEW',
  //       },
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Brands',
  //       to: '/icons/brands',
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Flags',
  //       to: '/icons/flags',
  //     },
  //   ],
  // },
  // {
  //   component: 'CNavGroup',
  //   name: 'Notifications',
  //   to: '/notifications',
  //   icon: 'cil-bell',
  //   items: [
  //     {
  //       component: 'CNavItem',
  //       name: 'Alerts',
  //       to: '/notifications/alerts',
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Badges',
  //       to: '/notifications/badges',
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Modals',
  //       to: '/notifications/modals',
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Toasts',
  //       to: '/notifications/toasts',
  //     },
  //   ],
  // },
  // {
  //   component: 'CNavItem',
  //   name: 'Widgets',
  //   to: '/widgets',
  //   icon: 'cil-calculator',
  //   badge: {
  //     color: 'primary',
  //     text: 'NEW',
  //     shape: 'pill',
  //   },
  // },
  // {
  //   component: 'CNavTitle',
  //   name: 'Extras',
  // },
  // {
  //   component: 'CNavGroup',
  //   name: 'Pages',
  //   to: '/pages',
  //   icon: 'cil-star',
  //   items: [
  //     {
  //       component: 'CNavItem',
  //       name: 'Login',
  //       to: '/pages/login',
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Reset Password',
  //       to: '/pages/reset-password',
  //     },
  //     {
  //       component: 'CNavItem',
  //       name: 'Confirm Password',
  //       to: '/pages/confirm-password',
  //     },
  //   ],
  // },
]
