// ==UserScript==
// @name        度盘密码自动化
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  自动拼接密码到网址，点击过的高亮显示
// @author       etng
// @match        *://fanxinzhui.com/rr/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=fanxinzhui.com
// @grant        GM_notification
// ==/UserScript==

(function() {
    'use strict';
    var $ = unsafeWindow.jQuery;
    $('a[href^="https://pan.baidu"]').each((k,v)=>{
        var a=$(v);
        var pswd = a.closest('span').find('a.password')
        a.attr('href', a.attr('href')+'?pwd='+pswd.text())
        pswd.hide()
        a.css('font-size', '24px')
    })
    $('a[href^="https://pan.baidu"]').click((e)=>{
        //e.preventDefault();
        $(e.target).css('color', '#f00')
    })
    GM_notification({text: `百度盘链接自动添加密码成功`, timeout: 800, onclick: function(){location.reload();}});
})();
