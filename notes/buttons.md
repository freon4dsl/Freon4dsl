### Adding buttons to the Freon editor

1. Add a button by adding the following line in one of the .edit files. (See Samples/DocuProject/defs/editor-specials.edit, line 7.)
``` 
 [button text="Don't push me!" boxRole="MyButton-role"]
````
The **text** is the text that will be shown on the button. The **boxRole** is the manner in which the button is coupled to an action.
2. Create a custom action. (See Samples/DocuProject/editor/CustomInsuranceModelActions.ts, line 30.) In this action you need to specify the
exact same **boxRole** as the one that has been supplied with the button in the .edit file. (See line 31.)
3. Implement the action to be taken in this custom action. You can use '**box.element**' to get the node in the ast associated with the button.
In this example that will be an instance of **BaseProduct**.

This works the same in the table definition. (See Samples/DocuProject/defs/editor-tables.edit, line 9.)

You can add an icon before or after the text using css. For an example see _freon_theme-light.scss, from line 30.
The text for the Button is optional.

#### Notes
1. We are working on exposing the in-built actions in the editor core.

