export = linkifyElement;
/**
 * Recursively traverse the given DOM node, find all links in the text and
 * convert them to anchor tags.
 *
 * @param {HTMLElement} element A DOM node to linkify
 * @param {Object} opts linkify options
 * @param {Document} [doc] (optional) window.document implementation, if differs from global
 * @returns {HTMLElement}
 */
declare function linkifyElement(element: HTMLElement, opts: any, ...args: any[]): HTMLElement;
declare namespace linkifyElement {
    export { linkifyElementHelper as helper };
    export function normalize(opts: any): import("linkifyjs/lib/linkify").Options;
}
/**
 * Requires document.createElement
 * @param {HTMLElement} element
 * @param {Object} opts
 * @param {Document} doc
 * @returns {HTMLElement}
 */
declare function linkifyElementHelper(element: HTMLElement, opts: any, doc: Document): HTMLElement;
