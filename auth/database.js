const Database = require('better-sqlite3');
const path = require('path');

// The database will be created inside the 'auth' directory
const db = new Database(path.join(__dirname, 'cns_auth.db'));

db.pragma('journal_mode = WAL');

const createUsersTable = () => {
    const sql = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            pin_hash TEXT NOT NULL,
            user_data TEXT DEFAULT '{}',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login_timestamp DATETIME,
            last_login_ip TEXT,
            is_active INTEGER DEFAULT 1
        )
    `;
    db.exec(sql);
    console.log('✓ Auth users table ready');
};

const createIndexes = () => {
    db.exec('CREATE INDEX IF NOT EXISTS idx_username ON users(username)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_active ON users(is_active)');
};

const userOps = {
    create: (username, pinHash) => {
        const stmt = db.prepare(`
            INSERT INTO users (username, pin_hash, user_data)
            VALUES (?, ?, ?)
        `);

        const defaultUserData = JSON.stringify({
            profile: {
                displayName: username,
                avatar: null,
                level: 1,
                joinDate: new Date().toISOString()
            },
            services: {} // Namespace for service-specific data
        });

        return stmt.run(username, pinHash, defaultUserData);
    },

    findByUsername: (username) => {
        const stmt = db.prepare('SELECT * FROM users WHERE username = ? AND is_active = 1');
        return stmt.get(username);
    },

    updateLastLogin: (userId, ip) => {
        const stmt = db.prepare(`
            UPDATE users
            SET last_login_timestamp = CURRENT_TIMESTAMP,
                last_login_ip = ?
            WHERE id = ?
        `);
        return stmt.run(ip, userId);
    },

    getUserData: (userId) => {
        const stmt = db.prepare('SELECT id, username, user_data FROM users WHERE id = ?');
        const result = stmt.get(userId);
        if (!result) return null;

        const userData = JSON.parse(result.user_data);
        return {
            userId: result.id,
            username: result.username,
            ...userData
        };
    },

    getServiceData: (userId, service) => {
        const allData = userOps.getUserData(userId);
        return allData?.services?.[service] || null;
    },

    updateServiceData: (userId, service, data) => {
        const currentUserData = userOps.getUserData(userId);
        if (!currentUserData) throw new Error('User not found');

        if (!currentUserData.services) {
            currentUserData.services = {};
        }
        currentUserData.services[service] = data;

        const { userId: id, username, ...userDataToSave } = currentUserData;

        const stmt = db.prepare('UPDATE users SET user_data = ? WHERE id = ?');
        return stmt.run(JSON.stringify(userDataToSave), userId);
    }
};

const initDatabase = () => {
    try {
        createUsersTable();
        createIndexes();
        console.log('✓ Auth database initialized');
    } catch (error) {
        console.error('Auth database error:', error);
        throw error;
    }
};

module.exports = {
    db,
    initDatabase,
    userOps
};
