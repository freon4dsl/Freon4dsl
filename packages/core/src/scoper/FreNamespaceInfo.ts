import { FreNamedNode, FreNode, FreNodeReference } from '../ast/index.js';

export class FreNamespaceInfo {
	public _myNode: FreNode | FreNodeReference<FreNamedNode>;
	public recursive: boolean;

	constructor(node: FreNode | FreNodeReference<FreNamedNode>, exported: boolean) {
		this._myNode = node;
		this.recursive = exported;
	}
}
