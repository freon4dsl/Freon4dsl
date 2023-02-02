import { modelUnit } from "../ast-utils/index";
import { FreNode, FreNodeReference, FreModelUnit, FreNamedNode } from "../ast/index";
import { FreLanguageEnvironment } from "../environment/index";
import { FreLanguage } from "../language/index";
import { FreLogger } from "../logging/index";
import { FreCompositeTyper } from "../typer/index";
import { FreScoperComposite } from "./FreScoperComposite";
import { FreNamespace } from "./FreNamespace";
import { FreScoper } from "./FreScoper";

const LOGGER = new FreLogger("FreScoperBase");

export abstract class FreScoperBase implements FreScoper {
    mainScoper: FreScoperComposite;
    myTyper: FreCompositeTyper;
    // Added to avoid loop when searching for additional namespaces
    additionalNamespacesVisited: FreNodeReference<FreNamedNode>[] = [];
    protected currentRoleNames: string[] = [];

    public resolvePathName(basePosition: FreNode, doNotSearch: string, pathname: string[], metatype?: string): FreNamedNode {
        this.currentRoleNames.push(doNotSearch);
        // get the names from the namespace where the pathname is found (i.e. the basePostion) to be able to check against this later on
        let elementsFromBasePosition: FreNamedNode[] = this.getVisibleElements(basePosition);
        // start the loop over the set of names in the pathname
        let previousFound: FreNode = basePosition;
        let found: FreNamedNode = null;
        for (let index = 0; index < pathname.length; index++) {
            if (index === pathname.length - 1) {
                // it is the last name in the path, use 'metatype'
                found = this.getFromVisibleElements(previousFound, pathname[index], metatype);
            } else {
                // search the next name of pathname in the namespace of 'previousFound'
                // but do not use the metatype information, because only the element with the last of the pathname will have the correct type
                found = this.getFromVisibleElements(previousFound, pathname[index]);
                if (found === null || found === undefined || !FreLanguage.getInstance().classifier(found.freLanguageConcept()).isNamespace) {
                    this.currentRoleNames.splice(this.currentRoleNames.indexOf(doNotSearch), 1);
                    return null;
                }
                previousFound = found;
            }
            // check if 'found' is public or 'found' is in the namespace of the basePosition
            if (!this.isPublic(found) && !elementsFromBasePosition.includes(found)) {
                this.currentRoleNames.splice(this.currentRoleNames.indexOf(doNotSearch), 1);
                return null;
            }
        }
        this.currentRoleNames.splice(this.currentRoleNames.indexOf(doNotSearch), 1);
        return found;
    }

    private isPublic(found: FreNamedNode): boolean {
        // find the information about whether this element is public or private within its parent from the its owner:
        // 1. check the language description to find the concept description of the parent
        // 2. from the parent find the property description with the right name
        // 3. check whether the found property is public
        if (found === null || found === undefined) {
            return false;
        }
        const ownerDescriptor = found.freOwnerDescriptor();
        if (ownerDescriptor === null || ownerDescriptor === undefined) {
            return false;
        }
        const metaType: string = ownerDescriptor.owner.freLanguageConcept();
        if (!!FreLanguage.getInstance().modelOfType(metaType)) {
            return true; // model only has units as properties, all units are public
        } else if (!!FreLanguage.getInstance().unit(metaType)) {
            // It's a unit so lookup the unit properties
            return FreLanguage.getInstance().unit(metaType).properties.get(ownerDescriptor.propertyName).isPublic;
        } else {
            // Must be a conccept
            const x = FreLanguage.getInstance().concept(metaType);
            return FreLanguage.getInstance().concept(metaType).properties.get(ownerDescriptor.propertyName).isPublic;
        }
    }

    /**
     * See FreScoper.
     */
    public getVisibleElements(modelelement: FreNode, metatype?: string, excludeSurrounding?: boolean): FreNamedNode[] {
        this.myTyper = FreLanguageEnvironment.getInstance().typer;
        const visitedNamespaces: FreNamespace[] = [];
        const result: FreNamedNode[] = [].concat(this.getElementsFromStdlib(metatype));
        this.getVisibleElementsIntern(modelelement, result, visitedNamespaces, metatype, excludeSurrounding);
        return result;
    }

    private getVisibleElementsIntern(
        modelelement: FreNode,
        result: FreNamedNode[],
        visitedNamespaces: FreNamespace[],
        metatype?: string,
        excludeSurrounding?: boolean
    ): void {
        if (!!modelelement) {
            const origin: FreModelUnit = modelUnit(modelelement);
            let doSurrouding: boolean = excludeSurrounding === null || excludeSurrounding === undefined ? true : !excludeSurrounding;
            let nearestNamespace: FreNamespace;
            // first, see if we need to use an alternative scope/namespace
            if (this.hasAlternativeScope(modelelement)) {
                nearestNamespace = this.getAlternativeScope(modelelement);
                // do not search surrounding namespaces for alternative scopes
                doSurrouding = false;
            } else {
                nearestNamespace = this.findNearestNamespace(modelelement);
            }

            while (!!nearestNamespace) {
                // Second, get the elements from the found namespace
                if (!visitedNamespaces.includes(nearestNamespace)) {
                    FreNamespace.joinResultsWithShadowing(nearestNamespace.getVisibleElements(origin, metatype), result);
                    visitedNamespaces.push(nearestNamespace);
                    for (const additionalNamespace of this.additionalNamespaces(nearestNamespace._myElem)) {
                        this.getVisibleElementsIntern(additionalNamespace, result, visitedNamespaces, metatype, true);
                    }
                }
                modelelement = modelelement.freOwner();
                nearestNamespace = doSurrouding ? this.findNearestNamespace(modelelement) : null;
            }
        } else {
            LOGGER.error("getVisibleElements: modelelement is null");
        }
    }

    /**
     * See FreScoper.
     */
    public getFromVisibleElements(modelelement: FreNode, name: string, metatype?: string, excludeSurrounding?: boolean): FreNamedNode {
        const visibleElements = this.getVisibleElements(modelelement, metatype, excludeSurrounding);
        if (visibleElements !== null) {
            for (const element of visibleElements) {
                const n: string = element.name;
                if (name === n) {
                    return element;
                }
            }
        }
        return null;
    }

    /**
     * See FreScoper.
     */
    public getVisibleNames(modelelement: FreNode, metatype?: string, excludeSurrounding?: boolean): string[] {
        const result: string[] = [];
        const visibleElements = this.getVisibleElements(modelelement, metatype, excludeSurrounding);
        for (const element of visibleElements) {
            const n: string = element.name;
            result.push(n);
        }
        return result;
    }

    /**
     * See FreScoper.
     */
    public isInScope(modelElement: FreNode, name: string, metatype?: string, excludeSurrounding?: boolean): boolean {
        return this.getFromVisibleElements(modelElement, name, metatype, excludeSurrounding) !== null;
    }

    /**
     * Returns the enclosing namespace for 'modelelement'.
     * @param modelelement
     */
    private findNearestNamespace(modelelement: FreNode): FreNamespace {
        if (modelelement === null) {
            return null;
        }
        if (FreLanguage.getInstance().classifier(modelelement.freLanguageConcept()).isNamespace) {
            return FreNamespace.create(modelelement);
        } else {
            return this.findNearestNamespace(modelelement.freOwner());
        }
    }

    /**
     * Returns all elements that are in the standard library, which types equal 'metatype'.
     * @param metatype
     */
    private getElementsFromStdlib(metatype?: string): FreNamedNode[] {
        if (!!metatype) {
            return FreLanguageEnvironment.getInstance().stdlib.elements.filter(elem =>
                FreLanguage.getInstance().metaConformsToType(elem, metatype)
            );
        } else {
            return FreLanguageEnvironment.getInstance().stdlib.elements;
        }
    }

    abstract hasAlternativeScope(modelelement: FreNode): boolean;

    abstract getAlternativeScope(modelelement: FreNode): FreNamespace;
    
    abstract additionalNamespaces(element: FreNode): FreNode[];
}
