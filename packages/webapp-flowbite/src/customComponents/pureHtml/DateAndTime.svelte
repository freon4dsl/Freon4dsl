<script lang="ts">
    let date = "";
    let time = "";
    let datetimeLocal = "";
    let month = "";
    let week = "";
    let step: number = 300; // counted in seconds, does not work in Chrome

    $: summary = {
        date,
        time,
        datetimeLocal,
        month,
        week
    };
</script>

<div class="container">
    <h2>Date & Time Inputs</h2>

    <div class="field">
        <label for="date">Date:</label>
        <input id="date" type="date" bind:value={date} />
    </div>

    <div class="field">
        <label for="time">Time:</label>
        <input id="time" type="time" bind:value={time} step={step}/>
    </div>

    <div class="field">
        <label for="datetime">Date & Time:</label>
        <input id="datetime" type="datetime-local" bind:value={datetimeLocal} />
    </div>

    <div class="field">
        <label for="month">Month:</label>
        <input id="month" type="month" bind:value={month} />
    </div>

    <div class="field">
        <label for="week">Week:</label>
        <input id="week" type="week" bind:value={week} />
    </div>

    <div class="output">
        <h3>Current Values</h3>
        <pre>{JSON.stringify(summary, null, 2)}</pre>
    </div>
</div>

<style>
    .container {
        max-width: 400px;
        padding: 1rem;
        font-family: system-ui, sans-serif;
    }

    .field {
        display: flex;
        flex-direction: column;
        margin-bottom: 1rem;
    }

    label {
        font-weight: 600;
        margin-bottom: 0.25rem;
    }

    input {
        padding: 0.4rem;
        border: 1px solid #ccc;
        border-radius: 4px;
    }

    .output {
        margin-top: 1.5rem;
        padding: 0.75rem;
        background: #f5f5f5;
        border-radius: 6px;
        font-size: 0.9rem;
    }
</style>
