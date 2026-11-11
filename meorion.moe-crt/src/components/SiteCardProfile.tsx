import type { CSSProperties } from "react";

import type { HeartRate } from "../lib/heart";
import { PROFILE, SOCIAL_LINKS } from "../lib/site";
import { ArrowUpRightIcon, HeartIcon } from "./icons";
import ProfileAvatar from "./ProfileAvatar";
import styles from "./SiteCard.module.css";

type Props = {
    heartRate: HeartRate;
};

const socialLinkClass =
    "group relative inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.18em] text-white/85 uppercase no-underline transition-colors after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-right after:scale-x-0 after:bg-accent after:transition-transform after:duration-300 after:content-[''] hover:text-accent hover:after:origin-left hover:after:scale-x-100 focus-visible:rounded-[2px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent/60";

export default function SiteCardProfile({heartRate}: Props) {
    const heartLive = heartRate.status === "live" && heartRate.bpm !== null;
    const heartTone = heartRate.status === "live"
        ? "text-status-live"
        : heartRate.status === "stale"
            ? "text-status-stale"
            : heartRate.status === "waiting"
                ? "text-status-idle"
                : "text-status-offline";
    const bpm = heartRate.bpm === null ? "--" : String(heartRate.bpm);
    const heartbeatStyle = heartLive && heartRate.bpm
        ? ({"--heartbeat": `${(60 / heartRate.bpm).toFixed(2)}s`} as CSSProperties)
        : undefined;
    const heartTitle = heartRate.bpm === null
        ? "心率暂时不可用"
        : heartRate.status === "live"
            ? `心率 ${heartRate.bpm} BPM`
            : `心率 ${heartRate.bpm} BPM（数据可能不是最新）`;

    return (
        <div className="flex min-w-0 flex-col items-end justify-between gap-4 max-md:w-full max-md:gap-3">
            <div className="flex w-full min-w-0 flex-col items-end gap-3.5">
                <div
                    className="flex w-full items-center justify-end gap-2.5 max-md:justify-start"
                    data-intro-item=""
                >
                    <div className="min-w-0 text-left max-md:text-left">
                        <p className="m-0 flex items-baseline justify-end gap-2 whitespace-nowrap max-md:justify-start text-[13px] font-semibold tracking-[0.16em] text-white/94">
                            {PROFILE.name}
                            <span className="text-[9px] font-normal tracking-[0.06em] text-white/38">
                                {PROFILE.handle}
                            </span>
                        </p>
                        <p className="mt-1 text-[10px] leading-[1.55] tracking-[0.05em] text-white/58">
                            {PROFILE.bio}
                        </p>
                        <p
                            className={`mt-1.5 flex items-center justify-end gap-1 max-md:justify-start text-[9px] uppercase tracking-[0.15em] ${
                                heartLive ? "text-white/34" : "text-white/22"
                            } ${styles.heartLine}`}
                        >
                            <span
                                className={styles.heartTrigger}
                                aria-label={heartTitle}
                                aria-describedby="heart-rate-note"
                                tabIndex={0}
                            >
                                <span
                                    className={`flex flex-none items-center -mt-1 text-accent ${heartLive ? styles.heart : ""}`}
                                    style={heartbeatStyle}
                                    aria-hidden="true"
                                >
                                    <HeartIcon/>
                                </span>
                                <span className={`tabular-nums tracking-[0.08em] ${heartLive ? "text-white/80" : "text-white/38"}`}>
                                    {bpm}
                                </span>
                                <span className={heartLive ? "text-white/42" : "text-white/24"}>BPM</span>

                                <span id="heart-rate-note" className={styles.heartTooltip} role="tooltip">
                                    <span className={styles.heartTooltipHead}>
                                        <span className={styles.heartTooltipDot} aria-hidden="true"/>
                                        HEART NOTE
                                    </span>
                                    <span className={styles.heartTooltipText}>
                                        如果你发现我的心率一直很高 这是正常的，我有些小毛病。
                                    </span>
                                    <span className={styles.heartTooltipArrow} aria-hidden="true"/>
                                </span>
                            </span>
                            <span className="text-white/18" aria-hidden="true">/</span>
                            <span>{PROFILE.location}</span>
                        </p>
                    </div>

                    <ProfileAvatar
                        src={PROFILE.avatar}
                        alt={`${PROFILE.name} 的头像`}
                        tone={heartTone}
                    />
                </div>

                <div
                    className="flex flex-col items-end gap-3 max-md:flex-row max-md:items-center max-md:gap-6 max-md:self-start"
                    data-intro-item=""
                >
                    {SOCIAL_LINKS.map(({label, href}) => (
                        <a
                            key={href}
                            className={socialLinkClass}
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {label}
                            <ArrowUpRightIcon/>
                        </a>
                    ))}
                </div>
            </div>

            <div className="h-px w-full bg-linear-to-l from-white/16 via-white/8 to-transparent" aria-hidden="true"/>

            <p
                className="m-0 text-right text-[10px] uppercase leading-[1.7] tracking-[0.16em] text-white/35"
                data-intro-item=""
            >
                © 2026 MEORION
                <br/>
                ALL RIGHTS RESERVED
            </p>
        </div>
    );
}
