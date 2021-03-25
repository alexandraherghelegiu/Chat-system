#Installation:

- Node.js must be installed on the computer
- Install packages on both servers by using “npm install”
- The Main Server listens on http://localhost:3000
- The MongoDB Server listens on http://localhost:3001
- Both can be started with the command `node bin/www` from the respective folder

#What’s working:
**IndexedDB: (Daniel)**
* Rooms are stored in the IndexedDB upon the current user joins to them
* They are accessible both online and offline
* Chat messages while the user is present in the room as well as annotations added during this time are also saved (the current room’s data is updated in IndexedDB)
* Annotations and chat messages are both loaded when the user rejoins a room
* All the rooms previously joined to by the user are displayed on the dashboard, from where they can reconnect to any of them by clicking on the specific “tile”.
* New rooms can be created while being part of another room, which will be saved in IndexedDB and this process also sends a link to the initial room to provide an easy connection option to the other participants.

**Ajax: (Daniel)**
* Ajax communication is used between pages.
* The data submitted from the forms are transferred via Ajax requests.
* The communication with MongoDB also happens with the help of Ajax.

**NodeJS server: (Alexandra)**
* Index + dashboard pages
* Client can send request to get all images from MongoDB or to insert image in MongoDB to Main Server
* Server-server communication via fetch (with MongoDB server)
* Main Server sends the request to MongoDB server and when it receives a response, it notifies the client / displays the data on client side

**MongoDB: (Alexandra):**
* Receives GET and POST requests in order to insert data or retrieve it
* Organized properly into models, controllers, views
* Routers call the methods in Controllers according to the request received, then the controller sends back a response.
* Images stored in a private folder and their corresponding path is stored in database
* Images are sent around in base64 format
* Filter images based on author implemented in frontend


**Socket.io (Alberto):**
* Users can create and join rooms, using either a local image, a url or an image taken with the device camera
* Users can send and receive messages when inside a room
* Users can draw on canvas and see what others are drawing in a room

**Service Worker  (Alberto):**
* Website can be logged on to and viewed offline
* Only rooms that have already been visited can be joined
* Chat and new rooms creation is disabled when offline
* Annotations made offline won’t be saved

**Chat interface  (Alberto):**
* Image part and chat are now side by side
* User can select different colours to draw with on the canvas
* User can download image locally including annotations
* User can generate a room within the chat for chat members to join


#What needs to be done:
* Chat interface:
    - Chat interface could do with a restyling and made look better, it currently doesn’t look good on mobile
* Swagger Documentation
