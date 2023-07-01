$(document).ready(function () {
  let jsonObj = [];

  function getval() {
    fetch('/getimg', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((response) => response.json())
      .then((data) => {
        for (let i = 0; i < data.length; i++) {
          const item = {};
          item['title'] = data[i].user_id;
          item['Imagepath'] = data[i].Imagepath;
          jsonObj.push(item);
        }
        face();
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  async function face() {
    const MODEL_URL = '/models';

    await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
    await faceapi.loadFaceLandmarkModel(MODEL_URL);
    await faceapi.loadFaceRecognitionModel(MODEL_URL);
    await faceapi.loadFaceExpressionModel(MODEL_URL);

    const video = document.getElementById('video');
    const displaySize = { width: video.width, height: video.height };

    const labels = jsonObj;
    const labeledFaceDescriptors = await Promise.all(
      labels.map(async (label) => {
        const lbl = label.Imagepath;
        const lbl1 = label.title;
        const imgUrl = `profile/${lbl}`;
        const img = await faceapi.fetchImage(imgUrl);
        const faceDescription = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

        if (!faceDescription) {
          throw new Error(`No faces detected for ${lbl1}`);
        }

        const faceDescriptors = [faceDescription.descriptor];
        return new faceapi.LabeledFaceDescriptors(lbl1, faceDescriptors);
      })
    );

    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);

    navigator.mediaDevices.getUserMedia({ video: true })
      .then(function (stream) {
        video.srcObject = stream;
      })
      .catch(function (error) {
        console.error('Error accessing the camera:', error);
      });

    let recognizedLabel = null;

    function storeCheckinTime(label, latitude, longitude, range_status) {
      fetch('/storeCheckinTime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ label: label, latitude: latitude, longitude: longitude, range_status: range_status })
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Check-in time stored for label:', label);
          alert('Check-in successful');
        })
        .catch((error) => {
          console.error('Error storing check-in time:', error);
        });
    }

    function storeCheckoutTime(label, latitude, longitude, range_status) {
      fetch('/storeCheckoutTime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ label: label, latitude: latitude, longitude: longitude, range_status: range_status })
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Checkout time stored for label:', label);
          alert('Checkout successful');
        })
        .catch((error) => {
          console.error('Error storing checkout time:', error);
        });
    }

    function calculateRange(latitude, longitude) {
      return Math.abs(latitude - longitude);
    }

    function handleCheckin() {
      if (recognizedLabel) {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            function (position) {
              const latitude = position.coords.latitude;
              const longitude = position.coords.longitude;
              const range = calculateRange(latitude, longitude);
              let range_status;

              if (range <= 60.0000) {
                range_status = 'ok';
                storeCheckinTime(recognizedLabel, latitude, longitude, range_status);

                alert('Punch In successful. Face match found: ' + recognizedLabel);
                window.location.href = '/dashboard';
              } else {
                range_status = 'onfield';
                storeCheckinTime(recognizedLabel, latitude, longitude, range_status);

                alert('Punch In successful. Face match found: ' + recognizedLabel);
                window.location.href = '/dashboard';              }
            },
            function (error) {
              console.error('Error getting geolocation:', error);
              alert('Failed to get geolocation.');
            }
          );
        } else {
          alert('Geolocation is not supported by this browser.');
        }
      } else {
        alert('Face not found. Please try again.');
      }
    }

    function handleCheckout() {
      if (recognizedLabel) {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            function (position) {
              const latitude = position.coords.latitude;
              const longitude = position.coords.longitude;
              const range = calculateRange(latitude, longitude);
              let range_status;

              if (range <= 60.0000) {
                range_status = 'ok';
                storeCheckoutTime(recognizedLabel, latitude, longitude, range_status);

                alert('Punch Out successful. Face match found: ' + recognizedLabel);
                window.location.href = '/dashboard';
              } else {
                range_status = 'onfield';
                storeCheckoutTime(recognizedLabel, latitude, longitude, range_status);

                alert('Punch Out successful. Face match found: ' + recognizedLabel);
                window.location.href = '/dashboard';              }
            },
            function (error) {
              console.error('Error getting geolocation:', error);
              alert('Failed to get geolocation.');
            }
          );
        } else {
          alert('Geolocation is not supported by this browser.');
        }
      } else {
        alert('Face not found. Please try again.');
      }
    }

    document.getElementById('checkin-btn').addEventListener('click', handleCheckin);
    document.getElementById('checkout-btn').addEventListener('click', handleCheckout);

    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();
      const resizedDetections = faceapi.resizeResults(detections, displaySize);

      const results = resizedDetections.map((detection) => {
        const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
        const box = detection.detection.box;

        return { bestMatch, box };
      });

      results.forEach((result) => {
        const { bestMatch, box } = result;
        const label = bestMatch.label;
        const distance = bestMatch.distance;

        if (distance < 0.5) {
          recognizedLabel = label;
        }
      });
    }, 100);
  }

  getval();
});



