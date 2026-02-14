<script lang="ts">
    let value = "";
    let options = ["Person", "Address", "Order", "Invoice"];
</script>

<label for="nodeType">Node Type:</label>

<input
    id="nodeType"
    list="nodeTypes"
    bind:value
/>

<datalist id="nodeTypes">
    {#each options as option}
        <option value={option}></option>
    {/each}
</datalist>

<p>Selected: {value}</p>
