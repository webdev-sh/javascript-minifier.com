$(function() {

    var state = 'blank';

    // set some vars for use
    var $form    = $('#input-form');
    var $input   = $('#input');
    var $output  = $('#output');
    var $buttons = $('#minify, #download, #raw, #clear');

    var $btnSelect = $('#select');

    function set_states() {
        var $input = $('#input');

        if ( state === 'blank' && $input.val().length > 0 ) {
            state = 'input';
        }

        if ( $input.val().length > 0 ) {
            $buttons.removeAttr('disabled');
        }
        else {
            $buttons.attr('disabled', 'disabled');
        }

        if ( $output.val().length ) {
            $btnSelect.removeAttr('disabled');
            $output.removeAttr('disabled');
        }
        else {
            $btnSelect.attr('disabled', 'disabled');
            $output.attr('disabled', 'disabled');
        }
    }

    function minify() {
        var input = $input.val();
        $.post( '/raw', { input : input }, function(data) {
            if ( data ) {
                $output.val(data);
                set_states();
                $output.select();
            }
        });
    }

    // some setup
    set_states();

    // events on the textarea#input
    $input.keypress( set_states );
    $input.keyup( set_states );
    $input.keydown( set_states );

    // events on the buttons
    $('#minify').click(function(ev) {
        ev.preventDefault();
        minify();
    });

    $('#download').click(function(ev) {
        $form.attr('action', '/download').submit();
        minify();
    });

    $('#raw').click(function(ev) {
        ev.preventDefault();
        $form.attr('action', '/raw').submit();
    });

    $('#clear').click(function(ev) {
        ev.preventDefault();
        $input.val('');
        $output.val('');
        set_states();
        $input.focus();
        $output.attr('disabled', 'disabled');
    });

    $('#select').click(function(ev) {
        $output.select();
    });
});
