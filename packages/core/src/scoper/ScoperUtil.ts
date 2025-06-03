import { FreNamedNode, FreNode, FreNodeReference } from '../ast/index.js';
import { FreNamespace } from './FreNamespace.js';
import { isNullOrUndefined } from '../util/index.js';
import { FreLanguage } from '../language/index.js';
import { FreCompositeScoper } from './FreCompositeScoper.js';

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
			// todo this should be replaced by a better test, but we cannot test 'owner instanceof FreNameNode'
			// const nameProp = node['name'];
			// if (!isNullOrUndefined(nameProp)) {
				return FreNamespace.create(node as FreNamedNode);
			// } else {
			// 	return undefined;
			// }
		} else {
			return findEnclosingNamespace(node.freOwner());
		}
	}
}

/**
 *
 * @param baseNamespace
 * @param currentNamespace
 * @param pathname
 * @param mainScoper
 * @param typeName
 */
// @ts-ignore
export function resolvePathStartingInNamespace(baseNamespace: FreNamespace, currentNamespace: FreNamespace, pathname: string[], mainScoper: FreCompositeScoper, typeName: string) {
	// We must be able to resolve every name in the path to a namespace without taking its metaType into account,
	// except the last. The last should be a FreNamedNode of the type indicated by 'typeName'.
	// Another requirement is that the first name must be visible in the owning namespace of 'toBeResolved'!

	let result: FreNamedNode = undefined;
	// Loop over the set of names in the pathname.
	for (let index = 0; index < pathname.length; index++) {
		// todo maybe publicOnly can be a separate parameter
		let publicOnly = baseNamespace !== currentNamespace; // everything in the namespace that this reference is in, is visible
		// let publicOnly = false;
		// console.log(`searching for: ${pathname[index]}, using publicOnly is ${publicOnly}`);
		if (index !== pathname.length - 1) {
			// Search the next name of pathname in the 'previousNamespace'.
			// Do not use the 'typeName' information, because we are searching for another namespace, not for an element of type 'typeName'.
			result = getFromVisibleNodes(currentNamespace, pathname[index], mainScoper, publicOnly);
			// console.log(`result number ${index} of path, using publicOnly is ${publicOnly}: `, result ? result['name'] : 'undefined')
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
			// console.log(`result number ${index} of path, using publicOnly is ${publicOnly}: `, result ? result['name'] : 'undefined', currentNamespace.getVisibleNodes(mainScoper, [], false).map(e =>e.name))
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
		// console.log(`visible: ${node.name}`);
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
