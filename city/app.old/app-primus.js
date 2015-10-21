// connect to current URL
var primus = Primus.connect()

primus.on("open", function () {
    console.log("Connected!")
});

primus.on("data", function (data) {
    console.log("data =", data)
});



function elevatorToggle(){
	console.log("primus.write: elevator_toggle");
	primus.write('elevator_toggle');
}

document.getElementById('elevator_toggle').onclick = elevatorToggle;