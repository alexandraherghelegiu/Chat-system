
exports.init = function(io) {

  /**
   * created chat namespace, in case more namespaces are required later on
   */
  io.sockets.on('connection', function (socket) {
    try {
      /**
       * creates room
       */
      socket.on('create or join', function(room, userId, image){
        socket.join(room);
        io.to(room).emit('joined', room, userId, image);
      });

      socket.on('chat', function(room, userId, chatText){
        io.to(room).emit('chat', room, userId, chatText);
      });

    } catch (e) {
      console.log(e);
    }
  });
}
