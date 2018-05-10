/**
 * as simple vertex shader setting the 2D position of a vertex without any transformations and forwarding the color
 * Created by Samuel Gratzl on 08.02.2016.
 */

// the position of the point
attribute vec3 a_position;

//the color of the point
attribute vec3 a_color;

varying vec3 v_color;

uniform mat4 u_modelView;
uniform mat4 u_projection;

//like a C program main is the main function
void main() {

  gl_Position = u_projection * u_modelView
    * vec4(a_position, 1);

  //TASK 5-2
  //we don't use a_color anymore
  a_color;

  //setting a static color (yellow) to the output varying color
  v_color = vec3(0,0,0.6);
}
