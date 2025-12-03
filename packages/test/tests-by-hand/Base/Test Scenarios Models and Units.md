# Test Scenarios Models and ModelUnits

These scenarios test the functionality available through the webapp, like open model, delete unit.

Everywhere the meaning of 'Select (New Model)' is to select the button for this behaviour, even if it is titled differently, or is shown as an icon.

## Model Manipulations

### Scenario 1: start-up, new model
| Action                                                | Expected result                                                                          |
|:------------------------------------------------------|:-----------------------------------------------------------------------------------------|
| Start Freon                                           | Freon is opened, Create/Open model dialog is shown                                       |
| Type name an existing model name, and choose _Create_ | The dialog is still present with an error message                                        |
| Type name of model _<NAME>_, and choose _Create_      | Unit is shown in editor, _currentModelName_ == _<NAME>_ && _currentUnitName_ == _myUnit_ |

### Scenario 2: start-up, open model
| Action                                            | Expected result                                                                          |
|:--------------------------------------------------|:-----------------------------------------------------------------------------------------|
| Start Freon                                       | Freon is opened, Create/Open model dialog is shown                                       |
| Choose existing model _<NAME>_, and choose _Open_ | Unit is shown in editor, _currentModelName_ == _<NAME>_ && _currentUnitName_ == _myUnit_ |

### Scenario 3: new model
Pre: A model is present, and there are unsaved changes.

| Action                                             | Expected result                                                                                                                      |
|:---------------------------------------------------|:-------------------------------------------------------------------------------------------------------------------------------------|
| Select `(New Model)` from model panel              | New model dialog is shown                                                                                                            |
| Type name an existing model name, and choose _New_ | The editor shows a message: 'Please, select, create ...', and the previous model is saved.                                           |
| Type name _<NAME>_, and choose _New_               | All info on previous model are removed, new Unit is shown in editor, _currentModelName_ == _<NAME>_ && _currentUnitName_ == _myUnit_ |

### Scenario 4: open model
Pre: A model is present, and there are unsaved changes.

| Action                                            | Expected result                                                                                                                                                |
|:--------------------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Select `(Open Model)` from model panel            | New model dialog is shown                                                                                                                                      |
| Choose existing model _<NAME>_, and choose _Open_ | All info on previous model are removed, new Unit is shown in editor, _currentModelName_ == _<NAME>_ && _currentUnitName_ == _myUnit_, previous model is saved. |

### Scenario 5: rename existing model => not yet implemented
Pre: A model is present.

| Action                                             | Expected result                                                         |
|:---------------------------------------------------|:------------------------------------------------------------------------|
| Select `(Rename Model)` from model panel           | Rename model dialog is shown                                            |
| Type name an existing model name, and choose _New_ | The dialog is still present with an error message                       |
| Type name _<NAME>_, and choose _New_               | Model _<NAME>_ is shown in model panel, _currentModelName_ == _<NAME>_, |

### Scenario 6: delete model
Pre: A model is present.

| Action                                   | Expected result                                                              |
|:-----------------------------------------|:-----------------------------------------------------------------------------|
| Select `(Delete Model)` from model panel | Delete model dialog is shown                                                 |
| Choose _Delete_                          | Editor is reset, message is being shown, _currentModelName_ == _<no-model>_, |

### Scenario 7: export and import unit(s) in existing model
Pre: A model is present.

| Action                                                     | Expected result                                                                      |
|:-----------------------------------------------------------|:-------------------------------------------------------------------------------------|
| Select `(Export Unit)` from model panel                    | File dialog is shown                                                                 |
| Save file to TMP location                                  | File with _<UNIT_NAME>_ is created and can be read in text editor                    |
| Select `(Import Unit)` from model panel (!! In same model) | File dialog is shown                                                                 |
| Select file from TMP location, choose _Open_               | Error message should show, model unchanged                                           |
| Select `(New Model)` from model panel                      | New model dialog is shown                                                            |
| Type name _<NAME>_, and choose _New_                       | All info on previous model are removed, etc.                                         |
| Select `(Import Unit)` from model panel                    | File dialog is shown                                                                 |
| Select file from TMP location, choose _Open_               | Unit _<UNIT_NAME>_ is shown in single tab in the editor, unit is of right type, etc. |
| Select `(Import Unit)` from model panel                    | File dialog is shown                                                                 |
| Select incorrect file from TMP location, choose _Open_     | Error message '... cannot parse ...' is shown. Model is not altered.                 |

### Scenario 8: closing browser or browser tab
Pre: A model is present, and there are unsaved changes.

| Action                                             | Expected result                            |
|:---------------------------------------------------|:-------------------------------------------|
| Close browser tab                                  | Model is saved, and browser tab is closed. |


## Unit manipulations

### Scenario 1: add unit to existing model
Pre: A model is present.

| Action                                            | Expected result                                                                                       |
|:--------------------------------------------------|:------------------------------------------------------------------------------------------------------|
| Select `+ (New Unit)` from model panel            | New unit dialog is shown                                                                              |
| Type name an existing unit name, and choose _New_ | The dialog is still present with an error message                                                     |
| Type name _<NAME>_, and choose _New_              | Unit _<NAME>_ is shown in new tab in the editor, unit is of right type, _currentUnitName_ == _<NAME>_ |

### Scenario 2: rename unit from model panel and editor, and save model unit => not yet implemented
Pre: A model is present.

| Action                                          | Expected result                                                                                  |
|:------------------------------------------------|:-------------------------------------------------------------------------------------------------|
| Open Model Info, rename model unit _myUnit_     | Dialog asking for Unit Name is opened                                                            |
| Type name of unit _<UNIT>_, and choose _Rename_ | _currentUnitName_ == _<UNIT>_, name on tab is _<UNIT>_                                           |
| Select Save Model Unit                          | Model _<NAME>_ is folder on server with file named _<UNIT>_ as content                           |
| Rename model unit within the editor to <UU2>    | _currentUnitName_ == _<UU2>_, name on tab is _<UU2>_                                             |
| Open Model Info, select Save Model Unit         | Model _<NAME>_ is folder on server with file named _<UU2>_ as content (file _<UNIT>_ is removed) |

### Scenario 3: open model unit, export model unit, and delete model unit
Pre: A model is present.

| Action                                              | Expected result                                                                          |
|:----------------------------------------------------|:-----------------------------------------------------------------------------------------|
| Open Model Info, Select open model unit _<UU>_      | Unit _<NAME>_ is shown in new tab in the editor, _currentUnitName_ == _<NAME>_           |
| Open Model Info, Select Export Model Unit _<UU>_    | File dialog is shown, file is saved to chosen location                                   |
| Open Model Info, Select delete model unit in editor | Current tab is removed, editor is shown in left tab, iff present, otherwise in right tab |
