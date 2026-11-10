export type LyricLine = {
    /** 起始时间（秒） */
    time: number;
    text: string;
    /** 同一时间点的翻译（如果有） */
    translation?: string;
};

export type LyricStatus = "idle" | "loading" | "ready" | "error";

/**
 * 解析 LRC。支持 `[mm:ss]`、`[mm:ss.xx]`、`[mm:ss.xxx]`、`[mm:ss:xx]`，
 * 以及一行多个时间标签；`[ti:...]` 这类元数据会被忽略。
 */
const TIME_TAG = /\[(\d{1,3}):(\d{1,2})(?:[.:](\d{1,3}))?\]/g;

type ParsedLine = {
    time: number;
    text: string;
};

function parseTimestamp(minutes: string, seconds: string, fraction?: string): number {
    const minute = Number(minutes);
    const second = Number(seconds);
    const millis = fraction ? Number(fraction.padEnd(3, "0").slice(0, 3)) : 0;
    return minute * 60 + second + millis / 1000;
}

function parseLines(raw: string): ParsedLine[] {
    if (!raw) return [];

    const lines: ParsedLine[] = [];
    for (const line of raw.split(/\r?\n/)) {
        const tags = [...line.matchAll(TIME_TAG)];
        if (tags.length === 0) continue;

        const text = line.replace(TIME_TAG, "").replace(/\s+/g, " ").trim();
        if (!text) continue;

        for (const tag of tags) {
            lines.push({
                time: parseTimestamp(tag[1], tag[2], tag[3]),
                text,
            });
        }
    }

    return lines.sort((a, b) => a.time - b.time);
}

/** 把原文和翻译按时间点合并成一条时间轴 */
export function parseLyric(raw: string, translated = ""): LyricLine[] {
    const lines = parseLines(raw);
    if (lines.length === 0) return [];

    const translations = new Map<number, string>();
    for (const line of parseLines(translated)) {
        translations.set(Math.round(line.time * 1000), line.text);
    }

    return lines.map((line) => {
        const translation = translations.get(Math.round(line.time * 1000));
        return translation && translation !== line.text
            ? {...line, translation}
            : line;
    });
}

/** 二分查找当前时间对应的歌词；开头返回第一句，结尾保持最后一句 */
export function findLyricLine(lines: LyricLine[], time: number): LyricLine | null {
    if (lines.length === 0) return null;
    if (!Number.isFinite(time) || time < lines[0].time) return lines[0];

    let low = 0;
    let high = lines.length - 1;
    let index = 0;

    while (low <= high) {
        const mid = (low + high) >> 1;
        if (lines[mid].time <= time) {
            index = mid;
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }

    return lines[index];
}
