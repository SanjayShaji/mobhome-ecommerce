
    var ErrorName = document.getElementById('ErrorName');
    var ErrorDescription = document.getElementById('ErrorDescription');
    var ErrorSubmit = document.getElementById('ErrorSubmit');


    function validatenames() {

        var vname = document.getElementById('name').value;
        var required = 4;
        var left = required - vname.length;
        if (left > 0) {
            ErrorName.innerHTML = left + 'More Charecters required';
            ErrorName.style.color = "red";
            return false;
        }
        // if(!vname.match(/^[A-Za-z]\s{1}[A-Za-z]$/)){
        //     ErrorName.innerHTML='Write full Name';
        //     return false;
        // }
        ErrorName.innerHTML = 'valid';
        ErrorName.style.color = "green";
        return true;
    }

    function validateDescriptions() {

        var vdescription = document.getElementById('description').value;
        var required = 15;
        var left = required - vdescription.length;
        if (left > 0) {
            ErrorDescription.innerHTML = left + 'More Charecters required';
            ErrorDescription.style.color = "red";
            return false;
        }
        // if(!vname.match(/^[A-Za-z]\s{1}[A-Za-z]$/)){
        //     ErrorName.innerHTML='Write full Name';
        //     return false;
        // }
        ErrorDescription.innerHTML = 'valid';
        ErrorDescription.style.color = "green";
        return true;
    }


    function validateForms() {

        if (!validatenames() || !validateDescriptions() || !validatesubject()) {
            ErrorSubmit.style.display = 'block';
            ErrorSubmit.innerHTML = 'Please fix error';
            setTimeout(function () { ErrorSubmit.style.display = 'none'; }, 3000);
            return false;
        }
    }
