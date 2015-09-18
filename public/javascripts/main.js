
/**
 * Constructor to enable navigating a filesystem hierarchy
 */
var fileBrowser = (function () {

    var queue = [], $browser, interval, paused=false, maxDirs, limitDirs;

    /**
     * Utility function to limit total number of directories
     *
     * @return bool|void
     */
    function isMaxDirs() {

        /** Return false to disable limit */
        if (!limitDirs) {
            return false;
        }

        if (maxDirs <= 0) {
            return true;
        }
        maxDirs--;
    }

    /**
     * Generate markup for directory root
     *
     * @param  Object dir Html element to hold directory information
     * @param  Object obj Directory information returned from server
     *
     * @return void
     */
    function populateDirectory(dir, obj) {

        var $ul = $('<ul>'), $li, key;

        if ('contents' in obj) {

            for (key in obj.contents) {

                if (!obj.contents.hasOwnProperty(key)) {
                    continue;
                }

                $li = $('<li>');
                addItem($li, obj.contents[key]);

                $ul.append($li);
            }
        }

        dir.append($ul);
    }

    /**
     * Append markup for a directory item
     *
     * @param Object li   Html element to hold directory item
     * @param Object item Directory item corresponding to file or directory
     *
     * @return void
     */
    function addItem(li, item) {

        var $div = $('<div>');

        if ('type' in item) {

            if (item.type == 'f') {
                $div.addClass('file');
            }

            if (item.type == 'd') {

                if (isMaxDirs()) return;

                queue.push($div);
                $div.addClass('dir').addClass('empty');
            }

            addLink($div, item);
        }

        li.append($div);
    }

    /**
     * Append link to directory item
     *
     * @param Object div Html element to hold item link
     * @param Object item Directory item corresponding to file or directory
     */
    function addLink(div, item) {

        var $a = $('<a>').attr('href', '#');

        if ('name' in item) {
            $a.text(item.name);
        }

        div.append($a);
    }

    /**
     * Control method to read from directory queue and fetch the data
     *
     * @return void|null
     */
    function preFetch() {

        var next;

        if (paused === true) {
            return;
        }

        next = queue.shift();

        if (undefined !== next) {
            fetch(next);
        }
    }

    /**
     * Make AJAX call to fetch directory information
     *
     * @param  Object dir     Html element to hold directory information
     * @param  Bool   unpause Switch to re-enable interval timer
     *
     * @return Integer|void   Return -1 if directory already processed
     */
    function fetch(dir, unpause) {

        if (!dir.hasClass('empty')) {
            return -1;
        }

        dir.removeClass('empty');

        $.get('/directory')
            .success(function(response){
                populateDirectory(dir, response);
            })
            .error(function () {
                dir.addClass('empty');
                queue.unshift(dir);
            }).always(function () {
                if (undefined !== unpause) paused = false;
            });
    }

    /**
     * Initiate the listeners and timers
     *
     * @param  Object opts Options to initialise parameters
     *
     * @return void|null
     */
    return function(opts){

        var $dir;

        if (!('id' in opts)) {
            console.log('Element ID required!');
            return;
        }

        limitDirs = opts.maxDirs || false;
        maxDirs = opts.maxDirs || 20;

        $browser = $('#'+opts.id);

        interval = setInterval(preFetch, 500);

        $browser.on('click', '.dir > a', function(e){

            e.stopPropagation();
            e.preventDefault();

            $dir = $(this).parent('.dir');

            if ($dir.hasClass('open')) {
                $dir.removeClass('open');
                return;
            }

            $dir.addClass('open');

            paused = true;

            if (fetch($dir, paused) === -1) {
                paused = false;
            }
        });
    }
});
