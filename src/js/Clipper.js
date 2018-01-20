import $ from 'zepto';
import _debug from 'debug';
import StyletronCore from 'styletron-core';
import resolveURL from 'resolve-url';
import selectorQuery from 'selector-query';

import {timeout} from './timeout';
import {safeDownloadImage, downloadAsFile} from './download';
import {extractURL} from './css';

const debug = _debug('mwc:Clipper');

const IGNORED_TAG_TYPES = [
    'link',
    'style',
    'script',
    'meta',
    'object',
    'frame',
    'iframe'
];

export const Clipper = {

    async clip(target) {
        if (target.length === 0) {
            return;
        }
        this.styles = new StyletronCore();
        const selector = selectorQuery(target[0]);
        const clone = await this.visitNode(target);
        await downloadAsFile(this.buildFinalHTML(clone, selector));
    },

    buildFinalHTML(clone, selector) {
        return `
<html>
  <head>
    <style id="reinoult-clipper-aggregate-styles">
        ${this.buildFinalCSS()}
    </style>
  </head>
  <body>
    ${clone.html()}
    <div style="color: silver; border-top: 1px solid silver; padding: 10px 0; clear: both; margin-top: 10px; font-size: 12px; font-family: arial;">
    Captured from <strong><a href="${location.href}">${location.href}</a></strong> at <strong>${new Date()}</strong> using
    <a href="https://chrome.google.com/webstore/detail/minimal-web-clipper/dbhjdoppiocfognmfiaoeipkpdljefni"><strong style="color: rgb(144, 67, 153)">Minimal Web Clipper</strong></a>
    </div>
    <!-- [MWC:Meta]
Selector: ${selector}
    -->
  </body>
</html>
`;
    },

    injectCSSDeclaration(prop, val) {
        const styClass = this.styles.injectDeclaration({ prop, val });
        return `mwc-${styClass}`;
    },

    buildFinalCSS() {
        debug('Consolidating styles');
        let cssText = '';
        for (const key in this.styles.cache) {
            if (key === 'media' || key === 'pseudo') {
                continue;
            }
            const className = this.styles.cache[key];
            if ((typeof className) !== 'string') continue;
            cssText += `.mwc-${className} { ${key} }\n`;
        }
        return cssText;
    },

    async visitNode($el) {
        if ($el.length === 0) return;
        if ($el.hasClass('ios-overlay')) return;
        const el = $el[0];
        debug('Visiting Node', el);
        const tag = el.tagName.toLowerCase();
        if (IGNORED_TAG_TYPES.indexOf(tag) >= 0) return null;
        const $clone = $(document.createElement(tag));
        $.each($el[0].attributes, (index, attribute) => {
            if (attribute.name === 'class') {
                return;
            } else if (attribute.name === 'src' || attribute.name === 'href') {
                $clone.attr(attribute.name, resolveURL(attribute.value))
            } else {
                $clone.attr(attribute.name, attribute.value);
            }
        });
        if (tag === 'img') {
            $clone.attr('src', await safeDownloadImage($clone.attr('src')));
        }
        const style = window.getComputedStyle(el);
        const decl = {};
        for (let i = style.length; i--;) {
            const prop = style[i];
            let val = style.getPropertyValue(prop);
            if (prop === 'background-image') {
                const url = extractURL(val);
                if (url) {
                    const dataURI = await safeDownloadImage(resolveURL(url));
                    val = `url("${dataURI}")`;
                }
            }
            $clone.addClass(this.injectCSSDeclaration(prop, val));
        }

        // This is not very useful until we actually download fonts etc.
        //
        // const pseudoClasses = [
        //     ':before',
        //     ':after'
        // ];
        // if (tag === 'a') {
        //     pseudoClasses.push(':visited', ":hover", ":focus", ":active")
        // }
        // for (const pseudo of pseudoClasses) {
        //     const style = window.getComputedStyle(el, pseudo);
        //     const decl = {};
        //     for (let i = style.length; i--;) {
        //         const prop = style[i];
        //         const val = style.getPropertyValue(prop);
        //         const styClass = this.styles.injectDeclaration({ prop, val, pseudo });
        //         $clone.addClass(styClass);
        //     }
        // }

        const children = $el.contents();
        for (let idx = 0 ; idx < children.length ; idx++) {
            // Keep the browser responsive
            if (idx % 10 === 0) {
                await timeout(0);
            }
            const el = children[idx];
            if (el.nodeType !== 1) {
                $clone.append($(el).clone());
                continue;
            }
            const clonedChild = await this.visitNode($(el));
            if (clonedChild) {
                $clone.append(clonedChild);
            }
        }
        return $clone;
    }
};
