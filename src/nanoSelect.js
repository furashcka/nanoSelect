;(function(scope) {
    'use strict';

    var arrSelect = { length:0 };
    var nanoSelect = function(el, opts) {
        if(el.getAttribute('data-created')) {
            console.error('nanoSelect already created!');
            return false;
        }

        this.el = el;
        this.name = null;
        this.length = 0;
        this.options = {
            rootClass: 'nanoSelect',
            toggleClass: 'nanoSelect__toggle',
            searchClass: 'nanoSelect__search',
            labelClass: 'nanoSelect__label',
            arrowClass: 'nanoSelect__arrow',
            resultClass: 'nanoSelect__result',
            listClass: 'nanoSelect__list',
            optionClass: 'nanoSelect__option',
            openClass: 'nanoSelect_open',
            nativeClass: 'nanoSelect_native',
            positionTopClass: 'nanoSelect_top',
            positionBottomClass: 'nanoSelect_bottom',
            useNative: true,
            search: false,
            searchPlaceholder: 'Type for search...',
            resultPosition: 'bottom',
            opened: function() {},
            closed: function() {},
            changed: function() {}
        };

        if(typeof opts === 'object')
            _extend(this.options, opts);

        this.init();
    };

    nanoSelect.prototype.init = function() {
        this.createNativeSelect();
        this.createSelect();
        this.initSearch();
        this.onClickWindow();
        this.onChangeSelect();

        this.length = this.elOptions.length;

        for(var i=0; i < this.length; i++) {
            var nativeOption        = document.createElement('option');
            var customOption        = document.createElement('div');

            nativeOption.innerHTML  = this.elOptions[i].innerHTML;
            nativeOption.value      = this.elOptions[i].value;

            customOption.className  = this.options.optionClass;
            customOption.innerHTML  = '<span>'+this.elOptions[i].innerHTML+'</span>';
            customOption.index      = i;
            this.onClickCustomOption(customOption);

            this.nativeSelect.appendChild(nativeOption);
            this.list.appendChild(customOption);
        }

        this.el.setAttribute('style', 'display: none !important;');
        this.nativeSelect.selectedIndex = this.el.selectedIndex;
        this.el.parentNode.insertBefore(this.select, this.el);

        this.el.setAttribute('data-created', 'true');

        this.id = 'id' + arrSelect.length++;
        arrSelect[this.id] = this;
        arrSelect[this.id].toggleResult = this.toggleResult;
    };

    nanoSelect.prototype.createNativeSelect = function() {
        this.nativeSelect = document.createElement('select');
        this.extendAttrForNativeSelect();
    };

    nanoSelect.prototype.createSelect = function() {
        this.elOptions              = this.el.getElementsByTagName('option');

        this.select                 = document.createElement('div');
        this.toggle                 = document.createElement('label');
        this.label                  = document.createElement('div');
        this.arrow                  = document.createElement('div');
        this.result                 = document.createElement('div');
        this.list                   = document.createElement('div');

        this.select.className       = this.options.rootClass;
        this.toggle.className       = this.options.toggleClass;
        this.label.className        = this.options.labelClass;
        this.arrow.className        = this.options.arrowClass;
        this.result.className       = this.options.resultClass;
        this.list.className         = this.options.listClass;

        this.label.innerHTML        = this.elOptions[this.el.selectedIndex].innerHTML;

        this.toggle.appendChild(this.label);
        this.toggle.appendChild(this.arrow);
        this.toggle.appendChild(this.nativeSelect);
        this.result.appendChild(this.list);
        this.select.appendChild(this.toggle);
        this.select.appendChild(this.result);
    };

    nanoSelect.prototype.extendAttrForNativeSelect = function() {
        for(var i = 0, len = this.el.attributes.length; i < len; i++) {
            if(
                this.el.attributes[i].name === 'id' ||
                this.el.attributes[i].name === 'class' ||
                this.el.attributes[i].name === 'multiple'
            ) continue;

            this.nativeSelect.setAttribute(this.el.attributes[i].name, this.el.attributes[i].value);
        }

        this.name = this.el.getAttribute('name');
        this.el.removeAttribute('name');
    };

    nanoSelect.prototype.toggleResult = function(hardToggle) {
        this.select.isOpened = !this.select.isOpened;

        if(hardToggle)
            this.select.isOpened = hardToggle === 'open';

        if(this.options.search && !hardToggle)
            this.select.isOpened = true;

        if(this.select.isOpened) {
            this.select.className += ' ' + this.options.openClass;
            this.select.className += (this.options.resultPosition === 'bottom') ? ' ' + this.options.positionBottomClass : ' ' + this.options.positionTopClass;
            this.options.opened.call(this.select);

            if(this.options.search)
                this.inputSearch.focus();
        }
        else {
            this.select.className = this.options.rootClass;
            this.options.closed.call(this.select);
        }
    };

    nanoSelect.prototype.onClickCustomOption = function(customOption) {
        var _this = this;
        customOption.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();

            _this.label.innerHTML = this.children[0].innerHTML;
            _this.nativeSelect.selectedIndex = this.index;

            _this.toggleResult('close');
            _this.nativeSelect.onchange();
        }
    };

    nanoSelect.prototype.onClickWindow = function() {
        var _this = this;

        if(!_useNative() || !this.options.useNative) {
            scope.addEventListener('click', function() {
                _this.toggleResult('close');
            });
            this.select.addEventListener('click', function(e) {
                for(var key in arrSelect) {
                    if(arrSelect[key].id === _this.id || key === 'length') continue;
                    arrSelect[key].toggleResult('close');
                }

                e.preventDefault();
                e.stopPropagation();
                _this.toggleResult();
            });
        }
        else
            this.select.className += ' ' + this.options.nativeClass;
    };

    nanoSelect.prototype.onChangeSelect = function() {
        var _this = this;

        _this.nativeSelect.onchange = function() {
            var value = this[this.selectedIndex].value;
            var label = this[this.selectedIndex].innerHTML;

            if(_useNative())
                _this.label.innerHTML = label;

            _this.options.changed.call(_this.select, value, label);
        };
    };

    nanoSelect.prototype.initSearch = function() {
        var _this = this;
        if(!this.options.search)
            return false;

        this.inputSearch = document.createElement('input');

        this.inputSearch.className = this.options.searchClass;
        this.inputSearch.setAttribute('type', 'text');
        this.inputSearch.setAttribute('placeholder', this.options.searchPlaceholder);

        this.toggle.appendChild(this.inputSearch);

        this.inputSearch.onkeyup = function() {
            for(var i=0, j=0; i < _this.length; i++) {
                var value = _this.elOptions[i].innerHTML;
                var bool = value.toLowerCase().indexOf( this.value.toLowerCase() ) >= 0;
                _this.list.childNodes[i].style.display = !bool ? 'none' : 'block';

                if(bool) j++;
            }

            _this.list.style.height = (j < 1) ? 0 : 'auto'; //fix bug for ie9
        };
        this.inputSearch.onblur = function() {
            var input = this;
            setTimeout(function() {
                if(_this.select.isOpened) {
                    input.focus();
                    return false;
                }

                input.value = '';
                for(var i=0; i < _this.length; i++)
                    _this.list.childNodes[i].style.display = 'block';

                _this.list.style.height = 'auto'; //fix bug for ie9
            }, 300);
        };
    };

    nanoSelect.prototype.setResult = function(value) {
        var selectedIndex   = null;

        switch(typeof value) {
            case 'number':
                selectedIndex = value;
                break;
            case 'string':
                for(var i=0; i < this.length; i++)
                    if(this.el[i].innerHTML === value) {
                        selectedIndex = i;
                        break;
                    }
                break;
            case 'object':
                for(var i=0; i < this.length; i++)
                    if(
                        this.el[i].value        === value.value &&
                        this.el[i].innerHTML    === value.label
                    ) {
                        selectedIndex = i;
                        break;
                    }
                break;
            default:
                console.error('Invalid value!');
                return false;
                break;
        }

        if(typeof selectedIndex === 'number') {
            this.label.innerHTML = this.nativeSelect[selectedIndex].innerHTML;
            this.nativeSelect.selectedIndex = selectedIndex;

            this.options.changed.call(this.select, this.nativeSelect[selectedIndex].value, this.nativeSelect[selectedIndex].innerHTML);
            return true;
        }

        return false;
    };

    nanoSelect.prototype.getResult = function() {
        var selectedIndex   = this.nativeSelect.selectedIndex;

        return {
            'value': this.nativeSelect[selectedIndex].value,
            'label': this.nativeSelect[selectedIndex].innerHTML
        };
    };

    nanoSelect.prototype.destroy = function() {
        this.select.parentNode.removeChild(this.select);
        this.el.style.display = '';
        this.el.nanoSelectCreated = false;
        this.el.removeAttribute('data-created');
        this.el.setAttribute('name', this.name);
        delete arrSelect[this.id];
    };



    function _extend(arr1, arr2) {
        for(var key in arr1)
            arr1[key] = (key in arr2) ? arr2[key] : arr1[key];
    }

    function _useNative() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    scope.nanoSelect = function(el, opts) {
        var select = new nanoSelect(el, opts);

        return {
            setResult: function(v) { return select.setResult(v) },
            getResult: function() { return select.getResult() },
            destroy: function() { select.destroy() }
        };
    };
})(window);