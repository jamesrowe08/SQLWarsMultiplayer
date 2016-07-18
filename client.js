var game = {};

//When loading, store references to drawing canvas and initiate a game instance.
window.onload = function(){

	//Create a game instance
	game = new game_core();
	game.viewport = document.getElementById('viewport');
	game.viewport.width = game.world.width;
	game.viewport.height = game.world.height;
	game.ctx = game.viewport.getContext('2d');
	game.ctx.font = '11px "Helvetica"';

	//Start the game loop
	game.update( new Date().getTime() );

};
