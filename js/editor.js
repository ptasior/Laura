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
			location: 'js/other',
			main: 'jquery'
		},
		{
			name: 'w2ui',
			location: 'js/other',
			main: 'w2ui'
		}]
	},
	[
	'require',
	'jQuery',
	'w2ui',
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
function(require, jQuery, w2UI, Physics)
{
	$('#layout').w2layout({
		name: 'layout',
		panels: [
			{ type: 'left', size: 200, resizable: true, style: 'background-color: #F5F6F7;', content: 'left' },
			{ type: 'main', style: 'background-color: #F5F6F7; padding: 5px;' },
			{ type: 'right', size: 200, resizable: true, style: 'background-color: #F5F6F7' }
		]
	});

	w2ui['layout'].content('left', $().w2sidebar({
		name: 'sidebar',
		img: null,
		nodes: [ 
			{ id: 'level-1', text: 'Level 1', img: 'icon-folder', expanded: true, group: true,
			  nodes: [ { id: 'level-1-1', text: 'Level 1.1', icon: 'fa-home' },
					   { id: 'level-1-2', text: 'Level 1.2', icon: 'fa-star' },
					   { id: 'level-1-3', text: 'Level 1.3', icon: 'fa-check' }
					 ]
			},
			{ id: 'level-2', text: 'Level 2', img: 'icon-folder', expanded: true, group: true,
			  nodes: [ { id: 'level-2-1', text: 'Level 2.1', img: 'icon-folder', 
						 nodes: [
						   { id: 'level-2-1-1', text: 'Level 2.1.1', img: 'icon-page' },
						   { id: 'level-2-1-2', text: 'Level 2.1.2', img: 'icon-page' },
						   { id: 'level-2-1-3', text: 'Level 2.1.3', img: 'icon-page' }
					 ]},
					   { id: 'level-2-2', text: 'Level 2.2', img: 'icon-page' },
					   { id: 'level-2-3', text: 'Level 2.3', img: 'icon-page' }
					 ]
			},
			{ id: 'level-3', text: 'Level 3', img: 'icon-folder', expanded: true, group: true,
			  nodes: [ { id: 'level-3-1', text: 'Level 3.1', img: 'icon-page' },
					   { id: 'level-3-2', text: 'Level 3.2', img: 'icon-page' },
					   { id: 'level-3-3', text: 'Level 3.3', img: 'icon-page' }
					 ]
			}
		],
		onClick: function (event) {
			w2ui['layout'].content('main', 'id: ' + event.target);
		}
	}));


	// w2ui['layout'].content('right', $('').w2form({ 
	// 	name     : 'form',
	// 	header   : 'Form',	
	// 	url      : 'server/post',
	// 	fields: [
	// 		{ field: 'first_name', type: 'text', required: true, html: { caption: 'First Name', attr: 'style="width: 300px"' } },
	// 		// { field: 'field_text', type: 'text', required: true, html: { caption: 'First Name', attr: 'style="width: 300px"'  }},
	// 		// { name: 'field_alpha', type: 'alphanumeric', required: true },
	// 		// { name: 'field_int', type: 'int', required: true },
	// 		// { name: 'field_float', type: 'float', required: true },
	// 		// { name: 'field_date', type: 'date' },
	// 		// { name: 'field_list', type: 'list', required: true, 
	// 		// 	options: { items: ['Adams, John', 'Johnson, Peter', 'Lewis, Frank', 'Cruz, Steve', 'Donnun, Nick'] } },
	// 		// { name: 'field_enum', type: 'enum', required: true, 
	// 		// 	options: { items: ['Adams, John', 'Johnson, Peter', 'Lewis, Frank', 'Cruz, Steve', 'Donnun, Nick'] } },
	// 		// { name: 'field_textarea', type: 'text'}
	// 	],
	// 	actions: {
	// 		reset: function () {
	// 			this.clear();
	// 		},
	// 		save: function () {
	// 			var obj = this;
	// 			this.save({}, function (data) { 
	// 				if (data.status == 'error') {
	// 					console.log('ERROR: '+ data.message);
	// 					return;
	// 				}
	// 				obj.clear();
	// 			});
	// 		}
	// 	}
	// }));

	w2ui['layout'].content('right', $('').w2form({ 
		name   : 'form',
		fields : [
			{ field: 'first_name', type: 'text', required: true, html: { caption: 'First Name', attr: 'style="width: 150px"' } },
			{ field: 'last_name',  type: 'text', required: true, html: { caption: 'Last Name', attr: 'style="width: 150px"' } },
			{ field: 'comments',   type: 'textarea', html: { caption: 'Comments', attr: 'style="width: 150px; height: 90px"' } }
		],
		// actions: {
		// 	'Save': function (event) {
		// 		console.log('save', event);
		// 		this.save();
		// 	},
		// 	'Clear': function (event) {
		// 		console.log('clear', event);
		// 		this.clear();
		// 	},
		// }
		toolbar: {
					items: [
						{ id: 'bt1', type: 'button', caption: 'Button 1', img: 'icon-folder' },
						{ id: 'bt3', type: 'spacer' },
						{ id: 'bt5', type: 'button', caption: 'Save', img: 'icon-page' }
					],
					onClick: function (event) {
						if (event.target == 'bt4') w2ui.form.clear();
						if (event.target == 'bt5') w2ui.form.save();
					}
		}
	}));
});


// content = 'blah'
// // location.href = "data:application/octet-stream,"+encodeURIComponent(content);
// cnt = "data:application/octet-stream,"+encodeURIComponent(content);
// window.open(cnt, '')


