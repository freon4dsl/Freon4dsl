import {
    BoxFactory,
    type FreEnvironment, FreError,
    FreErrorSeverity,
    FreLanguage,
    FreLogger, type FreModel,
    type FreModelUnit, type FreNode,
    FreProjectionHandler,
    FreUndoManager,
    InMemoryModel,
    type IServerCommunication,
    isNullOrUndefined,
    type FreUnitIdentifier, AST, notNullOrUndefined
} from "@freon4dsl/core"
import { replaceProjectionsShown } from "$lib/stores/Projections.svelte.js"
import { langInfo } from "$lib/stores/LanguageInfo.svelte.js"
import { autorun, runInAction } from "mobx"
import {
    editorInfo,
    indexForTab,
    noUnitAvailable,
    progressIndicatorShown, resetEditorInfo
} from '$lib/stores/ModelInfo.svelte';
import { setUserMessage } from "$lib"
import { modelErrors } from "$lib/stores/InfoPanelStore.svelte"


const LOGGER: FreLogger = new FreLogger("Webapp")

/**
 * Web configuration singleton.
 */
export class WebappConfigurator {
    private static instance: WebappConfigurator

    static getInstance(): WebappConfigurator {
        if (
            WebappConfigurator.instance === null ||
            WebappConfigurator.instance === undefined
        ) {
            WebappConfigurator.instance = new WebappConfigurator()
        }
        return WebappConfigurator.instance
    }

    serverEnv: IServerCommunication | undefined
    langEnv: FreEnvironment | undefined
    private modelStore: InMemoryModel | undefined

    /**
     * Sets the object that will perform the communication with the server, and
     * the language environment, so the webapp knows all information of the language.
     * @param editorEnvironment
     * @param serverCommunication
     */
    setEnvironment(
        editorEnvironment: FreEnvironment,
        serverCommunication: IServerCommunication
    ): void {
        // LOGGER.log('setEnvironment')
        this.langEnv = editorEnvironment
        this.serverEnv = serverCommunication
        WebappConfigurator.initialize(editorEnvironment)
        this.modelStore = new InMemoryModel(editorEnvironment, serverCommunication)
        this.modelStore.addCurrentModelListener(this.modelChanged);
        this.langEnv.editor.setUserMessage = setUserMessage;
    }

    /**
     * Fills the Webapp Stores with initial values that describe the language,
     * and make sure that the editor is able to get user messages to the webapp.
     */
    static initialize(editorEnvironment: FreEnvironment): void {
        let langEnv: FreEnvironment = editorEnvironment
        // the language name
        langInfo.name = langEnv.languageName

        // the names of the unit types
        langInfo.unitTypes = FreLanguage.getInstance().getUnitNames()

        // the names of the projections / views
        const proj: FreProjectionHandler = langEnv.editor.projection
        const nameList: string[] = notNullOrUndefined(proj) ? proj.projectionNames() : ["default"]
        // remove any old values
        langInfo.projectionNames.splice(0, langInfo.projectionNames.length)
        // push the right ones
        langInfo.projectionNames.push(...nameList)
        replaceProjectionsShown(nameList)

        // the file extensions for all unit types
        // because 'langEnv.fileExtensions.values()' is not an Array but an IterableIterator,
        // we transfer the value to a tmp array.
        const tmp: string[] = []
        for (const val of langEnv.fileExtensions.values()) {
            tmp.push(val)
        }
        langInfo.fileExtensions = tmp

        // let the editor know how to set the user message,
        // we do this by assigning our own method to the editor's method
        // langEnv.editor.setUserMessage = setUserMessage;

        // start the undo manager
        FreUndoManager.getInstance()
    }

    /**
     * Reads the model with name 'modelName' from the server and makes this the current model.
     * The first unit in the model is shown, if present.
     * @param modelName
     */
    async openModel(modelName: string) {
        if (notNullOrUndefined(this.modelStore)) {
            // const oldEditorInfo = editorInfo;
            // todo restore oldEditorInfo when anything goes wrong
            resetEditorInfo();
            // create new model instance in memory and set its name
            await this.modelStore.openModel(modelName)
            const unitIdentifiers: FreUnitIdentifier[] = this.modelStore.getUnitIdentifiers()
            // console.log("unit identifiers: " + JSON.stringify(unitIdentifiers))
            if (notNullOrUndefined(unitIdentifiers) && unitIdentifiers.length > 0) {
                // load the first unit and show it
                let first: boolean = true
                for (const unitIdentifier of unitIdentifiers) {
                    const unit: FreModelUnit = this.modelStore.getUnitByName(unitIdentifier.name)
                    if (first) {
                        // console.log("UnitId " + unitIdentifier.name + " unit is " + unit?.name)
                        BoxFactory.clearCaches()
                        this.langEnv?.projectionHandler.clear()
                        this.showUnit(unit, unitIdentifier);
                        first = false
                    }
                }
            }
        } else {
            console.error("No modelStore!")
        }
    }

    async getAllModelNames(): Promise<string[]> {
        if (notNullOrUndefined(this.serverEnv)) {
            return await this.serverEnv?.loadModelList()
        } else {
            return []
        }
    }

    async getUnitNames(): Promise<string[]> {
        const result: string[] = []
        this.modelStore?.getUnitIdentifiers().forEach(uid => {
            result.push(uid.name)
        })
        return result
    }

    /**
     * This function takes care of actually showing the new unit in the editor.
     * @param toBeShown
     * @param unitId
     * @private
     */
    private showUnit(toBeShown: FreModelUnit, unitId: FreUnitIdentifier) {
        // console.log("showUnit called, unitName: " + toBeShown?.name)
        if (notNullOrUndefined(toBeShown)) {
            runInAction(() => {
                if (notNullOrUndefined(this.langEnv)) {
                    // console.log("setting rootElement to " + newUnit.name)
                    noUnitAvailable.value = false
                    // set the unit in the editor
                    this.langEnv.editor.rootElement = toBeShown
                    // select the right tab
                    const tabIndex: number = indexForTab(unitId);
                    if (tabIndex > -1) { // an existing tab
                        editorInfo.currentOpenTab = tabIndex;
                        // console.log("opening tab: ", tabIndex, " for unit ", unitId.name)
                    } else { // a new tab
                        editorInfo.unitsInTabs.push(unitId);
                        editorInfo.currentOpenTab = editorInfo.unitsInTabs.length - 1;
                        // console.log("opening tab: ", editorInfo.unitsInTabs.length - 1, " for unit ", unitId.name)
                    }
                    // remember the current unit
                    editorInfo.currentUnit = unitId;
                    // alert the undo manager that the current unit has changed
                    FreUndoManager.getInstance().currentUnit = toBeShown;
                }
            })
        } else {
            noUnitAvailable.value = true
        }
        progressIndicatorShown.value = false
    }

    /**
     * Creates a new model
     * @param modelName
     */
    async newModel(modelName: string) {
        LOGGER.log("new model called: " + modelName)
        progressIndicatorShown.value = true
        // create a new model
        if (notNullOrUndefined(this.modelStore)) {
            resetEditorInfo();
            await this.modelStore.createModel(modelName)
            runInAction(() => {
                this.setEditorToUndefined()
            })
            noUnitAvailable.value = true
            modelErrors.list = []
            progressIndicatorShown.value = false;
        } else {
            console.error("new model: No modelStore!");
        }
    }

    async deleteModel() {
        // console.log("deleting current model")
        resetEditorInfo()
        await this.modelStore?.deleteModel()
        runInAction(() => {
            if (notNullOrUndefined(this.langEnv)) {
                // console.log("setting rootElement to undefined")
                this.setEditorToUndefined()
            }
        })
    }

    private setEditorToUndefined() {
        // todo change rootElement setter to accept null
        // @ts-expect-error TS2322
        this.langEnv.editor.rootElement = undefined
        BoxFactory.clearCaches()
        this.langEnv?.projectionHandler.clear()
        noUnitAvailable.value = true
    }

    // eslint-disable-next-line no-unused-vars
    renameModel(newName: string) {
        // todo implement renaming in the server
        // console.log(newName)
    }

    /**
     * Adds a new unit to the current model and shows it in the editor
     * @param newName
     * @param unitType
     */
    async newUnit(newName: string, unitType: string) {
        LOGGER.log("EditorState.newUnit: unitType: " + unitType + ", name: " + newName + " in model " + editorInfo.modelName)
        progressIndicatorShown.value = true
        // save the old current unit, if there is one
        await this.saveUnit(editorInfo.currentUnit)
        await this.createNewUnit(newName, unitType)
    }

    /**
     * Pushes the current unit to the server
     */
    async saveUnit(unitId: FreUnitIdentifier | undefined) {
        if (!unitId) return

        const unit: FreModelUnit | undefined = this.modelStore?.getUnitByName(unitId.name)
        LOGGER.log("saveUnit: " + editorInfo.currentUnit?.name + `real name is ${(this.langEnv!.editor.rootElement as FreModelUnit)?.name}`)
        if (notNullOrUndefined(unit)) {
            if (notNullOrUndefined(editorInfo.modelName) && editorInfo.modelName.length > 0) {
                if (notNullOrUndefined(unit.name) && unit.name.length > 0) {
                    if (notNullOrUndefined(editorInfo.currentUnit)) {
                        if (editorInfo.currentUnit.id === unit.freId() && editorInfo.currentUnit.name !== unit.name) {
                            // Saved unit already exists but its name has changed.
                            LOGGER.log(`Saving unit that changed name, do a rename from ${editorInfo.currentUnit.name} to ${unit.name}`)
                            // await this.renameModelUnit(unit, editorInfo.currentUnit.name, unit.name)
                        } else {
                            await this.modelStore?.saveUnit(unit)
                        }
                    }
                    // just in case the user has changed the name in the editor
                    editorInfo.currentUnit = { name: unit.name, id: unit.freId(), type: unit.freLanguageConcept() }
                } else {
                    setUserMessage(`Unit without name cannot be saved. Please, name it and try again.`)
                }
            } else {
                LOGGER.log("Internal error: cannot save unit because current model is unknown.")
            }
        } else {
            LOGGER.log("No current model unit")
        }
    }

    /**
     * Because of the asynchronicity the true work of creating a new unit is done by this function
     * which is called at various points in the code.
     * @param newName
     * @param unitType
     * @private
     */
    private async createNewUnit(newName: string, unitType: string) {
        LOGGER.log("private createNewUnit called, unitType: " + unitType + " name: " + newName)
        const newUnit: FreModelUnit | undefined = await this.modelStore?.createUnit(newName, unitType)
        if (notNullOrUndefined(newUnit)) {
            // await this.updateUnitList()
            // show the new unit in the editor
            this.showUnit(newUnit, { id:newUnit.freId(), name:newUnit.name, type:newUnit.freLanguageConcept()})
        } else {
            setUserMessage(`Model unit of type '${unitType}' could not be created.`)
        }
    }

    /**
     * Reads the unit called 'newUnitName' from the server and shows it in the editor
     * @param unitId
     */
    async openModelUnit(unitId: FreUnitIdentifier) {
        LOGGER.log("openModelUnit called, unitName: " + unitId)
        if (notNullOrUndefined(editorInfo.currentUnit) && unitId.name === editorInfo.currentUnit.name && unitId.id === editorInfo.currentUnit.id) {
            // the unit to open is the same as the unit in the editor, so we are doing nothing
            LOGGER.log("openModelUnit doing NOTHING")
        } else {
            let toBeOpened: FreModelUnit | undefined = undefined
            autorun(() => {
                if (this.modelStore) {
                    toBeOpened = this.modelStore.getUnitById(unitId)
                }
            })
            if (notNullOrUndefined(toBeOpened)) {
                // save the old current unit, if there is one
                await this.saveUnit(editorInfo.currentUnit)
                // ... and show the new one
                this.showUnit(toBeOpened, unitId)
            } else {
                setUserMessage("Cannot open unit " + unitId, FreErrorSeverity.Error)
            }
        }
    }

    /**
     * Deletes the unit 'unitId', from the server and from the current in-memory model
     * @param unitId
     */
    async deleteModelUnit(unitId: FreUnitIdentifier | undefined) {
        if (notNullOrUndefined(unitId)) {
            // console.log("delete called for unit: " + unitId.name)
            // get rid of the unit on the server
            await this.modelStore?.deleteUnitById(unitId)
            // get rid of the name in the navigator => done through callback

            // get rid of any tab for this unit
            const tabIndex = indexForTab(unitId);
            if (tabIndex > -1) { // there is a tab for this unit
                if (editorInfo.unitsInTabs.length === 1) { // this tab is the only one
                    // the unit is shown in the editor, so get rid of that one, as well
                    if (notNullOrUndefined(editorInfo.currentUnit) && editorInfo.currentUnit.id === unitId.id) {
                        // console.log("removing currently shown unit")
                        runInAction(() => {
                            this.setEditorToUndefined()
                        })
                        noUnitAvailable.value = true
                        modelErrors.list = []
                    }
                } else { // other tabs left
                    this.switchToOtherTab(tabIndex);
                    if (notNullOrUndefined(editorInfo.currentUnit)) {
                        const newUnit = this.modelStore?.getUnitById(editorInfo.currentUnit);
                        if (this.langEnv?.editor && newUnit) {
                            this.langEnv.editor.rootElement = newUnit;
                        }
                    }
                }
            }

        }
    }

    private switchToOtherTab(tabIndex: number) {
        if (tabIndex > 0) { // switch to the tab on the left
            editorInfo.currentUnit = editorInfo.unitsInTabs[tabIndex - 1];
            editorInfo.currentOpenTab = tabIndex - 1;
        } else { // switch to the tab on the right
            editorInfo.currentUnit = editorInfo.unitsInTabs[tabIndex + 1];
            editorInfo.currentOpenTab = tabIndex + 1;
        }
        editorInfo.unitsInTabs.splice(tabIndex, 1);
    }

    /**
     * Method is called when an editor tab is closed. It handles switching to another tab,
     * if available. If not available, it sets the editor to undefined, and 'noUnitAvailable' to true,
     * thus causing a user message on the screen.
     *
     * @param unitId
     */
    async closeModelUnit(unitId: FreUnitIdentifier) {
        const tabIndex = indexForTab(unitId);
        this.switchToOtherTab(tabIndex);
        if (editorInfo.unitsInTabs.length === 0) {
            runInAction(() => {
                this.setEditorToUndefined()
            })
            noUnitAvailable.value = true
            modelErrors.list = []
            editorInfo.currentUnit = undefined
        }
    }

    /**
     * Parses the string 'content' to create a model unit. If the parsing is ok,
     * then the unit is added to the current model.
     * @param fileName
     * @param content
     * @param metaType
     * @param showIt
     */
    async unitFromFile(fileName: string, content: string, metaType: string, showIt: boolean) {
        // save the old current unit, if there is one
        await this.saveUnit(editorInfo.currentUnit)
        let unit: FreModelUnit | null = null
        try {
            // the following also adds the new unit to the model
            if (notNullOrUndefined(editorInfo.modelName) && editorInfo.modelName.length > 0) {
                const model: FreModel | undefined = this.modelStore?.model
                if (notNullOrUndefined(model)) {
                    unit = this.langEnv!.reader.readFromString(content, metaType, model, fileName) as FreModelUnit
                }
            }
            if (notNullOrUndefined(unit)) {
                // if the element does not yet have a name, try to use the file name
                if (isNullOrUndefined(unit.name) || unit.name.length === 0) {
                    AST.changeNamed('unitfromFile', () => {
                        if(unit) {
                            unit.name = this.makeUnitName(fileName);
                        }
                    })
                }
                if (showIt) {
                    // set elem in editor
                    this.showUnit(unit, { id:unit.freId(), name:unit.name, type:unit.freLanguageConcept()})
                }
            }
        } catch (e: unknown) {
            if (e instanceof Error) {
                setUserMessage(e.message, FreErrorSeverity.Error)
            }
        }
    }

    private makeUnitName(fileName: string): string {
        const nameExist: boolean = notNullOrUndefined(editorInfo.unitIds
            .find((existing: FreUnitIdentifier) => existing.name === fileName))
        if (nameExist) {
            setUserMessage(`Unit named '${fileName}' already exists, adding number.`, FreErrorSeverity.Error)
            // find the existing names that start with the file name
            const unitsWithSimilarName: FreModelUnit[] | undefined = this.modelStore?.getUnits()
                .filter((existing: FreModelUnit) => existing.name.startsWith(fileName))
            if (notNullOrUndefined(unitsWithSimilarName) && unitsWithSimilarName.length > 1) {
                // there are already numbered units
                // find the biggest number that is in use after the filename, e.g. Home12, Home3 => 12
                let biggestNr: number = 1
                // find the characters in each of the existing names that come after the file name
                const trailingParts: string[] = unitsWithSimilarName.map((existing: FreModelUnit) =>
                    existing.name.slice(fileName.length)
                )
                trailingParts.forEach((trailing) => {
                    const nextNumber: number = Number.parseInt(trailing, 10)
                    if (!isNaN(nextNumber) && nextNumber >= biggestNr) {
                        biggestNr = nextNumber + 1
                    }
                })
                return fileName + biggestNr
            } else {
                return fileName + "1"
            }
        } else {
            return fileName
        }
    }

    /**
     * Returns a unit for exporting. The editor is not changed!
     * @param unitId
     */
    getUnit(unitId: FreUnitIdentifier): FreModelUnit | undefined {
        return this.modelStore?.getUnitById(unitId)
    }

    // async renameModelUnit(unit: FreModelUnit, oldName: string, newName: string) {
    //     LOGGER.log(`renameModelUnit: from ${oldName} to ${newName} isId: ${isIdentifier(newName)} Units before: ` + editorInfo.unitIds.map((u: FreUnitIdentifier) => u.name))
    //     unit.name = newName
    //     // TODO Use model store
    //     if (!isNullOrUndefined(editorInfo.modelName) && !isNullOrUndefined(editorInfo.currentUnit)) {
    //         this.serverEnv!.renameModelUnit(editorInfo.currentUnit.name, oldName, newName, unit)
    //         // todo store the info in editorInfo
    //         // this.modelChanged(this.modelStore)
    //         setUserMessage(`Saved ${newName}`)
    //         LOGGER.log("renameModelUnit: Units after: " + editorInfo.unitIds.map((u: FreUnitIdentifier) => u.name))
    //     } else {
    //         setUserMessage(`No current unit to be saved`)
    //     }
    // }

    /**
     * Runs the validator for the current unit
     */
    getErrors() {
        // console.log("WebappConfigurator.getErrors() for " + editorInfo.currentUnit?.name)
        if (notNullOrUndefined(editorInfo.currentUnit)) {
            const toBeChecked: FreModelUnit | undefined = this.modelStore?.getUnitById(editorInfo.currentUnit)
            if (toBeChecked) {
                try {
                    if (notNullOrUndefined(this.langEnv)) {
                        const list: FreError[] = this.langEnv.validator.validate(toBeChecked);
                        this.langEnv.editor.setErrors(list);
                        modelErrors.list = list;
                    }
                } catch (e: unknown) {
                    // catch any errors regarding erroneously stored model units
                    if (e instanceof Error) {
                        // console.log(e.message + e.stack)
                        modelErrors.list = [
                            new FreError(
                                "Problem validating model unit: '" + e.message + "'",
                                toBeChecked,
                                editorInfo.currentUnit.name,
                                FreErrorSeverity.Error
                            )
                        ]
                    }
                }
            }
        }
    }
    /**
     * When an error in the error list is selected, or a search result is selected, the editor jumps to the faulty element.
     * @param item
     * @param propertyName
     */
    selectElement(item: FreNode, propertyName?: string) {
        LOGGER.log("Item selected");
        this.langEnv!.editor.selectElement(item, propertyName);
    }

    /************************************************************
     * Listeners to model state
     ***********************************************************/

    modelChanged(store: InMemoryModel): void {
        LOGGER.log(`modelChanged: ${store?.model?.name}`);
        if (notNullOrUndefined(store?.model)) {
            editorInfo.modelName = store?.model?.name;
            editorInfo.unitIds = store.getUnitIdentifiers();
        }
    };
}
