import { SGK001 } from "~/fonts";

export default() => {
    return (
        <div className="py-4">
            <p className={`${SGK001.className} text-xl`}>
                © 2025 ~ {new Date().getFullYear()} meorion All rights reserved.
            </p>
        </div>
    )
}