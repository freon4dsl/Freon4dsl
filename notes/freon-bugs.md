# Bugs

## External property replacer cannot input anything

In the external tester project the replacers for properties do not react upon any key stroke. So you cannot type anything.


## Using InMemoryModel (25 jan 2025)

- Creating a unit uses the unit's id, but the Freon native server uses the unit's name to store it. If the name is not present,
then nothing is saved.

## In core: FreEditor (25 jan 2025)

- Setting the rootElement in the editor needs a mobx action. This is currently done in the webapp-lib, 
but it should be done in core. Likewise for 'forceRecalculateProjection'

