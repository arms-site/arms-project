<script lang="ts">
  const year = new Date().getFullYear();
</script>

<footer class="w-full bg-gray-900/90 border-t border-orange-400/20 flex-shrink-0 mt-10">
  <div class="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
    <!-- Left: Title & Description -->
    <div class="flex flex-col items-start text-left gap-1 w-full md:w-auto">
      <span class="text-orange-400 font-extrabold text-base md:text-lg tracking-wide">ARMS Anime</span>
      <p class="text-gray-500 text-[10px] md:text-xs max-w-xs mt-1">
        This website does not retain any files on its server. Rather, it solely provides links to media content hosted by third-party services.
      </p>
    </div>
    <!-- Right: Copyright -->
    <div class="flex flex-col items-start text-left gap-0.5 w-full md:w-auto md:items-end md:text-right mt-2 md:mt-0">
      <span class="text-gray-500 text-[10px] md:text-xs">
        &copy; {year} <span class="text-orange-400 font-semibold">ARMS Anime</span>. All rights reserved.
      </span>
    </div>
  </div>
</footer>