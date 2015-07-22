// Config
var servidor = 'http://dannegm.pro',
	puerto = '2323';
var socket = io.connect(servidor + ':' +  puerto);
var MisDatos = {};
var botanos = {
	'tacho': {
		toString: function() { return 'tacho'; },
		'name': 'Tacho',
		'img': 'tacho.png',
		'run': 'tosta_run.gif',
		'jump': 'tosta_jump.gif',
		'wave': 'tosta_wave.gif'
	},
	'onda': {
		toString: function() { return 'onda'; },
		'name': 'Onda',
		'img': 'onda.png',
		'run': 'ondas_run.gif',
		'jump': 'ondas_jump.gif',
		'wave': 'ondas_wave.gif'
	},
	'nuts': {
		toString: function() { return 'nuts'; },
		'name': 'Nuts',
		'img': 'nut.png',
		'run': 'nuts_run.gif',
		'jump': 'nuts_jump.gif',
		'wave': 'nuts_wave.gif'
	}
}
var players = ['tacho', 'onda', 'nuts'];
var oponents = [];

// Audios 

var intro = document.createElement('audio');
	intro.src = 'audio/intro.mp3';
	intro.loop = true;
	intro.volume = 0.6;
	intro.play();

var running = document.createElement('audio');
	running.src = 'audio/running.mp3';

var plop = document.createElement('audio');
	plop.src = 'audio/pop.mp3';

var winbg = document.createElement('audio');
	winbg.src = 'audio/win.mp3';

var win = document.createElement('audio');
	win.src = 'audio/aplauso.mp3';

// Utils

function log (txt) {
	console.log(txt);
}
function error(txt) {
	console.error(txt);
}
function Rand (a,b) {
	return Math.floor((Math.random() * b) + a);
}
function isMobile () {
	var uA = window.navigator.userAgent;
	if (uA.match(/iPhone|Android/g)) return true;
	return false;
}
function Get (){
	var  loc = document.location.href;
	if (loc.match(/\?/g)) {
		var	getStrings = loc.split('?')[1],
			getKeys = getStrings.split('&'),
			get = {};

		for(x in getKeys){
			var tmp = getKeys[x].split('=');
			get[tmp[0]] = unescape(decodeURI(tmp[1]));
		}
		return get;
	} else {
		return [];
	}
} var $_GET = Get();

function a_unico(ar){
    var ya=false,v="",aux=[].concat(ar),r=Array();
    for (var i in aux){ // 
        v=aux[i]; 
        ya=false; 
        for (var a in aux){
            if (v==aux[a]){ 
                if (ya==false){ 
                    ya=true; 
                } 
                else{ 
                    aux[a]=""; 
                } 
            } 
        } 
    } 
    for (var a in aux){ 
        if (aux[a]!=""){ 
            r.push(aux[a]); 
        } 
    }
    return r; 
}

// Code

function RunRange () {
	var iniT, endT;
	document.addEventListener('touchstart', function(e) {
		iniT = e.changedTouches[0].pageY;
	}, false);
	document.addEventListener('touchmove', function(e) {
		endT = e.targetTouches[0].pageY;
		if ( iniT < endT ){
			if (MisDatos.speed < 20) {
				MisDatos.speed += 4;
			}
		}
	}, false);

	setInterval(function(){
		if (MisDatos.speed > 0) {
			MisDatos.speed -= 2;
		}
		socket.emit('Run', MisDatos);
	/*	log('Send: Run (obj)');
		log(MisDatos);
		log("\n"); /**/
	}, 100);
}

// Main
function RegistrarJugador (botanito) {
	socket.emit('RegistrarJugador', botanito);
	log('Send: RegistrarJugador (' + botanito + ')');
}
function AsociarPhone () {
	var idpc = $_GET['idpc'];
	socket.emit('AsociarPhone', idpc);

	log('Send: AsociarPhone (' + idpc + ')');
}
function init () {

	$('.choiceBotanito').click(function(){
		var botano = $(this).attr('rel');
		RegistrarJugador(botano);
	});

	var loc = document.location.href;
	if (loc.match(/remote/g)) {
		AsociarPhone();
	};

	//scrolled();
}
$(document).ready(init);

// Funciones Sokects
function Entro (res) {
	MisDatos = res;
	$('#qrcode').attr('src','http://dnn.im/apps/qr.php?s=http://dannegm.pro/labs/botanitos/remote.html?idpc=' + MisDatos.idpc);
	
	$('#choicebotanito').addClass("back");
	$('#syncmobile').removeClass("hidden");

	plop.play();

	var xx = 0;
	for ( x in players ) {
		if (botanos[MisDatos.avatar].toString() != players[x]) {
			oponents[xx] = players[x];
			xx++;
		}
	}
}

function Asocio (res) {
	log('Receive: Asocio (' + res + ')');
	MisDatos = res;
	log('Sync: PC (' + MisDatos.idpc + '), Phone (' + MisDatos.idphone + ')');
	$('#syncmobile').addClass("back");
	$('#scene').removeClass("hidden");

	RunRange();

	console.log('Comienza la carrera');
	intro.pause();
	plop.play();
	running.play();
}

var trayectoria = 0;

var tb1 = 0;
var tb2 = 0;

var ganadores = [];

function Run (res) {
	//log('Receive: Run (' + res + ')');

	trayectoria += res;
	$('#' + MisDatos.avatar).css('margin-left', trayectoria + 'px');

	tb1 += Rand(0,20);
	$('#' + oponents[0]).css('margin-left', tb1 + 'px');

	tb2 += Rand(0,20);
	$('#' + oponents[1]).css('margin-left', tb2 + 'px');

	//log('[*] Trayectoria ' + trayectoria);

	if ((parseInt($('#' + MisDatos.avatar).css('margin-left')) > 900)) {
		ganadores.push(MisDatos.avatar);
	}
	if ((parseInt($('#' + oponents[0]).css('margin-left')) > 900)) {
		ganadores.push(oponents[0]);
	}
	if ((parseInt($('#' + oponents[1]).css('margin-left')) > 900)) {
		ganadores.push(oponents[1]);
	}

	ganadores = a_unico(ganadores);

	if (ganadores.length == 3) {
		console.log('Han pasado la meta todos');
		GameOver();
	}
}

function GameOver () {
	running.pause();
	plop.play();
	win.play();
	winbg.play();

	ganadores = a_unico(ganadores);

	$('#scene').addClass("back");
	$('#win').removeClass("hidden");

	$('#first').attr('src', 'img/' + botanos[ganadores[0]].img);
	$('#second').attr('src', 'img/' + botanos[ganadores[1]].img);
	$('#third').attr('src', 'img/' + botanos[ganadores[2]].img);

	if (ganadores[0] == MisDatos.avatar) {
		//alert('Ganaste!!');
	} else {
		//alert('Lo sentimos, sigue participando.');
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
