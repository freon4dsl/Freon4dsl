// todo when the clear button above the picker si shown, the whole goes down a bit. we have to avoid that.

<script lang="ts">

  export type Date = { year: number; month: number; day: number };
  export type Time = { hour: number; minute: number };
  export type DateTime = { date: Date; time: Time };

  interface Props {
    start?: DateTime | undefined;
    end?: DateTime | undefined;
    label?: string;
    hint?: string;
    disabled?: boolean;
    required?: boolean;
    // enforce ordering
    enforceEndAfterStart?: boolean;
	initEndIfMissing?: boolean;
	initEndOffsetMinutes?: number;
  }

  let {
    start = $bindable(undefined),
    end = $bindable(undefined),
    label = "Availability",
    hint = "",
    disabled = false,
    required = false,
    enforceEndAfterStart = true,
	initEndIfMissing = true,
	initEndOffsetMinutes = 60,
  }: Props = $props();

  let startIso = $derived(toIso(start));
  let endIso = $derived(toIso(end));

  let id = `dtr-${Math.random().toString(36).slice(2)}`;

  function pad2(n: number) {
    return String(n).padStart(2, "0");
  }

  function toIso(dt: DateTime | undefined): string {
    if (!dt) return "";
    const y = String(dt.date.year).padStart(4, "0");
    const m = pad2(dt.date.month);
    const d = pad2(dt.date.day);
    const hh = pad2(dt.time.hour);
    const mm = pad2(dt.time.minute);
    return `${y}-${m}-${d}T${hh}:${mm}`;
  }

  function fromIso(iso: string): DateTime | undefined {
    if (!iso) return undefined;
    const [datePart, timePart] = iso.split("T");
    if (!datePart || !timePart) return undefined;

    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);
    if ([year, month, day, hour, minute].some((x) => Number.isNaN(x))) return undefined;

    return {
      date: { year, month, day },
      time: { hour, minute }
    };
  }

  // ISO-like datetime-local strings sort correctly lexicographically if zero-padded
  function isBefore(aIso: string, bIso: string) {
    // treat empty as "unknown"
    if (!aIso || !bIso) return false;
    return aIso < bIso;
  }


function handleStartInput(e: Event) {
  const target = e.target as HTMLInputElement;
  const newStartIso = target.value;

  const newStart = fromIso(newStartIso);
  start = newStart;

  // initialize end only if missing
  if (initEndIfMissing && newStart && !end) {
    end = addMinutes(newStart, initEndOffsetMinutes);
  }

  // existing: keep invariant end >= start
  if (enforceEndAfterStart && start && end && isBefore(endIso, newStartIso)) {
    end = start;
  }
}

  function handleEndInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const newEndIso = target.value;

    const candidateEnd = fromIso(newEndIso);

    if (enforceEndAfterStart && start && candidateEnd && isBefore(newEndIso, startIso)) {
      // reject/snap: end cannot be before start
      end = start;
    } else {
      end = candidateEnd;
    }
  }

  function clearStart() {
    if (disabled) return;
    start = undefined;
  }

  function clearEnd() {
    if (disabled) return;
    end = undefined;
  }

  function addMinutes(dt: DateTime, minutesToAdd: number): DateTime {
    const { year, month, day } = dt.date;
    const { hour, minute } = dt.time;

    // Use local Date as a calculator (month is 0-based)
    const d = new Date(year, month - 1, day, hour, minute, 0, 0);
    d.setMinutes(d.getMinutes() + minutesToAdd);

    return {
      date: {
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        day: d.getDate()
      },
      time: {
        hour: d.getHours(),
        minute: d.getMinutes()
      }
    };
  }
</script>

<div class="range" data-disabled={disabled ? "true" : "false"}>
  <div class="top">
    <div class="title">
      <div class="label">
        {label}{#if required}<span class="req" aria-hidden="true"> *</span>{/if}
      </div>
      {#if hint}<div class="hint">{hint}</div>{/if}
    </div>
  </div>

  <div class="grid">
    <div class="field">
      <div class="fieldTop">
        <label class="subLabel" for={`${id}-start`}>Start</label>
        {#if startIso}
          <button class="clear" type="button" onclick={clearStart} disabled={disabled} aria-label="Clear start">
            ✕
          </button>
        {/if}
      </div>

      <input
        id={`${id}-start`}
        class="input"
        type="datetime-local"
        bind:value={startIso}
        oninput={handleStartInput}
        {disabled}
        {required}
      />
    </div>

    <div class="field">
      <div class="fieldTop">
        <label class="subLabel" for={`${id}-end`}>End</label>
        {#if endIso}
          <button class="clear" type="button" onclick={clearEnd} disabled={disabled} aria-label="Clear end">
            ✕
          </button>
        {/if}
      </div>

      <input
        id={`${id}-end`}
        class="input"
        type="datetime-local"
        bind:value={endIso}
        oninput={handleEndInput}
        {disabled}
        {required}
      />
    </div>
  </div>
</div>

<style>
  .range {
    --bg: #ffffff;
    --bg-muted: #f5f5f5;
    --border: #cccccc;
    --text: #333333;
    --text-muted: #666666;

    --radius: 12px;
    --pad-y: 10px;
    --pad-x: 12px;

    display: grid;
    gap: 10px;
    max-width: 44rem;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    color: var(--text);
  }

  .top .label {
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  .req {
    color: var(--text-muted);
    font-weight: 600;
  }

  .hint {
    margin-top: 2px;
    font-size: 0.9rem;
    color: var(--text-muted);
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  @media (max-width: 560px) {
    .grid { grid-template-columns: 1fr; }
  }

  .field { display: grid; gap: 6px; }

  .fieldTop {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .subLabel { font-size: 0.9rem; font-weight: 650; }

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
    transition: box-shadow 120ms ease, border-color 120ms ease;
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
  }

  .clear:hover { background: var(--bg-muted); }
  .clear:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
