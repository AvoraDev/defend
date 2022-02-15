class Enemy {
   //creates enemy with the following objects
   constructor(enemyIndex, x, y, radius, color, velocity) {
      this.enemyIndex = enemyIndex;
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.color = color;
      this.velocity = velocity;
   }
   
   //spawns enemy
   draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      ctx.fillStyle = this.color;
      ctx.fill();
   }
   
   //updates location of enemy
   update() {
      this.draw();
      this.x = this.x + this.velocity.x;
      this.y = this.y + this.velocity.y;
   }
}