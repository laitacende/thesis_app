let searchButton = document.getElementById('search-cards');
let searchBar = document.getElementById('search-bar-input');
let searchResult = document.getElementById('search-result-simulation');
let list = document.getElementsByClassName('list-item');
let peopleContent = document.querySelector('.people-in-project-list');
let cardContent = document.querySelector('.drag-list-simulation');
let checkFeasibility = document.getElementById('check');
let modalInfo = document.getElementById('modal-info-total');
let buttonInfo = document.getElementById('close-info');
let closeInfo = document.getElementById('close-x-info');
let listInfo = document.querySelector('.task-list');
let skillsList = document.querySelector('.skills-list');

dragula([document.querySelector('.drag-list-simulation'),
    document.querySelector('.people-in-project-list')]);

/**
 * Add listeners to items on the list to highlight on hover.
 */
let updateListeners = () => {
    list = document.getElementsByClassName('list-item');
    for (let element of list) {
        element.addEventListener('mouseover', (event) => {
            element.classList.add('border-hover');
        });

        element.addEventListener('mouseout', (event) => {
            element.classList.remove('border-hover');
        });
    }
};

/**
 * Function that fetches list of people without people already used in container
 * and displays list in HTML.
 *
 * @param name if null, then gets all people, if not, then gets people with name based on input
 */
let fetchListPeople = (name) => {
    // get people already used (ids)
    let peopleUsed = peopleContent.children;
    let peopleIds = [];
    let id;
    for (let element of peopleUsed) {
        id = element.id.split('-');
        id = id[0];
        peopleIds.push(id);
    }

    let link = '';
    if (name !== null) {
        link += "?search=" + encodeURIComponent(searchBar.value.replace(' ', '_'));
    }

    // fetch people list and check if element is already used in another container
    fetch('/people-list' + link).then((res) => {
        let htmlList = '';
        res.json().then(response => {
            if (response.msg && response.msg === "FAIL") {
                errorMessage.innerText = "Wystąpił błąd.";
                modalError.style.display = "flex";
            } else {
                response.forEach(person => {
                    if (!peopleIds.includes(String(person.id))) {
                        htmlList += '<div class="profile-item list-item" id="' + person.id + '-left">' +
                            '                           <img src="../img/icons/' + person.profile_picture + '" />' +
                            '                           <h5>' + person.username.replace('_', " ") + '</h5>' +
                            '                       </div>';
                    }
                });
                cardContent.innerHTML = htmlList;
                // add listeners to elements of list
                updateListeners();
                updateListenersPeople();
            }
        }).catch(err => {
            errorMessage.innerText = "Wystąpił błąd.";
            modalError.style.display = "flex";
        });
    }).catch(err => {
        errorMessage.innerText = "Wystąpił błąd.";
        modalError.style.display = "flex";
    });
};

/**
 * Fetch list of people's names based on user's input.
 */
let fetchListPeopleSearch = () => {
    // get people already used (ids)
    let peopleUsed = peopleContent.children;
    let peopleIds = [];
    let id;
    for (let element of peopleUsed) {
        id = element.id.split('-');
        id = id[0];
        peopleIds.push(id);
    }

    // fetch people list and check if element is already used in another container
    fetch('/people-search?username=' + encodeURIComponent(searchBar.value.replace(' ', '_'))).then((res) => {
        let htmlList = '<ul class="search-result-list">';
        res.json().then(response => {
            if (response.msg && response.msg === "FAIL") {
                errorMessage.innerText = "Wystąpił błąd.";
                modalError.style.display = "flex";
            } else {
                response.forEach(person => {
                    if (!peopleIds.includes(String(person.id))) {
                        htmlList += '<li class="search-result-list-element"> <a>' + person.username.replace("_", " ") + '</a></li>';
                    }
                });
                htmlList += '</ul>';
                searchResult.innerHTML = htmlList;
                // add listeners to elements of list
                let list = document.getElementsByClassName('search-result-list-element');
                for (let element of list) {
                    element.addEventListener('click', () => {
                        searchBar.value = element.innerHTML.slice(4, -4);
                    });
                }
            }
        }).catch(err => {
            errorMessage.innerText = "Wystąpił błąd.";
            modalError.style.display = "flex";
        });
    }).catch(err => {
        errorMessage.innerText = "Wystąpił błąd.";
        modalError.style.display = "flex";
    });
};

updateListeners();

searchBar.addEventListener('keyup', () => {
    fetchListPeopleSearch();
});

searchBar.addEventListener('click', () => {
    fetchListPeopleSearch();
});

searchButton.addEventListener('click', () => {
    fetchListPeople(searchBar.value.replace(" ", "_"));
});

window.onclick = (event) => {
    if (event.target !== document.querySelector('#search-result-simulation')) {
        searchResult.innerHTML = "";
    }

    if (event.target === modalInfo) {
        modalInfo.style.display = "none";
    }
};

closeInfo.addEventListener('click', () => {
    modalInfo.style.display = "none";
});

buttonInfo.addEventListener('click', () => {
    modalInfo.style.display = "none";
});


checkFeasibility.addEventListener('click', () => {
    // construct list of people ids
    let peopleUsed = peopleContent.children;
    let peopleIds = [];
    let id;
    for (let element of peopleUsed) {
        id = element.id.split('-');
        id = id[0];
        peopleIds.push(id);
    }

    // post to server
    fetch("/check-feasibility",  {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            people: peopleIds,
        })
    }).then((res) => {
        res.json().then(response => {
            console.log(response);
            if (response.msg && response.msg === "FAIL") {
                console.log("lll")
                errorMessage.innerText = "Wystąpił błąd.";
                modalError.style.display = "flex";
            } else {
                // display info if feasible, if not give list of tasks and suggest
                // adding new people with preferable skills
                let htmlList = '';
                for (let task of response.list) {
                    htmlList += ' <li>#' + task.id + " " + task.name + '</li>';
                }

                listInfo.innerHTML = htmlList;

                htmlList = "";
                for (let skill of response.skills) {
                    htmlList += '<li>' + skill + '</li>';
                }
                skillsList.innerHTML = htmlList;
                modalInfo.style.display = "flex";
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

document.querySelector('.back-icon').addEventListener('click', () => {
    window.location.replace("https://localhost:4000/home");
});

let peopleContainer = document.querySelector('.people-in-project-list');
let peopleAssets = document.querySelector('.drag-list-simulation');

/**
 * Function that adds listeners to list items to add and delete them from container on click.
 */
// add to containers on click
let updateListenersPeople = () => {
    let listPeople = document.getElementsByClassName('list-item');
    for (let element of listPeople) {
        element.addEventListener('click', (event) => {
            // append to list if parent is assets
            if (element.parentNode === peopleAssets) {
                peopleContainer.appendChild(element);
            } else if (element.parentNode === peopleContainer) { // get it back to assets container
                peopleAssets.appendChild(element);
            }
        });
    }
};

updateListenersPeople();