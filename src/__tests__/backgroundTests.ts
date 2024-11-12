import path from 'path';
import { JSDOM } from 'jsdom';
import fs from 'fs';

import { checkCodeIsCpp } from "../backCodeChecks";

describe("checkCodeIsCpp", () => {

    let document: Document;

    beforeAll(() => {
        const html = fs.readFileSync(path.resolve('context_page.html'), 'utf8');
        const dom = new JSDOM(html);
        document = dom.window.document;
    });

    test("should return true for C++ code snippet", () => {
        const cppSnippet = { code: "#include <iostream>\nint main() { return 0; }", language: "lang-cpp" };
        expect(checkCodeIsCpp(cppSnippet)).toBe(true);
    });

    test("should return false for non-C++ code snippet", () => {
        const jsSnippet = { code: "console.log('Hello, world!');", language: "lang-js" };
        expect(checkCodeIsCpp(jsSnippet)).toBe(false);
    });

    test("should return false for empty language", () => {
        const emptyLangSnippet = { code: "#include <iostream>\nint main() { return 0; }", language: "" };
        expect(checkCodeIsCpp(emptyLangSnippet)).toBe(false);
    });

    test("should return false for undefined language", () => {
        const undefinedLangSnippet = { code: "#include <iostream>\nint main() { return 0; }", language: undefined };
        expect(checkCodeIsCpp(undefinedLangSnippet)).toBe(false);
    });

    test("should return false for null language", () => {
        const nullLangSnippet = { code: "#include <iostream>\nint main() { return 0; }", language: null };
        expect(checkCodeIsCpp(nullLangSnippet)).toBe(false);
    });

    test("Should return true for lang-cpp found in context_page", () => {
        const nullLangSnippet = { code: "#include <iostream>\nint main() { return 0; }", language: null };

        const codeSnippets: { code: string; language: string; }[] = [];
        const preElements = document.querySelectorAll('pre');

        preElements.forEach(element => {

            const codeElements = element.childNodes[0];
            if (codeElements) {
                const code = codeElements.textContent ? codeElements.textContent : "";
                const language = element.classList[0] ? element.classList[0] : "";

                if (code && code.length != 0) codeSnippets.push({ code, language });
            }
        });

        expect(checkCodeIsCpp(codeSnippets[0])).toBe(true);
    });

});