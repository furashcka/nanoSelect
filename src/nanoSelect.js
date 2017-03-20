;(function(window, document) {
    'use strict'

    var nanoSelectList = {
        counter: 0
    };

    var NanoSelect = function(el, opts) {
        for(var key in nanoSelectList) {
            if(key === 'counter') continue;
            if(nanoSelectList[key].el === el) throw 'nanoSelect already screated!';
        }

        this.el = el;
        this.opts = {
            rootClass: 'nanoSelect',
            toggleClass: 'nanoSelect__toggle',
            searchClass: 'nanoSelect__search',
            labelClass: 'nanoSelect__label',
            arrowClass: 'nanoSelect__arrow',
            resultClass: 'nanoSelect__result',
            listClass: 'nanoSelect__list',
            groupClass: 'nanoSelect__group',
            optionClass: 'nanoSelect__option',
            limitClass: 'nanoSelect__limit',

            openClass: 'nanoSelect_open',
            nativeClass: 'nanoSelect_native',
            positionTopClass: 'nanoSelect_top',
            positionBottomClass: 'nanoSelect_bottom',

            searchPlaceholder: 'Type for search...',
            resultPosition: 'bottom',

            useNative: true,
            search: false,
            
            opened: function() {},
            closed: function() {},
            changed: function() {},
            template: function(item) {
                return item.text;
            }
        };

        this.id                         = nanoSelectList.counter++;
        this.data                       = _html2data(this.el);
        this.attributes                 = _getAttributes(this.el);
        this.isOpened                   = false;
        this.stopToggle                 = false;

        this.nativeSelect               = null;

        this.customSelect               = null;
        this.customSelectToggle         = null;
        this.customSelectLabel          = null;
        this.customSelectArrow          = null;
        this.customSelectResult         = null;
        this.customSelectList           = null;
        this.customSelectInputSearch    = null;

        _extend(this.opts, opts);

        _init(this);
    };



    NanoSelect.prototype.open = function() {
        if(this.isOpened || (_useNative() && this.opts.useNative)) return;
        _toggleResult(this, 'open')
    };



    NanoSelect.prototype.close = function() {
        if(!this.isOpened || (_useNative() && this.opts.useNative)) return;
        _toggleResult(this, 'close')
    };



    NanoSelect.prototype.set = function(index, callChange) {
        if(_updateCustomSelectLabel(this, index)) {
            this.nativeSelect[index].selected = true;

            if(callChange !== false) {
                this.nativeSelect.onchange();
            }
        }
    };



    NanoSelect.prototype.get = function() {
        var index = this.nativeSelect.selectedIndex;

        return {
            value: this.nativeSelect[index].value,
            text: this.nativeSelect[index].innerHTML
        };
    };



    NanoSelect.prototype.add = function(data, pos, callback) {
        _addData(this, data, pos);
        _renderOptions(this);

        try {
            callback();
        } catch(e) {}
    };



    NanoSelect.prototype.remove = function(indexes) {
        _removeData(this, indexes);
        _renderOptions(this);
    };



    NanoSelect.prototype.destroy = function() {
        this.customSelect.parentNode.removeChild(this.customSelect);
        
        this.el.style.display = '';
        if('name' in this.attributes) {
            this.el.setAttribute('name', this.attributes.name);
        }

        delete nanoSelectList[this.id];
    };



    function _init(self) {
        _createNativeSelect(self);
        _createCustomSelect(self);
        _initSearch(self);
        _onClickCustomSelect(self);
        _onChangeNativeSelect(self);
        _renderOptions(self);

        self.el.removeAttribute('name');
        self.el.setAttribute('style', 'display: none !important;');
        self.el.parentNode.insertBefore(self.customSelect, self.el);

        nanoSelectList[self.id] = self;
    }



    function _createNativeSelect(self) {
        self.nativeSelect = document.createElement('select');

        if('name' in self.attributes) {
            self.nativeSelect.setAttribute('name', self.attributes.name);
        }
    }



    function _createCustomSelect(self) {
        self.customSelect                    = document.createElement('div');
        self.customSelectToggle              = document.createElement('div');
        self.customSelectLabel               = document.createElement('div');
        self.customSelectArrow               = document.createElement('div');
        self.customSelectResult              = document.createElement('div');
        self.customSelectList                = document.createElement('div');

        self.customSelect.className          = self.opts.rootClass;
        self.customSelectToggle.className    = self.opts.toggleClass;
        self.customSelectLabel.className     = self.opts.labelClass;
        self.customSelectArrow.className     = self.opts.arrowClass;
        self.customSelectResult.className    = self.opts.resultClass;
        self.customSelectList.className      = self.opts.listClass;

        self.customSelectToggle.appendChild(self.customSelectLabel);
        self.customSelectToggle.appendChild(self.customSelectArrow);
        self.customSelectToggle.appendChild(self.nativeSelect);
        self.customSelectResult.appendChild(self.customSelectList);
        self.customSelect.appendChild(self.customSelectToggle);
        self.customSelect.appendChild(self.customSelectResult);
    }



    function _renderOptions(self) {
        var buildGroup = function(item) {
            var nativeGroup        = document.createElement('optgroup');
            var customGroup        = document.createElement('div');

            nativeGroup.setAttribute('label', item.text);
            customGroup.setAttribute('data-label', item.text);

            customGroup.className = self.opts.groupClass;

            return {
                nativeGroup: nativeGroup,
                customGroup: customGroup
            };
        };

        var buildOption = function(item, index) {
            var nativeOption        = document.createElement('option');
            var customOption        = document.createElement('div');

            nativeOption.value      = item.value;
            nativeOption.innerHTML  = item.text;

            customOption.className  = self.opts.optionClass;
            customOption.innerHTML  = '<div class="' + self.opts.limitClass + '">' + self.opts.template(item, index) + '</div>';
            customOption.index      = index;

            return {
                nativeOption: nativeOption,
                customOption: customOption
            };
        };
        
        var tmpGroup = null;
        var selectedIndex = 0;



        self.nativeSelect.innerHTML = '';
        self.customSelectList.innerHTML = '';



        _mapData(self.data, function(group, index) {
            tmpGroup = buildGroup(group);
        },
        function(group, index) {
            self.nativeSelect.appendChild(tmpGroup.nativeGroup);
            self.customSelectList.appendChild(tmpGroup.customGroup);

            _onClickCustomGroup(tmpGroup.customGroup);
        },
        function(i, itemGroup, index) {
            var option = buildOption(itemGroup, index);

            tmpGroup.nativeGroup.appendChild(option.nativeOption);
            tmpGroup.customGroup.appendChild(option.customOption);

            if(itemGroup.selected) selectedIndex = index;

            _onClickCustomOption(self, option.customOption);
        },
        function(i, item, index) {
            var option = buildOption(item, index);

            self.nativeSelect.appendChild(option.nativeOption);
            self.customSelectList.appendChild(option.customOption);

            if(item.selected) selectedIndex = index;

            _onClickCustomOption(self, option.customOption)
        });

        _updateCustomSelectLabel(self, selectedIndex);
    };



    function _updateCustomSelectLabel(self, index) {
        var len = self.nativeSelect.getElementsByTagName('option').length - 1;

        if(index > len || index < 0 ) return false;

        var item = {
            text: self.nativeSelect[index].innerHTML,
            value: self.nativeSelect[index].value
        };
        
        self.customSelectLabel.innerHTML = self.opts.template(item);

        return true;
    }



    function _toggleResult(self, hardToggle) {
        if(self.stopToggle === true) return;

        self.isOpened = !self.isOpened;

        if(hardToggle) {
            self.isOpened = hardToggle === 'open';
        }

        if(self.opts.search && !hardToggle) {
            self.isOpened = true;
        }

        self.customSelect.className  = self.opts.rootClass;

        if(self.isOpened) {
            self.customSelect.className += ' ' + self.opts.openClass;
            self.customSelect.className += (self.opts.resultPosition === 'bottom') ? ' ' + self.opts.positionBottomClass : ' ' + self.opts.positionTopClass;

            self.opts.opened.call(self.customSelect);

            if(self.opts.search) {
                self.customSelectInputSearch.focus();
            }
        }
        else {
            self.opts.closed.call(self.customSelect);
        }
    }



    function _onClickCustomSelect(self) {
        if(nanoSelectList.counter === 1) {
            window.addEventListener('click', function() {
                _closeSelectList(null);
            });
        }

        if(!_useNative() || !self.opts.useNative) {
            self.customSelect.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                _closeSelectList(self.id);
                _toggleResult(self);
            });
        }
        else {
            self.customSelect.className += ' ' + self.opts.nativeClass;
        }
    }



    function _onClickCustomOption(self, option) {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            _toggleResult(self, 'close');
            self.set(this.index);
        });
    }



    function _onClickCustomGroup(group) {
        group.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
        });
    }



    function _onChangeNativeSelect(self) {
        self.nativeSelect.onchange = function(e) {
            var index = this.selectedIndex;

            if(e && _useNative()) {
                _updateCustomSelectLabel(self, index);
            }

            self.opts.changed.call(self.customSelect, self.nativeSelect[index].value, self.nativeSelect[index].innerHTML);
        };
    }



    function _initSearch(self) {
        if(!self.opts.search) return;

        self.customSelectInputSearch = document.createElement('input');

        self.customSelectInputSearch.className = self.opts.searchClass;
        self.customSelectInputSearch.setAttribute('type', 'text');
        self.customSelectInputSearch.setAttribute('placeholder', self.opts.searchPlaceholder);

        self.customSelectToggle.appendChild(self.customSelectInputSearch);
        self.customSelectInputSearch.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
        });

        self.customSelectInputSearch.addEventListener('keyup', function() {
            var groupIndex = 0;
            var itemGroupHiddenLength = 0;
            var value = this.value.toLowerCase();

            _mapData(self.data, function(group, index) {
                groupIndex = index;
                itemGroupHiddenLength = 0;
            },
            function(group, index) {
                if(itemGroupHiddenLength === group.children.length) {
                    self.customSelectList.children[groupIndex].style.display = 'none';
                }
                else {
                    self.customSelectList.children[groupIndex].style.display = 'block';
                }
            },
            function(i, itemGroup, index) {
                var children = self.customSelectList.children[groupIndex].children[i];
                var res = itemGroup.text.toLowerCase().indexOf(value);

                if(res === -1) {
                    itemGroupHiddenLength++;
                    children.style.display = 'none';
                }
                else {
                    children.style.display = 'block';
                }
            },
            function(i, item, index) {
                var children = self.customSelectList.children[i];
                var res = item.text.toLowerCase().indexOf(value);

                if(res === -1) {
                    children.style.display = 'none';
                }
                else {
                    children.style.display = 'block';
                }
            });
        });

        self.customSelectInputSearch.addEventListener('blur', function() {
            setTimeout(function() {
                var groupIndex = 0;

                _mapData(self.data, function(group, index) {
                    groupIndex = index;
                    self.customSelectList.children[groupIndex].style.display = 'block';
                },
                function() {},
                function(i, itemGroup, index) {
                    var children = self.customSelectList.children[groupIndex].children[i];
                        children.style.display = 'block';
                },
                function(i, item, index) {
                    var children = self.customSelectList.children[i];
                        children.style.display = 'block';
                });

                self.customSelectInputSearch.value = '';
            }, 300);
        });
    }



    function _closeSelectList(idIgnore) {
        for(var key in nanoSelectList) {
            if(key === 'counter') continue;
            if(nanoSelectList[key].id === idIgnore) continue;
            if(!nanoSelectList[key].isOpened) continue;

            _toggleResult(nanoSelectList[key], 'close');
        }
    }



    function _addData(self, data, pos) {
        if(!_isArray(data)) throw 'data must by Array.';

        if(pos === 'before') {
            self.data = data.concat(self.data);
        }
        else {
            self.data = self.data.concat(data);
        }
    }



    function _removeData(self, indexes) {
        var filterData = [];
        var tmpGroup = null;

        if(indexes !== '*') {
            if(!_isArray(indexes)) throw 'indexes must by Array.';

            _mapData(self.data, function(group, index) {
                tmpGroup = {
                    text: group.text,
                    children: []
                };
            },
            function(group, index) {
                if(tmpGroup.children.length === 0) return;

                filterData.push(tmpGroup);
            },
            function(i, itemGroup, index) {
                if(indexes.indexOf(index) !== -1) return;

                tmpGroup.children.push(itemGroup);
            },
            function(i, item, index) {
                if(indexes.indexOf(index) !== -1) return;

                filterData.push(item);
            });
        }


        self.data = filterData;
    }



    function _html2data(el) {
        var selfGroup = null;
        var data = [];

        _mapData(el.children, function(group, index) {
            data.push({
                text: group.getAttribute('label'),
                children: []
            });

            selfGroup = data[data.length - 1];
        },
        function() {},
        function(i, itemGroup, index) {
            selfGroup.children.push({
                value: itemGroup.value,
                text: itemGroup.innerHTML,
                selected: el.selectedIndex === index
            });
        },
        function(i, item, index) {
            data.push({
                value: item.value,
                text: item.innerHTML,
                selected: el.selectedIndex === index
            });
        });

        return data;
    }



    function _mapData(data, functionGroupStart, functionGroupEnd, functionGroupItem, functionItem) {
        var index = 0;

        for(var i = 0; i < data.length; i++) {
            var len = (data[i].children && data[i].children.length) || 0;

            if(len > 0) {
                functionGroupStart(data[i], index);

                for(var j = 0; j < len; j++) {
                    functionGroupItem(j, data[i].children[j], index);
                    index++;
                }

                functionGroupEnd(data[i], index);
            }
            else {
                functionItem(i, data[i], index);
                index++;
            }
        }
    }



    function _getAttributes(el) {
        var attributes = {};

        for (var i = 0; i < el.attributes.length; i++) {
            attributes[el.attributes[i].name] = el.attributes[i].value;
        }

        return attributes;
    }



    function _useNative() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }



    function _isArray(data) {
        return Object.prototype.toString.call(data) === '[object Array]';
    }



    function _extend(a,b) {
        for(var k in a) {
            a[k] = (k in b) ? b[k] : a[k];
        }
    }



    window.NanoSelect = NanoSelect;
})(window, document);