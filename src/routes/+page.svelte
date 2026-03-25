<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';


  let infoBoxId: string | null = null;
  function showInfo(id: string) { infoBoxId = id; }
  function hideInfo(id: string) { if (infoBoxId === id) infoBoxId = null; }
</script>

<svelte:head>
  <title>ARMS Anime</title>
  <meta name="description" content="Discover, stream, and enjoy trending, simulcast, and classic anime—no registration required!">
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col">
  <Navbar />

  <!-- Add top margin for mobile to prevent overlap with navbar -->
  <div class="mt-16 sm:mt-0"></div>

  <!-- Hero Section -->
  <section class="w-full px-4 py-12 sm:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-b border-orange-400/20">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
      <!-- Left: Main Text -->
      <div class="flex-1 flex flex-col items-start gap-8 w-full">
        <h1 class="text-3xl sm:text-5xl md:text-6xl font-extrabold text-orange-400 drop-shadow-lg tracking-tight leading-tight">
          <span class="text-white">ARMS</span> Anime Streaming
        </h1>
        <p class="text-base sm:text-xl text-gray-300 max-w-xl">
          Discover, stream, and enjoy trending, simulcast, and classic anime—no registration required!
        </p>
        <div class="mt-4 flex items-center gap-3 bg-orange-400/10 border border-orange-400/30 rounded-xl px-3 py-2 sm:px-4 sm:py-2">
          <svg class="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M12 2v20m10-10H2" />
          </svg>
          <span class="text-orange-300 font-semibold text-xs sm:text-base">Simulcast: Watch the latest episodes as soon as they air in Japan!</span>
        </div>
      </div>
      <!-- Right: CTA Button -->
      <div class="flex-1 flex flex-col items-center md:items-end w-full mt-8 md:mt-0">
        <a
          class="px-8 py-3 sm:px-10 sm:py-4 bg-orange-400 text-gray-900 font-bold rounded-full shadow-lg hover:bg-orange-300 transition text-lg sm:text-xl flex items-center gap-2 w-full sm:w-auto justify-center"
          href="/home"
        >
          <svg class="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M6 4l12 6-12 6V4z"/>
          </svg>
          Start Watching Now
        </a>
      </div>
    </div>
  </section>

  <!-- Features Row (bottom, always visible) -->
  <section class="max-w-6xl mx-auto px-2 sm:px-4 py-10">
    <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
      <div class="flex flex-col items-center text-center gap-2 bg-gray-800 rounded-lg p-3 sm:p-6 shadow">
        <span class="inline-flex items-center justify-center rounded-full bg-orange-400/20 p-2 sm:p-4">
          <svg class="w-8 h-8 sm:w-10 sm:h-10 text-orange-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <rect x="3" y="7" width="18" height="13" rx="2" />
            <path d="M8 7V3m8 4V3" />
          </svg>
        </span>
        <span class="font-bold text-xs sm:text-lg text-orange-400">HD Streaming</span>
        <span class="text-gray-300 text-[11px] sm:text-base">Enjoy anime in crisp HD quality, anytime, anywhere.</span>
      </div>
      <div class="flex flex-col items-center text-center gap-2 bg-gray-800 rounded-lg p-3 sm:p-6 shadow">
        <span class="inline-flex items-center justify-center rounded-full bg-orange-400/20 p-2 sm:p-4">
          <svg class="w-8 h-8 sm:w-10 sm:h-10 text-orange-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M12 2v20m10-10H2" />
          </svg>
        </span>
        <span class="font-bold text-xs sm:text-lg text-orange-400">Trending &amp; Popular</span>
        <span class="text-gray-300 text-[11px] sm:text-base">Stay up to date with the hottest anime series and movies.</span>
      </div>
      <div class="flex flex-col items-center text-center gap-2 bg-gray-800 rounded-lg p-3 sm:p-6 shadow">
        <span class="inline-flex items-center justify-center rounded-full bg-orange-400/20 p-2 sm:p-4">
          <svg class="w-8 h-8 sm:w-10 sm:h-10 text-orange-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <span class="font-bold text-xs sm:text-lg text-orange-400">No Registration</span>
        <span class="text-gray-300 text-[11px] sm:text-base">Start watching instantly. No sign-up required.</span>
      </div>
      <div class="flex flex-col items-center text-center gap-2 bg-gray-800 rounded-lg p-3 sm:p-6 shadow">
        <span class="inline-flex items-center justify-center rounded-full bg-orange-400/20 p-2 sm:p-4">
          <svg class="w-8 h-8 sm:w-10 sm:h-10 text-orange-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12l2 2 4-4" />
          </svg>
        </span>
        <span class="font-bold text-xs sm:text-lg text-orange-400">No Ads</span>
        <span class="text-gray-300 text-[11px] sm:text-base">Enjoy anime with zero interruptions and no annoying ads.</span>
      </div>
    </div>
  </section>

 
  <!-- Redesigned How It Works Section -->
  <section class="max-w-6xl mx-auto px-4 py-10">
    <h2 class="text-2xl sm:text-3xl font-bold text-orange-400 mb-8 text-center">How It Works</h2>
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div class="flex flex-col items-center text-center gap-4 bg-gray-800 rounded-xl p-6 shadow">
        <span class="inline-flex items-center justify-center rounded-full bg-orange-400/20 p-4">
          <svg class="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </span>
        <span class="font-bold text-lg sm:text-xl text-orange-400">Browse</span>
        <span class="text-gray-300 text-sm sm:text-base">Explore trending, popular, and top-rated anime with easy navigation.</span>
      </div>
      <div class="flex flex-col items-center text-center gap-4 bg-gray-800 rounded-xl p-6 shadow">
        <span class="inline-flex items-center justify-center rounded-full bg-orange-400/20 p-4">
          <svg class="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M6 4l12 6-12 6V4z"/>
          </svg>
        </span>
        <span class="font-bold text-lg sm:text-xl text-orange-400">Watch</span>
        <span class="text-gray-300 text-sm sm:text-base">Stream your favorite episodes instantly in high quality.</span>
      </div>
      <div class="flex flex-col items-center text-center gap-4 bg-gray-800 rounded-xl p-6 shadow">
        <span class="inline-flex items-center justify-center rounded-full bg-orange-400/20 p-4">
          <svg class="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M2 6a2 2 0 012-2h7a2 2 0 012 2v14a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm18-2h-7a2 2 0 00-2 2v14a2 2 0 002 2h7a2 2 0 002-2V6a2 2 0 00-2-2z"/>
          </svg>
        </span>
        <span class="font-bold text-lg sm:text-xl text-orange-400">Read Manga</span>
        <span class="text-gray-300 text-sm sm:text-base">Enjoy your favorite manga chapters online, no registration needed.</span>
      </div>
      <div class="flex flex-col items-center text-center gap-4 bg-gray-800 rounded-xl p-6 shadow">
        <span class="inline-flex items-center justify-center rounded-full bg-orange-400/20 p-4">
          <svg class="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12l2 2 4-4" />
          </svg>
        </span>
        <span class="font-bold text-lg sm:text-xl text-orange-400">Enjoy</span>
        <span class="text-gray-300 text-sm sm:text-base">No ads, no hassle. Just pure anime and manga entertainment.</span>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <Footer />
</div>

<style>
</style>
