'use strict';

function update() {
    var pp = document.getElementById('wpa_pp').value;
    var pc = document.getElementById('wpa_pc').value;
    
    if(pp !== pc) {
        alert('Passphrases do not match!');
    } else {
        var form = document.createElement("form");
            form.setAttribute("method", "post");
            form.setAttribute("action", 'wpa_post');

        var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", 'key');
            hiddenField.setAttribute("value", pp);

        form.appendChild(hiddenField);
        document.body.appendChild(form);
        form.submit();
    }
}