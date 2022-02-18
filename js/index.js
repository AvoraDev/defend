//ideas
//hold to fire
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
//just ignore this
switch(window.location.protocol) {
   case 'file:':
     document.title = "Defend! (LOCAL)";
     break;
   default: 
     console.log("not a local file");
}

//set canvas
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//get html elements
//main menu
const mainMenu = document.querySelector("#mainMenu");
const howToMenu = document.querySelector("#howToMenu");
const customizeMenu = document.querySelector("#customizeMenu");
const feedbackMenu = document.querySelector("#feedbackMenu");
const settingsMenu = document.querySelector("#settingsMenu");
const creditsMenu = document.querySelector("#creditsMenu");
howToMenu.style.display = "none";
customizeMenu.style.display = "none";
feedbackMenu.style.display = "none";
settingsMenu.style.display = "none";
creditsMenu.style.display = "none";

//pause menu
const pauseMenu = document.querySelector("#pauseMenu");
pauseMenu.style.display = "none";

//restart menu
const restartMenu = document.querySelector("#restartMenu");
const scoreCountFinal = document.querySelector("#scoreCountFinal");
const roundCountFinal = document.querySelector("#roundCountFinal");

//gui
const scoreCount = document.querySelector("#scoreCount");
const bulletCount = document.querySelector("#bulletCount");
const roundCount = document.querySelector("#roundCount");
const hpCount = document.querySelector("#hpCount");
const gui = document.querySelector("#gui");
gui.style.display = "none";

//debug menu (left alt)
const debugMenu = document.querySelector("#debugMenu");
const projectileArr = document.querySelector("#projectileArr");
const enemyArr = document.querySelector("#enemyArr");
const roundInfo = document.querySelector("#roundInfo");
const playerInfo = document.querySelector("#playerInfo");
const cannonObj = document.querySelector("#cannon");
debugMenu.style.display = "none";

//audio
let select = new Howl({src: ["./audio/select.mp3"]});
let shoot = new Howl({src: ["./audio/shoot.mp3"]});
let hit = new Howl({src: ["./audio/hit.mp3"]});

//everything
//item arrays
let projectiles = [];
let enemies = [];
let particles = [];

//set rounds
const round = {
  increase: 0,
  spawnRate: {initial: 2000, currently: 0},
  counter: 1,
  begin: function() {
      this.spawnRate.currently = this.spawnRate.initial;
      this.counter = 1;
      this.increase = setInterval(() => {
         if (this.spawnRate.currently !== 0 && (this.spawnRate.currently * 0.95) !== 0) {
            this.spawnRate.currently *= 0.95;
            clearInterval(enemySpawnId);
            spawnEnemies();
            
            this.counter++;
            roundCount.innerHTML = this.counter;
         } else {
            clearInterval(this.increase);
            roundCount.innerHTML = `${this.counter} (Max)`;
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
      enemies.push(new Enemy(undefined, x, y, radius, color, velocity)); //undefined is enemyIndex
   }, round.spawnRate.currently); //enemy spawn frequency
}

//animation (gameplay loop?)
let animateId;
let score = 0;
function animate() {
   //makes a loop 
   animateId = requestAnimationFrame(animate);
   
   //clears canvas every frame in order to redraw everything
   ctx.fillStyle = player.settings.trailing ? "rgba(0, 0, 0, 0.1)" : "rgba(0, 0, 0, 1)";
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
            player.color.currently = "red";
            hpCount.style.color = "red";
            setTimeout(() => {
               gsap.to(player.color, {
                  currently: player.color.original
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
         
         if (dist2 - enemy.radius - projectile.radius < 1) {
            //play sound
            hit.play();
            
            //spawns particles when enemy is hit
            if (player.settings.particles) {
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
            }
            
            //shrinks/despawns enemy when hit and gives points
            if (enemy.radius - 10 > 5) {
               //add 100 points when hit isn't fatal
               score += 100;
               scoreCount.innerHTML = score.toLocaleString();
               
               //transition to smaller size when hit
               gsap.to(enemy, {
                  radius: enemy.radius - 10
               });
               
               projectiles.splice(projectileIndex, 1);
            } else {
               //adds 250 points when hit is fatal
               score += 250;
               scoreCount.innerHTML = score.toLocaleString();
               
               setTimeout (() => {
                  enemies.splice(index, 1);
                  projectiles.splice(projectileIndex, 1);
               }, 0);
            }
         }
      });
   });
   
   //debug menu
   projectileArr.innerHTML = `projectiles: <br>
      [${projectiles.length}]: ${(projectiles.length / player.info.volley).toFixed(2)} volley(s) <br>`;
   enemyArr.innerHTML = `enemies: <br>
      [${enemies.length}]: enabled: ${enemySpawnId !== undefined} (toggle with left ctrl) <br>`;
   roundInfo.innerHTML = `round: <br>
      [counter: ${round.counter}] <br>
      [increase: ${round.increase}] <br>
      [spawnRate: {inital: ${round.spawnRate.initial}, currently: ${round.spawnRate.currently}}] <br>`;
   playerInfo.innerHTML = `player: <br>
      [color: {original: ${player.color.original}, currently: ${player.color.currently}}] <br>
      [hp: {total: ${player.info.hp.total}, currently: ${player.info.hp.currently}}] <br>
      [wait: ${player.info.wait}] <br>
      [projectileRadius: ${player.info.projectileRadius}] <br>
      [projectileColor: {lead: ${player.info.projectileColor.lead}, follower: ${player.info.projectileColor.follower}}] <br>
      [volley: ${player.info.volley}] <br>
      [max: ${player.info.max}] <br>
      [cooldown: {wait: ${player.info.cooldown.wait}, enabled: ${player.info.cooldown.enabled}}] <br>`;
   cannonObj.innerHTML = `cannon: <br>
      [radius: ${cannon.radius}] <br>
      [color: {original: ${cannon.color.original}, onFire: ${cannon.color.onFire}, currently: ${cannon.color.currently}}] <br>
      [x: ${cannon.x}] <br>
      [y: ${cannon.y}] <br>`;
}

//initialization function
function init() {
   //play sound
   select.play();
   
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
   
   //resets score
   score = 0;
   scoreCount.innerHTML = score;
   
   //resets round
   roundCount.innerHTML = 1;
   
   //resets hp
   player.info.hp.currently = player.info.hp.total;
   hpCount.innerHTML = `${player.info.hp.currently}/${player.info.hp.total}`;
   hpCount.style.color = "white";
   
   //unhides gui
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
   clearInterval(enemySpawnId);
   clearInterval(round.increase);
   
   //hides gui, unhides start menu and updates score
   gui.style.display = "none";
   restartMenu.style.display = "flex";
   scoreCountFinal.innerHTML = score.toLocaleString();
   roundCountFinal.innerHTML = round.counter;
}

function pause(end) {
   //play sound
   select.play();
   
   if (end !== undefined) { //prevents player from setting score if they quit to main menu
      pauseMenu.style.display = "none";
      cancelAnimationFrame(animateId);
      clearInterval(round.increase);
      clearInterval(enemySpawnId);
      score = 0;
   } else if (pauseMenu.style.display === "none") {
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
}

//spawns and centers player
const x = canvas.width / 2;
const y = canvas.height / 2;
const player = new Player(x, y, 20, {
   //make sure that both color.original and color.currently are the same
   original: "white",
   currently: "white"
}, { 
   //player hp
   hp: {total: 3, currently: 0},
   
   //time between spawing each extra projectile (in milliseconds)
   wait: 20,
   
   //projectile size
   projectileRadius: 6,
   
   //projectile color
   projectileColor: {
      lead: "white",
      follower: "white"
   },
   
   //total projectiles spawned per click (~63 is a full circle)
   volley: 1,
   
   //maximum amount of Projectile groups allowed on screen
   max: 10,
   
   //cooldown between spawn
   cooldown: {wait: 150, enabled: false}
}, {
   //player settings
   trailing: true,
   particles: true
});

//spawns cannon
const cannon = new Cannon(x, y, 10, {
   //make sure that both color.original and color.currently are the same
   original: "yellow",
   onFire: "rgb(255, 0, 80)",
   currently: "yellow"
}, {});

//cannon movement
document.addEventListener("mousemove", () => {if (restartMenu.style.display === "none") {cannon.move()}});

//shoot projectiles on click
canvas.addEventListener("click", (event) => {
   //spawn projectiles
   //only spawns in projectiles if the max amount of projectiles allowed hasn't been reached
   if (projectiles.length / player.info.volley <= player.info.max - 1 && player.info.cooldown.enabled === false) {
      //play sound
      shoot.play();
      
      //change cannon color
      cannon.color.currently = cannon.color.onFire;
      
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
         cannon.color.currently  = cannon.color.original;
         //gsap.to(cannon, { //try to find out how to make this slower
         //   color: "yellow"
         //});
      }, player.info.cooldown.wait);
   }
});

//select function
function menuToggle(id) {
   //play sound
   select.play();
   
   let temp = document.querySelector(`#${id}`);
   if (temp.style.display === "none") {
      temp.style.display = "flex";
   } else {
      temp.style.display = "none";
   }
}

//user stuff
const cPresets = [
   //player color presets
   [["White","white"],["Blue","blue"],["Green","rgb(0, 255, 0)"],["Yellow","yellow"]],
   //cannon color presets
   [["Original","yellow","rgb(255, 0, 80)"],["Red/Blue","red","blue"],["Yellow/Purple","yellow","rgb(110, 0, 255)"]],
   //projectile color presets
   [["White","white","white"],["White/Red","white","red"],["Yellow/Purple","yellow","rgb(110, 0, 255)"]],
   //hp presets
   [3,4,5,10,1],
   //volley presets
   [1,3,6,9]
];
const cCycle = {
   player: 0,
   cannon: 0,
   projectile: 0,
   hp: 0,
   volley: 0
};
function toggleSettings(id) {
   //play sound
   select.play();
   
   //on/off toggle
   let temp = document.querySelector(`#${id}`);
   if (temp.innerHTML === "On") {
      temp.innerHTML = "Off";
   } else if (temp.innerHTML === "Off") {
      temp.innerHTML = "On";
      
   //colors and such
   } else if (id === "playerColorCustomize") {
      if (cCycle.player < (cPresets[0].length - 1)) {
         cCycle.player++;
      } else {
         cCycle.player = 0;
      }
      
      temp.innerHTML = cPresets[0][cCycle.player][0];
      player.color.original = cPresets[0][cCycle.player][1];
      player.color.currently = cPresets[0][cCycle.player][1];
   } else if (id === "cannonColorCustomize") {
      if (cCycle.cannon < (cPresets[1].length - 1)) {
         cCycle.cannon++;
      } else {
         cCycle.cannon = 0;
      }
      
      temp.innerHTML = cPresets[1][cCycle.cannon][0];
      cannon.color.original = cPresets[1][cCycle.cannon][1];
      cannon.color.currently = cPresets[1][cCycle.cannon][1];
      cannon.color.onFire = cPresets[1][cCycle.cannon][2];
   } else if (id === "projectileColorCustomize") {
      if (cCycle.projectile < (cPresets[2].length - 1)) {
         cCycle.projectile++;
      } else {
         cCycle.projectile = 0;
      }
      
      temp.innerHTML = cPresets[2][cCycle.projectile][0];
      player.info.projectileColor.lead = cPresets[2][cCycle.projectile][1];
      player.info.projectileColor.follower = cPresets[2][cCycle.projectile][2];
   } else if (id === "hpCustomize") {
      if (cCycle.hp < (cPresets[3].length - 1)) {
         cCycle.hp++;
      } else {
         cCycle.hp = 0;
      }
      
      temp.innerHTML = cPresets[3][cCycle.hp];
      player.info.hp.total = cPresets[3][cCycle.hp];
   } else if (id === "volleyCustomize") {
      if (cCycle.volley < (cPresets[4].length - 1)) {
         cCycle.volley++;
      } else {
         cCycle.volley = 0;
      }
      
      temp.innerHTML = cPresets[4][cCycle.volley];
      player.info.volley = cPresets[4][cCycle.volley];
   }
}

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
   if (event.code === "Enter" && (mainMenu.style.display === "flex" || restartMenu.style.display === "flex" || pauseMenu.style.display === "flex")) {
      if (mainMenu.style.display === "flex" || restartMenu.style.display === "flex") {
         init();
      } else {
         pause();
      }
   } else if (event.code === "KeyP" && mainMenu.style.display === "none") {
      pause();
   } else if (event.code === "Escape") {
      if (pauseMenu.style.display === "flex") {
         pause("quit");
         mainMenu.style.display = "flex";
      } else if (restartMenu.style.display === "flex") {
         mainMenu.style.display = "flex";
      }
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
