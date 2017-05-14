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

            let link: HTMLElement, markRead: HTMLElement;
            let listItem: HTMLElement, residentList: HTMLElement;
            for (let resident of residents) {
                // Create resident link
                link = document.createElement("a");
                link.setAttribute("id", `${resident["id"]}:${token}:${resident["unread_updates_count"]}`);
                link.setAttribute("href", "#");
                link.onclick = getUpdates;
                link.innerHTML = `${resident["first_name"]} (${resident["unread_updates_count"]})`;

                // Create mark read button
                markRead = document.createElement("a");
                markRead.setAttribute("id", `markRead:${resident["id"]}:${token}`);
                markRead.setAttribute("href", "#");
                markRead.onclick = updateUnreadCount;
                markRead.innerHTML = "Mark all read";

                listItem = document.createElement("li");
                listItem.appendChild(link);
                listItem.appendChild(markRead);

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
    let [residentId, token, unreadCount] = target.id.split(":");

    let xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            let updates = JSON.parse(xhr.responseText)["data"];

            let row;
            let updateList = document.createElement("ul");
            updates.forEach(function (update: any, index: number) {
                row = document.createElement("li");
                row.className = "update";
                if (index < parseInt(unreadCount)) {
                    row.className += " unread";
                } else {
                    row.className += " read";
                }
                row.innerHTML = `<span class="occurred_at">${new Date(update["occurred_at"]).toLocaleString()}</span>\
                                 <span class="formatted_type">${update["formatted_type"]}</span>\
                                 <span class="description">${update["description"]}</span>\
                                 <span class="has_love_it"><a href="#" id="${update["id"]}">${update["has_love_it"]}</a></span>`;
                updateList.appendChild(row);
            });
            target.parentElement.appendChild(updateList);
        }
    }

    xhr.open("GET", `${baseUrl}/residents/${residentId}/updates.json?page=1&order_by=occurred_at`);
    xhr.setRequestHeader("Authorization", `Basic ${btoa(token + ":")}`);
    xhr.send();

    return false;
}

function updateUnreadCount (e: Event) : void {
    let target = (<HTMLElement>e.target);
    let [residentId, token] = target.id.split(":").splice(1, 2);

    let xhr = new XMLHttpRequest();

    xhr.open("PUT", `${baseUrl}/residents/${residentId}.json`);
    xhr.setRequestHeader("Authorization", `Basic ${btoa(token + ":")}`);
    xhr.setRequestHeader("Content-Type", "application/json");

    let now = (new Date()).toISOString().split(".")[0] + "Z";
    let data = JSON.stringify({"updates_last_read_at": now});
    xhr.send(data);
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
