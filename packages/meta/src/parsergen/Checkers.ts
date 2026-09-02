import { FreMetaClassifier, FreMetaLanguage, FreMetaPrimitiveProperty } from "../languagedef/metalanguage/index.js"

export function checkLanguage(text: string, language: FreMetaLanguage) {
    console.log("\n" + text)
    language.classifiers().forEach((classifier) => {
        console.log(`Checking Classifier ${classifier.name}\n`)
        checkClassifier(classifier)
    })
}

export function checkClassifier(classifier: FreMetaClassifier) {
    classifier.allProperties().forEach((property) => {
        if (property instanceof FreMetaPrimitiveProperty && !isPrimTypeName(property.type.name)) {
            console.log("found prim prop with wrong type: ", `${property.name}:${property.type.name}`)
        }
        if (!(property instanceof FreMetaPrimitiveProperty) && isPrimTypeName(property.type.name)) {
            console.log("found NON prim prop with wrong type: ", `${property.name}:${property.type.name}`)
        }
    })
    classifier.primProperties.forEach((property) => {
        if (property instanceof FreMetaPrimitiveProperty && !isPrimTypeName(property.type.name)) {
            console.log("found prim prop with wrong type: ", `${property.name}:${property.type.name}`)
        }
        if (!(property instanceof FreMetaPrimitiveProperty)) {
            console.log("found NON prim prop: ")
        }
    })
}

function isPrimTypeName(refName: string) {
    if (refName === "string" || refName === "boolean" || refName === "number" || refName === "identifier") {
        return true
    }
    return false
}
