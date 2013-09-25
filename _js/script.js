$(document).ready(function() {
    init();
})



function init() {
    addTrailItemFromForm();
    updateTrailCountLabel();
    isTrailEmpty();
    addTest();


}

function addTest()
{
    for (var i = 1; i <= 10; i++)
    {
        var name = "Test " + i;
        var link = "https://www.google.com/search?q=" + 1;
        var tags = name + ",tag 1,tag 2";


        addTrailItemText(name, link, tags)

    }

}

function TrailLink() {
    this.link = "";
    this.name = "";
    this.image = "";
    this.order;
    this.description = "";
    this.delicious_id;
    this.parseTrailLink = parseTrailLink;
    this.tags = {};
    this.formatTrailListItem = formatTrailListItem;


}

function parseTrailLink()
{
    var url = "";
    url += "<a href='" + this.link + "'>" + this.name + "</a>"

    return url;
}

function formatTrailListItem()
{
    var item = "<li><div class='trail-link'>";
    item += "<img src='" + this.image + "' alt='IMAGE'/>";
    item += this.parseTrailLink();
    item += "</br><p>" + this.description + "</p>";
    item += "</br><ul class='trail-link-tags'>";

    for (var i = 0; i < this.tags.length; i++)
    {
        item += "<li>" + this.tags[i] + "</li>";

    }
    item += "</ul>";
    item += "</div><hr></li>";
    return item;
}

function addTrailItemText(name, link, tags)
{
    var trailLink = new TrailLink();
    trailLink.name = name;
    trailLink.link = link;
    trailLink.tags = tags.split(",");
    trailLink.tags.push(name);



    addTrailItemToMemex(trailLink);
}


function addTrailItemFromForm()
{
    $("#submit_button").click(function() {

        var trailLink = new TrailLink();
        trailLink.name = $("#memex-form-name").val()
        trailLink.link = $("#memex-form-link").val();
        trailLink.tags = $("#memex-form-memex").split(",");
        trailLink.tags.push(trailLink.name);

        addTrailItemToMemex(trailLink);

    });
}

function addTrailItemToMemex(trailLink)
{

    trailLink.order = getTrailSize() + 1;

    var listEl = $(trailLink.formatTrailListItem());
    
            /*listEl.hide();*/
            $("#memex-list ol").append(listEl);
    $("#empty-memex-list").css("display", "none");
    /*
     $.post($("#form").attr("action"), $("#form").serialize(), function(html) {
     $("div.result").html(html);
     */
    $("#memex-list ol li:last").hide();
    listEl.fadeIn();
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
function isTrailEmpty()
{

    var size = $("#memex-list ol").children("li").length;

    if (size === 0)
    {
        $("#empty-memex-list").css("display", "block");
        return true;
    }
    $("#empty-memex-list").css("display", "none");
    return false;
}
function getTrailSize()
{
    return $("#memex-list ol").children("li").length;
}
function updateTrailCountLabel()
{
    var size = getTrailSize();
    var txt = "";
    if (size > 0) {
        txt = "(" + size + ")";
    }

    $("#count-label").text(txt);
}
