<template>
  <div class="row">
    <div class="col-lg-12">
      <div class="card">
        <div class="card-header">
          <h4 class="card-title">Add Farm</h4>
        </div>
        <div class="card-body">
          <form>
            <div class="">
              <div class="row mb-4">
                <label for="inputName" class="col-md-3 form-label"
                  >Farm Name</label
                >

                <input
                  type="text"
                  class="form-control"
                  id="inputName"
                  placeholder="Name"
                  autocomplete="username"
                />
              </div>
              <div class="row mb-4">
                <div class="form-group">
                  <label class="form-label"
                    >Country <span class="text-red">*</span></label
                  >
                  <select
                    class="form-control form-select select2"
                    data-bs-placeholder="Select"
                  >
                    <option label="Select">Country</option>
                    <option value="1">Rwanda</option>
                    <option value="2">DR Congo</option>
                    <option value="3">Uganda</option>
                    <option value="4">Burundi</option>
                  </select>
                </div>
              </div>
              <div class="col-md-9">
                <label class="custom-control custom-checkbox">
                  <input
                    type="checkbox"
                    class="custom-control-input"
                    name="example-checkbox2"
                    value="option2"
                  />
                  <span class="custom-control-label">Active farm</span>
                </label>
              </div>
            </div>
            <button class="btn btn-primary mt-4 mb-0">Submit</button>
          </form>
        </div>
      </div>
    </div>
    <!-- END ROW-1 -->
  </div>
</template>
