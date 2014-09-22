(function(){
	var milkcocoa = new MilkCocoa("https://io-chyxzfwa5.mlkcca.com");
	var userDataStore = milkcocoa.dataStore("memo");
	var memoDataStore = null;
    var current_email = "";

	function escapeHTML(val) {
		return $('<div>').text(val).html();
	};

	function getMemoDataStore(user) {
		return userDataStore.child(user.id);
	}

    var app = new Vue({
        el: '#content',
        data: {
            currentView: null
        }
    });

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
                    if(err == MilkCocoa.Error.Login.FormatError) {
                        self.message = "フォーマットエラー";
                    }else if(err == MilkCocoa.Error.Login.LoginError) {
                        self.message = "Emailかパスワードが違います。";
                    }else if(err == MilkCocoa.Error.Login.EmailNotVerificated) {
                        self.message = "メールを確認してください。";
                    }else{
                        current_email = user.email;
                        memoDataStore = getMemoDataStore(user);
                        location.reload();
                    }
                });
            },
            goto_reg_view : function() {
                app.currentView = "register";
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
                milkcocoa.addAccount(this.email, this.password, {}, function(err, user) {
                    if(err == MilkCocoa.Error.AddAccount.FormatError) {
                        self.message = "フォーマットエラー";
                    }else if(err == MilkCocoa.Error.AddAccount.AlreadyExist) {
                        self.message = "Emailアドレスが既に使われています。";
                    }else{
                        app.currentView = "login";
                    }
                });
            },
            goto_login_view : function() {
                app.currentView = "login";
            }
        }
    });

    var memo_component = Vue.component('memo', {
        template: "#memo-template",
        data : {
            memos : [],
            new_memo : ""
        },
        filters: {
            memo_filter : function(memos) {
                return memos.map(function(memo, index) {
                    return {
                        content : memo.content,
                        color1 : index % 2 == 0,
                        color2 : index % 2 == 1
                    }
                });
            }
        },
        ready : function() {
            this.fetch();
            this.email = current_email;
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
                	self.memos.unshift({
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

    milkcocoa.getCurrentUser(function(err, user) {
        if(user) {
        	memoDataStore = getMemoDataStore(user);
            current_email = user.email;
            app.currentView = "memo";
        }else{
            app.currentView = "login";
        }
    });

}())