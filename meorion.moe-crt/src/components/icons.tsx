/** 卡片用的小图标，全部走 currentColor */

export const PlayIcon = () => (
    <svg viewBox="0 0 12 12" width="13" height="13" aria-hidden="true">
        <path d="M3 1.8 10 6 3 10.2Z" fill="currentColor"/>
    </svg>
);

export const PauseIcon = () => (
    <svg viewBox="0 0 12 12" width="13" height="13" aria-hidden="true">
        <path d="M3 2h2v8H3zM7 2h2v8H7z" fill="currentColor"/>
    </svg>
);

export const PrevIcon = () => (
    <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
        <path d="M9 2.2 3.4 6 9 9.8Z" fill="currentColor"/>
        <path d="M2.2 2h1.4v8H2.2z" fill="currentColor"/>
    </svg>
);

export const NextIcon = () => (
    <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
        <path d="M3 2.2 8.6 6 3 9.8Z" fill="currentColor"/>
        <path d="M8.4 2h1.4v8H8.4z" fill="currentColor"/>
    </svg>
);

/** 外链箭头 */
export const ArrowUpRightIcon = () => (
    <svg viewBox="0 0 12 12" width="11" height="11" fill="none" aria-hidden="true">
        <path
            d="M3.4 8.6 8.6 3.4M4.4 3.4h4.2v4.2"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

/** 心率图标 */
export const HeartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="10" height="10"><path fill="currentColor" d="M18.494 3.801c2.095 1.22 3.569 3.7 3.504 6.592C21.86 16.5 13.5 21 12 21s-9.861-4.5-9.998-10.607C1.937 7.5 3.411 5.022 5.506 3.8c1.96-1.142 4.422-1.148 6.494.537c2.072-1.685 4.534-1.679 6.494-.537"/></svg>
);
