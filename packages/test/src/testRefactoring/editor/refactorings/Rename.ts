import {FreNamedNode} from "@freon4dsl/core";
import {runInAction} from "mobx";

export function rename(node: FreNamedNode, newName: string): boolean {
    runInAction(() => {
        if (!!node.name) {
            node.getModel().findAllReferencesTo(node).forEach(ref => {

                ref.name = newName;
            })
            node.name = newName;
        }
    })
    return false;
}
