function getParameterByName(name, url) {
  if (!url) {
    url = window.location.href;
  }
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
  var results = regex.exec(url);
  if (!results) {
    return null;
  }
  if (!results[2]) {
    return '';
  }
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function loadMap(error, token, htmlRenderer, backendConnector, pqId) {
  if (error)
    console.error(error);
  else {

    var loadingDiv =  "<div id=\"loading\" style=\"width:200px; height:200px;\"></div>";
    $("#sio-emotion-map").append(loadingDiv);
    htmlRenderer.showLoading("loading");

    backendConnector.loadQuestion(token, pqId, function (error, question) {
      if (error) console.log(error);
      else{
        $("#sio-question-title").html(question.phrase);
        htmlRenderer.initializeMap("sio-emotion-map");
        htmlRenderer.setLabels(question.north, question.south, question.west, question.east);
      }
    });

    htmlRenderer.onClick(function (xParam, yParam) {
      x = xParam;
      y = yParam;
      backendConnector.addJam(token, {x: x, y: y, poll_question_id: pqId}, function (error, response) {
        if (error) {
          console.error(error);
        } else {
          htmlRenderer.setText("THANK YOU", "topleft", "emotionmap-text-center");
        }
      });
    });
  }
}
function loadSioMap(obj) {

  // authentication
  var clientId = obj.clientid;
  var tenantId = obj.tenantid;
  var redirectUrl = obj.redirecturl;

  var pqId = obj.questionId;

  // configure backend connector
  var backendConnector = new sensationio.BackendConnector();
  backendConnector.setHost("https://rest.sensation.io");
  backendConnector.setKey(obj.key);
  backendConnector.setTags(obj.tags);

  var htmlRenderer = new sensationio.HTMLRenderer();

  var defaultCategory = htmlRenderer.getDefaultCategory();
  defaultCategory.foregroundColor = htmlRenderer.convertHexToRGB(obj.color);
  htmlRenderer.extendConfiguration({
    "categories": {
      "defaultCategory": defaultCategory
    },
    gridMode: obj.gridMode,
    backgroundColor: obj.bgColor,
    submitOnClick: false
  });

  var x, y, token;

  token = obj.token;
  if (token && token.length > 0) {
    loadMap(null, token, htmlRenderer, backendConnector, pqId);
  }
  else {
    $("#sio-emotion-map").append("<b>SIO Map has not been properly configured</b>");
    console.log('SIO Map has not been properly configured');
  }
}