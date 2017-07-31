import {parse as parseXY} from 'xy-parser';

export default function (data, options = {}) {
    const {
        title = '',
        owner = '',
        origin = '',
        type = '',
        xUnit = '',
        yUnit = '',
        info = {}
    } = options;

    var lines = parseXY(data);
    var firstX, lastX, firstY, lastY;
    var points = [];

    for (var i = 0; i < lines.length; i++) {
        if (lines[i].length > 1) {
            var x = Number(lines[i][0]);
            var y = Number(lines[i][1]);
            if ((!firstX) || (firstX > x)) {
                firstX = x;
            }
            if ((!lastX) || (lastX < x)) {
                lastX = x;
            }
            if ((!firstY) || (firstY > y)) {
                firstY = y;
            }
            if ((!lastY) || (lastY < y)) {
                lastY = y;
            }
        }
        if (x > 0) {
            points.push(x + '\t' + y);
        }
    }

    var header = `##TITLE=${title}
##JCAMP-DX=4.24
##DATA TYPE=${type}
##ORIGIN=${origin}
##OWNER=${owner}
##XUNITS=${xUnit}
##YUNITS=${yUnit}
##FIRSTX=${firstX}
##LASTX=${lastX}
##FIRSTY=${firstY}
##LASTY=${lastY}\r\n`;

    for (const key of Object.keys(info)) {
        header += `##$${key}=${info[key]}\r\n`;
    }

    header += `##NPOINTS=${points.length}
##PEAK TABLE=(XY..XY)\r\n`;

    return header.replace(/[^\t\r\n\x20-\x7F]/g, '') + points.join('\r\n') + '\r\n##END';
}
