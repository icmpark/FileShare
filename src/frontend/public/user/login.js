Vue.createApp({
    data() {
        return {
            password: '',
            userId: '',
            modal: null,
        }
    },
    mounted () {
        this.modal = new bootstrap.Modal(document.getElementById('loginFailedModal'), {backdrop: true});
    }, 
    methods: {
        async register( ) {
            const res = await fetch(`/v/sign/login`, {
                method: "POST",
                headers:{'Content-Type':'application/json'},
                body: JSON.stringify({
                    userId: this.userId,
                    password: this.password,
                }),
            });

            if (res.status != 200)
            {
                this.modal.show();
                return;
            }

            const body = await res.json();

            sessionStorage.setItem('token', body.token);
            location.href = '/';
        }
    }
}).mount('#registerApp');