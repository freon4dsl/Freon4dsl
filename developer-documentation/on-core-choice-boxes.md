# AbstractChoiceBox, SelectBox, ActionBox, and ReferenceBox

All of these boxes deal with choices/selections that the user can make.
The method `getOptions(editor: FreEditor)` gives all possible choices.
The method `getSelectedOption: (): SelectOption` gives the currently selected choice.

For instance, for a boolean value the user may choose between 'YES' and 'NO'. Both
'YES' and 'NO' are in the set of possible choices. Once the user has selected, for 
example, 'YES', the 'selected option' is 'YES'.

`AbstractChoiceBox` is the abstract parent from which the other three boxes inherit.

## Creation via BoxUtil

When a box of the above types is normally created using the BoxUtil class, for instance
by `BoxUtil.booleanBox(...)`. Here a method for determining the possible values
is passed to the box. For instance, in the `booleanBox` method labels are provided, 
which are used to set the list of possible values. 

Likewise, often the setting of the value is performed by a method that is passed to the 
box in the BoxUtil method. In the `limitedBox` method a
`setFunc: (selected: string) => void` is passed which is called to set the value of the
limited instance.

## SelectBox

Used for simpler choices: 
* boolean values 
  * possible values: true, false, or the strings 
  that represent them as defined in the .edit file, 
* references to a limited value 
  * possible values: all instances of the limited concept,
* operators in binary expressions
  * possible values: all triggers of binary expressions.

[//]: # (TODO: FreExpressionUtil.ts lines 129 till 131)

## ReferenceBox

Used for all references except for instances of limited concepts. Possible values:
everything that the scoper tells us is in scope, given the requested type of the 
node. For instance, when the .ast file demands a reference to conceptX, the scoper is 
asked for all visible nodes of type 'conceptX'.

## ActionBox

Used whenever the selection of an option needs to be followed by some action. For instance,
when selecting the placeholder in a list an instance of a list element needs to be created.
The same holds for the placeholder for an optional node. Selecting this placeholder triggers 
the creation of the optional node.

## SelectOption

SelectOption is the interface to which adhere the possible values of every of these classes.
