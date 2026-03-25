<script lang="ts">
  export let trending: {
    id: string;
    number: number;
    title: string;
    poster: string;
  }[] = [];

  let scrollRef: HTMLDivElement;

  function scrollLeft() {
    scrollRef.scrollBy({ left: -300, behavior: 'smooth' });
  }
  function scrollRight() {
    scrollRef.scrollBy({ left: 300, behavior: 'smooth' });
  }
</script>

<div class="mt-6 max-[1200px]:px-4 max-md:px-0">
  <h1 class="text-[#ffbade] text-2xl font-bold max-md:pl-4">
    Trending
  </h1>
  <div class="pr-[60px] relative mx-auto overflow-hidden z-[1] mt-6 max-[759px]:pr-0">
    <div
      bind:this={scrollRef}
      class="flex overflow-x-auto gap-2 pb-4 scrollbar-hide"
      style="scroll-behavior: smooth;"
    >
      {#each trending as item}
        <div class="text-center flex flex-col text-[18px] justify-center items-center min-w-[200px] max-w-[200px] flex-shrink-0">
          <div class="w-full h-auto pb-[115%] relative inline-block overflow-hidden max-[575px]:pb-[150%]">
            <!-- Ranking number section -->
            <div class="absolute left-0 top-0 bottom-0 overflow-hidden w-[40px] text-center font-semibold bg-[#201F31] max-[575px]:top-0 max-[575px]:h-[30px] max-[575px]:z-[9] max-[575px]:bg-white">
              <span class="absolute left-0 right-0 bottom-0 text-[24px] leading-[1.1em] text-center z-[9] transform -rotate-90 max-[575px]:transform max-[575px]:rotate-0 max-[575px]:text-[#111] max-[575px]:text-[18px] max-[575px]:leading-[30px]">
                {item.number}
              </span>
              <div class="w-[150px] h-fit text-left transform -rotate-90 absolute bottom-[100px] left-[-55px] leading-[40px] text-ellipsis whitespace-nowrap overflow-hidden text-white text-[16px] font-medium max-[575px]:hidden">
                {item.title}
              </div>
            </div>
            <!-- Main poster image -->
            <a
              href={`/info/${item.id}`}
              class="inline-block bg-[#2a2c31] absolute w-auto left-[40px] right-0 top-0 bottom-0 max-[575px]:left-0 max-[575px]:top-0 max-[575px]:bottom-0"
            >
              <img
                src={`https://wsrv.nl/?url=${item.poster}`}
                alt={item.title}
                class="block w-full h-full object-cover hover:cursor-pointer"
                title={item.title}
              />
            </a>
          </div>
          <!-- Visible title below poster -->
          <div class="mt-2 px-2 w-full">
            <h3 class="text-white text-sm font-medium text-center leading-tight truncate">
              {item.title}
            </h3>
          </div>
        </div>
      {/each}
    </div>
    <!-- Navigation buttons -->
    <div class="absolute top-0 right-0 bottom-0 w-[45px] flex flex-col space-y-2 max-[759px]:hidden">
      <button
        class="bg-[#383747] h-[50%] flex justify-center items-center rounded-[8px] cursor-pointer transition-all duration-300 ease-out hover:bg-[#ffbade] hover:text-[#383747]"
        on:click={scrollRight}
        aria-label="Scroll right"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        svg>
      </button>
      <button
        class="bg-[#383747] h-[50%] flex justify-center items-center rounded-[8px] cursor-pointer transition-all duration-300 ease-out hover:bg-[#ffbade] hover:text-[#383747]"
        on:click={scrollLeft}
        aria-label="Scroll left"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
</div>

<style>
  /* Hide scrollbar for Chrome, Safari and Opera */
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  /* Hide scrollbar for IE, Edge and Firefox */
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;     /* Firefox */
  }
</style>