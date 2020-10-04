/**
* SpaceInvaders - game wrapper
* ops[] are
* 	id: canvas id
*	rows: of ship enemies (6 by defaule)
*	cols: of ship enemies (3 by defaule)
*   speed: setInvterval ~ 1/speed
*	sounds:  on=1 (by default)
*/
var SpaceInvaders = function (ops) {
	var _id = ops['id'] || null;
	var _rows = ops['rows'] || 6;
	var _cols = ops['cols'] || 3;
	
	this._score = 0;
	this._lifes = 3;	
	
	var _speed = ops['speed'] || 20; 
	if (_speed < 1) { // for 'zero' dummies
		_speed = 1;
	}
	
	var _is_sounds = 1; 
	if (ops['sound'] != 'undefined') {
		_is_sounds = ops['sound'];
	}
	
	this._gameover = 1; //
	this.over = function() {
		return this._gameover;
	}
	this._status = ''; // status string for gamer

	// canvas
	this.canvas = document.getElementById(_id);
	if (this.canvas == null) {
		console.error("SpaceInvaders: Can't attach to canvas #id=" + _id);
		return null;
	}
	this.context = this.canvas.getContext("2d");
	if (this.context == null) {
		console.error("SpaceInvaders: Can't get 2d in attachTo()");
		return null;
	}	
	this.context.fillStyle = 'black';
		
	// animation "thread"
	this.pid = 0;
	this.toggleRun = function() {
		if (!this.pid) {
			var self = this;
			this.pid = window.setInterval(
				function() {self.tick()}, 
				1/_speed * 1000, 
				self);
		} else {
			window.clearInterval(this.pid);
			this.pid = 0;
		}
	}
	
	this.stop = function() {
		this._gameover = 1;
		window.clearInterval(this.pid);
		this.pid = 0;
	}

	// sounds
	_sounds = [];	
	['shot', 'shipboom', 'gameover', 'gamestart', 'youwin', 'bullet', 'ups'].forEach(function(a){
		e = document.createElement("audio");
		e.setAttribute('src', 'sounds/' + a + '.mp3');
		e.setAttribute('id', 'a' + a);
		document.body.appendChild(e);		
		this._sounds[a] = e;
	});
	
	this.playSound = function(s) {
		if (_is_sounds != 0){ 
			_sounds[s].play();	
		}
	}	
	
	this.toggleSounds = function() {
		_is_sounds = !_is_sounds;
	}
	
	this.init = function() {	
		// units
		this.airforce = new Airforce({
			'rows': _rows,
			'cols': _cols,
			'space': 40,
			'context': this.context,
			'canvas_width': this.canvas.width, 
			'canvas_height': this.canvas.height,
			'playSound': this.playSound		 
		});	
	
		this.cannon = new Cannon({
			'context': this.context,
			'canvas_width': this.canvas.width, 
			'canvas_height': this.canvas.height,
			'playSound': this.playSound
		});
		
		this._score = 0;
		this._lifes = 3;			
		
		this.playSound('gamestart');
	}
	
	//this.init();
}

SpaceInvaders.prototype = {
	tick: function() {
		this.cannon.tick();
		this.airforce.tick();
		this.checkCollisions();			
		
		// win!
		if (this.airforce.ships.length == this.airforce.destroedShips.length) {
			this.ifWin();
		}
		
		// loose
		if (this.airforce.edge > (this.canvas.height - this.cannon.size() * 1.1)) {
			this.ifLoose();
		}
	},
	
	ifWin: function() {
		this.stop();	
		this.playSound('youwin');
		this.context.fillStyle = 'black';			
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);		
		
		this.context.textAlign = 'center';

		this.context.font = '50px Arial';		
		this.context.fillStyle = 'green';
		this.context.fillText('You win!', 
			this.canvas.width / 2, 
			this.canvas.height / 2);

		this.context.font = '30px Arial';					
		this.context.fillStyle = 'white';
		this.context.fillText('[Enter] or touch to restart', 
			this.canvas.width / 2, 
			this.canvas.height / 2 + 50);
			
		this.context.font = '20px Arial';					
		this.context.fillStyle = 'yellow';
		this.context.fillText('Score: ' + this._score, 
			this.canvas.width / 2, 
			this.canvas.height / 2 + 80);
	},
	
	ifLoose: function() {
		this.stop();
		this.playSound('gameover');
		this.context.fillStyle = 'black';	
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);		
		
		this.context.textAlign = 'center';

		this.context.font = '50px Arial';		
		this.context.fillStyle = 'red';
		this.context.fillText('Game over', 
			this.canvas.width / 2, 
			this.canvas.height / 2);

		this.context.font = '30px Arial';					
		this.context.fillStyle = 'white';
		this.context.fillText('[Enter] or touch to restart', 
			this.canvas.width / 2, 
			this.canvas.height / 2 + 50);
			
		this.context.font = '20px Arial';					
		this.context.fillStyle = 'yellow';
		this.context.fillText('Score: ' + this._score, 
			this.canvas.width / 2, 
			this.canvas.height / 2 + 80);			
	},
	
	checkCollisions: function() {
		// cannon bullets vs invaders airforces
		for (i = 0; i < this.cannon.bullets.length; ++i) {
			for (s = (this.airforce.ships.length - 1); s >= 0; --s) {

			if (this.airforce.destroedShips.indexOf(s) > -1) {
					continue;
				}
	
				var ship = this.airforce.unitTarget(s);
				if (	this.cannon.bullets[i].left() >= ship['x1']
					&& ((this.cannon.bullets[i].left() + this.cannon.bullets[i].size()) <= ship['x2'])
					&& ((this.cannon.bullets[i].top() + this.cannon.bullets[i].size()) <= ship['y2'])) {
					
						this.airforce.ships[s] = new Sprite({
							context: this.context,		
							image: 'sprites/shipgone.png',
							size: 40,
							left: ship['x1'], 
							top: ship['y1'],
							infinite: 0						
						});
						
						this.airforce.destroedShips.push(s);						
						this.cannon.bullets.splice(i, 1);
						this.playSound('shipboom');	
						this._score	+= this.airforce.ships[i]._weight;
						return;
				}
			}
		}
		
		// invaders bullets vs cannon
		var bulletBottom = 0;
		var cannonTop = 0;
		for (i = 0; i < this.airforce.buls.length; ++i) {
			bulletBottom = this.airforce.buls[i].top() + this.airforce.buls[i].size();
			cannonTop = this.canvas.height - this.cannon.size() + 12;
			
			if ((bulletBottom  > cannonTop)
				&& (this.airforce.buls[i].left() >= this.cannon.left())
				&& ((this.airforce.buls[i].left() + this.airforce.buls[i].size()) <= (this.cannon.left() + this.cannon.size()))
				) {

				--this._lifes;
				this.airforce.buls.splice(i, 1);
				this.playSound('ups');
				
				if (!this._lifes) {
					this.ifLoose();
				}
				break;
			}
		}
		
		this.updateStatus();		
	},
	
	updateStatus: function() {
		var status = 'Score: ' + this._score + '   Lifes: ' + this._lifes;
		this.context.font = '20px Arial';		

		this.context.fillStyle = 'black';
		this.context.clearRect(0,0, this.canvas.width, 70);

		this.context.fillStyle = 'white';
		this.context.fillText(status, this.canvas.width / 2, 40);
			
		this.context.fillStyle = 'black';			
	},

	start: function() {
		this.context.fillStyle = 'black';
		this.context.clearRect(0,0, this.canvas.width, this.canvas.height);
		this.init();
		this.toggleRun();	
		this._gameover = 0;
	},		

	keydown: function(e) {
		switch (e.keyCode) {
			case 37:  // left
				if (this.pid) {
					this.cannon.shift(-1);
				}
				break;
				
			case 38:  // up = shot
			case 32:  
				if (this.pid) {
					this.playSound('shot');
					this.cannon.shot();			
				}
				break;
				
			case 39:  // right
				if (this.pid) {
					this.cannon.shift(1);
				}
				break;
				
			case 80: // pause
				this.toggleRun();
				break;
				
			case 83: // sound toggle
				this.toggleSounds();
				break;
		}
	},
	
	catchXY: function(e) {
		var rect = this.canvas.getBoundingClientRect();
		if (e.hasOwnProperty('targetTouches')) {
			return {
				x: e.targetTouches[0].pageX - rect.left,
				y: e.targetTouches[0].pageY - rect.top,
				ts: e.timeStamp				
			}
		}
		else {
			return {		
				x: e.pageX - rect.left,
				y: e.pageY - rect.top,
				ts: e.timeStamp
			}
		}
	},	

	slide: function(e) {
		e = this.catchXY(e);
		if (this.pid) {
			this.cannon.slide(e);
		}
	},

	touch: function(e) {
		if (this._gameover) {
			this.start();
		}
	
		e = this.catchXY(e);	
		if (this.pid) {
			this.cannon.touch(e);		
		}
	},

	untouch: function(e) {
		e = this.catchXY(e);		
		if (this.pid) {
			this.cannon.untouch(e);
		}
	}
}

/**
* Cannon class
* @ops['context'] mandatory
*/
function Cannon(ops) {
	var _context = ops['context'] || null;
	var _canvas_w = ops['canvas_width'] || 300; 
	var _canvas_h = ops['canvas_height'] || 300; 
	var _playSound = ops['playSound'] || function() {};
	var _size = ops['unitSize'] || 70;
	var _bulletSprite = ops['bulletSprite'] || 'sprites/cannonbullet.png';
	var _bulletSize = ops['bulletSize'] || 15;
	
	var _left = 0; 			// current left position
	var _dt = 8; 			// keyboard dX
	var _bullet_dt = 15; 	// pixels per tick()
	var _sensivity = 150; 	// in milliseconds to define - 'drug' or 'click'

	var _drugged = 0; 		// drugged flag	
	var _prev_x = 0;
	var _prev_ts = 0; 		// latest event timestamp
	this.bullets = [];		// cannon bullets stack
	
	this.left = function() {
		return _cannonSprite.left();
	}
	
	this.size = function() {
		return _size;
	}

	this.shift = function(dir) {
		this.move(dir * _dt);
	}
	
	this.move = function(diff) {
		// border contraints
		if (((this.left() + diff) < _dt) 
			|| ((this.left() + diff + _dt + _size) > _canvas_w)) {
			return false;
		}
		_cannonSprite.slide(diff, 0);
	}

	this.shot = function() {
		var b = new Sprite({
				context: _context,
				image: _bulletSprite,
				size: _bulletSize,
				left: this.left() + _size / 2 - _bulletSize / 2 + 2,
				top: _canvas_h - _size - _bulletSize
			});
		this.bullets.push(b);
		_playSound('shot');
	}
	
	this.slide = function(e) {
		if (!_drugged) {
			return;
		}

		this.move(e['x'] - _prev_x);
		_prev_x = e['x'];
	}
	
	this.touch = function(e) {
		if ((e['x'] >= this.left())
			&& (e['x'] <= (this.left() + _size))
			&& (e['y'] >= _canvas_h - _size)
			&& (e['y'] <= _canvas_h)) {
				_drugged = 1;
				_prev_x = e['x'];			
				_prev_ts = e['ts'];
		} 
	}

	this.untouch = function(e) {
		if ((e['ts'] - _prev_ts) < _sensivity) {
			this.shot();
		}		
		
		if (_drugged) {
			_drugged = 0;			
		}
		_prev_ts = e['ts'];		
	}
	
	this.tick = function() {
		this.bullets.forEach(function(b){
			b.slide(0, -_bullet_dt);
			b.tick();			
		});

		// out canvas
		this.bullets = this.bullets.filter(function(v, i, a) {
			return (v.top() >= -_bulletSize);
		});
		
		_cannonSprite.tick();		
	}
	
	// random position on init
	var _cannonSprite = new Sprite({
		context: _context,
		image: 'sprites/cannon.png',
		size: _size,
		left: Math.random() * (_canvas_w - _size),
		top: _canvas_h - _size
	});
}

/**
* Airforce (ships pack)
*/
var Airforce = function(ops) {
	var _context = ops['context'] || null;
	var _canvas_w = ops['canvas_width'] || 300; 
	var _canvas_h = ops['canvas_height'] || 300; 
	var _cols = ops['cols'] || 5;
	var _rows = ops['rows'] || 3;
	var _size = ops['size'] || 40;
	var _space = ops['space'] || 30; // spaces between ships	
	var _left = ops['left'] || ((_canvas_w - _rows * _size) / 2 - (_rows * _size / 2)); // centred
	var _top = (ops['top'] + 65) || 65; // margin for score panel
	var _dx = ops['_dx'] || 2; 
	var _dy = ops['_dy'] || 10; 
	var _horizontal_speed = ops['horizontal_speed'] || 10; // in global 'ticks'
	var _vertical_speed = ops['vertical_speed'] || 200; // in global 'ticks'
	var _playSound = ops['playSound'] || function() {};	
	
	var ticks = 0;	
	this.destroedShips = []; // indexes in 'plain' matrix of airforces
	this.bulletTicker = Math.round(Math.random()*100 + 50); // in ticks
	this.buls = []; // invaders bullets
	
	this.isBulletNow = function() {
		if (!--this.bulletTicker) {
			this.bulletTicker = Math.round(Math.random()*100 + 50);
			return 1;
		} else {
			return 0;
		}
	}
	
	this.unitLeft = function(i) {
		return (_left + (i % _cols) * (_size + _space / 2));
	}

	this.unitTop = function(i) {
		return (_top  + Math.floor(i / _cols) * (_size + _space / 2));
	}	

	this.unitTarget = function(i) {
		return {
			x1: this.unitLeft(i),
			y1: this.unitTop(i),
			x2: this.unitLeft(i) + _size,
			y2: this.unitTop(i) + _size
		};
	}
	
	this.ships = [];
	for(i = 0; i < (_cols * _rows); ++i) {
		var rand = Math.round(Math.random() * 4) + 1
		var s = new Sprite({
			context: _context,		
			image: 'sprites/ship' + rand + '.png',
			size: _size,
			left: this.unitLeft(i), 
			top: this.unitTop(i),
			weight: 100 * rand
		});
		this.ships.push(s);
	}

	this.render = function() {
		for(i = 0; i < (_cols * _rows); ++i) {	
			this.ships[i].move(this.unitLeft(i), this.unitTop(i));
		}
	}
	
	this.edge = -1; // bottom edge not destroyed ships
	this.tick = function() {
		// slide to bottom
		if (!(ticks %_vertical_speed)) {
			// clear previous
			_context.clearRect(_left, 
				_top, 
				_cols * (_size + _space / 2) ,  
				_rows * (_size + _space / 2));		
			_top += _dy;

			this.render();
		}
		

		// left-right shift
		if (!(ticks % _horizontal_speed)) {
			_context.clearRect(_left, 
				_top, 
				_cols * (_size + _space / 2),  
				_rows * (_size + _space / 2));				
			
			if ((Math.random() - 0.5) > 0) {
				_left += _dx;
			} else {
				_left -= _dx;			
			}

			this.render();
		}

		this.edge = -1;	
		this.ships.forEach(function(s, i){
			s.tick();
			
			// calculate bottom of 'live' ship
			if (this.destroedShips.indexOf(i) > -1) {
				return;
			}
			var s_bottom = s.top() + s.size();		
			if (s_bottom > this.edge) {
				this.edge = s_bottom;
			}				
		}, this);


		// Bullets 
		if (this.isBulletNow()) {
			this.shotBullet();
		}
		this.buls.forEach(function(b, i){
			b.slide(0, 2);
		});

		this.buls = this.buls.filter(function(v, i, a) {
			return ((v.top()) < _canvas_h);
		});

		++ticks;
	}
	
	this.shotBullet = function() {
		var randomShipId = this.getRandomShip();
		var b = new Sprite({
				context: _context,
				image: 'sprites/cannonbullet.png',
				size: 15,
				left: this.unitLeft(randomShipId) + _size / 3 ,
				top: this.unitTop(randomShipId) + _size
			});
		this.buls.push(b);
		_playSound('bullet');
	}
	
	this.getRandomShip = function () {  // random, but not destroyed
		var bottomShips = [];
		for(i=0; i < _cols; ++i) {
			bottomShips[i] = -1;
			for(j=0; j < _rows; ++j) {
				if (this.destroedShips.indexOf(j*_cols + i) == -1) {					
					bottomShips[i] = (j*_cols + i);				
				}				
			}
		}
		
		bottomShips = bottomShips.filter(function(s) {
			return (s != -1);
		});
		
		return bottomShips[Math.floor(Math.random()*bottomShips.length)];;
	}
	
	this.render();
}

/**
* Sprite class
*
* @ops mandatory are:
* 	context: 2d canvas context
* 	image: image url
*   size: square sprite width or height
*/

var Sprite = function (ops) {
	this._context = ops['context'] || null;
	this._size = ops['size'] || 32;
	this._speed = ops['speed'] || 30;	
	this._left = ops['left'] || 0;
	this._top = ops['top'] || 0;
	this._weight = ops['weight'] || 100;
	this._frame = 0;
	
	
	var _infinite = 1;
	if (ops['infinite'] != undefined) {
		_infinite = ops['infinite']
	}
	
	// image
	this._img = new Image();	
	this._img.src = ops['image'];	
	this._img.onload = function() {/*no need to do. see at css body:after*/};
	this._img.onerror = function() {
		console.error('Cannot load sprite file '+url);		
	}
	
	this.move = function(left, top) {
		this._left = left;
		this._top = top;
		this.render(this._left, this._top, this._frame);
	}
	
	this.top = function() {
		return this._top;
	}
	
	this.left = function() {
		return this._left;
	}
	
	this.size = function() {
		return this._size;
	}
	
	this.slide = function(dx, dy) {
		this._context.clearRect(this._left, this._top, this._size, this._size);
		this.render(this._left+dx, this._top + dy, this._frame);
	}
	
	this.tick = function() {
		++this._frame;
		this.render(this._left, this._top, this._frame);
	}
	
	this.render = function(left, top, frame) {
		if (this._context == null) {
			console.warn('Need to set context to sprite');
			return;
		}	
	
		if (!this._img.naturalWidth) {
			return;
		} 

		this._left = left;
		this._top = top;
		
		// outside sprite
		if ((frame * this._size) >= (this._img.naturalWidth * (this._img.naturalHeight / this._size))) {
			if (_infinite) {
				this._frame = 0;
			} else {
				return;
			}
		}

		this._context.clearRect(this._left, this._top, this._size, this._size);
		this._context.drawImage(this._img, 
			Math.round((this._frame * this._size) % this._img.naturalWidth), 
			Math.floor((this._frame * this._size) / this._img.naturalWidth) * this._size,
			this._size, 
			this._size, 
			Math.round(this._left), 
			Math.round(this._top), 
			this._size, 
			this._size);
	}
	
	this.render(this._left, this._top, this._frame);	
}