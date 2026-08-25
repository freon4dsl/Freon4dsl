import { FreMetaLangElement, MetaElementReference, FreMetaConcept } from "./internal.js"

export class FreMetaParameter extends FreMetaLangElement {
    // @ts-ignore
    type: MetaElementReference<FreMetaConcept>
}
