import { modelUnit } from "../ast-utils/index";
import { PiElement, PiElementReference, PiModelUnit, PiNamedElement } from "../ast/index";
import { LanguageEnvironment } from "../environment/index";
import { Language } from "../language/index";
import { PiLogger } from "../logging/index";
import { FreCompositeTyper } from "../typer/index";
import { FreScoperComposite } from "./FreScoperComposite";
import { FreonNamespace } from "./FreonNamespace";
import { FreScoper } from "./FreScoper";

const LOGGER = new PiLogger("FreScoperBase");

export abstract class FreScoperBase implements FreScoper {
    mainScoper: FreScoperComposite;
    myTyper: FreCompositeTyper;
    // Added to avoid loop when searching for additional namespaces
    additionalNamespacesVisited: PiElementReference<PiNamedElement>[] = [];
    protected currentRoleNames: string[] = [];

    public resolvePathName(basePosition: PiElement, doNotSearch: string, pathname: string[], metatype?: string): PiNamedElement {
        this.currentRoleNames.push(doNotSearch);
        // get the names from the namespace where the pathname is found (i.e. the basePostion) to be able to check against this later on
        let elementsFromBasePosition: PiNamedElement[] = this.getVisibleElements(basePosition);
        // start the loop over the set of names in the pathname
        let previousFound: PiElement = basePosition;
        let found: PiNamedElement = null;
        for (let index = 0; index < pathname.length; index++) {
            if (index === pathname.length - 1) {
                // it is the last name in the path, use 'metatype'
                found = this.getFromVisibleElements(previousFound, pathname[index], metatype);
            } else {
                // search the next name of pathname in the namespace of 'previousFound'
                // but do not use the metatype information, because only the element with the last of the pathname will have the correct type
                found = this.getFromVisibleElements(previousFound, pathname[index]);
                if (found === null || found === undefined || !Language.getInstance().classifier(found.piLanguageConcept()).isNamespace) {
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

    private isPublic(found: PiNamedElement): boolean {
        // find the information about whether this element is public or private within its parent from the its owner:
        // 1. check the language description to find the concept description of the parent
        // 2. from the parent find the property description with the right name
        // 3. check whether the found property is public
        if (found === null || found === undefined) {
            return false;
        }
        const ownerDescriptor = found.piOwnerDescriptor();
        if (ownerDescriptor === null || ownerDescriptor === undefined) {
            return false;
        }
        const metaType: string = ownerDescriptor.owner.piLanguageConcept();
        if (!!Language.getInstance().modelOfType(metaType)) {
            return true; // model only has units as properties, all units are public
        } else if (!!Language.getInstance().unit(metaType)) {
            // It's a unit so lookup the unit properties
            return Language.getInstance().unit(metaType).properties.get(ownerDescriptor.propertyName).isPublic;
        } else {
            // Must be a conccept
            const x = Language.getInstance().concept(metaType);
            return Language.getInstance().concept(metaType).properties.get(ownerDescriptor.propertyName).isPublic;
        }
    }

    /**
     * See FreScoper.
     */
    public getVisibleElements(modelelement: PiElement, metatype?: string, excludeSurrounding?: boolean): PiNamedElement[] {
        this.myTyper = LanguageEnvironment.getInstance().typer;
        const visitedNamespaces: FreonNamespace[] = [];
        const result: PiNamedElement[] = [].concat(this.getElementsFromStdlib(metatype));
        this.getVisibleElementsIntern(modelelement, result, visitedNamespaces, metatype, excludeSurrounding);
        return result;
    }

    private getVisibleElementsIntern(
        modelelement: PiElement,
        result: PiNamedElement[],
        visitedNamespaces: FreonNamespace[],
        metatype?: string,
        excludeSurrounding?: boolean
    ): void {
        if (!!modelelement) {
            const origin: PiModelUnit = modelUnit(modelelement);
            let doSurrouding: boolean = excludeSurrounding === null || excludeSurrounding === undefined ? true : !excludeSurrounding;
            let nearestNamespace: FreonNamespace;
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
                    FreonNamespace.joinResultsWithShadowing(nearestNamespace.getVisibleElements(origin, metatype), result);
                    visitedNamespaces.push(nearestNamespace);
                    for (const additionalNamespace of this.additionalNamespaces(nearestNamespace._myElem)) {
                        this.getVisibleElementsIntern(additionalNamespace, result, visitedNamespaces, metatype, true);
                    }
                }
                modelelement = modelelement.piOwner();
                nearestNamespace = doSurrouding ? this.findNearestNamespace(modelelement) : null;
            }
        } else {
            LOGGER.error("getVisibleElements: modelelement is null");
        }
    }

    /**
     * See FreScoper.
     */
    public getFromVisibleElements(modelelement: PiElement, name: string, metatype?: string, excludeSurrounding?: boolean): PiNamedElement {
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
    public getVisibleNames(modelelement: PiElement, metatype?: string, excludeSurrounding?: boolean): string[] {
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
    public isInScope(modelElement: PiElement, name: string, metatype?: string, excludeSurrounding?: boolean): boolean {
        return this.getFromVisibleElements(modelElement, name, metatype, excludeSurrounding) !== null;
    }

    /**
     * Returns the enclosing namespace for 'modelelement'.
     * @param modelelement
     */
    private findNearestNamespace(modelelement: PiElement): FreonNamespace {
        if (modelelement === null) {
            return null;
        }
        if (Language.getInstance().classifier(modelelement.piLanguageConcept()).isNamespace) {
            return FreonNamespace.create(modelelement);
        } else {
            return this.findNearestNamespace(modelelement.piOwner());
        }
    }

    /**
     * Returns all elements that are in the standard library, which types equal 'metatype'.
     * @param metatype
     */
    private getElementsFromStdlib(metatype?: string): PiNamedElement[] {
        if (!!metatype) {
            return LanguageEnvironment.getInstance().stdlib.elements.filter(elem =>
                Language.getInstance().metaConformsToType(elem, metatype)
            );
        } else {
            return LanguageEnvironment.getInstance().stdlib.elements;
        }
    }

    abstract hasAlternativeScope(modelelement: PiElement): boolean;

    abstract getAlternativeScope(modelelement: PiElement): FreonNamespace;
    
    abstract additionalNamespaces(element: PiElement): PiElement[];
}
