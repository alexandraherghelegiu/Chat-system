////////////////// DATABASE //////////////////
// the database receives from the server the following structure
import * as idb from './idb/index.js';

let db;
const INDEXED_DB_NAME = "chats_db";
const STORE_NAME = "store_chats";

/**
 * Initialise indexedDB
 *
 */
async function initIDB(){
    if (!db) {
        db = await idb.openDB(INDEXED_DB_NAME, 2, {
            upgrade(upgradeDb, oldVersion, newVersion) {
                if (!upgradeDb.objectStoreNames.contains(STORE_NAME)) {
                    let chatIDB = upgradeDb.createObjectStore(STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    chatIDB.createIndex('roomid', 'roomid', {unique: false, multiEntry: true});
                }
            }
        });
        console.log('db created');
    }
}
window.initIDB= initIDB;
