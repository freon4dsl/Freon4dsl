<script lang="ts">
    import {
        FooterLink,
        FooterLinkGroup,
        Drawer,
        Footer,
        FooterCopyright, Tabs, TabItem
    } from "flowbite-svelte"
    import {onMount} from 'svelte';
    import {sineIn} from 'svelte/easing';
    import {WebappConfigurator} from '$lib/language';
    import NavBar from '$lib/main-app/NavBar.svelte';
    import ModelDrawer from '$lib/main-app/ModelDrawer.svelte';
    import { drawerHidden, inDevelopment, initializing } from "$lib/stores/WebappStores.svelte"
    import ViewDialog from "$lib/dialogs/ViewDialog.svelte";
    import {openStartDialog} from "$lib/language/DialogHelpers";
    import StartDialog from "$lib/dialogs/StartDialog.svelte";
    import NewModelDialog from "$lib/dialogs/NewModelDialog.svelte";
    import OpenModelDialog from "$lib/dialogs/OpenModelDialog.svelte";
    import DeleteModelDialog from "$lib/dialogs/DeleteModelDialog.svelte";
    import RenameModelDialog from "$lib/dialogs/RenameModelDialog.svelte";
    import ImportDialog from "$lib/dialogs/ImportDialog.svelte";
    import DeleteUnitDialog from "$lib/dialogs/DeleteUnitDialog.svelte";
    import NewUnitDialog from "$lib/dialogs/NewUnitDialog.svelte";
    import RenameUnitDialog from "$lib/dialogs/RenameUnitDialog.svelte";
    import AboutDialog from "$lib/dialogs/AboutDialog.svelte";
    import SearchTextDialog from "$lib/dialogs/SearchTextDialog.svelte"
    import SearchElementDialog from "$lib/dialogs/SearchElementDialog.svelte"
    import StatusBar from "$lib/main-app/StatusBar.svelte"
    import ToolBar from "$lib/main-app/ToolBar.svelte"
    import EditorTab from "$lib/multi-editor/EditorTab.svelte"
    import { editorInfo, infoPanelShown, type UnitInfo } from "$lib/stores"

    let transitionParams = {
        x: 320,
        duration: 200,
        easing: sineIn
    };

    let unitsInTabs: UnitInfo[] = $state([]);
    let currentOpenTab: number = $state(0);

    onMount(async () => {
        // If a model is given as parameter, open this model
        // A new model is created when this model does not exist
        const urlParams = new URLSearchParams(window.location.search);
        const model: string | null = urlParams.get('model');
        if (model !== null) {
            await WebappConfigurator.getInstance().openModel(model);
            unitsInTabs = editorInfo.unitIds;
            initializing.value = false;
        } else {
            // No model given as parameter, open the open/new model dialog
            await openStartDialog();
            initializing.value = false;
        }
    });

    function openTab(index: number) {
        console.log('opening tab: ',  index);
        WebappConfigurator.getInstance().openModelUnit(editorInfo.unitIds[index].name);
        currentOpenTab = index;
        infoPanelShown.value = false;
    }
</script>

<div class="flex flex-col h-screen overflow-hidden">
    <NavBar/>
    <ToolBar/>

    <Tabs tabStyle="underline" class="dark:bg-gray-800 dark:text-white" >
        {#each unitsInTabs as unitInfo, index}
            <TabItem open={currentOpenTab === index} title={unitInfo.name} onclick={() => openTab(index)}
                     defaultClass="dark:bg-gray-800 dark:text-white inline-block text-sm font-medium text-center disabled:cursor-not-allowed p-0 border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 text-gray-500 dark:text-gray-400">
                <EditorTab/>
            </TabItem>
        {/each}
    </Tabs>

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
    <ModelDrawer/>
</Drawer>

<StartDialog/>
<NewModelDialog/>
<OpenModelDialog/>
<DeleteModelDialog/>
<RenameModelDialog/>
<ImportDialog/>

<NewUnitDialog/>
<DeleteUnitDialog/>
<RenameUnitDialog/>

<SearchTextDialog />
<SearchElementDialog />

<ViewDialog/>
<AboutDialog />
