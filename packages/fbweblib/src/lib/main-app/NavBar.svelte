<script lang="ts">
	import {
		Button,
		ButtonGroup,
		DarkMode,
		Navbar,
		NavBrand,
		Tooltip
	} from 'flowbite-svelte';
	import { AnnotationOutline, ChevronRightOutline, QuestionCircleOutline } from 'flowbite-svelte-icons';
	import { dialogs, drawerHidden } from '$lib/stores/WebappStores.svelte';
	import GitHub from '$lib/main-app/GitHub.svelte';
	import { langInfo } from '$lib/stores/LanguageInfo.svelte';

	// The @apply directive of Tailwind does not function correctly in Svelte, therefore we use this alternative.
	const colorCls: string = 'text-secondary-900 dark:text-primary-50 ';
	const tooltipCls: string = 'bg-secondary-200 dark:bg-secondary-700 ';
	const buttonCls: string = 'bg-secondary-200 dark:bg-secondary-700 hover:bg-primary-900 dark:hover:bg-primary-700';
	const iconCls: string = 'ms-0 inline h-6 w-6 hover:text-primary-50 dark:hover:text-primary-50';
</script>

<!--  start::navbar   -->
<Navbar class="bg-secondary-50 dark:bg-secondary-900 sticky start-0 top-0 z-20 w-full flex-nowrap border-b px-2 sm:px-4">
	<NavBrand href="/">
		<img src="./freonlogo.svg" class="me-3 h-6 sm:h-9" alt="Freon Logo" />
		<span
			class="self-center whitespace-nowrap text-xl font-semibold {colorCls}">Freon for {langInfo.name}</span>
	</NavBrand>


	<ButtonGroup class="*:!ring-secondary-900 {colorCls}">
      <!--  Dark mode button and tooltip      -->
      <DarkMode class="{buttonCls} {colorCls} rounded-none focus-within:ring-2 focus-within:z-10 px-4
		    border border-gray-200 hover:text-primary-50  hover:bg-primary-900 focus-within:text-primary-700
				dark:focus-within:text-white dark:border-gray-700 dark:hover:border-gray-600 focus-within:ring-gray-200
				dark:focus-within:ring-gray-700 [&amp;:not(:first-child)]:-ms-px first:rounded-s-lg last:rounded-e-lg" />
      <Tooltip placement="bottom" class="{colorCls} {tooltipCls}">Dark/Light Mode</Tooltip>

		<!--  Github button and tooltip      -->
		<Button class="{buttonCls} {colorCls}"
						name="View on GitHub"
						href="https://github.com/freon4dsl/Freon4dsl"
						target="_blank"
		>
			<GitHub />
		</Button>
		<Tooltip placement="bottom" class="{colorCls} {tooltipCls}">View on GitHub</Tooltip>

		<!--  Documentation button and tooltip      -->
		<Button class="{buttonCls} {colorCls}" name="View Documentation" href="https://www.freon4dsl.dev/" target="_blank">
			<AnnotationOutline class="{iconCls} {colorCls}" />
		</Button>
		<Tooltip placement="bottom" class="{colorCls} {tooltipCls}">Go to Documentation</Tooltip>

		<!--  About button and tooltip      -->
		<Button class="{buttonCls} {colorCls}" name="About" onclick={() => (dialogs.aboutDialogVisible = true)}>
			<QuestionCircleOutline class="{iconCls} {colorCls}" />
		</Button>
		<Tooltip placement="bottom" class="{colorCls} {tooltipCls}">About</Tooltip>

		<!--  Model panel button and tooltip      -->
		<Button class="{buttonCls} {colorCls}" onclick={() => (drawerHidden.value = false)}>
			<ChevronRightOutline class="{iconCls} {colorCls}" />
		</Button>
		<Tooltip placement="bottom" class="{colorCls} {tooltipCls}">Show Model Info</Tooltip>
	</ButtonGroup>
</Navbar>
<!--  end::navbar   -->

<style></style>
