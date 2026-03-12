<script lang="ts">
    import EditorPart from "$lib/main-app/EditorPart.svelte"
    import InfoPanel from "$lib/main-app/infopanel/InfoPanel.svelte"
    import { infoPanelShown } from "$lib/stores"

    // draggable split state (only used when info panel is shown)
    let leftPct = $state(70)
    const minPct = 20
    const maxPct = 85

    let dragging = $state(false)
    let containerEl = $state<HTMLElement | null>(null)

    function clamp(n: number, lo: number, hi: number) {
        return Math.max(lo, Math.min(hi, n))
    }

    function setFromClientX(clientX: number) {
        if (!containerEl) return
        const rect = containerEl.getBoundingClientRect()
        const x = clientX - rect.left
        const pct = (x / rect.width) * 100
        leftPct = clamp(pct, minPct, maxPct)
    }

    function onGutterPointerDown(ev: PointerEvent) {
        dragging = true;
        (ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId)
        setFromClientX(ev.clientX)
    }

    function onGutterPointerMove(ev: PointerEvent) {
        if (!dragging) return
        setFromClientX(ev.clientX)
    }

    function onGutterPointerUp(ev: PointerEvent) {
        dragging = false
        try {
            (ev.currentTarget as HTMLElement).releasePointerCapture(ev.pointerId)
        } catch {
            // ignore
        }
    }

    function onGutterDoubleClick() {
        leftPct = 70
    }
</script>

<div
    bind:this={containerEl}
    class="flex h-full col-span-2"
    id="tab-content"
>
    {#if !infoPanelShown.value}
        <div
            id="scroll-container"
            class="flex-grow-1 h-[calc(100vh-155px)] w-full relative top-0 overflow-y-auto border-1 border-light-freon-200 dark:border-dark-freon-200"
        >
            <EditorPart />
        </div>
    {:else}
        <!-- Left pane (Editor) -->
        <div
            id="scroll-container-editor"
            class="h-[calc(100vh-155px)] relative top-0 overflow-y-auto border-1 border-light-freon-200 dark:border-dark-freon-200"
            style={`width: ${leftPct}%;`}
        >
            <EditorPart />
        </div>

        <!-- Gutter / divider -->
        <!-- svelte-ignore	a11y_no_noninteractive_element_interactions, a11y_no_noninteractive_tabindex	-->
        <div
            class="size-slider h-[calc(100vh-155px)] w-2 cursor-col-resize"
            class:dragging={dragging}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize panels"
            tabindex="0"
            onpointerdown={onGutterPointerDown}
            onpointermove={onGutterPointerMove}
            onpointerup={onGutterPointerUp}
            onpointercancel={onGutterPointerUp}
            ondblclick={onGutterDoubleClick}
            onkeydown={(ev) => {
        if (ev.key === "ArrowLeft") leftPct = clamp(leftPct - 2, minPct, maxPct);
        if (ev.key === "ArrowRight") leftPct = clamp(leftPct + 2, minPct, maxPct);
        if (ev.key === "Home") leftPct = minPct;
        if (ev.key === "End") leftPct = maxPct;
      }}
        ></div>

        <!-- Right pane (Info) -->
        <div
            id="scroll-container-info"
            class="flex-1 min-w-0 h-[calc(100vh-155px)] relative top-0 overflow-y-auto
         bg-light-base-50 dark:bg-dark-base-800 text-light-base-800 dark:text-dark-base-100 border
         border-light-base-200 dark:border-dark-base-700 divide-y divide-light-base-200 dark:divide-dark-base-700"
        >
            <InfoPanel />
        </div>
    {/if}
</div>
