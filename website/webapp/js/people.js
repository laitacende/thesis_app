let fob = document.getElementById('add-new-person');
let searchButton = document.getElementById('search-button');
let searchBar = document.getElementById('search-bar-people');
let searchResult = document.getElementById('search-result');
let modalPerson = document.getElementById('modal-add-person');
let closePerson = document.getElementById('close');
let cancelPerson = document.getElementById('cancel');
let addSave = document.getElementById('add-save');
let name = document.getElementById('person-name');
let surname = document.getElementById('person-surname');
let time = document.getElementById('person-time');
let modalInfo = document.getElementById('modal-info');
let closeInfo = document.getElementById('close-info');
let closeButtonInfo = document.getElementById('close-button-info');
let infoMessage = document.getElementById('info-message');

let list = document.getElementsByClassName('list-item');

for (let element of list) {
   element.addEventListener('mouseover', (event) => {
      element.classList.add('border-hover');
   });

   element.addEventListener('mouseout', (event) => {
      element.classList.remove('border-hover');
   });
}

/**
 * Fetch list of people's names based on user's input.
 */
let fetchSearch = () => {
   fetch('/people-search?username=' + searchBar.value.replace(" ", "_")).then((res) => {
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

searchBar.addEventListener('keyup', () => {
   fetchSearch();
});

searchBar.addEventListener('click', () => {
   fetchSearch();
});

searchButton.addEventListener('click', (event) => {
   event.preventDefault(); // needed to stop submitting without changing the output
   searchBar.value = searchBar.value.replace(" ", "_");
   document.getElementById('search-people-form').submit();
});

window.onclick = function(event) {
   if (event.target !== document.querySelector('#search-result')) {
      searchResult.innerHTML = "";
   }
}

if (fob) {
   fob.addEventListener('click', () => {
      // open dialog with form
     modalPerson.style.display = "flex";
   });

   closePerson.addEventListener('click', () => {
      modalPerson.style.display = "none";
   });

   cancelPerson.addEventListener('click', () => {
      modalPerson.style.display = "none";
   });

   closeInfo.addEventListener('click', () => {
      modalInfo.style.display = "none";
   });

   closeButtonInfo.addEventListener('click', () => {
      modalInfo.style.display = "none";
   });

   addSave.addEventListener('click', () => {
      fetch("/add-person",  {
         headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
         },
         method: 'POST',
         body: JSON.stringify({
            "name": name.value,
            "surname": surname.value,
            "time": time.value,
            })
      }).then((res) => {
         res.json().then(response => {
            if (response.msg === "OK") {
               // show modal with newly generated password and link
               infoMessage.innerHTML = "Nowy użytkownik został utworzony.<br> " +
                   "Login: " + response.login +
                   "<br>Hasło: " + response.password;
               modalInfo.style.display = "flex";
               modalPerson.style.display = "none";
               window.location.reload();
            } else if (response.msg === "FAIL") {
               // display modal error
               // set message
               errorMessage.innerText = "Nie udało się stworzyć nowego użytkownika.";
               modalError.style.display = "flex";
            }
         });
      }).catch(err => {
         errorMessage.innerText = "Nie udało się stworzyć nowego użytkownika.";
         modalError.style.display = "flex";
      });
   });

   window.addEventListener('click', (event) => {
      if (event.target === modalPerson) {
         modalPerson.style.display = "none";
      }

      if (event.target === modalInfo) {
         modalInfo.style.display = "none";
      }
   });
}