<script lang="ts">
  const year = new Date().getFullYear();
</script>

<footer class="w-full bg-gradient-to-r from-[#2a0008] via-[#3a0d16] to-[#1a0106] border-t border-[#ff003c]/30 flex-shrink-0">
  <div class="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
    <!-- Left: Title & Description -->
    <div class="flex flex-col items-start text-left gap-1 w-full md:w-auto">
      <span class="text-[#ff003c] font-extrabold text-base md:text-lg tracking-wide">ARMS Hanime</span>
      <p class="text-[#ffb3c6] text-[10px] md:text-xs max-w-xs mt-1">
        This website does not retain any files on its server. Rather, it solely provides links to media content hosted by third-party services.
      </p>
    </div>
    <!-- Right: Copyright -->
    <div class="flex flex-col items-start text-left gap-0.5 w-full md:w-auto md:items-end md:text-right mt-2 md:mt-0">
      <span class="text-[#ffb3c6] text-[10px] md:text-xs">
        &copy; {year} <span class="text-[#ff003c] font-semibold">ARMS Adult</span>. All rights reserved.
      </span>
    </div>
  </div>
</footer>