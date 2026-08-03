<script lang="ts">
	import { FREON, isNullOrUndefined } from "@freon4dsl/core"
	import {
		type DeltaAdminResponse,
		type DeltaEvent,
		type DeltaResponse,
		type Custom_ListRepositoriesAdminRequest, type Custom_ListRepositoriesAdminResponse
	} from "@lionweb/server-delta-shared"
	import {
		Drawer,
		Footer,
		CloseButton
	} from "flowbite-svelte"
	import { onMount } from 'svelte';
	import { WebappConfigurator } from '$lib/language';
	import NavBar from '$lib/main-app/NavBar.svelte';
	import ModelPanel from '$lib/main-app/ModelPanel.svelte';
	import { dialogs, drawerOpen, inDevelopment, initializing } from "$lib/stores/WebappStores.svelte"
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
	import { editorInfo, infoPanelShown, serverInfo } from "$lib/stores"
	import ErrorMessage from '$lib/dialogs/ErrorMessage.svelte';

	function openTab(index: number) {
		// console.log('opening tab: ', index);
		editorInfo.currentOpenTab = index;
		const unit = editorInfo.unitsInTabs[index];
		if (unit) {
			WebappConfigurator.getInstance().openModelUnit(unit)
		}
		infoPanelShown.value = false;
	}

	function closeTab(index: number) {
		// console.log('closing tab: ', index);
		const unit = editorInfo.unitsInTabs[index];
		if (unit) {
			WebappConfigurator.getInstance().closeModelUnit(unit);
		}
	}

	onMount(async () => {
		// If a model is given as parameter, open this model
		// A new model is created when this model does not exist
		const urlParams = new URLSearchParams(window.location.search);
		const model: string | null = urlParams.get('model');
		if (model !== null) {
			await WebappConfigurator.getInstance().openModel(model);
			initializing.value = false;
		} else if (isNullOrUndefined(FREON.deltaClient)){
			// No model given as parameter, open the open/new model dialog
			await openStartDialog();
			initializing.value = false;
		} else {
			// use delta server
			FREON.deltaClient.deltaApiClient.deltaProcessor.processingFunctions.set("Custom_ListRepositoriesAdminResponse", myfunc)
			FREON.deltaClient.deltaApiClient.sendAdminRequest({
				messageKind: "Custom_ListRepositoriesAdminRequest",
				queryId: "dummy",
				additionalInfos: []
			} as Custom_ListRepositoriesAdminRequest)
			
		}
	});
	
	const myfunc = (msg: DeltaEvent | DeltaResponse | DeltaAdminResponse):void => {
		console.log(`Received repositories ${(msg as Custom_ListRepositoriesAdminResponse).repositories.map(r => JSON.stringify(r))}` )
		serverInfo.allModelNames = (msg as Custom_ListRepositoriesAdminResponse).repositories.map(r =>r.name)
		dialogs.startDialogVisible = true
	}

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

	function handleCloseClick(index: number): (e: MouseEvent) => void {
		return (e: MouseEvent) => {
			e.stopPropagation(); // prevent tab change on close
			closeTab(index);
		};
	}

	const normal_tab_style: string = "focus:outline-none border border-transparent opacity-70";
	const active_tab_style: string = "border border-light-base-900 dark:border-dark-base-900 opacity-100";
</script>

<svelte:window onbeforeunload={onBeforeUnload} />

<div id="freon-layout" class="flex flex-col h-screen overflow-hidden dark:bg-dark-base-800 bg-light-base-100">
	<NavBar />
	<ToolBar />
	<!-- the tab panel with buttons -->
	<div class="w-full h-[calc(100vh-118px)] pl-2 pr-2 dark:bg-dark-base-800 bg-light-base-100">
		<div class="flex wmt-1" role="tablist">
			{#each editorInfo.unitsInTabs as unitInfo, index (index)}
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
								 tabindex={-1} onclick={handleCloseClick(index)}
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
		class="text-center sticky bottom-0 inset-s-0 h-12 w-full px-4 text-xs shadow md:flex md:items-center md:justify-between md:py-1 border-t border-light-base-200/70 text-light-base-700 bg-light-base-50/90 backdrop-blur-sm dark:border-dark-base-600/70 dark:bg-dark-base-900/90"
	>
		<div class="flex items-center justify-between gap-2">
			<span
				class="inline-flex items-center mr-4 pr-4 text-light-base-700 dark:text-dark-base-400 gap-2 whitespace-nowrap"
			>
				© {new Date().getFullYear()}
				<span class="opacity-60">•</span>
				<a
					href="https://github.com/freon4dsl/freon/graphs/contributors"
					target="_blank"
					rel="noopener noreferrer"
					class="hover:underline transition-colors duration-150 hover:text-light-accent-400 dark:hover:text-dark-accent-300"
				>
					Freon contributors
				</a>
				<span class="opacity-60">•</span>
				<a
					href="https://github.com/freon4dsl/freon/blob/main/LICENSE"
					target="_blank"
					rel="noopener noreferrer"
					class="hover:underline transition-colors duration-150 hover:text-light-accent-400 dark:hover:text-dark-accent-300"
				>
					MIT License
				</a>
			</span>

			{#if inDevelopment.value}
				<StatusBar />
			{/if}
		</div>
		<div class="flex items-center mt-3 sm:mt-0">
			<a
				href="https://freon4dsl.dev"
				target="_blank"
				rel="noopener noreferrer"
				class="text-light-base-700 dark:text-dark-base-400 opacity-80 hover:opacity-100 hover:underline transition-colors duration-150 hover:text-light-accent-400 dark:hover:text-dark-accent-300"
			>
				freon4dsl.dev
			</a>
		</div>
	</Footer>
</div>


<!-- Normally hidden elements-->
<!--
    Workaround: "translate-x-0!", because Flowbite-Svelte 1.32.0 does not remove its
    -translate-x-full class when this Drawer opens.
-->
<Drawer
	tabindex={-1}
	placement="left"
	bind:open={drawerOpen.value}
	id="sidebar1"
	class="translate-x-0! bg-light-base-50 dark:bg-dark-base-900"
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
