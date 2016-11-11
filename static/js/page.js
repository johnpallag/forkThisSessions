/*global
FORK_THIS_API, $, JSHINT, document, window, CodeMirror, io, Session
*/

var PRIVATE_FUNCTIONS;
var leftEditor, rightEditor;
var projectCode = {};
var openFile = "";
var s = {};

(function() {
    'use strict';
    var widgets = [],
        info, after;

    function updateHints(editor) {
        editor.operation(function() {
            var i, err, msg, icon;
            for (i = 0; i < widgets.length; ++i) {
                editor.removeLineWidget(widgets[i]);
            }
            widgets.length = 0;
            JSHINT(editor.getValue());
            for (i = 0; i < JSHINT.errors.length; ++i) {
                err = JSHINT.errors[i];
                if (err) {
                    msg = document.createElement("div");
                    icon = msg.appendChild(document.createElement("span"));
                    icon.innerHTML = "!!";
                    icon.className = "lint-error-icon";
                    msg.appendChild(document.createTextNode(err.reason));
                    msg.className = "lint-error";
                    widgets.push(editor.addLineWidget(err.line - 1, msg, {
                        coverGutter: false,
                        noHScroll: true
                    }));
                }
            }
        });
        info = editor.getScrollInfo();
        after = editor.charCoords({
            line: editor.getCursor().line + 1,
            ch: 0
        }, "local").top;
        if (info.top + info.clientHeight < after) {
            editor.scrollTo(null, after - info.clientHeight + 3);
        }
    }

    $(window).on("load", function() {
        var makeInstanceButton, mergeInstanceButton, deleteInstanceButton, runButton, clearButton, stopButton, workspaceRight, waitingLeft, waitingRight;
        leftEditor = new CodeMirror(document.getElementById("codeLeft"), {
            lineNumbers: true,
            mode: "javascript",
            value: 'function HelloWorld(){\n\tconsole.log("Hello World!");\n}'
        });
        leftEditor.on("change", function() {
            clearTimeout(waitingLeft);
            waitingLeft = setTimeout(function() {
                updateHints(leftEditor);
            }, 500);
        });
        setTimeout(function() {
            updateHints(leftEditor);
        }, 100);
        rightEditor = new CodeMirror(document.getElementById("codeRight"), {
            lineNumbers: true,
            mode: "javascript",
            value: 'function HelloWorld(){\n\tconsole.log("Hello World!");\n}'
        });
        rightEditor.on("change", function() {
            clearTimeout(waitingRight);
            waitingRight = setTimeout(function() {
                updateHints(rightEditor);
            }, 500);
        });
        setTimeout(function() {
            updateHints(rightEditor);
        }, 100);
        $(".workspace-right").hide();
        FORK_THIS_API.Account.authorization = FORK_THIS_API.getUrlVars().authorization;
        FORK_THIS_API.Account.read(function(response) {
            FORK_THIS_API.Account.currentUser = response.account;
        });
        if (FORK_THIS_API.getUrlVars().session) {
            $("#loadingMessage").show();
            $("#page-wrapper").css("visiblity", "hidden");
            s = new Session(FORK_THIS_API.getUrlVars().session, {
                onload: function(session) {
                    var start, end;
                    $("#loadingMessage").hide();
                    $("#page-wrapper").css("visiblity", "visible");
                    leftEditor.setValue(session.project[session.openFile]);
                    $("#fileName").text(session.openFile);
                    /* Draw Files */
                    start = '<div><a class="file"><i class="fa fa-file-code-o" aria-hidden="true"></i> ';
                    end = '</a><a class="remove">x</a></div>';
                    $("#files").prepend(start + session.files.join(end + start) + end);
                },
                onFileAdd: function(session) {
                    $("#files").html('<div class="buttonPanel" style="margin-top:16px;" id="addFileContainer"> <div class="input-group"> <input class="form-control" id="addFileName" placeholder="index2.js" /> <span class="input-group-btn"> <button class="btn btn-success" id="addFileButton">Add File</button> </span> </div> </div>');
                    var start, end;
                    start = '<div><a class="file"><i class="fa fa-file-code-o" aria-hidden="true"></i> ';
                    if (FORK_THIS_API.getUrlVars().isOwner || s.editable) {
                        end = '</a><a class="remove">x</a></div>';
                    } else {
                        end = '</a></div>';
                    }
                    $("#files").prepend(start + session.files.join(end + start) + end);
                },
                onFileRemove: function(session) {
                    $("#files").html('<div class="buttonPanel" style="margin-top:16px;" id="addFileContainer"> <div class="input-group"> <input class="form-control" id="addFileName" placeholder="index2.js" /> <span class="input-group-btn"> <button class="btn btn-success" id="addFileButton">Add File</button> </span> </div> </div>');
                    var start, end;
                    start = '<div><a class="file"><i class="fa fa-file-code-o" aria-hidden="true"></i> ';
                    if (FORK_THIS_API.getUrlVars().isOwner || s.editable) {
                        end = '</a><a class="remove">x</a></div>';
                    } else {
                        end = '</a></div>';
                    }
                    $("#files").prepend(start + session.files.join(end + start) + end);
                },
                onEditableChange: function(session) {
                    if (session.editable) {
                        $(".uneditable").remove();
                    } else {
                        if (!FORK_THIS_API.getUrlVars().isOwner && !s.editable) {
                            $("#codeLeft .CodeMirror-sizer").prepend('<div class="uneditable" style="position: absolute;min-height: 300px;top: 0;width: 100%;height: 100%;left:0;z-index: 1000;background-color:rgba(0,0,0,.1)"></div>');
                            $("#messageInput").focus();
                        }
                    }
                },
                onFileUpdate: function(session, evt) {
                    if (session.openFile === evt.fileName) {
                        var cursor = leftEditor.getCursor();
                        leftEditor.setValue(session.project[session.openFile]);
                        leftEditor.setCursor(cursor);
                    }
                },
                onChat: function(session, body) {
                    var str = "<div>";
                    if (body.user) {
                        if (body.user.userId !== session.ownerId) {
                            str += body.user.firstName + ' ' + body.user.lastName + ': ';
                        } else {
                            str += "Owner: ";
                        }
                    } else {
                        str += "Guest: ";
                    }
                    $("#chatMessages").append(str + body.message + "</div");
                    $("#chatMessages")[0].scrollTop = $("#chatMessages")[0].scrollHeight;
                }
            });
            FORK_THIS_API.Session.read(FORK_THIS_API.getUrlVars().session, function(session) {
                FORK_THIS_API.Session.incViews(session);
                $('#codeLeft').on('keyup', function(e) {
                    if (FORK_THIS_API.getUrlVars().isOwner || s.editable) {
                        if (e.which === 13 || e.which === 59 || e.which === 125 || e.which === 41) {
                            session.code = leftEditor.getValue();
                            s.updateFile(leftEditor.getValue());
                        }
                        s.codeChanged(leftEditor.getValue());
                    }
                });
                if (!FORK_THIS_API.getUrlVars().isOwner && !s.editable) {
                    $("#codeLeft .CodeMirror-sizer").prepend('<div class="uneditable" style="position: absolute;background-color:rgba(0,0,0,.1);min-height: 300px;top: 0;width: 100%;height: 100%;left:0;z-index: 1000;"></div>');
                    $(".editable").hide();
                    $("#addFileContainer").hide();
                }
                $(".saveInstance").on('click', function() {
                    FORK_THIS_API.Account.read(function(response) {
                        if (response.account && $("#saveSessionName").val() !== "") {
                            if (s) {
                                s.save(rightEditor.getValue(), $("#saveSessionName").val(), response.account.userId, function(oldSession, newSession) {
                                    FORK_THIS_API.Account.addSaved(response.account, newSession.sessionId, oldSession.sessionId, function() {
                                        $("#saveSessionName").val("");
                                        window.open("http://www.forkthis.info/main.html?session=" + newSession.sessionId);
                                    });
                                });
                            }
                        }
                    });
                });
                $("#files").on('click', function(e) {
                    var target = $(e.target),
                        fileName;
                    if (target.hasClass("file")) {
                        leftEditor.setValue(s.readFile(target.text().split(' ').join('')));
                        $("#fileName").text(target.text().split(' ').join(''));
                    } else if (target.hasClass("remove")) {
                        fileName = target.parent().find(".file").text().split(' ').join('');
                        leftEditor.setValue(s.removeFile(fileName.split('.')[0], fileName.split('.')[1]));
                    }
                });
                $("#addFileButton").on('click', function() {
                    s.addFile($("#addFileName").val().split('.')[0], "", $("#addFileName").val().split('.')[1]);
                });
                $("#sendMessage").on('click', function() {
                    s.sendChat($("#messageInput").val(), FORK_THIS_API.Account.currentUser || {
                        firstName: "Guest",
                        lastName: ''
                    });
                    $("#messageInput").val('');
                });
                $(".editable").on('click', function() {
                    s.toggleEditable();
                    if (s.editable) {
                        $(this).text("Lock Editing");
                    } else {
                        $(this).text("Make Editable");
                    }
                });
            });
            if (!FORK_THIS_API.getUrlVars().authorization) {
                $("#saveInstanceContainer").hide();
            }
        } else {
            $("#loadingMessage").hide();
            $("#page-wrapper").css("visiblity", "visible");
        }

        /* Define buttons */
        makeInstanceButton = ".makeInstance";
        mergeInstanceButton = ".mergeInstance";
        deleteInstanceButton = ".deleteInstance";
        runButton = ".run";
        clearButton = ".clearConsole";
        stopButton = ".stop";

        /* Define work spaces */
        workspaceRight = ".workspace.workspace-right";

        PRIVATE_FUNCTIONS = {
            console: {
                log: function(target, obj) {
                    var ret = "undefined";
                    if (obj) {
                        ret = JSON.stringify(obj).split('"').join('');
                    }
                    target.html(target.html() + ret + "<br>");
                    target[0].scrollTop = target[0].scrollHeight;
                },
                warn: function(target, obj) {
                    var ret = "undefined";
                    if (obj) {
                        ret = JSON.stringify(obj).split('"').join('');
                    }
                    target.html(target.html() + "<font style='color:red'>" + ret + "</style><br>");
                },
                clear: function(target) {
                    target.html("");
                }
            },
            setTimeout: function(target, func, time) {
                setTimeout(function() {
                    if (target.attr("stop") !== true && target.attr("stop") !== "true") {
                        target.parent().find(".stop").show();
                        func();
                    }
                }, time);
            },
            parse: function(code, target) {
                if (code.indexOf("function main()") < 0) {
                    PRIVATE_FUNCTIONS.console.warn($(target), "Error: missing main()");
                    return false;
                }
                if (code.indexOf("$(") > -1 || code.indexOf("document.") > -1) {
                    PRIVATE_FUNCTIONS.console.warn($(target), "HTML DOM access not supported");
                    return false;
                }
                if (code.indexOf("window.") > -1) {
                    PRIVATE_FUNCTIONS.console.warn($(target), "Global variable access not supported");
                    return false;
                }
                code = code.split("console.log(").join("PRIVATE_FUNCTIONS.console.log($('" + target + "'),")
                    .split("console.warn(").join("PRIVATE_FUNCTIONS.console.warn($('" + target + "'),")
                    .split("console.clear(").join("PRIVATE_FUNCTIONS.console.clear($('" + target + "')")
                    .split("setTimeout(").join("PRIVATE_FUNCTIONS.setTimeout($('" + target + "'),");
                return code;
            },
            run: function(code, target) {
                try {
                    eval(code + "main();");
                } catch (e) {
                    PRIVATE_FUNCTIONS.console.warn($(target), e.toString());
                }
            }
        };

        /* Make Instance Button creates a new editable instance */
        $(makeInstanceButton).on("click", function() {
            $(workspaceRight).show();
            rightEditor.setValue(s.code || leftEditor.getValue());
            $(mergeInstanceButton).show();
            $(deleteInstanceButton).show();
            $("#saveInstanceContainer").show();
            $(makeInstanceButton).hide();
            $(workspaceRight).find(".console").val("");
        });
        /* Merge Instance brings back your code to the one on the left */
        $(mergeInstanceButton).on("click", function() {
            rightEditor.setValue(leftEditor.getValue());
        });
        /* Delete instance removes your current code */
        $(deleteInstanceButton).on("click", function() {
            $(workspaceRight).hide();
            $(mergeInstanceButton).hide();
            $(makeInstanceButton).show();
            $("#saveInstanceContainer").hide();
            $(deleteInstanceButton).hide();
        });
        /* Parse and run code */
        $(runButton).on("click", function() {
            var workspace = "." + $(this).parent().parent().attr("class").replace(" ", "."),
                code = "";
            if (workspace && workspace.indexOf("workspace") > -1) {
                $(workspace).find(".console").attr("stop", false);
                if (workspace.indexOf("Left") > -1) {
                    code = PRIVATE_FUNCTIONS.parse(s.code || leftEditor.getValue(), workspace + " .console");
                } else {
                    code = PRIVATE_FUNCTIONS.parse(rightEditor.getValue(), workspace + " .console");
                }
                if (code) {
                    PRIVATE_FUNCTIONS.run(code, workspace + " .console");
                }
            }
        });
        /* Clear console */
        $(clearButton).on("click", function() {
            var workspace = "." + $(this).parent().parent().attr("class").replace(" ", ".");
            if (workspace && workspace.indexOf("workspace") > -1) {
                $(workspace).find(".console").text("");
                $(workspace).find(".stop").trigger("click");
            }
        });
        /* Clear console */
        $(stopButton).on("click", function() {
            var workspace = "." + $(this).parent().parent().attr("class").replace(" ", ".");
            if (workspace && workspace.indexOf("workspace") > -1) {
                $(workspace).find(".console").attr("stop", true);
            }
            $(this).hide();
        });
    });
}());
