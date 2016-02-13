export default function(options = {}) {
    const viewAngle = options.viewAngle || Math.PI;
    const detalization = options.detalization || 10;
    const radius = options.radius || 1;

    const angleStep = viewAngle / detalization;

    let sphere = getSphereSlice({
        minLatAngle: -angleStep / 2,
        maxLatAngle: angleStep / 2,
        viewAngle,
        detalization,
        radius
    });

    let latAngle = angleStep / 2;

    while (latAngle < viewAngle / 2 && latAngle < Math.PI / 2 - angleStep) {
        const slice1 = getSphereSlice({
            minLatAngle: latAngle,
            maxLatAngle: latAngle + angleStep,
            viewAngle,
            detalization,
            radius
        });

        const slice2 = getSphereSlice({
            minLatAngle: -latAngle - angleStep,
            maxLatAngle: -latAngle,
            viewAngle,
            detalization,
            radius
        });

        sphere = sphere.concat(slice1, slice2);

        latAngle += angleStep;
    }

    return sphere;
}

function getSphereSlice({minLatAngle, maxLatAngle, viewAngle, detalization, radius}) {
    const angleStep = viewAngle / detalization;

    let slice = [];

    let lngAngle = 0;

    while (lngAngle < viewAngle) {
        const quad = getQuad({
            minLngAngle: lngAngle,
            maxLngAngle: lngAngle + angleStep,
            minLatAngle,
            maxLatAngle,
            radius
        });

        slice = slice.concat(quad);

        lngAngle += angleStep;
    }

    return slice;
}

function getQuad({minLngAngle, maxLngAngle, minLatAngle, maxLatAngle, radius}) {
    const minRadius = radius * Math.sin(Math.PI / 2 - minLatAngle);
    const maxRadius = radius * Math.sin(Math.PI / 2 - maxLatAngle);

    const minZ = radius * Math.sin(minLatAngle);
    const maxZ = radius * Math.sin(maxLatAngle);

    const x0 = minRadius * Math.cos(minLngAngle);
    const x1 = minRadius * Math.cos(maxLngAngle);

    const x2 = maxRadius * Math.cos(minLngAngle);
    const x3 = maxRadius * Math.cos(maxLngAngle);

    const y0 = minRadius * Math.sin(minLngAngle);
    const y1 = minRadius * Math.sin(maxLngAngle);

    const y2 = maxRadius * Math.sin(minLngAngle);
    const y3 = maxRadius * Math.sin(maxLngAngle);

    const p0 = [x0, y0, minZ];
    const p1 = [x1, y1, minZ];
    const p2 = [x2, y2, maxZ];
    const p3 = [x3, y3, maxZ];

    return [].concat(p0, p1, p3, p0, p3, p2);
}
