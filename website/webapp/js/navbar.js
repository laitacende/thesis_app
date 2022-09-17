let back = document.getElementsByClassName('back-icon');
let logout = document.getElementById('logout');
let modalError = document.getElementById('modal-error');
let closeButtonError = document.getElementById('close-button');
let closeError = document.getElementById('close-x');
let errorMessage = document.getElementById('message-error');

/**
 * Function that deleted all cookies.
 */
deleteAllCookies = () => {
    let cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        let eqPos = cookie.indexOf("=");
        let name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}

for (let i of back) {
    i.addEventListener('click', () => {
        history.back();
    });
}

logout.addEventListener('click', () => {
    fetch("/logout",  {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: 'DELETE',
    }).then((res) => {
        res.json().then(response => {
            if (response.msg === "OK") {
                deleteAllCookies();
                // redirect to new page with success
                window.location.href = "https://localhost:4000/";
            } else if (response.msg === "FAIL") {
                let msg = "";
                for (error of response.errors) {
                    msg += error + '<br>';
                }
                errorField.innerHTML = msg;
            }
        }).catch(err => {
            errorMessage.innerText = "Wystąpił błąd.";
            modalError.style.display = "flex";
        });
    }).catch(err => {
        errorMessage.innerText = "Wystąpił błąd.";
        modalError.style.display = "flex";
    });
});

closeButtonError.addEventListener('click', () => {
    modalError.style.display = "none";
});

closeError.addEventListener('click', () => {
    modalError.style.display = "none";
});

window.addEventListener('click', function(event) {
    if (event.target === modalError) {
        modalError.style.display = "none";
    }
});