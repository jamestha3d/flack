document.addEventListener('DOMContentLoaded', () => {

	const template = Handlebars.compile(document.querySelector('#chatpost').innerHTML);

	document.querySelectorAll('.channels').forEach(function(button) {

		button.onclick = addchannel;
    });


	if (!localStorage.getItem('user')){
		var txt;
		var person = prompt("Please Choose a display Name: ", );
		if (person == null || person == "") {
			txt = "Anonymous";
            person = 'Anonymous';
		} else{
			txt = person;
		}
		localStorage.setItem('user', person);
		document.querySelector("#text").innerHTML = txt;
	}
	else{
		document.querySelector("#text").innerHTML = localStorage.getItem('user');

	}



	if(localStorage.getItem('channel')){
		const channel = localStorage.getItem('channel');
		
	}



	var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on('connect', () => {
    	
    	const user = localStorage.getItem('user');
    	socket.emit('Joined', {'user': user});
        
        document.querySelector('#addchannel').onclick = () => {
        	const channel = document.querySelector('#channelname').value;
        	if(channel === '' || channel === null){
        		alert('Please Enter A Channel Name');

        	}
        	else{
            socket.emit('add channel', {'channel': channel, 'user': user});
            document.querySelector('#channelname').value = '';

        	}


        	

        }; 
        
    });



    
    socket.on('channel added', data => {
    	if(document.querySelector('#nochannel'))
        	document.querySelector('#nochannel').remove();

		const newchannel = document.createElement('button');
		//newchannel.setAttribute("class", "channels");
		newchannel.className = ('channels');
		newchannel.innerHTML = data.channel;
		newchannel.onclick = addchannel;
		//edit
		//newchannel.setAttribute('id', data.channel);
		newchannel.setAttribute('data-channel', data.channel);
		document.querySelector("#channels").append(newchannel);
		console.log('new channel added');
		
		
		
		
		
        
        
	});


    socket.on('channel already exists', data => {
    	if (!data.success){

    		const fail = data.user;
    		const curr_user = localStorage.getItem('user');
    		//alert user of error 
    		if (fail === curr_user){
    			alert('Channel Already Exists');
    		}
    		

    	}

    });

    socket.on('chat received', data => {

//    	const template = Handlebars.compile(document.querySelector('#chatpost').innerHTML);
		console.log('chat received');
    	const msg = data.msg;
    	const time = data.time;
    	const channel = data.channel;
    	const username = data.username;
    	//const chatpost = document.createElement('div');
    	//chatpost.setAttribute("class", "chatmsg");
    	//chatpost.innerHTML = username + ' : ' + msg + ' @ ' + time;

    	const chatpost = template({'msg': msg, 'user': username, 'time': time});
    	console.log('template compiled');
    	const divchat = document.createElement('div');
    	divchat.setAttribute("class", "chatmsg" )
    	divchat.innerHTML = chatpost;
    	const user_channel = localStorage.getItem('channel');
    	if (user_channel === channel){
    		document.querySelector('#chatroom').append(divchat);
    	}
    	console.log('display on channel');
    	


    });

    socket.on('joined', data => {

    	//alert of newuser
    	
    	const user = data.user;
    	const channel = data.channel;
    	const alert = document.createElement('a');
    	alert.innerHTML = user + ' entered ' + channel;
    	document.querySelector('#alerts').append(alert);


    });


    function addchannel(){
			//make ajax request to server.
			//get the content of the channel as a return JSON
			//update respective div accordingly

			const user = localStorage.getItem('user');
			const channel_new = this.dataset.channel;
			socket.emit('channel entered', {'channel': channel_new, 'user': user});
			localStorage.setItem('channel', channel_new);
			
			//const content = template({'value': data.channel});

			const h1 = document.createElement('h1');
			h1.innerHTML = channel_new;
			h1.setAttribute("id", "chatroom_header");
			const div = document.createElement('div');
			div.setAttribute("id", "chatlist");
			
			//edit1
			//const form1 = document.createElement('form');

			const input1 = document.createElement('input');
			input1.setAttribute("id", "chatmsg");
			input1.setAttribute("type", "text");
			input1.setAttribute("class", "form-control")
			input1.setAttribute("placeholder", "Chat msg here");
			div.append(input1);
			const input2 = document.createElement('button');
			input2.setAttribute("id", "sendchatbtn");
			input2.setAttribute("type", "submit");
			input2.setAttribute("class", "btn btn-primary");
			input2.innerHTML = 'send';
			input2.onclick = function(){
				console.log('input2cliked');
				const chatmsg = document.querySelector('#chatmsg').value;
				const username = localStorage.getItem('user');
				const curr_channel = localStorage.getItem('channel');
				var time = new Date().toLocaleTimeString();
				socket.emit('chat posted', {'msg': chatmsg, 'username': username, 'channel': curr_channel, 'time': time});
				console.log('new chat emitted');
				document.querySelector('#chatmsg').value = '';
				console.log('text cleared')
				document.querySelector('#sendchatbtn').disabled = true;
				console.log('btn disabled');

			};
			div.append(input2);

			//edit2
			//form1.append(div);

			const div2 = document.createElement('div');
			div2.setAttribute("id", "chatroom_head");
			div2.append(h1);
			//div2.append(div);

			//make ajax request

			document.querySelector('#chatroom').innerHTML='';

			//make ajax request to load previous messages

			document.querySelector('#chatroom').append(h1);
			//document.querySelector('#chatroom').append(div2);



			//AJAX REQUEST make ajax request
			

			const request = new XMLHttpRequest();
			request.open('POST', '/channels');
			request.onload = () => {



				const data2 = JSON.parse(request.responseText); 
				console.log(data2);
				if(!data2.error){
					data2.forEach(function(result){
						console.log('error is false');

				    	const msg2 = result.msg;
				    	console.log(msg2);
				    	const time2 = result.time;
				    	const username2 = result.username;
		    	    	const chatpost = template({'msg': msg2, 'user': username2, 'time': time2});
				    	const divchat = document.createElement('div');
				    	divchat.setAttribute("class", "chatmsg" )
				    	divchat.innerHTML = chatpost;
				    	document.querySelector('#chatroom').append(divchat);
					});


				}
				else{
					console.log('error is true');
				}


			}
			const data3 = new FormData();
			data3.append('channel', channel_new);
			console.log('requesting....' + channel_new);
			request.send(data3);
			console.log('request sent');


			//AJAX END ajax end

			if(document.querySelector('#chatlist'))
				document.querySelector('#chatlist').remove();
			document.querySelector('#maindiv').append(div);

			document.querySelector('#sendchatbtn').disabled = true;


			//enable submit only when message is typed
			document.querySelector('#chatmsg').onkeyup = () => {
				if (document.querySelector('#chatmsg').value.length > 0){
					document.querySelector('#sendchatbtn').disabled = false;
				}

				else{
					document.querySelector('#sendchatbtn').disabled = true;
				}
			};


			//allow 'Enter' to send message

			document.querySelector('#chatmsg').addEventListener("keydown", event => {
		            if (event.key == "Enter") {
		                document.getElementById("sendchatbtn").click();
		            }
		        });


			return false;



		}





});






