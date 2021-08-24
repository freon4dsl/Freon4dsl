const PI_DARKBLUE = "#00008b";
const PI_LIGHTBLUE = "#d3e3fd";

export const themePresets = [
    {
        name: "light",
        colors: {
            color: PI_DARKBLUE,                     /* Primary text color */
            inverse_color: PI_LIGHTBLUE,            /* Text color on non_normal background */
            bg_app_bar: PI_DARKBLUE,                /* Color of header and footer background */
            bg_color: PI_LIGHTBLUE,                 /* Color of background of side panes */
            divider: PI_DARKBLUE, 	                /* Color of dialog title background */
            list_divider: PI_DARKBLUE,              /* Color of lines between columns in the error list */
            slider: PI_DARKBLUE,                    /* Color of lines between views */
            accent: "#f50057",                      /* Color to get attention to an element */
            primary_button_text: "black",           /* Color of primary buttons in dialogs */
            secondary_button_text: "grey",          /* Color of non-primary buttons in dialogs */
            // TODO find some appealing default values for the user message colors
            user_mess_bg_error: "#ff4d4d",          /* Color of user message background when showing an error */
            user_mess_bg_warning: '#ffff80',        /* Color of user message background when showing a warning */
            user_mess_bg_hint: '#d9d9d9',           /* Color of user message background when showing a hint */
            user_mess_bg_info: '#d9d9d9',           /* Color of user message background when showing information */
            user_mess_text_error: 'black',          /* Color of user message text when showing an error */
            user_mess_text_warning: '#ff0',         /* Color of user message text when showing a warning */
            user_mess_text_hint: '#ff0',            /* Color of user message text when showing a hint */
            user_mess_text_info: '#f50057',         /* Color of user message text when showing information */
            user_mess_button_text_error: 'black',   /* Color of user message button text when showing an error */
            user_mess_button_text_warning: '#ff0',  /* Color of user message button text when showing a warning */
            user_mess_button_text_hint: '#ff0',     /* Color of user message button text when showing a hint */
            user_mess_button_text_info: '#f50057',  /* Color of user message button text when showing information */
        }
    },
    {
        name: "dark",
        colors: {
            color: PI_LIGHTBLUE,                    /* Primary text color */
            inverse_color: PI_DARKBLUE,             /* Text color on non_normal background */
            bg_app_bar: PI_LIGHTBLUE,               /* Color of header and footer background */
            bg_color: PI_DARKBLUE,                  /* Color of background of side panes */
            divider: PI_LIGHTBLUE, 	                /* Color of dialog title background */
            list_divider: PI_LIGHTBLUE,             /* Color of lines between columns in the error list */
            slider: PI_LIGHTBLUE,                   /* Color of lines between views */
            accent: "#f50057",                      /* Color to get attention to an element */
            primary_button_text: "yellow",          /* Color of primary buttons in dialogs */
            secondary_button_text: "white",         /* Color of non-primary buttons in dialogs */
            // TODO find some appealing default values for the user message colors
            user_mess_bg_error: "#ff4d4d",          /* Color of user message background when showing an error */
            user_mess_bg_warning: '#ffff80',        /* Color of user message background when showing a warning */
            user_mess_bg_hint: '#d9d9d9',           /* Color of user message background when showing a hint */
            user_mess_bg_info: '#d9d9d9',           /* Color of user message background when showing information */
            user_mess_text_error: 'black',          /* Color of user message text when showing an error */
            user_mess_text_warning: '#ff0',         /* Color of user message text when showing a warning */
            user_mess_text_hint: '#ff0',            /* Color of user message text when showing a hint */
            user_mess_text_info: '#f50057',         /* Color of user message text when showing information */
            user_mess_button_text_error: 'black',   /* Color of user message button text when showing an error */
            user_mess_button_text_warning: '#ff0',  /* Color of user message button text when showing a warning */
            user_mess_button_text_hint: '#ff0',     /* Color of user message button text when showing a hint */
            user_mess_button_text_info: '#f50057',  /* Color of user message button text when showing information */
        }
    }
];
