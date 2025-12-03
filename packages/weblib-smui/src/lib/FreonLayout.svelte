<script lang="ts">
	import FreonLogo from "$lib/img/FreonLogo.svelte";
	import { onMount } from "svelte";

	import TopAppBarComponentDev from "@smui/top-app-bar";
	import TopAppBar, { Row, Section, AutoAdjust } from "@smui/top-app-bar";
	import IconButton from "@smui/icon-button";
	import { Icon } from "@smui/common";
	import Drawer, {
		AppContent,
		Header,
		Title
	} from "@smui/drawer";
	import { Content } from "@smui/card";

	import {
		mdiGithub,
		mdiWeatherNight,
		mdiWeatherSunny,
		mdiHelp,
		mdiChevronRight,
		mdiChevronLeft
	} from "@mdi/js";

	import EditMenu from "./components/menus/EditMenu.svelte";
	import FileMenu from "./components/menus/FileMenu.svelte";
	import ViewMenu from "./components/menus/ViewMenu.svelte";
	import ModelInfo from "./components/drawer-panel/ModelInfo.svelte";

	import OpenModelDialog from "./components/dialogs/file-dialogs/OpenModelDialog.svelte";
	import DeleteModelDialog from "./components/dialogs/file-dialogs/DeleteModelDialog.svelte";
	import NewUnitDialog from "./components/dialogs/file-dialogs/NewUnitDialog.svelte";
	import DeleteUnitDialog from "./components/dialogs/file-dialogs/DeleteUnitDialog.svelte";
	import FindNamedElementDialog from "./components/dialogs/edit-dialogs/FindNamedElementDialog.svelte";
	import FindStructureDialog from "./components/dialogs/edit-dialogs/FindStructureDialog.svelte";
	import FindTextDialog from "./components/dialogs/edit-dialogs/FindTextDialog.svelte";
	import HelpDialog from "./components/dialogs/HelpDialog.svelte";

	import { modelNames } from "./components/stores/ServerStore.svelte";
	import { drawerOpen } from "./components/stores/DrawerStore.svelte";
	import { initializing, openModelDialogVisible } from "./components/stores/DialogStore.svelte";
	import { userMessageOpen } from "./components/stores/UserMessageStore.svelte";
	import { languageName } from "./components/stores/LanguageStore.svelte";
	import {currentModelName, unsavedChanges} from "./components/stores/ModelStore.svelte";
	import { helpDialogVisible } from "./components/stores/DialogStore.svelte";

	import LinearProgress from '@smui/linear-progress';

	import StatusBar from "./components/editor-panel/StatusBar.svelte";
	import { editorProgressShown } from "./components/stores/ModelStore.svelte";
	import { EditorState } from "./language/EditorState.js";

	// import this file to set which loggers will be active
	import { inDevelopment } from "./logging/LoggerSettings.js";
	import FreonContent from "./FreonContent.svelte";
	import RenameUnitDialog from "./components/dialogs/file-dialogs/RenameUnitDialog.svelte";
	import {WebappConfigurator} from "./WebappConfigurator.js";
	import {isNullOrUndefined} from "@freon4dsl/core";

	// Theming
	let topAppBar: TopAppBarComponentDev;

	let lightTheme: boolean =
			typeof window === "undefined" || window.matchMedia("(prefers-color-scheme: light)").matches;

	function switchTheme() {
		lightTheme = !lightTheme;
		let themeLink = document.head.querySelector<HTMLLinkElement>("#theme");
		if (!themeLink) {
			themeLink = document.createElement("link");
			themeLink.rel = "stylesheet";
			themeLink.id = "theme";
		}
		themeLink.href = `/site${lightTheme ? "" : "-dark"}.css`;
		document.head
				.querySelector<HTMLLinkElement>("link[href$=\"/site-dark.css\"]")
				?.insertAdjacentElement("afterend", themeLink);
		// editorEnvironment.editor.theme = lightTheme ? "light" : "dark";
	}

	/**
	 * This function shows a dialog before the tab or browser window is closed, asking the user for confirmation
	 * in the case that there are unsaved changes in the model.
	 * @param event
	 */
	function onBeforeUnload(event: BeforeUnloadEvent) {
		if (unsavedChanges.value) {
			event.preventDefault(); // shows the browser's confirmation dialog according to the specifications
			event.returnValue = ''; // older browsers may not support this method and a legacy method is used in which the event handler must return a string
		}
	}

	onMount(async () => {
		// get list of models from server
		const names = await WebappConfigurator.getInstance().serverCommunication!.loadModelList()
		if (names.length > 0) {
			modelNames.list = names;
		}
		// If a model is given as parameter, open this model
		// A new model is created when this model does not exist
		const urlParams = new URLSearchParams(window.location.search);
		const model: string | null = urlParams.get('model');
		if (!isNullOrUndefined(model)) {
			openModel(model);
		} else {
			// No model given as parameter, ask for it
			if (!userMessageOpen.value) {
				// open the app with the open/new model dialog
				openModelDialogVisible.value = true;
			}
		}
	});

	function openModel(model: string) {
		let comm = EditorState.getInstance();
		comm.openModel(model);
		initializing.value = false;
	}
</script>

<svelte:window onbeforeunload={onBeforeUnload} />

<TopAppBar bind:this={topAppBar} variant="standard" dense>
	<Row>
		<Section align="start" >
			{#if drawerOpen.value}
				<!-- make some space for the menus, otherwise an open menu falls behind the drawer -->
				<div class="drawer-space-right"></div>
			{/if}
			<IconButton onclick={() => (drawerOpen.value = !drawerOpen.value)}>
				<Icon tag=svg viewBox="0 0 24 24">
					<path fill="currentColor" d={drawerOpen.value ? mdiChevronLeft : mdiChevronRight} />
				</Icon>
			</IconButton>

			<div class="space-right"></div>
			<FileMenu/>
			<div class="space-right"></div>
			<EditMenu/>
			<div class="space-right"></div>
			<ViewMenu/>
		</Section>
		<Section>
			<div class="mdc-typography--headline6">Freon for {languageName.value}</div>
		</Section>
		<Section align="end" toolbar>
			<IconButton aria-label="GitHub" target="_blank" href="https://github.com/freon4dsl/Freon4dsl.git">
				<Icon tag=svg viewBox="0 0 24 24">
					<path fill="currentColor" d={mdiGithub} />
				</Icon>
			</IconButton>
			<IconButton aria-label="Documentation Site" target="_blank" href="https://www.freon4dsl.dev/">
				<Icon>
					<FreonLogo/>
				</Icon>
			</IconButton>
			<IconButton aria-label="Help Page" onclick={() => {helpDialogVisible.value = true; console.log(helpDialogVisible.value)}}>
				<Icon tag=svg viewBox="0 0 24 24">
					<path fill="currentColor" d={mdiHelp} />
				</Icon>
			</IconButton>
			<IconButton aria-label="Theme Toggle" onclick={switchTheme}>
				<Icon tag=svg viewBox="0 0 24 24">
					<path fill="currentColor" d={lightTheme ? mdiWeatherNight : mdiWeatherSunny} />
				</Icon>
			</IconButton>
		</Section>
	</Row>
</TopAppBar>

<AutoAdjust {topAppBar} >
	{#if inDevelopment}
		<StatusBar />
	{/if}
	<LinearProgress indeterminate closed={!editorProgressShown.value} />
	<div class='main-frame'>
		<Drawer variant='dismissible' bind:open={drawerOpen.value}>
			<Header>
				<Title>{currentModelName.value}</Title>
			</Header>
			<Content>
				<ModelInfo />
			</Content>
		</Drawer>
		<AppContent>
			<FreonContent />
		</AppContent>
	</div>
</AutoAdjust>

<OpenModelDialog/>
<DeleteModelDialog/>
<NewUnitDialog/>
<DeleteUnitDialog/>
<RenameUnitDialog/>

<FindNamedElementDialog />
<FindStructureDialog />
<FindTextDialog />

<HelpDialog />

<style>
	.space-right { /* used to put some space between the menu buttons */
		margin-right: 6px;
	}
	.drawer-space-right { /* used to make some space for the menus, otherwise an open menu falls behind the drawer */
		margin-right: 220px;
	}
	.main-frame {
		overflow: hidden;
	}
</style>
