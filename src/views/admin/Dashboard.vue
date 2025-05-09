<template>
  <!-- START ROW-1 -->
  <div class="row">
    <div class="col-sm-6 col-lg-6 col-xl-3">
      <div class="card overflow-hidden">
        <div class="card-body">
          <div class="d-flex mb-1">
            <div>
              <h6 class="mb-2">Total Cows</h6>
              <h3 class="mb-0 text-dark display-5 fw-bold d-inline-flex">19</h3>
            </div>
            <div
              class="avatar avatar-lg bg-primary-transparent mb-auto ms-auto br-4"
            >
              <i class="bx bx-cow fs-23">🐄</i>
            </div>
          </div>
          <div class="h-1 mt-1"></div>
        </div>
      </div>
    </div>
    <div class="col-sm-6 col-lg-6 col-xl-3">
      <div class="card overflow-hidden">
        <div class="card-body">
          <div class="d-flex mb-1">
            <div>
              <h6 class="mb-2">Milk Produced Today</h6>
              <h3 class="mb-0 text-dark display-5 fw-bold d-inline-flex">
                684 liter
              </h3>
            </div>
            <div
              class="avatar avatar-lg bg-primary-transparent mb-auto ms-auto br-4"
            >
              <i class="bx bx-milk fs-23">🥛</i>
            </div>
          </div>
          <div class="h-1 mt-1"></div>
        </div>
      </div>
    </div>
    <div class="col-sm-6 col-lg-6 col-xl-3">
      <div class="card overflow-hidden">
        <div class="card-body">
          <div class="d-flex mb-1">
            <div>
              <h6 class="mb-2">Total Products</h6>
              <h3 class="mb-0 text-dark display-5 fw-bold d-inline-flex">
                684
              </h3>
            </div>
            <div
              class="avatar avatar-lg bg-primary-transparent mb-auto ms-auto br-4"
            >
              <i class="bx bx-milk fs-23">📦</i>
            </div>
          </div>
          <div class="h-1 mt-1"></div>
        </div>
      </div>
    </div>
    <div class="col-sm-6 col-lg-6 col-xl-3">
      <div class="card overflow-hidden">
        <div class="card-body">
          <div class="d-flex mb-1">
            <div>
              <h6 class="mb-2">Manure Recorded Today</h6>
              <h3 class="mb-0 text-dark display-5 fw-bold d-inline-flex">
                684kg
              </h3>
            </div>
            <div
              class="avatar avatar-lg bg-primary-transparent mb-auto ms-auto br-4"
            >
              <i class="bx bx-milk fs-23">♻️</i>
            </div>
          </div>
          <div class="h-1 mt-1"></div>
        </div>
      </div>
    </div>
  </div>
  <!-- END ROW-1 -->

  <!-- START ROW-2 -->
  <div class="row">
    <div class="col-lg-6">
      <div class="row">
        <div class="col-xl-6 col-md-12">
          <div class="card">
            <div class="card-body">
              <div class="d-flex">
                <div class="">
                  <p class="mb-1 fw-semibold">Reccuring Revenue</p>
                  <h3 class="my-2">$345.89K</h3>
                  <span class="mb-0 text-muted"
                    ><i class="fa fa-caret-down text-danger me-1"></i> 12% last
                    month</span
                  >
                </div>
                <div class="ms-auto my-auto">
                  <span
                    class="pie"
                    data-peity='{ "fill": ["#564ec1", "#e2e1ea"]}'
                    >280/360</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-6 col-md-12">
          <div class="card">
            <div class="card-body">
              <div class="d-flex">
                <div class="">
                  <p class="mb-1 fw-semibold">Net Revenue</p>
                  <h3 class="my-2">$256.8K</h3>
                  <span class="mb-0 text-muted"
                    ><i class="fa fa-caret-up text-success me-1"></i> 24% last
                    month</span
                  >
                </div>
                <div class="ms-auto my-auto">
                  <span
                    class="pie"
                    data-peity='{ "fill": ["#04cad0", "#e2e1ea"]}'
                    >220/360</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="card overflow-hidden">
        <div class="card-header">
          <div class="card-title">Net Retention (this week)</div>
        </div>
        <div class="card-body">
          <div class="row text-start">
            <div class="col">
              <p class="mb-0 fw-semibold">Cancel</p>
              <h5 class="mb-0">$6.8K</h5>
            </div>
            <div class="col">
              <p class="mb-0 fw-semibold">Expansion</p>
              <h5 class="mb-0">$4.74K</h5>
            </div>
            <div class="col">
              <p class="mb-0 fw-semibold">Contraction</p>
              <h5 class="mb-0">$2.8K</h5>
            </div>
          </div>
          <div class="chart-wrapper pt-4">
            <canvas id="widgetChart1" class="overflow-hidden"></canvas>
          </div>
        </div>
      </div>
    </div>
    <div class="col-lg-6">
      <div class="card">
        <div class="card-header">
          <div class="card-title">Monthly Orders</div>
          <div class="dropdown ms-auto">
            <button
              class="btn btn-outline-default btn-sm fw-bold text-primary fs-12 d-flex align-items-center dropdown-toggle"
              type="button"
              id="dropdownMenuButton1"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Weekly
            </button>
            <ul
              class="dropdown-menu dropdown-menu-end"
              aria-labelledby="dropdownMenuButton1"
            >
              <li><a class="dropdown-item" href="#">Monthly</a></li>
              <li><a class="dropdown-item" href="#">Daily</a></li>
            </ul>
          </div>
        </div>
        <div class="card-body">
          <div class="row mb-5">
            <div class="col-sm-2">
              <h3 class="mb-0 text-primary">67.39%</h3>
              <span class="fw-semibold mb-0">Chicken</span>
            </div>
            <div class="col-sm-2">
              <h3 class="mb-0 text-primary">59.78%</h3>
              <span class="fw-semibold mb-0">Rabit</span>
            </div>
            <div class="col-sm-2">
              <h3 class="mb-0 text-primary">45.38%</h3>
              <span class="fw-semibold mb-0">Fertilizer</span>
            </div>
            <div class="col-sm-2">
              <h3 class="mb-0 text-primary">45.38%</h3>
              <span class="fw-semibold mb-0">Orchard</span>
            </div>
            <div class="col-sm-2">
              <h3 class="mb-0 text-primary">45.38%</h3>
              <span class="fw-semibold mb-0">Milk</span>
            </div>
          </div>
          <div class="chart-wrapper">
            <canvas id="chartLine1" class="h-290"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- END ROW-2 -->

  <!-- START ROW-4 -->
  <div class="row">
    <div class="col-md-12 col-xl-12 col-lg-12">
      <div class="card">
        <div
          class="card-header d-flex justify-content-between align-items-center"
        >
          <div class="card-title">Farm Dialy Activities</div>
          <div class="btn-list d-sm-flex">
            <div class="dropdown ms-auto">
              <button
                class="btn btn-outline-default btn-sm fw-bold text-primary fs-12 d-flex align-items-center dropdown-toggle"
                type="button"
                id="dropdownMenuButton1"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i class="bi bi-calendar-date fw-semibold mx-1"></i> Sort By:
                New
              </button>
              <ul
                class="dropdown-menu dropdown-menu-end"
                aria-labelledby="dropdownMenuButton1"
              >
                <li><a class="dropdown-item" href="#">Relevance</a></li>
                <li><a class="dropdown-item" href="#">Popular</a></li>
              </ul>
            </div>
            <button class="btn btn-sm btn-primary" type="button">
              Filter <i class="bi bi-filter-circle ms-1"></i>
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table
              class="table card-table table-bordered table-vcenter text-dark table-outline text-nowrap"
            >
              <thead>
                <tr>
                  <th scope="col" class="w-9">S.NO</th>
                  <th scope="col" class="w-10">Block</th>
                  <th scope="col" class="w-25">Supervisor</th>
                  <th scope="col">Date</th>
                  <th scope="col" class="w-15">Activity</th>
                  <th scope="col" class="w-15">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>01</td>
                  <td>#242021</td>
                  <td>
                    <div class="d-flex">
                      <img
                        src="../assets/images/users/male/32.jpg"
                        class="avatar avatar-md rounded-circle"
                        alt="person-image"
                      />
                      <div class="d-flex mt-1 flex-column ms-2">
                        <h6 class="mb-0 fs-14 fw-semibold text-dark">
                          Phil Watson
                        </h6>
                        <span class="fs-12 text-muted"
                          >philwatson@gmail.com</span
                        >
                      </div>
                    </div>
                  </td>
                  <td>31-05-2019</td>
                  <td class="text-success">Transfer</td>
                  <td>
                    <div class="btn-list float-end">
                      <a
                        class="btn btn-sm btn-primary"
                        href="javascript:void(0);"
                      >
                        View more</a
                      >
                      <button
                        type="button"
                        class="btn btn-sm btn-secondary-light"
                      >
                        <i
                          class="bi bi-pencil-square fs-14"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="Edit"
                        ></i>
                      </button>
                      <button type="button" class="btn btn-sm btn-danger-light">
                        <i
                          class="bi bi-x-circle fs-14"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="Cancel"
                        ></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>02</td>
                  <td>#242022</td>
                  <td>
                    <div class="d-flex">
                      <span class="avatar avatar-md">
                        <img
                          src="../assets/images/users/female/22.jpg"
                          class="rounded-circle"
                          alt="person-image"
                        />
                      </span>
                      <div class="flex-grow-1 ms-2">
                        <h6 class="mb-0 fs-14 fw-semibold text-dark">
                          Sonia Robertson
                        </h6>
                        <span class="fs-12 text-muted"
                          >soniarobertson@gmail.com</span
                        >
                      </div>
                    </div>
                  </td>
                  <td>02-06-2019</td>
                  <td class="text-secondary">Shares</td>
                  <td>
                    <div class="btn-list float-end">
                      <a
                        class="btn btn-sm btn-primary"
                        href="javascript:void(0);"
                      >
                        View more</a
                      >
                      <button
                        type="button"
                        class="btn btn-sm btn-secondary-light"
                      >
                        <i
                          class="bi bi-pencil-square fs-14"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="Edit"
                        ></i>
                      </button>
                      <button type="button" class="btn btn-sm btn-danger-light">
                        <i
                          class="bi bi-x-circle fs-14"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="Cancel"
                        ></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>03</td>
                  <td>#242023</td>
                  <td>
                    <div class="d-flex">
                      <img
                        src="../assets/images/users/female/17.jpg"
                        class="avatar avatar-md rounded-circle"
                        alt="person-image"
                      />
                      <div class="d-flex mt-1 flex-column ms-2">
                        <h6 class="mb-0 fs-14 fw-semibold text-dark">
                          Matt Arnold
                        </h6>
                        <span class="fs-12 text-muted"
                          >mattarnold@gmail.com</span
                        >
                      </div>
                    </div>
                  </td>
                  <td>12-06-2019</td>
                  <td class="text-danger">Bonds</td>
                  <td>
                    <div class="btn-list float-end">
                      <a
                        class="btn btn-sm btn-primary"
                        href="javascript:void(0);"
                      >
                        View more</a
                      >
                      <button
                        type="button"
                        class="btn btn-sm btn-secondary-light"
                      >
                        <i
                          class="bi bi-pencil-square fs-14"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="Edit"
                        ></i>
                      </button>
                      <button type="button" class="btn btn-sm btn-danger-light">
                        <i
                          class="bi bi-x-circle fs-14"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="Cancel"
                        ></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>04</td>
                  <td>#242024</td>
                  <td>
                    <div class="d-flex">
                      <img
                        src="../assets/images/users/male/23.jpg"
                        class="avatar avatar-md rounded-circle"
                        alt="person-image"
                      />
                      <div class="d-flex mt-1 flex-column ms-2">
                        <h6 class="mb-0 fs-14 fw-semibold text-dark">
                          Adam Hamilton
                        </h6>
                        <span class="fs-12 text-muted"
                          >adamhamilton@gmail.com</span
                        >
                      </div>
                    </div>
                  </td>
                  <td>16-06-2019</td>
                  <td class="text-danger">Bonds</td>
                  <td>
                    <div class="btn-list float-end">
                      <a
                        class="btn btn-sm btn-primary"
                        href="javascript:void(0);"
                      >
                        View more</a
                      >
                      <button
                        type="button"
                        class="btn btn-sm btn-secondary-light"
                      >
                        <i
                          class="bi bi-pencil-square fs-14"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="Edit"
                        ></i>
                      </button>
                      <button type="button" class="btn btn-sm btn-danger-light">
                        <i
                          class="bi bi-x-circle fs-14"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="Cancel"
                        ></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- END ROW-4 -->
</template>
