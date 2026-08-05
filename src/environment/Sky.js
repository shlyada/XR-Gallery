import * as THREE from "three";

export class Sky {

    constructor(scene) {

        this.scene = scene;

        this.group = new THREE.Group();

        this.createSky();
        this.createClouds();

        this.scene.add(
            this.group
        );

    }


    createSky() {

        const geometry =
            new THREE.SphereGeometry(
                120,
                64,
                64
            );


        const material =
            new THREE.ShaderMaterial({

                side: THREE.BackSide,

                uniforms: {

                    topColor: {

                        value: new THREE.Color(
                            0x87ceeb
                        )

                    },

                    bottomColor: {

                        value: new THREE.Color(
                            0xfaf3e0
                        )

                    },

                    offset: {

                        value: 20

                    },

                    exponent: {

                        value: 0.6

                    }

                },


                vertexShader: `

                    varying vec3 vWorldPosition;


                    void main(){

                        vec4 worldPosition =
                            modelMatrix *
                            vec4(
                                position,
                                1.0
                            );


                        vWorldPosition =
                            worldPosition.xyz;


                        gl_Position =
                            projectionMatrix *
                            modelViewMatrix *
                            vec4(
                                position,
                                1.0
                            );

                    }

                `,


                fragmentShader: `

                    uniform vec3 topColor;
                    uniform vec3 bottomColor;

                    uniform float offset;
                    uniform float exponent;


                    varying vec3 vWorldPosition;


                    void main(){

                        float height =
                            normalize(
                                vWorldPosition + offset
                            ).y;


                        float mixValue =
                            pow(
                                max(
                                    height,
                                    0.0
                                ),
                                exponent
                            );


                        gl_FragColor =
                            vec4(

                                mix(
                                    bottomColor,
                                    topColor,
                                    mixValue
                                ),

                                1.0

                            );

                    }

                `

            });


        const sky =
            new THREE.Mesh(
                geometry,
                material
            );


        this.group.add(
            sky
        );

    }


    createClouds() {


        const cloudMaterial =
            new THREE.MeshStandardMaterial({

                color: 0xffffff,

                transparent: true,

                opacity: 0.85,

                roughness: 1

            });



        const cloudPositions = [

            [-18, 18, -30],
            [10, 22, -35],
            [25, 16, -25],
            [-30, 25, -50],
            [0, 30, -60]

        ];


        cloudPositions.forEach(position => {


            const cloud =
                new THREE.Group();



            for(let i = 0; i < 8; i++) {


                const puff =
                    new THREE.Mesh(

                        new THREE.SphereGeometry(

                            2 +
                            Math.random() * 1.5,

                            32,

                            32

                        ),

                        cloudMaterial

                    );


                puff.position.set(

                    (Math.random() - 0.5) * 8,

                    (Math.random() - 0.5) * 2,

                    (Math.random() - 0.5) * 4

                );


                puff.scale.y =
                    0.6;



                cloud.add(
                    puff
                );


            }


            cloud.position.set(

                position[0],
                position[1],
                position[2]

            );


            cloud.scale.setScalar(

                1 +
                Math.random() * 0.5

            );


            this.group.add(
                cloud
            );


        });


    }


    update(elapsedTime){


        // Slow cloud movement

        this.group.children.forEach(
            object => {


                if(
                    object.children.length > 0
                ){

                    object.position.x +=
                        0.002;


                }


            }
        );


    }


}