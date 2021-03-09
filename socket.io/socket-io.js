
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

      socket.on('chat', function(room, userId, chatText){
        io.to(room).emit('chat', room, userId, chatText);
      });

      socket.on('draw', function(room, userId, cw, ch, x1, y1, x2, y2, color, thick){
        io.to(room).emit('drawing', room, userId, cw, ch, x1, y1, x2, y2, color, thick);
      });

    } catch (e) {
      console.log(e);
    }
  });
}
