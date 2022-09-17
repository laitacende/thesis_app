/**
 * POST queries:
 * - "/auth" check login credentials and log in user, body: login, password,
 *   render index with errors or redirect to home, if login success,
 * - "/new-password" change password, body: passwordOld, passwordNew, passwordRepeat,
 *    render page with errors or success page,
 * - "/profile-change-icon" change profile icon, body: iconName,
 *   send message in form {msg: "OK" | "FAIL"},
 * - "/reset-project" delete all tasks and assignments, send message in form {msg: "OK" | "FAIL"},
 * - "/update-skill" update skill level of user, body: skillId, level,
 *    send message in form {msg: "OK" | "FAIL"},
 * - "/add-skill" add skill to user, body: skillName, send message in form {msg: "OK" | "FAIL"},
 * - "/delete-skill" delete skill from user, body: skillId, send message in form {msg: "OK" | "FAIL"},
 * - "/update-task-status" change task status, body: taskId, taskStatus ("todo" | "inprogress" | "done"),
 *    send message in form {msg: "OK" | "FAIL"},
 * - "/add-skill-to-task" add skill to task, body: skillName, taskId,
 *    send message in form {msg: "OK", id: skillId} | {msg: "FAIL"},
 * - "/delete-skill-task" delete skill from task, body: skillId, taskId,
 *    send message in form {msg: "OK" | "FAIL"},
 * - "/update-task" update task details, body: taskName, taskId, assignee, description, taskDate, taskTime,
 *   send message in form {msg: "OK" | "FAIL"},
 * - "/delete-task" delete task, body: taskId,  send message in form {msg: "OK" | "FAIL"},
 * - "/add-skill-name" add new skill to database, body: skillName,
 *   send message in form {msg: "OK", id: skillId} | {msg: "FAIL"},
 * - "/add-task" add new task, body: taskName, assignee, description, taskDate, taskTime, skillsList,
 *    send message in form {msg: "OK" | "FAIL"},
 * - "/add-person" adds new user and generates password for them, body: name, surname,
 *   send message in form {msg: "OK", password: pass, login: username} | {msg: "FAIL"},
 * - "/delete-profile" delete user, send message in form {msg: "OK" | "FAIL"},
 * - "/generate-assignment" generate optimal assignment, body: people, tasks, send result as matching
 *   in form "{source: _, destination: _}",
 * - "/update-assignment" update assigment, body: matching, send message in form {msg: "OK" | "FAIL"},
 * - "/check-feasibility" check if projects can be finished on time with current human resources, body: people,
 *    send list of tasks that cannot be done (tasksStop) and list of needed skills (skills) or message in
 *    the form {msg: "FAIL"},
 * - "/logout" log the user out, send message in form {msg: "OK" | "FAIL"}.
 */

const connections = require('./databse');
const express = require('express');
const {check, validationResult} = require("express-validator");
const router = express.Router();
const validation = require("./validation");
const ESAPI = require("node-esapi");
const Graph = require("../algorithms/structures/Graph");
const hungarian = require("../algorithms/algorithms_implementations/hungarianAlgorithm");

let min = (first, second) => {
    return first < second ? first : second;
}

let loginValidate = [
    // check username -must be in form name_surname, length at least 3
    check('login').trim().escape().blacklist(' ').isLength({min: 3}).withMessage('Login musi mieć co najmniej 3 znaki').matches('[A-Za-z]+_[A-Za-z]+').withMessage('Nieprawidłowy format loginu'),
    // check password, length at least 8, must contain one special character and one number
    check('password').isLength({ min: 8 }).withMessage('Hasło musi mieć co najmniej 8 znaków').matches('[0-9]').withMessage('Hasło musi mieć co najmniej jedną cyfrę').matches('[ !"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~]').withMessage('Hasło musi zawierać co najmniej jeden znak specjalny')
];

// handle post
router.post('/auth', function(req,res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('index.ejs', {errors: errors.array().map((el) => {
                return el.msg;
            })
        });
    } else {
        let login = req.body.login;
        let password = req.body.password;

        try {
            // check if user in database
            connections.defaultConn.query("SELECT * FROM users WHERE username = ?", [login])
                .then((rows) => {
                    delete rows.meta;
                    if (rows.length > 0) { // there is such user
                        delete rows.meta;
                        // check passwords
                        validation.verifyPasswordWithHash(password, rows[0].password).then(resultPass => {
                            if (resultPass) {
                                // start session
                                req.session.loggedIn = true;
                                req.session.login = login.replace('_', ' ');
                                req.session.userId = rows[0].id;
                                req.session.privileged = rows[0].privileged;
                                req.session.firstTime = false;
                                // check if changing the password is needed
                                if (rows[0].change_password === 1) {
                                    req.session.firstTime = true;
                                    return res.redirect('/change-password');
                                } else {
                                    return res.redirect('/home');
                                }
                            } else {
                                return res.render('index.ejs', {errors: ["Niepoprawne dane"]});
                            }
                        })
                    } else {
                        res.render('index.ejs', {errors: ["Niepoprawne dane"]});
                        res.end();
                    }
                }).catch(err => {
                //handle error
                console.log(err);
                return res.render('error_full.ejs', {msg: "Wystąpił błąd"});
            })
        } catch(err) {
            res.status(500);
            return res.render('error_full.ejs', {msg: "Błąd połączenia z bazą danych"});
        }
    }
});

let passwordValidate = [
    // check password, length at least 8, must contain one special character and one number
    check('passwordOld').isLength({ min: 8 }).withMessage('Hasło musi mieć co najmniej 8 znaków').matches('[0-9]').withMessage('Hasło musi mieć co najmniej jedną cyfrę').matches('[ !"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~]').withMessage('Hasło musi zawierać co najmniej jeden znak specjalny'),
    check('passwordNew').isLength({ min: 8 }).withMessage('Hasło musi mieć co najmniej 8 znaków').matches('[0-9]').withMessage('Hasło musi mieć co najmniej jedną cyfrę').matches('[ !"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~]').withMessage('Hasło musi zawierać co najmniej jeden znak specjalny')
];

router.post('/new-password', passwordValidate, (req, res) => {
    if (req.session.loggedIn) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('change_password.ejs', {errors: errors.array().map((el) => {
                    return el.msg;
                }),
                firstTime: ESAPI.encoder().encodeForJavaScript(req.session.firstTime),
                userId: ESAPI.encoder().encodeForHTML(String(req.session.userId)),
                displayBack: false,
                privileged: ESAPI.encoder().encodeForHTML(String(req.session.privileged)),
            });
        } else {
            let passwordOld = req.body.passwordOld;
            let passwordNew = req.body.passwordNew;
            let passwordRepeat = req.body.passwordRepeat;

            if (passwordNew !== passwordRepeat) {
                return res.render('change_password.ejs', {
                    errors: ["Nowe hasła nie są takie same"],
                    firstTime: req.session.firstTime,
                    userId: ESAPI.encoder().encodeForHTML(String(req.session.userId)),
                    displayBack: false,
                    privileged: ESAPI.encoder().encodeForHTML(String(req.session.privileged)),
                });
            } else {
                // check if old password is correct
                try {
                    // check if user in database
                    connections.defaultConn.query("SELECT * FROM users WHERE id = ?", [req.session.userId])
                        .then((rows) => {
                            delete rows.meta;
                            if (rows.length > 0) { // there is such user
                                delete rows.meta;
                                // check passwords
                                validation.verifyPasswordWithHash(passwordOld, rows[0].password).then(resultHash => {
                                    if (resultHash) {
                                        // change password to new one
                                        validation.hashPassword(passwordNew).then(hashed => {
                                            connections.defaultConn.query("UPDATE users SET password=?, change_password=false WHERE id=?;", [hashed, req.session.userId])
                                                .then((result) => {
                                                    if (result.affectedRows === 1) {
                                                        return res.render('message.ejs', {
                                                            msg: "Hasło zostało zmienione",
                                                            link: "https://localhost:4000/home",
                                                            linkMsg: "Wróć do strony głównej",
                                                            userId: ESAPI.encoder().encodeForHTML(String(req.session.userId)),
                                                            displayBack: false,
                                                            privileged: ESAPI.encoder().encodeForHTML(String(req.session.privileged)),
                                                        });
                                                    } else {
                                                        return res.render('error_full.ejs', {msg: "Wystąpił błąd"});
                                                    }
                                                }).catch(err => {
                                                //handle error
                                                console.log(err);
                                                return res.render('error_full.ejs', {msg: "Wystąpił błąd"});
                                            })
                                        }).catch(err => {
                                            //handle error
                                            console.log(err);
                                            return res.render('error_full.ejs', {msg: "Wystąpił błąd"});
                                        })
                                    } else {
                                        return res.render('change_password.ejs', {
                                            errors: ["Niepoprawne dane"],
                                            firstTime: req.session.firstTime,
                                            userId: ESAPI.encoder().encodeForHTML(String(req.session.userId)),
                                            displayBack: false,
                                            privileged: ESAPI.encoder().encodeForHTML(String(req.session.privileged)),
                                        });
                                    }
                                });
                            } else {
                                return res.render('change_password.ejs', {
                                    errors: ["Niepoprawne dane"],
                                    firstTime: req.session.firstTime,
                                    userId: ESAPI.encoder().encodeForHTML(String(req.session.userId)),
                                    displayBack: false,
                                    privileged: ESAPI.encoder().encodeForHTML(String(req.session.privileged)),
                                });
                            }
                        }).catch(err => {
                        //handle error
                        console.log(err);
                        return res.render('error_full.ejs', {msg: "Wystąpił błąd"});
                    })
                } catch(err) {
                    res.status(500);
                    return res.render('error_full.ejs', {msg: "Błąd połączenia z bazą danych"});
                }
            }
        }
    } else {
        return res.render('error_full.ejs', {msg: "Wymagane jest zalogowanie się"});
    }
});

router.post("/profile-change-icon", (req, res) => {
    if (req.session.loggedIn) {
        let fileName = req.body.iconName;
        // sanitize
        fileName = fileName.trim();
        if (/^[a-zA-z]+\.svg$/.test(fileName)) { // has correct format
            try {
                // check if user in database
                connections.defaultConn.query("UPDATE users SET profile_picture=? WHERE id=?", [fileName, req.session.userId])
                    .then((result) => {
                        if (result.affectedRows === 1) {
                            return res.send(JSON.stringify({msg: "OK"}));
                        } else {
                            return res.send(JSON.stringify({msg: "FAIL"}));
                        }
                    }).catch(err => {
                    //handle error
                    console.log(err);
                    return res.send(JSON.stringify({msg: "FAIL"}));
                })
            } catch (err) {
                console.log(err);
                res.status(500);
                return res.send(JSON.stringify({msg: "FAIL"}));
            }
        } else {
            return res.send(JSON.stringify({msg: "FAIL"}));
        }
    } else {
        return res.send(JSON.stringify({msg: "FAIL"}));
    }
});

router.post('/reset-project', (req, res) => {
    if (req.session.loggedIn && req.session.privileged) {
        // delete all tasks and restart the indexing, delete assignments (matchings)
        try {
            // check if user in database
            connections.defaultConn.query("SET FOREIGN_KEY_CHECKS = 0; TRUNCATE TABLE skills_tasks; TRUNCATE TABLE tasks; SET FOREIGN_KEY_CHECKS = 1;")
                .then((result) => {
                    return res.send(JSON.stringify({msg: "OK"}));
                }).catch(err => {
                //handle error
                console.log(err);
                return res.send(JSON.stringify({msg: "FAIL"}));
            })
        } catch (err) {
            console.log(err);
            res.status(500);
            return res.send(JSON.stringify({msg: "FAIL"}));
        }
    } else {
        return res.send(JSON.stringify({msg: "FAIL"}));
    }
});

router.post('/update-skill', (req, res) => {
    if (req.session.loggedIn) {
        let skillId = req.body.skillId;
        let level = req.body.level;

        // check format
        skillId = skillId.trim();
        level = level.trim();
        if (!isNaN(skillId) && !isNaN(parseFloat(skillId)) && !isNaN(level) && !isNaN(parseFloat(level))) {
            try {
                // check if user in database
                connections.defaultConn.query("UPDATE skills_users SET skill_level=? WHERE id_skill=? AND id_user=? ", [level, skillId, req.session.userId])
                    .then((result) => {
                        if (result.affectedRows === 1) {
                            res.send(JSON.stringify({msg: "OK"}));
                        } else {
                            return res.send(JSON.stringify({msg: "FAIL"}));
                        }
                    }).catch(err => {
                    //handle error
                    console.log(err);
                    return res.send(JSON.stringify({msg: "FAIL"}));
                })
            } catch (err) {
                res.status(500);
                console.log(err);
                return res.send(JSON.stringify({msg: "FAIL"}));
            }
        } else {
            return res.send(JSON.stringify({msg: "FAIL"}));
        }
    } else {
        return res.send(JSON.stringify({msg: "FAIL"}));
    }
});

router.post('/add-skill', (req, res) => {
    if (req.session.loggedIn) {
        let skillName = req.body.skillName;
        skillName = skillName.trim().toLowerCase();
        skillName = skillName.charAt(0).toUpperCase() + skillName.slice(1);
        console.log(skillName);
        if (/^[a-zA-z\s\+]+$/.test(skillName)) {
            try {
                // check if user in database
                connections.defaultConn.query("CALL addSkill(?); CALL addSkillNameToUser(?, ?, 1); SELECT id FROM skills WHERE name=?", [skillName, req.session.userId, skillName, skillName])
                    .then((rows) => {
                        delete rows[2].meta;
                        console.log(rows);
                        if (rows[2].length > 0) {
                            return res.send(JSON.stringify({msg: "OK", id: rows[2][0].id}));
                        } else {
                            return res.send(JSON.stringify({msg: "FAIL"}));
                        }
                    }).catch(err => {
                    //handle error
                    console.log(err);
                    return res.send(JSON.stringify({msg: "FAIL"}));
                });
            } catch (err) {
                res.status(500);
                return res.send(JSON.stringify({msg: "FAIL"}));
            }
        } else {
            return res.send(JSON.stringify({msg: "FAIL"}));
        }
    } else {
        return res.send(JSON.stringify({msg: "FAIL"}));
    }
});

router.post('/delete-skill', (req, res) => {
    if (req.session.loggedIn) {
        let skillId = req.body.skillId;

        // check format
        skillId = skillId.trim();
        if (!isNaN(skillId) && !isNaN(parseFloat(skillId))) {
            try {
                connections.defaultConn.query("DELETE FROM skills_users  WHERE id_skill=? AND id_user=?", [skillId, req.session.userId])
                    .then((result) => {
                        if (result.affectedRows === 1) {
                            return res.send(JSON.stringify({msg: "OK"}));
                        } else {
                            return res.send(JSON.stringify({msg: "FAIL"}));
                        }
                    }).catch(err => {
                    //handle error
                    console.log(err);
                    return res.send(JSON.stringify({msg: "FAIL"}));
                })
            } catch (err) {
                res.status(500);
                return res.send(JSON.stringify({msg: "FAIL"}));
            }
        } else {
            return res.send(JSON.stringify({msg: "FAIL"}));
        }
    }
});

router.post("/update-task-status", (req, res) => {
    if (req.session.loggedIn) {
        let taskId = req.body.taskId;
        let status = req.body.taskStatus;

        if (!isNaN(taskId) && !isNaN(parseFloat(taskId)) && (status === "todo" || status === "inprogress" || status === "done")) {
            try {
                connections.defaultConn.query("UPDATE tasks SET status=? WHERE id=?", [status, taskId])
                    .then((result) => {
                        if (result.affectedRows === 1) {
                            return res.send(JSON.stringify({msg: "OK"}));
                        } else {
                            return res.send(JSON.stringify({msg: "FAIL"}));
                        }
                    }).catch(err => {
                        //handle error
                        console.log(err);
                        return res.send(JSON.stringify({msg: "FAIL"}));
                });
            } catch (err) {
                res.status(500);
                return res.send(JSON.stringify({msg: "FAIL"}));
            }
        } else {
            return res.send(JSON.stringify({msg: "FAIL"}));
        }
    } else {
        return res.send(JSON.stringify({msg: "FAIL"}));
    }
});

router.post("/add-skill-to-task", (req, res) => {
    if (req.session.loggedIn) {
        let skillName = req.body.skillName;
        skillName = skillName.trim().toLowerCase();
        skillName = skillName.charAt(0).toUpperCase() + skillName.slice(1);
        let taskId = req.body.taskId;
        if (/^[a-zA-z\s+ąĄĆćĘęÓóŚśŁłŻżŹź]+$/.test(skillName) && !isNaN(taskId) && !isNaN(parseFloat(taskId))) {
            try {
                // check if user in database
                connections.defaultConn.query("CALL addSkill(?); CALL addSkillNameToTask(?, ?); SELECT id FROM skills WHERE name=?", [skillName, taskId, skillName, skillName])
                    .then((rows) => {
                        console.log(rows)
                        delete rows[2].meta;
                        if (rows[2].length > 0) {
                            return res.send(JSON.stringify({msg: "OK", id: rows[2][0].id}));
                        } else {
                            return res.send(JSON.stringify({msg: "FAIL"}));
                        }
                    }).catch(err => {
                    //handle error
                    console.log(err)
                    return res.send(JSON.stringify({msg: "FAIL"}));
                }).catch(err => {
                    //handle error
                    console.log(err)
                    return res.send(JSON.stringify({msg: "FAIL"}));
                });
            } catch (err) {
                res.status(500);
                return res.send(JSON.stringify({msg: "FAIL"}));
            }
        } else {
            return res.send(JSON.stringify({msg: "FAIL"}));
        }
    } else {
        return res.send(JSON.stringify({msg: "FAIL"}));
    }
});

router.post("/delete-skill-task", (req, res) => {
    if (req.session.loggedIn) {
        let skillId = req.body.skillId;
        let taskId = req.body.taskId;
        // check format
        skillId = skillId.trim();
        if (!isNaN(skillId) && !isNaN(parseFloat(skillId)) && !isNaN(taskId) && !isNaN(parseFloat(taskId))) {
            try {
                connections.defaultConn.query("DELETE FROM skills_tasks  WHERE id_skill=? AND id_task=?", [skillId, taskId])
                    .then((result) => {
                        if (result.affectedRows === 1) {
                            return res.send(JSON.stringify({msg: "OK"}));
                        } else {
                            return res.send(JSON.stringify({msg: "FAIL"}));
                        }
                    }).catch(err => {
                    //handle error
                    console.log(err);
                    return res.send(JSON.stringify({msg: "FAIL"}));
                })
            } catch (err) {
                res.status(500);
                return res.send(JSON.stringify({msg: "FAIL"}));
            }
        } else {
            return res.send(JSON.stringify({msg: "FAIL"}));
        }
    } else {
        return res.send(JSON.stringify({msg: "FAIL"}));
    }
});

let taskValidate = [
    check('taskName').trim().escape().isLength({min: 1, max: 500}).withMessage('Nazwa musi mieć co najmniej jeden znak').matches('[A-Za-z\s]+').withMessage('Nazwa może składać się tylko z liter i spacji'),
    check('taskId').isNumeric().withMessage('Identyfikator może składać się tylko z cyfr').trim().escape(),
    check('assignee').trim().escape().matches('[A-za-z]+_[A-za-z]|NULL').withMessage('Nieprawdiłowy format loginu'),
    check('description').trim().escape().isLength({max: 1000}),
    check('taskDate').trim().escape().matches("[0-9][0-9]-[0-9][0-9]-[0-9][0-9]").withMessage('Nieprawdiłowy format daty'),
    check('taskTime').trim().escape().matches("[0-9][0-9]:[0-9][0-9]:00").withMessage('Nieprawidłowy format czasu')
];

router.post('/update-task', taskValidate, (req, res) => {
   if (req.session.loggedIn) {
       const errors = validationResult(req);
       if (!errors.isEmpty()) {
           return res.send({msg: "FAIL", errors: errors.array().map((el) => {
                   return el.msg;
               })});
       } else {
           let name = req.body.taskName;
           let id = req.body.taskId;
           let assignee = req.body.assignee;
           let description = req.body.description;
           let date = req.body.taskDate;
           let time = req.body.taskTime;

           try {
               if (assignee !== "NULL") {
                   // get id of assignee
                   connections.defaultConn.query("SELECT id FROM users WHERE username=?", [assignee])
                       .then((rows) => {
                           delete rows.meta;
                           if (rows.length > 0) {
                               // update the task
                               connections.defaultConn.query("UPDATE tasks SET name=?, description=?, estimated_time=?, assignee_id=?, deadline=? WHERE id=?",
                                   [name, description, time, rows[0].id, date, id])
                                   .then((result) => {
                                       if (result.affectedRows === 1) {
                                           return res.send(JSON.stringify({msg: "OK"}));
                                       } else {
                                           return res.send(JSON.stringify({msg: "FAIL"}));
                                       }
                                   }).catch(err => {
                                   //handle error
                                   console.log(err);
                                   return res.send(JSON.stringify({msg: "FAIL"}));
                               })
                           }
                       }).catch(err => {
                       console.log(err);
                       return res.send(JSON.stringify({msg: "FAIL"}));
                   });
               } else {
                   connections.defaultConn.query("UPDATE tasks SET name=?, description=?, estimated_time=?, deadline=?, assignee_id=NULL WHERE id=?",
                       [name, description, time, date, id])
                       .then((result) => {
                           if (result.affectedRows === 1) {
                               return res.send(JSON.stringify({msg: "OK"}));
                           } else {
                               return res.send(JSON.stringify({msg: "FAIL"}));
                           }
                       }).catch(err => {
                       //handle error
                       console.log(err);
                       return res.send(JSON.stringify({msg: "FAIL"}));
                   });
               }
           } catch (err) {
               res.status(500);
               return res.send(JSON.stringify({msg: "FAIL"}));
           }
       }
   } else {
       return res.send(JSON.stringify({msg: "FAIL"}));
   }
});

router.post('/delete-task', (req, res) => {
   if (req.session.loggedIn) {
       let taskId = req.body.taskId;
       // check format
       if (!isNaN(taskId) && !isNaN(parseFloat(taskId))) {
           try {
               connections.defaultConn.query("DELETE from skills_tasks WHERE id_task=?; DELETE FROM tasks WHERE id=?", [taskId, taskId])
                   .then((result) => {
                       if (result[0].affectedRows === 1) {
                           return res.send(JSON.stringify({msg: "OK"}));
                       } else {
                           return res.send(JSON.stringify({msg: "FAIL"}));
                       }
                   }).catch(err => {
                   //handle error
                   console.log(err);
                   return res.send(JSON.stringify({msg: "FAIL"}));
               })
           } catch (err) {
               res.status(500);
               return res.send(JSON.stringify({msg: "FAIL"}));
           }
       } else {
           return res.send(JSON.stringify({msg: "FAIL"}));
       }
   } else {
       return res.send(JSON.stringify({msg: "FAIL"}));
   }
});

router.post('/add-skill-name', (req, res) => {
    if (req.session.loggedIn) {
        let skillName = req.body.skillName;
        skillName = skillName.trim().toLowerCase();
        skillName = skillName.charAt(0).toUpperCase() + skillName.slice(1);

        if (/^[a-zA-z\s+]+$/.test(skillName)) {
            try {
                // check if user in database
                connections.defaultConn.query("CALL addSkill(?); SELECT id FROM skills WHERE name=?", [skillName, skillName])
                    .then((rows) => {
                        delete rows[1].meta;
                        if (rows[1].length > 0) {
                            return res.send(JSON.stringify({msg: "OK", id: rows[1][0].id}));
                        } else {
                            return res.send(JSON.stringify({msg: "FAIL"}));
                        }
                    }).catch(err => {
                    //handle error
                    console.log(err);
                    return res.send(JSON.stringify({msg: "FAIL"}));
                });
            } catch (err) {
                res.status(500);
                return res.send(JSON.stringify({msg: "FAIL"}));
            }
        } else {
            return res.send(JSON.stringify({msg: "FAIL"}));
        }
    } else {
        return res.send(JSON.stringify({msg: "FAIL"}));
    }
});

let taskValidateAdd = [
    check('taskName').trim().escape().isLength({min: 1, max: 500}).withMessage('Nazwa musi mieć co najmniej jeden znak').matches('[A-Za-z\s]+').withMessage('Nazwa może składać się tylko z liter i spacji'),
    check('assignee').trim().escape().matches('[A-za-z]+_[A-za-z]|NULL').withMessage('Nieprawdiłowy format loginu'),
    check('description').trim().escape().isLength({max: 1000}),
    check('taskDate').trim().escape().matches("[0-9][0-9]-[0-9][0-9]-[0-9][0-9]").withMessage('Nieprawdiłowy format daty'),
    check('taskTime').trim().escape().matches("[0-9][0-9]:[0-9][0-9]:00").withMessage('Nieprawidłowy format czasu')
];

router.post('/add-task', taskValidateAdd, (req, res) => {
    if (req.session.loggedIn) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({msg: "FAIL", errors: errors.array().map((el) => {
                    return el.msg;
                })});
        } else {
            let name = req.body.taskName;
            let assignee = req.body.assignee;
            let description = req.body.description;
            let date = req.body.taskDate;
            let time = req.body.taskTime;
            let skillsList = req.body.skillsList;
            let queryAddSkills = "";
            let parameters = [];
            for (let element of skillsList) {
                queryAddSkills += "CALL addSkillToTask(?, ?);";
                parameters.push(element);
            }

            try {
                let taskId;
                if (assignee !== "NULL") {
                    // get id of assignee
                    connections.defaultConn.query("SELECT id FROM users WHERE username=?", [assignee])
                        .then((rows) => {
                            delete rows.meta;
                            if (rows.length > 0) {
                                // update the task
                                connections.defaultConn.query("INSERT INTO tasks (name, description, estimated_time, deadline, assignee_id) VALUES (?, ?, ?, ?, ?) RETURNING id",
                                    [name, description, time, date, rows[0].id])
                                    .then((rows) => {
                                        delete rows.meta;
                                        if (rows.length > 0) {
                                            taskId = rows[0].id;
                                            // add skills
                                            let params = [];
                                            for (let el of parameters) {
                                                params.push(taskId);
                                                params.push(el);
                                            }
                                            connections.defaultConn.query(queryAddSkills,
                                                params)
                                                .then((result) => {
                                                    return res.send(JSON.stringify({msg: "OK"}));
                                                }).catch(err => {
                                                //handle error
                                                console.log(err);
                                                return res.send(JSON.stringify({msg: "FAIL"}));
                                            });
                                        } else {
                                            return res.send(JSON.stringify({msg: "FAIL"}));
                                        }
                                    }).catch(err => {
                                    //handle error
                                    console.log(err);
                                    return res.send(JSON.stringify({msg: "FAIL"}));
                                })
                            } else {
                                return res.send(JSON.stringify({msg: "FAIL"}));
                            }
                        }).catch(err => {
                        //handle error
                        console.log(err);
                        return res.send(JSON.stringify({msg: "FAIL"}));
                    });
                } else {
                    connections.defaultConn.query("INSERT INTO tasks (name, description, estimated_time, deadline) VALUES (?, ?, ?, ?) RETURNING id",
                        [name, description, time, date])
                        .then((rows) => {
                            delete rows.meta;
                            if (rows.length > 0) {
                                taskId = rows[0].id;
                                if (parameters.length !== 0) {
                                    // add skills
                                    let params = [];
                                    for (let el of parameters) {
                                        params.push(taskId);
                                        params.push(el);
                                    }
                                    connections.defaultConn.query(queryAddSkills,
                                        params)
                                        .then((result) => {
                                            return res.send(JSON.stringify({msg: "OK"}));
                                        }).catch(err => {
                                        //handle error
                                        console.log(err);
                                        return res.send(JSON.stringify({msg: "FAIL"}));
                                    });
                                } else {
                                    return res.send(JSON.stringify({msg: "OK"}));
                                }
                            } else {
                                return res.send(JSON.stringify({msg: "FAIL"}));
                            }
                        }).catch(err => {
                        //handle error
                        console.log(err);
                        return res.send(JSON.stringify({msg: "FAIL"}));
                    });
                }
            } catch (err) {
                res.status(500);
                return res.send(JSON.stringify({msg: "FAIL"}));
            }
        }
    } else {
        return res.send(JSON.stringify({msg: "FAIL"}));
    }
});

let nameValidate = [
    // check username -must be in form name_surname, length at least 3
    check('name').trim().escape().isLength({min: 1}).withMessage('Imię musi mieć co najmniej 1 znak'),
    // check password, length at least 8, must contain one special character and one number
    check('surname').trim().escape().isLength({ min: 1}).withMessage('Nazwisko musi mieć co najmniej 1 znak'),
    check('time').trim().escape().isNumeric().withMessage("Wymiar czasu pracy może zawierać tylko cyfry").isInt({min: 1, max: 24}).withMessage("Nieprawidłowa długość czasu pracy")
];

router.post('/add-person', nameValidate, (req, res) => {
    if (req.session.loggedIn && req.session.privileged) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors);
            res.send({msg: "FAIL", errors: errors.array().map((el) => {
                    return el.msg;
                })});
        } else {
            let name = req.body.name;
            let surname = req.body.surname;
            name = name.trim().toLowerCase();
            name = name.charAt(0).toUpperCase() + name.slice(1);
            surname = surname.trim().toLowerCase();
            surname = surname.charAt(0).toUpperCase() + surname.slice(1);
            let time = req.body.time;
            let username = name + "_" + surname;


            // generate password
            let randomString = Math.random().toString(36).slice(-8);
            // add one special character
            randomString += "!0"; // hash it

            validation.hashPassword(randomString).then(hashed => {
                try {
                    connections.defaultConn.query("CALL addUser(?, ?, ?); SELECT @usr AS username",
                        [username, hashed, time])
                        .then((rows) => {
                            delete rows[1].meta;
                            if (rows[1].length > 0) {
                                return res.send(JSON.stringify({msg: "OK", password: randomString, login: rows[1][0].username }));
                            } else {
                                return res.send(JSON.stringify({msg: "FAIL"}));
                            }
                        }).catch(err => {
                        //handle error
                        console.log(err);
                        return res.send(JSON.stringify({msg: "FAIL"}));
                    });
                } catch (err) {
                    res.status(500);
                    return res.send(JSON.stringify({msg: "FAIL"}));
                }
            });
        }
    } else {
        return res.send(JSON.stringify({msg: "FAIL"}));
    }
});

router.post('/delete-profile', (req, res) => {
    if (req.session.loggedIn) {
        try {
            connections.defaultConn.query("CALL deleteUser(?)", [req.session.userId])
                .then((result) => {
                    if (result.affectedRows >= 3) {
                        req.session.destroy(err => {
                            if (err) {
                                return res.send(JSON.stringify({msg: "FAIL"}));
                            } else {
                                return res.send(JSON.stringify({msg: "OK"}));
                            }
                        });
                    } else {
                        return res.send(JSON.stringify({msg: "FAIL"}));
                    }
                }).catch(err => {
                //handle error
                console.log(err);
                return res.send(JSON.stringify({msg: "FAIL"}));
            });
        } catch (err) {
            res.status(500);
            return res.send(JSON.stringify({msg: "FAIL"}));
        }
    } else {
        return res.send(JSON.stringify({msg: "FAIL"}));
    }
});

router.post('/generate-assigment', (req, res) => {
    if (req.session.loggedIn && req.session.privileged) {
        let peopleIds = req.body.people;
        let tasksIds = req.body.tasks;

        // check if all values are numeric
        for (let person of peopleIds) {
            if (isNaN(person) || isNaN(parseFloat(person))) {
                return res.send(JSON.stringify({msg: "FAIL"}));
            }
        }

        for (let task of tasksIds) {
            if (isNaN(task) || isNaN(parseFloat(task))) {
                return res.send(JSON.stringify({msg: "FAIL"}));
            }
        }

        if (peopleIds.length === 0 || tasksIds.length === 0) {
            return res.send(JSON.stringify({msg: "FAIL"}));
        }

        // find out the skills of tasks and people (get from database)
        let query = "SELECT id_user, id_skill, skill_level from skills_users WHERE ";
        for (let i = 0; i < peopleIds.length; i++) {
            if (i !== peopleIds.length - 1) {
                query += "id_user=? OR ";
            } else {
                query += "id_user=?";
            }
        }

       // now add query for tasks
        query += "; SELECT id_task, id_skill from skills_tasks WHERE "
        for (let i = 0; i < tasksIds.length; i++) {
            if (i !== tasksIds.length - 1) {
                query += "id_task=? OR ";
            } else {
                query += "id_task=?";
            }
        }
        try {
            connections.defaultConn.query(query, [...peopleIds, ...tasksIds])
                .then((rows) => {
                    for (let row of rows) {
                        delete row.meta;
                    }
                    // prepare list of people
                    let people = new Map();
                    // peopleIds is providing a map between ids in database and ids of nodes in graph
                    for (let i = 0; i < peopleIds.length; i++) {
                        people.set(peopleIds[i], new Map());
                        // add skills
                        for (let skill of rows[0]) {
                            if (String(skill.id_user) !== peopleIds[i]) {
                                continue;
                            }
                            people.get(peopleIds[i]).set(skill.id_skill, skill.skill_level);
                        }
                    }

                    // add dummy nodes if needed ('databse id' === -1)
                    if (peopleIds.length < tasksIds.length) {
                        let difference = tasksIds.length - peopleIds.length;
                        // add this many people with zero skills
                        for (let i = 0; i < difference; i++) {
                            peopleIds.push('-1');
                        }
                    }

                    // prepare list of tasks
                    // offset for ids is index in tasksIds + length of people list
                    let offsetTasks = peopleIds.length; // first index of tasks
                    let tasks = new Map();
                    for (let i = 0; i < tasksIds.length; i++) {
                        tasks.set(tasksIds[i], new Set());
                        // add skills
                        for (let skill of rows[1]) {
                            if (String(skill.id_task) !== tasksIds[i]) {
                                continue;
                            }
                            tasks.get(tasksIds[i]).add(skill.id_skill);
                        }
                    }

                    // add dummy nodes if needed ('databse id' === -1)
                        if (peopleIds.length > tasksIds.length) {
                            let difference = peopleIds.length - tasksIds.length;
                            // add this many tasks
                            for (let i = 0; i < difference; i++) {
                                tasksIds.push('-1');
                            }
                        }

                    let size = peopleIds.length;

                    // create graph (beware that different algorithms need directed or undirected graph)
                    //  TODO find out which method is the most sufficient one
                    let graph = new Graph( 2 * size, false);

                    // create edges (clique)
                    for (let i = 0; i < size; i++) {
                        for (let j = 0; j < size; j++) {
                            graph.addEdge(i, j + offsetTasks, 1, 0);
                        }
                    }


                    // now connect each person with each task and assign according weights to edges
                    // weight is the sum of levels of skills needed for this task
                    // if one doesn't have this skill, then the added value is equal to 0
                    for (let i = 0; i < size; i++) {
                        if (tasksIds[i] !== '-1') { // iterate over each task
                            // iterate over skills of this task
                            tasks.get(tasksIds[i]).forEach(skill => {
                               // iterate over each person
                                for (let j = 0; j < size; j++) {
                                    if (peopleIds[j] !== '-1') {
                                        if (people.get(peopleIds[j]) !== undefined && people.get(peopleIds[j]).get(skill) !== undefined) {
                                            graph.addWeightToEdge(j, i + offsetTasks, people.get(peopleIds[j]).get(skill));
                                        }
                                    }
                                }
                            });
                        }
                    }

                    // perform algorithm, get matching
                    let M = hungarian.hungarianAlgorithm(graph);
                    let matching = [];

                    M.forEach(match => {
                       if (peopleIds[match.source] !== '-1' && tasksIds[match.destination - offsetTasks] !== '-1') {
                           matching.push({source: peopleIds[match.source], destination: tasksIds[match.destination - offsetTasks]});
                       }
                    });
                    return res.send(JSON.stringify({result: matching}));

                }).catch(err => {
                //handle error
                console.log(err);
                return res.send(JSON.stringify({msg: "FAIL"}));
            });
        } catch (err) {
            res.status(500);
            return res.send(JSON.stringify({msg: "FAIL"}));
        }
    } else {
        return res.send(JSON.stringify({msg: "FAIL"}));
    }
});

router.post('/update-assignment', (req, res) => {
   if (req.session.loggedIn) {
        // build query
       let query = "";
       let matching = req.body.matching;
       matching.forEach(match => {
           if (isNaN(match.source) || isNaN(parseFloat(match.destination))) {
               return res.send(JSON.stringify({msg: "FAIL"}));
           }
       });

       for (let i = 0; i < matching.length; i++) {
           query += "UPDATE tasks SET assignee_id=? WHERE id=?; ";
       }

       // construct list of parameters
       let params = [];

       matching.forEach(match => {
          params.push(match.source);
          params.push(match.destination);
       });

       if (query !== "") {
           try {
               connections.defaultConn.query(query, params)
                   .then((result) => {
                       return res.send(JSON.stringify({msg: "OK"}));
                   }).catch(err => {
                   //handle error
                   console.log(err);
                   return res.send(JSON.stringify({msg: "FAIL"}));
               });
           } catch (err) {
               res.status(500);
               return res.send(JSON.stringify({msg: "FAIL"}));
           }
       } else {
           return res.send(JSON.stringify({msg: "FAIL"}));
       }
   } else {
       return res.send(JSON.stringify({msg: "FAIL"}));
   }
});

router.post('/check-feasibility', (req, res) => {
   if (req.session.loggedIn && req.session.privileged) {
       let peopleIds = req.body.people;
       let tasksStop = [];

       // check if all values are numeric
       for (let i = 0; i < peopleIds.length; i++) {
           if (isNaN(peopleIds[i]) || isNaN(parseFloat(peopleIds[i]))) {
               return res.send(JSON.stringify({msg: "FAIL"}));
           }
       }

       // build query
       let query = 'SELECT work_time FROM users WHERE ';
       let params = [];

       // quantitative metric

       for (let i = 0; i < peopleIds.length; i++) {
           if (i !== peopleIds.length - 1) {
               query += 'id=? OR ';
           } else {
               query += 'id=?;'
           }
           params.push(peopleIds[i]);
       }

       try {
           connections.defaultConn.query(query +
               "SELECT id, name, DATE_FORMAT(deadline, '%d-%m-%y') AS deadline, estimated_time FROM tasks WHERE status <> 'done' ORDER BY deadline", params)
                   .then((rows) => {
                       for (let i = 0; i < rows.length; i++) {
                           delete rows[i].meta;
                       }

                       // sum work time
                       let workTime = 0;
                       for (let person of rows[0]) {
                           workTime += parseInt(person.work_time);
                       }

                       let tasks = rows[1];
                       // get today's date
                       let currentDate = new Date();
                       currentDate = new Date(currentDate.setDate(new Date(currentDate.setHours(0, 0, 0, 0)).getDate() + 1));
                       let previousDate = currentDate;
                       workTime = workTime * 60;
                       let availableMinutes = 0;
                       let previousMinutes = availableMinutes;

                       for (let i = 0; i < tasks.length; i++) {
                           // check if this task is feasible to get done before deadline
                           let date = String(tasks[i].deadline).split('-');
                           let deadline = new Date("20" + date[2] + "-" + date[1] + "-" + date[0]);
                           //deadline = deadline.setDate(deadline.getDate() + 1);
                           let time = tasks[i].estimated_time.split(":");
                           let minutesTask = parseInt(time[0]) * 60 + parseInt(time[1]);
                           currentDate.setHours(0, 0, 0, 0);
                           previousDate = currentDate;
                           previousMinutes = availableMinutes;
                           // first saturate minutes, then hours
                           while (currentDate <= deadline && minutesTask !== 0) {
                               let dayOfWeek = currentDate.getDay();
                               if (dayOfWeek !== 0 && dayOfWeek !== 6) { // not weekend
                                   // add hours of work
                                   // saturate minutes
                                   let subtract = min(availableMinutes, minutesTask);
                                   availableMinutes -= subtract;
                                   minutesTask -= subtract;
                               }

                               if (availableMinutes === 0) {
                                   currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
                                   dayOfWeek = currentDate.getDay();
                                   availableMinutes += workTime;
                               }
                           }
                           if (minutesTask !== 0) {
                               // not feasible to do, send info about which task needs to be delegated
                               tasksStop.push(tasks[i]);
                               console.log(tasks[i]);
                               // rollback to the previous state when work flow was feasible
                               currentDate = previousDate;
                               availableMinutes = previousMinutes;
                           }
                       }

                       // get skills for this tasks
                       params = [];
                       query = "SELECT id_skill FROM skills_tasks WHERE ";
                       for (let i = 0; i < tasksStop.length; i++) {
                           if (i !== tasksStop.length - 1) {
                               query += "id_task=? OR "
                           } else {
                               query += "id_task=?;"
                           }
                           params.push(tasksStop[i].id);
                       }

                       connections.defaultConn.query(query, params)
                           .then((rows) => {
                               delete rows.meta;
                               let skillsIds = [];
                               // create a unique list of this ids
                               for (let skillId of rows) {
                                   if (!skillsIds.includes(skillId.id_skill)) {
                                       skillsIds.push(skillId.id_skill);
                                   }
                               }

                               // get names of these skills
                               query = "SELECT name FROM skills WHERE ";
                               for (let i = 0; i < skillsIds.length; i++) {
                                   if (i !== skillsIds.length - 1) {
                                       query += "id=? OR ";
                                   } else {
                                       query += "id=?;";
                                   }
                               }
                               connections.defaultConn.query(query, skillsIds)
                                   .then((rows) => {
                                       let skillsNames = [];
                                       delete rows.meta;
                                       // create a unique list of this ids
                                       for (let skill of rows) {
                                           skillsNames.push(skill.name);
                                       }

                                       console.log(tasksStop);
                                       console.log(skillsNames);
                                       return res.send(JSON.stringify({list: tasksStop, skills: skillsNames}));
                                   });
                           });
                   });
       } catch (err) {
               res.status(500);
               return res.send(JSON.stringify({msg: "FAIL"}));
       }
   } else {
       return res.send(JSON.stringify({msg: "FAIL"}));
   }
});

router.delete('/logout', (req, res) => {
   if (req.session.loggedIn) {
       req.session.destroy(err => {
           if (err) {
               return res.send(JSON.stringify({msg: "FAIL"}));
           } else {
               return res.send(JSON.stringify({msg: "OK"}));
           }
       });
   } else {
       return res.send(JSON.stringify({msg: "FAIL"}));
   }
});

module.exports = router;