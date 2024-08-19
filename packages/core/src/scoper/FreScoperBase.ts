import { modelUnit } from "../ast-utils";
import { FreNode, FreNodeReference, FreModelUnit, FreNamedNode } from "../ast";
import { FreLanguageEnvironment } from "../environment";
import { FreLanguage } from "../language";
import { FreLogger } from "../logging";
import { FreCompositeTyper } from "../typer";
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

    public resolvePathName(
        basePosition: FreNode,
        doNotSearch: string,
        pathname: string[],
        metatype?: string,
    ): FreNamedNode {
        this.currentRoleNames.push(doNotSearch);
        // get the names from the namespace where the pathname is found (i.e. the basePostion) to be able to check against this later on
        const elementsFromBasePosition: FreNamedNode[] = this.getVisibleElements(basePosition);
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
                if (
                    found === null ||
                    found === undefined ||
                    !FreLanguage.getInstance().classifier(found.freLanguageConcept()).isNamespace
                ) {
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
        // find the information about whether this element is public or private within its parent from the owner descriptor:
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
            // const x = FreLanguage.getInstance().concept(metaType);
            return FreLanguage.getInstance().concept(metaType).properties.get(ownerDescriptor.propertyName).isPublic;
        }
    }

    /**
     * See FreScoper.
     */
    public getVisibleElements(node: FreNode, metatype?: string, excludeSurrounding?: boolean): FreNamedNode[] {
        this.myTyper = FreLanguageEnvironment.getInstance().typer;
        const visitedNamespaces: FreNamespace[] = [];
        const result: FreNamedNode[] = [].concat(this.getElementsFromStdlib(metatype));
        this.getVisibleElementsIntern(node, result, visitedNamespaces, metatype, excludeSurrounding);
        return result;
    }

    private getVisibleElementsIntern(
        node: FreNode,
        result: FreNamedNode[],
        visitedNamespaces: FreNamespace[],
        metatype?: string,
        excludeSurrounding?: boolean,
    ): void {
        if (!!node) {
            const origin: FreModelUnit = modelUnit(node);
            let doSurrouding: boolean =
                excludeSurrounding === null || excludeSurrounding === undefined ? true : !excludeSurrounding;
            let nearestNamespace: FreNamespace;
            // first, see if we need to use an alternative scope/namespace
            if (this.hasAlternativeScope(node)) {
                nearestNamespace = this.getAlternativeScope(node);
                // do not search surrounding namespaces for alternative scopes
                doSurrouding = false;
            } else {
                nearestNamespace = this.findNearestNamespace(node);
            }

            while (!!nearestNamespace) {
                // Second, get the elements from the found namespace
                if (!visitedNamespaces.includes(nearestNamespace)) {
                    FreNamespace.joinResultsWithShadowing(
                        nearestNamespace.getVisibleElements(origin, metatype),
                        result,
                    );
                    visitedNamespaces.push(nearestNamespace);
                    for (const additionalNamespace of this.additionalNamespaces(nearestNamespace._myElem)) {
                        this.getVisibleElementsIntern(additionalNamespace, result, visitedNamespaces, metatype, true);
                    }
                }
                node = node.freOwner();
                nearestNamespace = doSurrouding ? this.findNearestNamespace(node) : null;
            }
        } else {
            LOGGER.error("getVisibleElements: modelelement is null");
        }
    }

    /**
     * See FreScoper.
     */
    public getFromVisibleElements(
        node: FreNode,
        name: string,
        metatype?: string,
        excludeSurrounding?: boolean,
    ): FreNamedNode {
        const visibleElements = this.getVisibleElements(node, metatype, excludeSurrounding);
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
    public getVisibleNames(node: FreNode, metatype?: string, excludeSurrounding?: boolean): string[] {
        const result: string[] = [];
        const visibleElements = this.getVisibleElements(node, metatype, excludeSurrounding);
        for (const element of visibleElements) {
            const n: string = element.name;
            result.push(n);
        }
        return result;
    }

    /**
     * See FreScoper.
     */
    public isInScope(node: FreNode, name: string, metatype?: string, excludeSurrounding?: boolean): boolean {
        return this.getFromVisibleElements(node, name, metatype, excludeSurrounding) !== null;
    }

    /**
     * Returns the enclosing namespace for 'modelelement'.
     * @param node
     */
    private findNearestNamespace(node: FreNode): FreNamespace {
        if (node === null) {
            return null;
        }
        if (FreLanguage.getInstance().classifier(node.freLanguageConcept()).isNamespace) {
            return FreNamespace.create(node);
        } else {
            return this.findNearestNamespace(node.freOwner());
        }
    }

    /**
     * Returns all elements that are in the standard library, which types equal 'metatype'.
     * @param metatype
     */
    private getElementsFromStdlib(metatype?: string): FreNamedNode[] {
        if (!!metatype) {
            return FreLanguage.getInstance().stdLib.elements.filter((elem) =>
                FreLanguage.getInstance().metaConformsToType(elem, metatype),
            );
        } else {
            return FreLanguage.getInstance().stdLib.elements;
        }
    }

    abstract hasAlternativeScope(node: FreNode): boolean;

    abstract getAlternativeScope(node: FreNode): FreNamespace;

    abstract additionalNamespaces(node: FreNode): FreNode[];
}
