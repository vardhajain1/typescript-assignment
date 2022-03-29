// import {convertDate} from './decorators'

//decorator function
function convertDate(){
    return (target,propertyKey,descriptor)=>
      Object.defineProperty(target, propertyKey,{});
}
class User {
    public firstName: string;
    public middleName: string;
    public lastName: string;
    public email: string;
    public phoneNumber: number;
    public role: string;
    public address: string
    public date:any
    constructor(obj) {
        this.firstName = obj.firstName ||'';
        this.middleName = obj.middleName || '';
        this.lastName = obj.lastName || '';
        this.email = obj.email || '';
        this.phoneNumber = obj.phoneNumber || '';
        this.role = obj.role || '';
        this.address = obj.address || '';
        this.date= obj.date
        this.dateConversion()
    }
    @convertDate()
    dateConversion(){
        if(this.date){
        this.date=`${new Date(this.date).getDate()}-${this.getTwoDigits(new Date(this.date).getMonth()+1)}-${this.getTwoDigits(new Date(this.date).getFullYear())}`
        } else{
            this.date=`${new Date().getFullYear()}-${this.getTwoDigits(new Date().getMonth()+1)}-${this.getTwoDigits(new Date().getDate())}`
        }
        console.log(this.date)
    }
    getTwoDigits(value){
        return +value<9?'0'+value:value;
    }
}

enum Roles {
    SuperAdmin,
    Admin,
    Subscriber
}
interface CRUD<Type> {
    type: string;
    value?:Type;
    index?:number;
}
class UserTable {
    users=[];
    initUsers:boolean;

    constructor() {
        window.onload = () => {
            document.getElementById('loadData').addEventListener('click', (e: Event) => {
                if(this.initUsers){
                    this.refreshUsers()
                } else{
                this.loadUsers();
                }
            })
        }
    }

    loadUsers() {
        this.initUsers=!this.initUsers;
        document.getElementById("users").style.display = "block";
        document.getElementById('loadData').textContent = "Refresh Data";
        let addBtn=document.getElementById('add_row');
        addBtn.addEventListener('click', (e: Event) => {
            this.addUser();
        })
        this.refreshUsers();
    }

    refreshUsers() {
        this.users=JSON.parse(localStorage.getItem('users'));
        this.clearTable();
        const table = document.getElementById("userTable").getElementsByTagName('tbody')[0];
        for (let row = 0; row < this.users.length; row++) {
            let tr = document.createElement('tr');
            tr.id = 'row' + row;
            console.log(tr)
            let columns = Object.keys(this.users[row])
            for (let col = 0; col < columns.length; col++) {
                const td = document.createElement('td');
                td.id=columns[col];
                if (columns[col] == "role") {
                    td.textContent = this.getRole(+this.users[row][columns[col]]);
                } else{
                    td.textContent = this.users[row][columns[col]];
                }
                tr.appendChild(td);
            }

            const actions=this.createDeleteEditButtons(row)
            tr.append(actions);
            table.appendChild(tr);
        }
    }

    clearTable() {
        const table = document.querySelector("tbody");
        table.innerHTML = '';
    }

    deleteUser(user) {
        let req:CRUD<object>={
            type:'DELETE',
            index:user.value
            }
        this.executeRequest(req);
    }

    getRole(role){
        switch (role) {
            case Roles.Admin:
                return 'Admin'
            case Roles.SuperAdmin:
                return 'Super Admin'
            case Roles.Subscriber:
                return 'Subscriber'
            default:
                return '-'
        }
    }

    editUser(btn) {
        let userData={};
        const row = document.getElementById('row' + btn.value);
        const columns = row.getElementsByTagName('td');
        const actions=row.querySelector('div')
        row.removeChild(actions)
        for (let col = 0; col < columns.length; col++) {
            let input;
            if(columns[col].getAttribute('id') == "role") {
                input = document.createElement('select')
                console.log(Roles,Object.keys(Roles))
                Object.keys(Roles).forEach((ele:any) => {
                    if(isNaN(ele)){
                    const option=document.createElement('option');
                    option.value=Roles[ele];
                    option.innerText=ele;
                    input.appendChild(option)
                    }
                    input.value=Roles[columns[col].innerHTML];
                })
            } else if(columns[col].getAttribute('id') == "date"){
                input = document.createElement('input')
                input.type='date';
                input.value=columns[col].innerHTML;
            }else {
                input = document.createElement('input')
                input.type='text';
                input.value=columns[col].innerHTML;
            }
            input.className="userInputs";
            input.name=columns[col].getAttribute('id')
            input.addEventListener('change',(e:Event)=>{
                let target=e.target;
                this.setValue(userData,target)
            })
            columns[col].innerHTML=''
            columns[col].appendChild(input);

        }
        const newActions=this.createSaveCancelButtons(btn.value,userData)
        row.appendChild(newActions)
        
        
    }
    addUser(){
        const table = document.getElementById("userTable").getElementsByTagName('tbody')[0];
        const tr = document.createElement('tr');
        tr.id = 'row' + this.users.length;
        console.log(tr)
        let user = new User({})
        // user.dateConversion();
        console.log(user)

        let columns = Object.keys(user)
        for (let col = 0; col < columns.length; col++) {
            let input;
            const td = document.createElement('td');
            if (columns[col] == "role") {
                input = document.createElement('select')
                input.value = '';
                Object.keys(Roles).forEach((ele:any) => {
                    if(isNaN(ele)){
                    const option=document.createElement('option');
                    option.value=Roles[ele];
                    option.innerText=ele;
                    input.appendChild(option)
                    }
                })
            }else if(columns[col] == "date"){
                input = document.createElement('input')
                input.type='date';
                console.log("user date",user.date)
                input.value=String(user.date)
            } else {
                input = document.createElement('input')
                input.type = 'text';
                input.value = '';

            }
            console.log(input,input.value)
            input.className = "userInputs";
            input.name = columns[col];

            input.addEventListener('change', (e: Event) => {
                console.log("change")
                let target = e.target;
                this.setValue(user, target)
            })
            td.appendChild(input);
            tr.appendChild(td);
        }
        let actions = this.createSaveCancelButtons(this.users.length, user);
        tr.appendChild(actions);
        table.appendChild(tr)

    }

    setValue(user,target){
        user[target.name]=target.value;
    }

    save(user,row){
        let req:CRUD<object>
        if(row<this.users.length){
            req={
                type:'PUT',
                value:user,
                index:row
            }

        } else {
            req={
                type:'POST',
                value:user
            }
        }
        this.executeRequest(req);
    }


    executeRequest(req:CRUD<object>){
        let users= JSON.parse(localStorage.getItem('users'));
        switch(req.type){
            case 'POST':
                console.log("POST")
                users.push(req.value);
                break;
            case 'PUT':
                console.log("PUT")
                let cols=Object.keys(req.value)
                cols.forEach(ele => {
                    users[req.index][ele]=req.value[ele];
                });
                break;
            case 'DELETE':
                console.log("DELETE")
                users.splice(req.index,1);
                break
        }
        localStorage.setItem('users',JSON.stringify(users));
        this.refreshUsers();
    }


    createDeleteEditButtons(row) {
        //Edit button
        const editBtn = document.createElement('button')
        editBtn.className = 'glyphicon glyphicon-pencil btn btn-primary';
        editBtn.value = String(row);
        editBtn.id = 'edit_btn' + row;
        editBtn.addEventListener('click', (e: Event) => {
            this.editUser(e.target)
        })
        //Delete button
        const deleteBtn = document.createElement('button')
        deleteBtn.className = 'glyphicon glyphicon-trash btn btn-primary';
        deleteBtn.value = String(row);
        deleteBtn.id = 'del_btn' + row;
        deleteBtn.addEventListener('click', (e: Event) => {
            this.deleteUser(e.target);
        })
        
        //Button groups
        let div = document.createElement('div');
        div.className = 'row actionBtn';
        div.appendChild(editBtn);
        div.appendChild(deleteBtn);
        return div
    }

    createSaveCancelButtons(row,user) {
        //Save button
        const saveBtn = document.createElement('button')
        saveBtn.className = 'btn btn-primary';
        saveBtn.textContent='Save'
        saveBtn.value = String(row);
        saveBtn.id = 'save_btn' + row;
        saveBtn.addEventListener('click', (e: Event) => {
            this.save(user,row)
        })
        //Cancel button
        const cancelBtn = document.createElement('button')
        cancelBtn.className = 'btn btn-primary';
        cancelBtn.textContent='Cancel'
        cancelBtn.value = String(row);
        cancelBtn.id = 'cancel_btn' + row;
        cancelBtn.addEventListener('click', (e: Event) => {
            this.refreshUsers();
        })

     //Button groups
        let div = document.createElement('div');
        div.className = 'row actionBtn';
        div.appendChild(saveBtn);
        div.appendChild(cancelBtn);
        return div
    }

}



new UserTable();