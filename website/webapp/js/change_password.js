let modalInfo = document.getElementById('modal-info');
let closeButtonInfo = document.getElementById('close-button');
let closeInfo = document.getElementById('close-x');

if (firstTime) {
    modalInfo.style.display = "flex";
}

if (modalInfo) {

    closeButtonInfo.addEventListener('click', () => {
        modalInfo.style.display = "none";
    });

    closeInfo.addEventListener('click', () => {
        modalInfo.style.display = "none";
    });

    window.onclick = function(event) {
        if (event.target === modalInfo) {
            modalInfo.style.display = "none";
        }
    }
}
