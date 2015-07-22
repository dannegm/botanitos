// Config
var servidor = 'http://dannegm.pro',
	puerto = '2323';
var socket = io.connect(servidor + ':' +  puerto);
var MisDatos = {};

// Utils
function log (txt) {
	$('#response').append('<p>' + txt + "</p>\n");
}
function isMobile () {
	var uA = window.navigator.userAgent;
	if (uA.match(/iPhone|Android/g)) return true;
	return false;
}
function Get (){
	var loc = document.location.href,
		getStrings = loc.split('?')[1],
		getKeys = getStrings.split('&'),
		get = {};

	for(x in getKeys){
		var tmp = getKeys[x].split('=');
		get[tmp[0]] = unescape(decodeURI(tmp[1]));
	}
	return get;
} var $_GET = Get();

function RunRange () {
	var iniT, endT;
	document.addEventListener('touchstart', function(e) {
		iniT = e.changedTouches[0].pageY;
	}, false);
	document.addEventListener('touchmove', function(e) {
		endT = e.targetTouches[0].pageY;
		if ( iniT < endT ){
			if (MisDatos.speed < 95) {
				MisDatos.speed += 5;
			}
		}
	}, false);

	setInterval(function(){
		if (MisDatos.speed > 5) {
			MisDatos.speed -= 2;
		}
		socket.emit('Run', MisDatos);
	}, 100);
}


// Main
function RegistrarJugador () {
	socket.emit('RegistrarJugador', null);
}
function AsociarPhone () {
	var idpc = $_GET['idpc'];
	socket.emit('AsociarPhone', idpc);

	log('Petición mandada de conxión');
}
function init () {
	if (!isMobile()) {
		RegistrarJugador();
	} else {
		AsociarPhone();
	}
	
	RunRange();
}
$(document).ready(init);

// Funciones Sokects
function Entro (res) {
	MisDatos = res;
	$('#qr').attr('src','http://dnn.im/apps/qr.php?s=http://dannegm.pro/botanitos/?idpc=' + MisDatos.idpc);
	log('Avatar: ' + MisDatos.avatar);
	log('PC: ' + MisDatos.idpc);
}
function Asocio (res) {
	MisDatos = res;
	log('Se asoció la pc <strong>' + MisDatos.idpc + '</strong> con el celular <strong>' + MisDatos.idphone + '</strong>');
}
function Run (res) {
	$('#speed').text(res);
}
function Lost () {
	if (!isMobile()) {
		alert('Se perdió conexión con el celular');
	} else {
		alert('Se perdió conexión con el pc');
	}
}

function disconnect () {
	alert('Se perdión la conexión ocn el servidor');
}
// Sockets
socket.on('Entro', Entro);
socket.on('Asocio', Asocio);
socket.on('Run', Run);

socket.on('disconnect', disconnect);