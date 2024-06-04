<script lang="ts">
    import LabelComponent from "$lib/components/LabelComponent.svelte";
    import {BoxUtil} from "@freon4dsl/core";
    import {ModelInstantiator} from "./showcase/showcase-model/ModelInstantiator";
    const model = new ModelInstantiator().createModel();
    console.log("model name: " + model.name);
    const box = BoxUtil.labelBox(model, model.name, "bracket-open", true);
</script>

<h1>Welcome to Freon Svelte Library</h1>
<p>Here you can preview/showcase the components available in this library.</p>
<p>The library was build using SvelteKit. Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<h2>Our components</h2>
<div> A LabelComponent showing the name of a model: <LabelComponent box = {box}/></div>

