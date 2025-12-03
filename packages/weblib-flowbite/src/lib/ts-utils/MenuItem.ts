export class MenuItem {
  title: string = "";
  action: (id: number) => void = () => {};
  icon?: object;
  id: number = -1;
}

export class ProjectionItem {
    name: string = "";
    selected: boolean = false;

    constructor(name: string, selected: boolean) {
        this.name = name;
        this.selected = selected;
    }
}
