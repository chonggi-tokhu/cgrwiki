var express = require("express");
var { Chess } = require("chess.js");
var app = express();
var fs = require("fs");
var http = require("http");
var httpServer = new http.Server(app);
var ejs = require("ejs");
var io = require("socket.io")(httpServer);
var siofu = require("socketio-file-upload");
var path = require("path");
var bodyParser = require("body-parser");
var session = require("express-session");
var Filestore = require("session-file-store")(session);
var f = require('session-file-store');
var wiki_rule2 = require("./wiki_rule")({ fs: fs });
function wiki_rule3(str) {
    var newstr = {};
    newstr = wiki_rule2(str);
    var regexp1 = new RegExp(`wikimake\(type=틀 - name=(.*)\(params=\((.*)\)\)\);`, `mi`);
    var lim = 0;
    while (newstr.rtv.match(/wikimake\(type = 틀 - name = (.*?)\(params = \((.*?)\)\)\);/gmi) != null || newstr.rtv.match(/wikimake\(type=틀 - name=(.*?)\(params=\((.*?)\)\)\);/gmi) != null) {
        newstr.rtv = wiki_rule2(newstr.rtv);
        lim++
        if (lim > 100) {
            break;
        }
    }
    return { rtv: newstr.rtv, nowiki: newstr.nowiki };
}
function wiki_rule(str) {
    var rtv = wiki_rule3(str).rtv;
    wiki_rule3(str).nowiki.forEach(function (val, idx, arr) {
        rtv = rtv.replace(`-nowiki${idx}-`, val);
    });
    return rtv;
}
var recentlyedited = JSON.parse(fs.readFileSync(`../forwiki/wiki/adminpage/wikilog/recentedit.json`).toString('utf-8')).recentedits;
var recviewers = JSON.parse(fs.readFileSync(`../forwiki/wiki/adminpage/wikilog/viewcount.json`).toString('utf-8')).list;
function updaterecedits() {
    var backup = recentlyedited;
    recentlyedited.forEach(function (val, idx, arr) {
        if (val.editor == undefined) {
            recentlyedited[idx].editor = {
                id: '?',
            }
        }
    });
    fs.writeFile(`../forwiki/wiki/adminpage/wikilog/recentedit.json`, JSON.stringify({ recentedits: recentlyedited }), function (err) {
        if (err) {
            console.log(err);
            fs.writeFile(`../forwiki/wiki/adminpage/wikilog/recentedit.json`, JSON.stringify({ recentedits: backup }), function (err) { if (err) console.log(err) });
        }
    });
    return JSON.parse(fs.readFileSync(`../forwiki/wiki/adminpage/wikilog/recentedit.json`).toString('utf-8'));
}
function getsimple() {
    var rtv = [];
    var rtv2 = [];
    recviewers.forEach(function (val, idx, arr) {
        if (!rtv.includes(val.id)) {
            rtv.push(val.id);
            rtv2.push(val);
        } else { }
    });
    return rtv2;
}
var myserver;
session.user = {
    isadmin: false,
}
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/wiki_server.js', function (req, res) {
    res.status(403).end('403 forbidden');
});
app.get('/wiki_rule.js', function (req, res) {
    res.status(403).end('403 forbidden');
});
app.use(
    session({
        secret: "secret key",
        resave: false,
        saveUninitialized: true,
        store: new Filestore(),
    })
);
app.use(express.static("./"));
app.set("view engine", 'ejs');
app.set('views', __dirname.replace(`server`, `forwiki/wiki`));
app.use('/ColourgreyShorterJS/', function (req, res) {
    res.sendFile(__dirname.replace('server', 'forwiki/files') + '/ColourgreyShorterJS/' + decodeURI(req.path));
});
var userlist = JSON.parse(fs.readFileSync(`../forwiki/users/users.json`).toString('utf-8'));
function userlistfunc() {
    console.log(userlist);
    fs.writeFile(`../forwiki/users/users.json`, JSON.stringify(userlist), function (err) { if (err) { console.log(err); } });
    return JSON.parse(fs.readFileSync(`../forwiki/users/users.json`).toString('utf-8'));
}
function navbarTemplate() {
    return fs.readFileSync(`../forwiki/wiki/navbar_template.ejs`).toString('utf-8').replaceAll(`&gt;`, `>`).replaceAll(`&lt;`, `<`);
}
function wikimesage(namep) {
    if (fs.existsSync(`../forwiki/wiki/${namep}/index`)) {
        return { message: ``, content: wiki_rule(fs.readFileSync(`../forwiki/wiki/${namep}/index`).toString('utf-8')) };
    } else {
        return { message: ` 만들어야 합니다.`, content: `<a href="/edit/${namep.replace("docs", "").replace("/", "").replace("/", "").replace(`:`, `/`)}" class="btn btn-warning">문서 만들기</a>` };
    }
}
var bannedips = JSON.parse(fs.readFileSync(`../forwiki/wiki/adminpage/wikilog/bannedips.json`));
function bannedip() {
    fs.writeFile(`../forwiki/wiki/adminpage/wikilog/bannedips.json`, JSON.stringify(bannedips), function (err) { if (err) { console.log(err); } });
    return JSON.parse(fs.readFileSync(`../forwiki/wiki/adminpage/wikilog/bannedips.json`).toString('utf-8'));
}
function wikieditmessage(namep) {
    if (fs.existsSync(`../forwiki/wiki/docs/${namep}/index`)) {
        return { message: ` 문서 편집`, content: (fs.readFileSync(`../forwiki/wiki/docs/${namep}/index`).toString('utf-8')), type: 'edit' };
    } else {
        return { message: ` 새 문서 생성`, content: ``, type: 'create' };
    }
}
function wikimessage2(namep) {
    if (fs.existsSync(`../forwiki/wiki/${namep.replace("/", "").replace(":", "/")}/index`)) {
        return { message: ``, content: wiki_rule(fs.readFileSync(`../forwiki/wiki/${namep.replace("/", "").replace(":", "/")}/index`).toString('utf-8')) };
    } else {
        return { message: ` 만들어야 합니다.`, content: `<a href="/edit/${namep.replace(`/`, ``)}" class="btn btn-warning">문서 만들기</a>` };
    }
}
function wikieditmessage2(namep) {
    console.log(namep);
    if (fs.existsSync(`../forwiki/wiki/${namep.replace(":", "/")}/index`)) {
        return { message: ` 문서 편집`, content: (fs.readFileSync(`../forwiki/wiki/${namep.replace(":", "/")}/index`).toString('utf-8')), type: 'edit' };
    } else {
        return { message: ` 새 문서 생성`, content: `<a href="/edit/${namep.replace(`/`, ``)}" class="btn btn-warning">문서 만들기</a>`, type: 'create' };
    }
}
function exists(np) {
    var str = new String(np);
    return fs.existsSync(`../wiki/docs/${np}`);
}
function exists2(np) {
    var str = new String(np);
    console.log(np);
    return fs.existsSync(np);
}
function getnamespace(str) {
    var rtv = new String(str).split(":");
    return rtv[0];
}
function htmlfunc(str) {
    return str.replaceAll(`&quot`, `"`).replaceAll(`&apos;`, `'`).replaceAll(`&lt;`, `<`).replaceAll(`&gt;`, `>`).replaceAll(`\n`, `\n`);
}
function getbacklinks(docname) {
    var str = new String(docname);
    var rtv = [];

    var docs = fs.readdirSync(`../forwiki/wiki/docs`);
    docname = docname.replace("/", "");
    docs.forEach(function (val, idx, arr) {
        var data = fs.readFileSync(`../forwiki/wiki/docs/${val}/index`).toString('utf-8');
        if (data.match(`[[${docname}]]`) != null) {
            rtv[rtv.length] = { docname: val, link: `/wiki/${val}` };
        }
        if (data.match(new RegExp(`\\[\\[${docname}\\|(.*?)\\]\\]`), 'gmi') != null) {
            rtv[rtv.length] = { docname: val, link: `/wiki/${val}` };
        }
        console.log(data.match(`[[${val}]]`));
        console.log(docname);
    });
    var categories = fs.readdirSync(`../forwiki/wiki/분류`);
    categories.forEach(function (val, idx, arr) {
        var data = fs.readFileSync(`../forwiki/wiki/분류/${val}/index`).toString('utf-8');
        if (data.match(`[[${docname}]]`) != null) {
            rtv[rtv.length] = { docname: val, link: `/wiki/분류:${val}` };
        }
        if (data.match(new RegExp(`\\[\\[${docname}\\|(.*?)\\]\\]`), 'gmi') != null) {
            rtv[rtv.length] = { docname: val, link: `/wiki/분류:${val}` };
        }
        console.log(data.match(new RegExp(`a href="/wiki/${docname}`, 'gmi')));
        console.log(docname);
    });
    var cgrwikis = fs.readdirSync(`../forwiki/wiki/CommonWiki`);
    cgrwikis.forEach(function (val, idx, arr) {
        var data = fs.readFileSync(`../forwiki/wiki/CommonWiki/${val}/index`).toString('utf-8');
        console.log(data);
        if (data.match(`[[${docname}]]`) != null) {
            rtv[rtv.length] = { docname: val, link: `/wiki/CommonWiki:${val}` };
        }

        if (data.match(new RegExp(`\\[\\[${docname}\\|(.*?)\\]\\]`), 'gmi') != null) {
            rtv[rtv.length] = { docname: val, link: `/wiki/CommonWiki:${val}` };
        }
        console.log(data.match(new RegExp(`a href="/wiki/${docname}`, 'gmi')));
        console.log(docname);
    });
    var cgrwikis = fs.readdirSync(`../forwiki/wiki/틀`);
    cgrwikis.forEach(function (val, idx, arr) {
        var data = fs.readFileSync(`../forwiki/wiki/틀/${val}/index`).toString('utf-8');
        if (data.match(`[[${docname}]]`) != null) {
            rtv[rtv.length] = { docname: val, link: `/wiki/틀:${val}` };
        }
        if (data.match(new RegExp(`\\[\\[${docname}\\|(.*?)\\]\\]`), 'gmi') != null) {
            rtv[rtv.length] = { docname: val, link: `/wiki/틀:${val}` };
        }
        console.log(data.match(new RegExp(`a href="/wiki/${docname}`, 'gmi')));
        console.log(docname);
    });
    console.log(rtv);
    return rtv;
    /*if (exists(str)) {
        var newstr = fs.readFileSync(`../forwiki/wiki/docs/${str}/index`).toString('utf-8');
        newstr = newstr.replaceAll(/a\>(.*)\<a/gmi, `a>` + "$1" + "a|a" + `<a`);
        var matches = newstr.split("a|a");
        matches.forEach(function(){})
    }*/
}
var wikiclientrule = require("./wiki_rule_for_client");
function decoderule(str) {
    var string = new String(str);
    return wiki_rule({ fs: { existsSync: function (par) { return fs.existsSync(par) }, readFileSync: function (par) { return fs.readFileSync(par) }, readdirSync: function (par) { return fs.readdirSync(par) } } })(str);
}
var templatesnow = fs.readdirSync(`../forwiki/wiki/틀`);
function templatefunc(str) {
    var rtv = '';
    for (var i = 0; i < templatesnow.length; i++) {
        if (str == templatesnow[i]) {
            rtv = fs.readFileSync(`../forwiki/wiki/틀/${str}`).toString('utf-8');
        }
    }
    return rtv;
}
function templates() {
    var rtv = {};
    var templatesnow5 = templatesnow;
    templatesnow5.forEach(function (val, idx, arr) {
        rtv[val] = fs.readFileSync(`../forwiki/wiki/틀/${val}/index`).toString('utf-8');
    });
    return rtv;
}
function templatesnowfunc() {
    return {
        existsSync(str) {
            return templatesnow.includes(str);
        },
        templates: templates(),
    }
}
function decoderule2(str) {
    return wikiclientrule({ fs: templatesnowfunc() });
}
app.use('/', function (req, res, next) {
    if (decodeURI(req.path) == '/wiki_server.js' || decodeURI(req.path).includes('wiki_server.js')) {
        return res.status(403).end('403 forbidden');
    }
    if (req.session.logged) {
        var pushval = req.session.user;
        pushval['ipaddress'] = req.ip;
        pushval['date'] = `${new Date().getFullYear()}년 ${new Date().getMonth() + 1}월 ${new Date().getDate()}일 ${new Date().getHours()}시 ${new Date().getMinutes()}분 ${new Date().getSeconds()}.${new String(new Date().getMilliseconds() / 1000).replace('0.', '')}초`;
        recviewers.push(pushval);
        if (typeof req.session.visited != 'boolean') {
            req.session.visited = true;
        } else {
            if (req.session.visited > 10) {
                req.session.visited = 0;
            } else {
                req.session.visited++
            }
        }
        if (req.session.visited == 0) {
            fs.writeFile(`위키가 있는 디렉토리의 바로 상위 경로/CommonWiki/forwiki/wiki/adminpage/wikilog/viewcount.json`, JSON.stringify({ list: recviewers }), function (err) {
                if (err) console.log(err);
            });
        }

        next();
    } else {
        req.session.user = {
            isadmin: false,
            id: req.ip,
            ipaddress: req.ip,
        };
        var pushval = req.session.user;
        pushval['date'] = `${new Date().getFullYear()}년 ${new Date().getMonth() + 1}월 ${new Date().getDate()}일 ${new Date().getHours()}시 ${new Date().getMinutes()}분 ${new Date().getSeconds()}.${new String(new Date().getMilliseconds() / 1000).replace('0.', '')}초`;
        recviewers.push(pushval);
        if (typeof req.session.visited != 'boolean') {
            req.session.visited = true;
            fs.writeFile(`위키가 있는 디렉토리의 바로 상위 경로/CommonWiki/forwiki/wiki/adminpage/wikilog/viewcount.json`, JSON.stringify({ list: recviewers }), function (err) {
                if (err) console.log(err);
            });
        } else {
            if (req.session.visited == true) {
                fs.writeFile(`위키가 있는 디렉토리의 바로 상위 경로/CommonWiki/forwiki/wiki/adminpage/wikilog/viewcount.json`, JSON.stringify({ list: recviewers }), function (err) {
                    if (err) console.log(err);
                });
                req.session.visited = false;
            } else {
                req.session.visited = true;
            }
        }
        next();
    }
});
app.get('/fullview', function (req, res) {
    if (req.session.logged) {
        var me = `<li class="nav-item dropdown mymenu"><a class="dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                ${req.session.user.id} ${(function () { if (req.session.logged == true) { return '로그인됨' } else { return '로그인안됨' } })()}
                            </a>
                            <ul class="dropdown-menu">
                                <li>${(function () { if (req.session.logged != true) { return `<a href="/login">로그인</a>` } else { return `<a href="/logout">로그아웃</a>` } })()}</li>
                            </ul></li>`;
        var newlist = recviewers;
        if (Array.isArray(newlist)) {
            newlist = newlist.reverse();
        }
        if (req.session.user.isadmin) {
            res.render('list_temp', { info: { doclist: newlist, isadmin: true, me: me, listtype: 'userlist', admin_level: req.session.user.admin_level, perm: req.session.user.perm, } });
            return;
        }
    }
    res.end(`you are not an admin`);
});
app.get('/logout', function (req, res) {
    req.session.user = {
        isadmin: false,
        id: req.ip,
    };
    req.session.logged = false;
    res.redirect("/");
});
app.use('/wiki/', function (req, res) {
    var docname = decodeURI(req.path).replace('/wiki', '').replace("docs", "");
    var messageandbody = wikimesage("docs/" + docname);
    var me = `<li class="nav-item dropdown mymenu"><a class="dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                ${req.session.user.id} ${(function () { if (req.session.logged == true) { return '로그인됨' } else { return '로그인안됨' } })()}
                            </a>
                            <ul class="dropdown-menu">
                                <li>${(function () { if (req.session.logged != true) { return `<a href="/login">로그인</a>` } else { return `<a href="/logout">로그아웃</a>` } })()}</li>
                            </ul></li>`;
    console.log(me);
    console.log(getnamespace(docname));
    if (getnamespace(docname).replace("/", "") == '분류') {
        var namespace = getnamespace(docname);
        docname = docname.replace(namespace + ":", "");
        var messageandbody = wikimessage2(namespace.replace("/", "") + ":" + docname);
        res.render('category_template', { info: { docname: decodeURI(req.path).replace('wiki', '').replace('/', '').replace('/', '').replace("docs", "").replace("docs", ""), message: messageandbody.message, content: messageandbody.content, docs: getbacklinks(namespace + ":" + docname), admin: req.session.user.isadmin, type: "edit", navbar: navbarTemplate(), me: me } });
    } else if (getnamespace(docname).replace("/", "") == "CommonWiki") {
        var namespace = getnamespace(docname).replace("/", "");
        docname = docname.replace(namespace + ":", "");
        var messageandbody = wikimessage2(namespace + ":" + docname);
        res.render('basic_template', { info: { docname: decodeURI(req.path).replace('wiki', '').replace('/', '').replace('/', '').replace('/', '').replace("docs", "").replace("docs", ""), message: messageandbody.message, content: messageandbody.content, admin: req.session.user.isadmin, type: "edit", navbar: navbarTemplate(), me: me } });
    } else if (getnamespace(docname).replace(`/`, ``) == "틀") {
        var namespace = getnamespace(docname).replace("/", "");
        docname = docname.replace(namespace + ":", "");
        var messageandbody = wikimessage2(namespace + ":" + docname);
        res.render('basic_template', { info: { docname: decodeURI(req.path).replace('wiki', '').replace('/', '').replace('/', '').replace('/', '').replace("docs", "").replace("docs", ""), message: messageandbody.message, content: messageandbody.content, admin: req.session.user.isadmin, type: "edit", navbar: navbarTemplate(), me: me } });
    } else if (getnamespace(docname).replace(`/`, ``) == '사용자') {
        var namespace = '사용자';
        docname = docname.replace(namespace + ":", '');
        var messageandbody = wikimessage2(namespace + ":" + docname);
        res.render('basic_template', { info: { docname: decodeURI(req.path).replace('wiki', '').replace('/', '').replace('/', '').replace('/', '').replace("docs", "").replace("docs", ""), message: messageandbody.message, content: messageandbody.content, admin: req.session.user.isadmin, type: "edit", navbar: navbarTemplate(), me: me } });
    } else if (!docname.includes(":")) {
        res.render('basic_template', { info: { docname: decodeURI(req.path).replace('wiki', '').replace('/', '').replace('/', '').replace("docs", "").replace("docs", ""), message: messageandbody.message, content: messageandbody.content, admin: req.session.user.isadmin, type: "edit", navbar: navbarTemplate(), me: me } });
    }
});
var temps = [];
templatesnow.forEach(function (val, idx, arr) {
    temps.push({ c: fs.readFileSync(`../forwiki/wiki/틀/${val}/index`).toString('utf-8'), n: val });
});
app.use('/edit/', function (req, res) {

    var temps = [];
    fs.readdirSync("../forwiki/wiki/틀").forEach(function (val, idx, arr) {
        temps.push({ c: fs.readFileSync(`../forwiki/wiki/틀/${val}/index`).toString('utf-8').replaceAll('\n', `  `).replaceAll(`\r`, ``).replaceAll(`'`, `&apos;`).replaceAll(`"`, `&quot;`).replaceAll(`<`, `&lt;`).replaceAll(`>`, `&gt;`), n: val });
    });
    var me = `<li class="nav-item dropdown mymenu"><a class="dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                ${req.session.user.id} ${(function () { if (req.session.logged == true) { return '로그인됨' } else { return '로그인안됨' } })()}
                            </a>
                            <ul class="dropdown-menu">
                                <li>${(function () { if (req.session.logged != true) { return `<a href="/login">로그인</a>` } else { return `<a href="/logout">로그아웃</a>` } })()}</li>
                            </ul></li>`;
    var reqpath = decodeURI(req.path);
    var docname = reqpath.replace('wiki', '').replace('/', '').replace('/', '');
    if (docname.includes(":")) {
        var namespace = getnamespace(docname);
        docname = docname.replace(namespace + ":", "");

        if (namespace == '사용자' && docname != req.session.user.id) {
            return res.end(`<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>다른사람 사용자 문서 편집 못합니다</body></html>`);
        }
        var messageandbody = wikieditmessage2(namespace + ":" + docname);
        console.log(temps);
        res.render('editor_template', { info: { docname: namespace + ":" + docname.replace("/", "").replace("/", ""), message: messageandbody.message.replace("docs", ""), content: messageandbody.content, type: "wiki", admin: req.session.user.isadmin, navbar: navbarTemplate(), me: me, temps: temps } });
    } else {
        var messageandbody = wikieditmessage(reqpath.replace('wiki', '').replace('/', '').replace('/', ''));
        console.log(temps);
        res.render('editor_template', { info: { docname: reqpath.replace('edit', '').replace('/', '').replace('/', '').replace("docs", "").replace("/", "").replace("/", ""), message: messageandbody.message.replace("docs", ""), content: messageandbody.content, type: "wiki", admin: req.session.user.isadmin, navbar: navbarTemplate(), me: me, temps: temps } });
    }
});
app.post('/editreq', function (req, res) {
    if (req.session.user.banned == true || bannedips.banned.includes(req.session.user.id.replace('ffff', ``).replaceAll(`:`, ``))) {
        return res.end(`sorry, you're banned.`);
    }
    var docname = decodeURI(req.query.docname);
    if (docname.includes(`:`)) {
        var namespace = getnamespace(docname);
        docname = docname.replace(namespace + ":", "");
        if (namespace == '사용자' && docname != req.session.user.id) {
            return res.end(`<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>다른사람 사용자 문서 편집 못합니다</body></html>`);
        }
        if (!exists2(`../forwiki/wiki/${namespace}/${docname}`)) {
            console.log(exists2(`../forwiki/wiki/${namespace}/${docname}`));
            fs.mkdirSync(`../forwiki/wiki/${namespace}/${docname}`);
            console.log();
            fs.mkdirSync(`../forwiki/wiki/${namespace}/${docname}/history`);
        }
        fs.writeFile(`../forwiki/wiki/${namespace}/${docname}/index`, htmlfunc(req.body['hiddeninput']), function (err) {
            if (err) {
                console.log(err);
            } else {
            }
        });
        if (namespace != '사용자') {
            fs.writeFile(`../forwiki/wiki/${namespace}/${docname}/history/${Math.ceil((fs.readdirSync(`../forwiki/wiki/${namespace}/${docname}/history`).length - (fs.readdirSync(`../forwiki/wiki/${namespace}/${docname}/history`).length % 2)) / 2)}`, htmlfunc(req.body['hiddeninput']), function (err) {
                if (err) {
                    console.log(err);
                }
            });
            fs.writeFile(`../forwiki/wiki/${namespace}/${docname}/history/${Math.ceil((fs.readdirSync(`../forwiki/wiki/${namespace}/${docname}/history`).length - (fs.readdirSync(`../forwiki/wiki/${namespace}/${docname}/history`).length % 2)) / 2)}_meta`, JSON.stringify({ date: `${new Date().getFullYear()}년 ${new Date().getMonth() + 1}월 ${new Date().getDate()}일 ${new Date().getHours()}시 ${new Date().getMinutes()}분 ${new Date().getSeconds()}초 ${new Date().getMilliseconds()}밀리초`, id: req.session.user.id, }), function (err) {
                if (err) {
                    console.log(err);
                }
            });
        }
        recentlyedited.push({ docname: namespace + ':' + docname, editor: req.session.user, date: `${new Date().getFullYear()}년 ${new Date().getMonth() + 1}월 ${new Date().getDate()}일 ${new Date().getHours()}시 ${new Date().getMinutes()}분 ${new Date().getSeconds()}.${new String(new Date().getMilliseconds() / 1000).replace('0.', '')}초` });
        res.redirect(`/wiki/${namespace}:${docname}`);
        updaterecedits();
    } else {
        if (!exists2(`../forwiki/wiki/docs/${docname}`)) {
            fs.mkdirSync(`../forwiki/wiki/docs/${docname}`);
            fs.mkdirSync(`../forwiki/wiki/docs/${docname}/history`);
        }
        fs.writeFile(`../forwiki/wiki/docs/${docname}/index`, htmlfunc(req.body['hiddeninput']), function (err) {
            if (err) {
                console.log(err);
            }
        });
        if (namespace != '사용자') {
            fs.writeFile(`../forwiki/wiki/docs/${docname}/history/${Math.ceil((fs.readdirSync(`../forwiki/wiki/docs/${docname}/history`).length - (fs.readdirSync(`../forwiki/wiki/docs/${docname}/history`).length % 2)) / 2)}`, htmlfunc(req.body['hiddeninput']), function (err) {
                if (err) {
                    console.log(err);
                }
            });
            fs.writeFile(`../forwiki/wiki/docs/${docname}/history/${Math.ceil((fs.readdirSync(`../forwiki/wiki/docs/${docname}/history`).length - (fs.readdirSync(`../forwiki/wiki/docs/${docname}/history`).length % 2)) / 2)}_meta`, JSON.stringify({ date: `${new Date().getFullYear()}년 ${new Date().getMonth() + 1}월 ${new Date().getDate()}일 ${new Date().getHours()}시 ${new Date().getMinutes()}분 ${new Date().getSeconds()}초 ${new Date().getMilliseconds()}밀리초`, id: req.session.user.id, }), function (err) {
                if (err) {
                    console.log(err);
                }
            });
        }
        recentlyedited.push({ docname: docname, editor: req.session.user, date: `${new Date().getFullYear()}년 ${new Date().getMonth() + 1}월 ${new Date().getDate()}일 ${new Date().getHours()}시 ${new Date().getMinutes()}분 ${new Date().getSeconds()}.${new String(new Date().getMilliseconds() / 1000).replace('0.', '')}초` });
        res.redirect(`/wiki/${docname}`);
        updaterecedits();
    }
});
app.get('/docs', function (req, res) {
    var docs = fs.readdirSync(`../forwiki/wiki/docs`);
    var categories = fs.readdirSync(`../forwiki/wiki/분류`);
    var templatesfiles = fs.readdirSync(`../forwiki/wiki/틀`);
    var cgrwikis = fs.readdirSync(`../forwiki/wiki/CommonWiki`);
    var list = [];
    docs.forEach(function (val, idx, arr) {
        list.push(`<a href="/wiki/${val}">${val}</a>`);
    });
    categories.forEach(function (val, idx, arr) {
        list.push(`<a href="/wiki/분류:${val}">분류:${val}</a>`);
    });
    templatesfiles.forEach(function (val, idx, arr) {
        list.push(`<a href="/wiki/틀:${val}">틀:${val}</a>`);
    });
    cgrwikis.forEach(function (val, idx, arr) {
        list.push(`<a href="/wiki/CommonWiki:${val}">CommonWiki:${val}</a>`);
    });
    var newlist = [];
    list.forEach(function (val, idx, arr) {
        if (idx < 400) {
            newlist.push(val);
        } else {
            return;
        }
    });
    res.render('list_temp', { info: { doclist: newlist } });
});
app.use(`/history`, function (req, res) {
    var docname = decodeURI(req.path);
    var revision = decodeURI(req.query.r);
    var namespace = "docs";
    var me = `<li class="nav-item dropdown mymenu"><a class="dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                ${req.session.user.id} ${(function () { if (req.session.logged == true) { return '로그인됨' } else { return '로그인안됨' } })()}
                            </a>
                            <ul class="dropdown-menu">
                                <li>${(function () { if (req.session.logged != true) { return `<a href="/login">로그인</a>` } else { return `<a href="/logout">로그아웃</a>` } })()}</li>
                            </ul></li>`;
    if (docname.includes(":")) {
        namespace = getnamespace(docname);
    }
    if (fs.existsSync(`../forwiki/wiki/${namespace}/${docname.replace(`history`, ``).replace(`/`, ``).replace(`/`, '').replace(namespace.replace("/", ""), "").replace(":", "")}/history/${revision}`) || revision == 'justlist') {


        if (revision == 'justlist') {
            var newcontent = (function () {
                var rtv = ``;
                var dataab = fs.readdirSync(`../forwiki/wiki/${namespace}/${docname.replace(`history`, ``).replace(`/`, ``).replace(`/`, '').replace(namespace.replace("/", ""), "").replace(":", "")}/history`);
                var dataa = (function () {
                    var rtv2 = [];
                    dataab.forEach(function (val, idx, arr) {
                        if (!isNaN(parseInt(Number(val)))) {
                            rtv2.push(val);
                        }
                    });
                    return rtv2;
                })();
                var datab = [];
                for (var i = 0; i < dataa.length; i++) {
                    datab[datab.length] = {
                        meta: (function () {
                            var rtv2 = {};
                            dataa.forEach(function (val, idx, arr) {
                                if (idx == i) {
                                    var aaad = fs.readFileSync(`../forwiki/wiki/${namespace}/${docname.replace(`history`, ``).replace(`/`, ``).replace(`/`, '').replace(namespace.replace("/", ""), "").replace(":", "")}/history/` + new String(i) + '_meta').toString('utf-8');
                                    rtv2 = JSON.parse(aaad);
                                    return rtv2;
                                }
                            });
                            console.log(rtv2);
                            return rtv2;
                        })(), link: i,
                    }
                }
                datab.forEach(function (val, idx, arr) {
                    rtv += `<li><a href="/history${namespace}:${docname.replace(`history`, ``).replace(`/`, ``).replace(`/`, '').replace(namespace.replace("/", ""), "").replace(":", "")}?r=${val.link}">${val.link}번째 편집</a>${val.meta.id}에 의해 ${val.meta.date}에 편집됨</li>`
                });
                return rtv;
            })();
            res.render('basic_template', { info: { docname: docname.replace('wiki', '').replace('history', '').replace('/', '').replace('/', ''), message: "문서 역사 전체보기", content: `<ul>` + newcontent + `</ul>`, type: "history", admin: req.session.user.isadmin, navbar: navbarTemplate(), me: me } })
        } else {
            var data = fs.readFileSync(`../forwiki/wiki${namespace}/${docname.replace(`history`, ``).replace(`/`, ``).replace(`/`, '').replace(namespace.replace("/", ""), "").replace(":", "")}/history/${revision}`).toString('utf-8');
            if (data.includes("error") || data.includes("Error")) {
                res.status("404").send("404 not found")
            }
            var messageandbody = {
                message: revision + "판 문서(문서 역사)",
                content: data,
            }; res.render('basic_template', { info: { docname: docname.replace('wiki', '').replace('history', '').replace('/', '').replace('/', ''), message: messageandbody.message, content: messageandbody.content, admin: req.session.user.isadmin, type: "history", navbar: navbarTemplate(), me: me } });
        }
    } else {
        res.status(404).send("404 not found");
    }
});
app.use('/change', function (req, res) {
    var newname = decodeURI(req.query['to']);
    var oldname = decodeURI(req.path).replace('wiki', '').replaceAll('/', '');
    if (typeof newname == 'string' && newname != '') {
        var namespace = getnamespace(oldname).replaceAll('/', '');
        var newname0 = newname.replace(getnamespace(newname), '');
        if (!oldname.includes(':')) {
            namespace = 'docs';
        } else {
            newname = newname0;
            oldname = oldname.replace(namespace, '');
        }
        oldname = oldname.replaceAll('/', '');
        newname = newname.replaceAll('/', '');
        if (!fs.existsSync(`../forwiki/wiki/${namespace}/${newname}/`) && !(namespace == 'CommonWiki')) {
            fs.renameSync(`../forwiki/wiki/${namespace}/${oldname}/`, `../forwiki/wiki/${namespace}/${newname}`);
            res.end(`moving the name of the document was suceeded!!!<a href="/">go home</a>`)
        } else {
            res.end('failed: you could input illegal namespace to move doc. or document that has the same name can already exist.');
        }
    } else {
        res.end('failed');
    }
});
app.get('/tutorial', function (req, res) {
    var me = `<li class="nav-item dropdown mymenu"><a class="dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                ${req.session.user.id} ${(function () { if (req.session.logged == true) { return '로그인됨' } else { return '로그인안됨' } })()}
                            </a>
                            <ul class="dropdown-menu">
                                <li>${(function () { if (req.session.logged != true) { return `<a href="/login">로그인</a>` } else { return `<a href="/logout">로그아웃</a>` } })()}</li>
                            </ul></li>`;
    var messageandbody = {
        message: "",
        content: ""
    }
    res.render('tutorial', { info: { docname: "", message: messageandbody.message, content: messageandbody.content, admin: req.session.user.isadmin, type: "", navbar: navbarTemplate(), me: me } });
});
app.use(`/backlinks/`, function (req, res) {
    var docname = decodeURI(req.path);
    var namespace = "docs";
    if (docname.includes(":")) {
        namespace = getnamespace(docname).replace(`/`, ``).replace(`/`, ``);
        docname = docname.replace(namespace.replace(`/`, ``).replace(`/`, ``) + ':', ``);
    }
    var messageandbody = {
        message: docname.replace('wiki', '').replace('backlinks', '').replace('/', '').replace('/', '') + '의 역링크(역링크는 다른 문서에 걸린 이 문서의 링크를 의미합니다)',
        content: "",
    }
    var me = `<li class="nav-item dropdown mymenu"><a class="dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                ${req.session.user.id} ${(function () { if (req.session.logged == true) { return '로그인됨' } else { return '로그인안됨' } })()}
                            </a>
                            <ul class="dropdown-menu">
                                <li>${(function () { if (req.session.logged != true) { return `<a href="/login">로그인</a>` } else { return `<a href="/logout">로그아웃</a>` } })()}</li>
                            </ul></li>`;
    res.render('backlinks_template', { info: { docname: docname.replace('wiki', '').replace('backlinks', '').replace('/', '').replace('/', ''), message: docname, docs: getbacklinks(namespace.replaceAll(`:`, ``).replaceAll(`/`, ``) + ':' + docname), content: messageandbody.content, admin: req.session.user.isadmin, type: "history", navbar: navbarTemplate(), me: me } });
});
app.get(`/`, function (req, res) {
    res.redirect("/wiki/CommonWiki:대문");
});
app.get(`/login`, function (req, res) {
    res.render('login', { info: { docname: '', message: '', type: '', me: '', admin: false, } });
});
app.get(`/join`, function (req, res) {
    res.render('join', { info: { docname: '', message: '', type: '', me: '', admin: false, } });
});
app.post(`/joinreq`, function (req, res) {
    var willitend = false;
    userlist.users.forEach(function (val, idx, arr) {
        if (req.body['id'] == val.id) {
            willitend = true;
            return res.end('same username already exists');
        }
    });
    if (willitend == true) {
        return;
    }
    userlist.users.push({ id: req.body['id'], pw: req.body['pw'], isadmin: false, admin_level: 3, perm: { design: false }, banned: false });
    req.session.user = { id: req.body['id'], pw: req.body['pw'], isadmin: false, admin_level: 3, perm: { design: false }, banned: false };
    var id = req.body['id'];
    fs.mkdirSync(`../forwiki/wiki/사용자/${id}`);
    fs.writeFile(`../forwiki/wiki/사용자/${id}/index`, "", function (err) { if (err) console.log(err) });
    req.session.logged = true;
    res.redirect("/");
    userlistfunc();
});
app.get('/change_pw', function (req, res) {

    var me = `<li class="nav-item dropdown mymenu"><a class="dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                ${req.session.user.id} ${(function () { if (req.session.logged == true) { return '로그인됨' } else { return '로그인안됨' } })()}
                            </a>
                            <ul class="dropdown-menu">
                                <li>${(function () { if (req.session.logged != true) { return `<a href="/login">로그인</a>` } else { return `<a href="/logout">로그아웃</a>` } })()}</li>
                            </ul></li>`;
    if (req.session.logged == true) {
        res.render('change_pw', { info: { docname: '', message: '', type: '', me: me, admin: req.session.user.isadmin, } });
    } else {
        res.redirect('/login');
    }
});
app.post('/change_pwreq', function (req, res) {
    if (req.session.logged == true) {
        if (req.session.user.pw == req.body['cpw']) {
            req.session.user.pw = req.body['pw'];
            var succeeded = false;
            userlist.users.forEach(function (val, idx, arr) {
                if (val.id == req.session.user.id) {
                    userlist.users[idx] = req.session.user;
                    userlistfunc();
                    succeeded = true;
                    return;
                }
            });
            if (succeeded) {
                res.end(`succeeded <a href="/">HOME</a>`);
                return;
            }
        }
    }
    res.end(`failed <a href="/">HOME</a>`);
});
app.post(`/loginreq`, function (req, res) {
    userlist.users.forEach(function (val, idx, arr) {
        if (req.body['id'] == val.id && req.body['pw'] == val.pw) {
            req.session.user = val;
            req.session.logged = true;
            return;
        }
    });
    res.redirect("/");
});
app.get('/admin_page', function (req, res) {
    recentlyedited.forEach(function (val, idx, arr) {
        if (val.editor == undefined) {
            recentlyedited[idx].editor = {
                id: '?',
            }
        }
    });
    if (req.session.user.isadmin == true) {
        var newlist = recviewers;
        if (Array.isArray(newlist)) {
            newlist = newlist.reverse();
        }
        res.render('adminpage/admin_page', { info: { admin_page: { edit_recently: recentlyedited, members: userlist.users, admin_level: req.session.user.admin_level, perm: req.session.user.perm, recent_viewers: newlist, recsimple: getsimple(), isadmin: true } } })
    } else {
        res.end(`you don't have permission to access to admin page. you are not an admin`);
    }
});
app.get('/navbar_main_preview', function (req, res) {
    if (req.session.user.isadmin == true) {
        res.render('navbar', { info: { docname: "", type: "", admin: false, me: "", message: "", content: "" } });
    } else {
        res.end(`you don't have permission to view navigation bar of CommonWiki as an administrator`);
    }
});
app.get('/design', function (req, res) {
    if (req.session.user.isadmin == true) {
        res.render('adminpage/design', { info: { navbar: navbarTemplate() } });
    } else {
        res.end(`you don't have permission to design navigation bar of CommonWiki`);
    }
});
app.post('/designreq', function (req, res) {
    if (req.session.user.isadmin == true) {
        if (req.session.user.perm.design == true) {
            fs.writeFile(`../forwiki/wiki/navbar.ejs`, htmlfunc(req.body['hiddeninput']), function (err) {
                if (err) {
                    console.log(err);
                }
            });
        } else {

            res.end(`you are an admin, but you don't have permission to design navigation bar of CommonWiki`);
        }
    } else {

        res.end(`you don't have permission to design navigation bar of CommonWiki`);
    }
});
app.post('/stop_server', function (req, res) {
    if (req.session.user.isadmin == true) {
        if (req.session.user.admin_level < 1) {
            if (myserver != undefined) {
                console.log("closed");
                res.redirect("/");
                myserver.close();
            } else {
                res.redirect("/");
                console.log("not closed");
            }
        } else {
            res.end("you are an admin but your admin level is not 0. only level 0 admin can stop server");
        }
    } else {
        res.end(" you are not an admin.");
    }
});
app.get('/manage_member', function (req, res) {
    if (req.session.user.isadmin == true) {
        if (req.session.user.admin_level < 2) {
            res.render('adminpage/manage_member', { info: { members: userlist, is0admin: (req.session.user.admin_level < 1) } });
        } else {
            res.status(403).end("403 forbidden");
        }
    } else {
        res.end("you are not an admin");
    }
})
app.post('/manage_memberreq', function (req, res) {
    var willitberedirected = true;
    if (req.session.user.isadmin == true) {
        if (req.session.user.admin_level < 1) {
            if (req.body['type'] == 'level') {
                userlist.users.forEach(function (val, idx, arr) {
                    if (val.id == req.body['targetid']) {
                        userlist.users[idx].admin_level = Number(req.body['level']);
                        if (Number(req.body['level']) < 3) {
                            userlist.users[idx].isadmin = true;
                        }
                        res.end("your work has been successfully done.");
                        userlistfunc();
                        willitberedirected = false;
                        return;
                    }
                });
                if (willitberedirected == true) {
                    res.redirect("/");
                }
            } else if (req.body['type'] == 'ban') {
                if (req.body['targetid'][0] + req.body['targetid'][1] + req.body['targetid'][2] == `ip:`) {
                    bannedips.banned.push(req.body['targetid'].replace('ip:'));
                    bannedip();
                }
                userlist.users.forEach(function (val, idx, arr) {
                    if (val.id == req.body['targetid']) {
                        userlist.users[idx].banned = true;
                        res.end("your work has been successfully done.");
                        userlistfunc();
                        willitberedirected = false;
                        return;
                    }
                });
                if (willitberedirected == true) {
                    res.redirect("/");
                }
            } else if (req.body['type'] = 'makedesigner') {
                userlist.users.forEach(function (val, idx, arr) {
                    if (val.id == req.body['targetid']) {
                        userlist.users[idx].perm.design = true;
                        res.end("your work has been successfully done.");
                        userlistfunc();
                        willitberedirected = false;
                        return;
                    }
                });
                if (willitberedirected == true) {
                    res.redirect("/");
                }
            }
        } else {
            if (req.body['type'] == 'ban') {
                if (req.body['targetid'][0] + req.body['targetid'][1] + req.body['targetid'][2] == `ip:`) {
                    bannedips.banned.push(req.body['targetid'].replace('ip:'));
                    bannedip();
                }
                userlist.users.forEach(function (val, idx, arr) {
                    if (val.id == req.body['targetid'] && val.admin_level > 1) {
                        userlist.users[idx].banned = true;
                        res.end("your work has been successfully done.");
                        userlistfunc();
                        willitberedirected = false;
                        return;
                    }
                });
                if (willitberedirected == true) {
                    res.redirect("/");
                }
            }
        }
    } else {
        res.end(`fuck you. you are not admin. but you tried changing other members' admin_level.`);
        return;
    }
});
app.use(function (err, req, res, next) {
    if (err) {
        next(err);
    }
});
io.on('connection', function (socket) {
    socket.on('search_data', function (msg) {
        var search_keyword = msg.search_keyword;
        if (typeof search_keyword == 'string') {
            var docs_that_matches_searchKeyword = [];
            var docs = fs.readdirSync(`../forwiki/wiki/docs`);
            var categories = fs.readdirSync(`../forwiki/wiki/분류`);
            var templatesfiles = fs.readdirSync(`../forwiki/wiki/틀`);
            var cgrwikis = fs.readdirSync(`../forwiki/wiki/CommonWiki`);
            var list = [];
            docs.forEach(function (val, idx, arr) {
                list.push(val);
            });
            categories.forEach(function (val, idx, arr) {
                list.push('분류:' + val);
            });
            templatesfiles.forEach(function (val, idx, arr) {
                list.push('틀:' + val);
            });
            cgrwikis.forEach(function (val, idx, arr) {
                list.push('CommonWiki:' + val);
            });
            list.forEach(function (val, idx, arr) {
                if (val.toLowerCase().startsWith(search_keyword.toLowerCase(), 0)) {
                    docs_that_matches_searchKeyword.push(val);
                }
            });
            socket.emit('client_got_search_data', { data: docs_that_matches_searchKeyword });
        }
    });
});
myserver = httpServer.listen(80, function () {
    console.log("80번 포트에서 동작중");
});