import type { Metadata } from "next";
import { Tamzen8x15r } from "~/fonts";

import "../styles/globals.css";
import "../styles/crt.css";

import AppHeader from "~/components/AppHeader";
import AppFooter from "~/components/AppFooter";

export const metadata: Metadata = {
	title: "meorion.moe",
	description: "Do you want some french fries?",
	icons: {
		icon: "/favicon.ico",
	},
};

const RootLayout = ({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) => {
	return (
		<html lang="en">
			<body className={`crt ${Tamzen8x15r.className}`}>
				<div className="container mx-auto">
					<AppHeader />
					<div className="h-[calc(100vh-120px)] overflow-scroll">
						{children}
					</div>
					<AppFooter />
				</div>
			</body>
		</html>
	);
}


export default RootLayout;
