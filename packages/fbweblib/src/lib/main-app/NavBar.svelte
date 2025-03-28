<script>
    import {
        Button,
        ButtonGroup,
        DarkMode,
        Navbar,
        NavBrand,
        Tooltip
    } from "flowbite-svelte"
    import { AnnotationSolid, ChevronRightOutline, QuestionCircleOutline } from "flowbite-svelte-icons"
    import { dialogs, drawerHidden } from "$lib/stores/WebappStores.svelte"
    import GitHub from "$lib/main-app/GitHub.svelte"
    import { langInfo } from "$lib/stores/LanguageInfo.svelte"
    import ToolBar from "$lib/main-app/ToolBar.svelte"
</script>

<!--  start::navbar   -->
<Navbar class="sticky start-0 top-0 z-20 w-full flex-nowrap border-b px-2 sm:px-4">
    <NavBrand href="/">
        <img src="./freonlogo.svg" class="me-3 h-6 sm:h-9" alt="Freon Logo" />
        <span
            class="self-center whitespace-nowrap text-xl font-semibold text-secondary-900 dark:text-white">Freon for {langInfo.name}</span>
    </NavBrand>


    <ButtonGroup class="*:!ring-secondary-900 ">
        <DarkMode class="text-secondary-900" />
        <Tooltip placement="bottom">Dark/Light Mode</Tooltip>
        <Button class="text-secondary-900"
                name="View on GitHub"
                href="https://github.com/freon4dsl/Freon4dsl"
                target="_blank"
        >
            <GitHub />
        </Button>
        <Tooltip placement="bottom">View on GitHub</Tooltip>
        <Button name="View Documentation" href="https://www.freon4dsl.dev/" target="_blank"
                class="text-secondary-900">
            <AnnotationSolid class="ms-0 inline h-6 w-6 dark:text-white" />
        </Button>
        <Tooltip placement="bottom">Go to Documentation</Tooltip>
        <Button name="About" onclick={() => (dialogs.aboutDialogVisible = true)} class="text-secondary-900">
            <QuestionCircleOutline class="ms-0 inline h-6 w-6 dark:text-white" />
        </Button>
        <Tooltip placement="bottom">About</Tooltip>
        <Button onclick={() => (drawerHidden.value = false)} class="text-secondary-900">
            <ChevronRightOutline class="ms-0 inline h-6 w-6 dark:text-white" />
        </Button>
        <Tooltip placement="bottom">Show Model Info</Tooltip>
    </ButtonGroup>
</Navbar>
<!--  end::navbar   -->
