export default class HUD {

    constructor(player) {

        this.player = player;

        this.visible = true;

        // =========================
        // CONTENEDOR
        // =========================

        this.container =
            document.createElement("div");

        this.container.id =
            "sector87-hud";

        Object.assign(
            this.container.style,
            {
                position: "fixed",
                inset: "0",
                pointerEvents: "none",
                zIndex: "1000",
                fontFamily:
                    "Arial, sans-serif"
            }
        );

        document.body.appendChild(
            this.container
        );

        // =========================
        // CROSSHAIR
        // =========================

        this.crosshair =
            document.createElement("div");

        Object.assign(
            this.crosshair.style,
            {
                position: "absolute",
                left: "50%",
                top: "50%",
                transform:
                    "translate(-50%, -50%)",
                width: "5px",
                height: "5px",
                background: "white",
                borderRadius: "50%",
                boxShadow:
                    "0 0 3px black"
            }
        );

        this.container.appendChild(
            this.crosshair
        );

        // =========================
        // VIDA
        // =========================

        this.healthContainer =
            document.createElement("div");

        Object.assign(
            this.healthContainer.style,
            {
                position: "absolute",
                left: "30px",
                bottom: "30px",
                width: "240px",
                height: "26px",
                background:
                    "rgba(0,0,0,0.65)",
                border:
                    "2px solid white",
                borderRadius: "5px",
                overflow: "hidden"
            }
        );

        this.container.appendChild(
            this.healthContainer
        );

        // Barra interna

        this.healthBar =
            document.createElement("div");

        Object.assign(
            this.healthBar.style,
            {
                width: "100%",
                height: "100%",
                background: "#e53935",
                transition:
                    "width 0.15s ease"
            }
        );

        this.healthContainer.appendChild(
            this.healthBar
        );

        // Texto de vida

        this.healthText =
            document.createElement("div");

        Object.assign(
            this.healthText.style,
            {
                position: "absolute",
                left: "30px",
                bottom: "60px",
                color: "white",
                fontSize: "18px",
                fontWeight: "bold",
                textShadow:
                    "2px 2px 4px black"
            }
        );

        this.container.appendChild(
            this.healthText
        );

        // =========================
        // MUNICIÓN
        // =========================

        this.ammo =
            document.createElement("div");

        Object.assign(
            this.ammo.style,
            {
                position: "absolute",
                right: "35px",
                bottom: "30px",
                color: "white",
                fontSize: "28px",
                fontWeight: "bold",
                textShadow:
                    "2px 2px 4px black"
            }
        );

        this.container.appendChild(
            this.ammo
        );

        // =========================
        // RECARGA
        // =========================

        this.reloadText =
            document.createElement("div");

        Object.assign(
            this.reloadText.style,
            {
                position: "absolute",
                right: "35px",
                bottom: "65px",
                color: "white",
                fontSize: "16px",
                fontWeight: "bold",
                textShadow:
                    "2px 2px 4px black",
                display: "none"
            }
        );

        this.reloadText.textContent =
            "RECARGANDO...";

        this.container.appendChild(
            this.reloadText
        );

        this.update();

    }

    update() {

        if (!this.player) return;

        // =========================
        // VIDA
        // =========================

        const state =
            this.player.state;

        if (state) {

            const healthPercent =
                Math.max(
                    0,
                    Math.min(
                        100,
                        (
                            state.health /
                            state.maxHealth
                        ) * 100
                    )
                );

            this.healthBar.style.width =
                `${healthPercent}%`;

            this.healthText.textContent =
                `❤️ ${Math.ceil(state.health)}`;

        }

        // =========================
        // ARMA
        // =========================

        const weaponManager =
            this.player.weaponManager;

        if (
            weaponManager &&
            weaponManager.weapon
        ) {

            const weapon =
                weaponManager.weapon;

            this.ammo.textContent =
                `${weapon.ammo} / ${weapon.reserveAmmo}`;

            this.reloadText.style.display =
                weapon.reloading
                    ? "block"
                    : "none";

        }

    }

    setVisible(visible) {

        this.visible = visible;

        this.container.style.display =
            visible
                ? "block"
                : "none";

    }

}