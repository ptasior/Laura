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
				fillStyle: '#d33682',
				angleIndicator: '#351024'
			}
	};


function loadObjects(world)
{
	ball = Physics.body('circle', {
		x: 50,
		y: 30,
		vx: 0.2,
		vy: 0.1,
		radius: 20,
		id: 'ball1',
		labels: ['gravity']
	});
    // ball.view = new Image();
    // ball.view.src = require.toUrl('gfx/planet.png');

	world.add(ball);

	ball2 = Physics.body('circle', {
		x: 150,
		y: 130,
		vx: 0,
		vy: 0,
		radius: 20,
		id: 'ball2',
		mass: 10000000
	});
	// ball2.sleep(true)
	// world.add(ball2);

	sling = Physics.body('rectangle', {
		x: 250,
		y: 330,
		width: 20,
		height: 100,
		id: 'sling',
		mass: 10000000
	});
	// ball2.sleep(true)
	world.add(sling);
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

	world.add(Physics.behavior('edge-collision-detection', {
		aabb: viewportBounds,
		restitution: 0.80,
		cof: 0.99
	}));

	world.add(Physics.behavior('body-collision-detection'));
	world.add(Physics.behavior('sweep-prune'));
	world.add(Physics.behavior('body-impulse-response'));
	// world.add(Physics.behavior('constant-acceleration'));

	var queryFn = Physics.query({
		labels: {$in: ['gravity']}
	});
	gravity = Physics.behavior('constant-acceleration').applyTo(world.find(queryFn));
	world.add(gravity);

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

			var offset = canvas.offset();
			shootStart.sub(e.pageX - offset.left, e.pageY - offset.top);

			console.log('shoot!', shootStart);

			shootStart = null;
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

