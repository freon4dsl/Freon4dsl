import { FreMetaLangElement, MetaElementReference, FreMetaConcept } from "./internal.js"

import { FreMetaInstanceProperty } from "./FreMetaInstanceProperty.js"

export class FreMetaInstance extends FreMetaLangElement {
    // @ts-ignore
    concept: MetaElementReference<FreMetaConcept> // should be a limited concept
    // Note that these properties may be undefined, when there is no definition in the .ast file
    props: FreMetaInstanceProperty[] = []

    nameProperty(): FreMetaInstanceProperty | undefined {
        return this.props.find((p) => p.name === "name")
    }
}
