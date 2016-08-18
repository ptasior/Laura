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
  'js/events',
  'js/other/jquery',
  'physicsjs',
  'physicsjs/bodies/circle',
  'physicsjs/bodies/rectangle',
  'physicsjs/bodies/convex-polygon',
],
function(events, jQuery, Physics)
{
Physics.body('sling', 'rectangle', function(parent){ return {
	init: function(options)
	{
		parent.init.call(this, options);
		events.registerEv('MouseDown', this.mouseDown.bind(this));
		events.registerEv('MouseUp',   this.mouseUp.bind(this));

		this.shootStart = null;
	},

	mouseDown: function(e)
	{
		var canvas = $('#viewport');

		var offset = canvas.offset();
		var pos = Physics.vector(e.pageX - offset.left, e.pageY - offset.top);
		var body = this._world.findOne({
			$at: pos
		})

		console.log(body);
		if(body.id != 'sling') return;

		this.shootStart = pos;
	},

	mouseUp: function(e)
	{
		if(!this.shootStart) return;

		var canvas = $('#viewport');
		var sx = this.shootStart.x;
		var sy = this.shootStart.y;
		var offset = canvas.offset();
		this.shootStart.sub(e.pageX - offset.left, e.pageY - offset.top);

		console.log('shoot!', sx, sy, this.shootStart.x, this.shootStart.y);

		ball = Physics.body('circle', {
			x: sx,
			y: sy,
			vx: this.shootStart.x/100,
			vy: this.shootStart.y/100,
			restitution: 0.70,
			radius: 5,
			labels: ['bullet']
		});
		this._world.add(ball);

		this.shootStart = null;
	},
}});

Physics.body('pig', 'circle', function(parent){ return {
	init: function(options)
	{
		parent.init.call(this, options);
	},

	collide: function(e)
	{
		// if(!e.labels) return;
		// if($.inArray('bullet', e.labels) != -1)
		// {
		// 	this._world.remove(e)
		// 	this._world.remove(this)
		// 	alert('you win');
		// }
	}
}});
});


