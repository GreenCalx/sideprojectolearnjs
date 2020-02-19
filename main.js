var _autoRocks  	= 0;

var	_autoGeneration = 0;
var _population = 1;
var _cairnUpgrade = 0;
var MAX_CAIRN_UPGRADE = 10;

/// PLAYER BASE
// Resources, Production
class PlayerBase {

	constructor()
	{
		this.rocks = 0;
		this.population = 0;

		this.rock_production = 0;
	}

	addRocks(number)
	{
		this.rocks += number;
	}

	produce()
	{
		this.addRocks(this.rock_production);
	}
}

/// PLAYER
// Unlockables, Levels, Actions
class Player {

	// _level = 0;
	// LEVELS_ROCKS_REQ = [50, 500, 1000];
	
	constructor() 
	{ 
		this._level 			= 0; 
		this.LEVELS_ROCKS_REQ 	= [5, 10, 1000];
		this.base = new PlayerBase();
		this.initializeUnlockables();

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
		this.base.produce();
		this.updateLevel();
		this.refreshView();
	}
	
	updateLevel()
	{
		if (this.base.rocks > this.LEVELS_ROCKS_REQ[ this.level ] )
		{
			this._level++;
			this.unlock_feature(this._level);
		}
		return;
	}
	
	refreshView()
	{
		document.getElementById("cost_cairn").innerHTML = cairnUpgradeCost();
		document.getElementById("rocks_label").innerHTML = this.base.rocks;
		document.getElementById("cairnUpgrade_label").innerHTML = _cairnUpgrade;
		document.getElementById("autoRocks_label").innerHTML = this.base.rock_production;
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
/// UI BUTTONS
function  addRock(number)
{
	__player.base.addRocks(number);
}

function  buyAutoRock(number)
{
	upgrade_cost = rockProductionUpgradeCost();
	if ( __player.base.rocks > upgrade_cost )
	{
		__player.base.rock_production += number;
		__player.base.rocks -= upgrade_cost;
	}
	document.getElementById("autoRocks_label").innerHTML = _autoRocks;
}

// CAIRN
function buyCairnUpgrade(number)
{
	cairn_cost = cairnUpgradeCost();
	if ( (__player.base.rocks > cairn_cost) && __player._b_cairn_unlocked)
	{
		_cairnUpgrade += 1;
		__player.base.addRocks( (-1) * cairn_cost );
	}

}

// -------------------------------------------
/// COSTS
function cairnUpgradeCost()
{
	return Math.floor(10 * Math.pow(1.1, _cairnUpgrade)); 
}

function rockProductionUpgradeCost()
{
	return Math.floor(10 * Math.pow(2.5, __player.base.rock_production)); 
}
// -------------------------------------------

// GAME LOOP
var timer_freq 			= 1000 ; // 1 sec
var time_update_player 	= 100; //0.1sec
var __player = new Player();
/*
window.setInterval( function(){
	refreshView()
}, timer_freq ); // 1 sec/tick
*/
window.setInterval( function(){
	__player.update();
}, time_update_player);
