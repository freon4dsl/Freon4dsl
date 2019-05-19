export class ModelInfoMap {
  private elements: Map<string, string[]> = new Map<string, string[]>();

  add(className: string, refName: string): void {
    if (!this.elements.has(className)) {
      this.elements.set(className, []);
    }
    this.elements.get(className).push(refName);
  }

  contains(className: string, refName: string): boolean {
    const entry = this.elements.get(className);
    if (entry === undefined) {
      return false;
    } else {
      return entry.includes(refName);
    }
  }
}
