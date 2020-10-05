'use strict';
app.factory('parser', function() {
    var parser = {};
    parser.script_id = "json-data";
    parser.init = function(){
        var el = document.getElementById(this.script_id);
        var json_data = el.innerHTML;
        this.data = JSON.parse(json_data);
    }
    return parser;
});

