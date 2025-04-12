// The @apply directive of Tailwind does not function correctly in Svelte, therefore we use this alternative.
export const radioLabelClass = 'text-sm rtl:text-right font-medium flex items-center p-2 ' +
	'text-light-base-900 						dark:text-dark-base-50'
export const radioInputClass = 'w-4 h-4 focus:ring-2 me-2 ' +
	'border-light-base-300 					dark:border-dark-base-500 ' +
	'bg-light-base-100 							dark:bg-dark-base-600  ' +
	'text-light-base-600 						dark:text-dark-base-200 ' +
	'ring-offset-dark-base-800 			dark:ring-offset-dark-base-800 ' +
	'focus:ring-light-base-500 			dark:focus:ring-dark-base-250';
export const cancelButtonClass = 'text-center font-medium focus-within:ring-4 focus-within:outline-none inline-flex items-center ' +
	'justify-center px-5 py-2.5 text-sm rounded-lg ' +
	'text-light-base-900 									dark:text-dark-base-400 ' +
	'bg-light-base-50 										dark:bg-transparent ' +
	'border border-light-base-200 				dark:border-dark-base-600 ' +
	'hover:bg-light-base-200 							dark:hover:bg-dark-base-600 ' +
	'hover:text-light-base-700 						dark:hover:text-dark-base-900 ' +
	'focus-within:text-light-base-700 		dark:focus-within:text-dark-base-50 ' +
	'dark:hover:border-dark-base-600 ' +
	'focus-within:ring-dark-base-200 ' +
	'dark:focus-within:ring-dark-base-700 '
export const okButtonClass = 'text-center font-medium focus-within:ring-4 focus-within:outline-none inline-flex items-center ' +
	'justify-center px-5 py-2.5 text-sm rounded-lg ' +
	'text-light-base-100 									dark:text-dark-base-800 ' +
	'bg-light-base-600 										dark:bg-dark-base-200 ' +
	'border border-light-base-200 				dark:border-dark-base-600 ' +
	'hover:bg-light-base-900 							dark:hover:bg-dark-base-50 ' +
	'hover:text-light-base-150 						dark:hover:text-dark-base-700 ' +
	'focus-within:text-light-base-700 		dark:focus-within:text-dark-base-50 ' +
	'dark:hover:border-dark-base-600 ' +
	'focus-within:ring-dark-base-200 ' +
	'dark:focus-within:ring-dark-base-700 '
export const textInputClass = 'w-full h-10 pl-3 pr-32 text-base placeholder-dark-base-600 border rounded-lg focus:shadow-outline bg-light-base-50 ' +
	'dark:bg-dark-base-50'
export const tooltipClass: string = 'text-light-base-900 dark:text-dark-base-50 bg-light-accent-200 dark:bg-dark-accent-200 ';
