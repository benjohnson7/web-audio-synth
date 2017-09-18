var context = new window.AudioContext();
var adsr = AudioParam
var gainNode = context.createGain();
var maxNotes = 88;
var wave =  "sine";
var defS = .1;
var currentKeys = [];

var
a = .1,
d = .1,
s = 1,
r = .1

var selection = document.getElementById("selection");


gainNode.gain.value = defS;


class Osc {
	constructor(freq) {
		this.freq = freq;
		this.x = context.createOscillator();
	}
	update() {
		this.x.frequency.value = this.freq;
		this.x.type = wave;
		this.ads();
	}
	ads() {
		this.x.start();
		this.x.connect(gainNode);
		gainNode.gain.cancelScheduledValues( context.currentTime );
		gainNode.gain.linearRampToValueAtTime(s, context.currentTime + a);
		gainNode.gain.linearRampToValueAtTime(s, context.currentTime + a + d);
	}
	r() {
		gainNode.gain.cancelScheduledValues( context.currentTime );
		gainNode.gain.linearRampToValueAtTime(0, context.currentTime + r);
		this.x.stop();
		setVol(defS);
	}
}


function setWave(){
	wave = selection.options[selection.selectedIndex].value;
}

function setVol(vol){
	gainNode.gain.value = vol;
	defS = vol;
}

function setAttack(x){
	console.log(x);
	a = parseFloat(x);
}
function setDecay(x){
	d = parseFloat(x);
}
function setSustain(x){
	s = parseFloat(x);
}
function setRelease(x){
	r = parseFloat(x);
}


var freq = {}

for (var i=0; i < maxNotes; i++){
	freq[i] = Math.pow(Math.pow(2, 1/12), i - 49) * 440;
};

var notes = {
	q: freq["40"],
	w: freq["42"],
	e: freq["44"],
	r: freq["45"],
	t: freq["47"],
	y: freq["49"],
	u: freq["51"],
	i: freq["52"],
	o: freq["54"],
	p: freq["56"]
}

document.addEventListener("keydown", function(e) {
	if (!currentKeys.includes(e.key)){
		currentKeys.push(e.key);
		var freq;
		freq = notes[e.key];
		window["osc" + e.key] = new Osc(freq);
		window["osc" + e.key].update();
		gainNode.connect(context.destination);
	}
});

document.addEventListener("keyup", function(e) {
	if (currentKeys.includes(e.key)){
		window["osc" + e.key].r();
		currentKeys = currentKeys.filter(item => item !== e.key);
	}
});