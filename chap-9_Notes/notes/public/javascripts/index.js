$(document).ready(function () {
  alert("hi");
  var socket = io("/home");
  socket.on("notetitles", function (data) {
    var notelist = data.notelist;
    $("#notetitles").empty();
    for (var i = 0; i < notelist.length; i++) {
      notedata = notelist[i];
      $("#notetitles").append(
        '<a class="btn btn-lg btn-block btn-outline-dark" href="/notes/view?key=' +
          notedata.key +
          '">' +
          notedata.title +
          "</a>"
      );
    }
  });
});
