//================================================================================//
/*



*/
//================================================================================//
//  The following code creates a global JSON object containing two methods: stringify
//  and parse. This code provides the ES5 JSON capability to ES3 systems.


if (typeof JSON !== "object") {
    JSON = {};
}

(function () {
    "use strict";

    var rx_one = /^[\],:{}\s]*$/;
    var rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
    var rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
    var rx_four = /(?:^|:|,)(?:\s*\[)+/g;
    var rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    var rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

    function f(n) {
        // Format integers to have at least two digits.
        return (n < 10)
            ? "0" + n
            : n;
    }

    function this_value() {
        return this.valueOf();
    }

    if (typeof Date.prototype.toJSON !== "function") {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? (
                    this.getUTCFullYear()
                    + "-"
                    + f(this.getUTCMonth() + 1)
                    + "-"
                    + f(this.getUTCDate())
                    + "T"
                    + f(this.getUTCHours())
                    + ":"
                    + f(this.getUTCMinutes())
                    + ":"
                    + f(this.getUTCSeconds())
                    + "Z"
                )
                : null;
        };

        Boolean.prototype.toJSON = this_value;
        Number.prototype.toJSON = this_value;
        String.prototype.toJSON = this_value;
    }

    var gap;
    var indent;
    var meta;
    var rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        rx_escapable.lastIndex = 0;
        return rx_escapable.test(string)
            ? "\"" + string.replace(rx_escapable, function (a) {
                var c = meta[a];
                return typeof c === "string"
                    ? c
                    : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
            }) + "\""
            : "\"" + string + "\"";
    }


// This variable is initialized with an empty array every time
// JSON.stringify() is invoked and checked by the str() function. It's
// used to keep references to object structures and capture cyclic
// objects. Every new object is checked for its existence in this
// array. If it's found it means the JSON object is cyclic and we have
// to stop execution and throw a TypeError accordingly the ECMA262
// (see NOTE 1 by the link https://tc39.es/ecma262/#sec-json.stringify).

    var seen;

// Emulate [].includes(). It's actual for old-fashioned JScript.

    function includes(array, value) {
        var i;
        for (i = 0; i < array.length; i += 1) {
            if (value === array[i]) {
                return true;
            }
        }
        return false;
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i;          // The loop counter.
        var k;          // The member key.
        var v;          // The member value.
        var length;
        var mind = gap;
        var partial;
        var value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (
            value
            && typeof value === "object"
            && typeof value.toJSON === "function"
        ) {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === "function") {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case "string":
            return quote(value);

        case "number":

// JSON numbers must be finite. Encode non-finite numbers as null.

            return (isFinite(value))
                ? String(value)
                : "null";

        case "boolean":
        case "null":

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce "null". The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is "object", we might be dealing with an object or an array or
// null.

        case "object":

// Due to a specification blunder in ECMAScript, typeof null is "object",
// so watch out for that case.

            if (!value) {
                return "null";
            }

// Check the value is not circular object. Otherwise throw TypeError.

            if (includes(seen, value)) {
                throw new TypeError("Converting circular structure to JSON");
            }

// Keep the value for the further check on circular references.

            seen.push(value);

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === "[object Array]") {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || "null";
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? "[]"
                    : gap
                        ? (
                            "[\n"
                            + gap
                            + partial.join(",\n" + gap)
                            + "\n"
                            + mind
                            + "]"
                        )
                        : "[" + partial.join(",") + "]";
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === "object") {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === "string") {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                (gap)
                                    ? ": "
                                    : ":"
                            ) + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                (gap)
                                    ? ": "
                                    : ":"
                            ) + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? "{}"
                : gap
                    ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}"
                    : "{" + partial.join(",") + "}";
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== "function") {
        meta = {    // table of character substitutions
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            "\"": "\\\"",
            "\\": "\\\\"
        };
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = "";
            indent = "";

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === "number") {
                for (i = 0; i < space; i += 1) {
                    indent += " ";
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === "string") {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== "function" && (
                typeof replacer !== "object"
                || typeof replacer.length !== "number"
            )) {
                throw new Error("JSON.stringify");
            }

// Initialize the reference keeper.

            seen = [];

// Make a fake root object containing our value under the key of "".
// Return the result of stringifying the value.

            return str("", {"": value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== "function") {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k;
                var v;
                var value = holder[key];
                if (value && typeof value === "object") {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            rx_dangerous.lastIndex = 0;
            if (rx_dangerous.test(text)) {
                text = text.replace(rx_dangerous, function (a) {
                    return (
                        "\\u"
                        + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
                    );
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with "()" and "new"
// because they can cause invocation, and "=" because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with "@" (a non-JSON character). Second, we
// replace all simple value tokens with "]" characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or "]" or
// "," or ":" or "{" or "}". If that is so, then the text is safe for eval.

            if (
                rx_one.test(
                    text
                        .replace(rx_two, "@")
                        .replace(rx_three, "]")
                        .replace(rx_four, "")
                )
            ) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The "{" operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval("(" + text + ")");

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return (typeof reviver === "function")
                    ? walk({"": j}, "")
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError("JSON.parse");
        };
    }
}());

//When config JSON file is empty, delete folder

function deleteFolderRecursive(folder) {
    // if folder is exist ,start to delete folders
    if (folder.exists) {
        var files = folder.getFiles();
        for (var i = 0; i < files.length; i++) {
            if (files[i] instanceof Folder) {
                deleteFolderRecursive(files[i]);
            } else {
                files[i].remove();
            }
        }
        folder.remove();
    }
}

var jsonFile = File(Folder.userData.fsName.toString() + "/ConteAssistant/Icons/config.json");
if(jsonFile.length == 0){
    var myFolder = new Folder(Folder.userData.fsName.toString() + "/ConteAssistant");
    deleteFolderRecursive(myFolder);
    alert("プロファイルが予期せぬエラーで削除されたため、全ての設定がデフォルトに戻されます。\n「OK」ボタンを押したら少々お待ちください。", "Conte Assistant");
}


//UI Start
//=============================================
var panelGlobal = this;
var palette = (function () {
    
var palette = (panelGlobal instanceof Panel) ? panelGlobal : new Window("palette");
    if (!(panelGlobal instanceof Panel)) palette.text = "Conte Assistant";
    palette.orientation = "column";
    palette.alignChildren = ["left", "top"];
    palette.spacing = 10;
    palette.margins = 16;
// CUTSET_PNL
// ==========
var cutSet_pnl = palette.add("panel", undefined, undefined, {name: "cutSet_pnl"}); 
    cutSet_pnl.text = "カット設定"; 
    cutSet_pnl.preferredSize.width = 333; 
    cutSet_pnl.orientation = "column"; 
    cutSet_pnl.alignChildren = ["left","top"]; 
    cutSet_pnl.spacing = 10; 
    cutSet_pnl.margins = 10; 

// CUT_SET
// =======

var title_set = cutSet_pnl.add("group", undefined, {name: "title_set"}); 
    title_set.orientation = "row"; 
    title_set.alignChildren = ["left","center"]; 
    title_set.spacing = 10; 
    title_set.margins = 0; 
    title_set.alignment = ["left","top"]; 
    
var title_txt = title_set.add("statictext", undefined, undefined, {name: "title_txt"}); 
    title_txt.text = "作品名"; 

var titleName_txt = title_set.add('edittext {properties: {name: "titleName_txt"}}'); 
    titleName_txt.preferredSize.width = 69;  
    titleName_txt.text = "title";

var eps_txt = title_set.add("statictext", undefined, undefined, {name: "eps_txt"}); 
    eps_txt.text = "話数"; 
var epsNum_txt = title_set.add('edittext {properties: {name: "epsNum_txt"}}'); 
    epsNum_txt.text = "1";
    epsNum_txt.preferredSize.width = 20; 

var part_txt = title_set.add("statictext", undefined, undefined, {name: "part_txt"}); 
    part_txt.text = "PART"; 

var part_edrtx = title_set.add('edittext {properties: {name: "part_edrtx"}}'); 
    part_edrtx.text = "A"; 
    
var cut_set = cutSet_pnl.add("group", undefined, {name: "cut_set"}); 
    cut_set.orientation = "row"; 
    cut_set.alignChildren = ["left","center"]; 
    cut_set.spacing = 10; 
    cut_set.margins = 0; 
    cut_set.alignment = ["left","top"]; 

var cutset_txt = cut_set.add("statictext", undefined, undefined, {name: "cutset_txt"}); 
    cutset_txt.text = "情報"; 
    cutset_txt.preferredSize.width = 58; 

var sence_txt = cut_set.add("statictext", undefined, undefined, {name: "sence_txt"}); 
    sence_txt.text = "S-"; 

var sence_edtxt = cut_set.add('edittext {properties: {name: "sence_edtxt"}}'); 
    sence_edtxt.text = "001"; 
    sence_edtxt.preferredSize.width = 35; 

var c_txt = cut_set.add("statictext", undefined, undefined, {name: "c_txt"}); 
    c_txt.text = "C-"; 

var cno_edtxt = cut_set.add('edittext {properties: {name: "cno_edtxt"}}'); 
    cno_edtxt.text = "001"; 
    cno_edtxt.preferredSize.width = 35; 
var take_txt = cut_set.add("statictext", undefined, undefined, {name: "take_txt"}); 
    take_txt.text = "Take"; 
var takeNum_txt = cut_set.add('edittext {properties: {name: "takeNum_txt"}}'); 
    takeNum_txt.text = "1";
    takeNum_txt.preferredSize.width = 20;
// CHARA_SET
// =========
var chara_set = cutSet_pnl.add("group", undefined, {name: "chara_set"}); 
    chara_set.orientation = "row"; 
    chara_set.alignChildren = ["left","center"]; 
    chara_set.spacing = 10; 
    chara_set.margins = 0; 
    chara_set.alignment = ["left","top"]; 

var chara_name = chara_set.add("statictext", undefined, undefined, {name: "chara_name"}); 
    chara_name.text = "キャラ名"; 

var charaName_txt = chara_set.add('edittext {properties: {name: "charaName_txt"}}'); 
    charaName_txt.preferredSize.width = 200; 

// SERIFU_SET
// ==========
var serifu_set = cutSet_pnl.add("group", undefined, {name: "serifu_set"}); 
    serifu_set.orientation = "row"; 
    serifu_set.alignChildren = ["left","center"]; 
    serifu_set.spacing = 10; 
    serifu_set.margins = 0; 
    serifu_set.alignment = ["left","top"]; 

var serifu_txt = serifu_set.add("statictext", undefined, undefined, {name: "serifu_txt"}); 
    serifu_txt.text = "セリフ"; 
    serifu_txt.preferredSize.width = 56; 
    serifu_txt.alignment = ["left","top"]; 

var serifu_edtxt = serifu_set.add('edittext {size: [200,50], properties: {name: "serifu_edtxt", multiline: true}}'); 
serifu_edtxt.text = ""; 


// COLOR_SET
// =========
var color_set = cutSet_pnl.add("group", undefined, {name: "color_set"}); 
    color_set.orientation = "row"; 
    color_set.alignChildren = ["left","center"]; 
    color_set.spacing = 10; 
    color_set.margins = 0; 

var color_txt = color_set.add("statictext", undefined, undefined, {name: "color_txt"}); 
    color_txt.text = "キャラ名の色"; 

var getColor_btn = color_set.add("button", undefined, undefined, {name: "getColor_btn"}); 
   // getColor_btn.text = "GET"; 
    getColor_btn.size = [15,15];

// OTHER_SET
// =========
/*
var other_set = cutSet_pnl.add("group", undefined, {name: "other_set"}); 
    other_set.orientation = "row"; 
    other_set.alignChildren = ["left","center"]; 
    other_set.spacing = 10; 
    other_set.margins = 0; 
*/
var if_SE = color_set.add("checkbox", undefined, undefined, {name: "if_SE"}); 
    if_SE.text = "SE"; 

var if_OFF = color_set.add("checkbox", undefined, undefined, {name: "if_OFF"}); 
    if_OFF.text = "OFF"; 

var if_MONO = color_set.add("checkbox", undefined, undefined, {name: "if_MONO"}); 
    if_MONO.text = "MONO"; 

// time_set
// ========
var time_set1 = cutSet_pnl.add("group", undefined, {name: "time_set1"}); 
    time_set1.orientation = "row"; 
    time_set1.alignChildren = ["left","center"]; 
    time_set1.spacing = 10; 
    time_set1.margins = 0; 
    time_set1.alignment = ["left","top"]; 

var time_txt = time_set1.add("statictext", undefined, undefined, {name: "time_txt"}); 
    time_txt.text = "尺( 秒+コマ)"; 

var time_sec = time_set1.add('edittext {properties: {name: "time_sec"}}'); 
    time_sec.text = "1"; 
    time_sec.preferredSize.width = 28; 

var plus_txt = time_set1.add("statictext", undefined, undefined, {name: "plus_txt"}); 
    plus_txt.text = "+"; 

var time_frm = time_set1.add('edittext {properties: {name: "time_frm"}}'); 
    time_frm.text = "12"; 
    time_frm.preferredSize.width = 30; 

var at_mark = time_set1.add("statictext", undefined, undefined, {name: "at_mark"}); 
    at_mark.text = "@"; 

var fmrat_edtxt = time_set1.add('edittext {properties: {name: "fmrat_edtxt"}}'); 
    fmrat_edtxt.text = "24"; 

var fps_txt = time_set1.add("statictext", undefined, undefined, {name: "fps_txt"}); 
    fps_txt.text = "fps"; 
    fps_txt.alignment = ["left","center"]; 

var time_set2 = cutSet_pnl.add("group", undefined, {name: "time_set2"}); 
    time_set2.orientation = "row"; 
    time_set2.alignChildren = ["left","center"]; 
    time_set2.spacing = 10; 
    time_set2.margins = 0; 
    time_set2.alignment = ["left","top"]; 

//help button and setting button image
var settingImgStr1 = "%C2%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%18%00%00%00%18%08%06%00%00%00%C3%A0w%3D%C3%B8%00%00%00%09pHYs%00%00%00%C3%85%00%00%00%C3%85%01%1D%C3%8D%C2%BA%C2%A8%00%00%04%C3%AEiTXtXML%3Acom.adobe.xmp%00%00%00%00%00%3C%3Fxpacket%20begin%3D%22%C3%AF%C2%BB%C2%BF%22%20id%3D%22W5M0MpCehiHzreSzNTczkc9d%22%3F%3E%20%3Cx%3Axmpmeta%20xmlns%3Ax%3D%22adobe%3Ans%3Ameta%2F%22%20x%3Axmptk%3D%22Adobe%20XMP%20Core%209.0-c000%2079.171c27f%2C%202022%2F08%2F16-18%3A02%3A43%20%20%20%20%20%20%20%20%22%3E%20%3Crdf%3ARDF%20xmlns%3Ardf%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%22%3E%20%3Crdf%3ADescription%20rdf%3Aabout%3D%22%22%20xmlns%3Axmp%3D%22http%3A%2F%2Fns.adobe.com%2Fxap%2F1.0%2F%22%20xmlns%3Adc%3D%22http%3A%2F%2Fpurl.org%2Fdc%2Felements%2F1.1%2F%22%20xmlns%3Aphotoshop%3D%22http%3A%2F%2Fns.adobe.com%2Fphotoshop%2F1.0%2F%22%20xmlns%3AxmpMM%3D%22http%3A%2F%2Fns.adobe.com%2Fxap%2F1.0%2Fmm%2F%22%20xmlns%3AstEvt%3D%22http%3A%2F%2Fns.adobe.com%2Fxap%2F1.0%2FsType%2FResourceEvent%23%22%20xmp%3ACreatorTool%3D%22Adobe%20Photoshop%2024.1%20(Windows)%22%20xmp%3ACreateDate%3D%222023-01-19T14%3A16%3A38%2B09%3A00%22%20xmp%3AModifyDate%3D%222023-01-19T14%3A21%3A16%2B09%3A00%22%20xmp%3AMetadataDate%3D%222023-01-19T14%3A21%3A16%2B09%3A00%22%20dc%3Aformat%3D%22image%2Fpng%22%20photoshop%3AColorMode%3D%223%22%20xmpMM%3AInstanceID%3D%22xmp.iid%3Af44116d7-54e8-ef49-ace8-2c02b8d65659%22%20xmpMM%3ADocumentID%3D%22xmp.did%3Af44116d7-54e8-ef49-ace8-2c02b8d65659%22%20xmpMM%3AOriginalDocumentID%3D%22xmp.did%3Af44116d7-54e8-ef49-ace8-2c02b8d65659%22%3E%20%3CxmpMM%3AHistory%3E%20%3Crdf%3ASeq%3E%20%3Crdf%3Ali%20stEvt%3Aaction%3D%22created%22%20stEvt%3AinstanceID%3D%22xmp.iid%3Af44116d7-54e8-ef49-ace8-2c02b8d65659%22%20stEvt%3Awhen%3D%222023-01-19T14%3A16%3A38%2B09%3A00%22%20stEvt%3AsoftwareAgent%3D%22Adobe%20Photoshop%2024.1%20(Windows)%22%2F%3E%20%3C%2Frdf%3ASeq%3E%20%3C%2FxmpMM%3AHistory%3E%20%3C%2Frdf%3ADescription%3E%20%3C%2Frdf%3ARDF%3E%20%3C%2Fx%3Axmpmeta%3E%20%3C%3Fxpacket%20end%3D%22r%22%3F%3E7d%C3%B9w%00%00%02%14IDATH%C2%89%C2%B5%C2%95M%C2%88%C2%8Da%14%C3%87%7F%C3%B76%C2%BE2%C2%B2%C3%90%C2%A4(%19%C3%94%C3%B8%C3%88B%11)%C2%91%C2%B0%C2%B0%40Y%C2%A8%11.%3B%C2%B1%C2%B3%C2%B7%C2%B1%C2%B1P4b-%C3%99%C3%88%C3%82BdH%C2%93%C2%8F%C2%85%C2%9D%C2%AF%C2%A4k%22%C2%B3%C3%90%10i%C2%98aF%26%3F%C2%8B%C3%B7%7D%C3%B3%C3%9C%C3%87s%C2%BF%C2%A6%C2%9C%3A%C3%B5v%C2%9Fs%C3%BE%C3%BFs%C3%BE%C3%A7%3C%C3%8F-%C2%A9%C3%BCO%C3%ABh!f%0B%C2%B0%23%C3%BF%1E%00%C3%AE%C2%B6%C3%85%C2%A06%C3%B2%C2%B5%C3%BEk%C3%9B%C2%9A%C3%A4%C3%94x9%C3%A2%C3%AB%01%C3%8E%01%C3%BB%C2%80i%C3%80%C2%91DM%15%60%3A%C2%B0%07%C3%A8%03V%C2%B7%C3%9A%C3%81F%C3%B5kP%C3%A9H%C2%A2%C3%BA%C3%94%C3%99wuk%C2%BD%0EJ%C3%B9%C2%90K%C3%80%20%C2%B0%C2%B4-%7D%C3%BF%C3%9A%7B%6010%19%1F%14%12%C3%8D%00%C2%BA%C2%A6%08%0E0%0F%C3%A8L%1D%14%04%13d%C3%9A%C3%87%C3%B6%16%C3%A8%25%C3%AB%C2%AC%C2%9Bl6%C3%95D%C3%9CE%60%24I%1D%C3%A8%C3%95%17%C3%A9%C3%BCP%C3%ADL%C3%A8%3AS%C2%BD%1D%C3%85%5E%C2%AE7%03%C3%94%C2%8A%C3%BA1J%C3%B8%C2%A1v7X%C2%BF%C2%85%C3%AAh%C2%94%C3%B3L%5D%C2%91%22%C3%B8%C2%90%C3%98%C2%92%07%0D%C3%80%0B%C2%BF%C2%93%C3%87%C3%BEV%C2%8F%C2%A9%C2%9B%C3%943%C3%AAS%C3%B5f%11%C3%97%01%C3%8CO(%C3%B7%C2%BA%C3%BE%3Ckb%C2%B6%03%C3%A7%C2%817%C3%80%7D%C2%B2m%1C%03%C2%8E%17Ae%608%C2%91%C3%9C%C3%93%02A%11s%0B%C3%98%C2%9B%C2%83Cv%C3%B9%1E%01%C3%8B%C2%81%2B%C2%A8%C2%BD%C3%AAP%C3%9Eja%C3%A3%C3%AA%C2%B2%06%C3%B2%2CR%C3%87%C3%94_%C3%AA%1C%C2%B5%1A%C3%A4%C2%BETO%C2%A8%C3%83%C3%AAP%C2%98t6%C2%9A%C3%83cun%02%7C%C2%B6zO%C2%9DT%C3%B7%C2%AB%C2%BB%123%2C%C3%ACR%C3%B8%16%C2%8DF%12%C2%AC%07%5E%00%C2%87%C2%81%C2%95y%C3%8B%07%C2%81%C3%A7%C3%80f%C3%A0P%C2%9Es%C2%AD%C2%81%C2%8C7%C2%8A%C2%AAf%C2%A9%C3%9F%1AT%12ZX%C3%B9OuP%C2%BD%10%C2%9C%7FV%C2%AF%C2%9B%C2%AD%7F%C3%8DE%C2%AB%C3%9A%C3%9CR%C3%A0%C2%AB%C3%8C%C3%A4%2C%C3%96%C2%B5dt%0F%0A_%C2%A7~%09%C3%80%3E%25%08*%01%C3%B8%C2%BB%08%C3%BC%C2%A8%C2%89%C2%85%C2%88%7FX%C2%A2%C2%9EVw%C2%ABek%C2%9F%C2%8FWj%C2%97%3A%C2%A1%3EQ%C3%BB%C3%8D.U%5D%C3%B0%14A%C3%ACk%02%C2%82S%C3%AA%C2%81%C3%BC%C3%BB%C2%AA%3A%C3%90%0C%C2%BC%15%02%C3%94%0D%C3%AAIug%C3%9E%C3%81xN%C3%92%14%C3%9C%C3%A0%0F%C2%A7%1D%5B%C2%90%C3%9F%C3%9C~ZxR%C2%A6B%C3%90%C2%96%C3%BD%01%5C%1B%5E%C3%B4.I%C3%92a%00%00%00%00IEND%C2%AEB%60%C2%82"; 
var settingImgStr2 = "%C2%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%18%00%00%00%18%08%06%00%00%00%C3%A0w%3D%C3%B8%00%00%00%04sBIT%08%08%08%08%7C%08d%C2%88%00%00%00%09pHYs%00%00%00%C3%85%00%00%00%C3%85%01%1D%C3%8D%C2%BA%C2%A8%00%00%00%19tEXtSoftware%00www.inkscape.org%C2%9B%C3%AE%3C%1A%00%00%02%0AIDATH%C2%89%C2%B5%C3%94M%C2%88Na%14%07%C3%B0%C3%9F%C2%99%C3%86WF%16%C2%92%C2%A2%C3%94%C2%A0f%C2%90%C2%85%C2%A2%C2%A4%C2%94%C2%84%C2%85%05j%16SD%2F%3B%C2%B1%C2%B3%C2%B7%60c%C2%A1L%23%C3%96%C2%92%C2%8D%C2%95%15%19%C3%92%C3%A4ca%C2%87%C2%854%C2%BE2R%C2%884%3EgD%1E%C2%8B%7B_%C3%AE%C2%BC%C3%AF%7D%C3%AFk%C2%94%C2%A7N%C3%9D%C3%9B%C3%B9%C2%9F%C3%BF%C3%BF%C2%9C%C3%B3%C2%9C%C3%A7DJ%C3%89%C3%BF%3C%C2%9D%C3%AD%00%11%C2%B1%11%5B%C3%B3%C3%9F%C3%A1%C2%94%C3%92%C2%B5))%C2%A4%C2%94Z%1A%C3%96%205%C3%98%C3%A6%C2%AA%C2%98F%C3%ABh%C3%88%C2%B6'%22%06%22%C2%A2%3F%22%C2%A6a%7FIN%C2%B5%C2%88%C2%98%1E%11%3B%23b0%22V%C3%BDU%05X%C2%8F%0F%C2%85L%C3%87J%C2%B2%2F%C3%B3%7D%C3%81%C2%A6%C2%96%5D%C3%88%C3%89%03O*%08%C3%9B%C3%99KtV%C2%B5h%06%C3%A6W%C2%96Z%7D%C3%A6%C2%A1%C2%AB%C3%8C%C3%91%C2%91%C2%B7i%02%03%25%C3%BEg%C3%98%C2%85%C2%A5%C3%A8F%3FFJpgRJc%C2%A5%C3%92%C2%85%3B%184%C2%B9%C3%AC%5B%C3%A8*%C2%99%C2%AC%C2%99%C2%B8%C3%92%C2%80%3DW1%C2%89jx%C3%93%10%C3%B0%15%C3%9D%15A%C2%8B%C3%B0%C2%A9!%C3%A6%3E%C2%96%C2%97%09%C2%BC%C3%96%7Ci7%C3%9B%C3%8D7%C2%AE%C3%A6%C3%98%C2%9F8%C2%88%0D8%C2%81%7B%C2%B8T%C3%87ubAI%C3%A7%1E%C2%95%C3%B6%C2%B3%19%C2%B3%05%C2%A7%C3%B0%147d%C3%93%C3%B8%19%C2%87%C3%AA%C2%A0%0E%C2%BC*%09%C3%AE%C3%B9%0B%C2%81%3A%C3%A62%C3%BArr%18L)%C3%9D%C2%8E%C2%88%C3%9E%C2%888O6%25%C2%A3%C2%B2R%C3%AB-%1A%C3%87%C2%B2%C2%8A%C3%B6%2C%C3%8E3%C3%BD%C2%8E9%C2%B2%C3%89%C2%AA%C3%87%3E%C3%80%C3%A1%3C%C3%B1%C3%91b%C3%90I%C2%93%C3%AF%C3%A1%0E%C3%A6%C2%96%C2%90%C3%8F%C3%86u%C3%BC%C3%80nl%C3%97%C3%BA%01%C2%9E-%06%1E-%01%C2%BC%C3%80%3E%C2%AC%40%2F%C3%B6%C3%A6%C3%BD.%C2%92%7F%C2%AB%10%C3%A8%C2%AB%C2%93%C3%8F%C3%82%C3%87%0A%60%C3%91%1A%C3%89%1F%C3%A3t%C3%81%C3%BF%0E%17Q%C3%BB%C2%BD%C2%8Br%C2%91%C2%91%7F%24_%C2%99%C2%B7%C2%B3%3E%C2%AE%C3%91%C2%B4%C3%ACr%C2%81%C2%B5x_%20%7B%5B%22P%2B%C2%90%3Fo%20%3F%C3%90r%C2%9B%16D%C2%96%C3%A08v%C3%88F%C2%B8%C2%B8%3E%1E%C3%8A%16%C3%A2%04%C3%AEbH%C3%B6%C2%A8Z%C2%927%09%C2%94L%C3%8C%C3%AA%C2%82%C3%801%C3%AC%C3%89%C2%BF%2F%60%C2%B8%1Dy%5B%C2%81%5Cd%1D%C2%8E%60%5B%5E%C3%81%C2%B8%3F%2B%C2%A2%C2%92%3C%C2%A5%C2%94%5D%C3%88TND%2C%C2%94%C2%BD%C3%9C%C2%A1%C2%94R%C3%9B%C2%952e%C2%81%C2%A9%C2%9E_%1Bsd%2B%C2%A9%3Ca%C3%9D%00%00%00%00IEND%C2%AEB%60%C2%82"; 

var info_imgString1 = "%C2%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%18%00%00%00%18%08%06%00%00%00%C3%A0w%3D%C3%B8%00%00%00%09pHYs%00%00%00%C3%85%00%00%00%C3%85%01%1D%C3%8D%C2%BA%C2%A8%00%00%04%C3%AEiTXtXML%3Acom.adobe.xmp%00%00%00%00%00%3C%3Fxpacket%20begin%3D%22%C3%AF%C2%BB%C2%BF%22%20id%3D%22W5M0MpCehiHzreSzNTczkc9d%22%3F%3E%20%3Cx%3Axmpmeta%20xmlns%3Ax%3D%22adobe%3Ans%3Ameta%2F%22%20x%3Axmptk%3D%22Adobe%20XMP%20Core%209.0-c000%2079.171c27f%2C%202022%2F08%2F16-18%3A02%3A43%20%20%20%20%20%20%20%20%22%3E%20%3Crdf%3ARDF%20xmlns%3Ardf%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%22%3E%20%3Crdf%3ADescription%20rdf%3Aabout%3D%22%22%20xmlns%3Axmp%3D%22http%3A%2F%2Fns.adobe.com%2Fxap%2F1.0%2F%22%20xmlns%3Adc%3D%22http%3A%2F%2Fpurl.org%2Fdc%2Felements%2F1.1%2F%22%20xmlns%3Aphotoshop%3D%22http%3A%2F%2Fns.adobe.com%2Fphotoshop%2F1.0%2F%22%20xmlns%3AxmpMM%3D%22http%3A%2F%2Fns.adobe.com%2Fxap%2F1.0%2Fmm%2F%22%20xmlns%3AstEvt%3D%22http%3A%2F%2Fns.adobe.com%2Fxap%2F1.0%2FsType%2FResourceEvent%23%22%20xmp%3ACreatorTool%3D%22Adobe%20Photoshop%2024.1%20(Windows)%22%20xmp%3ACreateDate%3D%222023-01-20T14%3A48%3A08%2B09%3A00%22%20xmp%3AModifyDate%3D%222023-01-20T14%3A48%3A33%2B09%3A00%22%20xmp%3AMetadataDate%3D%222023-01-20T14%3A48%3A33%2B09%3A00%22%20dc%3Aformat%3D%22image%2Fpng%22%20photoshop%3AColorMode%3D%223%22%20xmpMM%3AInstanceID%3D%22xmp.iid%3A5afe03e2-5819-2645-a357-d21e8fa93d8d%22%20xmpMM%3ADocumentID%3D%22xmp.did%3A5afe03e2-5819-2645-a357-d21e8fa93d8d%22%20xmpMM%3AOriginalDocumentID%3D%22xmp.did%3A5afe03e2-5819-2645-a357-d21e8fa93d8d%22%3E%20%3CxmpMM%3AHistory%3E%20%3Crdf%3ASeq%3E%20%3Crdf%3Ali%20stEvt%3Aaction%3D%22created%22%20stEvt%3AinstanceID%3D%22xmp.iid%3A5afe03e2-5819-2645-a357-d21e8fa93d8d%22%20stEvt%3Awhen%3D%222023-01-20T14%3A48%3A08%2B09%3A00%22%20stEvt%3AsoftwareAgent%3D%22Adobe%20Photoshop%2024.1%20(Windows)%22%2F%3E%20%3C%2Frdf%3ASeq%3E%20%3C%2FxmpMM%3AHistory%3E%20%3C%2Frdf%3ADescription%3E%20%3C%2Frdf%3ARDF%3E%20%3C%2Fx%3Axmpmeta%3E%20%3C%3Fxpacket%20end%3D%22r%22%3F%3E%C3%83%C3%BE%C2%A4%C2%90%00%00%01WIDATH%C2%89%C2%BD%C2%96AN%C3%82%40%14%C2%86%3F%0A1.%5D%02G%C3%80%15%24%1A%0E%C3%90x%0Ec%C3%9C%C2%B86%C3%91%C2%84%C2%8Dq%C3%A9%C3%82%C2%B5%C3%97p%C2%8D%17h1%C3%80-%C3%B0%08P%13%C3%B3%C2%BB%C2%98%C2%A9%14%1Df%06%C2%B4%C3%BE%C3%89K%C3%9B%C3%A4%C3%B5%C3%BF%C3%A7M_%C3%A7%7F%0DIx%C3%90%01%C2%86%C3%80%C2%A0%12%003%60n%C2%AF%19%C2%B0%C3%98%C3%8A%20%C3%89%15MI7%C2%92%C2%96%0A%C2%A3%C2%904%C2%B2%C3%AF%C3%BC%C3%A0r%C2%91%1FK%C3%8A%23%C2%88%C2%BFc%22%C2%A9%17%12%C2%B8%C2%B4%2B%C3%9A%17%2B%C3%8B%C3%A1%14%C3%A8%C3%99%C2%84m%C2%98JJmL%3Dy%C2%85%C3%8C.l%084eJ%C3%B4!%C2%AD%2C%26%0D%C3%A4%C3%A6%C2%96%C2%93%C3%84~%C3%AB%5B%C3%A0%C3%84%C3%97N%3B%C3%A2%14%C2%B8.%C2%BB%C2%A8%C2%AB%C2%B8%7D%C2%8F%C3%9D%C2%A2%12KI%C2%9D%C2%96%C3%AD%C3%B3%C2%83%C2%88U%0D%C2%80%C2%97%1D%C2%AA8%04%C2%86-%C3%96%3FO%08O%C3%80%C3%98%C3%9E%C2%9F%01W1%C2%8Bj%01%C3%BDH%C2%811%C3%B0%5Cy%C2%8E%12H%C2%88%C2%AF%60%1F%0C%C2%92p%C3%8E%C3%AF%C2%90%60%0E%C2%AC%C2%BA0%C2%AB%5B%60%C3%BE%2F%15d%C3%80%C2%AA%06%C3%B2w%20K%C2%807%C3%A0%C2%AE%06%C2%81%7B%60Qv%C3%91%230%C3%B9C%C3%B2W%C3%A0%01%C3%B8%3A%C3%AC%3E%C2%80%0BLY%C3%9B%C3%90%06%C2%8El%C2%B4%3Dy%05pn9%C2%9D%C2%86%C3%A3%C3%B3%C2%84%10%0Ay%0C%C2%A7j%3C!op!W%C3%85h%7C%02%C2%A5%01%C2%8D%14w%C2%8C%2Fe%06%04%C2%A7%C3%A97%C3%A4%1F%5B%C2%BA%C2%AC%C3%87%C2%96%3E%C2%9BcK%19%19%C2%A6%13%C2%9D%C3%B8%04%C3%B1%037%C2%BC%C3%BDu%C2%89%C2%B3%00%00%00%00IEND%C2%AEB%60%C2%82"; 
var info_imgString2 = "%C2%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%18%00%00%00%18%08%06%00%00%00%C3%A0w%3D%C3%B8%00%00%00%09pHYs%00%00%00%C3%85%00%00%00%C3%85%01%1D%C3%8D%C2%BA%C2%A8%00%00%04%C3%AEiTXtXML%3Acom.adobe.xmp%00%00%00%00%00%3C%3Fxpacket%20begin%3D%22%C3%AF%C2%BB%C2%BF%22%20id%3D%22W5M0MpCehiHzreSzNTczkc9d%22%3F%3E%20%3Cx%3Axmpmeta%20xmlns%3Ax%3D%22adobe%3Ans%3Ameta%2F%22%20x%3Axmptk%3D%22Adobe%20XMP%20Core%209.0-c000%2079.171c27f%2C%202022%2F08%2F16-18%3A02%3A43%20%20%20%20%20%20%20%20%22%3E%20%3Crdf%3ARDF%20xmlns%3Ardf%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%22%3E%20%3Crdf%3ADescription%20rdf%3Aabout%3D%22%22%20xmlns%3Axmp%3D%22http%3A%2F%2Fns.adobe.com%2Fxap%2F1.0%2F%22%20xmlns%3Adc%3D%22http%3A%2F%2Fpurl.org%2Fdc%2Felements%2F1.1%2F%22%20xmlns%3Aphotoshop%3D%22http%3A%2F%2Fns.adobe.com%2Fphotoshop%2F1.0%2F%22%20xmlns%3AxmpMM%3D%22http%3A%2F%2Fns.adobe.com%2Fxap%2F1.0%2Fmm%2F%22%20xmlns%3AstEvt%3D%22http%3A%2F%2Fns.adobe.com%2Fxap%2F1.0%2FsType%2FResourceEvent%23%22%20xmp%3ACreatorTool%3D%22Adobe%20Photoshop%2024.1%20(Windows)%22%20xmp%3ACreateDate%3D%222023-01-20T14%3A48%3A08%2B09%3A00%22%20xmp%3AModifyDate%3D%222023-01-20T14%3A48%3A43%2B09%3A00%22%20xmp%3AMetadataDate%3D%222023-01-20T14%3A48%3A43%2B09%3A00%22%20dc%3Aformat%3D%22image%2Fpng%22%20photoshop%3AColorMode%3D%223%22%20xmpMM%3AInstanceID%3D%22xmp.iid%3Adf94e263-b5f9-b94e-8803-5dc6d4b2b58c%22%20xmpMM%3ADocumentID%3D%22xmp.did%3Adf94e263-b5f9-b94e-8803-5dc6d4b2b58c%22%20xmpMM%3AOriginalDocumentID%3D%22xmp.did%3Adf94e263-b5f9-b94e-8803-5dc6d4b2b58c%22%3E%20%3CxmpMM%3AHistory%3E%20%3Crdf%3ASeq%3E%20%3Crdf%3Ali%20stEvt%3Aaction%3D%22created%22%20stEvt%3AinstanceID%3D%22xmp.iid%3Adf94e263-b5f9-b94e-8803-5dc6d4b2b58c%22%20stEvt%3Awhen%3D%222023-01-20T14%3A48%3A08%2B09%3A00%22%20stEvt%3AsoftwareAgent%3D%22Adobe%20Photoshop%2024.1%20(Windows)%22%2F%3E%20%3C%2Frdf%3ASeq%3E%20%3C%2FxmpMM%3AHistory%3E%20%3C%2Frdf%3ADescription%3E%20%3C%2Frdf%3ARDF%3E%20%3C%2Fx%3Axmpmeta%3E%20%3C%3Fxpacket%20end%3D%22r%22%3F%3E%02w%22%C2%9E%00%00%01UIDATH%C2%89%C2%BD%C2%96QJ%C3%83%40%10%C2%86%C2%BFI%3D%40%1F%C3%9B%1E%C2%A1y2%C2%A0x%C2%80%C3%A0s%C3%B5%04%22%7D%C3%B1YP%C3%A8%C2%8Bx%0AO%C3%92%17O%C2%90%06%C3%9A%C3%9E%C2%A2%1E!F%C2%90%C3%B1!%1B%C2%9A%C2%B6%C2%BB%C3%99M%C2%B5%C3%BE%C3%B0%C2%93%04fgfg7%C3%B3%C2%8F%C2%A8*.%C2%88%C3%88%10%C2%B8%02%C2%92%06%01V%C3%80%C3%9A%3C3U%C3%9D8%C2%9D%C2%A8%C3%AA%01%C2%81%1E%C3%B0%04%14%C2%80zX%023%C2%A0g%C3%B5eq%1E%03%C2%8B%00%C3%87%C3%BB%C3%8C%C2%81qk%00%60j2%C3%AA%C3%AA%C2%BC%C3%A6'0%C2%B5%06%00%C3%86%C3%86%C3%80%C2%B5x%09%C2%A4%C2%86KO%C3%89%C3%A2%C2%9D%00%C2%A6%C3%A6%C2%B9'%C2%BB%C2%B4%C2%91L%C3%AA%C2%B1%5D%C3%94g%12%C2%99%C2%B3~%06.%C2%9C7%C2%A1%3B.%C2%81%C3%87%C3%BAcDX%C3%9DCKT%C2%B3%00%C2%86%00%C2%B7%01%C3%86%C3%87%C3%B2%C3%A6%C2%8C%C3%AD%C3%8F%C3%A3%C3%83%1B%C3%B0n%C3%9E%C2%AF%C2%81%C2%87%C2%805%09%C3%80%3C0%C2%9BI%C3%A3%C2%90'%C2%81k%C3%A6Q%C2%87%1D%1C%C2%83%24%C3%B2%C3%9B%C3%BC%0E%11U%C3%83%3A%15V%C2%A7%0E%C2%B0%C3%BE%C2%97%1DdT%3D%C3%A8%C2%AF%C3%B1%05d%C2%91%C2%AA~%00%2F'%08%C3%B0%C2%AA%C2%AA%C2%9Bf%C2%B3%C3%B3i%40%C2%97%C3%BF%20%C2%A7%C3%99%C3%ACT%C3%B5%1B%C2%B87%C3%9Bra%20%22%7D%11%C3%A9%03%C2%83%16%C2%BB%12%C2%B83%3E%C2%AD%C2%82%C3%93%C2%A6%09%3E%C2%96%C2%B8%04gOx%7C%C3%9A%C3%A0%C3%92%C2%80%C3%B8%C3%80_%C2%8B%C3%A8%C3%8F%08k%C3%A3%05%C3%95%C2%80%60%15%7D%C3%B1%C2%8C-%23%C2%B6c%C3%8B9%C2%BBcK%C3%8D%C3%8C%C3%9CD%2B~%00%06%C2%B5%C2%B1%C3%80%C2%99%C3%B6%13%C2%BE%00%00%00%00IEND%C2%AEB%60%C2%82"; 

var setting1 = createImageFile("settingButton1", settingImgStr1, getIconsFolder());
var setting2 = createImageFile("settingButton2", settingImgStr2, getIconsFolder());

var info1 = createImageFile("infoButton1", info_imgString1, getIconsFolder());
var info2 = createImageFile("infoButton2", info_imgString2, getIconsFolder());

var settingIcon = ScriptUI.newImage(setting1,setting2,setting2,setting1);
var infoIcon = ScriptUI.newImage(info1,info2,info2,info1);

var res_set = cutSet_pnl.add("group", undefined, {name: "res_set"}); 
    res_set.orientation = "row"; 
    res_set.alignChildren = ["left","center"]; 
    res_set.spacing = 10; 
    res_set.margins = 0; 
    res_set.alignment = ["left","top"]; 
var res_txt = res_set.add("statictext", undefined, undefined, {name: "res_txt"}); 
    res_txt.text = "解像度";
var res_width_edtxt = res_set.add('edittext {properties: {name: "res_width_edtxt"}}'); 
    res_width_edtxt.text = "1920"; 
    res_width_edtxt.preferredSize.width = 50; 

var batu_txt = res_set.add("statictext", undefined, undefined, {name: "batu_txt"}); 
    batu_txt.text = "×";

var res_height_edtxt = res_set.add('edittext {properties: {name: "res_height_edtxt"}}'); 
    res_height_edtxt.text = "1080"; 
    res_height_edtxt.preferredSize.width = 50; 



var size = 30;
var settingbutton = res_set.add("iconbutton", [0, 0, size, size], settingIcon, { style: "toolbutton", toggle: 0 });
    settingbutton.alignment = ["right","center"]; 

var aboutButton = res_set.add("iconbutton", [0, 0, size, size], infoIcon, { style: "toolbutton", toggle: 0 });
    aboutButton.alignment = ["right","center"]; 

var button_group1 = cutSet_pnl.add("group", undefined, {name: "button_group1"}); 
    button_group1.orientation = "row"; 
    button_group1.alignChildren = ["center","center"]; 
    button_group1.spacing = 10; 
    button_group1.margins = 0; 
    button_group1.alignment = ["center","center"]

var apply_btn = button_group1.add("button", undefined, undefined, {name: "apply_btn"}); 
    apply_btn.text = "保存/更新"; 
    apply_btn.preferredSize.width = 80; 
    apply_btn.alignment = ["center","top"];
var instOnly_btn = button_group1.add("button", undefined, undefined, {name: "instOnly_btn"}); 
    instOnly_btn.text = "指示打ち"; 
    instOnly_btn.preferredSize.width = 80; 
    instOnly_btn.alignment = ["center","top"]; 
var serifuOnly_btn = button_group1.add("button", undefined, undefined, {name: "serifuOnly_btn"}); 
    serifuOnly_btn.text = "台詞打ち"; 
    serifuOnly_btn.preferredSize.width = 80; 
    serifuOnly_btn.alignment = ["center","top"]; 



// TOOLBOX_PNL
// ===========
var toolBox_pnl = palette.add("panel", undefined, undefined, {name: "toolBox_pnl"}); 
    toolBox_pnl.text = "ツールボックス"; 
    toolBox_pnl.preferredSize.width = 333; 
    toolBox_pnl.orientation = "column"; 
    toolBox_pnl.alignChildren = ["left","top"]; 
    toolBox_pnl.spacing = 10; 
    toolBox_pnl.margins = 10; 
    toolBox_pnl.alignment = ["left","top"]; 

// TOOLS GROUP1
// ======
var tools_group1 = toolBox_pnl.add("group", undefined, {name: "group1"}); 
    tools_group1.orientation = "row"; 
    tools_group1.alignChildren = ["left","center"]; 
    tools_group1.spacing = 10; 
    tools_group1.margins = 0; 

var get_save = tools_group1.add("button", undefined, undefined, {name: "get_save"}); 
    get_save.text = "保存場所"; 
    get_save.preferredSize.width = 75; 

var crop_ = tools_group1.add("button", undefined, undefined, {name: "crop_"}); 
    crop_.text = "サイズ合わせ"; 
    crop_.preferredSize.width = 90; 

var Export = tools_group1.add("button", undefined, undefined, {name: "Export"}); 
    Export.text = "Export in AE"; 
    Export.preferredSize.width = 75;


// CUT_SLC_PNL
// ===========
var cutSlc_pnl = palette.add("panel", undefined, undefined, {name: "cutSlc_pnl"}); 
    cutSlc_pnl.text = "カット関連"; 
    cutSlc_pnl.preferredSize.width = 333; 
    cutSlc_pnl.orientation = "row"; 
    cutSlc_pnl.alignChildren = ["left","top"]; 
    cutSlc_pnl.spacing = 10; 
    cutSlc_pnl.margins = 10; 
    cutSlc_pnl.alignment = ["left","top"];     
// CUTS GROUP1
// ======
var cuts_group1 = cutSlc_pnl.add("group", undefined, {name: "cut_group1"}); 
    cuts_group1.orientation = "row"; 
    cuts_group1.alignChildren = ["left","center"]; 
    cuts_group1.spacing = 10; 
    cuts_group1.margins = 0; 

var cutDD = cuts_group1.add("dropdownlist", undefined, "カット情報なし");
    cutDD.preferredSize.width = 150;

//var exportButton = cutSlc_pnl.add("button", undefined, "Export Layer Info");
var importButton = cutSlc_pnl.add("button", undefined, "カット読込み");
var deleteInfoButton = cutSlc_pnl.add("button", undefined, "カット情報消去"); 

/*
// FRAMEPOSITION
// =============
var framePosition = palette.add("panel", undefined, undefined, {name: "framePosition"}); 
    framePosition.text = "フレーム位置"; 
    framePosition.orientation = "column"; 
    framePosition.alignChildren = ["left","top"]; 
    framePosition.spacing = 10; 
    framePosition.margins = 10; 

// PICNUMGRP
// =========
var picNumGrp = framePosition.add("group", undefined, {name: "picNumGrp"}); 
    picNumGrp.orientation = "row"; 
    picNumGrp.alignChildren = ["left","center"]; 
    picNumGrp.spacing = 10; 
    picNumGrp.margins = 0; 

var picNum = picNumGrp.add("statictext", undefined, undefined, {name: "picNum"}); 
    picNum.text = "画面数"; 

var picNumEdtxt = picNumGrp.add('edittext {properties: {name: "picNumEdtxt"}}'); 
    picNumEdtxt.text = "1"; 
    picNumEdtxt.preferredSize.width = 23; 

var currentSlider = picNumGrp.add("slider", undefined, undefined, undefined, undefined, {name: "currentSlider"}); 
    currentSlider.minvalue = 1; 
    currentSlider.maxvalue = 1; 
    currentSlider.value = 1; 
    currentSlider.preferredSize.width = 150; 

var currentPic = picNumGrp.add("statictext", undefined, undefined, {name: "currentPic"}); 
    currentPic.text = "1"; 
    currentPic.preferredSize.width = 15; 

var picSetBtn = picNumGrp.add("button", undefined, undefined, {name: "picSetBtn"}); 
    picSetBtn.text = "SET"; 
*/
//Initialization
//=============

//
var scriptName = "Conte Assistant";
//var myComp = app.project.activeItem; 
var getWindow = new SingletonWindow("palette", "設定");
var myColor;
var userFont = "MS-Gothic";
var cutAddOne = true;

//Default Settings
var defaultSettings = {
    "eps" : true,
    "part" : true,
    "sence" : true,
    "serifu" : true,
    "sendToAME" : false,
    
    "Title" : "title",
    "Epsd" : "1",
    "PART" : "A",
    "Sence" : "001",
    "Cut" : "001",
    "resW" : 1920,
    "resH" : 1080,
    "second" : 1,
    "frame" : 12,
    "FPS" : 24,
    "charaN" : "",
    "charaS" : "",
    "charaC" : [1,0,0],
    "font" : "MS-Gothic",
    "addOne" : true

}

var settings = {
    "eps" : true,
    "part" : true,
    "sence" : true,
    "serifu" : true,
    "sendToAME" : false,
    
    "Title" : "title",
    "Epsd" : "1",
    "PART" : "A",
    "Sence" : "001",
    "Cut" : "001",
    "resW" : 1920,
    "resH" : 1080,
    "second" : 1,
    "frame" : 12,
    "FPS" : 24,
    "charaN" : "",
    "charaS" : "",
    "charaC" : [1,0,0],
    "font" : "MS-Gothic",
    "addOne" : true

}

//Get folders functions

function isSecurityPrefSet() {
    try {
        var securitySetting = app.preferences.getPrefAsLong("Main Pref Section", "Pref_SCRIPTING_FILE_NETWORK_SECURITY");
        return securitySetting == 1;
    } catch (e) {
        return securitySetting = 1;
    }
}
function checkScriptSet(){
    if (!isSecurityPrefSet()) {
        alert("このスクリプトはファイルを書き込むためにアクセス権限が必要です。環境設定にスクリプトとエクスプレッションを選択し、「スクリプトによるファイルへの書き込みとネットワークへのアクセスを許可」オプションをチェックしてください！",scriptName);
        try {
            app.executeCommand(2359);
        }
        catch (e) {
            alert(e);
        }
        if (!isSecurityPrefSet()) return null;
    
    } 
}
checkScriptSet();

function getIconsFolder() {
    var userDataFolder = Folder.userData;
    var aescriptsFolder = Folder(userDataFolder.toString() + "/ConteAssistant/Icons");
    if (!aescriptsFolder.exists) {
        var checkFolder = aescriptsFolder.create();
        if (!checkFolder) {
            alert("フォルダー作成エラー！",scriptName);
            aescriptsFolder = Folder.temp;
        }
    }
    return aescriptsFolder.toString();
}

function getCutInfoFolder() {
    var userDataFolder = Folder.userData;
    var aescriptsFolder = Folder(userDataFolder.toString() + "/ConteAssistant/CutInfo");
    if (!aescriptsFolder.exists) {
        var checkFolder = aescriptsFolder.create();
        if (!checkFolder) {
            alert("フォルダー作成エラー！",scriptName);
            aescriptsFolder = Folder.temp;
        }
    }
    return aescriptsFolder.toString();
}
function getSettingsFolder() {
    var userDataFolder = Folder.userData;
    var aescriptsFolder = Folder(userDataFolder.toString() + "/ConteAssistant/Config");
    if (!aescriptsFolder.exists) {
        var checkFolder = aescriptsFolder.create();
        if (!checkFolder) {
            alert("フォルダー作成エラー！",scriptName);
            aescriptsFolder = Folder.temp;
        }
    }
    return aescriptsFolder.toString();
}
function getScriptsFolder() {
    var userDataFolder = Folder.userData;
    var aescriptsFolder = Folder(userDataFolder.toString() + "/ConteAssistant/Scripts");
    if (!aescriptsFolder.exists) {
        var checkFolder = aescriptsFolder.create();
        if (!checkFolder) {
            alert("フォルダー作成エラー！",scriptName);
            aescriptsFolder = Folder.temp;
        }
    }
   // return aescriptsFolder.toString();
}

function createImageFile(filename, imgString, resourceFolder) {
    var binaryString = File.decode(imgString)
    var myFile = new File(resourceFolder + "/" + filename + ".png");
    if (!File(myFile).exists) {
        if (!isSecurityPrefSet()) {
            alert("このスクリプトはファイルを書き込むためにアクセス権限が必要です。環境設定にスクリプトとエクスプレッションを選択し、「スクリプトによるファイルへの書き込みとネットワークへのアクセスを許可」をチェックしてください！",scriptName);
            try {
                app.executeCommand(2359);
            }
            catch (e) {
                alert(e);
            }
            if (!isSecurityPrefSet()) return null;
        }
        myFile.encoding = "BINARY";
        myFile.open("w");
        myFile.write(binaryString);
        myFile.close();
    }
    return myFile;
}


function getPSFolder() {
    getScriptsFolder();
    var userDataFolder = Folder.userData.fsName;
    var aescriptsFolder = userDataFolder.toString() + "/ConteAssistant/Scripts";
    return aescriptsFolder.toString();
}




function loadCutDDL(){
    var folder = new Folder(getCutInfoFolder());;
        if (folder != null) {
            cutDD.removeAll();
            var files = folder.getFiles();
            if(files.length !== 0){
               for (var i = 0; i < files.length; i++) {
                    if(files[i].displayName !== ".DS_Store") cutDD.add("item", files[i].displayName.replace(".txt", "").replace(new RegExp(/(_)/g), " "));
                    cutDD.selection = 0;
                }  
            }else{
                cutDD.add("item","カット情報なし");
                cutDD.selection = 0;
            }
        }
       
}

function deleteAllCutInfo(){
    var folder = new Folder(getCutInfoFolder());;
    if (folder.exists) {
        var files = folder.getFiles();
        for (var i = 0; i < files.length; i++) {
            files[i].remove();
        }
    }
    while (cutDD.items.length > 0) {
        cutDD.remove(cutDD.items[0]);
    }
    cutDD.add("item","カット情報なし");
    cutDD.selection = 0;
}

loadCutDDL();

var psFolder = getPSFolder();

const commandWin = 
'[System.Reflection.Assembly]::LoadWithPartialName("System.Drawing")\
$fontList = (New-Object System.Drawing.Text.InstalledFontCollection)\
$fontFile = "' + psFolder + '/fonts.txt"\
if (Test-Path $fontFile) {\
    Remove-Item $fontFile\
}\
for ($i = 0; $i -lt $fontList.Families.Length; $i++) {\
    $fontNames = $fontList.Families[$i].Name\
    Add-Content $fontFile "$fontNames"\
}';

function getFont(){
    //If os is windows
    if($.os.indexOf("Windows") != -1){
        //windows
        var psFile = File(psFolder + '/getFonts.ps1');
        if (!psFile.exists) {
            psFile.open("w");
            psFile.write(commandWin);
            psFile.close();
            var pathToPs1File = psFolder + '/getFonts.ps1';
            system.callSystem("cmd.exe /c PowerShell.exe -ExecutionPolicy UnRestricted -File " + pathToPs1File);
            $.sleep(500);
    }

    }else{
        //macOS
        system.callSystem("system_profiler SPFontsDataType | awk '/Typefaces:/,/^[[:space:]]*$/' | grep -o '^[^:]*:' | tr -d ':' | sort | uniq > '" + psFolder + "/fonts.txt'")
    }

}


var font = File(psFolder + "/fonts.txt");
if(!font.exists)getFont();

font.open("r");
var lines = [];
while(!font.eof)
    lines.push(font.readln());

font.close();

lines.splice(-7, 7);
lines.splice(0, 16);

for (var i = 0; i < lines.length; i++) {
    lines[i] = lines[i].replace(/ /g, '').replace(/\./g, '');
    lines[i] = lines[i].replace('AppleSDGothicNeoI', 'AppleSDGothicNeo');
}

font.open("w");

for (var i = 0; i < lines.length; i++) {
    font.writeln(lines[i]);
}

font.close();


//Creat window function
function SingletonWindow(type, name) {
    var container = null;
    return function () {
        if (container === null || container.visible === false) container = new Window(type, name);
        return container;
    };
}

//JSON File functions
function createConfigJSON(obj){
    var folder = getSettingsFolder();
    var configFile = File(folder + "/config.json");
        configFile.open("w");
        configFile.write(JSON.stringify(obj));
        configFile.close();
    
}
function readConfigJSON(file){
    file.open("r");
    var data = file.read();
    file.close();
    data = JSON.parse(data);
    for(var i in data){
        settings[i] = data[i];
    }
}
//Load settings

var folder = getSettingsFolder();
var configFile = File(folder + "/config.json");
if(!configFile.exists) createConfigJSON(settings)
else readConfigJSON(File(folder + "/config.json"));

function loadSettings(lsettings){
    for(var i in lsettings){
        switch (i) {
            case "serifu":
                {serifu_edtxt.enabled = lsettings[i];
                serifu_txt.enabled = lsettings[i];}
                break;
            case "eps":
                {epsNum_txt.enabled = lsettings[i];
                eps_txt.enabled = lsettings[i];}
                break;
            case "part":
                {part_edrtx.enabled = lsettings[i];
                part_txt.enabled = lsettings[i];}
                break;
            case "sence":
                {sence_edtxt.enabled = lsettings[i];
                sence_txt.enabled = lsettings[i];}
                break;
            case "Title":
                {titleName_txt.text = lsettings[i];}
                break;
            case "Epsd":
                {epsNum_txt.text = lsettings[i];}
                break;
            case "PART":
                {part_edrtx.text = lsettings[i];}
                break;
            case "Sence":
                {sence_edtxt.text = lsettings[i];}
                break;
            case "Cut":
                {cno_edtxt.text = lsettings[i];}
                break;
            case "resW":
                {res_width_edtxt.text = lsettings[i];}
                break;
            case "resH":
                {res_height_edtxt.text = lsettings[i];} 
                break;
            case "sendToAME":
                {if(lsettings[i]){Export.text = "Send To AME";}
                else{Export.text = "Export in AE";}}       
                break;       
            case "second":
                {time_sec.text = lsettings[i];} 
                break;    
            case "frame":
                {time_frm.text = lsettings[i];} 
                break;  
            case "FPS":
                {fmrat_edtxt.text = lsettings[i];} 
                break;
            case "charaN":
                {charaName_txt.text = lsettings[i];} 
                break;     
            case "charaS":
                {serifu_edtxt.text = lsettings[i];} 
                break; 
            case "charaC":
                {myColor = lsettings[i];} 
                break;
            case "font":
                {userFont = "MS-Gothic";} 
                break;         
            case "addOne":
                {cutAddOne = lsettings[i];}    
                break;
            default:
                break;
        }
        
    }
}
loadSettings(settings);

//Define color button
getColor_btn.fillBrush = getColor_btn.graphics.newBrush(getColor_btn.graphics.BrushType.SOLID_COLOR,myColor);
getColor_btn.onDraw = customDraw;

//Expressions
var setAnchorPonintTopRightExp =  
    "a = thisLayer.sourceRectAtTime();\
    height = a.height;\
    width = a.width;\
    top = a.top; left = a.left;\
    x = left;\
    y = top;\
    [x,y];";
var setAnchorPonintCenterExp =  
    "a = thisLayer.sourceRectAtTime();\
    height = a.height;\
    width = a.width;\
    top = a.top; left = a.left;\
    x = left + width / 2;\
    y = top + height / 2;\
    [x,y];";    

var setRectSizeExp =
    "function getRectSize(nH,nW,sH,sW){\
        var tempW;\
        nW > sW ? tempW = nW : tempW = sW;\
        return [tempW+10,sH+nH+10];\
    }\
    var charaNameSizeH = thisComp.layer(1).sourceRectAtTime(0,false).height;\
    var charaNameSizeW = thisComp.layer(1).sourceRectAtTime(0,false).width;\
    var charaSerifuSizeH = thisComp.layer(2).sourceRectAtTime(0,false).height;\
    var charaSerifuSizeW = thisComp.layer(2).sourceRectAtTime(0,false).width;\
    var rectSize = getRectSize(charaNameSizeH,charaNameSizeW,charaSerifuSizeH,charaSerifuSizeW);\
    rectSize;";
var setRectSizeForOwn = 
    "s=thisComp.layer(1);\
    w=s.sourceRectAtTime().width;\
    h=s.sourceRectAtTime().height;\
    [w-10,h-10]";

//set default expression engine to javascript
if (app.project.expressionEngine == "extendscript") {
    app.project.expressionEngine = "javascript-1.0";
}

//draw a rectangle on button frim top left to bottom right
function customDraw(){
    with(this){
        graphics.drawOSControl();
        graphics.rectPath(0,0,size[0],size[1]);
        graphics.fillPath(fillBrush);
    }
}

//Completing numbers to specified digits
function dataLeftCompleting(originData, bits) {
    identifier = "0";
    originData = Array(bits + 1).join(identifier) + originData;
    return originData.slice(-bits);
}

//Maybe useful~
function getRectSize(nH, nW, sH, sW){
    var tempW;
    nW > sW ? tempW = nW : tempW = sW;
    return [tempW + 10, sH + nH + 10];
}

//Call color picker in AE
function ColorPicker(startValue){
    // find the active comp
    if (!app.project.activeItem || !(app.project.activeItem instanceof CompItem)) {
      alert("コンポを開けてください！",scriptName);
      return [];
    }
  
    // add a temp null;
    var newNull = app.project.activeItem.layers.addNull();
    var newColorControl = newNull("ADBE Effect Parade").addProperty("ADBE Color Control");
    var theColorProp = newColorControl("ADBE Color Control-0001");
  
    // set the value given by the function arguments
    if (startValue && startValue.length == 3) {
      theColorProp.setValue(startValue);
    }
  
    // prepare to execute
    var editValueID = 2240 // or app.findMenuCommandId("Edit Value...");
    theColorProp.selected = true;
    app.executeCommand(editValueID);
  
    // harvest the result
    var result = theColorProp.value;
  
    // remove the null
    if (newNull) {
      newNull.remove();
    }
    return result;
}

//As its name
function changeCompRes(compName,resW,resH){
        compName.width = resW;
        compName.height = resH;    
}

//Centerize all layers in specified comp
function centerLayersInComp(compName){
    var myComp,h,w;
    for (var i = 1; i <= app.project.numItems; i++){
        if(app.project.item(i).name == compName){ 
            if(app.project.item(i) instanceof CompItem){
                myComp = app.project.item(i);
                h = myComp.height;
                w = myComp.width;
            }
        }
    }
    for(var i = 1; i <= myComp.numLayers; i++){
            myComp.layer(i).property("Position").setValue([w / 2, h / 2]);
    }
}

//Main Function
//=============


/*----------------------Cut Set-----------------------*/ 
//Get Color Button Function
getColor_btn.onClick = getColor;
function getColor(){
    myColor = ColorPicker([1, 0, 0]);
    getColor_btn.fillBrush = getColor_btn.graphics.newBrush(getColor_btn.graphics.BrushType.SOLID_COLOR,myColor);
    getColor_btn.onDraw = customDraw;
    getColor_btn.enabled = false;//update button
    getColor_btn.enabled = true;
    settings["charaC"] = myColor;
    createConfigJSON(settings);
}

function changeCutSet(){
    var sec = time_sec.text;
    var koma = time_frm.text;
    var fps = fmrat_edtxt.text;
    var compTime = ( parseInt(sec) * parseInt(fps) ) + parseInt(koma);
    var resW = Number(res_width_edtxt.text);
    var resH = Number(res_height_edtxt.text);

    //set comp time and framerate
    app.project.activeItem.duration = compTime / fps;
    app.project.activeItem.frameDuration = 1 / fps;

    settings["resW"] = resW;
    settings["resH"] = resH;
    settings["second"] = sec;
    settings["FPS"] = fps;
    settings["frame"] = koma;
    
    createConfigJSON(settings);

    var comps = {
        "*Output": {
            resW: resW + 240,
            resH: resH + 200
        },
        "film": {
            resW: resW,
            resH: resH
        },
        "3_台詞": {
            resW: resW,
            resH: resH
        },
        "_info": {
            resW: resW + 240,
            resH: resH + 200
        },
        "camera": {
            resW: resW,
            resH: resH
        }
    }
    //get cut comp
    for (var i = 1; i <= app.project.numItems; i++){
        if(app.project.item(i).name == "2_cut"){ 
            if(app.project.item(i) instanceof CompItem){
                app.project.item(i).duration = compTime / fps;
                app.project.item(i).frameDuration = 1 / fps;
            }
        }
        var compName = app.project.item(i).name;
        var comp = app.project.item(i);
        var compData = comps[compName];
        if (compData) {
            if(comp.name == "camera"){
                comp.duration = 1 / fps;
                comp.frameDuration = 1 / fps;
            }else{
                comp.duration = compTime / fps;
                comp.frameDuration = 1 / fps;
            }
            changeCompRes(comp, compData.resW, compData.resH);
            centerLayersInComp(compName);
        }
    }
}

function changeCutInfo(){
    var titleName = titleName_txt.text;
    var partIndex = part_edrtx.text;
    var senceNum = sence_edtxt.text;
    var cutNum = cno_edtxt.text;
    var takeNum = takeNum_txt.text;
    var epsNum = epsNum_txt.text; 
    var infoComp;
    for (var i = 1; i <= app.project.numItems; i++){
        if(app.project.item(i).name == "_info"){ 
            if(app.project.item(i) instanceof CompItem){
                infoComp = app.project.item(i);
            }
        } 
    } 
    var epsoideTxt = "#" + dataLeftCompleting(epsNum,2);
    var partTxt = "  PART- "+ partIndex.toUpperCase();
    var senceTxt = "  S" + dataLeftCompleting(senceNum,3);
    var nEpsTxt = "";
    var nPartTxt = "";
    var nSenceTxt = "";
    if(settings["eps"])nEpsTxt = epsoideTxt;
    if(settings["part"])nPartTxt = partTxt;
    if(settings["sence"])nSenceTxt = senceTxt;

    settings["Title"] = titleName.toString();
    settings["Epsd"] = epsNum.toString();
    settings["PART"] = partIndex.toString();
    settings["Sence"] = senceNum.toString();
    settings["Cut"] = cutNum.toString();
    createConfigJSON(settings);

    var infoText = titleName + nEpsTxt + nPartTxt + nSenceTxt + "  C" + dataLeftCompleting(cutNum,4) + "  tk" + takeNum;
    infoComp.layer(8).property("Source Text").expression = '"' + infoText + '"'
    nEpsTxt = nPartTxt = nSenceTxt = "";

    if(cutAddOne){
        var cutn = parseInt(cutNum);
        cutn++;
        cno_edtxt.text = cutn;
       // alert(cutn);
    }
}
/******************************************************************** */
//Add text you wanted
function addTxt(txtd){
    var instFolderCreated = false;
    var instFolder;
    //Check if serifu folder is created
    for (var i = 1; i <= app.project.numItems; i++){
        if(app.project.item(i).name == "5_指示フォルダ"){ 
            if(app.project.item(i) instanceof FolderItem){
                instFolder = app.project.item(i);
                instFolderCreated = true;
            }
        }
    }
    if (!instFolderCreated){
        instFolder = app.project.items.addFolder("5_指示フォルダ");
        instFolderCreated = true;
    }
    //
    var serifuComp;
    for (var i = 1; i <= app.project.numItems; i++){
        if (app.project.item(i).name == "3_台詞"){ 
            if (app.project.item(i) instanceof CompItem){
                serifuComp = app.project.item(i);
            }
        }
    }
    var myShape = serifuComp.layers.addShape();
    var myText = serifuComp.layers.addText();
    var addtxt = txtd.toString();
    myText.name =  addtxt + " Text";
    myShape.name = addtxt + " BG";

    myShape.property("ADBE Root Vectors Group").addProperty("ADBE Vector Shape - Rect");
    myShape.property("ADBE Root Vectors Group").addProperty("ADBE Vector Graphic - Fill");
    myShape.property("ADBE Root Vectors Group").addProperty("ADBE Vector Filter - Offset");

    myShape.property("ADBE Root Vectors Group").property("ADBE Vector Graphic - Fill").property("ADBE Vector Fill Color").setValue([1,0,0]);
    myShape.property("ADBE Root Vectors Group").property("ADBE Vector Graphic - Fill").property("ADBE Vector Fill Opacity").setValue(50);

    var textProp1 = myText.property("Source Text"); 
    var textDoc1 = textProp1.value;

    textProp1.expression = 'text.sourceText.style.setFillColor([0,0,0]).setFontSize(120).setFont("' + userFont.toString() + '").setStrokeColor([1,1,1]).setStrokeWidth(10).setApplyStroke(1);';    
    textDoc1.resetCharStyle();
    textDoc1.text = addtxt;
    textProp1.setValue(textDoc1);
    textDoc1.strokeOverFill = false;
    textProp1.setValue(textDoc1);


    myText.property("Anchor Point").expression = setAnchorPonintCenterExp;
    myShape.property("Anchor Point").expression = setAnchorPonintCenterExp;

    myShape.property("ADBE Root Vectors Group").property("ADBE Vector Shape - Rect").property("Size").expression = setRectSizeForOwn;
    myShape.property("Anchor Point").expression = setAnchorPonintCenterExp;
    myText.property("Anchor Point").expression = setAnchorPonintCenterExp;

    serifuComp.layers.precompose([1,2], addtxt);
    
    //move inst to folder
    for (var i = 1; i <= app.project.numItems; i++){
        if(app.project.item(i).name == addtxt){ 
            if(app.project.item(i) instanceof CompItem){
                app.project.item(i).parentFolder = instFolder;
            }
        } 
    } 
}


function addSE(){
    addTxt("SE");
}
function addOFF(){
    addTxt("OFF");
}
function addMONO(){
    addTxt("MONO");
}
/******************************************************************** */
//About button
aboutButton.onClick = function(){
// ABOUT
// =====
    var about =  getWindow(); 
    about.text = "About"; 
    about.orientation = "column"; 
    about.alignChildren = ["center","top"]; 
    about.spacing = 10; 
    about.margins = 16; 

    var scriptTitle = about.add("statictext", undefined, undefined, {name: "scriptTitle"}); 
    scriptTitle.text = "Conte Assistant"; 
    scriptTitle.alignment = ["center","top"]; 

    var version = about.add("statictext", undefined, undefined, {name: "version"}); 
    version.text = "Version: 1.1 alpha"; 
    version.alignment = ["left","top"]; 

    var author = about.add("statictext", undefined, undefined, {name: "author"}); 
    author.text = "Author: 千石まよひ (Ma Chexing)"; 
    author.alignment = ["left","top"]; 

    var upDate = about.add("statictext", undefined, undefined, {name: "upDate"}); 
    upDate.text = "Last Update: 2023/05/29"; 
    upDate.alignment = ["left","top"]; 

    var contact = about.add("statictext", undefined, undefined, {name: "contact"}); 
    contact.text = "Contact: mchenxing-contact@yahoo.co.jp"; 
    contact.alignment = ["left","top"]; 

    var notice = about.add("group", undefined , {name: "notice"}); 
    notice.getText = function() { var t=[]; for ( var n=0; n<notice.children.length; n++ ) { var text = notice.children[n].text || ''; if ( text === '' ) text = ' '; t.push( text ); } return t.join('\n'); }; 
    notice.orientation = "column"; 
    notice.alignChildren = ["left","center"]; 
    notice.spacing = 0; 

    notice.add("statictext", undefined, "This is a beta version After Effect script. "); 
    notice.add("statictext", undefined, "Please note this script is only for non-commercial use"); 
    notice.add("statictext", undefined, "Icons created by Freepik - Flaticon");
    notice.add("statictext", undefined, "Copyright © 2023 千石まよひ All Rights Reserved");  
  
    about.show();
}

//Setting button
settingbutton.onClick = changeSettings;
function changeSettings(){
    //UI Start
    var setWindow = getWindow(); 
    setWindow.text = "設定"; 
    setWindow.orientation = "column"; 
    setWindow.alignChildren = ["center","top"]; 
    setWindow.spacing = 10; 
    setWindow.margins = 16; 

    var useSerifu = setWindow.add("checkbox", undefined, undefined, {name: "useSerifu"}); 
    useSerifu.text = "台詞あり"; 
    useSerifu.value = settings["serifu"]; 
    useSerifu.alignment = ["left","top"]; 

    var useEps = setWindow.add("checkbox", undefined, undefined, {name: "useEps"}); 
    useEps.text = "話数あり"; 
    useEps.value = settings["eps"]; 
    useEps.alignment = ["left","top"]; 

    var usePart = setWindow.add("checkbox", undefined, undefined, {name: "usePart"}); 
    usePart.text = "PARTを使用"; 
    usePart.value = settings["part"]; 
    usePart.alignment = ["left","top"]; 

    var useSence = setWindow.add("checkbox", undefined, undefined, {name: "useSence"}); 
    useSence.text = "Senceを使用"; 
    useSence.value = settings["sence"]; 
    useSence.alignment = ["left","top"]; 

    var sendToAME = setWindow.add("checkbox", undefined, undefined, {name: "sendToAME"}); 
    sendToAME.text = "AMEに送る"; 
    sendToAME.value = settings["sendToAME"];
    sendToAME.alignment = ["left","top"]; 

    var addOne = setWindow.add("checkbox", undefined, undefined, {name: "addOne"}); 
    addOne.text = "自動カットナンバ数+1"; 
    addOne.value = settings["addOne"];
    addOne.alignment = ["left","top"]; 

    var fontTxt = setWindow.add("statictext",undefined,"フォント");
    fontTxt.alignment = ["left","top"];
    var fontsDD = setWindow.add("dropdownlist", undefined, []);
    fontsDD.size = [220, 25];


    var reset_btn = setWindow.add("button", undefined, undefined, {name: "reset_btn"}); 
    reset_btn.text = "リセット"; 
    reset_btn.alignment = ["center","top"];
    var ok_btn = setWindow.add("button", undefined, undefined, {name: "ok_btn"}); 
    ok_btn.text = "OK"; 
    ok_btn.alignment = ["center","top"]; 

    
    
    setWindow.show();//Display window
    reset_btn.onClick = function(){
       // for(var i in settings) settings[i]=defaultSettings[i];
        loadSettings(defaultSettings);
    }
    //Click OK button
    ok_btn.onClick = function(){
        //Load settings
        settings["eps"] = useEps.value;
        settings["part"] = usePart.value;
        settings["sence"] = useSence.value;
        settings["serifu"] = useSerifu.value;
        settings["sendToAME"] = sendToAME.value;
        
        settings["addOne"] = addOne.value;
        
        
        //Change settings
        for(var i in settings){
            switch (i) {
                case "serifu":
                    {serifu_edtxt.enabled = settings[i];
                    serifu_txt.enabled = settings[i];}
                    break;
                case "eps":
                    {epsNum_txt.enabled = settings[i];
                    eps_txt.enabled = settings[i];}
                    break;
                case "part":
                    {part_edrtx.enabled = settings[i];
                    part_txt.enabled = settings[i];}
                    break;
                case "sence":
                    {sence_edtxt.enabled = settings[i];
                    sence_txt.enabled = settings[i];}
                    break;
                case "font":
                    settings[i] = userFont.toString();
                    break;
                case "addOne":
                    settings[i] = cutAddOne;
                    break;
                default:
                    break;
            }
        }
        //export button text
        if(settings["sendToAME"]) Export.text = "Send to AME";
        else Export.text = "Export in AE";

        createConfigJSON(settings);//Save settings
        setWindow.close();
    }
}

//Apply Button Function
apply_btn.onClick = apply_it
function apply_it(){    
    changeCutInfo();
    changeCutSet(); 
    expLayerInfo();

    var nEpsTxt = "";
    var nPartTxt = "";
    var nSenceTxt = "";
    var nEpsTxt = "";
    var nPartTxt = "";
    var nSenceTxt = "";
    if(settings["eps"]) nEpsTxt = "#" + String(dataLeftCompleting(epsNum_txt.text,2));
    if(settings["part"]) nPartTxt = "_part-" + String(part_edrtx.text).toLowerCase() ;
    if(settings["sence"]) nSenceTxt =  "_s" + String(dataLeftCompleting(sence_edtxt.text,3))

    var infoText = String(titleName_txt.text) + nEpsTxt + nPartTxt + nSenceTxt + "_c" + String(dataLeftCompleting(cno_edtxt.text,4)) + "_tk" + String(takeNum_txt.text);

    cutDD.remove(cutDD.find("カット情報なし"));
   
    if(cutDD.find(infoText.replace(new RegExp(/(_)/g), " ")) == undefined) {
        cutDD.add("item", infoText.replace(new RegExp(/(_)/g), " "));
        cutDD.selection = cutDD.find(infoText.replace(new RegExp(/(_)/g), " "));
    }
}

//Instrustion button
instOnly_btn.onClick = function(){
    if(if_SE.value)addSE();
    if(if_OFF.value)addOFF();
    if(if_MONO.value)addMONO();
}

//Serifu Only Buttion Function
serifuOnly_btn.onClick = serifu_it


function serifu_it(){ 
   
    var serifuFolderCreated = false;
    var serifuFolder;

    //Check if serifu folder is created
    for (var i = 1; i <= app.project.numItems; i++){
        if(app.project.item(i).name == "4_台詞フォルダ"){ 
            if(app.project.item(i) instanceof FolderItem){
                serifuFolder = app.project.item(i);
                serifuFolderCreated = true;
            }
        }
    }
    if(!serifuFolderCreated){
        serifuFolder = app.project.items.addFolder("4_台詞フォルダ");
        serifuFolderCreated = true;
    }

    var serifuComp;
    for (var i = 1; i <= app.project.numItems; i++){
        if(app.project.item(i).name == "3_台詞"){ 
            if(app.project.item(i) instanceof CompItem){
                serifuComp = app.project.item(i);
            }
        }
    }


    var myCharaSerifu = serifu_edtxt.text;
    //Create text layer and shape layer
    serifuComp.layers.addText();
    serifuComp.layers.addText();
    serifuComp.layers.addShape();
    serifuComp.layer(1).moveAfter(serifuComp.layer(3));

    var charaName = serifuComp.layer(1);
    var charaSerifu = serifuComp.layer(2);
    var textBG = serifuComp.layer(3);
    textBG.name = "Text BG";

    charaName.property("Anchor Point").expression = setAnchorPonintTopRightExp;
    charaSerifu.property("Anchor Point").expression = setAnchorPonintTopRightExp;

    
    var textProp1 = charaName.property("Source Text"); 
    var textDoc1 = textProp1.value;

    var textProp2 = charaSerifu.property("Source Text"); 
    var textDoc2 = textProp2.value;
    

    //Add properties for shape layer(rectangle,set color,set opavity)
    textBG.property("ADBE Root Vectors Group").addProperty("ADBE Vector Shape - Rect");
    textBG.property("ADBE Root Vectors Group").addProperty("ADBE Vector Graphic - Fill");
    textBG.property("ADBE Root Vectors Group").addProperty("ADBE Vector Filter - Offset");

    textBG.property("ADBE Root Vectors Group").property("ADBE Vector Graphic - Fill").property("ADBE Vector Fill Color").setValue([1,0,0]);
    textBG.property("ADBE Root Vectors Group").property("ADBE Vector Graphic - Fill").property("ADBE Vector Fill Opacity").setValue(50);

    //set charater name style
    var myCharaName = charaName_txt.text;
    textProp1.expression = 'text.sourceText.style.setFillColor([' + String(myColor) + ']).setFontSize(45).setFont("' + userFont.toString() + '").setStrokeColor([1,1,1]).setStrokeWidth(5).setApplyStroke(1);';
    
    textDoc1.resetCharStyle();
    textDoc1.text = myCharaName;
    textProp1.setValue(textDoc1);
    textDoc1.strokeOverFill = false;
    textProp1.setValue(textDoc1);

    settings["charaN"] = myCharaName;
    settings["charaS"] = myCharaSerifu;
    createConfigJSON(settings);

    //Auto line change
    var myLine1 = [];
    var myLine2 = [];
    var myNewSerifu;
    
    if(myCharaSerifu.length > 15){ 
        for(var i=0;i<15;i++){
          myLine1[i]=myCharaSerifu.charAt(i);
        }
      
        for(var j=15;j<myCharaSerifu.length;j++){
            myLine2[j]=myCharaSerifu.charAt(j);
        }
        
        var myNewLine1 = myLine1.join('');
        var myNewLine2 = myLine2.join('');
        myNewSerifu = myNewLine1 + "\n" + myNewLine2;
    }else{
        myNewSerifu = myCharaSerifu;
    }
   
    //set serifu text style
    textProp2.expression = 'text.sourceText.style.setFillColor([0,0,0]).setFontSize(45).setFont("' + userFont.toString() + '").setStrokeColor([1,1,1]).setStrokeWidth(3).setApplyStroke(1);';
    textDoc2.resetCharStyle();
    if(settings["serifu"]){
        textDoc2.text = '「' + myNewSerifu + '」';
    }else{
        textDoc2.text = "";
    }
    textProp2.setValue(textDoc2);
    textDoc2.strokeOverFill = false;
    textProp2.setValue(textDoc2);
    charaSerifu.property("Position").expression = 'thisComp.layer(1).transform.position+[0,60]'; 

    //get text boundray and calculate rect size
    /*
    var charaNameSizeH = charaName.sourceRectAtTime(0,false).height;
    var charaNameSizeW = charaName.sourceRectAtTime(0,false).width;
    var charaSerifuSizeH = charaSerifu.sourceRectAtTime(0,false).height;
    var charaSerifuSizeW = charaSerifu.sourceRectAtTime(0,false).width;
    var rectSize = getRectSize(charaNameSizeH,charaNameSizeW,charaSerifuSizeH,charaSerifuSizeW);
    */
    
    //let background rect trace the boundray of text automatically
    //textBG.property("ADBE Root Vectors Group").property("ADBE Vector Shape - Rect").property("Size").setValue(rectSize+[10,10]);  
    if(settings["serifu"]){
        textBG.property("ADBE Root Vectors Group").property("ADBE Vector Shape - Rect").property("Size").expression = setRectSizeExp;
        textBG.property("Anchor Point").expression = setAnchorPonintTopRightExp;
        textBG.property("Position").expression = 'thisComp.layer("' + String(charaName.name) + '").transform.position-[10,0]';
    }else{
        serifuComp.layer(2).remove();
        textBG.property("ADBE Root Vectors Group").property("ADBE Vector Shape - Rect").property("Size").expression = setRectSizeForOwn;
        textBG.property("Anchor Point").expression = setAnchorPonintCenterExp;
        charaName.property("Anchor Point").expression = setAnchorPonintCenterExp;
    }

    //precompose
    if(settings["serifu"]){
        serifuComp.layers.precompose([1, 2, 3], myCharaName);
    }else{
        serifuComp.layers.precompose([1, 2], myCharaName);
    }
   
    //move serifu to folder
    for (var i = 1; i <= app.project.numItems; i++){
        if(app.project.item(i).name == myCharaName){ 
            if(app.project.item(i) instanceof CompItem){
                app.project.item(i).parentFolder = serifuFolder;
            }
        } 
    } 

    //delete nulls
    var i = app.project.numItems;
    do{
        if(app.project.item(i).height == 100 && app.project.item(i).width == 100){
            app.project.item(i).remove();
        }
        i--;
    }while(i>0)
    
     
}

/*----------------------------------------------------*/
/*---------------tool book functions------------------*/

//get export folder
var myPath = "~/Desktop";
    
get_save.onClick = getSaveFolder;
function getSaveFolder(){
       var saveFld = Folder("../");
       myPath = saveFld.selectDlg();
       if(myPath == undefined){
            alert("デフォルト保存場所はデスクトップです！", scriptName + "-ご注意");
            myPath = "~/Desktop";
        }
}

//export video
Export.onClick = exportVideo;
function exportVideo(){ 
        var outputComp;
        for (var i = 1; i <= app.project.numItems; i++){
            if(app.project.item(i).name == "*Output"){ 
                if(app.project.item(i) instanceof CompItem){
                    outputComp = app.project.item(i);
                }
            }
        }
        var renderItem = app.project.renderQueue.items.add(outputComp);
        var om1 = renderItem.outputModule(1);
        var nEpsTxt = "";
        var nPartTxt = "";
        var nSenceTxt = "";
        if(settings["eps"])nEpsTxt = "#" + String(dataLeftCompleting(epsNum_txt.text,2));
        if(settings["part"])nPartTxt = "_part-" + String(part_edrtx.text).toLowerCase() ;
        if(settings["sence"])nSenceTxt =  "_s" + String(dataLeftCompleting(sence_edtxt.text,3));
        var fileName = "/" + String(titleName_txt.text) + nEpsTxt + nPartTxt + nSenceTxt + "_c" + String(dataLeftCompleting(cno_edtxt.text,4)) + "_tk" + String(takeNum_txt.text);
        om1.file = File(String(myPath) + String(fileName));
        //if send to AME
        if(settings["sendToAME"]){
            Export.text = "Send to AME";
            if (app.project.renderQueue.canQueueInAME == true){
                app.project.renderQueue.queueInAME(false);
            }else{
                alert("レンダリングキューには何もありません。");
            }
        }
}

//scale comp to selected layer size
crop_.onClick = cropCompAsLayer;
function cropCompAsLayer() {
    var myLayer = app.project.activeItem.selectedLayers[0];
    var h = myLayer.height;
    var w = myLayer.width;
    app.project.activeItem.height = h;
    app.project.activeItem.width = w;
    myLayer.property("Position").setValue([w/2,h/2]);
}

//exportButton.onClick = expLayerInfo;
function expLayerInfo() {
    try {
        // get active comp
        //var comp = app.project.activeItem;
        var comp;
        for (var i = 1; i <= app.project.numItems; i++){
            if(app.project.item(i).name == "2_cut"){ 
                if(app.project.item(i) instanceof CompItem){
                    comp = app.project.item(i);
                }
            }
        }
        // no active comp alarm
        if (!comp || !(comp instanceof CompItem)) {
            alert("No comp selected!", scriptName);
            return;
        }
       
        var nEpsTxt = "";
        var nPartTxt = "";
        var nSenceTxt = "";
        var nEpsTxt = "";
        var nPartTxt = "";
        var nSenceTxt = "";
        if(settings["eps"])nEpsTxt = "#" + String(dataLeftCompleting(epsNum_txt.text,2));
        if(settings["part"])nPartTxt = "_part-" + String(part_edrtx.text).toLowerCase() ;
        if(settings["sence"])nSenceTxt =  "_s" + String(dataLeftCompleting(sence_edtxt.text,3))

        var infoText = String(titleName_txt.text) + nEpsTxt + nPartTxt + nSenceTxt + "_c" + String(dataLeftCompleting(cno_edtxt.text,4)) + "_tk" + String(takeNum_txt.text);
        function containsNonAsciiCharacters(str) {
            for (var i = 0; i < str.length; i++) {
                if (str.charCodeAt(i) > 127) {
                    return true;
                }
            }
            return false;
        }
        if(containsNonAsciiCharacters(infoText)) {alert("入力に漢字と全角文字を使わないでください！",scriptName);}
        else{         
            // layer info string
            var layerInfoStr = infoText.toString() + "\n";//"Cut No.: " + dataLeftCompleting(cutNumber,4).toString() + "\n";
            layerInfoStr += "=======================================================\n";

            // properties names
            var requiredProps = ["ADBE Anchor Point", "ADBE Position", "ADBE Scale", "ADBE Rotate Z","ADBE Opacity"];

            // get all comps
            for (var i = 1; i <= comp.numLayers; i++) {
                var layer = comp.layer(i);

                // get layer name
                layerInfoStr += "Layer Name: " + layer.name + "\n";
                layerInfoStr += "-------------------------------------------------\n";

                var transformGroup = layer.property("ADBE Transform Group");

                // get properties
                for (var j = 0; j < requiredProps.length; j++) {
                    var prop = transformGroup.property(requiredProps[j]);

                    if (prop) {
                        layerInfoStr += "Property Name: " + prop.name + "\n";

                        // if properties has keyframes, get keyframe type and time
                        if (prop.numKeys > 0) {
                            for (var k = 1; k <= prop.numKeys; k++) {
                                layerInfoStr += "Key " + k + ":\n";
                                layerInfoStr += "Time: " + prop.keyTime(k) + "\n";
                                layerInfoStr += "Value: " + prop.keyValue(k).toString() + "\n";
                                layerInfoStr += "In Interpolation Keyframe Type: " + prop.keyInInterpolationType(k) + "\n";
                                layerInfoStr += "Out Interpolation Keyframe Type: " + prop.keyOutInterpolationType(k) + "\n";
                            }
                        } else {
                            // if dosent have keyframes, get values 
                            layerInfoStr += "Value: " + prop.value.toString() + "\n";
                        }
                        //if have experssions   
                        if (prop.expression) {
                            layerInfoStr += "Expression: " + prop.expression + "\n";
                        }

                        layerInfoStr += "-------------------------------------------------\n";
                    }
                
                }
                layerInfoStr += "=======================================================\n";
                
            }
            const date = new Date();
            layerInfoStr += date.toString() + "\n";
            layerInfoStr += "=======================================================\n";
            layerInfoStr += "Settings:\n" 
            layerInfoStr += JSON.stringify(settings);
            // save dialog to save file
            var folder = getCutInfoFolder();
            var file = File(folder + '/' + infoText.toString() + '.txt');

            if (file) {
                file.open("w");
                file.write(layerInfoStr);
                file.close();
            }
        }
    } catch (error) {
        alert("An error occurred: " + error.toString(), scriptName);
    }
};


importButton.onClick = importInfoSettings;
function importInfoSettings(){
    var infoText = cutDD.selection;
    importLayerInfo(infoText);
    changeCutInfo();
    changeCutSet(); 
}

function importLayerInfo(infoText) {
    function addLayersToComp(){
        var layerNames = [];
        var comp;
        for (var i = 1; i <= app.project.numItems; i++){
            if(app.project.item(i).name == "2_cut"){ 
                if(app.project.item(i) instanceof CompItem){
                    comp = app.project.item(i);
                }
            }
        }
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line.indexOf("Layer Name: ") === 0) {
                var layerName = line.substring("Layer Name: ".length);            
                layerNames.push(layerName);          
            }
        }
        layerNames.reverse();
        for (var i = 0; i < layerNames.length; i++) {
            var layerName = layerNames[i];
            if (comp && comp instanceof CompItem) {
                // 循环遍历项目中的每一个素材
                for (var j = 1; j <= app.project.numItems; j++) {
                    var item = app.project.item(j);
                    // 检查素材名称是否匹配
                    if (item.name == layerName) {
                        // 创建新的图层并添加到活动合成
                        comp.layers.add(item);
                                    
                    }

                }
            }
        }
    }
    try {
        var filename = infoText.toString()
        filename = filename.replace(/ /g, "_");

        var comp;
        for (var i = 1; i <= app.project.numItems; i++){
            if(app.project.item(i).name == "2_cut"){ 
                if(app.project.item(i) instanceof CompItem){
                    comp = app.project.item(i);
                }
            }
        }

        if (!comp || !(comp instanceof CompItem)) {
            alert("No comp selected!", scriptName);
            return;
        }
        

        var folder = getCutInfoFolder();
        var file =  File(folder + '/' + filename + '.txt');

        if (file.exists) {
            file.open("r");
            var layerInfoStr = file.read();
            file.close();

            // split str in lines
            var lines = layerInfoStr.split("\n");

            var currentLayer, currentProperty, currentKey;
            
            for (var i = comp.numLayers; i > 0; i--) {
                var layer = comp.layer(i);
                layer.remove();
            }
            addLayersToComp();  
            
            var camComp = comp.layer(1);
            camComp.label = 4;
            if(camComp.canSetTimeRemapEnabled) {camComp.timeRemapEnabled = true;}
            else alert("カメラレイヤーはタイムリマップできません。テンプレートプロジェクトから作り直してください。", scriptName);
            camComp.timeRemap.removeKey(2);
            camComp.outPoint = 10000;
            camComp.guideLayer = true;    
            for (var i = 1; i <= comp.numLayers; i++) {
                var layer = comp.layer(i);
                if(layer.canSetTimeRemapEnabled && layer.name !== "camera") {
                    layer.timeRemapEnabled = true;
                    layer.timeRemap.removeKey(2);
                    layer.outPoint = 10000;
                }else {layer.outPoint = 10000;}
            }
            //Delete all keyframes of all layers in transform group 
            for (var i = 1; i <= comp.numLayers; i++) {
                var layer = comp.layer(i);
                var transformGroup = layer.property("ADBE Transform Group");
                for (var j = 1; j <= transformGroup.numProperties; j++) {
                    var property = transformGroup.property(j);
                    if (property.isTimeVarying) {
                        property.removeKey(1);
                        while (property.numKeys > 0) {
                            property.removeKey(1);
                        }
                    }
                }
            }
            // read lines, apply properties
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (line.indexOf("Layer Name: ") === 0) {
                    var layerName = line.substring("Layer Name: ".length);
                    currentLayer = comp.layers.byName(layerName);
                } else if (line.indexOf("Property Name: ") === 0) {
                    var propName = line.substring("Property Name: ".length);
                    if (currentLayer) {
                        currentProperty = currentLayer.property("ADBE Transform Group").property(propName);
                    }
                } else if (line.indexOf("Key ") === 0) {
                    if (currentProperty) {
                        var keyIndex = parseInt(line.substring("Key ".length));
                        var timeLine = lines[++i];
                        var valueLine = lines[++i];
                        var typeLine = lines[++i];

                        var keyTime = parseFloat(timeLine.substring("Time: ".length));
                        var keyValueString = valueLine.substring("Value: ".length).split(',');

                        var keyValue = [];
                        for (var j = 0; j < keyValueString.length; j++) {
                            keyValue[j] = parseFloat(keyValueString[j]);
                        }

                        currentProperty.setValueAtTime(keyTime, keyValue);
                        var outTypeLine = lines[i+1];
                        currentProperty.setInterpolationTypeAtKey(keyIndex, parseInt(typeLine.replace("In Interpolation Keyframe Type: ", "")),parseInt(outTypeLine.replace("Out Interpolation Keyframe Type: ", "")));
                        currentKey = keyIndex;
                       
                    }
                } else if (line.indexOf("Value: ") === 0) {
                    if (currentProperty) {
                        var valueString = line.substring("Value: ".length).split(',');

                        var value = [];
                        for (var j = 0; j < valueString.length; j++) {
                            value[j] = parseFloat(valueString[j]);
                        }

                        currentProperty.setValue(value);
                    }
                }else if (line.indexOf("Expression: ") === 0) {
                    if (currentProperty) {
                        var expressionString = line.substring("Expression: ".length);
                        currentProperty.expression = expressionString;
                    }
                }else if (line.indexOf("Settings:") === 0) {
                    var readSettingsLines = lines[++i];
                   // readSettingsLines;
                    var data = JSON.parse(readSettingsLines);
                    for(var i in data){
                         settings[i]=data[i];
                    }
                    loadSettings(settings);
                }
            }
            alert("読み込み完了!",scriptName);
        }else alert("カット情報は存在しません！", scriptName);
    } catch (error) {
        alert("An error occurred: " + error.toString(), scriptName);
    }
};

deleteInfoButton.onClick = deleteAllCutInfo;
/*
picSetBtn.onClick = function(){
    currentSlider.maxvalue = Number(picNumEdtxt.text);
    //var camComp = app.project.activeItem.layer("camera");
    var camComp;
        for (var i = 1; i <= app.project.numItems; i++){
            if(app.project.item(i).name == "2_cut"){ 
                if(app.project.item(i) instanceof CompItem){
                    camComp = app.project.item(i);
                }
            }
        }

    var camCompTrasnfromGroup = camComp.property("ADBE Transform Group");
    //alert(camComp.name);
    if(!camComp) alert('"2_cut"コンポは存在しません。テンプレートプロジェクトから作り直してください。', scriptName)
    var props = "ADBE Position";//["ADBE Anchor Point", "ADBE Position", "ADBE Scale", "ADBE Rotate Z","ADBE Opacity"];
    var j = 1;
    for (var i = 0; i < props.length; i++) {
        camCompTrasnfromGroup.property(props).addKey(camComp.time);
        camCompTrasnfromGroup.property(props).setInterpolationTypeAtKey(j, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.HOLD);
    }
    j++;
    expLayerInfo();
}

currentSlider.onChanging = function(){
    currentPic.text = Math.round(currentSlider.value);
}
*/
/*----------------------------------------------------------*/
//UI End
palette.layout.layout(true);
palette.layout.resize();
palette.onResizing = palette.onResize = function () { this.layout.resize(); }

if (palette instanceof Window) palette.show();

return palette;

}());