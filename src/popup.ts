declare var chrome: any;

const baseUrl = "https://app.precioustatus.com/api/v1";

/* User-Agent spoofing */
chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details: any) : Object {
        for (let header of details.requestHeaders) {
            if (header.name === 'User-Agent') {
                header.value = "PreciouStatusLovedOnes/1.07.03 (Android; 5.0; SM-N900V)";
                break;
            }
        }
        return {requestHeaders: details.requestHeaders};
    },
    {urls: ["<all_urls>"]},
    ["blocking", "requestHeaders"]);

function getToken (username: string, password: string, callback: (s: string) => void) : void {
    let xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            let jsonData = JSON.parse(xhr.responseText);

            callback(jsonData["data"]["authentication_token"]);
        }
    }

    xhr.open("GET", `${baseUrl}/loved_one.json`);
    xhr.setRequestHeader("Authorization", `Basic ${btoa(username + ":" + password)}`);
    xhr.send();
}

function getResidents (token: string) : void {
    let xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            let residents = JSON.parse(xhr.responseText)["data"];

            let link, listItem, residentList;
            for (let resident of residents) {
                link = document.createElement("a");
                link.setAttribute("id", resident["id"] + ":" + token);
                link.setAttribute("href", "#");
                link.onclick = getUpdates;
                link.innerHTML = `${resident["first_name"]} (${resident["unread_updates_count"]})`;

                listItem = document.createElement("li");
                listItem.appendChild(link);

                residentList = document.getElementById("resident-list");
                residentList.appendChild(listItem);
            }
        }
    };

    xhr.open("GET", `${baseUrl}/residents.json`);
    xhr.setRequestHeader("Authorization", `Basic ${btoa(token + ":")}`);
    xhr.send();
}

function getUpdates (e: Event) : boolean {
    let target = (<HTMLElement>e.target);
    let [residentId, token] = target.id.split(":");

    let xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            let updates = JSON.parse(xhr.responseText)["data"];

            let row;
            let updateList = document.createElement("ul");
            for (let update of updates) {
                row = document.createElement("li");
                row.className = "update";
                row.innerHTML = `<span class="occurred_at">${new Date(update["occurred_at"]).toLocaleString()}</span>\
                                 <span class="formatted_type">${update["formatted_type"]}</span>\
                                 <span class="description">${update["description"]}</span>\
                                 <span class="has_love_it"><a href="#" id="${update["id"]}">${update["has_love_it"]}</a></span>`;
                updateList.appendChild(row);
            }
            target.parentElement.appendChild(updateList);
        }
    }

    xhr.open("GET", `${baseUrl}/residents/${residentId}/updates.json?page=1&order_by=occurred_at`);
    xhr.setRequestHeader("Authorization", `Basic ${btoa(token + ":")}`);
    xhr.send();

    return false;
}

function main () : void {
    chrome.storage.local.get({
        username: "",
        password: ""
    }, function(items: any) : void {
        if (items.username == "" || items.password === "") {
            let error = <HTMLDivElement>document.getElementById("error");
            error.textContent = "You must enter your username and password on options page.";
        } else {
            getToken(items.username, items.password, getResidents);
        }
    });
}

document.addEventListener('DOMContentLoaded', main);
