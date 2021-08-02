<svelte:window on:resize={onResize} />

<svelte:head>
	<title>ProjectIt</title>
</svelte:head>

<LeftPanel />
<RightPanel />

<AppBar/>
<div class="main-window">
	<MainGrid/>
</div>
<Footer />

<script lang="ts">
	import {onMount} from 'svelte';

	import AppBar from './side-elements/AppBar.svelte';
	import LeftPanel from './side-elements/LeftPanel.svelte';
	import RightPanel from './side-elements/RightPanel.svelte';
	import Footer from "./side-elements/Footer.svelte";
	import MainGrid from "./main/MainGrid.svelte";
	import {miniWindow, leftPanelVisible} from "./store";
	import {EditorCommunication} from "./editor/EditorCommunication";
	import { unnamed } from "./menu-ts-files/WebappStore";

	const MAX_WIDTH_SMALL_VIEWPORT = 600;


	// initialize defaults for the current language
	EditorCommunication.initialize();

	// initialize content in the ProjectItComponent
	EditorCommunication.getInstance().newModel(unnamed, unnamed);

	onMount(async () => {
		onResize();
	});

	async function onResize() {
		let width =
				window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

		if (width > MAX_WIDTH_SMALL_VIEWPORT) {
			miniWindow.set(true);
		} else {
			miniWindow.set(false);
		}
	}

	// TODO not sure whether this function is useful
	// function onKeyDown(e) {
	// 	// e.keyCode === 13 => Enter or Return key
	// 	// e.keyCode === 32 => Spacebar
	// 	if (e.keyCode === 13 || e.keyCode === 32) {
	// 		e.stopPropagation();
	// 		e.preventDefault();
	//
	// 		leftPanelVisible.set(false);
	// 	}
	// }
</script>

<style>
	.main-window {
		margin-top: var(--pi-header-height);
		margin-bottom: var(--pi-footer-height);
		position: relative;
		width: 100%;
		height: calc(100% - var(--pi-header-height) - var(--pi-footer-height) - 8px);
		box-sizing: border-box;
	}
</style>
