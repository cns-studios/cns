const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'cns_users.db'));

db.pragma('journal_mode = WAL');

const createUsersTable = () => {
    const sql = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            pin_hash TEXT NOT NULL,
            user_data TEXT DEFAULT '{}',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME,
            is_active INTEGER DEFAULT 1
        )
    `;
    db.exec(sql);
    console.log('✓ Users table ready');
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
            projects: {
                favorites: [],
                accessed: []
            },
            settings: {
                theme: 'retro-dark',
                notifications: true
            },
            activity: {
                lastActive: new Date().toISOString(),
                totalLogins: 0
            }
        });
        
        return stmt.run(username, pinHash, defaultUserData);
    },
    
    findByUsername: (username) => {
        const stmt = db.prepare('SELECT * FROM users WHERE username = ? AND is_active = 1');
        return stmt.get(username);
    },
    
    updateLastLogin: (userId) => {
        const stmt = db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?');
        return stmt.run(userId);
    },
    
    getUserData: (userId) => {
        const stmt = db.prepare('SELECT user_data FROM users WHERE id = ?');
        const result = stmt.get(userId);
        return result ? JSON.parse(result.user_data) : null;
    },
    
    updateUserData: (userId, userData) => {
        const stmt = db.prepare('UPDATE users SET user_data = ? WHERE id = ?');
        return stmt.run(JSON.stringify(userData), userId);
    }
};

const initDatabase = () => {
    try {
        createUsersTable();
        createIndexes();
        console.log('✓ Database initialized');
    } catch (error) {
        console.error('Database error:', error);
        throw error;
    }
};

module.exports = {
    db,
    initDatabase,
    userOps
};