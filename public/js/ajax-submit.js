  $(document).ready(function(){

    getMessages()
    $('.messageContainer').on('submit', function(evt){
                evt.preventDefault();
                var action = $(this).attr('action');
                var $container = $(this).closest('.formContainer');
                $.ajax({
                    url: action,
                    type: 'POST',
                    data: $(this).serialize(),
                    success: function(data){
                        if(data.success){
                          getMessages()
                          $container.html('<h3>Thanks!</h3>');
                        } else {
                            $container.html('There was a problem.');
                        }
                    },
                    error: function(){
                        $container.html('There was a problem.');
                    }
                });
            });
        });

