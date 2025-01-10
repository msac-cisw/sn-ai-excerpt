const canvas = document.getElementById("waveCanvas");
const ctx = canvas.getContext("2d");
const audioPlayer = document.getElementById("audioPlayer");

const captionsDiv = document.getElementById('captions');
const track = audioPlayer.textTracks[0];

const audioContext = new (window.AudioContext ||
    window.webkitAudioContext)();

const analyser = audioContext.createAnalyser();
analyser.fftSize = 2048;

const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

const source = audioContext.createMediaElementSource(audioPlayer);
source.connect(analyser);
analyser.connect(audioContext.destination);

function drawWaveform() {
    requestAnimationFrame(drawWaveform);

    analyser.getByteTimeDomainData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();

    const sliceWidth = canvas.width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

        x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();
}

audioPlayer.onplay = function () {
    if (audioContext.state === "suspended") {
        audioContext.resume();
    }
    drawWaveform();
};


track.mode = 'hidden'; // We don't want the default browser captions

track.oncuechange = function() {
    const activeCue = track.activeCues[0];
    captionsDiv.textContent = activeCue ? activeCue.text : '';
};