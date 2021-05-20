
exports.init = function(io) {

  io.sockets.on('connection', function (socket) {
    try {
      /**
       * creates room
       */
      socket.on('create or join', function(room, userId, image){
        socket.join(room);
        io.to(room).emit('joined', room, userId, image);
      });

      /**
       * forwards to chat to room, from userId
       */
      socket.on('chat', function(room, userId, chatText){
        io.to(room).emit('chat', room, userId, chatText);
      });

      /**
       * shares drawing on canvas with users in the room.
       * @cw = canvas width
       * @ch = canvas height
       * @x1 = initial x coordinate
       * @y1 = initial y coordinate
       * @x2 = final x coordinate
       * @y2 = final y coordinate
       * @color = color of the annotation
       * @thick = thickness of annotation
       */
      socket.on('draw', function(room, userId, cw, ch, x1, y1, x2, y2, color, thick){
        io.to(room).emit('drawing', room, userId, cw, ch, x1, y1, x2, y2, color, thick);
      });

      /**
       * clears the canvas from all annotations
       */
      socket.on('clear', function(room, userId){
        io.to(room).emit('clear', userId);
      })

      /**
       * disconnects user, unused
       */
      socket.on('logging-out', function(room) {
        socket.leave(room);
        console.log('disconnecting from room');
      })

      /**
       * reconnect user to socket
       */
      socket.on('reconnect', function(){
        console.log('reconnecting');
      })

      /**
       * shares knowledge graph annotations with the rest of the room
       */
      socket.on('kg-annotation', function(room, user, resultObj, canvasUrl){
        io.to(room).emit('kg-new', room, user, resultObj, canvasUrl);
      })
    } catch (e) {
      console.log(e);
    }
  });
}
