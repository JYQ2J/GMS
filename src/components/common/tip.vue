<template>
  <a-tooltip
    style="width: 18px; height: 18px; font-size: 18px; color: #666;"
    :placement="placement"
    :overlay-style="overlayStyle"
    :title="title"
  ><a-icon type="question-circle" /></a-tooltip>
</template>

<script>
export default {
  name: 'tip',
  props: {
    title: {
      type: String,
      default: ''
    },
    placement: {
      type: String,
      default: 'left'
    },
    overlayStyle: {
      type: Object,
      default: () => ({ maxWidth: 'calc(100% - 520px)' })
    }
  }
}
</script>