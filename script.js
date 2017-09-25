var context = new window.AudioContext(),
	adsr = AudioParam,
	maxNotes = 88,
	wave = "sawtooth",
	defS = .1,
	currentKeys = [],
	monoKey,
	monoLastKey,
	selection = document.getElementById("selection"),
	canvas = document.getElementById("oscilloscope"),
	canvasContext = canvas.getContext("2d"),
	bufferLength,
	dataArray



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
	bp: false,
	phonic: 'poly'
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
		this.gain.gain.cancelScheduledValues(now);
		this.gain.gain.value = 0;
		this.gain.gain.linearRampToValueAtTime(values.l, now + values.a);
		this.gain.gain.linearRampToValueAtTime(values.s, now + values.a + values.d);
	}
	r() {
		let now = context.currentTime;
		this.gain.gain.linearRampToValueAtTime(0, now + values.r);
		setTimeout(() => {
			this.osc.stop()
		}, values.r * 1000);
	}
	stop() {
		this.osc.stop()
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

function setWave() {
	wave = selection.options[selection.selectedIndex].value;
}
document.getElementById("phonic").addEventListener("change", function(e) {
	values.phonic = e.target.options[e.target.selectedIndex].value;
});
document.getElementById("pitch").addEventListener("change", function(e) {
	pitch = parseFloat(e.target.value);
	setFreq();
});
document.getElementById("v").addEventListener("change", function(e) {
	setVol(e.target.value);
});
document.getElementById("a").addEventListener("change", function(e) {
	setAttack(e.target.value);
});
document.getElementById("l").addEventListener("change", function(e) {
	setAttackLevel(e.target.value);
});
document.getElementById("d").addEventListener("change", function(e) {
	setDecay(e.target.value);
});
document.getElementById("s").addEventListener("change", function(e) {
	setSustain(e.target.value);
});
document.getElementById("r").addEventListener("change", function(e) {
	setRelease(e.target.value);
});
document.getElementById("filter").addEventListener("change", function(e) {
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
analyser = context.createAnalyser();
analyser.fftSize = 2048;
bufferLength = analyser.frequencyBinCount;
dataArray = new Uint8Array(bufferLength);


function draw() {


	drawVisual = requestAnimationFrame(draw);
	analyser.getByteTimeDomainData(dataArray);
	var sliceWidth = canvas.width * 1.0 / bufferLength;
	canvasContext.fillStyle = 'rgb(200, 200, 200)';
	canvasContext.fillRect(0, 0, canvas.width, canvas.height);

	canvasContext.lineWidth = 2;
	canvasContext.strokeStyle = 'rgb(0, 0, 0)';
	canvasContext.beginPath();
	var x = 0;

	for (var i = 0; i < bufferLength; i++) {

		var v = dataArray[i] / 128.0;
		var y = v * canvas.height / 2;

		if (i === 0) {
			canvasContext.moveTo(x, y);
		} else {
			canvasContext.lineTo(x, y);
		}

		x += sliceWidth;
	}

	canvasContext.lineTo(canvas.width, canvas.height / 2);
	canvasContext.stroke();
}
// draw();

function setVol(vol) {
	values.v = vol;
}

function setAttack(x) {
	values.a = parseFloat(x);
}

function setAttackLevel(x) {
	values.l = parseFloat(x);
}

function setDecay(x) {
	values.d = parseFloat(x);
}

function setSustain(x) {
	values.s = parseFloat(x);
}

function setRelease(x) {
	values.r = parseFloat(x);
}

function setLP(x) {
	values.lp = x;
}

function setHP(x) {
	values.hp = x;
}

function setBP(x) {
	values.bp = x;
}


var freq = {};

var pitch = 0;

var notes;

function setFreq() {
	for (var i = 0; i < maxNotes; i++) {
		let j = i - pitch;
		freq[j] = Math.pow(Math.pow(2, 1 / 12), i - 49) * 440;
	};
	notes = {
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
}

setFreq();

document.addEventListener("keydown", function(e) {
	if (values.phonic == "poly") {
		if (!currentKeys.includes(e.key) && notes.hasOwnProperty(e.key)) {
			currentKeys.push(e.key);
			let freq = notes[e.key];
			window["osc" + e.key] = new Osc(freq);
			window["osc" + e.key].update();

		}
	} else if (values.phonic == 'mono') {
		if (monoKey == e.key) {
			
		} else if (!monoKey || !monoLastKey && notes.hasOwnProperty(e.key)) {
			if (monoKey != false){
				monoLastKey = monoKey;
			}
			monoKey = e.key;
			let freq = notes[e.key];
			window["osc" + e.key] = new Osc(freq);
			window["osc" + e.key].update();
			if (monoLastKey || monoKey == monoLastKey){
				window["osc" + monoLastKey].stop();
			}
		}
	}

});

document.addEventListener("keyup", function(e) {
	if (values.phonic == "poly") {
		if (currentKeys.includes(e.key)) {
			window["osc" + e.key].r();
			currentKeys = currentKeys.filter(item => item !== e.key);
		}
	} else if (values.phonic == "mono") {
		if (monoKey == e.key){
			monoKey = false;
			window["osc" + e.key].r();
		} else if (monoLastKey == e.key){
			monoLastKey = false;
			window["osc" + e.key].r();
		}
	}
});