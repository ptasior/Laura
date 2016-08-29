require(
  {
        baseUrl: './',
        packages: [{
            name: 'physicsjs',
            location: 'js/physicsjs',
            main: 'physicsjs'
        }]
  },
  [
  'require',
  'js/other/jquery',
  'js/types',
  'js/events',
  'physicsjs',
  'physicsjs/renderers/canvas',
  'physicsjs/bodies/circle',
  'physicsjs/bodies/rectangle',
  'physicsjs/bodies/convex-polygon',
  'physicsjs/behaviors/sweep-prune',
  'physicsjs/behaviors/body-collision-detection',
  'physicsjs/behaviors/body-impulse-response',
  'physicsjs/behaviors/edge-collision-detection',
  'physicsjs/behaviors/constant-acceleration',
],
function(require, jQuery, types, events, Physics)
{
var objStyles = {
			'circle' : {
				strokeStyle: '#351024',
				lineWidth: 1,
				fillStyle: 'gray',
				angleIndicator: '#351024'
			},
			'rectangle' : {
				lineWidth: 1,
				fillStyle: 'brown',
			},
			'convex-polygon' : {
				lineWidth: 1,
				fillStyle: 'black',
			}
	};

function loadObjects(world, map)
{
	for(e in map)
	{
		setup = map[e].setup;
		delete map[e].setup;
		
		object = Physics.body(setup.type, map[e]);

		if(setup.image)
		{
			object.view = new Image();
			object.view.src = require.toUrl(setup.image);
		}

		if(setup.sleep)
			object.sleep(setup.sleep)

		world.add(object);
	}
}

function setupWorld(world, config)
{
	var renderer = Physics.renderer('canvas', {
			el: 'viewport',
			width: config.width,
			height: config.height,
			meta: false,
			styles: objStyles,
			autoResize: false
		});

	world.add(renderer);
	world.on('step', function(){
			world.render();
		});


	if('edge_collision' in config)
	{
		var cfg = $.extend({}, config.edge_collision);
		cfg.aabb = Physics.aabb(0, 0, config.width, config.height);
		world.add(Physics.behavior('edge-collision-detection', cfg));
	}

	if('constant_acceleration' in config)
	{
		var cfg = $.extend({}, config.constant_acceleration);
		world.add(Physics.behavior('constant-acceleration', cfg));
	}

	
	world.bcd_behaviour = Physics.behavior('body-collision-detection');
	world.bcd_behaviour.applyTo(world.find({labels:{$nin:['no-collision']}}));
	world.add(world.bcd_behaviour);

	world.addWrapper = function(e){
			world.add(e);
			world.bcd_behaviour.applyTo(world.find({labels:{$nin:['no-collision']}}));
		};

	world.add(Physics.behavior('sweep-prune'));
	world.add(Physics.behavior('body-impulse-response'));

	Physics.util.ticker.on(function(time, dt){
		world.step(time);
	});
	Physics.util.ticker.start();

	$('#viewport').width(config.width).height(config.height);
}


function setupActions(world)
{
	$(document).mousedown(function(e){ 
			events.emit('MouseDown', e);
		});

	$(document).mouseup(function(e){ 
			events.emit('MouseUp', e);
		});

	$(document).mousemove(function(e){ 
			events.emit('MouseMove', e);
		});

	$(document).click(function(e){ 
			events.emit('Click', e);
		});

	var queryBulletTarget = Physics.query({$or: [
			{bodyA:{labels:'bullet'}, bodyB:{labels:'target'}},
			{bodyB:{labels:'bullet'}, bodyA:{labels:'target'}}
		]});

	world.on('collisions:detected', function(data, e){
			for(var i=0; i < data.collisions.length; i++)
				if('collide' in data.collisions[i].bodyA)
					data.collisions[i].bodyA.collide(data.collisions[i].bodyB)
				else if('collide' in data.collisions[i].bodyB)
					data.collisions[i].bodyA.collide(data.collisions[i].bodyB)

			if(Physics.util.find(data.collisions, queryBulletTarget))
			{
				todel = Physics.util.filter(data.collisions, queryBulletTarget);
				for(var i=0; i < todel.length; i++)
				{
					world.remove(todel[i].bodyA)
					world.remove(todel[i].bodyB)
				}

				// Check if all targets are removed
				if(!world.findOne({labels:'target'}))
				{
					alert('You win');
					window.history.back();
				}
			}
		});
}

function init(mapString)
{
	var map = JSON.parse(mapString);
	var settings = {timestep: 1000.0 / 160, maxIPF: 16, integrator: 'verlet'};
	Physics(settings, function initWorld(world){
			loadObjects(world, map.objects);
			setupWorld(world, map.world);
			setupActions(world);
		});
}

// TODO Load that with require not as ajax
$.get('levels/' + location.search.substr(1) + '.lvl', init)
	.fail(function(){
			alert("Could not find given level");
			window.history.back();
		});
});

