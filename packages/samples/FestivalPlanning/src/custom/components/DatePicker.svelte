<script lang="ts">
    export type DateValue = {
        year: number
        month: number
        day: number
    }

    interface Props {
        value?: DateValue | null;
        label?: string;
        hint?: string;
        placeholder?: string; // note: native date inputs ignore placeholder in most browsers
        disabled?: boolean;
        required?: boolean;
        min?: string | undefined; // "YYYY-MM-DD"
        max?: string | undefined; // "YYYY-MM-DD"
        error?: string; // set from outside if you want
    }

    let {
        value = $bindable(null),
        label = "Date",
        hint = "",
        placeholder = "",
        disabled = false,
        required = false,
        min = undefined,
        max = undefined,
        error = ""
    }: Props = $props();

    let isoString = $state("")
    let id = `date-${Math.random().toString(36).slice(2)}`

    function toIso(date: DateValue | null): string {
        if (!date) return ""
        const y = String(date.year).padStart(4, "0")
        const m = String(date.month).padStart(2, "0")
        const d = String(date.day).padStart(2, "0")
        return `${y}-${m}-${d}`
    }

    function fromIso(iso: string): DateValue | null {
        if (!iso) return null
        const [y, m, d] = iso.split("-").map(Number)
        return { year: y, month: m, day: d }
    }

    $effect(() => {
        isoString = toIso(value)
    });

    function handleInput(e: Event) {
        const target = e.target as HTMLInputElement
        value = fromIso(target.value)
    }

    function clear() {
        if (disabled) return
        value = null
    }
</script>

<div class="date-field" data-has-error={error ? "true" : "false"} data-disabled={disabled ? "true" : "false"}>
    <div class="top">
        <label class="label" for={id}>
            {label}{#if required}<span class="req" aria-hidden="true"> *</span>{/if}
        </label>

        {#if isoString}
            <button class="clear" type="button" onclick={clear} disabled={disabled} aria-label="Clear date">
                ✕
            </button>
        {/if}
    </div>

    <div class="control">
        <input
            id={id}
            class="input"
            type="date"
            bind:value={isoString}
            oninput={handleInput}
            {disabled}
            {required}
            {min}
            {max}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={hint || error ? `${id}-help` : undefined}
            placeholder={placeholder}
        />
    </div>

    {#if hint || error}
        <div class="help" id={`${id}-help`}>
            {#if error}
                <div class="error">{error}</div>
            {:else}
                <div class="hint">{hint}</div>
            {/if}
        </div>
    {/if}
</div>

<style>
    /* Component-level tokens (override via parent if desired) */
    .date-field {
        --bg: #ffffff;
        --bg-muted: #f5f5f5;
        --border: #cccccc;
        --text: #333333;
        --text-muted: #666666;
        --danger: #b00020;

        --radius: 12px;
        --pad-y: 10px;
        --pad-x: 12px;

        display: grid;
        gap: 6px;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
        color: var(--text);
        max-width: 22rem;
    }

    .top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
    }

    .label {
        font-size: 0.9rem;
        font-weight: 650;
        letter-spacing: -0.01em;
    }

    .req {
        color: var(--text-muted);
        font-weight: 600;
    }

    .control {
        position: relative;
    }

    .input {
        width: 100%;
        box-sizing: border-box;

        border: 1px solid var(--border);
        border-radius: var(--radius);
        background: var(--bg);

        padding: var(--pad-y) var(--pad-x);
        font-size: 1rem;
        line-height: 1.2;

        color: var(--text);
        outline: none;

        transition: box-shadow 120ms ease, border-color 120ms ease, transform 120ms ease;
    }

    .input:focus {
        border-color: var(--text);
        box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.08);
    }

    .input:disabled {
        background: var(--bg-muted);
        color: var(--text-muted);
        cursor: not-allowed;
    }

    /* Error state */
    .date-field[data-has-error="true"] .input {
        border-color: var(--danger);
    }

    .date-field[data-has-error="true"] .input:focus {
        box-shadow: 0 0 0 4px rgba(176, 0, 32, 0.14);
    }

    .clear {
        border: 1px solid var(--border);
        background: var(--bg);
        color: var(--text-muted);
        border-radius: 999px;
        width: 28px;
        height: 28px;
        display: grid;
        place-items: center;
        cursor: pointer;
        line-height: 1;
        transition: transform 120ms ease, background 120ms ease;
    }

    .clear:hover {
        background: var(--bg-muted);
        transform: translateY(-1px);
    }

    .clear:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        transform: none;
    }

    .help {
        font-size: 0.85rem;
        line-height: 1.25;
    }

    .hint {
        color: var(--text-muted);
    }

    .error {
        color: var(--danger);
        font-weight: 600;
    }
</style>
