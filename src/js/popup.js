import "../css/popup.css";

const initCapture = () => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "clip.init"});
        setTimeout(() => {
            window.close();
        }, 100);
    });
};

document.getElementById('mwc-action-init-capture').addEventListener('click', initCapture);
