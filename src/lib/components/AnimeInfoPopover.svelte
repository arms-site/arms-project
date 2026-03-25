<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  export let animeId: string;
  let info: any = null;
  let loading = true;
  let error: string | null = null;
  const dispatch = createEventDispatcher();

  onMount(async () => {
    loading = true;
    error = null;
    info = null;
    try {
      const resp = await fetch(`/api/info?animeId=${animeId}`);
      const json = await resp.json();
      if (json.success && json.data?.anime) {
        info = json.data.anime;
      } else {
        error = json.error || 'Not found';
      }
    } catch (e) {
      error = 'Failed to load info';
    }
    loading = false;
  });
</script>

<div
  class="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 sm:w-80 bg-black/90 rounded-xl shadow-xl z-30 p-3 sm:p-4 pointer-events-auto opacity-100 transition-all duration-200"
  style="min-width:12rem; max-width:90vw;"
  on:mouseleave={() => dispatch('close')}
  on:touchend={() => dispatch('close')}
>
  {#if loading}
    <div class="text-xs text-orange-400 text-center">Loading...</div>
  {:else if error}
    <div class="text-xs text-red-400 text-center">{error}</div>
  {:else if info}
    <div class="font-bold text-xs sm:text-base text-orange-400 mb-1 truncate" title={info.name}>{info.name}</div>
    <div class="text-xs sm:text-sm text-gray-200 line-clamp-4">{info.description}</div>
    <div class="flex flex-wrap gap-1 mt-2">
      {#each info.genres?.slice(0, 3) as genre}
        <span class="bg-gray-900 text-orange-300 px-2 py-0.5 rounded text-[10px]">{genre}</span>
      {/each}
    </div>
  {/if}
</div>