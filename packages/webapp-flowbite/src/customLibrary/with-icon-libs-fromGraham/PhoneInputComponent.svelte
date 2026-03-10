<script lang="ts">
    import { FREON, StringReplacerBox } from "@freon4dsl/core"
    import Phone from "phosphor-svelte/lib/Phone";
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
    // Tracks when user explicitly confirms country code with a space after +<cc>
    let confirmedCountryCodeLength: number | null = null;

    const MAX_DIGITS = 15; // E.164 max digits (excluding '+')

    function isValidPhone(str: string): boolean {
        // Accept common phone patterns: digits, spaces, dashes, parentheses, leading +; at least 7 digits
        const cleaned = str.replace(/[^\d]/g, "");
        return cleaned.length >= 7 && cleaned.length <= MAX_DIGITS;
    }

    function normalizeForStorage(str: string): string {
        const trimmed = str.trim();
        const hasPlus = trimmed.startsWith("+");
        let digits = trimmed.replace(/[^\d]/g, "");
        if (digits.length > MAX_DIGITS) {
            digits = digits.slice(0, MAX_DIGITS);
        }
        return (hasPlus ? "+" : "") + digits;
    }

    // Minimal country code list for auto-detection; user can always confirm with a space
    const COUNTRY_CODES = [
        "1",  // US/CA
        "44", // UK
        "49", // DE
        "61", // AU
        "81", // JP
        "82", // KR
        "86", // CN
        "91"  // IN
    ];

    function resolveCountryCodeLength(digits: string): number | null {
        if (confirmedCountryCodeLength && confirmedCountryCodeLength <= digits.length) {
            return confirmedCountryCodeLength;
        }
        // Try to resolve uniquely among known codes by prefix (1-3 digits)
        const candidates = COUNTRY_CODES.filter((cc) => digits.startsWith(cc));
        if (candidates.length === 1) {
            return candidates[0].length;
        }
        return null; // ambiguous; wait for more digits or a space confirmation
    }

    function formatForDisplay(stored: string): string {
        if (!stored) return "";
        if (stored === "+") {
            // Show the plus while user begins typing country code
            return "+";
        }
        if (stored.startsWith("+")) {
            // Basic international grouping: +<cc> <xxx> <xxx> <xxxx>
            const digits = stored.slice(1);
            const parts: string[] = [];
            // Determine cc length: confirmed by space or uniquely detected; otherwise show raw +digits until more info
            const ccLen = resolveCountryCodeLength(digits);
            if (!ccLen) {
                return "+" + digits; // defer formatting until cc resolved
            }
            const cc = digits.slice(0, ccLen);
            let rest = digits.slice(ccLen);
            if (cc.length > 0) parts.push("+" + cc);
            while (rest.length > 4) {
                parts.push(rest.slice(0, 3));
                rest = rest.slice(3);
            }
            if (rest.length > 0) parts.push(rest);
            return parts.join(" ");
        }
        const digits = stored.replace(/[^\d]/g, "");
        if (digits.length >= 10) {
            const a = digits.slice(0, 3);
            const b = digits.slice(3, 6);
            const c = digits.slice(6, 10);
            const extra = digits.slice(10);
            return `(${a}) ${b}-${c}${extra ? " " + extra : ""}`;
        } else if (digits.length >= 7) {
            const a = digits.slice(0, 3);
            const b = digits.slice(3, 7);
            const extra = digits.slice(7);
            return `${a}-${b}${extra ? " " + extra : ""}`;
        }
        return digits;
    }

    function getValue() {
        const startStr: string | undefined = theBox?.getPropertyValue();
        if (typeof startStr === "string") {
            value = formatForDisplay(startStr);
        } else {
            value = "";
        }
        return value;
    }

    async function startEditing() {
        isEditing = true;
        isTouched = false;

        // Convert formatted display to raw editable format for editing
        // Strip everything except digits and leading + for easier editing
        const stored = theBox?.getPropertyValue();
        if (stored && typeof stored === "string") {
            // Show the normalized storage format (e.g., "+15551234567" or "5551234567")
            // This makes it editable without formatting getting in the way
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
        const match = raw.match(/^\+(\d{1,3})\s/);
        confirmedCountryCodeLength = match ? match[1].length : confirmedCountryCodeLength;
        const stored = normalizeForStorage(raw);

        // Only save if different from current value
        const currentBoxValue = theBox?.getPropertyValue();
        if (stored !== currentBoxValue) {
            FREON.astChanger.changeNamed(`PhoneInputComponent: Set ${theBox?.propertyName || 'property'} to ${stored}`, () => {
                const setter: any = theBox as any;
                if (setter && typeof setter.setPropertyValue === "function") {
                    setter.setPropertyValue(stored);
                }
            });
        }

        // Format for display in view mode
        const display = formatForDisplay(stored);
        value = display;

        isTouched = !isValidPhone(stored) && stored.length > 0;
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

        // Just update the value - keep it raw (unformatted) during editing
        // This allows the user to edit at any cursor position
        value = raw;

        // Normalize and save to the model
        const stored = normalizeForStorage(raw);

        // Update property in real-time during editing
        FREON.astChanger.changeNamed(`PhoneInputComponent: Update ${theBox?.propertyName || 'property'}`, () => {
            const setter: any = theBox as any;
            if (setter && typeof setter.setPropertyValue === "function") {
                setter.setPropertyValue(stored);
            }
        });

        if (isTouched && isValidPhone(stored)) {
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
        const stored = normalizeForStorage(trimmed);
        const next = isTouched && stored.length > 0 && !isValidPhone(stored);
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
                type="tel"
                placeholder="(555) 123-4567"
                bind:value={value}
                oninput={onInputChange}
                onkeydown={onKeyDown}
                onfocusout={onFocusOut}
                onpaste={(e) => {
                    setTimeout(() => {
                        const el = e.target as HTMLInputElement;
                        const raw = el.value;
                        // Keep it raw (unformatted) during editing
                        value = raw;
                        const stored = normalizeForStorage(raw);
                        FREON.astChanger.changeNamed(`PhoneInputComponent: Paste ${theBox?.propertyName || 'property'}`, () => {
                            const setter: any = theBox as any;
                            if (setter && typeof setter.setPropertyValue === "function") {
                                setter.setPropertyValue(stored);
                            }
                        });
                    }, 0);
                }}
            />
            <span class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 z-10" style="color: var(--green-90t);">
                <Phone class="w-4 h-4" />
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
                <Phone class="w-4 h-4 inline-block" style="color: var(--green-90t);" />
                {displayValue}
            {:else}
                <Phone class="w-4 h-4 inline-block opacity-50" style="color: var(--green-90t);" />
                <span class="text-component-text opacity-50">(555) 123-4567</span>
            {/if}
        </span>
    {/if}
    {#if showError}
        <span class="small-label-text mt-1 self-start" style="color:#ef4444">Enter a valid phone number.</span>
    {/if}
</div>
