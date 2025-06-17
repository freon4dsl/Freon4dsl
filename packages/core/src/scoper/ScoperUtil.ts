import { FreNamedNode, FreNode, FreNodeReference } from '../ast/index.js';
import { FreNamespace } from './FreNamespace.js';
import { isNullOrUndefined } from '../util/index.js';
import { FreLanguage } from '../language/index.js';
import { FreCompositeScoper } from './FreCompositeScoper.js';

/**
 * This file contains a few methods that are used by both FreScoperBase and FreNamespace.
 */

/**
 * Returns the enclosing namespace for 'node'. The result could be 'node' itself, if this is a namespace.
 * @param node
 */
export function findEnclosingNamespace(node: FreNodeReference<FreNamedNode> | FreNode): FreNamespace | undefined {
	if (isNullOrUndefined(node)) {
		return undefined;
	}
	if (node instanceof FreNodeReference) {
		return findEnclosingNamespace(node.freOwner());
	} else {
		if (FreLanguage.getInstance().classifier(node.freLanguageConcept()).isNamespace) {
				return FreNamespace.create(node as FreNamedNode);
		} else {
			return findEnclosingNamespace(node.freOwner());
		}
	}
}

/**
 * Returns the node that is indicated by 'pathname'. The first part of the 'pathname' is resolved within 'currentNamespace', after which
 * the rest of 'pathname' is resolved in the namespace that is indicated by the first part of 'pathname'.
 *
 * @param baseNamespace			the namespace in which the complete pathname is being resolved, used to determine whether private nodes are taken into account
 * @param currentNamespace	the namespace in which the first of 'pathname' is resolved
 * @param pathname					the (part of the) qualified name that is to be resolved
 * @param mainScoper
 * @param typeName					the meta type of the node that we are searching for
 */
export function resolvePathStartingInNamespace(baseNamespace: FreNamespace, currentNamespace: FreNamespace, pathname: string[], mainScoper: FreCompositeScoper, typeName: string) {
	// We must be able to resolve every name in the path to a namespace without taking its metaType into account,
	// except the last. The last should be a FreNamedNode of the type indicated by 'typeName'.
	// Another requirement is that the first name must be visible in 'currentNamespace'!

	let result: FreNamedNode = undefined;
	// Loop over the set of names in the pathname.
	for (let index = 0; index < pathname.length; index++) {
		let publicOnly = baseNamespace !== currentNamespace; // everything in the namespace that this reference is in, is visible
		if (index !== pathname.length - 1) {
			// Search the next name of pathname in the 'previousNamespace'.
			// Do not use the 'typeName' information, because we are searching for another namespace, not for an element of type 'typeName'.
			result = getFromVisibleNodes(currentNamespace, pathname[index], mainScoper, publicOnly);
			// todo if a namespace may contain multiple nodes with the same name but different type, this code needs to be adjusted
			if (isNullOrUndefined(result) || !FreLanguage.getInstance().classifier(result.freLanguageConcept()).isNamespace) {
				// The pathname is not correct, it does not lead to a namespace that is visible within 'previousNamespace',
				// so return.
				return undefined;
			} else {
				// result is the next namespace in the pathname!
				// But 'result' is a FreNamedNode, so transform it into a namespace.
				currentNamespace = FreNamespace.create(result);
			}
		} else {
			// Search the last name in the path, the result need not be a namespace, so use 'typeName'.
			result = getFromVisibleNodes(currentNamespace, pathname[index], mainScoper, publicOnly, typeName);
		}
	}
	return result;
}

/**
 * A convenience method that finds the node with name 'name' within the visible nodes of the namespace that 'node' resides in.
 * Often 'node' itself represents this namespace.
 *
 * If 'metaType' is present, only return the node if its type conforms to 'metaType'.
 *
 * @param namespace
 * @param name
 * @param mainScoper
 * @param publicOnly
 * @param metaType
 */
export function getFromVisibleNodes(
	namespace: FreNamespace,
	name: string,
	mainScoper: FreCompositeScoper,
	publicOnly: boolean,
	metaType?: string
): FreNamedNode | undefined {
	// console.log('BASE getFromVisibleNodes, searching for type of ' + metaType);
	const visibleNodes = FreLanguage.getInstance().stdLib.elements.concat(namespace.getVisibleNodes(mainScoper, [], publicOnly));
	for (const node of visibleNodes) {
		const n: string = node.name;
		if (name === n && hasCorrectType(node, metaType)) {
			return node;
		}
	}
	return undefined;
}

/**
 * Checks whether 'freNode' has a type that conforms to 'metaType'.
 *
 * @param freNode
 * @param metaType
 * @private
 */
export function hasCorrectType(freNode: FreNode, metaType: string): boolean {
	if (!!metaType && metaType.length > 0) {
		return FreLanguage.getInstance().metaConformsToType(freNode, metaType);
	} else {
		return true;
	}
}
