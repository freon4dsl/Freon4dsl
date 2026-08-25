// the following two classes are only used in the typer and validator definitions
import { FreMetaLangElement, FreMetaLanguage, MetaElementReference, FreMetaConcept } from "./internal.js"

import { FreMetaParameter } from "./FreMetaParameter.js"

export class FreMetaFunction extends FreMetaLangElement {
    // @ts-ignore
    language: FreMetaLanguage
    formalparams: FreMetaParameter[] = []
    // @ts-ignore
    returnType: MetaElementReference<FreMetaConcept>
}
