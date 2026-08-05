import * as THREE from "three";

export class Fireflies {

    constructor() {

        this.group = new THREE.Group();

        this.fireflies = [];

        this.createGlowTexture();
        this.createParticles();

    }


    createGlowTexture() {

        const canvas =
            document.createElement("canvas");

        canvas.width = 64;
        canvas.height = 64;


        const context =
            canvas.getContext("2d");


        const gradient =
            context.createRadialGradient(
                32,
                32,
                0,
                32,
                32,
                32
            );


        gradient.addColorStop(
            0,
            "rgba(255,255,180,1)"
        );


        gradient.addColorStop(
            0.2,
            "rgba(255,220,80,0.8)"
        );


        gradient.addColorStop(
            0.5,
            "rgba(255,180,30,0.25)"
        );


        gradient.addColorStop(
            1,
            "rgba(255,150,0,0)"
        );


        context.fillStyle =
            gradient;


        context.fillRect(
            0,
            0,
            64,
            64
        );


        this.texture =
            new THREE.CanvasTexture(
                canvas
            );

    }



    createParticles() {

        const count = 80;


        const geometry =
            new THREE.BufferGeometry();


        const positions =
            [];


        for(let i = 0; i < count; i++) {


            const x =
                (Math.random() - 0.5) * 8;


            const y =
                1.5 +
                Math.random() * 3;


            const z =
                (Math.random() - 0.5) * 8;


            positions.push(
                x,
                y,
                z
            );


            this.fireflies.push({

                baseX:x,
                baseY:y,
                baseZ:z,

                speed:
                    0.5 +
                    Math.random(),

                offset:
                    Math.random() *
                    Math.PI *
                    2,

                radius:
                    0.2 +
                    Math.random() * 0.5

            });

        }


        geometry.setAttribute(

            "position",

            new THREE.Float32BufferAttribute(
                positions,
                3
            )

        );


        const material =
            new THREE.PointsMaterial({

                size:0.35,

                map:this.texture,

                transparent:true,

                depthWrite:false,

                blending:
                    THREE.AdditiveBlending,

                color:
                    0xffd84a

            });


        this.points =
            new THREE.Points(
                geometry,
                material
            );


        this.group.add(
            this.points
        );

    }



    update(time) {

        const positions =
            this.points.geometry.attributes.position;


        for(
            let i = 0;
            i < this.fireflies.length;
            i++
        ) {


            const firefly =
                this.fireflies[i];


            positions.setXYZ(

                i,

                firefly.baseX +
                Math.sin(
                    time *
                    firefly.speed +
                    firefly.offset
                )
                *
                firefly.radius,


                firefly.baseY +
                Math.sin(
                    time * 1.5 +
                    firefly.offset
                )
                *
                0.15,


                firefly.baseZ +
                Math.cos(
                    time *
                    firefly.speed
                )
                *
                firefly.radius

            );

        }


        positions.needsUpdate = true;


        // Soft brightness pulsing
        this.points.material.opacity =
            0.7 +
            Math.sin(time * 3) * 0.25;

    }

}