import{a as c,j as e,u as z,P,f as B,V as L,g as M,h as O,i as D}from"./vendor-react-BRR8l7E3.js";import{g as w,S as F}from"./vendor-gsap-C0eCJjti.js";import{s as E}from"./supabase-DvCGyeLC.js";import{N as V}from"./Navbar-GQ1G9LhT.js";import"./vendor-B7nj5sjL.js";import"./vendor-clerk-CAh9SInE.js";import"./vendor-supabase-Aq2CBfvM.js";const q=`
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`,$=`
precision mediump float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
varying vec2 v_uv;

float hash(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for(int i = 0; i < 5; i++) {
        value += amplitude * noise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    
    return value;
}

float voronoise(vec2 p, float u, float v) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    
    float k = 1.0 + 63.0 * pow(1.0 - v, 6.0);
    float va = 0.0;
    float wt = 0.0;
    
    for(int y = -2; y <= 2; y++) {
        for(int x = -2; x <= 2; x++) {
            vec2 g = vec2(float(x), float(y));
            vec3 o = vec3(hash(i + g), hash(i + g + vec2(13.1, 71.7)), hash(i + g + vec2(269.5, 183.3)));
            vec2 r = g - f + o.xy;
            float d = dot(r, r);
            float w = pow(1.0 - smoothstep(0.0, 1.414, sqrt(d)), k);
            va += w * o.z;
            wt += w;
        }
    }
    
    return va / wt;
}

float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

void main() {
    vec2 uv = v_uv;
    vec2 aspectUv = (v_uv - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
    
    vec2 moonPos = vec2(0.0, 0.15);
    float distToMoon = length(aspectUv - moonPos);
    float distToMouse = length(aspectUv - (u_mouse - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0));
    
    float mouseInfluence = smoothstep(0.5, 0.0, distToMouse);
    float glowBoost = 1.0 + mouseInfluence * 0.8;
    
    vec3 skyColor = mix(
        vec3(0.02, 0.03, 0.08),
        vec3(0.05, 0.08, 0.15),
        smoothstep(-0.5, 0.5, aspectUv.y)
    );
    
    float hillY = -0.3;
    float hillRadius = 0.8;
    vec2 hillCenter = vec2(0.0, hillY - hillRadius);
    float hillDist = sdCircle(aspectUv - hillCenter, hillRadius);
    float hill = smoothstep(0.01, -0.01, hillDist);
    
    float moonGlow = exp(-distToMoon * 3.0) * 0.6;
    moonGlow += exp(-distToMoon * 1.5) * 0.4;
    moonGlow *= glowBoost;
    
    vec2 noiseUv = aspectUv * 2.0;
    float timeFlow = u_time * 0.1;
    float atmosphere = fbm(noiseUv + vec2(timeFlow * 0.3, timeFlow * 0.2));
    atmosphere += fbm(noiseUv * 2.0 - vec2(timeFlow * 0.4, timeFlow * 0.15)) * 0.5;
    atmosphere *= 0.5;
    
    float angle = atan(aspectUv.x - moonPos.x, aspectUv.y - moonPos.y);
    float rayPattern = sin(angle * 12.0 + u_time * 0.5) * 0.5 + 0.5;
    rayPattern = pow(rayPattern, 3.0);
    
    float rayIntensity = exp(-distToMoon * 2.0) * rayPattern * 0.3;
    rayIntensity *= (1.0 + mouseInfluence * 0.5);
    
    float radialFalloff = smoothstep(0.8, 0.0, distToMoon);
    float atmosphericGlow = radialFalloff * (0.4 + atmosphere * 0.3);
    
    float particleSpeed = 0.05 + mouseInfluence * 0.1;
    vec2 particleUv = aspectUv * 8.0 + vec2(u_time * particleSpeed, u_time * particleSpeed * 0.5);
    float particles = voronoise(particleUv, 0.5, 0.8);
    particles *= smoothstep(0.6, 0.0, distToMoon);
    particles *= 0.15;
    
    float mist = fbm(aspectUv * 4.0 + vec2(u_time * 0.08, u_time * 0.05));
    mist *= smoothstep(0.5, 0.0, distToMoon) * 0.2;
    
    float shimmer = sin(u_time * 3.0 + distToMoon * 10.0) * 0.5 + 0.5;
    shimmer *= mouseInfluence * 0.2;
    
    vec2 starUv = aspectUv * 20.0;
    float stars = 0.0;
    for(int i = 0; i < 3; i++) {
        vec2 offset = vec2(float(i) * 123.45, float(i) * 67.89);
        float star = hash(floor(starUv + offset));
        if(star > 0.98 && aspectUv.y > 0.2) {
            vec2 starPos = fract(starUv + offset);
            float starDist = length(starPos - 0.5);
            stars += smoothstep(0.1, 0.0, starDist) * 0.3;
        }
    }
    
    float pulse = sin(u_time * 0.8) * 0.5 + 0.5;
    float moonCore = exp(-distToMoon * 8.0) * (0.8 + pulse * 0.2);
    moonCore *= glowBoost;
    
    vec3 moonColor = vec3(0.9, 0.95, 1.0);
    vec3 glowColor = vec3(0.6, 0.7, 0.9);
    vec3 atmosphereColor = vec3(0.3, 0.4, 0.6);
    vec3 mistColor = vec3(0.5, 0.6, 0.8);
    
    vec3 color = skyColor;
    
    color += atmosphereColor * atmosphericGlow;
    color += glowColor * moonGlow;
    color += moonColor * moonCore;
    color += glowColor * rayIntensity;
    color += mistColor * (particles + mist);
    color += vec3(1.0) * shimmer;
    color += vec3(0.8, 0.9, 1.0) * stars;
    
    color = mix(color, vec3(0.0), hill);
    
    float vignette = smoothstep(1.2, 0.3, length(aspectUv));
    color *= vignette;
    
    gl_FragColor = vec4(color, 1.0);
}
`;function G({className:n=""}){const m=c.useRef(null);return c.useEffect(()=>{const r=m.current;if(!r)return;const t=r.getContext("webgl");if(!t)return;const a=(u,f)=>{const x=t.createShader(u);return t.shaderSource(x,f),t.compileShader(x),t.getShaderParameter(x,t.COMPILE_STATUS)?x:(console.error(t.getShaderInfoLog(x)),t.deleteShader(x),null)},h=a(t.VERTEX_SHADER,q),s=a(t.FRAGMENT_SHADER,$);if(!h||!s)return;const d=t.createProgram();if(t.attachShader(d,h),t.attachShader(d,s),t.linkProgram(d),!t.getProgramParameter(d,t.LINK_STATUS)){console.error(t.getProgramInfoLog(d));return}t.useProgram(d);const b=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,b);const j=new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]);t.bufferData(t.ARRAY_BUFFER,j,t.STATIC_DRAW);const g=t.getAttribLocation(d,"a_position");t.enableVertexAttribArray(g),t.vertexAttribPointer(g,2,t.FLOAT,!1,0,0);const A=t.getUniformLocation(d,"u_time"),v=t.getUniformLocation(d,"u_mouse"),T=t.getUniformLocation(d,"u_resolution");let y=.5,k=.5;const N=u=>{const f=r.getBoundingClientRect();y=(u.clientX-f.left)/f.width,k=1-(u.clientY-f.top)/f.height};window.addEventListener("pointermove",N);let R=performance.now(),_;const o=()=>{const u=window.devicePixelRatio||1,f=r.clientWidth||r.offsetWidth||1,x=r.clientHeight||r.offsetHeight||1,S=Math.floor(f*u),C=Math.floor(x*u);(r.width!==S||r.height!==C)&&(r.width=S,r.height=C),t.viewport(0,0,S,C),t.uniform2f(T,S,C)};let l=!0;const i=new IntersectionObserver(u=>{l=u[0].isIntersecting},{threshold:0});i.observe(r);const p=()=>{if(_=requestAnimationFrame(p),!l)return;o();const f=(performance.now()-R)/1e3;t.uniform1f(A,f),t.uniform2f(v,y,k),t.clearColor(0,0,0,1),t.clear(t.COLOR_BUFFER_BIT),t.drawArrays(t.TRIANGLES,0,6)};return p(),()=>{cancelAnimationFrame(_),i.disconnect(),window.removeEventListener("pointermove",N)}},[]),e.jsx("canvas",{ref:m,className:`w-full h-full block ${n}`})}function I({src:n,alt:m,className:r,...t}){let a=n;return n&&n.includes("unsplash.com")&&(a=n.includes("?")?`${n}&fm=webp&q=80`:`${n}?fm=webp&q=80`),e.jsxs("picture",{className:"w-full h-full block",children:[a!==n&&e.jsx("source",{srcSet:a,type:"image/webp"}),e.jsx("img",{src:n,alt:m,className:r,loading:"lazy",decoding:"async",...t})]})}w.registerPlugin(F);const U=[{name:"Astra Volt '98",color:"from-[#0f3460] to-[#1a1a2e]",badge:"⚡ ASTRA Running"},{name:"Astra Art-Walk",color:"from-[#2d1b69] to-[#11013b]",badge:"✦ ASTRA Street"},{name:"Astra Heritage",color:"from-[#0d2b1a] to-[#1a5c35]",badge:"🌿 ASTRA Heritage"},{name:"Astra Urban Flux",color:"from-[#3a0a0a] to-[#7a1a1a]",badge:"🔥 ASTRA Sport"}];function H({images:n,btnText:m}){const[r,t]=c.useState(0),a=z();return c.useEffect(()=>{const h=setInterval(()=>{t(s=>(s+1)%U.length)},4e3);return()=>clearInterval(h)},[]),e.jsxs("div",{className:"w-full max-w-7xl mx-auto px-5",children:[e.jsx("div",{className:"relative overflow-hidden rounded-3xl aspect-[3/4] md:aspect-[21/9] group cursor-pointer",onClick:()=>a("/store"),children:e.jsx("div",{className:"flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] h-full",style:{transform:`translateX(-${r*100}%)`},children:U.map((h,s)=>e.jsxs("div",{className:`min-w-full h-full relative bg-gradient-to-br ${h.color}`,children:[e.jsx(I,{src:n[s]||`https://picsum.photos/seed/shoe${s}/1200/800`,alt:h.name,className:"w-full h-full object-cover",loading:"lazy",width:"1200",height:"800"}),e.jsxs("div",{className:"absolute bottom-0 inset-x-0 p-8 md:p-12 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col md:flex-row items-start md:items-end justify-between gap-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-4xl md:text-6xl font-bold mb-2",children:h.name}),e.jsx("p",{className:"text-white/80 text-lg",children:"Experience the next level of comfort."})]}),e.jsx("button",{className:"bg-white/90 backdrop-blur-sm text-black text-xs px-6 py-3 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-lg",children:m||"Buy Now"})]})]},s))})}),e.jsx("div",{className:"flex justify-center gap-3 mt-8",children:U.map((h,s)=>e.jsx("button",{className:`h-2 rounded-full transition-all duration-300 ${r===s?"bg-white w-8":"bg-white/30 w-2 hover:bg-white/50"}`,onClick:()=>t(s),"aria-label":`Go to slide ${s+1}`},s))})]})}function ee(){const n=c.useRef(null),m=z(),[r,t]=c.useState(!1),[a,h]=c.useState(null),[s,d]=c.useState([]),[b,j]=c.useState(0),[g,A]=c.useState(!0),[v,T]=c.useState(!0),y=c.useRef([]);c.useEffect(()=>{window.scrollTo(0,0),document.body.style.overflow="",(async()=>{const{data:i}=await E.from("landing_page_content").select("*").single();i&&h(i);const{data:p}=await E.from("hero_slides").select("*").order("sort_order",{ascending:!0});p&&p.length>0?d(p):d([{id:0,bg_url:"https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-traffic-at-night-34565-large.mp4",bg_type:"video",title:"BORN TO CRUSH LAND",subtitle:"From gully cricket to the world's biggest stage, the game remains the same—you have to beat the odds.",btn1_text:"Customization",btn1_link:"/customize",btn2_text:"Shop Now",btn2_link:"/store"}])})();const l=w.context(()=>{F.create({start:"top -100",end:99999,onUpdate:i=>{t(i.direction===1&&i.scroll()>100)}}),w.fromTo(".featured-title",{y:50,opacity:0},{y:0,opacity:1,duration:1,scrollTrigger:{trigger:".featured-section",start:"top 80%",end:"top 50%",scrub:1}}),w.utils.toArray(".promo-card").forEach(i=>{const p=i.querySelector("img");w.to(p,{scale:1.1,ease:"none",scrollTrigger:{trigger:i,start:"top bottom",end:"bottom top",scrub:!0}})}),w.utils.toArray(".marquee").forEach((i,p)=>{const u=i.querySelector(".track"),[f,x]=p%2===0?[0,-1e3]:[0,-1500];w.fromTo(u,{x:f},{x,scrollTrigger:{trigger:".fold-effect-section",start:"top bottom",end:"bottom top",scrub:1}})})},n);return()=>{l.revert()}},[]);const k=()=>{j(o=>(o+1)%s.length)},N=()=>{j(o=>(o-1+s.length)%s.length)};c.useEffect(()=>{if(s.length<=1)return;const o=setInterval(k,6e3);return()=>clearInterval(o)},[s.length]),c.useEffect(()=>{y.current.forEach((o,l)=>{o&&(l===b?(o.currentTime=0,s[l]?.bg_type==="video"&&v?o.play().catch(i=>console.log("Autoplay prevented:",i)):o.pause(),o.muted=g):(o.pause(),o.muted=!0))})},[b,v,g,s]);const R=()=>{const o=y.current[b];o&&(v?o.pause():o.play(),T(!v))},_=s[b];return e.jsxs("main",{className:"landing-page bg-[#050505] text-white min-h-screen font-sans no-scrollbar",ref:n,children:[e.jsx(V,{isScrolled:r}),e.jsxs("section",{className:"hero-section relative h-screen w-full overflow-hidden bg-black",children:[s.map((o,l)=>e.jsxs("div",{className:`absolute inset-0 transition-opacity duration-1000 ease-in-out ${l===b?"opacity-100 z-10":"opacity-0 z-0"}`,children:[e.jsxs("div",{className:"absolute inset-0 bg-black",children:[o.bg_type==="image"?e.jsx("div",{className:"absolute inset-0 bg-cover bg-center",style:{backgroundImage:`url(${o.bg_url||"https://images.unsplash.com/photo-1556906781-9a412961d28c?q=80&w=2000&auto=format&fit=crop"})`}}):e.jsx("video",{ref:i=>y.current[l]=i,className:"absolute inset-0 w-full h-full object-cover",src:o.bg_url||"https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-traffic-at-night-34565-large.mp4",autoPlay:!0,loop:!0,muted:g,playsInline:!0}),e.jsx("div",{className:"absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40"})]}),e.jsx("div",{className:"absolute inset-0 flex flex-col items-center justify-center px-6 md:px-20 max-w-7xl mx-auto text-center",children:e.jsxs("div",{className:"max-w-5xl animate-fade-in-up flex flex-col items-center",children:[e.jsx("h1",{className:"font-oswald text-5xl md:text-7xl lg:text-8xl font-bold uppercase mb-6 text-white leading-none tracking-tight drop-shadow-2xl",children:o.title||"BORN TO CRUSH LAND"}),e.jsx("p",{className:"text-base md:text-xl text-white/90 mb-10 max-w-2xl drop-shadow-md font-medium leading-relaxed",children:o.subtitle||"From gully cricket to the world's biggest stage, the game remains the same—you have to beat the odds."}),e.jsxs("div",{className:"flex flex-row items-center justify-center gap-3 md:gap-6",children:[o.btn1_text&&e.jsx("button",{className:"bg-white text-black w-36 sm:w-40 md:w-52 h-12 md:h-14 rounded-full font-bold uppercase tracking-widest hover:bg-gray-200 transition-all hover:scale-105 text-[10px] md:text-sm flex items-center justify-center whitespace-nowrap shadow-lg",onClick:()=>m(o.btn1_link||"/store"),children:o.btn1_text}),o.btn2_text&&e.jsxs("button",{className:"border border-white/50 backdrop-blur-sm text-white w-36 sm:w-40 md:w-52 h-12 md:h-14 rounded-full font-bold uppercase tracking-widest hover:bg-white/10 transition-all hover:scale-105 text-[10px] md:text-sm flex items-center justify-center gap-2 whitespace-nowrap shadow-lg",onClick:()=>m(o.btn2_link||"/store"),children:[e.jsx("span",{children:o.btn2_text}),e.jsx(P,{size:10,fill:"currentColor"})]})]})]})})]},o.id||l)),_?.bg_type==="video"&&e.jsxs("div",{className:"absolute bottom-8 right-8 z-30 flex gap-3",children:[e.jsx("button",{onClick:R,"aria-label":v?"Pause Background Video":"Play Background Video",className:"bg-white/10 backdrop-blur-md p-3 rounded-full hover:bg-white/20 transition-colors",children:v?e.jsx(B,{size:20}):e.jsx(P,{size:20})}),e.jsx("button",{onClick:()=>A(!g),"aria-label":g?"Unmute Background Video":"Mute Background Video",className:"bg-white/10 backdrop-blur-md p-3 rounded-full hover:bg-white/20 transition-colors",children:g?e.jsx(L,{size:20}):e.jsx(M,{size:20})})]}),s.length>1&&e.jsxs(e.Fragment,{children:[e.jsx("button",{onClick:N,"aria-label":"Previous Slide",className:"absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/20 hover:bg-black/50 text-white p-3 rounded-full backdrop-blur-sm transition-all hidden md:block",children:e.jsx(O,{size:32})}),e.jsx("button",{onClick:k,"aria-label":"Next Slide",className:"absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/20 hover:bg-black/50 text-white p-3 rounded-full backdrop-blur-sm transition-all hidden md:block",children:e.jsx(D,{size:32})}),e.jsx("div",{className:"absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2 md:hidden",children:s.map((o,l)=>e.jsx("button",{onClick:()=>j(l),"aria-label":`Go to hero slide ${l+1}`,className:`w-2 h-2 rounded-full transition-all ${l===b?"bg-white w-6":"bg-white/50"}`},l))})]})]}),e.jsxs("section",{className:"featured-section py-20 bg-black overflow-hidden",children:[e.jsx("h2",{className:"featured-title text-3xl md:text-4xl font-bold text-white px-6 mb-10",children:"Featured"}),e.jsx(H,{images:[a?.feature_card1_img,a?.feature_card2_img,a?.feature_card3_img,a?.feature_card1_img],btnText:a?.feature_btn_text})]}),e.jsx("section",{className:"bg-[#f5f5f7] py-0",children:e.jsxs("div",{className:"grid md:grid-cols-2",children:[e.jsxs("div",{className:"promo-card bg-black text-white min-h-[600px] flex flex-col items-center justify-center p-10 text-center relative overflow-hidden group",children:[e.jsxs("div",{className:"absolute inset-0 z-0",children:[e.jsx(I,{src:a?.feature_bottom_img1||"https://picsum.photos/seed/storm/800/800",className:"w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700",alt:"Storm Runner",loading:"lazy",width:"800",height:"800"}),e.jsx("div",{className:"absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-500"})]}),e.jsxs("div",{className:"relative z-10 flex flex-col items-center",children:[e.jsx("h2",{className:"text-5xl md:text-6xl font-bold mb-4 tracking-tighter uppercase drop-shadow-xl",children:"STORM RUNNER"}),e.jsx("p",{className:"text-white/90 text-lg max-w-md mb-8 drop-shadow-md font-medium",children:"Built for the streets. Inspired by champions who never stop."}),e.jsx("button",{className:"bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors uppercase tracking-widest",onClick:()=>m(a?.promo_btn1_link||"/store"),children:a?.promo_btn1_text||"Shop"})]})]}),e.jsxs("div",{className:"promo-card bg-[#f5f5f7] text-black min-h-[600px] flex flex-col items-center justify-center p-10 text-center relative overflow-hidden group",children:[e.jsxs("div",{className:"absolute inset-0 z-0",children:[e.jsx(I,{src:a?.feature_bottom_img2||"https://picsum.photos/seed/artwalk/800/800",className:"w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700",alt:"Art Walk",loading:"lazy",width:"800",height:"800"}),e.jsx("div",{className:"absolute inset-0 bg-white/20 group-hover:bg-white/10 transition-colors duration-500"})]}),e.jsxs("div",{className:"relative z-10 flex flex-col items-center",children:[e.jsx("h2",{className:"text-5xl md:text-6xl font-bold mb-4 tracking-tighter uppercase drop-shadow-xl text-black",children:"Astra Art-Walk"}),e.jsx("p",{className:"text-black/80 text-lg max-w-md mb-8 drop-shadow-sm font-medium",children:"The world's most stylish everyday performance sneaker."}),e.jsx("button",{className:"bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors uppercase tracking-widest",onClick:()=>m(a?.promo_btn2_link||"/store"),children:a?.promo_btn2_text||"Buy"})]})]})]})}),e.jsx("section",{className:"fold-effect-section relative min-h-screen bg-black flex items-center justify-center overflow-hidden py-20",children:e.jsx("div",{className:"flex flex-col gap-0 w-full",children:[1,2,3,4].map((o,l)=>e.jsx("div",{className:"marquee overflow-hidden whitespace-nowrap py-4 border-b border-white/10",children:e.jsxs("div",{className:"track text-[4rem] md:text-[8rem] font-bold text-white/20 uppercase leading-none",children:["Creators. ",e.jsx("span",{className:"text-[#C8A882]",children:"Thinkers."})," Innovators. Rebels. Creators. ",e.jsx("span",{className:"text-[#C8A882]",children:"Thinkers."})," Innovators. Rebels."]})},l))})}),e.jsxs("section",{className:"relative bg-black py-32 flex flex-col items-center justify-center overflow-hidden",children:[e.jsx(G,{className:"absolute inset-0 pointer-events-none"}),e.jsx("button",{className:"bg-white text-black px-10 py-4 rounded-full font-bold text-sm tracking-widest hover:scale-105 transition-transform z-10",onClick:()=>m("/store"),children:"GO TO ASTRA STORE"}),e.jsx("div",{className:"absolute bottom-5 right-5 text-white/40 text-xs uppercase tracking-widest z-10",children:"- LOVE BY PRAKHAR DEV"})]}),e.jsx("footer",{className:"bg-[#050505] border-t border-white/10 py-8",children:e.jsxs("div",{className:"max-w-7xl mx-auto px-5 flex flex-wrap justify-between items-center gap-5",children:[e.jsxs("div",{className:"flex gap-6 text-xs text-gray-500 font-semibold tracking-wide",children:[e.jsx("a",{href:"#",className:"hover:text-white transition-colors",children:"ABOUT US"}),e.jsx("a",{href:"#",className:"hover:text-white transition-colors",children:"TERMS & CONDITIONS"})]}),e.jsx("div",{className:"text-xs text-gray-600",children:"2026 Astra Sneakers. All rights reserved."})]})})]})}export{ee as default};
