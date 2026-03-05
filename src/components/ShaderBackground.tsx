import { useEffect, useRef } from 'react';

const vertexShaderSource = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
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
`;

interface ShaderBackgroundProps {
  className?: string;
}

export default function ShaderBackground({ className = '' }: ShaderBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      -1, 1,
      1, -1,
      1, 1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const mouseLocation = gl.getUniformLocation(program, 'u_mouse');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');

    let mouseX = 0.5;
    let mouseY = 0.5;

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = (event.clientX - rect.left) / rect.width;
      mouseY = 1.0 - (event.clientY - rect.top) / rect.height;
    };

    window.addEventListener('pointermove', handlePointerMove);

    let startTime = performance.now();
    let frameId: number;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = canvas.clientWidth || canvas.offsetWidth || 1;
      const displayHeight = canvas.clientHeight || canvas.offsetHeight || 1;
      const width = Math.floor(displayWidth * dpr);
      const height = Math.floor(displayHeight * dpr);

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      gl.viewport(0, 0, width, height);
      gl.uniform2f(resolutionLocation, width, height);
    };

    const render = () => {
      frameId = requestAnimationFrame(render);
      resize();

      const now = performance.now();
      const time = (now - startTime) / 1000;

      gl.uniform1f(timeLocation, time);
      gl.uniform2f(mouseLocation, mouseX, mouseY);

      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    render();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full block ${className}`}
    />
  );
}

