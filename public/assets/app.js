// // Grab the articles as a json
// $.getJSON("/articles", function (data) {
//     // For each one
//     for (var i = 0; i < data.length; i++) {
//         // Display the apropos information on the page
//         $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
//     }
// });

$("#scrapeButton").click(function () {
    $.ajax("/scrape", {
        type: "GET"
    }).then(
        function () {
            console.log("Scrape complete.")
            location.reload();
        }
    );
});

// Whenever someone clicks a p tag
$(document).on("click", ".viewNotes", function () {
    // Empty the notes from the note section
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");
    console.log(thisId);
    // Now make an ajax call for the Article
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId

    })
        // With that done, add the note information to the page
        .then(function (data) {
            console.log(data);
            $('#notes').modal('toggle');
            // The title of the article
            // $("#notes").append("<h2>" + data.title + "</h2>");
            // An input to enter a new title
            // $("#notes").append("<input id='titleinput' name='title' >");
            // A textarea to add a new note body
            // $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
            // A button to submit a new note, with the id of the article saved to it
            $("#savenote").attr("data-id", thisId);
            // $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
            $(".articleNotes").empty();

            // If there's a note in the article
            if (data.note) {
                data.note.forEach(note => {
                    // Place the title of the note in the title input
                    var title = $("<p>").html("Title: " + note.title);
                    var body = $("<p>").html("Body: " + note.body);
                    var noteSection = $("<div>").append(title).append(body).append("<hr>");
                    $(".articleNotes").append(noteSection);
                });

            }
        });
});

// When you click the savenote button
$(document).on("click", "#savenote", function () {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).data("id");
    console.log(thisId);

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
            // Value taken from title input
            title: $("#title").val(),
            // Value taken from note textarea
            body: $("#body").val()
        }
    })
        // With that done
        .then(function (data) {
            // Log the response
            console.log(data);
            // Empty the notes section
            $("#notes").empty();
        });

    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
});

$(".closeBtn").on("click", function () {
    $(".modal").modal("toggle");
    $(".articleNotes").val("");
    $("#body").empty();
});