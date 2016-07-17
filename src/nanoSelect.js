(function(scope) {
	scope.nanoSelect = function(elemSelect, userConfig) {
		this.el = elemSelect;
		this.config = {
			rootClass: 'nanoSelect',
			toggleClass: 'nanoSelect__toggle',
			labelClass: 'nanoSelect__label',
			arrowClass: 'nanoSelect__arrow',
			resultClass: 'nanoSelect__result',
			listClass: 'nanoSelect__list',
			optionClass: 'nanoSelect__option',
			openClass: 'nanoSelect_open',
			nativeClass: 'nanoSelect_native',
			positionTopClass: 'nanoSelect_top',
			positionBottomClass: 'nanoSelect_bottom',
			resultPosition: 'bottom',
			opened: function() {},
			closed: function() {}
		};

		if( typeof userConfig === 'object' )
			_extend(this.config, userConfig);

		this.init();
	};

	nanoSelect.prototype.init = function() {
		this.createNativeSelect();
		this.createSelect();
		this.onClickDocument();
		this.onChangeSelect();

		for(var i = 0; i < this.elOptions.length; i++) {
			var nativeOption 		= document.createElement('option');
			var customOption 		= document.createElement('div');

			nativeOption.innerHTML 	= this.elOptions[i].innerHTML;
			nativeOption.value 		= this.elOptions[i].value;

			customOption.className 	= this.config.optionClass;
			customOption.innerHTML 	= '<span>'+this.elOptions[i].innerHTML+'</span>';
			customOption.index 		= i;
			this.onClickToOption(customOption);

			this.nativeSelect.appendChild(nativeOption);
			this.list.appendChild(customOption);
		}

		this.nativeSelect.selectedIndex = this.el.selectedIndex;
		this.el.parentNode.insertBefore(this.select, this.el);
		this.el.parentNode.removeChild(this.el);
	};

	nanoSelect.prototype.onChangeSelect = function() {
		var _this = this;

		if(_useNative())
			this.nativeSelect.onchange = function() {
				_this.label.innerHTML = this.children[this.selectedIndex].innerHTML;
			};
	};

	nanoSelect.prototype.onClickToOption = function(el) {
		var _this = this;
		el.onclick = function(ev) {
			_this.label.innerHTML = this.children[0].innerHTML;
			_this.nativeSelect.selectedIndex = this.index;
		}
	};

	nanoSelect.prototype.onClickDocument = function() {
		var _this = this;

		if(handleArr.length == 1 && !_useNative())
			document.onmouseup = function(ev) {
				if( ev.target.className === _this.list.className )
					return;
				
				var bool 	= (
						ev.target.className === _this.config.toggleClass ||
						ev.target.className === _this.config.labelClass ||
						ev.target.className === _this.config.arrowClass
					);

				for(var i = 0; i < handleArr.length; i++) {
					if(i == ev.target.handleIndex)
						continue;

					handleArr[i](ev, false);
				}

				if(!bool)
					return;

				handleArr[ev.target.handleIndex](ev);
			};
		else if(_useNative())
			this.select.className += ' ' + this.config.nativeClass;
	};

	nanoSelect.prototype.toggleResult = function(hardToggle) {
		if( typeof hardToggle == 'undefined' )
			this.select.toggleState = ( this.select.toggleState == 'open' ) ? 'close' : 'open';
		else
			this.select.toggleState = (hardToggle === true) ? 'open' : 'close';

		if(this.select.toggleState == 'open') {
			this.select.className += ' ' + this.config.openClass;

			if( this.config.resultPosition == 'bottom' )
				this.select.className += ' ' + this.config.positionBottomClass;
			else
				this.select.className += ' ' + this.config.positionTopClass;

			this.config.opened();
		}
		else {
			this.select.className = this.config.rootClass;
			this.config.closed();
		}
	};

	nanoSelect.prototype.createNativeSelect = function() {
		this.nativeSelect = document.createElement('select');
		this.extandAttr();
	};

	nanoSelect.prototype.createSelect = function() {
		this.elOptions				= this.el.getElementsByTagName('option')

		this.select 				= document.createElement('div');
		this.toggle 				= document.createElement('label');
		this.label 					= document.createElement('div');
		this.arrow 					= document.createElement('div');
		this.result 				= document.createElement('div');
		this.list 					= document.createElement('div');

		this.select.className 		= this.config.rootClass;
		this.toggle.className 		= this.config.toggleClass;
		this.label.className 		= this.config.labelClass;
		this.arrow.className 		= this.config.arrowClass;
		this.result.className 		= this.config.resultClass;
		this.list.className			= this.config.listClass;

		this.label.innerHTML 		= this.elOptions[this.el.selectedIndex].innerHTML;

		this.toggle.appendChild(this.label);
		this.toggle.appendChild(this.arrow);
		this.toggle.appendChild(this.nativeSelect);
		this.result.appendChild(this.list);
		this.select.appendChild(this.toggle);
		this.select.appendChild(this.result);

		this.select.handleIndex 	= handleArr.length;
		this.toggle.handleIndex 	= handleArr.length;
		this.label.handleIndex 		= handleArr.length;
		this.arrow.handleIndex 		= handleArr.length;
		this.result.handleIndex 	= handleArr.length;
		this.pushHandle();
	};

	nanoSelect.prototype.extandAttr = function() {
		this.el.removeAttribute('id');
		this.el.removeAttribute('class');
		this.el.removeAttribute('multiple');
		
		for(var i = 0; i < this.el.attributes.length; i++)
			this.nativeSelect.setAttribute(this.el.attributes[i].name, this.el.attributes[i].value);
	};

	var handleArr = [];
	nanoSelect.prototype.pushHandle = function() {
		var _this = this;
		handleArr.push(function(ev, hardtoggle) {
			_this.toggleResult(hardtoggle);
		});
	};

	function _extend(array1, array2) {
		for( key in array1) {
			if( typeof array2[key] != 'undefined' )
				array1[key] = array2[key];
		}

		return array1;
	};

	function _useNative() {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	}
}(this));


//TODO added to option element the title atrribute with value from native option
//TODO added searching