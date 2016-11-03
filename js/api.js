/*global
$, window, unescape, localStorage
*/
'use strict';
var FORK_THIS_API = {
    getUrlVars: function() {
        var vars = [],
            hash,
            hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&'),
            i;
        for (i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = unescape(hash[1]);
        }
        return vars;
    },
    Ajax: {
        settings: function(endpoint, operation, data) {
            data.operation = operation;
            return {
                url: "https://jivd6u6gmd.execute-api.us-west-2.amazonaws.com/prod/" + endpoint,
                method: "POST",
                crossDomain: true,
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": "jUWR7OHgL31HZBL2S4tkB2zFbAp3V9Rk9yuEhdMs",
                    "Authorization": FORK_THIS_API.Account.authorization
                },
                data: JSON.stringify(data)
            };
        },
        makeCall: function(settings, onSuccess, onError) {
            $.ajax(settings).done(onSuccess).fail(onError);
        }
    },
    Session: {
        add: function(session, onSuccess, onError) {
          if(session.description === ""){
            session.description = "empty";
          }
          if(session.code === ""){
            session.code = "function main(){console.log('Hello World');}";
          }
            var settings = FORK_THIS_API.Ajax.settings("session", "add", {
                session: session
            });
            FORK_THIS_API.Ajax.makeCall(settings, onSuccess, onError);
        },
        update: function(session, onSuccess, onError) {
            var settings = FORK_THIS_API.Ajax.settings("session", "update", {
                session: session
            });
            FORK_THIS_API.Ajax.makeCall(settings, onSuccess, onError);
        },
        list: function(onSuccess, onError) {
            var settings = FORK_THIS_API.Ajax.settings("session", "list", {});
            FORK_THIS_API.Ajax.makeCall(settings, onSuccess, onError);
        },
        owned: function(ownerId, onSuccess, onError) {
            var settings = FORK_THIS_API.Ajax.settings("session", "owned", {
                session: {
                    ownerId: ownerId || "guest"
                }
            });
            FORK_THIS_API.Ajax.makeCall(settings, onSuccess, onError);
        },
        read: function(sessionId, onSuccess, onError) {
            var settings = FORK_THIS_API.Ajax.settings("session", "read", {
                session: {
                    sessionId: sessionId
                }
            });
            FORK_THIS_API.Ajax.makeCall(settings, onSuccess, onError);
        }
    },
    Account: {
        authorization: "",
        signIn: function(email, password, onSuccess, onError) {
            var settings = FORK_THIS_API.Ajax.settings("account", "signin", {
                account: {
                    email: email,
                    password: password
                }
            });
            FORK_THIS_API.Ajax.makeCall(settings, function(response) {
                if (!response.error) {
                    localStorage.setItem("authorization", response.account.authorization);
                    FORK_THIS_API.Account.authorization = response.account.authorization;
                    FORK_THIS_API.Account.currentUser = response.account;
                    onSuccess(response);
                } else {
                    onError(response);
                }
            }, onError);
        },
        signUp: function(email, firstName, lastName, password, onSuccess, onError) {
            var settings = FORK_THIS_API.Ajax.settings("account", "signup", {
                account: {
                    email: email,
                    firstName: firstName,
                    lastName: lastName,
                    password: password
                }
            });
            FORK_THIS_API.Ajax.makeCall(settings, function(response) {
                if (!response.error) {
                    localStorage.setItem("authorization", response.account.authorization);
                    FORK_THIS_API.Account.authorization = response.account.authorization;
                    FORK_THIS_API.Account.currentUser = response.account;
                    onSuccess(response);
                } else {
                    onError(response);
                }
            }, onError);
        },
        read: function(onSuccess, onError) {
            var settings = FORK_THIS_API.Ajax.settings("account", "read", {});
            FORK_THIS_API.Ajax.makeCall(settings, function(response) {
                if (!response.error) {
                    FORK_THIS_API.Account.currentUser = response.account;
                    onSuccess(response);
                } else {
                    onError(response);
                }
            }, onError);
        },
        logout: function(callback) {
            localStorage.setItem("authorization", "");
            FORK_THIS_API.Account.currentUser = null;
            FORK_THIS_API.Account.authorization = "";
            callback();
        }
    }
};
