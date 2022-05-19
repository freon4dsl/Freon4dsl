<script lang="ts">
	import { onMount } from "svelte";

	import Button, { Label } from "@smui/button";
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

	import { mdiGithub, mdiWeb, mdiWeatherNight, mdiWeatherSunny, mdiHelp, mdiChevronRight, mdiChevronLeft } from "@mdi/js";

	import { serverCommunication } from "../config/WebappConfiguration";

	import EditMenu from "../components/menus/EditMenu.svelte";
	import FileMenu from "../components/menus/FileMenu.svelte";
	import ModelInfo from "../components/menus/ModelInfo.svelte";
	import ViewMenu from "../components/menus/ViewMenu.svelte";

	import OpenModelDialog from "../components/dialogs/file-dialogs/OpenModelDialog.svelte";
	import DeleteModelDialog from "../components/dialogs/file-dialogs/DeleteModelDialog.svelte";
	import NewUnitDialog from "../components/dialogs/file-dialogs/NewUnitDialog.svelte";

	import { modelNames } from "../stores/ServerStore";
	import { drawerOpen } from "../stores/DrawerStore";
	import { openModelDialogVisible } from "../stores/DialogStore";
	import { userMessageOpen } from "../stores/UserMessageStore";
	import { languageName } from "../stores/LanguageStore";
	import { currentModelName } from "../stores/ModelStore";

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
		themeLink.href = `/smui${lightTheme ? "" : "-dark"}.css`;
		document.head
				.querySelector<HTMLLinkElement>("link[href$=\"/smui-dark.css\"]")
				?.insertAdjacentElement("afterend", themeLink);
	}

	onMount(async () => {
		// todo initialize language settings

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
			<Button variant="raised" on:click={() => ($drawerOpen = !$drawerOpen)}>
				<Icon component={Svg} viewBox="0 0 24 24">
					<path fill="currentColor" d={$drawerOpen ? mdiChevronLeft : mdiChevronRight} />
				</Icon>
				<Label>Model</Label>
			</Button>
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
			<IconButton aria-label="Help Page" target="_blank" href="/Help">
				<Icon component={Svg} viewBox="0 0 24 24">
					<path fill="currentColor" d={mdiHelp} />
				</Icon>
			</IconButton>
			<IconButton aria-label="Theme Toggle" on:click={switchTheme}>
				<Icon component={Svg} viewBox="0 0 24 24">
					<path fill="currentColor" d={lightTheme ? mdiWeatherNight : mdiWeatherSunny}}></path>
				</Icon>
			</IconButton>
		</Section>
	</Row>
</TopAppBar>

<AutoAdjust {topAppBar} >

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
			<slot />
			</AppContent>
		</div>
</AutoAdjust>

<OpenModelDialog/>
<DeleteModelDialog/>
<NewUnitDialog/>

<style>
	.main-frame {
			margin: 10px;
  }
	.space-right {
		margin-right: 6px;
	}
</style>
