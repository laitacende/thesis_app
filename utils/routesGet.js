/**
 * GET queries:
 * - "/" redirect to login page or home, if user already logged in,
 * - "/home" render homepage,
 * - "/profile?userId=_&displayBack=_" render page with profile of user with identifier
 *    userId in database. Display back arrow (navigation) if parameter true,
 * - "/task?id=_" render page with task details of task with id in database,
 * - "/kanban?filter=_" render kanban (task board) page. Filter determines what
 *    task will be displayed - options: "all" (display all), "mine" (only
 *    assigned to current user), "none" (unassigned),
 * - "/people" render page with list of people,
 * - "/assignment" render page with generating the assignment,
 * - "/people-search?username=?" obtain list (only usernames) with users whose names are like
 *    this specified in username parameter,
 * - "/people-search-request?search=_" render list (username, id, profile picture) with users
 *    whose names are like this specified in username parameter,
 * - "/skills-search?search=_"  obtain skills list (id, name) with skills which names are like
 *    this specified in search parameter,
 * - "/skills-list?userId=_" get skills list for user with userId,
 * - "/delete-success" render page with deleting a task success,
 * - "/new-task-success" render page with creating a new task success,
 * - "/change-password" render page with form to change a password,
 * - "/delete-success-profile" render page with deleting an account success,
 * - "/people-list?search=_" obtain list (username, id, profile picture) with users
 *    whose names are like this specified in username parameter,
 * - "/tasks-list?search=_" obtain list of tasks with names likes this specified in
 *    search parameter,
 * - "/project-state" render page to simulate project feasibility in terms of time,
 * - "/help" render page with help,
 * - "/about" render page with description of the tool.
 */

const connections = require('./databse');
const express = require('express');
const router = express.Router();
const fs = require("fs");
const ESAPI = require('node-esapi');

let min = (first, second) => {
    return first < second ? first : second;
}

router.get("/", (req, res) => {
    if (req.session.loggedIn) {
        return res.redirect("/home");
    } else {
        return res.render('index.ejs', {
            errors: undefined,
            displayBack: false
        });
    }
});

router.get("/home", (req, res) => {
    if (req.session.loggedIn) {
        // get tasks statistics from database
        try {
            connections.defaultConn.query("SELECT COUNT(*) AS counter FROM tasks WHERE status = 'todo';" +
                "SELECT COUNT(*) AS counter FROM tasks WHERE status = 'inprogress';" +
                "SELECT COUNT(*) AS counter FROM tasks WHERE status = 'done';" +
                "SELECT DATE_FORMAT(deadline, '%d-%m-%y') AS deadline FROM tasks ORDER BY deadline DESC LIMIT 1")
                .then((rows) => {
                    for (let i = 0; i < rows.length; i++) {
                        delete rows[i].meta;
                    }
                    if (rows[0].length > 0 && rows[1].length > 0 && rows[2].length > 0) {
                        return res.render(`main_panel.ejs`, {
                            privileged: ESAPI.encoder().encodeForHTML(String(req.session.privileged)),
                            userId: ESAPI.encoder().encodeForHTML(String(req.session.userId)),
                            displayBack: false,
                            todoCounter: ESAPI.encoder().encodeForHTML(String(rows[0][0].counter)),
                            inprogressCounter: ESAPI.encoder().encodeForHTML(String(rows[1][0].counter)),
                            doneCounter: ESAPI.encoder().encodeForHTML(String(rows[2][0].counter)),
                            finishDate: rows[3][0] === undefined ? "brak" : rows[3][0].deadline
                        });
                    } else {
                        return res.render('error_full.ejs', {msg: "Wystąpił błąd"});
                    }
                }).catch(err => {
                    //handle error
                    console.log(err);
                    return res.render('error_full.ejs', {msg: "Wystąpił błąd"});
            });
        } catch (err) {
            res.status(500);
            return res.render('error_full.ejs', {msg: "Błąd połączenia z bazą danych"});
        }
    } else {
        return res.render('error_full.ejs', {msg: "Wymagane jest zalogowanie się"});
    }
});

router.get("/profile", (req, res) => {
    if (req.session.loggedIn) {
        let displayBack = true;
        if (req.query.back) {
            displayBack = false;
        }
        // get profile picture and skills
        let userId = req.query.user;
        // check format
        if (!isNaN(userId) && !isNaN(parseFloat(userId))) { // second condition to eliminate strings of whitespace
            try {
                connections.defaultConn.query("SELECT username, profile_picture, work_time FROM users WHERE id=?; " +
                    "SELECT s.id, s.name, su.skill_level FROM skills_users su JOIN skills s ON su.id_skill = s.id WHERE su.id_user=? ORDER BY su.skill_level DESC;" +
                    "SELECT COUNT(*) AS counter FROM tasks WHERE assignee_id = ? AND status = 'todo';" +
                    "SELECT COUNT(*) AS counter FROM tasks WHERE assignee_id = ? AND status = 'inprogress';" +
                    "SELECT COUNT(*) AS counter FROM tasks WHERE assignee_id = ? AND status = 'done';" +
                    "SELECT id, name, DATE_FORMAT(deadline, '%d-%m-%y') AS deadline, estimated_time FROM tasks WHERE assignee_id = ? AND status <> 'done' ORDER BY deadline", [userId, userId, userId, userId, userId, userId])
                    .then((rows) => {
                        for (let i = 0; i < rows.length; i++) {
                            delete rows[i].meta;
                        }
                        if (rows[0].length > 0) { // there are some users
                            let iconsList = [];
                            if (req.session.userId == userId) {
                                fs.readdirSync("./website/webapp/img/icons").forEach(file => {
                                    iconsList.push(file);
                                });
                            }

                            // check if the person can manage to do all the assigned tasks
                            let tasks = rows[5];
                            // get today's date
                            let currentDate = new Date();
                            currentDate = new Date(currentDate.setDate(new Date(currentDate.setHours(0, 0, 0, 0)).getDate() + 1));
                            let previousDate = currentDate;
                            let workTime = parseInt(rows[0][0].work_time) * 60;
                            let availableMinutes = 0;
                            let previousMinutes = availableMinutes;
                            let tasksStop = [];

                            for (let i = 0; i < tasks.length; i++) {
                                // check if this task is feasible to get done before deadline
                                let date = String(tasks[i].deadline).split('-');
                                let deadline = new Date("20" + date[2] + "-" + date[1] + "-" + date[0]);
                                //deadline = deadline.setDate(deadline.getDate() + 1);
                                let time = tasks[i].estimated_time.split(":");
                                let minutesTask = parseInt(time[0]) * 60 + parseInt(time[1]);
                                currentDate.setHours(0,0,0,0);
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
                                    // rollback to the previous state when work flow was feasible
                                    currentDate = previousDate;
                                    availableMinutes = previousMinutes;
                                }
                            }

                            return res.render(`profile.ejs`, {
                                userId: ESAPI.encoder().encodeForHTML(String(req.session.userId)),
                                isMine: req.session.userId == userId,
                                username: rows[0][0].username.replace("_", " "), // really, no need for escaping, as ejs template does this
                                profilePicture: ESAPI.encoder().encodeForHTML(String(rows[0][0].profile_picture)),
                                workTime: ESAPI.encoder().encodeForHTML(String(rows[0][0].work_time)),
                                skillsList: rows[1],
                                todoCounter: ESAPI.encoder().encodeForHTML(String(rows[2][0].counter)),
                                inprogressCounter: ESAPI.encoder().encodeForHTML(String(rows[3][0].counter)),
                                doneCounter: ESAPI.encoder().encodeForHTML(String(rows[4][0].counter)),
                                iconsList: iconsList,
                                displayBack: displayBack,
                                tasksStop: tasksStop,
                                privileged: ESAPI.encoder().encodeForHTML(String(req.session.privileged)),
                            });
                        } else {
                            return res.render('error_full.ejs', {msg: "Wystąpił błąd"});
                        }
                    }).catch(err => {
                    //handle error
                    console.log(err);
                    return res.render('error_full.ejs', {msg: "Wystąpił błąd"});
                });
            } catch (err) {
                res.status(500);
                return res.render('error_full.ejs', {msg: "Błąd połączenia z bazą danych"});
            }
        }
    } else {
        return res.render('error_full.ejs', {msg: "Wymagane jest zalogowanie się"});
    }
});

router.get("/task", (req, res) => {
    if (req.session.loggedIn) {
        let taskId = req.query.id;
        taskId = taskId.trim();
        if (!isNaN(taskId) && !isNaN(parseFloat(taskId))) {
            try {
                connections.defaultConn.query("SELECT t.name, t.estimated_time, t.status, t.description, DATE_FORMAT(t.deadline, '%d-%m-%y') AS deadline, DATE_FORMAT(t.deadline, '%Y-%m-%d') AS deadline_format, u.username FROM tasks t JOIN users u ON t.assignee_id=u.id WHERE t.id=?;" +
                    "SELECT t.name, t.estimated_time, t.status, t.description, DATE_FORMAT(t.deadline, '%d-%m-%y') AS deadline, DATE_FORMAT(t.deadline, '%Y-%m-%d') AS deadline_format FROM tasks t WHERE t.id=?;" +
                    "SELECT s.id, s.name FROM skills_tasks st JOIN skills s ON st.id_skill = s.id WHERE st.id_task=? ORDER BY s.name DESC", [taskId, taskId, taskId])
                    .then((rows) => {
                        for (let i = 0; i < rows.length; i++) {
                            delete rows[i].meta;
                        }
                        rows[0].push(...rows[1]);
                        return res.render(`task.ejs`, {
                            userId: ESAPI.encoder().encodeForHTML(String(req.session.userId)),
                            displayBack: true,
                            taskId: taskId,
                            taskName: rows[0][0].name,
                            estimatedTime: rows[0][0].estimated_time,
                            deadline: rows[0][0].deadline,
                            deadlineFormat: rows[0][0].deadline_format,
                            taskStatus: rows[0][0].status,
                            assignee: rows[0][0].username,
                            description: rows[0][0].description,
                            skillsList: rows[2],
                            privileged: ESAPI.encoder().encodeForHTML(String(req.session.privileged)),
                        });
                    }).catch(err => {
                    //handle error
                    console.log(err);
                    return res.render('error_full.ejs', {msg: "Wystąpił błąd"});
                });
            } catch (err) {
                res.status(500);
                return res.render('error_full.ejs', {msg: "Błąd połączenia z bazą danych"});
            }
        }
    } else {
        return res.render('error_full.ejs', {msg: "Wymagane jest zalogowanie się"});
    }
});

router.get("/kanban", (req, res) => {
    if (req.session.loggedIn) {
        // get all tasks from database
        try {
            if (req.query.filter === "all") {
                connections.defaultConn.query("SELECT t.id, t.name, t.estimated_time, u.username  FROM tasks t JOIN users u ON t.assignee_id=u.id  WHERE t.status='todo';" +
                    "SELECT t.id, t.name, t.estimated_time, u.username  FROM tasks t JOIN users u ON t.assignee_id=u.id  WHERE t.status='inprogress';" +
                    "SELECT t.id, t.name, t.estimated_time, u.username  FROM tasks t JOIN users u ON t.assignee_id=u.id  WHERE t.status='done';" +
                    "SELECT id, name, estimated_time FROM tasks WHERE assignee_id IS NULL AND status='todo';" +
                    "SELECT id, name, estimated_time FROM tasks WHERE assignee_id IS NULL AND status='inprogress'; " +
                    "SELECT id, name, estimated_time FROM tasks WHERE assignee_id IS NULL AND status='done'")
                    .then((rows) => {
                        for (let i = 0; i < rows.length; i++) {
                            delete rows[i].meta;
                        }
                        // add those without assignee
                        rows[0].push(...rows[3]);
                        rows[1].push(...rows[4]);
                        rows[2].push(...rows[5]);
                        return res.render(`kanban.ejs`, {
                            userId: ESAPI.encoder().encodeForHTML(String(req.session.userId)),
                            displayBack: false,
                            todo: rows[0],
                            inprogress: rows[1],
                            done: rows[2],
                            active: "all",
                            privileged: ESAPI.encoder().encodeForHTML(String(req.session.privileged)),
                        });
                    }).catch(err => {
                    //handle error
                    console.log(err);
                    return res.render('error_full.ejs', {msg: "Wystąpił błąd"});
                });
            } else if (req.query.filter === "mine") {
                connections.defaultConn.query("SELECT t.id, t.name, t.estimated_time, u.username  FROM tasks t JOIN users u ON t.assignee_id=u.id  WHERE t.status='todo' AND u.id=?;" +
                    "SELECT t.id, t.name, t.estimated_time, u.username  FROM tasks t JOIN users u ON t.assignee_id=u.id  WHERE t.status='inprogress' AND u.id=?;" +
                    "SELECT t.id, t.name, t.estimated_time, u.username  FROM tasks t JOIN users u ON t.assignee_id=u.id  WHERE t.status='done' AND u.id=?", [req.session.userId, req.session.userId, req.session.userId])
                    .then((rows) => {
                        for (let i = 0; i < rows.length; i++) {
                            delete rows[i].meta;
                        }
                        return res.render(`kanban.ejs`, {
                            userId: ESAPI.encoder().encodeForHTML(String(req.session.userId)),
                            displayBack: false,
                            todo: rows[0],
                            inprogress: rows[1],
                            done: rows[2],
                            active: "mine",
                            privileged: ESAPI.encoder().encodeForHTML(String(req.session.privileged)),
                        });
                    }).catch(err => {
                    //handle error
                    console.log(err);
                    return res.render('error_full.ejs', {msg: "Wystąpił błąd"});
                });
            } else if (req.query.filter === "none") {
                connections.defaultConn.query("SELECT t.id, t.name, t.estimated_time FROM tasks t WHERE t.status='todo' AND t.assignee_id IS NULL;" +
                    "SELECT t.id, t.name, t.estimated_time FROM tasks t WHERE t.status='inprogress' AND t.assignee_id IS NULL;" +
                    "SELECT t.id, t.name, t.estimated_time FROM tasks t WHERE t.status='done' AND t.assignee_id IS NULL")
                    .then((rows) => {
                        for (let i = 0; i < rows.length; i++) {
                            delete rows[i].meta;
                        }
                        return res.render(`kanban.ejs`, {
                            userId: ESAPI.encoder().encodeForHTML(String(req.session.userId)),
                            displayBack: false,
                            todo: rows[0],
                            inprogress: rows[1],
                            done: rows[2],
                            active: "none",
                            privileged: ESAPI.encoder().encodeForHTML(String(req.session.privileged)),
                        });
                    }).catch(err => {
                    //handle error
                    console.log(err);
                    return res.render('error_full.ejs', {msg: "Wystąpił błąd"});
                });
            } else {
                return res.render('error_full.ejs', {msg: "Wystąpił błąd"});
            }
        } catch (err) {
            res.status(500);
            return res.render('error_full.ejs', {msg: "Błąd połączenia z bazą danych"});
        }
    } else {
        return res.render('error_full.ejs', {msg: "Wymagane jest zalogowanie się"});
    }
});

router.get("/people", (req, res) => {
    if (req.session.loggedIn) {
        // get list of people in alphabetic order from database
        // TODO change to another connection
        try {
            connections.defaultConn.query("SELECT id, username, profile_picture FROM users ORDER BY username")
                .then((rows) => {
                    delete rows.meta;
                    if (rows.length > 0) { // there are some users
                        return res.render(`people.ejs`, {
                            peopleList: rows,
                            privileged: ESAPI.encoder().encodeForHTML(String(req.session.privileged)),
                            userId: ESAPI.encoder().encodeForHTML(String(req.session.userId)),
                            displayBack: false,
                        });
                    } else {
                        return res.render('error_full.ejs', {msg: "Wystąpił błąd"});
                    }
                }).catch(err => {
                //handle error
                console.log(err);
                return res.render('error_full.ejs', {msg: "Wystąpił błąd"});
            });
        } catch (err) {
            res.status(500);
            return res.render('error_full.ejs', {msg: "Błąd połączenia z bazą danych"});
        }
    } else {
        return res.render('error_full.ejs', {msg: "Wymagane jest zalogowanie się"});
    }
});

router.get("/assignment", (req, res) => {
    if (req.session.loggedIn) {
        // get list of people in alphabetic order from database
        // TODO change to another connection
        try {
            connections.defaultConn.query("SELECT id, username, profile_picture FROM users ORDER BY username")
                .then((rows) => {
                    delete rows.meta;
                    if (rows.length > 0) { // there are some users
                        res.render(`assignment.ejs`, {
                            userId: ESAPI.encoder().encodeForHTML(String(req.session.userId)),
                            displayBack: false,
                            peopleList: rows,
                            active: "people",
                            privileged: ESAPI.encoder().encodeForHTML(String(req.session.privileged)),
                        });
                    } else {
                        return res.render('error_full.ejs', {msg: "Wystąpił błąd"});
                    }
                }).catch(err => {
                //handle error
                console.log(err);
                return res.render('error_full.ejs', {msg: "Wystąpił błąd"});
            });
        } catch (err) {
            res.status(500);
            return res.render('error_full.ejs', {msg: "Błąd połączenia z bazą danych"});
        }
    } else {
        return res.render('error_full.ejs', {msg: "Wymagane jest zalogowanie się"});
    }
});

router.get("/people-search", (req, res) => {
    if (req.session.loggedIn) {
        let query = ["%"];
        if (req.query.username || req.query.username === "") {
            query = ['%' + req.query.username + '%'];
        }
        // TODO change to another connection
        try {
            connections.defaultConn.query("SELECT username FROM users WHERE username LIKE ? ORDER BY username", query)
                .then((rows) => {
                    delete rows.meta;
                    return res.send(rows);
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
        return res.render('error_full.ejs', {msg: "Wymagane jest zalogowanie się"});
    }
});

router.get("/people-search-request", (req, res) => {
    if (req.session.loggedIn) {
        // load users with username like in request
        let query = ["%"];
        if (req.query.search || req.query.search === "") {
            query = ['%' + req.query.search + '%'];
        }
        // TODO change to another connection
        try {
            connections.defaultConn.query("SELECT id, username, profile_picture FROM users WHERE username LIKE ? ORDER BY username", query)
                .then((rows) => {
                    delete rows.meta;
                    if (rows.length > 0) {
                        return res.render(`people.ejs`, {
                            peopleList: rows,
                            privileged: ESAPI.encoder().encodeForHTML(String(req.session.privileged)),
                            userId: ESAPI.encoder().encodeForHTML(String(req.session.userId)),
                            displayBack: false
                        });
                    } else {
                        return res.render('error_full.ejs', {msg: "Wystąpił błąd"});
                    }
                }).catch(err => {
                //handle error
                console.log(err);
                return res.render('error_full.ejs', {msg: "Wystąpił błąd"});
            });
        } catch (err) {
            res.status(500);
            return res.render('error_full.ejs', {msg: "Błąd połączenia z bazą danych"});
        }
    } else {
        return res.render('error_full.ejs', {msg: "Wymagane jest zalogowanie się"});
    }
});

router.get("/skills-search", (req, res) => {
    if (req.session.loggedIn) {
        // load skills
        let query = ["%"];
        if (req.query.search || req.query.search === "") {
            query = ['%' + decodeURIComponent(req.query.search) + '%'];
        }
        // TODO change to another connection
        try {
            connections.defaultConn.query("SELECT id, name FROM skills WHERE name LIKE ? ORDER BY name", query)
                .then((rows) => {
                    delete rows.meta;
                    return res.send(rows);
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
        return res.render('error_full.ejs', {msg: "Wymagane jest zalogowanie się"});
    }
});

router.get('/skills-list', (req, res) => {
    if (req.session.loggedIn) {
        try {
            connections.defaultConn.query("SELECT s.id, s.name, su.skill_level FROM skills_users su JOIN skills s ON su.id_skill = s.id WHERE su.id_user=? ORDER BY su.skill_level DESC", [req.session.userId])
                .then((rows) => {
                    delete rows.meta;
                    if (rows.length > 0) {
                        return res.send(JSON.stringify(rows));
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
        return res.render('error_full.ejs', {msg: "Wymagane jest zalogowanie się"});
    }
});

router.get('/delete-success', (req, res) => {
    if (req.session.loggedIn) {
        return res.render('message.ejs', {
            msg: "Zadanie zostało usunięte.",
            link: "https://localhost:4000/kanban?filter=all",
            linkMsg: "Wróć do widoku zadań",
            userId: ESAPI.encoder().encodeForHTML(String(req.session.userId)),
            displayBack: false,
            privileged: ESAPI.encoder().encodeForHTML(String(req.session.privileged)),
        });
    } else {
        return res.render('error_full.ejs', {msg: "Wymagane jest zalogowanie się"});
    }
});

router.get('/new-task-success', (req, res) => {
    if (req.session.loggedIn) {
        return res.render('message.ejs', {
            msg: "Zadanie zostało utworzone.",
            link: "https://localhost:4000/kanban?filter=all",
            linkMsg: "Wróć do widoku zadań",
            userId: ESAPI.encoder().encodeForHTML(String(req.session.userId)),
            displayBack: false,
            privileged: ESAPI.encoder().encodeForHTML(String(req.session.privileged)),
        });
    } else {
        return res.render('error_full.ejs', {msg: "Wymagane jest zalogowanie się"});
    }
});

router.get('/change-password', (req, res) => {
    if (req.session.loggedIn) {
        return res.render('change_password.ejs', {
            firstTime: req.session.firstTime,
            userId: ESAPI.encoder().encodeForHTML(String(req.session.userId)),
            displayBack: false,
            errors: undefined,
            privileged: ESAPI.encoder().encodeForHTML(String(req.session.privileged)),
        });
    } else {
        return res.render('error_full.ejs', {msg: "Wymagane jest zalogowanie się"});
    }
});

router.get('/delete-success-profile', (req, res) => {
   if (req.session.loggedIn) {
        return res.render('message.ejs', {
            msg: "Konto zostało usunięte",
            linkMsg: "Wróć do ekranu logowania",
            link: "https://localhost:4000/",
            userId: -1,
            displayBack: false,
            privileged: ESAPI.encoder().encodeForHTML(String(req.session.privileged)),
        });
   }
});

router.get('/people-list', (req, res) => {
    if (req.session.loggedIn) {
        let query = ["%"];
        if (req.query.search || req.query.search === "") {
            query = ['%' + decodeURIComponent(req.query.search) + '%'];
        }

        // get list of people in alphabetic order from database
        // TODO change to another connection
        try {
            connections.defaultConn.query("SELECT id, username, profile_picture FROM users WHERE username LIKE ? ORDER BY username", query)
                .then((rows) => {
                    delete rows.meta;
                    return res.send(rows);
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

router.get('/tasks-list', (req, res) => {
    if (req.session.loggedIn) {
        let query = ["%"];
        if (req.query.search || req.query.search === "") {
            query = ['%' + decodeURIComponent(req.query.search) + '%'];
        }
        // TODO change to another connection
        try {
            connections.defaultConn.query("SELECT id, name, status FROM tasks WHERE name LIKE ? ORDER BY id", [query])
                .then((rows) => {
                    delete rows.meta;
                    res.send(rows);
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

router.get('/project-state', (req, res) => {
   if (req.session.loggedIn) {
       try {
           // get also which people are already working in this project
           connections.defaultConn.query("SELECT id, username, profile_picture FROM users ORDER BY username; SELECT u.id, u.username, u.profile_picture FROM users u JOIN tasks t ON u.id=t.assignee_id;")
               .then((rows) => {
                   for (let row of rows) {
                       delete row.meta;
                   }

                   // construct a set of unused people
                   let freePeople = new Set();
                   // construct set of used people
                   let occupiedPeople = new Set();
                   let broken = false;

                   for (let i = 0; i < rows[0].length; i++) {
                       broken = false;
                       for (let j = 0; j < rows[1].length; j++) {
                           if (rows[0][i].id === rows[1][j].id) {
                               // person is used in project
                               occupiedPeople.add(rows[0][i]);
                               broken = true;
                               break;
                           }
                       }
                       if (!broken) {
                           // this person is free
                           freePeople.add(rows[0][i]);
                       }
                   }

                   if (rows[0].length > 0) {
                       return res.render(`project_overview.ejs`, {
                           userId: ESAPI.encoder().encodeForHTML(String(req.session.userId)),
                           displayBack: true,
                           peopleList: freePeople,
                           peopleUsed: occupiedPeople,
                           privileged: ESAPI.encoder().encodeForHTML(String(req.session.privileged)),
                       });
                   } else {
                       return res.render('error_full.ejs', {msg: "Wystąpił błąd"});
                   }
               }).catch(err => {
               //handle error
               console.log(err);
               return res.render('error_full.ejs', {msg: "Wystąpił błąd"});
           });
       } catch (err) {
           res.status(500);
           return res.render('error_full.ejs', {msg: "Błąd połączenia z bazą danych"});
       }
   } else {
       return res.render('error_full.ejs', {msg: "Wymagane jest zalogowanie się"});
   }
});

router.get("/help", (req, res) => {
    if (req.session.loggedIn) {
        return res.render(`help.ejs`, {
            userId: ESAPI.encoder().encodeForHTML(String(req.session.userId)),
            displayBack: false,

            privileged: ESAPI.encoder().encodeForHTML(String(req.session.privileged)),
        });
    } else {
        return res.render('error_full.ejs', {msg: "Wymagane jest zalogowanie się"});
    }
});

router.get("/about", (req, res) => {
    if (req.session.loggedIn) {
        return res.render(`about.ejs`, {
            userId: ESAPI.encoder().encodeForHTML(String(req.session.userId)),
            displayBack: false,

            privileged: ESAPI.encoder().encodeForHTML(String(req.session.privileged)),
        });
    } else {
        return res.render('error_full.ejs', {msg: "Wymagane jest zalogowanie się"});
    }
});

module.exports = router;