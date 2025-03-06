<template>
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
        <h2 class="text-2xl font-bold text-blue-700 mb-6">Studypool Login</h2>

        <form @submit.prevent="handleLogin">
            <div class="mb-4">
                <label for="username" class="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input id="username" v-model="authState.username" type="text" required
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :disabled="loading" />
            </div>

            <div class="mb-6">
                <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input id="password" v-model="authState.password" type="password" required
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :disabled="loading" />
            </div>

            <div v-if="error" class="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {{ error }}
            </div>

            <button type="submit"
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 flex justify-center items-center"
                :disabled="loading">
                <Loader v-if="loading" class="mr-2" />
                {{ loading ? 'Logging in...' : 'Login' }}
            </button>
        </form>
    </div>
</template>

<script setup>
import globalState from '../stores'

const authChanged = computed(() => globalState.auth.progress.success && globalState.auth.credentialsRequested)

const authState = reactive({
    username: '',
    password: ''
})

const loading = computed(() => globalState.auth.progress.loading)
const error = computed(() => globalState.auth.progress.error)

async function handleLogin() {

    if (!authState.password || !authState.username) {
        return;
    }

    try {
        // Store credentials in localStorage
        localStorage.setItem('sp_username', authState.username)
        localStorage.setItem('sp_password', authState.password)


        const endpoint = authChanged.value ? '/api/sp-login?auth_changed=true' : '/api/sp-login'

        await login(endpoint)

    } catch (error) {
        globalState.auth.progress.error = 'Error occured while setting username and password'

    } finally {
        globalState.auth.progress.loading = false
    }
}

onMounted(() => {
    // Pre-fill form if credentials exist in localStorage
    const savedUsername = localStorage.getItem('sp_username') ?? ''
    const savedPassword = localStorage.getItem('sp_password') ?? ''

    if (savedUsername && savedPassword && !authChanged.value) {
        authState.username = savedUsername
        authState.password = savedPassword
    }
})
</script>
