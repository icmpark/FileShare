
Vue.createApp({
    data() {
        return {
            userId: null,
            searchVal: null,
            auto: {
                isSearched: false,
                isLoad: false,
                body: null,
                value: '',
                values: [''],
                focus: -1
            },
            items: [{
                title: "Loading...",
                value: "Loading..."
            }]
        }
    },
    async mounted () {
        this.loadUserInfo();
        let query = this.parseQuery();
        this.searchVal = document.getElementById('searchVal');
        this.searchVal.value = query[0];
        this.auto.body = document.getElementById('autocomplete');
        document.addEventListener('click', this.turnOffAuto);
        window.addEventListener('resize', this.turnOffAuto);
    }, 
    created: function() {
        this.tableRefresh(0);
    },
    beforeDestroy() { 
        window.removeEventListener('resize', this.turnOffAuto); 
        document.removeEventListener('click', this.turnOffAuto);
    },
    methods: {
        async recoverToken() {
            const updateRes = await fetch('/v/sign/slient_update', {
                method: 'POST'
            });

            if (updateRes.status != 201)
                location.href = '/login';
            
            const updateBody = await updateRes.json();

            sessionStorage.setItem('token', updateBody.token);
        },
        async authRequest(url, method, header, body) {
            let token = sessionStorage.getItem('token');
            
            if(!token)
                await this.recoverToken();

            let headers = {
                'Authorization': `Bearer ${token}`
            }

            Object.assign(headers, header);

            const res = await fetch(url, {
                method: method,
                headers: headers,
                body: body                
            });

            if (res.status == 403)
                await this.recoverToken();
            else
                return res;

            token = sessionStorage.getItem('token');
            headers.Authorization = `Bearer ${token}`;
            
            return await fetch(url, {
                method: method,
                headers: headers,
                body: body                
            });
        },
        async loadUserInfo() {
            const result = await this.authRequest(
                '/v/sign/decode',
                'GET',
                {}, undefined
            )
            const body = await result.json();
            this.userId = body.userId;
            console.log(this.userId);
        },
        autoFocusUp: function() {
            if (!this.auto.isLoad || !this.auto.isSearched) {
                this.auto.focus = -1;
                return;
            }

            if (this.auto.focus != -1)
                this.auto.focus -= 1;
        },
        autoFocusDown: function() {
            if (!this.auto.isLoad || !this.auto.isSearched) {
                this.auto.focus = -1;
                return;
            }

            this.auto.focus += 1;

            if (this.auto.focus == this.auto.values.length)
                this.auto.focus = 0;
        }
    }
}).mount('#container');

