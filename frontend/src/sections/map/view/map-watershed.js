
// Gets the point of intersection between two lines
function lineIntersectionPoint([x1, y1], [x2, y2], [x3, y3], [x4, y4]) {
    // https://stackoverflow.com/questions/13937782/calculating-the-point-of-intersection-of-two-lines
    const denom = (y4 - y3)*(x2 - x1) - (x4 - x3)*(y2 - y1);
    if (denom === 0) {
        return null;
    }
    const ua = ((x4 - x3)*(y1 - y3) - (y4 - y3)*(x1 - x3))/denom;
    const ub = ((x2 - x1)*(y1 - y3) - (y2 - y1)*(x1 - x3))/denom;
    return [
      x1 + ua * (x2 - x1),
      y1 + ua * (y2 - y1),
      1
    ];
  }
  
function scanLineIntersectEdges(y, xmin, xmax, points) {
    const intersections = [];
    for (let i = 0; i < points.length - 1; i += 1) {
        const [x1, y1] = points[i];
        const [x2, y2] = points[i + 1];
        if (y1 === y2) continue; // Skip horizontal lines
        if (y1 > y && y2 > y) continue;
        if (y1 < y && y2 < y) continue;
            
        // if [xmin, y] -> [xmax, y] intersects [x1, y1] -> [x2, y2]
        const pt = lineIntersectionPoint([xmin, y], [xmax, y], [x1, y1], [x2, y2]);
        if (!pt)
        continue;
        intersections.push(pt);
    }
    return intersections;
}

export function buildWatershedHeatmap(coords) {
    console.log("Building watershed heatmap")

    /*
    // Perimeter points
    if (coords[coords.length - 1][0] === coords[0][0] && coords[coords.length - 1][1] === coords[0][1])
      coords = coords.slice(0, -1)

    const newCoords = [];
    for (let i = 0; i < coords.length; i += 1) {
      const [lat, lon] = coords[i];
      const [lat1, lon1] = i === coords.length - 1 ? coords[0] : coords[i + 1];
      const [dlat, dlon] = [lat1 - lat, lon1 - lon];
      const delta = 0.0001;
      const steps = distance([lat, lon], [lat1, lon1]) / delta;
      for (let d = 1; d < steps - 1; d += 1) {
        const scale = (d / steps);
        newCoords.push([lat + dlat * scale, lon + dlon * scale]);
      }
    }
    
    const points = coords.concat(newCoords);
    */

    const points = [];

    // Scanline algorithm for polygon fill
    let ymin = Number.MAX_VALUE;
    let ymax = -Number.MAX_VALUE;
    let xmin = Number.MAX_VALUE;
    let xmax = -Number.MAX_VALUE;
    for (let i = 1; i < coords.length; i += 1) {
      const [lat, lon] = coords[i];
      ymin = Math.min(ymin, lon);
      ymax = Math.max(ymax, lon);
      xmin = Math.min(xmin, lat);
      xmax = Math.max(xmax, lat);
    }

    const delta = 0.0005;
    const stepsY = Math.ceil((ymax - ymin) / delta);
    for (let y = 0; y < stepsY; y += 1) {
      const pts = scanLineIntersectEdges(ymin + y * delta, xmin, xmax, coords).sort((a, b) => a[0] - b[0]);
      for (let i = 0; i < pts.length - 1; i += 1) {
        const p0 = pts[i];
        const p1 = pts[i + 1];
        if (i % 2 === 0) {
          const stepsX = Math.ceil((p1[0] - p0[0]) / delta);
          for (let x = 0; x < stepsX; x += 1) {
            points.push([p0[0] + x * delta, p0[1], 1]);
          }
        }
      }
    }

    console.log(points)

    return points.map(c => [c[1], c[0], 1]);
}
