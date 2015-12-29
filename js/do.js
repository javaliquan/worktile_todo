(function($){
    $.imap = function(){
        var imap = this.map = {};
        this.get = function(key){
            var val = eval("imap."+key);
            return  (typeof val === undefined) ? null : val;
        };
        this.set = function(key,value){
            eval("imap."+key+"=value");
        };
    };
})(window);
//3f68880ae28046bf8037050d340c6287  GR 0580f7f069284afb9b476215b893c83f
var CONFIG={
    TOKEN:null,
    getPid:function(){
       return jQuery("#pselect  option:selected").attr("pid");
    }
}

// 获取当前窗口url中param参数的值
function getParam(param){
    var query = location.search.substring(1).split('&');
    for(var i=0;i<query.length;i++){
        var kv = query[i].split('=');
        if(kv[0] == param){
            return kv[1];
        }
    }
    return null;
}

function getToken(code,fun){

    //if(true){
    //    CONFIG.TOKEN= "bYiA3u0_Tjyal7ma3FRTAzG-TWY=j7Bx0YTp8a2cf72823859101e11ce6bb70cef897f20b7043d7a6436a540a5b99b47f12b3cf85d18b65d526e766e26e8b44fa3d880ca277dc3a9ddee589f12002f7e7937b0064f14b7c75b822caf711d900c02f131336928c621c09d4b4072bdc5b7156d274cfa448d0ddaecb70b0f06a7c843779"
    //    fun()
    //    return;
    //}
   var token= localStorage.getItem(code);
    if(token){
        CONFIG.TOKEN= token;
        fun();
        return;
    }
    var param ={
        client_id:"42bd26bd11ed4758bb3694e26e28acfe",
        client_secret:"fe935872fca94a0297cbfcf912eb239d",
        code:code
    }
    $.post("https://api.worktile.com/oauth2/access_token",param,function(json){
            CONFIG.TOKEN= json.access_token;
            localStorage.setItem(code,CONFIG.TOKEN);
        fun();
    },"json");
}
function getProjects(fun){
    $.get("https://api.worktile.com/v1/projects?access_token="+CONFIG.TOKEN,null,function(json){
        $.each(json,function(i,n){
            $("#pselect").append("<option pid='"+ n.pid+"'>"+ n.name+"</option>");
        });
        fun();
    },"json");
}


function getTasks(fun){

    var param ={
        pid:CONFIG.getPid(),
        type:"all",
        access_token:CONFIG.TOKEN
    }
    $.get("https://api.worktile.com/v1/tasks",param,function(data){
        fun(data)

    },"json");
};

function addTodos(pid,tid,names,tdata){
   // https://api.worktile.com/v1/tasks/adsa7sa6/todo?pid=xxx&access_token=xxx
     $.each(names.split(","),function(i,name){
        var exeFlag=true;
        $.each(tdata.todos,function(j,k){
             if(k.name==name){
                 exeFlag=false;
             }
        });

        if(exeFlag){
            addTodo(pid,tid,tdata.name,name);
        }
    });
}
function addTodo(pid,tid,tname,name){
    var param ={
         name:name
    };
    $.post("https://api.worktile.com/v1/tasks/"+tid+"/todo?pid="+pid+"&access_token="+CONFIG.TOKEN,param,function(data){
        var div = '<div class="alert alert-warning alert-dismissible" role="alert">'+
        ' <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+
        '  <strong>提示!</strong>'+ "   任务:"+tname+"-添加检测项:\""+name+"\"成功"+
        ' </div>' ;

        $("body").append(div);


    },"json");
}


var tasksData;
function exeTasksUI(data){
    tasksData=data;
    var tasks={};
    $.each(data,function(i,n){
        var entry_id = n.entry_id;
        tasks[entry_id]= n.entry_name;
    });
    for(var task in tasks){
        var name = tasks[task]
        var li = '<li class="list-group-item"><input type="checkbox" name="task" eid="'+task+'" />'+name+'</li>';
        $("#tasks").append(li);
    }
    // <li class="list-group-item"><span class="badge">14</span><input type="checkbox" name="task" /></li>

}

function exeTasksAddCheck(){
    var names =$("#checkText").val();
    $('input[name="task"]:checked').each(function(){
       var eid =  $(this).attr("eid");
        $.each(tasksData,function(i,n){
            if(eid== n.entry_id){
                addTodos(CONFIG.getPid(),n.tid,names,n);
            }
        });
    });
}

$(function(){
    $("#submitCheck").click(function(){
        exeTasksAddCheck();
    });
    $("#pselect").change(function(){
        $("#tasks").html("");
        getTasks(function(data){
            exeTasksUI(data);
        });
    });
})
