//the closer to 0, the slower the speed
const friction = 0.98;
class Particle {
   //creates particle with the following objects
   constructor(x, y, radius, color, velocity) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.color = color;
      this.velocity = velocity;
      this.alpha = 1;
   }
   
   //spawns particle
   draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2,false);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
   }
   
   //updates location and opacity of particle
   update() {
      this.draw();
      this.velocity.x *= friction;
      this.velocity.y *= friction;
      this.x = this.x + this.velocity.x;
      this.y = this.y + this.velocity.y;
      this.alpha -= 0.01;
   }
}
