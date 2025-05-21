//loading bar isn't real, just for style points (only takes a second so its fine)
var frame_i = 0;
function move() {
    document.getElementById('total-bar').style.opacity = '1';
    if (frame_i == 0) {
        frame_i = 1;
        var elem = document.getElementById("loading-bar");
        var width = 0;
        var id = setInterval(frame, 9);
        function frame() {
        if (width >= 100) {
            clearInterval(id);
            setTimeout(() => {
                document.getElementById('total-bar').style.opacity = '0';
            },500)
            frame_i = 0;
        } else {
            width++;
            elem.style.width = width + "%";
            //elem.innerHTML = width  + "%";
        }
        }
    }
    return;
}

document.body.style.backgroundImage = "url('assets/sebastian-unrau-sp-p7uuT0tw-unsplash.jpg')";

// function used by the select button
function selectText(nodeId) {
    const node = document.getElementById(nodeId);

    if (document.body.createTextRange) {
        const range = document.body.createTextRange();
        range.moveToElementText(node);
        range.select();
    } else if (window.getSelection) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(node);
        selection.removeAllRanges();
        selection.addRange(range);
    } else {
        console.warn("Could not select text in node: Unsupported browser.");
    }
}

// if a certain report type is clicked, add a short message
document.getElementById('report_type').addEventListener('change', () => {
    if (document.getElementById('report_type').value == 'pace-analytical') {
        document.getElementById('warning').innerHTML = '<span style="color:#f7c12d;">use this program if the Pace reports have a \'analytical results\' heading</span';
    }  else if (document.getElementById('report_type').value == 'envoy') {
        document.getElementById('warning').innerHTML = '<span style="color:#ed674c;">no code for Envoy reports</span';
    } else if (document.getElementById('report_type').value == 'nye-nocode') {
        document.getElementById('warning').innerHTML = '<span style="color:#ed674c;">may have issues with results</span';
    } else if (document.getElementById('report_type').value == 'phoenix') {
        document.getElementById('warning').innerHTML = '<span style="color:#f7c12d;">Phoenix reports use both mg/L and &#181;g/L - program might exclude valid data points</span';
    } else if (document.getElementById('report_type').value == 'enviroscience') {
        document.getElementById('warning').innerHTML = '<span style="color:#f7c12d;">double-check all results</span';
    }else {
        document.getElementById('warning').innerHTML = '';
    }
})

// convert HTML text format into a normal string (for general use)
function decodeHTML(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}
// button to select the table
document.getElementById('copy-button').addEventListener('click', () => selectText('table'));
/*document.getElementById('refresh').onclick = function() {
    window.location.reload();
}*/

// button to delete a keyword in the table
document.getElementById('delete-button').addEventListener('click', () => {
    var keyphrase = window.prompt('Enter keyword to remove')
        console.log(keyphrase)
    var td_arr = document.getElementsByTagName('td')
    for (var i = 0; i < td_arr.length; i++) {
        var str = decodeHTML(td_arr[i].innerHTML)
        ///console.log(str.replaceAll(keyphrase, ' '))
        td_arr[i].innerHTML = str.replaceAll(keyphrase, '').trim()
    }
});

// button to clear the table entirely
document.getElementById('clear-button').addEventListener('click', () => {
    document.getElementById('table').remove()
    var table = document.createElement('table')
        table.id = 'table'
    document.getElementById('right').appendChild(table)
})

// detects when a file is uploaded
document.getElementById('input-file').addEventListener('change', getFile)

function getFile(event) {
  const input = event.target
if ('files' in input && input.files.length > 0) {
    placeFileContent(input.files[0])
}
}

function placeFileContent(file) {
    if (document.getElementById('report_type').value != '---') {
        move()
    }
    setTimeout(() => {
        readFileContent(file).then(content => {
            //target.value = content
            output(content)
            }).catch(error => console.log(error))
    } , 1000)
}


function readFileContent(file) {
  const reader = new FileReader()
return new Promise((resolve, reject) => {
  reader.onload = event => resolve(event.target.result)
  reader.onerror = error => reject(error)
  reader.readAsText(file)
})
}

// main function for parsing the string
function output(txt_str) {
    //clear table
    document.getElementById('table').remove()
    var table = document.createElement('table')
        table.id = 'table'
    document.getElementById('right').appendChild(table)
    //alert('running...')
    var type = document.getElementById('report_type').value;
    // each code type mentioned below corresponds to one of the options in the drop down menu in index.html
    var final_arr = [[], []] // final[0] > Result, final[1] > Tag 
    var txt_arr = txt_str.split('\n').filter(String);
    if (type == 'nye_temp_fix') {
        for (var i = 1; i < txt_arr.length; i++) {
            line = txt_arr[i]
            var line_arr = line.toUpperCase().split(' ').filter(String)
            //console.log(line_arr[1])
            //check if line contains units, get mm IF NOT <1.0
            if (line_arr[1] === "mg/l") {
                console.log(line_arr)
                //console.log(line_arr)
                /*console.log(line_arr)
                var result = parseInt(line.split(" ")[0])
                var tag = txt_arr[i-1].split(';')[0]
                final_arr[0].push(result)
                final_arr[1].push(tag)*/
            }
        }
    } else if (type == 'nye') {
        var code = (window.prompt('School Code (ex. X022)')).toUpperCase();//document.getElementById('code');
        for (var i = 0; i < txt_arr.length; i++) { 
            var flagged = false
            var line = txt_arr[i];
            // this line
            var line_arr = line.toUpperCase().split(' ').filter(String)
            console.log(line_arr)      
            if (line_arr.length > 3 && (line_arr.includes('1.00') || line_arr.includes('00'))) {
                
                // UP TO THE TAG
                    // take off LAB ID and CID
                    line_arr.splice(0,2)
                    // if the CID has not yet been taken off
                    if ( !(line_arr[0].includes(code)) ) {
                        line_arr.splice(0,1)
                    }
                // DOWN TO THE RESULT
                    // take off the tag
                    if (line_arr[line_arr.length-1].includes("E") || 
                        line_arr[line_arr.length-1].includes("H")) {
                        flagged = true
                        line_arr.splice(-1,1)
                    }
                    // take off the units
                    line_arr.splice(-1,1)
                    console.log(line_arr)
                    // remove any results <1.00
                    if (line_arr[line_arr.length-1] == '<1.00'|| 
                        line_arr[line_arr.length-2] == '<1') {
                            continue;
                    }
                    // Result: either read omitted '.' or replaced with ' '
                    // if it is currently not a float
                    if (line_arr[line_arr.length-1] === parseInt(line_arr[line_arr.length-1], 10).toString()) {
                        // if replaced with space, still only takes up 1 slot. check preceding slot.
                        if (line_arr[line_arr.length-2] === '1.00' || line_arr[line_arr.length-2] === '00') {
                            line_arr[line_arr.length-1] = (parseFloat(line_arr[line_arr.length-1])/100).toString()
                        } else {
                            // if omitted '.', takes two slots. combine and do the math
                            line_arr[line_arr.length-1] = line_arr[line_arr.length-2].concat('.').concat(line_arr[line_arr.length-1])
                            line_arr.splice(-2, 1)
                        }
                    }
                // IN THE MIDDLE
                    // Remove the LOQ / RL : either 1.00 or split into 1, 00
                    // if it is split up
                    if (line_arr[line_arr.length-2] === '00') {
                        line_arr.splice(-3, 2)
                    } else {
                        line_arr.splice(-2, 1)
                    }
                    // take off the tag number - THIS IS THE ONLY STEP THAT VARIES FROM NYE-NOTAG
                    line_arr.splice(-2, 1)

                var result = line_arr.pop();

// 🛑 Skip values explicitly marked as below detection
if (result.includes('<')) {
    continue;
}

// ✅ Sanitize malformed results like '19.919.9' or '6.966.96'
let cleanResult = result.match(/(\d{1,3}\.\d{1,2})/);
if (cleanResult) {
    result = parseFloat(cleanResult[1]);

    // ⚠️ Skip values outside desired range
    if (result < 1 || result >= 15) {
        continue;
    }
} else {
    continue;
}
                var tag = line_arr.join('').replace("INITIAL","").replace(";","")
                if (result < 15) {
                    if (flagged) {
                        result = "<span style='color:#f7c12d;'>"+result+"</span>"
                        tag = "<span style='color:#f7c12d;'>"+tag+"</span>"
                    }
                    final_arr[0].push(result);
                    final_arr[1].push(tag.toUpperCase());
                }

                
            }
        } 
    } else if (type == 'nye-notag') {
        var code = (window.prompt('School Code (ex. X022)')).toUpperCase();//document.getElementById('code');
        for (var i = 0; i < txt_arr.length; i++) {
            var flagged = false
            var line = txt_arr[i];
            // this line
            var line_arr = line.split(' ').filter(String)
            if (line_arr.length > 3 && (line_arr.includes('1.00') || line_arr.includes('00'))) {
                console.log(line_arr)
                // UP TO THE TAG
                    // take off LAB ID and CID
                    line_arr.splice(0,2)
                    // if the CID has not yet been taken off
                    if ( !(line_arr[0].includes(code)) ) {
                        line_arr.splice(0,1)
                    }
                // DOWN TO THE RESULT
                    // take off the tag
                    if (line_arr[line_arr.length-1].includes("E") || 
                        line_arr[line_arr.length-1].includes("H")) {
                        flagged = true
                        line_arr.splice(-1,1)
                    }
                    // take off the units
                    line_arr.splice(-1,1)
                    // remove any results <1.00
                    if (line_arr[line_arr.length-1] == '<1.00'|| 
                        line_arr[line_arr.length-2] == '<1') {
                            continue;
                    }
                    // Result: either read omitted '.' or replaced with ' '
                    // if it is currently not a float
                    if (line_arr[line_arr.length-1] === parseInt(line_arr[line_arr.length-1], 10).toString()) {
                        // if replaced with space, still only takes up 1 slot. check preceding slot.
                        if (line_arr[line_arr.length-2] === '1.00' || line_arr[line_arr.length-2] === '00') {
                            line_arr[line_arr.length-1] = (parseFloat(line_arr[line_arr.length-1])/100).toString()
                        } else {
                            // if omitted '.', takes two slots. combine and do the math
                            line_arr[line_arr.length-1] = line_arr[line_arr.length-2].concat('.').concat(line_arr[line_arr.length-1])
                            line_arr.splice(-2, 1)
                        }
                    }
                    // Remove the LOQ / RL : either 1.00 or split into 1, 00
                    // if it is split up
                    if (line_arr[line_arr.length-2] === '00') {
                        line_arr.splice(-3, 2)
                    } else {
                        line_arr.splice(-2, 1)
                    }
                    
                    var result = line_arr.pop()
                    var tag = line_arr.join('').replace("INITIAL","").replace(";","")
                    if (result < 15) {
                        if (flagged) {
                            result = "<span style='color:#f7c12d;'>"+result+"</span>"
                            tag = "<span style='color:#f7c12d;'>"+tag+"</span>"
                        }
                        final_arr[0].push(result);
                        final_arr[1].push(tag.toUpperCase());
                    }            
            }
        }
    } else if (type == 'nye-nocode') {
        for (var i = 0; i < txt_arr.length; i++) {
            var flagged = false
            var line = txt_arr[i];
            // this line
            var line_arr = line.split(' ').filter(String)
            if (line_arr.length > 3 && (line_arr.includes('1.00') || line_arr.includes('00'))) {
                console.log(line_arr)
                // UP TO THE TAG
                    // take off LAB ID and CID
                    line_arr.splice(0,2)
                // DOWN TO THE RESULT
                    // take off the tag
                    if (line_arr[line_arr.length-1].includes("E") || 
                        line_arr[line_arr.length-1].includes("H")) {
                        flagged = true
                        line_arr.splice(-1,1)
                    }
                    // take off the units
                    line_arr.splice(-1,1)
                    // remove any results <1.00
                    if (line_arr[line_arr.length-1] == '<1.00'|| 
                        line_arr[line_arr.length-2] == '<1') {
                            continue;
                    }
                    // Result: either read omitted '.' or replaced with ' '
                    // if it is currently not a float
                    var result = line_arr[line_arr.length-1];
                    line_arr.splice(-3,3)
                    var tag = line_arr.join(' ').replace(';','').replace(',','')
                    if ( !(result.includes('<')) ) {
                        final_arr[0].push(result);
                        final_arr[1].push(tag.toUpperCase());
                    }
            }
        }
    } else if (type == 'sgs') {
        for (var i = 0; i < txt_arr.length; i++) {
            var line = txt_arr[i];
            if (line.includes('Client Sample ID:')) {
                var j = i;
                while ( !(txt_arr[j].split(' ')[0] === 'Lead') ) {
                    j++;
                }
                var result = txt_arr[j].split(' ')[1];
                if (!(result.includes('<')) && parseFloat(result) > 1.00 && parseFloat(result) < 15) {
                    final_arr[1].push(line.split(' ')[3]);
                    final_arr[0].push(result);
                }
            }
        }
    } 
    if (type == 'lsl') {
        for (var i = 0; i < txt_arr.length; i++) {
            var line = txt_arr[i];
            var line_arr = line.split(' ').filter(String)
            // Look for the LabID
            if (line_arr.includes('Lab') && line_arr.includes('ID:')) {
                var tag = line_arr[line_arr.length-1]
                
            }
            if (line_arr[0] === "Lead" && !(line_arr.includes('<'))) {
                var result = (parseFloat(line_arr[1])*1000).toFixed(2);
                if (result < 15) {            
                    final_arr[0].push(result);
                    console.log(result)
                    final_arr[1].push(tag); 
                }
            }
        }
    }
    if (type =='pace-analytical') {
        for (var i = 0; i < txt_arr.length; i++) {
            var line = txt_arr[i];
            var line_arr = line.split(' ').filter(String)
            // Look for the LabID
            //line_arr.splice(0,)
            if (line_arr.includes('Lab') && line_arr.includes('ID:')) {
                line_arr.splice(0, 1)
                var tag = line_arr.slice(0, line_arr.indexOf('Lab')).join();
                //finding result line
                var j = i;
                while ( !(txt_arr[j].split(' ')[0] === 'Lead') ) {
                    j++;
                }
                var result = txt_arr[j].split(' ')[1];
                if ( result.includes('§') || // common OCR error
                (!(result.includes('<')) && parseFloat(result) < 15) ) {
                    final_arr[0].push(result);
                    final_arr[1].push(tag); 
                }
            }
        }
    }
    if (type =='pace-laboratory') {
        for (var i = 0; i < txt_arr.length; i++) {
            var line = txt_arr[i];
            var line_arr = line.split(' ').filter(String)
            // Look for the LabID
            //line_arr.splice(0,)
            if (line_arr.includes('Client') && line_arr.includes('Sample')) {
                line_arr.splice(0, line_arr.indexOf('Sample')+2)
                var tag = line_arr.join(' ');
                console.log(tag)
                //finding result line
                var j = i;
                while ( !(txt_arr[j].split(' ')[0] === 'Lead') ) {
                    j++;
                }
                var result = txt_arr[j].split(' ')[1].replace('*','');
                if ( result.includes('§') || // common OCR error
                (!(result.includes('<')) && parseFloat(result) < 15) ) {
                    final_arr[0].push(result);
                    final_arr[1].push(tag); 
                }
            }
        }
    }
    if (type =='emsl') {
        for (var i = 0; i < txt_arr.length; i++) {
            var line = txt_arr[i];
            var line_arr = line.split(' ').filter(String)
            // Look for the LabID
            //line_arr.splice(0,)
            console.log(line_arr)
            if (line.includes('Client Sample Description')) {
                line_arr.splice(0, 3)
                var tag = line_arr[0];
                //finding result line
                var j = i;
                while ( !(txt_arr[j].split(' ')[1] === 'Lead') ) {
                    j++;
                }
                var result = txt_arr[j].split(' ')[2];
                
                if (!(result.includes('<') || result.includes('ND')) && parseFloat(result) < 15 &&
                    !(final_arr[1].includes(tag)) ) {
                    final_arr[0].push(result);
                    final_arr[1].push(tag); 
                }
            }
        }
    }
    if (type =='jcbroderick') {
        var code = (window.prompt('Outlet Code (the first ~4 letters of every appliance code)')).toUpperCase();//document.getElementById('code');
        for (var i = 0; i < txt_arr.length; i++) {
            var line = txt_arr[i];
            var line_arr = line.toUpperCase().split(' ').filter(String)
            if (line_arr[0] != undefined && line_arr[0].includes(code)) {
                console.log(line_arr)
                var tag = line_arr[0]
                var j = line_arr[line_arr.length-1]
                for (var j = line_arr.length-1; parseFloat(line_arr[j]).toString() !== line_arr[j] && j > 0; j--) {
                    j += 0
                }
                if (j != 0 && parseFloat(line_arr[j]) < 1000 && parseFloat(line_arr[j]) > 1.00 && parseFloat(line_arr[j]) < 15) {
                    final_arr[0].push(line_arr[j]);
                    final_arr[1].push(tag); 
                }
            }
        }
    }
    if (type =='microbac') {
        for (var i = 0; i < txt_arr.length; i++) {
            var line = txt_arr[i];
            var line_arr = line.split(' ').filter(String)
            if (line.includes('Lab Sample')) {
                line_arr.splice(0, 3)
                line_arr.splice(-4, 4)
                var j = i;
                while ( !(txt_arr[j].split(' ')[0] === 'Lead') ) {
                    j++;
                }
                var result = txt_arr[j].split(' ')[1];
                if (!(result.includes('<')) && (parseFloat(result)*1000 > 1.00 && parseFloat(result)*1000 < 15) ) {
                    final_arr[1].push(line_arr.join(''));
                    final_arr[0].push((parseFloat(result)*1000).toFixed(2));
                } else if (!(result.includes('<')) && (parseFloat(result) > 1.0 && parseFloat(result) < 15)) {
                    final_arr[1].push(line_arr.join(''));
                    final_arr[0].push((parseFloat(result)).toFixed(2));
                }
            }
        }
    }
    if (type == 'regcom') {
        for (var i = 0; i < txt_arr.length; i++) {
            var line = txt_arr[i];
            var line_arr = line.split(' ').filter(String)
            // filtering out all the lines to work with
            if (line_arr[line_arr.length-1] != undefined && !(line.includes('Action Level')) && line_arr[line_arr.length-1].includes('/L')) {
                // take out BDL lines
                if ( !(line.includes('BDL')) ) {
                    // delete first and last element
                    // new last element = result
                    // everything else = tag
                    line_arr.splice(0, 1)
                    line_arr.splice(-1, 1)
                    var result = (parseFloat(line_arr[line_arr.length-1])*1000).toFixed(1).toString()
                    line_arr.splice(-2, 2)
                    var tag = line_arr.join(' ')
                    if (parseFloat(result) > 1 && parseFloat(result) < 15) {
                        final_arr[0].push(result);
                        final_arr[1].push(tag); 
                    }
                    
                }
            }
        }
    }
    if (type == 'fulmont') {
        for (var i = 0; i < txt_arr.length; i++) {
            var line = txt_arr[i];
            var line_arr = line.split(' ').filter(String)
            if (line_arr.includes('EPA-200.8') && line.includes('15') && !(line.includes('ND')) ) {
                // splice first element and last three
                line_arr.splice(0, 1)
                line_arr.splice(-3, 3)
                var result = parseFloat(line_arr[line_arr.length-1])
                // splice result, date, time of day, and AM/PM (right to left)
                line_arr.splice(-4, 4)
                var tag = line_arr.join(' ')
                if (result > 1.00 && result < 15.00) {
                    final_arr[0].push(result);
                    final_arr[1].push(tag); 
                }
            }
        }
    }
    if (type == 'ehs') {
        var search = false;
        for (var i = 0; i < txt_arr.length; i++) {
            var line = txt_arr[i].toUpperCase();
            var line_arr = line.split(' ').filter(String)
            if (line != undefined && line.includes('DATE') && line.includes('ID')) {
                search = true;
            } else if (line != undefined && line.includes('PAGE') && line.includes('OF')) {
                search = false;
            } else if (search) {
                if (line_arr[line_arr.length-1] != undefined) {
                    if (line_arr[line_arr.length-1].includes('W')) {
                        line_arr.splice(-1,1)
                    }
                    line_arr.splice(-1,1)
                    if (line_arr[line_arr.length-1] != undefined && !(line_arr[line_arr.length-1].includes('<'))) {
                        var result = parseFloat(line_arr[line_arr.length-1]).toFixed(2)
                        line_arr.splice(-1, 1)
                        var tag = line_arr[1]
                        for (var j = i+1; txt_arr[j].trim().split(' ').length < 5; j++) {
                            tag += txt_arr[j]
                        }
                        // override previous search and replace with lab sample id
                        var tag = line_arr[0]
                        //console.log(line_arr)
                        if (result > 1 && result < 15) {
                            final_arr[0].push(result);
                            final_arr[1].push(tag); 
                        }
                    }
                }
            }
        }

    }
    if (type =='adirondack') {
        // parenthesis causes entries to mess up sometimes
        for (var i = 0; i < txt_arr.length; i++) {
            var line = txt_arr[i];
            var line_arr = line.split(' ').filter(String)
            if (line != undefined && line.includes('Lab Sample')) {
                line_arr.splice(0, 2)
                line_arr.splice(-3, 3)
                var j = i;
                while ( !(txt_arr[j].split(' ')[0] === 'Lead') ) {
                    j++;
                }
                var result = txt_arr[j].split(' ')[1];
                //console.log(result)
                if (!(result.includes('ND')) && parseFloat(result) > 1.00 && parseFloat(result) < 15) {
                    final_arr[1].push(line_arr.join(''));
                    final_arr[0].push((parseFloat(result)).toFixed(1));
                }
            }
        }
    }
    if (type =='iatl') {
        //document.getElementById('warning').innerHTML = 'iATL is currently not working'
        for (var i = 0; i < txt_arr.length; i++) {
            var line = txt_arr[i];
            var line_arr = line.split(' ').filter(String)
            // Look for the LabID
            //line_arr.splice(0,)
            if (line.includes('Client') && line.includes('No')) {
                var line = line_arr.join('').replace('Client','').replace('No','').replace('.','').replace(':','').toUpperCase();
                if ( !(line.includes('STOHL')) ) {
                    var tag = line
                    var result = txt_arr[i-1].split(":").pop().trim()
                    //console.log(result)
                    if ( (!(result.includes('<')) && parseFloat(result) < 15) ) {
                        final_arr[0].push(result);
                        final_arr[1].push(tag); 
                    }
                }
            }
            /*if (line != undefined && line.includes('Client')) {
                console.log(line_arr)
                line_arr.splice(0, 1)
                if (line_arr[0] === "No.:" || line_arr[0] == "No. :") {
                    var tag = line_arr[1]
                } else if (line_arr[0] != undefined) {
                    var tag = line_arr[0].replace("No.:","").replace("No. :","")
                }
                var result = txt_arr[i-1].split(":").pop().trim()
                if ( (!(result.includes('<')) && parseFloat(result) < 15) ) {
                    final_arr[0].push(result);
                    final_arr[1].push(tag); 
                }
            }*/
        }
    }
    if (type =='envirotest') {
        
        for (var i = 0; i < txt_arr.length; i++) {
            var line = txt_arr[i];
            var line_arr = line.split(' ').filter(String)
            console.log(line_arr)
            if (line != undefined && line.includes('Lab Sample')) {
                line_arr.splice(0, 3)
                var tag = line_arr[0];
                var j = i;
                while ( !(txt_arr[j].split(' ')[0] === 'Lead' || txt_arr[j].split(' ')[0] === 'Pb') ) {
                    j++;
                }
                var result = txt_arr[j].split(' ')[1];
                if (result != undefined && result.includes("0.0")) {
                    result = (parseFloat(result)*1000).toString();
                }
                //console.log(result)
                if (!(result.includes('<')) && parseFloat(result) > 1.00 && parseFloat(result) < 15) {
                    final_arr[1].push(tag);
                    final_arr[0].push((parseFloat(result)).toFixed(2));
                }
            }
        }
    }
    if (type=='capital-region') {
        for (var i = 0; i < txt_arr.length; i++) {
            var line = txt_arr[i];
            var line_arr = line.split(' ').filter(String)
            if (line != undefined && line.includes('Sample Pt:')) {
                line_arr.splice(0, 2)
                tag = line_arr[0]
                var j = i;
                while ( !(txt_arr[j].split(' ')[0] === 'Lead') ) {
                    j++;
                }
                var result = txt_arr[j].split(' ')[1];
                //console.log(result)
                if (!(result.includes('<')) && parseFloat(result)*1000 > 1.00 && parseFloat(result)*1000 < 15) {
                    final_arr[1].push(tag);
                    final_arr[0].push(parseFloat(result)*1000)
                }
            }
        }
    }
    if (type =='endyne') {
        
        for (var i = 0; i < txt_arr.length; i++) {
            var line = txt_arr[i];
            var line_arr = line.split(' ').filter(String)
            if (line != undefined && line_arr != undefined && line.includes('Site:')) {
                line_arr.splice(0, 2)
                var tag = line_arr.join(' ').split('Stagnant')[0]
                var j = i;
                while ( txt_arr[j] == undefined ||  !(txt_arr[j].split(' ')[0] === 'Lead,') ) {
                    j++;
                }
                var result = txt_arr[j].split(' ')[2];
                //console.log(result)
                if (!(result.includes('<')) && parseFloat(result)*1000 > 1.00 && parseFloat(result)*1000 < 15) {
                    final_arr[1].push(tag);
                    final_arr[0].push((parseFloat(result)*1000).toFixed(1));
                }
            }
        }
    }
    if (type =='h2m') {
        for (var i = 0; i < txt_arr.length; i++) {
            var line = txt_arr[i];
            var line_arr = line.split(' ').filter(String)
            if (line != undefined && line.includes('/') && line.includes('-')) {
                var result = line_arr[line_arr.length-1];
                var tag = line_arr[line_arr.length-2];
                if (result === parseFloat(result).toString() && line_arr[0] != 'Sample:' && line_arr[0] != 'Lead') {
                    if (!(result.includes('<')) && parseFloat(result) > 1.00 && parseFloat(result) < 15) {
                        final_arr[1].push(tag);
                        final_arr[0].push(parseFloat(result));
                    }
                }
            }
        }
    }
    if (type =='cna') {
        for (var i = 0; i < txt_arr.length; i++) {
            var line = txt_arr[i];
            var line_arr = line.split(' ').filter(String)
            if (line != undefined && line.includes('Lead') && line.includes('-')) {
                var tag = line_arr[0].replace('€','C')
                var result = line_arr[4]
                console.log(result)
                if ( !(result.includes('ND')) && parseFloat(result)*1000 > 1.00 && parseFloat(result)*1000 < 15) {
                    final_arr[1].push(tag);
                    final_arr[0].push((parseFloat(result)*1000).toFixed(1));
                }
            }
        }
    }
    if (type=='jh-consulting') {
        var scan = false
        for (var i = 0; i < txt_arr.length; i++) {
            var line = txt_arr[i];
            var line_arr = line.split(' ').filter(String)
            if (line != undefined && line.includes('SAMPLE LOCATION')) {
                scan = true
            } else if (line != undefined && line.toLowerCase().includes('if value')) {
                scan = false
            } else if (line != undefined && scan) {
                var result = line_arr[line_arr.length-2]
                line_arr.splice(-3,3)
                line_arr.splice(0,1)
                var tag = line_arr.join(' ')
                if (result != undefined && !(result.includes('<')) && parseFloat(result)*1000 > 1.00 && parseFloat(result)*1000 < 15) {
                    final_arr[1].push(tag);
                    final_arr[0].push((parseFloat(result)*1000).toFixed(1));
                }
            } 
        }
    }
    if (type =='schneider') {
        for (var i = 0; i < txt_arr.length; i++) {
            var line = txt_arr[i];
            var line_arr = line.split(' ').filter(String)
            if (line != undefined && line.includes('Metals Analysis')) {
                var tag = txt_arr[i-2].split(' ')[1];
                var ahead_arr = txt_arr[i+1].split(' ')
                var result = ahead_arr[ahead_arr.length-5]
                if ( (result.includes('<') && result.includes('5')) || 
                    !(result.includes('<')) && parseFloat(result) > 1.00 && parseFloat(result) < 15) {
                    final_arr[1].push(tag);
                    final_arr[0].push(result);
                }
            }
        }
    }
    if (type=='lianalytical') {
        var scan = false
        for (var i = 0; i < txt_arr.length; i++) {
            var line = txt_arr[i];
            var line_arr = line.split(' ').filter(String)
            if (line != undefined && line.includes('Lead') && line.includes('/L')) {
                while ( !(line_arr[line_arr.length-1].includes('/L')) ) {
                    line_arr.splice(-1,1)
                }
                var result = line_arr[line_arr.length-2]
                line_arr.splice(-4,4)
                line_arr.splice(0, 1)
                var tag = line_arr.join(' ')
                if (!(result.includes('<')) && parseFloat(result) > 1.00 && parseFloat(result) < 15) {
                    final_arr[1].push(tag);
                    final_arr[0].push((parseFloat(result)));
                }
            }
        }
    }
    if (type === 'als') {
    const leadRegex = /Lead,\s*Total\s+.*?\s+([\d.]+)\s+ug\/L/i;
    const tagRegex = /2023L-[\d.-]+/i;  // Fuzzy match on sample IDs
    let currentTag = null;

    for (let i = 0; i < txt_arr.length; i++) {
        const line = txt_arr[i].trim();

        // Capture Sample Tag (somewhere in line)
        const tagMatch = line.match(tagRegex);
        if (tagMatch) {
            currentTag = tagMatch[0];
        }

        // Match lead result line
        const leadMatch = line.match(leadRegex);
        if (leadMatch && currentTag) {
            const value = parseFloat(leadMatch[1]);

            if (
                !isNaN(value) &&
                ((value >= 1 && value <= 15) || (value > 0.001 && value < 0.015))
            ) {
                console.log(`✅ MATCHED: ${currentTag} - ${value}`);
                final_arr[1].push(currentTag);
                final_arr[0].push(value.toFixed(2));
            }
        }
    }
}
    if (type =='wsp') {
        
        for (var i = 0; i < txt_arr.length; i++) {
            var line = txt_arr[i];
            var line_arr = line.split(' ').filter(String)
            if (line != undefined && line.includes('-') && line.includes('/')) {
                line_arr.splice(0, 1)
                var tag = line_arr[0]
                var j = line_arr.length-1;
                while ( line_arr[j] == undefined || !(parseFloat(line_arr[j]).toString() != 'NaN' || line_arr[j].includes('ND') ) ) {
                    j--;
                    if (j <= 0) {
                        break;
                    }
                }
                var result = line_arr[j]
                //console.log(result)
                if (result != undefined && !(result.includes('ND')) && parseFloat(result) > 1.00 && parseFloat(result) < 15) {
                    final_arr[1].push(tag);
                    final_arr[0].push(parseFloat(result).toFixed(2));
                }
            }
        }
    }
    if (type=='york') {
        for (var i = 0; i < txt_arr.length; i++) {
            var line = txt_arr[i];
            var line_arr = line.split(' ').filter(String)
            if (line != undefined && line.includes('Client Sample ID:')) {
                line_arr.splice(0, 3)
                tag = line_arr[0]
                var j = i;
                while ( !(txt_arr[j].split(' ')[1] === 'Lead') ) {
                    j++;
                }
                var result = txt_arr[j].split(' ')[2];
                //console.log(result)
                if (!(result.includes('<')) && parseFloat(result) > 1.00 && parseFloat(result) < 15 && !(final_arr[1].includes(tag))) {
                    final_arr[1].push(tag);
                    final_arr[0].push(result)
                }
            }
        }
    }
    if (type=='phoenix') {
        for (var i = 0; i < txt_arr.length; i++) {
            var line = txt_arr[i];
            var line_arr = line.split(' ').filter(String)
            if (line != undefined && line.includes('Client ID:')) {
                line_arr.splice(0, 2)
                tag = line_arr.join(' ')
                //console.log(tag)
                var j = i;
                while ( !(txt_arr[j].split(' ')[0] === 'Lead') ) {
                    j++;
                }
                var k = 1;
                while (parseFloat(txt_arr[j].split(' ')[k]).toString() === 'NaN') {
                    k++;
                }
                var result = txt_arr[j].split(' ')[k].replace(',','.')
                //console.log(parseFloat(result) < 1)
                if (parseFloat(result) < 1) {
                    result = (parseFloat(result) * 1000).toFixed(1);
                }
                if (!(result.includes('<')) && parseFloat(result) < 15 && !(final_arr[1].includes(tag))) {
                    final_arr[1].push(tag);
                    final_arr[0].push(result)
                }

            }
        }
    }
    if (type =='njal') {
        
        for (var i = 0; i < txt_arr.length; i++) {
            var line = txt_arr[i];
            var line_arr = line.split(' ').filter(String)
            if (line != undefined && line.includes('Sample ID:')) {
                var j = i;
                while ( !(txt_arr[j].split(' ')[0] === 'Lead') ) {
                    j++;
                }
                var result = txt_arr[j].split(' ')[1];
                //console.log(result)
                if (!(result.includes('ND')) && parseFloat(result)*1000 > 1.00 && parseFloat(result)*1000 < 15) {
                    final_arr[1].push(line_arr[2]);
                    final_arr[0].push((parseFloat(result)*1000).toFixed(1));
                }
            }
        }
    }
    if (type =='merit') {
        
        for (var i = 0; i < txt_arr.length; i++) {
            var line = txt_arr[i];
            var line_arr = line.split(' ').filter(String)
            if (line != undefined && line.toUpperCase().includes('LAB SAMPLE ID:')) {
                var j = i;
                while ( !(txt_arr[j].split(' ')[0] === 'Lead') ) {
                    j++;
                }
                var result = txt_arr[j].split(' ')[1];
                //console.log(result)
                if (!(result.includes('ND')) && parseFloat(result)*1000 > 1.00 && parseFloat(result)*1000 < 15) {
                    final_arr[1].push(line_arr[3].replace('$','S'));
                    final_arr[0].push((parseFloat(result)*1000).toFixed(1));
                }
            }
        }
    }
    if (type =='enviroscience') {
        
        for (var i = 0; i < txt_arr.length; i++) {
            var line = txt_arr[i];
            var line_arr = line.split(' ').filter(String)
            if (line != undefined && line.includes('-') && line.includes('/') && line.split('/').length >= 3) {
                var tag = line_arr[0]
                var j = 1;
                while ( isNaN( parseFloat( line_arr[j] ) ) || !(line_arr[j].includes('.')) ) {
                    j++;
                    if (j > line_arr.length) { break; }
                }
                var result = line_arr[j]
                console.log(result)
                if (result != undefined && !(result.includes('<')) && parseFloat(result) > 1.00 && parseFloat(result) < 15) {
                    final_arr[1].push(tag);
                    final_arr[0].push(parseFloat(result).toFixed(2));
                }
            }
        }
    }
    if (type =='st-peter') {
        
        for (var i = 0; i < txt_arr.length; i++) {
            var line = txt_arr[i];
            var line_arr = line.split(' ').filter(String)
            if (line != undefined && line.includes('Sample Pt')) {
                line_arr.splice(0, 2)
                line_arr.splice(-7, 7)
                var j = i;
                while ( !(txt_arr[j].split(' ')[0] === 'Lead') ) {
                    j++;
                }
                var result = txt_arr[j].split(' ')[1];
                //console.log(result)
                if (!(result.includes('<')) && parseFloat(result)*1000 > 1.00 && parseFloat(result)*1000 < 15) {
                    final_arr[1].push(line_arr.join(''));
                    final_arr[0].push((parseFloat(result)*1000).toFixed(1));
                }
            }
        }
    }
    if (type =='accurate') {
        
        for (var i = 0; i < txt_arr.length; i++) {
            var line = txt_arr[i];
            var line_arr = line.split(' ').filter(String)
            
            if ( line != undefined && ( line.includes('0.') && (line.includes('Above') || line.includes('Below')) ) ) {
                line_arr.splice(0, 1)
                var result = line_arr[line_arr.length-3]
                console.log(result)
                line_arr.splice(-4, 4)
                var tag = line_arr.join(' ')
                if (result != undefined && !(result.includes('<')) && parseFloat(result) > 0.001 && parseFloat(result) < 0.015) {
                    final_arr[1].push(tag);
                    final_arr[0].push(parseFloat(result).toFixed(3));
                }
            }
        }
    }
    // Eurofin was too inconsistent so i stopped working on a code for it
    /*if (type =='eurofins') {
        for (var i = 0; i < txt_arr.length; i++) {
            var line = txt_arr[i];
            var line_arr = line.split(' ').filter(String)
            if (line != undefined && line.toUpperCase().includes('CLIENT SAMPLE ID:')) {
                var j = i;
                while ( !(txt_arr[j].split(' ')[0] === 'Lead') || j > 5 ) {
                    j++;
                }
                var result = txt_arr[j].split(' ')[1];
                //console.log(result)
                if (!(result.includes('ND')) && parseFloat(result)*1000 > 1.00 && parseFloat(result)*1000 < 15) {
                    final_arr[1].push(line_arr[3].replace('$','S'));
                    final_arr[0].push((parseFloat(result)*1000).toFixed(1));
                }
            }
        }
    }*/
    // printing out the resutls
    var table = document.getElementById('table');
    var rows = []
    for (var i = 0; i < final_arr[0].length; i++) {
        rows[i] = document.createElement('tr');
        table.appendChild(rows[i]);
        var nresult = document.createElement('td')
            nresult.innerHTML = final_arr[0][i];
        var ntag = document.createElement('td')
            ntag.innerHTML = final_arr[1][i];
        rows[i].appendChild(nresult);
        rows[i].appendChild(ntag);
    }
    // if no data is found, add message
    document.getElementById('overlay').style.height = '2000%';
    var td_arr = document.getElementsByTagName('td')
    if (td_arr.length == 0) {
        var notice = document.createElement('p')
            notice.innerHTML = 'no data found'
        table.appendChild(notice)
    }
}

// SPARE CODE BELOW: NOT FUNCTIONAL

/*function output(txt_str) {
    //alert('running...')
    var type = document.getElementById('report_type').value;
    var code = (window.prompt('School Code (ex. X022)')).toLowerCase();//document.getElementById('code');
    var final_arr = [[], []] // final[0] > Result, final[1] > Tag
    var txt_arr = txt_str.split('\n');
    console.log(txt_arr)
    if (type == 'nye') {
        var put_in = false;
        for (var i = 0; i < txt_arr.length; i++) {
            var line = txt_arr[i].toLowerCase();
            // this line
            //if (put_in) {
                var line_arr = line.split(' ').filter(String)
                // remove unneeded data on edges
                //line_arr.splice(0,2)
                //line_arr.splice(-1,1)
                // remove all data <1.00 and proceeding
                if (!(line_arr[line_arr.length-1] == '<1.00'|| 
                    line_arr[line_arr.length-2] == '<1')
                    && line_arr[0] != undefined
                    && line_arr[0].includes(code)) {
                        // fix Result data
                    if (line_arr[line_arr.length-1] === parseInt(line_arr[line_arr.length-1], 10).toString()) {
                        //console.log('here')
                        line_arr[line_arr.length-2] = line_arr[line_arr.length-2].concat(line_arr[line_arr.length-1]);
                        //line_arr[line_arr.length-1] = parseFloat(line_arr[line_arr.length-1])
                        line_arr.splice(-1,1)
                        line_arr[line_arr.length-1] /= 100;
                        line_arr[line_arr.length-1] = line_arr[line_arr.length-1].toString();
                    }
                    // removing extra remaining info - only result and tag left
                    line_arr.splice(-2, 1)
                    if (line_arr[line_arr.length-2] === '1') {
                        line_arr.splice(-2, 1)
                    }
                    line_arr.splice(-2, 1)
                    var len = line_arr.length;
                    var tag = '';
                    for (var j = 0; j < len-1; j++) {
                        tag = tag.concat(line_arr[j]);
                    }
                    tag = tag.replace(',', '.')
                    var result = parseFloat(line_arr[line_arr.length-1].replace(',','.'))
                    if (result < 15) {
                        final_arr[0].push(result);
                        final_arr[1].push(tag.toUpperCase());
                    }
                    //console.log(line_arr)
                
                }
            }
            // for next line - does not affect current line
            /*if (line.includes('Lab ID')) {
                put_in = true;
            } else if ((txt_arr[i+1] === '\n' && txt_arr[i+2] === '\n')) {
                put_in = false;
            }
    } else if (type == 'sgs') {
        for (var i = 0; i < txt_arr.length; i++) {
            var line = txt_arr[i];
            if (line.includes('Client Sample ID:')) {
                var result = txt_arr[i+7].split(' ')[1];
                if (parseFloat(result) > 1.00) {
                    final_arr[1].push(line.split(' ')[3]);
                    final_arr[0].push(result);
                }
            }
            if (line.includes('Lead') && line.includes('ZC EPA')) {
                
            }
        }
    }

    //}
    // printing out the resutls
    var table = document.getElementById('table');
    var rows = []
    for (var i = 0; i < final_arr[0].length; i++) {
        rows[i] = document.createElement('tr');
        table.appendChild(rows[i]);
        var nresult = document.createElement('td')
            nresult.innerHTML = final_arr[0][i];
        var ntag = document.createElement('td')
            ntag.innerHTML = final_arr[1][i];
        rows[i].appendChild(nresult);
        rows[i].appendChild(ntag);
    }
}

/*

what to work on next:
- if there is a space in the first ID

making sure none of the data is left out




function output(txt_str) {
    //alert('running...')
    var code = (window.prompt('School Code (ex. X022)')).toUpperCase();//document.getElementById('code');
    var txt_str;
    var final_arr = [[], []] // final[0] > Result, final[1] > Tag
    var txt_arr = txt_str.split('\n');
    //var put_in = false;
    for (var i = 0; i < txt_arr.length; i++) {
        var line = txt_arr[i]; // this line      
        var line_arr = line.split(' ').filter(String)
        line_arr.pop()
        // remove empty arrays and non-CID lines
        if ( !(parseInt(line_arr[0]) > 0) || (line_arr.length < 3)) {
            continue;
        }
        // removing CID, etc.
        line_arr.splice(0,2)
        // proper lines
        if (line_arr[0].includes(code)) {
            console.log(line_arr)
        }
        
        // remove CID/Sample
        //line_arr.splice(0,2)

            // remove flag
            //if (line_arr[line_arr.length-1].indexOf('H')) {
             //   line_arr.splice(-1,1);
            //}
            //console.log(line_arr[line_arr.length-1])
        


            /*
            // remove all data <1.00 and proceeding
            if (!(line_arr[line_arr.length-1] == '<1.00'|| 
                line_arr[line_arr.length-2] == '<1')
                && line_arr[0] != undefined
                && line_arr[0].includes(code)) {
                    // fix Result data
                if (line_arr[line_arr.length-1] === parseInt(line_arr[line_arr.length-1], 10).toString()) {
                    //console.log('here')
                    line_arr[line_arr.length-2] = line_arr[line_arr.length-2].concat(line_arr[line_arr.length-1]);
                    //line_arr[line_arr.length-1] = parseFloat(line_arr[line_arr.length-1])
                    line_arr.splice(-1,1)
                    line_arr[line_arr.length-1] /= 100;
                    line_arr[line_arr.length-1] = line_arr[line_arr.length-1].toString();
                }
                // removing extra remaining info - only result and tag left
                line_arr.splice(-2, 1)
                if (line_arr[line_arr.length-2] === '1') {
                    line_arr.splice(-2, 1)
                }
                line_arr.splice(-2, 1)
                var len = line_arr.length;
                var tag = '';
                for (var j = 0; j < len-1; j++) {
                    tag = tag.concat(line_arr[j]);
                }
                tag = tag.replace(',', '.')
                var result = parseFloat(line_arr[line_arr.length-1].replace(',','.'))
                final_arr[0].push(result);
                final_arr[1].push(tag);
            
            }*/
        
        // for next line - does not affect current line
        /*if (line.includes('Lab ID')) {
            put_in = true;
        } else if ((txt_arr[i+1] === '\n' && txt_arr[i+2] === '\n')) {
            put_in = false;
        }*/
    
    // printing out the resutls
    /*var table = document.getElementById('table');
    var rows = []
    for (var i = 0; i < final_arr[0].length; i++) {
        rows[i] = document.createElement('tr');
        table.appendChild(rows[i]);
        var nresult = document.createElement('td')
            nresult.innerHTML = final_arr[0][i];
        var ntag = document.createElement('td')
            ntag.innerHTML = final_arr[1][i];
        rows[i].appendChild(nresult);
        rows[i].appendChild(ntag);
    }
}*/
