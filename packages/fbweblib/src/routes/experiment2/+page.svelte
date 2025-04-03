<script>
  import { writable } from "svelte/store";

  // Store to track active tab and the tabs list
  let activeTab = writable(1);
  let tabs = writable([
    { id: 1, label: "Tab 1", content: "Content for Tab 1" },
    { id: 2, label: "Tab 2", content: "Content for Tab 2" },
    { id: 3, label: "Tab 3", content: "Content for Tab 3" }
  ]);

  // Function to handle tab changes
  function changeTab(tabId) {
    activeTab.set(tabId);
  }

  // Function to close a tab
  function closeTab(tabId) {
    tabs.update((currentTabs) => {
      const remainingTabs = currentTabs.filter((tab) => tab.id !== tabId);
      // If the active tab is closed, switch to the first tab or the next one
      if (remainingTabs.length > 0) {
        activeTab.set(remainingTabs[0].id);
      }
      return remainingTabs;
    });
  }
</script>

<div class="w-full max-w-3xl mx-auto">
  <!-- Tabs Header -->
  <div class="flex space-x-1 border-b border-gray-300 dark:border-gray-700">
    {#each $tabs as tab}
      <div class="relative">
        <button
          class="tab-button"
          class:active={$activeTab === tab.id}
          on:click={() => changeTab(tab.id)}
        >
          {tab.label}
          <span
            class="ml-2 text-gray-400 hover:text-gray-600 cursor-pointer"
            on:click={(e) => {
              e.stopPropagation(); // Prevent tab change on close
              closeTab(tab.id);
            }}
          >
            ×
          </span>
        </button>
      </div>
    {/each}
  </div>

  <!-- Tab Content -->
  <div class="tab-content">
    {#each $tabs as tab}
      {#if $activeTab === tab.id}
        <div class="p-5">{tab.content}</div>
      {/if}
    {/each}
  </div>
</div>

<style>
  .tab-button {
    @apply px-4 py-2 text-sm font-medium transition duration-200 rounded-t-lg focus:outline-none bg-gray-100 text-gray-600 border border-transparent;
  }

  .tab-button.active {
    @apply bg-white text-gray-900 border border-gray-300 border-b-0;
  }

  .tab-content {
    @apply text-gray-700 dark:text-gray-300;
  }
</style>
