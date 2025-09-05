<script lang="ts">
	import {
		Button,
		ButtonGroup,
		DarkMode,
		Navbar,
		NavBrand,
		Tooltip
	} from 'flowbite-svelte';
	import {
		AnnotationOutline,
		QuestionCircleOutline
	} from 'flowbite-svelte-icons';
	import { dialogs } from '$lib/stores/WebappStores.svelte';
	import GitHub from '$lib/main-app/GitHub.svelte';
	import { langInfo } from '$lib/stores/LanguageInfo.svelte';
	import { tooltipClass } from '$lib/stores/StylesStore.svelte';
	import { editorInfo } from '$lib/stores';

	// The @apply directive of Tailwind does not function correctly in Svelte, therefore we use this alternative.
	const colorCls: string = 'text-light-base-50 dark:text-dark-base-900 ';
	const buttonCls: string =
		'bg-light-base-600 					dark:bg-dark-base-200 ' +
		'hover:bg-light-base-900 		dark:hover:bg-dark-base-50 ' +
		'border-light-base-100 			dark:border-dark-base-800 ';
	const iconCls: string = 'ms-0 inline h-6 w-6';
</script>

<div class="h-12 my-nav-bar">
<!--  start::navbar   -->
<Navbar id="freon-navbar" class="my-nav-bar bg-light-base-50 dark:bg-dark-base-900 sticky start-0 top-0 z-20 w-full flex-nowrap border-b">
	<NavBrand href="/">
		<img src="./freonlogo.svg" class="me-3 h-6 sm:h-9" alt="Freon Logo" />
		<span
			  class="self-center whitespace-nowrap text-xl font-semibold text-light-base-700 dark:text-dark-base-150 ">
			Freon for <span class="text-light-accent-700 dark:text-dark-accent-100">{langInfo.name} > {editorInfo.modelName}</span>
		</span>
	</NavBrand>

	<ButtonGroup class="*:!ring-dark-base-900 {colorCls}">
      <!--  Dark mode button and tooltip      -->
      <DarkMode tabindex={-1} id="dark-mode-button" class="{buttonCls} {colorCls} rounded-none focus-within:ring-2 focus-within:z-10 p-1px
		    border [&:not(:first-child)]:-ms-px first:rounded-s-lg last:rounded-e-lg" />

		<!--  Github button and tooltip      -->
		<Button tabindex={-1} id="github-button" class="{buttonCls} {colorCls} "
						tag="View on GitHub"
						href="https://github.com/freon4dsl/Freon4dsl"
						target="_blank"
		>
			<GitHub />
		</Button>

		<!--  Documentation button and tooltip      -->
		<Button tabindex={-1} id="docu-button" class="{buttonCls} {colorCls} " tag="View Documentation" href="https://www.freon4dsl.dev/" target="_blank">
			<AnnotationOutline class="{iconCls}" />
		</Button>

		<!--  About button and tooltip      -->
		<Button tabindex={-1} id="about-button" class="{buttonCls} {colorCls} " name="About" onclick={() => (dialogs.aboutDialogVisible = true)}>
			<QuestionCircleOutline class="{iconCls}" />
		</Button>

<!--		&lt;!&ndash;  Model panel button and tooltip      &ndash;&gt;-->
<!--		<Button class="{buttonCls} {colorCls} " onclick={() => (drawerHidden.value = false)}>-->
<!--			<ChevronRightOutline class="{iconCls}" />-->
<!--		</Button>-->
<!--		<Tooltip placement="bottom" class="{tooltipClass}">Show Model Info</Tooltip>-->
	</ButtonGroup>
	<!--  tooltips need to be outside of the button group, otherwise the styling will not be correct  -->
	<Tooltip tabindex={-1} triggeredBy="#dark-mode-button" placement="bottom" class="{tooltipClass}">Dark/Light Mode</Tooltip>
	<Tooltip tabindex={-1} triggeredBy="#github-button" placement="bottom" class="{tooltipClass}">View on GitHub</Tooltip>
	<Tooltip tabindex={-1} triggeredBy="#docu-button" placement="bottom" class="{tooltipClass}">Go to Documentation</Tooltip>
	<Tooltip tabindex={-1} triggeredBy="#about-button" placement="bottom" class="{tooltipClass}">About</Tooltip>
</Navbar>
<!--  end::navbar   -->
</div>

<style></style>
