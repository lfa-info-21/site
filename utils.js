
Array.prototype.shuffle = function () {
    var j, x, i;
    for (i = this.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = this[i];
        this[i] = this[j];
        this[j] = x;
    }
}

String.prototype.smooth = function () {
    if (this == "") {
        return ""
    }
    var bi = 0;
    var ei = this.length - 1;
    
    while(bi < this.length && this[bi] == ' ') {
        bi += 1
    }
    while (ei > bi && this[ei] == ' ') {
        ei -= 1
    }
    if (ei < bi) {
        return ""
    }

    if (bi == 0 && ei == this.length - 1) {
        return this
    }
    return this.substring(bi, ei + 1)
}
