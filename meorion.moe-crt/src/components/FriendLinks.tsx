import { useEffect, useState } from "react";

import { FRIENDS, type Friend } from "../lib/friends";
import { ArrowUpRightIcon } from "./icons";
import Tooltip from "./Tooltip";
import styles from "./FriendLinks.module.css";

const EXCHANGE_EMAIL = "me@meorion.moe";
const LIST_ID = "friends-list";

/** 头像加载失败时退回名字首字母，避免列表出现一排破图 */
function FriendAvatar({ friend }: { friend: Friend }) {
    const [failed, setFailed] = useState(false);

    return (
        <span className={styles.avatar} aria-hidden="true">
            {failed ? (
                <span className={styles.avatarInitial}>{friend.name.slice(0, 1).toUpperCase()}</span>
            ) : (
                <img
                    src={friend.avatar}
                    alt=""
                    width={19}
                    height={19}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    referrerPolicy="no-referrer"
                    onError={() => setFailed(true)}
                />
            )}
        </span>
    );
}

/**
 * 主卡片下方的友链面板，默认收起，只留标题栏。
 * 展开后是双列终端清单：序号 + 头像 + 名字 + 点线 + 域名；
 * hover / 键盘聚焦时整行亮起强调色，并弹出和心率提示同一套 Tooltip。
 */
export default function FriendLinks() {
    const [open, setOpen] = useState(false);
    // 展开动画期间先裁掉溢出的内容，等高度到位后再放开，
    // 这样折叠是干净的、展开后 Tooltip 又不会被裁切。
    const [revealed, setRevealed] = useState(false);

    useEffect(() => {
        if (!open) {
            setRevealed(false);
            return;
        }

        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const timer = window.setTimeout(() => setRevealed(true), reduce ? 0 : 320);
        return () => window.clearTimeout(timer);
    }, [open]);

    return (
        <section
            className={`relative box-border w-full max-w-3xl rounded-xl border border-white/8 bg-[radial-gradient(120%_100%_at_0%_0%,var(--accent-tint),transparent_58%),linear-gradient(180deg,rgba(7,9,6,0.84),rgba(2,3,2,0.9))] p-[13px_18px_12px] font-ascii text-[11px] leading-[1.3] tracking-[0.05em] text-white/80 shadow-[0_30px_90px_-28px_rgba(0,0,0,0.92),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-[22px] backdrop-saturate-[1.1] pointer-events-auto max-md:rounded-[10px] max-md:p-[11px_12px_10px] ${styles.panel}`}
            aria-labelledby="friends-title"
            data-friends=""
            data-intro-item=""
        >
            <div className="pointer-events-none absolute inset-x-3 top-0 h-px bg-linear-to-r from-transparent via-white/24 to-transparent" aria-hidden="true"/>

            <header className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                    <span className={styles.pulse} aria-hidden="true"/>
                    <h2
                        id="friends-title"
                        className="m-0 shrink-0 text-[9px] font-semibold uppercase tracking-[0.26em] text-accent/90"
                    >
                        Peer Link
                    </h2>
                    <span className="text-white/15" aria-hidden="true">/</span>
                    <span className="truncate text-[9px] tracking-[0.2em] text-white/38">友链</span>
                </div>

                <div className="flex shrink-0 items-center gap-2.5">
                    <p className="m-0 hidden text-[8px] uppercase tracking-[0.2em] text-white/26 tabular-nums min-[360px]:block">
                        <span className="text-white/46">{String(FRIENDS.length).padStart(2, "0")}</span> Nodes
                        <span className="mx-1.5 max-md:hidden text-white/14" aria-hidden="true">·</span>
                        <span className="max-md:hidden">Uplink Ready</span>
                    </p>

                    <button
                        type="button"
                        className={styles.toggle}
                        onClick={() => setOpen((value) => !value)}
                        aria-expanded={open}
                        aria-controls={LIST_ID}
                        aria-label={open ? "收起友链" : "展开友链"}
                    >
                        <span>{open ? "收起" : "展开"}</span>
                        <span
                            className={`${styles.toggleGlyph}${open ? ` ${styles.toggleGlyphOpen}` : ""}`}
                            aria-hidden="true"
                        >
                            +
                        </span>
                    </button>
                </div>
            </header>

            <div
                id={LIST_ID}
                className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                    open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
                inert={!open}
            >
                <div className={`min-h-0 ${open && revealed ? "overflow-visible" : "overflow-hidden"}`}>
                    <div className="mt-2.5 h-px w-full bg-linear-to-r from-white/14 via-white/6 to-transparent" aria-hidden="true"/>

                    <ul className="m-0 mt-1.5 grid list-none grid-cols-2 gap-x-6 gap-y-0.5 p-0 max-md:gap-x-3">
                        {FRIENDS.map((friend, index) => {
                            const tipId = `friend-tip-${index}`;

                            return (
                                <li key={friend.url} className="relative m-0 min-w-0 p-0">
                                    <Tooltip
                                        id={tipId}
                                        head={`PEER NODE ${String(index + 1).padStart(2, "0")}`}
                                        align="center"
                                        className="block"
                                        bubbleClassName={styles.friendTip}
                                        trigger={
                                            <a
                                                className={styles.peer}
                                                href={friend.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                aria-describedby={tipId}
                                            >
                                                <span className={`${styles.index} max-[359px]:hidden`} aria-hidden="true">
                                                    {String(index + 1).padStart(2, "0")}
                                                </span>
                                                <FriendAvatar friend={friend}/>
                                                <span className={styles.name}>{friend.name}</span>
                                                <span className={styles.leader} aria-hidden="true"/>
                                                <span className={styles.host}>{friend.host}</span>
                                                <span className={styles.arrow} aria-hidden="true">
                                                    <ArrowUpRightIcon/>
                                                </span>
                                            </a>
                                        }
                                    >
                                        <span className={styles.tipName}>{friend.name}</span>
                                        <span className={styles.tipUrl}>{friend.url}</span>
                                    </Tooltip>
                                </li>
                            );
                        })}

                        <li className="relative m-0 min-w-0 p-0">
                            <Tooltip
                                id="friend-tip-apply"
                                head="APPLY LINK"
                                align="center"
                                className="block"
                                bubbleClassName={styles.friendTip}
                                trigger={
                                    <a
                                        className={`${styles.peer} ${styles.note}`}
                                        href={`mailto:${EXCHANGE_EMAIL}?subject=${encodeURIComponent("友链申请 · meorion.moe")}`}
                                        aria-describedby="friend-tip-apply"
                                    >
                                        <span className={`${styles.index} max-[359px]:hidden`} aria-hidden="true">++</span>
                                        <span className={styles.noteMark} aria-hidden="true">+</span>
                                        <span className={styles.name}>交换友链</span>
                                        <span className={styles.leader} aria-hidden="true"/>
                                        <span className={styles.host}>{EXCHANGE_EMAIL}</span>
                                        <span className={styles.arrow} aria-hidden="true">
                                            <ArrowUpRightIcon/>
                                        </span>
                                    </a>
                                }
                            >
                                <span className={styles.tipName}>交换友链</span>
                                <span className={styles.tipUrl}>{EXCHANGE_EMAIL}</span>
                            </Tooltip>
                        </li>
                    </ul>
                </div>
            </div>
        </section>
    );
}
