<template>
    <div v-if="hasSearched">
        <div v-if="currentResults.length > 0" class="space-y-8">
            <h2 class="text-xl font-semibold text-gray-800">Search Results ({{ results.length }} found)</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ResultCard v-for="(result, index) in currentResults" :key="index" :result="result" />
            </div>

            <Pagination />
        </div>

        <div v-else class="py-12 text-center">
            <div class="text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 class="text-xl font-medium mb-2">No results found</h3>
                <p>Try adjusting your search terms or increasing max pages.</p>
            </div>
        </div>
    </div>
</template>


<script setup>
import globalState from '~/stores'

const hasSearched = computed(() => globalState.search.progress.success)
const results = computed(() => globalState.search.results)
const currentPage = computed(() => globalState.search.pagination.currentPage)
const itemsPerPage = ref(10)

const currentResults = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return results.value.slice(start, end)
})

</script>
