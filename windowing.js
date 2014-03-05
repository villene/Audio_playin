            
    function autoCorrelate(buf){
        var sum, i, j;
        var R=[];
        for(i=0, l=2048; i<l; i++)
            {
                sum=0;
                for(j=0; j<l-i;j++)
                    {
                        if (j>0 && j<l || j+i>0 && j+i<l)
                        sum+=buf[j]*buf[j+i];
                    else continue;
                    
                    }
                 R[i]=sum;   
            }
            return R;
    }
    function normalize(arr)
    {
        var temp = 0;
        var l=arr.length;
        for (var i=0; i<l; i++)
            {
                if (Math.abs(arr[i])>temp) temp=Math.abs(arr[i]);
            }
        for (var j=0; j<l; j++)
            arr[j]=arr[j]/temp;
        
        return arr;
    }
    
function zeroCrossing(buf)
{
    var l =buf.length;
    for (var i=0; i<l; i++)
        {
            if (buf[i]<=0) return i;
        }
}

function findMax(i, buf)
{
    var l = buf.length;
    var max=0;
    var maxInd=0;
    for (var j=i; j<l; j++)
        {
            if (buf[j]>max){
                max=buf[j];
                maxInd=j;
            }
        }
        return maxInd;
}

function test(freq)
{
    //var i=zeroCrossing(normalize(autoCorrelate(windowing(generateWave(freq)))));
    var buf=normalize(autoCorrelate(windowing(generateWave(freq))));
    var i=zeroCrossing(buf);
    
    return fPitch(findMax(i,buf));
    
}

function normalizeTimeData(freqData)
{
    var buf=[];
    var max = Math.max.apply( Math, freqData);
    
    max=Math.round(max/2);
    
   var l = freqData.length;
   for (var i=0; i<l; i++)
       {
           if (freqData[i]<max) buf[i]=freqData[i]/(max-1)-1;
           else buf[i]=(freqData[i]-(max-1))/max;
       }
       return buf;
}

function normalizeTimeData2(freqData)
{
    var buf=[]; 
    
   var l = freqData.length;
   for (var i=0; i<l; i++)
       {
           if (freqData[i]<128) buf[i]=freqData[i]/127-1;
           else buf[i]=(freqData[i]-127)/128;
       }
       return buf;
}

function normalizeTimeData3(freqData)
{
    var buf=[];              
   var l = freqData.length;
   
   for (var i=0; i<l; i++)
       {
           buf[i]=freqData[i]/127.5-1;
       }
       return buf;
}

function normalizeTimeData4(freqData)
{
    var buf=[];              
    var l = freqData.length;
    var max = Math.max.apply( Math, freqData);
    var min = Math.min.apply(Math, freqData);
    var avg = (max-min)/2;
    //console.log(min, max, avg);
    
    
    for (var i=0; i<l; i++)
       {           
           buf[i]=((127.5-freqData[i])/avg);
       }
       return buf;
}

function testRealTime(freq)
{   
    //var buf=normalize(autoCorrelate(windowing(buf)));
    //var i=zeroCrossing(normalize(autoCorrelate(windowing(buf))));
    var buf=normalize(autoCorrelate(windowing(normalizeTimeData3(freq))));
    var i=zeroCrossing(freq);
    
    return fPitch(findMax(i,buf));
    
}

function fPitch(maxInd)
{
    
    return 48000/maxInd;
}

 function windowing (buf){
    var gauswin=[];
    for(var i=0, l=buf.length; i<l; i++)
        {
            gauswin[i]=Math.pow(Math.E, -0.5*(Math.pow((i-(l-1)/2)/(0.45*(l-1)/2), 2)));
            buf[i]=buf[i]*gauswin[i];
}
        return buf;
}

function autoCorrelate2(buf){
    var sum = [];
    var l = buf.length;
    for(var i=0; i<2*l-1; i++){
        sum[i] = 0;
        for(var j=0; j<l; j++){
            if(i-l+j>=0){
                sum[i] += buf[j] + buf[i-l];
            }
        }
    }
    return sum;
}

function drawGraph(buf){
    var canvas = document.getElementById("graph");
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
        analyserContext = canvas.getContext('2d');
        analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
    for(var i=0, l=buf.length; i<l; i++){
        //analyserContext.moveTo(i,canvasHeight);
       //analyserContext.lineTo(i,canvasHeight-canvasHeight*buf[i]);
        //analyserContext.stroke();
        analyserContext.fillRect(i, canvasHeight/2+buf[i]*300, 1, 3);
    }
}
function generateWave(frekvence)
{
    var arr=[];
    //var frekvence=440;
    var l=2048;
    for(var i=0; i<l; i++){
        
        //arr[i]=Math.sin(i/17);
       arr[i]=Math.sin(2 * Math.PI * (i/48000)*frekvence);
    }
    return arr;
}    
