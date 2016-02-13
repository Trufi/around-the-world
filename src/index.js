import sphere from './sphere';
import dgl from '2gl';
import dat from 'dat-gui';

const settings = {
    rotationMesh: true,
    cameraOffset: 900
};

const scene = new dgl.Scene();

const ambientLight = new dgl.AmbientLight([0.5, 0.5, 0.5]);
scene.addLight(ambientLight);

const directionalLight = new dgl.DirectionalLight([0.5, 0.5, 0.5]);
directionalLight.position[0] = 1;
scene.addLight(directionalLight);

const camera = new dgl.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100000);
camera.position[2] = settings.cameraOffset;
camera.updateProjectionMatrix();

const renderer = new dgl.Renderer({
    container: document.body
});
renderer.setSize(window.innerWidth, window.innerHeight);

function getRandomRGB() {
    return [Math.random(), Math.random(), Math.random()];
}

function getMesh({radius, viewAngle, detalization}) {
    const vertices = sphere({
        radius: radius || 200,
        viewAngle: viewAngle || Math.PI * 2,
        detalization: detalization || 20
    });

    const program = new dgl.ComplexMeshProgram();
    const color = getRandomRGB();

    const geometry = new dgl.Geometry();

    const vertexBuffer = new dgl.Buffer(new Float32Array(vertices), 3);

    let colors = [];

    for (let i = 0; i < vertices.length / 3; i++) {
        colors = colors.concat(color);
    }

    const colorBuffer = new dgl.Buffer(new Float32Array(colors), 3);
    const emissiveBuffer = new dgl.Buffer(new Float32Array(vertices.length), 3);

    geometry
            .setBuffer('position', vertexBuffer)
            .setBuffer('color', colorBuffer)
            .setBuffer('emissive', emissiveBuffer);

    geometry.computeNormals();

    return new dgl.Mesh(geometry, program);
}

const mesh = getMesh({});
scene.add(mesh);

const mesh2 = getMesh({radius: 210, viewAngle: Math.PI / 2, detalization: 20});
scene.add(mesh2);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function rotateMesh(dt) {
    if (!settings.rotationMesh) { return; }

    dgl.quat.rotateX(mesh.quaternion, mesh.quaternion, dt / 3000);
    dgl.quat.rotateY(mesh.quaternion, mesh.quaternion, dt / 500);

    mesh.updateLocalMatrix();
    mesh.updateWorldMatrix();

    dgl.quat.rotateX(mesh2.quaternion, mesh.quaternion, dt / 3000);
    dgl.quat.rotateY(mesh2.quaternion, mesh.quaternion, dt / 500);

    mesh2.updateLocalMatrix();
    mesh2.updateWorldMatrix();
}

let lastUpdateTime = Date.now();

function render() {
    requestAnimationFrame(render);

    const dt = Date.now() - lastUpdateTime;

    if (mesh) {
        rotateMesh(dt);
    }
    renderer.render(scene, camera);

    lastUpdateTime = Date.now();
}

render();

// dat gui settings
const gui = new dat.GUI();
gui.add(settings, 'rotationMesh');

const guiCameraOffset = gui.add(settings, 'cameraOffset', 0, 10000);
guiCameraOffset.onChange(function(value) {
    camera.position[2] = value;
});
