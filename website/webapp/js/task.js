let taskEdit = document.getElementById('edit');
let modalEdit = document.getElementById('modal-task-edit');
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
let modalConfirm = document.getElementById('modal-confirm');
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
 * Function that adds listeners to delete icons and deletes skill element from HTML.
 */
let updateListeners = () => {
    for (let element of deleteList) {
        element.addEventListener('click', (event) => {
            // get target index
            let tmp = event.target.id.split('-');

            // update in database
            fetch("/delete-skill-task",  {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({
                    "skillId": tmp[0],
                    "taskId": taskId
                })
            }).then((res) => {
                res.json().then((response) => {
                    if (response.msg === "OK") {
                        // delete this child
                        document.getElementById('skill-element-' + tmp[0]).remove();
                    } else if (response.msg === "FAIL") {
                        rrorMessage.innerText = "Wystąpił błąd.";
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
    }
};

updateListeners();

document.getElementById('task-name').value = taskName;
document.getElementById('task-assignee').value = assignee;
document.getElementById('task-description').value = description;
document.getElementById('task-date').value = taskDate;
document.getElementById('task-time').value = taskTime;

taskEdit.addEventListener('click', () => {
    modalEdit.style.display = "flex";
});

closeModal.addEventListener('click', () => {
   modalEdit.style.display = "none";
   window.location.reload();
});

no.addEventListener('click', () => {
    modalEdit.style.display = "none";
    window.location.reload();
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

document.getElementById('close-delete').addEventListener('click', () => {
    modalConfirm.style.display = "none";
});

document.getElementById('cancel-delete').addEventListener('click', () => {
   modalConfirm.style.display = 'none';
});

document.getElementById('confirm-delete').addEventListener('click', () => {
    fetch("/delete-task",  {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({"taskId": taskId})
    }).then((res) => {
        res.json().then(response => {
            if (response.msg === "OK") {
                window.location.href = "https://localhost:4000/delete-success";
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

addNewSkill.addEventListener('click', (event) => {
    event.preventDefault(); // don't perform post yet
    let skillName = document.getElementById('search-bar-skills').value;
    skillName = skillName.trim().toLowerCase();
    skillName = skillName.charAt(0).toUpperCase() + skillName.slice(1);
    fetch("/add-skill-to-task",  {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({ "skillName": skillName, "taskId": taskId})
    }).then((res) => {
        res.json().then(response => {
            if (response.msg === "OK") {
                // add new indicator to list
                let htmlNewElement = '<div class="skill-element" id="skill-element-'+ response.id + '">' +
                    '                            <div class="skill-indicator-little">' +
                    '                            <div class="skill-name">' + skillName + '</div>' +
                    '                                <span id="' + response.id + '-delete" class="delete-skill">-</span>' +
                    '                            </div>' +
                    '                        </div>';
                // append new child
                skillsContentEdit.innerHTML += htmlNewElement;
                modalNewSkill.style.display = "none";
                updateListeners();
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

    let time = document.getElementById('task-time').value;
    if (time.split(':').length !== 3 ) {
        time += ":00";
    }

    fetch("/update-task",  {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            "taskId": taskId,
            "taskName": document.getElementById('task-name').value,
            "assignee": assignee,
            "description" : document.getElementById('task-description').value,
            "taskDate": date,
            "taskTime": time
        })
    }).then((res) => {
        res.json().then(response => {
            if (response.msg === "OK") {
                // edit values in inputs
                modalEdit.style.display = "none";
                window.location.reload();
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

document.getElementById('delete').addEventListener('click', () => {
    // display confirming modal
    modalConfirm.style.display = "flex";
});

window.onclick = function(event) {
    if (event.target === modalEdit) {
        modalEdit.style.display = "none";
        window.location.reload();
    }

    if (event.target !== searchResultAssignee) {
        searchResultAssignee.innerHTML = "";
    }

    if (event.target === modalNewSkill) {
        modalNewSkill.style.display = "none";
    }

    if (event.target !== searchResult) {
        searchResult.innerHTML = "";
    }
}

