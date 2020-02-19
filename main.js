var _rocks 			= 0;
var _autoRocks  	= 0;


var _woods		= 0;
var _food		= 0;

var	_autoGeneration = 0;
var _population = 1;
var _cairnUpgrade = 0;
var MAX_CAIRN_UPGRADE = 10;




// PLAYER
class Player {

	// _level = 0;
	// LEVELS_ROCKS_REQ = [50, 500, 1000];
	
	constructor() 
	{ 
		this._level 			= 0; 
		this.LEVELS_ROCKS_REQ 	= [5, 10, 1000];
		this._total_rocks 		= 0;
		
		//initializeUnlockables();
		this._b_cairn_unlocked = false;

	}
	
	// Unlockable upgrades
	initializeUnlockables()
	{
		this._b_cairn_unlocked = false;
	}
	
	// MUTATORS
	get level() 
	{
		return this._level;
	}
	
	updateTotalRocks(number)
	{
		this._total_rocks += number;
	}
	
	
	// Feature unlocker
	unlock_feature(level)
	{
		switch (level)
		{
			case 1:
				this._b_cairn_unlocked = true;
				document.getElementById("cairn_upgrade_button").style.display = 'block';
				break;
			case 2:
			case 3:
			default:
				break;
		}
		return;
	}// !unlock_feature

	update()
	{
		this.updateLevel();
	}
	
	updateLevel()
	{
		if (this._total_rocks > this.LEVELS_ROCKS_REQ[ this.level ] )
		{
			this._level++;
			this.unlock_feature(this._level);
		}
		return;
	}
	

	
}// !Player




function load_features(player)
{
	for (i=0; i< player.level;i++)
	{
		player.unlock_feature(i);
	}
}


// -------------------------------------------

// ROCKS
function  addRock(number)
{
	_rocks += number;
	document.getElementById("rocks_label").innerHTML = _rocks;
	__player.updateTotalRocks(number);

}

function  buyAutoRock(number)
{
	_autoRocks += number;
	document.getElementById("autoRocks_label").innerHTML = _autoRocks;
}
// -------------------------------------------

// CAIRN
function buyCairnUpgrade(number)
{
	if ( cairnUpgradeCost() && _cairnUpgrade)
		_cairnUpgrade += 1;
}
function cairnUpgradeCost()
{
	return Math.floor(10 * Math.pow(1.1, _cairnUpgrade)); 
}
// -------------------------------------------

// GAME LOOP
var timer_freq 			= 1000 ; // 1 sec
var time_update_player 	= 100; //0.1sec
var __player = new Player();

window.setInterval( function(){
	addRock(_autoRocks )
}, timer_freq ); // 1 sec/tick

window.setInterval( function(){
	__player.update();
}, time_update_player);
