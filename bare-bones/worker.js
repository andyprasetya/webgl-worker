
importScripts('../emshim.js');
importScripts('../webGLWorker.js');
importScripts('../proxyWorker.js');

setMain(function() {

        var canvas = document.getElementById("application-canvas");

        var gl = canvas.getContext('webgl');

        // create vertex shader
        var vertexSrc = [
            'attribute vec4 position;',
            'void main() {',
            '    /* already in normalized coordinates, so just pass through */',
            '    gl_Position = position;',
            '}'
        ].join('');
        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexSrc);
        gl.compileShader(vertexShader);

        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            console.log(
                'Vertex shader failed to compile. Log: ' +
                gl.getShaderInfoLog(vertexShader)
            );
        }

        // create fragment shader
        var fragmentSrc = [
            'precision mediump float;',
            'void main() {',
            '    gl_FragColor = vec4(0, 0, 0, 1);',
            '}'
        ].join('');
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentSrc);
        gl.compileShader(fragmentShader);

        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            console.log(
                'Fragment shader failed to compile. Log: ' +
                gl.getShaderInfoLog(fragmentShader)
            );
        }

        // link shaders to create our program
        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        gl.useProgram(program);

        var positionLoc = gl.getAttribLocation(program, 'position');
        gl.enableVertexAttribArray(positionLoc);

        function initArrayBuffer(triangleVertexCoords) {
            // put triangle coordinates into a WebGL ArrayBuffer and bind to
            // shader's 'position' attribute variable
            var rawData = new Float32Array(triangleVertexCoords);
            var polygonArrayBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, polygonArrayBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, rawData, gl.STATIC_DRAW);
            gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

            return triangleVertexCoords.length / 2;
        }

        var t = 0;

        // Setup update, render and tick functions
        var update = function (dt) {
            t += dt;
        };

        var render = function () {
            var triangleVertexCoords = [];//triangulate(contours);
            var numTriangles = 10;
            for (var i = 0; i < numTriangles * 3; i += 1) {
                triangleVertexCoords.push(Math.sin(t+i));
                triangleVertexCoords.push(Math.cos(t+i*i));
            }
            var numVertices = initArrayBuffer(triangleVertexCoords);
            gl.clearColor(1, 1, 1, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, numVertices);
        }

        var time = 0;
        var tick = function () {
            var now = (window.performance && window.performance.now) ? performance.now() : Date.now();
            var dt = (now - (time || now)) / 1000.0;
            time = now;

            update(dt);
            render();

            requestAnimationFrame(tick, canvas);
        }

        // start running
        tick();

});

