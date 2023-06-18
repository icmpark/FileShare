
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

            if (res.status == 400)
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
        tableRefresh: async function(num) {
            let parsedQuery = this.parseQuery();
            let query = parsedQuery[0];
            let startNum = parsedQuery[1];

            if (num == 2 && startNum == 0) {
                alert('첫 페이지입니다.');
                return;
            }

            switch (num) {
                case 1:
                    if (this.auto.focus != -1)
                        query = this.auto.value + this.auto.values[this.auto.focus];
                    else
                        query = this.searchVal.value;

                    this.turnOffAuto();
                    this.searchVal.value = query;
                    startNum = 0;
                    break;
                case 2:
                    startNum -= 10;
                    break;
                case 3:
                    startNum += 10;
                    break;
            }

            const url = `/v/files?title=${query}&offset=${startNum}&limit=10`;

            const res = await this.authRequest(url, 'GET', {}, undefined);

            const resBody = await res.json();
            
            if (!resBody.length)
            {
                alert('데이터가 존재하지 않습니다.');
                return;
            }

            this.items = resBody.map((r) => {
                return {
                    title: r.title,
                    value: r.description,
                }
            });

            let path = '';
            query = encodeURIComponent(query);

            if (query == '' && startNum == 0)
                path = '/';
            else if (query == '' && startNum != 0)
                path = '/p/' + startNum;
            else if (startNum == 0)
                path = '/search/' + query;
            else
                path = '/search/' + query + '/p/' + startNum;

            history.pushState(null, null, path);
        },
        moveDown: function(num) {
            location.href = '/download/' + num;
        },
        parseQuery: function() {
            let path = window.location.pathname;

            if (path == '/')
                return ['', 0];

            let parsed = path.split('/');

            if (2 < parsed.length)
                parsed[2] = decodeURIComponent(parsed[2]);

            if (parsed.length == 3 && parsed[1] == 'search')
                return [parsed[2], 0];

            if (parsed.length == 3 && parsed[1] == 'p') {
                let startNum = Number(parsed[2]) != NaN ? Number(parsed[2]) : 0;
                return ['', startNum];
            }

            if (parsed.length == 5 && parsed[1] == 'search' && parsed[3] == 'p') {
                let startNum = Number(parsed[4]);

                if (startNum == NaN)
                    return [parsed[2], 0];
                else
                    return [parsed[2], startNum];
            }

            return ['', 0];
        },
        searchTyped: function(e) {
            switch (e.keyCode) {
                case 13: // Enter
                    this.tableRefresh(1);
                    break;
                case 38: // Up
                    this.autoFocusUp();
                    break;
                case 40: // Down
                    this.autoFocusDown();
                    break;
                default:
                    this.makeAutocomplete();
                    break;
            }
        },
        makeAutocomplete: async function() {
            let query = this.searchVal.value;
            if (query.length < 2) {
                this.auto = {
                    isSearch: false,
                    isLoad: false,
                    body: this.auto.body,
                    values: [''],
                    value: '',
                    focus: -1
                }
                this.turnOffAuto();
                return;
            }

            this.auto.isLoad = true;
            
            const url = `/v/files?title=${query}&offset=0&limit=5`;

            const res = await this.authRequest(url, 'GET', {}, undefined);

            const resBody = await res.json();
            
            if (!resBody.length) {
                var preValue = this.searchVal.value
                if (query.length == preValue.length && query != preValue)
                    return;
                this.auto.isSearched = false;
                this.auto.value = '';
                this.auto.values = ['결과 없음'];
            } else {
                this.auto.isSearched = true;
                this.auto.value = query;
                this.auto.values = resBody.map(x => x.substr(query.length));
            }
            this.turnOnAuto();
        },
        turnOnAuto: function() {
            if (!this.auto.body)
                return;

            if (!this.auto.isLoad)
                return;

            if (this.auto.body.classList.contains('show'))
                return;

            this.auto.focus = -1;
            this.auto.body.style.width = this.searchVal.offsetWidth + 'px';
            this.auto.body.classList.add('show');
        },
        turnOffAuto: function() {
            if (!this.auto.body)
                return;

            if (!this.auto.body.classList.contains('show'))
                return;

            this.auto.focus = -1;
            this.auto.body.classList.remove('show');
        },
        autoClicked: function(e) {
            this.auto.focus = -1;
            var selected;
            if (e.target.parentElement.classList.contains('dropdown-item'))
                selected = e.target.parentElement.outerText;
            else
                selected = e.target.outerText;

            this.searchVal.value = selected;
            this.tableRefresh(1);
            e.preventDefault();
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

