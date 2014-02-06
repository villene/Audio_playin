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
//var Pitch;

function cancelAnalyserUpdates() {
    window.cancelAnimationFrame( rafID );
    rafID = null;
}

window.onload = function(){
    document.getElementById("logTrigger").addEventListener("click", function(){ logPitch = logPitch ? false : true });
};

function updateAnalysers(time) {
    {

        var freqData = new Uint8Array(2048);
        analyserNode.getByteTimeDomainData(freqData);
        //if(new Date().getTime() % 100 === 0) test(freqData);
         //getPitch(freqData);
         
         var FreqElem = document.getElementById('frequency');
        FreqElem.innerText=autoCorrelate(freqData);
        drawData(freqData);
        
        
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

function drawData(freqData){
    if (!analyserContext) {
        var canvas = document.getElementById("graph");
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
        analyserContext = canvas.getContext('2d');
    }
    analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
    analyserContext.fillText(freqData[50], 20, 20);
    analyserContext.fillText(freqData[100], 50, 20);
    if (freqData[50]===freqData[100]) analyserContext.fillRect(75, 20, 10, 10);
    if (freqData[50]===0) analyserContext.fillRect(100, 20, 10, 10);
   for (var i = 0; i < freqData.length; i++) {
            var value = freqData[i] / 256;
            var y = canvasHeight - (canvasHeight * value) - 1;
            analyserContext.fillStyle = 'black';
            analyserContext.fillRect(i, y, 1, 3);
        }
        }
    
function autoCorrelate(buf) {
	var MIN_SAMPLES = 4;	// corresponds to an 11kHz signal
	var MAX_SAMPLES = 1024; // corresponds to a 44Hz signal
	var SIZE = 1024;
	var best_offset = -1;
	var best_correlation = 0;
	var rms = 0;
        var sampleRate = 48000;

	//confidence = 0;
	
        
	if (buf.length < (SIZE + MAX_SAMPLES - MIN_SAMPLES))
		return;  // Not enough data

	for (var i=0;i<SIZE;i++) {
		var val = (buf[i] - 128)/128;
		rms += val*val;
	} 
	rms = Math.sqrt(rms/SIZE);
       
	for (var offset = MIN_SAMPLES; offset <= MAX_SAMPLES; offset++) {
		var correlation = 0;

		for (var i=0; i<SIZE; i++) {
			correlation += Math.abs(((buf[i] - 128)/128)-((buf[i+offset] - 128)/128));
		}
		correlation = 1 - (correlation/SIZE);
		if (correlation > best_correlation) {
			best_correlation = correlation;
			best_offset = offset;
		}
	}
	if ((rms>0.01)&&(best_correlation > 0.01)) {
                //confidence = best_correlation * rms * 10000;
		return sampleRate/best_offset;
		// console.log("f = " + sampleRate/best_offset + "Hz (rms: " + rms + " confidence: " + best_correlation + ")")
	}
        
}

function gotStream(stream) {
    inputPoint = audioContext.createGain();

    realAudioInput = audioContext.createMediaStreamSource(stream);
    audioInput = realAudioInput;
    audioInput.connect(inputPoint);

    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 2048;
    analyserNode.smoothingTimeConstant = 1;
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