export class MarkDownTemplate {

    generate(title: string, codeToInclude: string): string {
        // template starts here
        return `# ${title}
\`\`\`mermaid
    ${codeToInclude}
\`\`\`
`;
    }

}
