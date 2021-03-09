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
        db = await idb.openDB(INDEXED_DB_NAME, 1, {
            upgrade(upgradeDb, oldVersion, newVersion) {
                if (!upgradeDb.objectStoreNames.contains(STORE_NAME)) {
                    let chatIDB = upgradeDb.createObjectStore(STORE_NAME, {
                        autoIncrement: true
                    });
                    chatIDB.createIndex('rooms', 'roomid', {unique: false, multiEntry: true});
                }
            }
        });
        console.log('db created');
    }
}
window.initIDB= initIDB;


async function storeRoomData(roomid, data){
    console.log('inserting: '+ roomid + ", " +JSON.stringify(data));
    if (!db)
        await initIDB();
    if (db) {
        try{
            let tx = await db.transaction(STORE_NAME, 'readwrite');
            let store = await tx.objectStore(STORE_NAME);

            await store.put(data);
            await  tx.complete;
            console.log('added item to the store! '+ JSON.stringify(data));
        } catch(error) {
            console.log("Error in storing data: "+ error);
            localStorage.setItem(roomid, JSON.stringify(data));
        };
    }
    else localStorage.setItem(roomid, JSON.stringify(data));
}
window.storeRoomData= storeRoomData;