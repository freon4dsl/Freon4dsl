# Styling the editor

The editor can be styled at various levels:

## Default Styles
Each type of box has default styling incorporated.
This style uses the global theme variables defined in the global.css file.

## Styles per Box Type
Specific styles for each box type (LabelBox, TextBox, SelectBox, etc.) can be defined using the PiEditorStyle object. 
An empty object of this type is generated, which can be filled in by the language engineer.  
This is done using the `global` property as follows:

```javascript
const editorStyle: PiEditorStyle = {
    global: {
        light: {
            Label: {
                color: "black",
                background: "white",
            }
        },
        dark: {
          Label: {
            color: "white",
            background: "black",
          }
        }
    }
}
```
The above defines the color and background of all label boxes in the editor, thus overriding the default values.

Using the same approach the style for each type of box can be defined per concept. 
If my language includes the concepts `Entity`, the following style specifies that all labels belonging
to `Entity` are `blue` on `white` or `white` on `blue`.

```javascript
const editorStyle: PiEditorStyle = {
    Entity: {
        light: {
            Label: {
                color: "blue",
                background: "white"
            }
        },
        dark: {
          Label: {
            color: "white",
            background: "blue",
          }
        }
    }
}
```

Global and concept specific box styles can be combined.
If the `global` and the `Entity` stykles above are combined, then all labels will be black,
except for the label belonging to `Entity`. 

## Style per Box

TypeScript code level: style parameter.
