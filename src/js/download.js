import $ from 'zepto';
import imgToURI from 'image-to-data-uri';
import _debug from 'debug';
import {timeout} from './timeout';

const debug = _debug('mwc:download');

export const downloadImage = (url) => {
    return new Promise((resolve, reject) => {
        imgToURI(url, (err, uri) => {
            if (err) reject(err);
            else resolve(uri);
        });
    });
};

export const safeDownloadImage = async (url) => {
    debug('Downloading url:', url);
    try {
        const dataURI = await downloadImage(url);
        debug('Fetched url:', url);
        return dataURI;
    } catch (e) {
        debug('Failed to fetch url')
        return url;
    }
};

export const downloadAsFile = async (text) => {
    var saveLink = document.createElement('a');
    saveLink.download = name;
    saveLink.style.display = 'none';
    document.body.appendChild(saveLink);
    const buffer = new ArrayBuffer(text.length);
    const intArray = new Uint8Array(buffer);
    for (var i = 0; i < text.length; i++) {
        intArray[i] = text.charCodeAt(i);
    }
    const blob = new Blob([buffer], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    saveLink.href = url;
    saveLink.onclick = () =>
        requestAnimationFrame(() =>
            URL.revokeObjectURL(url)
        );
    saveLink.click();
    await timeout(0);
    $(saveLink).remove();
}
