# Test Scenarios ModelUnits

## Scenarios: new models and model units

These scenarios should be executed in order. The expectations depend upon execution of earlier scenarios.

###Scenario 1: start-up and save unit
* Start ProjectIt
* **Expect**: editor opened with <unnamed> unit  
* **Type**: name of model unit *Unit64* in the editor
* **Select**: Save Model Unit
* **Expect**: Dialog asking for Model Name is opened
* **Type** name of model *Model7* and close dialog
* **Expect**: Model7/Unit64 is saved on server
* **Expect**: currentModelName == *Model7* && currentUnitName == *Unit64*
------
###Scenario 2: new model and new unit opened, then saved
* **Select** `New Model` 
* **Dialog**: type name *Model1*
* **Expect**: <unnamed> model unit is visible in navigator
* **Expect**: currentModelName == *Model1*
* **Select** `New Model Unit`
* **Dialog**: type name *unit1*  
* **Expect**: model unit *unit1* is visible in navigator
* **Expect**: currentUnitName == *unit1*
* **Select** `Save Model Unit`
* **Expect**: Model1/unit1 is saved on server
------
###Scenario 3: add unit to existing model from scenario 2
* **Select** `Open Model`
* **Dialog**: select name *Model1*
* **Expect**: *unit1* is visible in navigator
* **Expect**: currentModelName == *Model1* && * currentUnitName == *unit1*
* **Select** `New Model Unit`
* **Type**: type name *unit2* in dialog, Enter key or OK Button
* **Expect**: model unit *unit2* is visible in navigator
* **Expect**: currentUnitName == *unit2*
* **Select** `Save Model Unit`
* **Expect**: Model1/unit2 is saved on server
------
###Scenario 4: new model, two new units, after scenario 3
* **Select** `New Model` and type name *Model2*
* **Expect**: <unnamed> unit is open in the editor
* **Select** `New Model Unit`
* **Type** name of model unit *unitA* in dialog
* **Expect**: *unitA* is visible in navigator
* **Select** `New Model Unit`
* **Type** name of model unit *unitB* in dialog
* **Expect**: unit named *unitB* is open in the editor
* **Expect** *Model2/unitA* is saved on the server
* **Expect** *Model1/unit1* and *Model1/unit2* still available on the server
* **Expect**: currentModelName == *Model2* && * currentUnitName == *unitB*
------
###Scenario 5: new model name already exists
* **Select** `New Model` 
* **Dialog** asking new model name:  type name *Model1*
* **Error**: *Model1*  already exists
* **Select** `New Model` and type name *Model2*
* **Error**: *Model2* already exists 
* **Expect**: *Model2/unitB* still visible in editor
* **Expect**: currentModelName == *Model2* && * currentUnitName == *unitB*
------
###Scenario 6
* **Select** `Open Model`
* **Dialog** opens with model names *Model7*, *Model1* and *Model2*
  * **NB** Should the currently open model (*Model2*) be shown in the above list?
* **Select** *Model7*
* **Expect** editor to show *Model7* with modelunit *unit64*
* **Expect**: currentModelName == *Model7* && currentUnitName == *Unit64*
------
###Scenario 7
* **Select** `New Model` 
* **Dialog** asking new model name:  type name *Model3*
* **Type** name of model unit *unit3A* in the editor
* **Select** `Save Model Unit`
* **Select** `Open Model`
* **Dialog** with model names *Model7*, *Model1*, *Model2*, and *Model3*: select *Model1*
* **Expect**: *unit1* shown in editor
* **Expect**: currentModelName == *Model1* && currentUnitName == *Unit1*
* **Select** `Open Model`
* **Dialog** with model names *Model7*, *Model1*, *Model2*, and *Model3*: select *Model3* 
* **Expect**: *unit3A* to be shown in editor
* **Expect**: currentModelName == *Model3* && currentUnitName == *unit3A*
* **Select**: Delete Model Unit
* **Expect**: Dialog "Do you really want to delete current unit?"
* **Select**: Yes
* **Expect**: *unit3A* to be removed from server and <unnamed> unit shown in editor

