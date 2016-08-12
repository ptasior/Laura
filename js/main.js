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
  'physicsjs',
  'physicsjs/renderers/canvas',
  'physicsjs/bodies/circle',
  'physicsjs/bodies/rectangle',
  'physicsjs/bodies/convex-polygon',
  'physicsjs/behaviors/sweep-prune',
  'physicsjs/behaviors/body-collision-detection',
  'physicsjs/behaviors/body-impulse-response',
  'physicsjs/behaviors/edge-collision-detection',
  'physicsjs/behaviors/constant-acceleration'
],
function(require, jQuery, Physics)
{
var viewWidth = 500;
var viewHeight = 300;
var canvasName = 'viewport';
var shootStart = null;

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

Physics.body('sling', 'rectangle', function( parent ){
	return {
		spin: function( speed ){
			this.state.angular.vel = speed;
		}
	};
});


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
}

function setupActions(world)
{
	var canvas = $('#'+canvasName);
	$(document).mousedown(function(e){ 
			var offset = canvas.offset();
			var pos = Physics.vector(e.pageX - offset.left, e.pageY - offset.top);
			var body = world.findOne({
				$at: pos
			})

			console.log(body);
			if(body.id != 'sling') return;

			shootStart = pos;
		});

	$(document).mouseup(function(e){ 
			if(!shootStart) return;

			var sx = shootStart.x;
			var sy = shootStart.y;
			var offset = canvas.offset();
			shootStart.sub(e.pageX - offset.left, e.pageY - offset.top);

			console.log('shoot!', sx, sy, shootStart.x, shootStart.y);

			ball = Physics.body('circle', {
				x: sx,
				y: sy,
				vx: shootStart.x/100,
				vy: shootStart.y/100,
				restitution: 0.70,
				radius: 5,
				labels: ['bullet']
			});
			world.add(ball);

			shootStart = null;
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
			// alert('win');
			console.log('win')
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
	.fail(function(){alert("Could not find given level")});
});

