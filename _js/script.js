$(document).ready(function() {
    init();
});
var JSON_USERNAME = "dantsai";
var JSON_PASSWORD = "npoc3opDL";
var JSON_COUNT_SUFFIX = "?count=100&callback=?";
var JSON_ROOT = "http://feeds.delicious.com/v2/json/dantsai";
var JSON_DUMMY = JSON_ROOT + "/Dummy" + JSON_COUNT_SUFFIX;
var JSON_READ = JSON_ROOT + JSON_COUNT_SUFFIX;
var JSON_EDIT = JSON_ROOT + "/";
var RESULT_ITEM_EXIST_MSG = "item already exists";
//var IMG_LOAD_URL = "http://immediatenet.com/t/m?";
//var IMG_LOAD_URL = "http://wimg.ca/";
//var IMG_LOAD_URL = "http://images.shrinktheweb.com/xino.php?stwembed=1&stwaccesskeyid=f736918c57d9420&"
var IMG_LOAD_URL = "http://api.thumbalizr.com/?url=";
var IMG_SIZE = "sm";
function init() {

    toggleMap();
    displayUserPromptArea(true);
    displayContentArea(false);
    getTrailListFromDelicious(true);
    addTrailItemFromForm();
    updateTrailCountLabel();
    isTrailEmpty();
    loadRecommendations();
}
/** toggle the map view between true and false. Default is true
 * @returns {undefined}
 */
function toggleMap()
{
    if ($("#map-canvas").css("display") == "none")
        $("#map-canvas").css("display", "inline-block");
    else
        $("#map-canvas").css("display", "none");
}



/*
 function addTest()
 {
 for (var i = 1; i <= 10; i++)
 {
 var name = "Test " + i;
 var link = "https://www.google.com/search?q=" + 1;
 var tags = name + ",tag 1,tag 2";
 
 var date = new Date();
 
 var trailItem = createTrailItemFromText(name, link, tags, date)
 addTrailItemToMemex(trailItem);
 
 }
 
 }
 */
/*------------------------------------------------|
 *           TrailItemObject Function             |
 * ----------------------------------------------*/

/**
 * Class of a Trail Item
 * @returns {TrailItem}
 */
function TrailItem() {
    this.url = "";
    this.title = "";
    this.image = "";
    this.order;
    this.description = "";
    this.delicious_id;
    this.date;
    this.parseTrailItemLink = parseTrailItemLink;
    this.tags = {};
    this.formatTrailItemHTML = formatTrailItemHTML;
    this.trailName = "";
}

/**
 * create HTML link for TailItem URL
 * @returns {String}
 */
function parseTrailItemLink() {
    var url = "";
    url += "<a href='" + this.url + "' target='_blank'>" + this.title + "</a>"
    return url;
}

/**
 * generate HTML format for a Mememx list item
 * @returns {String}
 */
function formatTrailItemHTML() {
    var item = "<li><div class='trail-item'>";
//    item += "<img src='" + this.image + "' alt='IMAGE'/>";
//    item += "<script type='text/javascript' src='" + this.image + "' ></script>";


    item += "<div class='trail-item-menu'><ul>";
    item += "<li class='trail-item-edit'>&#9998;</li>";
    item += "<li class='trail-item-delete'>&#9587;</li>";
    item += "<li class='trail-item-up'>&#9650;</li>";
    item += "<li class='trail-item-down'>&#9660;</li>";
    item += "</ul></div>";
    item += "<div class='trail-item-order' value='" + this.order + "'>" + this.order + "</div>";
    item += "<div class='trail-item-link'>" + this.parseTrailItemLink() + "</div>";
    item += "</br><p>" + getNiceTime(this.date) + "</p>";
    item += "</br><ul class='trail-item-tags'>";
    for (var i = 0; i < this.tags.length; i++)
    {
        var tag = this.tags[i];
//        console.log(this.trailName + "..\t" + tag);

        var isTag = tag === this.trailName;
        var isStep;
        try {
            isStep = (this.trailName + "-step") === tag.substring(0, this.trailName.length + 5);
        } catch (err)
        {
            console.log(err);
            isStep = false;
        }
//        console.log("Stripped tag\t" + tag.substring(0, this.trailName.length + 5));
        if (!isTag && !isStep)
            item += "<li>" + tag + "</li>";
    }
    item += "</ul>";
    item += "</div></li>";
    return item;
}
function getTrailNameFromForm()
{
    return $("#memex-trail-name").text();
}
function createTrailItemFromJSON(item)
{
    return createTrailItemFromText(item.d, item.u, "" + item.t, item.dt, getTrailNameFromForm());
}

/**
 * Create a new TrailItem from text
 * @param {String} title
 * @param {String} link
 * @param {Array of Strings} tags
 * @param {Date} date
 * @returns {createTrailItemFromText.trailItem|TrailItem}
 */
function createTrailItemFromText(title, url, tags, date, trailName) {
    var trailItem = new TrailItem();
    trailItem.title = title;
    trailItem.url = url;
    trailItem.tags = tags.split(",");
    if (!(typeof trailName === 'undefined'))
        trailItem.trailName = trailName;
    if (typeof date === 'undefined')
        trailItem.date = new Date();
    else
        trailItem.date = date;
//    trailItem.tags.push(title);
    trailItem.image = loadURLImage(url, IMG_SIZE)
    return trailItem;
}

/*------------------------------------------------|
 *                  ACTIONS                       |
 * ----------------------------------------------*/
/**
 * TODO
 * @returns {undefined}
 */
function addTrailItemFromForm()
{
    $("#submit_button").click(function() {
        try {
            var trailName = getTrailNameFromForm();
            var trailItem = new TrailItem();
//            trailItem.title = $("#memex-trail-name").text();
            trailItem.url = $("#memex-form-link").val();
            trailItem.tags = $("#memex-form-tags").val().split(",");
            trailItem.tags.push(trailName);
            trailItem.date = new Date();
            trailItem.trailName = trailName;
            addTrailItemToMemex(trailItem);
//            console.log("submit clicked");
//            var url = $("#memex-form-link").text();

//            console.log(trailName + "\t" + trailItem.url + "\n" + trailItem.tags);
            addLink(trailItem.url, trailName, trailItem.tags);
            return false;
        } catch (err) {

            console.log("ERROR ----------------\n\n\n" + err);
            return false;
        }

    });
}


function addLink(url, trailName, tags) {
//    console.log("Adding link");
    $.getJSON(JSON_EDIT + trailName + "?callback=?",
            {},
            function(data) {
                // next is the next Step # for this Path
                var next = data.length;
                var trailNameStep = trailName + "-step" + next;
                $.ajax({
                    type: "POST",
                    url: "delicious_proxy.php",
                    data: {username: JSON_USERNAME, password: JSON_PASSWORD, method: "posts/add", url: url, tags: trailNameStep + "," + tags}
                }).done(function(msg) {
                    console.log("DONE");
                    console.log(msg);
                    var result_code = msg.result_code;
                    console.log("RESULT:" + result_code);
                    if (result_code === RESULT_ITEM_EXIST_MSG)
                    {
                        alert(RESULT_ITEM_EXIST_MSG);
                    }
                    if (result_code === "done")
                    {
                        getTrailItemsFromDelicious(trailNameStep, true);
                    }


                });
            });
}


/**
 * Add a trail item to the Memex
 * @param {TrailItem} trailItem
 * @returns {Boolean}
 */
function addTrailItemToMemex(trailItem)
{
    trailItem.order = getTrailSize() + 1;
    var listEl = $(trailItem.formatTrailItemHTML());
    /*listEl.hide();*/
    $("#memex-list ol").append(listEl);
    $("#empty-memex-list").css("display", "none");
    /*removeItem();*/
    updateTrailCountLabel();
    return false;
}

/*
 function removeItem()
 {
 $(".todo-list-remove").click(function() {
 $(this).parent("#todo-list li").fadeOut();
 $(this).parent("#todo-list li").remove("#todo-list li");
 if (isListEmpty()) {
 
 $("#empty-todo-list").css("display", "block");
 }
 updateLabel();
 });
 }
 */
function isTrailEmpty() {

    var size = $("#memex-list ol").children("li").length;
    if (size === 0)
    {
        $("#empty-memex-list").css("display", "block");
        return true;
    }
    $("#empty-memex-list").css("display", "none");
    return false;
}
function getTrailSize() {
    return $("#memex-list ol").children("li").length;
}

/**
 * Update the count label in the page title
 * @returns {undefined}
 */
function updateTrailCountLabel() {
    var size = getTrailSize();
    var txt = "";
    if (size > 0) {
        txt = "(" + size + ")";
    }
    $("#count-label").text(txt);
}
/**
 * Load the list of Trails from dummy link
 * @param {boolean} updateHTML if true insert the trail to the trai-grid
 * @returns {undefined}
 */
function getTrailListFromDelicious(updateHTML) {
    var trails = [];
    $.getJSON(JSON_DUMMY,
            function(data) {
                $.each(data, function(i, item) {
//                    console.log("Data fetched");
                    var tags = item.t;
//                    if ($.inArray("Dummy", tags) > -1) {
                    $.each(tags, function(index, value) {
                        if (value != "Dummy") {
                            trails.push(value);
                        }
                    });
//                    } 
                });
                if (updateHTML)
                {
                    for (var trail in trails)
                    {
                        var str = "<li>" + trails[trail] + "</li>";
                        $("#trail-grid").append(str);
                    }
                    addEventLoadTrailItemsByTrail();
                }
                return trails;
            });
}

function getTrailItemsFromDelicious(tag, updateHTML)
{
    var trailItems = [];
    $.getJSON(JSON_READ,
            function(data) {

                $.each(data, function(i, item) {
                    var trailItem = createTrailItemFromJSON(item);
                    if ($.inArray(tag, trailItem.tags) > -1 && $.inArray("Dummy", trailItem.tags) == -1) {
                        trailItems.push(trailItem);
                    }
                });
                trailItems = sortTrailItems(trailItems, tag);
                if (updateHTML)
                {
                    for (var i in trailItems)
                        addTrailItemToMemex(trailItems[i]);
                }
                $(".ajax-loader").css("display", "none");
                return trailItems;
            });
    return trailItems;
}
/*
 function getTrailItemFromDeliciousByTag(tag, updateHTML)
 {
 var trailItems = [];
 
 $.getJSON(JSON_ROOT+"/"+tag+JSON_COUNT_SUFFIX,
 function(data) {
 
 $.each(data, function(i, item) {
 var trailItem = createTrailItemFromJSON(item);
 if ($.inArray(trailName, trailItem.tags) > -1 && $.inArray("Dummy", trailItem.tags) == -1) {
 trailItems.push(trailItem);
 }
 });
 trailItems = sortTrailItems(trailItems, trailName);
 if (updateHTML)
 {
 for (var i in trailItems)
 addTrailItemToMemex(trailItems[i]);
 }
 $(".ajax-loader").css("display", "none");
 return trailItems;
 });
 return trailItems;
 }
 
 */
function sortTrailItems(trailItems, trailName) {

    var newTrailItems = [];
    var i = 0;
    for (var i = 1; i <= trailItems.length; i++)
    {
        for (var ti in trailItems)
        {
            var trailItem = trailItems[ti];
            var index = $.inArray(trailName + "-step" + (i), trailItem.tags);
            /* console.log(i + "\t" + ti + "\t" + index + "\t" + trailItem.tags);*/
            if (index > -1)
            {
                /* console.log("Order found:" + trailItem.tags);*/
                trailItem.order = index;
                newTrailItems.push(trailItem);
                break;
            }
        }
    }
    return newTrailItems;
}
/**
 * gerenate a nice format for the time
 * @param {type} time
 * @returns {Number|getNiceTime.gap|Date}
 */
function getNiceTime(time)
{
    var ints = {
        second: 1,
        minute: 60,
        hour: 3600,
        day: 86400,
        week: 604800,
        month: 2592000,
        year: 31536000
    };
    time = +new Date(time);
    var gap = ((+new Date()) - time) / 1000,
            amount, measure;
    for (var i in ints) {
        if (gap > ints[i]) {
            measure = i;
        }
    }
    amount = gap / ints[measure];
    amount = gap > ints.day ? (Math.round(amount)) : Math.round(amount);
    amount += ' ' + measure + (amount > 1 ? 's' : '') + ' ago';
    return amount;
}

function addEventLoadTrailItemsByTrail()
{
//    console.log("Adding event");
    $("#trail-grid li").click(function() {
        var selectedTrail = $(this).text();
//        console.log("Selected Trail=" + selectedTrail);
        displayContentArea(true);
        displayUserPromptArea(false);
        $("#memex-trail-name").text(selectedTrail);
        getTrailItemsFromDelicious(selectedTrail, true);
    });
}

function displayUserPromptArea(display)
{
    if (display)
        $("#user-prompt-area").css("display", "block");
    else
        $("#user-prompt-area").css("display", "none");
}

function displayContentArea(display)
{
    if (display)
        $("#content-area").css("display", "block");
    else
        $("#content-area").css("display", "none");
}

function loadRecommendations()
{
//    console.log("loading Recommendations")
    var lists = ["eat", "see", "do"];
    var trailItems = [];
    $.getJSON(JSON_READ,
            function(data) {
                $.each(data, function(i, item) {
                    for (var j in lists)
                    {

                        var category = lists[j];
//                        console.log(category);

                        var trailItem = createTrailItemFromJSON(item);
                        if ($.inArray(category, trailItem.tags) > -1 && $.inArray("Dummy", trailItem.tags) === -1) {
                            trailItems.push(trailItem);
//                            console.log("\t" + category + "\t" + trailItem.title);
                            addRecommendationItem(trailItem, category);
                        }
                    }
                });
            });
}

function addRecommendationItem(trailItem, category)
{
    var list = "#" + category + "_list ol";
//    console.log(list);
    var str = "<li>" + trailItem.parseTrailItemLink() + "</br><p>" + getNiceTime(trailItem.date) + "</p></li>";
    $(list).append(str);
}

function loadURLImage(url, size)
{
//    return IMG_LOAD_URL + "Size=" + size + "&URL=" + url;
//   return IMG_LOAD_URL + "stwsize=" + size + "&stwurl=" + url;
    return IMG_LOAD_URL + url;
}


/* * addLink
 *
 * url:  The new URL to add to the path
 * pathTag: The master tag for this path (also found in the Dummy)
 *
 * Checks the length of the path and adds new link to the end.
 */
/*
 function eventAddLink() {
 
 $("#submit_button").click(function() {
 try {
 console.log("submit clicked");
 //            var url = $("#memex-form-link").text();
 //            var trailName = $("#memex-trail-name").text();
 //            console.log(trailName + "\t" + url);
 
 //            addLink(url, trailName);
 return false;
 } catch (err) {
 
 console.log("ERROR ----------------\n\n\n"+err);
 return false;
 }
 });
 
 }
 */


/*
 * renameTag
 *
 *
 *
 * Simple rename of tag, will be useful for re-ordering the steps
 * Currently not working.  Anyone see why?
 
 function renameTag(old, anew) {
 $.ajax({
 type: "POST",
 url: "delicious_proxy.php",
 data: {username: JSON_USERNAME, password: JSON_PASSWORD, method: "tags/rename", old: old, new : anew}
 }).done(function(msg) {
 console.log(msg);
 });
 }*/
/*
 $(document).ready(function() {
 
 var old = "brewpubs-step1";
 var new = "brewpubs-step0";
 renameTag(old, new );
 });
 */