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
			MainService.updateLoadout(index).then(function (user) {
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

		function onUpItemClicked () {}

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
		self.items = {};

		MainService.getItems('weapon').then(function (items) {
			self.items.weapon = items;
			return MainService.getItems('armor')
		}).then(function (items) {
			self.items.armor = items;
			return MainService.getItems('speed')
		}).then(function (items) {
			self.items.speed = items;
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

		return {
			getUser: getUser,
			updateLoadout: updateLoadout,
			getItems: getItems
		}
	}

	angular.module('battlebuddyapp', dependencies)
		.run(run)
		.config(config)
		.controller('MainCtrl', MainCtrl)
		.service('MainService', MainService)
		.constant('baseUrl', baseUrl);

})(window.angular);