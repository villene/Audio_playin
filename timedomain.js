window.AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContext();
var audioInput = null,
    inputPoint = null;
var rafID = null;
var analyserContext = null;
var canvasWidth, canvasHeight;
var logPitch = true;
var Note = null;

// TODO normlize freqData -1 to 1 instead of 0 to 256
var testArr = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,11,11,11,11,11,11,11,11,11,11,11,12,12,12,12,12,12,12,12,12,12,12,12,13,13,13,13,13,13,13,13,13,13,13,13,14,14,14,14,14,14,14,14,14,14,15,15,15,15,15,15,15,15,15,15,15,16,16,16,16,16,16,16,16,16,16,17,17,17,17,17,17,17,18,18,18,18,18,18,18,18,18,18,18,19,19,19,19,19,19,19,19,19,20,20,20,20,20,20,20,21,21,21,21,21,21,21,22,22,22,22,22,22,22,22,22,23,23,23,23,23,23,23,23,23,24,24,24,24,24,24,24,25,25,25,25,25,25,26,26,26,26,26,26,26,27,27,27,27,27,27,28,28,28,28,28,28,29,29,29,29,29,29,30,30,30,30,30,30,30,31,31,31,31,31,31,32,32,32,32,32,32,33,33,33,33,33,33,34,34,34,34,34,34,35,35,35,35,35,35,36,36,36,36,36,36,37,37,37,37,37,37,38,38,38,38,38,38,39,39,39,39,39,39,40,40,40,40,40,41,41,41,41,41,42,42,42,42,43,43,43,43,44,44,44,44,44,44,45,45,45,45,45,45,46,46,46,46,46,46,47,47,47,47,48,48,48,48,48,49,49,49,49,50,50,50,50,51,51,51,51,51,51,52,52,52,52,52,53,53,53,54,54,54,54,55,55,55,55,55,55,56,56,56,56,56,57,57,57,58,58,58,58,59,59,59,59,59,59,60,60,60,60,60,61,61,62,62,62,62,62,63,63,63,63,63,63,63,64,64,65,65,65,65,66,66,66,66,66,66,67,67,67,67,68,68,69,69,69,69,69,69,70,70,70,70,70,71,71,71,71,71,71,72,72,72,72,73,73,73,74,74,74,74,74,74,75,75,75,75,76,76,76,77,77,77,77,77,77,77,78,78,79,79,79,79,80,80,80,80,80,80,81,81,82,82,82,82,82,82,83,83,83,83,84,84,84,85,85,85,85,85,85,85,86,86,87,87,87,87,87,88,88,88,88,88,89,89,90,90,91,91,91,91,91,91,91,92,92,92,92,92,92,93,93,93,93,94,94,94,94,95,95,95,95,95,95,95,96,97,97,97,97,97,97,97,97,98,98,99,99,99,99,99,99,100,100,100,100,100,101,101,101,101,102,102,102,102,102,102,102,103,103,104,104,104,104,104,104,104,104,104,106,106,106,106,106,106,106,106,106,107,107,107,108,108,108,108,108,108,108,109,109,109,109,110,110,110,110,110,110,110,111,111,111,111,111,111,112,112,112,112,112,113,113,113,113,113,113,113,114,114,114,114,114,115,115,115,115,115,115,115,115,115,116,116,116,117,117,117,117,117,117,117,117,117,117,117,117,118,118,119,119,119,119,119,119,119,119,119,119,119,119,119,119,119,120,121,121,121,121,121,121,121,121,121,121,121,121,121,121,121,121,121,121,122,123,123,123,123,123,123,123,123,123,123,123,123,123,123,123,123,123,123,123,123,123,123,123,123,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,125,123,123,123,123,123,123,123,123,123,123,123,123,123,123,123,123,123,123,123,123,123,123,123,123,122,121,121,121,121,121,121,121,121,121,121,121,121,121,121,121,121,121,121,120,119,119,119,119,119,119,119,119,119,119,119,119,119,119,119,118,118,117,117,117,117,117,117,117,117,117,117,117,117,116,116,116,115,115,115,115,115,115,115,115,115,114,114,114,114,114,113,113,113,113,113,113,113,112,112,112,112,112,111,111,111,111,111,111,110,110,110,110,110,110,110,109,109,109,109,108,108,108,108,108,108,108,107,107,107,106,106,106,106,106,106,106,106,106,104,104,104,104,104,104,104,104,104,103,103,102,102,102,102,102,102,102,101,101,101,101,100,100,100,100,100,99,99,99,99,99,99,98,98,97,97,97,97,97,97,97,97,96,95,95,95,95,95,95,95,94,94,94,94,93,93,93,93,92,92,92,92,92,92,91,90,90,90,90,90,90,90,90,89,89,88,88,88,88,88,87,87,87,87,87,86,86,85,85,85,85,85,85,85,84,84,84,83,83,83,83,82,82,82,82,82,82,81,81,80,80,80,80,80,80,79,79,79,79,78,78,77,77,77,77,77,77,77,76,76,76,75,75,75,75,74,74,74,74,74,74,73,73,73,72,72,72,72,71,71,71,71,71,71,70,70,70,69,69,69,68,68,68,68,68,68,68,67,67,67,66,66,66,65,65,65,65,65,65,64,64,64,64,63,63,63,62,62,62,62,62,61,61,61,61,61,61,60,60,60,59,59,59,59,58,58,58,58,58,58,57,57,57,57,57,56,56,56,55,55,55,55,54,54,54,54,54,54,53,53,53,53,53,52,52,52,52,51,51,51,50,50,50,50,50,50,49,49,49,49,49,49,48,48,48,48,48,47,47,47,47,46,46,46,46,45,45,45,45,45,44,44,44,44,44,44,43,43,43,43,43,43,42,42,42,42,42,41,41,41,41,41,40,40,40,40,39,39,39,39,39,38,38,38,38,38,37,37,37,37,37,37,36,36,36,36,36,36,35,35,35,35,35,35,34,34,34,34,34,34,33,33,33,33,33,33,32,32,32,32,32,32,31,31,31,31,31,31,30,30,30,30,30,30,30,29,29,29,29,29,29,28,28,28,28,28,28,27,27,27,27,27,27,26,26,26,26,26,26,26,25,25,25,25,25,25,25,25,24,24,24,24,24,24,24,24,23,23,23,23,23,23,23,23,23,22,22,22,22,22,22,22,21,21,21,21,21,21,20,20,20,20,20,20,20,20,19,19,19,19,19,19,19,19,19,19,19,18,18,18,18,18,18,18,18,17,17,17,17,17,17,17,17,16,16,16,16,16,16,16,16,16,16,16,16,15,15,15,15,15,15,15,15,15,14,14,14,14,14,14,14,14,14,14,14,14,13,13,13,13,13,13,13,13,13,13,12,12,12,12,12,12,12,12,12,12,12,12,12,12,11,11,11,11,11,11,11,11,11,11,10,10,10,10,10,10,10,10,10,10,10,10,10,10,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

function cancelAnalyserUpdates() {
    window.cancelAnimationFrame( rafID );
    rafID = null;
}

var countI=0;
function updateAnalysers(time) {
    {
        var freqData = new Uint8Array(2048);
        analyserNode.getByteTimeDomainData(freqData);
       
       //if(countI++%10 === 0 )
           console.log(testRealTime(freqData));
           drawGraph(normalizeTimeData(freqData));
        //if(countI++%100 === 0 ) console.log(testRealTime(freqData), joinArr(freqData));
        //var FreqElem = document.getElementById('frequency');
        //var NoteElem = document.getElementById('note');
        //FreqElem.innerText=autoCorrelate(freqData);
        //Note = freqnote(autoCorrelate(freqData));
        //NoteElem.innerText=Note.step + Note.oct;
        //drawData(freqData);        
    }    
    rafID = window.requestAnimationFrame( updateAnalysers );
}

function joinArr(buff){
    var txt = '';
    for(var i=0, l=buff.length; i<l; i++){
        txt +=  buff[i]+',';
    }
    return txt;
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

/*function windowing (buf){
    var gauswin=[];
    for(var i=0, l=2048; i<l; i++)
        {
            gauswin[i]=Math.pow(Math.E, -0.5*(Math.pow((i-(l-1)/2)/(0.5*(l-1)/2), 2)));
}
        return gauswin;
}*/

/*function drawGraph(buf){
    var canvas = document.getElementById("graph");
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
        analyserContext = canvas.getContext('2d');
        
    for(var i=0, l=buf.length; i<l; i++){
        analyserContext.moveTo(i,500);
        analyserContext.lineTo(i,500-500*buf[i]);
    }
}*/

function drawData(freqData){
    if (!analyserContext) {
        var canvas = document.getElementById("graph");
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
        analyserContext = canvas.getContext('2d');
    }
    analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
    if (freqData[50]===freqData[100]) analyserContext.fillRect(75, 20, 10, 10);
    if (freqData[50]===0) analyserContext.fillRect(100, 20, 10, 10);
   for (var i = 0; i < freqData.length; i++) {
            var value = freqData[i] / 256;
            var y = canvasHeight - (canvasHeight * value) - 1;
            analyserContext.fillStyle = 'black';
            analyserContext.fillRect(i, y, 1, 3);
        }
    //analyserContext.fillRect(canvasWidth-30, canvasHeight, 30, -testRealTime(freqData) );
        }
    
/*function autoCorrelate(buf) {
	var MIN_SAMPLES = 100;	// corresponds to an 11kHz signal
	var MAX_SAMPLES = 1024; // corresponds to a 44Hz signal
	var SIZE = 1024;
	var best_offset = -1;
	var best_correlation = 0;
	var rms = 0;
        
        
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
		return audioContext.sampleRate/best_offset;
	}
        
}*/

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
    return {step:step, oct:oct, note:note};
}

function gotStream(stream) {
    inputPoint = audioContext.createGain();

    
    audioInput = audioContext.createMediaStreamSource(stream);
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

