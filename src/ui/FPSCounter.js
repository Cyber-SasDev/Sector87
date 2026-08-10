export default class FPSCounter {

    constructor() {

        this.frames = 0;
        this.fps = 0;
        this.lastTime = performance.now();

        this.element = document.createElement("div");

        this.element.id = "fpsCounter";

        document.body.appendChild(this.element);

    }

    update() {

        this.frames++;

        const now = performance.now();

        if (now - this.lastTime >= 1000) {

            this.fps = this.frames;

            this.frames = 0;

            this.lastTime = now;

        }

        this.element.innerHTML = `
<b>Sector87 DEV</b><br>
FPS: ${this.fps}
`;

    }

}