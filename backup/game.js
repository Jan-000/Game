// before removing the findPos function and parts of #example.mousemove



// set up some sample squares with random colors
var example = document.getElementById('example');
var context = example.getContext('2d');
context.fillStyle = "rgb(255,166,0)";
context.fillRect(100, 30, 200, 200);


var grd = context.createLinearGradient(90, 0, 670, 0);
grd.addColorStop(0.05, "magenta");
grd.addColorStop(0.25, "blue");
grd.addColorStop(0.5, "green");
grd.addColorStop(0.6, "yellow");
grd.addColorStop(0.7, "red");
grd.addColorStop(.95, "white");


context.fillStyle = grd;
context.fillRect(100, 580, 700, 200);

//eventually replace with querySelector
$('#example').mousemove(function(e) {
    //var pos = findPos(this);
    var x = e.pageX// - pos.x;
    var y = e.pageY// - pos.y;
    var coord = "position x=" + x + ", y=" + y;
    var c = this.getContext("2d");
    var p = c.getImageData(x, y, 1, 1).data;

context.fillStyle = `rgb(${p[0]},${p[1]},${p[2]})`
context.fillRect(100, 300, 200, 200)

    $('#status').html(`${p[0]}`+`\xa0\xa0`+`${p[1]}`+`\xa0\xa0`+`${p[2]}`);});

/*function findPos(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;

        } while (obj = obj.offsetParent);
        return { x: curleft, y: curtop };
    }
    return undefined;
}*/

//freeze the color on click
document.getElementById("example").addEventListener("click", freezeColor);


function freezeColor(){
     
    context.fillStyle = "rgb(34,56,200)"
    context.fillRect(300, 500, 200, 200)
    console.log("xD")

//onclick stop color picking

}


/*

$(".btn-secondmenu").css('background-color', localStorage.getItem(".btn-secondmenu"));
$(".btn-secondmenu").click(function () {
    $(this).css('background-color', 'green');
    var status = $(".btn-secondmenu").css('background-color');
    localStorage.setItem(".btn-secondmenu", status);
});

*/