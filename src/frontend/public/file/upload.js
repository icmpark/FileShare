
Vue.createApp({
    data() {
        return {
            progBar: null,
            fileTitle: null,
            fileValue: null,
            fileInput: null,
            fileLabel: null,
            uploadBtn: null,
        }
    },
    async mounted () {
        this.loadUserInfo();
        this.progBar = document.getElementById('progress-bar');
        this.fileTitle = document.getElementById('fileTitle');
        this.fileValue = document.getElementById('fileValue');
        this.fileInput = document.getElementById('File');
        this.fileLabel = document.getElementById('fileLabel');
        this.uploadBtn = document.getElementById('upload');
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
        setProgBar: function(percent) {
            this.progBar.style.width = percent + '%';
            this.progBar.setAttribute('aria-valuenow', percent);
            this.progBar.innerText = percent + '%';
        },
        fileChange: function() {
            let fileList = this.fileInput.files;
            this.fileLabel.innerHTML = fileList.length + '개 파일';

            let filesize = 0;

            for (let i = 0; i < fileList.length; ++i)
                filesize += fileList[i].size;

            if (filesize != 0 && filesize <= 1024 * 1024 * 50) {
                this.uploadBtn.disabled = false;
                this.setProgBar(0);
            } else {
                this.uploadBtn.disabled = true;
                alert('파일 크기 50MB를 초과했습니다!');
            }
        },
        uploadFile: function() {
            if (this.fileTitle.value == '' || this.fileInput.files.length == 0) {
                alert('빈 항목이 존재합니다!');
                return;
            }

            const token = sessionStorage.getItem('token');
            
            if (!token)
                location.href = '/';

            this.uploadBtn.disabled = true;
            this.fileInput.disabled = true;

            let client = new XMLHttpRequest();

            let fLength = this.fileInput.files.length;
            let formData = new FormData();

            if (!fLength)
                return;

            for (let i = 0; i < fLength; ++i)
                formData.append('files', this.fileInput.files[i]);

            formData.append('title', this.fileTitle.value);
            formData.append('description', this.fileValue.value);

            client.onerror = (e) => {
                this.uploadBtn.disabled = false;
                this.fileInput.disabled = false;
                alert('에러가 발생했습니다.');
                this.loadUserInfo();
            };

            client.onload = (e) => {
                let res = JSON.parse(client.responseText);
                this.setProgBar(100);
                if (res['created'])
                    alert('업로드 성공');
                else
                    alert('업로드 실패');
                this.uploadBtn.disabled = false;
                this.fileInput.disabled = false;
            };

            client.upload.onprogress = (e) => {
                let p = Math.round(100 / e.total * e.loaded);
                this.setProgBar(p);
            };

            client.onabort = (e) => {
                this.uploadBtn.disabled = false;
                this.fileInput.disabled = false;
                alert('업로드 실패');
            };

            client.open('POST', '/v/files/upload');
            client.setRequestHeader('Authorization', `Bearer ${token}`);
            client.send(formData);
            this.fileTitle.value = '';
            this.fileValue.value = '';
            this.fileLabel.innerHTML = '파일을 선택하세요';
        }
    }
}).mount('#container');