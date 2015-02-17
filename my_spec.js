var frisby = require('frisby');

var specs = function(vmId) {
  frisby.create('Get video list items')
    .get('http://vmpro.mi24.tv/vam/rest/vms/' + vmId + '/video-list-items')
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    // .inspectJSON()
    .expectJSONTypes({
      "total": Number
    })
    .expectJSONTypes('videoListItems.*', {
      "id": String,
      "title": String,
      "createdDate": Number,
      "modifiedDate": Number,
      "plays": Number,
      "views": Number,
      "duration": Number,
      "published": Boolean,
      "stillId": Number,
      "stillFileId": Number,
      "stillUrl": String
    })
  .toss();
};

var getVmToken = function(vmId) {
  frisby.create('Get video manager token')
    .get('http://vmpro.mi24.tv/vam/rest/vms/' + vmId + "/token")
    .after(function(err, res, body) {
      
      frisby.globalSetup({
        request: {
          headers: { "Authorization": "Bearer " + body }
        }
      });

      specs(vmId);

    })
  .toss();
};

var getVideoManagers = function(err, res, body) {
  frisby.create('Get list of video managers')
    .get('http://vmpro.mi24.tv/vam/rest/vms')
    .after(function(err, res, body) {
      getVmToken(JSON.parse(body)[0].id);
    })
  .toss();
};

frisby.create('Get oauth token')
  .post('http://vmpro.mi24.tv/auth/realms/VideoManagerPro/tokens/grants/access',
    {
      "client_id": "video-manager-pro-ui",
      "username": "nils.preusker@movingimage24.tv",
      "password": "vmpro"
    })
  .after(function(err, res, body) {
    accessToken = JSON.parse(body).access_token;

    frisby.globalSetup({
      request: {
        headers: { "Authorization": "Bearer " + accessToken }
      }
    });

    getVideoManagers();

  })

.toss();
