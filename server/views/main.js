(function (angular) {

	var dependencies = [],
		baseUrl = 'https://battlebuddy.herokuapp.com';

	function run () {

	}

	function config () {

	}

	function MainCtrl (MainService) {
		var self = this;

		function onEnterCodeClicked () {
			MainService.getUser(self.code).then(function (user) {
				self.user = user;
				console.log(user)
				self.state = 'dashboard';
			});
		}
		
		function onCreateClicked () {
			self.state = 'info';
		}

		self.state = 'start';
		self.onEnterCodeClicked = onEnterCodeClicked;
		self.onCreateClicked = onCreateClicked;
	}

	function MainService ($http, baseUrl) {

		function getUser (code) {
			return $http.get(baseUrl + '/users/' + code).then(function (response) {
				return response.data;
			});
		}

		return {
			getUser: getUser
		}
	}

	angular.module('battlebuddyapp', dependencies)
		.run(run)
		.config(config)
		.controller('MainCtrl', MainCtrl)
		.service('MainService', MainService)
		.constant('baseUrl', baseUrl);

})(window.angular);