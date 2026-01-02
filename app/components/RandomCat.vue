<template>
	<div>{{ displayText }}<span class="cursor" v-if="isCursor">ˍ</span></div>
</template>

<script lang="ts" setup>
const cats: string[] = [
	"₍^> ꘍ < ^₎⟆",
	"≽^𓏽•༚• ྀི𓏽 ≼ 𐒡 ྀི",
	"ᜊ₍^ᴖ◦ᴖ^₎ᜊ",
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
const isCursor = ref(true);

const fullText = useState("cat-text", () => {
	return cats[Math.floor(Math.random() * cats.length)];
});

const displayText = ref("");
let index = 0;

const startTyping = () => {
	const timer = setInterval(() => {
		if (fullText.value && index < fullText.value.length) {
			displayText.value += fullText.value[index];
			index++;
		}

		if (index >= (fullText.value?.length ?? 0)) {
			clearInterval(timer);
			isCursor.value = !isCursor.value;
		}
	}, 120);
};

onMounted(() => {
	startTyping();
});
</script>

<style scoped>
.cursor {
	display: inline-block;
	margin-left: 2px;
	animation: blink 1s steps(1) infinite;
}

@keyframes blink {
	50% {
		opacity: 0;
	}
}
</style>
