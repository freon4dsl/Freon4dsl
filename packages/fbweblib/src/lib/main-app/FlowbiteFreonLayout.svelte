<script lang="ts">
    import {
        FooterLink,
        FooterLinkGroup,
        Drawer,
        Footer,
        FooterCopyright, CloseButton
    } from 'flowbite-svelte';
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
	import EditorTab from '$lib/main-app/EditorTab.svelte';
	import { editorInfo, infoPanelShown } from '$lib/stores';

	let transitionParams = {
		x: 320,
		duration: 200,
		easing: sineIn
	};

	function openTab(index: number) {
		console.log('opening tab: ', index);
		WebappConfigurator.getInstance().openModelUnit(editorInfo.unitIds[index].name);
		editorInfo.currentOpenTab = index;
		infoPanelShown.value = false;
	}

    function closeTab(index: number) {
        console.log('closing tab: ', index);
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

</script>

<div class="flex flex-col h-screen overflow-hidden">
	<NavBar />
	<ToolBar />
	<!-- the tab panel with buttons -->
	<div class="pl-2 pr-2 dark:bg-gray-800 bg-secondary-100">
      <ul class="flex flex-wrap -mb-px text-sm font-medium text-center" id="default-styled-tab"
          role="tablist">
          {#each editorInfo.unitsInTabs as unitInfo, index}
						<li class="pl-1 pr-1 pt-1 first:pl-0 last:pr-0 {open} transition" role="presentation">
							<div class="flex flex-wrap items-center text-gray-600 hover:text-gray-700 bg-white rounded-t-xl p-1.5
        transition-all duration-300 ease-in-out
        {editorInfo.currentOpenTab === index ? 'opacity-100' : 'opacity-70'}">
								<button title={unitInfo.name} onclick={() => openTab(index)}
												class="inline-block pl-1" id="profile-styled-tab"
												type="button" role="tab" aria-controls="profile"
												aria-selected="false">{unitInfo.name}
								</button>
								<CloseButton size="sm" class="text-secondary-900" onclick={() => closeTab(index)}/>
							</div>
						</li>
<!--              <li class="pl-1 pr-1 pt-1 first:pl-0 last:pr-0 {open}" role="presentation"  >-->
<!--                  <div class="flex flex-wrap items-center text-gray-400 hover:text-gray-700 bg-white rounded-t-xl p-1.5 {open}" class:open={editorInfo.currentOpenTab === index}>-->
<!--                      <button title={unitInfo.name} onclick={() => openTab(index)}-->
<!--                              class="inline-block pl-1" id="profile-styled-tab"-->
<!--                              type="button" role="tab" aria-controls="profile"-->
<!--                              aria-selected="false">{unitInfo.name}-->
<!--                      </button>-->
<!--                      <CloseButton size="sm" class="text-secondary-900 " onclick={() => closeTab(index)}/>-->
<!--                  </div>-->
<!--              </li>-->
          {/each}
      </ul>
    <!-- the tab content -->
    <EditorTab />
  </div>

	<Footer
		class="text-center sticky md: bottom-0 start-0 z-20 w-full border-t border-gray-200 bg-white p-4 px-4 text-xs shadow md:flex md:items-center md:justify-between md:py-1 dark:border-gray-600 dark:bg-gray-800"
	>
		<div class="flex">
			<FooterCopyright
				href="/"
				by="Freon contributors"
				year={2025}
				class="inline-flex items-center text-xs mr-4 pr-4"
			/>
			{#if inDevelopment.value}
				<StatusBar />
			{/if}
		</div>
		<FooterLinkGroup
			ulClass="flex flex-wrap items-center mt-3 text-xs text-gray-500 dark:text-gray-400 sm:mt-0"
		>
			<FooterLink href="https://freon4dsl.dev" class="inline-flex items-center"
			>freon4dsl.dev
			</FooterLink
			>
		</FooterLinkGroup>
	</Footer>
</div>


<!-- Normally hidden elements-->

<Drawer
	placement="right"
	transitionType="fly"
	{transitionParams}
	bind:hidden={drawerHidden.value}
	id="sidebar1"
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

