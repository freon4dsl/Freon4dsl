import Counter from "./Counter.svelte";
import { render, fireEvent } from "@testing-library/svelte";
import { screen } from "@testing-library/dom";
import "@testing-library/jest-dom";

describe("example tests", () => {
    it("uses jest-dom", () => {
        document.body.innerHTML = `
    <span data-testid="not-empty"><span data-testid="empty"></span></span>
    <div data-testid="visible">Visible Example</div>
  `;

        expect(screen.queryByTestId("not-empty")).not.toBeEmptyDOMElement();
        expect(screen.getByText("Visible Example")).toBeVisible();

        // function looking for a span when it's actually a div:
        // screen.getByText((content, element) => {
        //     return element.tagName.toLowerCase() === 'span' && content.startsWith('Visible')
        // })
    });

    it("it works", async () => {
        const { getByText, getByTestId } = render(Counter);

        const increment = screen.getByText("increment");
        const decrement = screen.getByText("decrement");
        const counter = screen.getByTestId("counter-value");

        await fireEvent.click(increment);
        await fireEvent.click(increment);
        await fireEvent.click(increment);
        // await fireEvent.click(decrement)
        await fireEvent.click(decrement);

        expect(counter.textContent).toBe("2");

        // with jest-dom
        expect(counter).toHaveTextContent("2");
    });
});
