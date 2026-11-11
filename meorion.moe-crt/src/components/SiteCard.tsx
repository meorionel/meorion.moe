import type { HeartRate } from "../lib/heart";
import type { LyricLine, LyricStatus } from "../lib/lyric";
import type { PlayerStatus, Playlist, PlaylistStatus, Track } from "../lib/netease";
import SiteCardPlayer from "./SiteCardPlayer";
import SiteCardProfile from "./SiteCardProfile";
import styles from "./SiteCard.module.css";

type Props = {
    track: Track | null;
    status: PlayerStatus;
    error: string | null;
    playing: boolean;
    beat: number;
    currentTime: number;
    duration: number;
    playlist: Playlist | null;
    playlistStatus: PlaylistStatus;
    heartRate: HeartRate;
    lyricLine: LyricLine | null;
    lyricStatus: LyricStatus;
    onToggle: () => void;
    onSeek: (time: number) => void;
    onNext: () => void;
    onPrev: () => void;
};

/**
 * 居中卡片，2:1 分栏：
 *   - 左：播放器面板
 *   - 右：个人资料、外链与版权
 *
 * 具体内容分别由 SiteCardPlayer / SiteCardProfile 负责。
 */
export default function SiteCard({
    track,
    status,
    error,
    playing,
    beat,
    currentTime,
    duration,
    playlist,
    playlistStatus,
    heartRate,
    lyricLine,
    lyricStatus,
    onToggle,
    onSeek,
    onNext,
    onPrev,
}: Props) {
    return (
        <section
            className={`relative box-border w-full max-w-3xl rounded-[14px] border border-white/10 bg-[radial-gradient(120%_90%_at_0%_0%,var(--accent-tint),transparent_55%),linear-gradient(180deg,rgba(10,12,8,0.74),rgba(3,4,3,0.8))] p-[22px_26px] font-ascii text-[11px] leading-[1.3] tracking-[0.05em] text-white/82 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-[24px] backdrop-saturate-[1.15] pointer-events-auto before:pointer-events-none before:absolute before:inset-x-3.5 before:top-0 before:h-px before:bg-linear-to-r before:from-transparent before:via-white/38 before:to-transparent before:content-[''] max-md:w-full max-md:rounded-xl max-md:p-[20px_18px] ${styles.panel}`}
            aria-label="meorion.moe"
            data-intro-card=""
        >
            <div className="grid grid-cols-[minmax(0,2fr)_1px_minmax(0,1fr)] items-stretch gap-[30px] max-md:grid-cols-1 max-md:gap-[18px]">
                <SiteCardPlayer
                    track={track}
                    status={status}
                    error={error}
                    playing={playing}
                    currentTime={currentTime}
                    duration={duration}
                    playlist={playlist}
                    playlistStatus={playlistStatus}
                    lyricLine={lyricLine}
                    lyricStatus={lyricStatus}
                    onToggle={onToggle}
                    onSeek={onSeek}
                    onNext={onNext}
                    onPrev={onPrev}
                />

                <div className="self-stretch bg-linear-to-b from-transparent via-white/18 to-transparent max-md:hidden" aria-hidden="true"/>

                <SiteCardProfile heartRate={heartRate} playing={playing} beat={beat}/>
            </div>
        </section>
    );
}
