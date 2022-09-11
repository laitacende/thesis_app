let list = document.getElementsByClassName('list-item');

for (let element of list) {
    element.addEventListener('mouseover', (event) => {
        element.classList.add('border-hover');
    });

    element.addEventListener('mouseout', (event) => {
        element.classList.remove('border-hover');
    });
}