<!-- Custom Range Component -->
<script setup>
const props = defineProps({
    modelValue: {
        type: Number,
        default: 0.5
    },
    min: {
        type: Number,
        default: 0
    },
    max: {
        type: Number,
        default: 1
    },
    step: {
        type: Number,
        default: 0.01
    },
    label: {
        type: String,
        default: 'Range'
    },
    tooltip: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['update:modelValue']);

const localValue = ref(props.modelValue);

watch(() => props.modelValue, (newVal) => {
    localValue.value = newVal;
});

watch(localValue, (newVal) => {
    emit('update:modelValue', Number(newVal));
});

const percentage = computed(() => {
    return ((localValue.value - props.min) / (props.max - props.min)) * 100;
});

const trackStyle = computed(() => {
    return {
        background: `linear-gradient(to right, #2563eb ${percentage.value}%, #e5e7eb ${percentage.value}%)`
    };
});
</script>



<template>
    <div class="mb-4">
        <div class="range-input-container">
            <div class="flex justify-between items-center mb-1">
                <label class="block text-sm font-medium text-gray-700">{{ label }}</label>
                <div class="flex items-center">
                    <span class="text-sm text-gray-500 mr-2">{{ localValue.toFixed(2) }}</span>
                    <div class="relative" v-if="tooltip">
                        <div class="group">
                            <span
                                class="cursor-pointer bg-gray-200 text-gray-600 w-5 h-5 rounded-full inline-flex items-center justify-center text-xs font-bold">?</span>
                            <div
                                class="absolute z-10 w-48 p-2 mt-1 text-sm text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 right-0 transform -translate-y-full pointer-events-none">
                                {{ tooltip }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="relative">
                <input type="range" :min="min" :max="max" :step="step" v-model="localValue"
                    class="w-full appearance-none h-2 bg-transparent focus:outline-none" :style="trackStyle" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.range-input-container input[type="range"] {
    -webkit-appearance: none;
    width: 100%;
    height: 4px;
    background: transparent;
}

/* Track styles */
.range-input-container input[type="range"]::-webkit-slider-runnable-track {
    width: 100%;
    height: 4px;
    cursor: pointer;
}

.range-input-container input[type="range"]::-moz-range-track {
    width: 100%;
    height: 4px;
    cursor: pointer;
}

/* Thumb styles - sharp corners */
.range-input-container input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 16px;
    width: 16px;
    background: #2563eb;
    cursor: pointer;
    margin-top: -6px;
    border: none;
    border-radius: 0;
}

.range-input-container input[type="range"]::-moz-range-thumb {
    height: 16px;
    width: 16px;
    background: #2563eb;
    cursor: pointer;
    border: none;
    border-radius: 0;
}

.range-input-container input[type="range"]:focus {
    outline: none;
}

.range-input-container input[type="range"]:focus::-webkit-slider-thumb {
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.3);
}

.range-input-container input[type="range"]:focus::-moz-range-thumb {
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.3);
}
</style>