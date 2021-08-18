const PI_DARKBLUE = "#00008b";
const PI_LIGHTBLUE = "#d3e3fd";

export const themePresets = [
    {
        name: "light",
        colors: {
            color: PI_DARKBLUE,             /* Primary text color */
            inverse_color: PI_LIGHTBLUE,    /* Text color on non_normal background */
            bg_app_bar: PI_DARKBLUE,        /* Color of header and footer */
            bg_color: PI_LIGHTBLUE,         /* Color of background of side panes */
            divider: PI_DARKBLUE, 	        /* Dialog Title background color */
            primary: PI_DARKBLUE,           /* Dialog primary button text color */
            list_divider: PI_DARKBLUE,      /* Color of lines between columns in the error list */
            slider: PI_DARKBLUE,            /* Color of lines between views */
            accent: "#f50057",              /* Color to get attention to an element */
            secondary_button_text: "grey"   /* Color of non-primary buttons in dialogs */
        }
    },
    {
        name: "dark",
        colors: {
            color: PI_LIGHTBLUE,            /* Primary text color */
            inverse_color: PI_DARKBLUE,     /* Text color on non_normal background */
            bg_app_bar: PI_LIGHTBLUE,       /* Color of header and footer */
            bg_color: PI_DARKBLUE,          /* Color of background of side panes */
            divider: PI_LIGHTBLUE, 	        /* Dialog Title background color */
            primary: PI_LIGHTBLUE,          /* Dialog primary button text color */
            list_divider: PI_LIGHTBLUE,     /* Color of lines between columns in the error list */
            slider: PI_LIGHTBLUE,           /* Color of lines between views */
            accent: "#f50057",              /* Color to get attention to an element */
            secondary_button_text: "lightgrey"   /* Color of non-primary buttons in dialogs */
        }
    }
];
