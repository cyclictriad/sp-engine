<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-5xl mx-auto px-4 py-8">
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-blue-700">
            Studypool Search Engine
          </h1>
          <p class="text-gray-600 mt-1">Supercharge your search on Studypool</p>
        </div>
      </div>

      <div>
        <div class="flex flex-row gap-2">
          <button
            v-for="[searchMode, label] in tabs"
            :key="searchMode"
            @click="() => setTab(searchMode)"
            class="px-4 py-3"
            :class="[
              getStatusColor(searchMode).text,
              activeTab == searchMode
                ? getStatusColor(searchMode).bg
                : 'hover:font-bold',
            ]"
          >
            <span> {{ label }} </span>
          </button>
        </div>
        <div class="border border-blue-300">
          <FormQuery v-if="activeTab === SEARCH_MODES.QUERY" />
          <FormDate v-if="activeTab === SEARCH_MODES.DATE" />
        </div>
        <ResultGrid :searchMode="activeTab" />
      </div>
    </div>
  </div>
</template>

<script setup>
import globalSearchState from "~/stores";
import { SEARCH_MODES } from "~/utils/consts";

const activeTab = ref(SEARCH_MODES.QUERY);

const setTab = (searchMode) => (activeTab.value = searchMode);

const tabs = computed(() => {
  return [
    [SEARCH_MODES.QUERY, "Query Search"],
    [SEARCH_MODES.DATE, "Date Search"],
  ].sort(([modeA], [modeB]) => {
    return modeA === activeTab.value ? -1 : modeB === activeTab.value ? 1 : 0;
  });
});

// Define all color classes statically so Tailwind JIT can detect them
const colorClasses = {
  blue: {
    text: 'text-blue-600',
    bg: 'bg-blue-300'
  },
  green: {
    text: 'text-green-600',
    bg: 'bg-green-300'
  },
  orange: {
    text: 'text-orange-600',
    bg: 'bg-orange-300'
  },
  red: {
    text: 'text-red-600',
    bg: 'bg-red-300'
  }
};

const getStatusColor = (searchMode) => {
  const progress = globalSearchState[searchMode].progress;

  let color;
  switch (progress.status) {
    case PROGRESS_STATUS.IDLE:
      color = "blue";
      break;
    case PROGRESS_STATUS.RUNNING:
      color = "green";
      break;
    case PROGRESS_STATUS.CANCELLED:
      color = "orange";
      break;
    case PROGRESS_STATUS.ERROR:
      color = "red";
      break;
    default:
      color = "blue";
  }
  
  return colorClasses[color];
};
</script>