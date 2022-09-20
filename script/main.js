const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

// génére le canvas
c.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 0.7;

// génére les blocs personnages
class Sprite {
    constructor({position, velocity, color = 'red', offset}){
        this.position = position;
        this.velocity = velocity;
        this.width = 50;
        this.height = 150;
        this.lastKey;
        this.attackBox = {
            position: {
                x: this.position.x,
                y: this.position.y
            },
            offset,
            width: 100,
            height: 50,
        }
        this.color = color;
        this.isAttacking;
        this.health = 100;
    }

    draw(){
        c.fillStyle = this.color;
        c.fillRect(this.position.x, this.position.y, this.width, this.height);

        // attack box
        if(this.isAttacking){
            c.fillStyle = 'green';
            c.fillRect(
                this.attackBox.position.x, 
                this.attackBox.position.y, 
                this.attackBox.width, 
                this.attackBox.height);
        }    
    }

    update(){
        this.draw();
        // Update attack position
        this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
        this.attackBox.position.y = this.position.y;

        // Apply mouvement to caracter
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.position.y + this.height + this.velocity.y >= canvas.height){
            this.velocity.y = 0;
        } else {
            this.velocity.y += gravity;
        }
    }

    attack(){
        this.isAttacking = true;
        setTimeout(() => {
            this.isAttacking = false;
        }, 100)
    }
}

// Joueur 1
const player = new Sprite({
    position: {
    x: 0,
    y: 0
    },
    velocity: {
        x: 0,
        y: 0
    },
    offset: {
        x: 0,
        y: 0
    }
})

// Joueur 2
const enemy = new Sprite({
    position: {
        x: 400,
        y: 100
    },
    velocity: {
        x: 0,
        y: 0
    },
    color : 'blue',
    offset: {
        x: -50,
        y: 0
    }
})


// Entré clavier
const keys = {
    q: {
        pressed: false
    },
    d: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    }
}

function rectangularCollision({rectangle1, rectangle2}){
    return (
        rectangle1.attackBox.position.x + rectangle1.attackBox.width >= rectangle2.position.x
        && rectangle1.attackBox.position.x <= rectangle2.position.x + rectangle2.width
        && rectangle1.attackBox.position.y + rectangle1.attackBox.height >= rectangle2.position.y
        && rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height
    )
}

function determineWinner ({player, enemy, timerId}){
    clearTimeout(timerId);
    document.querySelector('#displayText').style.display = 'flex';
    if (player.health === enemy.health){
        document.querySelector('#displayText').innerText = 'Tie';
    }else if(player.health > enemy.health){
        document.querySelector('#displayText').innerText = 'Player 1 Wins';
    }else if(player.health < enemy.health){
        document.querySelector('#displayText').innerText = 'Player 2 Wins';
    }
}

let timer = 60;
let timerId;
function decreaseTimer(){
    if(timer > 0){
        timerId = setTimeout(decreaseTimer, 1000);
        timer--;
        document.querySelector('#timer').innerText = timer;
    }

    if(timer === 0){
        determineWinner({player, enemy, timerId});
    }
    
}

decreaseTimer();

// Generate animation
function animate(){
    window.requestAnimationFrame(animate);
    c.fillStyle = 'black';
    c.fillRect(0, 0, canvas.width, canvas.height);
    player.update();
    enemy.update();

    player.velocity.x = 0;
    enemy.velocity.x = 0;

    // player movements
    if (keys.q.pressed && player.lastKey === 'q'){
        player.velocity.x = -5;
    } else if (keys.d.pressed && player.lastKey === 'd'){
        player.velocity.x = 5;
    }

    // enemy movements
    if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft'){
        enemy.velocity.x = -5;
    } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight'){
        enemy.velocity.x = 5;
    }

    // Detect for collision
    // Joueur
    if (rectangularCollision({
        rectangle1: player,
        rectangle2: enemy
        })
        && player.isAttacking){
            player.isAttacking = false;
            enemy.health -= 20;
            document.querySelector('#enemyHealth').style.width = enemy.health + '%';
    }
    // Enemy
    if (rectangularCollision({
        rectangle1: enemy,
        rectangle2: player
        })
        && enemy.isAttacking){
            enemy.isAttacking = false;
            player.health -= 20;
            document.querySelector('#playerHealth').style.width = player.health + '%';
    }

    // end game based on health
    if (enemy.health <= 0 || player.health <= 0){
        determineWinner({player, enemy, timerId})
    }
}

animate();

// take key event
window.addEventListener('keydown', (event) => {
    switch(event.key){
        case 'd':
            keys.d.pressed = true;
            player.lastKey = 'd';
            break;
        case 'q':
            keys.q.pressed = true;
            player.lastKey = 'q';
            break;
        case 'z':
            player.velocity.y = -20;
            break;
        case ' ':
            player.attack();
            break;

        case 'ArrowRight':
            keys.ArrowRight.pressed = true;
            enemy.lastKey = 'ArrowRight';
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = true;
            enemy.lastKey = 'ArrowLeft';
            break;
        case 'ArrowUp':
            enemy.velocity.y = -20;
            break;
        case 'ArrowDown':
            enemy.attack();
            break;
    }
})

// manage key release
window.addEventListener('keyup', (event) => {
    // player keys
    switch(event.key){
        case 'd':
            keys.d.pressed = false;
            break;
        case 'q':
            keys.q.pressed = false;
            break;
    }

    // enemy keys
    switch(event.key){
        case 'ArrowRight':
            keys.ArrowRight.pressed = false;
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false;
            break;
    }
})