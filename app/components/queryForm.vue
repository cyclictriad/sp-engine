<template>
    <div class="bg-white p-8 rounded-xl shadow-lg w-full mb-8">
        <h2 class="text-2xl font-bold text-blue-700 mb-6">Search for Testbanks</h2>

        <form @submit.prevent="handleSearch" class="bg-white">
            <!-- Date Section -->
            <div class="mb-8">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Search Date</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <label for="day" class="block text-sm font-medium text-gray-700">Day</label>
                            <div class="relative group">
                                <span
                                    class="cursor-help bg-blue-100 text-blue-600 w-5 h-5 rounded-full inline-flex items-center justify-center text-xs font-bold hover:bg-blue-200 transition-colors">?</span>
                                <div
                                    class="absolute z-10 w-64 p-3 mt-1 text-sm text-white bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 right-0 transform -translate-y-full pointer-events-none">
                                    Day of the month (1-31). Must be more than 7 days ago to avoid stale data.
                                </div>
                            </div>
                        </div>
                        <input id="day" v-model.number="searchState.day" type="number" min="1" :max="maxDay" required
                            :class="[
                                'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors',
                                dateErrors.day ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            ]" placeholder="Day" />
                        <p v-if="dateErrors.day" class="text-red-500 text-xs mt-1">{{ dateErrors.day }}</p>
                    </div>

                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <label for="month" class="block text-sm font-medium text-gray-700">Month</label>
                            <div class="relative group">
                                <span
                                    class="cursor-help bg-blue-100 text-blue-600 w-5 h-5 rounded-full inline-flex items-center justify-center text-xs font-bold hover:bg-blue-200 transition-colors">?</span>
                                <div
                                    class="absolute z-10 w-64 p-3 mt-1 text-sm text-white bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 right-0 transform -translate-y-full pointer-events-none">
                                    Month of the year (1-12). January = 1, December = 12.
                                </div>
                            </div>
                        </div>
                        <input id="month" v-model.number="searchState.month" type="number" min="1" max="12" required
                            :class="[
                                'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors',
                                dateErrors.month ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            ]" placeholder="Month" />
                        <p v-if="dateErrors.month" class="text-red-500 text-xs mt-1">{{ dateErrors.month }}</p>
                    </div>

                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <label for="year" class="block text-sm font-medium text-gray-700">Year</label>
                            <div class="relative group">
                                <span
                                    class="cursor-help bg-blue-100 text-blue-600 w-5 h-5 rounded-full inline-flex items-center justify-center text-xs font-bold hover:bg-blue-200 transition-colors">?</span>
                                <div
                                    class="absolute z-10 w-64 p-3 mt-1 text-sm text-white bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 right-0 transform -translate-y-full pointer-events-none">
                                    Year (e.g., {{ currentYear }}). Must be current year or previous year.
                                </div>
                            </div>
                        </div>
                        <input id="year" v-model.number="searchState.year" type="number" :min="currentYear - 1"
                            :max="currentYear" required :class="[
                                'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors',
                                dateErrors.year ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            ]" placeholder="Year" />
                        <p v-if="dateErrors.year" class="text-red-500 text-xs mt-1">{{ dateErrors.year }}</p>
                    </div>
                </div>

                <!-- Date validation message -->
                <div v-if="dateErrors.general"
                    class="mt-3 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                    {{ dateErrors.general }}
                </div>

                <!-- Current date display -->
                <div class="mt-3 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm">
                    Selected date: <strong>{{ formatSelectedDate() }}</strong>
                    <span v-if="isValidDate()" class="ml-2">
                        ({{ daysFromToday < 0 ? 'In' : '' }} {{ Math.abs(daysFromToday) }} {{ daysFromToday >= 0 ? `days
                            ago`
                            : 'days' }})
                    </span>
                </div>
            </div>

            <!-- Search Parameters Section -->
            <div class="mb-8">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Search Parameters</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <label for="searchDepth" class="block text-sm font-medium text-gray-700">Search
                                Depth</label>
                            <div class="relative group">
                                <span
                                    class="cursor-help bg-blue-100 text-blue-600 w-5 h-5 rounded-full inline-flex items-center justify-center text-xs font-bold hover:bg-blue-200 transition-colors">?</span>
                                <div
                                    class="absolute z-10 w-72 p-3 mt-1 text-sm text-white bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 right-0 transform -translate-y-full pointer-events-none">
                                    Number of search result pages to process. Higher values find more results but take
                                    longer to complete. Recommended: 10-20 for quick searches, 50+ for comprehensive
                                    searches.
                                </div>
                            </div>
                        </div>
                        <input id="searchDepth" v-model.number="searchState.searchDepth" type="number" min="1" max="500"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
                    </div>

                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <label for="offset" class="block text-sm font-medium text-gray-700">Offset</label>
                            <div class="relative group">
                                <span
                                    class="cursor-help bg-blue-100 text-blue-600 w-5 h-5 rounded-full inline-flex items-center justify-center text-xs font-bold hover:bg-blue-200 transition-colors">?</span>
                                <div
                                    class="absolute z-10 w-72 p-3 mt-1 text-sm text-white bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 right-0 transform -translate-y-full pointer-events-none">
                                    After how many pages to start searching from (0 = first page). Use this to continue a previous
                                    search or skip already processed results. Leave at 0 for new searches.
                                </div>
                            </div>
                        </div>
                        <input id="offset" v-model.number="searchState.offset" type="number" min="0"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
                    </div>

                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <label for="minPages" class="block text-sm font-medium text-gray-700">Minimum Pages</label>
                            <div class="relative group">
                                <span
                                    class="cursor-help bg-blue-100 text-blue-600 w-5 h-5 rounded-full inline-flex items-center justify-center text-xs font-bold hover:bg-blue-200 transition-colors">?</span>
                                <div
                                    class="absolute z-10 w-72 p-3 mt-1 text-sm text-white bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 right-0 transform -translate-y-full pointer-events-none">
                                    Only include testbanks with at least this many pages. Higher values ensure more
                                    comprehensive study materials but may reduce the number of results found.
                                </div>
                            </div>
                        </div>
                        <input id="minPages" v-model.number="searchState.minPages" type="number" min="1"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
                    </div>
                </div>
            </div>

            <!-- Error message -->
            <div v-if="error" class="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                <div class="font-medium">Search Error</div>
                <div class="text-sm mt-1">{{ error }}</div>
            </div>

            <!-- Submit button -->
            <div class="flex justify-end">
                <button type="submit"
                    class="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 flex items-center font-medium"
                    :class="[{
                        'opacity-50 cursor-not-allowed': loading || !isFormValid
                    }]" :disabled="loading || !isFormValid">
                    <Loader v-if="loading" class="mr-2" />
                    {{ loading ? 'Searching...' : (success && journeyResumable) ? 'Resume Search' : 'Start Search' }}
                </button>
            </div>
        </form>
    </div>
</template>

<script setup>
import globalState from '~/stores';



const today = new Date();
const currentYear = today.getFullYear();

// Initialize with a date exactly 8 days ago (first valid date)
const eightDaysAgo = new Date(today);
eightDaysAgo.setDate(today.getDate() - 8);

const searchState = reactive({
    day: eightDaysAgo.getDate(),
    month: eightDaysAgo.getMonth() + 1,
    year: eightDaysAgo.getFullYear(),
    searchDepth: 15,
    offset: 0,
    minPages: 130,
});

const dateErrors = reactive({
    day: null,
    month: null,
    year: null,
    general: null
});

const loading = computed(() => globalState.search.progress.loading);
const success = computed(() => globalState.search.progress.success);
const error = computed(() => globalState.search.progress.error);

const journeyResumable = ref(false);

// Computed properties for validation
const maxDay = computed(() => {
    const daysInMonth = new Date(searchState.year, searchState.month, 0).getDate();
    return daysInMonth;
});

const isValidDate = () => {
    try {
        const selectedDate = new Date(searchState.year, searchState.month - 1, searchState.day);
        return selectedDate.getFullYear() === searchState.year &&
            selectedDate.getMonth() === searchState.month - 1 &&
            selectedDate.getDate() === searchState.day;
    } catch {
        return false;
    }
};

const isDateInValidRange = () => {
    if (!isValidDate()) return false;

    const selectedDate = new Date(searchState.year, searchState.month - 1, searchState.day);
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
    return isValidDate() &&
        isDateInValidRange() &&
        searchState.searchDepth >= 1 &&
        searchState.offset >= 0 &&
        searchState.minPages >= 1 &&
        !Object.values(dateErrors).some(error => error !== null);
});

const formatSelectedDate = () => {
    if (!isValidDate()) return 'Invalid date';
    const date = new Date(searchState.year, searchState.month - 1, searchState.day);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const daysFromToday = computed(() => {
    if (!isValidDate()) return 0;
    const selectedDate = new Date(searchState.year, searchState.month - 1, searchState.day);
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
    if (searchState.day < 1 || searchState.day > 31) {
        dateErrors.day = 'Day must be between 1 and 31';
    }

    if (searchState.month < 1 || searchState.month > 12) {
        dateErrors.month = 'Month must be between 1 and 12';
    }

    if (searchState.year < currentYear - 1 || searchState.year > currentYear) {
        dateErrors.year = `Year must be ${currentYear - 1} or ${currentYear}`;
    }

    // Validate date exists
    if (!dateErrors.day && !dateErrors.month && !dateErrors.year && !isValidDate()) {
        dateErrors.general = 'This date does not exist. Please check your entries.';
        return;
    }

    // Validate date range
    if (isValidDate() && !isDateInValidRange()) {
        const selectedDate = new Date(searchState.year, searchState.month - 1, searchState.day);
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);

        if (selectedDate > today) {
            dateErrors.general = 'Date cannot be in the future.';
        } else if (selectedDate >= sevenDaysAgo) {
            dateErrors.general = 'Date must be more than 7 days ago (Data may not available).';
        }
    }

    // Check if day exists in the selected month
    if (!dateErrors.day && !dateErrors.month && !dateErrors.year && searchState.day > maxDay.value) {
        dateErrors.day = `${new Date(searchState.year, searchState.month - 1).toLocaleDateString('en-US', { month: 'long' })} ${searchState.year} only has ${maxDay.value} days`;
    }
};

// Watch for changes
watch([() => searchState.day, () => searchState.month, () => searchState.year], validateDate, { immediate: true });

watch(() => {
    const date = new Date();
    date.setDate(searchState.day);
    date.setMonth(searchState.month - 1);
    date.setFullYear(searchState.year);
    return date.getTime();
}, () => {
    journeyResumable.value = false;
});

const handleSearch = async () => {
    if (!isFormValid.value) {
        return;
    }

    if (success.value) {
        globalState.search.progress.success = false;

        if (journeyResumable.value) {
            searchState.offset += searchState.searchDepth;
        }
    }

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
        journeyResumable.value = true;

    } catch (err) {
        globalState.search.progress.error = 'An error occurred during search. Please try again.';
    } finally {
        globalState.search.progress.loading = false;
    }
};

// Initialize validation on mount
onMounted(() => {
    validateDate();
});
</script>