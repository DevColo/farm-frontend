<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import avatar from '@/assets/images/avatars/8.jpg'
import { useUserStore } from '@/stores/user.store'
import { onMounted } from 'vue'

const itemsCount = 42
const authStore = useAuthStore()
const router = useRouter()
const userStore = useUserStore()

// Get User Image
function getUserImage(imageUrl) {
  return imageUrl ? `${import.meta.env.VITE_API_BASE_URL}/${imageUrl}` : avatar
}
// Fetch data on mount
onMounted(() => { 
  userStore.getCurrentUser()
})
</script>

<template>
  <CDropdown placement="bottom-end" variant="nav-item">
    <CDropdownToggle class="py-0 pe-0" :caret="false">
      <CAvatar :src="getUserImage(userStore.user?.photo)" size="md" />

      <!-- <p class="btn btn-lit mb-0">{{ userStore.user?.first_name }} <CIcon icon="cil-user" /></p> -->
    </CDropdownToggle>
    <CDropdownMenu class="pt-0">
      <CDropdownHeader
        component="h6"
        class="bg-body-secondary text-body-secondary fw-semibold mb-2 rounded-top"
      >
        {{ userStore.user?.first_name }} {{ userStore.user?.other_name }}
        {{ userStore.user?.last_name }}
      </CDropdownHeader>
      <CDropdownItem
        ><router-link :to="`/profile`" class="text-decoration-none text-dark"
          ><CIcon icon="cil-user" /> Profile
        </router-link>
      </CDropdownItem>
      <CDropdownItem> <CIcon icon="cil-settings" /> Settings </CDropdownItem>
      <CDropdownDivider />
      <CDropdownItem @click="authStore.logout(router)">
        <CIcon icon="cil-lock-locked" /> Logout
      </CDropdownItem>
    </CDropdownMenu>
  </CDropdown>
</template>
<style scoped>
.avatar-img {
  width: 40px !important;
  height: 40px !important;
}
</style>
