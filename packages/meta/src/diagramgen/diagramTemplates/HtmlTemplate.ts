export class HtmlTemplate {

    // TODO make direction available to lang eng

    generate(title: string, codeToInclude: string): string {
        // template starts here
        return `<html>
<body>
<script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
<script>
    mermaid.initialize({ startOnLoad: true });
</script>

<h2 class="title"> ${title} </h2>
<div class="mermaid">
    ${codeToInclude}
</div>

</body>
</html>

<style>
    .abstract .classTitle {
        font-style: italic;
    }
    .title {
        font-family: "Gill Sans MT";
    }
    .interface .classTitle {
        font-style: italic;
        font-weight: bold;
    }
</style>
`;
    }

}
