(function (global, join, splice) {
	var nativeImpl = "DOMTokenList" in global && global.DOMTokenList;

	function tokenize(token) {
		if (/^-?[_a-zA-Z]+[_a-zA-Z0-9-]*$/.test(token)) {
			return String(token);
		} else {
			throw new Error('InvalidCharacterError: DOM Exception 5');
		}
	}

	function toObject(self) {
		for (var index = -1, object = {}, element; element = self[++index];) {
			object[element] = true;
		}

		return object;
	}

	function fromObject(self, object) {
		var array = [], token;

		for (token in object) {
			if (object[token]) {
				array.push(token);
			}
		}

		splice.apply(self, [0, self.length].concat(array));
	}

	if (!nativeImpl) {
		global.DOMTokenList = function DOMTokenList() {};

		global.DOMTokenList.prototype = {
			constructor: DOMTokenList,
			item: function item(index) {
				return this[parseFloat(index)] || null;
			},
			length: Array.prototype.length,
			toString: function toString() {
				return join.call(this, ' ');
			},

			add: function add() {
				for (var object = toObject(this), index = 0, token; index in arguments; ++index) {
					token = tokenize(arguments[index]);

					object[token] = true;
				}

				fromObject(this, object);
			},
			contains: function contains(token) {
				return token in toObject(this);
			},
			remove: function remove() {
				for (var object = toObject(this), index = 0, token; index in arguments; ++index) {
					token = tokenize(arguments[index]);

					object[token] = false;
				}

				fromObject(this, object);
			},
			toggle: function toggle(token) {
				var
				object = toObject(this),
				contains = 1 in arguments ? !arguments[1] : tokenize(token) in object;

				object[token] = !contains;

				fromObject(this, object);

				return !contains;
			}
		};
	} else {
		var NativeToggle = nativeImpl.prototype.toggle;

		nativeImpl.prototype.toggle = function toggle(token) {
			if (1 in arguments) {
				var
				contains = this.contains(token),
				force = !!arguments[1];

				if ((contains && force) || (!contains && !force)) {
					return force;
				}
			}

			return NativeToggle.call(this, token);
		};

	}

})(this, Array.prototype.join, Array.prototype.splice);
