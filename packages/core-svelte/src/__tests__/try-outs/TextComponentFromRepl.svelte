<script>
	import { afterUpdate } from "svelte";

	let text = '';
	let placeholder = "<...>";

	let isEditing = false;
	let editStart = false;
	let size = 10;
	let from = -1;
	let to = -1;
	let input;

	function startEditing() {
		isEditing = true;
		editStart = true;
		size = text.length == 0 ? 10 : text.length;
		let {
			anchorNode, anchorOffset, focusNode, focusOffset
		} = document.getSelection();
		from = anchorOffset;
		to = focusOffset;
	}

	function endEditing() {
		isEditing = false;
		from = -1;
		to = -1;
	}

	function getCaretPosition(event) {
		from = event.target.selectionStart;
		to = event.target.selectionEnd;
	}

	afterUpdate(() => {
		console.log("AFTERRRRRRR");
		if (editStart) {
			input.selectionStart = from;
			input.selectionEnd = to;
			input.focus();
			editStart = false;
		}
	});

	const onKeypress = (event) => {

		switch (event.key) {
			case "Enter": {
				console.log("Enter pressed")
				endEditing();
				event.preventDefault();
				event.stopPropagation();
				break;
			}
			case 'ArrowLeft': {
				getCaretPosition(event);
				console.log('Caret at: ', from)
				if (from !== 0) { // when the arrow key can stay within the text, do not let the parent handle it
					event.stopPropagation();
				} else { // the key will cause this element to lose focus, its content should be saved
					endEditing();
				}
				break;
			}
			case 'ArrowRight': {
				getCaretPosition(event);
				console.log('Caret at: ', from)
				if (from !== text.length) { // when the arrow key can stay within the text, do not let the parent handle it
					event.stopPropagation();
				} else { // the key will cause this element to lose focus, its content should be saved
					endEditing();
				}
				break;
			}
			case 'ArrowDown': {
				endEditing();
				break;
			}
		}
	}
</script>

<h1>
	A Text component
</h1>
<span>some text before the text component</span>
<span>
	{#if isEditing}
		<span className="resizable-input">
			<input id='inputId' className='resizable-input' bind:this={input} bind:value={text} on:blur={endEditing}
				   on:keydown={onKeypress} size={size} placeholder="{placeholder}"/>
		</span>
	{:else}
		<span on:click={startEditing}>
			{#if text.length > 0}
			{text}
			{:else}
			{placeholder}
	{/if}
	</span>
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
