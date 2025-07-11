// the projections that are currently chosen to be shown
export const projectionsShown: string[] = $state([]);

export function replaceProjectionsShown(newList: string[]) {
  // remove any old values
  projectionsShown.splice(0, projectionsShown.length);
  // set all to shown, initially, all projections are shown
  projectionsShown.push(...newList);
}
