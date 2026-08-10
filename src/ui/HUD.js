import Crosshair from "./Crosshair";
import FPSCounter from "./FPSCounter";
import Debug from "./Debug";

export default class HUD {

    constructor(player) {

        this.player = player;

        this.crosshair =
            new Crosshair();

        this.fps =
            new FPSCounter();

        this.debug =
            new Debug(player);

        this.visible = true;

    }

    update() {

        if (!this.visible) return;

        this.crosshair.update(
            this.player
        );

        this.fps.update();

        this.debug.update();

    }

    setVisible(visible) {

        this.visible = visible;

        this.crosshair.element.style.display =
            visible ? "block" : "none";

        this.fps.element.style.display =
            visible ? "block" : "none";

        if (!visible) {

            this.debug.element.style.display =
                "none";

        } else {

            this.debug.element.style.display =
                this.debug.visible
                    ? "block"
                    : "none";

        }

    }

}