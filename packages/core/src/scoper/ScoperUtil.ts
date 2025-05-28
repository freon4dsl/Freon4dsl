import { FreNamedNode, FreNode, FreNodeReference } from '../ast/index.js';
import { FreNamespace } from './FreNamespace.js';
import { isNullOrUndefined } from '../util/index.js';
import { FreLanguage } from '../language/index.js';

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
