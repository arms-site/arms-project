<script lang="ts">
  export let autoPlay: boolean;
  export let autoSkipIntro: boolean;
  export let autoNext: boolean;
  export let setAutoPlay: (v: boolean) => void;
  export let setAutoSkipIntro: (v: boolean) => void;
  export let setAutoNext: (v: boolean) => void;
</script>

<div class="flex gap-2 mt-2 mb-2 text-xs font-semibold select-none flex-wrap">
  <button
    type="button"
    class="cursor-pointer bg-transparent border-none p-0 m-0 text-inherit flex items-center gap-1"
    on:click={() => setAutoPlay(!autoPlay)}
    aria-pressed={autoPlay}
  >
    <svg class="w-3 h-3 hidden sm:block" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z"/>
    </svg>
    Auto Play <span class={autoPlay ? 'text-green-400' : 'text-red-400'}>{autoPlay ? 'On' : 'Off'}</span>
  </button>
  <button
    type="button"
    class="cursor-pointer bg-transparent border-none p-0 m-0 text-inherit flex items-center gap-1"
    on:click={() => setAutoSkipIntro(!autoSkipIntro)}
    aria-pressed={autoSkipIntro}
  >
    <svg class="w-3 h-3 hidden sm:block" fill="currentColor" viewBox="0 0 24 24">
      <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/>
    </svg>
    Auto Skip Intro <span class={autoSkipIntro ? 'text-green-400' : 'text-red-400'}>{autoSkipIntro ? 'On' : 'Off'}</span>
  </button>
  <button
    type="button"
    class="cursor-pointer bg-transparent border-none p-0 m-0 text-inherit flex items-center gap-1"
    on:click={() => setAutoNext(!autoNext)}
    aria-pressed={autoNext}
  >
    <svg class="w-3 h-3 hidden sm:block" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
    </svg>
    Auto Next <span class={autoNext ? 'text-green-400' : 'text-red-400'}>{autoNext ? 'On' : 'Off'}</span>
  </button>
</div>