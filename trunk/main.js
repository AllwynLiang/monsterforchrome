/*
* Monster for Chrome v1.0.0
* http://ued.alipay.com/
*
* Copyright (c) 2010 Alipay UED
* Under the MIT licenses.
*
* Last-Modified: 2010-04-28 17:27:05 +0800
* Revision: 166
*/

var Monster = {};

/* 评分 */
Monster.score = 0;

/* 是否满足最低底线 */
Monster.touchdown = false;

/* 总分 */
Monster.original_score = 105.1;

Monster.outline = '2px solid red';

/* 正则 */
Monster.reg = {
    script: /<script[^>]*>[\s\S]*?<\/[^>]*script>/gi,
    comment: /<!--[\s\S]*?--\>/g,
    cssExpression: /expression[\s\r\n ]?\(/gi
};

/* 去除数组重复项 */
Monster.unique = function(arr){
	var uni = [], inUni = false;
	uni[0] = arr[0];
	for(var i = 1, l = arr.length; i < l; i++){
		inUni = false;
		// 查看当前第i个arr内容是否已存在与uni数组中
		for(var j = 0, k = uni.length; j < k; j++){
			if(arr[i] == uni[j]){
				inUni = true;
				break;
			}
		}
		if(!inUni){
			uni.push(arr[i]);
		}
	}
	return uni;
};

/* 返回数组重复项 */
Monster.dup = function(arr){
	var r = [];
	var uni = [];
	var inUni = false;
	uni[0] = arr[0];
	for(var i = 1, l = arr.length; i < l; i++){
		inUni = false;
		for(var j = 0, k = uni.length; j < k; j++){
			if(arr[i] == uni[j]){
				inUni = true;
				r.push(arr[i]);
				break;
			}
		}
		if(!inUni){
			uni.push(arr[i]);
		}
	}
	return r;
}

var handleBorderStyle = function (style) {
    this.css({
        'outline-style': (typeof (style) != 'undefined') ? style : CONFIG.eBdStyle
    });
};
var handleBorderWidth = function (width) {
    this.css({
        'outline-width': (typeof (width) != 'undefined') ? width + 'px' : CONFIG.eBdWidth + 'px'
    });
};
var handleBorderColor = function(color) {
	this.css({
		'outline-color': (typeof(color)!='undefined')?color:CONFIG.eBdColor
	});
};
Monster.addCssClass = function(obj,cssClass){
	if(obj.elems){
		var e = obj.elems;
		jQuery.each(e, function(i){
			var el = jQuery(this);
			el.addClass(cssClass);
		});
	}
}
Monster.addOutline = function (Info, cbd) {
    if (Info.elems) {
        var e = Info.elems;
        jQuery.each(e, function (i) {
            var el = jQuery(this);
            if (el.parent().css('background-color') != Monster.outlineColor) {
                getValue('eBdWidth', handleBorderWidth, el);
                getValue('eBdStyle', handleBorderStyle, el);
                getValue('eBdColor', handleBorderColor, el);
            }
            Monster.outline = el.css('outline');
        });
    }
}

Monster.removeOutline = function(Info){
	if(Info.elems){
		var e = Info.elems;
		jQuery.each(e, function(i){
			jQuery(this)[0].scrollIntoView();
			var otl = jQuery(this).css('outline');
			if(otl == Monster.outline){
				jQuery(this).css({
					'outline': '0'
				});
			}
		});
	}
}

Monster.getBytes = function(stream) {
	var stream = stream.replace(/\n/g, 'xx').replace(/\t/g, 'x');
	var escapedStr = encodeURIComponent(stream);
	return escapedStr.replace(/%[A-Z0-9][A-Z0-9]/g, 'x').length;
}
Monster.getSize = function (size) {
    return (size / 1024).toFixed(2);
}

/* 标识Monster是否被折叠 */
Monster.folded = false;

/* css文件计数器 */
Monster.cssCount = 0;

/* css文件的压缩计数器 */
Monster.cssMiniCount = 0;

/* js文件计数器 */
Monster.jsCount = 0;

/* js文件的压缩计数器 */
Monster.jsMiniCount = 0;

/* 标识Monster是否已经显示 */
Monster.isShown = false;

/* 查看当前使用xmlhttpRequest获取的html内容是否加载完成 */
Monster.htmlLoaded = false;

/* 查看当前使用xmlhttpRequest获取的CSS内容是否加载完成 */
Monster.cssLoaded = false;

/* CSS中使用import的个数 */
Monster.cssImport = 0;

/* CSS文件的流的地址 */
Monster.cssURL = [];
Monster.cssAllLoaded = [];
Monster.allChecked = [];
Monster.cssSize = 0;
Monster.data = {
    htm:[],
    css: [],
    js: []
};
jQuery('link[rel=stylesheet]').each(function (i) {
    if (/^\s*http/.test(this.href)) {
        Monster.cssURL.push(this.href);
    }
});
//将内嵌CSS添加进数组
jQuery('style:not(html>style)').each(function (i, el) {
    Monster.cssURL.push('#inline#' + i);
});

jQuery.each(Monster.cssURL, function(i){
	Monster.cssAllLoaded.push(false);
});

/* js文件的流地址 */
Monster.jsURL = [];
Monster.jsAllLoaded = [];
Monster.jsSize = []; //0;
jQuery('script[src]').each(function (i) {
    if (/^\s*http/.test(this.src)) {
        Monster.jsURL.push(this.src);
    }
});
jQuery.each(Monster.jsURL, function(i){
	Monster.jsAllLoaded.push(false);
});

Monster.block = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'dl', 'pre', 'blockquote', 'form', 'div', 'table', 'fieldset', 'address'];

/* 查看某一数组中的所有元素是否都是true，即检查所有相关文件是否均加载完成 */
Monster.all = function(arr){
	if(arr.length == 0){
		return true;
	}
	var r = false;
	for(var i = 0, l = arr.length; i < l; i++){
		if(arr[i] != true){
			r = false;
			break;
		}
		r = true;
	}
	return r;
}

/* 用于存放所有检测出的错误的列表 */
var liErr = [],

    /** 用于存放所有检测出的警告的列表 */
    liWarn = [], 

    /** 用于存放所有检测出的建议的列表 */
    liSug = [];

function Err(m, elems, cssClass){
	/* 出错信息 */
	this.message = m;
	/* 出错的标签 */
	this.elems = elems;
	/* 出错的元素CSS Class */
	this.cssClass = cssClass;
}

function Warn(m, elems, cssClass){
	this.message = m;
	this.elems = elems;
	this.cssClass = cssClass;
}

function Sug(m, elems, cssClass){
	this.message = m;
	this.elems = elems;
	this.cssClass = cssClass;
}

/* 检测混合在<body>标签中的script与style标签 */
function check_body_mixed(arr) {

    jQuery('.mst-main').animate({ "left": "-795" }, 'fast', function () {
        jQuery(arr).each(function (i, el) {
            var htm = el.innerHTML || el.src || el.href;
            jQuery(el).html('');
            jQuery('<div><span title="show">' + (i + 1) + '</span><em class="mst-hide" title="close"></em><div class="mst-body-mixed-ctr mst-hide" contenteditable="true">' + htm + '</div></div>').appendTo(el);
            jQuery(el).addClass("mst-body-mixed");
            jQuery(el).animate({ 'height': 'toggle' }, 'fast').css({ 'left': i * 100 + 50 });
            jQuery(el).draggable({ 'cursor': 'move' });
            jQuery('span', el).click(function () {
                jQuery(this).addClass('mst-hide');
                jQuery('em', el).removeClass('mst-hide');
                jQuery('.mst-body-mixed-ctr', el).removeClass('mst-hide');
            });
            jQuery('em', el).click(function () {
                jQuery('em', el).addClass('mst-hide');
                jQuery('span', el).removeClass('mst-hide');
                jQuery('.mst-body-mixed-ctr', el).addClass('mst-hide');
            });
        });
        jQuery('.mst-main').one('mouseover', function () {
            jQuery(this).animate({ "left": "100" }, 'fast');
            jQuery(arr).each(function (i, el) {
                jQuery(el).animate({ 'height': 'hide' }, 'fast');
            });
        });
    });
}

/* MAX_SCRIPT_NUM */
function max_script_num(n){
	var num = 0;
	jQuery('script').each(function(i){
		if(this.src){
			num++;
		}
	});
	if(num > n){
		var m = '外部Script文件达到了 '+ num + ' 个, 请限制在' + n + '个以内';
		var e = new Warn(m);
		liWarn.push(e);
	}
    if (num <= 3) {
		Monster.score += 7.4;
	}
	else if(num == 4){
		Monster.score += 5;
	}
	else if(num == 5){
		Monster.score += 2.5;
	}
}


/* CHECK_HTTP_HTTPS */
function check_http_https(){
	if(!/^https/.test(location.href)){
		Monster.score += 3.6;
		return;
	}
	var num = 0;
	var elems = [];
	var relate = ['iframe', 'img', 'embed'];
	jQuery.each(relate, function (i) {
        var tag = relate[i];
	    jQuery(tag).each(function (j) {
	        var v = this.getAttribute('src');
	        if (tag == 'embed') {

	            if (v != null) {
	                if (!/^\s*https:/.test(v)) {
	                    num++;
	                    elems.push(this);
	                }
	            };

	        } else {
	            if (!v || !/^\s*https:/.test(v)) {
	                num++;
	                elems.push(this);
	            }
	        }

	    });
	});
	if(num > 0){
		var m = '★  有 ' + num + '个标签必须添加 src 属性且必须使用 https 协议';
		var e = new Err(m, elems, 'CHECK_HTTP_HTTPS');
		liErr.push(e);
		Monster.addCssClass(e, 'CHECK_HTTP_HTTPS');
		//Monster.addOutline(e);
		Monster.touchdown = true;
	}
	else{
		Monster.score += 3.6;
	}
}

/* CHECK_STYLE_POS */
function check_style_pos(){
    var num = 0;
    var eles = [];
    jQuery('body style').each(function (i) {
        if (jQuery(this).parent().get(0).nodeName.toLowerCase() != 'head') {
            num++;
            eles.push(this);
        }
    });
    jQuery('body link[rel=stylesheet]').each(function (i) {
        if (jQuery(this).parent().get(0).nodeName.toLowerCase() != 'head') {
            num++;
            eles.push(this);
        }
    });
	if(num > 0){
	    var m = '★  有 ' + num + '处 CSS 或 link[rel=stylesheet] 直接定义在〈body〉里 <a href="#" id="ViewBodyStyle">详细</a>';
		var e = new Err(m);
		liErr.push(e);
		Monster.touchdown = true;

		jQuery('#ViewBodyStyle').live('click', function () {
		    check_body_mixed(eles);
		    return false;
		});
	}
	else{
		Monster.score += 2.5;
	}
}

/* CHECK_SCRIPT_POS */
function check_script_pos(){
    var num = 0;
    var eles = [];

    jQuery('script').each(function (i, el) {
        if (jQuery(el).parent().get(0).nodeName.toLowerCase() == 'head') {

        } else {
            var ns = jQuery(el).nextAll(":not(script)");
            if (ns.get(0)) {
                if (ns.get(0).id == 'monster_main') {

                } else {
                    num++;
                    eles.push(this);
                }
            }
        }
    });
    /*jQuery('script').each(function (i) {
        // 获取parent
        var p = jQuery(this).parent().get(0);

        if (p.nodeName.toLowerCase() == 'body') {
            if (jQuery(this).next() && jQuery(this).next().get(0) && jQuery(this).next().get(0).nodeName.toLowerCase() != 'script') {
                num++;
                eles.push(this);
            }
        }
        else if (p.nodeName.toLowerCase() != 'head') {
            num++;
            eles.push(this);
        }
    });*/
	if(num > 0){
	    var m = '有 ' + num + '处 script 标签 混合在HTML中间 <a href="#" id="ViewBodyJS">详细</a>';
		var e = new Err(m);
		liErr.push(e);

		jQuery('#ViewBodyJS').live('click', function () {
		    check_body_mixed(eles);
		    return false;
		});
	}
	else{
		Monster.score += 4.5;
	}
}

/* CHECK_ENCODING */
function check_encoding(){
    var c = document.characterSet.toLowerCase();
	if(c.indexOf('utf-8') == -1 && c.indexOf('gbk') == -1){
	    var m = '文档的必须使用 UTF-8 或 GBK 编码';
		var e = new Err(m);
		liErr.push(e);
	}
	else{
		Monster.score += 2.6;
	}
}

/* MAX_LINKSTYLE_NUM */
function max_linkstyle_num(n){
	var num = jQuery('link').filter("[rel=stylesheet]").length;
	if(num > n){
		var m = '外部 StyleSheet 引用达到了 '+ num + ' 个, 应当限制为' + CONFIG.MAX_LINKSTYLE_NUM + '个以内';
		var e = new Warn(m);
		liWarn.push(e);
	}
	if(num <= 2){
		Monster.score += 7;
	}
	else if(num == 3){
		Monster.score += 4.7;
	}
	else if(num == 4){
		Monster.score += 2.4;
	}
}

/** CHECK_STYLE_MEDIA */
function check_style_media(){
	var num = 0;
	var linkStyle = jQuery('link').filter("[rel=stylesheet]").each(function(i){
		if(jQuery(this).attr('media') == ""){
			num++;
		}
	});
	if(num > 0){
		var m = '★  有 '+num+' 个 link style 元素没有添加 media 属性';
		var e = new Warn(m);
		liWarn.push(e);
		Monster.touchdown = true;
	}
	else{
		Monster.score += 2.1;
	}
}

/* MAX_CSSIMG_NUM */
function max_cssimg_num(n){
	var num, bg = [], ubg = [],url=[];
	jQuery('*', jQuery('body')).each(function (i) {
	    var bgimg = jQuery(this).css('background-image');
	    if (bgimg && bgimg != "none") {
	        if (bgimg.indexOf('chrome-extension:') == -1) {     //Ignore Chrome extension elements background-image 04-21
	            bg.push(bgimg);
	            url.push(bgimg.substring(bgimg.indexOf('(') + 1, bgimg.indexOf(')')));
	        }
	    }
	});
	ubg = Monster.unique(bg);
	num = ubg.length;
	if (num > n) {
	    var m = '外部 CSS 图片引用达到了 ' + num + ' 个, 应当限制为' + CONFIG.MAX_CSSIMG_NUM + '个以内 <a href="#" rel="' + ubg.join('|') + '" class="ViewCSSBgImg">详细</a>';
	    var e = new Warn(m);
	    liWarn.push(e);
	}
	var urlarr = Monster.unique(url);
	if (urlarr.length > 1) check_404(urlarr, 'img');
	if(num <= 6){
		Monster.score += 8.7;
	}
	else if(num >= 7 && num <= 10){
		Monster.score += 6.5;
	}
	else if(num >= 11 && num <= 15){
		Monster.score += 4.3;
	}
	else if(num >= 15 && num <= 19){
		Monster.score += 2.1;
	}
}

/* CHECK_LOWER_CASE */
function check_lower_case(){

}

/* BANNED_ELEMENT_TYPE */
function banned_element_type(){
	var haveBan = false;
	var elems = CONFIG.BANNED_ELEMENT_TYPE;
	for(var i = 0, l = elems.length; i < l; i++){
		var ifElem = jQuery(elems[i]);
		if(ifElem.length > 0){
			haveBan = true;
			var m = '★ 请不要使用HTML5不再支持的〈' + elems[i] + '〉标签';
			var e = new Err(m, ifElem, 'BANNED_ELEMENT_TYPE');
			liErr.push(e);
			//Monster.addOutline(e);
			Monster.addCssClass(e,'BANNED_ELEMENT_TYPE');
			Monster.touchdown = true;
		}
	}
	if(!haveBan){
		Monster.score += 2.7;
	}
}

/* CHECK_TITLE_INHEAD */
function check_title_inhead(){
	var title = jQuery('head title');
	if(title.length != 1){
	    var m = '★  head 标签中必须有且仅有一个〈title〉标签';
		var e = new Err(m);
		liErr.push(e);
		Monster.touchdown = true;
	}
	else{
		Monster.score += 1.6;
	}
}

/* CHECK_FIRST_INHEAD */
function check_first_inhead() {
	var hfirst = jQuery('head').children().get(0);
	var chr = hfirst.getAttribute('charset');

	if (chr) {
	    //html5的编码声明
	    Monster.score += 1.4;

	} else {
    	if (hfirst.nodeName.toLowerCase() != 'meta' || !hfirst.getAttribute('http-equiv') || !hfirst.getAttribute('content')) {
    	    var m = '★  head 标签的第一个子标签必须指定网页编码，如：〈meta http-equiv="Content-Type" content="text/html; charset=utf-8" /〉';
    	    var e = new Err(m);
    	    liErr.push(e);
    	    Monster.touchdown = true;
    	} else {
    	    Monster.score += 1.4;
    	    
        }
	};
}

/** CHECK_INLINE_JS */
function check_inline_js() {
	var num = 0;
	var elems = [];
	jQuery('body, body *').each(function (i) {
	    if (this.getAttribute('onclick') || this.getAttribute('onblur') || this.getAttribute('onchange') || this.getAttribute('oncontextmenu') || this.getAttribute('ondblclick') || this.getAttribute('onfocus') || this.getAttribute('onkeydown') || this.getAttribute('onkeypress') || this.getAttribute('onkeyup') || this.getAttribute('onmousedown') || this.getAttribute('onmousemove') || this.getAttribute('onmouseout') || this.getAttribute('onmouseover') || this.getAttribute('onmouseup') || this.getAttribute('onresize') || this.getAttribute('onscroll') || this.getAttribute('onload') || this.getAttribute('onselect') || this.getAttribute('onsubmit')) {
	        num++;
	        elems.push(this);
	    }
	});
	if(num > 0){
	    var m = '请不要使用直接在标签上添加 inline javascript 事件属性';
		var e = new Err(m, elems, 'CHECK_INLINE_JS');
		liErr.push(e);
		Monster.addCssClass(e, 'CHECK_INLINE_JS');
		//Monster.addOutline(e);
	}
	else{
		Monster.score += 4.1;
	}
}

/* CHECK_IMG_ALT */
function check_img_alt(){
	var num = 0;
	var elems = [];
	jQuery('img').each(function(i){
		if(jQuery(this).attr("alt") == ""){
			num++;
			elems.push(this);
		}
	});
	if(num > 0){
	    var m = '★  有 ' + num + ' 个 img 标签未设置 alt 属性或该属性为空';
		var e = new Err(m, elems, 'CHECK_IMG_ALT');
		liErr.push(e);
		Monster.addCssClass(e, 'CHECK_IMG_ALT');
		//Monster.addOutline(e);
		Monster.touchdown = true;
	}
	else{
		Monster.score += 1.8;
	}
}

/* CHECK_SUBMIT_INFORM */
function check_submit_inform(){
	var num = 0;
	var elems = [];
	jQuery('form').each(function(i){
		if(jQuery('input[type=submit]', this).length != 1){
			num++;
			elems.push(this);
		}
	});
	if(num > 0){
	    var m = '有 ' + num + ' 个 form 标签没有添加 type 为 submit 的 input 标签';
		var e = new Warn(m, elems, 'CHECK_SUBMIT_INFORM');
		liWarn.push(e);
		Monster.addCssClass(e, 'CHECK_SUBMIT_INFORM');
		//Monster.addOutline(e);
	}
	else{
		Monster.score += 1.7;
	}
}

function check_input_hidden_pos() {
    var num = 0;
    var elems = [];
    jQuery('input[type=hidden]').each(function (i, el) {
        var pe = jQuery(this).nextAll(":not(input[type=hidden])");
        if (pe.get(0)) {
            var pn = pe.get(0).nodeName.toLowerCase();
            if (pn == 'table') {
                num++;
                elems.push(pe.get(0));
            }
        }
    });
    if (num > 0) {
        var m = '有 ' + num + ' 个 input[type=hidden] 可能嵌套在 tr、thead、tbody、table标签中间';
        var e = new Warn(m, elems, 'CHECK_INPUT_HIDDEN');
        liWarn.push(e);
        Monster.addCssClass(e, 'CHECK_INPUT_HIDDEN');
    }
}

function check_include_once() {
    var css = Monster.dup(Monster.cssURL);
    var js = Monster.dup(Monster.jsURL);
    if (css.length != 0) {
        var m = 'CSS 文件重复调用，它们是' + Monster.unique(css).join('，');
        var e = new Warn(m);
        liWarn.push(e);
    }
    if (js.length != 0) {
        var m = 'JS 文件重复调用，它们是' + Monster.unique(js).join('，');
        var e = new Warn(m);
        liWarn.push(e);
    }
}

/* CHECK_LABEL */
function check_label(){
	var num = 0;
	var elems = [];
	jQuery('form input, form select, form textarea, form button').each(function(i){
		if(this.type=="hidden"){
			return;
		}
		if(this.id == ""){
			num++;
			elems.push(this);
		}
		else if(jQuery(this).closest('form').find('label[for='+this.id+']').length != 1){
			num++;
			elems.push(this);
		}
	});
	if(num > 0){
	    var m = '★  有 ' + num + ' 个 表单内标签没有添加对应的 label 标签';
		var e = new Warn(m, elems, 'CHECK_LABEL');
		liWarn.push(e);
		Monster.addCssClass(e, 'CHECK_LABEL');
		//Monster.addOutline(e);
		Monster.touchdown = true;
	}
	else{
		Monster.score += 2.5;
	}
}

/* MAX_ELEMENT_NUM */
function max_element_num(){
	var num = jQuery('*').length;
	if(num > CONFIG.MAX_ELEMENT_NUM){
	    var m = '在当前文档中总共使用了 ' + num + ' 个标签，超出了最大标签 ' + CONFIG.MAX_ELEMENT_NUM + ' 个的限制';
		var e = new Warn(m);
		liWarn.push(e);
	}
	else{
		Monster.score += 2.8;
	}
}

function check_compat_mode(html5dtd) {

    if (html5dtd == 'html5') {
        if (document.doctype) {

            if (document.doctype.name == 'html') {
                Monster.score += 1;
            } else {
                if (Monster.data.htm[0].indexOf('<!DOCTYPE HTML>') != -1) {
                    Monster.score += 1;
                }else{
                    var m = '文档 doctype不为 〈!DOCTYPE html〉，请检查doctype';
                    var e = new Warn(m);
                    liWarn.push(e);
                }
            }
            
        } else {
            var m = '文档 doctype为 null，请检查doctype';
            var e = new Warn(m);
            liWarn.push(e);
        }
    } else {
        if (document.compatMode == 'BackCompat') {
            var m = '文档 compatMode 为 BackCompat，doctype为 ' + document.doctype + '，请检查doctype';
            var e = new Warn(m);
            liWarn.push(e);
        } else {
            Monster.score += 1;
        }
    }
}

function check_html_word() {
    /*
    var tc = document.body.innerText;
    if (tc.indexOf('<') != -1) {
    var m = '内容中出现了小于号 (〈) 用于定义 HTML 标签的开始。请在源码中使用字符实体：&amp;lt; <a href="#" onclick="window.find(\'<\');return false;">详细</a>';
    var e = new Warn(m);
    liWarn.push(e);
    }
    if (tc.indexOf('>') != -1) {
    var m = '内容中出现了大于号 (〉) 用于定义 HTML 标签的结束。请在源码中使用字符实体：&amp;gt;<a href="#" onclick="window.find(\'>\');return false;">详细</a>';
    var e = new Warn(m);
    liWarn.push(e);
    }
    */
}

/* CHECK_CSS_EXPRESSION */
function check_css_expression(str, i) {
    var reg = Monster.reg.cssExpression;
    var mat = str.match(reg);
    if (mat) {
        var m = Monster.cssURL[i].replace(/#inline#/g, '〈style〉') + '中使用了 ' + mat.length + '次 expression';
        var e = new Warn(m);
        liWarn.push(e);
    } else {
        if (i == Monster.cssURL.length - 1) { Monster.score += 4.6; }
        
    }
}

/* CHECK_COOKIE_SIZE */
function check_cookie_size() {
    try{
        var ck = document.cookie;
        var s = Monster.getBytes(ck);
        var size = Monster.getSize(s);
        if (size >= 30) {
            var m = '当前Cookie大小为 ' + size + 'KB，请限制在 ' + max + 'KB 以内';
            var e = new Warn(m);
            liWarn.push(e);

        } else if (size >=15) {
            Monster.score += 3.2;
        }else{
            Monster.score += 5.8;
        }

    }catch(e){
    }
}

/* 404 */
function check_404(arr,type) {
    jQuery(arr).each(function (i, el) {

        if (type == 'img') {
            var img = new Image();
            img.src = el;
            img.onerror = function () {
                var idx = jQuery('.mst-body-mixed-err').length;
                jQuery('<div class="mst-body-mixed mst-body-mixed-err"><span title="show">404</span><em class="mst-hide" title="close"></em><div class="mst-body-mixed-ctr mst-hide" contenteditable="true">' + ((el != '') ? el : 'background:url()') + '</div></div>').appendTo(document.body).draggable({ 'cursor': 'move' }).css({ 'left': idx * 160 + 5 }).animate({ 'top': window.innerHeight }, 'fast').animate({ 'top': 600 }, 'fast').animate({ 'top': 650 }, 'fast');
            }

        } else {

            chrome.extension.sendRequest({ action: 'static', sUrl: el, idx: i }, function (response) {
                if (response.err) {
                    var m = '请求的资源 ' + response.url + ' 不存在 状态码：404';
                    var e = new Warn(m);
                    liWarn.push(e);
                }
            });

        }
    });
}

/* BAN_CSS_IMPORT */
function ban_css_import(){
	jQuery('style').each(function(i){
		if(/@import/.test(this.innerHTML)){
			Monster.cssImport++;
		}
	});
}

/* NO_ID_SUBMIT */
function no_id_submit(){
	var num = 0;
	var elems = [];
	if(jQuery('#submit').length != 0){
		num++;
		var m = '★  至少有 ' + num + ' 个标签的 id 设置为 submit，该 id 值被禁止';
		var e = new Err(m, jQuery('#submit'), 'NO_ID_SUBMIT');
		liErr.push(e);
		Monster.addCssClass(e, 'NO_ID_SUBMIT');
		//Monster.addOutline(e);
		Monster.touchdown = true;
	}
	else{
		Monster.score += 1.5;
	}
}

/* NO_DUP_ID */
function no_dup_id(){
	var ids = [];
	var elems = [];
	jQuery('*').each(function(i){
		if(this.id && this.id != ""){
			ids.push(this.id);
		}
	});
	var dups = Monster.dup(ids);
	if(dups.length != 0){
		/* 重复的id值*/
		var uid = Monster.unique(dups);
		jQuery.each(uid, function(i){
			elems.push(jQuery('#'+uid).get(0));
		});
		var m = '★  有 '+dups.length+' 处的 id 值重复了';
		var e = new Err(m, elems, 'NO_DUP_ID');
		liErr.push(e);
		Monster.addCssClass(e, 'NO_DUP_ID');
		//Monster.addOutline(e);
		Monster.touchdown = true;
	}
	else{
		Monster.score += 1.5;
	}
}

/* 所有的需要获取到html文档字符流的检测函数 */

function checkHTML(r) {
	var t = r;
		Monster.htmlLoaded = true;
		/* CHECK_FORM_INFORM */
		function check_form_inform(){
			var pass = true;
			var pa;
			var r = /<form[^>]*>(.*?)<\/form>/g;
			while((pa = r.exec(t)) != null){
				if(/<form>/.test(pa[1])){
					pass = false;
				}
			}
			if(!pass){
				var m = '★  禁止在 form 元素中嵌套 form 元素';
				var e = new Err(m);
				liErr.push(e);
				Monster.touchdown = true;
			}
			else{
				Monster.score += 3.2;
			}
		}

		check_form_inform();
		/* BAN_BLOCKIN_INLINE */
		function ban_blockin_inline(){
			//是否通过检验
			var pass = true;
			/* 传入某一父元素标签，禁止在该父元素标签中添加block元素 */
			function verify_content(tag, childTag){
				var pa;
				var r = new RegExp("<" + tag + "[^>]*>(.*?)<\\/" + tag + ">", "g");
				var r2 = new RegExp("<" + childTag + ">");
				while((pa = r.exec(t)) != null){
					if(r2.test(pa[1])){
						return false;
					}
				}
				return true;
			}
			var num = 0;
			var elems = [];
			jQuery.each(Monster.block, function(i){
				if(!verify_content('a', Monster.block[i]) || !verify_content('p', Monster.block[i]) || !verify_content('pre', Monster.block[i])){
					pass = false;
				}
			});
			if(!pass){
			    var m = '★  禁止在 a, p, pre 标签中使用了块级元素作为子标签';
				var e = new Err(m);
				liErr.push(e);
				Monster.touchdown = true;
			}
			else{
				Monster.score += 2.5;
			}
		}

		ban_blockin_inline();
		/* CHECK_HTML_MINIFY */
		function check_html_minify(){
			var lines = t.split(/\n/);
			var average_length_perline = t.length / lines.length;
			if(average_length_perline < 150){
				var m = 'html 文档没有压缩或压缩力度不够';
				var e = new Warn(m);
				liWarn.push(e);
			}
			else{
				Monster.score += 8.2;
			}
		}
		check_html_minify();

		/* CHECK_HTML_SIZE */
		function check_html_size(){
			var s = (Monster.getBytes(t) / 1024).toFixed(2) ;
			var m = 'html 文档的大小为 ' +s +' KB';
			var e = new Sug(m);
			liSug.push(e);
		}
		check_html_size();

}

function checkCSS(r, i, s, d) {

        check_css_expression(r, i);
        
		var t = r;
		Monster.cssAllLoaded[i] = true;
		Monster.cssCount++;

		/* CHECK_CSS_MINIFY */
		function check_css_minify() {
			var lines = t.split(/\n/);
			var average_length_perline = t.length / lines.length;
			if(lines.length > 10 && average_length_perline < 100){
				Monster.cssMiniCount++;
			}
			if(Monster.cssCount == Monster.cssURL.length && Monster.cssMiniCount > 0){
				var m = '有 '+Monster.cssMiniCount+' 个 CSS 文档没有压缩或压缩力度不够';
				var e = new Warn(m);
				liWarn.push(e);
			}
            if (Monster.cssCount == Monster.cssURL.length && Monster.cssMiniCount == 0) {
                Monster.score += 8.2;
			}
		}
		check_css_minify();

		/* CHECK_CSS_SIZE */
		function check_css_size(sz){
			var s = Monster.getBytes(t);
			Monster.cssSize += (typeof (sz) != 'undefined')?sz:s;
			if(Monster.cssCount == Monster.cssURL.length){
			    var size = Monster.getSize(Monster.cssSize);
				var m = 'CSS 文档的总大小为 ' +size +' KB，不包含 import 语句导入的 CSS 文件';
				var e = new Sug(m);
				liSug.push(e);
			}
		}

		check_css_size(s);

		/* BAN_CSS_IMPORT */
		function ban_css_import(){
			if(/@import/.test(t)){
				Monster.cssImport++;
			}
			if(Monster.cssCount == Monster.cssURL.length && Monster.cssImport > 0){
				var m = '★  有 '+Monster.cssImport+' 处使用了 @import 语句，禁止使用该语句导入 CSS';
				var e = new Err(m);
				liErr.push(e);
				Monster.touchdown = true;
			}
            if (Monster.cssCount == Monster.cssURL.length && Monster.cssImport == 0) {
				Monster.score += 2.7;
			}

		}

		ban_css_import();
}

/* 所有的需要获取到CSS文档字符流的检测函数 */

function checkJS(r,i,s,d){
	var t = r;
	Monster.jsAllLoaded[i] = true;
	Monster.jsCount++;

	/* CHECK_JS_MINIFY */
	function check_js_minify(){
		var lines = t.split(/\n/);
		var average_length_perline = t.length / lines.length;
		if(lines.length > 10 && average_length_perline < 200){
			Monster.jsMiniCount++;
		}
		if(Monster.jsCount == Monster.jsURL.length && Monster.jsMiniCount > 0){
			var m = '有 '+Monster.jsMiniCount+' 个 javascript 文档没有压缩或压缩力度不够';
			var e = new Warn(m);
			liWarn.push(e);
		}
		if(Monster.jsCount == Monster.jsURL.length && Monster.jsMiniCount == 0){
			Monster.score += 6.9;
		}
	}
	check_js_minify();
	/* CHECK_JS_SIZE */
	function check_js_size(s,d) {
 
	    Monster.jsSize.push(s);
		if (Monster.jsCount == Monster.jsURL.length) {
		    var jsize = 0;
		    var jsizeArr = [];
		    for (var a = 0; a < Monster.jsSize.length;a++ ) {
		        jsize += Monster.jsSize[a];
		        jsizeArr.push(Monster.getSize(Monster.jsSize[a]) + '|' + ((d)?d:''));
		    }

		    var size = Monster.getSize(jsize);
		    var m = '外部 javascript 文档的总大小为 ' + size + ' KB <a href="#" rel="' + jsizeArr.join('^') + '" class="ViewJsInfo">详细</a>';
			var e = new Sug(m);
			liSug.push(e);
		}
	}

	check_js_size(s,d);

}
Monster.outlineColor = '';

function checkAll() {

    hideCtrl(true);

    jQuery.ajax({
        url: location.href,
        type: "get",
        success: function (msg) {
            checkHTML(msg);
            checkTagClosed(msg.replace(Monster.reg.script, 'script')); // replace script block to empty 2010-04-22
            Monster.data.htm.push(msg);
        }
    });

    getValue('eBdColor', function (cl) {
        Monster.outlineColor = (typeof (cl) != 'undefined') ? cl : CONFIG.eBdColor;
    });

    var spl = '<ul class="mst-splash" id="mst-splash"><li class="mst-spl-err" title="点击查看错误列表"><div class="mst-spl-txt"><span></span>ERRORS</div></li><li class="mst-spl-warn" title="点击警告列表"><div class="mst-spl-txt"><span></span>WARNINGS</div></li><li class="mst-spl-info" title="点击建议列表"><div class="mst-spl-txt"><span></span>INFOMATION</div></li><li class="mst-spl-score"><span title="点击查看综合列表"></span></li></ul>';

    jQuery('<div id="monster_main" class="mst-main">' + spl + '</div>').appendTo('body').draggable({
        'cancel': 'p, #monster_content',
        'cursor': 'move',
        'opacity': '0.45'
    });

    jQuery('.mst-main').css({
        'display': 'block'
    });

    jQuery('<div class="mst-view-pl mst-hide" id="ViewStaticInfoPl"></div>').appendTo('.mst-main');
    jQuery('<div class="mst-spl-back" title="点击返回">RETURN</div>').appendTo('.mst-view-pl');
    jQuery('<div class="mst-view-js-pl"></div><div class="mst-view-cssbg-pl"></div>').appendTo('.mst-view-pl');

    jQuery('.mst-spl-back').click(function () {
        jQuery('.mst-main').animate({ 'left': 100 }, 'slow');
        jQuery('.mst-view-pl').animate({ 'height': 'hide' }, 'fast');
    });

    var probar = jQuery('<div class="mst-processbar"></div>').appendTo(".mst-main");

	//max_script_num();
    getValue('MAX_SCRIPT_NUM', function (num) {
        if (typeof (num) != 'undefined') max_script_num(num);
    });

	//check_http_https();
	getValue('CHECK_HTTP_HTTPS',function(http){
		if(http=='true'){
		    check_http_https();
		}
	});

	//check_style_pos();
	getValue('CHECK_STYLE_POS',function(style){
		if(style=='true'){
		    check_style_pos();
		}
	});

	//check_script_pos();
	getValue('CHECK_SCRIPT_POS',function(js){
		if(js=='true'){
		    check_script_pos();
		}
	});

	//check_encoding();
	getValue('CHECK_TITLE_INHEAD',function(enc){
		if(enc=='true'){
		    check_encoding();
		}
	});
    
	//max_linkstyle_num();
	getValue('MAX_LINKSTYLE_NUM',function(num){
	    if (typeof (num) != 'undefined') max_linkstyle_num(num);
	});

	//check_style_media();
	getValue('CHECK_STYLE_MEDIA',function(media){
			if(media=='true')check_style_media();
	});


	//max_cssimg_num();
	getValue('MAX_CSSIMG_NUM',function(num){
	    if (typeof (num) != 'undefined') max_cssimg_num(num);
	});

	//check_lower_case();
	/* getValue('CHECK_LOWER_CASE',function(bool){
			if(bool=='true')check_lower_case();
	}); */


	//banned_element_type();
	getValue('BANNED_ELEMENT_TYPE',function(banned){
		if(banned=='true')banned_element_type();
	});
    probar.animate({ 'width': '20%' }, 'fast');

	//check_title_inhead();
	getValue('CHECK_TITLE_INHEAD',function(title){
		if(title=='true')check_title_inhead();
	});

    //
    getValue('CHECK_COMPAT_MODE', function (js) {
		if(js=='true')check_compat_mode();
	});


	//check_inline_js();
	getValue('CHECK_INLINE_JS', function (js) {
	    if (js == 'true') check_inline_js();
	});

	//check_img_alt();
	getValue('CHECK_IMG_ALT',function(alt){
		if(alt=='true')check_img_alt();
	});

	//check_submit_inform();
	getValue('CHECK_SUBMIT_INFORM',function(sub){
		if(sub=='true')check_submit_inform();
    });

    check_input_hidden_pos();
    check_include_once();

	//check_label();
	getValue('CHECK_LABEL',function(lab){
		if(lab=='true')check_label();
    });

	//max_element_num();
	getValue('MAX_ELEMENT_NUM',function(num){
	    if (typeof (num) != 'undefined') max_element_num(num);
	});

	//ban_css_import();
	getValue('BAN_CSS_IMPORT',function(importcss){
		if(importcss=='true')ban_css_import();
    });

	//no_id_submit();
    getValue('NO_ID_SUBMIT', function (subId) {
        if (subId == 'true') no_id_submit();
    });

	//no_dup_id();
	getValue('NO_DUP_ID',function(dupId){
		if(dupId=='true')no_dup_id();
	});
    probar.animate({ 'width': '40%' }, 'fast');

    /*
    getValue('CHECK_LTGT_STRING', function (js) {
    if (js == 'true') check_html_word();
    });
    */

    //check_cookie_size();
    getValue('CHECK_COOKIE_SIZE', function (js) {
        if (js == 'true') check_cookie_size();
    });

    if (Monster.cssURL.length > 0) {
        //检测外部CSS文件
        jQuery.each(Monster.cssURL, function (i) {
            var url = Monster.cssURL[i];
            if (url.indexOf('#inline#') != -1) {
                checkCSS(jQuery('style:not(html>style)')[url.split('#')[2]].innerHTML, i);
                Monster.cssAllLoaded[i] = true;
            } else {
                chrome.extension.sendRequest({ action: 'single', sUrl: url, idx: i }, function (response) {
                    if (!response.txt) {
                        
                        Monster.cssAllLoaded[response.idx] = true;

                        var idx = jQuery('.mst-body-mixed-err').length;
                        jQuery('<div class="mst-body-mixed mst-body-mixed-err"><span title="show">404</span><em class="mst-hide" title="close"></em><div class="mst-body-mixed-ctr mst-hide" contenteditable="true">' + Monster.cssURL[response.idx] + '</div></div>').appendTo(document.body).draggable({ 'cursor': 'move' }).css({ 'left': idx * 160 + 5 }).animate({ 'top': window.innerHeight }, 'fast').animate({ 'top': 600 }, 'fast').animate({ 'top': 650 }, 'fast');


                    } else {
                        checkCSS(response.txt, response.idx, response.size, response.dt);
                    }
                });
            }
        });
    } else {
        Monster.score += 4.6;
        Monster.score += 8.2;
        Monster.score += 2.7;
    }

    /* 所有的需要获取到js文档字符流的检测函数 */
    if (Monster.jsURL.length > 0) {

        jQuery.each(Monster.jsURL, function (i) {
            
            chrome.extension.sendRequest({ action: 'static', sUrl: Monster.jsURL[i], idx: i }, function (response) {

                if (response.err) {
                    
                    Monster.jsAllLoaded[response.idx] = true;

                    var idx = jQuery('.mst-body-mixed-err').length;
                    jQuery('<div class="mst-body-mixed mst-body-mixed-err"><span title="show">404</span><em class="mst-hide" title="close"></em><div class="mst-body-mixed-ctr mst-hide" contenteditable="true">' + Monster.jsURL[response.idx] + '</div></div>').appendTo(document.body).draggable({ 'cursor': 'move' }).css({ 'left': idx * 160 + 5 }).animate({ 'top': window.innerHeight }, 'fast').animate({ 'top': 600 }, 'fast').animate({ 'top': 650 }, 'fast');

                } else {
                    checkJS(response.txt, response.idx, response.size, response.dt);
                }
            });

        });
    } else {
        Monster.score += 6.9;
    }

    jQuery('.ViewJsInfo').live('click', function () {
        var htm = [];
        var arr = this.rel.split('^');

        jQuery('.mst-view-pl').animate({ 'height': 'show' }, 'fast');
        jQuery('.mst-view-js-pl').removeClass('mst-hide');
        jQuery('.mst-view-cssbg-pl').addClass('mst-hide');

        jQuery('.mst-main').animate({ 'left': '-200em' }, 'slow');

        jQuery(arr).each(function (i, el) {
            var info = el.split('|');
            var tstamp = Monster.jsURL[i].split('?');
            var hasTstamp = false;
            if (tstamp[1]) {
                hasTstamp = /2010[0-9]{4,}/.test(tstamp[1]);
            }
            htm.push('<div class="mst-js-url" id="ViewJsInfo-' + i + '" rel="' + i + '"><span class="mst-furl">' + Monster.jsURL[i] + '<span><span class="mst-mdtime" title="' + info[1] + '">' + ((hasTstamp) ? info[1] : '') + '</span><span class="mst-fsize">' + ((info[0] == '0.00') ? '' : info[0] + 'KB') + '</span></div>');
        });

        jQuery('.mst-view-js-pl').html(htm.join(''));

        jQuery('script[src]').each(function (i, el) {
            if (jQuery(el).parent().get(0).nodeName.toLowerCase() == 'head') {
                jQuery('#ViewJsInfo-' + i).animate({ 'top': i * 33 }, 'fast');
            } else {
                var ns = jQuery(el).nextAll(":not(script)");
                if (ns.get(0)) {
                    if (ns.get(0).id == 'monster_main') {
                        jQuery('#ViewJsInfo-' + i).animate({ 'top': window.innerHeight - i * 33 }, 'fast');
                    } else {
                        jQuery('#ViewJsInfo-' + i).animate({ 'top': ns.get(0).offsetTop + i * 33 }, 'fast');
                    }
                }
            }
        });

        return false;
    });


    jQuery('.ViewCSSBgImg').live('click', function () {

        jQuery('.mst-view-pl').animate({ 'height': 'show' }, 'fast');
        jQuery('.mst-view-js-pl').addClass('mst-hide');
        jQuery('.mst-view-cssbg-pl').removeClass('mst-hide');

        jQuery('.mst-main').animate({ 'left': '-200em' }, 'slow');

        jQuery('.mst-view-cssbg-pl').html('<ul></ul><div id="ViewCSSBgImgPl" class="mst-cssbg-viewer"></div>');
        
        var imgs = this.rel.split('|');
        jQuery(imgs).each(function (i, el) {
            var bgi = el.substring(el.indexOf('(') + 1, el.indexOf(')'));
            jQuery('<li title="' + bgi + '" id="ViewCSSBgImg-' + i + '"><span class="img" style="background-image:' + el + '"></span></li>').appendTo('.mst-view-cssbg-pl ul');

            chrome.extension.sendRequest({ action: 'static', sUrl: bgi, idx: i }, function (response) {
                if (response.err) {
                    jQuery('#ViewCSSBgImg-' + response.idx).attr('rel', null + '|' + response.idx + '|' + null + '|' + null);
                    jQuery('<em style="color:#f00"' + '>404</em>').appendTo('#ViewCSSBgImg-' + response.idx);
                } else {
                    var sz = Monster.getSize(response.size);
                    jQuery('#ViewCSSBgImg-' + response.idx).attr('rel', response.url + '|' + response.idx + '|' + sz + '|' + response.dt);
                    jQuery('<em' + ((sz > 30) ? ' style="color:#f00"' : '') + '>' + sz + 'KB</em>').appendTo('#ViewCSSBgImg-' + response.idx);
                }

            });

        });
        jQuery('.mst-view-cssbg-pl li').mouseover(function () {
            var info = this.getAttribute('rel').split('|');
            jQuery('.mst-cssbg-viewer').html('<h3>' + info[0] + ' <span>' + (new Date(info[3])).toLocaleDateString() + '</span></h3><img src="' + info[0] + '" />');
        });
        jQuery('.mst-view-cssbg-pl li').click(function () {
            window.open(this.title);
        });

        return false;

    });

    getValue('CHECK_TITLE_INHEAD', function (title) {
        if (title == 'true') {
            check_first_inhead();
            getValue('CHECK_HTML5_DTD', function (html5dtd) {
                check_compat_mode((html5dtd == 'true') ? 'html5' : '');
            });
        }
    });

    probar.animate({ 'width': '100%' }, 'fast', function () { probar.css({ 'display': 'none' }); });

    jQuery('.mst-body-mixed-err').live('click', function () {
        jQuery('em', this).removeClass('mst-hide');
        jQuery('.mst-body-mixed-ctr', this).removeClass('mst-hide');
    });
    jQuery('.mst-body-mixed-err em').live('click', function () {
        jQuery(this).addClass('mst-hide');
        jQuery(this).parent().addClass('mst-hide');
    });
}


//检测是否有标记未关闭
function checkTagClosed(htm) {
    var html = htm.replace(Monster.reg.comment, '');
    var tag = 'div,p,a,span,ul,ol,li,dd,em,strong,h1,h2,h3,h4,h5,h6,td,tr,tbody,tfoot,table,button,fieldset,form,label,textarea,select,option,script,style,iframe,object,map,noscript,sup,sub,pre'.split(',');
    var docCode = html.substring(html.indexOf('<body'), html.indexOf('</body>'));
    var hasErr = false;
    for (var i = 0; i < tag.length; i++) {
        var reg = new RegExp("<" + tag[i] + "(>| )", "gi");
        var reg2 = new RegExp("</" + tag[i]+">", "gi");

        var tagstart = docCode.match(reg);
        var tagend = docCode.match(reg2);

        var tagstartlen =  (tagstart) ? tagstart.length : 0;
        var tagendlen = (tagend) ? tagend.length : 0;

        if (tagstartlen != tagendlen) {
            var num = Math.abs(tagstartlen - tagendlen);
            var m = '★  有 ' + num + '个 〈' + tag[i] + '〉 标签没有关闭';
            var e = new Err(m);
            liErr.push(e);
            hasErr = true;
        }
    }
    if (!hasErr) {
          Monster.score += 2;
    }
}

//隐藏<object>标签
function hideCtrl(bl) {
    if (bl) {
        jQuery('object').each(function (i, el) {
            jQuery(el).css({ 'display': 'none' });
            el.setAttribute('wmode', 'Opaque');
        });
        jQuery('embed').each(function (i, el) {
            el.setAttribute('wmode', 'Opaque');
            jQuery(el).css({ 'display': 'none' });
        });
    } else {
        jQuery('objcet').each(function (i, el) {
            jQuery(el).css({ 'display': 'inline-block' });
            el.setAttribute('wmode', 'Opaque');
        });
        jQuery('embed').each(function (i, el) {
            el.setAttribute('wmode', 'Opaque');
            jQuery(el).css({ 'display': 'inline-block' });
        });
    }

}

/* 用于支持xmlHttpRequest的onload的内容能够在现实Monster界面之前执行 */

function showMonster() {

	Monster.isShown = true;

	var errNum = liErr.length;
	var warnNum = liWarn.length;
	var sugNum = liSug.length;

    getValue('eBgImg', function (bg) {
        if (bg != '') {
            if (bg.indexOf('http') == 0) {
                jQuery('.mst-main').css({ "background": "url(" + bg + ") right bottom no-repeat" });
            } else {
                jQuery('.mst-main').css({ "background": bg });
            }
        }
    });

/* 计算最终得分 */
Monster.final_score = (Monster.score / Monster.original_score * 100).toFixed(2);

jQuery('.mst-spl-err .mst-spl-txt span').html(errNum);
jQuery('.mst-spl-warn .mst-spl-txt span').html(warnNum);
jQuery('.mst-spl-info .mst-spl-txt span').html(sugNum);
jQuery('.mst-spl-score span').html(Monster.final_score);

jQuery('.mst-spl-score span').click(function () {
    jQuery('.mst-splash').animate({ 'height': 'hide' }, 'fast');
    jQuery('#monster_content').animate({ 'height': 'show' }, 'fast');
    jQuery('#mst-title-bar').css({ 'display': 'block' });

    jQuery('#mst-err-ctr').animate({ 'height': 'show' }, 'fast');
    jQuery('#mst-warn-ctr').animate({ 'height': 'show' }, 'fast');
    jQuery('#mst-info-ctr').animate({ 'height': 'show' }, 'fast');
});

jQuery('.mst-splash li:not(.mst-spl-score)').click(function () {
    var attr = this.className.split('-')[2];
    jQuery('.mst-splash').animate({ 'height': 'hide' }, 'fast');
    jQuery('#monster_content').animate({ 'height': 'show' }, 'fast');
    jQuery('#mst-err-ctr').animate({ 'height': 'hide' }, 'fast');
    jQuery('#mst-warn-ctr').animate({ 'height': 'hide' }, 'fast');
    jQuery('#mst-info-ctr').animate({ 'height': 'hide' }, 'fast');
    jQuery('#mst-' + attr + '-ctr').animate({ 'height': 'show' }, 'fast');
    jQuery('#mst-title-bar').css({ 'display': 'block' });

});

jQuery('<div id="mst-title-bar" class="mst-title-bar"></div>').appendTo('.mst-main').css({ 'display': 'none' });

jQuery('<p id="monster_title" class="mst-title"><span style="color:red;">' + errNum + '</span> 个错误，<span style="color:#ff0;">' + warnNum + '</span> 个警告，<span style="color:#46A7F6">' + sugNum + '</span> 个信息。</p>').appendTo("#mst-title-bar");

jQuery('<div class="mst-score">' + Monster.final_score + '</div>').appendTo("#mst-title-bar")

jQuery('<span id="monster_outline_all" class="mst-goto" title="高亮所有错误标签边框"></span>').insertAfter("#monster_title").css({
	'float': 'left', 
	'width': '15px', 
	'height': '15px', 
	'margin': '12px 10px 10px', 
	'cursor': 'pointer'	
}).hover(function(){
    jQuery(this).css({
		'opacity': '1'
	});
}, function(){
    jQuery(this).css({
		'opacity': '.5'
	});
}).toggle(function(){
	jQuery.each(liErr, function(i){
		Monster.removeOutline(this);
	});
	jQuery.each(liWarn, function(i){
		Monster.removeOutline(this);
	});
	jQuery.each(liSug, function(i){
		Monster.removeOutline(this);
	});
}, function(){
	jQuery.each(liErr, function(i){
		Monster.addOutline(this);
	});
	jQuery.each(liWarn, function(i){
		Monster.addOutline(this);
	});
	jQuery.each(liSug, function(i){
		Monster.addOutline(this);
	});
});

/* 主界面关闭按钮等*/
jQuery('<span id="monster_close" class="mst-close" title="关闭"></span>').appendTo("#mst-title-bar").hover(function () {
    jQuery(this).css({
        'opacity': '1'
    });
}, function () {
    jQuery(this).css({
        'opacity': '.5'
    });
}).bind('click', function (e) {
    jQuery('.mst-main').animate({ 'opacity':'hide'},'fast', function () {
        var divMstr = jQuery('.mst-main')[0];
        divMstr.parentNode.removeChild(divMstr);
        hideCtrl(false);
    });

});

/* 缩小和放大界面按钮 */
jQuery('<span id="monster_toggle" class="mst-min" title="最大化/最小化"></span>').appendTo("#mst-title-bar").css({ 'background-position': '0 0' }).hover(function () {
    if (Monster.folded) {
        jQuery(this).css({
            'opacity': '1'
        });
    }
    else {
        jQuery(this).css({
            'opacity': '.5'
        });
    }
}, function () {
    if (Monster.folded) {
        jQuery(this).css({
            'opacity': '1'
        });
    }
    else {
        jQuery(this).css({
            'opacity': '.5'
        });
    }
}).toggle(function (e) {
    Monster.folded = false;
    jQuery('#monster_content').animate({ 'height': 'hide' }, 'fast');
    jQuery('#mst-splash').animate({ 'height': 'hide' }, 'fast');
    
    jQuery(this).css({
        'background-position': '-50px 0'
    });
    jQuery('.mst-score').removeClass('mst-score-max');
    

}, function (e) {//最小化
    Monster.folded = true;

    jQuery('#monster_content').animate({ 'height': 'show' }, 'fast');

    jQuery(this).css({
        'background-position': '-50px 0'
    });
    jQuery('.mst-score').addClass('mst-score-max');

});

jQuery('<span class="mst-option" title="选项">option</span>').appendTo("#mst-title-bar")

/* 错误等详细信息的主界面*/
jQuery('<div id="monster_content" class="mst-content"></div>').appendTo(".mst-main").css({height:document.defaultView.screen.height - 450 + 'px' });

jQuery('<div id="mst-err-ctr"></div>').appendTo("#monster_content");

jQuery.each(liErr, function(i){
	var cur_err = this;
	jQuery('<div id="error' + i + '" class="mst-err"></div>').appendTo('#mst-err-ctr');
	jQuery('<p>'+cur_err.message+'</p>').appendTo('#error'+i);
	if(cur_err.elems){
		jQuery('<div class="monster_outline mst-goto" rel="'+cur_err.cssClass+'" title="高亮标签边框"></div>').insertAfter("#error"+i+" p").css({
			'float': 'left', 
			'width': '15px', 
			'height': '15px', 
			'margin': '10px', 
			'cursor': 'pointer'	
		}).hover(function(){
			jQuery(this).css({
				'opacity': '1'
			});
		}, function(){
			jQuery(this).css({
				'opacity': '.5'
			});
		}).toggle(function(){
			jQuery.each(liErr, function(i){
				Monster.removeOutline(this);
			});
			jQuery.each(liWarn, function(i){
				Monster.removeOutline(this);
			});
			jQuery.each(liSug, function(i){
				Monster.removeOutline(this);
			});
			Monster.addOutline(cur_err);
		}, function(){
			Monster.removeOutline(cur_err);
		});
	}
	jQuery('<div class="clear"></div>').appendTo('#error'+i).css({
		'clear': 'both'
	});
});

jQuery('<div id="mst-warn-ctr"></div>').appendTo("#monster_content");

jQuery.each(liWarn, function(i){
	var cur_warn = this;
	jQuery('<div id="warn' + i + '" class="mst-warn"></div>').appendTo('#mst-warn-ctr');
	jQuery('<p>'+cur_warn.message+'</p>').appendTo('#warn'+i);
	if(cur_warn.elems){
	    jQuery('<div class="monster_outline mst-goto" title="高亮标签边框"></div>').insertAfter("#warn" + i + " p").css({
			'float': 'left', 
			'width': '15px', 
			'height': '15px', 
			'margin': '10px',  
			'cursor': 'pointer'	
		}).hover(function(){
			jQuery(this).css({
				'opacity': '1'
			});
		}, function(){
			jQuery(this).css({
				'opacity': '.5'
			});
		}).toggle(function(){
			jQuery.each(liErr, function(i){
				Monster.removeOutline(this);
			});
			jQuery.each(liWarn, function(i){
				Monster.removeOutline(this);
			});
			jQuery.each(liSug, function(i){
				Monster.removeOutline(this);
			});
			Monster.addOutline(cur_warn);
		}, function(){
			Monster.removeOutline(cur_warn);
		});
	}
	jQuery('<div class="clear"></div>').appendTo('#warn'+i).css({
		'clear': 'both'
	});
});

jQuery('<div id="mst-info-ctr"></div>').appendTo("#monster_content");

jQuery.each(liSug, function(i){
	var cur_sug = this;
	jQuery('<div id="sug' + i + '" class="mst-sugst"></div>').appendTo('#mst-info-ctr');
	jQuery('<p>'+cur_sug.message+'</p>').appendTo('#sug'+i);
	if(cur_sug.elems){
	    jQuery('<div class="monster_outline mst-goto" title="高亮标签边框"></div>').insertAfter("#sug" + i + " p").css({
			'float': 'left', 
			'width': '15px', 
			'height': '15px', 
			'margin': '10px', 
			'cursor': 'pointer'	
		}).hover(function(){
			jQuery(this).css({
				'background-position': '-25px -5px'
			});
		}, function(){
			jQuery(this).css({
				'background-position': '-25px -25px'
			});
		}).toggle(function(){
			jQuery.each(liErr, function(i){
				Monster.removeOutline(this);
			});
			jQuery.each(liWarn, function(i){
				Monster.removeOutline(this);
			});
			jQuery.each(liSug, function(i){
				Monster.removeOutline(this);
			});
			Monster.addOutline(cur_sug);
		}, function(){
			Monster.removeOutline(cur_sug);
		});
	}
	jQuery('<div class="clear"></div>').appendTo('#sug'+i).css({
		'clear': 'both'
	});
});

jQuery('<div id="mst-spl-back" class="mst-spl-back">RETURN</div>').appendTo("#monster_content");

jQuery('.mst-option').click(function(){
	chrome.extension.sendRequest({action:'viewOption'}, function(response) {  
		
	});
});

jQuery('#mst-spl-back').click(function () {
    jQuery('.mst-splash').animate({ 'height': 'show' }, 'fast');
    jQuery('#monster_content').animate({ 'height': 'hide' }, 'fast');
    jQuery('#mst-title-bar').css({ 'display': 'none' });
    jQuery('.mst-body-mixed').each(function (i, el) {
        jQuery(el).animate({ 'height': 'hide' }, 'fast');
    });
});

}

var port = chrome.extension.connect({name: "monster_lt"});
var init = false;
var loaded = false;

port.onMessage.addListener(function (msg) {
    if (msg.action == 'click') {

        if (msg.tab.id != tabId) {
            return false;
        }

        if (!init) {

            //first use
            getValue('FIRST_USE', function (firstus) {
                if (typeof (firstus) == 'undefined') {
                    chrome.extension.sendRequest({ action: 'viewOption', param: 'default'}, function (response) {

                    });
                    return false;
                } else {
                    f_init();
                    init = true;
                    loaded = true;
                }
            });

        } else {
            if (!loaded) {
                f_show();
                loaded = true;
            } else {
                f_hide();
                location.reload();
                loaded = false;
                init = false;
            }
        }
    } else if (msg.action == 'load') {
        tabId = msg.curTab.id;
    }
});

function f_init(){
	checkAll();
	Monster.timer = setInterval(function () {

	    if (Monster.isShown) {
	        clearInterval(Monster.timer);
	        return;
	    }
	    //console.log(Monster.cssAllLoaded);
	    if (Monster.htmlLoaded && Monster.all(Monster.cssAllLoaded) && Monster.all(Monster.jsAllLoaded)) {
	        showMonster();
	    }

	}, 100);
	
}

function f_show(){
	showMonster();
}

function f_hide() {
    var divMstr = jQuery('.mst-main')[0];
    divMstr.parentNode.removeChild(divMstr);
    Monster.isShown = false;
    hideCtrl(false);
}