/**
 * 从背景图里提取一个适合深色界面的强调色。
 * ------------------------------------------------------------------
 * 1. 把图片缩到 64×64 采样（颜色分布比分辨率重要）；
 * 2. 跳过透明、过暗、过亮、灰的像素（logo 是透明底，黑白像素对色相没帮助）；
 * 3. 按色相分 24 个箱子，累加「饱和度² × 不透明度」权重，取权重最大的色相；
 * 4. 把该色相 ±1 箱的像素加权平均，得到图片里的主色；
 * 5. 把饱和度和亮度收进深色界面可用的范围（文字 / 边框 / 发光都能看清）。
 *
 * 提取失败（CORS 污染、纯灰图等）时返回 null，由调用方使用兜底色。
 */

const SAMPLE_SIZE = 64;
const HUE_BINS = 24;
const MIN_ALPHA = 160;
const MIN_SATURATION = 0.12;
const MIN_LIGHTNESS = 0.08;
const MAX_LIGHTNESS = 0.96;

/** 兜底强调色：从 public/media/logo.png 提取，和 @theme 里的默认值保持一致 */
export const FALLBACK_ACCENT = "#e8c27d";

type Hsl = { h: number; s: number; l: number };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function rgbToHsl(r: number, g: number, b: number): Hsl {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const l = (max + min) / 2;
    if (max === min) return {h: 0, s: 0, l};

    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h: number;
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
    return {h, s, l};
}

function hslToHex(h: number, s: number, l: number): string {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const hp = h / 60;
    const x = c * (1 - Math.abs((hp % 2) - 1));
    let r = 0;
    let g = 0;
    let b = 0;
    if (hp < 1) {
        r = c;
        g = x;
    } else if (hp < 2) {
        r = x;
        g = c;
    } else if (hp < 3) {
        g = c;
        b = x;
    } else if (hp < 4) {
        g = x;
        b = c;
    } else if (hp < 5) {
        r = x;
        b = c;
    } else {
        r = c;
        b = x;
    }
    const m = l - c / 2;
    const hex = (value: number) =>
        Math.round((value + m) * 255)
            .toString(16)
            .padStart(2, "0");
    return `#${hex(r)}${hex(g)}${hex(b)}`;
}

type Bin = { weight: number; r: number; g: number; b: number };

/** 提取图片主色；失败时返回 null（调用方保留兜底色） */
export function extractAccentFromImage(image: HTMLImageElement): string | null {
    if (!image.naturalWidth || !image.naturalHeight) return null;

    const canvas = document.createElement("canvas");
    canvas.width = SAMPLE_SIZE;
    canvas.height = SAMPLE_SIZE;
    const ctx = canvas.getContext("2d", {willReadFrequently: true});
    if (!ctx) return null;

    let pixels: Uint8ClampedArray;
    try {
        ctx.drawImage(image, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
        pixels = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE).data;
    } catch {
        // 远程图片没带 CORS 头时画布会被污染，读不到像素
        return null;
    }

    const bins: Bin[] = Array.from({length: HUE_BINS}, () => ({weight: 0, r: 0, g: 0, b: 0}));
    let total = 0;

    for (let i = 0; i < pixels.length; i += 4) {
        const alpha = pixels[i + 3];
        if (alpha < MIN_ALPHA) continue;

        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const hsl = rgbToHsl(r, g, b);
        if (hsl.s < MIN_SATURATION || hsl.l < MIN_LIGHTNESS || hsl.l > MAX_LIGHTNESS) continue;

        const weight = hsl.s * hsl.s * (alpha / 255);
        const index = Math.min(HUE_BINS - 1, Math.floor((hsl.h / 360) * HUE_BINS));
        const bin = bins[index];
        bin.weight += weight;
        bin.r += r * weight;
        bin.g += g * weight;
        bin.b += b * weight;
        total += weight;
    }

    if (total <= 0) return null;

    let best = 0;
    for (let i = 1; i < HUE_BINS; i++) {
        if (bins[i].weight > bins[best].weight) best = i;
    }

    // 同一色相常常被切在相邻两个箱里，取 ±1 箱一起平均
    let weight = 0;
    let r = 0;
    let g = 0;
    let b = 0;
    for (const offset of [-1, 0, 1]) {
        const bin = bins[(best + offset + HUE_BINS) % HUE_BINS];
        weight += bin.weight;
        r += bin.r;
        g += bin.g;
        b += bin.b;
    }
    if (weight <= 0) return null;

    const hsl = rgbToHsl(Math.round(r / weight), Math.round(g / weight), Math.round(b / weight));
    if (hsl.s < 0.05) return null;

    // 保留图片的色相，把饱和度 / 亮度收进可用范围：
    // 太淡的图给一点饱和度，太暗的提亮，保证在黑色背景上仍能看清。
    return hslToHex(hsl.h, clamp(hsl.s * 1.25, 0.55, 0.95), clamp(hsl.l, 0.56, 0.7));
}
