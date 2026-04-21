"use client";

import { useState, useEffect } from "react";

const nekos: string[] = [
	"₍^> ꘍ < ^₎⟆",
	"≽^𓏽•༚• ྀི𓏽 ≼ 𐒡 ྀི",
	"⊹ . ݁˖ ^ ̳ᴗ ̫ ᴗ ̳^ྀི ",
	"ฅˆ. ̫ .ˆฅ",
	"/ᐠ • ·̫ •マ",
	"ꉂ˶ ⩊ ˶ฅ",
	"˓˓ก₍⸍⸌̣ʷ̣̫⸍̣⸌₎ค˒˒",
	"˶^• ༝ •^˶",
	"ฅ^._.^ฅ",
	"≽^𓏼︲˕︲𓏼^≼",
	"≽₍^_ ‸ _ ^₎≼⟆",
	"𐃆 ˒˒₍^- -^₎~",
	"₍˄•༝•˄₎◞✩︎",
	"ฅ^•ꈊ•^ฅو",
	"₍^.ꞈ.^₎⟆",
	"₍ˆ ̳ ,  ̫ , ̳ˆ₎",
	"ฅ^. ˬ .^ฅⳊ",
	"ᶠᵉᵉᵈ ᵐᵉ/ᐠ-ⱉ-ᐟ",
	"౽₍˄. ̫.˄₎₍˄. ̫.˄₎⟆",
];

export default () => {
	const [displayNeko, setDisplayNeko] = useState("");

	useEffect(() => {
		const selectedNeko = nekos[Math.floor(Math.random() * nekos.length)];
		const nekoArray = Array.from(selectedNeko);
		let index = 0;
		setDisplayNeko("");

		const timer = setInterval(() => {
			if (nekoArray && index < nekoArray.length - 1) {
				setDisplayNeko((prev) => prev + nekoArray[index]);
				index++;
			}

			return () => {
				clearInterval(timer);
			};
		}, 120);
	}, []);

	return (
		<>
			<span className="text-sm">{displayNeko}</span>
			<span className="cursor">ˍ</span>
		</>
	);
};
