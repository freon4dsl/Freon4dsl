import {
    BoxFactory,
    type FreEnvironment,
    FreErrorSeverity,
    FreLanguage,
    FreLogger,
    type FreModelUnit,
    FreProjectionHandler,
    FreUndoManager,
    InMemoryModel,
    type IServerCommunication,
    isNullOrUndefined,
    type ModelUnitIdentifier
} from '@freon4dsl/core';
import {replaceProjectionsShown} from "$lib/stores/Projections.svelte.js";
import {langInfo} from "$lib/stores/LanguageInfo.svelte.js";
import {autorun, runInAction} from "mobx";
import {editorInfo, noUnitAvailable, progressIndicatorShown, type UnitInfo} from '$lib/stores/ModelInfo.svelte';
import {setUserMessage} from "$lib";


const LOGGER: FreLogger = new FreLogger('Webapp');

/**
 * Web configuration singleton.
 */
export class WebappConfigurator {
    private static instance: WebappConfigurator;

    static getInstance(): WebappConfigurator {
        if (
            WebappConfigurator.instance === null ||
            WebappConfigurator.instance === undefined
        ) {
            WebappConfigurator.instance = new WebappConfigurator();
        }
        return WebappConfigurator.instance;
    }

    serverEnv: IServerCommunication | undefined;
    langEnv: FreEnvironment | undefined;
    private modelStore: InMemoryModel | undefined;

    /**
     * Sets the object that will perform the communication with the server, and
     * the language environment, so the webapp knows all information of the language.
     * @param editorEnvironment
     * @param serverCommunication
     */
    setEnvironment(
        editorEnvironment: FreEnvironment,
        serverCommunication: IServerCommunication,
    ): void {
        // LOGGER.log('setEnvironment')
        this.langEnv = editorEnvironment;
        this.serverEnv = serverCommunication;
        WebappConfigurator.initialize(editorEnvironment);
        this.modelStore = new InMemoryModel(editorEnvironment, serverCommunication);
    }

    /**
     * Fills the Webapp Stores with initial values that describe the language,
     * and make sure that the editor is able to get user messages to the webapp.
     */
    static initialize(editorEnvironment: FreEnvironment): void {
        let langEnv: FreEnvironment = editorEnvironment;
        // the language name
        langInfo.name = langEnv.languageName;

        // the names of the unit types
        langInfo.unitTypes = FreLanguage.getInstance().getUnitNames();

        // the names of the projections / views
        const proj: FreProjectionHandler = langEnv.editor.projection;
        let nameList: string[] = !!proj ? proj.projectionNames() : ["default"];
        // remove any old values
        langInfo.projectionNames.splice(0, langInfo.projectionNames.length);
        // push the right ones
        langInfo.projectionNames.push(...nameList);
        replaceProjectionsShown(nameList);

        // the file extensions for all unit types
        // because 'langEnv.fileExtensions.values()' is not an Array but an IterableIterator,
        // we transfer the value to a tmp array.
        const tmp: string[] = [];
        for (const val of langEnv.fileExtensions.values()) {
            tmp.push(val);
        }
        langInfo.fileExtensions = tmp;

        // let the editor know how to set the user message,
        // we do this by assigning our own method to the editor's method
        // langEnv.editor.setUserMessage = setUserMessage;

        // start the undo manager
        FreUndoManager.getInstance();
    }

    /**
     * Reads the model with name 'modelName' from the server and makes this the current model.
     * The first unit in the model is shown, if present.
     * @param modelName
     */
    async openModel(modelName: string) {
        if (!!this.modelStore) {
            // create new model instance in memory and set its name
            await this.modelStore.openModel(modelName);
            const unitIdentifiers: ModelUnitIdentifier[] = this.modelStore.getUnitIdentifiers();
            console.log('unit identifiers: ' + JSON.stringify(unitIdentifiers));
            if (!!unitIdentifiers && unitIdentifiers.length > 0) {
                // load the first unit and show it
                let first: boolean = true;
                for (const unitIdentifier of unitIdentifiers) {
                    if (first) {
                        const unit = this.modelStore.getUnitByName(unitIdentifier.name);
                        console.log("UnitId " + unitIdentifier.name + " unit is " + unit?.name);
                        editorInfo.currentUnit = {id: unit.freId(), name: unit.name, type: unit.freLanguageConcept()};
                        BoxFactory.clearCaches()
                        this.langEnv?.projectionHandler.clear()
                        this.showUnit(unit);
                        first = false;
                    }
                }
            }
            this.updateUnitList()
        }
    }

    async getAllModelNames(): Promise<string[]> {
        if (!!this.serverEnv) {
            return this.serverEnv?.loadModelList();
        } else {
            return [];
        }
    }

    updateUnitListRunning: boolean = false;

    updateUnitList(): void {
        // Ensure this is done only once
        if (!this.updateUnitListRunning) {
            this.updateUnitListRunning = true
            // autorun(() => {
                if (this.modelStore) {
                    // editorInfo.unitIds = this.modelStore.getUnitIdentifiers();
                    const tmp: UnitInfo[] = [];
                    this.modelStore.getUnitIdentifiers().forEach(uid => {
                        const unit: FreModelUnit | undefined = this.modelStore?.getUnitByName(uid.name);
                        if (unit) {
                            tmp.push({name: uid.name, id: uid.id, type: unit.freLanguageConcept()})
                        }
                    });
                    editorInfo.unitIds = tmp;
                }
            // });
        }
    }

    /**
     * This function takes care of actually showing the new unit in the editor.
     * @param newUnit
     * @private
     */
    private showUnit(newUnit: FreModelUnit) {
        LOGGER.log("showUnit called, unitName: " + newUnit?.name);
        if (!!newUnit) {
            runInAction(() => {
                if (!!this.langEnv) {
                    console.log("setting rootElement to " + newUnit.name)
                    this.langEnv.editor.rootElement = newUnit;
                    noUnitAvailable.value = false;
                    editorInfo.currentUnit = {id: newUnit.freId(), name: newUnit.name, type: newUnit.freLanguageConcept()};
                }
            });
        } else {
            noUnitAvailable.value = true;
        }
        progressIndicatorShown.value = false;
    }

    /**
     * Creates a new model
     * @param modelName
     */
    async newModel(modelName: string) {
        LOGGER.log("new model called: " + modelName);
        progressIndicatorShown.value = true;
        // create a new model
        if (!!this.modelStore) {
            await this.modelStore.createModel(modelName);
            await this.modelStore.createUnit("myUnit", langInfo.unitTypes[0]);
            this.showUnit(this.modelStore.getUnitByName("myUnit"))
            progressIndicatorShown.value = false;
        }
    }

    /**
     * Adds a new unit to the current model and shows it in the editor
     * @param newName
     * @param unitType
     */
    async newUnit(newName: string, unitType: string) {
        LOGGER.log("EditorState.newUnit: unitType: " + unitType + ", name: " + newName + " in model " + editorInfo.modelName);
        progressIndicatorShown.value = true;
        // save the old current unit, if there is one
        await this.saveCurrentUnit();
        await this.createNewUnit(newName, unitType);
    }

    /**
     * Pushes the current unit to the server
     */
    async saveCurrentUnit() {
        LOGGER.log("saveCurrentUnit: " + editorInfo.currentUnit?.name + `real name is ${(this.langEnv!.editor.rootElement as FreModelUnit)?.name}`);
        const unit: FreModelUnit = this.langEnv!.editor.rootElement as FreModelUnit;
        if (!!unit) {
            if (!!editorInfo.modelName && editorInfo.modelName.length) {
                if (!!unit.name && unit.name.length > 0) {
                    if (!isNullOrUndefined(editorInfo.currentUnit)) {
                        if (editorInfo.currentUnit.id === unit.freId() && editorInfo.currentUnit.name !== unit.name) {
                            // Saved unit already exists but its name has changed.
                            LOGGER.log(`Saving unit that changed name, do a rename from ${editorInfo.currentUnit.name} to ${unit.name}`)
                            // await this.renameModelUnit(unit, editorInfo.currentUnit.name, unit.name)
                        } else {
                            await this.modelStore?.saveUnit(unit);
                        }
                    }
                    // just in case the user has changed the name in the editor
                    editorInfo.currentUnit = {name: unit.name, id: unit.freId(), type: unit.freLanguageConcept()};
                } else {
                    setUserMessage(`Unit without name cannot be saved. Please, name it and try again.`);
                }
            } else {
                LOGGER.log("Internal error: cannot save unit because current model is unknown.");
            }
        } else {
            LOGGER.log("No current model unit");
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
        LOGGER.log("private createNewUnit called, unitType: " + unitType + " name: " + newName);
        const newUnit: FreModelUnit | undefined = await this.modelStore?.createUnit(newName, unitType);
        if (!!newUnit) {
            // show the new unit in the editor
            this.showUnit(newUnit);
        } else {
            setUserMessage(`Model unit of type '${unitType}' could not be created.`);
        }
    }

    /**
     * Reads the unit called 'newUnitName' from the server and shows it in the editor
     * @param newUnitName
     */
    async openModelUnit(newUnitName: string) {
        LOGGER.log("openModelUnit called, unitName: " + newUnitName);
        if (!!editorInfo.currentUnit && newUnitName === editorInfo.currentUnit.name) {
            // the unit to open is the same as the unit in the editor, so we are doing nothing
            LOGGER.log("openModelUnit doing NOTHING");
        } else {
            let newUnit: FreModelUnit | undefined = undefined;
            autorun(() => {
                if (this.modelStore) {
                    newUnit = this.modelStore.getUnitByName(newUnitName)
                }
            });
            if (!isNullOrUndefined(newUnit)) {
                // save the old current unit, if there is one
                await this.saveCurrentUnit();
                this.showUnit(newUnit);
            } else {
                setUserMessage('Cannot create new unit.', FreErrorSeverity.Error);
            }
        }
    }
}
