<script lang="ts">
	import {
		Button,
		ButtonGroup,
		Navbar,
		NavBrand,
		Tooltip
	} from 'flowbite-svelte';
	import {
		AnnotationOutline,
		QuestionCircleOutline
	} from 'flowbite-svelte-icons';
	import { dialogs } from '$lib/stores/WebappStores.svelte';
	import GitHub from '$lib/main-app/helpers/GitHub.svelte';
	import { langInfo } from '$lib/stores/LanguageInfo.svelte';
	import { editorInfo } from '$lib/stores';
	import DarkModeButton from "$lib/main-app/helpers/DarkModeButton.svelte"
</script>

<div class="h-14 freon-navbar">
	<!--  start::navbar   -->
	<Navbar
		id="freon-navbar"
		class="freon-navbar sticky top-0 z-20 w-full flex-nowrap items-center border-b"
	>
		<NavBrand href="/" class="flex items-center">
			<img src="./freonlogo.svg" class="me-3 h-7 sm:h-9" alt="Freon Logo" />
			<span class="self-center whitespace-nowrap text-xl font-semibold freon-navbar-text">
				Freon for
				<span class="text-light-accent-700 dark:text-dark-accent-100">
					{langInfo.name} &gt; {editorInfo.modelName}
				</span>
			</span>
		</NavBrand>

		<ButtonGroup class="flex items-center freon-navbar-text *:px-3 *:py-1.5 *:border *:ring-dark-base-900! *:not-first:-ms-px">
			<!--  Dark mode button and tooltip      -->
			<DarkModeButton />
			<!--  Github button and tooltip      -->
			<Button
				tabindex={-1}
				id="github-button"
				class="freon-btn"
				tag="View on GitHub"
				href="https://github.com/freon4dsl/Freon4dsl"
				target="_blank"
			>
				<GitHub />
			</Button>
			<!--  Documentation button and tooltip      -->
			<Button
				tabindex={-1}
				id="docu-button"
				class="freon-btn"
				tag="View Documentation"
				href="https://www.freon4dsl.dev/"
				target="_blank"
			>
				<AnnotationOutline class="freon-navbar-icon" />
			</Button>
			<!--  About button and tooltip      -->
			<Button
				tabindex={-1}
				id="about-button"
				class="freon-btn"
				name="About"
				onclick={() => (dialogs.aboutDialogVisible = true)}
			>
				<QuestionCircleOutline class="freon-navbar-icon" />
			</Button>
		</ButtonGroup>

		<!--  tooltips need to be outside of the button group, otherwise the styling will not be correct  -->
		<Tooltip tabindex={-1} triggeredBy="#dark-mode-button" placement="bottom" class="freon-tooltip">Dark/Light Mode</Tooltip>
		<Tooltip tabindex={-1} triggeredBy="#github-button" placement="bottom" class="freon-tooltip">View on GitHub</Tooltip>
		<Tooltip tabindex={-1} triggeredBy="#docu-button" placement="bottom" class="freon-tooltip">Go to Documentation</Tooltip>
		<Tooltip tabindex={-1} triggeredBy="#about-button" placement="bottom" class="freon-tooltip">About</Tooltip>
	</Navbar>
	<!--  end::navbar   -->
</div>
