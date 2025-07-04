<template>
  <div>
    <form
      @submit.prevent="handleSearch"
      class="bg-white p-8 shadow-lg w-full flex flex-col gap-y-3"
    >
      <!-- Search Query - Takes more space -->
      <div class="">
        <div class="flex justify-between items-center mb-1">
          <label for="query" class="block text-sm font-medium text-gray-700"
            >Search Query</label
          >
          <div class="relative group">
            <span
              class="cursor-pointer bg-gray-200 text-gray-600 w-5 h-5 rounded-full inline-flex items-center justify-center text-xs font-bold"
              >?</span
            >
            <div
              class="absolute z-10 w-64 p-2 mt-1 text-sm text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 right-0 transform -translate-y-full pointer-events-none"
            >
              Enter keywords for your test bank search. Be specific with course
              names, textbook titles, editions, etc.
            </div>
          </div>
        </div>
        <input
          id="query"
          v-model="globalSearchState[SEARCH_MODES.QUERY].config.queryString"
          type="text"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter testbank search terms..."
        />
      </div>

      <!-- Sensitivity Range Slider -->
      <div class="">
        <InputRange
          v-model="globalSearchState[SEARCH_MODES.QUERY].config.sensitivity"
          :min="0"
          :max="1"
          :step="0.01"
          label="Search Sensitivity"
          tooltip="Controls the precision of search results. Higher values (closer to 1) deliver more refined results, lower values provide broader matches."
        />
      </div>

      <!-- Three column layout for numeric inputs on larger screens -->

      <div class="md:col-span-6">
        <div class="flex justify-between items-center mb-1">
          <label for="minPages" class="block text-sm font-medium text-gray-700"
            >Minimum Pages</label
          >
          <div class="relative group">
            <span
              class="cursor-pointer bg-gray-200 text-gray-600 w-5 h-5 rounded-full inline-flex items-center justify-center text-xs font-bold"
              >?</span
            >
            <div
              class="absolute z-10 w-64 p-2 mt-1 text-sm text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 right-0 transform -translate-y-full pointer-events-none"
            >
              Filter out test banks with fewer than this number of pages. Higher
              values ensure more comprehensive results.
            </div>
          </div>
        </div>
        <input
          id="minPages"
          v-model.number="globalSearchState[SEARCH_MODES.QUERY].config.minPages"
          type="number"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div class="flex">
        <div id="actionButtons" class="flex-grow flex justify-start items-end">
          <button
            @click="pauseSearch"
            type="button"
            class="text-orange-600 bg-orange-300 font-bold"
          >
            Terminate Task
          </button>
          <button
            v-if="querySearchProgress.status !== PROGRESS_STATUS.IDLE"
            @click="closeBrowser"
            type="button"
            class="text-red-600 bg-red-300 font-bold"
          >
            Close Browser
          </button>
        </div>

        <button
          type="submit"
          class="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 flex items-center font-medium"
          :class="[
            {
              'opacity-50 cursor-not-allowed': !isFormValid || isRunning,
            },
          ]"
          :disabled="!isFormValid || isRunning"
        >
          {{ isRunning ? "Searching" : "Start Search" }}
        </button>
      </div>
    </form>
    <div>
      <ProgressBar
        :current="querySearchProgress.currentPage"
        :max="querySearchProgress.lastPage"
      />

      <!-- Error message -->
      <div
        v-if="querySearchProgress.errorMessage"
        class="mb-4 p-3 bg-red-100 text-red-700 rounded-md"
      >
        {{ querySearchProgress.errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import globalSearchState, { sendMessageWs } from "~/stores";
import { SEARCH_MODES } from "~/utils/consts";

const querySearchState = computed(
  () => globalSearchState[SEARCH_MODES.QUERY].config
);

const isFormValid = computed(
  () =>
    querySearchState.value.queryString &&
    querySearchState.value.minPages &&
    isFinite(querySearchState.value.minPages) &&
    querySearchState.value.sensitivity
);

const querySearchProgress = computed(
  () => globalSearchState[SEARCH_MODES.QUERY].progress
);

const handleSearch = async () => {
  if (!isFormValid.value) {
    return;
  }

  globalSearchState[SEARCH_MODES.QUERY].startSearch();
};

const isRunning = computed(
  () => querySearchProgress.value.status === PROGRESS_STATUS.RUNNING
);

const pauseSearch = () =>
  sendMessageWs(SEARCH_MODES.QUERY, { event: "CANCEL" });
const closeBrowser = () =>
  sendMessageWs(SEARCH_MODES.QUERY, { event: "CLOSE" });
</script>