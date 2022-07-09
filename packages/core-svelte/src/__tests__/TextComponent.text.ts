// from https://kentcdodds.com/blog/common-mistakes-with-react-testing-library

// ❌
// fireEvent.change(input, {target: {value: 'hello world'}})

// ✅
// userEvent.type(input, 'hello world')

describe("Text component", () => {

    it("....", () => {
    });
});
