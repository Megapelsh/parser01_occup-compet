function(e) {
    currentCulture = "en-US";
    var langId = $(this).attr('data-value');
    //var langCulture = $(this).attr('data-culture');
    $.ajax({
        type: 'POST',
        url: '/en/Home/ChangeLanguage', //Calling Index method of Competency Controller
        data: {
            'languageId': langId
        }, //passing name of selected language
        beforeSend: function() {
            Loading.Show();
        },
        success: function() {

            location.reload();

        }, //if success then the page will refresh
        failure: function() {}
    });
}