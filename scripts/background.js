
// import {response_global} from "./structure.js";
// console.log(response_global);

var transcript;
// Setting Chrome storage variables
var prefix = 'on';
chrome.storage.sync.set({ 'prefix': prefix });
var voice = 'on';
chrome.storage.sync.set({ 'voice': voice });

// Start event
function startButton(event) {
    // console.log("starting up");
    recognition.start();
}

if (!('webkitSpeechRecognition' in window)) {
    //webkitSpeechRecognition not supported :(
    // console.log("webkitSpeechRecognition not supported");
}
else {
    // webkitSpeechRecognition supported! :)
    // console.log("webkitSpeechRecognition supported");
    var recognition = new webkitSpeechRecognition(); //Object which manages recognition success
    recognition.continuous = true; // Suitable for dictation
    recognition.interimResults = true; // Start receiving results even if they are not final
    recognition.lang = "en-IN"; // Define some more parameters for the recognition
    recognition.maxAlternatives = 1;

    // Message arrays
    var whatResponses = ["Yes?", "Whats up?", "What can I help you with?", "Hello.", "Hey."];
    var okResponses = ["Alright.", "I gotchu.", "Okay.", "No problem."];

    // Immediately start listening
    startButton(event);

    recognition.onstart = function () {
        // console.log("recognition starting");
        // Audio input listening started
        // Give visual feedback
    };

    recognition.onend = function () {
        // console.log("recognition end");
        // Audio input listening ended
        // Give visual feedback
        // Continuous recording
        recognition.start();
    };

    recognition.onresult = function (event) {
        // Audio input results received
        if (typeof (event.results) == "undefined") {
            // Error
            recognition.start();
            return;
        }
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                var prefix = "";
                chrome.storage.sync.get('prefix', function (result) {
                    prefix = result.prefix;
                    // vision prefix on
                    if (prefix == "on") {
                        if (event.results[i][0].transcript.toLowerCase().trim().startsWith("vision")) {
                            // Results are final
                            // console.log("words said:" + event.results[i][0].transcript);
                            var utterance = new SpeechSynthesisUtterance("");
                            var voices = window.speechSynthesis.getVoices();
                            utterance.lang = "en-IN";
                            utterance.voice = voices.filter(function (voice) { return voice.name == 'Rishi'; })[0];

                            // vision new tab
                            if (event.results[i][0].transcript.toLowerCase().trim().includes("new tab")) {
                                chrome.tabs.create({ url: "chrome://newtab" });
                            }
                            // vision stop speaking
                            else if (event.results[i][0].transcript.toLowerCase().trim().substr(7, event.results[i][0].transcript.trim().length - 1) == "stop speaking" || event.results[i][0].transcript.toLowerCase().trim().substr(7, event.results[i][0].transcript.trim().length - 1) == "shut up" || event.results[i][0].transcript.toLowerCase().trim().substr(7, event.results[i][0].transcript.trim().length - 1) == "be quiet") {
                                var voice = 'off';
                                chrome.storage.sync.set({ 'voice': voice });
                            }
                            // vision start speaking
                            else if (event.results[i][0].transcript.toLowerCase().trim().substr(7, event.results[i][0].transcript.trim().length - 1) == "start speaking") {
                                var voice = 'on';
                                chrome.storage.sync.set({ 'voice': voice });
                            }
                            // vision start website reader
                            else if (event.results[i][0].transcript.toLowerCase().trim().includes("start website reader")) {
                                utterance = new SpeechSynthesisUtterance("website reader initiated, what would you like to listen to? website structure or website content");
                            }
                            // vision what is website structure?
                            else if (event.results[i][0].transcript.toLowerCase().trim().includes("what is website structure")) {
                                utterance = new SpeechSynthesisUtterance("Give website structure command to get the structure of the entire page, from paragraphs to images, everything will be informed for every section.");
                            }
                            // vision what is website content?
                            else if (event.results[i][0].transcript.toLowerCase().trim().includes("what is website content")) {
                                utterance = new SpeechSynthesisUtterance("The content will be split according to the web page sections and the user can listen to specific paragraph or image discription of it for a particular section.");
                            }
                            // vision current page
                            else if (event.results[i][0].transcript.toLowerCase().trim().includes("current page")) {
                                chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
                                    var url = tabs[0].url;
                                    if (url.startsWith("https://en.wikipedia.org/")) {
                                        var web_st = "";

                                        if (localStorage.getItem("myJson") !== null) {
                                            var passedJson = localStorage.getItem("myJson"); //get saved data anytime
                                            var obj = JSON.parse(passedJson);
                                            // console.log(obj)

                                            var key = Object.keys(obj);
                                            var len = key.length;
                                            var main_heading = Object.keys(obj)[len - 1];

                                            var web_structure = "Wikipedia page for " + main_heading + " is open. "

                                            web_st += web_structure
                                            // localStorage.clear();
                                        } else {
                                            var response_global = ""
                                            var web_structure

                                            window.addEventListener('DOMContentLoaded', (event) => {

                                                var url = "fetching url";

                                                chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                                                    url = tabs[0].url

                                                    var xhttp = new XMLHttpRequest();

                                                    xhttp.open("POST", "http://127.0.0.1:5000/read_page");
                                                    xhttp.send("url=" + tabs[0].url);


                                                    xhttp.onreadystatechange = function () {
                                                        if (this.readyState == 4 && this.status == 200) {
                                                            response_global = this.responseText;

                                                            var obj = JSON.parse(response_global);

                                                            // console.log(obj);

                                                            var key = Object.keys(obj);
                                                            var len = key.length;
                                                            var main_heading = Object.keys(obj)[len - 1];
                                                            document.getElementById("header1").innerHTML = "URL:" + url;

                                                            web_structure = "Wikipedia page for " + main_heading + " is open. "

                                                            localStorage.setItem("myJson", response_global);
                                                        }
                                                    };
                                                });
                                            });
                                            web_st += web_structure
                                        }
                                        // localStorage.clear();
                                        utterance = new SpeechSynthesisUtterance(web_st);
                                    } else {
                                        var web_st = "";

                                        if (localStorage.getItem("myJson") !== null) {
                                            var passedJson = localStorage.getItem("myJson"); //get saved data anytime
                                            var obj = JSON.parse(passedJson);
                                            // console.log(obj)

                                            var key = Object.keys(obj);
                                            var len = key.length;
                                            var main_heading;
                                            for (var key in obj) {
                                                if (key === '0') {
                                                    main_heading = obj[key];
                                                    break;
                                                }
                                            }

                                            var web_structure = "Webpage for " + main_heading + " is open. ";
                                            // var len = key.length;
                                            // var main_heading = Object.keys(obj)[len - 1];

                                            // var web_structure = "Wikipedia page for " + main_heading + " is open. "

                                            web_st += web_structure
                                            // localStorage.clear();
                                        } else {
                                            var response_global = ""
                                            var web_structure

                                            window.addEventListener('DOMContentLoaded', (event) => {

                                                var url = "fetching url";

                                                chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                                                    url = tabs[0].url

                                                    var xhttp = new XMLHttpRequest();

                                                    xhttp.open("POST", "http://127.0.0.1:5000/read_page");
                                                    xhttp.send("url=" + tabs[0].url);


                                                    xhttp.onreadystatechange = function () {
                                                        if (this.readyState == 4 && this.status == 200) {
                                                            response_global = this.responseText;

                                                            var obj = JSON.parse(response_global);

                                                            // console.log(obj);

                                                            var key = Object.keys(obj);
                                                            var len = key.length;
                                                            var main_heading = obj['0'];

                                                            web_structure = "Web page for " + main_heading + " is open. ";

                                                            localStorage.setItem("myJson", response_global);
                                                        }
                                                    };
                                                });
                                            });
                                            web_st += web_structure
                                        }
                                        // localStorage.clear();
                                        utterance = new SpeechSynthesisUtterance(web_st);
                                    }
                                });
                            }
                            // vision give sections (tells only the different section on the page)
                            else if (event.results[i][0].transcript.toLowerCase().trim().includes("give page sections")) {
                                // var msg = "Wikipedia page for " + main_heading + " is open. " + "Page consists of " + (len - 2) + " sections. ";
                                chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
                                    var url = tabs[0].url;
                                    if (url.startsWith("https://en.wikipedia.org/")) {
                                        var web_st = "";

                                        if (localStorage.getItem("myJson") !== null) {
                                            var passedJson = localStorage.getItem("myJson"); //get saved data anytime
                                            var obj = JSON.parse(passedJson);
                                            // console.log(obj)

                                            var key = Object.keys(obj);
                                            var len = key.length;

                                            var web_structure = (len - 2) + " sections on the page are "

                                            var count = 1;
                                            for (var key in obj) {
                                                if (count == (len - 2)) {
                                                    break
                                                }
                                                var ad = count + " " + key;
                                                web_structure += ad;
                                                count++;
                                            }
                                            web_st += web_structure
                                            // localStorage.clear();
                                        } else {
                                            var response_global = ""
                                            var web_structure

                                            window.addEventListener('DOMContentLoaded', (event) => {

                                                var url = "fetching url";

                                                chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                                                    url = tabs[0].url

                                                    var xhttp = new XMLHttpRequest();

                                                    xhttp.open("POST", "http://127.0.0.1:5000/read_page");
                                                    xhttp.send("url=" + tabs[0].url);


                                                    xhttp.onreadystatechange = function () {
                                                        if (this.readyState == 4 && this.status == 200) {
                                                            response_global = this.responseText;

                                                            var obj = JSON.parse(response_global);

                                                            // console.log(obj);

                                                            var key = Object.keys(obj);
                                                            var len = key.length;

                                                            web_structure = (len - 2) + " sections on the page are "

                                                            var count = 1;
                                                            for (var key in obj) {
                                                                if (count == (len - 2)) {
                                                                    break
                                                                }
                                                                var ad = count + " " + key;
                                                                web_structure += ad;
                                                                count++;
                                                            }

                                                            localStorage.setItem("myJson", response_global);
                                                        }
                                                    };
                                                });
                                            });
                                            web_st += web_structure
                                        }
                                        // localStorage.clear();
                                        utterance = new SpeechSynthesisUtterance(web_st);
                                    } else {
                                        var web_st = "";

                                        if (localStorage.getItem("myJson") !== null) {
                                            var passedJson = localStorage.getItem("myJson"); //get saved data anytime
                                            var obj = JSON.parse(passedJson);
                                            // console.log(obj)

                                            var key = Object.keys(obj);
                                            var len = key.length;

                                            var web_structure = "Page consists of " + (len - 1) + " sections. ";
                                            // var len = key.length;
                                            // var main_heading = Object.keys(obj)[len - 1];

                                            // var web_structure = "Wikipedia page for " + main_heading + " is open. "

                                            web_st += web_structure
                                            // localStorage.clear();
                                        } else {
                                            var response_global = ""
                                            var web_structure

                                            window.addEventListener('DOMContentLoaded', (event) => {

                                                var url = "fetching url";

                                                chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                                                    url = tabs[0].url

                                                    var xhttp = new XMLHttpRequest();

                                                    xhttp.open("POST", "http://127.0.0.1:5000/read_page");
                                                    xhttp.send("url=" + tabs[0].url);


                                                    xhttp.onreadystatechange = function () {
                                                        if (this.readyState == 4 && this.status == 200) {
                                                            response_global = this.responseText;

                                                            var obj = JSON.parse(response_global);

                                                            // console.log(obj);

                                                            var key = Object.keys(obj);
                                                            var len = key.length;

                                                            web_structure = "Page consists of " + (len - 1) + " sections. ";

                                                            localStorage.setItem("myJson", response_global);
                                                        }
                                                    };
                                                });
                                            });
                                            web_st += web_structure
                                        }
                                        // localStorage.clear();
                                        utterance = new SpeechSynthesisUtterance(web_st);
                                    }
                                });

                            }
                            // vision give website structure
                            else if (event.results[i][0].transcript.toLowerCase().trim().includes("give website structure")) {
                                // var msg = "Wikipedia page for " + main_heading + " is open. " + "Page consists of " + (len - 2) + " sections. ";
                                chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
                                    var url = tabs[0].url;
                                    if (url.startsWith("https://en.wikipedia.org/")) {
                                        var web_st = "";

                                        if (localStorage.getItem("myJson") !== null) {
                                            var passedJson = localStorage.getItem("myJson"); //get saved data anytime
                                            var obj = JSON.parse(passedJson);
                                            // console.log(obj)

                                            var key = Object.keys(obj);
                                            var len = key.length;
                                            var main_heading = Object.keys(obj)[len - 1];

                                            var web_structure = "Wikipedia page for " + main_heading + " is open. " + "Page consists of " + (len - 2) + " sections. "

                                            var count = 1;
                                            for (var key in obj) {
                                                if (key === 'See also') {
                                                    break
                                                }
                                                var app_txt = "Section " + count + " is about '" + key + "' consisting of " + obj[key]['para'].length + " paragraphs and " + obj[key]['images'].length + " images. "
                                                web_structure += app_txt;
                                                count++;
                                            }
                                            web_st += web_structure
                                            // localStorage.clear();
                                        } else {
                                            var response_global = ""
                                            var web_structure

                                            window.addEventListener('DOMContentLoaded', (event) => {

                                                var url = "fetching url";

                                                chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                                                    url = tabs[0].url

                                                    var xhttp = new XMLHttpRequest();

                                                    xhttp.open("POST", "http://127.0.0.1:5000/read_page");
                                                    xhttp.send("url=" + tabs[0].url);


                                                    xhttp.onreadystatechange = function () {
                                                        if (this.readyState == 4 && this.status == 200) {
                                                            response_global = this.responseText;

                                                            var obj = JSON.parse(response_global);

                                                            // console.log(obj);

                                                            var key = Object.keys(obj);
                                                            var len = key.length;
                                                            var main_heading = Object.keys(obj)[len - 1];

                                                            web_structure = "Wikipedia page for " + main_heading + " is open. " + "Page consists of " + (len - 2) + " sections. "

                                                            var count = 1;
                                                            for (var key in obj) {
                                                                if (key === 'See also') {
                                                                    break
                                                                }
                                                                var app_txt = "Section " + count + " is about '" + key + "' consisting of " + obj[key]['para'].length + " paragraphs and " + obj[key]['images'].length + " images. "
                                                                web_structure += app_txt;
                                                                count++;
                                                            }

                                                            localStorage.setItem("myJson", response_global);
                                                        }
                                                    };
                                                });
                                            });
                                            web_st += web_structure
                                        }
                                        // localStorage.clear();
                                        utterance = new SpeechSynthesisUtterance(web_st);
                                    } else {
                                        var web_st = "";

                                        if (localStorage.getItem("myJson") !== null) {
                                            var passedJson = localStorage.getItem("myJson"); //get saved data anytime
                                            var obj = JSON.parse(passedJson);
                                            // console.log(obj)

                                            var key = Object.keys(obj);
                                            var len = key.length;

                                            var web_structure = "";

                                            for (var key in obj) {
                                                if (key === '0') {
                                                    continue;
                                                }
                                                web_structure += "Section " + key + " consisits of " + obj[key]['images'].length + " images, " + obj[key]['paras'].length + " paragraphs and " + Object.keys(obj[key]['anchors']).length + " hyperlinks. ";
                                            }

                                            web_st += web_structure
                                            // localStorage.clear();
                                        } else {
                                            var response_global = ""
                                            var web_structure

                                            window.addEventListener('DOMContentLoaded', (event) => {

                                                var url = "fetching url";

                                                chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                                                    url = tabs[0].url

                                                    var xhttp = new XMLHttpRequest();

                                                    xhttp.open("POST", "http://127.0.0.1:5000/read_page");
                                                    xhttp.send("url=" + tabs[0].url);


                                                    xhttp.onreadystatechange = function () {
                                                        if (this.readyState == 4 && this.status == 200) {
                                                            response_global = this.responseText;

                                                            var obj = JSON.parse(response_global);

                                                            // console.log(obj);

                                                            var key = Object.keys(obj);

                                                            var web_structure = "";

                                                            for (var key in obj) {
                                                                if (key === '0') {
                                                                    continue;
                                                                }
                                                                web_structure += "Section " + key + " consisits of " + obj[key]['images'].length + " images, " + obj[key]['paras'].length + " paragraphs and " + Object.keys(obj[key]['anchors']).length + " hyperlinks. ";
                                                            }

                                                            localStorage.setItem("myJson", response_global);
                                                        }
                                                    };
                                                });
                                            });
                                            web_st += web_structure
                                        }
                                        // localStorage.clear();
                                        utterance = new SpeechSynthesisUtterance(web_st);
                                    }
                                });

                            }
                            // Vision initiate web content
                            else if (event.results[i][0].transcript.toLowerCase().trim().includes("initiate web content")) {
                                utterance = new SpeechSynthesisUtterance("web content initiated, what would you like to read? A paragraph from a particular section or an image from a particular section.");
                            }
                            // vision read section {section_name}
                            else if (event.results[i][0].transcript.toLowerCase().trim().includes("read section")) {
                                var requestedInput = event.results[i][0].transcript.toLowerCase().trim().substr(19, event.results[i][0].transcript.toLowerCase().trim().length - 1).trim();
                                // var msg = "Wikipedia page for " + main_heading + " is open. " + "Page consists of " + (len - 2) + " sections. ";
                                chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
                                    var url = tabs[0].url;
                                    if (url.startsWith("https://en.wikipedia.org/")) {
                                        var web_st = "";

                                        if (localStorage.getItem("myJson") !== null) {
                                            var passedJson = localStorage.getItem("myJson"); //get saved data anytime
                                            var obj = JSON.parse(passedJson);
                                            // console.log(obj)

                                            var key = Object.keys(obj);
                                            var len = key.length;

                                            var web_content = ""

                                            // Displays section heading and all its paragraphs
                                            for (var key in obj) {
                                                if (key.toLowerCase() === requestedInput) {
                                                    web_content += "Reading Section " + key + " ";
                                                    if (obj[key]['para'].length > 0) {
                                                        for (var para in obj[key]['para']) {
                                                            web_content += obj[key]['para'][para] + " ";
                                                        }
                                                    }
                                                }
                                            }
                                            web_st += web_content;
                                        } else {
                                            var response_global = ""
                                            var web_content

                                            window.addEventListener('DOMContentLoaded', (event) => {

                                                var url = "fetching url";

                                                chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                                                    url = tabs[0].url

                                                    var xhttp = new XMLHttpRequest();

                                                    xhttp.open("POST", "http://127.0.0.1:5000/read_page");
                                                    xhttp.send("url=" + tabs[0].url);


                                                    xhttp.onreadystatechange = function () {
                                                        if (this.readyState == 4 && this.status == 200) {
                                                            response_global = this.responseText;


                                                            var obj = JSON.parse(response_global);

                                                            // console.log(obj);

                                                            var key = Object.keys(obj);
                                                            var len = key.length;

                                                            web_content = ""

                                                            // Displays section heading and all its paragraphs
                                                            for (var key in obj) {
                                                                if (key.toLowerCase() === requestedInput) {
                                                                    web_content += "Reading Section " + key + " ";
                                                                    if (obj[key]['para'].length > 0) {
                                                                        for (var para in obj[key]['para']) {
                                                                            web_content += obj[key]['para'][para] + " ";
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                            localStorage.setItem("myJson", response_global);
                                                        }
                                                    };
                                                });
                                            });
                                            web_st += web_content
                                        }
                                        // localStorage.clear();
                                        // utterance = new SpeechSynthesisUtterance(requestedInput);
                                        utterance = new SpeechSynthesisUtterance(web_st);
                                    } else {
                                        var web_st = "";

                                        if (localStorage.getItem("myJson") !== null) {
                                            var passedJson = localStorage.getItem("myJson"); //get saved data anytime
                                            var obj = JSON.parse(passedJson);
                                            // console.log(obj)

                                            var key = Object.keys(obj);

                                            var web_content = ""

                                            // Displays section heading and all its paragraphs
                                            for (var key in obj) {
                                                if (key.toLowerCase() === requestedInput) {
                                                    web_content += "Reading Section " + key + " ";
                                                    if (obj[key]['paras'].length > 0) {
                                                        for (var para in obj[key]['paras']) {
                                                            web_content += obj[key]['paras'][para] + " ";
                                                        }
                                                    }
                                                }
                                            }
                                            web_st += web_content;
                                        } else {
                                            var response_global = ""
                                            var web_content

                                            window.addEventListener('DOMContentLoaded', (event) => {

                                                var url = "fetching url";

                                                chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                                                    url = tabs[0].url

                                                    var xhttp = new XMLHttpRequest();

                                                    xhttp.open("POST", "http://127.0.0.1:5000/read_page");
                                                    xhttp.send("url=" + tabs[0].url);


                                                    xhttp.onreadystatechange = function () {
                                                        if (this.readyState == 4 && this.status == 200) {
                                                            response_global = this.responseText;


                                                            var obj = JSON.parse(response_global);

                                                            // console.log(obj);

                                                            var key = Object.keys(obj);

                                                            web_content = ""

                                                            // Displays section heading and all its paragraphs
                                                            for (var key in obj) {
                                                                if (key.toLowerCase() === requestedInput) {
                                                                    web_content += "Reading Section " + key + " ";
                                                                    if (obj[key]['paras'].length > 0) {
                                                                        for (var para in obj[key]['paras']) {
                                                                            web_content += obj[key]['paras'][para] + " ";
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                            localStorage.setItem("myJson", response_global);
                                                        }
                                                    };
                                                });
                                            });
                                            web_st += web_content
                                        }
                                        // localStorage.clear();
                                        // utterance = new SpeechSynthesisUtterance(requestedInput);
                                        utterance = new SpeechSynthesisUtterance(web_st);
                                    }
                                });
                            }
                            // vision read paragraph one of section {section_name}
                            else if (event.results[i][0].transcript.toLowerCase().trim().includes("read para")) {
                                var requestedPara = event.results[i][0].transcript.toLowerCase().trim().substr(event.results[i][0].transcript.toLowerCase().trim().indexOf("para") + 4, event.results[i][0].transcript.toLowerCase().trim().indexOf("of") - 17);
                                var requestedSection = event.results[i][0].transcript.toLowerCase().trim().substr(event.results[i][0].transcript.toLowerCase().trim().indexOf("section") + 8, event.results[i][0].transcript.toLowerCase().trim().length - 1);
                                // var v_msg = "Want to read paragraph " + parseInt(requestedPara) + " of section " + requestedSection + ".";
                                chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
                                    var url = tabs[0].url;
                                    if (url.startsWith("https://en.wikipedia.org/")) {
                                        var web_st = "";

                                        if (localStorage.getItem("myJson") !== null) {
                                            var passedJson = localStorage.getItem("myJson");
                                            var obj = JSON.parse(passedJson);

                                            var key = Object.keys(obj);
                                            var len = key.length;

                                            var web_content = ""

                                            // Displays section heading and all its paragraphs
                                            for (var key in obj) {
                                                if (key.toLowerCase() === requestedSection) {
                                                    if (obj[key]['para'].length > 0) {
                                                        web_content += "Reading paragraph " + requestedPara + " of section " + key + ". ";
                                                        var para_no = 1;
                                                        for (var para in obj[key]['para']) {
                                                            if (para_no === parseInt(requestedPara)) {
                                                                web_content += obj[key]['para'][para] + " ";
                                                            }
                                                            para_no++;
                                                        }
                                                    } else {
                                                        web_content += "This section do not contain any paragraph";
                                                    }
                                                }
                                            }
                                            web_st += web_content;
                                        } else {
                                            var response_global = ""
                                            var web_content

                                            window.addEventListener('DOMContentLoaded', (event) => {

                                                var url = "fetching url";

                                                chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                                                    url = tabs[0].url

                                                    var xhttp = new XMLHttpRequest();

                                                    xhttp.open("POST", "http://127.0.0.1:5000/read_page");
                                                    xhttp.send("url=" + tabs[0].url);


                                                    xhttp.onreadystatechange = function () {
                                                        if (this.readyState == 4 && this.status == 200) {
                                                            response_global = this.responseText;


                                                            var obj = JSON.parse(response_global);

                                                            // console.log(obj);

                                                            var key = Object.keys(obj);
                                                            var len = key.length;

                                                            web_content = ""

                                                            // Displays section heading and all its paragraphs
                                                            for (var key in obj) {
                                                                if (key.toLowerCase() === requestedSection) {
                                                                    if (obj[key]['para'].length > 0) {
                                                                        web_content += "Reading paragraph " + requestedPara + " of section " + key + ". ";
                                                                        var para_no = 1;
                                                                        for (var para in obj[key]['para']) {
                                                                            if (para_no === parseInt(requestedPara)) {
                                                                                web_content += obj[key]['para'][para] + " ";
                                                                            }
                                                                            para_no++;
                                                                        }
                                                                    } else {
                                                                        web_content += "This section do not contain any paragraph";
                                                                    }
                                                                }
                                                            }
                                                            localStorage.setItem("myJson", response_global);
                                                        }
                                                    };
                                                });
                                            });
                                            web_st += web_content
                                        }
                                        // localStorage.clear();
                                        // utterance = new SpeechSynthesisUtterance(requestedInput);
                                        utterance = new SpeechSynthesisUtterance(web_st);
                                    } else {
                                        var web_st = "";

                                        if (localStorage.getItem("myJson") !== null) {
                                            var passedJson = localStorage.getItem("myJson"); //get saved data anytime
                                            var obj = JSON.parse(passedJson);
                                            // console.log(obj)

                                            var key = Object.keys(obj);

                                            var web_content = ""

                                            // Displays section heading and all its paragraphs
                                            for (var key in obj) {
                                                if (key.toLowerCase() === requestedSection) {
                                                    if (obj[key]['paras'].length > 0) {
                                                        web_content += "Reading paragraph " + requestedPara + " of section " + key + ". ";
                                                        var para_no = 1;
                                                        for (var para in obj[key]['paras']) {
                                                            if (para_no === parseInt(requestedPara)) {
                                                                web_content += obj[key]['paras'][para] + " ";
                                                            }
                                                            para_no++;
                                                        }
                                                    } else {
                                                        web_content += "This section do not contain any paragraph";
                                                    }
                                                }
                                            }
                                            web_st += web_content;
                                        } else {
                                            var response_global = ""
                                            var web_content

                                            window.addEventListener('DOMContentLoaded', (event) => {

                                                var url = "fetching url";

                                                chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                                                    url = tabs[0].url

                                                    var xhttp = new XMLHttpRequest();

                                                    xhttp.open("POST", "http://127.0.0.1:5000/read_page");
                                                    xhttp.send("url=" + tabs[0].url);


                                                    xhttp.onreadystatechange = function () {
                                                        if (this.readyState == 4 && this.status == 200) {
                                                            response_global = this.responseText;


                                                            var obj = JSON.parse(response_global);

                                                            // console.log(obj);

                                                            var key = Object.keys(obj);
                                                            var len = key.length;

                                                            web_content = ""

                                                            // Displays section heading and all its paragraphs
                                                            for (var key in obj) {
                                                                if (key.toLowerCase() === requestedSection) {
                                                                    if (obj[key]['paras'].length > 0) {
                                                                        web_content += "Reading paragraph " + requestedPara + " of section " + key + ". ";
                                                                        var para_no = 1;
                                                                        for (var para in obj[key]['paras']) {
                                                                            if (para_no === parseInt(requestedPara)) {
                                                                                web_content += obj[key]['paras'][para] + " ";
                                                                            }
                                                                            para_no++;
                                                                        }
                                                                    } else {
                                                                        web_content += "This section do not contain any paragraph";
                                                                    }
                                                                }
                                                            }
                                                            localStorage.setItem("myJson", response_global);
                                                        }
                                                    };
                                                });
                                            });
                                            web_st += web_content
                                        }
                                        // localStorage.clear();
                                        // utterance = new SpeechSynthesisUtterance(requestedInput);
                                        utterance = new SpeechSynthesisUtterance(web_st);
                                    }
                                });
                            }
                            // vision read all images of section {section_name}
                            else if (event.results[i][0].transcript.toLowerCase().trim().includes("read all images of section")) {
                                var requestedInput = event.results[i][0].transcript.toLowerCase().trim().substr(33, event.results[i][0].transcript.toLowerCase().trim().length - 1).trim();
                                // var msg = "Wikipedia page for " + main_heading + " is open. " + "Page consists of " + (len - 2) + " sections. ";
                                chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
                                    var url = tabs[0].url;
                                    if (url.startsWith("https://en.wikipedia.org/")) {
                                        var web_st = "";

                                        if (localStorage.getItem("myJson") !== null) {
                                            var passedJson = localStorage.getItem("myJson"); //get saved data anytime
                                            var obj = JSON.parse(passedJson);
                                            // console.log(obj)

                                            var key = Object.keys(obj);
                                            var len = key.length;

                                            var web_content = ""

                                            // Displays section heading and all its paragraphs
                                            for (var key in obj) {
                                                if (key.toLowerCase() === requestedInput) {
                                                    web_content += "Reading images of section " + key + ". ";
                                                    if (obj[key]['images'].length > 0) {
                                                        var img_no = 1;
                                                        for (var img in obj[key]['images']) {
                                                            web_content += "Reading image " + img_no + ". " + obj[key]['images'][img] + "...    ";
                                                            img_no++;
                                                        }
                                                    }
                                                }
                                            }
                                            web_st += web_content;
                                        } else {
                                            var response_global = ""
                                            var web_content

                                            window.addEventListener('DOMContentLoaded', (event) => {

                                                var url = "fetching url";

                                                chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                                                    url = tabs[0].url

                                                    var xhttp = new XMLHttpRequest();

                                                    xhttp.open("POST", "http://127.0.0.1:5000/read_page");
                                                    xhttp.send("url=" + tabs[0].url);


                                                    xhttp.onreadystatechange = function () {
                                                        if (this.readyState == 4 && this.status == 200) {
                                                            response_global = this.responseText;


                                                            var obj = JSON.parse(response_global);

                                                            // console.log(obj);

                                                            var key = Object.keys(obj);
                                                            var len = key.length;

                                                            web_content = ""

                                                            // Displays section heading and all its paragraphs
                                                            for (var key in obj) {
                                                                if (key.toLowerCase() === requestedInput) {
                                                                    web_content += "Reading images of section " + key + ". ";
                                                                    if (obj[key]['images'].length > 0) {
                                                                        var img_no = 1;
                                                                        for (var img in obj[key]['images']) {
                                                                            web_content += "Reading image " + img_no + ". " + obj[key]['images'][img] + "...    ";
                                                                            img_no++;
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                            localStorage.setItem("myJson", response_global);
                                                        }
                                                    };
                                                });
                                            });
                                            web_st += web_content
                                        }
                                        // localStorage.clear();
                                        // utterance = new SpeechSynthesisUtterance(requestedInput);
                                        utterance = new SpeechSynthesisUtterance(web_st);
                                    } else {
                                        var web_st = "";

                                        if (localStorage.getItem("myJson") !== null) {
                                            var passedJson = localStorage.getItem("myJson"); //get saved data anytime
                                            var obj = JSON.parse(passedJson);
                                            // console.log(obj)

                                            var key = Object.keys(obj);

                                            var web_content = ""

                                            // Displays section heading and all its paragraphs
                                            for (var key in obj) {
                                                if (key.toLowerCase() === requestedInput) {
                                                    web_content += "Section " + key + "consists of " + obj[key]['images'].length + " images. Which image do you want to listen to?";
                                                }
                                            }
                                            web_st += web_content;
                                        } else {
                                            var response_global = ""
                                            var web_content

                                            window.addEventListener('DOMContentLoaded', (event) => {

                                                var url = "fetching url";

                                                chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                                                    url = tabs[0].url

                                                    var xhttp = new XMLHttpRequest();

                                                    xhttp.open("POST", "http://127.0.0.1:5000/read_page");
                                                    xhttp.send("url=" + tabs[0].url);


                                                    xhttp.onreadystatechange = function () {
                                                        if (this.readyState == 4 && this.status == 200) {
                                                            response_global = this.responseText;


                                                            var obj = JSON.parse(response_global);

                                                            // console.log(obj);

                                                            var key = Object.keys(obj);

                                                            var web_content = ""

                                                            // Displays section heading and all its paragraphs
                                                            for (var key in obj) {
                                                                if (key.toLowerCase() === requestedInput) {
                                                                    web_content += "Section " + key + "consists of " + obj[key]['images'].length + " images. Which image do you want to listen to?";
                                                                }
                                                            }
                                                            localStorage.setItem("myJson", response_global);
                                                        }
                                                    };
                                                });
                                            });
                                            web_st += web_content
                                        }
                                        // localStorage.clear();
                                        // utterance = new SpeechSynthesisUtterance(requestedInput);
                                        utterance = new SpeechSynthesisUtterance(web_st);
                                    }
                                });
                            }
                            // vision open image one of section {section_name}
                            else if (event.results[i][0].transcript.toLowerCase().trim().includes("open image")) {
                                var requestedImg = event.results[i][0].transcript.toLowerCase().trim().substr(event.results[i][0].transcript.toLowerCase().trim().indexOf("image") + 6, event.results[i][0].transcript.toLowerCase().trim().indexOf("of") - 19);
                                var requestedSection = event.results[i][0].transcript.toLowerCase().trim().substr(event.results[i][0].transcript.toLowerCase().trim().indexOf("section") + 8, event.results[i][0].transcript.toLowerCase().trim().length - 1);
                                // var v_msg = "Want to read paragraph " + parseInt(requestedImg) + " of section " + requestedSection + ".";
                                chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
                                    var url = tabs[0].url;
                                    if (url.startsWith("https://en.wikipedia.org/")) {
                                        var web_st = "";

                                        if (localStorage.getItem("myJson") !== null) {
                                            var passedJson = localStorage.getItem("myJson"); //get saved data anytime
                                            var obj = JSON.parse(passedJson);
                                            // console.log(obj)

                                            var key = Object.keys(obj);
                                            var len = key.length;

                                            var web_content = ""

                                            // Displays section heading and all its paragraphs
                                            for (var key in obj) {
                                                if (key.toLowerCase() === requestedSection) {
                                                    if (obj[key]['images'].length > 0) {
                                                        web_content += "Reading image " + requestedImg + " of section " + key + ". ";
                                                        var para_no = 1;
                                                        for (var para in obj[key]['images']) {
                                                            if (para_no === parseInt(requestedImg)) {
                                                                web_content += obj[key]['images'][para] + " ";
                                                            }
                                                            para_no++;
                                                        }
                                                    } else {
                                                        web_content += "This section do not contain any image";
                                                    }
                                                }
                                            }
                                            web_st += web_content;
                                        } else {
                                            var response_global = ""
                                            var web_content

                                            window.addEventListener('DOMContentLoaded', (event) => {

                                                var url = "fetching url";

                                                chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                                                    url = tabs[0].url

                                                    var xhttp = new XMLHttpRequest();

                                                    xhttp.open("POST", "http://127.0.0.1:5000/read_page");
                                                    xhttp.send("url=" + tabs[0].url);


                                                    xhttp.onreadystatechange = function () {
                                                        if (this.readyState == 4 && this.status == 200) {
                                                            response_global = this.responseText;


                                                            var obj = JSON.parse(response_global);

                                                            // console.log(obj);

                                                            var key = Object.keys(obj);
                                                            var len = key.length;

                                                            web_content = ""

                                                            // Displays section heading and all its paragraphs
                                                            for (var key in obj) {
                                                                if (key.toLowerCase() === requestedSection) {
                                                                    if (obj[key]['images'].length > 0) {
                                                                        web_content += "Reading image " + requestedImg + " of section " + key + ". ";
                                                                        var para_no = 1;
                                                                        for (var para in obj[key]['images']) {
                                                                            if (para_no === parseInt(requestedImg)) {
                                                                                web_content += obj[key]['images'][para] + " ";
                                                                            }
                                                                            para_no++;
                                                                        }
                                                                    } else {
                                                                        web_content += "This section do not contain any image";
                                                                    }
                                                                }
                                                            }
                                                            localStorage.setItem("myJson", response_global);
                                                        }
                                                    };
                                                });
                                            });
                                            web_st += web_content
                                        }
                                        // localStorage.clear();
                                        // utterance = new SpeechSynthesisUtterance(requestedInput);
                                        utterance = new SpeechSynthesisUtterance(web_st);
                                    } else {
                                        var web_st = "";

                                        if (localStorage.getItem("myJson") !== null) {
                                            var passedJson = localStorage.getItem("myJson"); //get saved data anytime
                                            var obj = JSON.parse(passedJson);
                                            // console.log(obj)

                                            var key = Object.keys(obj);

                                            var web_content = ""
                                            var image_txt = " ";

                                            // Displays section heading and all its paragraphs
                                            for (var key in obj) {
                                                if (key.toLowerCase() === requestedSection) {
                                                    if (obj[key]['images'].length > 0) {
                                                        web_content += "Reading image " + requestedImg + " of section " + key + ". ";
                                                        var para_no = 1;
                                                        for (var para in obj[key]['images']) {
                                                            if (para_no === parseInt(requestedImg)) {
                                                                var xhttp2 = new XMLHttpRequest();

                                                                xhttp2.open("POST", "http://127.0.0.1:5000/read_img");
                                                                xhttp2.send(obj[key]['images'][para]);

                                                                window.open(obj[key]['images'][para]);

                                                                xhttp2.onreadystatechange = function () {
                                                                    image_txt = "Now reading text in  the image: ";
                                                                    image_txt += this.responseText;

                                                                    var obj = JSON.parse(response_global);
                                                                    console.log(obj);
                                                                    // utterance = new SpeechSynthesisUtterance(obj);
                                                                }
                                                            }
                                                            para_no++;
                                                        }
                                                    } else {
                                                        web_content += "This section do not contain any image";
                                                    }
                                                }
                                            }
                                            web_st += web_content;
                                            web_st += image_txt;
                                        } else {
                                            var response_global = ""
                                            var web_content

                                            window.addEventListener('DOMContentLoaded', (event) => {

                                                var url = "fetching url";

                                                chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                                                    url = tabs[0].url

                                                    var xhttp = new XMLHttpRequest();

                                                    xhttp.open("POST", "http://127.0.0.1:5000/read_page");
                                                    xhttp.send("url=" + tabs[0].url);


                                                    xhttp.onreadystatechange = function () {
                                                        if (this.readyState == 4 && this.status == 200) {
                                                            response_global = this.responseText;


                                                            var obj = JSON.parse(response_global);

                                                            // console.log(obj);

                                                            var key = Object.keys(obj);

                                                            web_content = ""
                                                            var image_txt = "Now reading text in  the image: ";

                                                            // Displays section heading and all its paragraphs
                                                            for (var key in obj) {
                                                                if (key.toLowerCase() === requestedSection) {
                                                                    if (obj[key]['images'].length > 0) {
                                                                        web_content += "Reading image " + requestedImg + " of section " + key + ". ";
                                                                        var para_no = 1;
                                                                        for (var para in obj[key]['images']) {
                                                                            if (para_no === parseInt(requestedImg)) {
                                                                                var xhttp = new XMLHttpRequest();

                                                                                xhttp.open("POST", "http://127.0.0.1:5000/read_img");
                                                                                xhttp.send(obj[key]['images'][para]);
                                                                                window.open(obj[key]['images'][para]);

                                                                                xhttp2.onreadystatechange = function () {
                                                                                    image_txt = "Now reading text in  the image: ";
                                                                                    image_txt += this.responseText;
                                                                                    console.log(this.responseText);
                                                                                    var obj = JSON.parse(response_global);
                                                                                    console.log(obj);
                                                                                    // utterance = new SpeechSynthesisUtterance(obj);
                                                                                }
                                                                            }
                                                                            para_no++;
                                                                        }
                                                                    } else {
                                                                        web_content += "This section do not contain any image";
                                                                    }
                                                                }
                                                            }
                                                            localStorage.setItem("myJson", response_global);
                                                        }
                                                    };
                                                });
                                            });
                                            web_st += web_content;
                                            web_st += image_txt;
                                        }
                                        // localStorage.clear();
                                        // utterance = new SpeechSynthesisUtterance(requestedInput);
                                        utterance = new SpeechSynthesisUtterance(web_st);
                                    }
                                });
                            }
                            // vision list hyperlinks of section {SECTION_NAME}
                            else if (event.results[i][0].transcript.toLowerCase().trim().includes("list of section")) {
                                var requestedSection = event.results[i][0].transcript.toLowerCase().trim().substr(event.results[i][0].transcript.toLowerCase().trim().indexOf("section") + 8, event.results[i][0].transcript.toLowerCase().trim().length - 1);
                                // var v_msg = "Want to read paragraph " + parseInt(requestedImg) + " of section " + requestedSection + ".";
                                chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
                                    var url = tabs[0].url;
                                    if (url.startsWith("https://en.wikipedia.org/")) {
                                        var web_st = "Sorry, too many hyperlinks can not parse.";
                                        utterance = new SpeechSynthesisUtterance(web_st);
                                    } else {
                                        var web_st = "";

                                        if (localStorage.getItem("myJson") !== null) {
                                            var passedJson = localStorage.getItem("myJson"); //get saved data anytime
                                            var obj = JSON.parse(passedJson);
                                            // console.log(obj)

                                            var key = Object.keys(obj);

                                            var web_content = ""

                                            for (var key in obj) {
                                                if (key === requestedSection) {
                                                    var key_dict = Object.keys(obj[key]['anchors']);
                                                    if (key_dict.length > 0) {
                                                        web_content += "Reading hyperlinks of section " + requestedSection + ". ";
                                                        var link_no = 1;
                                                        for (var key_dict in (obj[key]['anchors'])) {
                                                            web_content += "Link " + link_no + " is about " + key_dict + ". ";
                                                            link_no++;
                                                        }
                                                    } else {
                                                        web_content += "This section do not contain any links";
                                                    }
                                                }
                                            }
                                            web_st += web_content;
                                        } else {
                                            var response_global = ""
                                            var web_content

                                            window.addEventListener('DOMContentLoaded', (event) => {

                                                var url = "fetching url";

                                                chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                                                    url = tabs[0].url

                                                    var xhttp = new XMLHttpRequest();

                                                    xhttp.open("POST", "http://127.0.0.1:5000/read_page");
                                                    xhttp.send("url=" + tabs[0].url);


                                                    xhttp.onreadystatechange = function () {
                                                        if (this.readyState == 4 && this.status == 200) {
                                                            response_global = this.responseText;


                                                            var obj = JSON.parse(response_global);

                                                            // console.log(obj);

                                                            var key = Object.keys(obj);

                                                            web_content = ""

                                                            for (var key in obj) {
                                                                if (key.toLowerCase() === requestedSection) {
                                                                    var key_dict = Object.keys(obj[key]['anchors']);
                                                                    if (key_dict.length > 0) {
                                                                        web_content += "Reading hyperlinks of section " + requestedSection + ". ";
                                                                        var link_no = 1;
                                                                        for (var key_dict in (obj[key]['anchors'])) {
                                                                            web_content += "Link " + link_no + " is about " + key_dict + ". ";
                                                                            link_no++;
                                                                        }
                                                                    } else {
                                                                        web_content += "This section do not contain any links";
                                                                    }
                                                                }
                                                            }
                                                            localStorage.setItem("myJson", response_global);
                                                        }
                                                    };
                                                });
                                            });
                                            web_st += web_content
                                        }
                                        // localStorage.clear();
                                        // utterance = new SpeechSynthesisUtterance(requestedInput);
                                        utterance = new SpeechSynthesisUtterance(web_st);
                                    }
                                });
                            }
                            // vision click on link {LINK_NO} of section {SECTION_NAME}
                            else if (event.results[i][0].transcript.toLowerCase().trim().includes("click on link")) {
                                var requestedSection = event.results[i][0].transcript.toLowerCase().trim().substr(event.results[i][0].transcript.toLowerCase().trim().indexOf("section") + 8, event.results[i][0].transcript.toLowerCase().trim().length - 1);
                                var requestedLink = event.results[i][0].transcript.toLowerCase().trim().substr(event.results[i][0].transcript.toLowerCase().trim().indexOf("link") + 4, event.results[i][0].transcript.toLowerCase().trim().indexOf("of") - 17);
                                // var v_msg = "Want to read paragraph " + parseInt(requestedImg) + " of section " + requestedSection + ".";
                                chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
                                    var url = tabs[0].url;
                                    if (url.startsWith("https://en.wikipedia.org/")) {
                                        var web_st = "Sorry, too many hyperlinks can not parse.";
                                        utterance = new SpeechSynthesisUtterance(web_st);
                                    } else {
                                        var web_st = "";

                                        if (localStorage.getItem("myJson") !== null) {
                                            var passedJson = localStorage.getItem("myJson"); //get saved data anytime
                                            var obj = JSON.parse(passedJson);
                                            // console.log(obj)

                                            var key = Object.keys(obj);

                                            web_content = "Opening link " + requestedLink + " of section " + requestedSection;

                                            for (var key in obj) {
                                                if (key.toLowerCase() === requestedSection) {
                                                    var key_dict = Object.keys(obj[key]['anchors']);
                                                    if (key_dict.length > 0) {
                                                        // web_content += "Reading hyperlinks " + requestedImg + " of section " + key + ". ";
                                                        var link_no = 1;
                                                        for (var key_dict in (obj[key]['anchors'])) {
                                                            if (link_no === parseInt(requestedLink)) {
                                                                window.open(obj[key]['anchors'][key_dict]);
                                                            }
                                                            link_no++;
                                                        }
                                                    } else {
                                                        web_content += "This section do not contain any links";
                                                    }
                                                }
                                            }
                                            web_st += web_content;
                                        } else {
                                            var response_global = ""
                                            var web_content

                                            window.addEventListener('DOMContentLoaded', (event) => {

                                                var url = "fetching url";

                                                chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                                                    url = tabs[0].url

                                                    var xhttp = new XMLHttpRequest();

                                                    xhttp.open("POST", "http://127.0.0.1:5000/read_page");
                                                    xhttp.send("url=" + tabs[0].url);


                                                    xhttp.onreadystatechange = function () {
                                                        if (this.readyState == 4 && this.status == 200) {
                                                            response_global = this.responseText;


                                                            var obj = JSON.parse(response_global);

                                                            // console.log(obj);

                                                            var key = Object.keys(obj);

                                                            web_content = "Opening link " + requestedLink + " of section " + requestedSection;

                                                            for (var key in obj) {
                                                                if (key.toLowerCase() === requestedSection) {
                                                                    var key_dict = Object.keys(obj[key]['anchors']);
                                                                    if (key_dict.length > 0) {
                                                                        // web_content += "Reading hyperlinks " + requestedImg + " of section " + key + ". ";
                                                                        var link_no = 1;
                                                                        for (var key_dict in (obj[key]['anchors'])) {
                                                                            if (link_no === parseInt(requestedLink)) {
                                                                                window.open(obj[key]['anchors'][key_dict]);
                                                                            }
                                                                            link_no++;
                                                                        }
                                                                    } else {
                                                                        web_content += "This section do not contain any links";
                                                                    }
                                                                }
                                                            }
                                                            localStorage.setItem("myJson", response_global);
                                                        }
                                                    };
                                                });
                                            });
                                            web_st += web_content
                                        }
                                        // localStorage.clear();
                                        // utterance = new SpeechSynthesisUtterance(requestedInput);
                                        utterance = new SpeechSynthesisUtterance(web_st);
                                    }
                                });
                            }
                            //vision a paragraph from particular section
                            else if (event.results[i][0].transcript.toLowerCase().trim().includes("paragraph")) {
                                utterance = new SpeechSynthesisUtterance("To read a paragraph from particular section, give command like read paragraph one of section {section_name}. To read all paragraph from a particular section, give command read all paragraph of section {section_name}.");
                            }
                            //vision an image from particular section
                            else if (event.results[i][0].transcript.toLowerCase().trim().includes("image")) {
                                utterance = new SpeechSynthesisUtterance("To get discription of an image from particular section, give command like read image one of section {section_name}. To read all images from a particular section, give command read all images of section {section_name}.");
                            }
                            // vision activate TriNayan
                            else if (event.results[i][0].transcript.toLowerCase().trim().includes("activate")) {
                                var utterance = new SpeechSynthesisUtterance("Trinayan activated.");
                            }
                            // vision guide in speech
                            else if (event.results[i][0].transcript.toLowerCase().trim().includes("guide")) {
                                // var utterance = new SpeechSynthesisUtterance(`1) vision help
                                // Opens a page with all commands currently available in TriNayan, complete with a description and example if needed.

                                // 2) vision new tab
                                // Opens a new tab to chrome://newtab.

                                // 3) vision close tab
                                // Closes the active tab.

                                // 4) vision close chrome
                                // Closes Google Chrome.

                                // 5) vision go to {URL}
                                // Redirects the active tab to {URL}.
                                // e.g. vision go to reddit.com

                                // 6) vision scroll down
                                // Scrolls down the active web page by the height of the window minus 100 pixels.

                                // 7) vision scroll up
                                // Scrolls up the active web page by the height of the window minus 100 pixels.

                                // 8) vision back/vision go back
                                // Redirects the active tab back one page in history.

                                // 9) vision forward/vision go forward
                                // Redirects the active tab forward one page in history.

                                // 10) vision tab {TAB NUMBER}/vision go to tab {TAB NUMBER}
                                // Changes the active tab to the {TAB NUMBER}.
                                // e.g. vision go to tab 2

                                // 11) vision click on {LINK}
                                // Searches the active web page for the {LINK}.{LINK} can be just a snippet of the wanted link. Note that this command will not work for all web pages.
                                // e.g. vision click on home

                                // 12) vision click on {LINK} no spaces
                                // Searches the active web page for the {LINK} as all one word.{LINK} can be just a snippet of the wanted link. Note that this command will not work for all web pages.
                                // e.g. vision click on navi voice no spaces

                                // 13) vision input {STRING}/vision search {STRING}
                                // Fills the first text input field (if found) with {STRING}.
                                // e.g. vision search funny cat

                                // 14) vision explicit input {STRING} into {FIELD}/vision explicitly input {STRING} into {FIELD}
                                // Searches the active web page for a text field with the {FIELD} placeholder text and enters {STRING} into it. Useful if more than one text input field on web page.
                                // e.g. vision explicitly input nice picture into comment

                                // 15) vision submit/vision search/vision enter
                                // Submits the first text input field (if found) in the active web page. Usually used in conjunction with vision input {STRING}/vision search {STRING}.

                                // 16) vision google {STRING}
                                // Googles {STRING}.
                                // e.g. vision google dank memes

                                // 17) vision stop speaking
                                // Mutes the voice of TriNayan.

                                // 18) vision start speaking
                                // Unmutes the voice of TriNayan.

                                // 19) vision toggle
                                // Remove the 'vision ' prefix from commands. Commands are spoken as usual but without the 'vision ' prefix.

                                // 20) toggle
                                // Add the 'vision ' prefix to commands. Commands are spoken as usual but with the 'vision ' prefix.

                                // 21) vision play video
                                // Plays a YouTube video on the current page.

                                // 22) vision pause video
                                // Pauses a YouTube video on the current page.

                                // 23) vision mute video
                                // Mutes a YouTube video on the current page.

                                // 24) vision calculate {FORMULA}
                                // Calculates a mathematical formula. At this time, the command will only work with "add", "subtract", "multiplied by", and "divided by".
                                // e.g. vision calculate five plus two times seven`);
                                var utterance = new SpeechSynthesisUtterance(`1) vision help
                                Opens a page with all commands currently available in TriNayan, complete with a description and example if needed.
                                
                                2) vision new tab
                                Opens a new tab to chrome://newtab.`);
                            }
                            // vision go to
                            else if (event.results[i][0].transcript.toLowerCase().trim().includes("go to") && event.results[i][0].transcript.trim().length > 13) {
                                if (event.results[i][0].transcript.toLowerCase().trim().includes(".")) {
                                    var requestedUrl = event.results[i][0].transcript.toLowerCase().trim().substr(event.results[i][0].transcript.toLowerCase().trim().indexOf("go to") + 6, event.results[i][0].transcript.trim().length - 1).replace(/\s+/g, '');
                                    // reddit.com/r/ replace
                                    if (requestedUrl.includes("reddit.comslashareslash")) {
                                        requestedUrl = requestedUrl.replace("reddit.comslashareslash", "reddit.com/r/");
                                    }
                                    // if user doesn't say http:// then add http:// prefix
                                    if (requestedUrl.startsWith("http://") == false) {
                                        chrome.tabs.update({
                                            url: "http://" + requestedUrl
                                        });
                                    }
                                    else {
                                        chrome.tabs.update({
                                            url: requestedUrl
                                        });
                                    }
                                    utterance = new SpeechSynthesisUtterance("Redirecting you to '" + requestedUrl + "'.");
                                }
                                else {
                                    utterance = new SpeechSynthesisUtterance("Please specify a valid URL.");
                                }
                            }
                            // vision close tab
                            else if (event.results[i][0].transcript.toLowerCase().trim().includes("close") && event.results[i][0].transcript.toLowerCase().trim().includes("tab")) {
                                if (event.results[i][0].transcript.toLowerCase().trim().includes("1") || event.results[i][0].transcript.toLowerCase().trim().includes("2") || event.results[i][0].transcript.toLowerCase().trim().includes("3") || event.results[i][0].transcript.toLowerCase().trim().includes("4") || event.results[i][0].transcript.toLowerCase().trim().includes("5") || event.results[i][0].transcript.toLowerCase().trim().includes("6") || event.results[i][0].transcript.toLowerCase().trim().includes("7") || event.results[i][0].transcript.toLowerCase().trim().includes("8") || event.results[i][0].transcript.toLowerCase().trim().includes("9")) {
                                    var requestedTab = event.results[i][0].transcript.toLowerCase().trim().substr(event.results[i][0].transcript.toLowerCase().trim().indexOf("tab") + 4, event.results[i][0].transcript.toLowerCase().trim().length - 1);
                                    // console.log(requestedTab);
                                    chrome.tabs.query({}, function (tabs) {
                                        chrome.tabs.remove(tabs[parseInt(requestedTab) - 1].id);
                                    });
                                    utterance = new SpeechSynthesisUtterance("Closing tab " + requestedTab + ".");
                                }
                                else {
                                    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                                        chrome.tabs.remove(tabs[0].id);
                                    });
                                    utterance = new SpeechSynthesisUtterance("Closing tab.");
                                }
                            }
                            // vision close chrome
                            else if (event.results[i][0].transcript.toLowerCase().trim().includes("close chrome")) {
                                chrome.tabs.query({}, function (tabs) {
                                    for (var i = 0; i < tabs.length; i++) {
                                        chrome.tabs.remove(tabs[i].id);
                                    }
                                });
                            }
                            // vision scroll down
                            else if (event.results[i][0].transcript.toLowerCase().trim().includes("scroll down")) {
                                chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                    chrome.tabs.executeScript({
                                        code: "var height = $(window).height(); $('html, body').animate({scrollTop: '+=' + (height - 100) + 'px'}, 300);"
                                    });
                                });
                            }
                            // vision scroll up
                            else if (event.results[i][0].transcript.toLowerCase().trim().includes("scroll up")) {
                                chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                    chrome.tabs.executeScript({
                                        code: "var height = $(window).height(); $('html, body').animate({scrollTop: '-=' + (height - 100) + 'px'}, 300);"
                                    });
                                });
                            }
                            // vision go back
                            else if (event.results[i][0].transcript.toLowerCase().trim().includes("back") && event.results[i][0].transcript.toLowerCase().trim().includes("go to") == false) {
                                chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                    chrome.tabs.executeScript({
                                        code: "window.history.back();"
                                    });
                                });
                                utterance = new SpeechSynthesisUtterance("Going backwards.");
                            }
                            // vision go forward
                            else if (event.results[i][0].transcript.toLowerCase().trim().includes("forward") && event.results[i][0].transcript.toLowerCase().trim().includes("go to") == false) {
                                chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                    chrome.tabs.executeScript({
                                        code: "window.history.forward();"
                                    });
                                });
                                utterance = new SpeechSynthesisUtterance("Going forwards.");
                            }
                            // vision go to tab
                            else if (event.results[i][0].transcript.toLowerCase().trim().substr(7, event.results[i][0].transcript.trim().length - 1).startsWith("go to tab") || event.results[i][0].transcript.toLowerCase().trim().substr(7, event.results[i][0].transcript.trim().length - 1).startsWith("tab")) {
                                var requestedTab = event.results[i][0].transcript.toLowerCase().trim().substr(event.results[i][0].transcript.toLowerCase().trim().indexOf("tab") + 4, event.results[i][0].transcript.trim().length - 1);
                                chrome.tabs.query({}, function (tabs) {
                                    chrome.tabs.update(tabs[parseInt(requestedTab) - 1].id, { selected: true });
                                });
                                utterance = new SpeechSynthesisUtterance("Switching to tab '" + requestedTab + "'.");
                            }
                            // vision click on
                            else if (event.results[i][0].transcript.toLowerCase().trim().substr(7, event.results[i][0].transcript.trim().length - 1).startsWith("click on") && event.results[i][0].transcript.toLowerCase().trim().endsWith("no spaces") == false && event.results[i][0].transcript.toLowerCase().trim().substr(7, event.results[i][0].transcript.trim().length - 1).startsWith("click on link ") == false && event.results[i][0].transcript.toLowerCase().trim().length > 16) {
                                var requestedLink = event.results[i][0].transcript.toLowerCase().trim().substr(16, event.results[i][0].transcript.toLowerCase().trim().length - 1);
                                chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                    chrome.tabs.executeScript({
                                        code: "jQuery.expr[':'].Contains = jQuery.expr.createPseudo(function(arg) { return function( elem ) { return jQuery(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0; }; }); window.location.href = $('a:Contains(\"" + requestedLink + "\")').attr('href');"
                                    });
                                });
                                utterance = new SpeechSynthesisUtterance("Clicking on '" + requestedLink + "'.");
                            }
                            // vision click on no spaces
                            else if (event.results[i][0].transcript.toLowerCase().trim().substr(7, event.results[i][0].transcript.trim().length - 1).startsWith("click on") && event.results[i][0].transcript.toLowerCase().trim().substr(7, event.results[i][0].transcript.trim().length - 1).startsWith("click on link ") == false && event.results[i][0].transcript.toLowerCase().trim().endsWith("no spaces") && event.results[i][0].transcript.toLowerCase().trim().length > 26) {
                                var requestedLink = event.results[i][0].transcript.toLowerCase().trim().substr(15, event.results[i][0].transcript.toLowerCase().trim().length - 25).replace(/\s+/g, '');
                                // console.log(requestedLink);
                                chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                    chrome.tabs.executeScript({
                                        code: "jQuery.expr[':'].Contains = jQuery.expr.createPseudo(function(arg) { return function( elem ) { return jQuery(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0; }; }); window.location.href = $('a:Contains(\"" + requestedLink + "\")').attr('href');"
                                    });
                                });
                                utterance = new SpeechSynthesisUtterance("Clicking on '" + requestedLink + "'.");
                            }
                            // vision input
                            else if (event.results[i][0].transcript.toLowerCase().trim().substr(7, event.results[i][0].transcript.trim().length - 1).startsWith("input") || event.results[i][0].transcript.toLowerCase().trim().substr(7, event.results[i][0].transcript.trim().length - 1).startsWith("search") && event.results[i][0].transcript.toLowerCase().trim().length > 13) {
                                var requestedInput = event.results[i][0].transcript.toLowerCase().trim().substr(13, event.results[i][0].transcript.toLowerCase().trim().length - 1).trim();
                                chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                    chrome.tabs.executeScript({
                                        code: "$('input[type=\"text\"]').val('" + requestedInput + "');"
                                    });
                                });
                                utterance = new SpeechSynthesisUtterance("Inputting '" + requestedInput + "'.");
                            }
                            // vision explicit input
                            else if (event.results[i][0].transcript.toLowerCase().trim().substr(7, event.results[i][0].transcript.trim().length - 1).startsWith("explicit input") && event.results[i][0].transcript.toLowerCase().trim().length > 22) {
                                var requestedExplicitInput = event.results[i][0].transcript.toLowerCase().trim().substr(22, event.results[i][0].transcript.toLowerCase().trim().indexOf("into") - 23);
                                var requestedField = event.results[i][0].transcript.toLowerCase().trim().substr(event.results[i][0].transcript.toLowerCase().trim().indexOf("into") + 4, event.results[i][0].transcript.toLowerCase().trim().length - 1).trim();
                                // console.log(requestedExplicitInput);
                                // console.log(requestedField);
                                chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                    chrome.tabs.executeScript({
                                        code: "$('input[type=\"text\"][placeholder=\"" + requestedField + "\" i]').val('" + requestedExplicitInput + "');"
                                    });
                                });
                                utterance = new SpeechSynthesisUtterance("Explicitly inputting '" + requestedExplicitInput + "' into '" + requestedField + "'.");
                            }
                            // vision explicitly input
                            else if (event.results[i][0].transcript.toLowerCase().trim().substr(7, event.results[i][0].transcript.trim().length - 1).startsWith("explicitly input") && event.results[i][0].transcript.toLowerCase().trim().length > 24) {
                                var requestedExplicitInput = event.results[i][0].transcript.toLowerCase().trim().substr(24, event.results[i][0].transcript.toLowerCase().trim().indexOf("into") - 25);
                                var requestedField = event.results[i][0].transcript.toLowerCase().trim().substr(event.results[i][0].transcript.toLowerCase().trim().indexOf("into") + 4, event.results[i][0].transcript.toLowerCase().trim().length - 1).trim();
                                // console.log(requestedExplicitInput);
                                // console.log(requestedField);
                                chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                    chrome.tabs.executeScript({
                                        code: "$('input[type=\"text\"][placeholder=\"" + requestedField + "\" i]').val('" + requestedExplicitInput + "');"
                                    });
                                });
                                utterance = new SpeechSynthesisUtterance("Explicitly inputting '" + requestedExplicitInput + "' into '" + requestedField + "'.");
                            }
                            // vision skip video
                            else if ((event.results[i][0].transcript.toLowerCase().trim().substr(7, event.results[i][0].transcript.trim().length - 1) == "skip video")) {
                                chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
                                    var url = tabs[0].url;
                                    if (url.startsWith("https://www.youtube.com")) {
                                        chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                            chrome.tabs.executeScript({
                                                code: "$('.ytp-ad-skip-button')[0].click();"
                                            });
                                        });
                                    }
                                });
                                utterance = new SpeechSynthesisUtterance("Skipping ad.");
                            }
                            // vision submit
                            else if ((event.results[i][0].transcript.toLowerCase().trim().substr(7, event.results[i][0].transcript.trim().length - 1) == "search" || event.results[i][0].transcript.toLowerCase().trim().substr(7, event.results[i][0].transcript.trim().length - 1) == "submit" || event.results[i][0].transcript.toLowerCase().trim().substr(7, event.results[i][0].transcript.trim().length - 1) == "enter") && event.results[i][0].transcript.trim().length < 14) {
                                chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
                                    var url = tabs[0].url;
                                    if (url.startsWith("https://www.google.com/search?")) {
                                        chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                            chrome.tabs.executeScript({
                                                code: "$('.Tg7LZd')[0].click();"
                                                //$('button[type=\"submit\"]').trigger('click');
                                            });
                                        });
                                    }
                                    else if (url.startsWith("https://www.google.com")) {
                                        chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                            chrome.tabs.executeScript({
                                                code: "$('.gNO89b')[0].click();"
                                                //$('button[type=\"submit\"]').trigger('click');
                                            });
                                        });
                                    }
                                    else if (url.startsWith("https://www.youtube.com")) {
                                        chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                            chrome.tabs.executeScript({
                                                code: "$('.style-scope')[0].click();"
                                                // code: "$('#search-icon-legacy').trigger('click');"
                                                // code: "window.getElementById('search-icon-legacy').trigger('click');"
                                                //$('button[type=\"submit\"]').trigger('click');
                                            });
                                        });
                                    }
                                    else if (url.startsWith("https://www.wikipedia.org/")) {
                                        chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                            chrome.tabs.executeScript({
                                                code: "$('.pure-button')[0].click();"
                                                //$('button[type=\"submit\"]').trigger('click');
                                            });
                                        });
                                    }
                                    // if (url.startsWith("https://www.reddit.com")) {
                                    //     chrome.tabs.executeScript(null, {file: "scripts/jquery-3.1.1.min.js"}, function () {
                                    //         chrome.tabs.executeScript({
                                    //             code: "$('input[type=\"text\"]').parent().find('input[type=\"submit\"]').trigger('click');"
                                    //             //$('button[type=\"submit\"]').trigger('click');
                                    //         });
                                    //     });
                                    // 
                                    else {
                                        chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                            chrome.tabs.executeScript({
                                                code: "$('button[type=\"submit\"]').trigger('click');"
                                                //$('button[type=\"submit\"]').trigger('click');
                                            });
                                        });
                                    }
                                });
                                utterance = new SpeechSynthesisUtterance("Submitting input.");
                            }
                            // vision google
                            else if (event.results[i][0].transcript.toLowerCase().trim().substr(7, event.results[i][0].transcript.trim().length - 1).startsWith("google")) {
                                var requestedSearch = event.results[i][0].transcript.toLowerCase().trim().substr(14, event.results[i][0].transcript.trim().length - 1);
                                chrome.tabs.update({
                                    url: "https://www.google.com/search?q=" + requestedSearch.split(' ').join('+')
                                });
                            }
                            // vision open a new document
                            else if (event.results[i][0].transcript.toLowerCase().trim().substr(7, event.results[i][0].transcript.trim().length - 1).startsWith("open a new document")) {
                                chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                    chrome.tabs.executeScript({
                                        code: "$('.docs-homescreen-templates-templateview-preview')[0].click();"
                                        //$('button[type=\"submit\"]').trigger('click');
                                    });
                                });
                                utterance = new SpeechSynthesisUtterance("Opening a new document.");
                            }
                            // vision help
                            else if (event.results[i][0].transcript.toLowerCase().trim().substr(7, event.results[i][0].transcript.trim().length - 1) == "help") {
                                window.open("https://trinayan.netlify.app/")
                                utterance = new SpeechSynthesisUtterance("Opening help.");
                            }
                            // vision toggle
                            else if (event.results[i][0].transcript.toLowerCase().trim().substr(7, event.results[i][0].transcript.trim().length - 1) == "toggle") {
                                var prefix = 'off';
                                chrome.storage.sync.set({ 'prefix': prefix });
                                utterance = new SpeechSynthesisUtterance("Prefix has been turned off. You will now say commands without the 'vision' prefix.");
                            }
                            // vision othello reversi
                            // else if (event.results[i][0].transcript.toLowerCase().trim().substr(7, event.results[i][0].transcript.trim().length - 1) == "othello reversi") {
                            //     chrome.tabs.create({ url: "https://misscaptainalex.files.wordpress.com/2013/05/210.gif" });
                            //     utterance = new SpeechSynthesisUtterance("JULIAN BOOLEAN!");
                            // }
                            // vision pause video
                            else if (event.results[i][0].transcript.toLowerCase().trim().substr(7, event.results[i][0].transcript.trim().length - 1) == ("pause video") || event.results[i][0].transcript.toLowerCase().trim().substr(7, event.results[i][0].transcript.trim().length - 1) == ("play video") || event.results[i][0].transcript.toLowerCase().trim().substr(7, event.results[i][0].transcript.trim().length - 1) == ("paws video")) {
                                chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                    chrome.tabs.executeScript({
                                        code: "$('.ytp-play-button').click();"
                                    });
                                });
                            }
                            // vision mute video
                            else if (event.results[i][0].transcript.toLowerCase().trim().substr(7, event.results[i][0].transcript.trim().length - 1) == ("mute video")) {
                                chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                    chrome.tabs.executeScript({
                                        code: "$('.ytp-mute-button').click();"
                                    });
                                });
                            }
                            // vision calculate
                            else if (event.results[i][0].transcript.toLowerCase().trim().substr(7, event.results[i][0].transcript.trim().length - 1).startsWith("calculate")) {
                                var answer = eval(event.results[i][0].transcript.toLowerCase().trim().substr(17, event.results[i][0].transcript.trim().length - 1).replace("divided by", "/").replace("multiplied by", "*").replace("x", "*").replace("times", "*"));
                                answer = answer.toString();
                                utterance = new SpeechSynthesisUtterance(event.results[i][0].transcript.toLowerCase().trim().substr(17, event.results[i][0].transcript.trim().length - 1) + " is " + answer);
                            }
                            // vision list links
                            else if (event.results[i][0].transcript.toLowerCase().trim().includes("list links") || event.results[i][0].transcript.toLowerCase().trim().includes("list link")) {
                                /*chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                                    chrome.tabs.insertCSS(tabs[0].id, {code: "body{counter-reset: linkCtr 0;} a{counter-increment: linkCtr 1;} a:before{content:'[' counter(linkCtr) ']';}"});
                                });*/
                                chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                    chrome.tabs.executeScript({
                                        code: "$('a').html(function(index, html) { return html + \"<span style='background-color:white;position:absolute;z-index:100;'>[\" + (index + 1) + \"]</span>\"; })"
                                    });
                                });
                                utterance = new SpeechSynthesisUtterance("Listing links.");
                            }
                            // vision click on link #
                            else if (event.results[i][0].transcript.toLowerCase().trim().includes("click on link") || event.results[i][0].transcript.toLowerCase().trim().includes("quick on link") && event.results[i][0].transcript.trim().length > 18) {
                                var linkNum = event.results[i][0].transcript.toLowerCase().trim().substr(event.results[i][0].transcript.toLowerCase().trim().indexOf("link") + 5, event.results[i][0].transcript.trim().length - 1);
                                chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                    chrome.tabs.executeScript({
                                        code: "window.location.href = $('a:contains(\"[" + parseInt(linkNum) + "]\")').attr('href');"
                                    });
                                });
                                utterance = new SpeechSynthesisUtterance("Clicking on link " + linkNum + ".");
                            }
                            // vision history
                            else if (event.results[i][0].transcript.toLowerCase().trim().substr(7, event.results[i][0].transcript.trim().length - 1) == "history") {
                                chrome.tabs.update({
                                    url: "chrome://history"
                                });
                                utterance = new SpeechSynthesisUtterance("Showing you your history.");
                            }
                            // vision extensions
                            else if (event.results[i][0].transcript.toLowerCase().trim().substr(7, event.results[i][0].transcript.trim().length - 1) == "extensions") {
                                chrome.tabs.update({
                                    url: "chrome://extensions"
                                });
                                utterance = new SpeechSynthesisUtterance("Showing you your extensions.");
                            }
                            // vision downloads
                            else if (event.results[i][0].transcript.toLowerCase().trim().substr(7, event.results[i][0].transcript.trim().length - 1) == "downloads") {
                                chrome.tabs.update({
                                    url: "chrome://downloads"
                                });
                                utterance = new SpeechSynthesisUtterance("Showing you your downloads.");
                            }
                            // vision (without follow up command)
                            else if (event.results[i][0].transcript.toLowerCase().trim() == ("chrome")) {
                                utterance = new SpeechSynthesisUtterance(whatResponses[Math.floor(Math.random() * whatResponses.length)]);
                            }
                            // vision reload
                            else if (event.results[i][0].transcript.toLowerCase().trim().substr(7, event.results[i][0].transcript.trim().length - 1) == "reload") {
                                chrome.tabs.query({ active: true, currentWindow: true }, function (arrayOfTabs) {
                                    var code = 'window.location.reload();';
                                    chrome.tabs.executeScript(arrayOfTabs[0].id, { code: code });
                                });
                            }
                            // vision stop listening
                            else if (event.results[i][0].transcript.toLowerCase().trim().includes("stop listening")) {
                                chrome.management.getSelf(function (result) {
                                    chrome.management.setEnabled(result.id, false)
                                });
                            }
                            // vision change theme
                            // else if (event.results[i][0].transcript.toLowerCase().trim().includes("change")) {
                            //     chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                            //         chrome.tabs.executeScript({
                            //             code: "$('div').filter(function() { return this.element.style['background-color'] == 'red'; });"
                            //         });
                            //     });
                            //     utterance = new SpeechSynthesisUtterance("Changing theme.");
                            // }
                            else {
                                utterance = new SpeechSynthesisUtterance("I don't understand " + event.results[i][0].transcript);
                            }
                            // if voice variable is set to on
                            var voice = "";
                            chrome.storage.sync.get('voice', function (result) {
                                voice = result.voice;
                                if (voice == "on") {
                                    window.speechSynthesis.speak(utterance);
                                }
                            });
                        }
                    }
                    // vision prefix off
                    else if (prefix == "off") {
                        // Results are final
                        // console.log("words said:" + event.results[i][0].transcript);
                        var utterance = new SpeechSynthesisUtterance("");
                        var voices = window.speechSynthesis.getVoices();
                        utterance.lang = "en-IN";
                        utterance.voice = voices.filter(function (voice) { return voice.name == 'Rishi'; })[0];
                        // new tab
                        if (event.results[i][0].transcript.toLowerCase().trim().includes("new tab")) {
                            chrome.tabs.create({ url: "chrome://newtab" });
                            var utterance = new SpeechSynthesisUtterance("Opening a new tab.");
                        }
                        // vision start website reader
                        else if (event.results[i][0].transcript.toLowerCase().trim().includes("start website reader")) {
                            utterance = new SpeechSynthesisUtterance("website reader initiated, what would you like to listen to? website structure or website content");
                        }
                        // vision what is website structure?
                        else if (event.results[i][0].transcript.toLowerCase().trim().includes("what is website structure")) {
                            utterance = new SpeechSynthesisUtterance("Give website structure command to get the structure of the entire page, from paragraphs to images, everything will be informed for every section.");
                        }
                        // vision what is website content?
                        else if (event.results[i][0].transcript.toLowerCase().trim().includes("what is website content")) {
                            utterance = new SpeechSynthesisUtterance("The content will be split according to the web page sections and the user can listen to specific paragraph or image discription of it for a particular section.");
                        }
                        // vision current page
                        else if (event.results[i][0].transcript.toLowerCase().trim().includes("current page")) {
                            // var msg = "Wikipedia page for " + main_heading + " is open. " + "Page consists of " + (len - 2) + " sections. ";
                            var web_st = "";

                            if (localStorage.getItem("myJson") !== null) {
                                var passedJson = localStorage.getItem("myJson"); //get saved data anytime
                                var obj = JSON.parse(passedJson);
                                // console.log(obj)

                                var key = Object.keys(obj);
                                var len = key.length;
                                var main_heading = Object.keys(obj)[len - 1];

                                var web_structure = "Wikipedia page for " + main_heading + " is open. "

                                web_st += web_structure
                                // localStorage.clear();
                            } else {
                                var response_global = ""
                                var web_structure

                                window.addEventListener('DOMContentLoaded', (event) => {

                                    var url = "fetching url";

                                    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                                        url = tabs[0].url

                                        var xhttp = new XMLHttpRequest();

                                        xhttp.open("POST", "http://127.0.0.1:5000/read_page");
                                        xhttp.send("url=" + tabs[0].url);


                                        xhttp.onreadystatechange = function () {
                                            if (this.readyState == 4 && this.status == 200) {
                                                response_global = this.responseText;

                                                var obj = JSON.parse(response_global);

                                                // console.log(obj);

                                                var key = Object.keys(obj);
                                                var len = key.length;
                                                var main_heading = Object.keys(obj)[len - 1];
                                                document.getElementById("header1").innerHTML = "URL:" + url;

                                                web_structure = "Wikipedia page for " + main_heading + " is open. "

                                                localStorage.setItem("myJson", response_global);
                                            }
                                        };
                                    });
                                });
                                web_st += web_structure
                            }
                            // localStorage.clear();
                            utterance = new SpeechSynthesisUtterance(web_st);
                        }
                        // vision give sections (tells only the different section on the page)
                        else if (event.results[i][0].transcript.toLowerCase().trim().includes("give page sections")) {
                            // var msg = "Wikipedia page for " + main_heading + " is open. " + "Page consists of " + (len - 2) + " sections. ";
                            var web_st = "";

                            if (localStorage.getItem("myJson") !== null) {
                                var passedJson = localStorage.getItem("myJson"); //get saved data anytime
                                var obj = JSON.parse(passedJson);
                                // console.log(obj)

                                var key = Object.keys(obj);
                                var len = key.length;

                                var web_structure = (len - 2) + " sections on the page are "

                                var count = 1;
                                for (var key in obj) {
                                    if (count == (len - 2)) {
                                        break
                                    }
                                    var ad = count + " " + key;
                                    web_structure += ad;
                                    count++;
                                }
                                web_st += web_structure
                                // localStorage.clear();
                            } else {
                                var response_global = ""
                                var web_structure

                                window.addEventListener('DOMContentLoaded', (event) => {

                                    var url = "fetching url";

                                    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                                        url = tabs[0].url

                                        var xhttp = new XMLHttpRequest();

                                        xhttp.open("POST", "http://127.0.0.1:5000/read_page");
                                        xhttp.send("url=" + tabs[0].url);


                                        xhttp.onreadystatechange = function () {
                                            if (this.readyState == 4 && this.status == 200) {
                                                response_global = this.responseText;

                                                var obj = JSON.parse(response_global);

                                                // console.log(obj);

                                                var key = Object.keys(obj);
                                                var len = key.length;

                                                web_structure = (len - 2) + " sections on the page are "

                                                var count = 1;
                                                for (var key in obj) {
                                                    if (count == (len - 2)) {
                                                        break
                                                    }
                                                    var ad = count + " " + key;
                                                    web_structure += ad;
                                                    count++;
                                                }

                                                localStorage.setItem("myJson", response_global);
                                            }
                                        };
                                    });
                                });
                                web_st += web_structure
                            }
                            // localStorage.clear();
                            utterance = new SpeechSynthesisUtterance(web_st);
                        }
                        // vision give website structure
                        else if (event.results[i][0].transcript.toLowerCase().trim().includes("give website structure")) {
                            // var msg = "Wikipedia page for " + main_heading + " is open. " + "Page consists of " + (len - 2) + " sections. ";
                            var web_st = "";

                            if (localStorage.getItem("myJson") !== null) {
                                var passedJson = localStorage.getItem("myJson"); //get saved data anytime
                                var obj = JSON.parse(passedJson);
                                // console.log(obj)

                                var key = Object.keys(obj);
                                var len = key.length;
                                var main_heading = Object.keys(obj)[len - 1];

                                var web_structure = "Wikipedia page for " + main_heading + " is open. " + "Page consists of " + (len - 2) + " sections. "

                                var count = 1;
                                for (var key in obj) {
                                    if (key === 'See also') {
                                        break
                                    }
                                    var app_txt = "Section " + count + " is about '" + key + "' consisting of " + obj[key]['para'].length + " paragraphs and " + obj[key]['images'].length + " images. "
                                    web_structure += app_txt;
                                    count++;
                                }
                                web_st += web_structure
                                // localStorage.clear();
                            } else {
                                var response_global = ""
                                var web_structure

                                window.addEventListener('DOMContentLoaded', (event) => {

                                    var url = "fetching url";

                                    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                                        url = tabs[0].url

                                        var xhttp = new XMLHttpRequest();

                                        xhttp.open("POST", "http://127.0.0.1:5000/read_page");
                                        xhttp.send("url=" + tabs[0].url);


                                        xhttp.onreadystatechange = function () {
                                            if (this.readyState == 4 && this.status == 200) {
                                                response_global = this.responseText;

                                                var obj = JSON.parse(response_global);

                                                // console.log(obj);

                                                var key = Object.keys(obj);
                                                var len = key.length;
                                                var main_heading = Object.keys(obj)[len - 1];

                                                web_structure = "Wikipedia page for " + main_heading + " is open. " + "Page consists of " + (len - 2) + " sections. "

                                                var count = 1;
                                                for (var key in obj) {
                                                    if (key === 'See also') {
                                                        break
                                                    }
                                                    var app_txt = "Section " + count + " is about '" + key + "' consisting of " + obj[key]['para'].length + " paragraphs and " + obj[key]['images'].length + " images. "
                                                    web_structure += app_txt;
                                                    count++;
                                                }

                                                localStorage.setItem("myJson", response_global);
                                            }
                                        };
                                    });
                                });
                                web_st += web_structure
                            }
                            // localStorage.clear();
                            utterance = new SpeechSynthesisUtterance(web_st);
                        }
                        // Vision initiate web content
                        else if (event.results[i][0].transcript.toLowerCase().trim().includes("initiate web content")) {
                            utterance = new SpeechSynthesisUtterance("web content initiated, what would you like to read? A paragraph from a particular section or an image from a particular section.");
                        }
                        // vision read section {section_name}
                        else if (event.results[i][0].transcript.toLowerCase().trim().includes("read section")) {
                            var requestedInput = event.results[i][0].transcript.toLowerCase().trim().substr(19, event.results[i][0].transcript.toLowerCase().trim().length - 1).trim();
                            // var msg = "Wikipedia page for " + main_heading + " is open. " + "Page consists of " + (len - 2) + " sections. ";
                            var web_st = "";

                            if (localStorage.getItem("myJson") !== null) {
                                var passedJson = localStorage.getItem("myJson"); //get saved data anytime
                                var obj = JSON.parse(passedJson);
                                // console.log(obj)

                                var key = Object.keys(obj);
                                var len = key.length;

                                var web_content = ""

                                // Displays section heading and all its paragraphs
                                for (var key in obj) {
                                    if (key.toLowerCase() === requestedInput) {
                                        web_content += "Reading Section " + key + " ";
                                        if (obj[key]['para'].length > 0) {
                                            for (var para in obj[key]['para']) {
                                                web_content += obj[key]['para'][para] + " ";
                                            }
                                        }
                                    }
                                }
                                web_st += web_content;
                            } else {
                                var response_global = ""
                                var web_content

                                window.addEventListener('DOMContentLoaded', (event) => {

                                    var url = "fetching url";

                                    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                                        url = tabs[0].url

                                        var xhttp = new XMLHttpRequest();

                                        xhttp.open("POST", "http://127.0.0.1:5000/read_page");
                                        xhttp.send("url=" + tabs[0].url);


                                        xhttp.onreadystatechange = function () {
                                            if (this.readyState == 4 && this.status == 200) {
                                                response_global = this.responseText;


                                                var obj = JSON.parse(response_global);

                                                // console.log(obj);

                                                var key = Object.keys(obj);
                                                var len = key.length;

                                                web_content = ""

                                                // Displays section heading and all its paragraphs
                                                for (var key in obj) {
                                                    if (key.toLowerCase() === requestedInput) {
                                                        web_content += "Reading Section " + key + " ";
                                                        if (obj[key]['para'].length > 0) {
                                                            for (var para in obj[key]['para']) {
                                                                web_content += obj[key]['para'][para] + " ";
                                                            }
                                                        }
                                                    }
                                                }
                                                localStorage.setItem("myJson", response_global);
                                            }
                                        };
                                    });
                                });
                                web_st += web_content
                            }
                            // localStorage.clear();
                            // utterance = new SpeechSynthesisUtterance(requestedInput);
                            utterance = new SpeechSynthesisUtterance(web_st);
                            // console.log(requestedInput);
                        }
                        // vision read para one of section {section_name}
                        else if (event.results[i][0].transcript.toLowerCase().trim().includes("read para")) {
                            var requestedPara = event.results[i][0].transcript.toLowerCase().trim().substr(event.results[i][0].transcript.toLowerCase().trim().indexOf("para") + 4, event.results[i][0].transcript.toLowerCase().trim().indexOf("of") - 17);
                            var requestedSection = event.results[i][0].transcript.toLowerCase().trim().substr(event.results[i][0].transcript.toLowerCase().trim().indexOf("section") + 8, event.results[i][0].transcript.toLowerCase().trim().length - 1);
                            // var v_msg = "Want to read paragraph " + parseInt(requestedPara) + " of section " + requestedSection + ".";
                            var web_st = "";

                            if (localStorage.getItem("myJson") !== null) {
                                var passedJson = localStorage.getItem("myJson"); //get saved data anytime
                                var obj = JSON.parse(passedJson);
                                // console.log(obj)

                                var key = Object.keys(obj);
                                var len = key.length;

                                var web_content = ""

                                // Displays section heading and all its paragraphs
                                for (var key in obj) {
                                    if (key.toLowerCase() === requestedSection) {
                                        if (obj[key]['para'].length > 0) {
                                            web_content += "Reading paragraph " + requestedPara + " of section " + key + ". ";
                                            var para_no = 1;
                                            for (var para in obj[key]['para']) {
                                                if (para_no === parseInt(requestedPara)) {
                                                    web_content += obj[key]['para'][para] + " ";
                                                }
                                                para_no++;
                                            }
                                        } else {
                                            web_content += "This section do not contain any paragraph";
                                        }
                                    }
                                }
                                web_st += web_content;
                            } else {
                                var response_global = ""
                                var web_content

                                window.addEventListener('DOMContentLoaded', (event) => {

                                    var url = "fetching url";

                                    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                                        url = tabs[0].url

                                        var xhttp = new XMLHttpRequest();

                                        xhttp.open("POST", "http://127.0.0.1:5000/read_page");
                                        xhttp.send("url=" + tabs[0].url);


                                        xhttp.onreadystatechange = function () {
                                            if (this.readyState == 4 && this.status == 200) {
                                                response_global = this.responseText;


                                                var obj = JSON.parse(response_global);

                                                // console.log(obj);

                                                var key = Object.keys(obj);
                                                var len = key.length;

                                                web_content = ""

                                                // Displays section heading and all its paragraphs
                                                for (var key in obj) {
                                                    if (key.toLowerCase() === requestedSection) {
                                                        if (obj[key]['para'].length > 0) {
                                                            web_content += "Reading paragraph " + requestedPara + " of section " + key + ". ";
                                                            var para_no = 1;
                                                            for (var para in obj[key]['para']) {
                                                                if (para_no === parseInt(requestedPara)) {
                                                                    web_content += obj[key]['para'][para] + " ";
                                                                }
                                                                para_no++;
                                                            }
                                                        } else {
                                                            web_content += "This section do not contain any paragraph";
                                                        }
                                                    }
                                                }
                                                localStorage.setItem("myJson", response_global);
                                            }
                                        };
                                    });
                                });
                                web_st += web_content
                            }
                            // localStorage.clear();
                            // utterance = new SpeechSynthesisUtterance(requestedInput);
                            utterance = new SpeechSynthesisUtterance(web_st);
                            // utterance = new SpeechSynthesisUtterance(v_msg);
                        }
                        // vision read all images of section {section_name}
                        else if (event.results[i][0].transcript.toLowerCase().trim().includes("read all images of section")) {
                            var requestedInput = event.results[i][0].transcript.toLowerCase().trim().substr(33, event.results[i][0].transcript.toLowerCase().trim().length - 1).trim();
                            // var msg = "Wikipedia page for " + main_heading + " is open. " + "Page consists of " + (len - 2) + " sections. ";
                            var web_st = "";

                            if (localStorage.getItem("myJson") !== null) {
                                var passedJson = localStorage.getItem("myJson"); //get saved data anytime
                                var obj = JSON.parse(passedJson);
                                // console.log(obj)

                                var key = Object.keys(obj);
                                var len = key.length;

                                var web_content = ""

                                // Displays section heading and all its paragraphs
                                for (var key in obj) {
                                    if (key.toLowerCase() === requestedInput) {
                                        web_content += "Reading images of section " + key + ". ";
                                        if (obj[key]['images'].length > 0) {
                                            var img_no = 1;
                                            for (var img in obj[key]['images']) {
                                                web_content += "Reading image " + img_no + ". " + obj[key]['images'][img] + "...    ";
                                                img_no++;
                                            }
                                        }
                                    }
                                }
                                web_st += web_content;
                            } else {
                                var response_global = ""
                                var web_content

                                window.addEventListener('DOMContentLoaded', (event) => {

                                    var url = "fetching url";

                                    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                                        url = tabs[0].url

                                        var xhttp = new XMLHttpRequest();

                                        xhttp.open("POST", "http://127.0.0.1:5000/read_page");
                                        xhttp.send("url=" + tabs[0].url);


                                        xhttp.onreadystatechange = function () {
                                            if (this.readyState == 4 && this.status == 200) {
                                                response_global = this.responseText;


                                                var obj = JSON.parse(response_global);

                                                // console.log(obj);

                                                var key = Object.keys(obj);
                                                var len = key.length;

                                                web_content = ""

                                                // Displays section heading and all its paragraphs
                                                for (var key in obj) {
                                                    if (key.toLowerCase() === requestedInput) {
                                                        web_content += "Reading images of section " + key + ". ";
                                                        if (obj[key]['images'].length > 0) {
                                                            var img_no = 1;
                                                            for (var img in obj[key]['images']) {
                                                                web_content += "Reading image " + img_no + ". " + obj[key]['images'][img] + "...    ";
                                                                img_no++;
                                                            }
                                                        }
                                                    }
                                                }
                                                localStorage.setItem("myJson", response_global);
                                            }
                                        };
                                    });
                                });
                                web_st += web_content
                            }
                            // localStorage.clear();
                            // utterance = new SpeechSynthesisUtterance(requestedInput);
                            utterance = new SpeechSynthesisUtterance(web_st);
                            // console.log(requestedInput);
                        }
                        // vision read image one of section {section_name}
                        else if (event.results[i][0].transcript.toLowerCase().trim().includes("read image")) {
                            var requestedImg = event.results[i][0].transcript.toLowerCase().trim().substr(event.results[i][0].transcript.toLowerCase().trim().indexOf("image") + 6, event.results[i][0].transcript.toLowerCase().trim().indexOf("of") - 19);
                            var requestedSection = event.results[i][0].transcript.toLowerCase().trim().substr(event.results[i][0].transcript.toLowerCase().trim().indexOf("section") + 8, event.results[i][0].transcript.toLowerCase().trim().length - 1);
                            // var v_msg = "Want to read paragraph " + parseInt(requestedImg) + " of section " + requestedSection + ".";
                            var web_st = "";

                            if (localStorage.getItem("myJson") !== null) {
                                var passedJson = localStorage.getItem("myJson"); //get saved data anytime
                                var obj = JSON.parse(passedJson);
                                // console.log(obj)

                                var key = Object.keys(obj);
                                var len = key.length;

                                var web_content = ""

                                // Displays section heading and all its paragraphs
                                for (var key in obj) {
                                    if (key.toLowerCase() === requestedSection) {
                                        if (obj[key]['images'].length > 0) {
                                            web_content += "Reading image " + requestedImg + " of section " + key + ". ";
                                            var para_no = 1;
                                            for (var para in obj[key]['images']) {
                                                if (para_no === parseInt(requestedImg)) {
                                                    web_content += obj[key]['images'][para] + " ";
                                                }
                                                para_no++;
                                            }
                                        } else {
                                            web_content += "This section do not contain any image";
                                        }
                                    }
                                }
                                web_st += web_content;
                            } else {
                                var response_global = ""
                                var web_content

                                window.addEventListener('DOMContentLoaded', (event) => {

                                    var url = "fetching url";

                                    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                                        url = tabs[0].url

                                        var xhttp = new XMLHttpRequest();

                                        xhttp.open("POST", "http://127.0.0.1:5000/read_page");
                                        xhttp.send("url=" + tabs[0].url);


                                        xhttp.onreadystatechange = function () {
                                            if (this.readyState == 4 && this.status == 200) {
                                                response_global = this.responseText;


                                                var obj = JSON.parse(response_global);

                                                // console.log(obj);

                                                var key = Object.keys(obj);
                                                var len = key.length;

                                                web_content = ""

                                                // Displays section heading and all its paragraphs
                                                for (var key in obj) {
                                                    if (key.toLowerCase() === requestedSection) {
                                                        if (obj[key]['images'].length > 0) {
                                                            web_content += "Reading image " + requestedImg + " of section " + key + ". ";
                                                            var para_no = 1;
                                                            for (var para in obj[key]['images']) {
                                                                if (para_no === parseInt(requestedImg)) {
                                                                    web_content += obj[key]['images'][para] + " ";
                                                                }
                                                                para_no++;
                                                            }
                                                        } else {
                                                            web_content += "This section do not contain any image";
                                                        }
                                                    }
                                                }
                                                localStorage.setItem("myJson", response_global);
                                            }
                                        };
                                    });
                                });
                                web_st += web_content
                            }
                            // localStorage.clear();
                            // utterance = new SpeechSynthesisUtterance(requestedInput);
                            utterance = new SpeechSynthesisUtterance(web_st);
                            // utterance = new SpeechSynthesisUtterance(v_msg);
                        }
                        //vision a paragraph from particular section
                        else if (event.results[i][0].transcript.toLowerCase().trim().includes("paragraph")) {
                            utterance = new SpeechSynthesisUtterance("To read a paragraph from particular section, give command like read paragraph one of section {section_name}. To read all paragraph from a particular section, give command read all paragraph of section {section_name}.");
                        }
                        //vision an image from particular section
                        else if (event.results[i][0].transcript.toLowerCase().trim().includes("image")) {
                            utterance = new SpeechSynthesisUtterance("To get discription of an image from particular section, give command like read image one of section {section_name}. To read all images from a particular section, give command read all images of section {section_name}.");
                        }
                        // activate
                        else if (event.results[i][0].transcript.toLowerCase().trim().includes("activate")) {
                            var utterance = new SpeechSynthesisUtterance("Trinayan activated.");
                        }
                        // guide
                        else if (event.results[i][0].transcript.toLowerCase().trim().includes("guide")) {
                            // var utterance = new SpeechSynthesisUtterance(`1) vision help
                            // Opens a page with all commands currently available in TriNayan, complete with a description and example if needed.

                            // 2) vision new tab
                            // Opens a new tab to chrome://newtab.

                            // 3) vision close tab
                            // Closes the active tab.

                            // 4) vision close chrome
                            // Closes Google Chrome.

                            // 5) vision go to {URL}
                            // Redirects the active tab to {URL}.
                            // e.g. vision go to reddit.com

                            // 6) vision scroll down
                            // Scrolls down the active web page by the height of the window minus 100 pixels.

                            // 7) vision scroll up
                            // Scrolls up the active web page by the height of the window minus 100 pixels.

                            // 8) vision back/vision go back
                            // Redirects the active tab back one page in history.

                            // 9) vision forward/vision go forward
                            // Redirects the active tab forward one page in history.

                            // 10) vision tab {TAB NUMBER}/vision go to tab {TAB NUMBER}
                            // Changes the active tab to the {TAB NUMBER}.
                            // e.g. vision go to tab 2

                            // 11) vision click on {LINK}
                            // Searches the active web page for the {LINK}.{LINK} can be just a snippet of the wanted link. Note that this command will not work for all web pages.
                            // e.g. vision click on home

                            // 12) vision click on {LINK} no spaces
                            // Searches the active web page for the {LINK} as all one word.{LINK} can be just a snippet of the wanted link. Note that this command will not work for all web pages.
                            // e.g. vision click on navi voice no spaces

                            // 13) vision input {STRING}/vision search {STRING}
                            // Fills the first text input field (if found) with {STRING}.
                            // e.g. vision search funny cat

                            // 14) vision explicit input {STRING} into {FIELD}/vision explicitly input {STRING} into {FIELD}
                            // Searches the active web page for a text field with the {FIELD} placeholder text and enters {STRING} into it. Useful if more than one text input field on web page.
                            // e.g. vision explicitly input nice picture into comment

                            // 15) vision submit/vision search/vision enter
                            // Submits the first text input field (if found) in the active web page. Usually used in conjunction with vision input {STRING}/vision search {STRING}.

                            // 16) vision google {STRING}
                            // Googles {STRING}.
                            // e.g. vision google dank memes

                            // 17) vision stop speaking
                            // Mutes the voice of TriNayan.

                            // 18) vision start speaking
                            // Unmutes the voice of TriNayan.

                            // 19) vision toggle
                            // Remove the 'vision ' prefix from commands. Commands are spoken as usual but without the 'vision ' prefix.

                            // 20) toggle
                            // Add the 'vision ' prefix to commands. Commands are spoken as usual but with the 'vision ' prefix.

                            // 21) vision play video
                            // Plays a YouTube video on the current page.

                            // 22) vision pause video
                            // Pauses a YouTube video on the current page.

                            // 23) vision mute video
                            // Mutes a YouTube video on the current page.

                            // 24) vision calculate {FORMULA}
                            // Calculates a mathematical formula. At this time, the command will only work with "add", "subtract", "multiplied by", and "divided by".
                            // e.g. vision calculate five plus two times seven`);
                            var utterance = new SpeechSynthesisUtterance(`1) vision help
                            Opens a page with all commands currently available in TriNayan, complete with a description and example if needed.
                            
                            2) vision new tab
                            Opens a new tab to chrome://newtab.`);
                        }
                        // go to
                        else if (event.results[i][0].transcript.toLowerCase().trim().includes("go to") && event.results[i][0].transcript.trim().length > 6) {
                            if (event.results[i][0].transcript.toLowerCase().trim().includes(".")) {
                                var requestedUrl = event.results[i][0].transcript.toLowerCase().trim().substr(event.results[i][0].transcript.toLowerCase().trim().indexOf("go to") + 6, event.results[i][0].transcript.trim().length - 1).replace(/\s+/g, '');
                                // reddit.com/r/ replace
                                if (requestedUrl.includes("reddit.comslashareslash")) {
                                    requestedUrl = requestedUrl.replace("reddit.comslashareslash", "reddit.com/r/");
                                }
                                // if user doesn't say http:// then add
                                if (requestedUrl.startsWith("http://") == false) {
                                    chrome.tabs.update({
                                        url: "http://" + requestedUrl
                                    });
                                }
                                else {
                                    chrome.tabs.update({
                                        url: requestedUrl
                                    });
                                }
                                utterance = new SpeechSynthesisUtterance("Redirecting you to '" + requestedUrl + "'.");
                            }
                            else {
                                utterance = new SpeechSynthesisUtterance("Please specify a valid URL.");
                            }
                        }
                        // close tab
                        else if (event.results[i][0].transcript.toLowerCase().trim().includes("close") && event.results[i][0].transcript.toLowerCase().trim().includes("tab")) {
                            if (event.results[i][0].transcript.toLowerCase().trim().includes("1") || event.results[i][0].transcript.toLowerCase().trim().includes("2") || event.results[i][0].transcript.toLowerCase().trim().includes("3") || event.results[i][0].transcript.toLowerCase().trim().includes("4") || event.results[i][0].transcript.toLowerCase().trim().includes("5") || event.results[i][0].transcript.toLowerCase().trim().includes("6") || event.results[i][0].transcript.toLowerCase().trim().includes("7") || event.results[i][0].transcript.toLowerCase().trim().includes("8") || event.results[i][0].transcript.toLowerCase().trim().includes("9")) {
                                var requestedTab = event.results[i][0].transcript.toLowerCase().trim().substr(event.results[i][0].transcript.toLowerCase().trim().indexOf("tab") + 4, event.results[i][0].transcript.toLowerCase().trim().length - 1);
                                // console.log(requestedTab);
                                chrome.tabs.query({}, function (tabs) {
                                    chrome.tabs.remove(tabs[parseInt(requestedTab) - 1].id);
                                });
                                utterance = new SpeechSynthesisUtterance("Closing tab " + requestedTab + ".");
                            }
                            else {
                                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                                    chrome.tabs.remove(tabs[0].id);
                                });
                                utterance = new SpeechSynthesisUtterance("Closing tab.");
                            }
                        }
                        // close chrome
                        else if (event.results[i][0].transcript.toLowerCase().trim().includes("close chrome")) {
                            chrome.tabs.query({}, function (tabs) {
                                for (var i = 0; i < tabs.length; i++) {
                                    chrome.tabs.remove(tabs[i].id);
                                }
                            });
                        }
                        // scroll down
                        else if (event.results[i][0].transcript.toLowerCase().trim().includes("scroll down")) {
                            chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                chrome.tabs.executeScript({
                                    code: "var height = $(window).height(); $('html, body').animate({scrollTop: '+=' + (height - 100) + 'px'}, 300);"
                                });
                            });
                        }
                        // scroll up
                        else if (event.results[i][0].transcript.toLowerCase().trim().includes("scroll up")) {
                            chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                chrome.tabs.executeScript({
                                    code: "var height = $(window).height(); $('html, body').animate({scrollTop: '-=' + (height - 100) + 'px'}, 300);"
                                });
                            });
                        }
                        // go to
                        else if (event.results[i][0].transcript.toLowerCase().trim().includes("back") && event.results[i][0].transcript.toLowerCase().trim().includes("go to") == false) {
                            chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                chrome.tabs.executeScript({
                                    code: "window.history.back();"
                                });
                            });
                            utterance = new SpeechSynthesisUtterance("Going backwards.");
                        }
                        // forward
                        else if (event.results[i][0].transcript.toLowerCase().trim().includes("forward") && event.results[i][0].transcript.toLowerCase().trim().includes("go to") == false) {
                            chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                chrome.tabs.executeScript({
                                    code: "window.history.forward();"
                                });
                            });
                            utterance = new SpeechSynthesisUtterance("Going forwards.");
                        }
                        // go to tab
                        else if (event.results[i][0].transcript.toLowerCase().trim().startsWith("go to tab") || event.results[i][0].transcript.toLowerCase().trim().startsWith("tab")) {
                            var requestedTab = event.results[i][0].transcript.toLowerCase().trim().substr(event.results[i][0].transcript.toLowerCase().trim().indexOf("tab") + 4, event.results[i][0].transcript.trim().length - 1);
                            chrome.tabs.query({}, function (tabs) {
                                chrome.tabs.update(tabs[parseInt(requestedTab) - 1].id, { selected: true });
                            });
                            utterance = new SpeechSynthesisUtterance("Switching to tab '" + requestedTab + "'.");
                        }
                        // click on
                        else if (event.results[i][0].transcript.toLowerCase().trim().startsWith("click on") && event.results[i][0].transcript.toLowerCase().trim().startsWith("click on link ") == false && event.results[i][0].transcript.toLowerCase().trim().endsWith("no spaces") == false && event.results[i][0].transcript.toLowerCase().trim().length > 9) {
                            var requestedLink = event.results[i][0].transcript.toLowerCase().trim().substr(9, event.results[i][0].transcript.toLowerCase().trim().length - 1);
                            chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                chrome.tabs.executeScript({
                                    code: "jQuery.expr[':'].Contains = jQuery.expr.createPseudo(function(arg) { return function( elem ) { return jQuery(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0; }; }); window.location.href = $('a:Contains(\"" + requestedLink + "\")').attr('href');"
                                });
                            });
                            utterance = new SpeechSynthesisUtterance("Clicking on '" + requestedLink + "'.");
                        }
                        // click on no spaces
                        else if (event.results[i][0].transcript.toLowerCase().trim().startsWith("click on") && event.results[i][0].transcript.toLowerCase().trim().startsWith("click on link ") == false && event.results[i][0].transcript.toLowerCase().trim().endsWith("no spaces") && event.results[i][0].transcript.toLowerCase().trim().length > 19) {
                            var requestedLink = event.results[i][0].transcript.toLowerCase().trim().substr(9, event.results[i][0].transcript.toLowerCase().trim().length - 19).replace(/\s+/g, '');
                            chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                chrome.tabs.executeScript({
                                    code: "jQuery.expr[':'].Contains = jQuery.expr.createPseudo(function(arg) { return function( elem ) { return jQuery(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0; }; }); window.location.href = $('a:Contains(\"" + requestedLink + "\")').attr('href');"
                                });
                            });
                            utterance = new SpeechSynthesisUtterance("Clicking on '" + requestedLink + "'.");
                        }
                        // input
                        else if ((event.results[i][0].transcript.toLowerCase().trim().startsWith("input") && event.results[i][0].transcript.toLowerCase().trim().length > 6) || (event.results[i][0].transcript.toLowerCase().trim().startsWith("search") && event.results[i][0].transcript.toLowerCase().trim().length > 7)) {
                            if (event.results[i][0].transcript.toLowerCase().trim().startsWith("input")) {
                                var requestedInput = event.results[i][0].transcript.toLowerCase().trim().substr(6, event.results[i][0].transcript.toLowerCase().trim().length - 1).trim();
                            }
                            else {
                                var requestedInput = event.results[i][0].transcript.toLowerCase().trim().substr(7, event.results[i][0].transcript.toLowerCase().trim().length - 1).trim();
                            }
                            chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                chrome.tabs.executeScript({
                                    code: "$('input[type=\"text\"]').val('" + requestedInput + "');"
                                });
                            });
                            utterance = new SpeechSynthesisUtterance("Inputting '" + requestedInput + "'.");
                        }
                        // explicit input
                        else if (event.results[i][0].transcript.toLowerCase().trim().startsWith("explicit input") && event.results[i][0].transcript.toLowerCase().trim().length > 15) {
                            var requestedExplicitInput = event.results[i][0].transcript.toLowerCase().trim().substr(15, event.results[i][0].transcript.toLowerCase().trim().indexOf("into") - 16);
                            var requestedField = event.results[i][0].transcript.toLowerCase().trim().substr(event.results[i][0].transcript.toLowerCase().trim().indexOf("into") + 4, event.results[i][0].transcript.toLowerCase().trim().length - 1).trim();
                            // console.log(requestedExplicitInput);
                            // console.log(requestedField);
                            chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                chrome.tabs.executeScript({
                                    code: "$('input[type=\"text\"][placeholder=\"" + requestedField + "\" i]').val('" + requestedExplicitInput + "');"
                                });
                            });
                            utterance = new SpeechSynthesisUtterance("Explicitly inputting '" + requestedExplicitInput + "' into '" + requestedField + "'.");
                        }
                        // explicitly input
                        else if (event.results[i][0].transcript.toLowerCase().trim().startsWith("explicitly input") && event.results[i][0].transcript.toLowerCase().trim().length > 17) {
                            var requestedExplicitInput = event.results[i][0].transcript.toLowerCase().trim().substr(17, event.results[i][0].transcript.toLowerCase().trim().indexOf("into") - 18);
                            var requestedField = event.results[i][0].transcript.toLowerCase().trim().substr(event.results[i][0].transcript.toLowerCase().trim().indexOf("into") + 4, event.results[i][0].transcript.toLowerCase().trim().length - 1).trim();
                            // console.log(requestedExplicitInput);
                            // console.log(requestedField);
                            chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                chrome.tabs.executeScript({
                                    code: "$('input[type=\"text\"][placeholder=\"" + requestedField + "\" i]').val('" + requestedExplicitInput + "');"
                                });
                            });
                            utterance = new SpeechSynthesisUtterance("Explicitly inputting '" + requestedExplicitInput + "' into '" + requestedField + "'.");
                        }
                        // submit
                        else if ((event.results[i][0].transcript.toLowerCase().trim() == "enter" || event.results[i][0].transcript.toLowerCase().trim() == "submit" || event.results[i][0].transcript.toLowerCase().trim() == "search") && event.results[i][0].transcript.trim().length < 7) {
                            chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
                                var url = tabs[0].url;
                                if (url.startsWith("https://www.google.com/search?")) {
                                    chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                        chrome.tabs.executeScript({
                                            code: "$('.Tg7LZd')[0].click();"
                                            //$('button[type=\"submit\"]').trigger('click');
                                        });
                                    });
                                }
                                else if (url.startsWith("https://www.google.com")) {
                                    chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                        chrome.tabs.executeScript({
                                            code: "$('.gNO89b')[0].click();"
                                            //$('button[type=\"submit\"]').trigger('click');
                                        });
                                    });
                                }
                                else if (url.startsWith("https://www.wikipedia.org/")) {
                                    chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                        chrome.tabs.executeScript({
                                            code: "$('.pure-button')[0].click();"
                                            //$('button[type=\"submit\"]').trigger('click');
                                        });
                                    });
                                }
                                // if (url.startsWith("https://www.reddit.com")) {
                                //     chrome.tabs.executeScript(null, {file: "scripts/jquery-3.1.1.min.js"}, function () {
                                //         chrome.tabs.executeScript({
                                //             code: "$('input[type=\"text\"]').parent().find('input[type=\"submit\"]').trigger('click');"
                                //             //$('button[type=\"submit\"]').trigger('click');
                                //         });
                                //     });
                                // }
                                else if (url.startsWith("https://www.youtube.com")) {
                                    chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                        chrome.tabs.executeScript({
                                            code: "$('#search-icon-legacy')[0].click();"
                                            // code: "$('#search-icon-legacy').trigger('click');"
                                            // code: "window.getElementById('search-icon-legacy').trigger('click');"
                                            //$('button[type=\"submit\"]').trigger('click');
                                        });
                                    });
                                }
                                else {
                                    chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                        chrome.tabs.executeScript({
                                            code: "$('button[type=\"submit\"]').trigger('click');"
                                            //$('button[type=\"submit\"]').trigger('click');
                                        });
                                    });
                                }
                            });
                            utterance = new SpeechSynthesisUtterance("Submitting input.");
                        }
                        // google
                        else if (event.results[i][0].transcript.toLowerCase().trim().startsWith("google")) {
                            var requestedSearch = event.results[i][0].transcript.toLowerCase().trim().substr(7, event.results[i][0].transcript.trim().length - 1);
                            chrome.tabs.update({
                                url: "https://www.google.com/search?q=" + requestedSearch.split(' ').join('+')
                            });
                        }
                        // stop speaking
                        else if (event.results[i][0].transcript.toLowerCase().trim() == "stop speaking" || event.results[i][0].transcript.toLowerCase().trim() == "shut up" || event.results[i][0].transcript.toLowerCase().trim() == "be quiet") {
                            var voice = 'off';
                            chrome.storage.sync.set({ 'voice': voice });
                        }
                        // start speaking
                        else if (event.results[i][0].transcript.toLowerCase().trim() == "start speaking") {
                            var voice = 'off';
                            chrome.storage.sync.set({ 'voice': voice });
                        }
                        // skip
                        else if (event.results[i][0].transcript.toLowerCase().trim().substr(7, event.results[i][0].transcript.trim().length - 1).startsWith("skip")) {
                            chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                chrome.tabs.executeScript({
                                    code: "$('.Tg7LZd')[0].click();"
                                    //$('button[type=\"submit\"]').trigger('click');
                                });
                            });
                            utterance = new SpeechSynthesisUtterance("skiping advertisement.");
                        }
                        // open a new document
                        else if (event.results[i][0].transcript.toLowerCase().trim().substr(7, event.results[i][0].transcript.trim().length - 1).startsWith("open a new document")) {
                            chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                chrome.tabs.executeScript({
                                    code: "$('.docs-homescreen-templates-templateview-preview')[0].click();"
                                    //$('button[type=\"submit\"]').trigger('click');
                                });
                            });
                            utterance = new SpeechSynthesisUtterance("Opening a new document.");
                        }
                        // help
                        else if (event.results[i][0].transcript.toLowerCase().trim() == "help") {
                            window.open("https://trinayan.netlify.app/")
                            utterance = new SpeechSynthesisUtterance("Opening help.");
                        }
                        // toggle
                        else if (event.results[i][0].transcript.toLowerCase().trim() == "toggle") {
                            var prefix = 'on';
                            chrome.storage.sync.set({ 'prefix': prefix });
                            utterance = new SpeechSynthesisUtterance("Prefix has been turned on. You will now say commands with the 'vision ' prefix.");
                        }
                        // othello reversi
                        // else if (event.results[i][0].transcript.toLowerCase().trim() == "othello reversi") {
                        //     chrome.tabs.create({ url: "https://misscaptainalex.files.wordpress.com/2013/05/210.gif" });
                        //     utterance = new SpeechSynthesisUtterance("JULIAN BOOLEAN!");
                        // }
                        // pause video
                        else if (event.results[i][0].transcript.toLowerCase().trim() == ("pause video") || event.results[i][0].transcript.toLowerCase().trim() == ("play video") || event.results[i][0].transcript.toLowerCase().trim() == ("paws video")) {
                            chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                chrome.tabs.executeScript({
                                    code: "$('.ytp-play-button').click();"
                                });
                            });
                        }
                        // mute video
                        else if (event.results[i][0].transcript.toLowerCase().trim() == ("mute video")) {
                            chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                chrome.tabs.executeScript({
                                    code: "$('.ytp-mute-button').click();"
                                });
                            });
                        }
                        // calculate
                        else if (event.results[i][0].transcript.toLowerCase().trim().startsWith("calculate")) {
                            var answer = eval(event.results[i][0].transcript.toLowerCase().trim().substr(10, event.results[i][0].transcript.trim().length - 1).replace("divided by", "/").replace("multiplied by", "*").replace("x", "*").replace("times", "*"));
                            answer = answer.toString();
                            utterance = new SpeechSynthesisUtterance(event.results[i][0].transcript.toLowerCase().trim().substr(10, event.results[i][0].transcript.trim().length - 1) + " is " + answer);
                        }
                        // list links
                        else if (event.results[i][0].transcript.toLowerCase().trim().includes("list links") || event.results[i][0].transcript.toLowerCase().trim().includes("list link")) {
                            /*chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                             chrome.tabs.insertCSS(tabs[0].id, {code: "body{counter-reset: linkCtr 0;} a{counter-increment: linkCtr 1;} a:before{content:'[' counter(linkCtr) ']';}"});
                             });*/
                            chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                chrome.tabs.executeScript({
                                    code: "$('a').html(function(index, html) { return html + \"<span style='background-color:white;position:absolute;z-index:100;'>[\" + (index + 1) + \"]</span>\"; })"
                                });
                            });
                            utterance = new SpeechSynthesisUtterance("Listing links.");
                        }
                        // click on link #
                        else if (event.results[i][0].transcript.toLowerCase().trim().includes("click on link") || event.results[i][0].transcript.toLowerCase().trim().includes("quick on link") && event.results[i][0].transcript.trim().length > 11) {
                            var linkNum = event.results[i][0].transcript.toLowerCase().trim().substr(event.results[i][0].transcript.toLowerCase().trim().indexOf("link") + 5, event.results[i][0].transcript.trim().length - 1);
                            chrome.tabs.executeScript(null, { file: "scripts/jquery-3.1.1.min.js" }, function () {
                                chrome.tabs.executeScript({
                                    code: "window.location.href = $('a:contains(\"[" + parseInt(linkNum) + "]\")').attr('href');"
                                });
                            });
                            utterance = new SpeechSynthesisUtterance("Clicking on link " + linkNum + ".");
                        }
                        // history
                        else if (event.results[i][0].transcript.toLowerCase().trim() == "history") {
                            chrome.tabs.update({
                                url: "chrome://history"
                            });
                            utterance = new SpeechSynthesisUtterance("Showing you your history.");
                        }
                        // extensions
                        else if (event.results[i][0].transcript.toLowerCase().trim() == "extensions") {
                            chrome.tabs.update({
                                url: "chrome://extensions"
                            });
                            utterance = new SpeechSynthesisUtterance("Showing you your extensions.");
                        }
                        // downloads
                        else if (event.results[i][0].transcript.toLowerCase().trim() == "downloads") {
                            chrome.tabs.update({
                                url: "chrome://downloads"
                            });
                            utterance = new SpeechSynthesisUtterance("Showing you your downloads.");
                        }
                        // reload
                        else if (event.results[i][0].transcript.toLowerCase().trim() == "reload") {
                            chrome.tabs.query({ active: true, currentWindow: true }, function (arrayOfTabs) {
                                var code = 'window.location.reload();';
                                chrome.tabs.executeScript(arrayOfTabs[0].id, { code: code });
                            });
                        }
                        // stop listesning
                        else if (event.results[i][0].transcript.toLowerCase().trim().includes("stop listening")) {
                            chrome.management.getSelf(function (result) {
                                chrome.management.setEnabled(result.id, false)
                            });
                        }
                        // vision change theme
                        // else if (event.results[i][0].transcript.toLowerCase().trim().includes("change")) {
                        //     chrome.tabs.executeScript({
                        //         file: 'theme.js'
                        //     })
                        //     utterance = new SpeechSynthesisUtterance("Changing theme.");
                        // }
                        // if voice variable is set to on
                        var voice = "";
                        chrome.storage.sync.get('voice', function (result) {
                            voice = result.voice;
                            if (voice == "on") {
                                window.speechSynthesis.speak(utterance);
                            }
                        });
                    }
                });
                // bug fix
                recognition.stop();
                recognition.start();
            }
            else {
                // Interim results
                console.log("interim words: " + event.results[i][0].transcript);
            }
        }
    }
}

// open enableMicrophone.html on install
function install_notice() {
    if (localStorage.getItem('install_time'))
        return;
    var now = new Date().getTime();
    localStorage.setItem('install_time', now);
    chrome.tabs.create({ url: "./enableMicrophone.html" });
}
install_notice();