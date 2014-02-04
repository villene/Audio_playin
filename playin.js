window.AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContext();
var audioInput = null,
    realAudioInput = null,
    inputPoint = null;
var rafID = null;
var analyserContext = null;
var canvasWidth, canvasHeight;
var startTime = new Date().getTime();
var logPitch = true;

function cancelAnalyserUpdates() {
    window.cancelAnimationFrame( rafID );
    rafID = null;
}

window.onload = function(){
    document.getElementById("logTrigger").addEventListener("click", function(){ logPitch = logPitch ? false : true });
};

function updateAnalysers(time) {
    {

        var freqByteData = new Uint8Array(analyserNode.frequencyBinCount);
        analyserNode.getByteFrequencyData(freqByteData);
        if(new Date().getTime() % 100 === 0) test(freqByteData);
         getPitch(freqByteData);
        drawData(freqByteData);
        
    }
    
    rafID = window.requestAnimationFrame( updateAnalysers );
}

function getPitch(data){
    if(!logPitch) return;
    var max = { i: 0, val: 0 };
    for(var i=5, l=data.length; i<l; i++){
        if(max.val < data[i]) {
            max.i = i;
            max.val = data[i];
        }
    }
    console.log(max.i, max.val);
}

function test(data) {
    console.log(data);
}

function drawData(freqByteData){
    if (!analyserContext) {
        var canvas = document.getElementById("graph");
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
        analyserContext = canvas.getContext('2d');
    }
    var FreqElem = document.getElementById('frequency');
    var NoteElem = document.getElementById('note');
    var DetuneElem = document.getElementById('detune');
    var SampleRate = audioContext.sampleRate;
    var MaxFrequency = Math.max.apply(Math, freqByteData);
    var Note;    
    var BAR_WIDTH = 30;
    
    var grad = analyserContext.createLinearGradient(0,500,0,0);
    grad.addColorStop(0,"green");
    grad.addColorStop(1,"red");

    analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
    analyserContext.fillStyle = grad;
    analyserContext.lineCap = 'round';
    
    for (var i = 0; i < freqByteData.length; ++i) {
        if (freqByteData[i] === MaxFrequency){
        Frequency = i * SampleRate / 2048;
        analyserContext.fillRect(0, canvasHeight, BAR_WIDTH, -Math.round(Frequency)/3);
        
        Note=freqnote(Frequency);
        FreqElem.innerText=Frequency.toFixed(2) + ' ' + notefreq(Note.step, Note.oct);        
        NoteElem.innerText=Note.step + Note.oct;        
        DetuneElem.innerText=Math.round(detune(Frequency.toFixed(2), Note.step, Note.oct));
        }
    }
}

function freqnote(freq){
    
    var note;
    var oct;
    var step;
    var diff=12*Math.log(freq/440)/Math.log(2);
    diff=Math.round(diff);
    
    note=58+diff;
    oct=Math.floor(note/12);
    note%=12;

    switch(note)
    {
        case 1: {step='C'; break;}
        case 2: {step='C♯/D♭'; break;}
        case 3: {step='D'; break;}
        case 4: {step='D♯/E♭'; break;}
        case 5: {step='E'; break;}
        case 6: {step='F'; break;}
        case 7: {step='F♯/G♭'; break;}
        case 8: {step='G'; break;}
        case 9: {step='G♯/A♭'; break;}
        case 10: {step='A'; break;}
        case 11: {step='A♯/B♭'; break;}
        case 0: {step='B'; oct--; break;}
    }
    return {step:step, oct:oct};
}

function notefreq(step, oct){
    var freq;
    switch (step)
    {
        case 'C': step=oct*12+1; break;
        case 'C♯/D♭': step=oct*12+2; break;
        case 'D': step=oct*12+3; break;
        case 'D♯/E♭': step=oct*12+4; break;
        case 'E': step=oct*12+5; break;
        case 'F': step=oct*12+6; break;
        case 'F♯/G♭': step=oct*12+7; break;
        case 'G': step=oct*12+8; break;
        case 'G♯/A♭': step=oct*12+9; break;
        case 'A': step=oct*12+10; break;
        case 'A♯/B♭': step=oct*12+11; break;
        case 'B': step=oct*12+12; break;
    }   
    
        if (step===58) freq=440;
        else{ step-=58; freq=440*Math.pow(1.059463, step);}        
   
    return freq.toFixed(2);
}

function detune(frequency, step, oct) {
	return ( 1200 * Math.log( frequency / notefreq(step, oct))/Math.log(2) );
}

function gotStream(stream) {
    inputPoint = audioContext.createGain();

    realAudioInput = audioContext.createMediaStreamSource(stream);
    audioInput = realAudioInput;
    audioInput.connect(inputPoint);

    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 2048;
    inputPoint.connect( analyserNode );

    zeroGain = audioContext.createGain();
    zeroGain.gain.value = 0.0;
    inputPoint.connect( zeroGain );
    zeroGain.connect( audioContext.destination );
    updateAnalysers();
}

function initAudio() {
        if (!navigator.getUserMedia)
            navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        if (!navigator.cancelAnimationFrame)
            navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
        if (!navigator.requestAnimationFrame)
            navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

    navigator.getUserMedia({audio:true}, gotStream, function(e) {
            alert('Error getting audio');
            console.log(e);
        });
}

window.addEventListener('load', initAudio );