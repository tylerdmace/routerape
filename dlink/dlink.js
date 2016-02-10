'use strict';

var isChecked = false;

function check() {
    isChecked = !isChecked;
}

function cont() {
    if(isChecked)  {
        window.location.href = 'confirm.html';
    } else {
        alert('You must read and agree to the EULA first.');
    }
}