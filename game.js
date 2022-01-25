var example = document.getElementById("example");
var context = example.getContext("2d");
context.fillStyle = "rgb(255,166,0)";
context.fillRect(100, 30, 200, 200);

function gradientRect(){
var grd = context.createLinearGradient(90, 0, 670, 0);
grd.addColorStop(0.05, "magenta");
grd.addColorStop(0.25, "blue");
grd.addColorStop(0.5, "green");
grd.addColorStop(0.6, "yellow");
grd.addColorStop(0.7, "red")
grd.addColorStop(0.95, "white");
context.fillStyle = grd;
context.fillRect(100, 580, 700, 200)}

gradientRect()



let statusOfClick = false;

function toggleStatusOfClick() {
  statusOfClick = !statusOfClick;
  console.log("current status of statusOfClick: ", statusOfClick);
}

let clickableSpace = document.getElementById("example");
clickableSpace.addEventListener("click", toggleStatusOfClick);

function hoverRgb(e) {
  if (statusOfClick == true) {
    var x = e.pageX;
    var y = e.pageY;
    var c = document.getElementById("example").getContext("2d");
    var p = c.getImageData(x, y, 1, 1).data;

    context.fillStyle = `rgb(${p[0]},${p[1]},${p[2]})`;
    context.fillRect(100, 300, 200, 200);

    $("#status").html(
      `${p[0]}` + `\xa0\xa0` + `${p[1]}` + `\xa0\xa0` + `${p[2]}`
    );
  }
}

document.getElementById("example").addEventListener("mousemove", hoverRgb);

// console.log("last message", statusOfClick)

/*    $('#example').click(function(e) {

        var x = e.pageX;
        var y = e.pageY;
        var coord2 = "position x=" + x + ", y=" + y;
        var c2 = this.getContext("2d");
        var p2 = c2.getImageData(x, y, 1, 1).data;
        console.log(p2)
    }) */

