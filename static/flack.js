document.addEventListener('DOMContentLoaded', () => {

	//when DOM loads, create socket connection.
	var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

	//compile handlebars template
	const template = Handlebars.compile(document.querySelector('#chatpost').innerHTML);

	//set onclick value for all channels
	document.querySelectorAll('.channels').forEach(function(button) {

		button.onclick = addchannel;
    });

	//log user in function
	function log_user() {
		//if no user already exists create new user
		if (!localStorage.getItem('user')){
			var txt;
			var person = prompt("Please Choose a display Name: ", );
			if (person == null || person == "") {
				txt = "Anonymous";
	            person = 'Anonymous';
	            localStorage.setItem('user', person);
				document.querySelector("#text").innerHTML = txt;
				socket.emit('start', {'user': person, 'new': 'no'});

				//if new user enters a name successfully
			} else{
				txt = person;
				//ajax request if person already exists
				//TODO
				socket.emit('start', {'user': person, 'new': 'yes'});
			}

		}//if user already exists then load their name and go to start.
		else{
			person = localStorage.getItem('user');
			document.querySelector("#text").innerHTML = person;
			socket.emit('start', {'user': person, 'new': 'no'});

		}

	} //enables chat to stay scrolled to the bottom

	function updateScroll(){
	    var element = document.getElementById("chatroom");
	    element.scrollTop = element.scrollHeight;
	}

	
	//once the socket connects, run the log user in function
	socket.on('connect', () => {
		log_user();
		//socket.emit('start');
	})

	//if you get a server side response that user is already taken, try login user again.
	socket.on('user exists', () => {
		alert('username already taken');
		log_user();
	})


	//when user is logged in, look if they have a channel
    socket.on('logged_in', data => {

    	const person_logged = data.user
    	localStorage.setItem('user', person_logged);

		document.querySelector("#text").innerHTML = person_logged;

    	if(localStorage.getItem('channel')){

    		if(document.getElementById(localStorage.getItem('channel'))){
    			if(document.getElementById(localStorage.getItem('channel')).click()){
    				document.getElementById(localStorage.getItem('channel')).click();
    			}
    			
    			else{
    				if(document.querySelector('#welcome'))
    				document.querySelector('#welcome').innerHTML = 'Welcome To Flack! <br> <br> <br> <br> <br> The Single-page Chat Site ';;
    			}
    			

    		}
		
		}
		else{
			if(document.querySelector('#welcome'))
			document.querySelector('#welcome').innerHTML = 'Welcome To Flack! <br> <br> <br> <br> <br> The Single-page Chat Site ';
		}
    	
    	//alert that user joined
    	const user = localStorage.getItem('user');
    	socket.emit('Joined', {'user': user});
        
        //function for add channel button
        document.querySelector('#addchannel').onclick = () => {
        	console.log('add channel');
        	const channel = document.querySelector('#channelname').value;
        	if(channel === '' || channel === null){
        		alert('Please Enter A Channel Name');

        	}
        	else{
            socket.emit('add channel', {'channel': channel, 'user': user});
            document.querySelector('#channelname').value = '';

        	}
        	console.log('emit channel');


        	

        }; 
        
    });





    
    socket.on('channel added', data => {
    	console.log('new channel added');
    	if(document.querySelector('#nochannel'))
        	document.querySelector('#nochannel').remove();

		const newchannel = document.createElement('button');
		newchannel.className = ('channels btn btn-light');
		newchannel.innerHTML = data.channel;
		newchannel.onclick = addchannel;
		newchannel.setAttribute('data-channel', data.channel);
		document.querySelector("#channels").append(newchannel);
		console.log('new channel added');		
        
        
	});




    socket.on('already exists', data => {
    		
    		console.log('already exists');
    		const fail = data.user;
    		const curr_user = localStorage.getItem('user');
    		//alert user of error 
    		if (fail === curr_user){
    			alert('Channel Already Exists');
    		}
    		console.log('done');
    		
    });


    socket.on('chat received', data => {

		console.log('chat received');
    	const msg = data.msg;
    	const time = data.time;
    	const channel = data.channel;
    	const username = data.username;
    	const chatpost = template({'msg': msg, 'user': username, 'time': time});
    	console.log('template compiled');
    	const divchat = document.createElement('div');
    	divchat.setAttribute("class", "chatmsg" );
    	if (username === localStorage.getItem('user')){
    		console.log('same user');
    		divchat.setAttribute("class", "chatmsg darker");
    	}
    	divchat.innerHTML = chatpost;
    	const user_channel = localStorage.getItem('channel');
    	if (user_channel === channel){
    		document.querySelector('#chatroom').append(divchat);
    	}
    	
    	updateScroll();
    });

    socket.on('joined', data => {
    	
    	const user = data.user;
    	const channel = data.channel;
    	const alert = document.createElement('a');
    	alert.innerHTML = user + ' entered ' + channel;
    	document.querySelector('#alerts').append(alert);


    });

    socket.on('invalid session', () => {
    	//reload page
    	window.location.reload();
    });


    function addchannel(){
    	document.querySelectorAll('.channels').forEach(function(button) {

			button.className = ('channels btn btn-light');
    	});

    	this.className = ('channels clicked btn btn-secondary');
		const user = localStorage.getItem('user');
		const channel_new = this.dataset.channel;
		socket.emit('channel entered', {'channel': channel_new, 'user': user});
		localStorage.setItem('channel', channel_new);
		const h1 = document.createElement('h1');
		h1.innerHTML = channel_new;
		h1.setAttribute("id", "chatroom_header");
		const div = document.createElement('div');
		div.setAttribute("id", "chatlist");
		const input1 = document.createElement('input');
		input1.setAttribute("id", "chatmsg");
		input1.setAttribute("type", "text");
		input1.setAttribute("class", "form-control")
		input1.setAttribute("placeholder", "Message...");
		div.append(input1);
		const input2 = document.createElement('button');
		input2.setAttribute("id", "sendchatbtn");
		input2.setAttribute("type", "submit");
		input2.setAttribute("class", "btn btn-primary");
		input2.innerHTML = 'send';
		input2.onclick = function(){
			
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


		document.querySelector('#chatroom').innerHTML='';

		document.querySelector('#chatroom_head').innerHTML = '';

		document.querySelector('#chatroom_head').append(h1);


		//AJAX REQUEST make ajax request
		

		const request = new XMLHttpRequest();
		request.open('POST', '/channels');
		request.onload = () => {

			const data2 = JSON.parse(request.responseText); 


			
			if(!data2.error){
				data2.forEach(function(result){
					

			    	const msg2 = result.msg;
			    	const time2 = result.time;
			    	const username2 = result.username;
	    	    	const chatpost = template({'msg': msg2, 'user': username2, 'time': time2});
			    	const divchat = document.createElement('div');
			    	divchat.setAttribute("class", "chatmsg" );
			    	    if (username2 === localStorage.getItem('user')){
				    		console.log('same user');
				    		divchat.setAttribute("class", "chatmsg darker");
				    	}

			    	divchat.innerHTML = chatpost;


			    	document.querySelector('#chatroom').append(divchat);
				});

			}

			updateScroll();
			/*else{
				console.log('error is true');
			}*/


		}
		const data3 = new FormData();
		data3.append('channel', channel_new);
		
		request.send(data3);
		


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






