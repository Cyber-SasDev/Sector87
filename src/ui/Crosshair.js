export default class Crosshair {

    constructor() {

        this.element = document.createElement("div");
        this.element.id = "crosshair";

        this.element.innerHTML = `
            <div class="line top"></div>
            <div class="line bottom"></div>
            <div class="line left"></div>
            <div class="line right"></div>
            <div class="dot"></div>
        `;

        document.body.appendChild(this.element);

    }

    update(player) {

        const spread = player.state.isRunning ? 10 : 6;

        this.element.style.setProperty("--spread", spread + "px");

    }

}