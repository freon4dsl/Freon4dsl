import {
    BoxFactory,
    type FreEnvironment,
    FreLanguage, FreLogger, type FreModelUnit,
    FreProjectionHandler,
    FreUndoManager,
    InMemoryModel,
    type IServerCommunication, isNullOrUndefined, type ModelUnitIdentifier
} from '@freon4dsl/core';
import {replaceProjectionsShown} from "$lib/stores/Projections.svelte.js";
import {langInfo} from "$lib/stores/LanguageInfo.svelte.js";
import {autorun, runInAction} from "mobx";
import {editorInfo, modelInfo, noUnitAvailable, progressIndicatorShown} from '$lib/stores/ModelInfo.svelte';


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

    serverCommunication: IServerCommunication | undefined;
    editorEnvironment: FreEnvironment | undefined;
    private modelStore: InMemoryModel | undefined;
    currentUnit: FreModelUnit | undefined;

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
        this.editorEnvironment = editorEnvironment;
        this.serverCommunication = serverCommunication;
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
            LOGGER.log('unit identifiers: ' + JSON.stringify(unitIdentifiers));
            if (!!unitIdentifiers && unitIdentifiers.length > 0) {
                // load the first unit and show it
                let first: boolean = true;
                for (const unitIdentifier of unitIdentifiers) {
                    if (first) {
                        const unit = this.modelStore.getUnitByName(unitIdentifier.name);
                        LOGGER.log("UnitId " + unitIdentifier.name + " unit is " + unit?.name);
                        this.currentUnit = unit;
                        BoxFactory.clearCaches()
                        this.editorEnvironment?.projectionHandler.clear()
                        this.showUnit(this.currentUnit);
                        first = false;
                    }
                }
            }
            this.updateUnitList()
        }
    }

    async getAllModelNames(): Promise<string[]> {
        if (!!this.serverCommunication) {
            return this.serverCommunication?.loadModelList();
        } else {
            return [];
        }
    }

    updateUnitListRunning: boolean = false;

    updateUnitList(): void {
        // Ensure this is done only once
        if (!this.updateUnitListRunning) {
            this.updateUnitListRunning = true
            autorun(() => {
                if (this.modelStore) {
                    modelInfo.units = this.modelStore.getUnits();
                }
            });
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
                if (!!this.editorEnvironment) {
                    console.log("setting rootElement to " + newUnit.name)
                    this.editorEnvironment.editor.rootElement = newUnit;
                    this.currentUnit = newUnit;
                    editorInfo.currentUnit = newUnit;
                }
            });
            if (!isNullOrUndefined(this.currentUnit)) {
                noUnitAvailable.value = false;
            }
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
}
