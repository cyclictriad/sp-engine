<template>
  <div>
    <form @submit.prevent="handleSearch" class="bg-white p-8 shadow-lg w-full">
      <!-- Date Section -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Search Date</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div class="flex justify-between items-center mb-2">
              <label for="day" class="block text-sm font-medium text-gray-700"
                >Day</label
              >
              <div class="relative group">
                <span
                  class="cursor-help bg-blue-100 text-blue-600 w-5 h-5 rounded-full inline-flex items-center justify-center text-xs font-bold hover:bg-blue-200 transition-colors"
                  >?</span
                >
                <div
                  class="absolute z-10 w-64 p-3 mt-1 text-sm text-white bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 right-0 transform -translate-y-full pointer-events-none"
                >
                  Day of the month (1-31). Must be more than 7 days ago to avoid
                  stale data.
                </div>
              </div>
            </div>
            <input
              id="day"
              v-model.number="globalSearchState[SEARCH_MODES.DATE].config.day"
              type="number"
              min="1"
              :max="maxDay"
              required
              :class="[
                'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors',
                dateErrors.day ? 'border-red-500 bg-red-50' : 'border-gray-300',
              ]"
              placeholder="Day"
            />
            <p v-if="dateErrors.day" class="text-red-500 text-xs mt-1">
              {{ dateErrors.day }}
            </p>
          </div>

          <div>
            <div class="flex justify-between items-center mb-2">
              <label for="month" class="block text-sm font-medium text-gray-700"
                >Month</label
              >
              <div class="relative group">
                <span
                  class="cursor-help bg-blue-100 text-blue-600 w-5 h-5 rounded-full inline-flex items-center justify-center text-xs font-bold hover:bg-blue-200 transition-colors"
                  >?</span
                >
                <div
                  class="absolute z-10 w-64 p-3 mt-1 text-sm text-white bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 right-0 transform -translate-y-full pointer-events-none"
                >
                  Month of the year (1-12). January = 1, December = 12.
                </div>
              </div>
            </div>
            <input
              id="month"
              v-model.number="globalSearchState[SEARCH_MODES.DATE].config.month"
              type="number"
              min="1"
              max="12"
              required
              :class="[
                'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors',
                dateErrors.month
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300',
              ]"
              placeholder="Month"
            />
            <p v-if="dateErrors.month" class="text-red-500 text-xs mt-1">
              {{ dateErrors.month }}
            </p>
          </div>

          <div>
            <div class="flex justify-between items-center mb-2">
              <label for="year" class="block text-sm font-medium text-gray-700"
                >Year</label
              >
              <div class="relative group">
                <span
                  class="cursor-help bg-blue-100 text-blue-600 w-5 h-5 rounded-full inline-flex items-center justify-center text-xs font-bold hover:bg-blue-200 transition-colors"
                  >?</span
                >
                <div
                  class="absolute z-10 w-64 p-3 mt-1 text-sm text-white bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 right-0 transform -translate-y-full pointer-events-none"
                >
                  Year (e.g., {{ currentYear }}). Must be current year or
                  previous year.
                </div>
              </div>
            </div>
            <input
              id="year"
              v-model.number="globalSearchState[SEARCH_MODES.DATE].config.year"
              type="number"
              :min="currentYear - 1"
              :max="currentYear"
              required
              :class="[
                'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors',
                dateErrors.year
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300',
              ]"
              placeholder="Year"
            />
            <p v-if="dateErrors.year" class="text-red-500 text-xs mt-1">
              {{ dateErrors.year }}
            </p>
          </div>
        </div>

        <!-- Date validation message -->
        <div
          v-if="dateErrors.general"
          class="mt-3 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm"
        >
          {{ dateErrors.general }}
        </div>

        <!-- Current date display -->
        <div
          class="mt-3 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm"
        >
          Selected date: <strong>{{ formatSelectedDate() }}</strong>
          <span v-if="isValidDate()" class="ml-2">
            ({{ daysFromToday < 0 ? "In" : "" }} {{ Math.abs(daysFromToday) }}
            {{
              daysFromToday >= 0
                ? `days
                            ago`
                : "days"
            }})
          </span>
        </div>
      </div>

      <div>
        <h5 class="text-blue-700 font-semibold text-lg mb-4">
          Search Functions
        </h5>

        <div class="space-y-3">
          <div
            v-for="fn in localDateSearchFns"
            :key="fn.id"
            class="bg-white p-3 rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div class="flex items-start gap-3">
              <div
                class="relative bg-gradient-to-br from-blue-400 to-blue-600 h-12 w-12 rounded-lg flex items-center justify-center shadow-md"
              >
                <svg
                  viewBox="0 0 64 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-8 w-8 text-white"
                >
                  <text
                    x="8"
                    y="44"
                    font-size="36"
                    font-family="Arial, sans-serif"
                    fill="currentColor"
                    font-weight="bold"
                  >
                    fx
                  </text>
                </svg>
              </div>

              <div class="flex-1">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-blue-700 mb-1">
                      Contains
                    </label>
                    <input
                      type="text"
                      v-model="fn.contains"
                      placeholder="Enter search term..."
                      class="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-400"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-blue-700 mb-1">
                      Minimum Pages
                    </label>
                    <input
                      type="number"
                      v-model="fn.minPages"
                      placeholder="e.g., 10"
                      class="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-400"
                    />
                  </div>
                </div>
              </div>

              <button
                @click="() => removeFn(fn.id)"
                class="bg-red-300 text-red-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0V5a1 1 0 011-1h4a1 1 0 011 1v2m-7 0h8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="mt-4">
          <button
            type="button"
            class="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 flex items-center gap-2"
            @click="addFn"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
            >
              <path
                d="M12 5V19M5 12H19"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            Add Function
          </button>
        </div>
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
            v-if="dateSearchProgress.status !== PROGRESS_STATUS.IDLE"
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
        :current="dateSearchProgress.currentPage"
        :max="dateSearchProgress.lastPage"
      />

      <!-- Error message -->
      <div
        v-if="dateSearchProgress.errorMessage"
        class="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg"
      >
        <div class="font-medium">Search Error</div>
        <div class="text-sm mt-1">{{ dateSearchProgress.errorMessage }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import globalSearchState, { sendMessageWs } from "~/stores";
import { SEARCH_MODES } from "~/utils/consts";

const today = new Date();
const currentYear = today.getFullYear();

// Initialize with a date exactly 8 days ago (first valid date)
const eightDaysAgo = new Date(today);
eightDaysAgo.setDate(today.getDate() - 8);

const dateErrors = reactive({
  day: null,
  month: null,
  year: null,
  general: null,
});

const dateSearchState = computed(
  () => globalSearchState[SEARCH_MODES.DATE].config
);

// Computed properties for validation
const maxDay = computed(() => {
  const daysInMonth = new Date(
    dateSearchState.value.year,
    dateSearchState.value.month,
    0
  ).getDate();
  return daysInMonth;
});

const isValidDate = () => {
  try {
    const selectedDate = new Date(
      dateSearchState.value.year,
      dateSearchState.value.month - 1,
      dateSearchState.value.day
    );
    return (
      selectedDate.getFullYear() === dateSearchState.value.year &&
      selectedDate.getMonth() === dateSearchState.value.month - 1 &&
      selectedDate.getDate() === dateSearchState.value.day
    );
  } catch {
    return false;
  }
};

const isDateInValidRange = () => {
  if (!isValidDate()) return false;

  const selectedDate = new Date(
    dateSearchState.value.year,
    dateSearchState.value.month - 1,
    dateSearchState.value.day
  );
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  // Reset time to compare dates only
  today.setHours(23, 59, 59, 999);
  selectedDate.setHours(0, 0, 0, 0);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // Date must be MORE than 7 days ago (older than 7 days ago)
  return selectedDate < sevenDaysAgo;
};

const isFormValid = computed(() => {
  return (
    isValidDate() &&
    isDateInValidRange() &&
    !Object.values(dateErrors).some((error) => error !== null)
  );
});

const formatSelectedDate = () => {
  if (!isValidDate()) return "Invalid date";
  const date = new Date(
    dateSearchState.value.year,
    dateSearchState.value.month - 1,
    dateSearchState.value.day
  );
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const daysFromToday = computed(() => {
  if (!isValidDate()) return 0;
  const selectedDate = new Date(
    dateSearchState.value.year,
    dateSearchState.value.month - 1,
    dateSearchState.value.day
  );
  const today = new Date();
  const diffTime = today.getTime() - selectedDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Validation watchers
const validateDate = () => {
  // Clear previous errors
  dateErrors.day = null;
  dateErrors.month = null;
  dateErrors.year = null;
  dateErrors.general = null;

  // Validate individual fields
  if (dateSearchState.value.day < 1 || dateSearchState.value.day > 31) {
    dateErrors.day = "Day must be between 1 and 31";
  }

  if (dateSearchState.value.month < 1 || dateSearchState.value.month > 12) {
    dateErrors.month = "Month must be between 1 and 12";
  }

  if (
    dateSearchState.value.year < currentYear - 1 ||
    dateSearchState.value.year > currentYear
  ) {
    dateErrors.year = `Year must be ${currentYear - 1} or ${currentYear}`;
  }

  // Validate date exists
  if (
    !dateErrors.day &&
    !dateErrors.month &&
    !dateErrors.year &&
    !isValidDate()
  ) {
    dateErrors.general = "This date does not exist. Please check your entries.";
    return;
  }

  // Validate date range
  if (isValidDate() && !isDateInValidRange()) {
    const selectedDate = new Date(
      dateSearchState.value.year,
      dateSearchState.value.month - 1,
      dateSearchState.value.day
    );
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    if (selectedDate > today) {
      dateErrors.general = "Date cannot be in the future.";
    } else if (selectedDate >= sevenDaysAgo) {
      dateErrors.general =
        "Date must be more than 7 days ago (Data may not available).";
    }
  }

  // Check if day exists in the selected month
  if (
    !dateErrors.day &&
    !dateErrors.month &&
    !dateErrors.year &&
    dateSearchState.value.day > maxDay.value
  ) {
    dateErrors.day = `${new Date(
      dateSearchState.value.year,
      dateSearchState.value.month - 1
    ).toLocaleDateString("en-US", { month: "long" })} ${
      dateSearchState.value.year
    } only has ${maxDay.value} days`;
  }
};

// Watch for changes
watch(
  [
    () => dateSearchState.value.day,
    () => dateSearchState.value.month,
    () => dateSearchState.value.year,
  ],
  validateDate,
  { immediate: true }
);

const localDateSearchFns = ref([]);

localDateSearchFns.value = globalSearchState[SEARCH_MODES.DATE].config.fns;

const addFn = () =>
  localDateSearchFns.value.push({
    id: `fn-${Date.now()}`,
    contains: "",
    minPages: null,
  });

const removeFn = (fnId) =>
  (localDateSearchFns.value = localDateSearchFns.value.filter(
    (fn) => fn.id !== fnId
  ));

const validateFn = (fn) => {
  if (fn.contains && fn.minPages) {
    return true;
  }
  return false;
};

watch(localDateSearchFns, (newFns) => {
  const validFns = newFns.filter((fn) => validateFn(fn));

  globalSearchState[SEARCH_MODES.DATE].config.fns = validFns;
});

const dateSearchProgress = computed(
  () => globalSearchState[SEARCH_MODES.DATE].progress
);

const handleSearch = async () => {
  if (!isFormValid.value) {
    return;
  }

  globalSearchState[SEARCH_MODES.DATE].startSearch();
};

const isRunning = computed(
  () => dateSearchProgress.value.status === PROGRESS_STATUS.RUNNING
);
const pauseSearch = () => sendMessageWs(SEARCH_MODES.DATE, { event: "CANCEL" });
const closeBrowser = () => sendMessageWs(SEARCH_MODES.DATE, { event: "CLOSE" });

// Initialize validation on mount
onMounted(() => {
  validateDate();
});
</script>