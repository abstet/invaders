/**
* Cross-browser event binding
*/
function addEvent(element, event, fn) {
    if (element.addEventListener) {
        element.addEventListener(event, fn, false);
	}
    else if (element.attachEvent) {
        element.attachEvent('on' + event, fn);
	}
}

// on window load
var game = null;
window.addEvent(window, "load",	function(e) {
    showSplashScreen();

	game = new SpaceInvaders({
		id: 'area',
		cols: 6,		
		rows: 3,
		speed: 60, 
		sound: 1
	});

	addEvent(window, 'keydown', function(e) {
		if (e.keyCode == 13) {
			game.start();			
		} else {
			game.keydown(e);		
		}		
	});
	

	addEvent(window, 'touchstart', function(e){
		if (game.over()) {
			game.start();
		} 
		game.touch(e);		
	});	
	
	addEvent(window, 'mousedown', function(e){
		if (game.over()) {
			game.start();
		}
		game.touch(e);		
	});	

	
	addEvent(window, 'touchmove', function(e){game.slide(e);});	
	addEvent(window, 'mousemove', function(e) {game.slide(e);});
	addEvent(window, 'mouseup', function(e){game.untouch(e);});	
	addEvent(window, 'touchend', function(e) {game.untouch(e);});
});



function showSplashScreen() {
	var canvas = document.getElementById('area');
	var context = canvas.getContext("2d");

	context.fillStyle = 'black';
	context.fillRect(0, 0, canvas.width, canvas.height);		
	
	context.font = '30px Arial';
	context.textAlign = 'center';	
	context.fillStyle = '#0f0';
	context.fillText('"Space Invaders" for TradingView', canvas.width / 2, 60);

	context.font = '20px Arial';
	context.fillStyle = 'yellow';
	context.fillText('Space pricelist:', canvas.width / 2, 100);
	
	var size = 40;
	for(i=1; i<=5; ++i) {
		var img = new Image();
		img.src = 'sprites/ship' + i + '.png';
		context.drawImage(img, 0, 0, 40, 40, canvas.width / 2 - 40, 70 + 50 * i, 40, 40);
		context.fillText('= ' + (100 * i), canvas.width / 2 + 30, 100 + 50 * i);		
	}

	context.fillStyle = 'white';
	context.fillText('[Enter] or touch to start', canvas.width / 2, canvas.height - 30);
}

