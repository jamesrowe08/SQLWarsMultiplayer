var
    gameport        = process.env.PORT || 4004,

    io              = require('socket.io'),
    express         = require('express'),
    UUID            = require('node-uuid'),

    verbose         = false,
    http            = require('http'),
    app             = express(),
    server          = http.createServer(app);

/* Express server set up. */

//Tell the server to listen for incoming connections
server.listen(gameport)

//Log something so we know that it succeeded.
console.log('\t :: Express :: Listening on port ' + gameport );

//By default, we forward the / path to index.html automatically.
app.get( '/', function( req, res ){
    console.log('trying to load %s', __dirname + '/index.html');
    res.sendfile( '/index.html' , { root:__dirname });
});


//This handler will listen for requests on /*, any file from the root of our server.
app.get( '/*' , function( req, res, next ) {

    //This is the current file they have requested
    var file = req.params[0];

    //For debugging, we can track what files are requested.
    if(verbose) console.log('\t :: Express :: file requested : ' + file);

    //Send the requesting client the file.
    res.sendfile( __dirname + '/' + file );

});


/* Socket.IO server set up. */

//Create a socket.io instance using our express server
var sio = io.listen(server);

sio.use(function(socket, next) {
    var handshakeData = socket.request;
    // make sure the handshake data looks good as before
    // if error do this:
    //next(new Error('not authorized');
    // else just call next
    next();
});


//Set up the game server
game_server = require('./game.server.js');

//Client connection
sio.sockets.on('connection', function (client) {

    client.userid = UUID();

    //tell the player they connected, giving them their id
    client.emit('onconnected', { id: client.userid } );

    //Find a game for the new client
    game_server.findGame(client);

    console.log('\t socket.io:: player ' + client.userid + ' connected');

    //Forward client messages on to the game server
    client.on('message', function(m) {
        game_server.onMessage(client, m);
    });

    //Client disconnect - remove them from the game
    client.on('disconnect', function () {
        console.log('\t socket.io:: client disconnected ' + client.userid + ' ' + client.game_id);
        if(client.game && client.game.id) {
            //player leaving a game should destroy that game
            game_server.endGame(client.game.id, client.userid);
        }
    });

});
