<script setup>
import globalSearchState from "~/stores";

const props = defineProps({
  searchMode: {
    type: String,
    required: true,
  },
});

const totalItems = computed(
  () => globalSearchState[props.searchMode].results.length
);
const itemsPerPage = computed(
  () => globalSearchState[props.searchMode].pagination.itemsPerPage
);
const currentPageIndex = computed(
  () => globalSearchState[props.searchMode].pagination.currentPageIndex
);

// Convert 0-based index to 1-based page number
const currentPage = computed(() => currentPageIndex.value + 1);

const totalPages = computed(() =>
  Math.ceil(totalItems.value / itemsPerPage.value)
);

const visiblePages = computed(() => {
  const pages = [];
  const maxVisiblePages = 5;

  if (totalPages.value <= maxVisiblePages) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    let startPage = Math.max(2, currentPage.value - 1); // Fixed: use currentPage instead of currentPageIndex
    let endPage = Math.min(totalPages.value - 1, currentPage.value + 1); // Fixed: use currentPage instead of currentPageIndex

    if (currentPage.value <= 2) { // Fixed: use currentPage instead of currentPageIndex
      endPage = 4;
    } else if (currentPage.value >= totalPages.value - 1) { // Fixed: use currentPage instead of currentPageIndex
      startPage = totalPages.value - 3;
    }

    if (startPage > 2) {
      pages.push("...");
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages.value - 1) {
      pages.push("...");
    }

    pages.push(totalPages.value);
  }

  return pages;
});

function changePage(page) {
  if (page >= 1 && page <= totalPages.value) {
    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: "smooth" });
    globalSearchState[props.searchMode].pagination.currentPageIndex = page - 1; // Convert 1-based page to 0-based index
  }
}

// Computed properties for better performance and readability
const isPreviousDisabled = computed(() => currentPage.value === 1);
const isNextDisabled = computed(() => currentPage.value === totalPages.value);
const shouldShowPagination = computed(() => totalPages.value > 1);
</script>

<template>
  <div v-if="shouldShowPagination" class="flex justify-center mt-6">
    <nav class="inline-flex rounded-md shadow-sm" role="navigation" aria-label="Pagination">
      <button
        class="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
        :disabled="isPreviousDisabled"
        @click="changePage(currentPage - 1)"
        aria-label="Go to previous page"
      >
        Previous
      </button>

      <div v-for="page in visiblePages" :key="page" class="inline-block">
        <button
          v-if="page !== '...'"
          @click="changePage(page)"
          class="px-3 py-1 border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 transition-colors duration-200"
          :class="{
            'bg-blue-600 text-white hover:bg-blue-700 border-blue-600':
              page === currentPage, // Fixed: use currentPage instead of currentPageIndex
          }"
          :aria-label="`Go to page ${page}`"
          :aria-current="page === currentPage ? 'page' : undefined"
        >
          {{ page }}
        </button>
        <span
          v-else
          class="px-3 py-1 border border-gray-300 bg-white text-sm font-medium text-gray-700"
          aria-hidden="true"
        >
          ...
        </span>
      </div>

      <button
        class="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
        :disabled="isNextDisabled"
        @click="changePage(currentPage + 1)"
        aria-label="Go to next page"
      >
        Next
      </button>
    </nav>
  </div>
</template>