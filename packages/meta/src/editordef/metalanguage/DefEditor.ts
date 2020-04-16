import { MetaEditorProjection } from "./MetaEditorProjection";
import { ParseLocation } from "../../utils";

export interface DefEditor {
    location: ParseLocation;
    projection: MetaEditorProjection;
}
