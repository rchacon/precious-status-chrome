declare var chrome: any;

function saveOptions () : void {
    let username = <HTMLInputElement>document.getElementById("username");
    let password = <HTMLInputElement>document.getElementById("password");

    chrome.storage.local.set({
        username: username.value,
        password: password.value
    }, function () {
        // Update status to let user know options were saved.
        var status = document.getElementById("status");
        status.textContent = "Options saved.";
        setTimeout(function () : void {
            status.textContent = "";
        }, 750);
    })
}

// Restore options from chrome.storage
function restoreOptions() {
    chrome.storage.local.get({
        username: "",
        password: ""
    }, function(items: any) : void {
        let username = <HTMLInputElement>document.getElementById("username");
        let password = <HTMLInputElement>document.getElementById("password");

        username.value = items.username;
        password.value = items.password;
    });
}


document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);
