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
				console.log(user)
				return MainService.getPurchasedItems(user.code)
			}).then(function (items) {
				self.purchasedItems = items;
				self.state = 'welcome';
				$timeout(function () {
					self.state = 'dashboard'
				}, 2000);
			}).catch(function (error) {
				console.log(error)
				// remove this and display error message
				self.user = {
					code: 123,
					name: 'Ken',
					coins: 1000,
					loadouts: [
						{name: 'Speedster'}
					],
					equiped_loadout_index: 0
				}
				self.state = 'welcome';
				$timeout(function () {
					self.state = 'dashboard'
				}, 2000);
			})
		}
		
		function onCreateClicked () {
			self.state = 'info';
			self.isNew = true;
		}

		function onEditLoadoutClicked (loadouts, index) {
			self.state = 'weapon';
			self.currentItemIndex = 0;
			self.currentLoadout = loadouts[index];
			self.currentLoadoutIndex = index;
		}

		function onStoreClicked () {
			self.state = 'store';
		}

		function onBattleSetSelected (index) {
			MainService.updateLoadout(self.user.code, index).then(function (user) {
				self.user = user;
				self.state = 'code';
			}).catch(function (error) {
				console.log(error)
				// remove this and display error message
				self.user = {
					code: 123,
					name: 'Ken',
					coins: 1000,
					loadouts: [
						{name: 'Speedster'}
					],
					equiped_loadout_index: 0
				}
				self.state = 'code';
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
			var type = self.classes[self.currentClassIndex];
			self.newUser.type = type;
			MainService.createUser(self.newUser).then(function (user) {
				self.user = user;
				self.state = 'weapon'
			}).catch(function (error) {
				console.log(error)
				self.user = {
					code: 123,
					name: 'Ken',
					coins: 1000,
					loadouts: [
						{name: 'Speedster'}
					],
					equiped_loadout_index: 0
				}
				self.state = 'weapon'
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
			MainService.purchaseItem(self.user.code, self.items[self.state][self.currentItemIndex].id).then(function (user) => {
				self.user = user;
				if (self.isNew) {
					self[self.state] = self.items[self.state][self.currentItemIndex];
					self.purchasedItems.push(self[self.state])
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
		self.items = {};
		self.newUser = {};
		self.purchasedItems = [];
		self.classes = [
			{ 
				name: 'attack',
				subtitle: 'Stronger Attacks'
			},
			{ 
				name: 'defense',
				subtitle: 'Stronger Defense'
			},
			{ 
				name: 'speed',
				subtitle: 'Faster Movement'
			}
		]
		self.currentClassIndex = 0;

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

		function updateLoadout (code, loadoutIndex) {
			return $http.put(baseUrl + '/users/' + code + '?query=loadout', { equiped_loadout_index: loadoutIndex}).then(function (response) {
				return response.data;
			});
		}

		function getItems (category) {
			return $http.get(baseUrl + '/items?category=' + category).then(function (response) {
				return response.data;
			});
		}

		function createUser (user) {
			return $http.post(baseUrl + '/users', user).then(function (response) {
				return response.data;
			});
		}

		function getPurchasedItems (code) {
			return $http.get(baseUrl + '/users/' + code + '/items' + category).then(function (response) {
				return response.data;
			});
		}

		function purchaseItem (code, itemId) {
			return $http.post(baseUrl + '/users/' + code + '/purchase?item=' + itemId).then(function (response) {
				return response.data;
			});
		}

		return {
			getUser: getUser,
			updateLoadout: updateLoadout,
			getItems: getItems,
			createUser: createUser,
			getPurchasedItems: getPurchasedItems,
			purchaseItem: purchaseItem
		}
	}

	angular.module('battlebuddyapp', dependencies)
		.run(run)
		.config(config)
		.controller('MainCtrl', MainCtrl)
		.service('MainService', MainService)
		.constant('baseUrl', baseUrl);

})(window.angular);