var servidor = require('socket.io').listen(2323);
	servidor.set('log level', 0);

var Jugadores = {};
var SpeedControl = {};
var idconnection = null;

var NombresBotanitos = ['Onda','Nut','Tostacho'];

// Utils

function Rand (a,b) {
	return Math.floor((Math.random() * b) + a);
}
function log (txt) {
	console.log(txt);
}
function error(txt) {
	console.error(txt);
}

// Sockets

servidor.sockets.on('connection', function (socket){
	idconnection = socket.id;
	log('[*] Se conecto ' + idconnection);

	socket.on('disconnect', function () {
	});

	socket.on('RegistrarJugador', function (botanito) {
		log('Receive: RegistrarJugador (' + botanito + ')');

		var Avatar = NombresBotanitos[Rand(0,2)];
		var NuevoJugador = {
			'avatar': botanito,
			'idpc': idconnection,
			'idphone': 0,
			'speed': 0
		};

		Jugadores[idconnection] = NuevoJugador;
		SpeedControl[idconnection] = 0;
		servidor.sockets.socket(idconnection).emit('Entro', NuevoJugador);
		log('Send: Entro (obj)');
		log(NuevoJugador);
		log("\n");
	});

	socket.on('AsociarPhone', function (user) {
		log('Receive: AsociarPhone (' + user + ')');

		Jugadores[user].idphone = idconnection;
		log('Sync: PC (' + Jugadores[user].idpc + '), Phone (' + Jugadores[user].idphone + ')');

		servidor.sockets.socket(user).emit('Asocio', Jugadores[user]);
		servidor.sockets.socket(idconnection).emit('Asocio', Jugadores[user]);

		log('Send: Asocio (obj)');
		log(Jugadores[user]);
		log("\n");
	});

	socket.on('Run', function (User) {
		/*log('Receive: AsociarPhone (obj)');
		log(User);
		log("\n"); /**/

		Jugadores[User.idpc] = User;

		if (typeof User.speed != "undefined" && User.speed != 0) {
			SpeedControl[User.idpc] = User.speed;
		}

		servidor.sockets.socket(User.idpc).emit('Run', SpeedControl[User.idpc]);
		servidor.sockets.socket(User.idphone).emit('Run', SpeedControl[User.idpc]);

		//log('Send: Run (' + SpeedControl[User.idpc] + ')');
	});
});
