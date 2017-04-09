/* User-Agent spoofing */
chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details) {
        for (var i = 0; i < details.requestHeaders.length; i++ ) {
            if (details.requestHeaders[i].name === 'User-Agent') {
                details.requestHeaders[i].value = "PreciouStatusLovedOnes/1.07.03 (Android; 5.0; SM-N900V)";
                break;
            }
        }
        return {requestHeaders: details.requestHeaders};
    },
    {urls: ["<all_urls>"]},
    ["blocking", "requestHeaders"]);

function getToken (username: string, password: string, callback: (s: string) => void) : any {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            var jsonData = JSON.parse(xhr.responseText);

            callback(jsonData["data"]["authentication_token"]);
        }

        return false;
    }

    xhr.open("GET", "https://app.precioustatus.com/api/v1/loved_one.json");
    xhr.setRequestHeader("Authorization", `Basic ${btoa(username + ":" + password)}`);
    xhr.send();
}

function getResidents (token: string) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            var jsonData = JSON.parse(xhr.responseText);

            var resident = document.getElementById("resident");
            resident.textContent = jsonData["data"][0]["first_name"];
        }
    };

    xhr.open("GET", "https://app.precioustatus.com/api/v1/residents.json");
    xhr.setRequestHeader("Authorization", `Basic ${btoa(token + ":")}`);
    xhr.send();
}

function main () {
    getToken("username", "password", getResidents); 
}

document.addEventListener('DOMContentLoaded', main);
