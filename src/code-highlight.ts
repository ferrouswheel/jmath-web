import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import c from 'highlight.js/lib/languages/c';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('c', c);
const languages: Record<string, string> = {
  js: 'javascript',
  python: 'python',
  c: 'c',
};

export function highlightCode(source: string, language: string) {
  if (!languages[language])
    throw new Error(`Unknown code language: ${language}`);
  return hljs.highlight(source, {
    language: languages[language],
    ignoreIllegals: true,
  }).value;
}

export function updateCode(
  element: HTMLElement,
  source: string,
  language: string,
) {
  if (
    element.textContent === source &&
    element.dataset.codeLanguage === language
  )
    return;
  element.innerHTML = highlightCode(source, language);
  element.dataset.codeLanguage = language;
}
