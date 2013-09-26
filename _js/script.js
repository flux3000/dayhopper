$(document).ready(function() {
    init();
})



function init() {

    toggleMap();
    displayUserPromptArea(true);
    displayContentArea(false);
    getTrailListFromDelicious(true);
    addTrailItemFromForm();
    updateTrailCountLabel();
    isTrailEmpty();



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




function addTest()
{
    for (var i = 1; i <= 10; i++)
    {
        var name = "Test " + i;
        var link = "https://www.google.com/search?q=" + 1;
        var tags = name + ",tag 1,tag 2";

        var date = new Date();

        var trailItem = CreateTrailItemFromText(name, link, tags, date)
        addTrailItemToMemex(trailItem);

    }

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
    /*
     item += "<img src='" + this.image + "' alt='IMAGE'/>";
     */
    item += this.parseTrailItemLink();
    item += "</br><p>" + getNiceTime(this.date) + "</p>";
    item += "</br><ul class='trail-item-tags'>";

    for (var i = 0; i < this.tags.length; i++)
    {
        item += "<li>" + this.tags[i] + "</li>";

    }
    item += "</ul>";
    item += "</div></li>";
    return item;
}

/**
 * Create a new TrailItem from text
 * @param {String} title
 * @param {String} link
 * @param {Array of Strings} tags
 * @param {Date} date
 * @returns {CreateTrailItemFromText.trailItem|TrailItem}
 */
function CreateTrailItemFromText(title, url, tags, date) {
    var trailItem = new TrailItem();
    trailItem.title = title;
    trailItem.url = url;
    trailItem.tags = tags.split(",");
    if (typeof date === 'undefined')
        trailItem.date = new Date();
    else
        trailItem.date = date;
    trailItem.tags.push(name);

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

        var trailItem = new TrailItem();
        trailItem.title = $("#memex-form-name").val()
        trailItem.url = $("#memex-form-link").val();
        trailItem.tags = $("#memex-form-memex").split(",");
        trailItem.tags.push(trailItem.title);
        trailLInk.date = new Date();

        addTrailItemToMemex(trailItem);

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
    $.getJSON("http://feeds.delicious.com/v2/json/dantsai?callback=?",
            function(data) {

                $.each(data, function(i, item) {
                    console.log("Data fetched");
                    var title = item.d;
                    var url = item.u;
                    var date = item.dt;
                    var tags = item.t;

                    if ($.inArray("Dummy", tags) > -1) {
                        $.each(tags, function(index, value) {
                            if (value != "Dummy") {
                                trails.push(value);

                            }
                        });
                    }
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

function getTrailItemsFromDelicoius(trailName, updateHTML)
{
    var trailItems = [];

    $.getJSON("http://feeds.delicious.com/v2/json/dantsai?count=100&callback=?",
            function(data) {
                console.log("size src:" + data.length);
                $.each(data, function(i, item) {

                    var trailItem = new TrailItem();

                    trailItem.title = item.d;
                    trailItem.url = item.u;
                    trailItem.date = item.dt;
                    trailItem.tags = item.t;

                    if ($.inArray(trailName, trailItem.tags) > -1 && $.inArray("Dummy", trailItem.tags) == -1) {
                        trailItems.push(trailItem);
                    }

                });
                console.log("size org:" + trailItems.length);
                trailItems = sortTrailItems(trailItems, trailName);



                if (updateHTML)
                {
                    for (var i in trailItems)
                        addTrailItemToMemex(trailItems[i]);
                }
                $(".ajax-loader").css("display", "none");
                return trailItems;
            });
}

function sortTrailItems(trailItems, trailName) {
    console.log("sorting");
    var newTrailItems = [];
    var i = 0;
   /* console.log("Size=" + trailItems.length);
    console.log("i\tti\tindex");*/
    for (var i = 1; i <= trailItems.length; i++)
    {
        for (var ti in trailItems)
        {

            var trailItem = trailItems[ti];


            var index = $.inArray(trailName + "-step" + (i), trailItem.tags)
           /* console.log(i + "\t" + ti + "\t" + index + "\t" + trailItem.tags);*/
            if (index >-1)
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

/*
 function getTrailFromDelicious(trailName)
 {
 
 $.getJSON("http://feeds.delicious.com/v2/json/dantsai?callback=?",
 function(data) {
 $.each(data, function(i, item) {
 var title = item.d;
 var url = item.u;
 var date = item.dt;
 var tags = item.t;
 
 if ($.inArray(trailName, tags) > -1) {
 $.each(tags, function(index, value) {
 if (value != "Dummy") {
 $("#hop-trails").append('<li>' + value + '</li>');
 }
 });
 } else {
 $("#delicious-bookmarks").append('<li><a href="' + url + '">' + title + '</a> <time>' + getNiceTime(date) + '</time><br/>' + tags + '</li>');
 }
 });
 $(".ajax-loader").css("display", "none");
 });
 }
 */
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
    console.log("Adding event");
    $("#trail-grid li").click(function() {
        var selectedTrail = $(this).text();
        console.log("Selected Trail=" + selectedTrail);
        displayContentArea(true);
        displayUserPromptArea(false);
        $("#memex-trail-name").text(selectedTrail);
        getTrailItemsFromDelicoius(selectedTrail, true);
    });
}

function displayUserPromptArea(display)
{
    if (display)
        $("#user-prompt-area").css("display", "block")
    else
        $("#user-prompt-area").css("display", "none")
}

function displayContentArea(display)
{
    if (display)
        $("#content-area").css("display", "block")
    else
        $("#content-area").css("display", "none")
}