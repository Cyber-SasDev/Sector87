import * as THREE from "three";
import AK47 from "./AK47";

export default class Weapon {

    constructor(camera) {

        this.camera = camera;
 

        this.group = new THREE.Group();

        this.create();

        // Posición del arma en la cámara
        this.group.position.set(
    0,
    0,
    -2
);

        this.group.rotation.set(
            0,
            -0.15,
            0
        );

        this.camera.add(this.group);

console.log(this.group.parent);

    }

    create() {

        this.weapon = new AK47();

        this.group.add(
            this.weapon.group
        );

    }

    update(delta) {

        // Aquí luego pondremos:
        // - Weapon Sway
        // - Recoil
        // - Idle Animation
        // - ADS

    }

}