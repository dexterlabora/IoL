var socket = io();

function moveForward(){
    socket.emit('start');
}

function turnRight(){
    socket.emit('right');
}

function turnLeft(){
    socket.emit('left');
}

function moveReverse(){
    socket.emit('reverse');
}

function stop(){
    socket.emit('stop');
}

function elevatorToggle(){
	socket.emit('elevator_toggle');
}

document.getElementById('forward').onclick = moveForward;
document.getElementById('right').onclick = turnRight;
document.getElementById('left').onclick = turnLeft;
document.getElementById('reverse').onclick = moveReverse;
document.getElementById('stop').onclick = stop;
document.getElementById('elevator_toggle').onclick = elevatorToggle;
