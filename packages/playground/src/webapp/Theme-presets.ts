const PI_DARKBLUE = "#00008b";
const PI_LIGHTBLUE = "#d3e3fd";

export const themePresets = [
    {
        name: "light",
        colors: {
            color: PI_DARKBLUE,                     /* Primary text color */
            inverse_color: PI_LIGHTBLUE,            /* Text color on non_normal background */
            bg_app_bar: PI_DARKBLUE,                /* Color of header and footer background */
            text_app_bar: "white",                  /* Color of header and footer text */
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
            bg_editor: "white", 			/* The background color of the editor */
            text_editor: "darkblue",		/* The color of the text, unless set otherwise by the projection */
            // TextBox
            bg_empty_before_text_box: "#f4f4f4",        /* Color of background of empty textbox */
            bg_text_box: "white",                       /* Color of background of non-empty textbox */
            color_text_box: PI_DARKBLUE,                /* Color of text in textbox */
            color_empty_before_text_box: PI_DARKBLUE,   /* Color of text in empty textbox */
            // AliasBox
            bg_empty_before_alias_box: "#f4f4f4",       /* Color of background of empty alias */
            bg_alias_box: "white",                      /* Color of background of non-empty aliasbox */
            color_alias_box: PI_DARKBLUE,               /* Color of text of aliasbox */
            /* Selection */
            bg_selected: "rgba(211, 227, 253, 255)",    /* Color of selected element */
            border_selected: PI_DARKBLUE,                /* Color of border of selected element */
            /* Dropdown Component */
            bg_dropdown_component: "#f4f4f4",
            border_dropdown_component: PI_DARKBLUE,
            color_dropdownitem_component: PI_DARKBLUE,
        },
        fonts: {
            size_editor: "14px",
            style_editor: "normal",
            weight_editor: "normal",
            family_editor: "Arial"
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
            bg_editor: "darkblue", 			/* The background color of the editor */
            text_editor: "white",		    /* The color of the text, unless set otherwise by the projection */
            // TextBox
            bg_empty_before_text_box: "rgba(1, 1, 150, 255)",
            bg_text_box: PI_DARKBLUE,
            color_empty_before_text_box: "white",
            color_text_box: "white",
            // AliasBox
            bg_empty_before_alias_box: "#f4f4f4",
            bg_alias_box: "white",
            color_alias_box: PI_DARKBLUE,
            // Selection
            bg_selected: "rgba(21, 21, 250, 255)",
            border_selected: PI_LIGHTBLUE,
            // Dropdown Component
            bg_dropdown_component: PI_DARKBLUE,
            border_dropdown_component: PI_LIGHTBLUE,
            color_dropdownitem_component: PI_LIGHTBLUE,
        },
        fonts: {
            size_editor: "14px",
            style_editor: "normal",
            weight_editor: "normal",
            family_editor: "monospace"
        }
    }
];
