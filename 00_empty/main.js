/**
 * Created by Marc Streit on 01.04.2016.
 */

//the OpenGL context
var gl = null;
//our shader program
var shaderProgram = null;

var canvasWidth = 1500;
var canvasHeight = 800;
var aspectRatio = canvasWidth / canvasHeight;

//rendering context
var context;

//camera and projection settings
var animatedAngle = 0;
var fieldOfViewInRadians = convertDegreeToRadians(30);




var tankTransformationNodeA,cockpitTransformationNodeA,barrelTransformationNodeA;
var tankTransformationNodeB,cockpitTransformationNodeB,barrelTransformationNodeB;

var tankA_posX =0;
var tankA_posY =0;
var tankA_posZ =0;
var tankB_posX =-1;
var tankB_posY =0;
var tankB_posZ =-1;


//links to buffer stored on the GPU
var quadVertexBuffer, quadColorBuffer;
var cubeVertexBuffer, cubeColorBuffer, cubeIndexBuffer;

var quadVertices = new Float32Array([
    -1.0, -1.0,
    1.0, -1.0,
    -1.0, 1.0,
    -1.0, 1.0,
    1.0, -1.0,
    1.0, 1.0]);

var quadColors = new Float32Array([
    1, 0, 0, 1,
    0, 1, 0, 1,
    0, 0, 1, 1,
    0, 0, 1, 1,
    0, 1, 0, 1,
    0, 0, 0, 1]);

var s = 0.3; //size of cube
var cubeVertices = new Float32Array([
   -s,-s,-s, s,-s,-s, s, s,-s, -s, s,-s,
   -s,-s, s, s,-s, s, s, s, s, -s, s, s,
   -s,-s,-s, -s, s,-s, -s, s, s, -s,-s, s,
   s,-s,-s, s, s,-s, s, s, s, s,-s, s,
   -s,-s,-s, -s,-s, s, s,-s, s, s,-s,-s,
   -s, s,-s, -s, s, s, s, s, s, s, s,-s,
]);

var cubeColors = new Float32Array([
   0,1,1, 0,1,1, 0,1,1, 0,1,1,
   1,0,1, 1,0,1, 1,0,1, 1,0,1,
   1,0,0, 1,0,0, 1,0,0, 1,0,0,
   0,0,1, 0,0,1, 0,0,1, 0,0,1,
   1,1,0, 1,1,0, 1,1,0, 1,1,0,
   0,1,0, 0,1,0, 0,1,0, 0,1,0
]);

var cubeIndices =  new Float32Array([
   0,1,2, 0,2,3,
   4,5,6, 4,6,7,
   8,9,10, 8,10,11,
   12,13,14, 12,14,15,
   16,17,18, 16,18,19,
   20,21,22, 20,22,23
]);

//load the shader resources using a utility function
loadResources({
  vs: 'shader/simple.vs.glsl',
  fs: 'shader/simple.fs.glsl',
  //TASK 5-3
  staticcolorvs: 'shader/static_color.vs.glsl'
}).then(function (resources /*an object containing our keys with the loaded resources*/) {
  init(resources);

  //render one frame
  render();
});

/**
 * initializes OpenGL context, compile shader, and load buffers
 */
function init(resources) {

  //create a GL context
  gl = createContext(canvasWidth, canvasHeight);

  //in WebGL / OpenGL3 we have to create and use our own shaders for the programmable pipeline
  //create the shader program
  shaderProgram = createProgram(gl, resources.vs, resources.fs);

  //set buffers for quad
  initQuadBuffer();
  //set buffers for cube
  initCubeBuffer();

  //create scenegraph
  rootNode = new SceneGraphNode();

  //Task 3-1
  var quadTransformationMatrix = glm.rotateX(90);
  quadTransformationMatrix = mat4.multiply(mat4.create(), quadTransformationMatrix, glm.translate(0.0,-0.5,0));
  quadTransformationMatrix = mat4.multiply(mat4.create(), quadTransformationMatrix, glm.scale(0.5,0.5,1));


  createTankA(rootNode);
  createTankB(rootNode);
  //createRobot(rootNode);

}

function initQuadBuffer() {

  //create buffer for vertices
  quadVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadVertexBuffer);
  //copy data to GPU
  gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

  //same for the color
  quadColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, quadColors, gl.STATIC_DRAW);
}

function initCubeBuffer() {

  cubeVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);

  cubeColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, cubeColors, gl.STATIC_DRAW);

  cubeIndexBuffer = gl.createBuffer ();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);
}

function createTankA(rootNode){
  //transformation on the whole tank

  var tankTransformationMatrixA = mat4.multiply(mat4.create(), mat4.create(), glm.translate(tankA_posX,tankA_posY,tankA_posX));
  tankTransformationMatrixA = mat4.multiply(mat4.create(), tankTransformationMatrixA, glm.rotateY(90));

  tankTransformationNodeA = new TransformationSceneGraphNode(tankTransformationMatrixA);
  rootNode.append(tankTransformationNodeA);



  //transformations on the body only
  var bodyTransformationMatrixA = mat4.multiply(mat4.create(),mat4.create(),glm.translate(0,0,0));
  bodyTransformationMatrixA = mat4.multiply(mat4.create(), bodyTransformationMatrixA,glm.scale(1.7,0.5,1.1));
  var bodyTransformationNodeA = new TransformationSGNode(bodyTransformationMatrixA);
  tankTransformationNodeA.append(bodyTransformationNodeA);

  //adding the body to the transformation node
  cubeNode = new CubeRenderNode();
  bodyTransformationNodeA.append(cubeNode);





  //transformations on the cockpit
  var cockpitTransformationMatrixA = mat4.multiply(mat4.create(),mat4.create(),glm.rotateY(10));
  cockpitTransformationMatrixA = mat4.multiply(mat4.create(),cockpitTransformationMatrixA,glm.translate(0.3,0.2,0));
  cockpitTransformationMatrixA= mat4.multiply(mat4.create(), cockpitTransformationMatrixA,glm.scale(0.6,0.6,0.6));
  var cockpitTransformationNodeA = new TransformationSGNode(cockpitTransformationMatrixA);
  tankTransformationNodeA.append(cockpitTransformationNodeA);

  //adding the cockpit to the transformation node
  cubeNode = new CubeRenderNode();
  cockpitTransformationNodeA.append(cubeNode);

  //transformations on the barrel
  var barrelTransformationMatrixA = mat4.multiply(mat4.create(),mat4.create(),glm.rotateZ(0));
   barrelTransformationMatrixA = mat4.multiply(mat4.create(),barrelTransformationMatrixA,glm.translate(-0.6,0.2,0));
  barrelTransformationMatrixA = mat4.multiply(mat4.create(), barrelTransformationMatrixA,glm.scale(1.5,0.22,0.22));
  var barrelTransformationNodeA = new TransformationSGNode(barrelTransformationMatrixA);
  cockpitTransformationNodeA.append(barrelTransformationNodeA);

  //adding the barrel to the transformation node
  cubeNode = new CubeRenderNode();
  barrelTransformationNodeA.append(cubeNode);


}

function createTankB(rootNode){
  //transformation on the whole tank

  var tankTransformationMatrixB = mat4.multiply(mat4.create(), mat4.create(), glm.translate(tankB_posX,tankB_posY,tankB_posZ));
  tankTransformationMatrixB = mat4.multiply(mat4.create(), tankTransformationMatrixB, glm.rotateY(90));

  tankTransformationNodeB = new TransformationSceneGraphNode(tankTransformationMatrixB);
  rootNode.append(tankTransformationNodeB);



  //transformations on the body only
  var bodyTransformationMatrixB = mat4.multiply(mat4.create(),mat4.create(),glm.translate(0,0,0));
  bodyTransformationMatrixB = mat4.multiply(mat4.create(), bodyTransformationMatrixB,glm.scale(1.7,0.5,1.1));
  var bodyTransformationNodeB = new TransformationSGNode(bodyTransformationMatrixB);
  tankTransformationNodeB.append(bodyTransformationNodeB);

  //adding the body to the transformation node
  cubeNode = new CubeRenderNode();
  bodyTransformationNodeB.append(cubeNode);



  //transformations on the cockpit
  var cockpitTransformationMatrixB = mat4.multiply(mat4.create(),mat4.create(),glm.rotateY(10));
  cockpitTransformationMatrixB = mat4.multiply(mat4.create(),cockpitTransformationMatrixB,glm.translate(0.3,0.2,0));
  cockpitTransformationMatrixB= mat4.multiply(mat4.create(), cockpitTransformationMatrixB,glm.scale(0.6,0.6,0.6));
  cockpitTransformationNodeB = new TransformationSGNode(cockpitTransformationMatrixB);
  tankTransformationNodeB.append(cockpitTransformationNodeB);

  //adding the cockpit to the transformation node
  cubeNode = new CubeRenderNode();
  cockpitTransformationNodeB.append(cubeNode);

  //transformations on the barrel
  var barrelTransformationMatrixB = mat4.multiply(mat4.create(),mat4.create(),glm.rotateZ(-8));
  barrelTransformationMatrixB = mat4.multiply(mat4.create(),barrelTransformationMatrixB,glm.translate(-0.6,0.2,0));
  barrelTransformationMatrixB = mat4.multiply(mat4.create(), barrelTransformationMatrixB,glm.scale(1.5,0.22,0.22));
  barrelTransformationNodeB = new TransformationSGNode(barrelTransformationMatrixB);
  cockpitTransformationNodeB.append(barrelTransformationNodeB);

  //adding the barrel to the transformation node
  cubeNode = new CubeRenderNode();
  barrelTransformationNodeB.append(cubeNode);


}



/**
 * render one frame
 */
function render(timeInMilliseconds) {

  //set background color to light gray
  gl.clearColor(0.9, 0.9, 0.9, 1.0);
  //clear the buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //enable depth test to let objects in front occluse objects further away
  gl.enable(gl.DEPTH_TEST);

  //TASK 1-1
  gl.enable(gl.BLEND);
  //TASK 1-2
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  //activate this shader program
  gl.useProgram(shaderProgram);



  //movement of tank a
  var robotTransformationMatrix = mat4.multiply(mat4.create(), mat4.create(), glm.rotateY(0));

  if(timeInMilliseconds<4000){
    robotTransformationMatrix = mat4.multiply(mat4.create(), robotTransformationMatrix, glm.translate(timeInMilliseconds/5000,0,0));
  }else{
    robotTransformationMatrix = mat4.multiply(mat4.create(), robotTransformationMatrix, glm.translate(4000/5000,0,0));
  }
    robotTransformationMatrix = mat4.multiply(mat4.create(), robotTransformationMatrix, glm.rotateY(180));


  //robotTransformationNode.setMatrix(robotTransformationMatrix);
  //tankTransformationNodeA.setMatrix(robotTransformationMatrix);
/*
  var headTransformationMatrix = mat4.multiply(mat4.create(), mat4.create(), glm.rotateY(animatedAngle));
  headTransformationMatrix = mat4.multiply(mat4.create(), headTransformationMatrix, glm.translate(0.0,0.4,0));
  headTransformationMatrix = mat4.multiply(mat4.create(), headTransformationMatrix, glm.scale(0.4,0.33,0.5));
  headTransformationNode.setMatrix(headTransformationMatrix);*/

  context = createSceneGraphContext(gl, shaderProgram);

  rootNode.render(context);

  //request another render call as soon as possible
  requestAnimationFrame(render);

  //animate based on elapsed time
  animatedAngle = timeInMilliseconds/10;
}

function renderCube() {
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
  gl.drawElements(gl.TRIANGLES, cubeIndices.length, gl.UNSIGNED_SHORT, 0); //LINE_STRIP
}

function setUpModelViewMatrix(sceneMatrix, viewMatrix) {
  var modelViewMatrix = mat4.multiply(mat4.create(), viewMatrix, sceneMatrix);
  gl.uniformMatrix4fv(gl.getUniformLocation(context.shader, 'u_modelView'), false, modelViewMatrix);
}

/**
 * returns a new rendering context
 * @param gl the gl context
 * @param projectionMatrix optional projection Matrix
 * @returns {ISceneGraphContext}
 */
function createSceneGraphContext(gl, shader) {

  //create a default projection matrix
  projectionMatrix = mat4.perspective(mat4.create(), fieldOfViewInRadians, aspectRatio, 0.01, 10);
  //set projection matrix
  gl.uniformMatrix4fv(gl.getUniformLocation(shader, 'u_projection'), false, projectionMatrix);

  return {
    gl: gl,
    sceneMatrix: mat4.create(),
    viewMatrix: calculateViewMatrix(),
    projectionMatrix: projectionMatrix,
    shader: shader
  };
}

function calculateViewMatrix() {
  //compute the camera's matrix
  var eye = [0,1.5,6];
  var center = [0,0,0];
  var up = [0,1,0];
  viewMatrix = mat4.lookAt(mat4.create(), eye, center, up);
  return viewMatrix;
}

/**
 * base node of the scenegraph
 */
class SceneGraphNode {

  constructor() {
    this.children = [];
  }

  /**
   * appends a new child to this node
   * @param child the child to append
   * @returns {SceneGraphNode} the child
   */
  append(child) {
    this.children.push(child);
    return child;
  }

  /**
   * removes a child from this node
   * @param child
   * @returns {boolean} whether the operation was successful
   */
  remove(child) {
    var i = this.children.indexOf(child);
    if (i >= 0) {
      this.children.splice(i, 1);
    }
    return i >= 0;
  };

  /**
   * render method to render this scengraph
   * @param context
   */
  render(context) {

    //render all children
    this.children.forEach(function (c) {
      return c.render(context);
    });
  };
}

/**
 * a quad node that renders floor plane
 */
class QuadRenderNode extends SceneGraphNode {

  render(context) {

    //TASK 2-1

    //setting the model view and projection matrix on shader
    setUpModelViewMatrix(context.sceneMatrix, context.viewMatrix);

    var positionLocation = gl.getAttribLocation(context.shader, 'a_position');
    gl.bindBuffer(gl.ARRAY_BUFFER, quadVertexBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocation);

    var colorLocation = gl.getAttribLocation(context.shader, 'a_color');
    gl.bindBuffer(gl.ARRAY_BUFFER, quadColorBuffer);
    gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLocation);

    //set alpha value for blending
    //TASK 1-3
    gl.uniform1f(gl.getUniformLocation(context.shader, 'u_alpha'), 1);

    // draw the bound data as 6 vertices = 2 triangles starting at index 0
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    //render children
    super.render(context);
  }
}

//TASK 4-1
/**
 * a cube node that renders a cube at its local origin
 */
class CubeRenderNode extends SceneGraphNode {

  render(context) {

    //setting the model view and projection matrix on shader
    setUpModelViewMatrix(context.sceneMatrix, context.viewMatrix);

    var positionLocation = gl.getAttribLocation(context.shader, 'a_position');
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false,0,0) ;
    gl.enableVertexAttribArray(positionLocation);

    var colorLocation = gl.getAttribLocation(context.shader, 'a_color');
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false,0,0) ;
    gl.enableVertexAttribArray(colorLocation);

    //set alpha value for blending
    //TASK 1-3
    gl.uniform1f(gl.getUniformLocation(context.shader, 'u_alpha'), 1);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
    gl.drawElements(gl.TRIANGLES, cubeIndices.length, gl.UNSIGNED_SHORT, 0); //LINE_STRIP

    //render children
    super.render(context);
  }
}

//TASK 3-0
/**
 * a transformation node, i.e applied a transformation matrix to its successors
 */
class TransformationSceneGraphNode extends SceneGraphNode {
  /**
   * the matrix to apply
   * @param matrix
   */
  constructor(matrix) {
    super();
    this.matrix = matrix || mat4.create();
  }

  render(context) {
    //backup previous one
    var previous = context.sceneMatrix;
    //set current world matrix by multiplying it
    if (previous === null) {
      context.sceneMatrix = mat4.clone(this.matrix);
    }
    else {
      context.sceneMatrix = mat4.multiply(mat4.create(), previous, this.matrix);
    }

    //render children
    super.render(context);
    //restore backup
    context.sceneMatrix = previous;
  }

  setMatrix(matrix) {
    this.matrix = matrix;
  }
}

//TASK 5-0
/**
 * a shader node sets a specific shader for the successors
 */
class ShaderSceneGraphNode extends SceneGraphNode {
  /**
   * constructs a new shader node with the given shader program
   * @param shader the shader program to use
   */
  constructor(shader) {
    super();
    this.shader = shader;
  }

  render(context) {
    //backup prevoius one
    var backup = context.shader;
    //set current shader
    context.shader = this.shader;
    //activate the shader
    context.gl.useProgram(this.shader);
    //set projection matrix
    gl.uniformMatrix4fv(gl.getUniformLocation(context.shader, 'u_projection'),
      false, context.projectionMatrix);
    //render children
    super.render(context);
    //restore backup
    context.shader = backup;
    //activate the shader
    context.gl.useProgram(backup);
  }
};

function convertDegreeToRadians(degree) {
  return degree * Math.PI / 180
}
