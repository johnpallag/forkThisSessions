/*global
$, FORK_THIS_API, io
*/
'use strict';

function Session(sessionId, options) {
    /* Private Variables */
    var self = this,
        socket = io();

    /* Public Variables */
    this.options = options || {};
    this.views = 0;
    this.forks = 0;
    this.sessionId = "";
    this.openFile = "index.js";
    this.description = "";
    this.code = "";
    this.ownerId = "";
    this.files = [];
    this.project = {};
    this.editable = false;
    /* Private Functions */
    function tryFunction(func, param) {
        if (func) {
            func(self, param);
        }
    }

    function broadcast(evtType, body) {
        socket.emit('event', JSON.stringify({
            session: self.sessionId,
            evtType: evtType,
            body: body
        }));
    }

    function listen() {
        socket.on(FORK_THIS_API.getUrlVars().session, function(evt) {
            evt = JSON.parse(evt);
            switch (evt.evtType) {
                case 'editable':
                    self.editable = evt.body;
                    tryFunction(self.options.onEditableChange);
                    break;
                case 'chat':
                    tryFunction(self.options.onChat, evt.body);
                    break;
                case 'file.add':
                    self.files.push(evt.body.fileName);
                    self.project[evt.body.fileName] = evt.body.body;
                    tryFunction(self.options.onFileAdd,evt.body);
                    break;
                case 'file.update':
                    self.project[evt.body.fileName] = evt.body.body;
                    tryFunction(self.options.onFileUpdate,evt.body);
                    break;
                case 'file.remove':
                    self.files.splice(self.files.indexOf(evt.body.fileName), 1);
                    self.project[evt.body.fileName] = null;
                    tryFunction(self.options.onFileRemove,evt.body);
                    break;
            }
        });
    }

    /* Public Functions */
    this.sendChat = function(message, user) {
        broadcast('chat', {message:message,user:user});
    };
    this.toggleEditable = function() {
        self.editable = !self.editable;
        broadcast('editable', self.editable);
    };
    this.codeChanged = function(code){
      self.project[self.openFile] = code;
      var file;
      self.code = "";
      for(file in self.project){
        if(self.project.hasOwnProperty(file)){
          self.code += self.project[file];
        }
      }
      broadcast('file.update', {
        fileName: self.openFile,
        body: code
      });
    };
    this.readFile = function(fileName) {
          self.openFile = fileName;
          return self.project[fileName];
    };
    this.removeFile = function(fileName, extension) {
        FORK_THIS_API.File.remove({
            name: fileName,
            extension: extension
        }, self.sessionId, function() {
            self.openFile = self.files[0] || "empty project";
            broadcast('file.remove', {
                fileName: fileName
            });
        });
    };
    this.addFile = function(fileName, body, extension) {
        FORK_THIS_API.File.add({
            name: fileName,
            data: body,
            extension: extension
        }, self.sessionId, function() {
            broadcast('file.add', {
                fileName: fileName,
                extension: extension,
                body: body
            });
        });
    };
    this.updateFile = function(body) {
        FORK_THIS_API.File.update({
            name: self.openFile.split('.')[0],
            data: body,
            extension: self.openFile.split('.')[1],
        }, self.sessionId, function() {
            self.project[self.openFile] = body;
            broadcast('file.update', {
                fileName: self.openFile,
                body: body
            });
        });
    };
    this.save = function(code, name, userId, onSuccess) {
        var newSession = {
            sessionId: name,
            description: self.description,
            ownerId: userId,
            sessionType: "private",
            code: code,
            file: {
                name: "index",
                extension: ".js",
                data: code
            }
        };
        FORK_THIS_API.Session.add(newSession, function() {
            tryFunction(onSuccess, newSession);
        });
    };

    /* Init */
    FORK_THIS_API.Session.read(sessionId, function(responseSession) {
        FORK_THIS_API.Session.incViews(responseSession);
        self.sessionId = sessionId;
        self.ownerId = responseSession.ownerId;
        self.forks = responseSession.forks;
        self.views = responseSession.views;
        self.description = responseSession.description;
        FORK_THIS_API.File.list(sessionId, function(response) {
            if (response.files && response.files.Contents && response.files.Contents.length > 0) {
                var i, filename, ext, fileRead, cnt = 0;
                fileRead = function(e) {
                    if (e.filename) {
                        self.project[e.filename] = e.body || "";
                        self.code += e.body || "";
                    }
                    if (++cnt >= self.files.length) {
                        tryFunction(self.options.onload, self);
                        listen();
                    }
                };
                for (i = 1; i < response.files.Contents.length; i++) {
                    filename = response.files.Contents[i].Key.split('/')[1];
                    self.files.push(filename);
                    if (i === 1) {
                        self.openFile = filename;
                    }
                    ext = filename.split('.')[filename.split('.').length - 1];
                    FORK_THIS_API.File.read(FORK_THIS_API.getUrlVars().session, {
                        name: filename.replace('.' + ext, ''),
                        extension: ext
                    }, fileRead);
                }
            } else {
                self.project["index.js"] = responseSession.code;
                self.files.push("index.js");
                self.openFile = "index.js";
                self.code = responseSession.code;
                tryFunction(self.options.onload, self);
                listen();
            }
        });
    });
}
