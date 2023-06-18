const formNotFullFilled = '항목이 모두 입력되지 않았습니다.';
const timeError = '스케줄의 끝 시간은 반드시 시작 시간보다 이후여야 합니다.';
const timeRangeError = '입력한 시간 범위가 08:00 AM ~ 23:59 PM 이 아닙니다.';

Vue.createApp({
    data() {
        return {
            title: '',
            description: '',
            startDate: '',
            endDate: '',
            files: [],
            dow: '0',
            userId: '',
            userName: '',
            availDesc: formNotFullFilled,
            editfileId: null,
            editTitle: '',
            editDesc: '',
            editfileDeleted: false,
            modal: null,
        }
    },
    async mounted () {
        this.loadUserInfo();
        this.loadfiles();
    }, 
    methods: {
        navbarHighlight(value) {
            return (location.pathname == value) ? 'fw-bold' : false;
        },
        editfile(i) {
            this.editfileId = this.files[i].id;
            this.editDesc = this.files[i].description;
            this.editTitle = this.files[i].title;
            this.editfileDeleted = false;
            (new bootstrap.Modal(document.getElementById('editStartModal'), {backdrop: true})).show();
        },
        async editfileCall() {
            if (this.editfileDeleted)
            {   
                await fetch(
                    `/v/files/${this.editfileId}`, 
                    { method: 'DELETE' }
                );
            }
            else
            {
                const body = {
                    title: this.editTitle,
                    description: this.editDesc
                };
    
                await fetch(
                    `/v/files/${this.editfileId}`, 
                    { 
                        method: 'PUT',
                        headers: {'Content-Type':'application/json'},
                        body: JSON.stringify(body),
                    },
                );
            }
            location.reload();   
        },
        logout( ) {
            fetch(`/v/auth/logout`, {
                method: "GET"
            }).then((res) => {
                if(res.status == 200)
                    location.href='/login';
            });
        },
        async loadUserInfo() {
            const res = await fetch(`/v/auth/current`, {
                method: "GET"
            });
            
            if (res.status != 200)
                location.href='/login';
            
            const jsonBody = await res.json();
            this.userId = jsonBody.userId;
            this.userName = jsonBody.userName;
        },
        async loadfiles() {
            const res = await fetch(`/v/files/created`, {
                method: "GET"
            });
            if (res.status != 200)
                return;
            this.files = await res.json();
        },
        convertDateToString(file) {
            function convertDate (date) { 
                date = new Date(date);
                return date.toLocaleString('en-US', { timeZone: 'Asia/Seoul' , hour: '2-digit', minute: '2-digit'})
            };
            function convertDay (date) { 
                date = new Date(date);
                return date.toLocaleString('en-US', { timeZone: 'Asia/Seoul' , weekday: 'short' })
            };
            return `${convertDate(file.startDate)} - ${convertDate(file.endDate)}, ${convertDay(file.endDate)}`;
        },
        isChanged () {
            if (this.title == '') {
                this.availDesc = formNotFullFilled;
                return null;
            }

            if (this.description == '') {
                this.availDesc = formNotFullFilled;
                return null;
            }

            if (this.startDate == '') {
                this.availDesc = formNotFullFilled;
                return null;
            }

            if (this.endDate == '') {
                this.availDesc = formNotFullFilled;
                return null;
            }

            if (this.dow == '') {
                this.availDesc = formNotFullFilled;
                return null;
            }


            const dow = Number(this.dow);
            const days = 25 + dow;

            const minDate = new Date(`1999-10-${days} 08:00:00+09:00`);
            const maxDate = new Date(`1999-10-${days+1} 00:00:00+09:00`);

            const body = {
                title: this.title,
                description: this.description,
                startDate: `1999-10-${days} ${this.startDate}:00+09:00`,
                endDate: `1999-10-${days} ${this.endDate}:00+09:00`,
            }
            const startDate = new Date(body.startDate);
            const endDate = new Date(body.endDate);
    
            if (startDate >= endDate) {
                this.availDesc = timeError;
                return null;
            }

            if (startDate < minDate || endDate < minDate || maxDate <= endDate || maxDate <= startDate) {
                this.availDesc = timeRangeError;
                return null;
            }

            this.availDesc = '';
            return body;
        },
        async addfile() {
            const body = this.isChanged();
            const res = await fetch(
                `/v/files/`, 
                { 
                    method: 'POST',
                    headers:{'Content-Type':'application/json'},
                    body: JSON.stringify(body),
                },
            );

            location.reload();
        }
    }
}).mount('#myApp');