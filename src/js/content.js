import Controller from './Controller';

chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        if (request.action === 'clip.init') {
            Controller.activate();
        }
    }
);
