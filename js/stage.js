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
var viewWidth = 500;
var viewHeight = 300;
var canvasName = 'viewport';

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

function setupWorld(world)
{
	var renderer = Physics.renderer('canvas', {
			el: canvasName,
			width: viewWidth,
			height: viewHeight,
			meta: false,
			styles: objStyles
		});

	world.add(renderer);
	world.on('step', function(){
			world.render();
		});

	var viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight);

	// world.add(Physics.behavior('edge-collision-detection', {
	// 	aabb: viewportBounds,
	// 	restitution: 0.40,
	// 	cof: 0.99
	// }));

	world.add(Physics.behavior('body-collision-detection'));
	world.add(Physics.behavior('sweep-prune'));
	world.add(Physics.behavior('body-impulse-response'));
	world.add(Physics.behavior('constant-acceleration'));

	Physics.util.ticker.on(function(time, dt){
		world.step(time);
	});
	Physics.util.ticker.start();

	// $('#'+canvasName).width(viewWidth).height(viewHeight);
}


function setupActions(world)
{
	$(document).mousedown(function(e){ 
			events.emit('MouseDown', e);
		});

	$(document).mouseup(function(e){ 
			events.emit('MouseUp', e);
		});

	var query = Physics.query({
		$or: [
			{ bodyA: { labels: 'bullet' }, bodyB: { labels: 'target' } }
			,{ bodyB: { labels: 'bullet' }, bodyA: { labels: 'target' } }
		]
	});

	// monitor collisions
	world.on('collisions:detected', function(data, e){
		var found = Physics.util.find(data.collisions, query);
		if ( found )
		{
			alert('You win');
			// console.log('win')
			todel = Physics.util.filter(data.collisions, query);
			console.log(todel)
			for(i=0; i < todel.length; i++)
			{
				world.remove(todel[i].bodyA)
				world.remove(todel[i].bodyB)
			}
		}
	});
}

function init(mapString)
{
	var map = JSON.parse(mapString);
	var settings = {timestep: 1000.0 / 160, maxIPF: 16, integrator: 'verlet'};
	Physics(settings, function initWorld(world){
			loadObjects(world, map);
			setupWorld(world);
			setupActions(world);
		});
}

// TODO Load that with require not as ajax
$.get('levels/' + location.search.substr(1) + '.lvl', init)
	.fail(function(){
			// alert("Could not find given level");
			// window.history.back();
		});
});

