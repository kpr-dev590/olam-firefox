// Create the menu item
browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.create({
        id: "olam-context-popup",
        title: "🔍 Show Olam meaning for '%s'",
        contexts: ["selection"]
    });
});

// Listen for the click
browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "olam-context-popup") {
        let word = info.selectionText.trim().toLowerCase().replace(/\s+/g, '+');
        const url = `https://olam.in/dictionary/english/malayalam/${word}`;
        
        // Send a message to the content script in the active tab
        browser.tabs.sendMessage(tab.id, { 
            action: "OPEN_OLAM_POPUP", 
            url: url 
        });
    }
});

// Alarm logic for cache
browser.alarms.create("refreshCache", { periodInMinutes: 30 });
browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "refreshCache") {
        fetch("https://olam.in");
    }
});