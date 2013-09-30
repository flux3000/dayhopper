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
var DUMMYTRAILS;
var HIDE_META_TAGS=false;

var allTrails = [];

var currentTrailItems = [];

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
//    item += "</br><p>" + getNiceTime(this.date) + "</p>";
    item += "</br><ul class='trail-item-tags'>";
    for (var i = 0; i < this.tags.length; i++)
    {
        var tag = this.tags[i];
        if (!isMetaTag(tag) || !HIDE_META_TAGS)
            item += "<li>" + tag + "</li>";
    }
    item += "</ul>";
    item += "</div></li>";
    return item;
}
/**
 * check if the tag is a trail name or a trail step
 * @param {String} tag
 * @returns {Boolean} true if the tag is trail or step
 */
function isMetaTag(tag)
{

    for (var i in allTrails)
    {
        var trail = allTrails[i];
        if (tag === trail)
            return true;
        try {
            if ((trail + "-step") === tag.substring(0, trail.length + 5))
                return true;
        } catch (err) {
            continue;
        }
    }
    return false;
}

function getTrailNameFromForm()
{
    console.log("Trail:\t"+$("#memex-trail-name").text());
    return $("#memex-trail-name").text();
}
function createTrailItemFromJSON(item)
{
    return createTrailItemFromText(item.d, item.u, "" + item.t, item.dt, getTrailNameFromForm());
}

/**
 * Create a new TrailItem from text
 * @param {String} title
 * @param {String} url
 * @param {Array of Strings} tags
 * @param {Date} date
 * @param {String} trailName
 * @returns {createTrailItemFromText.trailItem|TrailItem}
 */
function createTrailItemFromText(title, url, tags, date, trailName) {
    var trailItem = new TrailItem();
    trailItem.title = title;
    trailItem.url = url;
    trailItem.tags = tags.split(",");
    if (!(typeof trailName === 'undefined') && $.inArray(trailName, trailItem.tags)===-1)
    {
        console.log("No trailName passed");
        trailItem.trailName = trailName;
        trailItem.tags.push(trailName);
    }
    if (typeof date === 'undefined')
        trailItem.date = new Date();
    else
        trailItem.date = date;
//    trailItem.tags.push(title);
    trailItem.image = loadURLImage(url, IMG_SIZE);
//    console.log(trailItem);
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
            var trailItem = createTrailItemFromText("", $("#memex-form-link").val(), $("#memex-form-tags").val(), new Date(), trailName);

            /*
             //            trailItem.title = $("#memex-trail-name").text();
             trailItem.url = $("#memex-form-link").val();
             trailItem.tags = $("#memex-form-tags").val().split(",");
             trailItem.tags.push(trailName);
             trailItem.date = new Date();
             trailItem.trailName = trailName;
             
             */

            addLink(trailItem.url, trailItem.trailName, trailItem.tags);
//            addTrailItemToMemex(trailItem);
//            console.log("submit clicked");
//            var url = $("#memex-form-link").text();

//            console.log(trailName + "\t" + trailItem.url + "\n" + trailItem.tags);
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
                    data: {username: JSON_USERNAME, password: JSON_PASSWORD, method: "posts/add", url: url, tags: trailNameStep + "," + tags, replace: "yes"}
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

//
//function addLink(url, trailName, tags) {
////    console.log("Adding link");
//    $.getJSON(JSON_EDIT + trailName + "?callback=?",
//            {},
//            function(data) {
//                // next is the next Step # for this Path
//                var next = data.length;
//                var trailNameStep = trailName + "-step" + next;
//                $.ajax({
//                    type: "POST",
//                    url: "delicious_proxy.php",
//                    data: {username: JSON_USERNAME, password: JSON_PASSWORD, method: "posts/add", url: url, tags: trailNameStep + "," + tags, replace: "yes"}
//                }).done(function(msg) {
//                    console.log("DONE");
//                    console.log(msg);
//                    var result_code = msg.result_code;
//                    console.log("RESULT:" + result_code);
//                    if (result_code === RESULT_ITEM_EXIST_MSG)
//                    {
//                        alert(RESULT_ITEM_EXIST_MSG);
//                    }
//                    if (result_code === "done")
//                    {
//                        getTrailItemsFromDelicious(trailNameStep, true);
//                    }
//
//
//                });
//            });
//}



/**
 * Add a trail item to the Memex
 * @param {TrailItem} trailItem
 * @returns {Boolean}
 */
function addTrailItemToMemex(trailItem)
{
    trailItem.order = getTrailSize() + 1;
    currentTrailItems.push(trailItem);
    var listEl = $(trailItem.formatTrailItemHTML());
    /*listEl.hide();*/
    $("#memex-list ol").append(listEl);
    $("#empty-memex-list").css("display", "none");
    addEventsToTrailItemMenu();
    /*removeItem();*/
    updateTrailCountLabel();
    // console.log(currentTrailItems);
    return false;
}
/**
 * check if memex trail is empty
 * @returns {Boolean}
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
/*
 * get the size of the memext trail
 * @returns {jQuery.length}
 */
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

    $.getJSON(JSON_DUMMY,
            function(data) {
                $.each(data, function(i, item) {
//                    console.log("Data fetched");
                    var tags = item.t;
//                    if ($.inArray("Dummy", tags) > -1) {
                    $.each(tags, function(index, value) {
                        if (value != "Dummy") {
                            allTrails.push(value);
                        }
                    });
//                    } 
                });
                // Check if trail exists before sending user to create page
                $("#create").submit(function(event) {
                    if ($.inArray($("#new-trail-name").val(), allTrails) > -1) {
                        // Trail exists.  
                        // Load the existing trail.
                        addEventLoadTrailItemsByTrail($("#new-trail-name").val());
                        // Don't send to create page.
                        event.preventDefault();
                    }
                });
                if (updateHTML)
                {
                    for (var trail in allTrails)
                    {
                        var str = "<li>" + allTrails[trail] + "</li>";
                        $("#trail-grid").append(str);
                    }
                    $("#trail-grid li").click(function() {
                        addEventLoadTrailItemsByTrail($(this).text());
                    });
                }
            });
}
/**
 * Get a list of trailItems from Delicious by tag (including trailName)
 * @param {String} tag
 * @param {Boolean} updateHTML
 * @returns {Array|sortTrailItems.newTrailItems|getTrailItemsFromDelicious.trailItems}
 */
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

function addEventLoadTrailItemsByTrail(selectedTrail)
{
//    console.log("Adding event");
    console.log(selectedTrail);
//        console.log("Selected Trail=" + selectedTrail);
    displayContentArea(true);
    displayUserPromptArea(false);
    $("#memex-trail-name").text(selectedTrail);
    getTrailItemsFromDelicious(selectedTrail, true);
    return;
}
function addEventsToTrailItemMenu()
{
    eventMoveTrailItemUp();
    eventMoveTrailItemDown();
    eventDeleteTrailItem();
    eventEditTrailItem();


}
function eventMoveTrailItemUp()
{
    $(".trail-item-up").unbind("click");
    $(".trail-item-up").click(function() {

        var trailName = getTrailNameFromForm();
        var trailItem = getTrailItemFromHTML(this);

        //alert("Attempting to move up item #" + trailItem.order + "\n" + trailItem.title + "\n" + trailItem.url);        
        $.each(currentTrailItems, function(i, item) {

            if (item.order == trailItem.order) {
                var oldOrder = item.order;
                var newOrder = item.order - 1;

                // this item just bumped another item down in order. Update its tag and its order value.
                
                $.each(currentTrailItems, function(j, itemj) {
                    if (itemj.order == newOrder) {                    
                        var oldTrailNameStep = trailName + "-step" + newOrder;
                        var newTrailNameStep = trailName + "-step" + oldOrder;                         
                        
                        itemj.tags.splice( $.inArray(oldTrailNameStep, itemj.tags), 1 );
                        itemj.tags.push(newTrailNameStep);
                        itemj.order++;
                    }
                });

                // Now update the listing we clicked on - decrease its sorting order by 1. Change its tag, then change its order.
                
                var oldTrailNameStep = trailName + "-step" + oldOrder;
                var newTrailNameStep = trailName + "-step" + newOrder;
                item.tags.splice( $.inArray(oldTrailNameStep, item.tags), 1 );
                item.tags.push(newTrailNameStep);          
                item.order--;
                
                console.log(currentTrailItems);
                return false;
            }
        });

        // make API call to update all of the trailItems in the trail with new orders.
        // if we wanted to be more efficient, we would only do an API call for the two that are affected. For now, let's change all of them.
        $.each(currentTrailItems, function(i, itemk) {
            if(itemk.order >= (trailItem.order -1)) {
                var jqxhr = $.post("http://people.ischool.berkeley.edu/~dantsai/iolab/lecture7/delicious_proxy.php",
                    {username: 'dantsai', password: 'npoc3opDL', method: 'posts/add', url: itemk.url, description: itemk.title, tags: itemk.tags.join(","), replace: 'yes'})
                .fail(function() {
                    alert("error");
                });
            }
        });
    });
}

function eventMoveTrailItemDown()
{
    $(".trail-item-down").unbind("click");
    $(".trail-item-down").click(function() {
        var trailName = getTrailNameFromForm();
        var trailItem = getTrailItemFromHTML(this);

        //alert("Attempting to move down item #" + trailItem.order + "\n" + trailItem.title + "\n" + trailItem.url);        
        
        $.each(currentTrailItems, function(i, item) {

            if (item.order == trailItem.order) {
                var oldOrder = item.order;
                var newOrder = item.order + 1;

                // this item just bumped another item up in order (closer to 1). Update its tag and its order value.
                
                $.each(currentTrailItems, function(j, itemj) {
                    if (itemj.order == newOrder) {                    
                        var oldTrailNameStep = trailName + "-step" + newOrder;
                        var newTrailNameStep = trailName + "-step" + oldOrder;                         
                        
                        itemj.tags.splice( $.inArray(oldTrailNameStep, itemj.tags), 1 );
                        itemj.tags.push(newTrailNameStep);
                        itemj.order--;
                    }
                });

                // Now update the listing we clicked on. Change its tag, then change its order, so that each are one higher than before.
                
                var oldTrailNameStep = trailName + "-step" + oldOrder;
                var newTrailNameStep = trailName + "-step" + newOrder;
                item.tags.splice( $.inArray(oldTrailNameStep, item.tags), 1 );
                item.tags.push(newTrailNameStep);          
                item.order++;
                
                console.log(currentTrailItems);
                return false;
            }
        });

        // make API call to update all of the trailItems in the trail with new orders.
        // if we wanted to be more efficient, we would only do an API call for the two that are affected. For now, let's change all of them.
        $.each(currentTrailItems, function(i, itemk) {
            if(itemk.order >= (trailItem.order - 1)) {
                var jqxhr = $.post("http://people.ischool.berkeley.edu/~dantsai/iolab/lecture7/delicious_proxy.php",
                    {username: 'dantsai', password: 'npoc3opDL', method: 'posts/add', url: itemk.url, description: itemk.title, tags: itemk.tags.join(","), replace: 'yes'})
                .fail(function() {
                    alert("error");
                });
            }
        });
    });
}
function eventDeleteTrailItem()
{
    $(".trail-item-delete").unbind("click");
    $(".trail-item-delete").click(function() {
        var trailName = getTrailNameFromForm();
        var trailItem = getTrailItemFromHTML(this);
        var trailItemTags;
        //alert("Attempting to delete item #" + trailItem.order + "\n" + trailItem.title + "\n" + trailItem.url);

        $.each(currentTrailItems, function(i, item) {

            if (item.order == trailItem.order) {
                trailItemTags = item.tags;
                // remove tags from selected item
                for (var i=trailItemTags.length-1; i>=0; i--) {
                    if (trailItemTags[i] == trailName + "-step" + trailItem.order) {
                        trailItemTags.splice(i, 1);
                    }
                }
                for (var i=trailItemTags.length-1; i>=0; i--) {
                    if (trailItemTags[i] == trailName) {
                        trailItemTags.splice(i, 1);
                    }
                }
                // remove tags by re-adding without the tags
                var jqxhr = $.post("http://people.ischool.berkeley.edu/~dantsai/iolab/lecture7/delicious_proxy.php",
                    {username: 'dantsai', password: 'npoc3opDL', method: 'posts/add', url: item.url, description: item.title, tags: trailItemTags.join(","), replace: 'yes'})
                .fail(function() {
                    alert("error");
                });

                // remove the item from currentTrailItems array
                currentTrailItems.splice( $.inArray(item, currentTrailItems), 1 );

                // find all subsequent items and change their tags to reflect their new order location. Then decrement their order value in the array.
                $.each(currentTrailItems, function(j, itemj) {
                    if (itemj.order > trailItem.order) {                    
    
                        var oldOrder = itemj.order;
                        var newOrder = itemj.order - 1;

                        var oldTrailNameStep = trailName + "-step" + oldOrder;
                        var newTrailNameStep = trailName + "-step" + newOrder;                         
 
                        /*
                        console.log("trailNameStep: " + trailNameStep);
                        console.log("itemtitle: " + itemj.title);
                        console.log("oldOrder: " + oldOrder);
                        console.log("newOrder: " + newOrder);
                        console.log("newTrailNameStep: " + newTrailNameStep);
                        */
                        
                        itemj.tags.splice( $.inArray(oldTrailNameStep, itemj.tags), 1 );
                        itemj.tags.push(newTrailNameStep);
                        itemj.order--;
                        
                        //console.log(itemj.tags);
                    }

                });
                console.log(currentTrailItems);
                return false;
            }
        });

        // make API call to update all of the trailItems in the trail with new orders.
        // if we wanted to be more efficient, we would only do an API call for the two that are affected. For now, let's change all of them.
        $.each(currentTrailItems, function(i, itemk) {
            if(itemk.order >= (trailItem.order - 1)) {
                var jqxhr = $.post("http://people.ischool.berkeley.edu/~dantsai/iolab/lecture7/delicious_proxy.php",
                    {username: 'dantsai', password: 'npoc3opDL', method: 'posts/add', url: itemk.url, description: itemk.title, tags: itemk.tags.join(","), replace: 'yes'})
                .fail(function() {
                    alert("error");
                });
            }
        });


    });
}

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
 }
*/

function eventEditTrailItem()
{
    $(".trail-item-edit").unbind("click");
    $(".trail-item-edit").click(function() {
        var trailItem = getTrailItemFromHTML(this);
        alert("Attempting to edit item #" + trailItem.order + "\n" + trailItem.title + "\n" + trailItem.url);
    });
}

function getTrailItemFromHTML(item)
{
//    console.log($(item).parents('.trail-item'));
    var trailItem = new TrailItem();
    trailItem.order = $(item).parents('.trail-item').children('.trail-item-order').text();
    trailItem.title = $(item).parents('.trail-item').children('.trail-item-link').text();
    trailItem.url = $(item).parents('.trail-item').children('.trail-item-link').children('a').attr("href");
//    console.log(trailItem);
    return trailItem;

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
                eventAddRecommendationToMemex();
            });
}

function addRecommendationItem(trailItem, category)
{
    var list = "#" + category + "_list ol";
//    console.log(list);
    var str = "<li>" + trailItem.parseTrailItemLink() + "</br><p>" + getNiceTime(trailItem.date) + "</p>";
    str += "<input class='add-recommendation-to-memex' type='button' value='Add'></li>";

    $(list).append(str);
}

function eventAddRecommendationToMemex()
{
    $(".add-recommendation-to-memex").unbind("click");
    $(".add-recommendation-to-memex").click(function() {
        var name = $(this).siblings('a').attr("href");
        var url = $(this).siblings('a').text();

        alert("adding recommendation: " + url);
    });
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
 $(document).ready(function() {
 
 var old = "brewpubs-step1";
 var new = "brewpubs-step0";
 renameTag(old, new );
 });
 */