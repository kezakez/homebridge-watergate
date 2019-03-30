var mosca = require("mosca");

var settings = {
  port: 1883,
  logger: { name: "MoscaServer", level: "info" }
};
var server = new mosca.Server(settings);

var authenticate = function(client, username, password, callback) {
  console.log("server username", server.username);
  if (username == server.username && password.toString() == server.password)
    callback(null, true);
  else callback(null, false);
};

var authorizePublish = function(client, topic, payload, callback) {
  var auth = true;
  // set auth to :
  //  true to allow
  //  false to deny and disconnect
  //  'ignore' to puback but not publish msg.
  callback(null, auth);
};

var authorizeSubscribe = function(client, topic, callback) {
  var auth = true;
  // set auth to :
  //  true to allow
  //  false to deny
  callback(null, auth);
};

exports.setup = function(username, password) {
  if (!username) throw new Error("no username set in config.json");
  if (!password) throw new Error("no password set in config.json");
  server.username = username;
  server.password = password;
};

server.on("ready", function() {
  server.authenticate = authenticate;
  server.authorizePublish = authorizePublish;
  server.authorizeSubscribe = authorizeSubscribe;

  console.log("Mosca server is up and running.");
});

server.on("error", function(err) {
  console.log(err);
});

server.on("clientConnected", function(client) {
  console.log("Client Connected \t:= ", client.id);
});

server.on("published", function(packet, client) {
  console.log("Published :=", packet);
});

server.on("subscribed", function(topic, client) {
  console.log("Subscribed :=", client.packet);
});

server.on("unsubscribed", function(topic, client) {
  console.log("unsubscribed := ", topic);
});

server.on("clientDisconnecting", function(client) {
  console.log("clientDisconnecting := ", client.id);
});

server.on("clientDisconnected", function(client) {
  console.log("Client Disconnected     := ", client.id);
});
