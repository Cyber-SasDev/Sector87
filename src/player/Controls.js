export default class Controls {

    constructor(camera) {

        this.camera = camera;

        this.enabled = true;

        this.pitch = 0;
        this.yaw = 0;

        document.addEventListener(
            "click",
            (event) => {

                if (!this.enabled) return;

                if (
                    event.target.closest?.(
                        "#mainMenu"
                    )
                ) {

                    return;

                }

                document.body.requestPointerLock();

            }
        );

        document.addEventListener(
            "mousemove",
            (event) => {

                if (!this.enabled) return;

                if (
                    document.pointerLockElement !==
                    document.body
                ) {

                    return;

                }

                const sensitivity = 0.002;

                this.yaw -=
                    event.movementX *
                    sensitivity;

                this.pitch -=
                    event.movementY *
                    sensitivity;

                this.pitch = Math.max(
                    -Math.PI / 2,
                    Math.min(
                        Math.PI / 2,
                        this.pitch
                    )
                );

                this.camera.rotation.order =
                    "YXZ";

                this.camera.rotation.y =
                    this.yaw;

                this.camera.rotation.x =
                    this.pitch;

            }
        );

    }

    setEnabled(enabled) {

        this.enabled = enabled;

        if (!enabled) {

            document.exitPointerLock?.();

        }

    }

}