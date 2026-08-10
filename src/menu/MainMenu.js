export default class MainMenu {

    constructor({
        onPlay,
        onMapMaker
    }) {

        this.onPlay = onPlay;
        this.onMapMaker = onMapMaker;

        this.create();
        this.bindEvents();

    }

    create() {

        this.element = document.createElement("div");
        this.element.id = "mainMenu";

        this.element.innerHTML = `
            <div class="menu-background-grid"></div>

            <div class="menu-screen menu-home">
                <div class="menu-logo">
                    <span class="menu-logo-small">
                        CYBER-SAS STUDIOS
                    </span>

                    <h1>
                        SECTOR<span>87</span>
                    </h1>

                    <p>
                        TACTICAL VOXEL COMBAT
                    </p>
                </div>

                <div class="menu-buttons">
                    <button
                        class="menu-button primary"
                        data-action="play"
                    >
                        <span>▶</span>
                        JUGAR
                    </button>

                    <button
                        class="menu-button"
                        data-action="map-maker"
                    >
                        <span>◆</span>
                        MAP MAKER
                    </button>

                    <button
                        class="menu-button"
                        data-action="skin-maker"
                    >
                        <span>◉</span>
                        SKIN MAKER
                    </button>

                    <button
                        class="menu-button"
                        data-action="settings"
                    >
                        <span>⚙</span>
                        AJUSTES
                    </button>
                </div>

                <div class="menu-footer">
                    <span>SECTOR87 DEV BUILD</span>
                    <span>v0.9.5</span>
                </div>
            </div>

            <div class="menu-screen menu-placeholder">
                <div class="placeholder-card">
                    <span class="placeholder-label">
                        SECTOR87 SYSTEM
                    </span>

                    <h2 id="placeholderTitle">
                        PRÓXIMAMENTE
                    </h2>

                    <p id="placeholderDescription">
                        Sistema en construcción.
                    </p>

                    <button
                        class="menu-button primary"
                        data-action="back"
                    >
                        VOLVER
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(
            this.element
        );

        this.homeScreen =
            this.element.querySelector(
                ".menu-home"
            );

        this.placeholderScreen =
            this.element.querySelector(
                ".menu-placeholder"
            );

        this.placeholderTitle =
            this.element.querySelector(
                "#placeholderTitle"
            );

        this.placeholderDescription =
            this.element.querySelector(
                "#placeholderDescription"
            );

        this.showHome();

    }

    bindEvents() {

        this.element.addEventListener(
            "click",
            (event) => {

                const button =
                    event.target.closest(
                        "[data-action]"
                    );

                if (!button) return;

                const action =
                    button.dataset.action;

                if (action === "play") {

                    this.onPlay?.();

                    return;

                }

                if (action === "map-maker") {

                    this.onMapMaker?.();

                    return;

                }

                if (action === "skin-maker") {

                    this.showPlaceholder(
                        "SKIN MAKER",
                        "Aquí construiremos el editor 3D de skins en la siguiente parte de la actualización."
                    );

                    return;

                }

                if (action === "settings") {

                    this.showPlaceholder(
                        "AJUSTES",
                        "Aquí añadiremos gráficos, sensibilidad, audio, controles y accesibilidad."
                    );

                    return;

                }

                if (action === "back") {

                    this.showHome();

                }

            }
        );

    }

    show() {

        this.element.style.display = "flex";

        this.showHome();

    }

    hide() {

        this.element.style.display = "none";

    }

    showHome() {

        this.homeScreen.style.display =
            "flex";

        this.placeholderScreen.style.display =
            "none";

    }

    showPlaceholder(title, description) {

        this.placeholderTitle.textContent =
            title;

        this.placeholderDescription.textContent =
            description;

        this.homeScreen.style.display =
            "none";

        this.placeholderScreen.style.display =
            "flex";

    }

}