$(document).ready(function() {
    // Initialize the Select2 plugin on the language switcher element
    $('#language-switcher select').select2({
      minimumResultsForSearch: Infinity,
      templateSelection: function(option) {
        // Render the language option with its corresponding flag image
        var imgSrc = option.data('img_src');
        return option.text + ' <img src="' + imgSrc + '" width="20" height="20">';
      }
    });
  });
  