<!-- some administration -->
<svelte:window on:resize={onResize} />

<svelte:head>
	<title>ProjectIt</title>
</svelte:head>

<!-- definitions of all components that may at some time be shown in this app -->
<LeftPanel />
<RightPanel />

<!-- first make sure all dialogs and the error message are present -->

<NewModelDialog />
<OpenModelDialog />
<NameModelDialog />
<NewUnitDialog />
<OpenUnitDialog />
<SaveUnitDialog />
<DeleteUnitDialog />

<UserMessage />

<!-- the layout of the components that are rendered for this app -->
<AppBar/>
<div class="main-window">
	<MainGrid/>
</div>
<Footer />

<script lang="ts">
	import {onMount} from 'svelte';

	import AppBar from './side-elements/AppBar.svelte';
	import Footer from "./side-elements/Footer.svelte";
	import LeftPanel from './side-elements/LeftPanel.svelte';
	import RightPanel from './side-elements/HelpPanel.svelte';
	import UserMessage from "./side-elements/UserMessage.svelte";
	import OpenModelDialog from "./menu/OpenModelDialog.svelte";
	import OpenUnitDialog from "./menu/OpenUnitDialog.svelte";
	import NewModelDialog from "./menu/NewModelDialog.svelte";
	import NewUnitDialog from "./menu/NewUnitDialog.svelte";
	import SaveUnitDialog from "./menu/SaveUnitDialog.svelte";
	import NameModelDialog from "./menu/NameModelDialog.svelte";
	import DeleteUnitDialog from "./menu/DeleteUnitDialog.svelte";

	import MainGrid from "./main/MainGrid.svelte";

	import {miniWindow} from "./WebappStore";
	import {EditorCommunication} from "./editor/EditorCommunication";
	import { unnamed } from "./WebappStore";

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
