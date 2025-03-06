<template>
    <div class="flex items-center">
        <div class="relative">
            <button @click="toggleMenu" class="flex items-center space-x-2 focus:outline-none">
                <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                    {{ avatarInitial }}
                </div>
                <span class="text-sm font-medium text-gray-700">{{ username }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <div v-if="isMenuOpen" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <a @click.prevent="changeAuthDetails" href="#"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Change Login Details
                </a>
                <a @click.prevent="logout" href="#" class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                    Logout
                </a>
            </div>
        </div>
    </div>
</template>

<script setup>
import globalState from '~/stores';


const username = computed(() => localStorage.getItem('sp_username') ?? '');

const isMenuOpen = ref(false);

const avatarInitial = computed(() => username.value.charAt(0).toUpperCase());

function toggleMenu() {
    isMenuOpen.value = !isMenuOpen.value;
}


function changeAuthDetails() {
    isMenuOpen.value = false;
    globalState.auth.credentialsRequested = true;
}

function logout() {
    localStorage.removeItem('sp_username');
    localStorage.removeItem('sp_password');
    isMenuOpen.value = false;
}

onMounted(() => {
    const handleClickOutside = (event) => {
        if (this.$el && !this.$el.contains(event.target)) {
            isMenuOpen.value = false;
        }
    };

    document.addEventListener('click', handleClickOutside);

    onBeforeUnmount(() => {
        document.removeEventListener('click', handleClickOutside);
    });
});
</script>
