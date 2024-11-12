export function getCodeSnippets() {

    const codeSnippets: { code: string; language: string; }[] = [];
    const preElements = document.querySelectorAll('pre');
  
    preElements.forEach(element => {
    
      const codeElements = element.childNodes[0];
      if(codeElements){
      const code = codeElements.textContent ? codeElements.textContent : "";
      const language = element.classList[0] ? element.classList[0] : "";
  
      if(code && code.length != 0)codeSnippets.push({ code, language });
      }
    });
  
    return codeSnippets;
  }