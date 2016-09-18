(function (angular) {

	var dependencies = [],
		baseUrl = 'https://battlebuddy.herokuapp.com';

	function run () {

	}

	function config () {

	}

	function MainCtrl (MainService, $timeout) {
		var self = this;

		function onEnterCodeClicked () {
			MainService.getUser(self.code).then(function (user) {
				self.isNew = false;
				self.user = user;
				return MainService.getPurchasedItems(user.code)
			}).then(function (items) {
				self.purchasedItems = items;
				self.state = 'welcome';
				$timeout(function () {
					self.state = 'dashboard'
				}, 2000);
			}).catch(function (error) {
				console.log(error)
			})
		}
		
		function onCreateClicked () {
			self.state = 'info';
			self.isNew = true;
		}

		function onEditLoadoutClicked (loadouts, index) {
			self.currentItemIndex = 0;
			self.currentLoadout = loadouts[index];
			self.currentLoadoutIndex = index;
			self.isLoadoutEdit = true;
			self.setName = self.currentLoadout.name;
			for (var i=0; i<self.items.weapon; i++) {
				if (self.items.weapon[i].id === self.currentLoadout.weapon_item_id) {
					self.weapon = self.items.weapon[i]
				}
			}
			for (var i=0; i<self.items.armor; i++) {
				if (self.items.armor[i].id === self.currentLoadout.armor_item_id) {
					self.armor = self.items.armor[i]
				}
			}
			for (var i=0; i<self.items.speed; i++) {
				if (self.items.speed[i].id === self.currentLoadout.speed_item_id) {
					self.speed = self.items.speed[i]
				}
			}
			if (self.weapon && self.armor && self.speed) {
				self.state = 'summary';
			} else {
				self.state = 'store';
			}
		}

		function onStoreClicked () {
			self.state = 'store';
		}

		function onBattleSetSelected (id) {
			MainService.updateCurrentLoadout(self.user.code, id).then(function (user) {
				self.user = user;
				self.state = 'code';
			}).catch(function (error) {
				console.log(error)
			})
		}

		function onStoreCategorySelected (category) {
			self.state = category;
			self.currentItemIndex = 0;
		}

		function onSummaryClicked (isValid) {
			if (isValid) {
				self.state = 'summary';
			}
		}

		function onUpItemClicked () {
			if (self.currentItemIndex - 1 < 0) {
				self.currentItemIndex = self.items[self.state].length - 1
			} else {
				self.currentItemIndex--;
			}
		}

		function onDownItemClicked () {
			if (self.currentItemIndex + 1 === self.items[self.state].length) {
				self.currentItemIndex = 0
			} else {
				self.currentItemIndex++;
			}
		}

		function onInfoClicked () {
			if (self.newUser.name && self.newUser.gender) {
				self.state = 'character';
			}
		}

		function onLeftClicked () {
			if (self.currentClassIndex - 1 < 0) {
				self.currentClassIndex = self.classes.length - 1;
			} else {
				self.currentClassIndex--;
			}
		}

		function onRightClicked () {
			if (self.currentClassIndex + 1 === self.classes.length) {
				self.currentClassIndex = 0;
			} else {
				self.currentClassIndex++;
			}
		}

		function onClassChosenClicked () {
			var type = self.classes[self.currentClassIndex].name;
			self.newUser.type = type;
			MainService.createUser(self.newUser).then(function (user) {
				self.user = user;
				self.currentItemIndex = 0;
				self.currentLoadoutIndex = 0;
				self.state = 'weapon';
			}).catch(function (error) {
				console.log(error)
			})
		}

		function hasPurchased (itemId) {
			for (var i=0; i<self.purchasedItems.length; i++) {
				if (self.purchasedItems[i].id === itemId) {
					return true;
				}
			}
			return false;
		}

		function onBuyClicked () {
			MainService.purchaseItem(self.user.code, self.items[self.state][self.currentItemIndex].id).then(function (user) {
				self.user = user;
				self[self.state] = self.items[self.state][self.currentItemIndex];
				self.purchasedItems.push(self[self.state])
				if (self.isNew) {
					if (self.state === 'weapon') {
						self.state = 'armor'
					} else if (self.state === 'armor') {
						self.state = 'speed'
					} else if (self.state === 'speed') {
						self.state = 'summary'
					}
				}
			}).catch(function (error) {
				console.log(error)
			})
		}

		function onEquipClicked () {
			self[self.state] = self.items[self.state][self.currentItemIndex];
			self.state = 'store'
		}

		function onSaveSet () {
			var loadout = {
				weapon_item_id: self.weapon.id,
				armor_item_id: self.armor.id,
				speed_item_id: self.speed.id,
				name: self.setName
			}
			MainService.updateLoadout(self.user.code, self.user.loadouts[self.currentLoadoutIndex].id, loadout).then(function () {
				return MainService.updateCurrentLoadout(self.user.code, self.user.loadouts[self.currentLoadoutIndex].id);
			}).then(function (user) {
				self.user = user;
				self.state = 'code'
			}).catch(function (error) {
				console.log(error)
			})
			
		}

		self.state = 'start';
		self.onEnterCodeClicked = onEnterCodeClicked;
		self.onCreateClicked = onCreateClicked;
		self.onEditLoadoutClicked = onEditLoadoutClicked;
		self.onStoreClicked = onStoreClicked;
		self.onBattleSetSelected = onBattleSetSelected;
		self.onStoreCategorySelected = onStoreCategorySelected;
		self.onSummaryClicked = onSummaryClicked;
		self.onUpItemClicked = onUpItemClicked;
		self.onDownItemClicked = onDownItemClicked;
		self.onInfoClicked = onInfoClicked;
		self.onLeftClicked = onLeftClicked;
		self.onRightClicked = onRightClicked;
		self.onClassChosenClicked = onClassChosenClicked;
		self.hasPurchased = hasPurchased;
		self.onBuyClicked = onBuyClicked;
		self.onEquipClicked = onEquipClicked;
		self.onSaveSet = onSaveSet;
		self.items = {};
		self.newUser = {};
		self.purchasedItems = [];
		self.classes = [
			{ 
				name: 'attack',
				subtitle: 'Stronger Attacks',
				image: 'assets/robot_screenshot.png'
			},
			{ 
				name: 'defense',
				subtitle: 'Stronger Defense',
				image: 'assets/robot_screenshot.png'
			},
			{ 
				name: 'speed',
				subtitle: 'Faster Movement',
				image: 'assets/robot_screenshot.png'
			}
		]
		self.currentClassIndex = 0;
		self.currentItemIndex = 0;
		self.itemImages = {
			weapon: [
				'assets/robot_screenshot.png',
				'assets/robot_screenshot.png',
				'assets/robot_screenshot.png',
				'assets/robot_screenshot.png',
				'assets/robot_screenshot.png',
				'assets/robot_screenshot.png',
				'assets/robot_screenshot.png',
				'assets/robot_screenshot.png',
				'assets/robot_screenshot.png'
			],
			armor: [
				'assets/robot_screenshot.png',
				'assets/robot_screenshot.png',
				'assets/robot_screenshot.png',
				'assets/robot_screenshot.png',
				'assets/robot_screenshot.png',
				'assets/robot_screenshot.png',
				'assets/robot_screenshot.png',
				'assets/robot_screenshot.png',
				'assets/robot_screenshot.png'
			],
			speed: [
				'assets/robot_screenshot.png',
				'assets/robot_screenshot.png',
				'assets/robot_screenshot.png',
				'assets/robot_screenshot.png',
				'assets/robot_screenshot.png',
				'assets/robot_screenshot.png',
				'assets/robot_screenshot.png',
				'assets/robot_screenshot.png',
				'assets/robot_screenshot.png'
			]
		}

		MainService.getItems('weapon').then(function (items) {
			self.items['weapon'] = items;
			return MainService.getItems('armor')
		}).then(function (items) {
			self.items['armor'] = items;
			return MainService.getItems('speed')
		}).then(function (items) {
			self.items['speed'] = items;
		})
	}

	function MainService ($http, baseUrl) {

		function getUser (code) {
			return $http.get(baseUrl + '/users/' + code).then(function (response) {
				return response.data;
			});
		}

		function updateCurrentLoadout (code, loadoutId) {
			return $http.put(baseUrl + '/users/' + code + '?query=loadout', { equiped_loadout_index: loadoutId }).then(function (response) {
				return response.data;
			});
		}

		function getItems (category) {
			return $http.get(baseUrl + '/items?category=' + category).then(function (response) {
				return response.data.items;
			});
		}

		function createUser (user) {
			return $http.post(baseUrl + '/users', user).then(function (response) {
				return response.data;
			});
		}

		function getPurchasedItems (code) {
			return $http.get(baseUrl + '/users/' + code + '/items').then(function (response) {
				return response.data;
			});
		}

		function purchaseItem (code, itemId) {
			return $http.post(baseUrl + '/users/' + code + '/purchase?item=' + itemId).then(function (response) {
				return response.data;
			});
		}

		function updateLoadout (code, loadoutId, loadout) {
			return $http.put(baseUrl + '/users/' + code + '/loadouts/' + loadoutId, loadout).then(function (response) {
				return response.data;
			});
		}

		return {
			getUser: getUser,
			updateCurrentLoadout: updateCurrentLoadout,
			getItems: getItems,
			createUser: createUser,
			getPurchasedItems: getPurchasedItems,
			purchaseItem: purchaseItem,
			updateLoadout: updateLoadout
		}
	}

	angular.module('battlebuddyapp', dependencies)
		.run(run)
		.config(config)
		.controller('MainCtrl', MainCtrl)
		.service('MainService', MainService)
		.constant('baseUrl', baseUrl);

})(window.angular);