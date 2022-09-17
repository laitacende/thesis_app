let modalIcons = document.getElementById('modal-icons');
let iconsList = document.getElementsByClassName('icon-element-img');
let save = document.getElementById('save');
let avatar = document.querySelector('.avatar');
let overlay = document.getElementById('avatar-overlay');
let editSkills = document.getElementById('edit');
let modalEditSkills = document.getElementById('modal-skills-edit');
let skillsEditList = document.getElementsByClassName('skill-indicator-edit');
let modalNewSkill = document.getElementById('modal-skills-new');
let searchBar = document.getElementById('search-bar-skills');
let searchResult = document.getElementById('search-result');
let addNewSkill = document.getElementById('search-button');
let skillsContent = document.getElementById('skills-modal-display');
let skillsContentEdit = document.getElementById('skills-modal-edit');
let deleteList = document.getElementsByClassName('delete-skill');
let modalConfirm = document.getElementById('modal-confirm');
let modalInfo = document.getElementById('modal-info');
let buttonInfo = document.getElementById('close-info');
let closeInfo = document.getElementById('close-x-info');

/**
 * Function to fetch skills of user and display them in HTML.
 */
let fetchSkillsList = () => {
    // update skills list in skills modal
    fetch('/skills-list').then((res) => {
        let htmlList = '';
        res.json().then(response => {
            if (response.msg && response.msg === "FAIL") {
                errorMessage.innerText = "Wystąpił błąd.";
                modalError.style.display = "flex";
            } else {
                let index = 1;
                response.forEach(skill => {
                    htmlList += '<div class="skill-element">' +
                        '<div class="skill-name">' + skill.name + '</div>' +
                        '<div class="skill-indicator">';
                    for (let i = 0; i < parseInt(skill.skill_level); i++) {
                        htmlList += '<span id="' + skill.id + '-' + index + '" class="skill-point-full">•</span>'
                        index++;
                    }
                    for (let i = 0; i < 10 - parseInt(skill.skill_level); i++) {
                        htmlList += '<span id="' + skill.id + '-' + index + '" class="skill-point-normal">•</span>'
                        index++;
                    }
                    htmlList += ' </div> </div>';
                });
                skillsContent.innerHTML = htmlList;
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
 * Function that add listeners to skills elements to update skill level.
 */
let updateListeners = () => {
    for (let element of skillsEditList) {
        element.addEventListener('click', (event) => {
            // get target index
            let tmp = event.target.id.split('-');
            if (tmp[tmp.length - 1] !== "delete") {
                let index = parseInt(tmp[tmp.length - 1]);
                let indicators = element.children;

                // update in database
                fetch("/update-skill", {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    method: 'POST',
                    body: JSON.stringify({
                        "skillId": tmp[0],
                        "level": tmp[1]
                    })
                }).then((res) => {
                    res.json().then(response => {
                        if (response.msg === "FAIL") {
                            errorMessage.innerText = "Wystąpił błąd.";
                            modalError.style.display = "flex";
                        } else if (response.msg === "OK") {
                            for (let i = 0; i < index; i++) {
                                indicators[i].classList.remove('skill-point-normal-edit');
                                indicators[i].classList.add('skill-point-full-edit');
                            }

                            for (let i = index; i < indicators.length - 1; i++) {
                                indicators[i].classList.add('skill-point-normal-edit');
                                indicators[i].classList.remove('skill-point-full-edit');
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
            }
        });
    }

    for (let element of deleteList) {
        element.addEventListener('click', (event) => {
            // get target index
            let tmp = event.target.id.split('-');

            // update in database
            fetch("/delete-skill",  {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({
                    "skillId": tmp[0],
                })
            }).then((res) => {
                res.json().then((response) => {
                    if (response.msg === "OK") {
                        // delete this child
                        document.getElementById('skill-element-' + tmp[0]).remove();
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
    }
};

closeInfo.addEventListener('click', () => {
   modalInfo.style.display = "none";
});

buttonInfo.addEventListener('click', () => {
   modalInfo.style.display = "none";
});

if (isMineJs) {

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

    overlay.style.cursor = "pointer";

    overlay.addEventListener('click', (event) => {
        // display modal with different pictures and buttons to save and cancel
        modalIcons.style.display = "flex";
    });

    document.getElementById('close-icons').addEventListener('click', () => {
        modalIcons.style.display = "none";
    });

    document.getElementById('cancel-icon').addEventListener('click', () => {
        modalIcons.style.display = "none";
    });

    editSkills.addEventListener('click', () => {
        modalEditSkills.style.display = "flex";
    });

    document.getElementById('close-edit-skills').addEventListener('click', () => {
        modalEditSkills.style.display = "none";
        fetchSkillsList();
    });

    updateListeners();

    document.getElementById('new-skill').addEventListener('click', () => {
        modalNewSkill.style.display = "flex";
    });

    document.getElementById('close-new').addEventListener('click', () => {
        modalNewSkill.style.display = "none";
        searchBar.value = "";
    });

    window.addEventListener('click',  function(event) {
        if (event.target === modalIcons) {
            modalIcons.style.display = "none";
        }

        if (event.target === modalEditSkills) {
            modalEditSkills.style.display = "none";
            // update skills list in skills modal
            fetchSkillsList();
        }

        if (event.target === modalNewSkill) {
            modalNewSkill.style.display = "none";
            searchBar.value = "";
        }

        if (event.target !== searchResult) {
            searchResult.innerHTML = "";
        }
    });

    searchBar.addEventListener('keyup', () => {
        fetchSearchSkills();
    });

    searchBar.addEventListener('click', () => {
        fetchSearchSkills();
    });

    addNewSkill.addEventListener('click', (event) => {
        event.preventDefault(); // don't perform post yet
        let skillName = document.getElementById('search-bar-skills').value;
        skillName = skillName.trim().toLowerCase();
        skillName = skillName.charAt(0).toUpperCase() + skillName.slice(1);
        console.log(skillName);
        fetch("/add-skill",  {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({ "skillName": skillName })
        }).then((res) => {
            res.json().then(response => {
                if (response.msg === "OK") {
                    let index = 1;
                    // add new indicator to list
                    let htmlNewElement = '<div class="skill-element" id="skill-element-' + response.id +  '">' +
                        '                    <div class="skill-name">' + skillName +  '</div>' +
                        '                    <div class="skill-indicator-edit">' +
                        '                            <span id="' + response.id + '-' + index + '" class="skill-point-full-edit">•</span>';
                    index++;
                    for (let i = 0; i < 9; i++) {
                        htmlNewElement += '<span id="' + response.id + '-' + index + '" class="skill-point-normal-edit">•</span>';
                        index++;
                    }
                    htmlNewElement += '<span id="' + response.id + '-delete" class="delete-skill">-</span> </div> </div>';
                    // append new child
                    skillsContentEdit.innerHTML += htmlNewElement;
                    searchBar.value = "";
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

    document.getElementById('delete').addEventListener('click', () => {
        // display modal
        modalConfirm.style.display = "flex";
    });

    document.getElementById('close-delete').addEventListener('click', () => {
        modalConfirm.style.display = "none";
    });

    document.getElementById('cancel-delete').addEventListener('click', () => {
        modalConfirm.style.display = 'none';
    });

    document.getElementById('confirm-delete').addEventListener('click', () => {
        fetch("/delete-profile",  {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
        }).then((res) => {
            res.json().then(response => {
                if (response.msg === "OK") {
                    window.location.href = "https://localhost:4000/delete-success-profile";
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
}

for (let element of iconsList) {
    element.addEventListener('click', () => {
        document.querySelector('.chosen').classList.remove('chosen');
        element.classList.add('chosen');
    });
}

save.addEventListener('click', () => {
   // change profile picture to chosen one, sent to server
    let iconName = document.querySelector('.chosen').src
    fetch("/profile-change-icon",  {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({ "iconName": iconName.substring(33) })
    }).then((res) => {
        res.json().then(response => {
            if (response.msg === "OK") {
                // change profile picture locally (no need to get it from database as it is known what should be displayed)
                avatar.src = iconName;
                // close modal
                modalIcons.style.display = "none";
            } else if (response.msg === "FAIL") {
                // display modal error
                // set message
                errorMessage.innerText = "Nie udało się zmienić zdjęcia profilowego.";
                modalError.style.display = "flex";
            }
        }).catch(err => {
            errorMessage.innerText = "Wystąpił błąd.";
            modalError.style.display = "flex";
        });
    }).catch(err => {
        errorMessage.innerText = "Nie udało się zmienić zdjęcia profilowego.";
        modalError.style.display = "flex";
    });
});

document.getElementsByClassName('alert-icon')[0].addEventListener('click', () => {
   modalInfo.style.display = "flex";
});

let modalSkills = document.getElementById('modal-skills');

document.getElementById('more').addEventListener('click', () => {
    modalSkills.style.display = "flex";
});

document.getElementById('close-skills').addEventListener('click', () => {
    modalSkills.style.display = "none";
});

window.onclick = function(event) {
    if (event.target === modalSkills) {
        modalSkills.style.display = "none";
    }

    if (event.target === modalInfo) {
        modalInfo.style.display = "none";
    }
}

if (isMineJs) {
    overlay.addEventListener('mouseover', () => {
        overlay.style.opacity = "1.0";
    });

    overlay.addEventListener('mouseout', () => {
        overlay.style.opacity = "0.0";
    });
}