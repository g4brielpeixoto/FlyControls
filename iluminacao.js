import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'; //falar da gambiarra aqui
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper.js';

let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;
let aspect_ratio = SCREEN_WIDTH / SCREEN_HEIGHT;

let camera_perspective, camera_ortho, active_camera, scene, renderer, stats, controls;
let cube_wooden, sphere, torusKnot, sphereNormal, cubeNormal, torusKnotNormal, spotLight, spotLightHelper;
let spotLightMovementRight = true;

const params = {
    orthographicCamera: false,
    sphereControls: {
        showWireframe: false,
        opacity: 1.0,
        showNormal: false,
    },
    boxControls: {
        showNormal: false,
    },
    knotControls: {
        showWireframe: false,
        showNormal: false,
    }
};

function init(){
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x333333);
    camera_perspective = new THREE.PerspectiveCamera(45, aspect_ratio, 0.1, 1000);
    camera_ortho = new THREE.OrthographicCamera(-5, 5, 5, -5, 0.1, 1000);	/* left right top bottom near far */

    active_camera = camera_perspective;
    active_camera.position.set(1, 0.5, 10);

    let axesHelper = new THREE.AxesHelper(10);
    scene.add(axesHelper);

    function createWoodenBox(){
        const geometry = new THREE.BoxGeometry();
        const texture = new THREE.TextureLoader().load('textures/crate.gif');
        const materialBasic = new THREE.MeshBasicMaterial({ map: texture });

        cube_wooden = new THREE.Mesh(geometry, materialBasic);

        cube_wooden.position.y = 2;
        scene.add(cube_wooden);

        cubeNormal = new VertexNormalsHelper(cube_wooden, 1, 0xffff00, 1); //https://threejs.org/docs/#examples/en/helpers/VertexNormalsHelper
        scene.add(cubeNormal);
    }
    function createYellowSphere(){
        const geometry = new THREE.SphereGeometry(1, 20, 20);
        const materialBasic = new THREE.MeshBasicMaterial(
                {color: 0x00ffff, wireframe: false, transparent: true, opacity: 1.0}
        );
        const materialNormal = new THREE.MeshNormalMaterial(
                {wireframe: false, transparent: true, opacity: 1.0}
        );

        sphere = new THREE.Mesh(geometry, materialNormal);
        scene.add(sphere);

        sphere.position.x = 1;
        sphere.position.y = 2;
        sphere.position.z = 2;

        sphereNormal = new VertexNormalsHelper(sphere, 0.1, 0xffff00, 1); //https://threejs.org/docs/#examples/en/helpers/VertexNormalsHelper
        scene.add(sphereNormal);
    }
    function createPlane(){
        const geometry = new THREE.PlaneGeometry(100, 100, 50, 50);
        const material = new THREE.MeshBasicMaterial(
            {color: 0xa6f995, wireframe: true, side: THREE.DoubleSide}
            //https://threejs.org/docs/#api/en/materials/Material.side:
            //THREE.DoubleSide renderiza dos dois lados
        );
        const plane = new THREE.Mesh(geometry, material);

        plane.position.x = 0;
        plane.position.y = 0.5;
        plane.position.z = 0;
        plane.rotation.x = Math.PI/2; //90 graus em radianos

        scene.add(plane);
    }

    function createTorusKnot(){
        const torusKnotGeometry = new THREE.TorusKnotGeometry();
        const materialLambert = new THREE.MeshLambertMaterial()

        torusKnot = new THREE.Mesh(torusKnotGeometry, materialLambert);

        torusKnot.position.x = 2;
        torusKnot.position.y = 6;
        torusKnot.position.z = 2;

        scene.add(torusKnot);

        torusKnotNormal = new VertexNormalsHelper(torusKnot, 0.1, 0xffff00, 1); //https://threejs.org/docs/#examples/en/helpers/VertexNormalsHelper
        scene.add(torusKnotNormal);
    }
    createWoodenBox();
    createYellowSphere();
    createPlane();
    createTorusKnot();

    function addLight(){
        spotLight = new THREE.SpotLight(0xffffff);
        spotLight.position.set(0, 20, 0);
        spotLight.castShadow = true;
        scene.add(spotLight);

        spotLightHelper = new THREE.SpotLightHelper(spotLight);
        scene.add(spotLightHelper);
    }
    addLight();

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    document.body.appendChild(renderer.domElement);

    stats = new Stats();
    document.body.appendChild(stats.dom);

    const gui = new GUI();
    function createGUI(){
        gui.add(params, 'orthographicCamera').name('usar ortho').onChange(function (value){
            controls.dispose();
            createControls(value ? camera_ortho : camera_perspective);
        });
        let sphereControls = gui.addFolder('Sphere');
        sphereControls.add(params.sphereControls, 'opacity', 0, 1.0);
        sphereControls.add(params.sphereControls, 'showWireframe');
        sphereControls.add(params.sphereControls, 'showNormal');
        sphereControls.open();

        let boxControls = gui.addFolder('Box');
        boxControls.add(params.boxControls, 'showNormal');
        boxControls.open();

        let knotControls = gui.addFolder('Torus Knot');
        knotControls.add(params.knotControls, 'showNormal');
        knotControls.add(params.knotControls, 'showWireframe');
        knotControls.open();
    }
    createGUI();

    createControls(camera_perspective);
    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    SCREEN_WIDTH = window.innerWidth;
    SCREEN_HEIGHT = window.innerHeight;
    aspect_ratio = SCREEN_WIDTH / SCREEN_HEIGHT;

    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

    active_camera.aspect = aspect_ratio;
    active_camera.updateProjectionMatrix();
}

function createControls(camera){
    active_camera = camera;
    active_camera.position.set(1, 0.5, 10);

    controls = new TrackballControls(active_camera, renderer.domElement);

    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;

    controls.keys = [ 'KeyA', 'KeyS', 'KeyD' ];
}

const animate = function () {
    requestAnimationFrame(animate);

    cube_wooden.rotation.x += 0.01;
    sphere.rotation.x += 0.01;

    if (spotLightMovementRight == true) {
        spotLight.position.x += 1;
    }else{
        spotLight.position.x -= 1;
    }

    if (spotLight.position.x > 20){
        spotLightMovementRight = false;
    }else if (spotLight.position.x < -20){
        spotLightMovementRight = true;
    }

    //console.log(sphere.material);

    sphere.material.opacity = params.sphereControls.opacity;
    torusKnot.material.wireframe = params.knotControls.showWireframe;
    sphere.material.wireframe = params.sphereControls.showWireframe;
    sphereNormal.visible = params.sphereControls.showNormal;
    cubeNormal.visible = params.boxControls.showNormal;
    torusKnotNormal.visible = params.knotControls.showNormal;

    spotLightHelper.update();
    sphereNormal.update();
    cubeNormal.update();
    controls.update();
    stats.update();
    torusKnotNormal.update();

    renderer.render(scene, active_camera);
};

init();
animate();