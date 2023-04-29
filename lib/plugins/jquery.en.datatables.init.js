$(document).ready(function () {
    var table = $('#datatable-buttons').DataTable({
        fixedHeader: true,
        colReorder: true,
        stateSave: true,
        "order": [[2, "asc"]],
        "columnDefs": [
            { "orderable": false, "targets": 6 }
        ],
        language: {
            "lengthMenu": "Show _MENU_ issues",
            "info": "Showing _START_ to _END_ of _TOTAL_ issues",
            "infoEmpty": "Showing 0 to 0 of 0 issues"
        },
        buttons: [
            { extend: 'copy', text: 'Copy' },
            { extend: 'excel', text: 'Excel' },
            { extend: 'pdf', text: 'PDF' },
            { extend: 'colvis', text: 'Hide columns' }
        ]
    });

    table.buttons().container()
        .appendTo('#datatable-buttons_wrapper .col-md-6:eq(0)');

    $('div.dataTables_length').addClass("mb-2");

    $(window).resize(function () {
        fluidDialog();
    });

    $(document).on("dialogopen", ".ui-dialog", function (event, ui) {
        fluidDialog();
    });

    function fluidDialog() {
        var $visible = $(".ui-dialog:visible");
        $visible.each(function () {
            var $this = $(this);
            var dialog = $this.find(".ui-dialog-content").data("ui-dialog");

            if (dialog.options.fluid) {
                var wWidth = $(window).width();

                if (wWidth < (parseInt(dialog.options.maxWidth) + 50)) {
                    $this.css("max-width", "90%");
                } else {
                    $this.css("max-width", dialog.options.maxWidth + "px");
                }
                dialog.option("position", dialog.options.position);
            }
        });
    }
});