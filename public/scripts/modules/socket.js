angular.module("socket", []).factory("socket", function ($rootScope) {
	var socket = io.connect();
	return {
		on : function(name, callback) {
			socket.on(name, function () {
				var args = arguments;
				$rootScope.$apply(function(){
					callback.apply(socket, args)
				})
			})
		}, 
		emit : function (name, data) {
			socket.emit(name, data);
		}
	}
})