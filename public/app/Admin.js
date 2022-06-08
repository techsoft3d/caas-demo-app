class Admin {

    constructor() {
        this.activeUser = null;
        this.currentProject = null;
        this.demoMode = false;
        this.useDirectFetch = false;
        this._newProjectCallback = null;
        this._updateUICallback = null;
        this._userhash = [];
        this._hubusertable = null;
       

    }

    setNewProjectCallback(newprojectcallback)
    {
        this._newProjectCallback = newprojectcallback;
    }

    setUpdateUICallback(updateuicallback)
    {
        this._updateUICallback = updateuicallback;
    }

    _updateUI() {
        if (this._updateUICallback) {
            this._updateUICallback();
        }
    }



    async getConfiguration()
    {
        var res = await fetch(serveraddress + '/api/configuration');
        var data = await res.json();
        this.useDirectFetch = data.useDirectFetch;      
        this.demoMode = data.demoMode;                 
    }

    async checkLogin()
    {
        this.getConfiguration();
        var res = await fetch(serveraddress + '/api/checklogin');
        var data = await res.json();
        if (data.succeeded)
        {
            this.activeUser = data.user;
            $(".loggedinuser").empty();
            $(".loggedinuser").append(data.user);

               
            if (!data.hub) {
                this.handleHubSelection();
            }
            else if (!data.project) {
                this.handleProjectSelection();
            }
            else {
                
                this.loadProject(data.project);
            }
        }
        this._updateUI();
    }

    async handleLogout()
    {
        var res = await fetch(serveraddress + '/api/logout/', { method: 'PUT' });
        window.location.reload(true); 

    }

    async handleProjectSwitch()
    {
        await fetch(serveraddress + '/api/project/none', { method: 'PUT' });
        window.location.reload(true); 

    }

    
    async handleHubSwitch()
    {
        await fetch(serveraddress + '/api/hub/none', { method: 'PUT' });
        window.location.reload(true); 

    }


    handleNewProjectDialog() {
        let myModal = new bootstrap.Modal(document.getElementById('newprojectModal'));
        myModal.toggle();
    }


    handleRenameProjectDialog() {
        this.currentProject = $("#projectselect").val();
        let myModal = new bootstrap.Modal(document.getElementById('renameprojectModal'));
        myModal.toggle();
    }


    async renameProject() {
        var res = await fetch(serveraddress + '/api/renameproject/' + this.currentProject + "/" +  $("#renamedProjectName").val(), { method: 'PUT' });
        this.handleProjectSelection();
    }


    async newProject() {
        var res = await fetch(serveraddress + '/api/newproject/' + $("#newProjectName").val(), { method: 'PUT' });
        var data = await res.json();
        this.loadProject(data.projectid);
    }



    async deleteProject() {
         $('#chooseprojectModal').modal('hide');

        var res = await fetch(serveraddress + '/api/deleteproject/' + $("#projectselect").val(), { method: 'PUT' });
        this.handleProjectSelection();
    }


    async loadProject(projectid) {
       
        var res = await fetch(serveraddress + '/api/project/' + projectid, { method: 'PUT' });
        $(".projectname").empty();
        var data = await res.json();
        $(".projectname").append(data.projectname);  

        this.currentProject = data.projectname;              
        this._updateUI();
        $(".modal-backdrop").remove();
        CsManagerClient.msready();

    }

    async loadProjectFromDialog() {
        await this.loadProject($("#projectselect").val());
    }


    async loadHubFromDialog() {
        await this.loadHub($("#hubselect").val());
    }

    addUserToHub()
    {
        let prop = {id:this._hubusertable.getData().length, userid:"empty",email:"Select User"};

        this._hubusertable.addData([prop], false);
        this._hubusertable.redraw();
    }


    async refreshHubTable() {
        this._hubusertable.clearData();
        var response = await fetch(serveraddress + '/api/hubusers/' + this.currentHub);
        var users = await response.json();
        for (let i = 0; i < users.length; i++) {

            let prop = { id: i, userid:users[i].id, email: this._userhash[users[i].id] };

            this._hubusertable.addData([prop], false);
        }

        this._hubusertable.redraw();

    }

    async editHub() {
        let response = await fetch(serveraddress + '/api/hubusers/' + this.currentHub);
        let users = await response.json();

        let tabdata = this._hubusertable.getData();
        for (let i = 0; i < tabdata.length; i++) {
            let userid = tabdata[i].email;
            for (let k in this._userhash) {
                if (this._userhash[k] == userid) {
                    userid = k;
                    break;
                }
            }
            if (userid != "empty") {
                let alreadyexists = false;
                for (let j = 0; j < users.length; j++) {
                    if (users[j].id == userid) {
                        alreadyexists = true;
                        break;
                    }
                }
                if (!alreadyexists) {
                   
                    
                    var res = await fetch(serveraddress + '/api/addHubUser/' + this.currentHub + "/" + userid + "/" + "Admin", { method: 'PUT' });
                }

            }

        }
        this.handleHubSelection();
    }

    async handleEditHubDialog() {

        this.currentHub = $("#hubselect").val();
        let myModal = new bootstrap.Modal(document.getElementById('edithubModal'));
        var response = await fetch(serveraddress + '/api/users');
        var users = await response.json();

        let userlist = [];
        this._userhash = [];
        for (let i = 0; i < users.length; i++) {
            userlist.push(users[i].email);
            this._userhash[users[i].id] = users[i].email;
        }
        let _this = this;
        this._hubusertable = new Tabulator("#hubuserstab", {
            layout: "fitColumns",
            selectable: 1,
            columns: [
                {
                    title: "ID", field: "id", width: 60
                },
                {
                    title: "userid", field: "userid", width: 60,visible:false,
                },
                { title: "User", field: "email", editor: "select", editorParams: { values: userlist,placeholderEmpty:"No Results Found" } }

            ],
        });

        this._hubusertable.on("tableBuilt", function (e, row) {
            _this.refreshHubTable();
        });

        this._hubusertable.on("cellEdited", function (cell) {
            // let data = cell.getRow().getData();
            // let i = data.animation.split(":")[0];
            // currentAnimationGroup.getAnimations()[data.id].animation = currentAnimationList[i].animation;
            // currentAnimationGroup.getAnimations()[data.id].component = currentAnimationList[i].component;

        });

        myModal.toggle();
    }
    

    async handleHubSelection() {
      
        let myModal = new bootstrap.Modal(document.getElementById('choosehubModal'));
        myModal.toggle();
        var response = await fetch(serveraddress + '/api/hubs');
        var models = await response.json();

        $("#hubselect").empty();
        var html = "";
        for (var i = 0; i < models.length; i++) {
            let cm = models[i];
            html += '<option value="' + cm.id + '">' + cm.name + '</option>';
        }
        $("#hubselect").append(html);

    }

    
    handleNewHubDialog() {
        let myModal = new bootstrap.Modal(document.getElementById('newhubModal'));
        myModal.toggle();
    }

    
    async newHub() {
        var res = await fetch(serveraddress + '/api/newhub/' + $("#newHubName").val(), { method: 'PUT' });
        var data = await res.json();
        this.loadHub(data.hubid);
    }

    
    async loadHub(hubid) {
       
        var res = await fetch(serveraddress + '/api/hub/' + hubid, { method: 'PUT' });
        var data = await res.json();
        this.currentHub = data.hubname;  
        this._updateUI();
        this.handleProjectSelection();
  

    }


    async handleProjectSelection() {
      
        let myModal = new bootstrap.Modal(document.getElementById('chooseprojectModal'));
        myModal.toggle();
        var response = await fetch(serveraddress + '/api/projects');
        var models = await response.json();

        $("#projectselect").empty();
        var html = "";
        for (var i = 0; i < models.length; i++) {
            let cm = models[i];
            html += '<option value="' + cm.id + '">' + cm.name + '</option>';
        }
        $("#projectselect").append(html);

    }


    handleRegistration()
    {
        let myModal = new bootstrap.Modal(document.getElementById('registerusermodal'));
        myModal.toggle();

    }

    _submitRegistration() {

        var fd = new FormData();
        fd.append('firstName', $("#register_firstname").val());
        fd.append('lastName', $("#register_lastname").val());
        fd.append('email', $("#register_email").val());
        fd.append('password', $("#register_password").val());

        $.ajax({
            url: serveraddress + "/api/register",
            type: 'post',
            data: fd,
            contentType: false,
            processData: false,
            success: function (response) {
                if (!response.succeeded)
                    myAdmin.handleRegistration();
                else
                    CsManagerClient.msready();
            },
        });
    }


    handleLogin()
    {
      
        let myModal = new bootstrap.Modal(document.getElementById('loginusermodal'));
        myModal.show();

        var input = document.getElementById("login_password");
        input.addEventListener("keyup", function(event) {
            // Number 13 is the "Enter" key on the keyboard
            if (event.keyCode === 13) {
              // Cancel the default action, if needed
              event.preventDefault();
              // Trigger the button element with a click
              document.getElementById("loginbutton").click();
            }
          });

    }

    _submitLogin() {

        var fd = new FormData();
        fd.append('email', $("#login_email").val());
        fd.append('password', $("#login_password").val());

        var _this = this;
        $.ajax({
            url: serveraddress + "/api/login",
            type: 'post',
            data: fd,
            contentType: false,
            processData: false,
            success: function (response) {


                if (!response.succeeded) {

                    myAdmin.handleLogin();

                }
                else {

                    _this.activeUser = response.user;
                    $(".loggedinuser").empty();
                    $(".loggedinuser").append(response.user.email);
                    _this.handleHubSelection();
                    _this._updateUI();
                }


            },
        });
    }



}

