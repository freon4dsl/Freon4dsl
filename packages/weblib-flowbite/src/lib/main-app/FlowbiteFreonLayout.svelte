<script lang="ts">
	import {
		FooterLink,
		FooterLinkGroup,
		Drawer,
		Footer,
		FooterCopyright, CloseButton, Button
	} from "flowbite-svelte"
	import { onMount } from 'svelte';
	import { sineIn } from 'svelte/easing';
	import { WebappConfigurator } from '$lib/language';
	import NavBar from '$lib/main-app/NavBar.svelte';
	import ModelPanel from '$lib/main-app/ModelPanel.svelte';
	import { drawerHidden, inDevelopment, initializing } from '$lib/stores/WebappStores.svelte';
	import ViewDialog from '$lib/dialogs/ViewDialog.svelte';
	import { openStartDialog } from '$lib/language/DialogHelpers';
	import StartDialog from '$lib/dialogs/StartDialog.svelte';
	import NewModelDialog from '$lib/dialogs/NewModelDialog.svelte';
	import OpenModelDialog from '$lib/dialogs/OpenModelDialog.svelte';
	import DeleteModelDialog from '$lib/dialogs/DeleteModelDialog.svelte';
	import RenameModelDialog from '$lib/dialogs/RenameModelDialog.svelte';
	import ImportDialog from '$lib/dialogs/ImportDialog.svelte';
	import DeleteUnitDialog from '$lib/dialogs/DeleteUnitDialog.svelte';
	import NewUnitDialog from '$lib/dialogs/NewUnitDialog.svelte';
	import RenameUnitDialog from '$lib/dialogs/RenameUnitDialog.svelte';
	import AboutDialog from '$lib/dialogs/AboutDialog.svelte';
	import SearchTextDialog from '$lib/dialogs/SearchTextDialog.svelte';
	import SearchElementDialog from '$lib/dialogs/SearchElementDialog.svelte';
	import StatusBar from '$lib/main-app/StatusBar.svelte';
	import ToolBar from '$lib/main-app/ToolBar.svelte';
	import TabContent from '$lib/main-app/TabContent.svelte';
	import { editorInfo, infoPanelShown } from '$lib/stores';
	import ErrorMessage from '$lib/dialogs/ErrorMessage.svelte';
	import { FreUndoManager } from '@freon4dsl/core';

	let transitionParams = {
		x: 320,
		duration: 200,
		easing: sineIn
	};

	function openTab(index: number) {
		// console.log('opening tab: ', index);
		editorInfo.currentOpenTab = index;
		WebappConfigurator.getInstance().openModelUnit(editorInfo.unitsInTabs[index]);
		infoPanelShown.value = false;
	}

	function closeTab(index: number) {
		// console.log('closing tab: ', index);
		WebappConfigurator.getInstance().closeModelUnit(editorInfo.unitsInTabs[index]);
	}

	onMount(async () => {
		// If a model is given as parameter, open this model
		// A new model is created when this model does not exist
		const urlParams = new URLSearchParams(window.location.search);
		const model: string | null = urlParams.get('model');
		if (model !== null) {
			await WebappConfigurator.getInstance().openModel(model);
			initializing.value = false;
		} else {
			// No model given as parameter, open the open/new model dialog
			await openStartDialog();
			initializing.value = false;
		}
	});

	/**
	 * This function saves the model before the browser or browser tab closes.
	 *
	 * Note: it is difficult to show a dialog to ask the user for saving confirmation,
	 * because this has been blocked due to wacky pages asking if you "want to leave,
	 * but for sure? Are you 100% sure?" etc.
	 */
	async function onBeforeUnload() {
		if (WebappConfigurator.getInstance().hasChanges()) {
			await WebappConfigurator.getInstance().saveModel();
		}
	}

	const normal_tab_style: string = "focus:outline-none border border-transparent opacity-70";
	const active_tab_style: string = "border border-light-base-900 dark:border-dark-base-900 opacity-100";
</script>

<svelte:window onbeforeunload={onBeforeUnload} />

<div id="freon-layout" class="flex flex-col h-screen overflow-hidden">
	<NavBar />
	<ToolBar />
	<!-- the tab panel with buttons -->
	<div class="w-full h-[calc(100vh-118px)] pl-2 pr-2 dark:bg-dark-base-800 bg-light-base-100">
		<div class="flex wmt-1" role="tablist">
			{#each editorInfo.unitsInTabs as unitInfo, index}
				<div class="relative dark:bg-dark-base-500 bg-light-base-200 dark:text-dark-base-50 text-light-base-900 p-1 mr-1 text-sm rounded-t-lg font-medium
					flex flex-wrap items-center
					{editorInfo.currentOpenTab === index ? active_tab_style : normal_tab_style}">
					<button
						tabindex={-1} class:active={editorInfo.currentOpenTab === index}
						onclick={() => openTab(index)}
					>
						{unitInfo.name}
					</button>
					<CloseButton size="sm" class="text-light-base-900 dark:text-dark-base-50 p-1"
								 tabindex={-1} onclick={(e: MouseEvent) => {
								e.stopPropagation(); // Prevent tab change on close
								closeTab(index);
							}}
					/>
					{#if editorInfo.currentOpenTab === index}
						<div class="absolute inset-x-0 bottom-0 h-0.5 bg-light-accent-500 dark:bg-dark-accent-500"></div>
					{/if}
				</div>
			{/each}
		</div>
		<!-- the tab content -->
		<TabContent />
	</div>

	<Footer
		class="text-center sticky md:bottom-0 start-0 h-12 w-full p-4 text-xs shadow md:flex md:items-center md:justify-between md:py-1 border-t border-light-base-200 text-light-base-700 bg-light-base-50  dark:border-dark-base-600 dark:bg-dark-base-900"
	>
		<div class="flex items-center justify-between">
			<FooterCopyright
				tabindex={-1}
				href="/"
				by="Freon contributors"
				year={2025}
				class="inline-flex items-center text-xs mr-4 pr-4 "
				spanClass="text-light-base-700 dark:text-dark-base-400 text-xs"
			/>
			{#if inDevelopment.value}
				<StatusBar />
			{/if}
		</div>
		<FooterLinkGroup
			class="flex flex-wrap items-center mt-3 text-xs sm:mt-0 text-light-base-700 dark:text-dark-base-400"
		>
			<FooterLink tabindex={-1} href="https://freon4dsl.dev" class="inline-flex items-center "
			>freon4dsl.dev
			</FooterLink
			>
		</FooterLinkGroup>
	</Footer>
</div>


<!-- Normally hidden elements-->

<Drawer
	tabindex={-1}
	placement="left"
	{transitionParams}
	bind:hidden={drawerHidden.value}
	id="sidebar1"
	class="bg-light-base-50 dark:bg-dark-base-900"
>
	<ModelPanel />
</Drawer>

<StartDialog />
<NewModelDialog />
<OpenModelDialog />
<DeleteModelDialog />
<RenameModelDialog />
<ImportDialog />

<NewUnitDialog />
<DeleteUnitDialog />
<RenameUnitDialog />

<SearchTextDialog />
<SearchElementDialog />

<ViewDialog />
<AboutDialog />
<ErrorMessage />
