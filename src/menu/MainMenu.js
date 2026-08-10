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
            <div class="menu-background">

                <div class="menu-grid"></div>
                <div class="menu-glow"></div>
                <div class="menu-scanlines"></div>

            </div>

            <div class="menu-content">

                <div class="menu-brand">

                    <div class="menu-studio">
                        CYBER-SAS STUDIOS
                    </div>

                    <h1>
                        SECTOR<span>87</span>
                    </h1>

                    <div class="menu-subtitle">
                        TACTICAL VOXEL COMBAT
                    </div>

                    <div class="menu-status">
                        <span></span>
                        ONLINE
                    </div>

                </div>

                <div class="menu-info">

                    <div>
                        SECTOR 87
                    </div>

                    <span>
                        DEV BUILD 0.9.5
                    </span>

                </div>

                <div class="menu-buttons">

                    <button
                        class="menu-button menu-play"
                        data-action="play"
                    >
                        <span class="button-icon">▶</span>

                        <span class="button-text">
                            <strong>PLAY NOW</strong>
                            <small>ENTER SECTOR</small>
                        </span>
                    </button>

                    <button
                        class="menu-button"
                        data-action="map-maker"
                    >
                        <span class="button-icon">◈</span>

                        <span class="button-text">
                            <strong>MAP MAKER</strong>
                            <small>CREATE MAP</small>
                        </span>
                    </button>

                    <button
                        class="menu-button"
                        data-action="skin-maker"
                    >
                        <span class="button-icon">◆</span>

                        <span class="button-text">
                            <strong>SKIN MAKER</strong>
                            <small>CUSTOMIZE</small>
                        </span>
                    </button>

                    <button
                        class="menu-button"
                        data-action="settings"
                    >
                        <span class="button-icon">⚙</span>

                        <span class="button-text">
                            <strong>SETTINGS</strong>
                            <small>CONFIGURATION</small>
                        </span>
                    </button>

                </div>

                <div class="menu-footer">

                    <span>
                        SECTOR87
                    </span>

                    <span>
                        © CYBER-SAS STUDIOS
                    </span>

                </div>

            </div>

            <div class="menu-panel">

                <div class="panel-box">

                    <div class="panel-label">
                        SECTOR87 SYSTEM
                    </div>

                    <h2 id="panelTitle">
                        SYSTEM
                    </h2>

                    <p id="panelDescription">
                        System information.
                    </p>

                    <button
                        class="menu-button panel-back"
                        data-action="back"
                    >
                        ← BACK
                    </button>

                </div>

            </div>
        `;

        document.body.appendChild(this.element);

        this.homeScreen =
            this.element.querySelector(".menu-content");

        this.panel =
            this.element.querySelector(".menu-panel");

        this.panelTitle =
            this.element.querySelector("#panelTitle");

        this.panelDescription =
            this.element.querySelector("#panelDescription");

        this.showHome();

    }

    bindEvents() {

        this.element.addEventListener(
            "click",
            (event) => {

                const button =
                    event.target.closest("[data-action]");

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

                    this.showPanel(
                        "SKIN MAKER",
                        "The Sector87 skin editor will allow you to create and customize your own voxel character."
                    );

                    return;
                }

                if (action === "settings") {

                    this.showPanel(
                        "SETTINGS",
                        "Graphics, controls, sensitivity, audio and accessibility settings will be available here."
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

        this.homeScreen.style.display = "flex";
        this.panel.style.display = "none";

    }

    showPanel(title, description) {

        this.panelTitle.textContent = title;
        this.panelDescription.textContent = description;

        this.homeScreen.style.display = "none";
        this.panel.style.display = "flex";

    }

}
