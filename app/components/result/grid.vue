
<script setup>
import searchState from '~/stores'



const props = defineProps({
    searchMode:{
        type:String,
        required:true
    }
})

const  results = computed(()=> searchState[props.searchMode].results)
const currentPageIndex = computed(()=> searchState[props.searchMode].pagination.currentPageIndex)
const itemsPerPage = computed(()=> searchState[props.searchMode].pagination.itemsPerPage)


const resultsToDisplay = computed(() =>{
    const start = currentPageIndex.value * itemsPerPage.value
    const end = start + itemsPerPage.value

    return results.value.slice(start,end)
})
</script>

<template>
        <div v-if="resultsToDisplay.length > 0" class="space-y-8">
            <h2 class="text-xl font-semibold text-gray-800">Total Result Entries [{{ results.length }}]</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ResultCard v-for="(result, index) in resultsToDisplay" :key="index" :result="result" />
            </div>

            <ResultPagination :searchMode />
        </div>

        <div v-else class="py-12 text-center">
            <div class="text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
               
                <p>No entries to display</p>
            </div>
        </div>
</template>



