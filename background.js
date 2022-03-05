chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (
        changeInfo.status === "complete" &&
        tab.url.indexOf("trello.com/") > -1
    ) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['collapse.js']
        });
    }
});
