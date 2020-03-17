// IMPORT
const GAME_STATS = {
	CAMP_UPDATE_TIMER: 10,
	HUNGER_RATE: 0.66,
	DEATH_CHANCE_STARVING: 0.05,
	OVERPOPULATION_RATE: 5.0,
	STARVING_ATTRACTIVITY_LOSS: 10,
	SACRIFICE_TIME_THRESHOLD : 5000
};

// DEBUG
var DEBUG = true;

// CONSTS
const STATES = { CONSUME : 'consume' , GAIN:'gain' }
var JOB_LOSS = {} // Total chance of 1
JOB_LOSS["MINE"] = 0.5;
JOB_LOSS["FARM"] = 0.5;

var GRAPHICS = {}
GRAPHICS["slave"] = "☻"

const resources = {}

// RESOURCE BUNDLE
class RES_BUNDLE
{

}

/// CHAMPION
class Champion
{
    constructor(name)
    {
		this.name = name;
		loadChampion();

    }
}


/// PLAYER BASE
// Resources, Production
class PlayerBase {

	constructor(iPlayer)
	{
		this.player_ref = iPlayer;
		this.camp_update_counter = 1000;
		this.camp_update_elapsed = 0;

		this.time_since_last_sacrifice = 0;
		this.sacrifice_loss_attractrivity_factor = 1;

		this.rocks = 0;
		this.cairns = 0;
		this.population = 0;
		this.food = 30 ;
		this.souls = 0;

		this.rock_production = 0;
		this.food_production = 0;
		this.available_housing = 0;
		this.camp_hunger = 0;

		this.idle_pop = 0;
		this.miner_pop = 0;
		this.farmer_pop = 0;

		this.attractivity = 0; // can be negative and lose population ?

		this.champion = new Champion("tom");
		if (this.champion.name == "tom")
		this.attractivity = 0;

		this.world = new WorldCanvas(20, 20);
	}

	// MUTATORS
	addRocks(number)
	{ this.rocks += number; }
	addCairns(number)
	{ this.cairns += number; }

	// FUNCS
	produce()
	{
		this.rock_production = ( this.miner_pop * 0.1 )
		this.rocks += this.rock_production;

		this.food_production = ( this.farmer_pop * 0.15 )
		this.food += this.food_production;
	}

	update()
	{
		if (this.camp_update_elapsed >= GAME_STATS.CAMP_UPDATE_TIMER) 
		{
			this.updateFoodConsumption();
			this.updateAttractivity();
			this.updatePopulation();
			
			this.camp_update_elapsed = 0;
		} else { this.camp_update_elapsed++;}
	}

	updateAttractivity()
	{
		this.attractivity = 0;

		// Cairns helps ppl find a way to village
		this.attractivity += this.cairns / 2;
		
		if(this.population == 0)
			return;
		// Not enough housing ? Less attractive..
		var overpopulation = this.population - this.available_housing;
		this.attractivity -= ( overpopulation > 0 ) ? overpopulation * GAME_STATS.OVERPOPULATION_RATE : (-1) * overpopulation;
		this.attractivity -= ( this.food < 0 ) ? GAME_STATS.STARVING_ATTRACTIVITY_LOSS : (-1) * GAME_STATS.STARVING_ATTRACTIVITY_LOSS;
	}

	updateFoodConsumption()
	{
		if (this.population > 3)
		{
			var eaten_food = GAME_STATS.HUNGER_RATE * this.population;
			this.food -= eaten_food;

		}
		if (this.population==0 && this.food < 0)
			this.food = 0;
	}

	updatePopulation()
	{
		// HAVE ENOUGH FOOD
		var is_starving = this.food < 0;
		if ( is_starving && this.population > 0 )
		{
			var starvation_rate = GAME_STATS.DEATH_CHANCE_STARVING * ( Math.abs(this.food) % 10);
			var death_occures = Math.random() <= GAME_STATS.DEATH_CHANCE_STARVING;
			if(death_occures)
				this.losePopulation (1)
		}

		// ATTRACTIVITY
		if ( this.attractivity > 0  ) // Base required
		{
			if ( this.population < this.available_housing )
				if ( Math.random() - 1/this.cairns /* [0, 1] */ > 0 )
					this.gainPopulation(1);
		} else if ( this.attractivity == 0 ) {
			return;
		} else { // Negative val
			if (this.population>0)
				this.losePopulation(1);
		}

		this.refreshPopulationView();
	}

	equalizePopIfNeeded()
	{
		var total_sub_pop = this.idle_pop + this.farmer_pop + this.miner_pop;
		var delta = this.population - total_sub_pop;
		if (delta > 0)
			this.losePopulation(delta);
	}


	gainPopulation(number)
	{
		this.population++;
		this.idle_pop++;
		__player.base.refreshPopulationView();
	}

	losePopulation(number)
	{
		if (this.population<=0)
			return;

		this.population--;
		if (this.idle_pop > 0)
		{
			this.idle_pop--;
			__player.base.refreshPopulationView();
			return;
		}

		var job_to_remove = Math.random();
		var total_probability = 0;
		for ( var key in JOB_LOSS )
		{
			total_probability += JOB_LOSS[key];
			if ( job_to_remove <= total_probability )
			{
				switch(key)
				{
					case "MINE":
						if (this.miner_pop>0)
							this.miner_pop--;
						else if ( this.farmer_pop>0)
							this.farmer_pop--
						break;
					case "FARM":
						if (this.farmer_pop>0)
							this.farmer_pop--;
						else if (this.miner_pop>0)
							this.miner_pop--;
						break;
					default:
						break;
				}
				break;
			}
		}
		__player.base.refreshPopulationView();
	}

		refreshPopulationView()
		{
			if (this.player_ref._b_buy_housing_unlocked)
			{
				// REFRESH POPULATION
				
				var idle_msg = "";
				for ( var i = 0 ; i < this.idle_pop ; i++)
				{
					idle_msg += GRAPHICS["slave"];
				}
				document.getElementById("idle_pop_label").innerHTML = idle_msg;

				document.getElementById("miners_pop_label").innerHTML = "";
				for ( var i = 0 ; i < this.miner_pop ; i++)
				{
					document.getElementById("miners_pop_label").innerHTML += GRAPHICS["slave"];
				}
		
				document.getElementById("farmers_pop_label").innerHTML = "";
				for ( var i = 0 ; i < this.farmer_pop ; i++)
				{
					document.getElementById("farmers_pop_label").innerHTML += GRAPHICS["slave"];
				}
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
		this.LEVELS_ROCKS_REQ 	= [10, 20, 30, 40];
		this.base = new PlayerBase(this);
		this.initializeUnlockables();

		if (DEBUG)
			this.godMode();
	}

	godMode()
	{
		this.base.rocks = 999999999;
	}
	// Unlockable upgrades
	initializeUnlockables()
	{
		this._b_cairn_unlocked = false;
		this._b_buy_housing_unlocked = false;
		this._b_sacrifice_unlocked = false;
		this._b_map_unlocked = false;
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
				this._b_buy_housing_unlocked = true;
				document.getElementById("buy_housing_upgrade_btn").style.display = 'block';
				document.getElementById("assign_to_mine_btn").style.display = 'block';
				document.getElementById("assign_to_farm_btn").style.display = 'block';
				document.getElementById("deassign_from_mine_btn").style.display = 'block';
				document.getElementById("deassign_from_farm_btn").style.display = 'block';
				break;
			case 3:
				this._b_sacrifice_unlocked = true;
				document.getElementById("buy_sacrifice_upgrade_btn").style.display = 'block';
			case 4:
				if (!this._b_map_unlocked)
					this.world = new WorldCanvas(21, 21);
				this._b_map_unlocked = true;
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


		this.time_since_last_sacrifice++;
		if (this.time_since_last_sacrifice> GAME_STATS.SACRIFICE_TIME_THRESHOLD)
		{
			this.sacrifice_loss_attractrivity_factor -= ( sacrifice_loss_attractrivity_factor > 1 ) ? 1 : 0;
		}

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
		document.getElementById("attractivity_label").innerHTML = this.base.attractivity.toFixed(2);
		document.getElementById("population_label").innerHTML = this.base.population;
		document.getElementById("player_level_label").innerHTML = this.level;
		document.getElementById("cost_buy_housing").innerHTML = housingUpgradeCost().toFixed(2);
		document.getElementById("housing_available_label").innerHTML = this.base.available_housing.toFixed(2);
		document.getElementById("food_label").innerHTML= this.base.food.toFixed(2);
		document.getElementById("foodProduction_label").innerHTML= this.base.food_production.toFixed(2);
		document.getElementById("souls_label_cpt").innerHTML= this.base.souls.toFixed(2);
		document.getElementById("cost_sacrifice").innerHTML= 1;

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
/// CANVAS
const WORLD_AREAS = [
	'none',
	'undiscovered',
	'base',
	'road',
	'forest',
	'mountain',
	'water'
];

class WorldCanvas
{
	isNoneIndex = (element) => element == 'none';
	isUndiscoveredIndex = (element) => element == 'undiscovered';
	isBaseIndex = (element) => element == 'base';
	isForestIndex = (element) => element == 'forest';
	isMountainIndex = (element) => element == 'mountain';
	isRoadIndex = (element) => element == 'road';
	isWaterIndex = (element) => element == 'water';


	WorldCanvas()
	{
		this(21, 21);
	}

	constructor(n_rows, n_columns)
	{
		// init object
		this.init();
		this.rows = n_rows;
		this.columns = n_columns;
		this.cell_size_w = (this.pxl_width / this.columns);
		this.cell_size_h = (this.pxl_height / this.rows);

		// init world
		this.initMatrix();
		this.initWorld();

		this.selected_zone_index = 0;
		this.selected_zone = { x: 0, y: 0 };

		this.initLocalAreas();
		this.loadLocalArea();

		//params
		this.drawGrid = true;
		this.world_seed = randomStr(6, "mauveMAUVE123456!");

		
		// Init user mouse control
		this.canvas.addEventListener(
			'mousedown', function(event) {
				var pos = getMousePos( __player.world.canvas, event);
				__player.world.selectZone( pos.x, pos.y);
			}, false
		);

	}

	selectZone(pos_x, pos_y)
	{

		// find selected zone
		var col_index = 0;
		for (var i=1; i <= this.columns; i++)
		{
			if ( pos_x >= i * this.cell_size_w)
			{
				if  ( pos_x < ( (i+1) *this.cell_size_w) )
				{ col_index = i; break;}				
			}
		}

		var row_index = 0;
		for (var j=1; j <= this.rows; j++)
		{
			if ( pos_y >= j * this.cell_size_h)
			{
				if  ( pos_y < ( (j+1) *this.cell_size_h) )
				{ row_index = j;  break; }	
			}
		} 

		document.getElementById("zone_debug_label").innerHTML = " [" + row_index + "] ["+  col_index + "] ";
		this.selected_zone_index = this.map[row_index][col_index];
		this.selected_zone.x = col_index;
		this.selected_zone.y = row_index;

		this.drawSelectedBaseCursor( row_index, col_index);

		this.loadLocalArea();

	}

	drawSelectedBaseCursor( iRowIndex, iColIndex)
	{

		var x_orig = iColIndex * this.cell_size_w;
		var y_orig = iRowIndex * this.cell_size_h;

		var x_top_right = (iColIndex+1) * this.cell_size_w;
		var y_top_right = (iRowIndex) * this.cell_size_h;
		
		var x_bot_right = (iColIndex+1) * this.cell_size_w;
		var y_bot_right = (iRowIndex+1) * this.cell_size_h;

		var x_bot_left = (iColIndex) * this.cell_size_w;
		var y_bot_left = (iRowIndex+1) * this.cell_size_h;

		var color = '#a142f5';
		var lineWidth = 3;
		this.drawLine( x_orig, y_orig, x_top_right, y_top_right, color, lineWidth);
		this.drawLine( x_top_right, y_top_right, x_bot_right, y_bot_right, color, lineWidth);
		this.drawLine( x_orig, y_orig, x_bot_left, y_bot_left, color, lineWidth);
		this.drawLine( x_bot_left, y_bot_left, x_bot_right, y_bot_right, color, lineWidth);

	}
	
	loadLocalArea()
	{
		this.selected_local_area = this.local_areas[this.selected_zone.y][this.selected_zone.x];
	}

	initMatrix()
	{
		var default_value = 0;
		this.map = [...Array(this.rows)].map(e => Array(this.columns).fill(default_value));
	}

	initLocalAreas()
	{
		this.local_areas = [...Array(this.rows)].map(e => Array(this.columns).fill( 
			new LocalArea( randomStr(8, "123456789abcdefABCDEF!"), WORLD_AREAS[0]) 
			) );	
	}

	getTerrainAreas()
	{
		return WORLD_AREAS.filter( e => (e!=WORLD_AREAS[0]) && 
										(e!=WORLD_AREAS[1]) && 
										(e!=WORLD_AREAS[2]) && 
										(e!=WORLD_AREAS[3]) );
	}

	initWorld()
	{
		// 1 Borders are water
		var water = WORLD_AREAS.findIndex(this.isWaterIndex);
		this.map[0].fill(water);
		this.map[this.rows-1].fill(water);
		for (var i=0; i < this.rows; i++)
		{
			this.map[i][0] = water;
			this.map[i][this.columns-1] = water;
		}

		// 2 generate weight table for terrain
		// > total is 100
		var weight_table = {};
		//var terrains = this.getTerrainAreas();
		//terrains.forEach( e => weight_table[e] = 100 / terrains.length ) ; // equirepartition
		weight_table['forest'] = 50;
		weight_table['mountain'] = 25;
		weight_table['water'] = 25;

		// 3 generate terrain
		var remaining_tiles = ((this.rows - 2) * (this.columns - 2)) - 1; // minus water border and base
		var to_dispatch = {
			n_water_tiles  	:  0, 
			n_forest_tiles 	:  0,
			n_mountain_tiles :  0
		}
		var forest_proba = weight_table['forest'];
		var mountain_proba = weight_table['mountain'];
		var water_proba = weight_table['water'];
		while( remaining_tiles > 0 )
		{
			var rand_res = Math.random() * 100;
			if ( rand_res < forest_proba )
				to_dispatch.n_forest_tiles++;
			else if (rand_res < ( forest_proba + mountain_proba ) )
				to_dispatch.n_mountain_tiles++;
			else if ( rand_res < ( forest_proba + mountain_proba + water_proba ) )
				to_dispatch.n_water_tiles++;
			remaining_tiles--;
		}

		var map_is_valid = false;
		var n_max_try = 5;
		var tries = 0;
		while ( !map_is_valid )
		{
			this.dispatchOnMap(to_dispatch, weight_table);
			map_is_valid = this.checkMapRules(to_dispatch);
			if (!map_is_valid)
				tries++;
			if ( tries >= n_max_try )
				break;
		}

		this.fillMapHoles();

		// 4 generate life


		// 5 insert base in da middle
		this.map[10][10] = WORLD_AREAS.findIndex(this.isBaseIndex);//'base'
	}

	fillMapHoles()
	{
		for ( var i = 1; i < this.rows - 1 ; i++)
		{
			for ( var j = 1; j < this.columns - 1; j++)
			{
				if  (this.map[i][j] != 0 )
					continue;
				var nearby_tiles = [
					this.map[i-1][j],
					this.map[i+1][j],
					this.map[i][j-1],
					this.map[i][j+1],
				];
				var n_forest=0, n_mountain=0, n_water=0;
				nearby_tiles.forEach( e => {
					if ( e == WORLD_AREAS.findIndex(this.isForestIndex))
						n_forest++;
					else if ( e == WORLD_AREAS.findIndex(this.isMountainIndex))
						n_mountain++;
					else if ( e == WORLD_AREAS.findIndex(this.isWaterIndex))
						n_water++;
				});

				var n_types = {};
				n_types["f"] = n_forest;
				n_types["m"] = n_mountain;
				n_types["w"] = n_water;

				var to_array = [];
				for (var key in n_types) {
				to_array.push({
					name: key,
					value: n_types[key]
				});
				}

				var sorted = to_array.sort(
					function(lval, rval) {
						(lval.value < rval.value ) ?  1 : ((rval.value > lval.value) ? -1 : 0);
					}
				);
				
				var selected_to_fill = sorted[0].key;
				switch(selected_to_fill)
				{
					case "f":
						this.map[i][j] = WORLD_AREAS.findIndex(this.isForestIndex);
						break;
					case "m":
						this.map[i][j] = WORLD_AREAS.findIndex(this.isMountainIndex);
						break;
					case "w":
						this.map[i][j] = WORLD_AREAS.findIndex(this.isWaterIndex);
						break;
					default:
						break;
				}
				
			}
		}

	}

	dispatchOnMap( iTo_dispatch, iWeightTable )
	{
		var forest = iTo_dispatch.n_forest_tiles;
		var mountain = iTo_dispatch.n_mountain_tiles;
		var water = iTo_dispatch.n_water_tiles;

		var forest_remain = ( forest > 0);
		var mountain_remain = ( mountain > 0);
		var water_remain = ( water > 0);

		var forest_proba = iWeightTable['forest'];
		var mountain_proba = iWeightTable['mountain'];
		var water_proba = iWeightTable['water'];

		for ( var i = 1; i < this.rows - 1 ; i++)
		{
			for ( var j = 1; j < this.columns - 1; j++)
			{
				if ( this.map[i][j] != 0 )
					continue;// tile already set

				if ( (i==10) && (j==10) )
					continue; // base

				var rand_res = Math.random() * 100;
				if ( (rand_res < forest_proba) && forest_remain )
				{
					this.map[i][j] = WORLD_AREAS.findIndex( this.isForestIndex );
					forest--;
				}
				else if ( (rand_res < ( forest_proba + mountain_proba )) && mountain_remain )
				{
					this.map[i][j] = WORLD_AREAS.findIndex( this.isMountainIndex );
					mountain--;
				}
				else if ( (rand_res <= ( forest_proba + mountain_proba + water_proba )) && water_remain )
				{
					this.map[i][j] = WORLD_AREAS.findIndex( this.isWaterIndex );
					water--;
				} else {
					// random res returned no result, so picked terrain not available anymore
					if (forest_remain)
					{
						this.map[i][j] = WORLD_AREAS.findIndex( this.isForestIndex );
						forest--;
					}
					else if (mountain_remain)
					{
						this.map[i][j] = WORLD_AREAS.findIndex( this.isMountainIndex );
						mountain--;
					}
					else if (water_remain)
					{
						this.map[i][j] = WORLD_AREAS.findIndex( this.isWaterIndex );
						water--;
					}
				}

				forest_remain 	= ( forest > 0);
				mountain_remain = ( mountain > 0);
				water_remain 	= ( water > 0);

			}//! j col
		}//! i row
		iTo_dispatch.n_forest_tiles = forest;
		iTo_dispatch.n_mountain_tiles = mountain;
		iTo_dispatch.n_water_tiles = water;

	}//! dispatch

	checkMapRules(oTo_dispatch)
	{
		// Todo... output in oto_dispatch
		var mapIsValid = true;

		for ( var i = 1; i < this.rows - 1 ; i++)
		{
			for ( var j = 1; j < this.columns - 1; j++)
			{
				var tile_type = this.map[i][j];
				var tile_is_valid = true;
				switch( tile_type )
				{
					case WORLD_AREAS.findIndex( this.isForestIndex ):
						tile_is_valid = this.validateForestTile(i, j);
						if (!tile_is_valid)
							oTo_dispatch.n_forest_tiles++;
						break;
					case WORLD_AREAS.findIndex( this.isMountainIndex ):
						tile_is_valid = this.validateMountainTile(i, j);
						oTo_dispatch.n_mountain_tiles++;
						break;
					case WORLD_AREAS.findIndex( this.isWaterIndex ):
						tile_is_valid = this.validateWaterTile(i, j);
						oTo_dispatch.n_water_tiles++;
						break;
					default:
						break;
				}
				if (!tile_is_valid)
				{
					// redistribute_tile
					this.map[i][j] = 0;
					mapIsValid = false;
				}
			}
		}

		return mapIsValid;
	}

	validateForestTile( iRow, iCol)
	{
		var is_valid = false;
		// must have a 2-link
		is_valid = this.validateDirectTileLinks( iRow, iCol, WORLD_AREAS.findIndex( this.isForestIndex ), 2);
		
		return is_valid;	
	}

	validateMountainTile( iRow, iCol)
	{
		var is_valid = false;
		// must have a 2-link
		is_valid = this.validateDirectTileLinks( iRow, iCol, WORLD_AREAS.findIndex( this.isMountainIndex ), 1);
		
		return is_valid;	
	}

	validateWaterTile( iRow, iCol)
	{
		var is_valid1 = false, is_valid2 = false, is_valid3 = false;

		// must be out of map center
		is_valid2 = (iRow >= 13) || (iRow<=7);
		is_valid3 = (iCol >= 13) || (iCol<=7);

		// must have a 2-link
		is_valid1 = this.validateDirectTileLinks( iRow, iCol, WORLD_AREAS.findIndex( this.isWaterIndex ), 1);
		
		return is_valid1 && is_valid2 && is_valid3;	
	}


	// check for direct link on cell aretes of given tiletype
	validateDirectTileLinks( iRow, iCol, tileType, n_links)
	{
		var links = 0;

		if ((iRow > 0) && (iCol > 0))
		{
			var arete_a_tileType = this.map[iRow-1][iCol];
			var arete_b_tileType = this.map[iRow+1][iCol];
			var arete_c_tileType = this.map[iRow][iCol-1];
			var arete_d_tileType = this.map[iRow][iCol+1];
			
			if ( arete_a_tileType == tileType )
				links++;
			if ( arete_b_tileType == tileType )
				links++;
			if ( arete_c_tileType == tileType )
				links++;
			if ( arete_d_tileType == tileType )
				links++;
		}
		
		return ( links >= n_links );
	}

	init()
	{
		this.canvas = document.getElementById("main_canvas");
		this.ctx_2d = this.canvas.getContext('2d');
		this.canvas.style.display = 'initial';

		this.area_canvas = document.getElementById("local_area_canvas");
		this.arena_ctx_2d = this.area_canvas.getContext('2d');
		this.area_canvas.style.display = 'initial';

		this.pxl_width = this.canvas.width;
		this.pxl_height = this.canvas.height;
	}

	draw()
	{

		this.ctx_2d.fillStyle = 'white';
		this.ctx_2d.fillRect(0, 0, this.pxl_width, this.pxl_height);
		this.ctx_2d.scale(1, 1);

		this.drawWorld();
		if ( this.selected_zone_index != this.isNoneIndex )
			this.drawSelectedBaseCursor( this.selected_zone.y, this.selected_zone.x);

		this.refreshUI();


	}

	drawLocalArea()
	{
		this.arena_ctx_2d.fillStyle = this.getTileColor( this.map[this.selected_zone.y][this.selected_zone.x] );
		this.arena_ctx_2d.fillRect(0, 0, this.pxl_width, this.pxl_height);
		this.arena_ctx_2d.scale(1, 1);
	}

	refreshUI()
	{
		document.getElementById("selected_zone_label").innerHTML = WORLD_AREAS[ this.selected_zone_index ];
	}

	drawWorld()
	{
		this.cell_size_w = (this.pxl_width / this.columns);
		this.cell_size_h = (this.pxl_height / this.rows);

		/// DRAW TILES 
		for ( var j_row=0; j_row < this.columns; j_row++)
		{
			for ( var i_col=0; i_col < this.rows; i_col++)
			{
				var area_type = this.map[j_row][i_col];
				var x_orig 	= i_col * this.cell_size_w;
				var x_end 	= (i_col+1) * this.cell_size_w;

				var y_end 	= (j_row+1) * this.cell_size_h;	
				var y_orig 	= j_row * this.cell_size_h;

				this.drawTile( area_type, x_orig, y_orig, x_end, y_end);
			}//! for i_col
		}//! for j_row

		/// DRAW GRID
		if ( this.drawGrid )
		{
			for (var i=1; i<this.columns; i++)
			{

					var x_orig 	= i * this.cell_size_w;
					var y_orig 	= 0;
					var x_end 	= i * this.cell_size_w;
					var y_end 	= this.pxl_height;
					this.drawLine( x_orig, y_orig, x_end, y_end);
			}//!for i rows

			for (var j=1; j<this.rows; j++)
			{
					var x_orig 	= 0;
					var y_orig 	= j * this.cell_size_h;
					var x_end 	= this.pxl_width;
					var y_end 	= j * this.cell_size_h;	
					this.drawLine( x_orig, y_orig, x_end, y_end);
			}//! for j cols
		}//! drawGrid

	}

	drawLine( x_orig, y_orig, x_end, y_end)
	{
		/*
		this.ctx_2d.beginPath();
		this.ctx_2d.moveTo( x_orig, y_orig);
		this.ctx_2d.lineTo( x_end, y_end);
		this.ctx_2d.stroke();
		*/
		this.drawLine( x_orig, y_orig, x_end, y_end, '#000000', 1);
	}

	drawLine( x_orig, y_orig, x_end, y_end, color, line_width)
	{
		this.ctx_2d.beginPath();
		this.ctx_2d.moveTo( x_orig, y_orig);
		this.ctx_2d.lineTo( x_end, y_end);

		var previous_color = this.ctx_2d.strokeStyle;
		var previous_width = this.ctx_2d.lineWidth;
		this.ctx_2d.lineWidth = line_width;
		this.ctx_2d.strokeStyle = color;
		this.ctx_2d.stroke();
		this.ctx_2d.strokeStyle = previous_color;
		this.ctx_2d.lineWidth = previous_width;

	}

	getTileColor(tile_type)
	{
		var color = 'white';
		switch(tile_type)
		{
			case WORLD_AREAS.findIndex(this.isBaseIndex):
				color = 'orangered';
				break;
			case WORLD_AREAS.findIndex(this.isForestIndex):
				color = 'palegreen';
				break;
			case WORLD_AREAS.findIndex(this.isMountainIndex):
				color = 'rosybrown';
				break;
			case WORLD_AREAS.findIndex(this.isRoadIndex):
				color = 'sandybrown';
				break;
			case WORLD_AREAS.findIndex(this.isWaterIndex):
				color = 'paleturquoise';
				break;
			default:
				color = 'white';
				break;
		}
		return color;
	}

	drawTile( tile_type, x_orig, y_orig, x_end, y_end)
	{
		this.ctx_2d.fillStyle = this.getTileColor(tile_type);
		this.ctx_2d.fillRect( x_orig, y_orig, x_end, y_end);
	}


}//! WorldCanvas

// -------------------------------------------
/// LOCAL AREA

class LocalArea
{
	constructor( iRNGSeed, iAreaType)
	{
		this.seed = iRNGSeed;
		this.area_type = iAreaType;

		this.init();

	}

	init()
	{

	}

	draw( iContext2D)
	{

	}


}//! LocalArea


// -------------------------------------------
/// UI BUTTONS
function  addRock(number)
{
	__player.base.addRocks(number);
}

// CAIRN
function buyCairnUpgrade(number)
{
	upgrade_cost = cairnUpgradeCost();
	if ( (__player.base.rocks >= upgrade_cost) && __player._b_cairn_unlocked)
	{
		__player.base.addCairns(number);
		__player.base.addRocks( (-1) * upgrade_cost );
	}

}

// HOUSING
function buyHousing(number)
{
	upgrade_cost = housingUpgradeCost();
	if ( (__player.base.rocks >= upgrade_cost) && __player._b_buy_housing_unlocked)
	{
		__player.base.available_housing += number;
		__player.base.rocks -= upgrade_cost;
	}

}

// ASSIGN
function assignToFarm(number)
{
	if ( __player.base.idle_pop > 0 )
	{
		__player.base.farmer_pop++;
		__player.base.idle_pop--;
		__player.base.refreshPopulationView();
	}
}

function deassignFromFarm(number)
{
	if ( __player.base.farmer_pop > 0 )
	{
		__player.base.farmer_pop--
		__player.base.idle_pop++;
		__player.base.refreshPopulationView();
	}
}

function assignToMine(number)
{
	if ( __player.base.idle_pop > 0 )
	{
		__player.base.miner_pop++;
		__player.base.idle_pop--;
		__player.base.refreshPopulationView();
	}
}

function deassignFromMine(number)
{
	if ( __player.base.miner_pop > 0 )
	{
		__player.base.miner_pop--
		__player.base.idle_pop++;
		__player.base.refreshPopulationView();
	}
}

//SACRIFICE
function sacrificeSlave(number)
{
	if ( __player.base.population > 0)
	{
		__player.base.losePopulation(1);
		__player.base.souls+=number;
		__player.base.time_since_last_sacrifice = 0;
		__player.base.sacrifice_loss_attractrivity_factor++;
	}
}

// GET MOUSE
function getMousePos( iCanvas, event) {
    var rect = iCanvas.getBoundingClientRect();
    return {
        x: (event.clientX - rect.left) / (rect.right - rect.left) * iCanvas.width,
        y: (event.clientY - rect.top) / (rect.bottom - rect.top) * iCanvas.height
    };
  }

// CHAMPION
function loadChampion(name)
{
	switch(name)
	{
		case "CrazyBlue":
			break;
		case "DirtyOrange":
			break;
		case "LazyRed":
			break;
		case "HairyBrown":
			break;
		case "BigCrankHandle":
			break;
	}
}


// -------------------------------------------
/// COSTS
function cairnUpgradeCost()
{
	return Math.floor(10 * Math.pow(1.5, __player.base.cairns)); 
}

function housingUpgradeCost()
{
	return Math.floor(10 * Math.pow(1.5, __player.base.available_housing)); 
}

// -------------------------------------------
/// UTILS
function randomStr( len, arr) { 
	var ans = ''; 
	for (var i = len; i > 0; i--)
			ans += arr[Math.floor(Math.random() * arr.length)]; 
	return ans; 
} 


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
	if (!!__player._b_map_unlocked)
	{
		var world = __player.world;
		if (!!world)
		{
			world.draw();
			world.drawLocalArea();
		}	
			
	}

}, time_update_player);



