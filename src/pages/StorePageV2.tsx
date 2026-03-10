<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Astra Sneakers - Fullscreen Responsive</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
  
  <style>
    @font-face {
      font-family: Inter;
      font-style: normal;
      font-weight: 400 500 600 700;
      font-display: swap;
      src: url(https://fonts.gstatic.com/s/inter/v20/UcCo3FwrK3iLTcvvYwYL8g.woff2) format("woff2");
    }

    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', sans-serif;
      background-color: #000000;
      color: #ffffff;
      -webkit-font-smoothing: antialiased;
      -webkit-tap-highlight-color: transparent;
      overflow: hidden; /* Prevent body scroll, handle inside app container */
    }

    /* Fullscreen App Container */
    #app-container {
      position: relative;
      width: 100vw;
      height: 100dvh;
      background-color: #000000;
      overflow: hidden;
    }

    /* Hide Scrollbars */
    ::-webkit-scrollbar { display: none; }
    * { scrollbar-width: none; }

    /* --- INTERACTIONS --- */
    .interactive { transition: transform 0.4s cubic-bezier(0.25, 1, 0.3, 1), opacity 0.4s; cursor: pointer; }
    .interactive:active { transform: scale(0.92); opacity: 0.8; }
    
    .card-hover { transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s; cursor: pointer; }
    @media (hover: hover) {
        .card-hover:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 20px 40px rgba(0,0,0,0.5); z-index: 10; }
        .interactive:hover { transform: scale(1.05); }
    }

    /* --- IOS SPOTLIGHT SEARCH ANIMATION --- */
    #home-view {
      transition: transform 0.6s cubic-bezier(0.32, 0.72, 0, 1), filter 0.6s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.6s;
      transform-origin: center top;
    }
    
    #search-overlay {
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.5s cubic-bezier(0.32, 0.72, 0, 1);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }

    #search-input-container {
      transform: translateY(-60px) scale(0.95);
      opacity: 0;
      transition: all 0.6s cubic-bezier(0.32, 0.72, 0, 1);
    }

    #search-results {
      transform: translateY(40px);
      opacity: 0;
      transition: all 0.6s cubic-bezier(0.32, 0.72, 0, 1);
    }

    /* Active Search State */
    body.search-active #home-view {
      transform: scale(0.95) translateY(20px); /* Slightly less scaling for desktop */
      filter: blur(12px) brightness(0.6);
      pointer-events: none;
    }
    body.search-active #search-overlay { opacity: 1; pointer-events: auto; }
    body.search-active #search-input-container { transform: translateY(0) scale(1); opacity: 1; transition-delay: 0.05s; }
    body.search-active #search-results { transform: translateY(0); opacity: 1; transition-delay: 0.15s; }
    
    body.search-active #floating-search-btn {
      transform: scale(0.5);
      opacity: 0;
      pointer-events: none;
    }

    /* --- ANIMATED NAV RUNNER --- */
    #runner {
      background-image: 
        linear-gradient(90deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.2) 100%), 
        linear-gradient(0deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 30%, rgba(255, 255, 255, 0) 70%, rgba(255, 255, 255, 0.05) 100%), 
        linear-gradient(-30deg, rgba(255, 255, 255, 0.2) 17%, rgba(255, 255, 255, 0) 58%, rgba(255, 255, 255, 0.05) 86%);
    }

    /* Initial Load Stagger Animations */
    @keyframes fadeUp {
      0% { opacity: 0; transform: translateY(30px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    .stagger-1 { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards; opacity: 0; }
    .stagger-2 { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards; opacity: 0; }
    .stagger-3 { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards; opacity: 0; }
  </style>
</head>
<body>

  <div id="app-container">

    <!-- ================= MAIN HOME VIEW ================= -->
    <div id="home-view" class="w-full h-full flex flex-col overflow-hidden relative z-10 bg-black">
      
      <!-- Top Section (Constrained on Desktop) -->
      <div class="w-full max-w-7xl mx-auto shrink-0">
        <!-- Header -->
        <div class="px-6 md:px-10 pt-10 md:pt-14 pb-4 flex justify-between items-center stagger-1">
          <h1 class="text-2xl md:text-4xl font-bold tracking-wide">ASTRA SNEAKERS</h1>
        </div>

        <!-- Tags Filter -->
        <div class="px-6 md:px-10 pb-6 flex gap-3 md:gap-4 overflow-x-auto whitespace-nowrap stagger-2 border-b border-white/10">
          <button class="interactive px-5 py-2.5 rounded-full text-xs md:text-sm font-bold bg-white text-black">All</button>
          <button class="interactive px-5 py-2.5 rounded-full text-xs md:text-sm font-semibold bg-[#1c1c1e] text-gray-300 border border-white/10">Jordan</button>
          <button class="interactive px-5 py-2.5 rounded-full text-xs md:text-sm font-semibold bg-[#1c1c1e] text-gray-300 border border-white/10">Nike</button>
          <button class="interactive px-5 py-2.5 rounded-full text-xs md:text-sm font-semibold bg-[#1c1c1e] text-gray-300 border border-white/10">Yeezy</button>
          <button class="interactive px-5 py-2.5 rounded-full text-xs md:text-sm font-semibold bg-[#1c1c1e] text-gray-300 border border-white/10">Adidas</button>
          <button class="interactive px-5 py-2.5 rounded-full text-xs md:text-sm font-semibold bg-[#1c1c1e] text-gray-300 border border-white/10">New Balance</button>
        </div>
      </div>

      <!-- Product Grid (Fully Responsive) -->
      <div class="flex-1 overflow-y-auto px-6 md:px-10 pt-6 pb-32">
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 max-w-7xl mx-auto stagger-3">
          
          <!-- Shoe 1 -->
          <div class="card-hover aspect-[3/4] rounded-2xl relative overflow-hidden bg-[#1c1c1e] border border-white/5">
            <img src="https://images.unsplash.com/photo-1597045566677-8cf032ed6634?q=80&w=600&auto=format&fit=crop" class="w-full h-full object-cover">
            <div class="absolute bottom-0 w-full h-[60%] bg-gradient-to-t from-black via-black/80 to-transparent"></div>
            <div class="absolute bottom-4 left-4 text-white pr-12">
              <div class="text-[14px] md:text-[16px] font-medium leading-tight">Air Jordan 1 Chicago</div>
              <div class="text-[14px] md:text-[16px] font-bold mt-1 text-gray-300">₹ 15,000</div>
            </div>
            <button class="absolute top-3 right-3 w-8 md:w-10 h-8 md:h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center interactive">
              <svg width="14" height="12" viewBox="0 0 11 9" fill="none"><path d="M1.253 4.958L4.729 8.224a.276.276 0 00.392 0L8.802 4.958c.978-.919 1.097-2.431.275-3.491L8.922 1.268C7.938-.001 5.963.212 5.271 1.661a.278.278 0 01-.487 0C4.093.212 2.118-.001 1.134 1.268l-.155.199c-.823 1.06-.704 2.572.274 3.491z" stroke="#fff" stroke-width="1"/></svg>
            </button>
            <button class="absolute bottom-4 right-4 w-8 md:w-10 h-8 md:h-10 rounded-full bg-white flex items-center justify-center interactive text-black">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>

          <!-- Shoe 2 -->
          <div class="card-hover aspect-[3/4] rounded-2xl relative overflow-hidden bg-[#1c1c1e] border border-white/5">
            <img src="https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=600&auto=format&fit=crop" class="w-full h-full object-cover">
            <div class="absolute bottom-0 w-full h-[60%] bg-gradient-to-t from-black via-black/80 to-transparent"></div>
            <div class="absolute bottom-4 left-4 text-white pr-12">
              <div class="text-[14px] md:text-[16px] font-medium leading-tight">Nike Dunk Low Panda</div>
              <div class="text-[14px] md:text-[16px] font-bold mt-1 text-gray-300">₹ 8,500</div>
            </div>
            <button class="absolute top-3 right-3 w-8 md:w-10 h-8 md:h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center interactive">
              <svg width="14" height="12" viewBox="0 0 11 9" fill="none"><path d="M1.253 4.958L4.729 8.224a.276.276 0 00.392 0L8.802 4.958c.978-.919 1.097-2.431.275-3.491L8.922 1.268C7.938-.001 5.963.212 5.271 1.661a.278.278 0 01-.487 0C4.093.212 2.118-.001 1.134 1.268l-.155.199c-.823 1.06-.704 2.572.274 3.491z" stroke="#fff" stroke-width="1"/></svg>
            </button>
            <button class="absolute bottom-4 right-4 w-8 md:w-10 h-8 md:h-10 rounded-full bg-white flex items-center justify-center interactive text-black">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>

          <!-- Shoe 3 -->
          <div class="card-hover aspect-[3/4] rounded-2xl relative overflow-hidden bg-[#1c1c1e] border border-white/5">
            <img src="https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=600&auto=format&fit=crop" class="w-full h-full object-cover">
            <div class="absolute bottom-0 w-full h-[60%] bg-gradient-to-t from-black via-black/80 to-transparent"></div>
            <div class="absolute bottom-4 left-4 text-white pr-12">
              <div class="text-[14px] md:text-[16px] font-medium leading-tight">Yeezy Boost 350 V2</div>
              <div class="text-[14px] md:text-[16px] font-bold mt-1 text-gray-300">₹ 22,000</div>
            </div>
            <button class="absolute top-3 right-3 w-8 md:w-10 h-8 md:h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center interactive">
              <svg width="14" height="12" viewBox="0 0 11 9" fill="none"><path d="M1.253 4.958L4.729 8.224a.276.276 0 00.392 0L8.802 4.958c.978-.919 1.097-2.431.275-3.491L8.922 1.268C7.938-.001 5.963.212 5.271 1.661a.278.278 0 01-.487 0C4.093.212 2.118-.001 1.134 1.268l-.155.199c-.823 1.06-.704 2.572.274 3.491z" stroke="#fff" stroke-width="1"/></svg>
            </button>
            <button class="absolute bottom-4 right-4 w-8 md:w-10 h-8 md:h-10 rounded-full bg-white flex items-center justify-center interactive text-black">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>

          <!-- Shoe 4 -->
          <div class="card-hover aspect-[3/4] rounded-2xl relative overflow-hidden bg-[#1c1c1e] border border-white/5">
            <img src="https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=600&auto=format&fit=crop" class="w-full h-full object-cover">
            <div class="absolute bottom-0 w-full h-[60%] bg-gradient-to-t from-black via-black/80 to-transparent"></div>
            <div class="absolute bottom-4 left-4 text-white pr-12">
              <div class="text-[14px] md:text-[16px] font-medium leading-tight">New Balance 550</div>
              <div class="text-[14px] md:text-[16px] font-bold mt-1 text-gray-300">₹ 11,000</div>
            </div>
            <button class="absolute top-3 right-3 w-8 md:w-10 h-8 md:h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center interactive">
              <svg width="14" height="12" viewBox="0 0 11 9" fill="none"><path d="M1.253 4.958L4.729 8.224a.276.276 0 00.392 0L8.802 4.958c.978-.919 1.097-2.431.275-3.491L8.922 1.268C7.938-.001 5.963.212 5.271 1.661a.278.278 0 01-.487 0C4.093.212 2.118-.001 1.134 1.268l-.155.199c-.823 1.06-.704 2.572.274 3.491z" stroke="#fff" stroke-width="1"/></svg>
            </button>
            <button class="absolute bottom-4 right-4 w-8 md:w-10 h-8 md:h-10 rounded-full bg-white flex items-center justify-center interactive text-black">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>

          <!-- Shoe 5 -->
          <div class="card-hover aspect-[3/4] rounded-2xl relative overflow-hidden bg-[#1c1c1e] border border-white/5">
            <img src="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=600&auto=format&fit=crop" class="w-full h-full object-cover">
            <div class="absolute bottom-0 w-full h-[60%] bg-gradient-to-t from-black via-black/80 to-transparent"></div>
            <div class="absolute bottom-4 left-4 text-white pr-12">
              <div class="text-[14px] md:text-[16px] font-medium leading-tight">Nike Air Force 1</div>
              <div class="text-[14px] md:text-[16px] font-bold mt-1 text-gray-300">₹ 7,495</div>
            </div>
            <button class="absolute top-3 right-3 w-8 md:w-10 h-8 md:h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center interactive">
              <svg width="14" height="12" viewBox="0 0 11 9" fill="none"><path d="M1.253 4.958L4.729 8.224a.276.276 0 00.392 0L8.802 4.958c.978-.919 1.097-2.431.275-3.491L8.922 1.268C7.938-.001 5.963.212 5.271 1.661a.278.278 0 01-.487 0C4.093.212 2.118-.001 1.134 1.268l-.155.199c-.823 1.06-.704 2.572.274 3.491z" stroke="#fff" stroke-width="1"/></svg>
            </button>
            <button class="absolute bottom-4 right-4 w-8 md:w-10 h-8 md:h-10 rounded-full bg-white flex items-center justify-center interactive text-black">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>

          <!-- Shoe 6 -->
          <div class="card-hover aspect-[3/4] rounded-2xl relative overflow-hidden bg-[#1c1c1e] border border-white/5">
            <img src="https://images.unsplash.com/photo-1605340537581-8752c07d5025?q=80&w=600&auto=format&fit=crop" class="w-full h-full object-cover">
            <div class="absolute bottom-0 w-full h-[60%] bg-gradient-to-t from-black via-black/80 to-transparent"></div>
            <div class="absolute bottom-4 left-4 text-white pr-12">
              <div class="text-[14px] md:text-[16px] font-medium leading-tight">Travis Scott x J1</div>
              <div class="text-[14px] md:text-[16px] font-bold mt-1 text-gray-300">₹ 85,000</div>
            </div>
            <button class="absolute top-3 right-3 w-8 md:w-10 h-8 md:h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center interactive">
              <svg width="14" height="12" viewBox="0 0 11 9" fill="none"><path d="M1.253 4.958L4.729 8.224a.276.276 0 00.392 0L8.802 4.958c.978-.919 1.097-2.431.275-3.491L8.922 1.268C7.938-.001 5.963.212 5.271 1.661a.278.278 0 01-.487 0C4.093.212 2.118-.001 1.134 1.268l-.155.199c-.823 1.06-.704 2.572.274 3.491z" stroke="#fff" stroke-width="1"/></svg>
            </button>
            <button class="absolute bottom-4 right-4 w-8 md:w-10 h-8 md:h-10 rounded-full bg-white flex items-center justify-center interactive text-black">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>

        </div>
      </div>
    </div>

    <!-- ================= FLOATING SEARCH BUTTON ================= -->
    <button id="floating-search-btn" onclick="openSearch()" class="absolute right-6 md:right-10 bottom-28 md:bottom-32 w-14 md:w-16 h-14 md:h-16 bg-[#2c2c2e] rounded-full border border-white/10 flex items-center justify-center z-40 shadow-[0_10px_30px_rgba(0,0,0,0.8)] interactive transition-all duration-500 text-white">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
    </button>

    <!-- ================= SEARCH OVERLAY ================= -->
    <div id="search-overlay" class="absolute inset-0 z-50 flex flex-col items-center pt-16 px-4 bg-black/60">
      
      <!-- Search Input Area -->
      <div id="search-input-container" class="w-full max-w-2xl flex items-center gap-3">
        <div class="flex-1 bg-[#1c1c1e] rounded-2xl h-14 flex items-center px-4 border border-white/10 shadow-2xl">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="search-input" class="w-full h-full bg-transparent border-none outline-none ml-3 text-[16px] text-white placeholder-gray-500" placeholder="Search sneakers, brands...">
        </div>
        <button onclick="closeSearch()" class="text-blue-500 font-medium text-[16px] interactive px-2">Cancel</button>
      </div>

      <!-- Search Results / Recent -->
      <div id="search-results" class="w-full max-w-2xl mt-8 flex flex-col gap-1">
        <h3 class="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2 px-2">Recent Searches</h3>
        
        <div class="flex items-center gap-4 px-4 py-4 bg-[#1c1c1e]/50 hover:bg-[#2c2c2e] rounded-xl cursor-pointer interactive border border-white/5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span class="text-gray-200 text-[15px]">Jordan 1 Chicago</span>
        </div>
        
        <div class="flex items-center gap-4 px-4 py-4 bg-[#1c1c1e]/50 hover:bg-[#2c2c2e] rounded-xl cursor-pointer interactive border border-white/5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span class="text-gray-200 text-[15px]">Nike Dunk Low Panda</span>
        </div>
        
        <div class="flex items-center gap-4 px-4 py-4 bg-[#1c1c1e]/50 hover:bg-[#2c2c2e] rounded-xl cursor-pointer interactive border border-white/5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span class="text-gray-200 text-[15px]">Yeezy Slide Bone</span>
        </div>
      </div>
    </div>

    <!-- ================= ANIMATED BOTTOM NAVIGATION ================= -->
    <div class="absolute bottom-6 left-0 right-0 mx-auto w-[calc(100%-2rem)] max-w-[400px] h-[76px] z-40 stagger-3 shrink-0">
      
      <!-- Dark Glass Pill -->
      <div class="absolute inset-0 backdrop-blur-[30px] bg-[#1c1c1e]/80 rounded-[38px] shadow-2xl border border-white/10"></div>

      <!-- Animated Glass Runner -->
      <div 
        id="runner"
        class="absolute h-[60px] top-[8px] w-[20%] rounded-[30px] border-[1px] border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
        style="left: calc(12.5% - 10%);"
      >
        <div class="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_1px_2px_10px_0px_rgba(255,255,255,0.1)]"></div>
      </div>

      <!-- Icons Wrapper -->
      <div class="absolute inset-0 flex justify-around items-center px-[2.5%]">
        
        <!-- Home -->
        <button onclick="handleNavClick('home', 12.5)" class="w-14 h-14 flex justify-center items-center text-white z-10 interactive">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M9.02 2.84L3.63 7.04C2.73 7.74 2 9.23 2 10.36V17.77C2 20.09 3.89 21.99 6.21 21.99H17.79C20.11 21.99 22 20.09 22 17.78V10.5C22 9.29 21.19 7.74 20.2 7.05L14.02 2.72C12.62 1.74 10.37 1.79 9.02 2.84Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 17.99V14.99" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- Category -->
        <button onclick="handleNavClick('category', 37.5)" class="w-14 h-14 flex justify-center items-center text-gray-400 z-10 interactive">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M17 10H19C21 10 22 9 22 7V5C22 3 21 2 19 2H17C15 2 14 3 14 5V7C14 9 15 10 17 10Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M5 22H7C9 22 10 21 10 19V17C10 15 9 14 7 14H5C3 14 2 15 2 17V19C2 21 3 22 5 22Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6 10C8.21 10 10 8.21 10 6C10 3.79 8.21 2 6 2C3.79 2 2 3.79 2 6C2 8.21 3.79 10 6 10Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M18 22C20.21 22 22 20.21 22 18C22 15.79 20.21 14 18 14C15.79 14 14 15.79 14 18C14 20.21 15.79 22 18 22Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- Cart -->
        <button onclick="handleNavClick('cart', 62.5)" class="w-14 h-14 flex justify-center items-center text-gray-400 z-10 interactive">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M8.4 6.5H15.6C19 6.5 19.34 8.09 19.57 10.03L20.47 17.53C20.76 19.99 20 22 16.5 22H7.5C4 22 3.24 19.99 3.54 17.53L4.44 10.03C4.66 8.09 5 6.5 8.4 6.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 8V4.5C8 3 9 2 10.5 2H13.5C15 2 16 3 16 4.5V8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- User -->
        <button onclick="handleNavClick('profile', 87.5)" class="w-14 h-14 flex justify-center items-center text-gray-400 z-10 interactive">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M12 12C14.76 12 17 9.76 17 7C17 4.24 14.76 2 12 2C9.24 2 7 4.24 7 7C7 9.76 9.24 12 12 12Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

      </div>
    </div>

  </div>

  <script>
    // --- Navigation Runner Animation Logic ---
    let activeTabPercentage = 12.5;
    let navAnimation = null;

    function handleNavClick(tabId, targetPercentage) {
      if (targetPercentage === activeTabPercentage) return;

      const runner = document.getElementById("runner");
      const buttons = document.querySelectorAll('.absolute.bottom-6 button');
      
      // Update Icon Colors
      buttons.forEach(btn => btn.classList.replace('text-white', 'text-gray-400'));
      event.currentTarget.classList.replace('text-gray-400', 'text-white');

      if (navAnimation) navAnimation.cancel();

      // Fluid Web Animation API execution
      navAnimation = runner.animate([
        { left: `calc(${activeTabPercentage}% - 10%)`, width: '20%', offset: 0 },
        { left: `calc(${(activeTabPercentage + targetPercentage) / 2}% - 12%)`, width: '24%', offset: 0.4 }, // Squish effect
        { left: `calc(${targetPercentage}% - 10%)`, width: '20%', offset: 1 }
      ], {
        duration: 500,
        easing: "cubic-bezier(0.25, 1, 0.3, 1)", 
        fill: "forwards"
      });

      activeTabPercentage = targetPercentage;
    }

    // --- Spotlight Search Animation Logic ---
    const appBody = document.body;
    const searchInput = document.getElementById('search-input');

    function openSearch() {
      appBody.classList.add('search-active');
      // Hardware accelerated focus timing
      setTimeout(() => {
        searchInput.focus();
      }, 300);
    }

    function closeSearch() {
      appBody.classList.remove('search-active');
      searchInput.value = '';
      searchInput.blur();
    }
  </script>
</body>
</html>