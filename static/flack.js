document.addEventListener('DOMContentLoaded', () => {

	if (!localStorage.getItem('user')){
		var txt;
		var person = prompt("Please Choose a display Name: ", );
		if (person == null || person == "") {
			txt = "Anonymous";
            person = 'Anonymous';
		} else{
			txt = "Display Name:" + person;
		}
		localStorage.setItem('user', person);
		document.querySelector("#text").innerHTML = txt;
	}
	else{
		document.querySelector("#text").innerHTML = localStorage.getItem('username');
	}

	const template = Handlebars.compile(document.querySelector('#chatpage').innerHTML);



	var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on('connect', () => {
    	
    	const user = localStorage.getItem('user');
    	socket.emit('Joined', {'user': user});
        
        document.querySelector('#addchannel').onclick = () => {

        	const channel = document.querySelector('#channelname').value;
            socket.emit('add channel', {'channel': channel});
            document.querySelector('#channelname').value = '';
        }; 
        
    });

    
    socket.on('channel added', data => {
        
        
		
		const newchannel = document.createElement('button');
		//newchannel.setAttribute("class", "channels");
		newchannel.className = ('channels');
		newchannel.innerHTML = data.channel;
		newchannel.onclick = function(){
			const user = localStorage.getItem('user');
			socket.emit('channel entered', {'channel': data.channel, 'user': user});
			localStorage.setItem('channel', data.channel);
			
			//const content = template({'value': data.channel});

			const h1 = document.createElement('h1');
			h1.innerHTML = 'Chat room: ' + data.channel;
			h1.setAttribute("id", "chatroom_head");
			const div = document.createElement('div');
			div.setAttribute("id", "chatlist");
			const input1 = document.createElement('input');
			input1.setAttribute("id", "chatmsg");
			input1.setAttribute("type", "text");
			input1.setAttribute("placeholder", "Chat msg here");
			div.append(input1);
			const input2 = document.createElement('input');
			input2.setAttribute("id", "chat");
			input2.setAttribute("type", "submit");
			input2.onclick = function(){

				console.log('chat sent');
				const chatmsg = document.querySelector('#chatmsg').value;
				const username = localStorage.getItem('user');
				const curr_channel = localStorage.getItem('channel');
				var time = new Date().toLocaleTimeString();
				socket.emit('chat posted', {'msg': chatmsg, 'username': username, 'channel': curr_channel, 'time': time});
				console.log('chat emitted');
				document.querySelector('#chatmsg').value = '';

			};
			div.append(input2);
			const div2 = document.createElement('div');
			div2.append(h1);
			div2.append(div);

			document.querySelector('#chatroom').innerHTML='';

			document.querySelector('#chatroom').append(div2);



		}
		document.querySelector("#channels").append(newchannel);
		
		
        
        
    });

    socket.on('chat received', data => {

    	const msg = data.msg;
    	const time = data.time;
    	const channel = data.channel;
    	const username = data.username;
    	const chatpost = document.createElement('div');
    	chatpost.setAttribute("class", "chatmsgs");
    	chatpost.innerHTML = username + ' : ' + msg + ' @ ' + time;
    	const user_channel = localStorage.getItem('channel');
    	if (user_channel === channel){
    		document.querySelector('#chatroom').append(chatpost);
    	}
    	


    });

    socket.on('joined', data => {

    	//alert of newuser
    	
    	const user = data.user;
    	const channel = data.channel;
    	const alert = document.createElement('a');
    	alert.innerHTML = user + ' entered ' + channel;
    	document.querySelector('#alerts').append(alert);


    });







});





