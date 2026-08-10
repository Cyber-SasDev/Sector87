export default class CameraEffects {

    constructor(camera, state) {

        this.camera = camera;
        this.state = state;

    }

    update(delta) {

        this.updateHeight(delta);

        this.updateHeadBob(delta);

        this.updateFov(delta);

        this.updateRoll(delta);

    }

    updateHeight(delta) {

        let targetHeight = this.state.currentHeight;

        this.state.cameraHeight +=
            (targetHeight - this.state.cameraHeight)
            * delta * 12;

        this.camera.position.y =
            this.state.feetY +
            this.state.cameraHeight +
            this.state.headBob +
            this.state.landingOffset;

    }

    updateHeadBob(delta) {

        const moving =
            this.state.direction.lengthSq() > 0 &&
            this.state.isGrounded;

        if (moving) {

            const speed =
                this.state.isRunning
                    ? 16
                    : 10;

            this.state.headBob +=
                delta * speed;

            this.state.headBob =
                Math.sin(this.state.headBob) *
                this.state.headBobAmount;

        }
        else {

            this.state.headBob *= 0.9;

        }

    }

    updateFov(delta) {

        if (this.state.isSliding) {

            this.state.targetFov = 86;

        }
        else if (this.state.isRunning) {

            this.state.targetFov = 82;

        }
        else {

            this.state.targetFov = 75;

        }

        this.camera.fov +=
            (this.state.targetFov - this.camera.fov)
            * delta * 8;

        this.camera.updateProjectionMatrix();

    }

    updateRoll(delta) {

        let target = 0;

        if (this.state.isSliding)
            target = -0.08;

        this.state.currentRoll +=
            (target - this.state.currentRoll)
            * delta * 10;

        this.camera.rotation.z =
            this.state.currentRoll;

    }

}