<svelte:window on:scroll|passive={onScroll} on:resize|passive={onResize} />

<svelte:head>
	<title>ProjectIt Test3</title>
</svelte:head>

<AppBar
	fade={offsetTop > 36}
	bind:leftPanelVisible
	bind:rightPanelVisible
/>

<LeftPanel bind:visible={leftPanelVisible} />

<RightPanel bind:visible={rightPanelVisible} />

<LoginDialog bind:visible={loginDialogVisible} bind:username bind:password />

<main>
	{#if width > MAX_WIDTH}
		<div>
			<MainGrid/>
		</div>
	{/if}

	{#if width < MAX_WIDTH + 1}
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

<script>
	import {onMount, tick} from 'svelte';

	import {Icon} from 'svelte-mui';

	import {arrowForward} from './assets/icons';
	import AppBar from './side-elements/AppBar.svelte';
	import LeftPanel from './side-elements/LeftPanel.svelte';
	import RightPanel from './side-elements/RightPanel.svelte';
	import LoginDialog from './side-elements/LoginDialog.svelte';
	import Footer from "./side-elements/Footer.svelte";
	import MainGrid from "./main/MainGrid.svelte";
	import {EditorCommunication} from "./editor/EditorCommunication";

	const MAX_WIDTH = 720;
	let width = MAX_WIDTH;
	let offsetTop = 0;
	let leftPanelVisible = false;
	let rightPanelVisible = false;
	let loginDialogVisible = false;
	let username = '';
	let password = '';

	EditorCommunication.initialize();

	onMount(async () => {
		onResize();
	});

	function onKeyDown(e) {
		if (e.keyCode === 13 || e.keyCode === 32) {
			e.stopPropagation();
			e.preventDefault();

			leftPanelVisible = true;
		}
	}

	async function onResize() {
		width =
				window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

		if (width > MAX_WIDTH) {
			leftPanelVisible = false;

			await tick();
			let node = document.getElementsByClassName('nav-panel')[0];
			try {
				const rc = node.getClientRects()[0];
				const h =
						window.innerHeight ||
						document.documentElement.clientHeight ||
						document.body.clientHeight;
				const maxHeight = h - rc.top - 24;

				node.style.maxHeight = maxHeight + 'px';
			} catch (err) {
			} // eslint-disable-line
		}
	}

	function onScroll() {
		offsetTop = window.pageYOffset || document.documentElement.scrollTop;
	}
</script>

<style>
	main {
		margin: var(--pi-header-height) auto 0;
		min-width: 256px;
		/*max-width: 1600px;*/
		padding: 1rem;
	}
	/*.page {*/
	/*	margin-left: 224px;*/
	/*	transition: 0.15s linear;*/
	/*}*/
	/*:global(.page) h3:first-child {*/
	/*	margin-top: 0;*/
	/*}*/
	/*.left-panel {*/
	/*	position: fixed;*/
	/*	top: 64px;*/
	/*	width: 100px;*/
	/*	min-width: 100px;*/
	/*	overflow-x: hidden;*/
	/*	overflow-y: auto;*/
	/*	overscroll-behavior: none;*/
	/*	padding: 8px 0;*/
	/*	border-radius: 4px;*/
	/*	background: var(--bg-panel);*/
	/*	border: 1px solid var(--divider);*/
	/*}*/
	/*.nav-panel::-webkit-scrollbar {*/
	/*	height: 4px;*/
	/*	width: 4px;*/
	/*}*/
	/*.nav-panel::-webkit-scrollbar-thumb {*/
	/*	background: var(--bg-app-bar, #888);*/
	/*}*/
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
	@media (hover: hover) {
		.small-viewport:hover:before {
			opacity: 0.15;
		}
		:global(.focus-visible).small-viewport:focus::before {
			opacity: 0.3;
		}
	}

	@media only screen and (min-width: 721px) {
		/* for small devices: show the button to activate the side panel,
		   but do not show the menus, and the ProjectIt logo
		 */
		:global(#hamburger) {
			display: none;
		}
		:global(#brand) {
			display: block;
		}
		:global(#menugroup) {
			display: inline-block;
		}
	}
	@media only screen and (max-width: 720px) {
		/* for larger screens: do not show the button to activate the side panel,
		   but show the menus, and the ProjectIt logo instead
		 */
		:global(#hamburger) {
			display: block;
		}
		:global(#brand) {
			display: none;
		}
		:global(#menugroup) {
			display: none;
		}
	}
</style>
