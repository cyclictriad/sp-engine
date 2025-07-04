<script setup>
const props = defineProps({
  min: {
    type: Number,
    default: 0,
  },
  current: {
    type: Number,
    required: true,
  },
  max: {
    type: Number,
    required: true,
  },
});
</script>

<template>
  <div :title="current" class="w-full h-[20px] bg-blue-50">
    <div
      class="bg-blue-500 h-full"
      :style="{ width: `${(props.current / (props.max - props.min)) * 100}%` }"
    ></div>
  </div>
</template>
