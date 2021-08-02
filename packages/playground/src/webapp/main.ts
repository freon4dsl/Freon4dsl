import { PiLogger } from "@projectit/core";
import App from './App.svelte';

const app = new App({
	target: document.body,
	// props: {
	// 	name: 'world'
	// }
});

export default app;

PiLogger.mute("TextComponent");
PiLogger.mute("AUTORUN");
PiLogger.mute("AFTER_UPDATE")
