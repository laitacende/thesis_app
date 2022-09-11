var Node = require('./Node.js');

// TODO jakies godzinowe ograniczenia itp.

class Person extends Node {
    /**
     * competences this person has (map - id:level)
     */
    skills;
    username;
    id;

    constructor(key, username, id) {
        super(key);
        this.skills = new Map();
        this.username = username;
        this.id = id;
    }

    addSkill(skillId, level) {
        this.skills.set(skillId, level);
    }
}

module.exports = Person;