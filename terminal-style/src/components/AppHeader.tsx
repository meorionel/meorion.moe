import RandomNeko from "./RandomNeko";
import { SGK001 } from "~/fonts";

export default () => {
	return (
		<header className="flex items-center gap-1 py-4">
			<span className={`${SGK001.className} text-xl`}>meorion.moe</span>
			<RandomNeko />
		</header>
	);
};
