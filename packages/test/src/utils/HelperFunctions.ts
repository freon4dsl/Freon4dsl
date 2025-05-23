import {
    FreModelSerializer,
    type FreModel,
    type FreModelUnit,
    type FreReader,
    type FreWriter,
    FreNode, FreNamedNode, FreCompositeScoper
} from '@freon4dsl/core';
import { FileHandler } from "./FileHandler.js";
import { expect}  from "vitest";

const serial: FreModelSerializer = new FreModelSerializer();
const handler: FileHandler = new FileHandler();

export function compareReadAndWrittenUnits(
    reader: FreReader,
    writer: FreWriter,
    model: FreModel,
    filepath: string,
    metatype: string,
) {
    const langSpec: string = handler.stringFromFile(filepath);
    const unit1 = reader.readFromString(langSpec, metatype, model);
    const result: string = writer.writeToString(unit1, 0, false);
    // console.log(result);
    // handler.stringToFile(filepath+ "out", result);
    expect(result.length).toBeGreaterThan(0);
    let unit2
    (unit1 as FreModelUnit).name = "somethingDifferent"; // name should be unique during reading and adding of unit2
    unit2 = reader.readFromString(result, metatype, model);
    // simply comparing the units does not work because the id properties of the two units
    // are not the same, therefore we use the hack of checking whether both units in JSON
    // format are the same
    // Note that also the names should be equal, therefore ...
    (unit1 as FreModelUnit).name = (unit2 as FreModelUnit).name;
    const unit1_json = serial.convertToJSON(unit1);
    const unit2_json = serial.convertToJSON(unit2);
    expect(unit1_json).toEqual(unit2_json);
}

function getShortFileName(filename: string): string {
    let names: string[] = [];
    if (filename.includes("\\")) {
        names = filename.split("\\");
    } else if (filename.includes("/")) {
        names = filename.split("/");
    }
    return names[names.length - 1];
}

export function isInScope(scoper: FreCompositeScoper, node: FreNode, name: string, metatype?: string, excludeSurrounding?: boolean): boolean {
    return getFromVisibleElements(scoper, node, name, metatype, excludeSurrounding) !== null;
}

export function getFromVisibleElements(
  scoper: FreCompositeScoper,
  node: FreNode,
  name: string,
  metatype?: string,
  excludeSurrounding?: boolean,
): FreNamedNode {
    const visibleElements = scoper.getVisibleNodes(node, metatype, excludeSurrounding);
    if (visibleElements !== null) {
        for (const element of visibleElements) {
            const n: string = element.name;
            if (name === n) {
                return element;
            }
        }
    }
    return null;
}

export function getVisibleNames(scoper: FreCompositeScoper, node: FreNode, metatype?: string, excludeSurrounding?: boolean): string[] {
    const visibleElements = scoper.getVisibleNodes(node, metatype, excludeSurrounding);
    return visibleElements.map(el => el.name);
}
