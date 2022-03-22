var User = /** @class */ (function () {
    function User(obj) {
        this.firstName = obj.firstName || '';
        this.middleName = obj.middleName || '';
        this.lastName = obj.lastName || '';
        this.email = obj.email || '';
        this.phoneNumber = obj.phoneNumber || '';
        this.role = obj.role || '';
        this.address = obj.address || '';
    }
    return User;
}());
var Roles;
(function (Roles) {
    Roles[Roles["SuperAdmin"] = 0] = "SuperAdmin";
    Roles[Roles["Admin"] = 1] = "Admin";
    Roles[Roles["Subscriber"] = 2] = "Subscriber";
})(Roles || (Roles = {}));
var UserTable = /** @class */ (function () {
    function UserTable() {
        var _this = this;
        this.users = [];
        window.onload = function () {
            document.getElementById('loadData').addEventListener('click', function (e) {
                if (_this.initUsers) {
                    _this.refreshUsers();
                }
                else {
                    _this.loadUsers();
                }
            });
        };
    }
    UserTable.prototype.loadUsers = function () {
        var _this = this;
        this.initUsers = !this.initUsers;
        document.getElementById("users").style.display = "block";
        document.getElementById('loadData').textContent = "Refresh Data";
        var addBtn = document.getElementById('add_row');
        addBtn.addEventListener('click', function (e) {
            _this.addUser();
        });
        this.refreshUsers();
    };
    UserTable.prototype.refreshUsers = function () {
        this.users = JSON.parse(localStorage.getItem('users'));
        this.clearTable();
        var table = document.getElementById("userTable").getElementsByTagName('tbody')[0];
        for (var row = 0; row < this.users.length; row++) {
            var tr = document.createElement('tr');
            tr.id = 'row' + row;
            console.log(tr);
            var columns = Object.keys(this.users[row]);
            for (var col = 0; col < columns.length; col++) {
                var td = document.createElement('td');
                td.id = columns[col];
                if (columns[col] == "role") {
                    td.textContent = this.getRole(+this.users[row][columns[col]]);
                }
                else {
                    td.textContent = this.users[row][columns[col]];
                }
                tr.appendChild(td);
            }
            var actions = this.createDeleteEditButtons(row);
            tr.append(actions);
            table.appendChild(tr);
        }
    };
    UserTable.prototype.clearTable = function () {
        var table = document.querySelector("tbody");
        table.innerHTML = '';
    };
    UserTable.prototype.deleteUser = function (user) {
        var req = {
            type: 'DELETE',
            index: user.value
        };
        this.executeRequest(req);
    };
    UserTable.prototype.getRole = function (role) {
        switch (role) {
            case Roles.Admin:
                return 'Admin';
            case Roles.SuperAdmin:
                return 'Super Admin';
            case Roles.Subscriber:
                return 'Subscriber';
            default:
                return '-';
        }
    };
    UserTable.prototype.editUser = function (btn) {
        var _this = this;
        var userData = {};
        var row = document.getElementById('row' + btn.value);
        var columns = row.getElementsByTagName('td');
        var actions = row.querySelector('div');
        row.removeChild(actions);
        var _loop_1 = function (col) {
            var input;
            if (columns[col].getAttribute('id') == "role") {
                input = document.createElement('select');
                console.log(Roles, Object.keys(Roles));
                Object.keys(Roles).forEach(function (ele) {
                    if (isNaN(ele)) {
                        var option = document.createElement('option');
                        option.value = Roles[ele];
                        option.innerText = ele;
                        input.appendChild(option);
                    }
                    input.value = Roles[columns[col].innerHTML];
                });
            }
            else {
                input = document.createElement('input');
                input.type = 'text';
                input.value = columns[col].innerHTML;
            }
            input.className = "userInputs";
            input.name = columns[col].getAttribute('id');
            input.addEventListener('change', function (e) {
                var target = e.target;
                _this.setValue(userData, target);
            });
            columns[col].innerHTML = '';
            columns[col].appendChild(input);
        };
        for (var col = 0; col < columns.length; col++) {
            _loop_1(col);
        }
        var newActions = this.createSaveCancelButtons(btn.value, userData);
        row.appendChild(newActions);
    };
    UserTable.prototype.addUser = function () {
        var _this = this;
        var table = document.getElementById("userTable").getElementsByTagName('tbody')[0];
        var tr = document.createElement('tr');
        tr.id = 'row' + this.users.length;
        console.log(tr);
        var user = new User({});
        var columns = Object.keys(user);
        var _loop_2 = function (col) {
            var input;
            var td = document.createElement('td');
            if (columns[col] == "role") {
                input = document.createElement('select');
                Object.keys(Roles).forEach(function (ele) {
                    if (isNaN(ele)) {
                        var option = document.createElement('option');
                        option.value = Roles[ele];
                        option.innerText = ele;
                        input.appendChild(option);
                    }
                });
            }
            else {
                input = document.createElement('input');
                input.type = 'text';
            }
            input.className = "userInputs";
            input.name = columns[col];
            input.value = '';
            input.addEventListener('change', function (e) {
                var target = e.target;
                _this.setValue(user, target);
            });
            td.appendChild(input);
            tr.appendChild(td);
        };
        for (var col = 0; col < columns.length; col++) {
            _loop_2(col);
        }
        var actions = this.createSaveCancelButtons(this.users.length, user);
        tr.appendChild(actions);
        table.appendChild(tr);
    };
    UserTable.prototype.setValue = function (user, target) {
        user[target.name] = target.value;
    };
    UserTable.prototype.save = function (user, row) {
        var req;
        if (row < this.users.length) {
            req = {
                type: 'PUT',
                value: user,
                index: row
            };
        }
        else {
            req = {
                type: 'POST',
                value: user
            };
        }
        this.executeRequest(req);
    };
    UserTable.prototype.executeRequest = function (req) {
        var users = JSON.parse(localStorage.getItem('users'));
        switch (req.type) {
            case 'POST':
                console.log("POST");
                users.push(req.value);
                break;
            case 'PUT':
                console.log("PUT");
                var cols = Object.keys(req.value);
                cols.forEach(function (ele) {
                    users[req.index][ele] = req.value[ele];
                });
                break;
            case 'DELETE':
                console.log("DELETE");
                users.splice(req.index, 1);
                break;
        }
        localStorage.setItem('users', JSON.stringify(users));
        this.refreshUsers();
    };
    UserTable.prototype.createDeleteEditButtons = function (row) {
        var _this = this;
        //Edit button
        var editBtn = document.createElement('button');
        editBtn.className = 'glyphicon glyphicon-pencil btn btn-primary';
        editBtn.value = String(row);
        editBtn.id = 'edit_btn' + row;
        editBtn.addEventListener('click', function (e) {
            _this.editUser(e.target);
        });
        //Delete button
        var deleteBtn = document.createElement('button');
        deleteBtn.className = 'glyphicon glyphicon-trash btn btn-primary';
        deleteBtn.value = String(row);
        deleteBtn.id = 'del_btn' + row;
        deleteBtn.addEventListener('click', function (e) {
            _this.deleteUser(e.target);
        });
        //Button groups
        var div = document.createElement('div');
        div.className = 'row actionBtn';
        div.appendChild(editBtn);
        div.appendChild(deleteBtn);
        return div;
    };
    UserTable.prototype.createSaveCancelButtons = function (row, user) {
        var _this = this;
        //Save button
        var saveBtn = document.createElement('button');
        saveBtn.className = 'btn btn-primary';
        saveBtn.textContent = 'Save';
        saveBtn.value = String(row);
        saveBtn.id = 'save_btn' + row;
        saveBtn.addEventListener('click', function (e) {
            _this.save(user, row);
        });
        //Cancel button
        var cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-primary';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.value = String(row);
        cancelBtn.id = 'cancel_btn' + row;
        cancelBtn.addEventListener('click', function (e) {
            _this.refreshUsers();
        });
        //Button groups
        var div = document.createElement('div');
        div.className = 'row actionBtn';
        div.appendChild(saveBtn);
        div.appendChild(cancelBtn);
        return div;
    };
    return UserTable;
}());
new UserTable();
