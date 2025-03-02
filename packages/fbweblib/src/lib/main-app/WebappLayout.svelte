<script lang="ts">
    import {
        Alert,
        FooterLink,
        FooterLinkGroup,
        Spinner,
        Drawer,
        CloseButton,
        Footer,
        FooterCopyright, Button
    } from 'flowbite-svelte';
    import {InfoCircleSolid} from 'flowbite-svelte-icons';
    import {onMount} from 'svelte';
    import {sineIn} from 'svelte/easing';
    import {fly} from 'svelte/transition';
    import {FreonComponent} from '@freon4dsl/core-svelte';
    import {WebappConfigurator} from '$lib/language';
    import NavBar from '$lib/main-app/NavBar.svelte';
    import ModelInfo from '$lib/main-app/ModelInfo.svelte';
    import OpenModelDialog from '$lib/dialogs/OpenModelDialog.svelte';
    import {drawerHidden, initializing, dialogs} from '$lib/stores/WebappStores.svelte';
    import {progressIndicatorShown, noUnitAvailable, serverInfo} from '$lib/stores/ModelInfo.svelte.js';
    import {messageInfo} from "$lib/stores/UserMessageStore.svelte";
    import {FreErrorSeverity} from "@freon4dsl/core";
    import ViewDialog from "$lib/dialogs/ViewDialog.svelte";
    import NewUnitDialog from "$lib/dialogs/NewUnitDialog.svelte";

    let transitionParams = {
        x: 320,
        duration: 200,
        easing: sineIn
    };

    let hidden: string = $derived(progressIndicatorShown.value ? '' : 'hidden');

    onMount(async () => {
        // If a model is given as parameter, open this model
        // A new model is created when this model does not exist
        const urlParams = new URLSearchParams(window.location.search);
        const model = urlParams.get('model');
        if (model !== null) {
            await WebappConfigurator.getInstance().openModel(model);
            initializing.value = false;
        } else {
            // No model given as parameter, open the dialog to ask for it
            // Get list of models from server
            const names = await WebappConfigurator.getInstance().getAllModelNames();
            if (!!names && names.length > 0) {
                // Make the names available for the dialog
                serverInfo.allModelNames = names;
            }
            // Open the open/new model dialog
            dialogs.openModelDialogVisible = true;
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

<NavBar/>

<div style="height:60px;" class="block md:hidden lg:hidden xl:hidden">
    <!--  This block is here to shift the content down on small media. This is done because the "sm:mt-12"
      marking down below does not function. -->
</div>

<div
        class="h-full flex items-start justify-start bg-white dark:bg-gray-700 dark:text-white pb-16 sm:mb-12 sm:mt-12 md:mb-20 md:mt-20 lg:mb-20 lg:mt-20 xl:mb-20 xl:mt-20"
>
    <div class='bg-white m-4 dark:bg-gray-700 dark:text-white w-full'>
        {#if messageInfo.userMessageOpen}
            <Alert color={messColor} dismissable transition={fly} params={{ x: 200 }}>
                <InfoCircleSolid slot="icon" class="w-5 h-5"/>
                {messageInfo.userMessage}
                <Button slot="close-button" size="xs" let:close
                        on:click={() => {messageInfo.userMessageOpen = !messageInfo.userMessageOpen}} class="ms-auto">
                    Dissmiss
                </Button>
            </Alert>
        {/if}
        {#if (noUnitAvailable.value)}
            <div class="h-screen">
                {#if !messageInfo.userMessageOpen}
                    <Alert color="red" transition={fly} params={{ x: 200 }}>
                        <InfoCircleSolid slot="icon" class="w-5 h-5"/>
                        Please, select, create, or import Unit to be shown.
                    </Alert>
                {/if}
            </div>
        {:else}
            <FreonComponent editor={WebappConfigurator.getInstance().langEnv?.editor}/>
            <div class="text-center {hidden}">
                <Spinner/>
            </div>
        {/if}
    </div>
</div>

<Footer
        class="md: fixed bottom-0 start-0 z-20 w-full border-t border-gray-200 bg-white p-4 px-4 text-xs shadow md:flex md:items-center md:justify-between md:py-1 dark:border-gray-600 dark:bg-gray-800"
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

<!-- Normally hidden elements-->

<Drawer
        placement="right"
        transitionType="fly"
        {transitionParams}
        bind:hidden={drawerHidden.value}
        id="sidebar1"
>
    <div class="flex items-center">
        <h5
                id="drawer-label"
                class="mb-4 inline-flex items-center text-base font-semibold text-gray-500 dark:text-gray-400"
        >
            Model Info
        </h5>
        <CloseButton onclick={() => (drawerHidden.value = true)} class="mb-4 dark:text-white"/>
    </div>
    <ModelInfo/>
</Drawer>

<OpenModelDialog/>
<!--<DeleteModelDialog/>-->
<NewUnitDialog/>
<!--<DeleteUnitDialog/>-->
<!--<RenameUnitDialog/>-->

<!--<FindNamedElementDialog />-->
<!--<FindStructureDialog />-->
<!--<FindTextDialog />-->

<ViewDialog/>
<!--<HelpDialog />-->


<style>
    .hidden {
        display: none;
    }
</style>
