if (localStorage.search) {
    $("#search").val(localStorage.search)
    if (window.location.pathname === "/") window.location.pathname = "/search/" + localStorage.search;
}

$("#submitsearch").click(function(e){
    localStorage.setItem("search", $("#search").val());
    window.location.pathname = "/search/" + localStorage.search;
    e.preventDefault();
})


$(".counter").click(function(){
    
    if (!username) alert("You need to be logged in");
    else {
        var barId = $(this).closest('div[id]').attr('id');
        $.post("/bar/"+barId);
        var spanWithMyName = $("#"+barId+" .media-body span:contains("+username+")");
        var counter = $(this).text().split(" ");
        if (spanWithMyName.length) {
            spanWithMyName.remove();
            counter[0] == 1 ? counter[0] = 0 : counter[0]--;
        }
        else {
            $("#"+barId+" .media-body").append("<span class='attending itsme'>"+username+"</span>");
            counter[0]++;
        }
        counter = counter.join(" ");
        $(this).text(counter);
    }
})