export interface OptionalOptions {
  font?: string;
  fontSize?: string;
  fontWeight?: string;
  width?: string;
}

interface Options {
  font: string;
  fontSize: string;
  fontWeight: string;
  width: string;
}

export interface TextSize {
  width: number;
  height: number;
}

function createDummyElement(text: string, options: Options): HTMLElement {
  const element = document.createElement("div");
  const textNode = document.createTextNode(text);

  element.appendChild(textNode);

  element.style.fontFamily = options.font;
  element.style.fontSize = options.fontSize;
  element.style.fontWeight = options.fontWeight;
  element.style.position = "absolute";
  element.style.visibility = "hidden";
  element.style.left = "-999px";
  element.style.top = "-999px";
  element.style.width = options.width;
  element.style.height = "auto";

  document.body.appendChild(element);

  return element;
}

function destroyElement(element: HTMLElement): void {
  if (element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

const cache = {};

export function textSize(
  text: string,
  options: OptionalOptions = {}
): TextSize {
  const cacheKey = JSON.stringify({ text: text, options: options });

  if ((cache as any)[cacheKey]) {
    return (cache as any)[cacheKey];
  }

  // prepare options
  options.font = options.font || "Courier New";
  options.fontSize = options.fontSize || "14px";
  options.fontWeight = options.fontWeight || "normal";
  options.width = options.width || "auto";

  const element = createDummyElement(text, options as Options);

  const size = {
    width: element.offsetWidth + 2,
    height: element.offsetHeight + 2
  };

  destroyElement(element);

  (cache as any)[cacheKey] = size;

  return size;
}
