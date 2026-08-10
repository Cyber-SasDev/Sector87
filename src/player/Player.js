import Controls from "./Controls";
import Movement from "./Movement";
import Physics from "./Physics";
import CameraEffects from "./CameraEffects";
import State from "./State";

import WeaponManager from "../weapons/WeaponManager";

export default class Player {

    constructor(scene, camera, colliders = []) {

        this.camera = camera;

        this.state = new State();

        // Sistema estable (primera persona)
        this.state.feetY =
            camera.position.y -
            this.state.standingHeight;

        // Controles
        this.controls = new Controls(camera);

        // Movimiento
        this.movement = new Movement(
            camera,
            this.state
        );

        // Física
        this.physics = new Physics(
            camera,
            this.state,
            colliders
        );

        // Efectos de cámara
        this.cameraEffects = new CameraEffects(
            camera,
            this.state
        );

        // Sistema de armas
        this.weaponManager =
    new WeaponManager(
        camera,
        colliders,
        this.controls
    );

    }

    update(delta) {

        this.movement.update(delta);

        this.physics.update(delta);

        this.cameraEffects.update(delta);

        this.weaponManager.update(delta);

    }

}