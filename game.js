class Keyboard {
  keys = {};

  constructor() {
    window.addEventListener("keydown", (e) => {
      this.keys[e.key] = true;
    });
    window.addEventListener("keyup", (e) => {
      this.keys[e.key] = false;
    });
  }

  isKeyDown(key) {
    return this.keys[key] === true;
  }
}

class Touch {
  touches = {};

  constructor() {
    window.addEventListener("touchstart", (e) => {
      for (const touch of e.changedTouches) {
        this.touches[touch.identifier] = {
          x: touch.clientX,
          y: touch.clientY
        };
      }
    }
    );
    window.addEventListener("touchmove", (e) => {
      for (const touch of e.changedTouches) {
        this.touches[touch.identifier] = {
          x: touch.clientX,
          y: touch.clientY
        };
      }
    }
    );
    window.addEventListener("touchend", (e) => {
      for (const touch of e.changedTouches) {
        delete this.touches[touch.identifier];
      }
    }
    );
  }

  getTouch(touchId) {
    return this.touches[touchId];
  }
}

class Sprite {
  src = "";
  image = null;
  width = 0;
  height = 0;
  frames = [];
  currentFrame = 0;
  frameDuration = 0;
  frameDurationCounter = 0;

  constructor({ src, width, height, frames, frameDuration, scale = 1 }) {
    this.src = src;
    this.width = width;
    this.height = height;
    this.frames = frames;
    this.frameDuration = frameDuration;
    this.image = new Image();
    this.image.src = src;
    this.width = width
    this.height = height
    this.scale = scale
  }

  draw(ctx, dt, x, y) {
    ctx.drawImage(
      this.image,
      this.frames[this.currentFrame].x,
      this.frames[this.currentFrame].y,
      this.width,
      this.height,
      x + this.width * this.scale * 1.15,
      y + this.height * this.scale * 1.15,
      this.width * this.scale,
      this.height * this.scale
    );

    this.frameDurationCounter += dt;
    if (this.frameDurationCounter >= this.frameDuration) {
      this.frameDurationCounter = 0;
      this.currentFrame++;
      if (this.currentFrame >= this.frames.length) {
        this.currentFrame = 0;
      }
    }
  }

  drawCentered(ctx, dt, x, y) {
    this.draw(ctx, dt, x - this.width / 2, y - this.height / 2);
  }

}

const tileImage = new Image()
tileImage.src = "assets/floor.png"

const tileTypes = {
  floor: {
    color: "#eee",
    image: tileImage,
    walkable: true,
  },
  wall: {
    color: "#bbb",
    image: null,
    walkable: false,
    transparent: false
  }
}

class Tile {
  constructor(type) {
    this.type = type;
  }
}

class Map {
  width = 36;
  height = 20;
  tileSize = 64;
  tiles = [];

  generate() {
    for (let y = 0; y < this.height; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < this.width; x++) {
        this.tiles[y][x] = new Tile(
          Math.random() > 0.8 ? tileTypes.wall : tileTypes.floor
        );
      }
    }
  }

  getTile(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return null;
    }
    return this.tiles[y][x];
  }

  getTileInPixels(x, y) {
    if (x < 0 || x >= this.width * this.tileSize || y < 0 || y >= this.height * this.tileSize) {
      return null;
    }
    const tileX = Math.floor(x / this.tileSize);
    const tileY = Math.floor(y / this.tileSize);
    return this.getTile(tileX, tileY);
  }

  draw(ctx) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = this.tiles[y][x];
        if (tile.type.image) {
          ctx.drawImage(
            tile.type.image,
            x * this.tileSize,
            y * this.tileSize,
            this.tileSize,
            this.tileSize
          );
        }
        else {

          ctx.fillStyle = tile.type.color;
          ctx.fillRect(
            x * this.tileSize,
            y * this.tileSize,
            this.tileSize,
            this.tileSize
          );
        }
      }
    }
  }
}

class Hero {
  health = 10;
  x = 17; // center of the hero
  y = 27; // center of the hero
  width = 34;
  height = 54;
  tile = null;
  facing = "right";

  constructor() {
    this.spriteUp = new Sprite({
      src: "assets/zombie.png",
      width: 101,
      height: 162,
      frames: [
        { x: 44, y: 157 },
      ],
      frameDuration: 2,
      scale: 0.3
    });
    this.spriteLeft = new Sprite({
      src: "assets/zombie.png",
      width: 101,
      height: 162,
      frames: [
        { x: 150, y: 157 },
      ],
      frameDuration: 2,
      scale: 0.3
    });
    this.spriteRight = new Sprite({
      src: "assets/zombie.png",
      width: 101,
      height: 162,
      frames: [
        { x: 256, y: 157 },
      ],
      frameDuration: 2,
      scale: 0.3
    });
    this.spriteDown = new Sprite({
      src: "assets/zombie.png",
      width: 101,
      height: 162,
      frames: [
        { x: 362, y: 157 },
      ],
      frameDuration: 2,
      scale: 0.3
    });
  }

  canMove(direction) {
    if (direction === 'up')
      return engine.map.getTileInPixels(this.x - this.width / 2, this.y - this.height / 2 - 1)?.type.walkable
        && engine.map.getTileInPixels(this.x + this.width / 2 - 1, this.y - this.height / 2 - 1)?.type.walkable
        || false;
    if (direction === 'down')
      return engine.map.getTileInPixels(this.x - this.width / 2, this.y + this.height / 2)?.type.walkable
        && engine.map.getTileInPixels(this.x + this.width / 2 - 1, this.y + this.height / 2)?.type.walkable
        || false;
    if (direction === 'left')
      return engine.map.getTileInPixels(this.x - this.width / 2 - 1, this.y - this.height / 2)?.type.walkable
        && engine.map.getTileInPixels(this.x - this.width / 2 - 1, this.y + this.height / 2 - 1)?.type.walkable
        || false;
    if (direction === 'right')
      return engine.map.getTileInPixels(this.x + this.width / 2, this.y - this.height / 2)?.type.walkable
        && engine.map.getTileInPixels(this.x + this.width / 2, this.y + this.height / 2 - 1)?.type.walkable
        || false;
    return false;
  }

  move(x, y) {
    if (x < 0) {
      this.facing = "left";
    }
    else if (x > 0) {
      this.facing = "right";
    }
    else if (y < 0) {
      this.facing = "up";
    }
    else if (y > 0) {
      this.facing = "down";
    }

    if (y < 0 && this.canMove("up")) {
      this.y += y;
    }
    else if (y > 0 && this.canMove("down")) {
      this.y += y;
    }
    else if (x < 0 && this.canMove("left")) {
      this.x += x;
    }
    else if (x > 0 && this.canMove("right")) {
      this.x += x;
    }
    else {
      return false;
    }

    return true;
  }

  draw(ctx, dt) {
    // ctx.fillStyle = "#000000";
    // ctx.fillRect(
    //   this.x - this.width / 2,
    //   this.y - this.height / 2,
    //   this.width,
    //   this.height
    // );

    if (this.facing === "left") {
      this.spriteLeft.drawCentered(ctx, dt, this.x, this.y);
    }

    if (this.facing === "right") {
      this.spriteRight.drawCentered(ctx, dt, this.x, this.y);
    }

    if (this.facing === "up") {
      this.spriteUp.drawCentered(ctx, dt, this.x, this.y);
    }

    if (this.facing === "down") {
      this.spriteDown.drawCentered(ctx, dt, this.x, this.y);
    }
  }
}

class Bullet {
  x = 0;
  y = 0;
  direction = "right";
  speed = 5;

  constructor({ x, y, direction, speed }) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.speed = speed;
  }

  draw(ctx, dt) {
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(
      this.x - 2,
      this.y - 2,
      4,
      4
    );
  }
}

class Ninja extends Hero {
  bullets = [];
  bulletCooldownDuration = 0.2;
  bulletCooldown = 0;
  bulletSpeed = 5;

  constructor() {
    super();
  }

  attack() {
    if (this.bulletCooldown > 0) {
      return;
    }
    this.bulletCooldown = this.bulletCooldownDuration;

    this.bullets.push(
      new Bullet({
        x: this.x,
        y: this.y,
        direction: this.facing,
        speed: this.bulletSpeed
      })
    );
  }

  draw(ctx, dt) {
    super.draw(ctx);
    for (const bullet of this.bullets) {
      bullet.draw(ctx, dt);
    }

    if (this.bulletCooldown > 0) {
      this.bulletCooldown -= dt;
    }

    this.bullets = this.bullets.filter((bullet) => {
      const tile = engine.map.getTileInPixels(bullet.x, bullet.y);
      if (tile?.type.walkable === false) {
        return false;
      }
      return true;
    });


    this.bullets.map((bullet) => {
      bullet.x += {
        right: this.bulletSpeed,
        left: -this.bulletSpeed,
        up: 0,
        down: 0
      }[bullet.direction];
      bullet.y += {
        right: 0,
        left: 0,
        up: -this.bulletSpeed,
        down: this.bulletSpeed
      }[bullet.direction];
    });
  }
}


class AINinja extends Ninja {
  direction = "right";
  constructor() {
    super();
  }

  draw(ctx, dt) {
    super.draw(ctx, dt);

    while (this.canMove(this.direction) === false || Math.random() > 0.99) {
      this.direction = ["right", "left", "up", "down"][Math.floor(Math.random() * 4)];
    }

    if (this.direction === "right") {
      this.move(1, 0);
    }

    if (this.direction === "left") {
      this.move(-1, 0);
    }

    if (this.direction === "up") {
      this.move(0, -1);
    }

    if (this.direction === "down") {
      this.move(0, 1);
    }

    if (Math.random() > 0.99) {
      this.attack();
    }
  }
}

class Camera {
  x = 0;
  y = 0;
  width = 0;
  height = 0;

  constructor(x, y, width, height) {
    this.x = x; // center of the camera
    this.y = y; // center of the camera
    this.width = width; // width of the camera in pixels
    this.height = height; // height of the camera in pixels
  }

  setCenter(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Engine {
  constructor() {
    this.dt = 0;
    this.lastFrameTime = 0;
    this.canvas = document.getElementById("game");
    this.camera = new Camera(0, 0, 500, window.innerHeight);
    this.ctx = this.canvas.getContext("2d");
    this.touch = new Touch();
    this.keyboard = new Keyboard();
    this.map = new Map();
  }

  start() {
    this.hero = new Ninja();
    this.aiHeros = [];
    for (let i = 0; i < 584; i++) {
      this.aiHeros.push(new AINinja());
    }
    this.camera.setCenter(this.hero.x, this.hero.y);
    this.map.generate();
    this.lastFrameTime = performance.now();
    window.requestAnimationFrame(this.render.bind(this));
  }

  render() {
    this.dt = performance.now() - this.lastFrameTime;

    if (this.keyboard.isKeyDown("ArrowUp")) {
      this.hero.move(0, -1);
    };
    if (this.keyboard.isKeyDown("ArrowDown")) {
      this.hero.move(0, 1);
    };
    if (this.keyboard.isKeyDown("ArrowLeft")) {
      this.hero.move(-1, 0);
    };
    if (this.keyboard.isKeyDown("ArrowRight")) {
      this.hero.move(1, 0);
    }
    if (this.keyboard.isKeyDown(" ")) {
      this.hero.attack();
    }

    // render the game
    this.canvas.width = this.camera.width;
    this.canvas.height = this.camera.height;

    // clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // center the camera on the hero
    this.camera.setCenter(this.hero.x, this.hero.y);

    // set the camera position
    this.ctx.translate(
      -this.camera.x + this.canvas.width / 2,
      -this.camera.y + this.canvas.height / 2
    );

    // render the map
    this.map.draw(this.ctx);
    this.hero.draw(this.ctx, this.dt / 1000);
    this.aiHeros.map((hero) => {
      hero.draw(this.ctx, this.dt / 1000);
    });

    this.lastFrameTime = performance.now();
    window.requestAnimationFrame(this.render.bind(this));
  }
}

const engine = new Engine();

engine.start();
