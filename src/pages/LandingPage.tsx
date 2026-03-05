import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Pause, Volume2, VolumeX, ChevronRight, ChevronLeft } from 'lucide-react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import ShaderBackground from '../components/ShaderBackground';

gsap.registerPlugin(ScrollTrigger);

const FEATURED_ITEMS = [
  { name: "Astra Volt '98", color: "from-[#0f3460] to-[#1a1a2e]", badge: "⚡ ASTRA Running" },
  { name: "Astra Art-Walk", color: "from-[#2d1b69] to-[#11013b]", badge: "✦ ASTRA Street" },
  { name: "Astra Heritage", color: "from-[#0d2b1a] to-[#1a5c35]", badge: "🌿 ASTRA Heritage" },
  { name: "Astra Urban Flux", color: "from-[#3a0a0a] to-[#7a1a1a]", badge: "🔥 ASTRA Sport" },
];

interface HeroSlide {
  id: number;
  bg_url: string;
  bg_type: 'video' | 'image';
  title: string;
  subtitle: string;
  btn1_text: string;
  btn1_link: string;
  btn2_text: string;
  btn2_link: string;
}

function FeaturedCarousel({ images, btnText }: { images: string[], btnText?: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % FEATURED_ITEMS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-5">
      <div className="relative overflow-hidden rounded-3xl aspect-[3/4] md:aspect-[21/9] group cursor-pointer" onClick={() => navigate('/store')}>
        <div 
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] h-full" 
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {FEATURED_ITEMS.map((item, i) => (
            <div key={i} className={`min-w-full h-full relative bg-gradient-to-br ${item.color}`}>
               <img 
                 src={images[i] || `https://picsum.photos/seed/shoe${i}/1200/800`} 
                 alt={item.name} 
                 className="w-full h-full object-cover" 
                 loading="lazy" 
               />
               <div className="absolute bottom-0 inset-x-0 p-8 md:p-12 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                  <div>
                    <h3 className="text-4xl md:text-6xl font-bold mb-2">{item.name}</h3>
                    <p className="text-white/80 text-lg">Experience the next level of comfort.</p>
                  </div>
                  <button className="bg-white/90 backdrop-blur-sm text-black text-xs px-6 py-3 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-lg">
                    {btnText || 'Buy Now'}
                  </button>
               </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Dots */}
      <div className="flex justify-center gap-3 mt-8">
        {FEATURED_ITEMS.map((_, i) => (
          <button 
            key={i} 
            className={`h-2 rounded-full transition-all duration-300 ${activeIndex === i ? 'bg-white w-8' : 'bg-white/30 w-2 hover:bg-white/50'}`}
            onClick={() => setActiveIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [content, setContent] = useState<any>(null);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    // Scroll to top on mount and reset overflow
    window.scrollTo(0, 0);
    document.body.style.overflow = '';

    // Fetch Content
    const fetchContent = async () => {
      const { data } = await supabase
        .from('landing_page_content')
        .select('*')
        .single();
      if (data) setContent(data);

      const { data: slides } = await supabase
        .from('hero_slides')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (slides && slides.length > 0) {
        setHeroSlides(slides);
      } else {
        // Fallback if no slides in DB
        setHeroSlides([{
          id: 0,
          bg_url: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-traffic-at-night-34565-large.mp4',
          bg_type: 'video',
          title: 'BORN TO CRUSH LAND',
          subtitle: "From gully cricket to the world's biggest stage, the game remains the same—you have to beat the odds.",
          btn1_text: 'Customization',
          btn1_link: '/customize',
          btn2_text: 'Shop Now',
          btn2_link: '/store'
        }]);
      }
    };
    fetchContent();

    // Animations
    const ctx = gsap.context(() => {
      // Navbar Scroll Animation
      ScrollTrigger.create({
        start: 'top -100',
        end: 99999,
        onUpdate: (self) => {
          setIsScrolled(self.direction === 1 && self.scroll() > 100);
        }
      });

      // Featured Section Parallax
      gsap.fromTo('.featured-title', 
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          scrollTrigger: {
            trigger: '.featured-section',
            start: 'top 80%',
            end: 'top 50%',
            scrub: 1
          }
        }
      );

      // Promo Images Parallax
      gsap.utils.toArray('.promo-card').forEach((card: any) => {
        const img = card.querySelector('img');
        gsap.to(img, {
          scale: 1.1,
          ease: 'none',
          scrollTrigger: {
            trigger: card,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        });
      });

      // Marquee Animation
      gsap.utils.toArray('.marquee').forEach((el: any, index) => {
        const track = el.querySelector('.track');
        const [x, xEnd] = (index % 2 === 0) ? [0, -1000] : [0, -1500];
        
        gsap.fromTo(track, 
          { x }, 
          {
            x: xEnd,
            scrollTrigger: {
              trigger: '.fold-effect-section',
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1
            }
          }
        );
      });
    }, scrollRef);

    return () => {
      ctx.revert();
    };
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  // Auto-advance slides
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // Handle active video playback and ensure others are stopped
  useEffect(() => {
    videoRefs.current.forEach((vid, index) => {
      if (!vid) return;
      if (index === currentSlide) {
        vid.currentTime = 0;
        if (heroSlides[index]?.bg_type === 'video' && isPlaying) {
          vid.play().catch((e) => console.log('Autoplay prevented:', e));
        } else {
          vid.pause();
        }
        vid.muted = isMuted;
      } else {
        vid.pause();
        vid.muted = true;
      }
    });
  }, [currentSlide, isPlaying, isMuted, heroSlides]);

  const togglePlay = () => {
    const video = videoRefs.current[currentSlide];
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const activeSlide = heroSlides[currentSlide];

  return (
    <div className="landing-page bg-[#050505] text-white min-h-screen font-sans no-scrollbar" ref={scrollRef}>
      
      <Navbar isScrolled={isScrolled} />

      {/* Hero Section - Minimalistic Slider */}
      <section className="hero-section relative h-screen w-full overflow-hidden bg-black">
        {heroSlides.map((slide, index) => (
          <div 
            key={slide.id || index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            {/* Background Media */}
            <div className="absolute inset-0 bg-black">
              {slide.bg_type === 'image' ? (
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${slide.bg_url || 'https://images.unsplash.com/photo-1556906781-9a412961d28c?q=80&w=2000&auto=format&fit=crop'})` }}
                />
              ) : (
                <video 
                  ref={el => videoRefs.current[index] = el}
                  className="absolute inset-0 w-full h-full object-cover"
                  src={slide.bg_url || 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-traffic-at-night-34565-large.mp4'}
                  autoPlay 
                  loop 
                  muted={isMuted} 
                  playsInline
                />
              )}
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
            </div>

            {/* Content - Minimalistic Center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 md:px-20 max-w-7xl mx-auto text-center">
              <div className="max-w-5xl animate-fade-in-up flex flex-col items-center">
                <h1 className="font-oswald text-5xl md:text-7xl lg:text-8xl font-bold uppercase mb-6 text-white leading-none tracking-tight drop-shadow-2xl">
                  {slide.title || 'BORN TO CRUSH LAND'}
                </h1>
                <p className="text-base md:text-xl text-white/90 mb-10 max-w-2xl drop-shadow-md font-medium leading-relaxed">
                  {slide.subtitle || "From gully cricket to the world's biggest stage, the game remains the same—you have to beat the odds."}
                </p>
                
                <div className="flex flex-row items-center justify-center gap-3 md:gap-6">
                  {slide.btn1_text && (
                    <button 
                      className="bg-white text-black w-36 sm:w-40 md:w-52 h-12 md:h-14 rounded-full font-bold uppercase tracking-widest hover:bg-gray-200 transition-all hover:scale-105 text-[10px] md:text-sm flex items-center justify-center whitespace-nowrap shadow-lg"
                      onClick={() => navigate(slide.btn1_link || '/store')}
                    >
                      {slide.btn1_text}
                    </button>
                  )}
                  {slide.btn2_text && (
                    <button 
                      className="border border-white/50 backdrop-blur-sm text-white w-36 sm:w-40 md:w-52 h-12 md:h-14 rounded-full font-bold uppercase tracking-widest hover:bg-white/10 transition-all hover:scale-105 text-[10px] md:text-sm flex items-center justify-center gap-2 whitespace-nowrap shadow-lg" 
                      onClick={() => navigate(slide.btn2_link || '/store')}
                    >
                      <span>{slide.btn2_text}</span>
                      <Play size={10} fill="currentColor" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Video Controls (Mute & Play/Pause) */}
        {activeSlide?.bg_type === 'video' && (
          <div className="absolute bottom-8 right-8 z-30 flex gap-3">
            <button 
              onClick={togglePlay}
              className="bg-white/10 backdrop-blur-md p-3 rounded-full hover:bg-white/20 transition-colors"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="bg-white/10 backdrop-blur-md p-3 rounded-full hover:bg-white/20 transition-colors"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>
        )}

        {/* Slider Navigation Arrows */}
        {heroSlides.length > 1 && (
          <>
            <button 
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/20 hover:bg-black/50 text-white p-3 rounded-full backdrop-blur-sm transition-all hidden md:block"
            >
              <ChevronLeft size={32} />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/20 hover:bg-black/50 text-white p-3 rounded-full backdrop-blur-sm transition-all hidden md:block"
            >
              <ChevronRight size={32} />
            </button>
            
            {/* Dots for Mobile */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2 md:hidden">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? 'bg-white w-6' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Featured Carousel */}
      <section className="featured-section py-20 bg-black overflow-hidden">
        <h2 className="featured-title text-3xl md:text-4xl font-bold text-white px-6 mb-10">Featured</h2>
        <FeaturedCarousel 
          images={[
            content?.feature_card1_img,
            content?.feature_card2_img,
            content?.feature_card3_img,
            content?.feature_card1_img
          ]} 
          btnText={content?.feature_btn_text}
        />
      </section>

      {/* New Arrivals Promo - Full View Images */}
      <section className="bg-[#f5f5f7] py-0">
        <div className="grid md:grid-cols-2">
          {/* Promo Card 1 */}
          <div className="promo-card bg-black text-white min-h-[600px] flex flex-col items-center justify-center p-10 text-center relative overflow-hidden group">
             {/* Full Background Image */}
             <div className="absolute inset-0 z-0">
               <img 
                 src={content?.feature_bottom_img1 || "https://picsum.photos/seed/storm/800/800"} 
                 className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" 
                 alt="Storm Runner" 
               />
               <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-500" />
             </div>
             
             {/* Content */}
             <div className="relative z-10 flex flex-col items-center">
               <h2 className="text-5xl md:text-6xl font-bold mb-4 tracking-tighter uppercase drop-shadow-xl">STORM RUNNER</h2>
               <p className="text-white/90 text-lg max-w-md mb-8 drop-shadow-md font-medium">Built for the streets. Inspired by champions who never stop.</p>
               <button 
                 className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors uppercase tracking-widest" 
                 onClick={() => navigate(content?.promo_btn1_link || '/store')}
               >
                 {content?.promo_btn1_text || 'Shop'}
               </button>
             </div>
          </div>

          {/* Promo Card 2 */}
          <div className="promo-card bg-[#f5f5f7] text-black min-h-[600px] flex flex-col items-center justify-center p-10 text-center relative overflow-hidden group">
             {/* Full Background Image */}
             <div className="absolute inset-0 z-0">
               <img 
                 src={content?.feature_bottom_img2 || "https://picsum.photos/seed/artwalk/800/800"} 
                 className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" 
                 alt="Art Walk" 
               />
               <div className="absolute inset-0 bg-white/20 group-hover:bg-white/10 transition-colors duration-500" />
             </div>

             {/* Content */}
             <div className="relative z-10 flex flex-col items-center">
               <h2 className="text-5xl md:text-6xl font-bold mb-4 tracking-tighter uppercase drop-shadow-xl text-black">Astra Art-Walk</h2>
               <p className="text-black/80 text-lg max-w-md mb-8 drop-shadow-sm font-medium">The world's most stylish everyday performance sneaker.</p>
               <button 
                 className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors uppercase tracking-widest" 
                 onClick={() => navigate(content?.promo_btn2_link || '/store')}
               >
                 {content?.promo_btn2_text || 'Buy'}
               </button>
             </div>
          </div>
        </div>
      </section>

      {/* Fold Effect Section */}
      <section className="fold-effect-section relative min-h-screen bg-black flex items-center justify-center overflow-hidden py-20">
         <div className="flex flex-col gap-0 w-full">
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i} className="marquee overflow-hidden whitespace-nowrap py-4 border-b border-white/10">
                <div className="track text-[4rem] md:text-[8rem] font-bold text-white/20 uppercase leading-none">
                  Creators. <span className="text-[#C8A882]">Thinkers.</span> Innovators. Rebels. Creators. <span className="text-[#C8A882]">Thinkers.</span> Innovators. Rebels.
                </div>
              </div>
            ))}
         </div>
      </section>

      {/* Footer Visuals with shader background */}
      <section className="relative bg-black py-32 flex flex-col items-center justify-center overflow-hidden">
         <ShaderBackground className="absolute inset-0 pointer-events-none" />
         <button
           className="bg-white text-black px-10 py-4 rounded-full font-bold text-sm tracking-widest hover:scale-105 transition-transform z-10"
           onClick={() => navigate('/store')}
         >
           GO TO ASTRA STORE
         </button>
         <div className="absolute bottom-5 right-5 text-white/40 text-xs uppercase tracking-widest z-10">
           - LOVE BY PRAKHAR DEV
         </div>
      </section>

      {/* Legal Footer */}
      <footer className="bg-[#050505] border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-5 flex flex-wrap justify-between items-center gap-5">
           <div className="flex gap-6 text-xs text-gray-500 font-semibold tracking-wide">
             <a href="#" className="hover:text-white transition-colors">ABOUT US</a>
             <a href="#" className="hover:text-white transition-colors">TERMS & CONDITIONS</a>
           </div>
           <div className="text-xs text-gray-600">
             2026 Astra Sneakers. All rights reserved.
           </div>
        </div>
      </footer>

    </div>
  );
}
