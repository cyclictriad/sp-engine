<template>
    <div class="bg-white p-6 rounded-lg shadow-md w-full mb-6">
        <h2 class="text-xl font-bold text-blue-700 mb-4">Search for Testbanks</h2>

        <form @submit.prevent="handleSearch" class="bg-white p-6">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-6 mb-4">
                <!-- Search Query - Takes more space -->
                <div class="md:col-span-12">
                    <div class="flex justify-between items-center mb-1">
                        <label for="query" class="block text-sm font-medium text-gray-700">Search Query</label>
                        <div class="relative group">
                            <span
                                class="cursor-pointer bg-gray-200 text-gray-600 w-5 h-5 rounded-full inline-flex items-center justify-center text-xs font-bold">?</span>
                            <div
                                class="absolute z-10 w-64 p-2 mt-1 text-sm text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 right-0 transform -translate-y-full pointer-events-none">
                                Enter keywords for your test bank search. Be specific with course names, textbook
                                titles, editions, etc.
                            </div>
                        </div>
                    </div>
                    <input id="query" v-model="searchState.query" type="text" required
                        class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter testbank search terms..." />
                </div>

                <!-- Sensitivity Range Slider -->
                <div class="md:col-span-12">
                    <RangeInput v-model="searchState.sensitivity" :min="0" :max="1" :step="0.01"
                        label="Search Sensitivity"
                        tooltip="Controls the precision of search results. Higher values (closer to 1) deliver more refined results, lower values provide broader matches." />
                </div>

                <!-- Three column layout for numeric inputs on larger screens -->
                <div class="md:col-span-4">
                    <div class="flex justify-between items-center mb-1">
                        <label for="searchDepth" class="block text-sm font-medium text-gray-700">Search Depth</label>
                        <div class="relative group">
                            <span
                                class="cursor-pointer bg-gray-200 text-gray-600 w-5 h-5 rounded-full inline-flex items-center justify-center text-xs font-bold">?</span>
                            <div
                                class="absolute z-10 w-64 p-2 mt-1 text-sm text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 right-0 transform -translate-y-full pointer-events-none">
                                Number of search result pages to scrape. Higher values may yield more results but take
                                longer.
                            </div>
                        </div>
                    </div>
                    <input id="searchDepth" v-model.number="searchState.searchDepth" type="number" min="1" max="50"
                        class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div class="md:col-span-4">
                    <div class="flex justify-between items-center mb-1">
                        <label for="minPages" class="block text-sm font-medium text-gray-700">Minimum Pages</label>
                        <div class="relative group">
                            <span
                                class="cursor-pointer bg-gray-200 text-gray-600 w-5 h-5 rounded-full inline-flex items-center justify-center text-xs font-bold">?</span>
                            <div
                                class="absolute z-10 w-64 p-2 mt-1 text-sm text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 right-0 transform -translate-y-full pointer-events-none">
                                Filter out test banks with fewer than this number of pages. Higher values ensure more
                                comprehensive results.
                            </div>
                        </div>
                    </div>
                    <input id="minPages" v-model.number="searchState.minPages" type="number" min="100"
                        class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div class="md:col-span-4">
                    <div class="flex justify-between items-center mb-1">
                        <label for="maxPages" class="block text-sm font-medium text-gray-700">Maximum Pages</label>
                        <div class="relative group">
                            <span
                                class="cursor-pointer bg-gray-200 text-gray-600 w-5 h-5 rounded-full inline-flex items-center justify-center text-xs font-bold">?</span>
                            <div
                                class="absolute z-10 w-64 p-2 mt-1 text-sm text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 right-0 transform -translate-y-full pointer-events-none">
                                Upper limit for test bank page count. Helps filter out extremely large documents.
                            </div>
                        </div>
                    </div>
                    <input id="maxPages" v-model.number="searchState.maxPages" type="number" min="100"
                        class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
            </div>

            <!-- Error message -->
            <div v-if="error" class="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {{ error }}
            </div>

            <!-- Submit button -->
            <div class="flex justify-end">
                <button type="submit"
                    class="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition duration-300 flex items-center"
                    :class="[{
                        'opacity-50 cursor-not-allowed': loading || !isLoggedIn
                    }]" :disabled="loading || !isLoggedIn">
                    <Loader v-if="loading" class="mr-2" />
                    {{ loading ? 'Searching...' : 'Search' }}
                </button>
            </div>
        </form>

    </div>
</template>

<script setup>
import globalState from '~/stores';


const searchState = reactive({
    query: '',
    searchDepth: 15,
    minPages: 200,
    maxPages: 5000,
    sensitivity: 0.5
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
