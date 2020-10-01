const Y  = 0;
const H  = 1;
const G  = 2;
const W  = 3;
const X  = 4;
const WX = 5;
const HY = 6;
const YG = 7;
const HG = 8;

// ugly globals
var clones, target, b_calculate, b_reset, results, b_restart, b_next, cross, slH, slY, slG, spH, spY, spG, sliders, bar, allowX, allowW, checks, solutions, previous_expanded, previous_solutions, previous_rows, selected_geno, calculating, startTime;

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

function exit() {
    if (!calculating) {
        showTip("");
    }
}

function enter_restart() {
    if (!calculating && b_restart && !b_restart.disabled) {
        showTip("Start a new calculation.");
    }
}

function enter_next() {
    if (!calculating && solutions.length > 0) {
        if (!b_next.disabled) {
            showTip('<p>Use the selected result in the next crop.</p><p><span class="red">EXPERIMENTAL FEATURE</span></p>');
        } else {
            if (targets_set()) {
                showTip('<p>Select a <strong>result</strong> to use it in the next crop.</p><p><span class="red">EXPERIMENTAL FEATURE</span></p>');
            } else {
                showTip('Choose a <strong>target</strong> to be able to calculate the next crop.');
            }
        }
    }
}

function enter_textarea() {
    if (!calculating && clones && !clones.disabled) {
        showTip("Enter your clones, one per line.");
    }
}

function enter_target() {
    if (!calculating && slG && !slG.disabled) {
        showTip("<p>Select the desired <strong>result</strong></p><p>Or set them all to zero.</p>");
    }
}

function enter_filters() {
    if (!calculating && allowX && !allowX.disabled) {
        showTip('<p>Check <span class="red">X</span> or <span class="red">W</span> for including them in the results.</p><p>This will <strong>slow down</strong> the computation.</p>');
    }
}

function enter_calculate() {
    if (!calculating && b_calculate && !b_calculate.disabled) {
        showTip("Calculate crossbreadings using the <strong>clones</strong> in the list.");
    }
}

function enter_reset() {
    if (!calculating && b_reset && !b_reset.disabled) {
        showTip("Clear your clone list.");
    }
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

function expand(geno) {
    let result = new Array(0);
    for (let i = 0; i < geno.length; i++) {
        let l = result.length;
        if (l > 0) {
            for (let j = 0; j < l; j++) {
                if (geno[i] == "A") {
                    result.push(result[j] + "Y");
                    result[j] += "H";
                } else if (geno[i] == "B") {
                    result.push(result[j] + "Y");
                    result[j] += "G";
                } else if (geno[i] == "C") {
                    result.push(result[j] + "G");
                    result[j] += "H";
                } else if (geno[i] == "Z") {
                    result.push(result[j] + "W");
                    result[j] += "X";
                } else {
                    result[j] += geno[i];
                }
            }
        } else {
            if (geno[i] == "A") {
                result.push("H");
                result.push("Y");
            } else if (geno[i] == "B") {
                result.push("Y");
                result.push("G");
            } else if (geno[i] == "C") {
                result.push("G");
                result.push("H");
            } else if (geno[i] == "Z") {
                result.push("W");
                result.push("X");
            } else {
                result.push(geno[i]);
            }
        }
    }
    return result;
}

function progress(msg, perc) {
    perc = Math.min(100, perc);
    bar.style.width = perc + "%";
    if (perc < 10) {
        showMessage(msg+'0'+perc+'%');
    } else {
        showMessage(msg+perc+'%');
    }
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
        console.log("ERROR: "+gg);
        return 'E';
      }
  }
}

function targets_set() {
    return Number(slH.value) + Number(slY.value) + Number(slG.value) > 0;
}

function planter_click(elem) {
    let targets_ok = targets_set();
    let color = elem.style.borderColor;
    let arrDivs = document.getElementsByTagName("div");
    selected_geno = "";
    for (let i = 0; i < arrDivs.length; i++) {
        if (arrDivs[i].id.startsWith("geno_")) {
            arrDivs[i].style.borderColor = "cornflowerblue";
            arrDivs[i].style.backgroundColor = "burlywood";
        }
    }
    if (targets_ok && color != "crimson") {
        elem.style.borderColor = "crimson";
        elem.style.backgroundColor = "yellow";
        selected_geno = elem.id.substr(5);
    }
    b_next.disabled = selected_geno == "" || !targets_ok;
}

function html_genes(geno, style, prev, width) {
    let html = '<div class="'+style+'" '; 
    if (prev) {
        html = '<div class="previous" '; 
    }
    if (geno.length == 0) {
        html += ' style="width: '+width+'px;" ';
    } 
    html += '>';
    for (let g = 0; g < geno.length; g++) {
        html += '<span class="'+geno[g]+'"></span>';
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
    calculating = true;
    let second_iteration = previous_expanded.length > 0;
    let first_crop = Array(0);
    for (let i = 0; i < solutions.length; i++) { // keep a copy to avoid including
        first_crop.push(solutions[i][1]);        // repeated solutions in the 2nd crop
    }
    solutions = Array(0);
    var msg = "Calculating " + pool.length ** 4 + " combinations... ";
    let found = false;
    let width1 = 175;
    let width2 = 175;
    let width3 = 580;
    let margin = 2;
    if (second_iteration) {
        width1 = 50;
        width2 = 112;
        width3 = 455;
        margin = 126;
    }
    var ii = 0,
    nextIteration = function() {
        if (ii === pool.length) {
            progress("",100);

            // sort by rank
            solutions.sort(function(a, b){return a[0] - b[0]});

            // add results to the html div
            let html = "";
            let prev_gen = "";
            if (second_iteration && solutions.length > 0) {
                found = false;
                m = 0;
                while (!found && m < previous_expanded.length) {
                    found = solutions[0][2] == previous_solutions[m] ||
                                solutions[0][3] == previous_solutions[m] ||
                                solutions[0][4] == previous_solutions[m] ||
                                solutions[0][5] == previous_solutions[m];
                    m++;
                }
                m--;
                prev_gen = expand(previous_solutions[m][0]);
                html += '<div class="previous_planter" style="width: '+width3+'px;"><div class="line">';

                html += html_genes(previous_solutions[m][1], "genes");
                html += html_genes("", "empty", false, width1);
                html += html_genes(previous_solutions[m][2], "genes");

                html += html_genes("", "empty", false, width2);
                html += html_genes(previous_solutions[m][0], "previous", 0);
                html += html_genes("", "empty", false, width2);

                html += html_genes(previous_solutions[m][3], "genes");
                // html += '<div class="empty">' + solutions[i][0].toFixed(3) + "</div>";
                html += html_genes("", "empty", false, width1);
                html += html_genes(previous_solutions[m][4], "genes");

                html += '</div></div><div class="arrow"></div>';
            }


            let max_solutions = 25;
            for (let i = 0; i < Math.min(solutions.length, max_solutions); i++) {
                html += '<div class="planter" style="width: '+width3+'px; margin-left: '+margin+'px;"';
                if (!second_iteration) {
                    html += ' id="geno_'+solutions[i][1]+'" onclick="planter_click(this);"';
                }
                html += '><div class="line">';
//                 if (second_iteration) {
//                     html += '<div class="arrow2"></div>';
//                 }
                html += html_genes(solutions[i][2], "genes", -1 != prev_gen.indexOf(solutions[i][2]) && -1 == previous_rows.indexOf(solutions[i][2]));
                html += html_genes("", "empty", false, width1);
                html += html_genes(solutions[i][3], "genes", -1 != prev_gen.indexOf(solutions[i][3]) && -1 == previous_rows.indexOf(solutions[i][3]));

                html += html_genes("", "empty", false, width2);
                html += html_genes(solutions[i][1], second_iteration ? "next" : "result", false, 0);
                html += html_genes("", "empty", false, width2);

                html += html_genes(solutions[i][4], "genes", -1 != prev_gen.indexOf(solutions[i][4]) && -1 == previous_rows.indexOf(solutions[i][4]));
                // html += '<div class="empty">' + solutions[i][0].toFixed(3) + "</div>";
                html += html_genes("", "empty", false, width1);
                html += html_genes(solutions[i][5], "genes", -1 != prev_gen.indexOf(solutions[i][5]) && -1 == previous_rows.indexOf(solutions[i][5]));

                html += '</div></div>';
            }
            let timeDiff = new Date() - startTime; //in ms
            timeDiff /= 1000;
            timeDiff = timeDiff+' seconds';
            if (solutions.length <= 0) {
                html += '<div class="message">No results found.<br />Consider including X or Y in filters.</div>';
            } else if (solutions.length == 1) {
                html += '<div class="total">One result found ('+timeDiff+')</div>';
            } else if (solutions.length <= max_solutions) {
                html += '<div class="total">'+solutions.length+' results found ('+timeDiff+')</div>';
            } else {
                html += '<div class="total">Showing '+max_solutions+' of '+solutions.length+' results ('+timeDiff+')</div>';
            }

            showResults(html);
            b_calculate.disabled = false;
            b_calculate.style.display = "none";
            b_next.style.display = second_iteration ? "none" : "block";
            b_restart.style.height = second_iteration ? "80px" : "30px";
            b_restart.style.fontSize = second_iteration ? "150%" : "100%";
            b_restart.style.display = "block";
            calculating = false;
            return;
        }
        for (let j = 0; j < pool.length; j++) {
            for (let k = 0; k < pool.length; k++) {
                for (let l = 0; l < pool.length; l++) {
                    if (!second_iteration ||                           // it is the first iteration or at least
                          previous_expanded.indexOf(pool[ii]) != -1 || // one parent has to be the gene selected
                          previous_expanded.indexOf(pool[j]) != -1 ||
                          previous_expanded.indexOf(pool[k]) != -1 ||
                          previous_expanded.indexOf(pool[l]) != -1) {

                        let geno = ""; //let geno = Array(0);
                        let g = 0;
                        ok = true;
                        while (ok && g < 6) {
                            gg = crossing(pool[ii][g], pool[j][g], pool[k][g], pool[l][g]); // calculate crossbreading
                            ok = (allowX.checked || gg != 'X') &&                           // OK if it passes the filters
                                   (allowW.checked || gg != 'W') && 
                                   ((allowX.checked && allowW.checked) || gg != 'Z');
                            g++;
                            geno += gg;
                        }
                        if (ok) {
                            if (pool.indexOf(geno) == -1) {
                                found = false;
                                let m = 0;
                                while (!found && m < solutions.length) { // avoids repeating solutions. 
                                    found = solutions[m][1] == geno; // TODO: Replace solution if parents are better (more greens). Idea: list with clones fitness to check and f = p1+p2+p3+p4. Save f for parentes in solutions[6]
                                    m++;
                                }
                                if (!found) {
                                    // new solution
                                    if (second_iteration) {

                                        found = false;
                                        m = 0;
                                        while (!found && m < first_crop.length) {
                                            found = geno == first_crop[m];
                                            m++
                                        }
                                    }
                                    // add it
                                    if (!found) {
                                        solutions.push([rank(geno, objective), 
                                                        geno, 
                                                        pool[ii], pool[j], pool[k], pool[l]]);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        progress(msg, Math.round(100 * ii / pool.length));
        ii++;
        setTimeout(nextIteration, 1);
    };
    nextIteration();
}

function controls(enabled) {
    disabled = !enabled;
    clones.disabled = disabled;
    slH.disabled = disabled;
    slY.disabled = disabled;
    slG.disabled = disabled;
    b_reset.disabled = disabled;
    allowX.disabled = disabled;
    allowW.disabled = disabled;
    let cursor = "pointer";
    let colour = "lightyellow";
    if (disabled) {
        colour = "#acacac";
    }
    sliders.style.backgroundColor = colour;
    clones.style.backgroundColor = colour;
    checks.style.backgroundColor = colour;
}

function restart() {
    controls(true);
    b_calculate.style.display = "block";
    b_restart.style.display = "none";
    b_next.style.display = "none";
    progress("", 0);
    showResults("");
    solutions = Array(0);
    //results.style.display = "none";
}

function next() {
    showResults("");
    calculate();
}

function calculate() {
    if (!validate_textarea()) {
        clones.focus();
        showMessage('Please check your <span class="red">Clones</span>');
    } else {
        if (!validate_sliders()) {
            slH.focus();
            showMessage('Please check the selected <span class="red">Target</span>');
        } else {
            showTip("");
            controls(false);
            b_calculate.disabled = true;
            b_next.disabled = true;
            startTime = new Date();

            let objective = [Number(slY.value), Number(slH.value), Number(slG.value), 0, 0, 0];

            let rows = extract_clones(clones.value);
            previous_rows = extract_clones(clones.value);
            previous_expanded = new Array(0);
            previous_solutions = new Array(0);
            let m = 0;
            let found = false
            while (!found && m < solutions.length) { // finds the selected geno in the solutions array
                found = solutions[m][1] == selected_geno;
                m++;
            }
            if (found) {
                m--;
                let expanded = expand(solutions[m][1]); // expands wildcards
                for (let j = 0; j < expanded.length; j++) {
                    rows.push(expanded[j]);
                    previous_expanded.push(expanded[j]); // expanded
                    previous_solutions.push([solutions[m][1],  // gene
                                             solutions[m][2],solutions[m][3],solutions[m][4],solutions[m][5]]); // parents
                }
            }

            // Avoids duplicates and impossible combinations
            let pool = new Array(0);
            let check = new Array(0);
            let item = "";
            for (let i = 0; i < rows.length; i++) {
                item = rows[i];
                if (-1 == check.indexOf(item) && possible(item, objective)) {
                    pool.push(item);
                    check.push(item);
                }
            }

            // Calculate crosssing
            calcLoop(pool, objective);
        }
    }
}

function showMessage(html) {
    showResults('<div class="message">'+html+'</div>');
}

function showResults(html) {
    cross.innerHTML = html;
    if (html=="") {
        cross.style.backgroundColor = "transparent";
        cross.style.borderStyle = "hidden";
        cross.style.overflowY = "hidden";
        cross.style.opacity = 0;
    } else {
        cross.style.backgroundColor = "lightyellow";
        cross.style.borderStyle = "solid";
        cross.style.overflowY = "scroll";
        cross.scrollTop = 0;
        cross.style.opacity = 1;
    }
}

function showTip(text) {
    if (text=="") {
        tip.style.opacity = 0.00;
        tip.style.zIndex = -10;
    } else {
        tip.innerHTML = '<div>'+text+'</div>';
        tip.style.zIndex = 10;
        tip.style.opacity = 0.97;
    }
}

function init() {
    calculating = true;
    clones = document.getElementById("clones");
    target = document.getElementById("target");
    b_calculate = document.getElementById("calculate");
    b_restart = document.getElementById("restart");
    b_next = document.getElementById("next");
    b_reset = document.getElementById("reset");
    results = document.getElementById("results");
    cross = document.getElementById("cross");
    tip = document.getElementById("tip");
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
    solutions = Array(0);
    previous_rows = Array(0);
    selected_geno = "";
    validate_textarea();
    validate_sliders();
    progress("",0);
    showResults("");
    showTip("");
    calculating = false;
}
