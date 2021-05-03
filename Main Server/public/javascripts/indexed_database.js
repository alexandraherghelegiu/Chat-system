////////////////// DATABASE //////////////////
// the database receives from the server the following structure
import * as idb from '/javascripts/idb/index.js';

let db;
const INDEXED_DB_NAME = "chats_db";
const STORE_NAME = "store_chats";
const KG_ANNOTATION_STORE = "store_annotations";

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
                    chatIDB.createIndex('rooms', 'roomID', {unique: false, multiEntry: true});
                }
                if(!upgradeDb.objectStoreNames.contains(KG_ANNOTATION_STORE)){
                    let kgIDB = upgradeDb.createObjectStore(KG_ANNOTATION_STORE);
                    kgIDB.createIndex('annotations', "roomID", {unique: false, multiEntry: true});
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
    if (!db)
        await initIDB();
    if (db) {
        try{
            let tx = await db.transaction(STORE_NAME, 'readwrite');
            let store = await tx.objectStore(STORE_NAME);

            await store.put(data, data.roomID);
            await tx.complete;
        } catch(error) {
            console.log("Error in storing data: "+ error);
            localStorage.setItem(data.roomID, JSON.stringify(data));
        };
    }
    else localStorage.setItem(data.roomID, JSON.stringify(data));
}
window.storeRoomData= storeRoomData;

/**
 * Fetching all the room data associated with the specified
 * username from IndexedDB
 *
 */
async function getAllRoomData(name) {
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
                    //Check if the current user accessed the room before
                    if(r.accessedBy === name && r.accessedBy != null){
                        finalResults.push(r);
                    }
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
async function getRoomFieldData(roomid, field) {
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
window.getRoomFieldData= getRoomFieldData;

/**
 * Gets the room object associated with the supplied id from the IndexedDB
 * @param roomid The room id
 * @returns {Promise<*>}
 */
async function getRoomData(roomid){
    if(!db){
        initIDB();
    }

    if(db){
        try{
            let tx = await db.transaction(STORE_NAME, 'readwrite');
            let store = await tx.objectStore(STORE_NAME);
            let index = await store.index('rooms');

            let roomObj = await index.get(IDBKeyRange.only(roomid));

            if(roomObj){
                return roomObj;
            }
        }
        catch (error) {
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
            await tx.complete;
        }
        catch (error){
            console.log(error);
        }
    }
}
window.updateField = updateField;


/**
 * Adds a new annotation object to IndexedDB
 * @param roomid the room id
 * @param annotationObject the annotation object
 * @returns {Promise<void>}
 */
async function addNewAnnotation(roomid, annotationObject){
    if(!db){
        initIDB();
    }

    if(db){
        try{
            let tx = await db.transaction(KG_ANNOTATION_STORE, 'readwrite');
            let store = await tx.objectStore(KG_ANNOTATION_STORE);
            let index = await store.index('annotations');

            const storedObj = await index.get(IDBKeyRange.only(roomid));
            //If it's a new object in the store
            if(!storedObj){
                await store.put({roomID: roomid, annotations: [annotationObject]}, roomid);
            }
            //Update if it already exists
            else{
                storedObj["annotations"].push(annotationObject);
                await store.put(storedObj, roomid);
            }
            //Complete transaction
            await tx.complete;
        }
        catch(error) {
            console.log("Error in storing data: "+ error);
        };
    }
}
window.addNewAnnotation = addNewAnnotation;


/**
 * Clears all annotations from IndexedDB
 * @param roomid the room id
 */
async function clearAnnotations(roomid){
    if(!db){
        initIDB();
    }
    if(db){
        try{
            let tx = await db.transaction(KG_ANNOTATION_STORE, 'readwrite');
            let store = await tx.objectStore(KG_ANNOTATION_STORE);

            store.delete(roomid);
            await tx.complete;
        }
        catch (error) {
            console.log("Error in deleting data: "+ error);
        }
    }
}
window.clearAnnotations = clearAnnotations;