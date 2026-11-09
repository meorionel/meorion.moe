import { useEffect, useRef, useState } from "react";

/**
 * AsciiVideo —— 用 WebGL 把图片渲染成「字符画」背景（Midjourney 旧官网那种感觉）
 * ------------------------------------------------------------------
 * 从 uwu.cat 的最终页面背景移植而来，去掉了入场扫描 / 开机动画：
 * 挂载后直接就是完整画面，只保留最终页面本来就有的 CRT 质感与交互。
 * 输入源现在是静态图片（原来是视频），渲染 / 交互效果保持不变。
 *
 * 所有逐字符的计算都在 fragment shader 里完成：
 *   1. 屏幕按 cellW×cellH 切成网格，每格采样图片的平均颜色
 *   2. 亮度 → 字符密度表里的一个字符（字形来自预先绘制好的 atlas 纹理）
 *   3. CRT 质感：荧光光晕、RGB 色散、扫描线、荧光粉栅格、屏幕弧度
 *   4. 叠加特效：鼠标透镜扰动、点击水滴波纹（可叠加多个）、暗角
 * CPU 只在图片加载时上传一次纹理，之后每帧只做 drawArrays，性能开销极小。
 */

type Props = {
    /** 输入图片地址（字符画的内容来源） */
    src: string;
    /** 字符宽度（CSS px），高度自动 ×1.6；越小越细腻 */
    cellSize?: number;
    /** 字符密度表，从暗到亮 */
    charset?: string;
    /** 强调色（鼠标透镜、水滴波纹） */
    accent?: string;
    /** 渲染帧率上限 */
    maxFps?: number;
    /** 背景图片连续旋转速度（度/秒），0 = 关闭；开启时会自动放大取景避免四角露空 */
    rotationSpeed?: number;
    className?: string;
};

const DEFAULT_CHARSET = " .:-~=+*xoeO#%&@";

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const MAX_RIPPLES = 8;

/**
 * 第一遍：在「每个字符一个像素」的小网格上采样视频，并和上一帧做指数平滑。
 * 去掉视频噪点和亮度在字符阈值附近来回跳造成的闪烁，
 * 同时主 pass 每像素只需读 1 次这张小纹理，而不是 4 次视频。
 */
const GRID_FRAG = `
precision highp float;
uniform sampler2D uVideo;
uniform sampler2D uPrev;
uniform vec2  uGrid;
uniform vec4  uCover;
uniform float uBlend;   // 0..1，本帧权重
uniform vec2  uRotate;  // 旋转角度的 cos / sin
uniform float uZoom;    // 旋转时的取景放大，保证四角始终被图片填满
uniform float uAspect;  // 屏幕宽高比（以 CSS 像素计）

// 屏幕 uv → 图片 uv：先按屏幕比例转成等比坐标，再缩放 / 旋转
vec2 imageUV(vec2 screenUV) {
    vec2 p = (screenUV - 0.5) * vec2(uAspect, 1.0) / uZoom;
    vec2 q = vec2(p.x * uRotate.x - p.y * uRotate.y,
                  p.x * uRotate.y + p.y * uRotate.x);
    return uCover.xy + (vec2(q.x / uAspect, q.y) + 0.5) * uCover.zw;
}

void main() {
    vec2 cuv = gl_FragCoord.xy / uGrid;          // 纹理 v=0 对应图片顶部（图片纹理未翻转）
    vec2 d   = vec2(0.25 / uGrid.x, 0.25 / uGrid.y);
    vec3 cur = (texture2D(uVideo, imageUV(cuv + vec2(-d.x, -d.y))).rgb
              + texture2D(uVideo, imageUV(cuv + vec2( d.x, -d.y))).rgb
              + texture2D(uVideo, imageUV(cuv + vec2(-d.x,  d.y))).rgb
              + texture2D(uVideo, imageUV(cuv + vec2( d.x,  d.y))).rgb) * 0.25;
    vec3 prev = texture2D(uPrev, cuv).rgb;
    gl_FragColor = vec4(mix(prev, cur, uBlend), 1.0);
}
`;

const FRAG = `
precision highp float;

#define MAX_RIPPLES ${MAX_RIPPLES}
#define RIPPLE_LIFE 2.6

uniform sampler2D uCells;   // 平滑后的每格颜色（GRID_FRAG 输出）
uniform sampler2D uAtlas;
uniform vec2  uRes;        // 画布尺寸（设备像素）
uniform vec2  uCellSize;   // 单个字符格尺寸（设备像素）
uniform vec2  uGrid;       // 列数, 行数
uniform float uGlyphs;     // 字符数量
uniform float uTime;
uniform vec4  uMouse;      // x, y, 半径, 强度
uniform vec3  uRipples[MAX_RIPPLES]; // 每个水波: x, y, 产生时间
uniform float uMotion;     // 1 = 正常, 0 = 用户偏好减少动态效果
uniform vec3  uAccent;
uniform vec2  uCurve;      // 屏幕弧度；手机竖屏时为 0（平铺）
uniform float uDpr;        // 设备像素比，用于让扫描线按 CSS 像素对齐

float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

void main() {
    vec2 screen = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);

    // ---- CRT 屏幕弧度：桶形畸变，四角收成圆角 ----
    vec2 sq = screen / uRes * 2.0 - 1.0;
    sq *= 1.0 + uCurve * dot(sq, sq);
    vec2 edge = smoothstep(vec2(0.0), vec2(0.004, 0.006), 1.0 - abs(sq));
    float screenMask = uCurve.x > 0.0 ? edge.x * edge.y : 1.0;
    if (screenMask <= 0.0) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
    vec2 px = (sq * 0.5 + 0.5) * uRes;

    vec2 cell   = floor(px / uCellSize);
    vec2 local  = fract(px / uCellSize);
    vec2 center = (cell + 0.5) * uCellSize;

    float tick  = floor(uTime * 12.0);
    float flick = hash(cell + vec2(tick * 0.137 + 3.1, tick * 0.291 + 7.7));

    // ---- 水滴波纹：每个点击独立叠加，产生折射位移 + 波峰高光 ----
    vec2  disp  = vec2(0.0);
    float crest = 0.0;
    float splash = 0.0;
    float wl    = uCellSize.y * 4.5;                 // 波长
    float speed = max(uRes.x, uRes.y) * 0.28;        // 扩散速度（px/s）
    for (int i = 0; i < MAX_RIPPLES; i++) {
        vec3 r = uRipples[i];
        float age = uTime - r.z;
        if (age < 0.0 || age > RIPPLE_LIFE) continue;
        vec2  dv   = center - r.xy;
        float dist = length(dv);
        float x    = dist - age * speed;
        float env  = exp(-(x + wl) * (x + wl) / (wl * wl * 2.2));
        float life = 1.0 - age / RIPPLE_LIFE;
        float w    = sin(x / wl * 6.2832) * env * life * life;
        disp  += dv / max(dist, 1.0) * w;
        crest  = max(crest, smoothstep(0.25, 0.9, w));
        splash = max(splash, (1.0 - smoothstep(0.0, uCellSize.y * 3.0, dist)) * (1.0 - smoothstep(0.0, 0.35, age)));
    }

    vec2 cuv = (cell + 0.5) / uGrid - disp * wl * 0.45 / (uGrid * uCellSize);
    vec3 col = texture2D(uCells, clamp(cuv, 0.0, 1.0)).rgb;

    float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
    lum = smoothstep(0.03, 0.95, lum + dot(disp, vec2(0.12)) * 0.5);

    // 护眼：饱和度/亮度只做轻微提升；字符不再随机抖动和闪烁（只在交互时才乱码）
    vec3 base = mix(vec3(lum), col, 1.2) * 1.05;
    vec3 c = base;

    float g = floor(lum * (uGlyphs - 1.0) + 0.5);

    float md = length(center - uMouse.xy) / max(uMouse.z, 1.0);
    float m  = (1.0 - smoothstep(0.0, 1.0, md)) * uMouse.w;
    if (m > 0.001) {
        if (flick < m * 0.6) g = 1.0 + floor(hash(cell + tick * 1.31) * (uGlyphs - 1.0));
        c = mix(c, uAccent, m * 0.55) + m * 0.12;
    }

    if (crest > 0.0) {
        g += crest * 5.0;
        if (crest > 0.55 && flick < 0.35) g = 1.0 + floor(hash(cell + tick * 2.7) * (uGlyphs - 1.0));
        c = mix(c, uAccent * 1.3 + 0.15, crest * 0.75);
    }
    if (splash > 0.0) {
        g = mix(g, uGlyphs - 1.0, splash);
        c = mix(c, vec3(1.0), splash);
    }

    g = clamp(floor(g), 0.0, uGlyphs - 1.0);

    // ---- 字形：atlas 上半是锐利字形，下半是预模糊的“荧光”字形 ----
    // RGB 三通道错开一点点采样 → CRT 色散边
    float ca = 0.025;
    float aR = texture2D(uAtlas, vec2((g + clamp(local.x - ca, 0.0, 0.999)) / uGlyphs, local.y * 0.5)).a;
    float aG = texture2D(uAtlas, vec2((g + local.x) / uGlyphs, local.y * 0.5)).a;
    float aB = texture2D(uAtlas, vec2((g + clamp(local.x + ca, 0.0, 0.999)) / uGlyphs, local.y * 0.5)).a;
    float glow = texture2D(uAtlas, vec2((g + local.x) / uGlyphs, 0.5 + local.y * 0.5)).a;

    vec3 rgb = c * vec3(aR, aG, aB) + c * glow * 0.6;

    // 荧光粉余辉：平滑的视频底色，让整屏有一层微微发光的雾
    vec3 haze = texture2D(uCells, px / (uGrid * uCellSize)).rgb;
    rgb += haze * haze * 0.15;

    // ---- 扫描线 + 荧光粉 RGB 栅格 + 缓慢滚动的亮带 ----
    // 扫描线：每 3 个 CSS 像素一条，亮行中间饱满、行间是明显的暗缝（与页面上的 CSS 扫描线对齐）
    float sp   = fract(screen.y / (3.0 * uDpr));
    float scan = mix(0.7, 1.1, smoothstep(0.0, 0.3, sp) * smoothstep(1.0, 0.62, sp));
    float slot = mod(floor(screen.x), 3.0);
    vec3 mask = vec3(0.95) + 0.05 * vec3(slot == 0.0, slot == 1.0, slot == 2.0) * 2.0 - 0.033;
    float roll = 1.0 + 0.04 * uMotion * smoothstep(0.0, 0.15, 0.15 - abs(fract(screen.y / uRes.y - uTime * 0.07) - 0.5));
    rgb *= scan * mask * roll;

    // 暗角 + 屏幕边缘
    vec2 q = px / uRes - 0.5;
    float vig = clamp(1.15 - dot(q, q) * 1.6, 0.0, 1.0);

    gl_FragColor = vec4(rgb * vig * screenMask, 1.0);
}
`;

function hexToRgb(hex: string): [number, number, number] {
    const n = parseInt(hex.replace("#", ""), 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(s) ?? "shader compile error";
        gl.deleteShader(s);
        throw new Error(log);
    }
    return s;
}

/** 把字符表画成一张横向 atlas：每个字形正好占 cellW×cellH 设备像素 */
function buildAtlas(charset: string, cellW: number, cellH: number, fontFamily: string) {
    // 两行：上行锐利字形，下行同一字形的模糊光晕（用于 CRT 荧光效果）
    const c = document.createElement("canvas");
    c.width = cellW * charset.length;
    c.height = cellH * 2;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `600 ${Math.round(cellH * 0.78)}px ${fontFamily}`;
    for (let i = 0; i < charset.length; i++) {
        ctx.fillText(charset[i], i * cellW + cellW / 2, cellH / 2 + 1);
    }
    // 光晕行：把字画在画布外，只让阴影落进来 —— 比 ctx.filter 兼容性更好
    const OFF = 100000;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, cellH, c.width, cellH);
    ctx.clip();
    ctx.shadowColor = "#fff";
    ctx.shadowBlur = Math.max(2, cellH * 0.22);
    ctx.shadowOffsetX = OFF;
    for (let pass = 0; pass < 2; pass++) {
        for (let i = 0; i < charset.length; i++) {
            ctx.fillText(charset[i], i * cellW + cellW / 2 - OFF, cellH * 1.5 + 1);
        }
    }
    ctx.restore();
    return c;
}

export default function AsciiVideo({
    src,
    cellSize = 7,
    charset = DEFAULT_CHARSET,
    accent = "#ceff1c",
    maxFps = 30,
    rotationSpeed = 10,
    className,
}: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const [fallback, setFallback] = useState(false);

    // ---------- WebGL 字符画 ----------
    useEffect(() => {
        const canvas = canvasRef.current;
        const image = imageRef.current;
        if (!canvas || !image) return;

        const gl = canvas.getContext("webgl", {antialias: false, alpha: false, powerPreference: "low-power"});
        if (!gl) {
            setFallback(true);
            return;
        }

        let disposed = false;

        // ---------- 程序 & 几何 ----------
        const link = (fragSrc: string) => {
            const p = gl.createProgram()!;
            const vs = compile(gl, gl.VERTEX_SHADER, VERT);
            const fs = compile(gl, gl.FRAGMENT_SHADER, fragSrc);
            gl.attachShader(p, vs);
            gl.attachShader(p, fs);
            gl.bindAttribLocation(p, 0, "aPos");
            gl.linkProgram(p);
            gl.deleteShader(vs);
            gl.deleteShader(fs);
            if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
                const log = gl.getProgramInfoLog(p) ?? "link error";
                gl.deleteProgram(p);
                throw new Error(log);
            }
            return p;
        };

        const programs = (() => {
            try {
                return {main: link(FRAG), grid: link(GRID_FRAG)};
            } catch (e) {
                console.error(e);
                setFallback(true);
                return null;
            }
        })();
        if (!programs) return;
        const prog = programs.main;
        const gridProg = programs.grid;

        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

        const U = (name: string) => gl.getUniformLocation(prog, name);
        const u = {
            cells: U("uCells"), atlas: U("uAtlas"), res: U("uRes"), cellSize: U("uCellSize"),
            grid: U("uGrid"), glyphs: U("uGlyphs"), time: U("uTime"),
            mouse: U("uMouse"), ripples: U("uRipples"), motion: U("uMotion"),
            accent: U("uAccent"), curve: U("uCurve"), dpr: U("uDpr"),
        };
        const G = (name: string) => gl.getUniformLocation(gridProg, name);
        const ug = {
            video: G("uVideo"), prev: G("uPrev"), grid: G("uGrid"), cover: G("uCover"), blend: G("uBlend"),
            rotate: G("uRotate"), zoom: G("uZoom"), aspect: G("uAspect"),
        };

        const makeTex = (unit: number, filter: number) => {
            const t = gl.createTexture()!;
            gl.activeTexture(gl.TEXTURE0 + unit);
            gl.bindTexture(gl.TEXTURE_2D, t);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
            // 1×1 黑色占位，避免图片没加载完时采样报警告
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
            return t;
        };
        // 纹理单元：0 = 图片，1 = 字形 atlas，2 = 每格颜色（ping-pong 两张）
        const imageTex = makeTex(0, gl.LINEAR);
        const atlasTex = makeTex(1, gl.NEAREST);
        const cellTex = [makeTex(2, gl.LINEAR), makeTex(2, gl.LINEAR)];
        const cellFbo = cellTex.map((t) => {
            const fb = gl.createFramebuffer()!;
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
            return fb;
        });
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        let cellCur = 0;

        gl.useProgram(gridProg);
        gl.uniform1i(ug.video, 0);
        gl.uniform1i(ug.prev, 2);

        gl.useProgram(prog);
        gl.uniform1i(u.cells, 2);
        gl.uniform1i(u.atlas, 1);
        gl.uniform1f(u.glyphs, charset.length);
        gl.uniform3fv(u.accent, hexToRgb(accent));

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        gl.uniform1f(u.motion, reduceMotion ? 0 : 1);
        // 开启旋转时按屏幕比例放大取景：正方形旋转最多需要 √2，宽屏还要更大
        const rotateEnabled = rotationSpeed !== 0 && !reduceMotion;

        // ---------- 尺寸 / atlas ----------
        const fontFamily =
            getComputedStyle(document.body).getPropertyValue("--font-ascii").trim() || "monospace";
        let dpr = 1, cellW = 1, cellH = 1, cols = 1, rows = 1, aspect = 1;

        let cover: [number, number, number, number] = [0, 0, 1, 1];
        const updateCover = () => {
            const iw = image.naturalWidth, ih = image.naturalHeight;
            if (!iw || !ih) return;
            const a = (cols * cellW) / (rows * cellH);
            const v = iw / ih;
            cover = a > v ? [0, (1 - v / a) / 2, 1, v / a] : [(1 - a / v) / 2, 0, a / v, 1];
        };

        const resize = () => {
            if (disposed) return;
            gl.useProgram(prog);
            dpr = Math.min(2, window.devicePixelRatio || 1);
            const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
            const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
            canvas.width = w;
            canvas.height = h;
            gl.viewport(0, 0, w, h);

            cellW = Math.max(4, Math.round(cellSize * dpr));
            cellH = Math.round(cellW * 1.6);
            cols = Math.ceil(w / cellW);
            rows = Math.ceil(h / cellH);

            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, atlasTex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, buildAtlas(charset, cellW, cellH, fontFamily));

            gl.uniform2f(u.res, w, h);
            gl.uniform2f(u.cellSize, cellW, cellH);
            gl.uniform2f(u.grid, cols, rows);
            gl.uniform1f(u.dpr, dpr);

            // 旋转取景：固定放大到任意角度都不会露出四角（画面只转、不忽大忽小）
            aspect = (cols * cellW) / (rows * cellH);
            gl.useProgram(gridProg);
            gl.uniform1f(ug.aspect, aspect);
            gl.uniform1f(ug.zoom, rotateEnabled ? Math.sqrt(aspect * aspect + 1) : 1);
            gl.useProgram(prog);
            // 竖屏 / 窄屏（手机）上弧度会显得很怪，直接平铺
            const flat = canvas.clientWidth < 768 || canvas.clientWidth < canvas.clientHeight;
            gl.uniform2f(u.curve, flat ? 0 : 0.018, flat ? 0 : 0.028);

            // 每格颜色纹理按新的网格尺寸重建（清成黑色）
            const black = new Uint8Array(cols * rows * 4);
            gl.activeTexture(gl.TEXTURE2);
            for (const t of cellTex) {
                gl.bindTexture(gl.TEXTURE_2D, t);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, cols, rows, 0, gl.RGBA, gl.UNSIGNED_BYTE, black);
            }
            updateCover();
        };

        const ro = new ResizeObserver(resize);
        ro.observe(canvas);
        resize();

        // 字体加载完后重建一次 atlas，避免用到回退字体
        document.fonts.load('600 16px "Geist Mono"')
            .then(() => { if (!disposed) resize(); })
            .catch(() => { /* 字体不存在也无妨，atlas 用回退字体 */ });

        // ---------- 图片纹理：加载完成后只上传一次 ----------
        const uploadImage = () => {
            if (disposed || !image.naturalWidth || !image.naturalHeight) return;
            // 超过 GPU 纹理上限的大图先等比缩小，避免 texImage2D 直接失败
            const max = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
            let source: TexImageSource = image;
            if (image.naturalWidth > max || image.naturalHeight > max) {
                const scale = Math.min(max / image.naturalWidth, max / image.naturalHeight);
                const c = document.createElement("canvas");
                c.width = Math.max(1, Math.floor(image.naturalWidth * scale));
                c.height = Math.max(1, Math.floor(image.naturalHeight * scale));
                const ctx = c.getContext("2d")!;
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = "high";
                ctx.drawImage(image, 0, 0, c.width, c.height);
                source = c;
            }
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, imageTex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
            updateCover();
        };
        const onImageLoad = () => uploadImage();
        image.addEventListener("load", onImageLoad);
        if (image.complete) uploadImage();

        // ---------- 交互 ----------
        const start = performance.now();
        const now = () => (performance.now() - start) / 1000;
        const mouse = {x: -9999, y: -9999, target: 0, strength: 0};
        // 环形缓冲：每次点击占一个槽位，最多同时存在 MAX_RIPPLES 个水波
        const ripples = new Float32Array(MAX_RIPPLES * 3).fill(-1000);
        let rippleIdx = 0;
        const onMove = (e: PointerEvent) => {
            mouse.x = e.clientX * dpr;
            mouse.y = e.clientY * dpr;
            mouse.target = 1;
        };
        const onLeave = () => { mouse.target = 0; };
        // 触屏没有“悬停”：手指抬起后透镜淡出，而不是停在最后的位置
        const onUp = (e: PointerEvent) => { if (e.pointerType !== "mouse") mouse.target = 0; };
        const onDown = (e: PointerEvent) => {
            onMove(e);
            const k = rippleIdx * 3;
            ripples[k] = e.clientX * dpr;
            ripples[k + 1] = e.clientY * dpr;
            ripples[k + 2] = now();
            rippleIdx = (rippleIdx + 1) % MAX_RIPPLES;
        };
        window.addEventListener("pointermove", onMove, {passive: true});
        window.addEventListener("pointerdown", onDown, {passive: true});
        window.addEventListener("pointerup", onUp, {passive: true});
        window.addEventListener("pointercancel", onUp, {passive: true});
        document.documentElement.addEventListener("pointerleave", onLeave);

        // ---------- 渲染循环 ----------
        let last = 0;
        let raf = 0;
        const minDt = 1000 / Math.max(1, maxFps);

        const loop = (ts: number) => {
            raf = requestAnimationFrame(loop);
            if (ts - last < minDt - 1) return;
            const dt = Math.min(0.1, (ts - last) / 1000);
            last = ts;

            mouse.strength += (mouse.target - mouse.strength) * Math.min(1, dt * 6);

            const t = now();
            const angle = rotateEnabled ? (t * rotationSpeed * Math.PI / 180) % (Math.PI * 2) : 0;

            // 第一遍：图片 → 每格颜色，与上一帧指数平滑（时间常数约 0.1s）
            const next = 1 - cellCur;
            gl.useProgram(gridProg);
            gl.uniform2f(ug.rotate, Math.cos(angle), Math.sin(angle));
            gl.bindFramebuffer(gl.FRAMEBUFFER, cellFbo[next]);
            gl.viewport(0, 0, cols, rows);
            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, cellTex[cellCur]);
            gl.uniform2f(ug.grid, cols, rows);
            gl.uniform4f(ug.cover, cover[0], cover[1], cover[2], cover[3]);
            gl.uniform1f(ug.blend, 1 - Math.exp(-dt / 0.1));
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            cellCur = next;

            // 第二遍：字符画到屏幕
            gl.useProgram(prog);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.bindTexture(gl.TEXTURE_2D, cellTex[cellCur]);
            gl.uniform1f(u.time, t);
            gl.uniform4f(u.mouse, mouse.x, mouse.y, 170 * dpr, mouse.strength);
            gl.uniform3fv(u.ripples, ripples);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        };
        raf = requestAnimationFrame(loop);

        return () => {
            disposed = true;
            cancelAnimationFrame(raf);
            ro.disconnect();
            image.removeEventListener("load", onImageLoad);
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerdown", onDown);
            window.removeEventListener("pointerup", onUp);
            window.removeEventListener("pointercancel", onUp);
            document.documentElement.removeEventListener("pointerleave", onLeave);
            gl.deleteTexture(imageTex);
            gl.deleteTexture(atlasTex);
            cellTex.forEach((t) => gl.deleteTexture(t));
            cellFbo.forEach((f) => gl.deleteFramebuffer(f));
            gl.deleteBuffer(buf);
            gl.deleteProgram(prog);
            gl.deleteProgram(gridProg);
        };
    }, [src, cellSize, charset, accent, maxFps, rotationSpeed]);

    return (
        <div className={className} style={{background: "#000"}} aria-hidden="true">
            <img
                ref={imageRef}
                src={src}
                alt=""
                draggable={false}
                decoding="async"
                style={fallback
                    ? {width: "100%", height: "100%", objectFit: "cover", opacity: 0.5}
                    : {display: "none"}}
            />
            {!fallback && <canvas ref={canvasRef} style={{display: "block", width: "100%", height: "100%"}}/>}
        </div>
    );
}
