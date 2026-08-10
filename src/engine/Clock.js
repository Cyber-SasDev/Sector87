export default class Clock {

    constructor() {

        this.lastTime = performance.now();

    }

    getDelta() {

        const now = performance.now();

        const delta = (now - this.lastTime) / 1000;

        this.lastTime = now;

        return delta;

    }

}