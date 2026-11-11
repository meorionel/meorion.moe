import styles from "./SiteCard.module.css";

type Props = {
    src: string;
    alt: string;
    /** 头像右下角状态点的颜色类，由心率连接状态决定 */
    tone: string;
};

export default function ProfileAvatar({src, alt, tone}: Props) {
    return (
        <div className="relative flex-none max-md:order-first">
            <div className="relative size-[60px] border-b border-accent/35">
                <span className={`absolute inset-0 ${styles.avatarCrop}`}>
                    <img
                        src={src}
                        alt={alt}
                        draggable={false}
                        className="absolute left-1/2 top-[-10%] w-[110%] max-w-none -translate-x-1/2"
                    />
                </span>
            </div>
            <span
                className={`absolute -right-[3px] -bottom-[3px] size-[10px] rounded-full border-2 border-[#0a0c08] bg-current ${tone} ${styles.statusDot}`}
                aria-hidden="true"
            />
        </div>
    );
}
