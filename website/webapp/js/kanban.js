let toDo = document.getElementById('todo');
let inProgress = document.getElementById('inprogress');
let done = document.getElementById('done');
let modalAddTask = document.getElementById('modal-task-edit');
let addTask = document.querySelector('.fob');
let closeModal = document.getElementById('close');
let searchResultAssignee = document.getElementById('search-result-assignee');
let inputAssignee = document.getElementById('task-assignee');
let modalNewSkill = document.getElementById('modal-skills-new');
let searchBar = document.getElementById('search-bar-skills');
let searchResult = document.getElementById('search-result');
let addNewSkill = document.getElementById('search-button-new');
let deleteList = document.getElementsByClassName('delete-skill');
let skillsContentEdit = document.getElementById('skills-modal-edit');
let save = document.getElementById('search-button');
let no = document.getElementById('cancel');
let errorField = document.getElementById('error-message');


/**
 * Fetch list of people's names based on user's input.
 */
let fetchSearchPeople = () => {
    fetch('/people-search?username=' + inputAssignee.value.replace(" ", "_")).then((res) => {
        let htmlList = '<ul class="search-result-list">';
        res.json().then(response => {
            if (response.msg && response.msg === "FAIL") {
                errorMessage.innerText = "Wystąpił błąd.";
                modalError.style.display = "flex";
            } else {
                response.forEach(person => {
                    htmlList += '<li class="search-result-list-element"> <a>' + person.username.replace("_", " ") + '</a></li>';
                });
                htmlList += '</ul>';
                searchResultAssignee.innerHTML = htmlList;
                // add listeners to elements of list
                let list = document.getElementsByClassName('search-result-list-element');
                for (let element of list) {
                    element.addEventListener('click', () => {
                        inputAssignee.value = element.innerHTML.slice(4, -4);
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

/**
 * Fetch list of skills' names based on user's input.
 */
let fetchSearchSkills = () => {
    fetch('/skills-search?search=' + encodeURIComponent(searchBar.value)).then((res) => {
        let htmlList = '<ul class="search-result-list">';
        res.json().then(response => {
            if (response.msg && response.msg === "FAIL") {
                errorMessage.innerText = "Wystąpił błąd.";
                modalError.style.display = "flex";
            } else {
                response.forEach(skill => {
                    htmlList += '<li class="search-result-list-element"> <a>' + skill.name + '</a></li>'; // TODO escpae this - odpowiedz serwera, chya nie trzeba
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

/**
 * Function that adds listeners to delete icons to remove skill element from HTML.
 */
let updateListeners = () => {
    for (let element of deleteList) {
        element.addEventListener('click', (event) => {
            // get target index
            let tmp = event.target.id.split('-');
            document.getElementById('skill-element-' + tmp[0]).remove();
        });
    }
};

updateListeners();


if (getCookie('error') === "true") {
    errorMessage.innerText = "Nie udało się zmienić statusu zadania";
    modalError.style.display = "flex";
    deleteCookie('error');
}


window.onclick = (event) => {

    if (event.target !== searchResultAssignee) {
        searchResultAssignee.innerHTML = "";
    }

    if (event.target === modalNewSkill) {
        modalNewSkill.style.display = "none";
        searchBar.value = "";
    }

    if (event.target !== searchResult) {
        searchResult.innerHTML = "";
    }

    if (event.target === modalAddTask) {
        modalAddTask.style.display = "none";
        window.location.reload();
    }
}

let drake = dragula([
    toDo,
    inProgress,
    done],)
    .on('drag', (el) => {

        // add 'is-moving' class to element being dragged
        el.classList.add('is-moving');
    })
    .on('dragend', (el) => {
        // remove 'is-moving' class from element after dragging has stopped
        el.classList.remove('is-moving');

        // add the 'is-moved' class for 600ms then remove it
        window.setTimeout(function() {
            el.classList.add('is-moved');
            window.setTimeout(function() {
                el.classList.remove('is-moved');
            }, 600);
        }, 100);
    })
     .on('drop', (el, target, source, sibling) => {
        // update status in database
        let taskId = el.id.split("-");
        taskId = taskId[taskId.length - 1];
        fetch("/update-task-status", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({"taskId": taskId, "taskStatus": target.id})
        }).then((res) => {
            res.json().then(response => {
                if (response.msg === "FAIL") {
                    // refresh site and display a modal with error (set a cookie)
                    setCookie('error', 'true');
                    window.location.reload();
                }
            }).catch(err => {
                // refresh site and display a modal with error (set a cookie)
                setCookie('error', 'true');
                window.location.reload();
            });
        }).catch(err => {
            // refresh site and display a modal with error (set a cookie)
            setCookie('error', 'true');
            window.location.reload();
        });
});


addTask.addEventListener('click', () => {
    modalAddTask.style.display = "flex";
});

closeModal.addEventListener('click', () => {
    modalAddTask.style.display = "none";
    searchBar.value = "";
});

no.addEventListener('click', () => {
    modalAddTask.style.display = "none";
});

inputAssignee.addEventListener('click', () => {
    fetchSearchPeople();
});

inputAssignee.addEventListener('keyup', () => {
    fetchSearchPeople();
});

document.getElementById('new-skill').addEventListener('click', () => {
    document.getElementById("search-bar-skills").value = "";
    modalNewSkill.style.display = "flex";
});

document.getElementById('close-new').addEventListener('click', () => {
    modalNewSkill.style.display = "none";
});

searchBar.addEventListener('keyup', () => {
    fetchSearchSkills();
});

searchBar.addEventListener('click', () => {
    fetchSearchSkills();
});

document.getElementById('close-new').addEventListener('click', () => {
    modalNewSkill.style.display = "none";
});

addNewSkill.addEventListener('click', (event) => {
    event.preventDefault(); // don't perform post at all
    let skillName = document.getElementById('search-bar-skills').value;
    skillName = skillName.trim().toLowerCase();
    skillName = skillName.charAt(0).toUpperCase() + skillName.slice(1);
    fetch("/add-skill-name", {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({"skillName": skillName})
    })
        .then((res) => {
                res.json().then(response => {
                    if (response.msg === "OK") {
                        // add new indicator to list
                        // first check if this skill is already in the set
                        if (document.getElementById("skill-element-" + response.id) === null) {
                            let htmlNewElement = '<div class="skill-element" id="skill-element-' + response.id + '">' +
                                '                            <div class="skill-indicator-little">' +
                                '                            <div class="skill-name">' + skillName + '</div>' +
                                '                                <span id="' + response.id + '-delete" class="delete-skill">-</span>' +
                                '                            </div>' +
                                '                        </div>';
                            // append new child
                            skillsContentEdit.innerHTML += htmlNewElement;
                            searchBar.value = "";
                            modalNewSkill.style.display = "none";
                            updateListeners();
                        } else {
                            errorMessage.innerText = "Umiejętność jest już dodana do zadania.";
                            modalError.style.display = "flex";
                        }
                    } else if (response.msg === "FAIL") {
                        errorMessage.innerText = "Wystąpił błąd.";
                        modalError.style.display = "flex";
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

save.addEventListener('click', () => {
    // change date to d-m-yy format from yyyy-mm-d
    let date = document.getElementById('task-date').value;
    date = date.split('-');
    date = date[0].substring(2) + "-" + date[1] + "-" + date[2];
    let assignee = document.getElementById('task-assignee').value;
    if (assignee === "") {
        assignee = "NULL";
    } else {
        assignee = assignee.replace(' ', "_");
    }
    console.log(assignee)
    let time = document.getElementById('task-time').value;
    if (time.split(':').length !== 3 ) {
        time += ":00";
    }

    let skillsList = document.getElementsByClassName('skill-element');
    let skillsListId = [];
    let id;
    for (let element of skillsList) {
        id = element.id.split('-');
        skillsListId.push(id[id.length - 1]);
    }

    fetch("/add-task",  {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            "taskName": document.getElementById('task-name').value,
            "assignee": assignee,
            "description" : document.getElementById('task-description').value,
            "taskDate": date,
            "taskTime": time,
            "skillsList": skillsListId
        })
    }).then((res) => {
        res.json().then(response => {
            if (response.msg === "OK") {
                // redirect to new page with success
                window.location.href = "https://localhost:4000/new-task-success";
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