
exports.init = function(io) {

  const chat = io
      .of('/chat')
      .on('connection', function (socket) {
    try {
      /**
       * creates room
       */
      socket.on('create', function(room, userId, image){
        socket.join(room);
        chat.to(room).emit('created', room, userId, image);
      });

      socket.on('join', function(room, userId){
        socket.join(room);
        chat.to(room).emit('joined', room, userId);
      });

      socket.on('chat', function(room, userId, chatText){
        io.to(room).emit('chat', room, userId, chatText);
      });

    } catch (e) {
      console.log(e);
    }
  });
}
