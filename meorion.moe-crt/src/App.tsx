import CrtBackground from "./components/CrtBackground";

/**
 * 最终静态页面的背景。
 * 页面本身留空：内容层以后直接叠在背景上面即可（背景不拦截指针事件）。
 */
export default function App() {
    return <CrtBackground />;
}
