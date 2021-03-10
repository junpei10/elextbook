const head = document.head;

export function insertStyleElement(style: string): void {
  head.insertAdjacentHTML('beforeend', '<style>' + style + '</style>');
}
