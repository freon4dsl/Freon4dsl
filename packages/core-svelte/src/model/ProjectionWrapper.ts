import { Box } from "@projectit/core";
import { observable } from "mobx";


export class ProjectionWrapper {
    @observable root: Box;
}
