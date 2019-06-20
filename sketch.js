/// <reference path="./p5.global-mode.d.ts" />

/////////////////////////////////////////
// CONSTANTS
/////////////////////////////////////////

const width = window.innerWidth;
const height = window.innerHeight;
const centre = [width / 2, height / 2];
const scale = 30;

let enlargedBoid;
const randomHues = [
  // needed for randomising the randomColour function
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "pink"
];
let randomHue = randomHues[0];

let flock = [];
let backgroundColour;

/////////////////////////////////////////
// BOID
/////////////////////////////////////////

class Boid {
  constructor() {
    this.pos = createVector(...centre);
    this.vel = p5.Vector.random2D().setMag(scale / 400);
    this.acc = createVector();
    this.colour = this.createRandomColour();
    this.canCrossBorder = random() > 0.6;
    this.willEnlarge = false;
    this.radius = 7;
  }

  createRandomColour() {
    const colors = randomColor({
      count: 1,
      hue: randomHue,
      format: "rgbArray"
    });
    return colors[0];
  }

  setWillEnlarge() {
    this.willEnlarge = true;
  }

  isPointCoveredBySelf(x, y) {
    return dist(this.pos.x, this.pos.y, x, y) < this.radius;
  }

  doesEnlargedCoverScreen() {
    return (
      this.isPointCoveredBySelf(0, 0) &&
      this.isPointCoveredBySelf(width, height) &&
      this.isPointCoveredBySelf(width, 0) &&
      this.isPointCoveredBySelf(0, height)
    );
  }

  isOffScreen() {
    return !(
      this.pos.x > 0 &&
      this.pos.y > 0 &&
      this.pos.x < width &&
      this.pos.y < height
    );
  }

  show() {
    fill(this.colour);
    noStroke();
    ellipse(this.pos.x, this.pos.y, this.radius * 2);
  }

  distFromCenter() {
    return dist(this.pos.x, this.pos.y, ...centre);
  }

  update() {
    if (this.willEnlarge) {
      // increase the radius exponentially using a magic scale
      this.radius +=
        Math.pow((Math.E * scale) / 2.5, (this.radius * scale) / 5000) -
        scale / 60;
      return;
    }

    if (this.canCrossBorder || this.distFromCenter() < scale * 2) {
      if (random() > 0.5) {
        this.acc = p5.Vector.random2D().setMag(0.15);
      } else {
        this.acc = p5.Vector.random2D().setMag(0.021);
      }
    }

    this.pos.add(this.vel);
    this.vel.add(this.acc);
  }
}

/////////////////////////////////////////
// MAIN
/////////////////////////////////////////

function setup() {
  createCanvas(width, height);
  for (let i = 0; i < 800; i++) {
    flock.push(new Boid());
  }
  backgroundColour = color(0, 0, 0);
  background(backgroundColour);
  backgroundColour = color(0, 0, 0, 20);
  frameRate(30);
}

const randomHueNoRepeat = index => {
  const newIndex = floor(random(0, randomHues.length));

  if (newIndex === index) {
    return randomHueNoRepeat(index);
  }

  return randomHues[newIndex];
};

function draw() {
  background(backgroundColour);

  let newFlock = [];
  for (const boid of flock) {
    boid.show();
    boid.update();

    if (boid.willEnlarge || !boid.isOffScreen()) {
      newFlock.push(boid);
    }
  }

  flock = newFlock;

  if (enlargedBoid == null && flock.length < 799) {
    enlargedBoid = flock[flock.length - 1];
    enlargedBoid.setWillEnlarge();
  }

  if (enlargedBoid != null && enlargedBoid.doesEnlargedCoverScreen()) {
    randomHue = randomHueNoRepeat(
      randomHues.findIndex(hue => hue === randomHue)
    );

    flock = [enlargedBoid];
    for (let i = 0; i < 800; i++) {
      flock.push(new Boid());
    }

    backgroundColour = color(...enlargedBoid.colour, 5);
    enlargedBoid = null;
  }
}
