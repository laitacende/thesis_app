var Node = require('./Node.js');

class Task extends Node {
    /**
     * competences required for this task (map - name:level)
     */
    skills;
    name;
    description;
    deadline;
    id;

    constructor(key, id) {
        super(key);
        this.skills = new Map();
        this.name = "";
        this.description = "";
        this.id = id;
    }

    addSkill(skillId) {
        this.skills.set(skillId);
    }

    setName(name) {
        this.name = name;
    }

    setDescription(description) {
        this.description = description;
    }

    setDeadline(deadline) {
        this.deadline = deadline;
    }

}

module.exports = Task;