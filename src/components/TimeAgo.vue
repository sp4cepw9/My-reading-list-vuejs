<template>
  <span>{{ display }}</span>
</template>

<script>
  export default {
    name: "TimeAgo",
    props: {
      timestamp: {
        type: Number,
        required: true
      }
    },
    data() {
      return {
        now: Date.now(),
        interval: null
      };
    },
    computed: {
      display() {
        const diff = this.now - this.timestamp;

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(diff / (1000 * 60));
        const hours   = Math.floor(diff / (1000 * 60 * 60));
        const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
        const months  = Math.floor(days / 30);
        const years   = Math.floor(days / 365);

        if (seconds < 10) return "Just now";
        if (seconds < 60) return `${seconds}s ago`;
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24)   return `${hours}h ago`;
        if (days < 30)    return `${days}d ago`;
        if (months < 12)  return `${months}mo ago`;

        return `${years}y ago`;
      }
    },
    mounted() {
      this.interval = setInterval(() => {
        this.now = Date.now();
      }, 60000);
    },
    beforeUnmount() {
      clearInterval(this.interval);
    }
  };
</script>
