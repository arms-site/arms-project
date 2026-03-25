<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Hls from 'hls.js';

  export let src: string = '';
  export let poster: string = '';
  export let subtitles: Array<{ url: string; label: string; lang: string; default?: boolean }> = [];

  let videoEl: HTMLVideoElement | null = null;
  let hls: Hls | null = null;

  onMount(() => {
    if (videoEl && src && src.endsWith('.m3u8') && Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(videoEl);
    } else if (videoEl && src && videoEl.canPlayType('application/vnd.apple.mpegurl')) {
      // For Safari
      videoEl.src = src;
    }
  });

  onDestroy(() => {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
</script>

<video
  class="w-full h-auto rounded bg-black"
  controls
  poster={poster}
  crossorigin="anonymous"
  bind:this={videoEl}
>
  {#if !src.endsWith('.m3u8')}
    <source src={src} />
  {/if}
  {#each subtitles as sub}
    <track
      kind="subtitles"
      label={sub.label || sub.lang}
      srclang={sub.lang}
      src={sub.url}
      default={sub.default ?? false}
    />
  {/each}
  Your browser does not support the video tag.
</video>