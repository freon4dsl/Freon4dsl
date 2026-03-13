<script lang="ts">
    import Dialog from "$lib/dialogs/Dialog.svelte";
    import { dialogs, versionNumber } from "../stores/index.js";
    import { Card } from "flowbite-svelte";
    import {
        BadgeCheckOutline,
        ClockOutline,
        EnvelopeOutline,
        GithubSolid,
        AnnotationOutline
    } from "flowbite-svelte-icons";
</script>

<Dialog open={dialogs.aboutDialogVisible}>
    <Card class="freon-dialog-card my-2 flex max-w-full flex-col space-y-6 p-6 shadow" role="dialog">
        <div class="flex flex-col items-center">
            <Card class="freon-dialog-section w-full max-w-3xl">
                <h3 class="freon-dialog-title mb-4">
                    <span class="pl-1">Freon</span> is an open source project.
                </h3>

                <ul class="freon-dialog-list space-y-3">
                    <li class="flex items-center">
                        <ClockOutline class="freon-dialog-icon" />
                        <p class="freon-dialog-label pl-4">Current version:</p>
                        <p class="freon-dialog-value pl-1">{versionNumber.value}</p>
                    </li>

                    <li class="flex items-center">
                        <AnnotationOutline class="freon-dialog-icon ms-0 inline h-6 w-6" />
                        <p class="freon-dialog-label pl-3">
                            Documentation:
                            <a
                                class="freon-dialog-link pl-1"
                                href="https://www.freon4dsl.dev/"
                                target="_blank"
                                rel="noreferrer"
                            >
                                www.freon4dsl.dev
                            </a>
                        </p>
                    </li>

                    <li class="flex items-center">
                        <GithubSolid class="freon-dialog-icon" />
                        <p class="freon-dialog-label pl-4">
                            Sources:
                            <a
                                class="freon-dialog-link ml-2"
                                href="https://github.com/freon4dsl"
                                target="_blank"
                                rel="noreferrer"
                            >
                                https://github.com/freon4dsl
                            </a>
                        </p>
                    </li>

                    <li class="flex items-center">
                        <BadgeCheckOutline class="freon-dialog-icon" />
                        <p class="freon-dialog-label pl-4">License:</p>
                        <p class="freon-dialog-value pl-1">MIT</p>
                    </li>

                    <li class="flex items-center">
                        <EnvelopeOutline class="freon-dialog-icon" />
                        <p class="freon-dialog-label pl-4">
                            Contact:
                            <a class="freon-dialog-link pl-1" href="mailto:info@openmodeling.nl">
                                info@openmodeling.nl
                            </a>
                        </p>
                    </li>
                </ul>
            </Card>
        </div>

        <h3 class="freon-dialog-title mb-0 pb-0">Hints for Using the Editor</h3>

        <div class="mx-4 space-y-4">
            <section>
                <h5 class="freon-dialog-subtitle mb-1">Context menu</h5>
                <p class="freon-dialog-text">
                    Using the right mouse button a context menu can be shown for elements that are
                    part of a list. This menu offers some functionality on the selected list node,
                    like cut/copy/paste.
                </p>
            </section>

            <section>
                <h5 class="freon-dialog-subtitle mb-1">Drag and drop</h5>
                <p class="freon-dialog-text">
                    Drag and drop functionality is provided for list elements. A node can be dragged
                    from a list (or table), and dropped in a list (or table). Note that you should
                    click outside of any editable text to grab the node.
                </p>
            </section>

            <section>
                <h5 class="freon-dialog-subtitle mb-1">Keybindings</h5>
                <p class="freon-dialog-text">
                    When editing a text field, e.g. a name, the ENTER key stops the editing and stores
                    the value in the model, whereas the ESC key stops the editing without storing the value.
                </p>
            </section>

            <section>
                <h5 class="freon-dialog-subtitle mb-1">Keys that can be used anywhere</h5>
                <ul class="freon-dialog-text list-disc mb-2">
                    <li class="ml-6">Arrow Keys move in the expected direction</li>
                    <li class="ml-6">TAB key moves to next place where the user can type something</li>
                    <li class="ml-6">Ctrl-UP selects the parent node in the AST</li>
                    <li class="ml-6">Ctrl-DOWN selects the first child node in the AST</li>
                    <li class="ml-6">Ctrl-SPACE shows popup menu of possible options</li>
                    <li class="ml-6">DEL deletes the next character or the currently selected item from the AST</li>
                </ul>
            </section>

            <section>
                <h5 class="freon-dialog-subtitle mb-1">Working in full-screen mode</h5>
                <p class="freon-dialog-text">
                    If you want or need more space for the editor, use the full-screen mode of your browser.
                    Most web browsers allow you to activate fullscreen mode by pressing the F11 key.
                    Exit the full-screen mode by pressing ESC.
                </p>
            </section>
        </div>
    </Card>
</Dialog>
