(function initLinkbest() {
  window.linkbest = linkbest;
})();

function linkbest(event, data) {
  if (event == 'saveTrackingId') {
    saveTrackingId(data);
  } else if (event == 'submit') {
    submit(data);
  } else {
    return;
  }
}

function saveTrackingId() {
  var urlParams = new URLSearchParams(window.location.search);
  var lbid = urlParams.get('Lbid');
  if (!lbid) {
    return;
  }
  localStorage.lbid = lbid;
  var data = {
    Lbid: lbid,
    ads_key: 'a7fdac49a2789f903b37aa393b38a034',
    Extra: browseInfo(),
  };
  linkbestRequest(
    'saveTrackingId',
    'https://api.linkbest.com/a7fdac49a2789f903b37aa393b38a034/linkbest.service.pix.token.post',
    'POST',
    JSON.stringify(data),
    1,
  );
}

function submit(data) {
  // if (!localStorage.lbid) {
  //     return;
  // }
  var jsonObj = {
    Lbid: data.OrderID, //localStorage.lbid,
    hash: 'a7fdac49a2789f903b37aa393b38a034',
    Extra: browseInfo(),
    ...data,
  };
  var json = JSON.stringify(jsonObj);

  linkbestRequest(
    'submit',
    'https://api.linkbest.com/a7fdac49a2789f903b37aa393b38a034/linkbest.order-pulls-new.comm.push.hash.post',
    'POST',
    json,
    1,
  );
}

function browseInfo() {
  return {
    Ua: window.navigator.userAgent,
    Language: window.navigator.language,
  };
}

function log(event, err) {
  var form = new FormData();
  form.append('Err', err);
  form.append('Event', event);
  form.append('Ads_key', 'a7fdac49a2789f903b37aa393b38a034');
  var xhr = new XMLHttpRequest();
  xhr.open(
    'POST',
    'https://api.linkbest.com/a7fdac49a2789f903b37aa393b38a034/linkbest.service.pix.log.post',
  );
  xhr.send(form);
}

function linkbestRequest(event, url, method, data, retryTime) {
  var xhr = new XMLHttpRequest();
  xhr.open(method, url);
  xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
  xhr.onerror = function(err) {
    log(event, err);
    if (event === 'submit') {
      var info = {
        OrderID: JSON.parse(data).OrderID,
        info: 'onerror retry',
      };
      var json = JSON.stringify(info);
      linkbestRequest('state', 'https://rpa.duomai.cn/count-order', 'POST', json, 0);
    }
    if (retryTime == 1) {
      linkbestRequest(event, url, method, data, 0);
    }
  };
  xhr.onabort = function() {
    log(event, 'abort');

    if (retryTime == 1) {
      linkbestRequest(event, url, method, data, 0);
    }
  };
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      if (event === 'submit') {
        var info = {
          OrderID: JSON.parse(data).OrderID,
          info: 'success',
        };
        var json = JSON.stringify(info);
        linkbestRequest('state', 'https://rpa.duomai.cn/count-order', 'POST', json, 0);
      }
    } else if (xhr.status === -1) {
      if (event === 'submit') {
        var info = {
          OrderID: JSON.parse(data).OrderID,
          info: 'failed, readyState = ' + xhr.readyState + ' , status = ' + xhr.status,
        };
        var json = JSON.stringify(data);
        linkbestRequest('state', 'https://rpa.duomai.cn/count-order', 'POST', json, 0);
      }
    }
  };
  xhr.send(data);
}
