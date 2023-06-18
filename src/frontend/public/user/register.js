Vue.createApp({
    data() {
        return {
            password: '',
            userName: '',
            userId: '',
            modal: null,
        }
    },
    mounted () {
        this.modal = new bootstrap.Modal(document.getElementById('loginFailedModal'), {backdrop: true});
    }, 
    methods: {
        register( ) {
            fetch(`/v/users/${this.userId}`, {
                method: "POST",
                headers:{'Content-Type':'application/json'},
                body: JSON.stringify({
                    userName: this.userName,
                    password: this.password,
                }),
            }).then((res) => {
                if(res.status != 201)
                    this.modal.show();
                else
                    location.href='/login';
            });

        }
    }
}).mount('#registerApp');