<script lang="ts">
    let sections: HTMLDetailsElement[] = []

    function handleToggle(event: Event) {
        const current = event.currentTarget as HTMLDetailsElement

        if (current.open) {
            sections.forEach((section) => {
                if (section && section !== current) {
                    section.open = false
                }
            })
        }
    }
</script>

<details bind:this={sections[0]} ontoggle={handleToggle}>
    <summary>Section 1</summary>
    <p>Content 1</p>
</details>

<details bind:this={sections[1]} ontoggle={handleToggle}>
    <summary>Section 2</summary>
    <p>Content 2</p>
</details>

<details bind:this={sections[2]} ontoggle={handleToggle}>
    <summary>Section 3</summary>
    <p>Content 3</p>
</details>

<style>
    details {
        border: 1px solid #ccc;
        border-radius: 6px;
        padding: 0.5rem;
        margin-bottom: 0.5rem;
    }
    details[open] summary span {
        transform: rotate(90deg);
        display: inline-block;
    }

    summary {
        cursor: pointer;
        font-weight: bold;
    }

    details[open] {
        background-color: #666666;
    }
    p {
        background-color: #2B2B2B;
        padding: 0.7rem;
    }
</style>
