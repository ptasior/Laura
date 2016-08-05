require(
  {
        baseUrl: './',
        packages: [{
            name: 'physicsjs',
            location: 'js/physicsjs',
            main: 'physicsjs'
        },
		{
            name: 'jQuery',
            location: 'js/jquery',
            main: 'jquery'
		}]
  },
  [
  'require',
  'jQuery',
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

function loadObjects(world)
{
	// ball = Physics.body('circle', {
	// 	x: 50,
	// 	y: 30,
	// 	vx: 0.2,
	// 	vy: 0.1,
	// 	radius: 20,
	// 	id: 'ball1',
	// 	labels: ['target'],
	// });
    // ball.view = new Image();
    // ball.view.src = require.toUrl('gfx/planet.png');

	// world.add(ball);

	ball2 = Physics.body('circle', {
		x: 150,
		y: 130,
		vx: 0,
		vy: 0,
		radius: 20,
		id: 'ball2',
		labels: ['target'],
		restitution: 0.6
	});
	// ball2.sleep(true)
	world.add(ball2);

	sling = Physics.body('sling', {
		x: 250,
		y: 330,
		width: 20,
		height: 100,
		treatment: 'static',
		id: 'sling'
	});
	// ball2.sleep(true)
	world.add(sling);

	land = Physics.body('convex-polygon', {
		x: 100,
		y: 250,
		vertices: [
			{ x: 0, y: 0 },
			{ x: 0, y: 20 },
			{ x: 180, y: 20 },
			{ x: 200, y: 0 }
		],
		treatment: 'static',
	});
	world.add(land);


	obstacle = Physics.body('rectangle', {
		x: 200,
		y: 215,
		width: 10,
		height: 50,
		labels: ['obstacle'],
		restitution: 0.6
	});
	// obstacle.sleep(true)
	world.add(obstacle);
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

function init(world)
{
	loadObjects(world);
	setupWorld(world);
	setupActions(world);
}

Physics({timestep: 1000.0 / 160, maxIPF: 16, integrator: 'verlet'}, init);
});

