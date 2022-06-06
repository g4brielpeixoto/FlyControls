import * as THREE from "three"
import Stats from "three/examples/jsm/libs/stats.module.js";
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'; //falar da gambiarra aqui

let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;
let aspect_ratio = SCREEN_WIDTH / SCREEN_HEIGHT;

let camera_perspective, active_camera, scene, renderer, stats, controls;
let floor, aux_texture;
let floor_texture_string = 'textures/checker.png';

const params = {
    minificationFilter: {
        Nearest: THREE.NearestFilter,
        NearestMipMapLinear: THREE.NearestMipMapLinearFilter,
        NearestMipMapNearest: THREE.NearestMipMapNearestFilter,
        LinearFilter: THREE.LinearFilter,
        LinearMipMapLinear: THREE.LinearMipMapLinearFilter,
        LinearMipMapNearest: THREE.LinearMipMapNearestFilter,
    }
};

function init(){
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x333333);
    camera_perspective = new THREE.PerspectiveCamera(45, aspect_ratio, 0.1, 10000);
    
    active_camera = camera_perspective;
    active_camera.position.set(0, 300, 300);
    active_camera.lookAt(0, 0, 0);

    let axesHelper = new THREE.AxesHelper(10);
    scene.add(axesHelper);

    function createPlane(){
        const geometry = new THREE.PlaneGeometry(1000, 1000, 2, 2);
        const texture = new THREE.TextureLoader().load(floor_texture_string);
        texture.needsUpdate = true;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(20, 20);
        const material = new THREE.MeshBasicMaterial(
            {map: texture, side: THREE.DoubleSide}
        );
        material.needsUpdate = true;
        
        aux_texture = texture.clone();

        floor = new THREE.Mesh(geometry, material);
        floor.position.x = 0;
        floor.position.y = -1;
        floor.position.z = 0;
        floor.rotation.x = Math.PI/2; //90 graus em radianos
        scene.add(floor);
    }

    createPlane();
    console.log(floor.geometry.attributes);

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    document.body.appendChild(renderer.domElement);

    stats = new Stats();
    document.body.appendChild(stats.dom);

    const gui = new GUI();
    let t;
    function createGUI(){
        let textureControls = gui.addFolder('Texture');
        textureControls.add(aux_texture, 'minFilter', params.minificationFilter)
            .onChange(() => updateMinFilter());

        textureControls.open();
    }
    createGUI();

    createControls(camera_perspective);
    window.addEventListener('resize', onWindowResize);
}

function updateMinFilter(){
    floor.material.map = new THREE.TextureLoader().load('textures/checker.png');
    floor.material.map.minFilter = Number(aux_texture.minFilter);
    floor.material.map.needsUpdate = true;
    floor.material.map.wrapS = THREE.RepeatWrapping;
    floor.material.map.wrapT = THREE.RepeatWrapping;
    floor.material.map.repeat.set(20, 20);

    console.log(floor.material.map.minFilter);
    console.log(Number(aux_texture.minFilter));
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
    active_camera.position.set(0, 300, 300);
    active_camera.lookAt(0, 0, 0);

    controls = new TrackballControls(active_camera, renderer.domElement);

    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;

    controls.keys = [ 'KeyA', 'KeyS', 'KeyD' ];
}

const animate = function () {
    requestAnimationFrame(animate);

    //para cada textura de cada plano
    //for (let index = 0; index < floor_list.length; ++index) {
    //	floor_list[index].material.map.rotation += 0.000001;
    //}
    //console.log(floor.material.map.generateMipmaps);

    //material_floor.map = texture_floor;
    //plane_test.material.map.rotation += 0.01;

    controls.update();
    stats.update();

    renderer.render(scene, active_camera);
};

init();
animate();