<script lang="ts">
	import { messageInfo, userMessageOpen } from "$lib";
	import { Toast, ToastContainer, CloseButton } from "flowbite-svelte";
	import {
		InfoCircleSolid,
		ExclamationCircleSolid,
		QuestionCircleSolid,
		LightbulbSolid,
		CogSolid
	} from "flowbite-svelte-icons";
	import type { FreErrorSeverity } from "@freon4dsl/core"
	import { fly } from "svelte/transition";

	const close = () => {
		userMessageOpen.value = false;
	};

	function toastColor(): "red" | "green" | "yellow" | "blue" {
		switch (messageInfo.severity as FreErrorSeverity) {
			case "Error":
				return "red";

			case "Warning":
				return "yellow";
			case "TODO":
				// slightly debatable — yellow feels like “attention needed”
				return "yellow";

			case "Hint":
			case "Improvement":
			case "Info":
				return "blue";


			case "NONE":
			default:
				return "blue";
		}
	}

	function getIcon(severity: string) {
		switch (severity as FreErrorSeverity) {
			case "Error":
				return ExclamationCircleSolid;

			case "Warning":
				return ExclamationCircleSolid; // fallback (still clear)

			case "Hint":
				return QuestionCircleSolid;

			case "Improvement":
				return LightbulbSolid;

			case "TODO":
				return CogSolid;

			case "Info":
			case "NONE":
			default:
				return InfoCircleSolid;
		}
	}
</script>

{#if userMessageOpen.value}
	<ToastContainer position="top-right">
		<div in:fly={{ x: 48, duration: 280 }} out:fly={{ x: 48, duration: 280 }}>
			<Toast
				color={toastColor()}
				dismissable={false}
				class="bg-light-accent-100 dark:bg-dark-accent-800 border border-light-accent-300 dark:border-dark-accent-600"
			>
				{#snippet icon()}
					{@const Icon = getIcon(messageInfo.severity)}
					<Icon class="h-5 w-5" />
				{/snippet}

				<div class="flex w-full items-start gap-3">
					<div class="flex-1">
						<div class="font-semibold">{messageInfo.severity}</div>
						<div class="text-sm">{messageInfo.userMessage}</div>
					</div>

					<CloseButton onclick={close} class="text-light-accent-700 dark:text-dark-accent-200" />
				</div>
			</Toast>
		</div>
	</ToastContainer>
{/if}
