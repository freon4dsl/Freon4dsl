# Test Scenarios Models and ModelUnits

## Opening, closing, and creating new models and model units

These scenarios should be executed in order. The expectations depend upon execution of earlier scenarios.

### Scenario 1: start-up, rename, and save model unit
| Action                                           | Expected result                                                                                  |
|:-------------------------------------------------|:-------------------------------------------------------------------------------------------------|
| Start Freon                                      | Freon is opened, Create/Open model dialog is shown                                               |
| Type name of model _<NAME>_, and choose _Create_ | _currentModelName_ == _<NAME>_ && _currentUnitName_ == _myUnit_                                  |
| Open Model Info, rename model unit _myUnit_      | Dialog asking for Unit Name is opened                                                            |
| Type name of unit _<UNIT>_, and choose _Rename_  | _currentUnitName_ == _<UNIT>_, name on tab is _<UNIT>_                                           |
| Select Save Model Unit                           | Model _<NAME>_ is folder on server with file named _<UNIT>_ as content                           |
| Rename model unit within the editor to <UU2>     | _currentUnitName_ == _<UU2>_, name on tab is _<UU2>_                                             |
| Open Model Info, select Save Model Unit          | Model _<NAME>_ is folder on server with file named _<UU2>_ as content (file _<UNIT>_ is removed) |

### Scenario 1a: start-up, rename, and save model unit
| Action                                            | Expected result                                                                                |
|:--------------------------------------------------|:-----------------------------------------------------------------------------------------------|
| Start Freon                                       | Freon is opened, Create/Open model dialog is shown                                             |
| Choose existing model _<NAME>_, and choose _Open_ | _currentModelName_ == _<NAME>_ && _currentUnitName_ == _<XX>_                                  |
| Rename model unit within the editor to _<UU2>_    | _currentUnitName_ == _<UU2>_, name on tab is _<UU2>_                                           |
| Open Model Info, select Save Model Unit           | Model _<NAME>_ is folder on server with file named _<UU2>_ as content (file _<XX>_ is removed) |

### Scenario 2: new model, and new unit opened
| Action                                             | Expected result                                                                                                                       |
|:---------------------------------------------------|:--------------------------------------------------------------------------------------------------------------------------------------|
| Select `New Model` from model panel                | New model dialog is shown                                                                                                             |
| Type name an existing model name, and choose _New_ | The dialog is still present with an error message                                                                                     |
| Type name _<NAME>_, and choose _New_               | All info on previous model are removed, new Unit is shown in editor, _currentModelName_ == _<NAME>_ && _currentUnitName_ == _myUnit_, |


### Scenario 3: add unit to existing model from scenario 2
| Select `Open Model`
* **Dialog**: select name *Model1*
* **Expect**: *unit1* is visible in navigator
* **Expect**: currentModelName == *Model1* && * currentUnitName == *unit1*
| Select `New Model Unit`
| Type type name *unit2* in dialog, Enter key or OK Button
* **Expect**: model unit *unit2* is visible in navigator
* **Expect**: currentUnitName == *unit2*
| Select `Save Model Unit`
* **Expect**: Model1/unit2 is saved on server
------
### Scenario 4: new model, two new units, after scenario 3
| Select `New Model` and type name *Model2*
* **Expect**: <unnamed> unit is open in the editor
| Select `New Model Unit`
| Type name of model unit *unitA* in dialog
* **Expect**: *unitA* is visible in navigator
| Select `New Model Unit`
| Type name of model unit *unitB* in dialog
* **Expect**: unit named *unitB* is open in the editor
* **Expect**: *Model2/unitA* is saved on the server
* **Expect**: *Model1/unit1* and *Model1/unit2* still available on the server
* **Expect**: currentModelName == *Model2* && * currentUnitName == *unitB*
------
### Scenario 5: new model name already exists
| Select `New Model` 
* **Dialog**: asking new model name:  type name *Model1*
* **Error**: *Model1*  already exists
| Select `New Model` and type name *Model2*
* **Error**: *Model2* already exists 
* **Cancel**: dialog  
* **Expect**: *Model2/unitB* still visible in editor
* **Expect**: currentModelName == *Model2* && * currentUnitName == *unitB*
------
### Scenario 6
| Select `Open Model`
* **Dialog**: opens with model names *Model7*, *Model1* and *Model2*
  * **NB**: Should the currently open model (*Model2*) be shown in the above list?
| Select *Model7*
* **Expect**: editor to show *Model7* with modelunit *unit64*
* **Expect**: currentModelName == *Model7* && currentUnitName == *Unit64*
------
### Scenario 7
| Select `New Model` 
* **Dialog**: asking new model name:  type name *Model3*
| Type name of model unit *unit3A* in the editor
| Select `Save Model Unit`
| Select `Open Model`
* **Dialog**: with model names *Model7*, *Model1*, *Model2*, and *Model3*: select *Model1*
* **Expect**: *unit1* shown in editor
* **Expect**: currentModelName == *Model1* && currentUnitName == *Unit1*
| Select `Open Model`
* **Dialog**: with model names *Model7*, *Model1*, *Model2*, and *Model3*: select *Model3* 
* **Expect**: *unit3A* to be shown in editor
* **Expect**: currentModelName == *Model3* && currentUnitName == *unit3A*
| Select Delete Model Unit
* **Expect**: Dialog "Do you really want to delete current unit?"
| Select Yes
* **Expect**: *unit3A* to be removed from server and <unnamed> unit shown in editor

