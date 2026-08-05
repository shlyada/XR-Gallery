import * as THREE from "three";

export class Water {

    constructor() {

        this.group = new THREE.Group();

        this.clock = new THREE.Clock();

        this.createPond();
        this.createWaterfall();
        this.createMist();

    }


    createPond() {


        const geometry =
            new THREE.PlaneGeometry(
                5.5,
                5.5,
                128,
                128
            );


        const material =
            new THREE.ShaderMaterial({

                uniforms: {

                    time: {
                        value: 0
                    },

                    color: {
                        value: new THREE.Color(
                            0x1e90ff
                        )
                    }

                },


                vertexShader: `

                    uniform float time;

                    varying vec3 vPosition;


                    void main(){

                        vPosition = position;


                        vec3 pos = position;


                        float wave =
                            sin(pos.x * 3.0 + time * 2.0) * 0.08
                            +
                            cos(pos.y * 4.0 + time * 1.5) * 0.05
                            +
                            sin(
                                (pos.x + pos.y)
                                * 6.0
                                +
                                time
                            ) * 0.03;


                        pos.z += wave;


                        gl_Position =
                            projectionMatrix *
                            modelViewMatrix *
                            vec4(
                                pos,
                                1.0
                            );

                    }

                `,


                fragmentShader: `

                    uniform vec3 color;


                    varying vec3 vPosition;


                    void main(){


                        float depth =
                            vPosition.y * 0.15;


                        vec3 waterColor =
                            color
                            +
                            vec3(
                                depth,
                                depth,
                                depth
                            );


                        gl_FragColor =
                            vec4(
                                waterColor,
                                0.75
                            );

                    }

                `,


                transparent:true,

                side:
                    THREE.DoubleSide


            });



        const water =
            new THREE.Mesh(
                geometry,
                material
            );


        water.rotation.x =
            -Math.PI / 2;


        water.position.y =
            0.55;


        this.waterMaterial =
            material;


        this.group.add(
            water
        );


    }



    createWaterfall(){


        const waterfallGroup =
            new THREE.Group();



        const particleGeometry =
            new THREE.BufferGeometry();



        const count =
            800;



        const positions =
            [];



        for(
            let i = 0;
            i < count;
            i++
        ){


            positions.push(

                (Math.random()-0.5)
                *0.7,

                Math.random()
                *3,

                0

            );


        }



        particleGeometry.setAttribute(

            "position",

            new THREE.Float32BufferAttribute(

                positions,

                3

            )

        );



        const waterfallMaterial =
            new THREE.PointsMaterial({

                color:
                    0xbfefff,


                size:
                    0.035,


                transparent:true,

                opacity:
                    0.8,


                blending:
                    THREE.AdditiveBlending

            });



        const waterfall =
            new THREE.Points(

                particleGeometry,

                waterfallMaterial

            );



        waterfall.position.set(

            0,

            -1.2,

            -3.3

        );



        waterfallGroup.add(
            waterfall
        );



        this.waterfall =
            waterfall;



        this.group.add(
            waterfallGroup
        );


    }



    createMist(){


        const geometry =
            new THREE.BufferGeometry();



        const positions =
            [];



        for(
            let i=0;
            i<250;
            i++
        ){


            positions.push(

                (Math.random()-0.5)
                *2,


                Math.random()
                *0.5,


                (Math.random()-0.5)
                *2

            );


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

                color:
                    0xffffff,

                size:
                    0.03,

                transparent:true,

                opacity:
                    0.35


            });



        const mist =
            new THREE.Points(

                geometry,

                material

            );



        mist.position.set(

            0,

            -4,

            -3.3

        );



        this.mist =
            mist;



        this.group.add(
            mist
        );


    }



    update(){


        const time =
            this.clock.getElapsedTime();



        if(this.waterMaterial){

            this.waterMaterial.uniforms.time.value =
                time;

        }



        if(this.waterfall){


            const positions =
                this.waterfall.geometry.attributes.position;



            for(
                let i=0;
                i<positions.count;
                i++
            ){


                let y =
                    positions.getY(i);



                y -=
                    0.03;



                if(y < 0){

                    y =
                        3;

                }



                positions.setY(
                    i,
                    y
                );


            }



            positions.needsUpdate =
                true;


        }


    }


}