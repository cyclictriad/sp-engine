<template>
    <div class="flex justify-center mt-6">
        <nav class="inline-flex rounded-md shadow-sm">
            <button
                class="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                :disabled="currentPage === 1" @click="changePage(currentPage - 1)"
                :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }">
                Previous
            </button>

            <div v-for="page in visiblePages" :key="page" class="inline-block">
                <button v-if="page !== '...'" @click="changePage(page)"
                    class="px-3 py-1 border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50"
                    :class="{ 'bg-blue-600 text-white hover:bg-blue-700': page === currentPage }">
                    {{ page }}
                </button>
                <span v-else class="px-3 py-1 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    ...
                </span>
            </div>

            <button
                class="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)"
                :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }">
                Next
            </button>
        </nav>
    </div>
</template>


<script setup>
import globalState from '~/stores';

const totalItems = computed(() => globalState.search.results.length)
const itemsPerPage = computed(() => globalState.search.pagination.perPage)
const currentPage = computed(() => globalState.search.pagination.currentPage)



const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

const visiblePages = computed(() => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages.value <= maxVisiblePages) {
        for (let i = 1; i <= totalPages.value; i++) {
            pages.push(i);
        }
    } else {
        pages.push(1);
        let startPage = Math.max(2, currentPage.value - 1);
        let endPage = Math.min(totalPages.value - 1, currentPage.value + 1);

        if (currentPage.value <= 2) {
            endPage = 4;
        } else if (currentPage.value >= totalPages.value - 1) {
            startPage = totalPages.value - 3;
        }

        if (startPage > 2) {
            pages.push('...');
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        if (endPage < totalPages.value - 1) {
            pages.push('...');
        }

        pages.push(totalPages.value);
    }

    return pages;
});

function changePage(page) {
    if (page >= 1 && page <= totalPages.value) {
        // Scroll to top of results
        window.scrollTo({ top: 0, behavior: 'smooth' })
        globalState.search.pagination.currentPage = page
    }
}
</script>
