import { FreMetaConcept, FreMetaConceptProperty } from "./internal.js"

export // Type to keep info about a part that needs to be initialized and its implementing concept
type PartInitializer = {
    part: FreMetaConceptProperty // the part that needs initializing
    concept: FreMetaConcept // T he class that needs tp be constructed
}
