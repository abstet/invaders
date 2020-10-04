var fps = {
	startTime : 0,
	frameNumber : 0,
	getFPS : function(){
		this.frameNumber++;
		var d = new Date().getTime(),
			currentTime = ( d - this.startTime ) / 2000,
			result = Math.floor( ( this.frameNumber / currentTime ) );

		if( currentTime > 1 ){
			this.startTime = new Date().getTime();
			this.frameNumber = 0;
		}
		return result;
	}	
};

var f = document.querySelector("#fps");
function gameLoop(){
	setTimeout( gameLoop, 2000 / 60 );
	f.innerHTML = '<b>' + fps.getFPS() + '</b> FPS';
}

window.onload = gameLoop;