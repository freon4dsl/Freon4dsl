<script lang="ts">
	import { onMount } from "svelte";

	import type { TopAppBarComponentDev } from "@smui/top-app-bar";
	import TopAppBar, { Row, Section, AutoAdjust } from "@smui/top-app-bar";
	import IconButton from "@smui/icon-button";
	import { Icon } from "@smui/common";
	import { Svg } from "@smui/common/elements";
	import Drawer, {
		AppContent,
		Header,
		Title
	} from "@smui/drawer";
	import { Content } from "@smui/card";

	import {
		mdiGithub,
		mdiWeb,
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

	import { modelNames } from "./components/stores/ServerStore";
	import { drawerOpen } from "./components/stores/DrawerStore";
	import { openModelDialogVisible } from "./components/stores/DialogStore";
	import { userMessageOpen } from "./components/stores/UserMessageStore";
	import { languageName } from "./components/stores/LanguageStore";
	import { currentModelName } from "./components/stores/ModelStore";

	import { serverCommunication } from "./config/WebappConfiguration";
	import { LanguageInitializer } from "./language/LanguageInitializer";
	import LinearProgress from '@smui/linear-progress';

	import StatusBar from "./components/editor-panel/StatusBar.svelte";
	import { editorProgressShown } from "./components/stores/ModelStore";

	// import this file to set which loggers will be active
	import { muteLogs } from "./logging/LoggerSettings";
	import FreonContent from "./FreonContent.svelte";
	import StatusBar from "./components/editor-panel/StatusBar.svelte";

	muteLogs();

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
	}

	onMount(async () => {
		// get list of models from server
		await serverCommunication.loadModelList((names: string[]) => {
			if (names.length > 0) {
				$modelNames = names;
			}
		});

		if (!$userMessageOpen) {
			// open the app with the open/new model dialog
			$openModelDialogVisible = true;
		}
	});
</script>


<TopAppBar bind:this={topAppBar} variant="standard" dense>
	<Row>
		<Section align="start" >
			{#if $drawerOpen}
				<!-- make some space for the menus, otherwise an open menu falls behind the drawer-->
				<div class="drawer-space-right"></div>
			{/if}
			<IconButton on:click={() => ($drawerOpen = !$drawerOpen)}>
				<Icon component={Svg} viewBox="0 0 24 24">
					<path fill="currentColor" d={$drawerOpen ? mdiChevronLeft : mdiChevronRight} />
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
			<div class="mdc-typography--headline6">Freon Environment for {$languageName}</div>
		</Section>
		<Section align="end" toolbar>
			<IconButton aria-label="GitHub" target="_blank" href="https://github.com/projectit-org/ProjectIt">
				<Icon component={Svg} viewBox="0 0 24 24">
					<path fill="currentColor" d={mdiGithub} />
				</Icon>
			</IconButton>
			<IconButton aria-label="Documentation Site" target="_blank" href="https://www.projectit.org/">
				<Icon component={Svg} viewBox="0 0 24 24">
					<path fill="currentColor" d={mdiWeb} />
				</Icon>
			</IconButton>
			<IconButton aria-label="Help Page" target="_blank" href="https://www.projectit.org/">
				<Icon component={Svg} viewBox="0 0 24 24">
					<path fill="currentColor" d={mdiHelp} />
				</Icon>
			</IconButton>
			<IconButton aria-label="Theme Toggle" on:click={switchTheme}>
				<Icon component={Svg} viewBox="0 0 24 24">
					<path fill="currentColor" d={lightTheme ? mdiWeatherNight : mdiWeatherSunny} />
				</Icon>
			</IconButton>
		</Section>
	</Row>
</TopAppBar>

<AutoAdjust {topAppBar} >
	<StatusBar />
	<LinearProgress indeterminate closed="{!$editorProgressShown}" class="my-colored-bar"/>
	<div class='main-frame'>
		<Drawer variant='dismissible' bind:open={$drawerOpen}>
			<Header>
				<Title>{$currentModelName}</Title>
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

<FindNamedElementDialog />
<FindStructureDialog />
<FindTextDialog />

<style>
	/*.main-frame {*/
	/*	margin: 10px;*/
	/*}*/
	.space-right {
		margin-right: 6px;
	}
	.drawer-space-right {
		margin-right: 220px;
	}
</style>
