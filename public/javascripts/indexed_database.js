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
                    let chatIDB = upgradeDb.createObjectStore(STORE_NAME);
                    chatIDB.createIndex('rooms', 'roomid', {unique: false, multiEntry: true});
                }
            }
        });
        console.log('db created');
    }
}
window.initIDB= initIDB;

/**
 * Stores the specified room data in the IndexedDB
 * @param data the room object
 *
 */
async function storeRoomData(data){
    console.log('inserting: ' + JSON.stringify(data));
    if (!db)
        await initIDB();
    if (db) {
        try{
            let tx = await db.transaction(STORE_NAME, 'readwrite');
            let store = await tx.objectStore(STORE_NAME);

            await store.put(data, data.roomid);
            await  tx.complete;
            console.log('added item to the store! '+ JSON.stringify(data));
        } catch(error) {
            console.log("Error in storing data: "+ error);
            localStorage.setItem(data.roomid, JSON.stringify(data));
        };
    }
    else localStorage.setItem(data.roomid, JSON.stringify(data));
}
window.storeRoomData= storeRoomData;

/**
 * Fetching all the room data from IndexedDB
 *
 */
async function getAllRoomData() {
    if(!db) {
        console.log("There is no data in the IndexedDB");
    }

    if(db) {
        try {
            console.log('fetching: all room data');
            let tx = await db.transaction(STORE_NAME, 'readonly');
            let store = await tx.objectStore(STORE_NAME);
            let index = await store.index('rooms');
            let readingsList = await index.getAll();
            await tx.complete;
            let finalResults = [];
            if (readingsList && readingsList.length > 0) {

                for(let r of readingsList){
                    finalResults.push(r);
                }

                return finalResults;
            } else {
                console.log("No readings found");
            }
        } catch (error) {
            console.log(error);
        }
    }
}
window.getAllRoomData= getAllRoomData;


/**
 * Returns the value of the specified field from a room
 * @param roomid The roomNo/roomName
 * @param field The field we are retrieving
 * @returns {Promise<*>}
 */
async function getRoomData(roomid, field) {
    if(!db){
        initIDB();
    }

    if(db){
        try{
            let tx = await db.transaction(STORE_NAME, 'readwrite');
            let store = await tx.objectStore(STORE_NAME);
            let index = await store.index('rooms');

            //Get field value
            const roomObj = await index.get(IDBKeyRange.only(roomid));

            //If object found, return it
            if(roomObj){
                return roomObj[field];
            }

        }
        catch (error){
            console.log("Error in retrieving data: "+error);
        }
    }
}
window.getRoomData= getRoomData;

/**
 * Updates the specified field in the rooms store
 * @param roomid The current roomNo/roomName
 * @param field The property we want to update
 * @param newValue  The new value for the property
 *
 */
async function updateField(roomid, field, newValue) {
    if(!db){
        initIDB();
    }

    if(db){
        try{
            let tx = await db.transaction(STORE_NAME, 'readwrite');
            let store = await tx.objectStore(STORE_NAME);
            let index = await store.index('rooms');

            //Change field
            const roomObj = await index.get(IDBKeyRange.only(roomid));
            roomObj[field] = newValue;

            //Update idb
            store.put(roomObj, roomid);
            tx.complete;
        }
        catch (error){
            console.log(error);
        }
    }
}
window.updateField = updateField;