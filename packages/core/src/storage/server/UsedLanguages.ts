import { LionWebJsonMetaPointer, LionWebJsonNode, LwJsonUsedLanguage } from "@lionweb/validation";

export function collectUsedLanguages(nodes: LionWebJsonNode[]): LwJsonUsedLanguage[] {
    if (nodes.length == 0) {
        return [];
    }
    const languages: Map<string, Set<string>> = new Map<string, Set<string>>();
    nodes.forEach((node) => {
        addLanguage(languages, node.classifier);
        node.properties.forEach((p) => addLanguage(languages, p.property));
        node.containments.forEach((c) => addLanguage(languages, c.containment));
        node.references.forEach((r) => addLanguage(languages, r.reference));
    });
    const mapped = new Mapped();
    languages.forEach(mapped.map);
    return mapped.languages;
}

function addLanguage(languages: Map<string, Set<string>>, metaPointer: LionWebJsonMetaPointer): void {
    let versions: Set<string> | undefined = languages.get(metaPointer.language);
    if (versions === undefined) {
        versions = new Set<string>();
        languages.set(metaPointer.language, versions);
    }
    versions.add(metaPointer.version);
}

class Mapped {
    languages: LwJsonUsedLanguage[] = [];
    map = (value: Set<string>, key: string): void => {
        value.forEach((v) => this.languages.push({ key: key, version: v }));
    };
}
