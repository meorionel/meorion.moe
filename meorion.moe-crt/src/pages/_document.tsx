import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
    return (
        <Html lang="zh-CN">
            <Head />
            <body>
                <noscript>
                    <style>{`[data-boot-screen],[data-intro-overlay]{display:none!important}`}</style>
                </noscript>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
