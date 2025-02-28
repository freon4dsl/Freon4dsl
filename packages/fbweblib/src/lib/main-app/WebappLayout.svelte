<script lang="ts">
	import { FooterLink, FooterLinkGroup, Spinner } from 'flowbite-svelte';
	import { Drawer, CloseButton } from 'flowbite-svelte';
	import { sineIn } from 'svelte/easing';
	import NavBar from '$lib/main-app/NavBar.svelte';
	import { drawerHidden } from '$lib/stores/WebappStores.svelte';
	import ModelInfo from '$lib/main-app/ModelInfo.svelte';
	import { Footer, FooterCopyright } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { WebappConfigurator } from '$lib/language';
	import { progressIndicatorShown, noUnitAvailable, serverInfo } from '$lib/stores/ModelInfo.svelte.js';
	import { dialogs } from '$lib/stores/WebappStores.svelte';
	import { FreonComponent } from '@freon4dsl/core-svelte';
	import OpenModelDialog from '$lib/dialogs/OpenModelDialog.svelte';

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

</script>

<NavBar />

<div style="height:60px;" class="block md:hidden lg:hidden xl:hidden">
	<!--  This block is here to shift the content down on small media. This is done because the "sm:mt-12"
      marking down below does not function. -->
</div>

<div
	 class="h-full flex items-center justify-center bg-primary-50 dark:bg-gray-700 dark:text-white pb-16 sm:mb-12 sm:mt-12 md:mb-20 md:mt-20 lg:mb-20 lg:mt-20 xl:mb-20 xl:mt-20"
>
	<div class='bg-white m-4 dark:bg-gray-700 dark:text-white'>
		{#if (noUnitAvailable.value)}
			<div class="message">
				<div class="mdc-typography--subtitle1">
					Please, select, create, or import Unit to be shown.
				</div>
			</div>
		{:else}
			<FreonComponent editor={WebappConfigurator.getInstance().editorEnvironment?.editor} />
			<div class="text-center {hidden}" ><Spinner /></div>
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
			>freon4dsl.dev</FooterLink
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
		<CloseButton onclick={() => (drawerHidden.value = true)} class="mb-4 dark:text-white" />
	</div>
	<ModelInfo />
</Drawer>

<OpenModelDialog/>


<style>
	.hidden {
		display: none;
	}
</style>
