

function convert_qcm() {

    RegExp.prototype.matches = function ( str ) {
        let index = 0;
        let act = "";
        let arr;
        let values = [];
        let offset = 0;

        while ((arr = this.exec(str)) != null) {
            act = arr[0]
            index = str.indexOf(act)

            values.push({
                "str":act,
                "start":index                + offset,
                "end":index + act.length - 1 + offset
            })

            if (index + act.length == 0) {
                return values;
            }
            offset += index + act.length;

            str = str.substr(index + act.length)
        }

        return values;
    }

    RegExp.prototype.toRegExp = function () {
        return this;
    }
    String.prototype.toRegExp = function () {
        return new RegExp(this);
    }

    function single_balanced_match(s, a) {
        let r0 = a.toRegExp();
        
        let arr0 = r0.matches(s);

        if (arr0 == null || arr0.length < 2) {
            return {
                "match":false,
                "str":"", 
                // Match start, if a = "$" and s = "$a$" the mstart is 0 and the mend is 2
                "mstart":-1,
                "mend":-1,
                // Inner start, if a = "$" and s = "$a$" the start is 1 and the end is 1
                "start":-1,
                "end":-1,
                "null":false
            }
        }

        let mstart = arr0[0].start;
        let start = arr0[0].end + 1;
        
        let mend = arr0[1].end;
        let end = arr0[1].start - 1;

        return {
            "match":true,
            "str":start == end + 1 ? "" : s.substr(start, end + 1 - start),
            // Match start, if a = "$" and s = "$a$" the mstart is 0 and the mend is 2
            "mstart":mstart,
            "mend":mend,
            // Inner start, if a = "$" and s = "$a$" the start is 1 and the end is 1
            "start":start,
            "end":end,
            "null":start == end + 1
        }
    }

    function balanced_match(s, a, b) {
        if (a === b) {
            return single_balanced_match(s, a)
        }

        let r0 = a.toRegExp();
        let r1 = b.toRegExp();
        
        let arr0 = r0.matches(s);
        let arr1 = r1.matches(s);

        arr0.forEach(element => {
            element["type"] = "st";
        });
        arr1.forEach(element => {
            element["type"] = "ed";
        });
    
        let arr2 = new Array()
        arr0.forEach(el => {arr2.push(el)})
        arr1.forEach(el => {arr2.push(el)})    

        arr2.sort((a, b) => {
            if (a.start == b.start) {
                if (a.end == b.end) {
                    return 0;
                }
                return a.end < b.end ? -1 : 1;
            }

            return a.start < b.start ? -1 : 1;
        })

        if (arr2.length == 0 || arr2[0].type == "ed")
            return {
                "match":false,
                "str":"", 
                // Match start, if a = "$" and s = "$a$" the mstart is 0 and the mend is 2
                "mstart":-1,
                "mend":-1,
                // Inner start, if a = "$" and s = "$a$" the start is 1 and the end is 1
                "start":-1,
                "end":-1,
                "null":false
            }

        let count = 1;
        let start = arr2[0].start;
        let end = arr2[0].end;
        let idx = 1;
        
        while (count != 0 && idx != arr2.length) {
            count += arr2[idx].type == "str" ? 1 : -1;
            end = arr2[idx].end;

            if (count == 0)
                break;
            idx += 1;
        }

        if (count > 0)
            return {
                "match":false,
                "str":"", 
                // Match start, if a = "$" and s = "$a$" the mstart is 0 and the mend is 2
                "mstart":-1,
                "mend":-1,
                // Inner start, if a = "$" and s = "$a$" the start is 1 and the end is 1
                "start":-1,
                "end":-1,
                "null":false
            }
        let val = {
            "match":true,
            "str":"", 
            // Match start, if a = "$" and s = "$a$" the mstart is 0 and the mend is 2
            "mstart":start,
            "mend":end,
            // Inner start, if a = "$" and s = "$a$" the start is 1 and the end is 1
            "start":-1,
            "end":-1,
            "null":false
        }

        val.start = val.mstart + arr2[0].end - arr2[0].start + 1;
        val.end = val.mend - arr2[idx].end + arr2[idx].start - 1;

        if (val.end == val.start - 1) {
            val.null = true;
        } else {
            val.str = s.substr(val.start, val.end - val.start + 1)
        }

        return val
    }

    const API_URL = "https://latex.codecogs.com/png.latex/?";
    function get_img(latex) {
        return `<img src="${API_URL}${latex}" style="padding-left: 5px;padding-right: 5px;">`
    }

    console.log("STARTING")

    let html = document.getElementById("qcm-container").innerHTML
    let match;
    while ((match=balanced_match(html, "\\$", "\\$")).match) {
        let length = match.mend + 1 - match.mstart;
        let rstr = html.substr(match.mstart, length);

       // html = html.replace(rstr, get_img(match.str))
        if (LATEX_CODECOGS_ENABLED)
            html = html.replace(rstr, get_img(match.str))
    }
    document.getElementById("qcm-container").innerHTML = html;
    extern = balanced_match
}



LATEX_CODECOGS_ENABLED = true

