// This runs when the browser starts or the extension is installed
browser.runtime.onInstalled.addListener(() => {
    console.log("Pre-fetching Olam for cache...");
    // We fetch the main page in the background so the images/scripts are cached
    fetch("https://olam.in").catch(err => console.log("Pre-fetch failed, offline?"));
});

// Optional: Periodically refresh the cache every 30 minutes
browser.alarms.create("refreshCache", { periodInMinutes: 30 });
browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "refreshCache") {
        fetch("https://olam.in");
    }
});