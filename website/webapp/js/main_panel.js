let modal = document.querySelector('.modal');
let yesButton = document.getElementById('yes');

document.getElementById('new').addEventListener('click', () => {
    modal.style.display = "flex";
});

document.querySelector('.close').addEventListener('click', () => {
    modal.style.display = "none";
});

document.querySelector('.no').addEventListener('click', () => {
    modal.style.display = "none";
});

yesButton.addEventListener('click', () => {
    // post
    fetch("/reset-project",  {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({})
    }).then((res) => {
        res.json().then(response => {
            if (response.msg === "OK") {
                window.location.reload();
            } else if (response.msg === "FAIL") {
                errorMessage.innerText = "Wystąpił błąd.";
                modalError.style.display = "flex";
            }
        }).catch(err => {
            errorMessage.innerText = "Wystąpił błąd.";
            modalError.style.display = "flex";
        });
    });
});

window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
}
