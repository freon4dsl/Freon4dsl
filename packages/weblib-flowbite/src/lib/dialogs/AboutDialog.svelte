<script lang="ts">
    import Dialog from "$lib/dialogs/Dialog.svelte"
    import { dialogs, versionNumber } from "../stores/index.js";
    import { Card, Modal } from "flowbite-svelte";
    import {
        BadgeCheckOutline,
        ClockOutline,
        EnvelopeOutline,
        GithubSolid,
        AnnotationOutline
    } from 'flowbite-svelte-icons';
</script>

<Dialog open={dialogs.aboutDialogVisible}>
    <Card class="flex flex-col space-y-6 bg-light-base-50 dark:bg-dark-base-900 shadow my-2 p-6 max-w-full" role="dialog">
<!--        <h3 class="mb-0 text-xl font-semibold text-light-base-900 dark:text-dark-base-50">About the Freon Editor</h3>-->
        <div class="flex flex-col items-center bg-light-base-50 dark:bg-dark-base-900">
            <Card class="bg-light-base-100 dark:bg-dark-base-700">
                <h3 class="text-xl pb-4 font-semibold text-light-base-900 dark:text-dark-base-50  ">
                    <span class="pl-1 text-light-base-900 dark:text-dark-base-50">Freon</span> is an open source project.
                </h3>
                <ul class="space-y-2 text-light-base-700 dark:text-dark-base-100 ">
                    <li class="flex items-center ">
                        <ClockOutline class="text-light-base-900 dark:text-dark-base-50"/>
                        <p class="pl-4 text-light-base-900 dark:text-dark-base-50">Current version:</p> <p class="pl-1 text-light-base-700 dark:text-dark-base-100">{versionNumber.value}</p>
                    </li>
                    <li class="flex items-center">
                        <AnnotationOutline class="ms-0 inline h-6 w-6 text-light-base-900 dark:text-dark-base-50"/>
                        <p class="pl-3 text-light-base-900 dark:text-dark-base-50">Documentation: <a class="pl-1 text-light-base-700 dark:text-dark-base-100" href="https://www.freon4dsl.dev/"
                                                          target="_blank" rel="noreferrer">
                            www.freon4dsl.dev
                        </a></p>
                    </li>
                    <li class="flex items-center">
                        <GithubSolid class="text-light-base-900 dark:text-dark-base-50"/>
                        <p class="pl-4 text-light-base-900 dark:text-dark-base-50"> Sources: <a class="ml-2 text-light-base-700 dark:text-dark-base-100" href="https://github.com/freon4dsl"
                                                     target="_blank" rel="noreferrer">
                            https://github.com/freon4dsl
                        </a></p>
                    </li>
                    <li class="flex items-center">
                        <BadgeCheckOutline class="text-light-base-900 dark:text-dark-base-50"/>
                        <p class="pl-4 text-light-base-900 dark:text-dark-base-50">License:</p> <p class="pl-1 text-light-base-700 dark:text-dark-base-100">MIT</p>
                    </li>
                    <li class="flex items-center">
                        <EnvelopeOutline class="text-light-base-900 dark:text-dark-base-50"/>
                        <p class="pl-4 text-light-base-900 dark:text-dark-base-50">Contact:
                            <a class="pl-1 text-light-base-700 dark:text-dark-base-100" href= "mailto:info@openmodeling.nl">info@openmodeling.nl</a>
                        </p>
                    </li>
                </ul>
            </Card>
        </div>

        <h3 class="mb-0 text-xl font-semibold pb-0 text-light-base-900 dark:text-dark-base-50">Hints for Using the Editor</h3>

        <div class="mx-4">
            <h5 class="text-lg font-semibold text-light-base-900 dark:text-dark-base-50 mb-1">Context menu</h5>
            <!-- todo check the hints, the enter key , for instance, does not work anymore -->
            <p class="text-light-base-900 dark:text-dark-base-50 mb-2">
                Using the right mouse button a context menu can be shown for elements that are
                part of a list. This menu offers some functionality on the selected list node, like cut/copy/paste.
            </p>

            <h5 class="text-lg font-semibold text-light-base-900 dark:text-dark-base-50 mb-1">Drag and drop</h5>
            <p class="text-light-base-900 dark:text-dark-base-50 mb-2">
                Drag and drop functionality is provided for list elements. An node can be dragged from a list (or
                table), and dropped in a list (or table). Note that you should click outside of any editable text
                to grab the node.
            </p>

            <h5 class="text-lg font-semibold text-light-base-900 dark:text-dark-base-50 mb-1">Keybindings</h5>
            <p class="text-light-base-900 dark:text-dark-base-50 mb-2">
                When editing a text field, e.g. a name, the ENTER key stops the editing and stores the value in the
                model, whereas the ESC key stops the editing without storing the value.
            </p>

            <h5 class="text-lg font-semibold text-light-base-900 dark:text-dark-base-50 mb-1">
                Keys that can be used anywhere
            </h5>
            <ul class="list-disc text-light-base-900 dark:text-dark-base-50 mb-2">
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

            <h5 class="text-lg font-semibold text-light-base-900 dark:text-dark-base-50 mb-1">Working in full-screen mode</h5>
            <p class="text-light-base-900 dark:text-dark-base-50 mb-2">
                If you want or need more space for the editor, use the full-screen mode of your browser. Most web browsers allow
                you to activate fullscreen mode by pressing the F11 key. Exit the full-screen mode by pressing ESC.
            </p>
        </div>
    </Card>
</Dialog>


