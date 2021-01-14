# Test Scenarios ModelUnits

## Scenarios: new models and model units

* Start ProjectIt
* **Select** `New Model` 
* **Dialog**: type name *Model1*
* **Expect**: Model1 is visible in navigator
* **Expect**: New ModelUnit is open in the editor
* **Type** name of model unit *unit1* in the editor
* **Expect**: *unit1* is visible in navigator
* **Select** `Save`

------

* **Select** `New Model` and type name *Model2*
* **Expect**: Model2 is visible in navigator
* **Expect**: New model unit is open in the editor
* **Select** `New Model Unit`
* **Dialog** asking to save current unit first: select `Yes`
* **Error**: Unit must have a name
* **Type** name of model unit *unitA* in the editor
* **Expect**: *unitA* is visible in navigator
* **Select** `New Model Unit`
* **Dialog**: asking to save current unit first: select `Yes`
* **Expect**: New model unit is visible in the editor
* **Type** name of model unit *unitB* in the editor.
* **Expect** unitA and unitB are visible in the navigator

------

* **Select** `New Model` 
* **Dialog** ask to save current unit first? select `Yes`
* **Dialog** asking new model name:  type name *Model1*
* **Error**: *Model1*  already exists
* **Select** `New Model` and type name *Model2*
* **Error**: *Model2* already exists 

------

* **Select** `Open Model`

* **Dialog** with model names *Model1*  and *Model2* : select *Model1* 
  * **NB** Should the currently open model (*Model2*) be shown in the above list?

* **Expect** navigator to show *Model1* with modelunit *unit1*

* **Expect**  Editor to be empty

* **Select** *unit1* in the navigator

* **Expect** *unit1* the editor to show *unit1*
