<script setup>
defineProps({
  size: { type: Number, default: 40 },
})
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 64 64"
    role="img"
    aria-label="CGI logo"
    class="cgi-logo"
  >
    <rect width="64" height="64" rx="12" fill="var(--cgi-red)" />
    <text
      x="32"
      y="41"
      font-family="Arial, Helvetica, sans-serif"
      font-weight="700"
      font-size="24"
      fill="var(--cgi-white)"
      text-anchor="middle"
    >CGI</text>
  </svg>
</template>

<style scoped>
.cgi-logo {
  display: block;
  flex-shrink: 0;
}
</style>
