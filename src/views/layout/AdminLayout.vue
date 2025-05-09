<template>
  <!-- START PAGE -->
  <div class="page">
    <div class="page-main">
      <div>
        <!-- START HEADER -->
        <div class="app-header sticky">
          <div class="main-container container-fluid d-flex">
            <div class="d-flex header-left">
              <div class="responsive-logo">
                <a class="main-logo" href="index.html">
                  <img
                    src="../../assets/images/brand/light-logo.png"
                    class="desktop-logo desktop-logo-dark"
                    alt="soliclogo"
                  />
                  <img
                    src="../../assets/images/brand/dark-logo.png"
                    class="desktop-logo"
                    alt="soliclogo"
                  />
                </a>
              </div>
              <div class="header-nav-link">
                <a
                  href="javascript:void(0);"
                  data-bs-toggle="sidebar"
                  class="nav-link icon toggle app-sidebar__toggle"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M4 11h12v2H4zm0-5h16v2H4zm0 12h7.235v-2H4z"></path>
                  </svg>
                </a>
              </div>
              <div class="header-nav-link d-none d-lg-flex">
                <a
                  href="javascript:void(0);"
                  class="d-flex nav-link icon"
                  data-bs-toggle="dropdown"
                >
                  <span class="country-text ms-2 fs-14 fw-600"
                    >English<i class="mdi mdi-chevron-down ms-2"></i
                  ></span>
                </a>
                <ul class="dropdown-menu dropdown-menu-arrow">
                  <li>
                    <div
                      class="dropdown-item d-flex align-items-center position-relative"
                    >
                      <a href="javascript:void(0);" class="stretched-link"></a>
                      <span>French</span>
                    </div>
                  </li>
                  <li>
                    <div
                      class="dropdown-item d-flex align-items-center position-relative"
                    >
                      <a href="javascript:void(0);" class="stretched-link"></a>
                      <span>Kinyarwanda</span>
                    </div>
                  </li>
                  <li>
                    <div
                      class="dropdown-item d-flex align-items-center position-relative"
                    >
                      <a href="javascript:void(0);" class="stretched-link"></a>
                      <span>Kiswahili</span>
                    </div>
                  </li>
                  <li>
                    <div
                      class="dropdown-item d-flex align-items-center position-relative"
                    >
                      <a href="javascript:void(0);" class="stretched-link"></a>
                      <span>Linguala</span>
                    </div>
                  </li>
                  <li>
                    <div
                      class="dropdown-item d-flex align-items-center position-relative"
                    >
                      <a href="javascript:void(0);" class="stretched-link"></a>
                      <span>Tshibula</span>
                    </div>
                  </li>
                </ul>
              </div>
              <!-- language -->
            </div>
            <div class="d-flex header-right ms-auto">
              <div class="header-nav-link">
                <a
                  href="javascript:void(0);"
                  class="nav-link icon d-lg-none"
                  role="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#navbarSupportedContent-4"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                    ></path>
                  </svg>
                </a>
              </div>
              <div
                class="responsive-navbar align-items-stretch navbar-expand-lg navbar-dark p-0 mb-0"
              >
                <div
                  class="collapse align-items-stretch navbar-collapse"
                  id="navbarSupportedContent-4"
                >
                  <ul class="list-unstyled nav">
                    <li class="header-nav-link">
                      <a
                        href="javascript:void(0);"
                        class="nav-link icon"
                        data-bs-toggle="modal"
                        data-bs-target="#searchModal"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z"
                          ></path>
                        </svg>
                      </a>
                    </li>
                    <!-- Search -->

                    <li class="header-nav-link header-fullscreen">
                      <a
                        href="javascript:void(0);"
                        class="nav-link icon"
                        id="fullscreen-button"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M10 4H8v4H4v2h6zM8 20h2v-6H4v2h4zm12-6h-6v6h2v-4h4zm0-6h-4V4h-2v6h6z"
                          ></path>
                        </svg>
                      </a>
                    </li>
                    <!-- Fullscreen -->

                    <li class="header-nav-link">
                      <a
                        href="javascript:void(0);"
                        class="nav-link icon layout-setting light-layout"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M20.742 13.045a8.088 8.088 0 0 1-2.077.271c-2.135 0-4.14-.83-5.646-2.336a8.025 8.025 0 0 1-2.064-7.723A1 1 0 0 0 9.73 2.034a10.014 10.014 0 0 0-4.489 2.582c-3.898 3.898-3.898 10.243 0 14.143a9.937 9.937 0 0 0 7.072 2.93 9.93 9.93 0 0 0 7.07-2.929 10.007 10.007 0 0 0 2.583-4.491 1.001 1.001 0 0 0-1.224-1.224zm-2.772 4.301a7.947 7.947 0 0 1-5.656 2.343 7.953 7.953 0 0 1-5.658-2.344c-3.118-3.119-3.118-8.195 0-11.314a7.923 7.923 0 0 1 2.06-1.483 10.027 10.027 0 0 0 2.89 7.848 9.972 9.972 0 0 0 7.848 2.891 8.036 8.036 0 0 1-1.484 2.059z"
                          ></path>
                        </svg>
                      </a>
                      <a
                        href="javascript:void(0);"
                        class="nav-link icon layout-setting dark-layout"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M6.993 12c0 2.761 2.246 5.007 5.007 5.007s5.007-2.246 5.007-5.007S14.761 6.993 12 6.993 6.993 9.239 6.993 12zM12 8.993c1.658 0 3.007 1.349 3.007 3.007S13.658 15.007 12 15.007 8.993 13.658 8.993 12 10.342 8.993 12 8.993zM10.998 19h2v3h-2zm0-17h2v3h-2zm-9 9h3v2h-3zm17 0h3v2h-3zM4.219 18.363l2.12-2.122 1.415 1.414-2.12 2.122zM16.24 6.344l2.122-2.122 1.414 1.414-2.122 2.122zM6.342 7.759 4.22 5.637l1.415-1.414 2.12 2.122zm13.434 10.605-1.414 1.414-2.122-2.122 1.414-1.414z"
                          ></path>
                        </svg>
                      </a>
                    </li>
                    <!-- theme-layout -->

                    <li class="header-nav-link dropdown">
                      <a
                        href="javascript:void(0);"
                        class="nav-link icon text-center"
                        data-bs-toggle="dropdown"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M19 13.586V10c0-3.217-2.185-5.927-5.145-6.742C13.562 2.52 12.846 2 12 2s-1.562.52-1.855 1.258C7.185 4.074 5 6.783 5 10v3.586l-1.707 1.707A.996.996 0 0 0 3 16v2a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-2a.996.996 0 0 0-.293-.707L19 13.586zM19 17H5v-.586l1.707-1.707A.996.996 0 0 0 7 14v-4c0-2.757 2.243-5 5-5s5 2.243 5 5v4c0 .266.105.52.293.707L19 16.414V17zm-7 5a2.98 2.98 0 0 0 2.818-2H9.182A2.98 2.98 0 0 0 12 22z"
                          ></path>
                        </svg>
                        <span class="pulse bg-success"></span>
                      </a>
                      <div
                        class="dropdown-menu dropdown-menu-right dropdown-menu-arrow"
                      >
                        <div class="drop-heading">
                          <div class="d-flex">
                            <h5 class="mb-0 text-dark">Notifications</h5>
                            <span class="badge bg-danger ms-auto br-5">4</span>
                          </div>
                        </div>
                        <div class="dropdown-divider mt-0"></div>
                        <div class="header-dropdown-scroll1">
                          <a
                            href="emailinbox.html"
                            class="dropdown-item d-flex"
                          >
                            <div class="notifyimg bg-success-transparent">
                              <i class="fa fa-thumbs-o-up text-success"></i>
                            </div>
                            <div>
                              <strong>Someone likes our posts.</strong>
                              <div class="small text-muted">3 hours ago</div>
                            </div>
                          </a>
                          <a
                            href="emailinbox.html"
                            class="dropdown-item d-flex"
                          >
                            <div class="notifyimg bg-primary-transparent">
                              <i
                                class="fa fa-exclamation-triangle text-primary"
                              ></i>
                            </div>
                            <div>
                              <strong> Issues Fixed</strong>
                              <div class="small text-muted">30 mins ago</div>
                            </div>
                          </a>
                          <a
                            href="emailinbox.html"
                            class="dropdown-item d-flex"
                          >
                            <div class="notifyimg bg-warning-transparent">
                              <i class="fa fa-commenting-o text-warning"></i>
                            </div>
                            <div>
                              <strong> 3 New Comments</strong>
                              <div class="small text-muted">5 hour ago</div>
                            </div>
                          </a>
                          <a
                            href="emailinbox.html"
                            class="dropdown-item d-flex"
                          >
                            <div class="notifyimg bg-danger-transparent">
                              <i class="fa fa-cogs text-danger"></i>
                            </div>
                            <div>
                              <strong> Server Rebooted.</strong>
                              <div class="small text-muted">45 mintues ago</div>
                            </div>
                          </a>
                          <a
                            href="emailinbox.html"
                            class="dropdown-item d-flex"
                          >
                            <div class="notifyimg bg-info-transparent">
                              <i class="fa fa-thumbs-o-up text-info"></i>
                            </div>
                            <div>
                              <strong>Someone likes our posts.</strong>
                              <div class="small text-muted">3 hours ago</div>
                            </div>
                          </a>
                        </div>
                        <div class="dropdown-divider mb-0"></div>
                        <div class="text-center p-2">
                          <a href="emailinbox.html" class="text-dark pt-0"
                            >View All Notifications</a
                          >
                        </div>
                      </div>
                    </li>
                    <!-- Notification -->

                    <li class="header-nav-link dropdown">
                      <a
                        href="javascript:void(0);"
                        class="nav-link icon"
                        data-bs-toggle="dropdown"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M16 2H8C4.691 2 2 4.691 2 8v13a1 1 0 0 0 1 1h13c3.309 0 6-2.691 6-6V8c0-3.309-2.691-6-6-6zm4 14c0 2.206-1.794 4-4 4H4V8c0-2.206 1.794-4 4-4h8c2.206 0 4 1.794 4 4v8z"
                          ></path>
                          <path d="M7 9h10v2H7zm0 4h7v2H7z"></path>
                        </svg>
                        <span class="badge badge-secondary pulse-secondary"
                          >3</span
                        >
                      </a>
                      <div
                        class="dropdown-menu dropdown-menu-right dropdown-menu-arrow"
                      >
                        <div class="drop-heading">
                          <div class="d-flex">
                            <h5 class="mb-0 text-dark">Messages</h5>
                            <span class="badge bg-danger ms-auto br-5">3</span>
                          </div>
                        </div>
                        <div class="dropdown-divider mt-0"></div>
                        <div class="header-dropdown-scroll2">
                          <a
                            href="chat.html"
                            class="dropdown-item d-flex mt-2 pb-3"
                          >
                            <div
                              class="avatar avatar-md rounded-circle me-3 d-block cover-image"
                              data-image-src="../../assets/images/users/male/41.jpg"
                            >
                              <span class="avatar-status bg-green"></span>
                            </div>
                            <div>
                              <strong>Madeleine</strong>
                              <p class="mb-0 fs-13 text-muted">
                                Hey! there I' am available
                              </p>
                              <div class="small text-muted">3 hours ago</div>
                            </div>
                          </a>
                          <a href="chat.html" class="dropdown-item d-flex">
                            <div
                              class="avatar avatar-md rounded-circle me-3 d-block cover-image"
                              data-image-src="../../assets/images/users/female/1.jpg"
                            >
                              <span class="avatar-status bg-red"></span>
                            </div>
                            <div>
                              <strong>Anthony</strong>
                              <p class="mb-0 fs-13 text-muted">
                                New product Launching
                              </p>
                              <div class="small text-muted">5 hour ago</div>
                            </div>
                          </a>
                          <a href="chat.html" class="dropdown-item d-flex">
                            <div
                              class="avatar avatar-md rounded-circle me-3 d-block cover-image"
                              data-image-src="../../assets/images/users/female/18.jpg"
                            >
                              <span class="avatar-status bg-yellow"></span>
                            </div>
                            <div>
                              <strong>Olivia</strong>
                              <p class="mb-0 fs-13 text-muted">
                                New Schedule Realease
                              </p>
                              <div class="small text-muted">45 mintues ago</div>
                            </div>
                          </a>
                          <a href="chat.html" class="dropdown-item d-flex">
                            <div
                              class="avatar avatar-md rounded-circle me-3 d-block cover-image"
                              data-image-src="../../assets/images/users/male/32.jpg"
                            >
                              <span class="avatar-status bg-green"></span>
                            </div>
                            <div>
                              <strong>Madeleine</strong>
                              <p class="mb-0 fs-13 text-muted">
                                Hey! there I' am available
                              </p>
                              <div class="small text-muted">3 hours ago</div>
                            </div>
                          </a>
                        </div>
                        <div class="dropdown-divider mb-0"></div>
                        <div class="text-center p-2">
                          <a href="chat.html" class="text-dark pt-0"
                            >View All Messages</a
                          >
                        </div>
                      </div>
                    </li>
                    <!-- Message-box -->

                    <li class="header-nav-link dropdown">
                      <a
                        href="javascript:void(0);"
                        class="nav-link icon"
                        data-bs-toggle="dropdown"
                      >
                        <img
                          class="avatar rounded-circle"
                          src="../../assets/images/users/male/32.jpg"
                          alt="image"
                        />
                      </a>
                      <ul
                        class="dropdown-menu w-250 pt-0 dropdown-menu-arrow dropdown-menu-right"
                      >
                        <li>
                          <div class="dropdown-header mb-2 p-3 text-center">
                            <img
                              class="avatar avatar-xl rounded-circle mx-auto mb-2"
                              src="../../assets/images/users/male/32.jpg"
                              alt="image"
                            />
                            <h5 class="mb-0">Jonathan Mills</h5>
                            <p class="mb-0 fs-13 opacity-75">
                              Jonathan@gmail.com
                            </p>
                          </div>
                        </li>
                        <li>
                          <a
                            href="profile.html"
                            class="dropdown-item d-flex align-items-center"
                          >
                            <i class="ri-user-line fs-18 me-2 text-primary"></i>
                            <span>Profile</span>
                          </a>
                        </li>
                        <li>
                          <a
                            href="settings.html"
                            class="dropdown-item d-flex align-items-center"
                          >
                            <i
                              class="ri-settings-5-line fs-18 me-2 text-primary"
                            ></i>
                            <span>Settings</span>
                          </a>
                        </li>
                        <li>
                          <a
                            href="emailinbox.html"
                            class="dropdown-item d-flex align-items-center"
                          >
                            <i class="ri-mail-line fs-18 me-2 text-primary"></i>
                            <span>Inbox</span>
                            <span class="ms-auto badge bg-success">2</span>
                          </a>
                        </li>
                        <li>
                          <a
                            href="faq.html"
                            class="dropdown-item d-flex align-items-center"
                          >
                            <i
                              class="ri-question-line fs-18 me-2 text-primary"
                            ></i>
                            <span>Need help?</span>
                          </a>
                        </li>
                        <li>
                          <a
                            href="login.html"
                            class="dropdown-item d-flex align-items-center"
                          >
                            <i
                              class="ri-logout-circle-r-line fs-18 me-2 text-primary"
                            ></i>
                            <span>Sign out</span>
                          </a>
                        </li>
                      </ul>
                    </li>

                    <li class="header-nav-link sidebar-link">
                      <a
                        href="javascript:void(0);"
                        class="nav-link icon"
                        data-bs-toggle="sidebar-right"
                        data-bs-target=".sidebar-right"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path d="M4 6h16v2H4zm4 5h12v2H8zm5 5h7v2h-7z"></path>
                        </svg>
                      </a>
                    </li>
                    <!-- Right-side-toggle -->
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- END HEADER -->

        <!-- START LEFT-SIDEBAR-MENU -->
        <div class="sticky">
          <div class="app-sidebar__overlay" data-bs-toggle="sidebar"></div>
          <aside class="app-sidebar">
            <div class="app-sidebar__header">
              <a class="main-logo" href="index.html">
                <img
                  src="../../assets/images/brand/light-logo.png"
                  class="desktop-logo desktop-logo-dark"
                  alt="soliclogo"
                />
                <img
                  src="../../assets/images/brand/dark-logo.png"
                  class="desktop-logo"
                  alt="soliclogo"
                />
                <img
                  src="../../assets/images/brand/icon.png"
                  class="mobile-logo mobile-logo-dark"
                  alt="soliclogo"
                />
                <img
                  src="../../assets/images/brand/icon-2.png"
                  class="mobile-logo"
                  alt="soliclogo"
                />
              </a>
            </div>
            <div class="main-sidemenu">
              <div class="slide-left disabled" id="slide-left">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#7b8191"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M13.293 6.293 7.586 12l5.707 5.707 1.414-1.414L10.414 12l4.293-4.293z"
                  ></path>
                </svg>
              </div>
              <ul class="side-menu">
                <li class="slide">
                  <a
                    class="side-menu__item"
                    data-bs-toggle="slide"
                    href="javascript:void(0);"
                  >
                    <span class="side-menu__icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="side_menu_img"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M3 13h1v7c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-7h1a1 1 0 0 0 .707-1.707l-9-9a.999.999 0 0 0-1.414 0l-9 9A1 1 0 0 0 3 13zm7 7v-5h4v5h-4zm2-15.586 6 6V15l.001 5H16v-5c0-1.103-.897-2-2-2h-4c-1.103 0-2 .897-2 2v5H6v-9.586l6-6z"
                        ></path>
                      </svg>
                    </span>
                    <span class="side-menu__label text-truncate"
                      >Dashboard</span
                    >
                    <i class="angle fa fa-angle-right"></i>
                  </a>
                  <ul class="slide-menu">
                    <li class="panel sidetab-menu">
                      <div class="tab-menu-heading p-0 pb-2 border-0">
                        <div class="tabs-menu">
                          <ul class="nav panel-tabs">
                            <li>
                              <a
                                href="#side1"
                                class="active"
                                data-bs-toggle="tab"
                                ><i class="ri-home-5-line"></i>
                                <p>Home</p></a
                              >
                            </li>
                            <li>
                              <a href="#side2" data-bs-toggle="tab"
                                ><i class="ri-chat-2-line"></i>
                                <p>Chat</p></a
                              >
                            </li>
                          </ul>
                        </div>
                      </div>
                      <div class="panel-body tabs-menu-body p-0 border-0">
                        <div class="tab-content">
                          <div class="tab-pane active" id="side1">
                            <ul class="sidemenu-list">
                              <li class="side-menu__label1">
                                <a href="javascript:void(0)">Dashboard</a>
                              </li>
                              <li>
                                <a class="slide-item" href="index.html"
                                  >Sass Dashboard</a
                                >
                              </li>
                              <li>
                                <a class="slide-item" href="index2.html"
                                  >Manufacturing Dashboard</a
                                >
                              </li>
                              <li>
                                <a class="slide-item" href="index3.html"
                                  >Analytics Dashboard</a
                                >
                              </li>
                              <li>
                                <a class="slide-item" href="index4.html"
                                  >Retail Dashboard</a
                                >
                              </li>
                              <li>
                                <a class="slide-item" href="index5.html"
                                  >Logistics Dashboard</a
                                >
                              </li>
                            </ul>
                            <div class="menutabs-content">
                              <h5 class="my-4 px-1">Activites</h5>
                              <div class="">
                                <div class="card">
                                  <div class="card-body p-3">
                                    <div class="d-flex">
                                      <div class="pe-3">
                                        <span
                                          class="avatar avatar-md rounded-circle bg-secondary-transparent fs-14"
                                        >
                                          <i
                                            class="fa fa-dollar align-middle"
                                          ></i>
                                        </span>
                                      </div>
                                      <div class="">
                                        <span>Revenue</span>
                                        <h3 class="mb-0 fs-20">$459.2</h3>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div class="mt-3">
                                <div class="card">
                                  <div class="card-body p-3">
                                    <div class="d-flex">
                                      <div class="pe-3">
                                        <span
                                          class="avatar avatar-md rounded-circle bg-warning-transparent fs-14"
                                        >
                                          <i
                                            class="fa fa-files-o align-middle"
                                          ></i>
                                        </span>
                                      </div>
                                      <div class="">
                                        <span>Sales</span>
                                        <h3 class="mb-0 fs-20">487</h3>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div class="mt-3">
                                <div class="card">
                                  <div class="card-body p-3">
                                    <div class="d-flex">
                                      <div class="pe-3">
                                        <span
                                          class="avatar avatar-md rounded-circle bg-success-transparent fs-14"
                                        >
                                          <i
                                            class="fa fa-handshake-o align-middle"
                                          ></i>
                                        </span>
                                      </div>
                                      <div class="">
                                        <span>Deals</span>
                                        <h3 class="mb-0 fs-20">158</h3>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <h5 class="my-4 px-1">Contacts</h5>
                              <div class="card-body p-0">
                                <div class="list-group list-group-flush">
                                  <div
                                    class="list-group-item d-flex px-0 align-items-center border-bottom-0 border-top-0"
                                  >
                                    <div class="me-2">
                                      <span
                                        class="avatar rounded-circle cover-image"
                                        data-image-src="../../assets/images/users/male/28.jpg"
                                      >
                                        <span
                                          class="avatar-status bg-green"
                                        ></span>
                                      </span>
                                    </div>
                                    <div class="">
                                      <div class="fw-semibold fs-13">
                                        Mozelle
                                      </div>
                                    </div>
                                    <div class="ms-auto">
                                      <a
                                        href="javascript:void(0);"
                                        class="btn btn-sm btn-light btn-icon"
                                      >
                                        <i class="fa fa-phone fs-10"></i>
                                      </a>
                                    </div>
                                  </div>
                                  <div
                                    class="list-group-item d-flex px-0 align-items-center border-bottom-0 border-top-0"
                                  >
                                    <div class="me-2">
                                      <span
                                        class="avatar rounded-circle cover-image"
                                        data-image-src="../../assets/images/users/female/22.jpg"
                                      ></span>
                                    </div>
                                    <div class="">
                                      <div class="fw-semibold fs-13">
                                        Florinda
                                      </div>
                                    </div>
                                    <div class="ms-auto">
                                      <a
                                        href="javascript:void(0);"
                                        class="btn btn-sm btn-light btn-icon"
                                      >
                                        <i class="fa fa-phone fs-10"></i>
                                      </a>
                                    </div>
                                  </div>
                                  <div
                                    class="list-group-item d-flex px-0 align-items-center border-bottom-0 border-top-0"
                                  >
                                    <div class="me-2">
                                      <span
                                        class="avatar rounded-circle cover-image"
                                        data-image-src="../../assets/images/users/male/21.jpg"
                                      >
                                        <span
                                          class="avatar-status bg-green"
                                        ></span>
                                      </span>
                                    </div>
                                    <div class="">
                                      <div class="fw-semibold fs-13">
                                        lina Bernie
                                      </div>
                                    </div>
                                    <div class="ms-auto">
                                      <a
                                        href="javascript:void(0);"
                                        class="btn btn-sm btn-light btn-icon"
                                      >
                                        <i class="fa fa-phone fs-10"></i>
                                      </a>
                                    </div>
                                  </div>
                                  <div
                                    class="list-group-item d-flex px-0 align-items-center border-bottom-0 border-top-0"
                                  >
                                    <div class="me-2">
                                      <span
                                        class="avatar rounded-circle cover-image"
                                        data-image-src="../../assets/images/users/female/31.jpg"
                                      >
                                        <span
                                          class="avatar-status bg-green"
                                        ></span>
                                      </span>
                                    </div>
                                    <div class="">
                                      <div class="fw-semibold fs-13">
                                        Mclaughin
                                      </div>
                                    </div>
                                    <div class="ms-auto">
                                      <a
                                        href="javascript:void(0);"
                                        class="btn btn-sm btn-light btn-icon"
                                      >
                                        <i class="fa fa-phone fs-10"></i>
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <h5 class="my-4 px-1">Followers</h5>
                              <div class="">
                                <span
                                  class="avatar rounded-circle avatar-md cover-image m-1"
                                  data-image-src="../../assets/images/users/male/32.jpg"
                                >
                                  <span class="avatar-status bg-green"></span>
                                </span>
                                <span
                                  class="avatar rounded-circle avatar-md cover-image m-1"
                                  data-image-src="../../assets/images/users/male/5.jpg"
                                >
                                  <span class="avatar-status bg-green"></span>
                                </span>
                                <span
                                  class="avatar rounded-circle avatar-md cover-image m-1"
                                  data-image-src="../../assets/images/users/female/2.jpg"
                                >
                                  <span class="avatar-status bg-warning"></span>
                                </span>
                                <span
                                  class="avatar rounded-circle avatar-md cover-image m-1"
                                  data-image-src="../../assets/images/users/male/31.jpg"
                                >
                                  <span class="avatar-status bg-green"></span>
                                </span>
                                <span
                                  class="avatar rounded-circle avatar-md cover-image m-1"
                                  data-image-src="../../assets/images/users/female/32.jpg"
                                >
                                  <span class="avatar-status bg-warning"></span>
                                </span>
                                <a href="javascript:void(0);">
                                  <span
                                    class="avatar rounded-circle avatar-md cover-image m-1 bg-success"
                                    >+34</span
                                  >
                                </a>
                              </div>
                            </div>
                          </div>
                          <div class="tab-pane" id="side2">
                            <h5 class="my-4 px-1">Chat</h5>
                            <div class="input-group mb-4">
                              <input
                                type="text"
                                class="form-control"
                                placeholder="Search ..."
                              />
                              <button
                                class="btn btn-secondary btn-sm"
                                type="button"
                              >
                                Search
                              </button>
                            </div>
                            <ul class="list-group list-group-flush">
                              <li
                                class="list-group-item d-flex align-items-start p-2 border-0"
                              >
                                <div class="me-3 mt-1">
                                  <span
                                    class="avatar avatar-md rounded-circle cover-image"
                                    data-image-src="../../assets/images/users/male/32.jpg"
                                  >
                                    <span class="avatar-status bg-green"></span>
                                  </span>
                                </div>
                                <div>
                                  <div>
                                    <strong>Madeleine</strong> Hey! there I' am
                                    available....
                                  </div>
                                  <div class="small text-muted">
                                    3 hours ago
                                  </div>
                                </div>
                              </li>
                              <li
                                class="list-group-item d-flex align-items-start p-2 border-0"
                              >
                                <div class="me-3 mt-1">
                                  <span
                                    class="avatar avatar-md rounded-circle cover-image"
                                    data-image-src="../../assets/images/users/male/23.jpg"
                                  ></span>
                                </div>
                                <div>
                                  <div>
                                    <strong>Anthony</strong> New product
                                    Launching...
                                  </div>
                                  <div class="small text-muted">5 hour ago</div>
                                </div>
                              </li>
                              <li
                                class="list-group-item d-flex align-items-start p-2 border-0"
                              >
                                <div class="me-3 mt-1">
                                  <span
                                    class="avatar avatar-md rounded-circle cover-image"
                                    data-image-src="../../assets/images/users/female/2.jpg"
                                  >
                                    <span class="avatar-status bg-green"></span>
                                  </span>
                                </div>
                                <div>
                                  <div>
                                    <strong>Olivia</strong> New Schedule
                                    Realease......
                                  </div>
                                  <div class="small text-muted">
                                    45 mintues ago
                                  </div>
                                </div>
                              </li>
                              <li
                                class="list-group-item d-flex align-items-start p-2 border-0"
                              >
                                <div class="me-3 mt-1">
                                  <span
                                    class="avatar avatar-md rounded-circle cover-image"
                                    data-image-src="../../assets/images/users/male/21.jpg"
                                  >
                                    <span class="avatar-status bg-green"></span>
                                  </span>
                                </div>
                                <div>
                                  <div>
                                    <strong>Madeleine</strong> Hey! there I' am
                                    available....
                                  </div>
                                  <div class="small text-muted">
                                    3 hours ago
                                  </div>
                                </div>
                              </li>
                              <li
                                class="list-group-item d-flex align-items-start p-2 border-0"
                              >
                                <div class="me-3 mt-1">
                                  <span
                                    class="avatar avatar-md rounded-circle cover-image"
                                    data-image-src="../../assets/images/users/female/32.jpg"
                                  ></span>
                                </div>
                                <div>
                                  <div>
                                    <strong>Anthony</strong> New product
                                    Launching...
                                  </div>
                                  <div class="small text-muted">5 hour ago</div>
                                </div>
                              </li>
                              <li
                                class="list-group-item d-flex align-items-start p-2 border-0"
                              >
                                <div class="me-3 mt-1">
                                  <span
                                    class="avatar avatar-md rounded-circle cover-image"
                                    data-image-src="../../assets/images/users/male/28.jpg"
                                  >
                                    <span class="avatar-status bg-green"></span>
                                  </span>
                                </div>
                                <div>
                                  <div>
                                    <strong>Lily May</strong> New Schedule
                                    Realease......
                                  </div>
                                  <div class="small text-muted">
                                    45 mintues ago
                                  </div>
                                </div>
                              </li>
                              <li
                                class="list-group-item d-flex align-items-start p-2 border-0"
                              >
                                <div class="me-3 mt-1">
                                  <span
                                    class="avatar avatar-md rounded-circle cover-image"
                                    data-image-src="../../assets/images/users/female/22.jpg"
                                  >
                                    <span class="avatar-status bg-green"></span>
                                  </span>
                                </div>
                                <div>
                                  <div>
                                    <strong>Eric Walsh</strong> Okay...I will be
                                    waiting for you
                                  </div>
                                  <div class="small text-muted">
                                    12 mintues ago
                                  </div>
                                </div>
                              </li>
                              <li
                                class="list-group-item d-flex align-items-start p-2 border-0"
                              >
                                <div class="me-3 mt-1">
                                  <span
                                    class="avatar avatar-md rounded-circle cover-image"
                                    data-image-src="../../assets/images/users/female/3.jpg"
                                  ></span>
                                </div>
                                <div>
                                  <div>
                                    <strong>Alison White</strong> Hi we can
                                    explain our new project......
                                  </div>
                                  <div class="small text-muted">
                                    45 mintues ago
                                  </div>
                                </div>
                              </li>
                              <li
                                class="list-group-item d-flex align-items-start p-2 border-0"
                              >
                                <div class="me-3 mt-1">
                                  <span
                                    class="avatar avatar-md rounded-circle cover-image"
                                    data-image-src="../../assets/images/users/male/5.jpg"
                                  >
                                    <span class="avatar-status bg-green"></span>
                                  </span>
                                </div>
                                <div>
                                  <div>
                                    <strong>Jacob Lewis</strong> New product
                                    Launching...
                                  </div>
                                  <div class="small text-muted">
                                    45 mintues ago
                                  </div>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </li>

                <!-- Farm Management -->
                <li class="sub-category">
                  <h3>Farm Management</h3>
                </li>
                <!-- Farm -->
                <li class="slide">
                  <a
                    class="side-menu__item"
                    data-bs-toggle="slide"
                    href="javascript:void(0);"
                  >
                    <span class="side-menu__icon">
                      <i class="fa fa-leaf"></i>
                    </span>
                    <span class="side-menu__label text-truncate">Farm</span
                    ><i class="angle fa fa-angle-right"></i>
                  </a>
                  <ul class="slide-menu">
                    <li class="panel sidetab-menu">
                      <div class="panel-body tabs-menu-body p-0 border-0">
                        <div class="tab-content">
                          <div class="tab-pane active" id="side3">
                            <ul class="sidemenu-list">
                              <li>
                                <a href="add-farm.html" class="slide-item"
                                  >Add Farm</a
                                >
                              </li>
                              <li>
                                <a href="farm-list.html" class="slide-item"
                                  >Farm List</a
                                >
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </li>
                <!-- Block -->
                <li class="slide">
                  <a
                    class="side-menu__item"
                    data-bs-toggle="slide"
                    href="javascript:void(0);"
                  >
                    <span class="side-menu__icon">
                      <i class="fa fa-map"></i>
                    </span>
                    <span class="side-menu__label text-truncate">Blocks</span
                    ><i class="angle fa fa-angle-right"></i>
                  </a>
                  <ul class="slide-menu">
                    <li class="panel sidetab-menu">
                      <div class="panel-body tabs-menu-body p-0 border-0">
                        <div class="tab-content">
                          <div class="tab-pane active" id="side3">
                            <ul class="sidemenu-list">
                              <li>
                                <a href="add-block.html" class="slide-item"
                                  >Add Block</a
                                >
                              </li>
                              <li>
                                <a href="block-list.html" class="slide-item"
                                  >Block List</a
                                >
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </li>
                <!-- Parcel -->
                <li class="slide">
                  <a
                    class="side-menu__item"
                    data-bs-toggle="slide"
                    href="javascript:void(0);"
                  >
                    <span class="side-menu__icon">
                      <i class="fa fa-cube"></i>
                    </span>
                    <span class="side-menu__label text-truncate">Parcels</span
                    ><i class="angle fa fa-angle-right"></i>
                  </a>
                  <ul class="slide-menu">
                    <li class="panel sidetab-menu">
                      <div class="panel-body tabs-menu-body p-0 border-0">
                        <div class="tab-content">
                          <div class="tab-pane active" id="side3">
                            <ul class="sidemenu-list">
                              <li>
                                <a href="add-parcel.html" class="slide-item"
                                  >Add Parcel</a
                                >
                              </li>
                              <li>
                                <a href="parcel-list.html" class="slide-item"
                                  >Parcel List</a
                                >
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </li>
                <!-- Orchards -->
                <li class="slide">
                  <a
                    class="side-menu__item"
                    data-bs-toggle="slide"
                    href="javascript:void(0);"
                  >
                    <span class="side-menu__icon">
                      <i class="fa fa-tree"></i>
                    </span>
                    <span class="side-menu__label text-truncate">Orchards</span
                    ><i class="angle fa fa-angle-right"></i>
                  </a>
                  <ul class="slide-menu">
                    <li class="panel sidetab-menu">
                      <div class="panel-body tabs-menu-body p-0 border-0">
                        <div class="tab-content">
                          <div class="tab-pane active" id="side3">
                            <ul class="sidemenu-list">
                              <li>
                                <a href="add-orchard.html" class="slide-item"
                                  >Add Orchard</a
                                >
                              </li>
                              <li>
                                <a href="orchard-list.html" class="slide-item"
                                  >Orchard List</a
                                >
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </li>

                <!-- Cattle Management -->
                <li class="sub-category">
                  <h3>Cattle Management</h3>
                </li>
                <!-- Cows -->
                <li class="slide">
                  <a
                    class="side-menu__item"
                    data-bs-toggle="slide"
                    href="javascript:void(0);"
                  >
                    <span class="side-menu__icon">
                      <i class="fa fa-cow">🐄</i>
                    </span>
                    <span class="side-menu__label text-truncate">Cows</span
                    ><i class="angle fa fa-angle-right"></i>
                  </a>
                  <ul class="slide-menu">
                    <li class="panel sidetab-menu">
                      <div class="panel-body tabs-menu-body p-0 border-0">
                        <div class="tab-content">
                          <div class="tab-pane active" id="side3">
                            <ul class="sidemenu-list">
                              <li>
                                <a href="add-cow.html" class="slide-item"
                                  >Add Cow</a
                                >
                              </li>
                              <li>
                                <a href="cow-list.html" class="slide-item"
                                  >Cow List</a
                                >
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </li>
                <!-- Cow Activities -->
                <li class="slide">
                  <a
                    class="side-menu__item"
                    data-bs-toggle="slide"
                    href="javascript:void(0);"
                  >
                    <span class="side-menu__icon">
                      <i class="fa fa-calendar"></i>
                    </span>
                    <span class="side-menu__label text-truncate"
                      >Cow Activities</span
                    ><i class="angle fa fa-angle-right"></i>
                  </a>
                  <ul class="slide-menu">
                    <li class="panel sidetab-menu">
                      <div class="panel-body tabs-menu-body p-0 border-0">
                        <div class="tab-content">
                          <div class="tab-pane active" id="side3">
                            <ul class="sidemenu-list">
                              <li>
                                <a
                                  href="add-cow-activity.html"
                                  class="slide-item"
                                  >Add Cow Activity</a
                                >
                              </li>
                              <li>
                                <a
                                  href="cow-activity-list.html"
                                  class="slide-item"
                                  >Cow Activity List</a
                                >
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </li>
                <!-- Pasture -->
                <li class="slide">
                  <a
                    class="side-menu__item"
                    data-bs-toggle="slide"
                    href="javascript:void(0);"
                  >
                    <span class="side-menu__icon">
                      <i class="fa fa-map-o"></i>
                    </span>
                    <span class="side-menu__label text-truncate">Pastures</span
                    ><i class="angle fa fa-angle-right"></i>
                  </a>
                  <ul class="slide-menu">
                    <li class="panel sidetab-menu">
                      <div class="panel-body tabs-menu-body p-0 border-0">
                        <div class="tab-content">
                          <div class="tab-pane active" id="side3">
                            <ul class="sidemenu-list">
                              <li>
                                <a href="add-pasture.html" class="slide-item"
                                  >Add Pasture</a
                                >
                              </li>
                              <li>
                                <a href="pasture-list.html" class="slide-item"
                                  >Pasture List</a
                                >
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </li>
                <!-- Cows for Sale -->
                <li class="slide">
                  <a
                    class="side-menu__item"
                    data-bs-toggle="slide"
                    href="javascript:void(0);"
                  >
                    <span class="side-menu__icon">
                      <i class="fa fa-money"></i>
                    </span>
                    <span class="side-menu__label text-truncate"
                      >Cows for Sale</span
                    ><i class="angle fa fa-angle-right"></i>
                  </a>
                  <ul class="slide-menu">
                    <li class="panel sidetab-menu">
                      <div class="panel-body tabs-menu-body p-0 border-0">
                        <div class="tab-content">
                          <div class="tab-pane active" id="side3">
                            <ul class="sidemenu-list">
                              <li>
                                <a
                                  href="add-cow-for-sale.html"
                                  class="slide-item"
                                  >Add Cow for Sale</a
                                >
                              </li>
                              <li>
                                <a
                                  href="cow-for-sale-list.html"
                                  class="slide-item"
                                  >Cow for Sale List</a
                                >
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </li>

                <!-- Milk Production -->
                <li class="sub-category">
                  <h3>Milk Production</h3>
                </li>
                <!-- Milk Record -->
                <li class="slide">
                  <a
                    class="side-menu__item"
                    data-bs-toggle="slide"
                    href="javascript:void(0);"
                  >
                    <span class="side-menu__icon">
                      <i class="fa fa-bitbucket"></i>
                    </span>
                    <span class="side-menu__label text-truncate"
                      >Milk Record</span
                    ><i class="angle fa fa-angle-right"></i>
                  </a>
                  <ul class="slide-menu">
                    <li class="panel sidetab-menu">
                      <div class="panel-body tabs-menu-body p-0 border-0">
                        <div class="tab-content">
                          <div class="tab-pane active" id="side3">
                            <ul class="sidemenu-list">
                              <li>
                                <a href="add-milkdaily.html" class="slide-item"
                                  >Add Daily Record</a
                                >
                              </li>
                              <li>
                                <a href="milkdaily.html" class="slide-item"
                                  >Milk Record List</a
                                >
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </li>

                <!-- Product Management -->
                <li class="sub-category">
                  <h3>Product Management</h3>
                </li>
                <!-- Category -->
                <li class="slide">
                  <a
                    class="side-menu__item"
                    data-bs-toggle="slide"
                    href="javascript:void(0);"
                  >
                    <span class="side-menu__icon">
                      <i class="fa fa-tags"></i>
                    </span>
                    <span class="side-menu__label text-truncate">Category</span
                    ><i class="angle fa fa-angle-right"></i>
                  </a>
                  <ul class="slide-menu">
                    <li class="panel sidetab-menu">
                      <div class="panel-body tabs-menu-body p-0 border-0">
                        <div class="tab-content">
                          <div class="tab-pane active" id="side3">
                            <ul class="sidemenu-list">
                              <li>
                                <a href="add-farm.html" class="slide-item"
                                  >Add Category</a
                                >
                              </li>
                              <li>
                                <a href="add-farm.html" class="slide-item"
                                  >Category List</a
                                >
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </li>
                <!-- Product -->
                <li class="slide">
                  <a
                    class="side-menu__item"
                    data-bs-toggle="slide"
                    href="javascript:void(0);"
                  >
                    <span class="side-menu__icon">
                      <i class="fa fa-cubes"></i>
                    </span>
                    <span class="side-menu__label text-truncate">Product</span
                    ><i class="angle fa fa-angle-right"></i>
                  </a>
                  <ul class="slide-menu">
                    <li class="panel sidetab-menu">
                      <div class="panel-body tabs-menu-body p-0 border-0">
                        <div class="tab-content">
                          <div class="tab-pane active" id="side3">
                            <ul class="sidemenu-list">
                              <li>
                                <a href="add-farm.html" class="slide-item"
                                  >Add Product</a
                                >
                              </li>
                              <li>
                                <a href="add-farm.html" class="slide-item"
                                  >Product List</a
                                >
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </li>

                <!-- Employee Management -->
                <li class="sub-category">
                  <h3>Employee Management</h3>
                </li>
                <!-- Employees -->
                <li class="slide">
                  <a
                    class="side-menu__item"
                    data-bs-toggle="slide"
                    href="javascript:void(0);"
                  >
                    <span class="side-menu__icon">
                      <i class="fa fa-users"></i>
                    </span>
                    <span class="side-menu__label text-truncate">Employees</span
                    ><i class="angle fa fa-angle-right"></i>
                  </a>
                  <ul class="slide-menu">
                    <li class="panel sidetab-menu">
                      <div class="panel-body tabs-menu-body p-0 border-0">
                        <div class="tab-content">
                          <div class="tab-pane active" id="side3">
                            <ul class="sidemenu-list">
                              <li>
                                <a href="add-farm.html" class="slide-item"
                                  >Add Employee</a
                                >
                              </li>
                              <li>
                                <a href="add-farm.html" class="slide-item"
                                  >Employee List</a
                                >
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </li>
                <!-- Block Assignments -->
                <li class="slide">
                  <a
                    class="side-menu__item"
                    data-bs-toggle="slide"
                    href="javascript:void(0);"
                  >
                    <span class="side-menu__icon">
                      <i class="fa fa-th-large"></i>
                    </span>
                    <span class="side-menu__label text-truncate"
                      >Block Assignments</span
                    ><i class="angle fa fa-angle-right"></i>
                  </a>
                  <ul class="slide-menu">
                    <li class="panel sidetab-menu">
                      <div class="panel-body tabs-menu-body p-0 border-0">
                        <div class="tab-content">
                          <div class="tab-pane active" id="side3">
                            <ul class="sidemenu-list">
                              <li>
                                <a href="add-farm.html" class="slide-item"
                                  >Add Block Assignment</a
                                >
                              </li>
                              <li>
                                <a href="add-farm.html" class="slide-item"
                                  >Block Assignment List</a
                                >
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </li>
                <!-- Employee Logs -->
                <li class="slide">
                  <a
                    class="side-menu__item"
                    data-bs-toggle="slide"
                    href="javascript:void(0);"
                  >
                    <span class="side-menu__icon">
                      <i class="fa fa-file"></i>
                    </span>
                    <span class="side-menu__label text-truncate"
                      >Employee Logs</span
                    ><i class="angle fa fa-angle-right"></i>
                  </a>
                  <ul class="slide-menu">
                    <li class="panel sidetab-menu">
                      <div class="panel-body tabs-menu-body p-0 border-0">
                        <div class="tab-content">
                          <div class="tab-pane active" id="side3">
                            <ul class="sidemenu-list">
                              <li>
                                <a href="add-farm.html" class="slide-item"
                                  >Employee Log Entry</a
                                >
                              </li>
                              <li>
                                <a href="add-farm.html" class="slide-item"
                                  >View Employee Logs</a
                                >
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </li>

                <!-- Farm Activities -->
                <li class="sub-category">
                  <h3>Farm Activities</h3>
                </li>
                <!-- Daily Activities -->
                <li class="slide">
                  <a
                    class="side-menu__item"
                    data-bs-toggle="slide"
                    href="javascript:void(0);"
                  >
                    <span class="side-menu__icon">
                      <i class="fa fa-tasks"></i>
                    </span>
                    <span class="side-menu__label text-truncate"
                      >Daily Activities</span
                    ><i class="angle fa fa-angle-right"></i>
                  </a>
                  <ul class="slide-menu">
                    <li class="panel sidetab-menu">
                      <div class="panel-body tabs-menu-body p-0 border-0">
                        <div class="tab-content">
                          <div class="tab-pane active" id="side3">
                            <ul class="sidemenu-list">
                              <li>
                                <a href="add-farm.html" class="slide-item"
                                  >Add Daily Activity</a
                                >
                              </li>
                              <li>
                                <a href="add-farm.html" class="slide-item"
                                  >Daily Activity List</a
                                >
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </li>
                <!-- Manure Records -->
                <li class="slide">
                  <a
                    class="side-menu__item"
                    data-bs-toggle="slide"
                    href="javascript:void(0);"
                  >
                    <span class="side-menu__icon">
                      <i class="fa fa-circle"></i>
                    </span>
                    <span class="side-menu__label text-truncate"
                      >Manure Records</span
                    ><i class="angle fa fa-angle-right"></i>
                  </a>
                  <ul class="slide-menu">
                    <li class="panel sidetab-menu">
                      <div class="panel-body tabs-menu-body p-0 border-0">
                        <div class="tab-content">
                          <div class="tab-pane active" id="side3">
                            <ul class="sidemenu-list">
                              <li>
                                <a href="add-farm.html" class="slide-item"
                                  >Add Manure Record</a
                                >
                              </li>
                              <li>
                                <a href="add-farm.html" class="slide-item"
                                  >Manure Record List</a
                                >
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </li>

                <!-- Sales Management -->
                <li class="sub-category">
                  <h3>Sales Management</h3>
                </li>
                <!-- Daily Activities -->
                <li class="slide">
                  <a
                    class="side-menu__item"
                    data-bs-toggle="slide"
                    href="javascript:void(0);"
                  >
                    <span class="side-menu__icon">
                      <i class="fa fa-dollar"></i>
                    </span>
                    <span class="side-menu__label text-truncate"
                      >Cattle Sales</span
                    ><i class="angle fa fa-angle-right"></i>
                  </a>
                  <ul class="slide-menu">
                    <li class="panel sidetab-menu">
                      <div class="panel-body tabs-menu-body p-0 border-0">
                        <div class="tab-content">
                          <div class="tab-pane active" id="side3">
                            <ul class="sidemenu-list">
                              <li>
                                <a href="add-farm.html" class="slide-item"
                                  >Add Cattle Sale</a
                                >
                              </li>
                              <li>
                                <a href="add-farm.html" class="slide-item"
                                  >Cattle Sale List</a
                                >
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </li>
                <!-- Manure Records -->
                <li class="slide">
                  <a
                    class="side-menu__item"
                    data-bs-toggle="slide"
                    href="javascript:void(0);"
                  >
                    <span class="side-menu__icon">
                      <i class="fa fa-cart-arrow-down"></i>
                    </span>
                    <span class="side-menu__label text-truncate"
                      >Product Sales</span
                    ><i class="angle fa fa-angle-right"></i>
                  </a>
                  <ul class="slide-menu">
                    <li class="panel sidetab-menu">
                      <div class="panel-body tabs-menu-body p-0 border-0">
                        <div class="tab-content">
                          <div class="tab-pane active" id="side3">
                            <ul class="sidemenu-list">
                              <li>
                                <a href="add-farm.html" class="slide-item"
                                  >Add Product Sale</a
                                >
                              </li>
                              <li>
                                <a href="add-farm.html" class="slide-item"
                                  >Product Sale List</a
                                >
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </li>
              </ul>
              <div class="slide-right" id="slide-right">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#7b8191"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M10.707 17.707 16.414 12l-5.707-5.707-1.414 1.414L13.586 12l-4.293 4.293z"
                  ></path>
                </svg>
              </div>
            </div>
          </aside>
        </div>
        <!-- END LEFT-SIDEBAR-MENU -->
      </div>

      <!-- START APP-CONTENT -->
      <div class="main-content app-content">
        <!-- START PAGE-HEADER -->
        <div class="page-header main-container container-fluid px-5">
          <h4 class="page-title">Dashboard</h4>
        </div>
        <!-- END PAGE-HEADER -->

        <!-- START MAIN-CONTAINER -->
        <div class="main-container container-fluid">
          <!-- content -->
          <router-view />
        </div>
        <!-- END MAIN-CONTAINER -->
      </div>
      <!-- END APP-CONTENT -->
    </div>

    <!-- START SIDEBAR-RIGHT -->
    <div class="sidebar sidebar-right sidebar-animate">
      <div class="p-4">
        <a
          href="#"
          class="float-end sidebar-close"
          data-bs-toggle="sidebar-right"
          data-bs-target=".sidebar-right"
          ><i class="fe fe-x"></i
        ></a>
      </div>
      <div class="tab-menu-heading siderbar-tabs border-0">
        <div class="tabs-menu">
          <!-- Tabs -->
          <ul class="nav panel-tabs">
            <li class="">
              <a href="#tab1" data-bs-toggle="tab" class="active show"
                >Friends</a
              >
            </li>
            <li>
              <a href="#tab2" data-bs-toggle="tab" class="">Activity</a>
            </li>
            <li><a href="#tab3" data-bs-toggle="tab" class="">Todo</a></li>
          </ul>
        </div>
      </div>
      <div class="panel-body tabs-menu-body side-tab-body p-0 border-0">
        <div class="tab-content border-top">
          <div class="tab-pane active" id="tab1">
            <div class="chat">
              <div class="contacts_card">
                <div class="input-group p-3">
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Search ..."
                  />
                  <button class="btn btn-secondary btn-sm" type="button">
                    Search
                  </button>
                </div>
                <div class="contacts mb-0">
                  <ul class="list-group list-group-flush">
                    <li
                      class="list-group-item d-flex align-items-center border-0"
                    >
                      <div class="me-2">
                        <span
                          class="avatar rounded-circle avatar-md cover-image"
                          data-image-src="../../assets/images/users/female/1.jpg"
                          ><span class="avatar-status bg-green"></span
                        ></span>
                      </div>
                      <div>
                        <div class="fw-semibold">Darlena Torian</div>
                      </div>
                      <div class="ms-auto btn-list">
                        <button type="button" class="btn btn-sm btn-info-light">
                          <i class="fa fa-comment fs-10"></i>
                        </button>
                        <button
                          type="button"
                          class="btn btn-sm btn-danger-light"
                        >
                          <i class="fa fa-phone fs-10"></i>
                        </button>
                      </div>
                    </li>
                    <li
                      class="list-group-item d-flex align-items-center border-0"
                    >
                      <div class="me-2">
                        <span
                          class="avatar rounded-circle avatar-md cover-image"
                          data-image-src="../../assets/images/users/male/2.jpg"
                          style="
                            background: url('../../assets/images/users/male/2.jpg')
                              center center;
                          "
                        ></span>
                      </div>
                      <div class="">
                        <div class="fw-semibold">Richie Verrill</div>
                      </div>
                      <div class="ms-auto btn-list">
                        <button type="button" class="btn btn-sm btn-info-light">
                          <i class="fa fa-comment fs-10"></i>
                        </button>
                        <button
                          type="button"
                          class="btn btn-sm btn-danger-light"
                        >
                          <i class="fa fa-phone fs-10"></i>
                        </button>
                      </div>
                    </li>
                    <li
                      class="list-group-item d-flex align-items-center border-0"
                    >
                      <div class="me-2">
                        <span
                          class="avatar rounded-circle avatar-md cover-image"
                          data-image-src="../../assets/images/users/female/3.jpg"
                          style="
                            background: url('../../assets/images/users/female/3.jpg')
                              center center;
                          "
                          ><span class="avatar-status bg-green"></span
                        ></span>
                      </div>
                      <div class="">
                        <div class="fw-semibold">Cheree Morgan</div>
                      </div>
                      <div class="ms-auto btn-list">
                        <button type="button" class="btn btn-sm btn-info-light">
                          <i class="fa fa-comment fs-10"></i>
                        </button>
                        <button
                          type="button"
                          class="btn btn-sm btn-danger-light"
                        >
                          <i class="fa fa-phone fs-10"></i>
                        </button>
                      </div>
                    </li>
                    <li
                      class="list-group-item d-flex align-items-center border-0"
                    >
                      <div class="me-2">
                        <span
                          class="avatar rounded-circle avatar-md cover-image"
                          data-image-src="../../assets/images/users/female/4.jpg"
                          style="
                            background: url('../../assets/images/users/female/4.jpg')
                              center center;
                          "
                          ><span class="avatar-status bg-green"></span
                        ></span>
                      </div>
                      <div class="">
                        <div class="fw-semibold">Katerine Coit</div>
                      </div>
                      <div class="ms-auto btn-list">
                        <button type="button" class="btn btn-sm btn-info-light">
                          <i class="fa fa-comment fs-10"></i>
                        </button>
                        <button
                          type="button"
                          class="btn btn-sm btn-danger-light"
                        >
                          <i class="fa fa-phone fs-10"></i>
                        </button>
                      </div>
                    </li>
                    <li
                      class="list-group-item d-flex align-items-center border-0"
                    >
                      <div class="me-2">
                        <span
                          class="avatar rounded-circle avatar-md cover-image"
                          data-image-src="../../assets/images/users/male/5.jpg"
                          style="
                            background: url('../../assets/images/users/male/5.jpg')
                              center center;
                          "
                          ><span class="avatar-status bg-green"></span
                        ></span>
                      </div>
                      <div class="">
                        <div class="fw-semibold">Hai Indelicato</div>
                      </div>
                      <div class="ms-auto btn-list">
                        <button type="button" class="btn btn-sm btn-info-light">
                          <i class="fa fa-comment fs-10"></i>
                        </button>
                        <button
                          type="button"
                          class="btn btn-sm btn-danger-light"
                        >
                          <i class="fa fa-phone fs-10"></i>
                        </button>
                      </div>
                    </li>
                    <li
                      class="list-group-item d-flex align-items-center border-0"
                    >
                      <div class="me-2">
                        <span
                          class="avatar rounded-circle avatar-md cover-image"
                          data-image-src="../../assets/images/users/female/6.jpg"
                          style="
                            background: url('../../assets/images/users/female/6.jpg')
                              center center;
                          "
                        ></span>
                      </div>
                      <div class="">
                        <div class="fw-semibold">Cecilia Kerfoot</div>
                      </div>
                      <div class="ms-auto btn-list">
                        <button type="button" class="btn btn-sm btn-info-light">
                          <i class="fa fa-comment fs-10"></i>
                        </button>
                        <button
                          type="button"
                          class="btn btn-sm btn-danger-light"
                        >
                          <i class="fa fa-phone fs-10"></i>
                        </button>
                      </div>
                    </li>
                    <li
                      class="list-group-item d-flex align-items-center border-0"
                    >
                      <div class="me-2">
                        <span
                          class="avatar rounded-circle avatar-md cover-image"
                          data-image-src="../../assets/images/users/male/7.jpg"
                          style="
                            background: url('../../assets/images/users/male/7.jpg')
                              center center;
                          "
                          ><span class="avatar-status bg-green"></span
                        ></span>
                      </div>
                      <div class="">
                        <div class="fw-semibold">Ronald Zirbel</div>
                      </div>
                      <div class="ms-auto btn-list">
                        <button type="button" class="btn btn-sm btn-info-light">
                          <i class="fa fa-comment fs-10"></i>
                        </button>
                        <button
                          type="button"
                          class="btn btn-sm btn-danger-light"
                        >
                          <i class="fa fa-phone fs-10"></i>
                        </button>
                      </div>
                    </li>
                    <li
                      class="list-group-item d-flex align-items-center border-0"
                    >
                      <div class="me-2">
                        <span
                          class="avatar rounded-circle avatar-md cover-image"
                          data-image-src="../../assets/images/users/male/8.jpg"
                          style="
                            background: url('../../assets/images/users/male/8.jpg')
                              center center;
                          "
                          ><span class="avatar-status bg-green"></span
                        ></span>
                      </div>
                      <div class="">
                        <div class="fw-semibold">Darren Niemann</div>
                      </div>
                      <div class="ms-auto btn-list">
                        <button type="button" class="btn btn-sm btn-info-light">
                          <i class="fa fa-comment fs-10"></i>
                        </button>
                        <button
                          type="button"
                          class="btn btn-sm btn-danger-light"
                        >
                          <i class="fa fa-phone fs-10"></i>
                        </button>
                      </div>
                    </li>
                    <li
                      class="list-group-item d-flex align-items-center border-0"
                    >
                      <div class="me-2">
                        <span
                          class="avatar rounded-circle avatar-md cover-image"
                          data-image-src="../../assets/images/users/female/9.jpg"
                          style="
                            background: url('../../assets/images/users/female/9.jpg')
                              center center;
                          "
                          ><span class="avatar-status bg-green"></span
                        ></span>
                      </div>
                      <div class="">
                        <div class="fw-semibold">Sibyl Cogley</div>
                      </div>
                      <div class="ms-auto btn-list">
                        <button type="button" class="btn btn-sm btn-info-light">
                          <i class="fa fa-comment fs-10"></i>
                        </button>
                        <button
                          type="button"
                          class="btn btn-sm btn-danger-light"
                        >
                          <i class="fa fa-phone fs-10"></i>
                        </button>
                      </div>
                    </li>
                    <li
                      class="list-group-item d-flex align-items-center border-0"
                    >
                      <div class="me-2">
                        <span
                          class="avatar rounded-circle avatar-md cover-image"
                          data-image-src="../../assets/images/users/male/10.jpg"
                          style="
                            background: url('../../assets/images/users/male/10.jpg')
                              center center;
                          "
                        ></span>
                      </div>
                      <div class="">
                        <div class="fw-semibold">Jess Hildebrandt</div>
                      </div>
                      <div class="ms-auto btn-list">
                        <button type="button" class="btn btn-sm btn-info-light">
                          <i class="fa fa-comment fs-10"></i>
                        </button>
                        <button
                          type="button"
                          class="btn btn-sm btn-danger-light"
                        >
                          <i class="fa fa-phone fs-10"></i>
                        </button>
                      </div>
                    </li>
                    <li
                      class="list-group-item d-flex align-items-center border-0"
                    >
                      <div class="me-2">
                        <span
                          class="avatar rounded-circle avatar-md cover-image"
                          data-image-src="../../assets/images/users/female/11.jpg"
                          style="
                            background: url('../../assets/images/users/female/11.jpg')
                              center center;
                          "
                          ><span class="avatar-status bg-green"></span
                        ></span>
                      </div>
                      <div class="">
                        <div class="fw-semibold">Wanita Sheppard</div>
                      </div>
                      <div class="ms-auto btn-list">
                        <button type="button" class="btn btn-sm btn-info-light">
                          <i class="fa fa-comment fs-10"></i>
                        </button>
                        <button
                          type="button"
                          class="btn btn-sm btn-danger-light"
                        >
                          <i class="fa fa-phone fs-10"></i>
                        </button>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div class="tab-pane" id="tab2">
            <ul class="list-group list-group-flush">
              <li class="list-group-item d-flex align-items-start border-top-0">
                <div class="">
                  <span class="avatar bg-primary rounded-circle avatar-md"
                    >CH</span
                  >
                </div>
                <div class="wrapper w-100 ms-3">
                  <p class="mb-0 d-flex">
                    <b>New Websites is Created</b>
                  </p>
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div class="d-flex align-items-center">
                      <i class="mdi mdi-clock text-muted me-1 lh-1"></i>
                      <small class="text-muted ms-auto">30 mins ago</small>
                      <p class="mb-0"></p>
                    </div>
                  </div>
                </div>
              </li>
              <li class="list-group-item d-flex align-items-start">
                <div class="">
                  <span class="avatar bg-danger rounded-circle avatar-md"
                    >N</span
                  >
                </div>
                <div class="wrapper w-100 ms-3">
                  <p class="mb-0 d-flex">
                    <b>Prepare For the Next Project</b>
                  </p>
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div class="d-flex align-items-center">
                      <i class="mdi mdi-clock text-muted me-1 lh-1"></i>
                      <small class="text-muted ms-auto">2 hours ago</small>
                      <p class="mb-0"></p>
                    </div>
                  </div>
                </div>
              </li>
              <li class="list-group-item d-flex align-items-start">
                <div class="">
                  <span class="avatar bg-info rounded-circle avatar-md">S</span>
                </div>
                <div class="wrapper w-100 ms-3">
                  <p class="mb-0 d-flex">
                    <b>Decide the live Discussion Time</b>
                  </p>
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div class="d-flex align-items-center">
                      <i class="mdi mdi-clock text-muted me-1 lh-1"></i>
                      <small class="text-muted ms-auto">3 hours ago</small>
                      <p class="mb-0"></p>
                    </div>
                  </div>
                </div>
              </li>
              <li class="list-group-item d-flex align-items-start">
                <div class="">
                  <span class="avatar bg-warning rounded-circle avatar-md"
                    >K</span
                  >
                </div>
                <div class="wrapper w-100 ms-3">
                  <p class="mb-0 d-flex">
                    <b>Team Review meeting at yesterday at 3:00 pm</b>
                  </p>
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div class="d-flex align-items-center">
                      <i class="mdi mdi-clock text-muted me-1 lh-1"></i>
                      <small class="text-muted ms-auto">4 hours ago</small>
                      <p class="mb-0"></p>
                    </div>
                  </div>
                </div>
              </li>
              <li class="list-group-item d-flex align-items-start">
                <div class="">
                  <span class="avatar bg-success rounded-circle avatar-md"
                    >R</span
                  >
                </div>
                <div class="wrapper w-100 ms-3">
                  <p class="mb-0 d-flex">
                    <b>Prepare for Presentation</b>
                  </p>
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div class="d-flex align-items-center">
                      <i class="mdi mdi-clock text-muted me-1 lh-2"></i>
                      <small class="text-muted ms-auto">1 days ago</small>
                      <p class="mb-0"></p>
                    </div>
                  </div>
                </div>
              </li>
              <li class="list-group-item d-flex align-items-start">
                <div class="">
                  <span class="avatar bg-pink rounded-circle avatar-md"
                    >MS</span
                  >
                </div>
                <div class="wrapper w-100 ms-3">
                  <p class="mb-0 d-flex">
                    <b>Prepare for Presentation</b>
                  </p>
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div class="d-flex align-items-center">
                      <i class="mdi mdi-clock text-muted me-1 lh-2"></i>
                      <small class="text-muted ms-auto">1 days ago</small>
                      <p class="mb-0"></p>
                    </div>
                  </div>
                </div>
              </li>
              <li class="list-group-item d-flex align-items-start">
                <div class="">
                  <span class="avatar bg-purple rounded-circle avatar-md"
                    >L</span
                  >
                </div>
                <div class="wrapper w-100 ms-3">
                  <p class="mb-0 d-flex">
                    <b>Prepare for Presentation</b>
                  </p>
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div class="d-flex align-items-center">
                      <i class="mdi mdi-clock text-muted me-1 lh-2"></i>
                      <small class="text-muted ms-auto">45 mintues ago</small>
                      <p class="mb-0"></p>
                    </div>
                  </div>
                </div>
              </li>
              <li class="list-group-item d-flex align-items-start">
                <div class="">
                  <span class="avatar bg-blue rounded-circle avatar-md">U</span>
                </div>
                <div class="wrapper w-100 ms-3">
                  <p class="mb-0 d-flex">
                    <b>Prepare for Presentation</b>
                  </p>
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div class="d-flex align-items-center">
                      <i class="mdi mdi-clock text-muted me-1 lh-2"></i>
                      <small class="text-muted ms-auto">2 days ago</small>
                      <p class="mb-0"></p>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div class="tab-pane" id="tab3">
            <ul class="list-group list-group-flush">
              <li class="list-group-item d-flex p-3">
                <label class="custom-control custom-checkbox mb-0">
                  <input
                    type="checkbox"
                    class="custom-control-input"
                    name="example-checkbox1"
                    value="option1"
                    checked=""
                  />
                  <span class="custom-control-label">Do Even More..</span>
                </label>
                <span class="ms-auto">
                  <i
                    class="si si-pencil text-primary me-2"
                    data-bs-toggle="tooltip"
                    title=""
                    data-bs-placement="top"
                    data-original-title="Edit"
                  ></i>
                  <i
                    class="si si-trash text-danger me-2"
                    data-bs-toggle="tooltip"
                    title=""
                    data-bs-placement="top"
                    data-original-title="Delete"
                  ></i>
                </span>
              </li>
              <li class="list-group-item d-flex p-3 border-top">
                <label class="custom-control custom-checkbox mb-0">
                  <input
                    type="checkbox"
                    class="custom-control-input"
                    name="example-checkbox2"
                    value="option2"
                    checked=""
                  />
                  <span class="custom-control-label">Find an idea.</span>
                </label>
                <span class="ms-auto">
                  <i
                    class="si si-pencil text-primary me-2"
                    data-bs-toggle="tooltip"
                    title=""
                    data-bs-placement="top"
                    data-original-title="Edit"
                  ></i>
                  <i
                    class="si si-trash text-danger me-2"
                    data-bs-toggle="tooltip"
                    title=""
                    data-bs-placement="top"
                    data-original-title="Delete"
                  ></i>
                </span>
              </li>
              <li class="list-group-item d-flex p-3 border-top">
                <label class="custom-control custom-checkbox mb-0">
                  <input
                    type="checkbox"
                    class="custom-control-input"
                    name="example-checkbox3"
                    value="option3"
                    checked=""
                  />
                  <span class="custom-control-label">Hangout with friends</span>
                </label>
                <span class="ms-auto">
                  <i
                    class="si si-pencil text-primary me-2"
                    data-bs-toggle="tooltip"
                    title=""
                    data-bs-placement="top"
                    data-original-title="Edit"
                  ></i>
                  <i
                    class="si si-trash text-danger me-2"
                    data-bs-toggle="tooltip"
                    title=""
                    data-bs-placement="top"
                    data-original-title="Delete"
                  ></i>
                </span>
              </li>
              <li class="list-group-item d-flex p-3 border-top">
                <label class="custom-control custom-checkbox mb-0">
                  <input
                    type="checkbox"
                    class="custom-control-input"
                    name="example-checkbox4"
                    value="option4"
                  />
                  <span class="custom-control-label">Do Something else</span>
                </label>
                <span class="ms-auto">
                  <i
                    class="si si-pencil text-primary me-2"
                    data-bs-toggle="tooltip"
                    title=""
                    data-bs-placement="top"
                    data-original-title="Edit"
                  ></i>
                  <i
                    class="si si-trash text-danger me-2"
                    data-bs-toggle="tooltip"
                    title=""
                    data-bs-placement="top"
                    data-original-title="Delete"
                  ></i>
                </span>
              </li>
              <li class="list-group-item d-flex p-3 border-top">
                <label class="custom-control custom-checkbox mb-0">
                  <input
                    type="checkbox"
                    class="custom-control-input"
                    name="example-checkbox5"
                    value="option5"
                  />
                  <span class="custom-control-label"
                    >Eat healthy, Eat Fresh..</span
                  >
                </label>
                <span class="ms-auto">
                  <i
                    class="si si-pencil text-primary me-2"
                    data-bs-toggle="tooltip"
                    title=""
                    data-bs-placement="top"
                    data-original-title="Edit"
                  ></i>
                  <i
                    class="si si-trash text-danger me-2"
                    data-bs-toggle="tooltip"
                    title=""
                    data-bs-placement="top"
                    data-original-title="Delete"
                  ></i>
                </span>
              </li>
              <li class="list-group-item d-flex p-3 border-top">
                <label class="custom-control custom-checkbox mb-0">
                  <input
                    type="checkbox"
                    class="custom-control-input"
                    name="example-checkbox6"
                    value="option6"
                    checked=""
                  />
                  <span class="custom-control-label"
                    >Finsh something more..</span
                  >
                </label>
                <span class="ms-auto">
                  <i
                    class="si si-pencil text-primary me-2"
                    data-bs-toggle="tooltip"
                    title=""
                    data-bs-placement="top"
                    data-original-title="Edit"
                  ></i>
                  <i
                    class="si si-trash text-danger me-2"
                    data-bs-toggle="tooltip"
                    title=""
                    data-bs-placement="top"
                    data-original-title="Delete"
                  ></i>
                </span>
              </li>
              <li class="list-group-item d-flex p-3 border-top">
                <label class="custom-control custom-checkbox mb-0">
                  <input
                    type="checkbox"
                    class="custom-control-input"
                    name="example-checkbox7"
                    value="option7"
                    checked=""
                  />
                  <span class="custom-control-label">Do something more</span>
                </label>
                <span class="ms-auto">
                  <i
                    class="si si-pencil text-primary me-2"
                    data-bs-toggle="tooltip"
                    title=""
                    data-bs-placement="top"
                    data-original-title="Edit"
                  ></i>
                  <i
                    class="si si-trash text-danger me-2"
                    data-bs-toggle="tooltip"
                    title=""
                    data-bs-placement="top"
                    data-original-title="Delete"
                  ></i>
                </span>
              </li>
              <li class="list-group-item d-flex p-3 border-top">
                <label class="custom-control custom-checkbox mb-0">
                  <input
                    type="checkbox"
                    class="custom-control-input"
                    name="example-checkbox8"
                    value="option8"
                  />
                  <span class="custom-control-label">Updated more files</span>
                </label>
                <span class="ms-auto">
                  <i
                    class="si si-pencil text-primary me-2"
                    data-bs-toggle="tooltip"
                    title=""
                    data-bs-placement="top"
                    data-original-title="Edit"
                  ></i>
                  <i
                    class="si si-trash text-danger me-2"
                    data-bs-toggle="tooltip"
                    title=""
                    data-bs-placement="top"
                    data-original-title="Delete"
                  ></i>
                </span>
              </li>
              <li class="list-group-item d-flex p-3 border-top">
                <label class="custom-control custom-checkbox mb-0">
                  <input
                    type="checkbox"
                    class="custom-control-input"
                    name="example-checkbox9"
                    value="option9"
                  />
                  <span class="custom-control-label">System updated</span>
                </label>
                <span class="ms-auto">
                  <i
                    class="si si-pencil text-primary me-2"
                    data-bs-toggle="tooltip"
                    title=""
                    data-bs-placement="top"
                    data-original-title="Edit"
                  ></i>
                  <i
                    class="si si-trash text-danger me-2"
                    data-bs-toggle="tooltip"
                    title=""
                    data-bs-placement="top"
                    data-original-title="Delete"
                  ></i>
                </span>
              </li>
              <li class="list-group-item d-flex p-3 border-top border-bottom">
                <label class="custom-control custom-checkbox mb-0">
                  <input
                    type="checkbox"
                    class="custom-control-input"
                    name="example-checkbox10"
                    value="option10"
                  />
                  <span class="custom-control-label"
                    >Settings Changings...</span
                  >
                </label>
                <span class="ms-auto">
                  <i
                    class="si si-pencil text-primary me-2"
                    data-bs-toggle="tooltip"
                    title=""
                    data-bs-placement="top"
                    data-original-title="Edit"
                  ></i>
                  <i
                    class="si si-trash text-danger me-2"
                    data-bs-toggle="tooltip"
                    title=""
                    data-bs-placement="top"
                    data-original-title="Delete"
                  ></i>
                </span>
              </li>
            </ul>
            <div class="text-center mt-4 p-4">
              <a href="javascript:void(0);" class="btn btn-primary d-grid"
                >Add more</a
              >
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- END SIDEBAR-RIGHT -->

    <!-- SEARCH MODAL START -->
    <div
      class="modal fade header-search-modal"
      id="searchModal"
      tabindex="-1"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header p-0">
            <div class="input-group">
              <input
                type="search"
                class="form-control border-0 py-3 ps-4"
                placeholder="Search anything..."
              />
              <a
                href="javascript:void(0);"
                class="input-group-text bg-transparent border-0 justify-content-center pe-4"
                ><i class="ri-search-line"></i
              ></a>
            </div>
          </div>
          <div class="modal-body">
            <h6 class="mb-2">Recent Searches</h6>
            <div class="list-group">
              <a
                href="javascript:window.location.reload(true)"
                class="list-group-item list-group-item-action text-truncate"
              >
                <i
                  class="ri-history-fill align-middle fs-15 me-2 opacity-75 d-inline-block"
                ></i>
                <span>Nowa Admin Dashboard - Themeforest</span>
              </a>
              <a
                href="javascript:window.location.reload(true)"
                class="list-group-item list-group-item-action text-truncate"
              >
                <i
                  class="ri-history-fill align-middle fs-15 me-2 opacity-75 d-inline-block"
                ></i>
                <span>Bootstrap 5 Latest - Bootstrap</span>
              </a>
              <a
                href="javascript:window.location.reload(true)"
                class="list-group-item list-group-item-action text-truncate"
              >
                <i
                  class="ri-history-fill align-middle fs-15 me-2 opacity-75 d-inline-block"
                ></i>
                <span
                  >Sash – Bootstrap Responsive Flat Admin Dashboard HTML5
                  Template</span
                >
              </a>
              <a
                href="javascript:window.location.reload(true)"
                class="list-group-item list-group-item-action text-truncate"
              >
                <i
                  class="ri-history-fill align-middle fs-15 me-2 opacity-75 d-inline-block"
                ></i>
                <span>Sparci Admin Template - Themeforest</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- SEARCH MODAL END -->

    <!-- START FOOTER -->
    <!-- <footer class="footer">
				<div class="container">
					<div class="row align-items-center flex-row-reverse">
						<div class="col-md-12 col-sm-12 text-center">
							Copyright © 2023 <a href="#">Solic</a>. Designed by <a href="#">Spruko Technologies Private Limited</a> All rights reserved.
						</div>
					</div>
				</div>
			</footer> -->
    <!-- END FOOTER -->
  </div>
  <!-- END PAGE -->

  <!-- BACK-TO-TOP -->
  <a href="#top" id="back-to-top"><i class="fa fa-level-up"></i></a>
</template>

<script>
import "../../assets/plugins/bootstrap/css/bootstrap.min.css";
import "../../assets/css/style.css";
import "../../assets/css/plugin.css";
import "../../assets/css/icons.css";
import "../../assets/switcher/css/switcher.css";
import "../../assets/switcher/demo.css";

// Import jQuery
// import "../../assets/js/vendors/jquery.min.js";
// //import "../../assets/plugins/bootstrap/js/popper.min.js";
// import "../../assets/plugins/bootstrap/js/bootstrap.min.js";
// import "../../assets/js/vendors/circle-progress.min.js";
// import "../../assets/plugins/select2/select2.full.min.js";
// import "../../assets/js/select2.js";
// //import "../../assets/plugins/chart/Chart.bundle.js";
// import "../../assets/plugins/chart/utils.js";
// import "../../assets/plugins/peitychart/jquery.peity.min.js";
// import "../../assets/plugins/peitychart/peitychart.init.js";
// import "../../assets/js/sticky.js";
// import "../../assets/plugins/sidemenu/sidemenu.js";
// import "../../assets/plugins/pscrollbar/perfect-scrollbar.js";
// import "../../assets/plugins/pscrollbar/pscroll-sidemenu.js";
// import "../../assets/plugins/sidebar/sidebar.js";
// import "../../assets/plugins/apexcharts/apexcharts.min.js";
// import "../../assets/js/index.js";
// import "../../assets/js/custom-switcher.js";
// import "../../assets/switcher/js/switcher.js";
// import "../../assets/js/custom.js";

export default {
  name: "AdminLayout",
};
</script>
