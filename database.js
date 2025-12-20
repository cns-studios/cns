const Database = require('better-sqlite3');
const path = require('path');

// This database can be used for any application-specific data, separate from users.
const db = new Database(path.join(__dirname, 'cns_app.db'));

db.pragma('journal_mode = WAL');

/**
 * Initializes the main application database.
 * Any tables required for the application (that are not user-related)
 * should be created here.
 */
const initDatabase = () => {
    try {
        console.log('✓ Main application database initialized');
        // Example: db.exec('CREATE TABLE IF NOT EXISTS projects (...)');
    } catch (error) {
        console.error('Main app database error:', error);
        throw error;
    }
};

module.exports = {
    db,
    initDatabase
};
