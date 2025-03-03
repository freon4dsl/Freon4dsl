<script>
	import {
		Button,
		ButtonGroup,
		DarkMode,
		Navbar,
		NavBrand,
		Tooltip
	} from 'flowbite-svelte';
	import { AnnotationSolid, ChevronRightOutline } from 'flowbite-svelte-icons';
	import { drawerHidden } from '$lib/stores/WebappStores.svelte';
	import GitHub from '$lib/main-app/GitHub.svelte';
	import {langInfo} from "$lib/stores/LanguageInfo.svelte";
</script>

<!--  start::navbar   -->
	<Navbar class="sticky start-0 top-0 z-20 w-full flex-nowrap border-b px-2 sm:px-4">
		<NavBrand href="/">
			<img src="./freonlogo.svg" class="me-3 h-6 sm:h-9" alt="Freon Logo" />
			<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Freon for {langInfo.name}</span>
		</NavBrand>

		<div class="flex md:order-2">
			<ButtonGroup class="*:!ring-primary-700">
				<DarkMode />
				<Tooltip placement="bottom">Dark/Light Mode</Tooltip>
				<Button
					name="View on GitHub"
					href="https://github.com/freon4dsl/IntegrationExample"
					target="_blank"
				>
					<GitHub />
				</Button>
				<Tooltip placement="bottom">View on GitHub</Tooltip>
				<Button name="View Documentation" href="https://www.freon4dsl.dev/" target="_blank">
					<AnnotationSolid class="ms-0 inline h-6 w-6 dark:text-white" />
				</Button>
				<Tooltip placement="bottom">Go to Documentation</Tooltip>
				<Button onclick={() => (drawerHidden.value = false)}>
					<ChevronRightOutline class="ms-0 inline h-6 w-6 dark:text-white" />
				</Button>
				<Tooltip placement="bottom">Show Model Info</Tooltip>
			</ButtonGroup>
		</div>
	</Navbar>
<!--  end::navbar   -->
