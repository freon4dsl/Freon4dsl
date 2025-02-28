<script>
	import {
		Button,
		ButtonGroup,
		DarkMode,
		Navbar,
		NavBrand,
		NavHamburger,
		NavUl,
		Tooltip
	} from 'flowbite-svelte';
	import { AnnotationSolid, ChevronRightOutline } from 'flowbite-svelte-icons';
	import { drawerHidden } from '$lib/stores/WebappStores.svelte';
	import GitHub from '$lib/main-app/GitHub.svelte';
	import FileMenu from '$lib/main-app/FileMenu.svelte';
	import EditMenu from '$lib/main-app/EditMenu.svelte';
	import {langInfo} from "$lib/stores/LanguageInfo.svelte";
	import ToolMenu from "$lib/main-app/ToolMenu.svelte";
	let hidden = false;
</script>

<!--  start::navbar   -->
	<Navbar class="fixed start-0 top-0 z-20 w-full flex-nowrap border-b px-2 py-2.5 sm:px-4">
		<NavBrand href="/">
			<img src="./freonlogo.svg" class="me-3 h-6 sm:h-9" alt="Freon Logo" />
			<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Freon for {langInfo.name}</span>
		</NavBrand>

		<NavUl {hidden}>
			<FileMenu />
			<EditMenu />
			<ToolMenu />
		</NavUl>
		<div class="flex md:order-2">
			<ButtonGroup class="*:!ring-primary-700">
				<NavHamburger />
				<Tooltip placement="bottom">See menu</Tooltip>
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
