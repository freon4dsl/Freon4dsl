<script lang="ts">
    import {
        Alert,
        FooterLink,
        FooterLinkGroup,
        Drawer,
        Footer,
        FooterCopyright,
        Button
    } from 'flowbite-svelte';
    import {InfoCircleSolid} from 'flowbite-svelte-icons';
    import {onMount} from 'svelte';
    import {sineIn} from 'svelte/easing';
    import {fly} from 'svelte/transition';
    import {WebappConfigurator} from '$lib/language';
    import NavBar from '$lib/main-app/NavBar.svelte';
    import ModelDrawer from '$lib/main-app/ModelDrawer.svelte';
    import { drawerHidden, inDevelopment, initializing } from "$lib/stores/WebappStores.svelte"
    import {messageInfo} from "$lib/stores/UserMessageStore.svelte";
    import {FreErrorSeverity} from "@freon4dsl/core";
    import ViewDialog from "$lib/dialogs/ViewDialog.svelte";
    import EditorPart from "$lib/main-app/EditorPart.svelte";
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
    import FindDialog from "$lib/dialogs/SearchTextDialog.svelte"
    import SearchTextDialog from "$lib/dialogs/SearchTextDialog.svelte"
    import SearchElementDialog from "$lib/dialogs/SearchElementDialog.svelte"
    import StatusBar from "$lib/main-app/StatusBar.svelte"
    import InfoPanel from "$lib/main-app/InfoPanel.svelte"

    let transitionParams = {
        x: 320,
        duration: 200,
        easing: sineIn
    };

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

    // Svelte: Type 'string' is not assignable to type '"red" | "blue" | "green" | "form" | "none" | "gray" | "yellow" | "indigo" | "purple" | "pink" | "light" | "dark" | "default" | "dropdown" | "navbar" | "navbarUl" | "primary" | "orange" | undefined'.
    type COLOR =
        "red"
        | "blue"
        | "green"
        | "form"
        | "none"
        | "gray"
        | "yellow"
        | "indigo"
        | "purple"
        | "pink"
        | "light"
        | "dark"
        | "default"
        | "dropdown"
        | "navbar"
        | "navbarUl"
        | "primary"
        | "orange"
        | undefined;
    let messColor: COLOR = $state("red");
    $effect(() => {
        // @ts-expect-error COLOR is not used correctly
        messColor =
            messageInfo.severity === FreErrorSeverity.Info ?
                "blue"
                : (messageInfo.severity === FreErrorSeverity.Hint ?
                    "green"
                    : (messageInfo.severity === FreErrorSeverity.Warning ?
                        "plum"
                        : (messageInfo.severity === FreErrorSeverity.Error ?
                            "red"
                            : "black")));
    });
</script>

<div class="flex flex-col h-screen">
    <NavBar/>
    {#if inDevelopment.value}
        <StatusBar />
    {/if}
    {#if messageInfo.userMessageOpen}
        <Alert color={messColor} dismissable transition={fly} params={{ x: 200 }}>
            <InfoCircleSolid slot="icon" class="w-5 h-5"/>
            {messageInfo.userMessage}
            <Button slot="close-button" size="xs"
                    onclick={() => {messageInfo.userMessageOpen = !messageInfo.userMessageOpen}} class="ms-auto">
                Dismiss
            </Button>
        </Alert>
    {/if}
    <div class="flex-1 overflow-y-scroll">
        <EditorPart/>
    </div>
    <div class="flex-1 overflow-y-scroll bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
        <InfoPanel />
    </div>
    <Footer
            class="text-center sticky md: bottom-0 start-0 z-20 w-full border-t border-gray-200 bg-white p-4 px-4 text-xs shadow md:flex md:items-center md:justify-between md:py-1 dark:border-gray-600 dark:bg-gray-800"
    >
        <FooterCopyright
                href="/"
                by="Freon contributors"
                year={2025}
                class="inline-flex items-center text-xs"
        />
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
