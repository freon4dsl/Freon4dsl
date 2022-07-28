<script>
	let text = 'smallWORLDand';

	let isEditing = false;
	let size = 10;

	function toggle() {
		isEditing = !isEditing;
		size = text.length;
	}

	const onKeypress = (event) => {
		switch (event.key) {
			case "Enter": {
				console.log("Enter pressed")
				toggle();
				event.preventDefault();
				event.stopPropagation();
				break;
			}
		}
	}
</script>

<span>some text before the text component</span>
<span>
	{#if isEditing}
		<span class="resizable-input" on:blur={toggle} >
			<input class='resizable-input' bind:value={text} on:keydown={onKeypress} size={size}/>
		</span>
	{:else}
		<span on:click={toggle}>{text}</span>
	{/if}
</span>
<span>some text after the text component</span>
<br>
<span>Result: {text}</span>

<style>
	.resizable-input {
		/* make resizable */
		overflow-x: hidden;
		resize: horizontal;
		display: inline-block;

		/* no extra spaces */
		padding: 0;
		margin-bottom: -4px;
		white-space: nowrap;

		/* default widths */
		min-width: 2em;
		max-width: 30em;
	}

	/* let <input> assume the size of the wrapper */
	.resizable-input > input {
		width: 100%;
		box-sizing: border-box;
		margin: 0;
		border: none;
		background: lightgrey;
	}

	/* add a visible handle */
	.resizable-input::after {
		display: inline-block;
		vertical-align: bottom;
		margin-left: -16px;
		width: 16px;
		height: 16px;
		background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAJUlEQVR4AcXJRwEAIBAAIPuXxgiOW3xZYzi1Q3Nqh+bUDk1yD9sQaUG/4ehuEAAAAABJRU5ErkJggg==");
		cursor: ew-resize;
	}
</style>
