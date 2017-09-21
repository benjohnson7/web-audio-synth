var context = new window.AudioContext(),
	adsr = AudioParam,
	maxNotes = 88,
	wave =  "sawtooth",
	defS = .1,
	currentKeys = [],
	selection = document.getElementById("selection")

var values = {
	a: .1,
	l: .1,
	d: .1,
	s: 1,
	r: .1,
	v: .4,
	reverb: false,
	lp: false,
	hp: false,
	bp: false
}

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
		this.applyFilter();
		this.ads();
	}
	ads() {
		let now = context.currentTime;
		this.osc.start();
		this.gain.gain.cancelScheduledValues( now );
		this.gain.gain.value = 0;
		this.gain.gain.linearRampToValueAtTime(values.l, now + values.a);
		this.gain.gain.linearRampToValueAtTime(values.s, now + values.a + values.d);
	}
	r() {
		let now = context.currentTime;
		this.gain.gain.linearRampToValueAtTime(0, now + values.r);
		setTimeout(() => {
			this.osc.stop()
		}, values.r*1000);
	}
	applyFilter() {
		if (values.lp) {
			this.filter.type = 'lowpass';
		} else if (values.hp) {
			this.filter.type = 'highpass';
		} else if (values.bp) {
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
	let checkid = e.target.id;
	if (checkid == 'lpfilter') {
		setLP(true);
		setHP(false);
		setBP(false);
	} else if (checkid == 'hpfilter') {
		setLP(false);
		setHP(true);
		setBP(false);
	} else if (checkid == 'bpfilter') {
		setLP(false);
		setHP(false);
		setBP(true);
	} else {
		setLP(false);
		setHP(false);
		setBP(false);
	}
});
function setVol(vol){
	values.v = vol;
}
function setAttack(x){
	values.a = parseFloat(x);
}
function setAttackLevel(x){
	values.l = parseFloat(x);
}
function setDecay(x){
	values.d = parseFloat(x);
}
function setSustain(x){
	values.s = parseFloat(x);
}
function setRelease(x){
	values.r = parseFloat(x);
}
function setLP(x){
	values.lp = x;
}
function setHP(x){
	values.hp = x;
}
function setBP(x){
	values.bp = x;
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