import * as THREE from "three";

export default class CameraPivot {

    constructor(playerRoot, camera) {

        this.pivot = new THREE.Object3D();

        this.pivot.position.set(0, 1.8, 0);

        playerRoot.object.add(this.pivot);

        this.pivot.add(camera);

        camera.position.set(0, 0, 0);

    }

}