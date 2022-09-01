import { merge} from "lodash";

// The CHOSEN one.
const editorStyle = {
    global: {
        light: {
            label: {
                color: "black",
                "font-weight": "bold",
                backgroundColor: "red"
            },
            text: {
                color: "darkblue",
                "font-weight": "normal"
            },
            reference: {
                "background-color": "lightgray"
            }
        },
        dark: {
            // label: {
            //     backgroundColor: "red",
            //     color: "black",
            //     "font-weight": "bold"
            // },
            text: {
                color: "darkblue",
                "font-weight": "normal"
            },
            reference: {
                "background-color": "lightgray"
            }
        }
    },
    // For concept Attribute
    Attribute: {
        light: {
            label: {
                "font-weight": "normal",
                color: "orange"
            },
            reference: {}
        },
        dark: {
            // label: {
            //     "font-weight": "normal",
            //     color: "orange"
            // },
            reference: {}
        }
    }
}

// TODO How to deal with subtypes?
// TODO Is custom an add-on to the global style? ==> yes
// TODO IS the style being inherited by children?

const theme = "dark";

export function conceptStyle(concept: string, boxtype: string): Object {
    return merge({}, editorStyle?.global?.[theme]?.[boxtype], editorStyle?.[concept]?.[theme]?.[boxtype]);
}

console.log("Style: " + JSON.stringify(conceptStyle("Attribute", "label")));
