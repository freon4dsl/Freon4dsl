<script lang="ts">
    import {dialogs} from "$lib";
    import {Card, Modal} from "flowbite-svelte";
    import {versionNumber} from "$lib";
    import {
        BadgeCheckOutline,
        ClockOutline,
        EnvelopeOutline,
        GithubSolid,
        AnnotationOutline
    } from 'flowbite-svelte-icons';

</script>

<Modal bind:open={dialogs.helpDialogVisible} autoclose={false} class="w-full">
    <div class="pb-0.5"></div>
    <Card class="flex flex-col space-y-6 bg-white shadow my-2 p-6 max-w-full" role="dialog">
        <h3 class="mb-0 text-xl font-semibold text-gray-900 dark:text-white">About the Freon Editor</h3>
        <div class="flex flex-col items-center">
            <Card>
                <div class="text pb-4">
                    <b>Freon</b> is an open source project.
                </div>
                <ul class="space-y-2 text-gray-700 dark:text-gray-300">
                    <li class="flex items-center">
                        <ClockOutline class="text-blue-800  dark:text-blue-200"/>
                        <p class="pl-4">Current version: <b class="pl-1 text-amber-700">{versionNumber.value}</b></p>
                    </li>
                    <li class="flex items-center">
                        <AnnotationOutline class="ms-0 inline h-6 w-6 text-blue-800 dark:text-blue-200"/>
                        <p class="pl-3">Documentation: <a class="pl-1 text-amber-700" href="https://www.freon4dsl.dev/"
                                                          target="_blank" rel="noreferrer">
                            www.freon4dsl.dev
                        </a></p>
                    </li>
                    <li class="flex items-center">
                        <GithubSolid class="text-blue-800  dark:text-blue-200"/>
                        <p class="pl-4"> Sources: <a class="ml-2 text-amber-700" href="https://github.com/freon4dsl"
                                                     target="_blank" rel="noreferrer">
                            https://github.com/freon4dsl
                        </a></p>
                    </li>
                    <li class="flex items-center">
                        <BadgeCheckOutline class="text-blue-800  dark:text-blue-200"/>
                        <p class="pl-4">License: <b class="pl-1 text-amber-700">MIT</b></p>
                    </li>
                    <li class="flex items-center">
                        <EnvelopeOutline class="text-blue-800  dark:text-blue-200"/>
                        <p class="pl-4">Contact:
                            <a class="pl-1 text-amber-700"href= "mailto:jos.warmer@openmodeling.nl">Jos Warmer</a> or
                            <a class="pl-1 text-amber-700"href= "mailto:anneke.kleppe@openmodeling.nl">Anneke Kleppe</a>
                        </p>
                    </li>
                </ul>
            </Card>
        </div>

        <h3 class="mb-0 text-xl font-semibold pb-0 text-gray-900 dark:text-white">Hints for Using the Editor</h3>

        <div class="ml-4">
            <h5 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Context menu</h5>
            <!-- todo check the hints, the enter key , for instance, does not work anymore -->
            <p class="text-gray-700 dark:text-gray-300 mb-2">
                Using the right mouse button a context menu can be shown for elements that are
                part of a list. This menu offers some functionality on the selected list node, like cut/copy/paste.
            </p>

            <h5 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Drag and drop</h5>
            <p class="text-gray-700 dark:text-gray-300 mb-6">
                Drag and drop functionality is provided for list elements. An node can be dragged from a list (or
                table), and dropped in a list (or table). Note that you should click outside of any editable text
                to grab the node.
            </p>

            <h5 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Keybindings</h5>
            <p class="text-gray-700 dark:text-gray-300 mb-6">
                When editing a text field, e.g. a name, the ENTER key stops the editing and stores the value in the
                model, whereas the ESC key stops the editing without storing the value.
            </p>

            <h5 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Keys that can be used anywhere
            </h5>
            <ul class="list-disc">
                <li class="ml-6 text-base border-none">
                    Arrow Keys move in the expected direction
                </li>
                <li class="ml-6 text-base border-none">
                    TAB key moves to next place where the user can type something
                </li>
                <li class="ml-6 text-base border-none">
                    Ctrl-UP selects the parent node in the AST
                </li>
                <li class="ml-6 text-base border-none">
                    Ctrl-DOWN selects the first child node in the AST
                </li>
                <li class="ml-6 text-base border-none">
                    Ctrl-SPACE shows popup menu of possible options
                </li>
                <li class="ml-6 text-base border-none">
                    DEL deletes the next character or the currently selected item from the AST
                </li>
            </ul>
        </div>
    </Card>
</Modal>


