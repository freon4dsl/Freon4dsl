<svelte:window on:resize={onResize} />

<svelte:head>
	<title>ProjectIt</title>
</svelte:head>

<AppBar
	bind:leftPanelVisible
	bind:rightPanelVisible
/>

<LeftPanel bind:visible={leftPanelVisible} />
<RightPanel bind:visible={rightPanelVisible} />

<main>
	{#if $miniWindow}
		<div>
			<MainGrid/>
		</div>
	{:else}
		<!-- TO BE DONE: small viewport -->
		<div
				class="small-viewport"
				tabindex="0"
				on:click={() => {
						leftPanelVisible = true;
					}}
				on:keydown={onKeyDown}
		>
			<span>We must see what can be shown in a small window ...</span>
			<Icon path={arrowForward} />
		</div>
	{/if}
</main>

<Footer />

<script lang="ts">
	import {onMount} from 'svelte';
	import {Icon} from 'svelte-mui';

	import {arrowForward} from './assets/icons';
	import AppBar from './side-elements/AppBar.svelte';
	import LeftPanel from './side-elements/LeftPanel.svelte';
	import RightPanel from './side-elements/RightPanel.svelte';
	import Footer from "./side-elements/Footer.svelte";
	import MainGrid from "./main/MainGrid.svelte";
	import {miniWindow} from "./store";
	import {EditorCommunication} from "./editor/EditorCommunication";
	import { unnamed } from "./menu-ts-files/WebappStore";

	const MAX_WIDTH_SMALL_VIEWPORT = 400;
	let leftPanelVisible = false;
	let rightPanelVisible = false;

	// initialize defaults for the current language
	EditorCommunication.initialize();

	// initialize content in the ProjectItComponent
	EditorCommunication.getInstance().newModel(unnamed, unnamed);

	onMount(async () => {
		onResize();
	});

	// tmp: for small viewport
	function onKeyDown(e) {
		if (e.keyCode === 13 || e.keyCode === 32) {
			e.stopPropagation();
			e.preventDefault();

			leftPanelVisible = true;
		}
	}

	async function onResize() {
		let width =
				window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

		if (width > MAX_WIDTH_SMALL_VIEWPORT) {
			miniWindow.set(true);
		} else {
			miniWindow.set(false);
		}
	}
</script>

<style>
	main {
		margin: var(--pi-header-height) auto 0;
		min-width: 256px;
		padding: 1rem;
	}
	.small-viewport {
		position: relative;
		display: inline-flex;
		align-items: center;
		cursor: pointer;
		color: inherit;
		margin: 2rem 0;
		padding: 0 1rem 0 1.2rem;
		height: 3.5rem;
		border: 1px solid var(--border);
		text-decoration: none;
		outline: none;
	}
	.small-viewport::-moz-focus-inner {
		border: 0;
	}
	.small-viewport:-moz-focusring {
		outline: none;
	}
	.small-viewport span {
		padding-right: 1rem;
	}
	.small-viewport:before {
		background-color: currentColor;
		color: inherit;
		bottom: 0;
		content: '';
		left: 0;
		opacity: 0;
		pointer-events: none;
		position: absolute;
		right: 0;
		top: 0;
		transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
	}
</style>
