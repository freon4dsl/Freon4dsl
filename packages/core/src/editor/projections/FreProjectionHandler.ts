import { FreLogger } from "../../logging/index";
import { Box, BoxFactory, ElementBox } from "../boxes";
import { isNullOrUndefined } from "../../util";
import { FreNode } from "../../ast";
import { FreBoxProvider } from "./FreBoxProvider";
import { FreProjection } from "./FreProjection";
import { action, makeObservable, observable } from "mobx";
import { ArrayUtil } from "../../util/ArrayUtil";
import { FreTableHeaderInfo } from "./FreTableHeaderInfo";
import { FreHeaderProvider } from "./FreHeaderProvider";

const LOGGER = new FreLogger("FreProjectionHandler");
/**
 * This class, of which there should be one instance per editor, registers all
 * custom projections (of type FreProjection), and all box providers (of type
 * FreBoxProvider). There are the two main methods 'getBox', and 'getTableDefinition'.
 *
 * Based on these registrations it is determined which of these should create the box,
 * or tableDefinition for a certain element. Note that, because box providers have a
 * one-to-one relationship with nodes (of type FreNode), it is always the box provider
 * that ultimately returns the requested box/tableDefinition.
 */
export class FreProjectionHandler {
    // 'conceptToPropertyProjection' stores the information on how a property should be projected for each concept
    private conceptToPropertyProjection: Map<string, Map<string, Map<string, string>>>;
    public initConceptToPropertyProjection(map: Map<string, Map<string, Map<string, string>>>) {
        this.conceptToPropertyProjection = map;
    }
    // 'elementToProvider' stores the boxprovider that is servicing a certain node (of type FreNode).
    private elementToProvider: Map<string, FreBoxProvider> = new Map<string, FreBoxProvider>();
    // 'conceptNameToProviderConstructor' holds a list of box provider constructors,
    // such that the right box provider can be instantiated for a certain (type of) FreNode node.
    private conceptNameToProviderConstructor: Map<string, (h: FreProjectionHandler) => FreBoxProvider> = new Map<
        string,
        (h: FreProjectionHandler) => FreBoxProvider
    >([]);
    // 'headerProviders' holds all boxproviders that are responsible for the headers in a table.
    // Its key is <elementId, propertyName>, where elementId is the id of the element that holds the table,
    // and propertyName the name of the property that must be shown in the table.
    private headerProviders: Map<string[], FreHeaderProvider> = new Map<string[], FreHeaderProvider>();
    // '_allProjections' holds the list of names of all available projections, including all custom ones
    private _allProjections: string[] = [];
    // '_enabledProjections' holds the list of names of all enabled projections
    private _enabledProjections: string[] = [];
    // '_customProjections' holds the list of all custom projections (not only the names but the projections themselves!)
    private _customProjections: FreProjection[] = [];
    //
    private tableHeaderInfo: FreTableHeaderInfo[] = [];

    constructor() {
        /* The function enableProjections is a mobx action in order for all box providers to
        determine their contents in one go, thus resulting in only one (big) change in
        the web application.
         */
        makeObservable<FreProjectionHandler, "_enabledProjections">(this, {
            enableProjections: action,
            _enabledProjections: observable,
        });
    }

    /////////// The main methods ///////////

    /**
     * Returns a box for 'element'. Which box is returned is determined by the enabled projections.
     * Internally, one of the box providers in 'elementToProvider' is used.
     * @param element
     */
    getBox(element: FreNode): ElementBox | undefined {
        // todo remove try-catch
        try {
            if (isNullOrUndefined(element)) {
                throw Error("FreProjectionHandler.getBox: element is null/undefined");
            }
        } catch (e) {
            console.error(e.stack);
            return null;
        }
        return this.getBoxProvider(element)?.box;
    }

    ////////// Methods for registering the boxproviders ////////////

    /**
     * Method that initilizes the property 'conceptNameToProviderConstructor'.
     * @param constructorMap
     */
    initProviderConstructors(constructorMap: Map<string, () => FreBoxProvider>) {
        this.conceptNameToProviderConstructor = constructorMap;
    }

    /** Returns the required projection for 'property', like a table projection, or a named projection.
     */
    public getRequiredProjection(concept: string, projection: string, property: string): string {
        return this.conceptToPropertyProjection.get(concept)?.get(projection)?.get(property);
    }

    /**
     * Returns a box provider for element. Either it is newly created or it is found in
     * 'this.elementToProvider'.
     * @param node
     */
    getBoxProvider(node: FreNode): FreBoxProvider {
        LOGGER.log("getBoxProvider for " + node.freId() + " (" + node.freLanguageConcept() + ")");
        if (isNullOrUndefined(node)) {
            console.error("FreProjectionHandler.getBoxProvider: node is null/undefined");
            return null;
        }

        // return if present, else create a new provider based on the language concept
        let boxProvider: FreBoxProvider = this.elementToProvider.get(node.freId());
        if (isNullOrUndefined(boxProvider)) {
            LOGGER.log("getBoxProvider is null/undefined for type " + node.freLanguageConcept());
            boxProvider = this.conceptNameToProviderConstructor.get(node.freLanguageConcept())(this);
            this.elementToProvider.set(node.freId(), boxProvider);
            boxProvider.node = node;
        }
        return boxProvider;
    }

    getBoxProviderForType(conceptName: string): FreBoxProvider {
        return this.conceptNameToProviderConstructor.get(conceptName)(this);
    }

    //////////// Methods for registring the projections ///////////

    /**
     * Adds the name of a projection
     * @param p
     */
    addProjection(p: string) {
        ArrayUtil.addIfNotPresent(this._allProjections, p);
        if (p !== "default") {
            ArrayUtil.addIfNotPresent(this._enabledProjections, p);
        }
    }

    /**
     * Sets all projections whose name is in 'names' to be enabled.
     * @param names
     */
    enableProjections(names: string[]) {
        BoxFactory.clearCaches();
        // Because priority needs to be taken into account, we loop over all projections
        // in order to get the order of enabled projections correct.
        // This assumes that 'this._allProjections' always has the right order of priorities.
        const newList: string[] = [];
        for (const proj of this._allProjections) {
            if (names.includes(proj)) {
                newList.push(proj);
            }
        }
        this._enabledProjections = newList;
        // console.log(" ============== enabled projections: " + this._enabledProjections);

        //  Let all providers know that projection may be changed.
        for (const provider of this.elementToProvider.values()) {
            provider.clearUsedProjection();
        }
        for (const provider of this.headerProviders.values()) {
            provider.clearUsedProjection();
        }
    }

    /**
     * Returns the names of all known projections.
     */
    projectionNames(): string[] {
        return this._allProjections;
    }

    /**
     * Returns the names of enabled projections.
     */
    enabledProjections(): string[] {
        return this._enabledProjections;
    }

    //////// Methods for custom projections ///////////

    /**
     * Returns the set of all custom projections.
     */
    get customProjections(): FreProjection[] {
        return this._customProjections;
    }

    /**
     * Adds a single custom projection.
     * @param p
     */
    addCustomProjection(p: FreProjection) {
        ArrayUtil.addIfNotPresent(this._customProjections, p);
        this.addProjection(p.name);
    }

    /**
     * Method that executes the function to create a box for 'element' that is registered
     * in the property 'nodeTypeToBoxMethod' of the custom projection named 'projectionName'.
     * @param element
     * @param projectionName
     */
    executeCustomProjection(element: FreNode, projectionName: string): Box {
        let BOX: Box = null;
        let customFuction: (node: FreNode) => Box = null;
        const customToUse = this.customProjections.find((cp) => cp.name === projectionName);
        if (!!customToUse) {
            // bind(customToUse) binds the projection 'customToUse' to the 'this' variable, for use within the custom function
            customFuction = customToUse.nodeTypeToBoxMethod.get(element.freLanguageConcept())?.bind(customToUse);
        }

        if (!!customFuction) {
            BOX = customFuction(element);
        }
        return BOX;
    }

    ////////////// Methods for table headers //////////////

    initTableHeaders(list: FreTableHeaderInfo[]) {
        this.tableHeaderInfo = list;
    }

    getHeaderProvider(node: FreNode, propertyName: string, conceptName: string): FreHeaderProvider {
        if (isNullOrUndefined(node)) {
            console.error("FreProjectionHandler.getHeaderProvider: node is null/undefined");
            return null;
        }

        // return if present, else create a new provider
        let headerProvider = this.headerProviders.get([node.freId(), propertyName]);
        if (isNullOrUndefined(headerProvider)) {
            headerProvider = new FreHeaderProvider(node, propertyName, conceptName, this);
            this.headerProviders.set([node.freId(), propertyName], headerProvider);
            // headerProvider.initUsedProjection();
        }
        return headerProvider;
    }

    getKnownTableProjectionsFor(conceptName: string): string[] {
        LOGGER.log("getKnownTableProjectionsFor: " + conceptName);
        return this.conceptNameToProviderConstructor.get(conceptName)(this).knownTableProjections;
    }

    getTableHeaderInfo(conceptName: string, projectionName: string): string[] {
        for (const part of this.tableHeaderInfo) {
            if (part.conceptName === conceptName && part.projectionName === projectionName) {
                return part.headerRow;
            }
        }
        return [];
    }
}
