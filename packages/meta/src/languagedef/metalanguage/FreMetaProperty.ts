import { FreMetaLangElement, MetaElementReference, FreMetaClassifier, FreMetaLanguage, FreMetaPrimitiveType } from "./internal.js"

export class FreMetaProperty extends FreMetaLangElement {
    id?: string = ""
    key?: string = ""
    isPublic: boolean = false
    isOptional: boolean = false
    isList: boolean = false
    isPart: boolean = false // if false then it is a reference property
    implementedInBase: boolean = false
    // @ts-ignore
    private $type: MetaElementReference<FreMetaClassifier>
    // @ts-ignore
    private _owningClassifier: FreMetaClassifier
    // @ts-ignore
    originalOwningClassifier: FreMetaClassifier
    get owningClassifier() {
        return this._owningClassifier
    }
    set owningClassifier(c: FreMetaClassifier) {
        if (this._owningClassifier === undefined || this._owningClassifier === null) {
            this._owningClassifier = c
            this.originalOwningClassifier = c
        } else {
            // this.originalOwningClassifier = this._owningClassifier;
            this._owningClassifier = c
        }
    }
    get language(): FreMetaLanguage {
        return this.originalOwningClassifier.originalOwningLanguage
    }

    get isPrimitive(): boolean {
        return this.type instanceof FreMetaPrimitiveType
    }
    get type(): FreMetaClassifier {
        return this.$type?.referred
    }
    set type(t: FreMetaClassifier) {
        this.$type = MetaElementReference.create<FreMetaClassifier>(t)
        this.$type.owner = this
    }
    get typeReference(): MetaElementReference<FreMetaClassifier> {
        // only used by FreLanguageChecker and FreTyperChecker
        return this.$type
    }
    set typeReference(t: MetaElementReference<FreMetaClassifier>) {
        // only used by FreLanguageChecker and FreTyperChecker
        this.$type = t
        this.$type.owner = this
    }
    toFreString(): string {
        return this.name + ": " + this.$type.name + `${this.isList ? `[]` : ``}`
    }
}
