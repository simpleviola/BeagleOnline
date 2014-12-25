//===============================================================
//@author	Viola Lyu
//@date		2014.09.13
//===============================================================
// create a wrapper around native canvas element (with id="c")
var canvas = new fabric.Canvas('mycanvas');
var moduleName = "default";

var nodeNum = 0; //number of nodes in the module
var transNum = 0; //number of transitions in the module
var variableNum = 0; //number of variables

var SELECT = 0; //mode "select node or location"
var NEW_NODE = 1; //mode "add new node"
var NEW_TRANSITION = 2; //mode "add new transition"
var currentMode = SELECT; //current mode

var transFrom; //from location
var transTo; //to location
var transFlag = 0; //counter
var from = 0;
var to = 0;

var currentNodeSelect = 0;
var currentTransSelect = 0;
var initLoc = 1;

var transCounter = 0;
var selectCounter = 0; // whether a click is on a node and the node is not considered selected
var selectCount = 0; //whether a trans is selected

//node state
var INIT = 0; //first node
var NORMAL = 1; //average node

//json object of the module
var module = new Object;
//var modulePre;
var toElt = "";
var text = "";

var arrow = new Object;

//disable input
for(var i = 8; i < $("input").length; i++){
	$("input")[i].disabled = true;
}
$("textarea")[0].disabled = true;
$("textarea")[0].value = text;
$("input")[0].value = moduleName;

var textModule = new fabric.Text("Module Name :  " + moduleName, {
  fontSize: 20,
  originX: 'left',
  originY: 'top',
  top: 460,
  left:40
});
canvas.add(textModule);

function submitModuleName(){
	//alert("a");
	moduleName = $("input")[0].value;
	$("input")[0].value = "";

	textModule.setText("Module Name :  " + moduleName);
	canvas.renderAll();
}

function submitInit(){
	var temp = $("input")[8];
	if(temp.checked == 0){
		module["n_" + currentNodeSelect.toString()].isinit = 0;
		module["n_" + currentNodeSelect.toString()].setFill("rgb(154,172,223)");
	}
	else if(temp.checked == 1){
		module["n_" + currentNodeSelect.toString()].isinit = 1;
		module["n_" + initLoc.toString()].isinit = 0;
		module["n_" + initLoc.toString()].setFill("rgb(154,172,223)");
		initLoc = currentNodeSelect;
		module["n_" + currentNodeSelect.toString()].setFill("rgb(154,172,173)");

		var temp1 = module["t_0"];
		var c = module["n_" + initLoc.toString()];
		//draw first trans
		temp1.item(0).set("y2", c.top);
		temp1.item(0).set("x2", c.left - c.scaleX * 30);
		temp1.item(0).set("y1", c.top);
		temp1.item(0).set("x1", temp1.item(0).x2 - 80);
		//draw arrow one
		temp1.item(1).set("x1", temp1.item(0).x2 - 10);
		temp1.item(1).set("y1", temp1.item(0).y2 - 10);
		temp1.item(1).set("x2", temp1.item(0).x2);
		temp1.item(1).set("y2", temp1.item(0).y2);
		//draw arrow two
		temp1.item(2).set("x1", temp1.item(0).x2 - 10);
		temp1.item(2).set("y1", temp1.item(0).y2 + 10);
		temp1.item(2).set("x2", temp1.item(0).x2);
		temp1.item(2).set("y2", temp1.item(0).y2);		
	}
	canvas.renderAll();
}

function submitLocName(){
	module["n_" + currentNodeSelect.toString()].name = $("input")[10].value;
}

function submitPro(){
	module["t_" + currentTransSelect.toString()].provided = $("input")[12].value;
}

function submitAct(){
	module["t_" + currentTransSelect.toString()].action = $("input")[14].value;
}

function submitAddInt(){
	variableNum++;
	module[variableNum] = {};
	module[variableNum]["name"] = $("input")[2].value;
	module[variableNum]["value"] = $("input")[3].value;
	module[variableNum]["type"] = "int";

	var temp = "";
	temp = temp + $("input")[2].value + "=" + $("input")[3].value;
	text = text + temp + "\r\n";
	$("textarea")[0].value = text;
	$("input")[2].value = $("input")[3].value = "";
}

function submitAddBool(){
	variableNum++;
	module[variableNum] = {};
	module[variableNum]["name"] = $("input")[5].value;
	module[variableNum]["value"] = $("input")[6].value;
	module[variableNum]["type"] = "bool";

	var temp = "";
	temp = temp + $("input")[5].value + "=" + $("input")[6].value;
	text = text + temp + "\r\n";
	$("textarea")[0].value = text;
	$("input")[5].value = $("input")[6].value = "";
}

function selectmode(){
	currentMode = SELECT;
	var item = document.getElementsByClassName('a');
	for(var i = 0; i < 4; i++){
		item[i].className = "mode a";
	}
	item[0].className = "active a";
}

function modulemode(){
	currentMode = NEW_NODE;
	var item = document.getElementsByClassName('a');
	for(var i = 0; i < 4; i++){
		item[i].className = "mode a";
	}
	item[1].className = "active a";
}

function transitionmode(){
	currentMode = NEW_TRANSITION;
	var item = document.getElementsByClassName('a');
	for(var i = 0; i < 4; i++){
		item[i].className = "mode a";
	}
	item[2].className = "active a";
}

function verify(){
	prepareObject();
	//post
	$.ajax({
		type:"post",
		data: {'elt': toElt},
		url: 'http://127.0.0.1:8000/ajax',
		success: function(data){
			console.log(data);
		}
	})
}

var MyNode = fabric.util.createClass(fabric.Circle,{
	type: 'MyNode',

  initialize: function(options) {
    options || (options = { });

    this.callSuper('initialize', options);
    this.set('id', options.id || 0);
  },

  toObject: function() {
    return fabric.util.object.extend(this.callSuper('toObject'), {
      id: this.get('id')
    });
  },

  _render: function(ctx) {
    this.callSuper('_render', ctx);
  }
})

function makeLine(coords) {
    return new fabric.Line(coords, {
      fill: 'black',
      stroke: 'black',
      strokeWidth: 2,
    });
}

var initTrans = makeLine([0,0,0,0]);
var arrow1 = makeLine([0,0,0,0]);
var arrow2 = makeLine([0,0,0,0]);
var initGroup = new fabric.Group([initTrans, arrow1, arrow2]);
initGroup.set("selectable", true);
canvas.add(initGroup);

module["t_0"] =  initGroup;

canvas.on('mouse:down', function(options){
	if(currentMode == NEW_NODE){
		from = 0;
		to = 0;
		nodeNum++;
		var node = new MyNode({left: options.e.clientX - 55, top: options.e.clientY - 110, fill: 'rgba(154,172,223,1)', radius: 30, id: nodeNum, originX: "center", originY: "center"})
		node.set("name", "default" + node.id.toString());
		if(initLoc != node.id){
			node.set("isinit", 0);
		}
		else{
			node.set("isinit", 1);
			node.setFill("rgb(154,172,173)");
			var temp = module["t_0"];
			//draw first trans
			temp.item(0).set("y2", node.top);
			temp.item(0).set("x2", node.left - node.scaleX * 30);
			temp.item(0).set("y1", node.top);
			temp.item(0).set("x1", temp.item(0).x2 - 80);
			//draw arrow one
			temp.item(1).set("x1", temp.item(0).x2 - 10);
			temp.item(1).set("y1", temp.item(0).y2 - 10);
			temp.item(1).set("x2", temp.item(0).x2);
			temp.item(1).set("y2", temp.item(0).y2);
			//draw arrow two
			temp.item(2).set("x1", temp.item(0).x2 - 10);
			temp.item(2).set("y1", temp.item(0).y2 + 10);
			temp.item(2).set("x2", temp.item(0).x2);
			temp.item(2).set("y2", temp.item(0).y2);
			//update
			canvas.renderAll();
		}
		canvas.add(node);
		module["n_" + nodeNum.toString()] = node;

		//when a node is selected
		module["n_" + nodeNum.toString()].on('selected', function(){
			currentNodeSelect = this.id;
			transCounter++;

			var inputCheck = $("#isInit")[0];
			inputCheck.disabled = false;
			if(this.id != initLoc){
				inputCheck.checked = false;
				this.setFill("rgb(154,172,223)");
			}
			else{
				inputCheck.checked = true;
				this.setFill("rgb(154,172,173)");
			}
			canvas.renderAll();
			

			$("input")[9].disabled = false;

			var inputLocName = $("input")[10];
			inputLocName.disabled = false;
			if(this.name){
				inputLocName.value = this.name;
			}

			$("input")[11].disabled = false;


			if(currentMode == NEW_TRANSITION){
				if(transFlag == 0){
					//transFrom = node;
					from = nodeNum;
					transFlag++;
				}
				else if(transFlag == 1){
					//transTo = node;
					to = nodeNum;
					transFlag++;
				}
				else if(transFlag == 2){
					transFlag = 1;
				}
			}
			if(transFlag == 1){
				from = this.id;
			}
			else if(transFlag == 2){
				to = this.id;
			}
			else{
				from = 0; 
				to = 0;
			}
		})

		module["n_" + nodeNum.toString()].on('moving', function(){
			//adjust and update the transition on moving a node
			var temp;
			if(this.id == initLoc){
				var temp = module["t_0"];
				//draw first trans
				temp.item(0).set("y2", this.top);
				temp.item(0).set("x2", this.left - node.scaleX * 30);
				temp.item(0).set("y1", this.top);
				temp.item(0).set("x1", temp.item(0).x2 - 80);
				//draw arrow one
				temp.item(1).set("x1", temp.item(0).x2 - 10);
				temp.item(1).set("y1", temp.item(0).y2 - 10);
				temp.item(1).set("x2", temp.item(0).x2);
				temp.item(1).set("y2", temp.item(0).y2);
				//draw arrow two
				temp.item(2).set("x1", temp.item(0).x2 - 10);
				temp.item(2).set("y1", temp.item(0).y2 + 10);
				temp.item(2).set("x2", temp.item(0).x2);
				temp.item(2).set("y2", temp.item(0).y2);
			}
			for(var i = 1; i < transNum + 1; i++){
				temp = module["t_" + i.toString()];
				if(temp.from == temp.to && temp.from == this.id){
					//move loop
					temp.setTop(this.top - temp.radius * 2);
					temp.setLeft(this.left);

					//move arrow
					var ret = calculateArrow(temp.from, temp.to, temp);
					var a1 = arrow[i * 2 - 1];
					var a2 = arrow[i * 2];

					a1.set("x1", ret[0]);
					a1.set("y1", ret[1]);
					a1.set("x2", ret[2]);
					a1.set("y2", ret[3]);

					a2.set("x1", ret[0]);
					a2.set("y1", ret[1]);
					a2.set("x2", ret[4]);
					a2.set("y2", ret[5]);
				}
				else if(temp.from == this.id){
					//moved from node
					temp.set("x1", this.left);
					temp.set("y1", this.top);

					//move arrow
					var ret = calculateArrow(temp.from, temp.to, temp);
					var a1 = arrow[i * 2 - 1];
					var a2 = arrow[i * 2];

					a1.set("x1", ret[0]);
					a1.set("y1", ret[1]);
					a1.set("x2", ret[2]);
					a1.set("y2", ret[3]);

					a2.set("x1", ret[0]);
					a2.set("y1", ret[1]);
					a2.set("x2", ret[4]);
					a2.set("y2", ret[5]);
				}
				else if(temp.to == this.id){
					//moved to node
					temp.set("x2", this.left);
					temp.set("y2", this.top);

					//move arrow
					var ret = calculateArrow(temp.from, temp.to, temp);
					var a1 = arrow[i * 2 - 1];
					var a2 = arrow[i * 2];

					a1.set("x1", ret[0]);
					a1.set("y1", ret[1]);
					a1.set("x2", ret[2]);
					a1.set("y2", ret[3]);

					a2.set("x1", ret[0]);
					a2.set("y1", ret[1]);
					a2.set("x2", ret[4]);
					a2.set("y2", ret[5]);
				}
			}
			canvas.renderAll();
		})

		module["n_" + nodeNum.toString()].on('scaling', function(){
			//adjust and update the transition on scaling a node
			var temp;
			if(this.id == initLoc){
				var temp = module["t_0"];
				//draw first trans
				temp.item(0).set("y2", this.top);
				temp.item(0).set("x2", this.left - node.scaleX * 30);
				temp.item(0).set("y1", this.top);
				temp.item(0).set("x1", temp.item(0).x2 - 80);
				//draw arrow one
				temp.item(1).set("x1", temp.item(0).x2 - 10);
				temp.item(1).set("y1", temp.item(0).y2 - 10);
				temp.item(1).set("x2", temp.item(0).x2);
				temp.item(1).set("y2", temp.item(0).y2);
				//draw arrow two
				temp.item(2).set("x1", temp.item(0).x2 - 10);
				temp.item(2).set("y1", temp.item(0).y2 + 10);
				temp.item(2).set("x2", temp.item(0).x2);
				temp.item(2).set("y2", temp.item(0).y2);
			}
			for(var i = 1; i < transNum + 1; i++){
				temp = module["t_" + i.toString()];
				if(temp.from == temp.to && temp.from == this.id){
					//move loop
					temp.setTop(this.top - this.scaleX * 30);
					temp.scaleX = this.scaleX;
					temp.scaleY = this.scaleY;
					temp.setLeft(this.left);

					//move arrow
					var ret = calculateArrow(temp.from, temp.to, temp);
					var a1 = arrow[i * 2 - 1];
					var a2 = arrow[i * 2];

					a1.set("x1", ret[0]);
					a1.set("y1", ret[1]);
					a1.set("x2", ret[2]);
					a1.set("y2", ret[3]);

					a2.set("x1", ret[0]);
					a2.set("y1", ret[1]);
					a2.set("x2", ret[4]);
					a2.set("y2", ret[5]);
				}
				else if(temp.from == this.id){
					//moved from node
					temp.set("x1", this.left);
					temp.set("y1", this.top);

					//move arrow
					var ret = calculateArrow(temp.from, temp.to, temp);
					var a1 = arrow[i * 2 - 1];
					var a2 = arrow[i * 2];

					a1.set("x1", ret[0]);
					a1.set("y1", ret[1]);
					a1.set("x2", ret[2]);
					a1.set("y2", ret[3]);

					a2.set("x1", ret[0]);
					a2.set("y1", ret[1]);
					a2.set("x2", ret[4]);
					a2.set("y2", ret[5]);
				}
				else if(temp.to == this.id){
					//moved to node
					temp.set("x2", this.left);
					temp.set("y2", this.top);
					
					//move arrow
					var ret = calculateArrow(temp.from, temp.to, temp);
					var a1 = arrow[i * 2 - 1];
					var a2 = arrow[i * 2];

					a1.set("x1", ret[0]);
					a1.set("y1", ret[1]);
					a1.set("x2", ret[2]);
					a1.set("y2", ret[3]);

					a2.set("x1", ret[0]);
					a2.set("y1", ret[1]);
					a2.set("x2", ret[4]);
					a2.set("y2", ret[5]);
				}
			}
			canvas.renderAll();
		})
	}

	//if there's no node selected by this click under NEW_TRANSITION mode
	if(transCounter == 0 && currentMode == NEW_TRANSITION){
		//get mouse
		var mouseX = options.e.clientX - 55;
		var mouseY = options.e.clientY - 110;
		var dist, rx, ry;
		
		for(var i = 1; i < nodeNum + 1; i++){
			rx = module["n_" + i.toString()].left;
			ry = module["n_" + i.toString()].top;
			dist = (mouseX - rx) * (mouseX - rx) + (mouseY - ry) * (mouseY - ry);
			dist = Math.sqrt(dist);
			
			if(dist < 30 * module["n_" + i.toString()].scaleX && transFlag == 1){
				transFlag = 2;
				to = i;
				selectCounter++;
				break;
			}
			else if(dist < 30 * module["n_" + i.toString()].scaleX && transFlag == 2){
				transFlag = 1;
				from = i;
				selectCounter++;
				break;
			}
		}
		
		if(selectCounter == 0){
			transFlag = 0;
			from = 0;
			to = 0;
			for(var i = 8; i < $("input").length; i++){
				$("input")[i].disabled = true;
			}
			$("textarea")[0].disabled = true;
			currentNodeSelect = 0;
		}
		selectCounter = 0;
	}
	else if(transCounter == 0 && currentMode == SELECT){
		for(var i = 8; i < $("input").length; i++){
			$("input")[i].disabled = true;
		}
		$("textarea")[0].disabled = true;

		if(selectCount != 0){
			$("input")[12].disabled = false;
			$("input")[13].disabled = false;
			$("input")[14].disabled = false;
			$("input")[15].disabled = false;
		}
		else{
			currentTransSelect = 0;
		}
	}

	if(transFlag == 2 && currentMode == NEW_TRANSITION){
		//draw new transition & add to module
		transNum++;
		transFrom = module["n_" + from.toString()];
		transTo = module["n_" + to.toString()];

		if(from == to){
			//draw loop
			var trans = new fabric.Circle({left: transTo.left, fill: 'rgba(0,0,0,0)', stroke: 'rgb(0,0,0)', strokeWidth: 2, radius: 15 * transTo.scaleX, originX: "center", originY: "center"});
			trans.setTop(transTo.top - trans.radius * 2);
		}
		else{
			//draw line
			var trans = makeLine([transFrom.left, transFrom.top, transTo.left, transTo.top]);
		}

		canvas.add(trans);
		trans.sendToBack();
		canvas.renderAll();
		trans.set("from", from);
		trans.set("to", to);
		trans.set("provided", "null");
		trans.set("action", "null");
		trans.set("id", transNum);

		var ret = calculateArrow(trans.from, trans.to, trans);
		console.log(ret);
		var line1 = makeLine([ret[0], ret[1], ret[2], ret[3]]);
		console.log(line1);
		var line2 = makeLine([ret[0], ret[1], ret[4], ret[5]]);
		console.log(line2);
		arrow[transNum * 2 - 1] = line1;
		arrow[transNum * 2] = line2;
		canvas.add(line1);
		canvas.add(line2);

		module["t_" + transNum.toString()] = trans;
		module["t_" + transNum.toString()].on('selected', function(){
			selectCount++;
			currentTransSelect = this.id;
			//console.log("a");
			$("input")[12].disabled = false;
			$("input")[12].value = this.provided;
			$("input")[13].disabled = false;
			$("input")[14].disabled = false;
			$("input")[14].value = this.provided;
			$("input")[15].disabled = false;
			//console.log("b");
		})

		module["t_" + transNum.toString()].on('moving', function(){
			console.log("a");
		})
	}

	//reset the counter
	transCounter = 0;
	selectCount = 0;
});

function prepareObject(){
	//console.log("a");
	//modulePre["module"] = moduleName;
	toElt = "system \r\n\t";
	toElt = toElt + "module " + moduleName + "\r\n\t\t";

	for(var i = 1; i < variableNum + 1; i++){
		//modulePre["var_" + i.toString()] = module[i.toString()];
		toElt = toElt + module[i].type + " " + module[i].name + ";\r\n\t\t";
	}

	toElt = toElt + "label ";
	for(var i = 1; i < transNum; i++){
		toElt = toElt + "t" + i.toString() + ",";
	}
	toElt = toElt + "t" + transNum.toString() + ";\r\n\t\t";

	toElt += "location ";
	for(var i = 1; i < nodeNum; i++){
		toElt += module["n_" + i.toString()].name + ",";
	}
	toElt += module["n_" + nodeNum.toString()].name + ";\r\n\r\n\t\t";

	toElt += "init " + module["n_" + initLoc.toString()].name + " do {";
	toElt += module[1].name + "=" + module[1].value + ";};\r\n\t\t";
	
	for(var i = 1; i < transNum; i++){
		var f = module["t_" + i.toString()].from;
		var t = module["t_" + i.toString()].to;
		toElt += "from " + module["n_" + f.toString()].name + " to ";
		toElt += module["n_" + t.toString()].name + " on t" + i.toString() + " provided ";
		toElt += module["t_" + i.toString()].provided + " do {" + module["t_" + i.toString()].action + ";};\r\n\t\t";
	}
	var tr = module["t_" + transNum.toString()];
	toElt += "from " + module["n_" + tr.from.toString()].name + " to ";
	toElt += module["n_" + tr.to.toString()].name + " on t" + transNum.toString() + " provided ";
	toElt += tr.provided + " do {" + tr.action + ";};\r\n\t";
	toElt += "end\r\nend\n";
}

function calculateArrow(from,to,trans){
	var dx, dy, ax1, ax2, ay1, ay2;
	var x1, x2, y1, y2;
	//calculate loop
	if(from == to){
		dx = trans.left;
		dy = trans.top - trans.radius * trans.scaleX;

		ax1 = dx - 10;
		ay1 = dy - 10;

		ax2 = dx - 10;
		ay2 = dy + 10;
	}
	else{
		//calculate line
		var theta, alpha, d;
		d = 15;

		var f = module["n_" + from.toString()];
		var t = module["n_" + to.toString()];
		x1 = f.left;
		x2 = t.left;
		y1 = f.top;
		y2 = t.top;

		dx = 0.5 * (x1 + x2);
		dy = 0.5 * (y1 + y2);

		if(y2 >= y1 && x2 > x1){
			alpha = Math.atan((y2 - y1) / (x2 - x1));
			theta = Math.PI * 0.25 - alpha;
			ax1 = dx - d * Math.cos(theta);
			ay1 = dy + d * Math.sin(theta);
			ax2 = dx - d * Math.sin(theta);
			ay2 = dy - d * Math.cos(theta);
		}
		else if(y1 > y2 && x2 >= x1){
			alpha = Math.atan((y1 - y2) / (x2 - x1));
			theta = alpha - Math.PI * 0.25;
			ax1 = dx - d * Math.cos(theta);
			ay1 = dy + d * Math.sin(theta);
			ax2 = dx + d * Math.sin(theta);
			ay2 = dy + d * Math.cos(theta);
		}
		else if(y1 >=  y2 && x1 > x2){
			alpha = Math.atan((y1 - y2) / (x1 - x2));
			theta = Math.PI * 0.25 - alpha;
			ax1 = dx + d * Math.cos(theta);
			ay1 = dy - d * Math.sin(theta);
			ax2 = dx + d * Math.sin(theta);
			ay2 = dy + d * Math.cos(theta);
		}
		else if(y2 > y1 && x1 > x2){
			alpha = Math.atan((y2 - y1) / (x1 - x2));
			theta = alpha - Math.PI * 0.25;
			ax1 = dx + d * Math.cos(theta);
			ay1 = dy - d * Math.sin(theta);
			ax2 = dx - d * Math.sin(theta);
			ay2 = dy - d * Math.cos(theta);
		}

	}

	var r = [dx, dy, ax1, ay1, ax2, ay2];
	return r;
}
















