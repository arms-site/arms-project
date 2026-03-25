<script lang="ts">
  import { fade } from 'svelte/transition';
  export let data: string[] = [];

  const colors = [
    "text-orange-400", "text-blue-400", "text-green-400", "text-pink-400",
    "text-purple-400", "text-yellow-400", "text-red-400", "text-cyan-400"
  ];

  let showAll = false;
  function toggleGenres() {
    showAll = !showAll;
  }
</script>

<div class="flex flex-col w-full">
  <h1 class="font-bold text-xl text-orange-400 mb-2 flex items-center gap-2">
    <svg class="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
    </svg>
    Genres
  </h1>
  <div class="bg-gray-800 py-3 px-2 mt-2 rounded-xl">
    <div class="grid grid-cols-3 gap-2 w-full transition-all duration-500 ease-in-out" 
         style="max-height: {showAll ? '2000px' : '400px'}; overflow: hidden;">
      {#if data}
        {#each (showAll ? data : data.slice(0, 24)) as item, index (item)}
          <a
            href={`/genre/${item}`}
            class={`rounded py-1 px-2 text-[13px] ${colors[index % colors.length]} hover:bg-gray-700 cursor-pointer transition font-semibold`}
            in:fade={{ delay: index * 10, duration: 200 }}
            out:fade={{ duration: 180 }}
          >
            <div class="overflow-hidden text-ellipsis whitespace-nowrap">
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </div>
          </a>
        {/each}
      {/if}
    </div>
    <button
      class="w-full bg-gray-700 py-2 mt-2 hover:bg-gray-600 text-orange-400 hover:text-orange-400 rounded font-semibold text-[13px] transition"
      on:click={toggleGenres}
    >
      {showAll ? "Show Less" : "Show More"}
    </button>
  </div>
</div>