// Thanks Alyssa for helping me with this!
String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

// jQuery wrapper
(function($) {
    // Code goes here
    $(function() {
        $(".form-error").hide();

        // An empty array that will hold the guest objects
        var guests = [];

        // Run this first. It won't have anything in it except for a message prompting the user to add a guest.
        displayCurrentEntries();

        // This gets called by enterGuest. enterGuest will create an object called guestEntry, which will be passed as the argument to addGuestEntry.
        function addGuestEntry(entry) {
            guests.push(entry);
        }

        // This will show the guests and their choices. At first, it will show a message prompting the user to add an entry.
        function displayCurrentEntries() {
            if (guests.length === 0) {
                // The initial prompt for the user.
                $("#currentEntries").html("<p>Please click 'Add Guest' to begin.</p>").removeClass("form-results");
                // Only show the remove button if there is at least one entry.
                $("#removeGuest").addClass("hidden");
                // Ditto for the submit button.
                $("#submit").addClass("hidden");
            } else {
                // Generate the text that will be displayed.
                var i, len, text;
                for (i = 0, len = guests.length, text = ""; i < len; i++) {
                    if (guests[i].attend === "no") {
                        text += '<p class="form-results-item">' + guests[i].name.capitalizeFirstLetter() + " sends regrets." + '</p>';
                    } else {
                        text += '<p class="form-results-item">' + guests[i].name.capitalizeFirstLetter() + " would like " + guests[i].entreeType + "." + '</p>';
                    }
                }
                // The argument text here is generated above.
                $("#currentEntries").html(text).addClass("form-results");
                // As we've added a guest, show the remove button.
                $("#removeGuest").removeClass("hidden");
                // Ditto for the submit button.
                $("#submit").removeClass("hidden");
            }
        }

        // If a guest is attending, show the menu choices.
        $("#attendYes").click(function() {
            $("#menuChoice").removeClass("hidden");
        });

        // If they aren't, hide it.
        $("#attendNo").click(function() {
            $("#menuChoice").addClass("hidden");
        });

        // Generate the guest object.
        function enterGuest() {
            // This is mostly for adding additional guests- it keeps the focus on the guest name input. Could go somewhere else?
            $("#name").focus();
            // Initialize an empty object.
            var guestEntry = {};
            // Populate the object with the values entered in the form.
            guestEntry.name = $("#name").val();
            guestEntry.attend = $("input[name=willAttend]:checked").val();
            guestEntry.entreeType = $("input[name=entreeType]:checked").val();
            console.log('guestEntry', guestEntry);
            // Add the guests array, passing the object created above as the argument.
            addGuestEntry(guestEntry);
            // Add the guest to the display of entries.
            displayCurrentEntries();
        }

        // Add a guest by calling enterGuest, and close the dialog.
        function addGuest() {
            enterGuest();
            dialog.dialog("close");
            // This probably doesn't belong here, but it seems to work. It prevents the following: fill out form, click review, click add guest, menu is still showing. Which is not a real big problem, since clicking will not attend still hides the menu.
            $("#menuChoice").addClass("hidden");
        }

        // Add multiple guests without closing the dialog.
        function addAnother() {
            if (formValidate())  {
                enterGuest();
                form[0].reset();
            }
        }

        // The dialog box containing the form.
        dialog = $("#rsvpForm").dialog({
            dialogClass: "form no-close",
            autoOpen: false,
            height: "auto",
            width: 600,
            modal: true,
            close: function() {
                form[0].reset();
            }
        });
        // Let's do some validatin'

        function formValidate() {
            if ($("#name").val() === "") {
                $("#nameError").show();
                return false;
            } else if ($("input[name=willAttend]:checked").length <= 0) {
                $("#willAttendError").show();
                return false;
            } else if ($("#attendNo:checked")) {
                $(".form-error").hide();
                return true;
            } else if ($("input[name=entreeType]:checked").length <= 0) {
                $("#entreeTypeError").show();
                return false;
            } else {
                $(".form-error").hide();
                return true;
            }
        }

        // Add the guest and close the dialog.
        $("#reviewEntries").on("click", function() {
            if (formValidate())  {
                addGuest();
            }
        });


        $("#addAnother").on("click", function() {
            if (guests.length === 4) {
                addGuest();
            } else {
                addAnother();
            }
        });

        $("#cancel").click(function() {
            dialog.dialog("close");
        });

        form = dialog.find("form").on("submit", function(event) {
            event.preventDefault();
            addGuestEntry();
        });

        $("#addGuest").button().on("click", function() {
            dialog.dialog("open");
        });

        $("#removeGuest").button().on("click", function() {
            guests.pop();
            displayCurrentEntries();
        });

        var mailgunURL;

        mailgunURL = window.location.protocol + "//" + window.location.hostname + '/dist/scripts/mailgun.php';

        $("form#submitGuests").submit(function(e) {
            e.preventDefault();
            // var json = $(this).serialize();
            var json = JSON.stringify(guests);
            console.log('json to submit: ' + json);
            console.log(mailgunURL);

            $.ajax({
                type: 'POST',
                cache: false,
                url: mailgunURL,
                data: json,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(data) {
                    responseSuccess(data);
                    console.log(data);
                },
                error: function(data) {
                    console.log('Silent failure.');
                }
            });

            return false;

        });

        function responseSuccess(data) {
            if (data.status === "success") {
                $("#currentEntries").html("Submission sent succesfully.").removeClass("form-results");
                $("#submit").addClass("hidden");
                $("#removeGuest").addClass("hidden");
                $("#addGuest").addClass("hidden");
            } else {
                $("#currentEntries").html("Submission failed. Please contact us directly - event at williamandlaura dot us").removeClass("form-results");
                $("#submit").addClass("hidden");
                $("#removeGuest").addClass("hidden");
            }
        }

    });

})(jQuery);
