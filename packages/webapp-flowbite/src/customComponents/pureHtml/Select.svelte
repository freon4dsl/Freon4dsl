<script lang="ts">
    let selected1 = "nl";
    let countries = [
        { value: "nl", label: "Netherlands" },
        { value: "de", label: "Germany" },
        { value: "fr", label: "France" }
    ];
    let selected2: string[] = [];
    let languages = ["TypeScript", "JavaScript", "Python", "Rust"];
</script>

<label for="country">Country:</label>

<select id="country" bind:value={selected1}>
    {#each countries as country}
        <option value={country.value}>
            {country.label}
        </option>
    {/each}
</select>

<p>Selected: {selected1}</p>

<select multiple size="4" bind:value={selected2}>
    {#each languages as lang}
        <option value={lang}>{lang}</option>
    {/each}
</select>

<p>Selected: {selected2.join(", ")}</p>
