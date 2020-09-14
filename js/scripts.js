const Y  = 0;
const H  = 1;
const G  = 2;
const W  = 3;
const X  = 4;
const WX = 5;
const HY = 6;
const YG = 7;
const HG = 8;

var clones, target, button, reset, results, cross, slH, slY, slG, spH, spY, spG, sliders, bar, allowX, allowW, checks;

function reset_form() {
    clones.value = "";
    validate_sliders();
    validate_clones();
}

function validate_sliders() {

    spH.innerHTML = slH.value;
    spY.innerHTML = slY.value;
    spG.innerHTML = slG.value;

    let sum = Number(slH.value) + Number(slY.value) + Number(slG.value);

    if (sum != 0 && sum != 6) {
        spH.style.color = "red";
        spY.style.color = "red";
        spG.style.color = "red"
        sliders.style.borderColor = "red";
        sliders.style.boxShadow = "red 0px 0px 5px 2px";
        return false;
    } else {
        spH.style.color = "black";
        spY.style.color = "black";
        spG.style.color = "black";
        sliders.style.borderColor = "maroon";
        sliders.style.boxShadow = "none";
        return true;
    }
}

function validate_clone(geno) {
    if (geno.length == 6) {
       gens = geno.split("");
       for (let i = 0; i < 6; i++) {
         if (gens[i].match(/[Y|G|H|X|W/]/g) == null) {
           return false;
         }
       }
       return true;
    }
    return false;
}

function extract_clones(text) {
    let _text = text.toUpperCase().trim().replace(/\n/g,"");
    let a = Array(0);
    while (_text.length > 0) {
      a.push(_text.substr(0,6));
      _text = _text.substr(6);
    }
    return a;
}

function validate_clones() {
    let rows = extract_clones(clones.value);
    if (rows.length == 0) {
      return false;
    }
    let ok = true;
    let i = 0;
    while (ok && i < rows.length) {
       ok = validate_clone(rows[i]);
       i++;
    }
    return ok;
}

function enter_textarea() {
    showTip("Enter your clones, one per line");
}

function exit() {
    showTip("");
}

function enter_target() {
    showTip("Select the desired result<br />Or set them all to zero");
}

function enter_filters() {
    showTip("Select filters<br />Including X and W slows down the computation");
}

function enter_calculate() {
    showTip("Calculate crossbreadings");
}

function enter_reset() {
    showTip("Clear your clone list");
}

function validate_textarea() {
    if (validate_clones()) {
        clones.style.borderColor = "maroon";
        clones.style.boxShadow = "none";
        return true;
    } else {
        clones.style.borderColor = "red";
        clones.style.boxShadow = "red 0px 0px 5px 2px";
        return false;
    }
}

function extract_target(text) {
    return text.toUpperCase().trim();
}

function init() {
    clones = document.getElementById("clones");
    target = document.getElementById("target");
    button = document.getElementById("calculate");
    reset = document.getElementById("reset");
    results = document.getElementById("results");
    cross = document.getElementById("cross");
    slH = document.getElementById("sliderH");
    slY = document.getElementById("sliderY");
    slG = document.getElementById("sliderG");
    spH = document.getElementById("targetH");
    spY = document.getElementById("targetY");
    spG = document.getElementById("targetG");
    sliders = document.getElementById("sliders");
    bar = document.getElementById("bar");
    checks = document.getElementById("checks");
    allowX = document.getElementById("checkX");
    allowW = document.getElementById("checkW");
    validate_textarea();
    validate_sliders();
    progress("",0);
    showResults("");
}

function validate() {
    if (!validate_textarea()) {
        clones.focus();
        return false;
    } else {
        if (!validate_sliders()) {
            slH.focus();
            return false;
        } else {
            return true;
        }
    }
}

function progress(msg, perc) {
    perc = Math.min(100, perc);
    bar.style.width = perc + "%";
    cross.innerHTML = '<div class="tip">'+msg+perc+'%</div>';
}

function count(geno, factor) {
  let v = new Array(9);
  v.fill(0);
  for (let i = 0; i < geno.length; i++) {
    //console.log(geno[i]);
    if (geno[i] == 'Y') {
        v[Y] += factor;
    } else if (geno[i] == 'H') {
        v[H] += factor;
    } else if (geno[i] == 'G') {
        v[G] += factor;
    } else if (geno[i] == 'W') {
        v[W] += 1;
    } else if (geno[i] == 'X') {
        v[X] += 1;
    } else if (geno[i] == 'Z') {
        v[WX] += 1;
    } else if (geno[i] == 'A') {
        v[HY] += factor;
    } else if (geno[i] == 'B') {
        v[YG] += factor;
    } else if (geno[i] == 'C') {
        v[HG] += factor;
    }
  }
  return v;
}

function rank(geno, obj) {
    let v = count(geno, 1);
    if (obj[0] + obj[1] + obj[2] == 0) {
        // no target only wildcards penalises
        return 0.1 * (v[HG] + v[HY] + v[YG]) + 
                v[X] * 1.5 + v[WX] * 2.0 + v[W] * 3;
    } else {
        // base
        let fH = Math.max(0, obj[H] - v[H]);
        let fY = Math.max(0, obj[Y] - v[Y]);
        let fG = Math.max(0, obj[G] - v[G]);
        // console.log(fH, fY, fG);
        
        // wildcards
        let wc = 0;
        let cont = true;
        while (cont && fH > 0) {
            if (v[HY] > 0) {
                v[HY]--;
                fH--;
                wc++;
            } else if (v[HG] > 0) {
                v[HG]--;
                fH--;
                wc++;
            } else {
                cont = false;
            }
        }
        cont = true;
        while (cont && fY > 0) {
            if (v[HY] > 0) {
                v[HY]--;
                fY--;
                wc++;
            } else if (v[YG] > 0) {
                v[YG]--;
                fY--;
                wc++;
            } else {
                cont = false;
            }
        }
        cont = true;
        while (cont && fG > 0) {
            if (v[HG] > 0) {
                v[HG]--;
                fG--;
                wc++;
            } else if (v[YG] > 0) {
                v[YG]--;
                fG--;
                wc++;
            } else {
                cont = false;
            }
        }
        return fH + fY + fG + wc * 0.1 +
                v[X] * 0.6 + v[WX] * 1.2 + v[W] * 1.8;
    }
}

function crossing(g1, g2, g3, g4) {
  let v = count([g1, g2, g3, g4], 0.6);
  let m = Math.max(...v);

  let geno = new Array(0);
  if (v[Y] == m) {
      geno.push('Y');
  }
  if (v[H] == m) {
      geno.push('H');
  }
  if (v[G] == m) {
      geno.push('G');
  }
  if (v[W] == m) {
      geno.push('W');
  }
  if (v[X] == m) {
      geno.push('X');
  }

  if (geno.length == 1) {
    return geno[0];
  } else {
      let gg = geno.toString();
      if (gg == "X,W" || gg == "W,X") {
        return 'Z';
      } else if (gg == "H,Y" || gg == "Y,H") {
        return 'A';
      } else if (gg == "Y,G" || gg == "G,Y") {
        return 'B';
      } else if (gg == "H,G" || gg == "G,H") {
        return 'C';
      } else {
        // Error
        console.log(gg);
        return 'E';
      }
  }
}

function html_genes(geno, style) {
    let html = '<div class="'+style+'">';
    if (geno.length == 0) {
        html += '';
    } else {
        for (let g = 0; g < geno.length; g++) {
            html += '<span class="'+geno[g]+'"></span>';
        }
    }
    html += '</div>';
    return html;
}    

function possible(geno, obj) {
    let c = count(geno, 1)
    return (obj[H] + obj[Y] + obj[G] == 0) ||
           (c[H] > 0 && obj[H] > 0) || 
           (c[Y] > 0 && obj[Y] > 0) || 
           (c[G] > 0 && obj[G] > 0);
}

function calcLoop(pool, objective) {
    var solutions = Array(0);
    var msg = "Calculating " + pool.length ** 4 + " combinations... ";
    var ii = 0,
    nextInteration = function() {
      if (ii === pool.length) {
        progress("Finished. ",100);
        //console.log(solutions.length);

        // sort by rank
        solutions.sort(function(a, b){return a[0] - b[0]});

        // add results to the html div
        let html = "";
        for (let i = 0; i < Math.min(solutions.length,100); i++) {
            html += '<div class="planter"><div class="line">';
            
            html += html_genes(solutions[i][2], "genes");
            html += html_genes("", "empty");
            html += html_genes(solutions[i][3], "genes");
            
            html += html_genes("", "empty");
            html += html_genes(solutions[i][1], "result");
            html += html_genes("", "empty");
            
            html += html_genes(solutions[i][4], "genes");
            // html += '<div class="empty">' + solutions[i][0].toFixed(3) + "</div>";
            html += html_genes("", "empty");
            html += html_genes(solutions[i][5], "genes");
            
            html += '</div></div>';
        }
        if (html == "") {
          html = '<div class="nofound">No results found.<br />Consider including X or Y in filters.</div>';
        }
        showResults(html);
        button.disabled = false;
        button.value = "RESTART";
        
        return;
      }
      for (let j = 0; j < pool.length; j++) {
        for (let k = 0; k < pool.length; k++) {
          for (let l = 0; l < pool.length; l++) {
            let geno = Array(0);
            let ok = true;
            let g = 0;
            while (ok && g < 6) {
              geno[g] = crossing(pool[ii][g], pool[j][g], pool[k][g], pool[l][g]);
              ok = (checkX.checked || geno[g] != 'X') && 
                   (checkW.checked || geno[g] != 'W') && 
                   ((checkX.checked && checkW.checked) || geno[g] != 'Z');
              g++;
            }
            if (ok) {
                let found = false;
                let m = 0;
                while (!found && m < solutions.length) { // avoids repeating solutions
                    found = solutions[m][1].toString() == geno.toString();
                    m++;
                }
                if (!found) {
                    solutions.push([rank(geno, objective), 
                                    geno, 
                                    pool[ii], pool[j], pool[k], pool[l]]);
                }
            }
          }
        }
      }
      progress(msg, Math.round(100 * ii / pool.length));
      ii++;
      setTimeout(nextInteration, 1);
  };
  nextInteration();
}

function controls(enabled) {
    disabled = !enabled;
    clones.disabled = disabled;
    slH.disabled = disabled;
    slY.disabled = disabled;
    slG.disabled = disabled;
    reset.disabled = disabled;
    checkX.disabled = disabled;
    checkW.disabled = disabled;
    let cursor = "pointer";
    let colour = "lightyellow";
    if (disabled) {
        colour = "#acacac";
    }
    sliders.style.backgroundColor = colour;
    clones.style.backgroundColor = colour;
    checks.style.backgroundColor = colour;
}

function calculate() {
    if (button.value == "RESTART") {
        controls(true);
        button.value = "CALCULATE";        
        progress("", 0);
        showResults("");
        //results.style.display = "none";
    } else {
        if (validate()) {
            showTip("Calculating...");
            controls(false);    
            button.disabled = true;

            let objective = [Number(slY.value), Number(slH.value), Number(slG.value), 0, 0, 0];
            //console.log(objective);
            
            let rows = extract_clones(clones.value);
            // console.log("Clones: " + rows.length);
            let pool = new Array(0);
            let check = new Array(0);
            let item = "";
            for (let i = 0; i < rows.length; i++) {
                item = rows[i];
                if (-1 == check.indexOf(item) && possible(item, objective)) {
                    pool.push(item.split(""));
                    check.push(item);
                }
            }
            // console.log("Pool: " + pool.length);
            // Calculate crosssing
            calcLoop(pool, objective);

        } else {
            showTip('Please check your inputs in <span class="red">RED</span>');
        }
    }
}

function showResults(html) {
    cross.innerHTML = html;
    if (html=="") {
        cross.style.backgroundColor = "transparent";
        cross.style.borderStyle = "hidden";
        cross.style.overflowY = "hidden";
    } else {
        cross.style.backgroundColor = "lightyellow";
        cross.style.borderStyle = "solid";
        cross.style.overflowY = "scroll";
        cross.scrollTop = 0;
    }
}

function showTip(text) {
    if (!clones.disabled) {
        if (text=="") {
            cross.style.opacity = "0";
        } else {            
            cross.innerHTML = '<div class="tip">'+text+'</div>';
            cross.style.opacity = "1";
        }
    }
}
