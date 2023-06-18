
Vue.createApp({
    methods: {
        async loadUserInfo() {
            const result = await this.authRequest(
                '/v/sign/decode',
                'GET',
                {}, undefined
            )
            const body = await result.json();
            return body.userId;
        },
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
        navbarHighlight(value) {
            return (location.pathname == value) ? 'fw-bold' : false;
        },
        async deleteUser() {
            const userId = await this.loadUserInfo();
            await this.authRequest(
                `/v/users/${userId}`,
                'DELETE',
            );
            sessionStorage.setItem('token', null);
            location.href = '/login';
        },
        async logout() {
            await this.authRequest(
                `/v/sign/logout`,
                'DELETE',
            );
            sessionStorage.setItem('token', null);
            location.href = '/login';
        },
    }
}).mount('#navigationElem')