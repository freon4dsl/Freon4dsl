<script lang="ts">
    import { FREON, StringReplacerBox } from "@freon4dsl/core"
    import LinkSimple from "phosphor-svelte/lib/LinkSimple";
    import PencilSimple from "phosphor-svelte/lib/PencilSimple";
// @ts-ignore
    import { ExternalLink } from "@lucide/svelte";
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
    let pendingNavigation: ReturnType<typeof setTimeout> | null = null;

    function isValidUrl(str: string): boolean {
        try {
            const url = new URL(str);
            return url.protocol === "http:" || url.protocol === "https:";
        } catch (_) {
            return false;
        }
    }

    function normalizeForStorage(str: string): string {
        // Trim whitespace for URLs
        return str.trim();
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
            FREON.astChanger.changeNamed(`UrlInputComponent: Set ${theBox?.propertyName || 'property'} to ${stored}`, () => {
                const setter: any = theBox as any;
                if (setter && typeof setter.setPropertyValue === "function") {
                    setter.setPropertyValue(stored);
                }
            });
        }

        // Update display value
        value = stored;

        isTouched = !isValidUrl(stored) && stored.length > 0;
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
        FREON.astChanger.changeNamed(`UrlInputComponent: Update ${theBox?.propertyName || 'property'}`, () => {
            const setter: any = theBox as any;
            if (setter && typeof setter.setPropertyValue === "function") {
                setter.setPropertyValue(stored);
            }
        });

        if (isTouched && isValidUrl(stored)) {
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

    function openUrl() {
        const trimmed = displayValue.trim();
        if (trimmed && isValidUrl(trimmed)) {
            window.open(trimmed, '_blank', 'noopener,noreferrer');
        }
    }

    function openUrlFromValue() {
        // Open URL from the current value (used in edit mode)
        const trimmed = value.trim();
        if (trimmed && isValidUrl(trimmed)) {
            window.open(trimmed, '_blank', 'noopener,noreferrer');
        }
    }

    function onMouseDown(event: MouseEvent) {
        if (event.button === 0) { // left click
            // Check if the click is on the link, button, or icon - if so, don't interfere at all
            const target = event.target as HTMLElement;
            const isOnLink = target.tagName === 'A' || target.closest('a');
            const isOnButton = target.tagName === 'BUTTON' || target.closest('button');
            const isOnLinkIcon = target.closest('[data-link-icon]') || (target.closest('svg') && target.closest('a'));
            
            if (isOnLink || isOnButton || isOnLinkIcon) {
                // Click is on interactive elements, completely ignore it
                return;
            }
            
            // For double clicks, always start editing
            if (event.detail === 2) {
                event.preventDefault();
                event.stopPropagation();
                startEditing();
            }
            // For single clicks on invalid/empty URLs, start editing
            else if (event.detail === 1 && !isValidUrlValue) {
                event.preventDefault();
                event.stopPropagation();
                startEditing();
            }
            // For single clicks on valid URLs (but not on interactive elements), open the URL
            else if (event.detail === 1 && isValidUrlValue) {
                event.preventDefault();
                event.stopPropagation();
                openUrl();
            }
        }
    }

    function onLinkMouseDown(event: MouseEvent) {
        // Always stop propagation to prevent parent handlers from interfering
        event.stopPropagation();
        
        // For double clicks, prevent navigation and start editing
        if (event.detail === 2) {
            event.preventDefault();
            // Clear any pending navigation
            if (pendingNavigation) {
                clearTimeout(pendingNavigation);
                pendingNavigation = null;
            }
            // Start editing immediately
            startEditing();
            return;
        }
        // For single clicks, don't prevent default - let the click handler manage it
    }

    function onLinkClick(event: MouseEvent) {
        // Always prevent default since we're handling navigation manually
        event.preventDefault();
        // Stop propagation to prevent any parent handlers
        event.stopPropagation();
        
        // For double clicks, start editing instead of navigating
        if (event.detail === 2) {
            // Clear any pending navigation
            if (pendingNavigation) {
                clearTimeout(pendingNavigation);
                pendingNavigation = null;
            }
            // Start editing
            startEditing();
            return;
        }
        
        // For single clicks, open the URL in a new tab
        // Use a small delay to allow double-click detection
        if (pendingNavigation) {
            clearTimeout(pendingNavigation);
        }
        pendingNavigation = setTimeout(() => {
            const trimmed = displayValue.trim();
            if (trimmed && isValidUrl(trimmed)) {
                window.open(trimmed, '_blank', 'noopener,noreferrer');
            }
            pendingNavigation = null;
        }, 200); // Small delay to detect double-clicks
    }

    function onSpanKeyDown(event: KeyboardEvent) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            startEditing();
        }
    }

    function onSpanFocusIn(event: FocusEvent) {
        // Never start editing if there's a valid URL - it should be clickable, not editable
        if (isValidUrlValue) {
            return;
        }
        
        // Don't start editing if focus is on the link itself or a button
        const target = event.target as HTMLElement;
        if (target.tagName === 'A' || target.closest('a') || target.tagName === 'BUTTON' || target.closest('button')) {
            return;
        }
        
        // Only start editing for invalid/empty URLs
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
        const next = isTouched && trimmed.length > 0 && !isValidUrl(trimmed);
        if (showError !== next) {
            showError = next;
        }
    });

    const displayValue = $derived(value || "");
    const hasValue = $derived(displayValue.trim().length > 0);
    const isValidUrlValue = $derived(hasValue && isValidUrl(displayValue.trim()));
    let isHovering = $state(false);
</script>

<div bind:this={componentWrapper} class="inline-flex flex-col align-middle w-full">
    {#if isEditing}
        <!-- Edit mode: Show input with clickable icon -->
        <span class="relative inline-block w-full">
            <input
                bind:this={inputElement}
                class="text-component-input pr-10 w-full"
                type="url"
                placeholder="https://example.com"
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
                        FREON.astChanger.changeNamed(`UrlInputComponent: Paste ${theBox?.propertyName || 'property'}`, () => {
                            const setter: any = theBox as any;
                            if (setter && typeof setter.setPropertyValue === "function") {
                                setter.setPropertyValue(stored);
                            }
                        });
                    }, 0);
                }}
            />
            <!-- Icon always visible in edit mode, clickable when URL is valid -->
            {#if isValidUrl(value.trim())}
                <!-- Clickable icon to open URL when valid -->
                <button
                    type="button"
                    class="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1 hover:opacity-80 cursor-pointer flex items-center justify-center"
                    onclick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openUrlFromValue();
                    }}
                    onmousedown={(e) => e.stopPropagation()}
                    title="Open URL in new tab"
                    aria-label="Open URL in new tab"
                    style="color: var(--green-90t);"
                >
                    <ExternalLink class="w-4 h-4" />
                </button>
            {:else}
                <!-- Non-clickable icon when URL is invalid or empty - always visible -->
                <span class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center" style="color: var(--green-90t);">
                    <LinkSimple class="w-4 h-4" weight="regular" />
                </span>
            {/if}
        </span>
    {:else}
        <!-- View mode: Show clickable link or editable text -->
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <span
            bind:this={spanElement}
            class="text-component-text inline-flex items-center gap-1 relative group"
            tabindex={isValidUrlValue ? -1 : 0}
            role={isValidUrlValue ? undefined : "textbox"}
            onmousedown={onMouseDown}
            onkeydown={onSpanKeyDown}
            onfocusin={onSpanFocusIn}
            onmouseenter={() => isHovering = true}
            onmouseleave={() => isHovering = false}
        >
            {#if hasValue}
                {#if isValidUrlValue}
                    <!-- Valid URL: Show as clickable link with icon -->
                    <!-- svelte-ignore a11y_invalid_attribute -->
                    <a
                        href="#"
                        class="inline-flex items-center gap-1 text-component-text underline hover:opacity-80 cursor-pointer"
                        onmousedown={onLinkMouseDown}
                        onclick={onLinkClick}
                        data-link-icon
                    >
                        <LinkSimple class="w-4 h-4 inline-block flex-shrink-0" weight="regular" style="color: var(--green-90t);" />
                        {displayValue}
                    </a>
                    <!-- Edit icon on hover -->
                    {#if isHovering}
                        <button
                            class="ml-1 opacity-70 hover:opacity-100 flex-shrink-0"
                            onclick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                startEditing();
                            }}
                            onmousedown={(e) => e.stopPropagation()}
                            title="Edit URL"
                            aria-label="Edit URL"
                        >
                            <PencilSimple class="w-3.5 h-3.5" style="color: var(--green-90t);" />
                        </button>
                    {/if}
                {:else}
                    <!-- Invalid URL: Show as editable text with icon -->
                    <LinkSimple class="w-4 h-4 inline-block flex-shrink-0" weight="regular" style="color: var(--green-90t);" />
                    <span class="cursor-pointer">{displayValue}</span>
                {/if}
            {:else}
                <!-- Empty state: Show placeholder with icon -->
                <LinkSimple class="w-4 h-4 inline-block flex-shrink-0 opacity-50" weight="regular" style="color: var(--green-90t);" />
                <span class="text-component-text opacity-50 cursor-pointer">https://example.com</span>
            {/if}
        </span>
    {/if}
    {#if showError}
        <span class="small-label-text mt-1 self-start" style="color:#ef4444">Enter a valid URL (http/https).</span>
    {/if}
</div>


