const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let gameStarted = false;
let gameOver = false;
let paused = false;

let score = 0;
let level = 1;
let lives = 3;

let highScore =
Number(localStorage.getItem("highScore")) || 0;

const gravity = 0.3;
const jumpForce = -4;

const bird = {
x:100,
y:300,
radius:20,
velocity:0
};

let pipes = [];
let particles = [];
let clouds = [];

for(let i=0;i<5;i++){
clouds.push({
x:Math.random()*WIDTH,
y:Math.random()*200,
size:40+Math.random()*50,
speed:0.2+Math.random()*0.5
});
}

function createPipe(){

let gap = Math.max(220-(level*5),170);

let topHeight =
Math.floor(Math.random()*250)+80;

pipes.push({
x:WIDTH,
width:70,
top:topHeight,
bottom:HEIGHT-topHeight-gap,
passed:false
});
}

setInterval(()=>{
if(gameStarted && !gameOver && !paused){
createPipe();
}
},1800);

function createParticles(){

for(let i=0;i<25;i++){

particles.push({
x:bird.x,
y:bird.y,
size:2+Math.random()*4,
vx:(Math.random()-0.5)*8,
vy:(Math.random()-0.5)*8,
life:30
});

}
}

function flap(){

if(gameOver){
restartGame();
return;
}

gameStarted = true;
bird.velocity = jumpForce;
}

document.addEventListener("keydown",(e)=>{

if(e.code==="Space"){
flap();
}

if(e.code==="KeyP"){
paused = !paused;
}

});

document.addEventListener("click",flap);

document.addEventListener("touchstart",flap);

function restartGame(){

gameOver=false;

score=0;
level=1;
lives=3;

bird.y=300;
bird.velocity=0;

pipes=[];
particles=[];
}

function drawBackground(){

let gradient =
ctx.createLinearGradient(0,0,0,HEIGHT);

gradient.addColorStop(0,"#70c5ce");
gradient.addColorStop(1,"#ffffff");

ctx.fillStyle=gradient;
ctx.fillRect(0,0,WIDTH,HEIGHT);

clouds.forEach(cloud=>{

ctx.fillStyle="rgba(255,255,255,0.8)";

ctx.beginPath();
ctx.arc(cloud.x,cloud.y,cloud.size/2,0,Math.PI*2);
ctx.arc(cloud.x+25,cloud.y+10,cloud.size/2,0,Math.PI*2);
ctx.arc(cloud.x-25,cloud.y+10,cloud.size/2,0,Math.PI*2);
ctx.fill();

cloud.x -= cloud.speed;

if(cloud.x<-100){
cloud.x = WIDTH+100;
}

});

ctx.fillStyle="#d8c98f";
ctx.fillRect(0,HEIGHT-80,WIDTH,80);
}

function drawBird(){

ctx.save();

ctx.translate(bird.x,bird.y);

ctx.rotate(bird.velocity*0.05);

ctx.fillStyle="#FFD93D";

ctx.beginPath();
ctx.arc(0,0,bird.radius,0,Math.PI*2);
ctx.fill();

ctx.fillStyle="white";

ctx.beginPath();
ctx.arc(8,-5,6,0,Math.PI*2);
ctx.fill();

ctx.fillStyle="black";

ctx.beginPath();
ctx.arc(10,-5,2,0,Math.PI*2);
ctx.fill();

ctx.fillStyle="orange";

ctx.beginPath();
ctx.moveTo(18,0);
ctx.lineTo(30,5);
ctx.lineTo(18,10);
ctx.fill();

ctx.restore();
}

function updatePipes(){

pipes.forEach((pipe,index)=>{

pipe.x -= 2;

let gradient =
ctx.createLinearGradient(
pipe.x,
0,
pipe.x+pipe.width,
0
);

gradient.addColorStop(0,"#2ecc71");
gradient.addColorStop(1,"#27ae60");

ctx.fillStyle=gradient;

ctx.fillRect(
pipe.x,
0,
pipe.width,
pipe.top
);

ctx.fillRect(
pipe.x,
HEIGHT-pipe.bottom-80,
pipe.width,
pipe.bottom
);

ctx.fillStyle="#1e8449";

ctx.fillRect(
pipe.x-5,
pipe.top-20,
pipe.width+10,
20
);

ctx.fillRect(
pipe.x-5,
HEIGHT-pipe.bottom-80,
pipe.width+10,
20
);

let hit =
bird.x+bird.radius > pipe.x &&
bird.x-bird.radius < pipe.x+pipe.width &&
(
bird.y-bird.radius < pipe.top ||
bird.y+bird.radius >
HEIGHT-pipe.bottom-80
);

if(hit){

lives--;

bird.y=300;
bird.velocity=0;

pipe.x=-100;

createParticles();

if(lives<=0){
gameOver=true;
}

}

if(!pipe.passed &&
pipe.x+pipe.width < bird.x){

pipe.passed=true;
score++;

if(score%10===0){
level++;
}

if(score>highScore){

highScore=score;

localStorage.setItem(
"highScore",
highScore
);
}
}

if(pipe.x<-100){
pipes.splice(index,1);
}

});
}

function drawParticles(){

particles.forEach((p,index)=>{

p.x+=p.vx;
p.y+=p.vy;

p.life--;

ctx.fillStyle=
`rgba(255,255,255,${p.life/30})`;

ctx.beginPath();
ctx.arc(
p.x,
p.y,
p.size,
0,
Math.PI*2
);
ctx.fill();

if(p.life<=0){
particles.splice(index,1);
}

});
}

function drawUI(){

ctx.fillStyle="white";

ctx.font="bold 36px Arial";
ctx.fillText("Score: "+score,20,50);

ctx.font="20px Arial";
ctx.fillText(
"Best: "+highScore,
20,
85
);

ctx.fillText(
"Lives: "+lives,
20,
115
);

ctx.fillText(
"Level: "+level,
20,
145
);

if(!gameStarted){

ctx.fillStyle=
"rgba(0,0,0,0.5)";

ctx.fillRect(
40,
220,
340,
200
);

ctx.fillStyle="white";

ctx.font="bold 36px Arial";
ctx.fillText(
"FLAPPY BIRD",
75,
290
);

ctx.font="22px Arial";
ctx.fillText(
"Click or SPACE",
110,
340
);

ctx.fillText(
"to Start",
145,
375
);
}

if(paused){

ctx.fillStyle=
"rgba(0,0,0,0.5)";

ctx.fillRect(
70,
260,
280,
100
);

ctx.fillStyle="white";

ctx.font="bold 40px Arial";
ctx.fillText(
"PAUSED",
115,
320
);
}

if(gameOver){

ctx.fillStyle=
"rgba(0,0,0,0.6)";

ctx.fillRect(
40,
220,
340,
220
);

ctx.fillStyle="#ff4d4d";

ctx.font="bold 42px Arial";

ctx.fillText(
"GAME OVER",
65,
300
);

ctx.fillStyle="white";

ctx.font="24px Arial";

ctx.fillText(
"Score: "+score,
145,
350
);

ctx.fillText(
"Click to Restart",
105,
400
);
}
}

function update(){

drawBackground();

if(
gameStarted &&
!gameOver &&
!paused
){

bird.velocity += gravity;
bird.y += bird.velocity;
}

if(bird.y+bird.radius>HEIGHT-80){

bird.y=HEIGHT-80-bird.radius;

lives--;

bird.velocity=0;

if(lives<=0){
gameOver=true;
}
}

if(bird.y<0){
bird.y=0;
}

updatePipes();

drawBird();

drawParticles();

drawUI();

requestAnimationFrame(update);
}

update();