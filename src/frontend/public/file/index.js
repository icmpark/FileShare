
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
    }, 
    beforeDestroy() { 
        window.removeEventListener('resize', this.onResize); 
    },
    methods: {
        async authRequest(url, method, header, body) {
            let token = sessionStorage.getItem('token');
            
            if(!token)
                location.href = '/login';

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
            {
                const updateRes = await fetch('/v/sign/slient_update', {
                    method: 'POST'
                });
    
                if (updateRes.status != 201)
                    location.href = '/login';
                
                const updateBody = await updateRes.json();

                sessionStorage.setItem('token', updateBody.token);
            }
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
        navbarHighlight(value) {
            return (location.pathname == value) ? 'fw-bold' : false;
        },
    }
}).mount('#container');