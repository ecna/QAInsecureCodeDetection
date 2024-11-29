import { getCodeSnippets } from '../codeCollectors';
import path from 'path';
import { JSDOM } from 'jsdom';
import fs from 'fs';

describe("getCodeSnippets", () => {

    beforeAll(() => {
        const html = fs.readFileSync(path.resolve('context_page.html'), 'utf8');
        const dom = new JSDOM(html);
        global.document = dom.window.document
    });

  test('should return the expected code snippets', () => {
    let expectedResult = "#include <cstdlib>\nusing namespace std;\n\nconst int N = 2;\n\nvoid init_matrix(int (*matrix)[N]) \n{\nfor (int i = 0; i < N; ++i)\n    for (int j = 0; j < N; ++j)\n        matrix[i][j] = 1;\n}\n\nint main() \n{\nint *x = (int*)malloc(N*N*sizeof(int));\ninit_matrix( (int (*)[N]) x );\nreturn 0;\n}\n"

  const result = getCodeSnippets();

	expect(result[0].code).toEqual(expectedResult);
  });

  test('should return the expected number of code snippets', () => {
  const result = getCodeSnippets();

	expect(result.length).toEqual(9);
  });


  test('should return one code snippet less', () => {


    const preElements = document.querySelectorAll('pre');
    var htmlElement = preElements[0].childNodes[0] as HTMLElement;
    htmlElement.innerHTML = "";

    const result = getCodeSnippets();
  
    expect(result.length).toEqual(8);
    });

  test('should return an empty array', () => {

    const dom = new JSDOM("");
    global.document = dom.window.document
    const result = getCodeSnippets();
  
    expect(result.length).toEqual(0);
    });

});