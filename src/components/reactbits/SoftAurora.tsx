import { Renderer, Program, Mesh, Triangle } from 'ogl';
import { useEffect, useRef } from 'react';

interface SoftAuroraProps {
  speed?: number;
  scale?: number;
  brightness?: number;
  color1?: string;
  color2?: string;
  noiseFrequency?: number;
  noiseAmplitude?: number;
  bandHeight?: number;
  bandSpread?: number;
  octaveDecay?: number;
  layerOffset?: number;
  colorSpeed?: number;
  enableMouseInteraction?: boolean;
  mouseInfluence?: number;
  /** Radius of the pointer's local effect, in units of the canvas height. */
  mouseRadius?: number;
  lightMode?: boolean;
  /**
   * Pointer position normalised to the container, driven by the parent.
   * Needed when the layer is `pointer-events-none`: the canvas then never
   * receives a mousemove, so it cannot track the pointer itself.
   *
   * A REF, not a value: a value prop forces the parent to re-render React on
   * every pointer move, and avoiding that re-render is why the position used to
   * be quantised to a 0.002 step — which stepped the input and made the warp
   * look jerky. A ref updates in place: no render, no quantisation.
   */
  mouse?: { current: { x: number; y: number } };
}

function hexToVec3(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255
  ];
}

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform float uSpeed;
uniform float uScale;
uniform float uBrightness;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uNoiseFreq;
uniform float uNoiseAmp;
uniform float uBandHeight;
uniform float uBandSpread;
uniform float uOctaveDecay;
uniform float uLayerOffset;
uniform float uColorSpeed;
uniform vec2 uMouse;
uniform float uMouseInfluence;
uniform float uMouseRadius;
uniform bool uEnableMouse;
uniform float uLightMode;

#define TAU 6.28318

/**
 * Integer hash, not a sine hash.
 *
 * The original used fract(sin(p) * 43758.5453) three times per call, and this
 * runs eight times per perlin sample, three octaves deep, twice per glow, on two
 * overlapping layers: roughly 576 sin() evaluations per pixel per frame. That is
 * what blocked the main thread in 130ms chunks and made scrolling stutter.
 *
 * A multiply-xor hash is visually indistinguishable here and costs a few integer
 * ops, so the same picture draws for a fraction of the work.
 */
vec3 hash33(vec3 p) {
  p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
           dot(p, vec3(269.5, 183.3, 246.1)),
           dot(p, vec3(113.5, 271.9, 124.6)));
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.xxy + p.yxx) * p.zyx) * 2.0 - 1.0;
}

vec3 gradientHash(vec3 p) {
  return normalize(hash33(p) + vec3(0.0001));
}

float quinticSmooth(float t) {
  float t2 = t * t;
  float t3 = t * t2;
  return 6.0 * t3 * t2 - 15.0 * t2 * t2 + 10.0 * t3;
}

vec3 cosineGradient(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(TAU * (c * t + d));
}

float perlin3D(float amplitude, float frequency, float px, float py, float pz) {
  float x = px * frequency;
  float y = py * frequency;

  float fx = floor(x); float fy = floor(y); float fz = floor(pz);
  float cx = ceil(x);  float cy = ceil(y);  float cz = ceil(pz);

  vec3 g000 = gradientHash(vec3(fx, fy, fz));
  vec3 g100 = gradientHash(vec3(cx, fy, fz));
  vec3 g010 = gradientHash(vec3(fx, cy, fz));
  vec3 g110 = gradientHash(vec3(cx, cy, fz));
  vec3 g001 = gradientHash(vec3(fx, fy, cz));
  vec3 g101 = gradientHash(vec3(cx, fy, cz));
  vec3 g011 = gradientHash(vec3(fx, cy, cz));
  vec3 g111 = gradientHash(vec3(cx, cy, cz));

  float d000 = dot(g000, vec3(x - fx, y - fy, pz - fz));
  float d100 = dot(g100, vec3(x - cx, y - fy, pz - fz));
  float d010 = dot(g010, vec3(x - fx, y - cy, pz - fz));
  float d110 = dot(g110, vec3(x - cx, y - cy, pz - fz));
  float d001 = dot(g001, vec3(x - fx, y - fy, pz - cz));
  float d101 = dot(g101, vec3(x - cx, y - fy, pz - cz));
  float d011 = dot(g011, vec3(x - fx, y - cy, pz - cz));
  float d111 = dot(g111, vec3(x - cx, y - cy, pz - cz));

  float sx = quinticSmooth(x - fx);
  float sy = quinticSmooth(y - fy);
  float sz = quinticSmooth(pz - fz);

  float lx00 = mix(d000, d100, sx);
  float lx10 = mix(d010, d110, sx);
  float lx01 = mix(d001, d101, sx);
  float lx11 = mix(d011, d111, sx);

  float ly0 = mix(lx00, lx10, sy);
  float ly1 = mix(lx01, lx11, sy);

  return amplitude * mix(ly0, ly1, sz);
}

float auroraGlow(float t, vec2 shift) {
  vec2 uv = gl_FragCoord.xy / uResolution.y;
  uv += shift;

  float noiseVal = 0.0;
  float freq = uNoiseFreq;
  float amp = uNoiseAmp;
  vec2 samplePos = uv * uScale;

  // Two octaves, not three. The third only adds detail finer than a soft aurora
  // band can show, while costing another full perlin sample per pixel.
  for (float i = 0.0; i < 2.0; i += 1.0) {
    noiseVal += perlin3D(amp, freq, samplePos.x, samplePos.y, t);
    amp *= uOctaveDecay;
    freq *= 2.0;
  }

  float yBand = uv.y * 10.0 - uBandHeight * 10.0;
  return 0.3 * max(exp(uBandSpread * (1.0 - 1.1 * abs(noiseVal + yBand))), 0.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float t = uSpeed * 0.4 * uTime;

  // A LOCAL warp, not a global slide.
  //
  // This used to translate the entire aurora band by the pointer offset, so the
  // cursor dragged the whole sky sideways. Now the displacement is weighted by
  // distance from the cursor and vanishes outside uMouseRadius, so only the part
  // of the aurora near the pointer reacts and the rest keeps its own drift.
  vec2 shift = vec2(0.0);
  if (uEnableMouse) {
    // auroraGlow works in units of resolution.y, so the mouse is converted to
    // the same space before measuring distance.
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 m = uMouse * aspect;
    vec2 p = gl_FragCoord.xy / uResolution.y;
    vec2 toM = p - m;
    float dist = length(toM);

    // Smooth radial displacement.
    //
    // Two things made the previous version feel rough:
    //  - it used normalize(), whose direction is undefined at zero length, so
    //    the push flipped about as the cursor crossed a fragment;
    //  - its window peaked in slope right at the cursor, so the fastest movement
    //    happened exactly where the eye was looking.
    //
    // This displaces along the radius by a smoothstep of the distance: 0 at the
    // centre, maximum around half the radius, exactly 0 at the radius. Both the
    // value and its slope are continuous, and nothing outside the radius moves.
    float t = clamp(dist / max(uMouseRadius, 0.0001), 0.0, 1.0);
    float profile = smoothstep(0.0, 0.5, t) * (1.0 - smoothstep(0.5, 1.0, t));
    // Dividing by max(dist, eps) instead of normalize(): the direction stays
    // finite at the centre, where the profile is zero anyway.
    shift = (toM / max(dist, 1e-4)) * profile * uMouseInfluence;
  }

  float glow1 = auroraGlow(t, shift);
  float glow2 = auroraGlow(t + uLayerOffset, shift);
  vec3 gradient1 = cosineGradient(uv.x + uTime * uSpeed * 0.2 * uColorSpeed, vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.3, 0.20, 0.20));
  vec3 gradient2 = cosineGradient(uv.x + uTime * uSpeed * 0.1 * uColorSpeed, vec3(0.5), vec3(0.5), vec3(2.0, 1.0, 0.0), vec3(0.5, 0.20, 0.25));

  vec3 col = 0.99 * glow1 * gradient1 * uColor1;
  col += 0.99 * glow2 * gradient2 * uColor2;

  col *= uBrightness;
  float alpha = clamp(length(col), 0.0, 1.0);
  if (uLightMode > 0.5) {
    float phase1 = dot(gradient1, vec3(0.299, 0.587, 0.114));
    float phase2 = dot(gradient2, vec3(0.299, 0.587, 0.114));
    float weight1 = pow(max(glow1 * (0.62 + 0.38 * phase1), 0.0), 1.35);
    float weight2 = pow(max(glow2 * (0.62 + 0.38 * phase2), 0.0), 1.35);
    float weightSum = max(weight1 + weight2, 0.0001);
    vec3 chroma = (weight1 * uColor1 + weight2 * uColor2) / weightSum;
    float neutral = min(chroma.r, min(chroma.g, chroma.b));
    chroma = max(chroma - vec3(neutral * 0.78), vec3(0.0));
    float peak = max(chroma.r, max(chroma.g, chroma.b));
    chroma = pow(clamp(chroma / max(peak, 0.0001), 0.0, 1.0), vec3(1.08));
    float ink = clamp((weight1 + weight2) * uBrightness * 1.55, 0.0, 0.82);
    gl_FragColor = vec4(mix(vec3(1.0), chroma, ink), 1.0);
  } else {
    gl_FragColor = vec4(col, alpha);
  }
}
`;

export default function SoftAurora({
  speed = 0.6,
  scale = 1.5,
  brightness = 1.0,
  color1 = '#f7f7f7',
  color2 = '#e100ff',
  noiseFrequency = 2.5,
  noiseAmplitude = 1.0,
  bandHeight = 0.5,
  bandSpread = 1.0,
  octaveDecay = 0.1,
  layerOffset = 0,
  colorSpeed = 1.0,
  enableMouseInteraction = true,
  mouseInfluence = 0.25,
  mouseRadius = 0.45,
  lightMode = false,
  mouse,
}: SoftAuroraProps) {
  // Latest external pointer, read by the render loop every frame.
  const mouseRef = mouse;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    /**
     * Render below device resolution.
     *
     * The aurora is a smooth, low-frequency gradient: it carries no fine detail,
     * and on top of that it is masked and `screen`-blended, which hides any
     * softness. Drawing it at a fraction of the layout size cuts fragment work
     * by the SQUARE of that fraction, and fragment work is what was blocking the
     * main thread while scrolling.
     *
     * 0.5 gives a 4x reduction. The canvas is stretched back to full size by CSS,
     * so the visual result is a slightly softer band, which is what an aurora
     * looks like anyway.
     */
    const RESOLUTION_SCALE = 0.5;
    const renderer = new Renderer({ alpha: true, premultipliedAlpha: false, dpr: RESOLUTION_SCALE });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    let program: Program;
    let currentMouse = [0.5, 0.5];
    let targetMouse = [0.5, 0.5];

    function handleMouseMove(e: MouseEvent) {
      const rect = gl.canvas.getBoundingClientRect();
      targetMouse = [
        (e.clientX - rect.left) / rect.width,
        1.0 - (e.clientY - rect.top) / rect.height
      ];
    }

    function handleMouseLeave() {
      targetMouse = [0.5, 0.5];
    }

    function resize() {
      // `setSize` applies the renderer's dpr, so the drawing buffer is
      // RESOLUTION_SCALE times the layout size while the element still fills it.
      renderer.setSize(container.offsetWidth, container.offsetHeight);
      if (program) {
        program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height];
      }
    }
    window.addEventListener('resize', resize);
    resize();

    const geometry = new Triangle(gl);
    program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height] },
        uSpeed: { value: speed },
        uScale: { value: scale },
        uBrightness: { value: brightness },
        uColor1: { value: hexToVec3(color1) },
        uColor2: { value: hexToVec3(color2) },
        uNoiseFreq: { value: noiseFrequency },
        uNoiseAmp: { value: noiseAmplitude },
        uBandHeight: { value: bandHeight },
        uBandSpread: { value: bandSpread },
        uOctaveDecay: { value: octaveDecay },
        uLayerOffset: { value: layerOffset },
        uColorSpeed: { value: colorSpeed },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
        uMouseInfluence: { value: mouseInfluence },
        uMouseRadius: { value: mouseRadius },
        uEnableMouse: { value: enableMouseInteraction },
        uLightMode: { value: lightMode ? 1 : 0 }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });
    container.appendChild(gl.canvas);

    if (enableMouseInteraction) {
      gl.canvas.addEventListener('mousemove', handleMouseMove);
      gl.canvas.addEventListener('mouseleave', handleMouseLeave);
    }

    let animationFrameId: number;
    let lastTime = 0;

    function update(time: number) {
      animationFrameId = requestAnimationFrame(update);
      program.uniforms.uTime.value = time * 0.001;

      if (enableMouseInteraction) {
        // A parent-supplied pointer wins: on a `pointer-events-none` layer the
        // canvas listener never fires, so targetMouse would stay pinned at 0.5
        // and the shader would look dead to the cursor.
        if (mouseRef) {
          targetMouse = [mouseRef.current.x, 1 - mouseRef.current.y];
        }
        // Exponential smoothing expressed per SECOND, so the feel is identical
        // at 60Hz and 144Hz. The previous fixed 0.05-per-frame eased twice as
        // fast on a high-refresh display, which is part of why it felt uneven.
        // 3.2/s is deliberately soft: the aurora should drift after the cursor,
        // not snap to it.
        const dt = Math.min(0.05, (time - lastTime) / 1000 || 0.016);
        lastTime = time;
        const k = 1 - Math.exp(-3.2 * dt);
        currentMouse[0] += k * (targetMouse[0] - currentMouse[0]);
        currentMouse[1] += k * (targetMouse[1] - currentMouse[1]);
        program.uniforms.uMouse.value[0] = currentMouse[0];
        program.uniforms.uMouse.value[1] = currentMouse[1];
      } else {
        program.uniforms.uMouse.value[0] = 0.5;
        program.uniforms.uMouse.value[1] = 0.5;
      }

      renderer.render({ scene: mesh });
    }
    animationFrameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      if (enableMouseInteraction) {
        gl.canvas.removeEventListener('mousemove', handleMouseMove);
        gl.canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
      container.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [speed, scale, brightness, color1, color2, noiseFrequency, noiseAmplitude, bandHeight, bandSpread, octaveDecay, layerOffset, colorSpeed, enableMouseInteraction, mouseInfluence, mouseRadius, lightMode]);

  return <div ref={containerRef} className="w-full h-full" />;
}
