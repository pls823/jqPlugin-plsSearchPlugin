 function PlsSearchPlugin(plsSearchData) {

        // json对象转换成字符串
        var stringify = function (s) {
            var data = s;
            data = JSON.stringify(data, function(key, val) {
                if (typeof val === 'function') {
                    return val + '';
                }
                return val;
            });
            return data
        };

        // json字符串转换成对象
        var parseJson = function (s) {
            var data = s;
            data = JSON.parse( data , function(k,v){
                if(xyzIsNull(v)){
                    v = '';
                }
                if(v.indexOf && v.indexOf('function') > -1){
                    return eval("(function(){return "+v+" })()")
                }
                return v;
            });
            return data
        };

        // 判断为空
        var xyzIsNull = function(obj){
            if(obj==undefined || obj==null || obj==="" || obj===''){
                return true;
            }else{
                return false;
            }
        };

        // 滚动条
        var initscroll = function (e,scrollBoxHeight,scrollContentHeight) {
            var $ul = e;
            var $span = $ul.parent().find('.sbarbox span').eq(0);
            var n = ((scrollBoxHeight / scrollContentHeight) * 100 ) + '%';
            $span.css('height', n);
            $ul.parent().find('.sbarbox').show();
            $ul.parent().find('.sbar').fadeIn();
            scrollBoxHeight = $ul[0].getBoundingClientRect().height; // 设置的理论最大高度和真实渲染的高度有出入
            $ul.parent().find('.sbar').css({"height":scrollBoxHeight-20+"px"});

            // 监听高度
            $ul.scroll(function () {
                if($ul.children()[0]) {
                    if($ul.children()[0].offsetWidth==0||$ul.children()[0].offsetWidth+4>=$ul[0].offsetWidth){
                        $ul.parent().find('.sbarbox').hide();
                    }else{
                        $ul.parent().find('.sbarbox').show();
                    }
                    scrollContentHeight = $ul[0].scrollHeight;
                    var scrolltop = $ul.scrollTop();
                    var box_height = $ul.parent().find('.sbar')[0].getBoundingClientRect().height,
                        scroll_bar_height = $ul.parent().find('.sbar span')[0].getBoundingClientRect().height;

                    // scrolltop=(scrolltop/scrollContentHeight)*(scrollBoxHeight-20);
                    scrolltop = (scrolltop / (scrollContentHeight - scrollBoxHeight)) * (box_height - scroll_bar_height);
                    $span.css({"top":scrolltop+"px"});
                }
            });
        };


        /*变量名*/
        var that = this;
        that.pluginData = stringify(plsSearchData);
        that.pluginData = parseJson(that.pluginData);//原始的数据
        that.defaultPluginData = stringify(that.pluginData);
        that.defaultPluginData = parseJson(that.defaultPluginData);//保存原始的数据

        that.pluginData.data = {};//查询总数据
        that.searchData = {};//查询的数据

        //添加group数据到主数据的方法
        that.initData;
        //判断是否有自定义数据的方法
        that.initSelfData;
        var isSelfData = false;
        //渲染组件
        that.render;
        that.creatGroup;
        //获取数据
        that.getSearchData;
        //判断是否可以查询
        var canSearch = true;

        /*--初始化数据--*/

        //添加group数据到主数据的方法
        that.initData = function () {
            if(xyzIsNull(that.pluginData.id)){
                return
            }
            that.pluginData.data = {};

            if(xyzIsNull(that.pluginData.group)){
                that.pluginData.group = {"allQuery":{
                        value: "allQuery",
                        text:'更多',
                        data:[{
                            key: "AIquery",
                            defaultQuery: "true",
                            options: {
                                data: {
                                    prompt:""
                                }
                            },
                            AIMatch: [
                                {key:"", re:""}
                            ]
                        }]
                    }}};

            //遍历group一级数据
            for (var group in that.pluginData.group){
                var groupData = that.pluginData.group[group];

                //遍历group二级数据
                for(var i = 0;i< groupData.data.length; i++){
                    var key = groupData.data[i].key;

                    if(xyzIsNull(groupData.value)||group != groupData.value){
                        that.pluginData.group[group].value = group;
                    }

                    //把group数据添加进插件组数据
                    if(!xyzIsNull(key)){
                        that.pluginData.data[key] = groupData.data[i];
                    }
                }
            }

            //给不规范的数据增加属性

            that.pluginData.marginLeft = xyzIsNull(that.pluginData.marginLeft)?0:Number(that.pluginData.marginLeft);
            that.pluginData.marginRight = xyzIsNull(that.pluginData.marginRight)?0:Number(that.pluginData.marginRight);
            that.pluginData.customSearchWidth = xyzIsNull(that.pluginData.customSearchWidth)?0:Number(that.pluginData.customSearchWidth);
            that.pluginData.width = xyzIsNull(that.pluginData.width)?'auto':Number(that.pluginData.width) + 'px';
            that.pluginData.height = xyzIsNull(that.pluginData.height)?68:Number(that.pluginData.height)>54?Number(that.pluginData.height):54;
            for(var data in that.pluginData.data){
                //给不规范的数据增加属性
                if(xyzIsNull(that.pluginData.data[data].type)){
                    that.pluginData.data[data].type = "textbox";
                }
                if(xyzIsNull(that.pluginData.data[data].ignoneClean)){
                    that.pluginData.data[data].ignoneClean = false;
                }
                if(xyzIsNull(that.pluginData.data[data].options)){
                    that.pluginData.data[data].options = {};
                }
                if(xyzIsNull(that.pluginData.data[data].options.data)){
                    that.pluginData.data[data].options.data = [];
                }
                if(xyzIsNull(that.pluginData.data[data].options.value)){
                    that.pluginData.data[data].options.value = "";
                }
                if(xyzIsNull(that.pluginData.data[data].options.text)){
                    that.pluginData.data[data].options.text = "";
                }
                if(xyzIsNull(that.pluginData.data[data].options.html)){
                    that.pluginData.data[data].options.html = "";
                }
            }

            if(!xyzIsNull(that.pluginData.data.AIquery)){
                that.pluginData.data.AIquery.defaultQuery = "true";
                if(xyzIsNull(that.pluginData.data.AIquery.keyLabel))
                    that.pluginData.data.AIquery.keyLabel = "";
            }

        };
        //判断是否有自定义数据的方法
        that.initSelfData = function () {
            var currentSelfQuery = xyzGetUserOpers("searchSelfQuery-"+that.pluginData.id);
            if(!xyzIsNull(currentSelfQuery)&&currentSelfQuery !== "{}") {//判断是否有自定义的搜索
                isSelfData = true;
                var selfQueryData = parseJson(currentSelfQuery);
                let copePluginData = parseJson(stringify(that.pluginData.data))
                for (var key in selfQueryData) {
                    if(!xyzIsNull(selfQueryData[key].defaultQuery)&&!xyzIsNull(that.pluginData.data[key])){
                      copePluginData[key].defaultQuery = selfQueryData[key].defaultQuery;
                      copePluginData[key].options.value = xyzIsNull(selfQueryData[key].value)?'':selfQueryData[key].value;
                      copePluginData[key].options.text = xyzIsNull(selfQueryData[key].text)?'':selfQueryData[key].text;
                      copePluginData[key].options.html = xyzIsNull(selfQueryData[key].html)?'':selfQueryData[key].html;
                      copePluginData[key].index = xyzIsNull(selfQueryData[key].index)? undefined:selfQueryData[key].index;
                    }
                }

                // 调整顺序
              let copePluginDataArr = []

              for (var key in copePluginData){
                  if (key === "AIquery") {
                    copePluginDataArr[0] = copePluginData[key]
                  } else {
                    var indexNumber = copePluginData[key].index

                    if (indexNumber !== undefined && typeof Number(indexNumber) === 'number'&& Number(indexNumber) > -1) {
                      copePluginDataArr[indexNumber+1] = copePluginData[key]
                    }
                  }
              }

              for (var key in copePluginData){
                var indexNumber = copePluginData[key].index
                if (key !== "AIquery" && (indexNumber === undefined || Number(indexNumber) < 0)) {
                  copePluginDataArr.push(copePluginData[key])

                }
              }

              delete  that.pluginData.data
              that.pluginData.data = new Object();

              if (copePluginDataArr.length === Object.keys(copePluginData).length) {
                copePluginDataArr.forEach(function (data,index) {
                  that.pluginData.data[data.key] = data
                })
              } else {
                that.pluginData.data = copePluginData
              }


            }
        }
        //初始化数据
        that.init = function () {
            //初始化数据
            that.initData();

            //初始化数据,判断是否有自定义数据
            that.initSelfData();

        };
        that.init();

        /* var $hasCss = $(document).find('link[href*="MaytekQ.css"]');//解决皮肤和其他系统的差异，以及有.xyz_search_bar的差异
         if($hasCss.length<1) {
             var content = '<link rel="stylesheet" href="../xyzCommonFrame/css/MaytekQ.css">'+
             '<style>.xyz_search_bar'+'{height:'+that.pluginData.height+'px;}'+'</style>';
             $("link").last().before(content);
         }*/
        var style = '<style>' +
            '#' +that.pluginData.id +' .plsSearchPlugin'+'{width:'+that.pluginData.width + ';height:'+that.pluginData.height + 'px;margin-left:'+that.pluginData.marginLeft + 'px;margin-right:'+that.pluginData.marginRight+'px;}'+
            '#' +that.pluginData.id +' .plsSearchPlugin .search-mainWrap'+'{height:'+that.pluginData.height+'px;margin-right:'+(86+that.pluginData.customSearchWidth)+'px}'+
            '#' +that.pluginData.id +' .plsSearchPlugin .search-main'+'{height:'+that.pluginData.height+'px;}'+
            '#' +that.pluginData.id +' .plsSearchPlugin .search-set'+'{height:'+(that.pluginData.height-2)+'px;}'+
            '#' +that.pluginData.id +' .plsSearchPlugin .search-setSave'+'{height:'+((that.pluginData.height-2)/2-1)+'px;line-height:'+((that.pluginData.height-2)/2-1)+'px}'+
            '#' +that.pluginData.id +' .plsSearchPlugin .search-setRestore'+'{height:'+(that.pluginData.height-2)/2+'px;line-height:'+(that.pluginData.height-2)/2+'px}'+
            '#' +that.pluginData.id +' .plsSearchPlugin .search-queryLabelWrap'+'{height:'+(that.pluginData.height-2)+'px;}'+
            '#' +that.pluginData.id +' .plsSearchPlugin .search-queryLabelWrap .lablelNowArrows'+'{top:'+(that.pluginData.height+6)+'px;}'+
            '#' +that.pluginData.id +' .plsSearchPlugin .search-queryScrollerLeft'+'{height:'+(that.pluginData.height-2)+'px;line-height:'+(that.pluginData.height-2)+'px}'+
            '#' +that.pluginData.id +' .plsSearchPlugin .search-queryScrollerRight'+'{height:'+(that.pluginData.height-2)+'px;line-height:'+(that.pluginData.height-2)+'px}'+
            '#' +that.pluginData.id +' .plsSearchPlugin .search-aiQuery'+'{height:'+(that.pluginData.height-3)+'px;}'+
            '#' +that.pluginData.id +' .plsSearchPlugin .search-aiQuery .queryLabelBox'+'{height:'+(that.pluginData.height-3)+'px;}'+
            '#' +that.pluginData.id +' .plsSearchPlugin .search-aiQuery .queryLabelBox a'+'{margin-top:'+((that.pluginData.height-3)/2-21)+'px;}'+
            '#' +that.pluginData.id +' .plsSearchPlugin .search-aiQuery .queryLabelBox textarea'+'{height:'+(that.pluginData.height-3)+'px;}'+
            '#' +that.pluginData.id +' .plsSearchPlugin .search-aiQuery .queryLabelBox .icon-clear'+'{height:'+(that.pluginData.height-2)+'px;line-height:'+(that.pluginData.height-2)+'px}'+
            '#' +that.pluginData.id +' .plsSearchPlugin .search-labelsWrap'+'{height:'+(that.pluginData.height-2)+'px;}'+
            '#' +that.pluginData.id +' .plsSearchPlugin .search-labelsWrap ul'+'{height:'+(that.pluginData.height-2)+'px;}'+
            '#' +that.pluginData.id +' .plsSearchPlugin .search-labelsWrap ul li'+'{height:'+(that.pluginData.height-2)+'px;}'+
            '#' +that.pluginData.id +' .plsSearchPlugin .search-labelsWrap li > div'+'{height:'+(that.pluginData.height-2)+'px;}'+
            '#' +that.pluginData.id +' .plsSearchPlugin .search-labelsWrap .queryLabelBox a'+'{height:'+(that.pluginData.height-2)+'px;line-height:'+(that.pluginData.height-2)+'px}'+
            '#' +that.pluginData.id +' .plsSearchPlugin .search-labelsWrap li.select .queryLabelBox a'+'{height:19px;line-height:19px;padding-top:'+(that.pluginData.height/5-10>0?that.pluginData.height/5-10:0)+'px;}'+
            '#' +that.pluginData.id +' .plsSearchPlugin .search-selectGroup'+'{height:'+(that.pluginData.height-2)+'px;}'+
            '#' +that.pluginData.id +' .plsSearchPlugin .search-clearLablel'+'{height:'+(that.pluginData.height-2)+'px;line-height:'+(that.pluginData.height-2)+'px}'+
            '#' +that.pluginData.id +' .plsSearchPlugin .search-selectItem'+'{height:'+(that.pluginData.height-2)+'px;}'+
            '#' +that.pluginData.id +' .plsSearchPlugin .queryInputBoxs'+'{top:'+(that.pluginData.height-5)+'px;}'+
            '#' +that.pluginData.id +' .plsSearchPlugin .button-mainWrap'+'{height:'+(that.pluginData.height)+'px;}'+
            '#' +that.pluginData.id +' .plsSearchPlugin .button-custom'+'{width:'+(that.pluginData.customSearchWidth)+'px;height:'+(that.pluginData.height)+'px;}'+
            '#' +that.pluginData.id +' .plsSearchPlugin .button-self'+'{height:'+(that.pluginData.height-2)+'px;}'+
            '#' +that.pluginData.id +' .plsSearchPlugin .button-self a'+'{height:'+(that.pluginData.height-2)+'px;}'+
            '</style>';
        /*--html结构--*/
        var  plsSearchPluginHtml = '<div class="plsSearchPlugin pluginBox">' +
            '<div class="search-mainWrap">' +
            '<div class="search-main">' +
            '<div class="search-set">' +
            '<div class="search-setSave" title="自定义最适合您的默认查询条件"><span class="iconfont icon-suo"></span><span class="iconfont icon-jiesuo"></span></div>' +
            '<div class="search-setRestore" title="恢复出厂设置"><span class="iconfont icon-fangwu"></span></div>' +
            '</div>' +
            '<div class="search-queryLabelWrap"><span class="lablelNowArrows"></span>' +
            '<div class="search-queryScrollerLeft"><span class="iconfont icon-calendarPrevmonth"></span></div>' +
            '<div class="search-queryScrollerRight"><span class="iconfont icon-calendarNextmonth"></span></div>' +
            '<div class="search-aiQuery"></div>' +
            '<div class="search-labelsWrap">' +
            '<ul></ul></div></div>' +
            '<div class="search-selectGroup"></div>' +
            '<div class="search-clearLablel" title="清除所有已经输入的条件值"><span class="iconfont icon-searchClear"></span></div></div>' +
            '<div class="queryInputBoxs"></div>' +
            '<div class="selectGroupBoxs" >' +
            '<div class="sbarbox"><div class="sbar"><span></span></div></div>' +
            '</div></div>' +
            '<div class="button-mainWrap">' +
            '<div class="button-custom"><div></div></div>' +
            '<div class="button-self"><a id="searchBtn-'+ that.pluginData.id +'"><span class="iconfont icon-chaxun"></span>查询</a></div>' +
            '</div></div>';
        $("#"+that.pluginData.id).prepend(plsSearchPluginHtml);
        $("#"+that.pluginData.id +' .button-custom div').prepend(that.pluginData.customSearch);
        $("link").last().after(style);

        that.scrollMaxHeight = xyzIsNull(that.pluginData.scrollMaxHeight)?520:that.pluginData.scrollMaxHeight;//下拉框滚动条最大高设置

        var $queryInputBoxs = $("#"+that.pluginData.id+" .queryInputBoxs");
        var $queryInputBoxsWidth = $(document).width()-16;
        $queryInputBoxs.css({left:-that.pluginData.marginLeft,width:$queryInputBoxsWidth + 'px'});//解决搜索框被overflow宽度限制

        /*--创建group搜索组件--*/
        var $selectSelectGroup = $("#"+that.pluginData.id+" .search-selectGroup");
        var $selectGroupBoxs = $("#"+that.pluginData.id+" .selectGroupBoxs");
        var $searchQueryLabelWrap = $("#"+that.pluginData.id+" .search-queryLabelWrap");
        var $searchAiQuery = $("#"+that.pluginData.id+" .search-aiQuery");

        //创建组件数据
        that.pluginGroup = that.pluginData.group;


        //创建搜索组件的方法
        that.creatGroup = function () {
            $selectSelectGroup.html("");
            for(var group in that.pluginGroup){
                var groupData = that.pluginGroup[group];

                var selectGroup = '<div class="search-selectItem"><div class="'+ group+'">'+groupData.text+'</div><span class="iconfont icon-comboArrow"></span></div>';
                $selectSelectGroup.append(selectGroup);

                var selectGroupBox = '<ul class="selectGroupBox '+ groupData.value + '"></ul>';
                $selectGroupBoxs.append(selectGroupBox);

                for(var i = 0;i< groupData.data.length;i++){

                    if (groupData.data[i].key == "AIquery") {
                        continue
                    }

                    var selectGroupBoxLi = '<li title="'+groupData.data[i].keyLabel+'" queryValue="'+ groupData.data[i].key +'">'+ groupData.data[i].keyLabel +'</li>';
                    $("#"+that.pluginData.id+" .selectGroupBox." + group).append(selectGroupBoxLi);
                }
            }
        };
        that.creatGroup();
        $searchQueryLabelWrap.css({right:Object.keys(that.pluginGroup).length*47+1+48+'px'});


        /*--创建li,input搜索组件--*/
        var $searchLabelsWrap = $("#"+that.pluginData.id+" .search-labelsWrap");
        var $searchLabelsWrapul = $("#"+that.pluginData.id+" .search-labelsWrap ul");
        var $searchClearLablel = $("#"+that.pluginData.id+" .search-clearLablel");
        var $queryInputBox = $("#"+that.pluginData.id+" .queryInputBox");
        /*--生成搜索选项的方法--*/
        var createQueryLi = function (data) {
            var add = false;
            var num = 0;
            if(data == "default"){
                $searchLabelsWrapul.html("");
            }
            if(data == "clickAdd"){
                add = true;
            }
            for(var li in that.pluginData.data){//遍历总数据
                var queryLi = that.pluginData.data[li];
                if(queryLi.defaultQuery == "true"){//判断显示的搜索选项

                    if($searchQueryLabelWrap.has('a[queryValue="'+queryLi.key+'"]').length !== 0){
                        if(queryLi.key !=='AIquery') {
                            num += 1;
                        }
                        continue
                    }
                    //生成智能
                    var queryLabelLi = '';
                    if(queryLi.key=='AIquery'){
                        queryLabelLi = '<div class="queryLabelBox">' +
                            '<a href="#" queryValue = "' + queryLi.key + '" >' + queryLi.keyLabel + '</a>' +
                            '<textarea>'+queryLi.options.data.prompt+'</textarea><span class="iconfont icon-clear"></span></div>';
                        $searchAiQuery.append(queryLabelLi);

                        continue
                    }

                    if (!xyzIsNull(queryLi.options.text)) {
                        if (queryLi.options.text.indexOf('&lt;br&gt;') > -1) {
                            var title = queryLi.options.text;
                            queryLi.options.text = title.substring(0, title.indexOf('&')) + '<br>' + title.substring(title.lastIndexOf(';') + 1, title.length);
                        }
                        var html ='';
                        if(xyzIsNull(queryLi.options.html)) {
                            html = queryLi.options.text;
                        } else {
                            html = queryLi.options.html;
                            html = html.replace(/&lt;/g,"<");
                            html = html.replace(/&acute;/g,"'");
                            html = html.replace(/&gt;/g,">");
                        }


                        queryLabelLi = "<li class='select'><div class='queryLabelBox'>" +
                            "<a href='#' queryValue = '" + queryLi.key + "' >" + queryLi.keyLabel + "</a>" +
                            "<div title='" + queryLi.options.text + "'><p>" + html + "</p></div></div>" +
                            "<span class='iconfont icon-clear'></span></li>";

                    } else {
                        queryLabelLi = '<li><div class="queryLabelBox">' +
                            '<a href="#" queryValue = "' + queryLi.key + '" >' + queryLi.keyLabel + '</a>' +
                            '<div title=""><p></p></div></div>' +
                            '<span class="iconfont icon-clear"></span></li>';
                    }
                    $searchLabelsWrapul.append(queryLabelLi);
            /*        if(add == false){
                        $searchLabelsWrapul.append(queryLabelLi);
                    } else {
                        if(num - 1 < 0){
                            $searchLabelsWrapul.find('li').eq(0).before(queryLabelLi);
                        } else {
                            $searchLabelsWrapul.find('li').eq(num-1).after(queryLabelLi);
                        }
                    }*/
                }

            }
        };
        /*--生成搜索选框的方法--*/
        var createInput = function (data) {
            var add = false;
            var num = 0;
            if(data == "default"){
                $queryInputBoxs.html("");
            }
            if(data == "clickAdd"){
                add = true;
            }


            for(var input in that.pluginData.data){//遍历总数据
                var queryInput = that.pluginData.data[input];
                //生成智能

                if(queryInput.defaultQuery == "true"){//判断显示的搜索选项

                    if($queryInputBoxs.has('input[queryValue="'+queryInput.key+'"]').length !== 0||$queryInputBoxs.has('input[dateStr="'+queryInput.key+'"]').length !== 0){
                        num += 1 ;
                        continue
                    }

                    if(queryInput.key=='AIquery'){
                        continue
                    }

                    //生成自定义
                    if(queryInput.type == 'customSearch'){

                        var queryInputBox = '<div class="queryInputBox"><div id="custom-'+ queryInput.key + that.pluginData.id +'" class="customInputBox">'+queryInput.options.customHtml + '</div><input  type="hidden" id="search-' + queryInput.key + that.pluginData.id+ '" queryValue ="' + queryInput.key + '" disabled customsearch><div class="inputButton"><span class="finish" queryKey="' + queryInput.key + '">完成</span><span class="plsSearch">查询</span></div></div>';
                        $queryInputBoxs.append(queryInputBox);

                      /*  if(add == false){
                            $queryInputBoxs.append(queryInputBox);
                        } else {
                            if(num - 1 < 0){
                                $queryInputBoxs.find(".queryInputBox").eq(num).before(queryInputBox);
                            } else {
                                $queryInputBoxs.find(".queryInputBox").eq(num-1).after(queryInputBox);
                            }
                        }*/

                        that.pluginData.data[queryInput.key].options.id = 'custom-' + queryInput.key + that.pluginData.id;

                        if(!xyzIsNull(queryInput.options.customOnload)){
                            queryInput.options.customOnload(queryInput.options);
                        }
                        if(!xyzIsNull(queryInput.options.customSetValue)){
                            queryInput.options.customSetValue(queryInput.options);
                        }
                        if(!xyzIsNull(queryInput.options.customSetText)){
                            queryInput.options.customSetText(queryInput.options);
                        }
                        if(!xyzIsNull(queryInput.options.customGetValue)){
                            queryInput.options.customGetValue(queryInput.options);
                        }
                        if(!xyzIsNull(queryInput.options.customGetText)){
                            queryInput.options.customGetText(queryInput.options);
                        }
                        if(!xyzIsNull(queryInput.options.customGetHtml)){
                            queryInput.options.customGetHtml(queryInput.options);
                        }
                        continue
                    }

                    //生成doubledate
                    if(queryInput.type == "doubleDate"){
                        var queryInputBox = '<div class="queryInputBox"><input type="text" id="dateStart-' + queryInput.key + that.pluginData.id + '\" queryValue ="dateStr" dateStr = \"' + queryInput.key + '\" dateStart = ""> ~&nbsp;&nbsp; <input type="text" id=\"dateEnd-' + queryInput.key + that.pluginData.id + '\" queryValue ="dateStr" dateStr = \"' + queryInput.key + '\" dateEnd=""><div class="inputButton"><span class="dropClear">清空</span><span class="finish" queryKey="' + queryInput.key + '">完成</span><span class="plsSearch">查询</span></div></div>';
                      /*  if(num == 0 && add == false){
                            $queryInputBoxs.append(queryInputBox);
                        } else {
                            if(num - 1 < 0){
                                $queryInputBoxs.find(".queryInputBox").eq(num).before(queryInputBox);
                            } else {
                                $queryInputBoxs.find(".queryInputBox").eq(num-1).after(queryInputBox);
                            }
                        }*/
                        $queryInputBoxs.append(queryInputBox);
                        var dateValue = queryInput.options.value;
                        var dateStartValue ='';
                        var dateEndValue ='';

                        if(!xyzIsNull(dateValue)){
                            if(dateValue.lastIndexOf('^')==0){
                                dateStartValue = dateValue.substring(0,dateValue.indexOf('^'));
                            } else if(dateValue.indexOf('^') == 0){
                                dateEndValue = dateValue.substring(dateValue.lastIndexOf('^')+1,dateValue.length);
                            } else{
                                dateStartValue = dateValue.substring(0,dateValue.indexOf('^'));
                                dateEndValue = dateValue.substring(dateValue.lastIndexOf('^')+1,dateValue.length);
                            }
                        }

                        $('#dateStart-'+ queryInput.key+that.pluginData.id).datebox({
                            width: 118,
                            height:28,
                            panelWidth:276,
                            panelHeight:300,
                            value:dateStartValue
                        });
                        $('#dateEnd-'+ queryInput.key+that.pluginData.id).datebox({
                            width: 118,
                            height:28,
                            panelWidth:276,
                            panelHeight:300,
                            value:dateEndValue
                        });
                        continue
                    }

                    var queryInputBox = "";
                    if(queryInput.type == "datebox"){
                        queryInputBox = '<div class="queryInputBox"><input type="text" id="search-'  + queryInput.key + that.pluginData.id+ '" queryValue ="' + queryInput.key + '"><div class="inputButton"><span class="dropClear">清空</span><span class="finish" queryKey="' + queryInput.key + '">完成</span><span class="plsSearch">查询</span></div></div>';
                    } else {
                        queryInputBox = '<div class="queryInputBox"><input type="text" id="search-'  + queryInput.key + that.pluginData.id+ '" queryValue ="' + queryInput.key + '"><div class="inputButton"><span class="finish" queryKey="' + queryInput.key + '">完成</span><span class="plsSearch">查询</span></div></div>';
                    }
                    $queryInputBoxs.append(queryInputBox);

      /*              if(num == 0 && add == false){
                        $queryInputBoxs.append(queryInputBox);
                    } else {
                        if(num - 1 < 0){
                            $queryInputBoxs.find(".queryInputBox").eq(num).before(queryInputBox);
                        } else {
                            $queryInputBoxs.find(".queryInputBox").eq(num-1).after(queryInputBox);
                        }
                    }*/
                    var id = "search-" + queryInput.key + that.pluginData.id;

                    // 生成日历
                    if(queryInput.type == "datebox") {
                        var dateValue = queryInput.options.value;
                        $('#' + id).datebox({
                            width: 118,
                            height:28,
                            panelWidth:276,
                            panelHeight:300,
                            value:dateValue
                        });
                        continue
                    }
                    // 生成日期时间输入框
                    if(queryInput.type == "datetimebox") {
                        var dateValue = queryInput.options.value;
                        $('#' + id).datetimebox({
                            width: 170,
                            height:28,
                            panelWidth:276,
                            panelHeight:320,
                            value:dateValue
                        });
                        continue
                    }
                    //生成comboboxmap[id]
                    if(queryInput.type == 'combobox'){
                        queryInput.options.height=28;
                        queryInput.options.combobox = id;
                        /*console.log($("#"+ id));*/
                        xyzCombobox(queryInput.options);
                        if(queryInput.options.width !== undefined){
                            var width = Number(queryInput.options.width) - 46;
                            var css = "margin-left:0px;margin-right:36px;padding-top:0px;padding-top:0px;padding-bottom:0px;height:26px;line-height:26px;width:"+width+"px!important;";

                            $("#"+ id).combobox("textbox").css("cssText",css);
                        }
                    } else {
                        //生成textbox
                        $("#"+id).textbox({
                            height:28,
                            prompt: queryInput.options.data.prompt,
                            value: queryInput.options.value
                        });
                        xyzTextbox(id);
                    }

                }
            }
        };
        /*--渲染条件的方法--*/
        that.render = function (data) {
            createQueryLi(data);

            createInput(data);
        };
        that.render();
        /* --执行onLoad方法 --*/
        if (typeof that.pluginData.onLoad == "function"){
            $("#"+that.pluginData.id).on("ajaxStop",function () {
                plsSearchData.onLoad();
                $("#"+that.pluginData.id).off("ajaxStop");
            });
        }
        /*--获取查询数据的方法--*/
        that.createSearchData = function (){

            that.searchData = {};//搜索的数据的基本数据
            that.searchAllData = []; //搜索的数据的全部数据

            for(var data in that.pluginData.data) {//遍历总数据
                var searchData = that.pluginData.data[data];
                if(searchData.defaultQuery == "true"){//遍历显示的数据
                    if( typeof searchData.options.value === 'object' ){
                        if(!xyzIsNull(searchData.options.value[0])||searchData.options.value.length > 1){
                            that.searchData[searchData.key] = searchData.options.value.join(',');
                            that.searchAllData.push({key:searchData.key,value:searchData.options.value.join(','),text:searchData.options.text.join(','),html:searchData.options.html.join(',')});
                        }
                    } else {
                        if(!xyzIsNull(searchData.options.value)){
                            that.searchData[searchData.key] = searchData.options.value;
                            that.searchAllData.push({key:searchData.key,value:searchData.options.value,text:searchData.options.text,html:searchData.options.html});
                        }
                    }
                }
            }
            delete that.searchData.AIquery;
        };


        /*--其他设置-点击设置--*/

        /*--点击设置--*/

        var $searchIconLock = $("#"+that.pluginData.id+" .search-main .icon-suo");
        var $searchIconOpenLock = $("#"+that.pluginData.id+" .search-main .icon-jiesuo");
        var $searchSetRestore = $("#"+that.pluginData.id+" .search-setRestore");
        var $searchLablelNowArrows = $("#"+that.pluginData.id+" .lablelNowArrows");



        //点击group组件的数据

        var $searchScrollerLeft = $("#"+that.pluginData.id+" .search-queryScrollerLeft");
        var $searchScrollerRight = $("#"+that.pluginData.id+" .search-queryScrollerRight");
        var queryScroller =  function () {
            var scrollBoxWidth = $searchQueryLabelWrap.width();
            var scrollContentWidth  = $searchLabelsWrapul.children().length*130;//130为li宽度
            if(scrollContentWidth>scrollBoxWidth-130){ //130为search-aiQuery的宽度
                var scrollWidth = scrollContentWidth - scrollBoxWidth + 58 + 130;//58为滚动条左右按钮宽度
                $searchLabelsWrapul.width(scrollContentWidth);
                $searchQueryLabelWrap.addClass("scroll");
                $searchScrollerLeft.show();
                $searchScrollerRight.show();
                if($searchLabelsWrap.find('.icon-clear.now').length>0){
                    $searchLabelsWrapul.css({left:-scrollWidth});
                } else {
                    $searchLabelsWrapul.css({left:0});
                }

                searchScrollerClick(scrollWidth);
            } else {
                $searchLabelsWrapul.width(scrollBoxWidth);
                $searchQueryLabelWrap.removeClass("scroll");
                $searchScrollerLeft.hide();
                $searchScrollerRight.hide();
                $searchLabelsWrapul.unbind("mousewheel");
                $searchLabelsWrapul.css({left:0});
            }
        };
        var searchScrollerClick = function (scrollWidth) {
            var scrollWidth = scrollWidth;
            $searchScrollerLeft.off("click").on("click",function (){
                var left = $searchLabelsWrapul.position().left;
                if(left<-130){
                    $searchLabelsWrapul.css({left:left+130});
                } else {
                    $searchLabelsWrapul.css({left:0});
                }

            });
            $searchScrollerRight.off("click").on("click",function (){
                var left = $searchLabelsWrapul.position().left;
                if(left>-scrollWidth+130) {
                    $searchLabelsWrapul.css({left: left - 130});
                } else {
                    $searchLabelsWrapul.css({left: -scrollWidth});
                }
            });

            $searchLabelsWrapul.bind("mousewheel", function (event, delta) {
                $queryInputBoxs.find('.queryInputBox').has(':visible').find('.finish').click();
                var dir = delta > 0 ? 'Up' : 'Down';
                if (dir === 'Up') {
                    var left = $searchLabelsWrapul.position().left;
                    if(left<-130){
                        $searchLabelsWrapul.css({left:left+130});
                    } else {
                        $searchLabelsWrapul.css({left:0});
                    }
                } else {
                    var left = $searchLabelsWrapul.position().left;
                    if(left>-scrollWidth+130) {
                        $searchLabelsWrapul.css({left: left - 130});
                    } else {
                        $searchLabelsWrapul.css({left: -scrollWidth});
                    }
                }
            });

        };
        queryScroller();

        function isPc() {
            var userAgentInfo = navigator.userAgent;
            var Agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];  //判断用户代理头信息
            var flag = true;
            for (var v = 0; v < Agents.length; v++) {
                if (userAgentInfo.indexOf(Agents[v]) !== -1) { flag = false; break; }
            }
            return flag;   //true为pc端，false为非pc端
        }

        $(window).resize(function () {
            if(isPc()){
                $(document).mousedown();
                $queryInputBoxs.find('.finish').click();
            }

            $selectGroupBoxs.hide();
            var timer = setTimeout(function () {
                queryScroller();
                clearTimeout(timer);
            },200);
        })


        //点击group组件
        $selectSelectGroup.on('click',' .search-selectItem',function (item) {
            var num = Object.keys(that.pluginGroup).length;
            $selectGroupBoxs.css({'max-height':that.scrollMaxHeight});
            var scrollContentHeight = 0;

            var index = $(this).index();
            var right = num - index - 1;
            $("#"+that.pluginData.id+" .sbarbox").hide();
            if ($selectGroupBoxs.find('.selectGroupBox').eq(index).is(":hidden")) {
                $selectGroupBoxs.show().css({"right": right * 47});
                $selectGroupBoxs.find('.selectGroupBox').eq(index).addClass('now').siblings().removeClass('now');
            } else {
                $selectGroupBoxs.hide();
                $selectGroupBoxs.find('.selectGroupBox').eq(index).removeClass('now');
            }

            scrollContentHeight =  $selectGroupBoxs.find('.selectGroupBox').eq(index).children().length*29;
            if(scrollContentHeight>that.scrollMaxHeight){//判断是否出现滚动条
                initscroll($selectGroupBoxs.find('.selectGroupBox').eq(index),that.scrollMaxHeight,scrollContentHeight);
            };

            $(document).off(".plsGroupBox").on("mousedown.plsGroupBox mousewheel.plsGroupBox",function(e){
                var p=$(e.target).closest("#"+that.pluginData.id+" .selectGroupBox,#"+that.pluginData.id+" .search-selectGroup");
                if(p.length){
                    return;
                }
                if($selectGroupBoxs.find('.selectGroupBox').is(':visible') == true){
                    $selectGroupBoxs.hide();
                    $(document).off(".plsGroupBox");
                }
            });
        }) ;
        //点击group选项
        $selectGroupBoxs.on('click',' .selectGroupBoxs li',function () {
            $selectGroupBoxs.hide();

            var key = $(this).attr("queryValue");

            if(that.pluginData.data[key].defaultQuery == "true"){
                var $target = $searchLabelsWrapul.find('li').has('a[queryValue="'+key+'"]');
                var index = $target.index();
                $target.click();

            } else {
                that.pluginData.data[key].defaultQuery = "true";

                createQueryLi("clickAdd");
                var $target = $searchLabelsWrapul.find('li').has('a[queryValue="'+key+'"]');
                $target.find('.icon-clear').addClass('now');

                createInput("clickAdd");
                $target.click();
                //判断是否出现超出宽度
                queryScroller();
            }
        });

        //comboboxPanel选中样式重写
        function getComboPanelId(id,type){
            var $query =  $queryInputBoxs.find(".queryInputBox");
            $query.addClass('newQueryBox');
            if(type == "combobox" ||type == "datebox" || type == "datetimebox" ||type == "doubleDate"){
                var $panelid = $('#'+id).combobox('panel').parent();
                $panelid.addClass('comboxSelect');
            }
        }
        //点击li搜索选项
        $searchQueryLabelWrap.on('click','li',function () {
            var $this = $(this);
            var $target =  $queryInputBoxs.find(".queryInputBox").eq($this.index());
            var key = $this.find("a").attr("queryValue");
            var maytekQLeft = $("#"+that.pluginData.id).offset().left;
            var documentWidth = $(document).width() - maytekQLeft- 16 ;
            var scrollBoxWidth = $searchLabelsWrap.width();
            var ulLeft = $searchLabelsWrapul.position().left;
            var inputLeft1 = $this.position().left;
            var time = 0;

            $queryInputBoxs.css({width:documentWidth + 'px'});
            if(inputLeft1+130+ulLeft>scrollBoxWidth+1){
                $searchLabelsWrapul.css({left:scrollBoxWidth-inputLeft1-130});
                time = 520;
            }
            if(inputLeft1+ulLeft<0){
                $searchLabelsWrapul.css({left:-inputLeft1});
                time = 520;
            }

            $this.removeClass('now');
            $searchQueryLabelWrap.removeClass('now');

            if($queryInputBoxs.find('.queryInputBox').is(':visible') == true){
                var visiKey = $queryInputBoxs.find('.queryInputBox').has(':visible').find(".finish").attr("querykey");
                $queryInputBoxs.find('.queryInputBox').has(':visible').find('.finish').click();

                if(key == visiKey){
                    return
                }
            }
            if ($target.is(":hidden")) {
                $queryInputBoxs.find('.queryInputBox').hide();
                $queryInputBoxs.show();

                var t = setTimeout(function () {
                    var inputLeft = $this.offset().left-$("#"+that.pluginData.id).offset().left;
                    var $targetWidth = $target.outerWidth();
                    $target.show();

                    $searchLablelNowArrows.css({'left':inputLeft-22+60-that.pluginData.marginLeft});//22为锁的宽度，60为lable框的一半
                    if(documentWidth-inputLeft<$targetWidth){
                        $target.removeAttr('style').css({'right':10});
                    } else {
                        $target.removeAttr('style').css({'left':inputLeft});
                    }

                    $this.addClass("now").siblings().removeClass("now");
                    $searchQueryLabelWrap.addClass('now');
                    $target.show();

                    if(that.pluginData.data[key].type == "combobox"){
                        $target.find('input[queryvalue]').combobox("showPanel");
                    }
                    if(that.pluginData.data[key].type == "datebox"){
                        $target.find('input[queryvalue]').datebox("showPanel");
                    }
                    if(that.pluginData.data[key].type == "datetimebox"){
                        $target.find('input[queryvalue]').datetimebox("showPanel");
                    }
                    if(that.pluginData.data[key].type == "doubleDate"){
                        $target.on("focus","input",function () {
                            $(this).parent().prev().datebox("showPanel");
                        });
                        $target.find('input[queryvalue]').eq(0).next().find("input").focus();
                    } else {
                        $target.find("input").focus();
                    }

                    var $targetpanelId = $target.find('input[queryValue]').attr('id');
                    getComboPanelId($targetpanelId,that.pluginData.data[key].type);

                    $(document).off(".plsInputBoxs").on("mousedown.plsInputBoxs",function(e){
                            var p = $(e.target).closest("span.combo,div.combo-p,div.menu,#"+that.pluginData.id+" .queryInputBox,#"+that.pluginData.id+" .search-queryLabelWrap li");
                            if(p.length){
                                return;
                            }
                            if($queryInputBoxs.find('.queryInputBox').is(':visible') == true){

                                $queryInputBoxs.find('.queryInputBox').has(':visible').find('.finish').click();
                                if($queryInputBoxs.find('.queryInputBox').is(':visible') == false){
                                    $(document).off(".plsInputBoxs");
                                }
                            }
                    });
                    $(document).off(".mxkeydown").on("keydown.mxkeydown",function (e) {
                        if(e.which == 13){
                            $(document).mousedown();
                            $target.find(".plsSearch").click();
                        }
                    });
                    $target.find("input").off(".mxkeydown1").on("keydown.mxkeydown1",function (e) {
                        if(e.which == 13){
                            $target.find("input").off(".mxkeydown1");
                            $(document).mousedown();
                            $target.find(".plsSearch").click();
                        }
                    });
                    clearTimeout(t);
                },time);
            } else {
                $queryInputBoxs.hide();
            }
            $selectGroupBoxs.hide();

        });

        //点击aiquery
        $searchAiQuery.find('textarea').on('blur',function () {
            var text = $searchAiQuery.find('textarea').val();
            text = text.replace(/^\s*|\s*$/g,'');//替换字符串，开头和结尾的空格。

            if(text.indexOf(that.pluginData.data.AIquery.options.data.prompt)>-1){
                text = '';
            }

            if(!xyzIsNull(text)){
                var re;
                var key = '';

                if(!xyzIsNull(that.pluginData.data.AIquery.AIMatch)){
                    for(var i=0;i<that.pluginData.data.AIquery.AIMatch.length;i++){
                        if(!xyzIsNull(key)){
                            break
                        }
                        re = new RegExp(that.pluginData.data.AIquery.AIMatch[i].re);

                        if(re.test(text)){
                            key = that.pluginData.data.AIquery.AIMatch[i].key;

                            $searchAiQuery.find('textarea').removeClass('now');
                            $searchAiQuery.find('textarea').val(that.pluginData.data.AIquery.options.data.prompt);
                            $searchAiQuery.find('.icon-clear').removeClass('now');
                        }
                    }
                }

                if(!xyzIsNull(key)){
                    if(!xyzIsNull(that.pluginData.data[key])){

                        if(that.pluginData.data[key].defaultQuery !== "true"){
                            that.pluginData.data[key].options.text = text;
                            that.pluginData.data[key].options.value = text;
                            that.pluginData.data[key].defaultQuery = "true";
                            that.render("clickAdd");

                            $searchLabelsWrap.find('a[queryValue="'+key+'"]').parent().parent().find('.icon-clear').addClass('now');
                            //判断是否出现超出宽度
                            queryScroller();
                        } else {

                            if(that.pluginData.data[key].type == "textbox"){
                                that.pluginData.data[key].options.text = text;
                                that.pluginData.data[key].options.value = text;
                                $("#search-" + key + that.pluginData.id).textbox('setValue',text);
                            }

                            if(that.pluginData.data[key].type == "combobox"){
                                that.pluginData.data[key].options.text = text;
                                that.pluginData.data[key].options.value = text;
                                $("#search-" + key + that.pluginData.id).combobox('setValue',text);
                            }
                            $queryInputBoxs.find('input[queryValue="'+key+'"]').parent().find('.finish').click();

                        }
                    }
                } else {
                    $searchAiQuery.find('textarea').css({color:"red"});
                }


            } else {
                $searchAiQuery.find('textarea').removeClass('now');
                $searchAiQuery.find('textarea').val(that.pluginData.data.AIquery.options.data.prompt);
                $searchAiQuery.find('.icon-clear').removeClass('now');
            }

        });
        $searchAiQuery.find('textarea').on('focus',function () {
            var text = $searchAiQuery.find('textarea').val();
            $searchAiQuery.find('textarea').addClass('now');
            $searchAiQuery.find('.icon-clear').addClass('now');
            $searchAiQuery.find('textarea').removeAttr('style');

            if(text.indexOf(that.pluginData.data.AIquery.options.data.prompt)>-1){
                $searchAiQuery.find('textarea').val('');
            }
        });

        $searchAiQuery.find('textarea').off(".mxkeydown").on("keydown.mxkeydown",function (e) {
            if(e.which == 13){
                $searchAiQuery.find('textarea').blur();
                $('#searchBtn-'+ that.pluginData.id).click();
            }
        });

        //点击清空智能框
        $searchAiQuery.on('click','.icon-clear',function () {
            $searchAiQuery.find('textarea').val('');
            $searchAiQuery.find('textarea').blur();
        });

        //点击完成
        $queryInputBoxs.on('click','.finish',function () {
            //默认canSearch;
            canSearch = true;
            var key = $(this).attr('queryKey');
            var value;
            var text = '';
            var  html = '';
            var $this = $(this).parent().parent().find('input[queryvalue]');

            if(that.pluginData.data[key].type == 'combobox'){
                var htmlData = $this.combobox("getData");

                if(that.pluginData.data[key].options.multiple == true){
                    value = $this.combobox("getValues");
                    value = value.join(',');
                } else {
                    value = $this.combobox("getValue");
                }
                text = $this.combobox("getText");

                //判断是否有resize造成，异步请求数据，取不到text值，text变为value值
                if(that.pluginData.data[key].options.value == value){
                    text = !!that.pluginData.data[key].options.text ? that.pluginData.data[key].options.text : text;
                }

                if(value.substring(0,1) == ","){
                    value = value.substring(1,value.length);
                    text = text.substring(1,text.length);
                }
                if(text.indexOf(',')>-1){
                    text.split(',').forEach(function (v) {
                        var  htmlitem = '';
                        htmlData.forEach(function (t) {
                            if(t.text == v){
                                htmlitem = !xyzIsNull(t.html)?t.html:'';
                            }
                        });
                        html = xyzIsNull(htmlitem)?html+v+',':html+htmlitem;
                    });
                }
            }

            if(that.pluginData.data[key].type == 'textbox'){
                text = $this.textbox("getText");
                value = text;
            }
            var pattern = /^\d{4}(\-|\/|.)\d{1,2}\1\d{1,2}$/;
            if(that.pluginData.data[key].type == 'datebox'){
                value = $this.datebox("getValue");
                if(pattern.test(value)){
                    /^\d{4}(\-|\/|.)\d{1}\1\d{1}$/.test(value)? value = value.replace(/(\-|\/|.)(\d{1})/g,"$10$2"):value;
                    value = value;
                    text = value;
                } else {
                    value = '';
                    text = '';
                }
            }
            var pattern = /^\d{4}(\-|\/|.)\d{1,2}\1\d{1,2}/;
            if(that.pluginData.data[key].type == 'datetimebox'){
                value = $this.datetimebox("getValue");
                if(pattern.test(value)){
                    /^\d{4}(\-|\/|.)\d{1}\1\d{1}$/.test(value)? value = value.replace(/(\-|\/|.)(\d{1})/g,"$10$2"):value;
                    value = value;
                    text = value;
                } else {
                    value = '';
                    text = '';
                }
            }

            if(that.pluginData.data[key].type == 'doubleDate'){
                var $dateStart = $(this).parent().parent().find('input[datestart]');
                var $dateEnd = $(this).parent().parent().find('input[dateend]');

                var startValue =$dateStart.datebox("getValue");
                var endValue =$dateEnd.datebox("getValue");
                var startText = '';
                var endText = '';
                //解决双日期，鼠标选择删除，没有清空值的清空。
                if($dateStart.next("span").find("input").eq(0).val() == ""){
                    $dateStart.datebox("clear");
                    startValue = "";
                }
                //解决结束日期>开始日期
                if(new Date(startValue)>new Date(endValue)){
                    $dateStart.datebox("clear");
                    $dateEnd.datebox("clear");
                    startValue = "";
                    endValue = "";
                    $.messager.alert('警告','开始日期大于结束日期');
                    canSearch = false;
                }
                if(pattern.test(startValue)){
                    /^\d{4}(\-|\/|.)\d{1}\1\d{1}$/.test(value)? startValue = startValue.replace(/(\-|\/|.)(\d{1})/g,"$10$2"):startValue;
                    startValue = startValue;
                    startText = '起'+ startValue ;
                } else {
                    startValue = '';
                    startText = '';
                }

                if(pattern.test(endValue)){
                    /^\d{4}(\-|\/|.)\d{1}\1\d{1}$/.test(value)? endValue = endValue.replace(/(\-|\/|.)(\d{1})/g,"$10$2"):endValue;
                    endValue = endValue;
                    endText = '止'+ endValue ;
                } else {
                    endValue = '';
                    endText = '';
                }

                value = xyzIsNull(startValue)?xyzIsNull(endValue)?'':'^doubleDate^' + endValue:xyzIsNull(endValue)?startValue + '^doubleDate^':startValue + '^doubleDate^' + endValue;
                text = xyzIsNull(startText)?xyzIsNull(endText)?'':endText:xyzIsNull(endText)?startText:startText + '<br>' + endText;
            }

            if(that.pluginData.data[key].type == 'customSearch'){
                value = that.pluginData.data[key].options.customGetValue(that.pluginData.data[key].options);
                that.pluginData.data[key].options.value = value;
                text = that.pluginData.data[key].options.customGetText(that.pluginData.data[key].options);
                that.pluginData.data[key].options.text = text;
                if(!xyzIsNull(that.pluginData.data[key].options.customGetHtml)){
                    html = that.pluginData.data[key].options.customGetHtml(that.pluginData.data[key].options);
                }
            }

            if(xyzIsNull(text)){
                $searchLabelsWrap.find('a[queryValue="'+key+'"]').parent().parent().removeClass('select');
            } else {
                $searchLabelsWrap.find('a[queryValue="'+key+'"]').parent().parent().addClass('select');
            }

            if(xyzIsNull(html)){
                $searchLabelsWrap.find('a[queryValue="'+key+'"]').next().find('p').html(text);
            } else {
                $searchLabelsWrap.find('a[queryValue="'+key+'"]').next().find('p').html(html);
            }
            $searchLabelsWrap.find('a[queryValue="'+key+'"]').next().attr('title',text) ;

            that.pluginData.data[key].options.value = value;
            that.pluginData.data[key].options.text = text;
            that.pluginData.data[key].options.html = html;

            if(!canSearch){
                return
            }
            $(document).off(".mxkeydown");
            $queryInputBoxs.hide();
            $searchLabelsWrap.find('li').removeClass('now');
            $searchQueryLabelWrap.removeClass('now');
        });
        //点击查询
        $queryInputBoxs.on('click','.plsSearch',function () {
            $(this).prev().click();
            $('#searchBtn-'+ that.pluginData.id).click();
        });
        //点击组件清空
        $queryInputBoxs.on('click','.dropClear',function () {
            $(this).parent().parent().find(".datebox-f,.datetimebox-f").datebox('clear');
        });
        /*--点击可增删设置--*/
        $("#"+that.pluginData.id+" .search-main .search-setSave").toggle(function () {//锁关保存设置，锁开恢复默认设置
            $searchIconLock.hide();
            $searchIconOpenLock.show();
            $searchLabelsWrap.addClass("set");
            $selectGroupBoxs.hide();

        },function () {
            $searchIconLock.show();
            $searchIconOpenLock.hide();
            $searchLabelsWrap.removeClass("set");
            $searchLabelsWrap.find('.icon-clear').removeClass("now");
            $selectGroupBoxs.hide();

            /*设置后上传保存新增减的选项*/
            that.selfQueryContent = {};//搜索的数据的基本数据

            for(var data in that.pluginData.data) {
                var Boole = that.pluginData.data[data].defaultQuery == "true"?"true":"false";
                var value = that.pluginData.data[data].options.value;
                var text = that.pluginData.data[data].options.text;
                var html = that.pluginData.data[data].options.html;

                that.selfQueryContent[data] = {};
                that.selfQueryContent[data].defaultQuery = Boole;

                if( typeof value === 'object' ) {
                    if(!(value.length==1&&xyzIsNull(value[0]))){
                        that.selfQueryContent[data].value = value;
                    }
                } else {
                    if(!xyzIsNull(value)){
                        that.selfQueryContent[data].value = value;
                    }
                }

                if(!xyzIsNull(text)){
                    that.selfQueryContent[data].text = text;
                }

                if(!xyzIsNull(html)){
                    html = html.indexOf('\'')>-1?html:html.replace(/\"/g, '\'');
                    that.selfQueryContent[data].html = html;
                }
                if (Boole === "true" && data !== 'AIquery'){
                    let index = $("#"+that.pluginData.id+" .queryLabelBox a[queryvalue='"+data+"']").parent().parent().index()
                    that.selfQueryContent[data].index = index;
                }
            }
            var keyCode ="searchSelfQuery-" + that.pluginData.id;
            var selfQueryContent = stringify(that.selfQueryContent);
            xyzAddUserOper(keyCode, selfQueryContent, "");
            top.$.messager.alert("提示","已为您保存默认查询条件<br>下次登录或全页刷新后生效！","info");
        });

        /*--点击删除选择项--*/
        $searchLabelsWrap.on("click",".icon-clear",function (e) {
            var e = e||event;
            e.stopPropagation();
            e.cancelBubble = true;
            var $this = $(this).parent();
            var $target =  $queryInputBoxs.find(".queryInputBox").eq($this.index());
            var key = $this.find("a").attr("queryValue");

            that.pluginData.data[key].defaultQuery = "false";
            that.pluginData.data[key].options.value = "";
            that.pluginData.data[key].options.text = "";

            if(that.pluginData.data[key].type == "combobox"){
                $target.find('input[queryvalue]').combobox("destroy");
            }

            if(that.pluginData.data[key].type == "datebox"){
                $target.find('input[queryvalue]').datebox("destroy");
            }

            if(that.pluginData.data[key].type == "doubleDate"){
                $target.find('input[queryvalue]').datebox("destroy");
            }

            $queryInputBoxs.find(".queryInputBox").eq($this.index()).remove();
            $this.remove();
            $queryInputBoxs.find('.finish').click();

            queryScroller();
        });

        /*--点击恢复初始选择项--*/
        $searchSetRestore.click(function () {
            parent.$("#iframeLoadingMask").show();
            $selectGroupBoxs.hide();
            $searchAiQuery.find('.icon-clear').click();

            that.pluginData = that.defaultPluginData;
            that.initData();
            that.render("default");
            queryScroller();
            parent.$("#iframeLoadingMask").hide();
            //保存默认的总的数据，防止被浅拷贝
            that.defaultPluginData = stringify(that.defaultPluginData);
            that.defaultPluginData = parseJson(that.defaultPluginData);
            var keyCode ="searchSelfQuery-" + that.pluginData.id;
            xyzAddUserOper(keyCode, "", "");//清除自定义设置
        });

        /*--点击清空选值--*/
        $searchClearLablel.click(function () {
            //清除选择值
            for(var input in that.pluginData.data){//遍历总数据
                var queryInput = that.pluginData.data[input];

                if(queryInput.defaultQuery == "true") {//判断显示的搜索选项

                    //智能
                    if (queryInput.key == 'AIquery') {
                        continue
                    }
                    queryInput.options.value = '';
                    queryInput.options.text = '';
                    queryInput.options.html = '';
                }
            }

            //清除input框值
            $searchAiQuery.find('textarea').val('');
            $searchAiQuery.find('textarea').blur();
            $queryInputBoxs.find("a.icon-clear").click();
            $queryInputBoxs.find(".datebox-f,.datetimebox-f").datebox('clear');
            $queryInputBoxs.find('input[customsearch]').map(function (t) {
                var key = $(this).attr('queryvalue');
                if(!xyzIsNull(that.pluginData.data[key].options.customSetValue)){
                    that.pluginData.data[key].options.customSetValue(that.pluginData.data[key].options);
                }
                if(!xyzIsNull(that.pluginData.data[key].options.customSetText)){
                    that.pluginData.data[key].options.customSetText(that.pluginData.data[key].options);
                }
            });

            //清除labelli框值
            $searchLabelsWrap.find('div[title]').attr('title','');
            $searchLabelsWrap.find('p').html('');
            $searchLabelsWrap.find('li').removeClass('select');

            $selectGroupBoxs.hide();

        });

        var num = 0;
        /*--点击搜索按钮查询--*/
        that.getSearchData = function () {
            $selectGroupBoxs.hide();
            that.createSearchData();
            if(num == 0 && !isSelfData){
                that.searchData.flagDefaultFastForQuery = 'flagDefaultFastForQueryYes';
            } else {
                that.searchData.flagDefaultFastForQuery = 'flagDefaultFastForQueryNo';
            }
            num++;
            that.searchData =  stringify(that.searchData);
            return that.searchData
        };

        //点击查询按钮
        $('#searchBtn-'+ that.pluginData.id).click(function () {
            if(!canSearch){
                canSearch = true;
                return
            }
            var data =  that.getSearchData();
            if( typeof that.pluginData.onQuery === 'function'){
                plsSearchData.onQuery(data);
            } else {
                return data;
            }
        });
        /**/
        that.setValue = function (data) {
            if(!that.pluginData.data[data.key]){
                return
            }
            if(!that.pluginData.data[data.key].defaultQuery || that.pluginData.data[data.key].defaultQuery == "false"){
                that.pluginData.data[data.key].defaultQuery = "true";
                createQueryLi("clickAdd");
                createInput("clickAdd");
                //判断是否出现超出宽度
                queryScroller();
            }
            var type = that.pluginData.data[data.key].type;

            if(type == 'customSearch'){
                if(typeof data.value == "object"){
                    data.value = data.value.join(',');
                }
                that.pluginData.data[data.key].options.value = data.value;
                if(!xyzIsNull(that.pluginData.data[data.key].options.customSetValue)){
                    that.pluginData.data[data.key].options.customSetValue(that.pluginData.data[data.key].options);
                }
                $queryInputBoxs.find('input[queryValue="'+data.key+'"]').parent().find('.finish').click();
                return

            }
            if(type == 'doubleDate') {
                var dateStartValue ='';
                var dateEndValue ='';
                if(!xyzIsNull(data.value)){
                    if(data.value.lastIndexOf('^')==0){
                        dateStartValue = data.value.substring(0,data.value.indexOf('^'));
                    } else if(data.value.indexOf('^') == 0){
                        dateEndValue = data.value.substring(data.value.lastIndexOf('^')+1,data.value.length);
                    } else{
                        dateStartValue = data.value.substring(0,data.value.indexOf('^'));
                        dateEndValue = data.value.substring(data.value.lastIndexOf('^')+1,data.value.length);
                    }
                }
                $('#dateStart-'+ data.key+that.pluginData.id).datebox({
                    value:dateStartValue
                });
                $('#dateEnd-'+ data.key+that.pluginData.id).datebox({
                    value:dateEndValue
                });
                $queryInputBoxs.find('input[datestr="'+data.key+'"]').parent().find('.finish').click();
                return
            }

            if(that.pluginData.data[data.key].options.multiple == true){
                if(typeof data.value == "string"){
                    data.value = data.value.split(',');
                }
                $queryInputBoxs.find('input[queryValue="'+data.key+'"]')[type]('setValues',data.value);
            } else {
                $queryInputBoxs.find('input[queryValue="'+data.key+'"]')[type]('setValue',data.value);
            }
            var key = $queryInputBoxs.find(">div:visible").find(">input").attr("queryvalue");
            if(key != data.key && !!key){
                $queryInputBoxs.find('input[queryValue="'+key+'"]').parent().find('.finish').click();

                if(!xyzIsNull(data.text)){
                    that.pluginData.data[key].options.text = data.text;
                    $searchLabelsWrap.find('a[queryValue="'+key+'"]').next().find('p').html(data.text);
                }
                if(xyzIsNull(data.html)){
                    that.pluginData.data[key].options.html = data.html;
                    $searchLabelsWrap.find('a[queryValue="'+key+'"]').next().find('p').html(data.html);
                }
            }

            $queryInputBoxs.find('input[queryValue="'+data.key+'"]').parent().find('.finish').click();
            if(!xyzIsNull(data.text)){
                that.pluginData.data[data.key].options.text = data.text;
                $searchLabelsWrap.find('a[queryValue="'+data.key+'"]').next().find('p').html(data.text);
            }
            if(!xyzIsNull(data.html)){
                that.pluginData.data[data.key].options.html = data.html;
                $searchLabelsWrap.find('a[queryValue="'+data.key+'"]').next().find('p').html(data.html);
            }

        };

        that.getValue = function (data) {
            return that.pluginData.data[data.key].options.value
        };

        that.getText = function (data) {
            return that.pluginData.data[data.key].options.text
        };

        that.getHtml = function (data) {
            return that.pluginData.data[data.key].optdocument.titleions.html
        };
        that.destroy = function () {
            $searchLabelsWrap.find(".icon-clear").click();
            $("#"+that.pluginData.id).html("");
        };
    }
    var MaytekQ = {};
    var map = {};

    MaytekQ.init = function(data){
        if(xyzIsNull(data)||xyzIsNull(data.id)){
            return
        }
        if($("#"+data.id).length<1){
            return
        }

        if(!map[data.id]){
            map[data.id] = new PlsSearchPlugin(data);
        } else {
            for(var k in data){
                if( k == 'group'){
                    var group = data[k];
                    for(var g in group){
                        map[data.id].pluginData.group[g] = group[g];
                    }

                    continue
                }
                map[data.id].pluginData[k] = data[k];
            }

            map[data.id].init();
            map[data.id].creatGroup();
            map[data.id].render();
        }
    };

    MaytekQ.setValue = function(id, key, value){
        if(!map[id]){
            return '';
        }
        if(typeof key == "string"){
            var data = {key:key,value:value};
            map[id].setValue(data);
            return
        }
        if(typeof key == "object"){
            for( var item in key ){
                map[id].setValue({key:item,value:key[item]});
            }
        }
    };

    MaytekQ.setKeyData = function(id, keyData){
        if(!map[id]){
            return '';
        }
        if(Array.isArray(keyData)){
            keyData.forEach(function (t) {
                map[id].setValue(t);
            });
            return
        } else if( typeof keyData == "object"){
            map[id].setValue(keyData);
        }
    };

    MaytekQ.getValue = function(id, key){
        if(!map[id]){
            return '';
        }
        var data = {key:key};
        return map[id].getValue(data);
    };

    MaytekQ.getText = function(id, key){
        if(!map[id]){
            return '';
        }
        var data = {key:key};
        return map[id].getText(data);
    };

    MaytekQ.getKeyData = function(id, key){
        if(!map[id]){
            return '';
        }
        if(xyzIsNull(key)){
            map[id].createSearchData();
            return map[id].searchAllData
        } else {
            return {key:key,value:map[id].getValue(data),text:map[id].getText(data),html:map[id].getHtml(data)};
        }
    }
    MaytekQ.getHtml = function(id, key){
        if(!map[id]){
            return '';
        }
        var data = {key:key};
        return map[id].getHtml(data);
    };

    MaytekQ.getData = function(id){
        if(!map[id]){
            return {};
        }
        return map[id].getSearchData();
    };

    MaytekQ.getId = function(id,key){
        if(!map[id]){
            return {};
        }
        var inputId ="";

        var type = map[id].pluginData.data[key].type;

        if(type == 'customSearch'){
            inputId = $("#"+id+" .queryInputBoxs").find('input[queryvalue="'+key+'"]').prev().attr('id');
        }

        if(type == 'doubleDate'){
            var startId = $("#"+id+" .queryInputBoxs").find('input[datestr="'+key+'"]').eq(0).attr('id');
            var endId = $("#"+id+" .queryInputBoxs").find('input[datestr="'+key+'"]').eq(1).attr('id');
            inputId = [startId,endId];
        } else {
            inputId = $("#"+id+" .queryInputBoxs").find('input[queryvalue="'+key+'"]').attr('id');
        }

        return inputId;
    };

    MaytekQ.clear = function(id){
        if(!map[id]){
            return {};
        }
        $('#'+id+' .search-clearLablel').click();
    };

    MaytekQ.hasMaytekQ = function(id){
    	if(!map[id]){
    		return false;
    	} else {
    		return true;
    	}
    }
    MaytekQ.destroy = function(id){
        if(!map[id]){
            return;
        }
        map[id].destroy();
        delete map[id];

    }
    window.MaytekQ = MaytekQ;
