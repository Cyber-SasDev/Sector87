import * as THREE from "three";

export default class Movement {

    constructor(camera, state) {

        this.camera = camera;
        this.state = state;

        this.keys = {};

        // Vectores reutilizables
        this.forward = new THREE.Vector3();
        this.right = new THREE.Vector3();
        this.up = new THREE.Vector3(0, 1, 0);

        this.targetVelocity = new THREE.Vector3();

        document.addEventListener("keydown", (event) => {

            this.keys[event.code] = true;

            // Salto
            if (event.code === "Space") {

                event.preventDefault();

                if (!event.repeat) {
                    this.state.jumpRequested = true;
                }

            }

            // Slide
            if (event.code === "KeyR" && !event.repeat) {

                this.state.slideRequested = true;

            }

        });

        document.addEventListener("keyup", (event) => {

            this.keys[event.code] = false;

        });

    }

    update(delta) {

        // Evita movimientos enormes al volver a la pestaña
        delta = Math.min(delta, 0.05);

        // Cooldown del slide
        this.state.slideCooldownTimer = Math.max(
            0,
            this.state.slideCooldownTimer - delta
        );

        this.getDirections();
        this.readMovementInput();

        // Agacharse con Ctrl
        this.state.isCrouching = Boolean(
            (this.keys.ControlLeft || this.keys.ControlRight) &&
            !this.state.isSliding
        );

        const movingForward = Boolean(this.keys.KeyW);
        const hasInput = this.state.direction.lengthSq() > 0;

        // Sprint
        this.state.isRunning = Boolean(
            this.keys.ShiftLeft &&
            movingForward &&
            hasInput &&
            this.state.isGrounded &&
            !this.state.isCrouching &&
            !this.state.isSliding
        );

        // Intentar iniciar slide
        if (this.state.slideRequested) {

            this.tryStartSlide();

            this.state.slideRequested = false;

        }

        // Movimiento durante el slide
        if (this.state.isSliding) {

            this.updateSlide(delta);
            return;

        }

        // Movimiento normal
        this.updateNormalMovement(delta, hasInput);

    }

    getDirections() {

        this.camera.getWorldDirection(this.forward);

        this.forward.y = 0;

        if (this.forward.lengthSq() === 0) {

            this.forward.set(0, 0, -1);

        }

        this.forward.normalize();

        this.right
            .crossVectors(this.forward, this.up)
            .normalize();

    }

    readMovementInput() {

        this.state.direction.set(0, 0, 0);

        if (this.keys.KeyW) {

            this.state.direction.add(this.forward);

        }

        if (this.keys.KeyS) {

            this.state.direction.sub(this.forward);

        }

        if (this.keys.KeyA) {

            this.state.direction.sub(this.right);

        }

        if (this.keys.KeyD) {

            this.state.direction.add(this.right);

        }

        // Evita correr más rápido en diagonal
        if (this.state.direction.lengthSq() > 0) {

            this.state.direction.normalize();

        }

    }

    updateNormalMovement(delta, hasInput) {

        let targetSpeed = this.state.walkSpeed;

        if (this.state.isRunning) {

            targetSpeed = this.state.runSpeed;

        } else if (this.state.isCrouching) {

            targetSpeed = this.state.crouchSpeed;

        }

        if (hasInput) {

            this.targetVelocity
                .copy(this.state.direction)
                .multiplyScalar(targetSpeed);

        } else if (!this.state.isGrounded) {

            // Conserva impulso en el aire
            this.targetVelocity.set(
                this.state.velocity.x,
                0,
                this.state.velocity.z
            );

        } else {

            this.targetVelocity.set(0, 0, 0);

        }

        let acceleration;

        if (!this.state.isGrounded) {

            acceleration = this.state.airAcceleration;

        } else if (hasInput) {

            acceleration = this.state.groundAcceleration;

        } else {

            acceleration = this.state.groundDeceleration;

        }

        const maxChange = acceleration * delta;

        this.state.velocity.x = this.moveTowards(
            this.state.velocity.x,
            this.targetVelocity.x,
            maxChange
        );

        this.state.velocity.z = this.moveTowards(
            this.state.velocity.z,
            this.targetVelocity.z,
            maxChange
        );

    }

    tryStartSlide() {

        const horizontalSpeed = Math.hypot(
            this.state.velocity.x,
            this.state.velocity.z
        );

        const canSlide =
            this.state.isGrounded &&
            this.state.isRunning &&
            this.state.slideCooldownTimer <= 0 &&
            horizontalSpeed > this.state.walkSpeed * 0.75;

        if (!canSlide) {

            return;

        }

        this.state.isSliding = true;
        this.state.isRunning = false;
        this.state.isCrouching = false;

        this.state.slideTimer = this.state.slideDuration;
        this.state.slideCooldownTimer = this.state.slideCooldown;

        // Conserva la dirección en la que ibas
        this.state.slideDirection.set(
            this.state.velocity.x,
            0,
            this.state.velocity.z
        );

        if (this.state.slideDirection.lengthSq() < 0.01) {

            this.state.slideDirection.copy(this.forward);

        }

        this.state.slideDirection.normalize();

        const startSpeed = Math.max(
            horizontalSpeed,
            this.state.slideSpeed
        );

        this.state.velocity.x =
            this.state.slideDirection.x * startSpeed;

        this.state.velocity.z =
            this.state.slideDirection.z * startSpeed;

    }

    updateSlide(delta) {

        this.state.slideTimer -= delta;

        let speed = Math.hypot(
            this.state.velocity.x,
            this.state.velocity.z
        );

        // El slide pierde velocidad poco a poco
        speed = Math.max(
            0,
            speed - this.state.slideFriction * delta
        );

        this.state.velocity.x =
            this.state.slideDirection.x * speed;

        this.state.velocity.z =
            this.state.slideDirection.z * speed;

        if (
            this.state.slideTimer <= 0 ||
            speed < this.state.crouchSpeed ||
            !this.state.isGrounded
        ) {

            this.state.isSliding = false;

        }

    }

    moveTowards(current, target, maxChange) {

        if (Math.abs(target - current) <= maxChange) {

            return target;

        }

        return (
            current +
            Math.sign(target - current) * maxChange
        );

    }

}