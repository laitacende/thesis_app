let list = document.getElementsByClassName('list-item');
let peopleButton = document.getElementById('people-button')
let taskButton = document.getElementById('task-button');
let cardContent = document.querySelector('.drag-list-assigment');
let peopleContent = document.querySelector('.assigment-left');
let tasksContent = document.querySelector('.assigment-right');
let searchButton = document.getElementById('search-cards');
let searchBar = document.getElementById('search-bar-input');
let searchResult = document.getElementById('search-result');
let generateAssign = document.getElementById('generate');
let modalTxt = document.getElementById('modal-text');
let closeTxt = document.getElementById('close-x-text');
let closeButtonTxt = document.getElementById('close-button-txt');
let messageTxt = document.getElementById('message-txt');
let modalConfirm = document.getElementById('modal-confirm');

let lines = [];

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


// add parameter to have one function if filter is applied
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
                updateListenersTasks();
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

let fetchListTasks = (name) => {
    // get tasks already used (ids)
    let tasksUsed = tasksContent.children;
    let tasksIds = [];
    let id;
    for (let element of tasksUsed) {
        id = element.id.split('-');
        id = id[0];
        tasksIds.push(id);
    }

    let link = '';
    if (name !== null) {
        link += "?search=" + encodeURIComponent(searchBar.value.replace(' ', '_'));
    }

    // fetch people list and check if element is already used in another container
    fetch('/tasks-list' + link).then((res) => {
        let htmlList = '';
        res.json().then(response => {
            if (response.msg && response.msg === "FAIL") {
                errorMessage.innerText = "Wystąpił błąd.";
                modalError.style.display = "flex";
            } else {
                response.forEach(task => {
                    if (task.status !== "done" && !tasksIds.includes(String(task.id))) {
                        htmlList += '<div class="task-item list-item" id="' + task.id + '-right">' +
                            '                   <div class="circle-number">' +
                            '                       <div class="number">' +
                            '                           #' + task.id +
                            '                       </div>' +
                            '                   </div>' +
                            '                   <h5>' + task.name + '</h5>' +
                            '               </div>';
                    }
                });
                cardContent.innerHTML = htmlList;
                // add listeners to elements of list
                updateListeners();
                updateListenersPeople();
                updateListenersTasks();
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

let fetchListTasksSearch = () => {
    // get tasks already used (ids)
    let tasksUsed = tasksContent.children;
    let tasksIds = [];
    let id;
    for (let element of tasksUsed) {
        id = element.id.split('-');
        id = id[0];
        tasksIds.push(id);
    }

    // fetch people list and check if element is already used in another container
    fetch('/tasks-list?search=' + encodeURIComponent(searchBar.value)).then((res) => {
        let htmlList = '<ul class="search-result-list">';
        res.json().then(response => {
            if (response.msg && response.msg === "FAIL") {
                errorMessage.innerText = "Wystąpił błąd.";
                modalError.style.display = "flex";
            } else {
                response.forEach(task => {
                    if (task.status !== "done" && !tasksIds.includes(String(task.id))) {
                        htmlList += '<li class="search-result-list-element"> <a>#' + task.id + " " + task.name + '</a></li>';
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
    });
};

updateListeners();

textFit(document.getElementsByClassName('number'));

dragula([document.querySelector('.drag-list-assigment'),
    document.querySelector('.assigment-left'),
    document.querySelector('.assigment-right')], {
    accepts:
        function (el, target, source, sibling) {
            if (target.classList.contains('assigment-left') &&  el.classList.contains('task-item')) {
                return false;
            }

            if (target.classList.contains('assigment-right') &&  el.classList.contains('profile-item')) {
                return false;
            }

            return true;
        }
}).on('dragend', (el) => {
    // remove 'is-moving' class from element after dragging has stopped
    lines.forEach(line => {
       line.position();
    });
});

peopleButton.addEventListener('click', () => {
   peopleButton.classList.add('active-card');
   taskButton.classList.remove('active-card');
   searchBar.value = "";

   fetchListPeople(null);
});


taskButton.addEventListener('click', () => {
    taskButton.classList.add('active-card');
    peopleButton.classList.remove('active-card');
    searchBar.value = "";

    fetchListTasks(null);
});

searchBar.addEventListener('keyup', () => {
    // check active card
    let active = document.querySelector('.active-card');
    if (active === peopleButton) {
        fetchListPeopleSearch();
    } else if (active === taskButton) {
        fetchListTasksSearch();
    }
});

searchBar.addEventListener('click', () => {
    let active = document.querySelector('.active-card');
    if (active === peopleButton) {
        fetchListPeopleSearch();
    } else if (active === taskButton) {
        fetchListTasksSearch();
    }
});

searchButton.addEventListener('click', () => {
    // get list of people or tasks with filter
    let active = document.querySelector('.active-card');
    if (active === peopleButton) {
        fetchListPeople(searchBar.value.replace(" ", "_"));
    } else if (active === taskButton) {
        fetchListTasks(searchBar.value);
    }
});

document.getElementById('text-version').addEventListener('click', () => {
    modalTxt.style.display = "flex";
});

closeTxt.addEventListener('click', () => {
   modalTxt.style.display = "none";
});

closeButtonTxt.addEventListener('click', () => {
   modalTxt.style.display = "none";
});

document.getElementById('accept-matching').addEventListener('click', () => {
    // confirm
    modalConfirm.style.display = "flex";
});

document.getElementById('close-delete').addEventListener('click', () => {
    modalConfirm.style.display = "none";
});

document.getElementById('cancel-delete').addEventListener('click', () => {
    modalConfirm.style.display = 'none';
});

document.getElementById('confirm-delete').addEventListener('click', () => {
    // update assigment to people in database
    let matching = [];
    if (lines.length > 0) {
        lines.forEach(line => {
            let person = line.start.id.split('-')[0];
            let task = line.end.id.split('-')[0];
            matching.push({source: person, destination: task});
        });

        fetch("/update-assignment", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                matching: matching
            })
        }).then((res) => {
            res.json().then(response => {
                if (response.msg === "FAIL") {
                    errorMessage.innerText = "Wystąpił błąd.";
                    modalError.style.display = "flex";
                } else if (response.msg === "OK") {
                    errorMessage.innerText = "Zadania zostały przypisane.";
                    modalError.style.display = "flex";
                    modalConfirm.style.display = "none";
                }
            }).catch(err => {
                errorMessage.innerText = "Wystąpił błąd.";
                modalError.style.display = "flex";
            });
        }).catch(err => {
            errorMessage.innerText = "Wystąpił błąd.";
            modalError.style.display = "flex";
        });
    } else {
        errorMessage.innerText = "Przydział jest pusty, nie można go zaakceptować.";
        modalError.style.display = "flex";
    }
});

window.onclick = (event) => {
    if (event.target !== document.querySelector('#search-result')) {
        searchResult.innerHTML = "";
    }

    if (event.target === modalTxt) {
        modalTxt.style.display = "none";
    }

    if (event.target === modalConfirm) {
        modalConfirm.style.display = "none";
    }
};

generateAssign.addEventListener('click', () => {
    // delete all remaining lines
    lines.forEach(line => {
        line.remove();
    });

    lines = [];

   // construct list of people ids
    let peopleUsed = peopleContent.children;
    let peopleIds = [];
    let id;
    for (let element of peopleUsed) {
        id = element.id.split('-');
        id = id[0];
        peopleIds.push(id);
    }

    // construct list of tasks ids
    let tasksUsed = tasksContent.children;
    let tasksIds = [];
    for (let element of tasksUsed) {
        id = element.id.split('-');
        id = id[0];
        tasksIds.push(id);
    }

    // post to server
    fetch("/generate-assigment",  {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            tasks: tasksIds,
            people: peopleIds,
        })
    }).then((res) => {
        res.json().then(response => {
            messageTxt.innerHTML = "";
            if (response.msg && response.msg === "FAIL") {
                errorMessage.innerText = "Wystąpił błąd.";
                modalError.style.display = "flex";
            } else {
                let matching = response.result;
                let textRepr = "";
                matching.forEach(match => {
                    textRepr = "";
                    let person = document.getElementById(match.source + '-left');
                    let task = document.getElementById(match.destination + '-right');
                    messageTxt.innerHTML += '<br>';
                    textRepr += person.children[1].innerHTML;
                    textRepr += "<span class='arrow'>   &rarr;   </span>";
                    // get task number and name
                    textRepr += task.children[0].children[0].innerHTML + " " + task.children[1].innerHTML;
                    messageTxt.innerHTML += textRepr;
                    lines.push(new LeaderLine(
                        person,
                        task,
                        {color: '#C7C7C7', size: 3, path: 'straight', endPlug: 'behind'}
                    ));
                });
                lines.forEach(line => {
                    console.log(line.start, " ", line.end)
                })
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

let peopleGraph = document.querySelector(".assigment-left");
let tasksGraph = document.querySelector(".assigment-right");

// add to containers on click
let updateListenersPeople = () => {
    //if (window.innerWidth <= 900) {
    let listPeople = document.getElementsByClassName('profile-item');
    for (let element of listPeople) {
        element.addEventListener('click', (event) => {
            let active = document.querySelector('.active-card');
            // append to list if parent is assets
            if (element.parentNode === cardContent) {
                peopleGraph.appendChild(element);
            } else if (active === peopleButton && element.parentNode === peopleGraph) { // get it back to assets container
                cardContent.appendChild(element);
            } else if (active === taskButton && element.parentNode === peopleGraph) { // just discard
                element.remove();
            }
        });
    }
    //}
};

let updateListenersTasks = () => {
    let listTasks = document.getElementsByClassName('task-item');
    for (let element of listTasks) {
        element.addEventListener('click', (event) => {
            let active = document.querySelector('.active-card');
            // append to list if parent is assets
            if (element.parentNode === cardContent) {
                tasksGraph.appendChild(element);
            } else if (active === taskButton && element.parentNode === tasksGraph) { // get it back to assets container
                cardContent.appendChild(element);
            } else if (active === peopleButton && element.parentNode === tasksGraph) { // just discard
                element.remove();
            }
        });
    }
};

updateListenersPeople();
updateListenersTasks();

let changeViews = document.getElementById('swap');
let assetsBox = document.querySelector('.assets-box');
let graphContainer = document.querySelector('.drag-container-assigment-main');

changeViews.addEventListener('click', () => {
   if (changeViews.style.display !== "none") {
       if (assetsBox.classList.contains('not-visible')) {
           assetsBox.classList.remove('not-visible');
           graphContainer.classList.add('not-visible');
       } else if (graphContainer.classList.contains('not-visible')) {
           assetsBox.classList.add('not-visible');
           graphContainer.classList.remove('not-visible');
       }
   }
});