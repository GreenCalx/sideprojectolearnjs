var _autoRocks  	= 0;

// CONSTS
const states = { CONSUME: 'consume' , GAIN: 'gain' }
const resources = {}

// RESOURCE BUNDLE
class RES_BUNDLE
{

}

/// PLAYER BASE
// Resources, Production
class PlayerBase {

	constructor()
	{
		this.rocks = 0;
		this.cairns = 0;
		this.population = 0;
		this.food = 0;

		this.rock_production = 0;
		this.food_production = 0;
		this.available_housing = 0;

		this.attractivity = 0; // can be negative and lose population ?
	}

	// MUTATORS
	addRocks(number)
	{ this.rocks += number; }
	addCairns(number)
	{ this.cairns += number; }

	// FUNCS
	produce()
	{
		this.addRocks(this.rock_production);
	}

	update()
	{
		this.updateAttractivity();
		this.updatePopulation();
	}

	updateAttractivity()
	{
		// Cairns helps ppl find a way to village
		this.attractivity = this.cairns;

		// Not enough housing ? Less attractive..
		var housing_pop_delta = this.available_housing - this.population;
		this.attractivity += ( housing_pop_delta > 0 ) ? (-1) * housing_pop_delta : housing_pop_delta;

	}

	updateRockProduction()
	{

	}

	updatePopulation()
	{
		if ( this.attractivity > 0 ) // Base required
		{
			if ( Math.random() - 1/this.cairns /* [0, 1] */ > 0 )
			this.population++;
		} else if ( this.attractivity == 0 ) {
			return;
		} else { // Negative val
			if (this.population>0)
				this.population--;
		}
	}

} //! Base

/// PLAYER
// Unlockables, Levels, Actions
class Player {

	// _level = 0;
	// LEVELS_ROCKS_REQ = [50, 500, 1000];
	
	constructor() 
	{ 
		this._level 			= 0; 
		this.LEVELS_ROCKS_REQ 	= [10, 20, 30];
		this.base = new PlayerBase();
		this.initializeUnlockables();

	}
	
	// Unlockable upgrades
	initializeUnlockables()
	{
		this._b_cairn_unlocked = false;
		this._b_rock_prod_unlocked = false;
		this._b_buy_housing_unlocked = false;
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
				this._b_rock_prod_unlocked = true;
				document.getElementById("rock_prod_upgrade_btn").style.display = 'block';
				break;
			case 3:
				this._b_buy_housing_unlocked = true;
				document.getElementById("buy_housing_upgrade_btn").style.display = 'block';
				break;
			default:
				break;
		}
		return;
	}// !unlock_feature

	update()
	{
		this.base.produce();
		this.base.update();

		this.updateLevel();


		this.refreshView();
	}
	
	updateLevel()
	{
		if (this.base.rocks >= this.LEVELS_ROCKS_REQ[ this.level ] )
		{
			this._level++;
			this.unlock_feature(this._level);
		}
		return;
	}
	
	refreshView()
	{
		document.getElementById("cost_cairn").innerHTML = cairnUpgradeCost();
		document.getElementById("rocks_label").innerHTML = this.base.rocks.toFixed(2);
		document.getElementById("cairnUpgrade_label").innerHTML = this.base.cairns;
		document.getElementById("autoRocks_label").innerHTML = this.base.rock_production.toFixed(2);
		document.getElementById("cost_rock_production").innerHTML = rockProductionUpgradeCost();
		document.getElementById("attractivity_label").innerHTML = this.base.attractivity;
		document.getElementById("population_label").innerHTML = this.base.population;
		document.getElementById("player_level_label").innerHTML = this.level;
		document.getElementById("cost_buy_housing").innerHTML = housingUpgradeCost();
		document.getElementById("housing_available_label").innerHTML = this.base.available_housing;

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
	if ( __player.base.rocks >= upgrade_cost )
	{
		__player.base.rock_production += number;
		__player.base.rocks -= upgrade_cost;
	}
	//document.getElementById("autoRocks_label").innerHTML = _autoRocks;
}

// CAIRN
function buyCairnUpgrade(number)
{
	upgrade_cost = cairnUpgradeCost();
	if ( (__player.base.rocks >= upgrade_cost) && __player._b_buy_housing_unlocked)
	{
		__player.base.addCairns(number);
		__player.base.addRocks( (-1) * upgrade_cost );
	}

}

// HOUSING
function buyHousing(number)
{
	upgrade_cost = housingUpgradeCost();
	if ( (__player.base.rocks >= upgrade_cost) && __player._b_cairn_unlocked)
	{
		__player.base.available_housing += number;
		__player.base.rocks -= upgrade_cost;
	}

}

// -------------------------------------------
/// COSTS
function cairnUpgradeCost()
{
	return Math.floor(10 * Math.pow(1.5, __player.base.cairns)); 
}

function rockProductionUpgradeCost()
{
	return Math.floor(10 * Math.pow(2.5, __player.base.rock_production)); 
}

function housingUpgradeCost()
{
	return Math.floor(10 * Math.pow(5.5, __player.base.available_housing)); 
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
