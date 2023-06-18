
Vue.createApp({
    data() {
        return {
            userId: null,
            fileId: null,
            uploadUserId: null,
            fileName: null,
            title: 'Loading...',
            description: 'Loading...',
            likes: 0,
            userLike: false,
            previewImages: [],
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
        let previewImages = null;

        if(res.status == 200)
        {
            const body = await res.json();
            this.uploadUserId = body.uploadUserId;
            this.title = body.title;
            this.description = body.description;
            this.likes = body.likes;
            this.fileName = body.fileName;
            previewImages = this.loadImage(body.previews);
        }


        const userLikes = await this.authRequest(
            `/v/files/${this.fileId}/like`,
            'GET'
        )
        
        if(userLikes.status == 200)
        {
            const userLikesBody = await userLikes.json();
            this.userLike = userLikesBody.result;
        }

        let invaildBrowser = ['everytimeApp', 'KakaoTalk', 'KAKAOTALK', 'NAVER'];
        let userAgent = navigator.userAgent;

        invaildBrowser.some(function(item) {
            if (userAgent.indexOf(item) > -1) {
                alert('다운로드 기능을 지원하지 않는 브라우저입니다.');
                return true;
            } else
                return false;
        });
        
        if(previewImages)
            this.previewImages = (await previewImages).map((blob) => URL.createObjectURL(blob));
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
        async loadImage(num) {
            let promises = [...Array(num).keys()].map(async (i) => {
                const res = await this.authRequest(
                    `/v/files/${this.fileId}/preview/${i}`,
                    'GET',
                    {}, undefined
                )
                if (res.status == 200)
                    return await res.blob();
                return null;
            });

            return await Promise.all(promises.filter((promise) => promise != null));
        },
        async downloadFile() {
            const res = await this.authRequest(
                `/v/files/${this.fileId}/download`,
                'GET',
                {}, undefined
            )
            if (res.status != 200)
            {
                alert('다운로드 실패');
                return;
            }    
            
            const blob = await res.blob();

            const url = window.URL.createObjectURL(blob);
            const ghostElem = document.createElement('a');
            ghostElem.download = this.fileName;
            ghostElem.href = url;
            ghostElem.click();
           
            window.URL.revokeObjectUrl(url);
        },
        getPreviewImage(num) {
            return this.images[num];
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
        },
        async deleteFile() {
            const result = await this.authRequest(
                `/v/files/${this.fileId}`,
                'DELETE',
                {}, undefined
            )

            if(result.status == 200)
                location.href = '/';
        },
        async userLikeFile() {
            if (this.userLike)
            {
                const result = await this.authRequest(
                    `/v/files/${this.fileId}/like`,
                    'DELETE',
                )
                if (result.status == 200)
                    this.likes -= 1;
                this.userLike = false;
            }
            else
            {
                const result = await this.authRequest(
                    `/v/files/${this.fileId}/like`,
                    'PUT'
                )
                if (result.status == 200)
                    this.likes += 1;
                this.userLike = true;
            }
        },
    }
}).mount('#container');