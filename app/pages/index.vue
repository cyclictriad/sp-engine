<template>
    <div class="min-h-screen bg-gray-50">
        <div class="max-w-5xl mx-auto px-4 py-8">
            <div class="mb-8 flex justify-between items-center">
                <div>
                    <h1 class="text-3xl font-bold text-blue-700">Studypool Testbank Finder</h1>
                    <p class="text-gray-600 mt-1">Find the best testbank results from Studypool</p>
                </div>

                <UserProfile v-if="isLoggedIn"/>
            </div>

            <div v-if="credentialsRequested">
                <AuthForm :authChanged="credentialsRequested && isLoggedIn" />
            </div>

            <div v-else>
                <QueryForm />

                <QueryResults />
            </div>
        </div>
    </div>
</template>

<script setup>
import globalState from '../stores'

const isLoggedIn = computed(() => globalState.auth.progress.success)
const credentialsRequested = computed(() => globalState.auth.credentialsRequested)


onMounted(() => {
    login()
})
</script>
