module.exports = function (mods) {
    return function (strparam) {
        function textjoin(str, from, to) {
            var nstr = new String(str);
            var rtv = '';
            if ((typeof from == 'number' && !isNaN(from)) && (typeof to == 'number' && !isNaN(to))) {
                rtv = nstr.slice(from, to);
            }
            return rtv;
        }
        var newStr = new String(strparam);
        var newStr5 = new String(strparam);
        var newnewStr = new String(strparam);
        var newStr1 = new String(strparam);
        var rtv = ``;
        var waitingforrules = {
            wikimake: false,
            hyperlink: false,
            template: false,
            category: false,
            special: {
                mathematical: false,
                wikimacro: false,
                embededDoc: false,
            },
            automatical: {
                externalHyperlink: false,
            },
        }
        var starting = newStr.length;
        var wikirulestarting = newStr.length;
        var newStrlen = newStr.length;
        var categories = [];
        var nowikis = [];
        newStr = newStr.replaceAll(` `, ``);
        var nowikimatches = newStr.match(/\|nowiki-\|(.*?)\|-nowiki\|/gmi);
        if (nowikimatches != null) {
            nowikimatches.forEach(function (val, idx, arr) {
                nowikis.push(newStr.replace(/(.*?)\|nowiki-\|(.*?)\|-nowiki\|(.*)/gmi, `$2`));
                newStr = newStr.replace(/(.*?)\|nowiki-\|(.*?)\|-nowiki\|(.*)/gmi, `$1-nowiki${idx}-$3`);
            });
        }
        newStr = newStr.replace(/#redirect (.*?) \/\//gmi, `<script>if (new URL(window.location.href).searchParams.get('noredirect')!='1'){window.location.replace('/wiki/$1?from='+decodeURI(new URL(location.href).pathname.replace('wiki','').replaceAll('/','')));}</script>`);
        var catmatches = newStr.match(/\[\[분류:(.*?)\]\]/gmi);
        if (catmatches != null) {
            catmatches.forEach(function (val, idx, arr) {
                categories.push(`<li><a href="/wiki/${val.replace(`[[`, ``).replace(`]]`, ``)}">${val.replace(`분류:`, ``).replace(`[[`, ``).replace(`]]`, ``)}</a></li>`);
                newStr = newStr.replace(val, '');
            });
        }
        for (var i = 0; i < newStr.length; i++) {

            if (newStr[i] + newStr[i + 1] == `[[`) {
                starting = i;
            }
            if (newStr[i] + newStr[i + 1] == `]]`) {
                if (starting != newStr.length) {
                    var newLink = {};
                    var newLinkText = newStr.slice(starting, i + 1);
                    newLinkText = newLinkText.replace(`[`, ``).replace(`[`, ``).replace(`]`, ``).replace(`]`, ``);
                    var newLink2 = newLinkText.split(`|`);
                    if (newLink2.length < 2) {
                        if (newLink2.length == 1) {
                            if (newLink2[0].split(`:`)[0] == `분류`) {
                                newLink['link'] = newLink2[0];
                                newLink['text'] = newLink2[0].replace(newLink2[0].split(`:`)[0] + `:`, ``);
                                categories.push(`<li><a href="/wiki/${newLink.link}">${newLink.text}</a></li>`);
                                newStr = newStr.replace(`[[${newLink2[0]}]]`, ``);
                            } else {
                                newLink['link'] = newLink2[0];
                                newLink['text'] = newLink2[0];
                                newStr = newStr.replace(`[[` + newLinkText + `]]`, `<a href="/wiki/${newLink.link}">${newLink.text}</a>`);
                            }
                        }
                    } else {
                        newLink['link'] = newLink2[0];
                        newLink['text'] = newLink2[1];
                        if (newLink.link.startsWith(`https://`) || newLink.link.startsWith(`http://`)) {
                            newStr = newStr.replace(`[[` + newLinkText + `]]`, `<a href="${newLink.link}">${newLink.text}</a>`);
                        } else {
                            newStr = newStr.replace(`[[` + newLinkText + `]]`, `<a href="/wiki/${newLink.link}">${newLink.text}</a>`);
                        }
                    }
                }
            }
        }

        var categoryElouter = ``;
        if (categories.length == 0 && newStr.match(/<div class="category">(.*?)<\/div>/gmi) == null) {
            categoryElouter = `<div style="background:lightblue;border-radius:10vmin;margin:1px;padding-bottom:2px;padding-top:2px;text-align:center">이 문서는 분류가 필요합니당 ㅎㅎ</div>`;
        } else {
            if (categories.length >= 1) {
                categories.forEach(function (val, idx, arr) {
                    if (idx == 0) {
                        categoryElouter += `<div class="category"><h2>분류</h2><ul class="category-list">`;
                    }
                    categoryElouter += val;
                    if (idx == arr.length - 1) {
                        categoryElouter += `</ul></div>`;
                    }
                });
            }

        }
        newStr = categoryElouter + newStr;


        newStr5 = newStr;
        newnewStr = newStr;
        newStr1 = newStr;
        var len = newStr.length;
        function lenfunc() {
            return len;
        }
        for (var i1 = 0; i1 < lenfunc(); i1++) {
            if (newStr[i1] + newStr[i1 + 1] + newStr[i1 + 2] + newStr[i1 + 3] + newStr[i1 + 4] + newStr[i1 + 5] + newStr[i1 + 6] + newStr[i1 + 7] == 'wikimake') {
                if (newStr[i1 + 8] == `(`) {
                    waitingforrules.wikimake = true;
                    starting = i1;
                }
            }
            if (starting < newStr.length) {
                if (waitingforrules.wikimake == true) {
                    if (i1 == starting + 9) {
                        var specialnewnewStr = newnewStr;
                        newnewStr = newnewStr.slice(i1, newnewStr.length - 1);
                        newnewStr = newnewStr.split(`);`)[0].split(`\n`)[0];
                        if (typeof newnewStr == 'string') {
                            console.log('여기까지');
                            if (newnewStr[0] + newnewStr[1] + newnewStr[2] + newnewStr[3] == 'type') {
                                console.log('여기까지');
                                if (newnewStr[4] == `=` || (newnewStr[4] + newnewStr[5] + newnewStr[6] == ` = `)) {
                                    console.log('여기까지');
                                    var newtype = newnewStr.replace(`=`, ``).replace(newnewStr.split(`=`)[0], ``).split(` - `)[0];
                                    if (newnewStr[4] != `=`) {
                                        newtype = newnewStr.replace(` = `, ``).replace(newnewStr.split(` = `)[0], ``).split(` - `)[0];
                                    }
                                    console.log(newtype);
                                    if (newtype == '틀') {
                                        console.log('여기까지');
                                        waitingforrules.template = true;
                                        var namepr = newnewStr.replace(newnewStr.split(` - `)[0] + ` - `, ``);
                                        console.log(namepr)

                                        if (namepr[0] + namepr[1] + namepr[2] + namepr[3] == 'name') {
                                            console.log('여기까지');
                                            if (namepr[4] == `=` || (namepr[4] + namepr[5] + namepr[6] == ` = `)) {
                                                console.log('여기까지');
                                                var namename = namepr.replace(`=`, ``).replace(namepr.split(`=`)[0], ``);
                                                if (namepr[4] != '=') {
                                                    namename = namepr.replace(` = `, ``).replace(namepr.split(` = `)[0], ``);
                                                }
                                                var namename2 = namename.replace(`(`, ``);
                                                var namename3 = `(` + namename.replace(`(`, ``).replace(namename.split(`(`)[1], ``);
                                                var namename4 = namename.split(`(`)[0].replaceAll(`(`, ``).replaceAll(`)`, ``);
                                                var namename10 = namename.replace(`(`, ``).replace(namename.split(`(`)[0], ``).replace(`(`, ``);
                                                var namename9 = (function () { var rtv = ''; for (var i5 = 0; i5 < namename10.length; i5++) { if (i5 < namename10.length - 2) { rtv += namename10[i5] } else { return rtv; } } return rtv; })();
                                                console.log(namename9);
                                                console.log(namename4);
                                                if (mods.fs.existsSync(`../forwiki/wiki/틀/${namename4}/index`)) {
                                                    console.log('여기까지');
                                                    if (namename9[0] + namename9[1] + namename9[2] + namename9[3] + namename9[4] + namename9[5] == 'params') {
                                                        if (namename9[6] == `=` || namename9[6] + namename9[7] + namename9[8] == ` = `) {
                                                            console.log('여기까지');
                                                            var namename5 = namename9.replace(`=`, ``);
                                                            if (namename9[6] != '=') {
                                                                namename5 = namename9.replace(` = `, ``).replace(namename4.split(` = `)[0], ``);
                                                            }
                                                            console.log(namename5 + 'aaa');
                                                            if (namename5.replace(`params`, ``) != '') {

                                                                var namename6 = namepr.replace(namename4, ``).replace(`name`, ``).replace(`=`, ``).replaceAll(`(`, ``).replaceAll(`)`, ``).replace(`params`, ``).replace(`=`, ``);
                                                                var namename7 = namename6.split(`,`);
                                                                console.log(namename6);
                                                                var paramval2 = [];
                                                                namename7.forEach(function (val, idx, arr) {
                                                                    var namename8 = val.split(` = `);
                                                                    if (namename8.length < 2) {
                                                                        namename8 = val.split(`=`);
                                                                    }
                                                                    if (namename8.length < 2) {

                                                                    } else {
                                                                        var paramval = { name: namename8[0], value: namename8[1] };
                                                                        paramval2.push({ name: namename8[0], value: namename8[1] });
                                                                    }
                                                                });
                                                                var filecontent = mods.fs.readFileSync(`../forwiki/wiki/틀/${namename4}/index`).toString('utf-8');
                                                                var templatefilecontent = filecontent.split(`|틀|`)[1].split(`|/틀|`)[0];
                                                                paramval2.forEach(function (val, idx, arr) {
                                                                    templatefilecontent = templatefilecontent.replace(`useparam(${val.name})`, val.value);
                                                                });
                                                                var newStr2 = newStr1.split(`wikimake(`)[1];
                                                                newStr2 = newStr2.split(`);`)[0];
                                                                newStr2 = newStr5.replace(`wikimake(` + newStr2 + `);`, templatefilecontent);
                                                                newStr5 = newStr2;
                                                                starting = newStr5.length;
                                                                newStr = newStr5;
                                                                waitingforrules.wikimake = false;
                                                                waitingforrules.template = false;
                                                                i1 = 0;
                                                                len = newStr.length;
                                                            } else {
                                                                var filecontent = mods.fs.readFileSync(`../forwiki/wiki/틀/${namename4}/index`).toString('utf-8');
                                                                var templatefilecontent = filecontent.split(`|틀|`)[1].split(`|/틀|`)[0];
                                                                var newStr2 = newStr1.split(`wikimake(`)[1];
                                                                newStr2 = newStr2.split(`);`)[0];
                                                                newStr2 = newStr5.replace(`wikimake(` + newStr2 + `);`, templatefilecontent);
                                                                newStr5 = newStr2;
                                                                starting = newStr5.length;
                                                                newStr = newStr5;
                                                                waitingforrules.wikimake = false;
                                                                waitingforrules.template = false;
                                                                i1 = 0;
                                                                len = newStr.length;
                                                            }
                                                        } else {
                                                        }
                                                    } else { }
                                                } else {
                                                    var regexpval = new RegExp(`wikimake\\(type = 틀 - name = ${namename4}\\(params = \\((.*?)\\)\\)\\);`, 'gmi');
                                                    var regexp2 = new RegExp(`wikimake\\(type=틀 - name=${namename4}\\(params=\\((.*?)\\)\\)\\);`, 'gmi');
                                                    console.log(regexp2);
                                                    newStr5 = newStr.replace(regexpval, "").replace(regexp2, "");
                                                    newStr = newStr5;
                                                    i1 = 0;
                                                    len = newStr.length;
                                                }
                                            } else { }
                                        } else { }
                                    } else if (newtype == 'math') {
                                        waitingforrules.special.mathematical = true;
                                    } else {
                                        newnewStr = specialnewnewStr;
                                        waitingforrules.wikimake = false;
                                    }
                                } else { }
                            } else { }
                        } else { }
                    } else { }
                } else { }
            } else { }
        }
        newStr5 = newStr;
        newnewStr = newStr;
        newStr1 = newStr;
        var htags = newStr.split(`/nH`);
        var h1h6 = {
            h1: false,
            h2: false,
            h3: false,
            h4: false,
            h5: false,
            h6: false,
        }
        var h1h62 = {
            h1: 0,
            h2: 0,
            h3: 0,
            h4: 0,
            h5: 0,
            h6: 0,
        }
        var h1 = 0, h2 = 0, h3 = 0, h4 = 0, h5 = 0, h6 = 0;
        var newarr = [];
        rtv = newStr;
        /*for (var i4 = 0; i4 < newStr.length; i4++) {
            console.log(newStr[i4 - 1]);
            if (newStr[i4 - 2] + newStr[i4 - 1] == `_H`) {
                console.log('왔음');
                if (newStr[i4 - 2] + newStr[i4 - 1] + newStr[i4] + newStr[i4 + 1] + newStr[i4 + 2] + newStr[i4 + 3] + newStr[i4 + 4] + newStr[i4 + 5] == '_H######') {
                    rtv = rtv.replace(newStr[i4 - 2] + newStr[i4 - 1] + newStr[i4] + newStr[i4 + 1] + newStr[i4 + 2] + newStr[i4 + 3] + newStr[i4 + 4] + newStr[i4 + 5], `<div id="h${h1}.${h2}.${h3}.${h4}.${h5}.${h6}"><h6><a href="#h${h1}.${h2}.${h3}.${h4}.${h5}.${h6}">${h1}.${h2}.${h3}.${h4}.${h5}.${h6}.</a>${rtv.slice(i4 + 6, rtv.length - 1).split(`/_H`)[0]}</h6>`);
                    h1h6.h6 = true;
                    h6++
                } else if (newStr[i4 - 2] + newStr[i4 - 1] + newStr[i4] + newStr[i4 + 1] + newStr[i4 + 2] + newStr[i4 + 3] + newStr[i4 + 4] == '_H#####') {
                    rtv = rtv.replace(newStr[i4 - 2] + newStr[i4 - 1] + newStr[i4] + newStr[i4 + 1] + newStr[i4 + 2] + newStr[i4 + 3] + newStr[i4 + 4], `<div id="h${h1}.${h2}.${h3}.${h4}.${h5}"><h5><a href="#h${h1}.${h2}.${h3}.${h4}.${h5}">${h1}.${h2}.${h3}.${h4}.${h5}.</a>${rtv.slice(i4 + 5, rtv.length - 1).split(`/_H`)[0]}</h5>`);
                    h1h6.h5 = true;
                    if (i4 != 0 && (h1h6.h6 == true)) {
                        rtv += `</div>`;
                        h1h6.h6 = false;
                    } else {
                        h5++
                    }
                } else if (newStr[i4 - 2] + newStr[i4 - 1] + newStr[i4] + newStr[i4 + 1] + newStr[i4 + 2] + newStr[i4 + 3] == '_H####') {
                    rtv = rtv.replace(newStr[i4 - 2] + newStr[i4 - 1] + newStr[i4] + newStr[i4 + 1] + newStr[i4 + 2] + newStr[i4 + 3], `<div id="h${h1}.${h2}.${h3}.${h4}"><h4><a href="#h${h1}.${h2}.${h3}.${h4}">${h1}.${h2}.${h3}.${h4}.</a>${rtv.slice(i4 + 4, rtv.length - 1).split(`/_H`)[0]}</h4>`);
                    if (i4 != 0 && (h1h6.h5 == true || h1h6.h6 == true)) {
                        rtv += `</div>`
                        if (h1h6.h6 == true) {
                            h1h6.h6 = false;
                        }
                        if (h1h6.h5 == true) {
                            h1h6.h5 = false;
                        }
                    } else {
                        h4++
                    }
                } else if (newStr[i4 - 2] + newStr[i4 - 1] + newStr[i4] + newStr[i4 + 1] + newStr[i4 + 2] == '_H###') {
                    rtv = rtv.replace(newStr[i4 - 2] + newStr[i4 - 1] + newStr[i4] + newStr[i4 + 1] + newStr[i4 + 2], `<div id="h${h1}.${h2}.${h3}"><h3><a href="#h${h1}.${h2}.${h3}">${h1}.${h2}.${h3}</a>${rtv.slice(i4 + 3, rtv.length - 1).split(`/_H`)[0]}</h3>`);

                    if (i4 != 0 && (h1h6.h4 == true || h1h6.h5 == true || h1h6.h6 == true)) {
                        rtv += `</div>`
                        if (h1h6.h6 == true) {
                            h1h6.h6 = false;
                        }
                        if (h1h6.h5 == true) {
                            h1h6.h5 = false;
                        }
                        if (h1h6.h4 == true) {
                            h1h6.h4 = false;
                        }
                    } else {
                        h3++
                    }
                } else if (newStr[i4 - 2] + newStr[i4 - 1] + newStr[i4] + newStr[i4 + 1] == '_H##') {
                    rtv = rtv.replace(newStr[i4 - 2] + newStr[i4 - 1] + newStr[i4] + newStr[i4 + 1], `<div id="h${h1}.${h2}"><h2><a href="#h${h1}.${h2}">${h1}.${h2}.</a>${rtv.slice(i4 + 2, rtv.length - 1).split(`/_H`)[0]}</h2>`);

                    if (i4 != 0 && (h1h6.h3 == true || h1h6.h4 == true || h1h6.h5 == true || h1h6.h6 == true)) {
                        rtv += `</div>`
                        if (h1h6.h6 == true) {
                            h1h6.h6 = false;
                        }
                        if (h1h6.h5 == true) {
                            h1h6.h5 = false;
                        }
                        if (h1h6.h4 == true) {
                            h1h6.h4 = false;
                        }
                        if (h1h6.h3 == true) {
                            h1h6.h3 = false;
                        }
                    } else {
                        h2++
                    }
                } else if (newStr[i4 - 2] + newStr[i4 - 1] + newStr[i4] == '_H#') {
                    console.log(`씻파아`)
                    rtv = rtv.replace(newStr[i4 - 2] + newStr[i4 - 1] + newStr[i4], `<div id="h${h1}"><h1><a href="#h${h1}">${h1}.</a>${rtv.slice(i4 + 1, rtv.length - 1).split(`/_H`)[0]}</h1>`);

                    if (i4 != 0 && (h1h6.h2 == true || h1h6.h3 == true || h1h6.h4 == true || h1h6.h5 == true || h1h6.h6 == true)) {
                        rtv += `</div>`
                        if (h1h6.h6 == true) {
                            h1h6.h6 = false;
                        }
                        if (h1h6.h5 == true) {
                            h1h6.h5 = false;
                        }
                        if (h1h6.h4 == true) {
                            h1h6.h4 = false;
                        }
                        if (h1h6.h3 == true) {
                            h1h6.h3 = false;
                        }
                        if (h1h6.h2 == true) {
                            h1h6.h2 = false;
                        }
                    } else {
                        h1++
                    }
                }
            }
            if (i4 == newStr.length - 1) {
                rtv += `</div>`;
                for (var ih1 = 0; ih1 < h1; ih1++) {
                    rtv += `</div>`;
                }
                for (var ih2 = 0; ih2 < h2; ih2++) {
                    rtv += `</div>`;
                }
                for (var ih3 = 0; ih3 < h3; ih3++) {
                    rtv += `</div>`;
                }
                for (var ih4 = 0; ih4 < h4; ih4++) {
                    rtv += `</div>`;
                }
                for (var ih5 = 0; ih5 < h5; ih5++) {
                    rtv += `</div>`;
                }
                for (var ih6 = 0; ih6 < h6; ih6++) {
                    rtv += `</div>`;
                }
            }
        }*/
        /*var Hsplit = rtv.split(`_H`);
        for (var i6 = 0; i6 < Hsplit.length; i6++){
            var val = Hsplit[i6];
            var val2 = val.split(`/_H`);
            var H7 = val2[0];
            var Htitlepr = H7.split(` `)
            var Htitle = '';
            var Hcontent = '';
            Htitlepr.forEach(function (val9, idx9, arr9) { if (idx9 != 0) {
                Hcontent += val9;
            } else { Htitle += val9; }});
            
        }*/
        function joinfunc(strparam, ...indexes) {
            var NSTR = new String(strparam);
            var rtv78 = '';
            indexes.forEach(function (val, idx, arr) {
                if (typeof val == 'number' && !isNaN(val)) {
                    rtv78 += NSTR[val];
                }
            });
            return rtv78;
        }
        function joinfuncsimple(strparam, from, to) {
            var NSTR = new String(strparam);
            var rtv78 = '';
            var rtv78start = false;
            for (var i78x = 0; i78x < NSTR.length; i78x++) {
                if (i78x == from) {
                    rtv78start = true;
                }
                if (rtv78start == true) {
                    rtv78 += NSTR[i78x];
                }
                if (i78x == to) {
                    rtv78start = false;
                }
            }
        }
        var newrtv = rtv;
        var newrtv2 = '';
        var numberofhs = {
            h1: 0,
            h2: 0,
            h3: 0,
            h4: 0,
            h5: 0,
            h6: 0,
        }
        var waitingforhs = {
            h1: false,
            h2: false,
            h3: false,
            h4: false,
            h5: false,
            h6: false,
        }
        /*var chessmatcheswithpgn = rtv.match(/\{chessboard\((.*?)\)\|\((.*?)\)\}/gmi);
        if (chessmatcheswithpgn != null) {
            for (var i567 = 0; i567 < chessmatcheswithpgn.length; i567++) {
                var specrtv0 = rtv.replace(/\{chessboard\((.*?)\)\}/gmi, "$1").split(`)`)[0];
                rtv = rtv.replace(/\{chessboard\((.*?)\)\|\((.*?)\)\}/gmi, `<chessboard fen="` + specrtv0 + `" pgn="` + "$2" + `" style="width:20em;"></chessboard>`);
            }
        }*/
        var chessmatches = rtv.match(/\{chessboard\((.*?)\)\}\|width=(.*?);/gmi);
        if (chessmatches != null) {
            for (var i456 = 0; i456 < chessmatches.length; i456++) {
                var specrtv0 = rtv.replace(/\{chessboard\((.*?)\)\}\|width=(.*?);/gmi, "$1").split(`)`)[0];
                if (rtv.replace(/\{chessboard\((.*?)\)\}\|width=(.*?);/gmi, "$1").includes(`)(`)) {
                    var thingtorep = rtv.replace(/(.*?)\{chessboard\((.*?)\)\}\|width=(.*?);(.*)/gmi, "$2");
                    var width = rtv.replace(/(.*?)\{chessboard\((.*?)\)\}\|width=(.*?);(.*)/gmi, "$3");
                    console.log('pgn' + rtv.replace(chessmatches[i456], `<chessboard fen="` + thingtorep.replace(`)(`, `" pgn="`) + `" style="width:` + width + `em;"></chessboard>`));
                    rtv = rtv.replace(chessmatches[i456], `<chessboard fen="` + thingtorep.replace(`)(`, `" pgn="`) + `" style="width:` + width + `em;"></chessboard>`);
                } else {
                    console.log("aaaa");
                    rtv = rtv.replace(/\{chessboard\((.*?)\)\}\|width=(.*?);/gmi, `<chessboard fen="` + "$1" + `" style="width:` + "$2" + `em;"></chessboard>`);
                }
            }
        }
        var img_with_alt_and_size_matches = rtv.match(/\{img\((.*?)\)\((.*?)\)\}\|width=(.*?);/gmi);
        if (img_with_alt_and_size_matches != null) {
            for (var i789 = 0; i789 < img_with_alt_and_size_matches.length; i789++) {
                if (rtv.replace(/\{img\((.*?)\)\}\|width=(.*?);/gmi, "$1").includes(`)(`)) {
                    var thingtorep = rtv.replace(/(.*?)\{img\((.*?)\)\}\|width=(.*?);(.*)/gmi, "$2");
                    var width = rtv.replace(/(.*?)\{img\((.*?)\)\}\|width=(.*?);(.*)/gmi, "$3");
                    rtv = rtv.replace(img_with_alt_and_size_matches[i789], `<img src="` + thingtorep.replace(")(", `" alt="`) + `" width=` + width + `>`);
                } else {
                    rtv = rtv.replace(/\{img\((.*?)\)\((.*?)\)\}\|width=(.*?);/gmi, `<img src="$1" alt="$2" width="$3">`);
                }
            }
        }
        var img_with_size_matches = rtv.match(/\{img\((.*?)\)\}\|width=(.*?);/gmi);
        if (img_with_size_matches != null) {
            for (var i890 = 0; i890 < img_with_size_matches.length; i890++) {
                rtv = rtv.replace(/(.*?)\{img\((.*?)\)\}\|width=(.*?);(.*)/gmi, `$1 <img src="$2" width="$3"> $4`);
            }
        }
        var img_matches = rtv.match(/(.*?)\{img\((.*?)\)\}\|;(.*)/gmi);
        if (img_matches != null) {
            for (var i901 = 0; i901 < img_matches.length; i901++) {
                rtv = rtv.replace(/(.*?)\{img\((.*?)\)\}\|;(.*)/gmi, `$1 <img src="$2" width="250"> $3`);
            }
        }
        rtv = rtv.replace(` `, ``);
        for (var i = 0; i < rtv.length; i++) {
            rtv = rtv.replace(/#### (.*?) #### (.*?) \/\/\//gmi, `<div class="para"><h4><span class="parafolder">&#65088;</span><span class="para-title">$1</span></h4><div class="paracontent"> $2 </div></div>`);
            rtv = rtv.replace(/### (.*?) ### (.*?) \/\/\//gmi, `<div class="para"><h3><span class="parafolder">&#65088;</span><span class="para-title">$1</span></h3><div class="paracontent"> $2 </div></div>`);
            rtv = rtv.replace(/## (.*?) ## (.*?) \/\/\//gmi, `<div class="para"><h2><span class="parafolder">&#65088;</span><span class="para-title">$1</span></h2><div class="paracontent"> $2 </div></div>`);
            rtv = rtv.replace(/# (.*?) # (.*?) \/\/\//gmi, `<div class="para"><h1><span class="parafolder">&#65088;</span><span class="para-title">$1</span></h1><div class="paracontent"> $2 </div></div>`);
        }
        rtv = rtv.replaceAll(`[-header-]`, `<div class="docheader"></div>`);
        var len8 = 0;
        while (rtv.match(/(.*?)~~(.*?)~~(.*)/gmi) != null && len8 < rtv.length) {
            rtv = rtv.replace(/(.*?)~~(.*?)~~(.*)/gmi, `$1<span style="text-decoration:line-through;color:#808080;">$2</span>$3`);
            len8++
        }
        var len9 = 0;
        while (rtv.match(/(.*?)-a\|(.*?)\|a-(.*)/gmi) != null && len9 < rtv.length) {
            rtv = rtv.replace(/(.*?)-a\|(.*?)\|a-(.*)/gmi, `$1<span style="font-weight:bold;font-size:105%;">$2</span>$3`);
            len9++
        }
        var len9 = 0;
        while (rtv.match(/(.*?)'''(.*?)'''(.*)/gmi) != null && len9 < rtv.length) {
            rtv = rtv.replace(/(.*?)'''(.*?)'''(.*)/gmi, `$1<span style="font-weight:bold;">$2</span>$3`);
            len9++
        }
        var len98 = 0;
        while (rtv.match(/(.*?)''\*(.*?)\*''(.*)/gmi) != null && len98 < rtv.length) {
            rtv = rtv.replace(/(.*?)''\*(.*?)\*''(.*)/gmi, `$1<span style="font-weight:700;">$2</span>$3`);
            len98++
        }
        var len980 = 0;
        while (rtv.match(/(.*?)''(.*?)''(.*)/gmi) != null && len980 < rtv.length) {
            rtv = rtv.replace(/(.*?)''(.*?)''(.*)/gmi, `$1<i>$2</i>$3`);
            len980++
        }
        var wiki_comments = rtv.match(/\[\* (.*?)\]/gmi);
        var comments_list = [];
        var commentslist = `<div class="comments-list"><hr><ul><li style="list-style-type:none;font-weight:bold;">[주석들]</li>@@list@@</ul></div>`;
        var comment_template = `<sup data-cgrshorter-action="popover" data-popover-text="@@popovercontent@@">[@@content@@]</sup>`;
        if (wiki_comments != null) {
            wiki_comments.forEach(function (val, idx, arr) {
                var popovercontent = rtv.replace(/(.*?)\[\* (.*?)\](.*)/gmi, "$2").replaceAll(`<`, `&lt;`).replaceAll(`>`, `&gt;`).replaceAll(`"`, `&quot;`).replaceAll(`'`, `&apos;`);
                var popoveridx = new String(idx);
                rtv = rtv.replace(/(.*?)\[\* (.*?)\](.*)/gmi, "$1" + comment_template.replace(`@@popovercontent@@`, `주석:|a href=&quot;#comment-${popoveridx}&quot; onclick=&quot;this.parentElement.remove();document.querySelector(&apos;.body&apos;).classList.remove(&apos;shadowbody&apos;);&quot;|${popoveridx}|a| - |br|` + popovercontent).replace(`@@content@@`, popoveridx) + "$3");
                comments_list.push({ commentidx: popoveridx, content: popovercontent.replaceAll(`&lt;`, `<`).replaceAll(`&gt;`, `>`).replaceAll(`&apos;`, `'`).replaceAll(`&quot;`, `"`) });
            });
            var commentsListHTML = ``;
            comments_list.forEach(function (val, idx, arr) {
                var specialborw = (idx % 2 == 0) ? `white` : `black`;
                commentsListHTML += `<li id="comment-${val.commentidx}" class="special ${specialborw}"><span>${val.commentidx}:</span> ${val.content}</li>`;
            });
            rtv += commentslist.replace(`@@list@@`, commentsListHTML);
        }
        var wiki_list_ul_matches = rtv.match(/_\*_(.*?)\/\//gmi);
        var wiki_list_html = ``;
        if (wiki_list_ul_matches != null) {
            wiki_list_ul_matches.forEach(function (val, idx, arr) {
                if (arr.length == 1) {
                    rtv = rtv.replace(/(.*?)_\*_(.*?)\/\/(.*)/gmi, `$1<ul><li>$2</li></ul>$3`);
                    return;
                }
                if (!(rtv.replace(/(.*?)_\*_(.*?)\/\/(.*)/gmi, "$1").replaceAll(` `, ``).endsWith(`</li>`))) {
                    rtv = rtv.replace(/(.*?)_\*_(.*?)\/\/(.*)/gmi, `$1<ul><li>$2</li>$3`);
                } else if (!(rtv.replace(/(.*?)_\*_(.*?)\/\/(.*)/gmi, "$3").replaceAll(` `, ``).startsWith(`_*_`, 0))) {
                    rtv = rtv.replace(/(.*?)_\*_(.*?)\/\/(.*)/gmi, `$1<li>$2</li></ul>$3`);
                } else {
                    rtv = rtv.replace(/(.*?)_\*_(.*?)\/\/(.*)/gmi, `$1<li>$2</li>$3`);
                }
            });
        }
        nowikis.forEach(function (val, idx, arr) {
            nowikis[idx] = val.replaceAll(`<`, `&lt;`).replaceAll(`>`, `&gt;`);
        });
        return { rtv: rtv, nowiki: nowikis };
    }
}