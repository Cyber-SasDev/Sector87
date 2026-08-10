import Renderer from "./Renderer";
import SceneManager from "./Scene";
import CameraManager from "./Camera";
import Clock from "./Clock";

import HUD from "../ui/HUD";

import Player from "../player/Player";
import World from "../world/world";

import MapMaker from "../editor/MapMaker";
import EditorCamera from "../editor/EditorCamera";

import MainMenu from "../menu/MainMenu";

export default class Game {

    constructor() {

        // Motor
        this.renderer =
            new Renderer();

        this.sceneManager =
            new SceneManager();

        this.cameraManager =
            new CameraManager();

        this.clock =
            new Clock();

        // Mundo
        this.world =
            new World(
                this.sceneManager.scene
            );

        // Jugador
        this.player =
            new Player(
                this.sceneManager.scene,
                this.cameraManager.camera,
                this.world.colliders
            );

        // HUD
        this.hud =
            new HUD(
                this.player
            );

        // Cámara libre del editor
        this.editorCamera =
            new EditorCamera(
                this.cameraManager.camera
            );

        // Map Maker
        this.mapMaker =
            new MapMaker(
                this.sceneManager.scene,
                this.cameraManager.camera,
                this.world.colliders,
                this.player
            );

        // Estado general
        this.mode = "menu";

        // Menú principal
        this.mainMenu =
            new MainMenu({

                onPlay: () => {

                    this.startGame();

                },

                onMapMaker: () => {

                    this.startMapMaker();

                }

            });

        // Empezar dentro del menú
        this.player.controls.setEnabled(
            false
        );

        this.hud.setVisible(
            false
        );

        window.addEventListener(
            "resize",
            () => {

                this.renderer.resize(
                    this.cameraManager.camera
                );

            }
        );

        // Escape vuelve al menú
        document.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.code === "Escape" &&
                    this.mode !== "menu" &&
                    document.pointerLockElement === null
                ) {

                    this.openMenu();

                }

            }
        );

        this.animate();

    }

    startGame() {

        this.mode = "game";

        if (this.mapMaker.enabled) {

            this.mapMaker.toggle();

        }

        this.editorCamera.enabled =
            false;

        this.player.controls.setEnabled(
            true
        );

        this.hud.setVisible(
            true
        );

        this.mainMenu.hide();

    }

    startMapMaker() {

        this.mode = "game";

        this.mainMenu.hide();

        this.hud.setVisible(
            true
        );

        this.player.controls.setEnabled(
            false
        );

        if (!this.mapMaker.enabled) {

            this.mapMaker.toggle();

        }

        this.editorCamera.enabled =
            true;

    }

    openMenu() {

        this.mode = "menu";

        if (this.mapMaker.enabled) {

            this.mapMaker.toggle();

        }

        this.editorCamera.enabled =
            false;

        this.player.controls.setEnabled(
            false
        );

        this.hud.setVisible(
            false
        );

        this.mainMenu.show();

    }

    animate() {

        requestAnimationFrame(
            () => this.animate()
        );

        const delta =
            this.clock.getDelta();

        if (this.mode === "game") {

            if (this.mapMaker.enabled) {

                this.editorCamera.enabled =
                    true;

                this.player.controls.setEnabled(
                    false
                );

                this.editorCamera.update(
                    delta
                );

            } else {

                this.editorCamera.enabled =
                    false;

                this.player.controls.setEnabled(
                    true
                );

                this.player.update(
                    delta
                );

            }

            this.mapMaker.update(
                delta
            );

            this.hud.update();

        }

        this.renderer.render(
            this.sceneManager.scene,
            this.cameraManager.camera
        );

    }

}