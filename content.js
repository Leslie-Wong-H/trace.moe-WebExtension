if (!self.browser && self.chrome) {
  browser = chrome;
}

var toDataURL = function(source) {
  try {
    var canvas = document.createElement("canvas");
    canvas.crossOrigin = 'anonymous';
    canvas.height = 720;
    if (source.nodeName === "VIDEO") {
      canvas.width = source.videoWidth / source.videoHeight * canvas.height;
    } else {
      canvas.width = source.width / source.height * canvas.height;
    }
    canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.8);
  } catch (err) {
    return null;
  }
}

var absolutePath = function(href) {
  var link = document.createElement("a");
  link.href = href;
  return (link.protocol + "//" + link.host + link.pathname + link.search + link.hash);
}

var handleMessage = (request, sender, sendResponse) => {
  if (request.action === "getCurrentTime") {
    var currentTime = 0;
    var videos = document.querySelectorAll("video");
    for (var i = 0; i < videos.length; ++i) {
      if (absolutePath(videos[i].src).indexOf(request.target)) {
        currentTime = videos[i].currentTime;
        break;
      }
      var sources = videos[i].querySelectorAll("source");
      for (var j = 0; j < sources.length; ++j) {
        if (absolutePath(sources[j].src).indexOf(request.target)) {
          currentTime = videos[i].currentTime;
        }
        break;
      }
    }
    sendResponse({
      currentTime: currentTime
    });
  } else if (request.action === "getDataURL") {
    //assume only one element match the blob URL
    let source = document.querySelector(`*[src='${request.target}']`);
    sendResponse({
      dataURL: toDataURL(source)
    });
  }

}

browser.runtime.onMessage.addListener(handleMessage);