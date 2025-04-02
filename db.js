const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'server_data.json');

// Initialize database with all required sections
if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({
        prefixes: {},
        economy: {},
        cooldowns: {}
    }, null, 2));
}

function getDB() {
    return JSON.parse(fs.readFileSync(dbPath));
}

function saveDB(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

module.exports = {
    // Prefix handling
    getPrefix(guildId) {
        return getDB().prefixes?.[guildId];
    },

    setPrefix(guildId, prefix) {
        const db = getDB();
        db.prefixes = db.prefixes || {};
        db.prefixes[guildId] = prefix;
        saveDB(db);
    },

    // Economy handling
    getServerEconomy(guildId) {
        const db = getDB();
        if (!db.economy[guildId]) {
            db.economy[guildId] = { users: {} };
            saveDB(db);
        }
        return db.economy[guildId];
    },

    getUserBalance(guildId, userId) {
        const server = this.getServerEconomy(guildId);
        if (!server.users[userId]) {
            server.users[userId] = { wallet: 0, bank: 0 };
            saveDB(getDB());
        }
        return server.users[userId];
    },

    setUserBalance(guildId, userId, balance) {
        const db = getDB();
        db.economy[guildId] = db.economy[guildId] || { users: {} };
        db.economy[guildId].users[userId] = balance;
        saveDB(db);
    },

    // Cooldown handling
    getCooldowns() {
        return getDB().cooldowns || {};
    },

    setCooldowns(cooldowns) {
        const db = getDB();
        db.cooldowns = cooldowns;
        saveDB(db);
    },

    // Server initialization
    initServer(guildId) {
        const db = getDB();
        if (!db.economy[guildId]) {
            db.economy[guildId] = { users: {} };
            db.prefixes[guildId] = db.prefixes[guildId] || '*';
            saveDB(db);
        }
    }
};