<template>
    <div class="bg-white p-6 rounded-lg shadow-md w-full mb-6">
        <h2 class="text-xl font-bold text-blue-700 mb-4">Search for Testbanks</h2>

        <form @submit.prevent="handleSearch">
            <div class="flex flex-col md:flex-row gap-4 mb-4">
                <div class="flex-1">
                    <label for="query" class="block text-sm font-medium text-gray-700 mb-1">Search Query</label>
                    <input id="query" v-model="searchState.query" type="text" required
                        class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter testbank search terms..." />
                </div>

                <div class="w-full md:w-32">
                    <label for="maxPages" class="block text-sm font-medium text-gray-700 mb-1">Max Pages</label>
                    <input id="maxPages" v-model.number="searchState.maxPages" type="number" min="1" max="50"
                        class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
            </div>

            <div v-if="error" class="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {{ error }}
            </div>

            <button type="submit"
                class="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition duration-300 flex items-center"
                :class="[{
                    'cursor-disabled': loading || !isLoggedIn
                }]">
                <Loader v-if="loading" class="mr-2" />
                {{ loading ? 'Searching...' : 'Search' }}
            </button>
        </form>
    </div>
</template>

<script setup>
import globalState from '~/stores';


const searchState = reactive({
    query: '',
    maxPages: 15
})

const isLoggedIn = computed(() => globalState.auth.progress.success);
const loading = computed(() => globalState.search.progress.loading);
const error = computed(() => globalState.search.progress.error);


const handleSearch = async () => {

    console.log({ isLoggedIn: isLoggedIn.value })
    if (!isLoggedIn.value) {
        return;
    }

    globalState.search.progress.success = false;
    globalState.search.progress.loading = true;
    globalState.search.progress.error = null;

    try {

        const results = await $fetch('/api/sp-query', {
            method: 'POST',
            body: searchState
        });

        globalState.search.results = results;
        globalState.search.progress.success = true;
        globalState.search.pagination.currentPage = 1;

    } catch (err) {

        globalState.search.progress.error = 'An error occurred during search. Please try again.';

    } finally {
        globalState.search.progress.loading = false;
    }
};
</script>
