const video = document.getElementById('video');

var socket = io.connect('https://tifacerec22.herokuapp.com/');
socket.on( 'connect', function() {
  console.log("SOCKET CONNECTED")
})

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
Promise.all([
  faceapi.loadFaceLandmarkModel("https://tifacerec22.herokuapp.com/static/models/"),
  faceapi.loadFaceRecognitionModel("https://tifacerec22.herokuapp.com/static/models/"),
  faceapi.loadTinyFaceDetectorModel("https://tifacerec22.herokuapp.com/static/models/"),
  faceapi.loadFaceLandmarkModel("https://tifacerec22.herokuapp.com/static/models/"),
  faceapi.loadFaceLandmarkTinyModel("https://tifacerec22.herokuapp.com/static/models/"),
  faceapi.loadFaceRecognitionModel("https://tifacerec22.herokuapp.com/static/models/"),
  faceapi.loadFaceExpressionModel("https://tifacerec22.herokuapp.com/static/models/"),
])
  .then(startVideo)
  .catch(err => console.error(err));

function startVideo() {
  console.log("access");
  navigator.getUserMedia(
    {
      video: {}
    },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

video.addEventListener('play', () => {
  // console.log('thiru');

  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);


  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();
    console.log(detections)
    socket.emit( 'my event', {
      data: detections
    })
    


    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

    console.log(detections);
  }, 100)
})
