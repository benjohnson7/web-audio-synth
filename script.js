var context = new window.AudioContext(),
	adsr = AudioParam,
	maxNotes = 88,
	wave =  "sine",
	defS = .1,
	currentKeys = [],
	selection = document.getElementById("selection"),
	a = .1,
	l = .1,
	d = .1,
	s = 1,
	r = .1,
	v = .4,
	reverb = false,
	lp = false,
	hp = false,
	bp = false;




class Osc {
	constructor(freq) {
		this.freq = freq;
		this.osc = context.createOscillator();
		this.gain = context.createGain();
		this.filter = context.createBiquadFilter();
		this.gain.gain.value = defS;
		this.osc.connect(this.gain);
		this.gain.connect(this.filter);
		this.filter.connect(context.destination);
	}
	update() {
		this.osc.frequency.value = this.freq;
		this.osc.type = wave;
		this.ads();
		this.applyFilter();
	}
	ads() {
		let now = context.currentTime;
		this.osc.start();
		this.gain.gain.cancelScheduledValues( now );
		this.gain.gain.value = 0;
		this.gain.gain.linearRampToValueAtTime(l, now + a);
		this.gain.gain.linearRampToValueAtTime(s, now + a + d);
	}
	r() {
		let now = context.currentTime;
		this.gain.gain.linearRampToValueAtTime(0, now + r);
		setTimeout(() => {
			this.osc.stop()
		}, r*1000);
	}
	applyFilter() {
		if (lp) {
			this.filter.type = 'lowpass';
		} else if (hp) {
			this.filter.type = 'highpass';
			console.log("highpass");
		} else if (bp) {
			this.filter.type = 'bandpass';
		} else {
			this.filter.type = 'allpass';
		}
	}
}

function setWave(){
	wave = selection.options[selection.selectedIndex].value;
}
document.getElementById("v").addEventListener("click", function(e){
	setVol(e.target.value);
});
document.getElementById("a").addEventListener("click", function(e){
	setAttack(e.target.value);
});
document.getElementById("l").addEventListener("click", function(e){
	setAttackLevel(e.target.value);
});
document.getElementById("d").addEventListener("click", function(e){
	setDecay(e.target.value);
});
document.getElementById("s").addEventListener("click", function(e){
	setSustain(e.target.value);
});
document.getElementById("r").addEventListener("click", function(e){
	setRelease(e.target.value);
});
document.getElementById("filter").addEventListener("change", function(e){
	setLP(e.target.checked);
});
function setVol(vol){
	v = vol;
}
function setAttack(x){
	a = parseFloat(x);
}
function setAttackLevel(x){
	l = parseFloat(x);
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
function setLP(x){
	lp = x;
}
function setHP(x){
	hp = x;
}
function setBP(x){
	bp = x;
}


var freq = {}

for (var i=0; i < maxNotes; i++){
	freq[i] = Math.pow(Math.pow(2, 1/12), i - 49) * 440;
};

var notes = {
	q: freq["40"],
	2: freq["41"],
	w: freq["42"],
	3: freq["43"],
	e: freq["44"],
	r: freq["45"],
	5: freq["46"],
	t: freq["47"],
	6: freq["48"],
	y: freq["49"],
	7: freq["50"],
	u: freq["51"],
	i: freq["52"],
	9: freq["53"],
	o: freq["54"],
	0: freq["55"],
	p: freq["56"],
	".": freq["39"],
	l: freq["38"],
	",": freq["37"],
	k: freq["36"],
	m: freq["35"],
	j: freq["34"],
	n: freq["33"],
	b: freq["32"],
	g: freq["31"],
	v: freq["30"],
	f: freq["29"],
	c: freq["28"],
	x: freq["27"],
	s: freq["26"],
	z: freq["25"],
}

document.addEventListener("keydown", function(e) {
	if (!currentKeys.includes(e.key) && notes.hasOwnProperty(e.key)){
		currentKeys.push(e.key);
		var freq;
		freq = notes[e.key];
		window["osc" + e.key] = new Osc(freq);
		window["osc" + e.key].update();
		
	}
});

document.addEventListener("keyup", function(e) {
	if (currentKeys.includes(e.key)){
		window["osc" + e.key].r();
		currentKeys = currentKeys.filter(item => item !== e.key);
	}
});