<script lang="ts">
    import { FREON, StringReplacerBox } from "@freon4dsl/core"
    import Envelope from "phosphor-svelte/lib/Envelope";
    import { onMount, tick } from "svelte";

    const { box } = $props<{ box: StringReplacerBox }>();
    let theBox: StringReplacerBox | null = null;
    let value = $state("");
    let isEditing = $state(false);
    // svelte-ignore non_reactive_update
    let inputElement: HTMLInputElement | null = null;
    // svelte-ignore non_reactive_update
    let spanElement: HTMLSpanElement | null = null;
    // svelte-ignore non_reactive_update
    let componentWrapper: HTMLDivElement | null = null;
    let isTouched = $state(false);

    function isValidEmail(str: string): boolean {
        // Basic email validation - checks for @ and domain with at least one dot
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(str.trim());
    }

    function normalizeForStorage(str: string): string {
        // Trim whitespace and convert to lowercase (standard email convention)
        return str.trim().toLowerCase();
    }

    function getValue() {
        const startStr: string | undefined = theBox?.getPropertyValue();
        if (typeof startStr === "string") {
            value = startStr;
        } else {
            value = "";
        }
        return value;
    }

    async function startEditing() {
        isEditing = true;
        isTouched = false;

        // Get the stored value for editing
        const stored = theBox?.getPropertyValue();
        if (stored && typeof stored === "string") {
            value = stored;
        }

        await tick(); // Wait for input to be rendered
        if (inputElement) {
            inputElement.focus();
            inputElement.select();
        }
    }

    function endEditing() {
        // Save the current value before exiting edit mode
        const raw = value;
        const stored = normalizeForStorage(raw);

        // Only save if different from current value
        const currentBoxValue = theBox?.getPropertyValue();
        if (stored !== currentBoxValue) {
            FREON.astChanger.changeNamed(`EmailInputComponent: Set ${theBox?.propertyName || 'property'} to ${stored}`, () => {
                const setter: any = theBox as any;
                if (setter && typeof setter.setPropertyValue === "function") {
                    setter.setPropertyValue(stored);
                }
            });
        }

        // Update display value
        value = stored;

        isTouched = !isValidEmail(stored) && stored.length > 0;
        isEditing = false;
    }

    function setFocus() {
        startEditing();
    }

    const refresh = (why?: string): void => {
        getValue();
        isTouched = false;
    };

    onMount(() => {
        theBox = box as unknown as StringReplacerBox;
        getValue();
        if (theBox) {
            theBox.setFocus = setFocus;
            theBox.refreshComponent = refresh;
        }
    });

    $effect(() => {
        if (!theBox) {
            theBox = box as unknown as StringReplacerBox;
        }
        if (theBox) {
            theBox.setFocus = setFocus;
            theBox.refreshComponent = refresh;
        }
    });

    function onInputChange(e: Event) {
        const raw = (e.target as HTMLInputElement).value;

        // Keep the value as-is during editing
        value = raw;

        // Normalize and save to the model
        const stored = normalizeForStorage(raw);

        // Update property in real-time during editing
        FREON.astChanger.changeNamed(`EmailInputComponent: Update ${theBox?.propertyName || 'property'}`, () => {
            const setter: any = theBox as any;
            if (setter && typeof setter.setPropertyValue === "function") {
                setter.setPropertyValue(stored);
            }
        });

        if (isTouched && isValidEmail(stored)) {
            isTouched = false;
        }
    }

    function onKeyDown(event: KeyboardEvent) {
        if (
            event.key === "Backspace" ||
            event.key === "Delete" ||
            event.key === "ArrowLeft" ||
            event.key === "ArrowRight" ||
            event.key === "ArrowUp" ||
            event.key === "ArrowDown" ||
            event.key === "Home" ||
            event.key === "End" ||
            event.key.length === 1
        ) {
            event.stopPropagation();
        }
    }

    function onMouseDown(event: MouseEvent) {
        if (event.button === 0) { // left click
            event.preventDefault();
            event.stopPropagation();
            startEditing();
        }
    }

    function onSpanKeyDown(event: KeyboardEvent) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            startEditing();
        }
    }

    function onSpanFocusIn() {
        startEditing();
    }

    function onFocusOut(event: FocusEvent) {
        // Get the element that is receiving focus
        const relatedTarget = event.relatedTarget as HTMLElement;

        // Check if focus is moving to an element inside our component
        if (relatedTarget && componentWrapper) {
            // Check if the new focus target is inside the componentWrapper
            if (componentWrapper.contains(relatedTarget)) {
                // Focus is staying within the component, don't exit edit mode
                return;
            }
        }

        // Double-check that focus is truly outside the component
        setTimeout(() => {
            const activeElement = document.activeElement as HTMLElement;
            if (activeElement && componentWrapper) {
                if (componentWrapper.contains(activeElement)) {
                    // Focus came back to the component, don't exit
                    return;
                }
            }
            endEditing();
        }, 100);
    }

    let showError = $state(false);
    $effect(() => {
        const trimmed = value.trim();
        const next = isTouched && trimmed.length > 0 && !isValidEmail(trimmed);
        if (showError !== next) {
            showError = next;
        }
    });

    const displayValue = $derived(value || "");
    const hasValue = $derived(displayValue.trim().length > 0);
</script>

<div bind:this={componentWrapper} class="inline-flex flex-col align-middle w-full">
    {#if isEditing}
        <!-- Edit mode: Show input with icon -->
        <span class="relative inline-block w-full">
            <input
                bind:this={inputElement}
                class="text-component-input pr-8 w-full"
                type="email"
                placeholder="user@example.com"
                bind:value={value}
                oninput={onInputChange}
                onkeydown={onKeyDown}
                onfocusout={onFocusOut}
                onpaste={(e) => {
                    setTimeout(() => {
                        const el = e.target as HTMLInputElement;
                        const raw = el.value;
                        // Keep it as-is during editing
                        value = raw;
                        const stored = normalizeForStorage(raw);
                        FREON.astChanger.changeNamed(`EmailInputComponent: Paste ${theBox?.propertyName || 'property'}`, () => {
                            const setter: any = theBox as any;
                            if (setter && typeof setter.setPropertyValue === "function") {
                                setter.setPropertyValue(stored);
                            }
                        });
                    }, 0);
                }}
            />
            <span class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 z-10" style="color: var(--blue-90t);">
                <Envelope class="w-4 h-4" />
            </span>
        </span>
    {:else}
        <!-- View mode: Show span that looks like text -->
        <span
            bind:this={spanElement}
            class="text-component-text cursor-pointer inline-flex items-center gap-1"
            tabindex="0"
            role="textbox"
            onmousedown={onMouseDown}
            onkeydown={onSpanKeyDown}
            onfocusin={onSpanFocusIn}
        >
            {#if hasValue}
                <Envelope class="w-4 h-4 inline-block" style="color: var(--blue-90t);" />
                {displayValue}
            {:else}
                <Envelope class="w-4 h-4 inline-block opacity-50" style="color: var(--blue-90t);" />
                <span class="text-component-text opacity-50">user@example.com</span>
            {/if}
        </span>
    {/if}
    {#if showError}
        <span class="small-label-text mt-1 self-start" style="color:#ef4444">Enter a valid email address.</span>
    {/if}
</div>
