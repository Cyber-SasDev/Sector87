import * as THREE from "three";

export default class PlayerRoot {

    constructor(scene) {

        this.object = new THREE.Object3D();

        this.object.position.set(0, 2, 5);

        scene.add(this.object);

    }

    get position() {

        return this.object.position;

    }

    get rotation() {

        return this.object.rotation;

    }

}