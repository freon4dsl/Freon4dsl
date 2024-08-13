# External Components - what and how

## Types/kinds/forms of external components
These are the different forms in which an external component can be present in a Freon projection.

### Simple additions
Simple additions may appear anywhere in the projection. Simple additions have no link to the model (the FreNode tree). 
However, because they are present in the projection of a certain node, they are coupled to this node.
- Syntax: `[external = AnimatedGif ]`
  - Note that there may be no space between `[` and `external`.
- Generated BoxType: `ExternalSimpleBox`.
- Interface:
  - No specific interface.

### Simple wrappers
Simple wrappers may appear anywhere in a projection. Simple wrappers wrap a single projection. This is the `childBox`. 
Note that the childBox itself may be a vertical or horizontal layout containing many other elements. 
- Syntax: 
    - To position the wrapper within the projection:
    `[external=SMUI_Card]` 
    - To define the wrapped content the following must be included within the '{}' brackets of the projection 
  definition. It must be beneath the projection (the bit between '[]' brackets).
````
    external SMUI_Card [
        My First Card wrapping a property: ${self.isUnderConstruction}
        Great, isn't it!
    ]
````        
- Generated BoxType: `ExternalFragmentBox`.
- Interface:
  - `getChildBox(): Box`
    - Use this method and the `RenderComponent` to show the childBox in the external component.

#### Multiple simple wrappers of the same external component type in one projection
When two or more external components of the same type are to be used within one projection, they can be distinguished 
by a postfix. The postfix can be any identifier. There may not be a space between the component name and the ':', 
or between ':' and the postfix.
- Syntax: 
  - To position the wrapper within the projection:
    `[external=SMUI_Card:First] ... [external=SMUI_Card:Second]`
  - To define the wrapped content the same postfix should be used.
````
    external SMUI_Card:First [
        My First Card wrapping a property: ${self.isUnderConstruction}
    ]
    external SMUI_Card:Second [
        My Second Card is wrapping another property: ${self.isExpensive}
    ]
````   

### Property Projections: Wrapping or Replacing
A property projection may be wrapped in an external component, or the external component can replace the native 
projection. In the latter case it is up to the language engineer to get and set the value correctly, and to 
get tabbing etc. working.

### Wrapping property projections
- Syntax: `${self.name wrap=SMUI_Card}`
- Generated BoxType: `ExternalFragmentBox`
- Interface:
  - `getChildBox(): Box` 
    - Returns the projection for the property. Use this method and the `RenderComponent` to 
    show the property projection in the external component. Note that when a list is wrapped, this method returns
    a single Box that holds the native projection for the complete list, i.e. a horizontal list, vertical list, or 
    table projection.
- Example:

### Replacing property projections of Primitive type
- Syntax: `${self.name replace=SMUI_Dialog}`
- BoxType: `ExternalStringBox`, `ExternalNumberBox`, or `ExternalBooleanBox`
- Interface:
    - `getPropertyValue(): string` 
      - Type is `string` in case of an ExternalStringBox, `number` or `boolean` for the other box types.
    - `setPropertyValue(newValue: string)` 
      - Type is `string` in case of an ExternalStringBox, `number` or `boolean` for the other box types.

### Replacing property projections of List type
- Syntax: `${self.parts replace=SMUI_Accordion}`
- Generated BoxType: `ExternalListBox`
- Interface:
    - `getChildren(): Box[]`
        - Returns a list of boxes that hold the projection for every item in the list.
- Example:

### Replacing property projections of Part type
- Syntax: `${self.part replace=SMUI_Dialog}`
- BoxType: `ExternalPartBox`
- Interface:
    - `getPropertyValue(): FreNode`
        - You need to cast the returned value to the required type.
    - `setPropertyValue(newValue: FreNode)`
        
### Replacing property projections of Reference type
- Syntax: `${self.reference replace=SMUI_Dialog}`
- BoxType: `ExternalReferenceBox`
- Interface:
    - `getPropertyValue(): FreNodeReference`
        - You need to cast the returned value to the required type.
    - `setPropertyValue(newValue: FreNodeReference)`

## Wiring
1. Create your Svelte components in the webapp package. Be sure to which type of box your component will be 
linked. Use the box interface to get and set any model values.
2. Let the generator know which external projections there are. This done in the 'global' part of the default editor.

    Example: 
```
    global {
        external {
            AnimatedGif,
            SMUI_Card,
            SMUI_Accordion,
            SMUI_Dialog,
            DatePicker
        }
    }
```
3. Let the RenderComponent know which external projections there are. This is done using the setCustomComponents() method
from the '@freon4dsl/core-svelte' package. This method should be called before starting the actual application.

    Note that the names should be equal to the names used in step 2.

    Example: 
```
setCustomComponents([
   {component: ShowAnimatedGif, knownAs: "AnimatedGif"},
   {component: SMUI_Card_Component, knownAs: "SMUI_Card"},
   {component: SMUI_Accordion, knownAs: "SMUI_Accordion"},
   {component: SMUI_Dialog, knownAs: "SMUI_Dialog"},
   {component: DatePicker, knownAs: "DatePicker"}
]);
```
## Parameters to the external components
You can set parameters to an external component in the .edit file. These are simple key-value pairs, both key 
and value are strings. There can be a list of parameters. 

In the interface of all box types explained above the method `findParam(key: string): string` is included. This 
method can be used to find the value of the parameter that was included in the .edit file.

## Nesting
External projections may be nested.
Example: 
````
external SMUI_Card [
    This Card is showing animated gif number 1.
        [external=AnimatedGif number="1"]
    ]
````
