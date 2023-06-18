
Vue.createApp({
    data() {
        return {
            userId: null,
            fileId: null,
            uploadUserId: null,
            title: 'Loading...',
            description: 'Loading...',
            likes: 0,
            previews: 0,
        }
    },
    async mounted () {
        this.loadUserInfo();
    },
    async created () {
        this.fileId = window.location.pathname.split("/").pop();

        const res = await this.authRequest(
            `/v/files/${this.fileId}`,
            'GET'
        )
        
        const body = await res.json();

        this.uploadUserId = body.uploadUserId;
        this.title = body.title;
        this.description = body.description;
        this.likes = body.likes;
        this.previews = body.previews;

        let invaildBrowser = ['everytimeApp', 'KakaoTalk', 'KAKAOTALK', 'NAVER'];
        let userAgent = navigator.userAgent;

        invaildBrowser.some(function(item) {
            if (userAgent.indexOf(item) > -1) {
                alert('다운로드 기능을 지원하지 않는 브라우저입니다.');
                return true;
            } else
                return false;
        });

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
        },
    }
}).mount('#container');