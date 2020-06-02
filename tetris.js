const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const pieces = 'ILJOTSZ';

if(navigator.userAgent.indexOf( "Mobile" ) !== -1 || 
navigator.userAgent.indexOf( "iPhone" ) !== -1 || 
navigator.userAgent.indexOf( "Android" ) !== -1){
	document.getElementById('b1').innerHTML = '<i class="fas fa-arrow-left"></i>';
	document.getElementById('b2').innerHTML = '<i class="fas fa-arrow-right"></i>';
	document.getElementById('b3').innerHTML = '<i class="fas fa-undo"></i>';
	document.getElementById('b4').innerHTML = '<i class="fas fa-arrow-down"></i>';
	document.getElementById('b5').innerHTML = '<i class="fas fa-angle-double-down"></i>';
} else{
	document.getElementById('text').innerHTML= '<b>DIREITA E ESQUERDA:</b> mover pe\u00E7a; <b>CIMA:</b> girar pe\u00E7a; <b>BAIXO:</b> descer pe\u00E7a; <b>ESPA\u00C7O:</b> colocar pe\u00E7a;';
}

context.scale(20, 20);

function arenaSweep(){
	let rowCount = 1;
	outer:for(let y = arena.length - 1; y > 0; --y){
		for(let x = 0; x < arena[y]. length; ++x){
			if(arena[y][x] === 0){
				continue outer;
			}
		}

		const row = arena.splice(y, 1)[0].fill(0);
		arena.unshift(row);
		++y;

		player.score += rowCount *10;
		rowCount *= 2;
		dropInterval = dropInterval/1.1;
	}
}

function collide(arena, player){
	const [m, o] = [player.matrix, player.pos];
	for(let y = 0; y < m.length; ++y){
		for(let x = 0; x < m[y].length; ++x){
			if(m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0){
				return true;
			}
		}
	}
	return false;
}

function createMatrix(w, h){
	const matrix = [];
	while(h--){
		matrix.push(new Array(w).fill(0));
	}
	return matrix;
}

function createPiece(type){
	if(type === 'T'){
		return [
			[0, 0, 0],
			[1, 1, 1],
			[0, 1, 0],
		];
	} else if(type === 'O'){
		return [
			[2, 2],
			[2, 2],
		];
	} else if(type === 'L'){
		return [
			[0, 3, 0],
			[0, 3, 0],
			[0, 3, 3],
		];
	} else if(type === 'J'){
		return [
			[0, 4, 0],
			[0, 4, 0],
			[4, 4, 0],
		];
	} else if(type === 'I'){
		return [
			[0, 5, 0, 0],
			[0, 5, 0, 0],
			[0, 5, 0, 0],
			[0, 5, 0, 0],
		];
	} else if(type === 'S'){
		return [
			[0, 6, 6],
			[6, 6, 0],
			[0, 0, 0],
		];
	} else if(type === 'Z'){
		return [
			[7, 7, 0],
			[0, 7, 7],
			[0, 0, 0],
		];
	}
}

function draw(){
	context.fillStyle = '#000';
	context.fillRect(0, 0, canvas.width, canvas.height);
	drawMatrix(arena,  {x: 0, y: 0});
	drawMatrix(player.matrix, player.pos);
}

function drawMatrix(matrix, offset){
	matrix.forEach((row, y) => {
		row.forEach((value, x) =>{
			if(value !== 0){
				context.fillStyle = colors[value];
				context. fillRect(x + offset.x, y + offset.y, 1, 1);
			}
		});
	});
}

function merge(arena, player){
	player.matrix.forEach((row, y)=>{
		row.forEach((value, x) =>{
			if(value !== 0){
				arena[y+player.pos.y][x +player.pos.x] = value;
			}
		})
	})
}

function playerReset(){
	player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
	player.pos.y = 0;
	player.pos.x = (arena[0]. length/2 | 0) - (player.matrix[0].length/2 |0);

	if (collide(arena, player)){
		arena.forEach(row => row.fill(0));
		player.score = 0;
		updateScore();
		dropInterval = 1000;
	}
}

function playerMove(dir){
	player.pos.x += dir;
	if(collide(arena, player)){
		player.pos.x -= dir;
	}
}

function playerDrop(){
	player.pos.y++;
	if(collide(arena, player)){
		player.pos.y--;
		merge(arena,player);
		playerReset();
		arenaSweep();
		updateScore();
	}
	dropCounter = 0;
}

function playerPut(){
	while(!collide(arena, player)){
		player.pos.y++;
	}
	player.pos.y--;
	merge(arena,player);
	playerReset();
	arenaSweep();
	updateScore();
	dropCounter = 0;
}

function playerRotate(){
	let pos = player.pos.x;
	let offset = 1;
	rotate(player.matrix);
	while(collide(arena, player)){
		player.pos.x += offset;
		player.pos.x += offset;
		offset = -(offset +(offset > 0 ? 1 : -1));
		if(offset  > player.matrix[0].length){
			player.pos.x = pos;
			return;
		}
	}
}

function rotate(matrix){
	for(let y = 0; y < matrix.length; ++y){
		for(let x = 0; x < y; ++x){
			[
			matrix[x][y],
			matrix[y][x],
			] = [
			matrix[y][x],
			matrix[x][y],
			];
		}
	}

	matrix.forEach(row => row.reverse());
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;
function update(time = 0){
	const deltaTime = time - lastTime;
	lastTime = time;
	
	dropCounter += deltaTime;
	if(dropCounter>dropInterval){
		playerDrop();
	}

	draw();
	requestAnimationFrame(update);
}

function updateScore(){
	document.getElementById('score').innerText = player.score;
}

const colors = [
	null,
	'red',
	'blue',
	'violet',
	'green',
	'purple',
	'orange',
	'pink',
];

const player = {
	pos: {x: 5, y: 0},
	score: 0,
	matrix: createPiece(pieces[pieces.length * Math.random() | 0]),
}

const arena = createMatrix(12, 20);

document.addEventListener('keydown', event =>{
	if(event.keyCode === 37){
		playerMove(-1);
	} else if(event.keyCode === 39){
		playerMove(1);
	} else if(event.keyCode === 40){
		playerDrop();
	} else if(event.keyCode === 38){
		playerRotate();
	} else if(event.keyCode === 32){
		playerPut();
	}
});

updateScore();
update();