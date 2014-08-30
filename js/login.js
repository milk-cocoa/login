(function(){
	var milkcocoa = new MilkCocoa("https://io-ehz546bne.mlkcca.com");
	var userDataStore = milkcocoa.dataStore("memo");
	var memoDataStore = null;

	function escapeHTML(val) {
		return $('<div>').text(val).html();
	};

	function getMemoDataStore(user) {
		return userDataStore.child(user.id);
	}

    Vue.component('login', {
        template: "#login-template",
        data : {
                email : "",
                password : ""
        },
        methods : {
            login : function() {
                var self = this;
                milkcocoa.login(this.email, this.password, function(err, user) {
                    if(err == null) {
                        goto_view("memo");
                        memoDataStore = getMemoDataStore(user);
                    }
                });
            },
            goto_reg_view : function() {
                goto_view("register");
            }
        }
    });

    Vue.component('register', {
        template: "#register-template",
        data : {
                email : "",
                password : "",
                confirm : ""
        },
        methods : {
            register : function() {
                var self = this;
                if(this.password != this.confirm) return;
                milkcocoa.addAccount(this.email, this.password, {}, function() {
                    goto_view("login");
                });
            },
            goto_login_view : function() {
                goto_view("login");
            }
        }
    });

    Vue.component('memo', {
        template: "#memo-template",
        data : {
            memos : [],
            new_memo : ""
        },
        filters: {
        },
        ready : function() {
            this.fetch();
        },
        methods : {
            add_memo : function() {
                memoDataStore.push({
                	content : escapeHTML(this.new_memo)
                });
                this.new_memo = "";
            },
            fetch : function() {
                var self = this;
                memoDataStore.on("push", function(e) {
                	self.memos.push({
                		content : escapeHTML(e.value.content)
                	});
                });
                memoDataStore.query().sort('desc').limit(5).done(function(memos) {
                    self.memos = memos;
                });
            },
            logout : function() {
            	milkcocoa.logout(function() {
            		location.reload();
            	});
            }
        }
    });

    var app = new Vue({
        el: '#content',
        data: {
            currentView: 'login'
        }
    });

    function goto_view(comp) {
        app.currentView = comp;
    }

    milkcocoa.getCurrentUser(function(err, user) {
        if(user) {
        	memoDataStore = getMemoDataStore(user);
            app.currentView = "memo";
        }else{
            app.currentView = "login";
        }
    });

}())