var playmusic0 = true;
var audio0 = new Audio('../sounds/vocalise.mp3');
var audio1 = new Audio('../sounds/themesong1.mp3');

$('#toggleMusic').click(function() {
    $('#toggleMusic').toggleClass('dimify');
    playmusic0 = !playmusic0;
    if (playmusic0) {
        audio0.play();
    }
    else {
        audio0.pause();
    }
});