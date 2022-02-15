//ideas
//hold to fire
//make game rounds
//change speed based on size; the smaller, the faster
//upgrades
   //minions
//cooldown abilities
   //circle shot
//store for upgrades and powerups between rounds
//powerups
   //machine gun
   //projectiles hit multiple times (no collision)
   //bombs/missles

//set canvas
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//get html elements
//main menu
const mainMenu = document.querySelector("#mainMenu");
const howToMenu = document.querySelector("#howToMenu");
const cannonMenu = document.querySelector("#cannonMenu");
const feedbackMenu = document.querySelector("#feedbackMenu");
const creditsMenu = document.querySelector("#creditsMenu");
howToMenu.style.display = "none";
cannonMenu.style.display = "none";
feedbackMenu.style.display = "none";
creditsMenu.style.display = "none";

//pause menu
const pauseMenu = document.querySelector("#pauseMenu");

//restart menu
const restartMenu = document.querySelector("#restartMenu");
const bigScoreEl = document.querySelector("#bigScoreEl");

//gui
const scoreEl = document.querySelector("#scoreEl");
const bulletCount = document.querySelector("#bulletCount");
const roundCount = document.querySelector("#roundCount");
const hpCount = document.querySelector("#hpCount");
const gui = document.querySelector("#gui");
gui.style.display = "none";

//debug menu (left alt)
const debugMenu = document.querySelector("#debugMenu");
const projectileArr = document.querySelector("#projectileArr");
const enemyArr = document.querySelector("#enemyArr");
const playerInfo = document.querySelector("#playerInfo");
const cannonObj = document.querySelector("#cannon");
debugMenu.style.display = "none";

//everything
//item arrays
let projectiles = [];
let enemies = [];
let particles = [];

//set rounds
const round = {
  increase: 0,
  spawnRate: 2000,
  counter: 1,
  begin: function() { //round test
      this.increase = setInterval(() => {
         if (this.spawnRate !== 0 && (this.spawnRate * 0.95) !== 0) {
            this.spawnRate *= 0.95;
            clearInterval(enemySpawnId);
            spawnEnemies();
            
            this.counter++;
            roundCount.innerHTML = this.counter;
         } else {
            clearInterval(this.increase);
         }
      }, 5000); //new round every n milliseconds
   }
};

//spawn enemy function
let enemySpawnId;
function spawnEnemies() {
   //increase dificulty by score
   enemySpawnId = setInterval(() => {
      const radius = Math.random() * (30 - 8) + 8;
      const color = `hsl(${Math.random() * 360},100%,50%)`;
      let x;
      let y;
      
      //makes enemies spawn at the edge of the canvas
      if (Math.random() < 0.5) {
         x = Math.random() < 0.5 ? 0 - radius : canvas.width+radius;
         y = Math.random() * canvas.height;
      } else {
         x = Math.random() * canvas.width;
         y = Math.random() < 0.5 ? 0 - radius : canvas.height+radius;
      }
      
      //trigonometry magic
      //make the enemies go to the center
      const angle = Math.atan2(
         (canvas.height / 2) - y,
         (canvas.width / 2) - x
      );
      
      //enemy speed
      const velocity = {
         x: Math.cos(angle) * 2,
         y: Math.sin(angle) * 2
      };
      
      //add enemy to array
      enemies.push(new Enemy(undefined, x, y, radius, color, velocity));
   }, round.spawnRate); //enemy spawn frequency
}

//animation (gameplay loop?)
let animateId;
let score = 0;
function animate() {
   //makes a loop 
   animateId = requestAnimationFrame(animate);
   
   //clears canvas every frame in order to redraw everything
   ctx.fillStyle = "rgb(0, 0, 0, 0.1)";
   ctx.fillRect(0, 0, canvas.width, canvas.height);
   cannon.draw();
   player.draw();
   
   //update bulletCount
   bulletCount.innerHTML = `${Math.floor((player.info.max - (projectiles.length / player.info.volley))).toFixed()}/${player.info.max.toFixed()}`;
   if (player.info.max - (projectiles.length / player.info.volley) <= 1) {
      bulletCount.style.color = "red";
   } else {
      bulletCount.style.color = "white";
   }
   
   //spawns/despawns particles when enemy is hit
   particles.forEach((particle,index) => {
      if (particle.alpha <= 0) {
         particles.splice(index, 1);
      } else {
         particle.update();
      }
   });
   
   //spawns/despawns projectiles
   projectiles.forEach((projectile, index) => {
      //despawns projectiles when offscreen
      if (
         (projectile.x + projectile.radius) + 20 < 0 || 
         (projectile.x - projectile.radius) - 20 > canvas.width ||
         (projectile.y + projectile.radius) + 20 < 0 ||
         (projectile.y - projectile.radius) - 20 > canvas.height) {
         projectiles.splice(index, 1);
      } else {
        projectile.update();
      }
   });
   
   //bunch of stuff
   enemies.forEach((enemy, index) => {
      //update enemy location
      enemy.update();
      
      //finds distance between player and enemy
      const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
      
      //enemy/player collision detection and game over
      if ((dist - enemy.radius) - player.radius < 1) {
         player.info.hp.currently--;
         hpCount.innerHTML = `${player.info.hp.currently}/${player.info.hp.total}`;
         
         if (player.info.hp.currently < 1) {
            gameOver();
         } else {
            enemies.splice(index, 1);
            
            //damage instance
            player.color = "red";
            hpCount.style.color = "red";
            setTimeout(() => {
               gsap.to(player, {
                  color: "white"
               });
               if (player.info.hp.currently !== 1) {
                  gsap.to(hpCount, {
                     color: "white"
                  });
               }
            }, 100);
         }
      }
      
      //enemy/projectile collision detection and more
      projectiles.forEach((projectile, projectileIndex) => {
         //finds distance between projectile and enemy
         const dist2 = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
         
         //spawns particles when enemy is hit
         if (dist2 - enemy.radius - projectile.radius < 1) {
            for (let i = 0; i < enemy.radius * 1.5; i++) {
               particles.push(
                  new Particle(
                     projectile.x,
                     projectile.y,
                     Math.random() * 2,
                     enemy.color,
                     {
                        x:(Math.random() - 0.5) * (Math.random() * 8),
                        y:(Math.random() - 0.5) * (Math.random() * 8)
                     }
                  )
               );
            }
            
            //shrinks/despawns enemy when hit and gives points
            if (enemy.radius - 10 > 5) {
               //add 100 points when hit isn't fatal
               score += 100;
               scoreEl.innerHTML = score.toLocaleString();
               
               //transition to smaller size when hit
               gsap.to(enemy, {
                  radius: enemy.radius - 10
               });
               
               projectiles.splice(projectileIndex, 1);
            } else {
               //adds 250 points when hit is fatal
               score += 250;
               scoreEl.innerHTML = score.toLocaleString();
               
               enemies.splice(index, 1);
               projectiles.splice(projectileIndex, 1);
            }
         }
      });
   });
   
   //debug menu
   projectileArr.innerHTML = `projectiles: [${projectiles.length}], ${(projectiles.length / player.info.volley).toFixed(2)} volley(s)`;
   enemyArr.innerHTML = `enemies: [${enemies.length}]: enabled: ${enemySpawnId !== undefined} (toggle with left ctrl)`;
   playerInfo.innerHTML = `player: 
      [wait: ${player.info.wait}], 
      [projectileRadius: ${player.info.projectileRadius}], 
      [projectileColor: {lead: ${player.info.projectileColor.lead}, follower: ${player.info.projectileColor.follower}}], 
      [volley: ${player.info.volley}], 
      [max: ${player.info.max}], 
      [cooldown: {wait: ${player.info.cooldown.wait}, enabled: ${player.info.cooldown.enabled}}]`;
   
   cannonObj.innerHTML = `cannon: 
      [radius: ${cannon.radius}], 
      [color: ${cannon.color}], 
      [x: ${cannon.x}], 
      [y: ${cannon.y}]`;
}

//initialization function
function init() {
   //clears screen
   ctx.fillStyle = "rgb(0,0,0)";
   ctx.fillRect(0,0,canvas.width,canvas.height);
   
   //hides main, pause, and restart menu
   mainMenu.style.display = "none";
   pauseMenu.style.display = "none";
   restartMenu.style.display = "none";
   
   //clears all object arrays
   projectiles = [];
   enemies = [];
   particles = [];
   
   //resets score and hp, enables gui
   score = 0;
   scoreEl.innerHTML = score;
   player.info.hp.currently = player.info.hp.total;
   hpCount.innerHTML = `${player.info.hp.currently}/${player.info.hp.total}`;
   hpCount.style.color = "white";
   roundCount.innerHTML = 1;
   
   gui.style.display = "flex";
   
   //starts game
   setTimeout(() => {
      animate();
      round.begin();
      spawnEnemies();
   }, 0);
}

function gameOver() {
   //end game
   cancelAnimationFrame(animateId);
   clearInterval(round.increase);
   clearInterval(enemySpawnId);
   
   //hides gui, unhides start menu and updates score
   gui.style.display = "none";
   restartMenu.style.display = "flex";
   bigScoreEl.innerHTML = score.toLocaleString();
}

function pause(end) {
   if (pauseMenu.style.display === "none") {
      pauseMenu.style.display = "flex";
      cancelAnimationFrame(animateId);
      clearInterval(round.increase);
      clearInterval(enemySpawnId);
   } else {
      pauseMenu.style.display = "none";
      setTimeout(() => {
         animate();
         round.begin();
         spawnEnemies();
      }, 0);
   }
   
   if (end !== undefined) { //prevents player from setting score if they quit to main menu
      pauseMenu.style.display = "none";
      cancelAnimationFrame(animateId);
      clearInterval(round.increase);
      clearInterval(enemySpawnId);
      score = 0;
   }
}

//spawns and centers player
const x = canvas.width / 2;
const y = canvas.height / 2;
const player = new Player(x, y, 20, "white", {
   //player hp
   hp: {total: 3, currently: 0},
   
   //time between spawing each extra projectile (in milliseconds)
   wait: 10,
   
   //projectile size
   projectileRadius: 5,
   
   //projectile color
   projectileColor: {
      lead: "white",
      follower: "white"
   },
   
   //total projectiles spawned per click (~63 is a full circle)
   volley: 3,
   
   //maximum amount of Projectile groups allowed on screen
   max: 6,
   
   //cooldown between spawn
   cooldown: {wait: 150, enabled: false}
});

//spawns cannon
const cannon = new Cannon(x, y, 10, "blue", {});

//cannon movement
document.addEventListener("mousemove", () => {if (restartMenu.style.display === "none") {cannon.move()}});

//shoot projectiles on click
canvas.addEventListener("click", (event) => {
   //spawn projectiles
   //only spawns in projectiles if the max amount of projectiles allowed hasn't been reached
   if (projectiles.length / player.info.volley <= player.info.max - 1 && player.info.cooldown.enabled === false) {
      //change cannon color
      cannon.color = "red";
      
      //trigonometry magic
      const angle = Math.atan2(
         event.clientY - (canvas.height / 2),
         event.clientX - (canvas.width / 2)
      );
      
      //projectile speed
      const velocity = {
         x: Math.cos(angle) * 6,
         y: Math.sin(angle) * 6
      };
      
      projectiles.push(
         new Projectile (
            cannon.x,
            cannon.y,
            player.info.projectileRadius,
            player.info.projectileColor.lead,
            velocity
         )
      );
      
      //multishot
      let flipflop = true; 
      if (player.info.volley > 1) {
         //projectile pseudoloop
         const projI = {
            loop: 0,
            i: 0,
         };
         
         projI.loop = setInterval(() => {
            //flipflop?
            if (flipflop) {//try using projI.i instead
               angle2 = angle + (0.05 * ((projI.i + 2)));
            } else {
               angle2 = angle + (0.05 * (-(projI.i + 1)));
            }
            
            //projectile speed
            const velocity2 = {
               x: Math.cos(angle2) * 6,
               y: Math.sin(angle2) * 6
            };
            
            //spawn multishots
            setTimeout(() => {
               projectiles.push(
                  new Projectile (
                     cannon.x,
                     cannon.y,
                     player.info.projectileRadius,
                     player.info.projectileColor.follower,
                     velocity2
                  )
               );
            });
            
            //flip flipflop
            flipflop = !flipflop;
            
            projI.i++;
            if (projI.i >= player.info.volley - 1) {
               clearInterval(projI.loop);
            }
         }, player.info.wait);
      }
      
      //enable/disable cooldown
      player.info.cooldown.enabled = true;
      setTimeout(() => {
         player.info.cooldown.enabled = false;
         
         gsap.to(cannon, {
            color: "blue"
         });
      }, player.info.cooldown.wait);
   }
});

//resize on change
addEventListener("resize", () => {
   canvas.width = window.innerWidth;
   canvas.height = window.innerHeight;
   
   const x = canvas.width / 2;
   const y = canvas.height / 2;
   
   player.x = x;
   player.y = y;
});

//key shortcuts
addEventListener("keydown", (event) => {
   if (event.code === "Enter" && (restartMenu.style.display === "flex" || pauseMenu.style.display === "flex")) {
      if (restartMenu.style.display === "flex") {
         init();
      } else {
         pause();
      }
   } else if (event.code === "KeyP") {
      pause();
      
   //debug shortcuts
   } else if (event.code === "AltRight") {
      if (debugMenu.style.display === "none") {
         debugMenu.style.display = "flex";
      } else {
         debugMenu.style.display = "none";
      }
   } else if (event.code === "ControlRight") {
      if (enemySpawnId) {
         clearInterval(round.increase);
         clearInterval(enemySpawnId);
         enemySpawnId = undefined;
      } else {
         round.begin();
         spawnEnemies();
      }
   }
});

//splash screen
const splashScreen = document.querySelector("#splashScreen");
setTimeout(() => {
   splashScreen.style.display = "none";
   gameOver();
}, 250);
