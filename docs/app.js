;(function() {
    var selectCountries = {
        el: document.getElementById('select-countries'),
        obj: null,
        options: {
            search: true,
            template: function(item) {
                var img = '<img src="flags/'+item.value+'.svg" alt="" class="flag">';

                return img + item.text;
            }
        }
    };

    var selectBooks = {
        el: document.getElementById('select-books'),
        obj: null,
        options: {
            search: true
        }
    };

    var selectProgrammLanguages = {
        el: document.getElementById('select-programm-languages'),
        obj: null,
        options: {}
    };

    var selectColors = {
        el: document.getElementById('select-colors'),
        obj: null,
        options: {
            search: true,
            changed: function(value, text) {
                document.body.style.backgroundColor = value;
            },
            resultPosition: 'top',
            template: function(item) {
                var blockColor = '<em class="block-color" style="background-color: ' + item.value + ';"></em>';

                return blockColor + item.text;
            }
        }
    };

    var selectSmartfons = {
        el: document.getElementById('select-smartfons'),
        obj: null,
        options: {
            useNative: false,
            rootClass: 'nanoSelect',
            resultPosition: 'top',
            opened: smartfonsChanged
        }
    };



    selectCountries.obj = new NanoSelect(selectCountries.el, selectCountries.options);
    selectBooks.obj = new NanoSelect(selectBooks.el, selectBooks.options);
    selectProgrammLanguages.obj = new NanoSelect(selectProgrammLanguages.el, selectProgrammLanguages.options);
    selectColors.obj = new NanoSelect(selectColors.el, selectColors.options);
    selectSmartfons.obj = new NanoSelect(selectSmartfons.el, selectSmartfons.options);



    (function() {
        function getRandomColor() {
            var letters = '0123456789ABCDEF';
            var color = '#';
            for (var i = 0; i < 6; i++ ) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }

        var data = [];

        for(var i = 0; i < 1000; i++) {
            var color = getRandomColor();

            data.push({
                value: color,
                text: color
            });
        }

        selectColors.obj.add(data);
    })();



    selectCountries.obj.customSelectList.innerHTML = '<span style="display: block; text-align: center; padding: 10px">Loading...</span>';
    $.getJSON( "countries.json", function( data ) {
        var newData = [];

        for(key in data) {
            newData.push({
                value: data[key].code.toLowerCase(),
                text: data[key].name
            });
        }

        selectCountries.obj.add(newData, 'after', function() {
            selectCountries.obj.set(newData.length - 1);
        });
    });


    var baronObj = null;
    function smartfonsChanged() {
        if(baronObj !== null) {
            baronObj.update();
            return;
        }


        var click = false;

        var html = '<div class="nanoSelect__bar"></div>';

        var el = {};
            el.root = $(this).find('.nanoSelect__result');
            el.scroller = el.root.find('.nanoSelect__list');

        el.root.append(html);

        el.bar = el.root.find('.nanoSelect__bar');



        el.bar.mousedown(function(e) {
            selectSmartfons.obj.stopToggle = true;
        });
        $(window).mouseup(function() {
            setTimeout(function() { selectSmartfons.obj.stopToggle = false; }, 100);
        });
        


        baronObj = baron({
            root: el.root,
            scroller: el.scroller,
            bar: el.bar,
            scrollingCls: '_scrolling',
            draggingCls: '_dragging'
        });
    }
})();