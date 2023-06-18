Vue.createApp({
    data() {
        return {
            formUserName: '',
            formPassword: '',
            formDeleted: false,
            userId: '',
            userName: '',
            canSubmit: false,
        }
    },
    async mounted () {
        const result = await fetch(`/v/auth/current`, {
            method: "GET"
        })

        if(result.status != 200)
            location.href='/login';
        
        const jsonResult = await result.json();
        
        this.formUserName = this.userName = jsonResult.userName;
        this.userId = jsonResult.userId;
    }, 
    methods: {
        navbarHighlight(value) {
            return (location.pathname == value) ? 'fw-bold' : false;
        },
        logout( ) {
            fetch(`/v/auth/logout`, {
                method: "GET"
            }).then((res) => {
                if(res.status == 200)
                    location.href='/login';
            });
        },
        isChanged () {
            this.canSubmit = false;

            if (this.formDeleted)
                this.canSubmit = true;

            if (this.formUserName != this.userName)
                this.canSubmit = true
            
            if (7 < this.formPassword.length)
                this.canSubmit = true;
        },
        async infoUpdate() {
            if (this.formDeleted)
            {   
                fetch(
                    `/v/users/${this.userId}`, 
                    { method: 'DELETE' }
                );
                location.href='/login';   
            }

            const body = {};

            if (this.formUserName != this.userName)
                body.userName = this.formUserName;
            
            if (7 < this.formPassword.length)
                body.password = this.formPassword;
            
                
            await fetch(
                `/v/users/${this.userId}`, 
                { 
                    method: 'PUT',
                    headers:{'Content-Type':'application/json'},
                    body: JSON.stringify(body),
                },
            );
            location.reload();   
        }
    }
}).mount('#myApp');