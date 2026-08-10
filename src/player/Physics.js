import * as THREE from "three";

export default class Physics {

    constructor(camera, state, colliders = []) {

        this.camera = camera;
        this.state = state;

        this.colliders = colliders;

        this.playerBox = new THREE.Box3();
        this.testBox = new THREE.Box3();

        this.min = new THREE.Vector3();
        this.max = new THREE.Vector3();

    }

    update(delta) {

        delta = Math.min(delta, 0.05);

        this.updateStance(delta);
        this.handleJump();
        this.moveHorizontally(delta);
        this.moveVertically(delta);

    }

    updateStance(delta) {

        let targetHeight = this.state.standingHeight;

        if (this.state.isSliding) {

            targetHeight = this.state.slideHeight;

        } else if (this.state.isCrouching) {

            targetHeight = this.state.crouchHeight;

        }

        // Evita levantarse dentro de una caja o techo
        if (
            targetHeight > this.state.currentHeight &&
            !this.canOccupyHeight(targetHeight)
        ) {

            targetHeight = this.state.currentHeight;

        }

        const smoothing = 1 - Math.exp(-14 * delta);

        this.state.currentHeight +=
            (targetHeight - this.state.currentHeight) *
            smoothing;

    }

    handleJump() {

        if (
            this.state.jumpRequested &&
            this.state.isGrounded
        ) {

            this.state.verticalVelocity =
                this.state.jumpForce;

            this.state.isGrounded = false;
            this.state.isJumping = true;

            // Permite saltar al salir del slide
            this.state.isSliding = false;

        }

        this.state.jumpRequested = false;

    }

    moveHorizontally(delta) {

        // Movimiento separado por ejes
        // para evitar atravesar esquinas fácilmente
        this.moveOnAxis(
            "x",
            this.state.velocity.x * delta
        );

        this.moveOnAxis(
            "z",
            this.state.velocity.z * delta
        );

    }

    moveOnAxis(axis, amount) {

        if (amount === 0) {

            return;

        }

        const nextX =
            axis === "x"
                ? this.camera.position.x + amount
                : this.camera.position.x;

        const nextZ =
            axis === "z"
                ? this.camera.position.z + amount
                : this.camera.position.z;

        this.setPlayerBox(
            nextX,
            nextZ,
            this.state.feetY,
            this.state.currentHeight,
            this.playerBox
        );

        if (this.intersectsCollider(this.playerBox)) {

            this.state.velocity[axis] = 0;
            return;

        }

        this.camera.position[axis] += amount;

    }

    moveVertically(delta) {

        // Comprobar si seguimos encima del suelo o una caja
        if (this.state.isGrounded) {

            const supportHeight = this.getSupportHeight(
                this.camera.position.x,
                this.camera.position.z,
                this.state.feetY
            );

            if (supportHeight === null) {

                this.state.isGrounded = false;

            } else {

                this.state.feetY = supportHeight;
                this.state.verticalVelocity = 0;

            }

        }

        if (this.state.isGrounded) {

            return;

        }

        const currentFeetY = this.state.feetY;

        this.state.verticalVelocity -=
            this.state.gravity * delta;

        let nextFeetY =
            currentFeetY +
            this.state.verticalVelocity * delta;

        // Caída
        if (this.state.verticalVelocity <= 0) {

            const landingHeight = this.getLandingHeight(
                currentFeetY,
                nextFeetY
            );

            if (landingHeight !== null) {

                this.state.feetY = landingHeight;
                this.state.verticalVelocity = 0;

                this.state.isGrounded = true;
                this.state.isJumping = false;

                return;

            }

        } else {

            // Golpe con techo
            const ceilingHeight = this.getCeilingHeight(
                currentFeetY,
                nextFeetY
            );

            if (ceilingHeight !== null) {

                nextFeetY =
                    ceilingHeight -
                    this.state.currentHeight -
                    0.01;

                this.state.verticalVelocity = 0;

            }

        }

        this.state.feetY = nextFeetY;

    }

    getSupportHeight(x, z, feetY) {

        let support = null;

        const tolerance = 0.2;

        // Suelo principal
        if (
            feetY >=
            this.state.floorHeight - tolerance
        ) {

            support = this.state.floorHeight;

        }

        // Parte superior de cajas
        for (const collider of this.colliders) {

            if (
                !this.overlapsHorizontally(
                    collider,
                    x,
                    z
                )
            ) {

                continue;

            }

            const top = collider.max.y;

            if (
                top <= feetY + tolerance &&
                (support === null || top > support)
            ) {

                support = top;

            }

        }

        if (
            support === null ||
            Math.abs(feetY - support) > tolerance
        ) {

            return null;

        }

        return support;

    }

    getLandingHeight(currentFeetY, nextFeetY) {

        let landing = null;

        // Aterrizar en el suelo
        if (
            currentFeetY >= this.state.floorHeight &&
            nextFeetY <= this.state.floorHeight
        ) {

            landing = this.state.floorHeight;

        }

        // Aterrizar encima de cajas
        for (const collider of this.colliders) {

            if (
                !this.overlapsHorizontally(
                    collider,
                    this.camera.position.x,
                    this.camera.position.z
                )
            ) {

                continue;

            }

            const top = collider.max.y;

            if (
                currentFeetY >= top - 0.02 &&
                nextFeetY <= top &&
                (landing === null || top > landing)
            ) {

                landing = top;

            }

        }

        return landing;

    }

    getCeilingHeight(currentFeetY, nextFeetY) {

        const currentHead =
            currentFeetY + this.state.currentHeight;

        const nextHead =
            nextFeetY + this.state.currentHeight;

        let ceiling = null;

        for (const collider of this.colliders) {

            if (
                !this.overlapsHorizontally(
                    collider,
                    this.camera.position.x,
                    this.camera.position.z
                )
            ) {

                continue;

            }

            const bottom = collider.min.y;

            if (
                currentHead <= bottom &&
                nextHead >= bottom &&
                (ceiling === null || bottom < ceiling)
            ) {

                ceiling = bottom;

            }

        }

        return ceiling;

    }

    canOccupyHeight(height) {

        this.setPlayerBox(
            this.camera.position.x,
            this.camera.position.z,
            this.state.feetY,
            height,
            this.testBox
        );

        return !this.intersectsCollider(this.testBox);

    }

    setPlayerBox(x, z, feetY, height, box) {

        const radius = this.state.playerRadius;

        this.min.set(
            x - radius,
            feetY + 0.03,
            z - radius
        );

        this.max.set(
            x + radius,
            feetY + height,
            z + radius
        );

        box.set(this.min, this.max);

    }

    intersectsCollider(box) {

        for (const collider of this.colliders) {

            if (box.intersectsBox(collider)) {

                return true;

            }

        }

        return false;

    }

    overlapsHorizontally(collider, x, z) {

        const radius = this.state.playerRadius;

        return (
            x + radius > collider.min.x &&
            x - radius < collider.max.x &&
            z + radius > collider.min.z &&
            z - radius < collider.max.z
        );

    }

}